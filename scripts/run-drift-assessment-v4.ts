import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import {
  runAutomatedAssessment,
  type AssessmentBundle,
  type DriftRating,
  type ModelAnswer,
  type ModelAssessor,
  type ModelStageKind,
  type ModelTask,
} from './drift-assessment-v4.ts';
import {
  buildReviewState,
  parseReviewState,
  planIncrementalAssessment,
  type DriftReviewStateV1,
} from './drift-incremental-v4.ts';
import { buildPublicationProposal } from './drift-publication-v4.ts';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_PACKET_DIR = resolve(ROOT, 'docs/research/drift-evidence-v4');
const RUBRIC_PATH = resolve(ROOT, 'docs/research/drift-rubric-v4.md');
const BLIND_PROMPT_PATH = resolve(ROOT, 'docs/research/drift-v4-blind-run-prompt.md');

export const ClaimStageSchema = z.object({
  protocol_version: z.literal('4.0'),
  chunk_id: z.string(),
  assessments: z.array(z.object({
    segment_id: z.string(),
    classifications: z.array(z.object({
      candidate_id: z.string(),
      disposition: z.enum(['claim', 'not_claim']),
      lifecycle: z.enum(['live', 'future', 'historical']).nullable(),
      core_claim: z.boolean(),
      scope_anchor_name: z.string().nullable(),
    }).strict()),
  }).strict()),
}).strict();

const MaterialityStageSchema = z.object({
  protocol_version: z.literal('4.0'),
  chunk_id: z.string(),
  assessments: z.array(z.object({
    candidate_id: z.string(),
    materiality: z.enum(['material', 'non_material']),
    reason: z.string(),
    behaviors: z.array(z.object({
      behavior_id: z.string(),
      behavior: z.string(),
      affected_paths: z.array(z.string()),
    }).strict()),
  }).strict()),
}).strict();

const PinnedStageSchema = z.object({
  protocol_version: z.literal('4.0'),
  chunk_id: z.string(),
  assessments: z.array(z.object({
    check_id: z.string(),
    status: z.enum(['covered', 'omitted', 'contradicted', 'minor_gap']),
    claim_segment_ids: z.array(z.string()),
    code_segment_ids: z.array(z.string()),
    core_claim: z.boolean(),
  }).strict()),
}).strict();

const DriftStageSchema = z.object({
  protocol_version: z.literal('4.0'),
  project_slug: z.string(),
  assessments: z.array(z.object({
    behavior_id: z.string(),
    scope: z.enum(['in_scope', 'out_of_scope']),
    scope_anchor_names: z.array(z.string()),
    status: z.enum(['covered', 'omitted', 'contradicted', 'minor_gap', 'not_assessed']),
    claim_ids: z.array(z.string()),
    core_claim: z.boolean(),
  }).strict()),
}).strict();

type ReasoningEffort = 'low' | 'medium' | 'high';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function option(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  assert(process.argv[index + 1], `${name} requires a value`);
  return process.argv[index + 1];
}

function integerOption(name: string, fallback: number): number {
  const raw = option(name);
  if (raw === null) return fallback;
  const value = Number(raw);
  assert(Number.isInteger(value) && value > 0, `${name} must be a positive integer`);
  return value;
}

function stageInstructions(kind: ModelStageKind): string {
  if (kind === 'corpus-claims') {
    return [
      'Classify every compiler-owned claim candidate exactly once and in order.',
      'Do not add, remove, split, merge, reorder, or paraphrase candidates; their IDs and statements are immutable input.',
      'Use claim only for an affirmative governed property stated by the candidate and not_claim otherwise.',
      'For not_claim return lifecycle=null, core_claim=false, and scope_anchor_name=null.',
      'For a claim choose only an allowed_scope_anchor_name from that segment, or null. Do not infer unstated requirements.',
    ].join(' ');
  }
  if (kind === 'materiality') {
    return 'Assess every candidate in order. Treat a dependency-only diff as non-material unless the attached diff itself demonstrates an observable or governed effect.';
  }
  if (kind === 'pinned-checks') {
    return [
      'Assess every pinned check in order using only its attached corpus and code evidence segments.',
      'covered means the live corpus and pinned implementation agree; omitted means governed behavior is absent; contradicted means they conflict; minor_gap means a non-material mismatch.',
      'Reference only attached segment IDs. core_claim may be true only for a contradiction that defeats an explicitly stated primary purpose.',
    ].join(' ');
  }
  return [
    'Assess every behavior in order against the complete live_claims array.',
    'For canonical scope, decide whether the behavior concerns a property governed by the corpus. For change-scoped projects, an in-scope behavior requires a supplied scope anchor.',
    'covered means a live claim already describes the behavior; omitted means the behavior is in scope but has no live claim; contradicted means it conflicts with a live claim; minor_gap means the claim covers it incompletely.',
    'Out-of-scope behaviors must be not_assessed. Reference only supplied claim IDs and scope-anchor names.',
  ].join(' ');
}

