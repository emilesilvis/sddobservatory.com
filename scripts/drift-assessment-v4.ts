import { createHash } from 'node:crypto';
import { validateStage } from './validate-drift-stage-v4.ts';

export type RunId = 'run-1' | 'run-2';
export type ModelStageKind = 'corpus-claims' | 'materiality' | 'pinned-checks' | 'drift-matching';
export type DriftRating = 'unknown' | 'none' | 'low' | 'moderate' | 'high';

export type ModelTask = {
  run_id: RunId;
  kind: ModelStageKind;
  task_id: string;
  task: any;
};

export type ModelAnswer = {
  output: any;
  response_id: string;
  model: string;
  usage?: Record<string, unknown> | null;
};

export type ModelAssessor = (task: ModelTask) => Promise<ModelAnswer>;

export type CallRecord = {
  run_id: RunId;
  kind: ModelStageKind;
  task_id: string;
  input_sha256: string;
  status: 'ok' | 'error';
  output?: any;
  response_id?: string;
  model?: string;
  usage?: Record<string, unknown> | null;
  error?: string;
};

export type DriftTask = {
  protocol_version: '4.0';
  project_slug: string;
  kind: 'drift-matching';
  corpus_scope: 'canonical' | 'change-scoped';
  scope_anchors: Array<{ name: string }>;
  live_claims: Array<{
    claim_id: string;
    segment_id: string;
    statement: string;
    core_claim: boolean;
    scope_anchor_name: string | null;
  }>;
  behaviors: Array<{
    behavior_id: string;
    candidate_id: string;
    commit_id: string;
    behavior: string;
    affected_paths: string[];
  }>;
};

export type DriftOutput = {
  protocol_version: '4.0';
  project_slug: string;
  assessments: Array<{
    behavior_id: string;
    scope: 'in_scope' | 'out_of_scope';
    scope_anchor_names: string[];
    status: 'covered' | 'omitted' | 'contradicted' | 'minor_gap' | 'not_assessed';
    claim_ids: string[];
    core_claim: boolean;
  }>;
};

export type RunRollup = {
  run_id: RunId;
  rating: Exclude<DriftRating, 'unknown'>;
  rule: 'H1' | 'H2' | 'M1' | 'L1' | 'N1';
  drift_commit_ids: string[];
  live_claims: number;
  material_behaviors: number;
  pinned_checks: number;
};

export type AssessmentBundle = {
  protocol_version: '4.0';
  automation_version: '1.1.0';
  mode: 'live' | 'fixture';
  created_at_utc: string;
  project: {
    slug: string;
    repository: string;
    pin_sha: string;
    pin_time_utc: string;
    project_manifest_sha256: string;
  };
  requested_model: string;
  previous_rating: DriftRating | null;
  status: 'accepted' | 'unknown';
  rating: DriftRating;
  rule: 'H1' | 'H2' | 'M1' | 'L1' | 'N1' | 'U1';
  reasons: string[];
  agreement: {
    corpus_claims: boolean | null;
    materiality: boolean | null;
    pinned_checks: boolean | null;
    drift_matching: boolean | null;
    rating: boolean | null;
  };
  task_budget: {
    maximum_per_run: number;
    projected_per_run: number;
    actual_model_calls: number;
  };
  run_rollups: RunRollup[];
  calls: CallRecord[];
  publication: {
    draft_pr_required: boolean;
    reason: 'rating_changed' | 'evidence_incomplete' | 'none';
  };
};

type RunOptions = {
  project: any;
  chunks: any[];
  assessor: ModelAssessor;
  requestedModel: string;
  previousRating?: DriftRating | null;
  maxTasksPerRun?: number;
  concurrency?: number;
  mode?: 'live' | 'fixture';
  now?: () => Date;
};

const RUN_IDS: RunId[] = ['run-1', 'run-2'];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => Buffer.from(left).compare(Buffer.from(right)))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function exactKeys(value: Record<string, unknown>, expected: string[], label: string) {
  const actual = Object.keys(value).sort();
  assert(JSON.stringify(actual) === JSON.stringify([...expected].sort()), `${label}: keys ${actual.join(', ')}`);
}

