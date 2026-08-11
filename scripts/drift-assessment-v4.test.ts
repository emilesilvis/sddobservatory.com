import assert from 'node:assert/strict';
import test from 'node:test';
import { rollupRun, runAutomatedAssessment, type ModelAssessor, type ModelTask } from './drift-assessment-v4.ts';

function fixture() {
  const project = {
    protocol_version: '4.0',
    identity: {
      slug: 'fixture',
      repository: 'example/fixture',
      pin_sha: '1'.repeat(40),
      pin_time_utc: '2026-08-01T00:00:00Z',
    },
    corpus: {
      scope: 'canonical',
      scope_anchors: [{ name: 'Requirements' }],
    },
    window: { spec_is_stale_90d: true },
    integrity: { canonical_json_sha256: '2'.repeat(64) },
  };
  const chunks = [
    {
      protocol_version: '4.0',
      chunk_id: 'fixture-corpus-claims-0001',
      kind: 'corpus-claims',
      items: [{
        segment_id: 's0001-g0001',
        allowed_scope_anchor_names: ['Requirements'],
        claim_candidates: [{
          candidate_id: 's0001-g0001/q0001',
          statement: 'The feature is available.',
        }],
      }],
    },
    {
      protocol_version: '4.0',
      chunk_id: 'fixture-materiality-0001',
      kind: 'materiality',
      items: [{
        candidate_id: 'm0001',
        commit: { sha: '3'.repeat(40) },
        candidate: { commit_id: 'c0001', affected_paths: ['src/feature.ts'] },
      }],
    },
    {
      protocol_version: '4.0',
      chunk_id: 'fixture-pinned-checks-0001',
      kind: 'pinned-checks',
      items: [{
        check: { check_id: 'p0001' },
        source_segment_ids: ['s0001-g0001', 's0002-g0001'],
      }],
    },
  ];
  return { project, chunks };
}

function answer(task: ModelTask, overrides: {
  claimLifecycle?: 'live' | 'future' | 'historical';
  claimDisposition?: 'claim' | 'not_claim';
  material?: boolean;
  pinnedStatus?: 'covered' | 'omitted' | 'contradicted' | 'minor_gap';
  pinnedCore?: boolean;
  driftStatus?: 'covered' | 'omitted' | 'contradicted' | 'minor_gap';
} = {}) {
  if (task.kind === 'corpus-claims') {
    const disposition = overrides.claimDisposition ?? 'claim';
    return {
      protocol_version: '4.0',
      chunk_id: task.task_id,
      assessments: [{
        segment_id: 's0001-g0001',
        classifications: [{
          candidate_id: 's0001-g0001/q0001',
          disposition,
          lifecycle: disposition === 'claim' ? overrides.claimLifecycle ?? 'live' : null,
          core_claim: false,
          scope_anchor_name: disposition === 'claim' ? 'Requirements' : null,
        }],
      }],
    };
  }
  if (task.kind === 'materiality') {
    const material = overrides.material ?? false;
    return {
      protocol_version: '4.0',
      chunk_id: task.task_id,
      assessments: [{
        candidate_id: 'm0001',
        materiality: material ? 'material' : 'non_material',
        reason: material ? 'The diff changes observable behavior.' : 'The diff demonstrates no observable behavior.',
        behaviors: material ? [{
          behavior_id: 'm0001/b01',
          behavior: 'The feature is available.',
          affected_paths: ['src/feature.ts'],
        }] : [],
      }],
    };
  }
  if (task.kind === 'pinned-checks') {
    return {
      protocol_version: '4.0',
      chunk_id: task.task_id,
      assessments: [{
        check_id: 'p0001',
        status: overrides.pinnedStatus ?? 'contradicted',
        claim_segment_ids: ['s0001-g0001'],
        code_segment_ids: ['s0002-g0001'],
        core_claim: overrides.pinnedCore ?? false,
      }],
    };
  }
  const status = overrides.driftStatus ?? 'covered';
  return {
    protocol_version: '4.0',
    project_slug: 'fixture',
    assessments: task.task.behaviors.map((behavior: any) => ({
      behavior_id: behavior.behavior_id,
      scope: 'in_scope',
      scope_anchor_names: ['Requirements'],
      status,
      claim_ids: status === 'omitted' ? [] : ['s0001-g0001/q0001'],
      core_claim: false,
    })),
  };
}

function assessorFor(overrides: (task: ModelTask) => Parameters<typeof answer>[1] = () => ({})) {
  let calls = 0;
  const tasks: ModelTask[] = [];
  const assessor: ModelAssessor = async (task) => {
    calls += 1;
    tasks.push(task);
    return {
      output: answer(task, overrides(task)),
      response_id: `response-${calls}`,
      model: 'fixture-model',
      usage: { total_tokens: 10 },
    };
  };
  return { assessor, calls: () => calls, tasks: () => tasks };
}

