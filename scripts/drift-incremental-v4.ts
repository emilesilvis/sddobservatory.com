import { createHash } from 'node:crypto';
import type { AssessmentBundle, DriftOutput, DriftRating, DriftTask } from './drift-assessment-v4.ts';

export type DriftReviewStateV1 = {
  schema_version: '1';
  project_slug: string;
  repository: string;
  assessed_pin_sha: string;
  assessed_at_utc: string;
  rating: Exclude<DriftRating, 'unknown'>;
  rule: 'H1' | 'H2' | 'M1' | 'L1' | 'N1';
  assessment_context_sha256: string;
  claim_entries: Array<{
    path: string;
    git_blob_sha: string;
    segment_index: number;
    content_sha256: string;
    live_claims: DriftTask['live_claims'];
  }>;
  drift_entries: Array<{
    commit_sha: string;
    behavior_id: string;
    behavior: string;
    affected_paths: string[];
    assessment: DriftOutput['assessments'][number];
  }>;
  integrity_sha256: string;
};

export type IncrementalPlan = {
  mode: 'baseline' | 'incremental';
  chunks: any[];
  baseline_live_claims: DriftTask['live_claims'];
  baseline_behaviors: DriftTask['behaviors'];
  baseline_drift_assessments: DriftOutput['assessments'];
  reassess_baseline_behaviors: boolean;
  projected_tasks_per_run: number;
  preflight_reasons: string[];
  accounting: {
    corpus_items_total: number;
    corpus_items_reused: number;
    corpus_items_changed: number;
    corpus_items_removed: number;
    commits_new: number;
    behaviors_retained: number;
    behaviors_expired: number;
  };
};

type PlanInput = {
  project: any;
  chunks: any[];
  state: DriftReviewStateV1 | null;
  maxTasksPerRun: number;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => Buffer.from(left).compare(Buffer.from(right)))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function stateIntegrity(state: DriftReviewStateV1): string {
  return sha256(canonicalize({ ...state, integrity_sha256: '0'.repeat(64) }));
}

export function assessmentContextSha256(project: any): string {
  return sha256(canonicalize({
    corpus_scope: project.corpus?.scope ?? null,
    scope_anchors: (project.corpus?.scope_anchors ?? []).map((anchor: any) => ({
      kind: anchor.kind ?? null,
      name: anchor.name,
      source_ids: [...(anchor.source_ids ?? [])],
    })),
  }));
}

