import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessmentContextSha256,
  buildReviewState,
  parseReviewState,
  planIncrementalAssessment,
  type DriftReviewStateV1,
} from './drift-incremental-v4.ts';

const OLD_PIN = 'a'.repeat(40);
const NEW_PIN = 'b'.repeat(40);
const BLOB = 'c'.repeat(40);
const CONTENT_HASH = 'd'.repeat(64);

function claimItem(blob = BLOB, contentHash = CONTENT_HASH) {
  return {
    artifact_id: 'f0001',
    path: 'docs/requirements.md',
    git_blob_sha: blob,
    segment_id: 's0001-g0001',
    allowed_scope_anchor_names: ['Requirements'],
    evidence_segment: {
      segment_id: 's0001-g0001',
      segment_index: 1,
      content_sha256: contentHash,
    },
    claim_candidates: [{
      candidate_id: 's0001-g0001/q0001',
      statement: 'The feature is available.',
      statement_sha256: 'e'.repeat(64),
    }],
  };
}

function chunks(options: { currentPin?: string; claimBlob?: string; claimHash?: string; materialCommit?: boolean } = {}) {
  const currentPin = options.currentPin ?? OLD_PIN;
  const result: any[] = [
    {
      protocol_version: '4.0',
      project_slug: 'fixture',
      chunk_id: 'fixture-corpus-claims-0001',
      kind: 'corpus-claims',
      items: [claimItem(options.claimBlob, options.claimHash)],
      integrity: { canonical_json_sha256: '0'.repeat(64) },
    },
    {
      protocol_version: '4.0',
      project_slug: 'fixture',
      chunk_id: 'fixture-pinned-checks-0001',
      kind: 'pinned-checks',
      items: [{ check: { check_id: 'p0001' } }],
      integrity: { canonical_json_sha256: '0'.repeat(64) },
    },
  ];
  const commit = { sha: currentPin, first_parent_sha: currentPin === OLD_PIN ? '9'.repeat(40) : OLD_PIN };
  if (options.materialCommit) {
    result.push({
      protocol_version: '4.0',
      project_slug: 'fixture',
      chunk_id: 'fixture-materiality-0001',
      kind: 'materiality',
      items: [{ candidate_id: 'm0001', commit, candidate: { commit_id: 'c0001' } }],
      integrity: { canonical_json_sha256: '0'.repeat(64) },
    });
  } else if (currentPin !== OLD_PIN) {
    result.push({
      protocol_version: '4.0',
      project_slug: 'fixture',
      chunk_id: 'fixture-exclusions-0001',
      kind: 'exclusions',
      items: [{ commit, exclusion: { commit_id: 'c0001' } }],
      integrity: { canonical_json_sha256: '0'.repeat(64) },
    });
  }
  return result;
}

function project(pin = OLD_PIN) {
  return {
    protocol_version: '4.0',
    identity: { slug: 'fixture', repository: 'example/fixture', pin_sha: pin },
    corpus: { scope: 'canonical', scope_anchors: [{ name: 'Requirements' }] },
  };
}

function state(): DriftReviewStateV1 {
  return {
    schema_version: '1',
    project_slug: 'fixture',
    repository: 'example/fixture',
    assessed_pin_sha: OLD_PIN,
    assessed_at_utc: '2026-08-11T00:00:00Z',
    rating: 'low',
    rule: 'L1',
    assessment_context_sha256: assessmentContextSha256(project()),
    claim_entries: [{
      path: 'docs/requirements.md',
      git_blob_sha: BLOB,
      segment_index: 1,
      content_sha256: CONTENT_HASH,
      live_claims: [{
        claim_id: `qv1-${'1'.repeat(24)}`,
        segment_id: `qv1-source-${'2'.repeat(20)}`,
        statement: 'The feature is available.',
        core_claim: false,
        scope_anchor_name: 'Requirements',
      }],
    }],
    drift_entries: [],
    integrity_sha256: 'f'.repeat(64),
  };
}

test('reuses unchanged corpus claims and leaves only pinned checks for an unchanged pin', () => {
  const plan = planIncrementalAssessment({ project: project(), chunks: chunks(), state: state(), maxTasksPerRun: 20 });

  assert.equal(plan.mode, 'incremental');
  assert.deepEqual(plan.preflight_reasons, []);
  assert.deepEqual(plan.chunks.map((chunk) => chunk.kind), ['pinned-checks']);
  assert.deepEqual(plan.baseline_live_claims, state().claim_entries[0].live_claims);
  assert.equal(plan.projected_tasks_per_run, 1);
  assert.deepEqual(plan.accounting, {
    corpus_items_total: 1,
    corpus_items_reused: 1,
    corpus_items_changed: 0,
    corpus_items_removed: 0,
    commits_new: 0,
    behaviors_retained: 0,
    behaviors_expired: 0,
  });
});