test('accepts two matching isolated runs and rolls a non-core contradiction to moderate', async () => {
  const input = fixture();
  const fake = assessorFor();
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    previousRating: 'low',
    mode: 'fixture',
    now: () => new Date('2026-08-11T00:00:00Z'),
  });
  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'moderate');
  assert.equal(result.rule, 'M1');
  assert.equal(result.publication.reason, 'rating_changed');
  assert.deepEqual(result.agreement, {
    corpus_claims: true,
    materiality: true,
    pinned_checks: true,
    drift_matching: true,
    rating: true,
  });
  assert.equal(fake.calls(), 6);
});

test('fails closed before later stages when claim classification disagrees', async () => {
  const input = fixture();
  const fake = assessorFor((task) => ({
    claimLifecycle: task.run_id === 'run-1' ? 'live' : 'future',
  }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    mode: 'fixture',
  });
  assert.equal(result.status, 'unknown');
  assert.equal(result.rating, 'unknown');
  assert.deepEqual(result.reasons, ['corpus_claim_classification_disagreement']);
  assert.equal(fake.calls(), 2);
});

test('fails closed without model calls when the precommitted task budget is exceeded', async () => {
  const input = fixture();
  const fake = assessorFor();
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    maxTasksPerRun: 2,
    mode: 'fixture',
  });
  assert.equal(result.status, 'unknown');
  assert.deepEqual(result.reasons, ['task_budget_exceeded:3>2']);
  assert.equal(fake.calls(), 0);
});

test('reserves the possible drift-matching call before spending the task budget', async () => {
  const input = fixture();
  const fake = assessorFor(() => ({ material: true }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    maxTasksPerRun: 3,
    mode: 'fixture',
  });

  assert.equal(result.status, 'unknown');
  assert.deepEqual(result.reasons, ['task_budget_exceeded:4>3']);
  assert.equal(fake.calls(), 0);
});

test('runs drift matching for material behaviors and rolls complete coverage to none', async () => {
  const input = fixture();
  const fake = assessorFor(() => ({ material: true, pinnedStatus: 'covered', driftStatus: 'covered' }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    previousRating: 'none',
    mode: 'fixture',
  });
  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'none');
  assert.equal(result.rule, 'N1');
  assert.equal(result.publication.draft_pr_required, false);
  assert.equal(result.task_budget.projected_per_run, 4);
  assert.equal(result.resolved_drift.behaviors[0].commit_sha, '3'.repeat(40));
  assert.equal(result.resolved_drift.assessments[0].status, 'covered');
  assert.equal(fake.calls(), 8);
});

test('uses compiler-owned claim IDs and source statements for drift matching', async () => {
  const input = fixture();
  const fake = assessorFor(() => ({ material: true, pinnedStatus: 'covered', driftStatus: 'covered' }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    mode: 'fixture',
  });

  assert.equal(result.status, 'accepted');
  const driftTasks = fake.tasks().filter((task) => task.kind === 'drift-matching');
  assert.equal(driftTasks.length, 2);
  for (const task of driftTasks) {
    assert.deepEqual(task.task.live_claims, [{
      claim_id: 's0001-g0001/q0001',
      segment_id: 's0001-g0001',
      statement: 'The feature is available.',
      core_claim: false,
      scope_anchor_name: 'Requirements',
    }]);
  }
});

test('uses persisted live claims when unchanged corpus needs no model call', async () => {
  const input = fixture();
  input.chunks = input.chunks.filter((chunk) => chunk.kind !== 'corpus-claims');
  const fake = assessorFor(() => ({ pinnedStatus: 'covered' }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    previousRating: 'none',
    baselineLiveClaims: [{
      claim_id: 'qv1-111111111111111111111111',
      segment_id: 'qv1-source-11111111111111111111',
      statement: 'The feature is available.',
      core_claim: false,
      scope_anchor_name: 'Requirements',
    }],
    mode: 'fixture',
  });

  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'none');
  assert.equal(result.run_rollups[0].live_claims, 1);
  assert.equal(fake.calls(), 4);
});

test('carries persisted drift findings into an unchanged incremental rating', async () => {
  const input = fixture();
  input.chunks = [];
  const fake = assessorFor();
  const baselineBehaviors = [{
    behavior_id: 'bv1-111111111111111111111111',
    candidate_id: 'm0001',
    commit_id: 'c0001',
    commit_sha: '3'.repeat(40),
    behavior: 'The implementation exposes an undocumented feature.',
    affected_paths: ['src/feature.ts'],
  }];
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    previousRating: 'moderate',
    baselineBehaviors,
    baselineDriftAssessments: [{
      behavior_id: baselineBehaviors[0].behavior_id,
      scope: 'in_scope',
      scope_anchor_names: ['Requirements'],
      status: 'omitted',
      claim_ids: [],
      core_claim: false,
    }],
    mode: 'fixture',
  });

  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'moderate');
  assert.equal(result.rule, 'M1');
  assert.equal(result.run_rollups[0].material_behaviors, 1);
  assert.equal(result.resolved_drift.assessments[0].status, 'omitted');
  assert.equal(fake.calls(), 0);
});