export function parseReviewState(serialized: string): DriftReviewStateV1 {
  const parsed = JSON.parse(serialized) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid drift review state document');
  const state = parsed as DriftReviewStateV1;
  if (state.schema_version !== '1') throw new Error('Invalid drift review state schema');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(state.project_slug)) throw new Error('Invalid drift review state project');
  if (!/^[^/]+\/[^/]+$/.test(state.repository)) throw new Error('Invalid drift review state repository');
  if (!/^[0-9a-f]{40}$/.test(state.assessed_pin_sha)) throw new Error('Invalid drift review state pin');
  if (Number.isNaN(Date.parse(state.assessed_at_utc))) throw new Error('Invalid drift review state time');
  if (!['none', 'low', 'moderate', 'high'].includes(state.rating)) throw new Error('Invalid drift review state rating');
  if (!['H1', 'H2', 'M1', 'L1', 'N1'].includes(state.rule)) throw new Error('Invalid drift review state rule');
  const validRules: Record<string, string[]> = { none: ['N1'], low: ['L1'], moderate: ['M1'], high: ['H1', 'H2'] };
  if (!validRules[state.rating].includes(state.rule)) throw new Error('Drift review state rating and rule mismatch');
  if (!/^[0-9a-f]{64}$/.test(state.assessment_context_sha256)) throw new Error('Invalid drift review state assessment context');
  if (!Array.isArray(state.claim_entries)) throw new Error('Invalid drift review state claims');
  const sourceKeys = new Set<string>();
  const claimIds = new Set<string>();
  for (const candidateEntry of state.claim_entries) {
    if (!candidateEntry || typeof candidateEntry !== 'object' || Array.isArray(candidateEntry)) {
      throw new Error('Invalid drift review state claim source');
    }
    const entry = candidateEntry as DriftReviewStateV1['claim_entries'][number];
    const sourceKey = [entry.path, entry.git_blob_sha, entry.segment_index].join('\0');
    if (typeof entry.path !== 'string' || entry.path.length === 0 || !/^[0-9a-f]{40}$/.test(entry.git_blob_sha)
      || !Number.isInteger(entry.segment_index) || entry.segment_index < 1
      || !/^[0-9a-f]{64}$/.test(entry.content_sha256) || sourceKeys.has(sourceKey)) {
      throw new Error('Invalid drift review state claim source');
    }
    sourceKeys.add(sourceKey);
    if (!Array.isArray(entry.live_claims)) throw new Error('Invalid drift review state live claims');
    for (const candidateClaim of entry.live_claims) {
      if (!candidateClaim || typeof candidateClaim !== 'object' || Array.isArray(candidateClaim)) {
        throw new Error('Invalid drift review state live claim');
      }
      const claim = candidateClaim as DriftTask['live_claims'][number];
      if (!/^qv1-[0-9a-f]{24}$/.test(claim.claim_id) || claimIds.has(claim.claim_id)
        || !/^qv1-source-[0-9a-f]{20}$/.test(claim.segment_id)
        || typeof claim.statement !== 'string' || claim.statement.length === 0
        || typeof claim.core_claim !== 'boolean'
        || !(claim.scope_anchor_name === null || typeof claim.scope_anchor_name === 'string')) {
        throw new Error('Invalid drift review state live claim');
      }
      claimIds.add(claim.claim_id);
    }
  }
  if (!Array.isArray(state.drift_entries)) throw new Error('Invalid drift review state drift entries');
  const behaviorIds = new Set<string>();
  for (const candidateEntry of state.drift_entries) {
    if (!candidateEntry || typeof candidateEntry !== 'object' || Array.isArray(candidateEntry)) {
      throw new Error('Invalid drift review state drift entry');
    }
    const entry = candidateEntry as DriftReviewStateV1['drift_entries'][number];
    const assessment = entry.assessment;
    if (!/^[0-9a-f]{40}$/.test(entry.commit_sha) || !/^bv1-[0-9a-f]{24}$/.test(entry.behavior_id)
      || behaviorIds.has(entry.behavior_id) || typeof entry.behavior !== 'string' || entry.behavior.length === 0
      || !Array.isArray(entry.affected_paths) || entry.affected_paths.some((path) => typeof path !== 'string' || path.length === 0)
      || new Set(entry.affected_paths).size !== entry.affected_paths.length
      || !assessment || typeof assessment !== 'object' || Array.isArray(assessment)
      || assessment.behavior_id !== entry.behavior_id || !['in_scope', 'out_of_scope'].includes(assessment.scope)
      || !['covered', 'omitted', 'contradicted', 'minor_gap', 'not_assessed'].includes(assessment.status)
      || !Array.isArray(assessment.scope_anchor_names)
      || assessment.scope_anchor_names.some((name) => typeof name !== 'string' || name.length === 0)
      || !Array.isArray(assessment.claim_ids) || assessment.claim_ids.some((id) => !claimIds.has(id))
      || typeof assessment.core_claim !== 'boolean') {
      throw new Error('Invalid drift review state drift entry');
    }
    behaviorIds.add(entry.behavior_id);
  }
  if (!/^[0-9a-f]{64}$/.test(state.integrity_sha256)) throw new Error('Invalid drift review state integrity');
  if (state.integrity_sha256 !== stateIntegrity(state)) throw new Error('Drift review state integrity mismatch');
  return state;
}

function sameClaimSource(item: any, entry: DriftReviewStateV1['claim_entries'][number]): boolean {
  return item.path === entry.path
    && item.git_blob_sha === entry.git_blob_sha
    && item.evidence_segment?.segment_index === entry.segment_index
    && item.evidence_segment?.content_sha256 === entry.content_sha256;
}