async function mapLimit<T, U>(values: T[], limit: number, fn: (value: T) => Promise<U>): Promise<U[]> {
  assert(Number.isInteger(limit) && limit > 0, 'Concurrency must be a positive integer');
  const results = new Array<U>(values.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const position = cursor++;
      results[position] = await fn(values[position]);
    }
  });
  await Promise.all(workers);
  return results;
}

function outputsFor(records: CallRecord[], runId: RunId, kind: ModelStageKind): any[] {
  return records
    .filter((record) => record.run_id === runId && record.kind === kind && record.status === 'ok')
    .map((record) => record.output);
}

function failed(records: CallRecord[]): string[] {
  return records
    .filter((record) => record.status === 'error')
    .map((record) => `${record.run_id}:${record.task_id}: ${record.error}`);
}

async function assessTasks(tasks: ModelTask[], assessor: ModelAssessor, concurrency: number): Promise<CallRecord[]> {
  return mapLimit(tasks, concurrency, async (task) => {
    const base = {
      run_id: task.run_id,
      kind: task.kind,
      task_id: task.task_id,
      input_sha256: sha256(canonicalize(task.task)),
    };
    try {
      const answer = await assessor(task);
      if (task.kind === 'drift-matching') validateDriftOutput(task.task, answer.output);
      else validateStage(task.task, answer.output);
      return {
        ...base,
        status: 'ok' as const,
        output: answer.output,
        response_id: answer.response_id,
        model: answer.model,
        usage: answer.usage ?? null,
      };
    } catch (error) {
      return {
        ...base,
        status: 'error' as const,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

function stageTasks(chunks: any[], kind: Exclude<ModelStageKind, 'drift-matching'>): ModelTask[] {
  const selected = chunks.filter((chunk) => chunk.kind === kind);
  return RUN_IDS.flatMap((runId) => selected.map((chunk) => ({
    run_id: runId,
    kind,
    task_id: chunk.chunk_id,
    task: chunk,
  })));
}

function exactAgreement(records: CallRecord[], kind: ModelStageKind): boolean {
  const normalize = (runId: RunId) => outputsFor(records, runId, kind).map((output) => canonicalize(output));
  return canonicalize(normalize('run-1')) === canonicalize(normalize('run-2'));
}

function materialityAgreement(records: CallRecord[]): boolean {
  const normalize = (runId: RunId) => outputsFor(records, runId, 'materiality').flatMap((output) =>
    output.assessments.map((assessment: any) => ({
      candidate_id: assessment.candidate_id,
      materiality: assessment.materiality,
      behavior_count: assessment.behaviors.length,
    })),
  );
  return canonicalize(normalize('run-1')) === canonicalize(normalize('run-2'));
}

function mergeLiveClaims(records: CallRecord[], chunks: any[], runId: RunId): DriftTask['live_claims'] {
  const candidates = new Map<string, { segment_id: string; statement: string }>();
  for (const chunk of chunks.filter((item) => item.kind === 'corpus-claims')) {
    for (const item of chunk.items) {
      for (const candidate of item.claim_candidates) {
        assert(!candidates.has(candidate.candidate_id), `duplicate compiler claim candidate ${candidate.candidate_id}`);
        candidates.set(candidate.candidate_id, {
          segment_id: item.segment_id,
          statement: candidate.statement,
        });
      }
    }
  }
  const claims: DriftTask['live_claims'] = [];
  const seen = new Set<string>();
  for (const output of outputsFor(records, runId, 'corpus-claims')) {
    for (const assessment of output.assessments) {
      for (const classification of assessment.classifications) {
        assert(!seen.has(classification.candidate_id), `${runId}: duplicate claim classification ${classification.candidate_id}`);
        seen.add(classification.candidate_id);
        if (classification.disposition === 'claim' && classification.lifecycle === 'live') {
          const candidate = candidates.get(classification.candidate_id);
          assert(candidate, `${runId}: unknown compiler claim candidate ${classification.candidate_id}`);
          claims.push({
            claim_id: classification.candidate_id,
            segment_id: candidate.segment_id,
            statement: candidate.statement,
            core_claim: classification.core_claim,
            scope_anchor_name: classification.scope_anchor_name,
          });
        }
      }
    }
  }
  return claims;
}

function mergeMaterialBehaviors(records: CallRecord[], chunks: any[], runId: RunId): DriftTask['behaviors'] {
  const items = new Map<string, any>();
  for (const chunk of chunks.filter((candidate) => candidate.kind === 'materiality')) {
    for (const item of chunk.items) items.set(item.candidate_id, item);
  }
  const behaviors: DriftTask['behaviors'] = [];
  for (const output of outputsFor(records, runId, 'materiality')) {
    for (const assessment of output.assessments) {
      if (assessment.materiality !== 'material') continue;
      const item = items.get(assessment.candidate_id);
      assert(item, `${runId}: unknown material candidate ${assessment.candidate_id}`);
      for (const behavior of assessment.behaviors) {
        behaviors.push({
          behavior_id: behavior.behavior_id,
          candidate_id: assessment.candidate_id,
          commit_id: item.candidate.commit_id,
          behavior: behavior.behavior,
          affected_paths: behavior.affected_paths,
        });
      }
    }
  }
  return behaviors;
}

export function buildDriftTask(project: any, liveClaims: DriftTask['live_claims'], behaviors: DriftTask['behaviors']): DriftTask {
  return {
    protocol_version: '4.0',
    project_slug: project.identity.slug,
    kind: 'drift-matching',
    corpus_scope: project.corpus.scope,
    scope_anchors: project.corpus.scope_anchors.map((anchor: any) => ({ name: anchor.name })),
    live_claims: liveClaims,
    behaviors,
  };
}

export function validateDriftOutput(task: DriftTask, output: DriftOutput) {
  exactKeys(output as unknown as Record<string, unknown>, ['protocol_version', 'project_slug', 'assessments'], 'drift output');
  assert(output.protocol_version === '4.0' && output.project_slug === task.project_slug, 'Drift output identity mismatch');
  assert(Array.isArray(output.assessments), 'Drift assessments must be an array');
  assert(
    canonicalize(output.assessments.map((item) => item.behavior_id)) === canonicalize(task.behaviors.map((item) => item.behavior_id)),
    'Drift behavior coverage/order mismatch',
  );
  const claims = new Map(task.live_claims.map((claim) => [claim.claim_id, claim]));
  const anchors = new Set(task.scope_anchors.map((anchor) => anchor.name));
  for (const assessment of output.assessments) {
    exactKeys(
      assessment as unknown as Record<string, unknown>,
      ['behavior_id', 'scope', 'scope_anchor_names', 'status', 'claim_ids', 'core_claim'],
      assessment.behavior_id,
    );
    assert(['in_scope', 'out_of_scope'].includes(assessment.scope), `${assessment.behavior_id}: invalid scope`);
    assert(Array.isArray(assessment.scope_anchor_names) && new Set(assessment.scope_anchor_names).size === assessment.scope_anchor_names.length, `${assessment.behavior_id}: invalid scope anchors`);
    assert(assessment.scope_anchor_names.every((name) => anchors.has(name)), `${assessment.behavior_id}: unknown scope anchor`);
    assert(Array.isArray(assessment.claim_ids) && new Set(assessment.claim_ids).size === assessment.claim_ids.length, `${assessment.behavior_id}: invalid claim IDs`);
    assert(assessment.claim_ids.every((id) => claims.has(id)), `${assessment.behavior_id}: unknown claim ID`);
    assert(typeof assessment.core_claim === 'boolean', `${assessment.behavior_id}: invalid core flag`);
    if (assessment.scope === 'out_of_scope') {
      assert(assessment.status === 'not_assessed', `${assessment.behavior_id}: out-of-scope behavior must be not_assessed`);
      assert(!assessment.scope_anchor_names.length && !assessment.claim_ids.length && !assessment.core_claim, `${assessment.behavior_id}: out-of-scope evidence`);
      continue;
    }
    assert(['covered', 'omitted', 'contradicted', 'minor_gap'].includes(assessment.status), `${assessment.behavior_id}: invalid status`);
    if (task.corpus_scope === 'change-scoped') assert(assessment.scope_anchor_names.length > 0, `${assessment.behavior_id}: scope anchor required`);
    if (assessment.status === 'omitted') assert(assessment.claim_ids.length === 0, `${assessment.behavior_id}: omitted behavior cannot cite claims`);
    else assert(assessment.claim_ids.length > 0, `${assessment.behavior_id}: matched behavior requires claims`);
    if (assessment.core_claim) {
      assert(assessment.status === 'contradicted', `${assessment.behavior_id}: core flag requires contradiction`);
      assert(assessment.claim_ids.some((id) => claims.get(id)?.core_claim), `${assessment.behavior_id}: core flag lacks a core claim`);
    }
  }
}

export function rollupRun(
  project: any,
  runId: RunId,
  claims: DriftTask['live_claims'],
  behaviors: DriftTask['behaviors'],
  driftOutput: DriftOutput,
  pinnedOutputs: any[],
): RunRollup {
  const behaviorById = new Map(behaviors.map((behavior) => [behavior.behavior_id, behavior]));
  const pinned = pinnedOutputs.flatMap((output) => output.assessments);
  const inScope = driftOutput.assessments.filter((assessment) => assessment.scope === 'in_scope');
  const coreContradiction = inScope.some((assessment) => assessment.status === 'contradicted' && assessment.core_claim)
    || pinned.some((assessment: any) => assessment.status === 'contradicted' && assessment.core_claim);
  const driftCommitIds = [...new Set(
    inScope
      .filter((assessment) => ['omitted', 'contradicted'].includes(assessment.status))
      .map((assessment) => behaviorById.get(assessment.behavior_id)?.commit_id)
      .filter((id): id is string => Boolean(id)),
  )].sort();
  const anyModerate = inScope.some((assessment) => ['omitted', 'contradicted'].includes(assessment.status))
    || pinned.some((assessment: any) => ['omitted', 'contradicted'].includes(assessment.status));
  const anyMinor = inScope.some((assessment) => assessment.status === 'minor_gap')
    || pinned.some((assessment: any) => assessment.status === 'minor_gap');

  let rating: RunRollup['rating'];
  let rule: RunRollup['rule'];
  if (coreContradiction) [rating, rule] = ['high', 'H1'];
  else if (project.window.spec_is_stale_90d && driftCommitIds.length >= 3) [rating, rule] = ['high', 'H2'];
  else if (anyModerate) [rating, rule] = ['moderate', 'M1'];
  else if (anyMinor) [rating, rule] = ['low', 'L1'];
  else [rating, rule] = ['none', 'N1'];

  return {
    run_id: runId,
    rating,
    rule,
    drift_commit_ids: driftCommitIds,
    live_claims: claims.length,
    material_behaviors: behaviors.length,
    pinned_checks: pinned.length,
  };
}

function publication(status: AssessmentBundle['status'], rating: DriftRating, previous: DriftRating | null) {
  if (status === 'unknown') return { draft_pr_required: true, reason: 'evidence_incomplete' as const };
  if (previous !== null && rating !== previous) return { draft_pr_required: true, reason: 'rating_changed' as const };
  return { draft_pr_required: false, reason: 'none' as const };
}

function baseBundle(options: RunOptions, calls: CallRecord[], projectedPerRun: number): AssessmentBundle {
  const previousRating = options.previousRating ?? null;
  return {
    protocol_version: '4.0',
    automation_version: '1.1.0',
    mode: options.mode ?? 'live',
    created_at_utc: (options.now ?? (() => new Date()))().toISOString(),
    project: {
      slug: options.project.identity.slug,
      repository: options.project.identity.repository,
      pin_sha: options.project.identity.pin_sha,
      pin_time_utc: options.project.identity.pin_time_utc,
      project_manifest_sha256: options.project.integrity.canonical_json_sha256,
    },
    requested_model: options.requestedModel,
    previous_rating: previousRating,
    status: 'unknown',
    rating: 'unknown',
    rule: 'U1',
    reasons: [],
    agreement: {
      corpus_claims: null,
      materiality: null,
      pinned_checks: null,
      drift_matching: null,
      rating: null,
    },
    task_budget: {
      maximum_per_run: options.maxTasksPerRun ?? 20,
      projected_per_run: projectedPerRun,
      actual_model_calls: calls.filter((call) => call.status === 'ok').length,
    },
    run_rollups: [],
    calls,
    publication: publication('unknown', 'unknown', previousRating),
  };
}

function unknown(options: RunOptions, calls: CallRecord[], projectedPerRun: number, reasons: string[], agreement?: Partial<AssessmentBundle['agreement']>) {
  const bundle = baseBundle(options, calls, projectedPerRun);
  bundle.reasons = reasons;
  bundle.agreement = { ...bundle.agreement, ...agreement };
  bundle.task_budget.actual_model_calls = calls.filter((call) => call.status === 'ok').length;
  return bundle;
}

export async function runAutomatedAssessment(options: RunOptions): Promise<AssessmentBundle> {
  assert(options.project.protocol_version === '4.0', 'Project protocol must be 4.0');
  const maxTasksPerRun = options.maxTasksPerRun ?? 20;
  const concurrency = options.concurrency ?? 4;
  const claimsChunks = options.chunks.filter((chunk) => chunk.kind === 'corpus-claims');
  const materialityChunks = options.chunks.filter((chunk) => chunk.kind === 'materiality');
  const pinnedChunks = options.chunks.filter((chunk) => chunk.kind === 'pinned-checks');
  const baseTasksPerRun = claimsChunks.length + materialityChunks.length + pinnedChunks.length;
  if (baseTasksPerRun > maxTasksPerRun) {
    return unknown(options, [], baseTasksPerRun, [`task_budget_exceeded:${baseTasksPerRun}>${maxTasksPerRun}`]);
  }

  const calls: CallRecord[] = [];
  const claimCalls = await assessTasks(stageTasks(options.chunks, 'corpus-claims'), options.assessor, concurrency);
  calls.push(...claimCalls);
  if (failed(claimCalls).length) return unknown(options, calls, baseTasksPerRun, failed(claimCalls));
  const claimsAgree = exactAgreement(claimCalls, 'corpus-claims');
  if (!claimsAgree) return unknown(options, calls, baseTasksPerRun, ['corpus_claim_classification_disagreement'], { corpus_claims: false });

  const materialCalls = await assessTasks(stageTasks(options.chunks, 'materiality'), options.assessor, concurrency);
  calls.push(...materialCalls);
  if (failed(materialCalls).length) return unknown(options, calls, baseTasksPerRun, failed(materialCalls), { corpus_claims: true });
  const materialityAgrees = materialityAgreement(materialCalls);
  if (!materialityAgrees) {
    return unknown(options, calls, baseTasksPerRun, ['materiality_disagreement'], { corpus_claims: true, materiality: false });
  }

  const stageRecords = [...claimCalls, ...materialCalls];
  const claimsByRun = new Map(RUN_IDS.map((runId) => [runId, mergeLiveClaims(stageRecords, options.chunks, runId)]));
  const behaviorsByRun = new Map(RUN_IDS.map((runId) => [runId, mergeMaterialBehaviors(stageRecords, options.chunks, runId)]));
  const driftTasks = RUN_IDS.map((runId) => buildDriftTask(options.project, claimsByRun.get(runId)!, behaviorsByRun.get(runId)!));
  const needsDriftCall = driftTasks.some((task) => task.behaviors.length > 0);
  const projectedPerRun = baseTasksPerRun + (needsDriftCall ? 1 : 0);
  if (projectedPerRun > maxTasksPerRun) {
    return unknown(
      options,
      calls,
      projectedPerRun,
      [`task_budget_exceeded:${projectedPerRun}>${maxTasksPerRun}`],
      { corpus_claims: true, materiality: true },
    );
  }
  for (const task of driftTasks) {
    if (Buffer.byteLength(JSON.stringify(task)) > 2_000_000) {
      return unknown(
        options,
        calls,
        projectedPerRun,
        [`drift_task_oversize:${task.project_slug}`],
        { corpus_claims: true, materiality: true },
      );
    }
  }

  const pinnedCalls = await assessTasks(stageTasks(options.chunks, 'pinned-checks'), options.assessor, concurrency);
  calls.push(...pinnedCalls);
  if (failed(pinnedCalls).length) {
    return unknown(options, calls, projectedPerRun, failed(pinnedCalls), { corpus_claims: true, materiality: true });
  }

  let driftCalls: CallRecord[] = [];
  if (needsDriftCall) {
    const modelTasks = driftTasks.map((task, position) => ({
      run_id: RUN_IDS[position],
      kind: 'drift-matching' as const,
      task_id: `${task.project_slug}-drift-matching-0001`,
      task,
    }));
    driftCalls = await assessTasks(modelTasks, options.assessor, concurrency);
    calls.push(...driftCalls);
    if (failed(driftCalls).length) {
      return unknown(
        options,
        calls,
        projectedPerRun,
        failed(driftCalls),
        { corpus_claims: true, materiality: true, pinned_checks: exactAgreement(pinnedCalls, 'pinned-checks') },
      );
    }
  }

  const pinnedAgrees = exactAgreement(pinnedCalls, 'pinned-checks');
  const driftAgrees = needsDriftCall ? exactAgreement(driftCalls, 'drift-matching') : true;
  if (!pinnedAgrees || !driftAgrees) {
    return unknown(
      options,
      calls,
      projectedPerRun,
      [!pinnedAgrees ? 'pinned_check_disagreement' : null, !driftAgrees ? 'drift_matching_disagreement' : null].filter((reason): reason is string => Boolean(reason)),
      { corpus_claims: true, materiality: true, pinned_checks: pinnedAgrees, drift_matching: driftAgrees },
    );
  }

  const successfulCalls = calls.filter((call) => call.status === 'ok');
  const responseIds = successfulCalls.map((call) => call.response_id).filter((id): id is string => Boolean(id));
  const actualModels = new Set(successfulCalls.map((call) => call.model).filter((model): model is string => Boolean(model)));
  const isolationReasons = [
    new Set(responseIds).size !== responseIds.length ? 'response_reuse_detected' : null,
    actualModels.size !== 1 ? 'model_mismatch_between_calls' : null,
  ].filter((reason): reason is string => Boolean(reason));
  if (isolationReasons.length) {
    return unknown(
      options,
      calls,
      projectedPerRun,
      isolationReasons,
      { corpus_claims: true, materiality: true, pinned_checks: true, drift_matching: true },
    );
  }

  const rollups = RUN_IDS.map((runId) => {
    const driftOutput: DriftOutput = needsDriftCall
      ? outputsFor(driftCalls, runId, 'drift-matching')[0]
      : { protocol_version: '4.0', project_slug: options.project.identity.slug, assessments: [] };
    return rollupRun(
      options.project,
      runId,
      claimsByRun.get(runId)!,
      behaviorsByRun.get(runId)!,
      driftOutput,
      outputsFor(pinnedCalls, runId, 'pinned-checks'),
    );
  });
  const ratingsAgree = rollups[0].rating === rollups[1].rating && rollups[0].rule === rollups[1].rule;
  if (!ratingsAgree) {
    const bundle = unknown(
      options,
      calls,
      projectedPerRun,
      ['rating_disagreement'],
      { corpus_claims: true, materiality: true, pinned_checks: true, drift_matching: true, rating: false },
    );
    bundle.run_rollups = rollups;
    return bundle;
  }

  const bundle = baseBundle(options, calls, projectedPerRun);
  bundle.status = 'accepted';
  bundle.rating = rollups[0].rating;
  bundle.rule = rollups[0].rule;
  bundle.reasons = [];
  bundle.agreement = {
    corpus_claims: true,
    materiality: true,
    pinned_checks: true,
    drift_matching: true,
    rating: true,
  };
  bundle.run_rollups = rollups;
  bundle.task_budget.actual_model_calls = calls.filter((call) => call.status === 'ok').length;
  bundle.publication = publication(bundle.status, bundle.rating, bundle.previous_rating);
  return bundle;
}