function schemaFor(kind: ModelStageKind) {
  if (kind === 'corpus-claims') return ClaimStageSchema;
  if (kind === 'materiality') return MaterialityStageSchema;
  if (kind === 'pinned-checks') return PinnedStageSchema;
  return DriftStageSchema;
}

function responseFormatName(kind: ModelStageKind): string {
  return `drift_${kind.replaceAll('-', '_')}`;
}

function createOpenAiAssessor(options: {
  client: OpenAI;
  model: string;
  reasoningEffort: ReasoningEffort;
  maxOutputTokens: number;
  retries: number;
}): ModelAssessor {
  const rubric = readFileSync(RUBRIC_PATH, 'utf8');
  const blindPrompt = readFileSync(BLIND_PROMPT_PATH, 'utf8');
  return async (task: ModelTask): Promise<ModelAnswer> => {
    const instructions = [
      rubric,
      ['corpus-claims', 'materiality'].includes(task.kind) ? blindPrompt : '',
      `Current stage: ${task.kind}.`,
      stageInstructions(task.kind),
      'This request is isolated. Do not use tools, external knowledge, prior responses, or another run. Return only the structured output.',
    ].filter(Boolean).join('\n\n');
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= options.retries; attempt += 1) {
      try {
        const response = await options.client.responses.parse({
          model: options.model,
          store: false,
          reasoning: { effort: options.reasoningEffort },
          max_output_tokens: options.maxOutputTokens,
          metadata: {
            protocol: 'drift-v4',
            run_id: task.run_id,
            task_id: task.task_id,
            stage: task.kind,
          },
          input: [
            { role: 'developer', content: instructions },
            { role: 'user', content: JSON.stringify(task.task) },
          ],
          text: {
            format: zodTextFormat(schemaFor(task.kind), responseFormatName(task.kind)),
          },
        });
        assert(response.output_parsed, `${task.task_id}: model returned no parsed output`);
        return {
          output: response.output_parsed,
          response_id: response.id,
          model: response.model,
          usage: response.usage ? JSON.parse(JSON.stringify(response.usage)) : null,
        };
      } catch (error) {
        lastError = error;
        if (attempt === options.retries) break;
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 1_000 * (2 ** attempt)));
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  };
}

function currentRating(slug: string): DriftRating | null {
  const path = resolve(ROOT, 'src/content/projects', `${slug}.md`);
  if (!existsSync(path)) return null;
  const match = readFileSync(path, 'utf8').match(/^drift:\s*(unknown|none|low|moderate|high)\s*$/m);
  return match?.[1] as DriftRating | null ?? null;
}

function loadProject(packetDir: string, slug: string): { project: any; chunks: any[] } {
  const index = JSON.parse(readFileSync(resolve(packetDir, 'index.json'), 'utf8'));
  const reference = index.projects.find((candidate: any) => candidate.slug === slug);
  assert(reference, `Project ${slug} is not present in the v4 index`);
  const project = JSON.parse(readFileSync(resolve(packetDir, reference.file), 'utf8'));
  const chunks = project.chunks.map((chunk: any) => JSON.parse(readFileSync(resolve(packetDir, chunk.file), 'utf8')));
  return { project, chunks };
}