function reusableClaimSource(item: any, entry: DriftReviewStateV1['claim_entries'][number]): boolean {
  if (!sameClaimSource(item, entry)) return false;
  const allowedAnchors = new Set(item.allowed_scope_anchor_names ?? []);
  return entry.live_claims.every((claim) => claim.scope_anchor_name === null || allowedAnchors.has(claim.scope_anchor_name));
}

function commitLineage(chunks: any[]): Map<string, string | null> {
  const lineage = new Map<string, string | null>();
  for (const chunk of chunks.filter((item) => ['materiality', 'exclusions'].includes(item.kind))) {
    for (const item of chunk.items ?? []) {
      const commit = item.commit;
      if (commit?.sha) lineage.set(commit.sha, commit.first_parent_sha ?? null);
    }
  }
  return lineage;
}

function commitsAfter(chunks: any[], currentPin: string, previousPin: string): Set<string> | null {
  if (currentPin === previousPin) return new Set();
  const lineage = commitLineage(chunks);
  const result = new Set<string>();
  let cursor: string | null = currentPin;
  while (cursor && cursor !== previousPin) {
    if (result.has(cursor)) return null;
    result.add(cursor);
    if (!lineage.has(cursor)) return null;
    cursor = lineage.get(cursor) ?? null;
  }
  return cursor === previousPin ? result : null;
}

function withItems(chunk: any, items: any[]): any {
  const result = {
    ...chunk,
    items,
    integrity: { canonical_json_sha256: '0'.repeat(64) },
  };
  result.integrity.canonical_json_sha256 = sha256(canonicalize(result));
  return result;
}

export function planIncrementalAssessment(input: PlanInput): IncrementalPlan {
  const { project, chunks, state, maxTasksPerRun } = input;
  const claimChunks = chunks.filter((chunk) => chunk.kind === 'corpus-claims');
  const claimItems = claimChunks.flatMap((chunk) => chunk.items ?? []);
  const baseline = state === null;
  const preflightReasons: string[] = [];

  if (state && (state.project_slug !== project.identity.slug || state.repository !== project.identity.repository)) {
    preflightReasons.push('incremental_state_identity_mismatch');
  }
  const newCommits = state && !preflightReasons.length
    ? commitsAfter(chunks, project.identity.pin_sha, state.assessed_pin_sha)
    : new Set<string>();
  if (state && !preflightReasons.length && newCommits === null) {
    preflightReasons.push('incremental_base_not_in_first_parent_window');
  }
  if (preflightReasons.length) {
    return {
      mode: 'incremental',
      chunks: [],
      baseline_live_claims: [],
      baseline_behaviors: [],
      baseline_drift_assessments: [],
      reassess_baseline_behaviors: false,
      projected_tasks_per_run: 0,
      preflight_reasons: preflightReasons,
      accounting: {
        corpus_items_total: claimItems.length,
        corpus_items_reused: 0,
        corpus_items_changed: claimItems.length,
        corpus_items_removed: 0,
        commits_new: 0,
        behaviors_retained: 0,
        behaviors_expired: 0,
      },
    };
  }

  const reusedItems = new Set<any>();
  const baselineLiveClaims: DriftTask['live_claims'] = [];
  if (state) {
    for (const item of claimItems) {
      const entry = state.claim_entries.find((candidate) => reusableClaimSource(item, candidate));
      if (!entry) continue;
      reusedItems.add(item);
      baselineLiveClaims.push(...entry.live_claims);
    }
  }

  const materialByCommit = new Map<string, any>();
  for (const chunk of chunks.filter((chunk) => chunk.kind === 'materiality')) {
    for (const item of chunk.items ?? []) {
      if (item.commit?.sha) materialByCommit.set(item.commit.sha, item);
    }
  }
  const baselineBehaviors: DriftTask['behaviors'] = [];
  const baselineDriftAssessments: DriftOutput['assessments'] = [];
  for (const entry of state?.drift_entries ?? []) {
    const material = materialByCommit.get(entry.commit_sha);
    if (!material) continue;
    baselineBehaviors.push({
      behavior_id: entry.behavior_id,
      candidate_id: material.candidate_id,
      commit_id: material.commit.commit_id ?? material.candidate.commit_id,
      commit_sha: entry.commit_sha,
      behavior: entry.behavior,
      affected_paths: [...entry.affected_paths],
    });
    baselineDriftAssessments.push({
      ...entry.assessment,
      scope_anchor_names: [...entry.assessment.scope_anchor_names],
      claim_ids: [...entry.assessment.claim_ids],
    });
  }
  const corpusChanged = !baseline && (
    reusedItems.size !== claimItems.length || state.claim_entries.length !== reusedItems.size
  );
  const assessmentContextChanged = state !== null
    && state.assessment_context_sha256 !== assessmentContextSha256(project);
  const reassessBaselineBehaviors = baselineBehaviors.length > 0 && (corpusChanged || assessmentContextChanged);

  const selectedChunks: any[] = [];
  for (const chunk of chunks) {
    if (chunk.kind === 'corpus-claims') {
      const items = baseline ? chunk.items : chunk.items.filter((item: any) => !reusedItems.has(item));
      if (items.length) selectedChunks.push(withItems(chunk, items));
    } else if (chunk.kind === 'materiality') {
      const items = baseline ? chunk.items : chunk.items.filter((item: any) => newCommits!.has(item.commit?.sha));
      if (items.length) selectedChunks.push(withItems(chunk, items));
    } else if (chunk.kind === 'pinned-checks') {
      selectedChunks.push(chunk);
    }
  }

  const projected = selectedChunks.length + (
    selectedChunks.some((chunk) => chunk.kind === 'materiality') || reassessBaselineBehaviors ? 1 : 0
  );
  if (projected > maxTasksPerRun) preflightReasons.push(`task_budget_exceeded:${projected}>${maxTasksPerRun}`);
  return {
    mode: baseline ? 'baseline' : 'incremental',
    chunks: selectedChunks,
    baseline_live_claims: baselineLiveClaims,
    baseline_behaviors: baselineBehaviors,
    baseline_drift_assessments: baselineDriftAssessments,
    reassess_baseline_behaviors: reassessBaselineBehaviors,
    projected_tasks_per_run: projected,
    preflight_reasons: preflightReasons,
    accounting: {
      corpus_items_total: claimItems.length,
      corpus_items_reused: reusedItems.size,
      corpus_items_changed: claimItems.length - reusedItems.size,
      corpus_items_removed: state ? state.claim_entries.length - reusedItems.size : 0,
      commits_new: newCommits?.size ?? 0,
      behaviors_retained: baselineBehaviors.length,
      behaviors_expired: state ? state.drift_entries.length - baselineBehaviors.length : 0,
    },
  };
}