test('assesses only commits after the stored pin while reusing unchanged claims', () => {
  const plan = planIncrementalAssessment({
    project: project(NEW_PIN),
    chunks: chunks({ currentPin: NEW_PIN, materialCommit: true }),
    state: state(),
    maxTasksPerRun: 20,
  });

  assert.deepEqual(plan.preflight_reasons, []);
  assert.deepEqual(plan.chunks.map((chunk) => chunk.kind), ['pinned-checks', 'materiality']);
  assert.equal(plan.chunks.find((chunk) => chunk.kind === 'materiality').items[0].commit.sha, NEW_PIN);
  assert.equal(plan.accounting.commits_new, 1);
  assert.equal(plan.projected_tasks_per_run, 3);
});

test('incremental planning reserves a drift call when new materiality work exists', () => {
  const plan = planIncrementalAssessment({
    project: project(NEW_PIN),
    chunks: chunks({ currentPin: NEW_PIN, materialCommit: true }),
    state: state(),
    maxTasksPerRun: 2,
  });

  assert.equal(plan.projected_tasks_per_run, 3);
  assert.deepEqual(plan.preflight_reasons, ['task_budget_exceeded:3>2']);
});

test('sends a changed corpus blob back through classification and drops its stale claims', () => {
  const plan = planIncrementalAssessment({
    project: project(NEW_PIN),
    chunks: chunks({ currentPin: NEW_PIN, claimBlob: '1'.repeat(40), claimHash: '2'.repeat(64) }),
    state: state(),
    maxTasksPerRun: 20,
  });

  assert.deepEqual(plan.preflight_reasons, []);
  assert.deepEqual(plan.chunks.map((chunk) => chunk.kind), ['corpus-claims', 'pinned-checks']);
  assert.deepEqual(plan.baseline_live_claims, []);
  assert.equal(plan.accounting.corpus_items_changed, 1);
  assert.equal(plan.projected_tasks_per_run, 2);
});

test('reclassifies unchanged text when its persisted scope anchor is no longer allowed', () => {
  const outdated = state();
  outdated.claim_entries[0].live_claims[0].scope_anchor_name = 'Retired anchor';
  const plan = planIncrementalAssessment({
    project: project(),
    chunks: chunks(),
    state: outdated,
    maxTasksPerRun: 20,
  });

  assert.deepEqual(plan.chunks.map((chunk) => chunk.kind), ['corpus-claims', 'pinned-checks']);
  assert.deepEqual(plan.baseline_live_claims, []);
  assert.equal(plan.accounting.corpus_items_changed, 1);
});

test('carries reviewed behaviors that remain in the current window and expires missing commits', () => {
  const prior = state();
  prior.drift_entries = [{
    commit_sha: OLD_PIN,
    behavior_id: `bv1-${'4'.repeat(24)}`,
    behavior: 'The implementation exposes an undocumented feature.',
    affected_paths: ['src/feature.ts'],
    assessment: {
      behavior_id: `bv1-${'4'.repeat(24)}`,
      scope: 'in_scope',
      scope_anchor_names: ['Requirements'],
      status: 'omitted',
      claim_ids: [],
      core_claim: false,
    },
  }];

  const retained = planIncrementalAssessment({
    project: project(),
    chunks: chunks({ materialCommit: true }),
    state: prior,
    maxTasksPerRun: 20,
  });
  assert.equal(retained.baseline_behaviors.length, 1);
  assert.equal(retained.baseline_behaviors[0].commit_sha, OLD_PIN);
  assert.equal(retained.baseline_drift_assessments[0].status, 'omitted');
  assert.equal(retained.reassess_baseline_behaviors, false);

  const changedCorpus = planIncrementalAssessment({
    project: project(),
    chunks: chunks({ materialCommit: true, claimBlob: '5'.repeat(40), claimHash: '6'.repeat(64) }),
    state: prior,
    maxTasksPerRun: 20,
  });
  assert.equal(changedCorpus.reassess_baseline_behaviors, true);
  assert.equal(changedCorpus.projected_tasks_per_run, 3);

  const deletedCorpusChunks = chunks({ materialCommit: true }).filter((chunk) => chunk.kind !== 'corpus-claims');
  const deletedCorpus = planIncrementalAssessment({
    project: project(),
    chunks: deletedCorpusChunks,
    state: prior,
    maxTasksPerRun: 20,
  });
  assert.equal(deletedCorpus.baseline_behaviors.length, 1);
  assert.equal(deletedCorpus.reassess_baseline_behaviors, true);
  assert.equal(deletedCorpus.projected_tasks_per_run, 2);
  assert.equal(deletedCorpus.accounting.corpus_items_removed, 1);

  const expired = planIncrementalAssessment({ project: project(), chunks: chunks(), state: prior, maxTasksPerRun: 20 });
  assert.deepEqual(expired.baseline_behaviors, []);
  assert.deepEqual(expired.baseline_drift_assessments, []);
  assert.equal(expired.accounting.behaviors_expired, 1);
});

