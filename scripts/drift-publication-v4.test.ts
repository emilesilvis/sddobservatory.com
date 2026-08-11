import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPublicationProposal } from './drift-publication-v4.ts';
import type { AssessmentBundle } from './drift-assessment-v4.ts';

function acceptedBundle(): AssessmentBundle {
  return {
    protocol_version: '4.0',
    automation_version: '1.2.0',
    mode: 'live',
    created_at_utc: '2026-08-11T18:34:45.204Z',
    project: {
      slug: 'schematic',
      repository: 'BjoernKW/Schematic',
      pin_sha: 'd37d893a02dfff586aa0a329752603f2477f4234',
      pin_time_utc: '2026-08-08T09:55:47Z',
      project_manifest_sha256: '1'.repeat(64),
    },
    requested_model: 'gpt-5.6',
    previous_rating: 'low',
    status: 'accepted',
    rating: 'moderate',
    rule: 'M1',
    reasons: [],
    agreement: {
      corpus_claims: true,
      materiality: true,
      pinned_checks: true,
      drift_matching: true,
      rating: true,
    },
    task_budget: { maximum_per_run: 20, projected_per_run: 3, actual_model_calls: 6 },
    run_rollups: [
      { run_id: 'run-1', rating: 'moderate', rule: 'M1', drift_commit_ids: [], live_claims: 28, material_behaviors: 0, pinned_checks: 1 },
      { run_id: 'run-2', rating: 'moderate', rule: 'M1', drift_commit_ids: [], live_claims: 28, material_behaviors: 0, pinned_checks: 1 },
    ],
    calls: [{
      run_id: 'run-1',
      kind: 'pinned-checks',
      task_id: 'schematic-pinned-checks-0001',
      input_sha256: '2'.repeat(64),
      status: 'ok',
      output: {
        protocol_version: '4.0',
        chunk_id: 'schematic-pinned-checks-0001',
        assessments: [{
          check_id: 'p0001',
          status: 'contradicted',
          claim_segment_ids: ['s0001-g0001'],
          code_segment_ids: ['s0014-g0001'],
          core_claim: false,
        }],
      },
      response_id: 'response-1',
      model: 'gpt-5.6-sol',
    }],
    resolved_drift: { behaviors: [], assessments: [] },
    publication: { draft_pr_required: true, reason: 'rating_changed' },
  };
}

const projectMarkdown = `---
name: Schematic
drift: low
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. The post-spec work has not been verified.

## Defects and rework

Not yet assessed.
`;

const chunks = [{
  kind: 'pinned-checks',
  items: [{
    check: {
      check_id: 'p0001',
      question: 'Do the live non-PostgreSQL ER-diagram statements agree with each other and with the pinned generic INFORMATION_SCHEMA implementation?',
    },
  }],
}];

test('accepted rating change proposes the assessment and complete public project update together', () => {
  const proposal = buildPublicationProposal({
    bundle: acceptedBundle(),
    chunks,
    projectMarkdown,
    repository: 'emilesilvis/sddobservatory.com',
  });

  assert(proposal);
  assert.equal(proposal.title, 'Review drift assessment: schematic → moderate');
  assert.equal(proposal.branch, 'automation/drift-schematic');
  assert.deepEqual(proposal.files.map((file) => file.path), [
    'docs/research/drift-assessments/2026-08-11-schematic-d37d893a02df.json',
    'src/content/projects/schematic.md',
  ]);
  const project = proposal.files[1].content;
  assert.match(project, /^drift: moderate$/m);
  assert.match(project, /^lastReviewed: 2026-08-11$/m);
  assert.match(project, /^Moderate \(`M1`\)\./m);
  assert.match(project, /non-PostgreSQL ER-diagram statements/);
  assert.match(project, /Both isolated runs agreed/);
  assert.doesNotMatch(project, /Low\. The post-spec work has not been verified/);
  assert.match(proposal.body, /updates the public project assessment/);
});

test('unknown assessment proposes evidence only and cannot alter public project content', () => {
  const bundle = acceptedBundle();
  bundle.status = 'unknown';
  bundle.rating = 'unknown';
  bundle.rule = 'U1';
  bundle.reasons = ['materiality_disagreement'];
  bundle.publication = { draft_pr_required: true, reason: 'evidence_incomplete' };

  const proposal = buildPublicationProposal({
    bundle,
    chunks,
    projectMarkdown,
    repository: 'emilesilvis/sddobservatory.com',
  });

  assert(proposal);
  assert.deepEqual(proposal.files.map((file) => file.path), [
    'docs/research/drift-assessments/2026-08-11-schematic-d37d893a02df.json',
  ]);
  assert.match(proposal.body, /materiality_disagreement/);
  assert.match(proposal.body, /does not change published project content/);
});

test('unchanged accepted assessment produces no publication proposal', () => {
  const bundle = acceptedBundle();
  bundle.previous_rating = 'moderate';
  bundle.publication = { draft_pr_required: false, reason: 'none' };

  assert.equal(buildPublicationProposal({
    bundle,
    chunks,
    projectMarkdown,
    repository: 'emilesilvis/sddobservatory.com',
  }), null);
});