type BuildStateInput = {
  bundle: AssessmentBundle;
  project: any;
  chunks: any[];
  previousState: DriftReviewStateV1 | null;
};

function stableClaimId(item: any, candidate: any): string {
  return `qv1-${sha256(canonicalize([
    item.path,
    item.git_blob_sha,
    item.evidence_segment.segment_index,
    candidate.statement_sha256 ?? sha256(candidate.statement),
    candidate.candidate_id.split('/').at(-1),
  ])).slice(0, 24)}`;
}

function stableSegmentId(item: any): string {
  return `qv1-source-${sha256(canonicalize([
    item.path,
    item.git_blob_sha,
    item.evidence_segment.segment_index,
    item.evidence_segment.content_sha256,
  ])).slice(0, 20)}`;
}

function stableBehaviorId(behavior: DriftTask['behaviors'][number]): string {
  return `bv1-${sha256(canonicalize([
    behavior.commit_sha,
    behavior.behavior,
    behavior.affected_paths,
  ])).slice(0, 24)}`;
}

export function buildReviewState(input: BuildStateInput): DriftReviewStateV1 {
  const { bundle, project, chunks, previousState } = input;
  if (bundle.status !== 'accepted' || bundle.rating === 'unknown' || bundle.rule === 'U1') {
    throw new Error('Only accepted assessments can advance drift review state');
  }
  if (bundle.project.slug !== project.identity.slug || bundle.project.repository !== project.identity.repository
    || bundle.project.pin_sha !== project.identity.pin_sha) {
    throw new Error('Assessment and project identity mismatch');
  }

  const classifications = new Map<string, any>();
  for (const call of bundle.calls.filter((item) => item.run_id === 'run-1' && item.kind === 'corpus-claims' && item.status === 'ok')) {
    for (const assessment of call.output?.assessments ?? []) {
      for (const classification of assessment.classifications ?? []) {
        if (classifications.has(classification.candidate_id)) throw new Error(`Duplicate classification ${classification.candidate_id}`);
        classifications.set(classification.candidate_id, classification);
      }
    }
  }

  const claimItems = chunks
    .filter((chunk) => chunk.kind === 'corpus-claims')
    .flatMap((chunk) => chunk.items ?? []);
  const durableClaimIds = new Map<string, string>();
  const claimEntries: DriftReviewStateV1['claim_entries'] = claimItems.map((item) => {
    const previous = previousState?.claim_entries.find((entry) => reusableClaimSource(item, entry));
    if (previous) {
      for (const claim of previous.live_claims) durableClaimIds.set(claim.claim_id, claim.claim_id);
      return structuredClone(previous);
    }
    const liveClaims: DriftTask['live_claims'] = [];
    for (const candidate of item.claim_candidates ?? []) {
      const classification = classifications.get(candidate.candidate_id);
      if (!classification) throw new Error(`Missing classification ${candidate.candidate_id}`);
      if (classification.disposition === 'claim' && classification.lifecycle === 'live') {
        const claimId = stableClaimId(item, candidate);
        durableClaimIds.set(candidate.candidate_id, claimId);
        liveClaims.push({
          claim_id: claimId,
          segment_id: stableSegmentId(item),
          statement: candidate.statement,
          core_claim: classification.core_claim,
          scope_anchor_name: classification.scope_anchor_name,
        });
      }
    }
    return {
      path: item.path,
      git_blob_sha: item.git_blob_sha,
      segment_index: item.evidence_segment.segment_index,
      content_sha256: item.evidence_segment.content_sha256,
      live_claims: liveClaims,
    };
  });

  const resolvedDrift = bundle.resolved_drift ?? { behaviors: [], assessments: [] };
  const assessmentsByBehavior = new Map<string, DriftOutput['assessments'][number]>();
  for (const assessment of resolvedDrift.assessments) {
    if (assessmentsByBehavior.has(assessment.behavior_id)) throw new Error(`Duplicate drift assessment ${assessment.behavior_id}`);
    assessmentsByBehavior.set(assessment.behavior_id, assessment);
  }
  const driftEntries: DriftReviewStateV1['drift_entries'] = resolvedDrift.behaviors.map((behavior) => {
    const assessment = assessmentsByBehavior.get(behavior.behavior_id);
    if (!assessment) throw new Error(`Missing drift assessment ${behavior.behavior_id}`);
    const behaviorId = stableBehaviorId(behavior);
    const claimIds = assessment.claim_ids.map((claimId) => {
      const durableId = durableClaimIds.get(claimId);
      if (!durableId) throw new Error(`Unknown durable claim ${claimId}`);
      return durableId;
    });
    return {
      commit_sha: behavior.commit_sha,
      behavior_id: behaviorId,
      behavior: behavior.behavior,
      affected_paths: [...behavior.affected_paths],
      assessment: {
        ...assessment,
        behavior_id: behaviorId,
        scope_anchor_names: [...assessment.scope_anchor_names],
        claim_ids: claimIds,
      },
    };
  });
  if (assessmentsByBehavior.size !== driftEntries.length) throw new Error('Drift behavior assessment coverage mismatch');

  const state: DriftReviewStateV1 = {
    schema_version: '1',
    project_slug: bundle.project.slug,
    repository: bundle.project.repository,
    assessed_pin_sha: bundle.project.pin_sha,
    assessed_at_utc: bundle.created_at_utc,
    rating: bundle.rating,
    rule: bundle.rule,
    assessment_context_sha256: assessmentContextSha256(project),
    claim_entries: claimEntries,
    drift_entries: driftEntries,
    integrity_sha256: '0'.repeat(64),
  };
  state.integrity_sha256 = stateIntegrity(state);
  return parseReviewState(JSON.stringify(state));
}