function runGh(args: string[]): string {
  return execFileSync('gh', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
}

function runGhJson(endpoint: string, payload: unknown, jq: string, method = 'POST'): string {
  return execFileSync('gh', ['api', '--method', method, endpoint, '--input', '-', '--jq', jq], {
    cwd: ROOT,
    encoding: 'utf8',
    input: JSON.stringify(payload),
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
}

function defaultRepository(): string {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const match = remote.match(/github\.com[/:]([^/]+\/.+)$/);
  assert(match, `Cannot derive GitHub repository from ${remote}`);
  const repository = match[1].replace(/\.git$/, '');
  assert(/^[^/]+\/[^/]+$/.test(repository), `Cannot derive GitHub repository from ${remote}`);
  return repository;
}

function stateBranch(slug: string): string {
  return `automation/drift-state-${slug}`;
}

function statePath(slug: string): string {
  return `docs/research/drift-state-v1/${slug}.json`;
}

function isGitHubNotFound(error: unknown): boolean {
  const details = [
    error instanceof Error ? error.message : String(error),
    typeof error === 'object' && error !== null && 'stderr' in error ? String(error.stderr) : '',
    typeof error === 'object' && error !== null && 'stdout' in error ? String(error.stdout) : '',
  ].join('\n');
  return /(?:HTTP\s+404|\b404\b|Not Found)/i.test(details);
}

function loadRemoteReviewState(repository: string, slug: string): DriftReviewStateV1 | null {
  const branch = stateBranch(slug);
  try {
    runGh(['api', `repos/${repository}/git/ref/heads/${branch}`, '--jq', '.object.sha']);
  } catch (error) {
    if (isGitHubNotFound(error)) return null;
    throw error;
  }
  const serialized = runGh([
    'api',
    '--method',
    'GET',
    '--header',
    'Accept: application/vnd.github.raw+json',
    `repos/${repository}/contents/${statePath(slug)}?ref=${encodeURIComponent(branch)}`,
  ]);
  assert(serialized.length > 0, `${slug}: remote drift state is empty`);
  return parseReviewState(serialized);
}

function publishReviewState(state: DriftReviewStateV1, repository: string, base: string): string {
  const branch = stateBranch(state.project_slug);
  let parentSha: string;
  let branchExists = true;
  try {
    parentSha = runGh(['api', `repos/${repository}/git/ref/heads/${branch}`, '--jq', '.object.sha']);
  } catch (error) {
    if (!isGitHubNotFound(error)) throw error;
    branchExists = false;
    parentSha = runGh(['api', `repos/${repository}/git/ref/heads/${base}`, '--jq', '.object.sha']);
  }
  assert(/^[0-9a-f]{40}$/.test(parentSha), 'GitHub returned an invalid state parent SHA');
  const parentTreeSha = runGh(['api', `repos/${repository}/git/commits/${parentSha}`, '--jq', '.tree.sha']);
  assert(/^[0-9a-f]{40}$/.test(parentTreeSha), 'GitHub returned an invalid state parent tree SHA');
  const content = `${JSON.stringify(state, null, 2)}\n`;
  const blobSha = runGhJson(`repos/${repository}/git/blobs`, { content, encoding: 'utf-8' }, '.sha');
  assert(/^[0-9a-f]{40}$/.test(blobSha), 'GitHub returned an invalid state blob SHA');
  const treeSha = runGhJson(`repos/${repository}/git/trees`, {
    base_tree: parentTreeSha,
    tree: [{ path: statePath(state.project_slug), mode: '100644', type: 'blob', sha: blobSha }],
  }, '.sha');
  assert(/^[0-9a-f]{40}$/.test(treeSha), 'GitHub returned an invalid state tree SHA');
  const commitSha = runGhJson(`repos/${repository}/git/commits`, {
    message: `advance automated drift state for ${state.project_slug}`,
    tree: treeSha,
    parents: [parentSha],
  }, '.sha');
  assert(/^[0-9a-f]{40}$/.test(commitSha), 'GitHub returned an invalid state commit SHA');
  if (branchExists) {
    runGhJson(`repos/${repository}/git/refs/heads/${branch}`, { sha: commitSha, force: false }, '.ref', 'PATCH');
  } else {
    runGhJson(`repos/${repository}/git/refs`, { ref: `refs/heads/${branch}`, sha: commitSha }, '.ref');
  }
  return branch;
}

function publishDraftProposal(bundle: AssessmentBundle, chunks: any[], repository: string, base: string): string | null {
  const projectPath = resolve(ROOT, 'src/content/projects', `${bundle.project.slug}.md`);
  const proposal = buildPublicationProposal({
    bundle,
    chunks,
    projectMarkdown: existsSync(projectPath) ? readFileSync(projectPath, 'utf8') : null,
    repository,
  });
  if (!proposal) return null;
  const baseSha = runGh(['api', `repos/${repository}/git/ref/heads/${base}`, '--jq', '.object.sha']);
  assert(/^[0-9a-f]{40}$/.test(baseSha), 'GitHub returned an invalid base SHA');
  const baseTreeSha = runGh(['api', `repos/${repository}/git/commits/${baseSha}`, '--jq', '.tree.sha']);
  assert(/^[0-9a-f]{40}$/.test(baseTreeSha), 'GitHub returned an invalid base tree SHA');
  const tree = proposal.files.map((file) => {
    const sha = runGhJson(`repos/${repository}/git/blobs`, { content: file.content, encoding: 'utf-8' }, '.sha');
    assert(/^[0-9a-f]{40}$/.test(sha), `GitHub returned an invalid blob SHA for ${file.path}`);
    return { path: file.path, mode: '100644', type: 'blob', sha };
  });
  const treeSha = runGhJson(`repos/${repository}/git/trees`, {
    base_tree: baseTreeSha,
    tree,
  }, '.sha');
  assert(/^[0-9a-f]{40}$/.test(treeSha), 'GitHub returned an invalid assessment tree SHA');
  const commitSha = runGhJson(`repos/${repository}/git/commits`, {
    message: `propose automated drift assessment for ${bundle.project.slug}`,
    tree: treeSha,
    parents: [baseSha],
  }, '.sha');
  assert(/^[0-9a-f]{40}$/.test(commitSha), 'GitHub returned an invalid assessment commit SHA');
  let branchExists = true;
  try {
    runGh(['api', `repos/${repository}/git/ref/heads/${proposal.branch}`, '--jq', '.object.sha']);
  } catch (error) {
    if (!isGitHubNotFound(error)) throw error;
    branchExists = false;
  }
  if (branchExists) {
    runGhJson(`repos/${repository}/git/refs/heads/${proposal.branch}`, { sha: commitSha, force: true }, '.ref', 'PATCH');
  } else {
    runGhJson(`repos/${repository}/git/refs`, { ref: `refs/heads/${proposal.branch}`, sha: commitSha }, '.ref');
  }
  const existing = runGh([
    'pr', 'list', '--repo', repository, '--head', proposal.branch, '--state', 'open', '--json', 'url', '--jq', '.[0].url // ""',
  ]);
  if (existing) {
    runGh(['pr', 'edit', existing, '--repo', repository, '--title', proposal.title, '--body', proposal.body]);
    return existing;
  }
  return runGh([
    'pr', 'create', '--repo', repository, '--base', base, '--head', proposal.branch, '--draft', '--title', proposal.title, '--body', proposal.body,
  ]);
}

async function main() {
  const slug = option('--project');
  assert(slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), 'Usage: npm run drift:assess:v4 -- --project <slug>');
  assert(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY is required for live assessment');
  const packetDir = resolve(process.cwd(), option('--packet-dir') ?? DEFAULT_PACKET_DIR);
  const model = option('--model') ?? process.env.DRIFT_OPENAI_MODEL ?? 'gpt-5.6';
  const effort = (option('--reasoning-effort') ?? 'medium') as ReasoningEffort;
  assert(['low', 'medium', 'high'].includes(effort), '--reasoning-effort must be low, medium, or high');
  const maxTasksPerRun = integerOption('--max-tasks-per-run', 20);
  const concurrency = integerOption('--concurrency', 2);
  const maxOutputTokens = integerOption('--max-output-tokens', 32_768);
  const retries = integerOption('--retries', 2);
  const publishDraft = process.argv.includes('--publish-draft-pr');
  const publishState = process.argv.includes('--publish-state');
  const forceBaseline = process.argv.includes('--force-baseline');
  const repository = publishDraft || publishState ? option('--repo') ?? defaultRepository() : null;
  const skipEvidenceValidation = process.argv.includes('--skip-evidence-validation');
  if (!skipEvidenceValidation) {
    execFileSync('npm', ['run', 'drift:evidence:v4:validate', '--', '--packet-dir', packetDir], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  }
  const { project, chunks } = loadProject(packetDir, slug);
  const stateFile = option('--state-file');
  assert(!(forceBaseline && stateFile), '--force-baseline cannot be combined with --state-file');
  let previousState: DriftReviewStateV1 | null = null;
  const statePreflightReasons: string[] = [];
  try {
    if (!forceBaseline && stateFile) {
      previousState = parseReviewState(readFileSync(resolve(process.cwd(), stateFile), 'utf8'));
    } else if (!forceBaseline && publishState) {
      previousState = loadRemoteReviewState(repository!, slug);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!(error instanceof SyntaxError) && !/drift review state/i.test(message)) throw error;
    statePreflightReasons.push(`incremental_state_invalid:${message}`);
  }
  const plan = planIncrementalAssessment({ project, chunks, state: previousState, maxTasksPerRun });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const assessor = createOpenAiAssessor({ client, model, reasoningEffort: effort, maxOutputTokens, retries });
  const bundle = await runAutomatedAssessment({
    project,
    chunks: plan.chunks,
    assessor,
    requestedModel: model,
    previousRating: currentRating(slug),
    baselineLiveClaims: plan.baseline_live_claims,
    baselineBehaviors: plan.baseline_behaviors,
    baselineDriftAssessments: plan.baseline_drift_assessments,
    reassessBaselineBehaviors: plan.reassess_baseline_behaviors,
    preflightReasons: [...statePreflightReasons, ...plan.preflight_reasons],
    preflightProjectedPerRun: plan.projected_tasks_per_run,
    maxTasksPerRun,
    concurrency,
    mode: 'live',
  });

  const defaultOutput = resolve(ROOT, '.drift-runs', `${slug}-${bundle.created_at_utc.replace(/[:.]/g, '-')}`);
  const outputDir = resolve(process.cwd(), option('--output-dir') ?? defaultOutput);
  assert(outputDir !== ROOT && outputDir !== resolve(ROOT, 'docs') && /drift/i.test(basename(resolve(outputDir, '..')) + basename(outputDir)), 'Refusing unsafe output directory');
  mkdirSync(outputDir, { recursive: true });
  const resultPath = join(outputDir, 'assessment.json');
  writeFileSync(resultPath, `${JSON.stringify(bundle, null, 2)}\n`);

  let reviewState: DriftReviewStateV1 | null = null;
  let reviewStatePath: string | null = null;
  let reviewStateBranch: string | null = null;
  if (bundle.status === 'accepted') {
    reviewState = buildReviewState({ bundle, project, chunks, previousState });
    reviewStatePath = join(outputDir, 'review-state.json');
    writeFileSync(reviewStatePath, `${JSON.stringify(reviewState, null, 2)}\n`);
    if (publishState) reviewStateBranch = publishReviewState(reviewState, repository!, option('--base') ?? 'main');
  }

  let draftPr: string | null = null;
  if (publishDraft) {
    draftPr = publishDraftProposal(bundle, chunks, repository!, option('--base') ?? 'main');
  }
  console.log(JSON.stringify({
    project: slug,
    status: bundle.status,
    rating: bundle.rating,
    rule: bundle.rule,
    calls: bundle.task_budget.actual_model_calls,
    incremental: {
      mode: plan.mode,
      forced_baseline: forceBaseline,
      ...plan.accounting,
    },
    result: resultPath,
    review_state: reviewStatePath,
    review_state_branch: reviewStateBranch,
    draft_pr: draftPr,
  }, null, 2));
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