test('reassesses persisted behaviors when corpus evidence changes', async () => {
  const input = fixture();
  input.chunks = input.chunks.filter((chunk) => chunk.kind === 'corpus-claims');
  const fake = assessorFor(() => ({ driftStatus: 'covered' }));
  const baselineBehaviors = [{
    behavior_id: 'bv1-111111111111111111111111',
    candidate_id: 'm0001',
    commit_id: 'c0001',
    commit_sha: '3'.repeat(40),
    behavior: 'The feature is available.',
    affected_paths: ['src/feature.ts'],
  }];
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    previousRating: 'moderate',
    baselineBehaviors,
    baselineDriftAssessments: [{
      behavior_id: baselineBehaviors[0].behavior_id,
      scope: 'in_scope',
      scope_anchor_names: ['Requirements'],
      status: 'omitted',
      claim_ids: [],
      core_claim: false,
    }],
    reassessBaselineBehaviors: true,
    mode: 'fixture',
  });

  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'none');
  assert.equal(fake.tasks().filter((task) => task.kind === 'drift-matching').length, 2);
  assert.equal(fake.calls(), 4);
});

test('fails closed before model calls when incremental state cannot prove complete coverage', async () => {
  const input = fixture();
  const fake = assessorFor();
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    preflightReasons: ['incremental_base_not_in_first_parent_window'],
    mode: 'fixture',
  });

  assert.equal(result.status, 'unknown');
  assert.deepEqual(result.reasons, ['incremental_base_not_in_first_parent_window']);
  assert.equal(fake.calls(), 0);
});

test('rolls a core pinned contradiction to high', async () => {
  const input = fixture();
  const fake = assessorFor(() => ({ pinnedStatus: 'contradicted', pinnedCore: true }));
  const result = await runAutomatedAssessment({
    ...input,
    assessor: fake.assessor,
    requestedModel: 'fixture-model',
    mode: 'fixture',
  });
  assert.equal(result.status, 'accepted');
  assert.equal(result.rating, 'high');
  assert.equal(result.rule, 'H1');
});

test('turns schema-invalid model output into an auditable unknown result', async () => {
  const input = fixture();
  let calls = 0;
  const assessor: ModelAssessor = async (task) => {
    calls += 1;
    const output = answer(task);
    if (calls === 1) output.chunk_id = 'wrong-chunk';
    return { output, response_id: `response-${calls}`, model: 'fixture-model' };
  };
  const result = await runAutomatedAssessment({
    ...input,
    assessor,
    requestedModel: 'fixture-model',
    mode: 'fixture',
  });
  assert.equal(result.status, 'unknown');
  assert.match(result.reasons[0], /identity mismatch/);
});

test('requires unique response IDs to prove calls were isolated', async () => {
  const input = fixture();
  const assessor: ModelAssessor = async (task) => ({
    output: answer(task),
    response_id: 'reused-response',
    model: 'fixture-model',
  });
  const result = await runAutomatedAssessment({
    ...input,
    assessor,
    requestedModel: 'fixture-model',
    mode: 'fixture',
  });
  assert.equal(result.status, 'unknown');
  assert.deepEqual(result.reasons, ['response_reuse_detected']);
});

test('applies the stale-spec three-commit rule before the moderate rule', () => {
  const behaviors = ['1', '2', '3'].map((id) => ({
    behavior_id: `m${id}/b01`,
    candidate_id: `m${id}`,
    commit_id: `c${id}`,
    commit_sha: id.repeat(40),
    behavior: `Behavior ${id}`,
    affected_paths: [`src/${id}.ts`],
  }));
  const result = rollupRun(
    { window: { spec_is_stale_90d: true } },
    'run-1',
    [],
    behaviors,
    {
      protocol_version: '4.0',
      project_slug: 'fixture',
      assessments: behaviors.map((behavior) => ({
        behavior_id: behavior.behavior_id,
        scope: 'in_scope',
        scope_anchor_names: [],
        status: 'omitted',
        claim_ids: [],
        core_claim: false,
      })),
    },
    [],
  );
  assert.equal(result.rating, 'high');
  assert.equal(result.rule, 'H2');
  assert.deepEqual(result.drift_commit_ids, ['c1', 'c2', 'c3']);
});

test('rolls minor gaps without omissions or contradictions to low', () => {
  const result = rollupRun(
    { window: { spec_is_stale_90d: false } },
    'run-1',
    [],
    [],
    { protocol_version: '4.0', project_slug: 'fixture', assessments: [] },
    [{ assessments: [{ check_id: 'p0001', status: 'minor_gap', core_claim: false }] }],
  );
  assert.equal(result.rating, 'low');
  assert.equal(result.rule, 'L1');
});