test('fails closed when the stored pin is not in the current first-parent evidence', () => {
  const brokenState = state();
  brokenState.assessed_pin_sha = '8'.repeat(40);
  const plan = planIncrementalAssessment({
    project: project(NEW_PIN),
    chunks: chunks({ currentPin: NEW_PIN, materialCommit: true }),
    state: brokenState,
    maxTasksPerRun: 20,
  });

  assert.deepEqual(plan.preflight_reasons, ['incremental_base_not_in_first_parent_window']);
  assert.deepEqual(plan.chunks, []);
  assert.equal(plan.projected_tasks_per_run, 0);
});

test('persists newly classified claims and reviewed behaviors under source-stable IDs', () => {
  const fullChunks = chunks({ currentPin: NEW_PIN, claimBlob: '1'.repeat(40), claimHash: '2'.repeat(64), materialCommit: true });
  const bundle: any = {
    status: 'accepted',
    rating: 'moderate',
    rule: 'M1',
    created_at_utc: '2026-08-12T00:00:00Z',
    project: { slug: 'fixture', repository: 'example/fixture', pin_sha: NEW_PIN },
    calls: [{
      run_id: 'run-1',
      kind: 'corpus-claims',
      status: 'ok',
      output: {
        assessments: [{
          segment_id: 's0001-g0001',
          classifications: [{
            candidate_id: 's0001-g0001/q0001',
            disposition: 'claim',
            lifecycle: 'live',
            core_claim: false,
            scope_anchor_name: 'Requirements',
          }],
        }],
      },
    }],
    resolved_drift: {
      behaviors: [{
        behavior_id: 'm0001/b01',
        candidate_id: 'm0001',
        commit_id: 'c0001',
        commit_sha: NEW_PIN,
        behavior: 'The feature is available.',
        affected_paths: ['src/feature.ts'],
      }],
      assessments: [{
        behavior_id: 'm0001/b01',
        scope: 'in_scope',
        scope_anchor_names: ['Requirements'],
        status: 'covered',
        claim_ids: ['s0001-g0001/q0001'],
        core_claim: false,
      }],
    },
  };

  const next = buildReviewState({ bundle, project: project(NEW_PIN), chunks: fullChunks, previousState: state() });
  assert.equal(next.assessed_pin_sha, NEW_PIN);
  assert.equal(next.claim_entries.length, 1);
  assert.deepEqual({
    path: next.claim_entries[0].path,
    git_blob_sha: next.claim_entries[0].git_blob_sha,
    content_sha256: next.claim_entries[0].content_sha256,
    statement: next.claim_entries[0].live_claims[0].statement,
    scope_anchor_name: next.claim_entries[0].live_claims[0].scope_anchor_name,
  }, {
    path: 'docs/requirements.md',
    git_blob_sha: '1'.repeat(40),
    content_sha256: '2'.repeat(64),
    statement: 'The feature is available.',
    scope_anchor_name: 'Requirements',
  });
  assert.match(next.claim_entries[0].live_claims[0].claim_id, /^qv1-[0-9a-f]{24}$/);
  assert.equal(next.drift_entries.length, 1);
  assert.match(next.drift_entries[0].behavior_id, /^bv1-[0-9a-f]{24}$/);
  assert.equal(next.drift_entries[0].assessment.behavior_id, next.drift_entries[0].behavior_id);
  assert.deepEqual(next.drift_entries[0].assessment.claim_ids, [next.claim_entries[0].live_claims[0].claim_id]);
  assert.deepEqual(parseReviewState(JSON.stringify(next)), next);

  const tampered = structuredClone(next);
  tampered.claim_entries[0].live_claims[0].statement = 'Tampered';
  assert.throws(() => parseReviewState(JSON.stringify(tampered)), /integrity/);
  assert.throws(() => parseReviewState('null'), /Invalid drift review state document/);

  const nullSource = { ...next, claim_entries: [null] };
  assert.throws(() => parseReviewState(JSON.stringify(nullSource)), /Invalid drift review state claim source/);
  const nullClaim = structuredClone(next) as any;
  nullClaim.claim_entries[0].live_claims = [null];
  assert.throws(() => parseReviewState(JSON.stringify(nullClaim)), /Invalid drift review state live claim/);
  const inconsistentRule = { ...next, rating: 'none', rule: 'M1' };
  assert.throws(() => parseReviewState(JSON.stringify(inconsistentRule)), /rating and rule/);
});

test('carries unchanged claim entries when an incremental run needed no claim calls', () => {
  const bundle: any = {
    status: 'accepted',
    rating: 'none',
    rule: 'N1',
    created_at_utc: '2026-08-12T00:00:00Z',
    project: { slug: 'fixture', repository: 'example/fixture', pin_sha: OLD_PIN },
    calls: [],
    resolved_drift: { behaviors: [], assessments: [] },
  };

  const next = buildReviewState({ bundle, project: project(), chunks: chunks(), previousState: state() });
  assert.deepEqual(next.claim_entries[0].live_claims, state().claim_entries[0].live_claims);
  assert.equal(next.rating, 'none');
  assert.equal(next.rule, 'N1');
});
