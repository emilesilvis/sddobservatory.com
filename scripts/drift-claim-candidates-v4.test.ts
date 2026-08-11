import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { compileClaimCandidates, compileClaimTaskItem } from './drift-claim-candidates-v4.ts';
import { ClaimStageSchema } from './run-drift-assessment-v4.ts';
import { validateStage } from './validate-drift-stage-v4.ts';

test('compiles source-preserving claim candidates without splitting a requirement row', () => {
  const content = [
    '# Requirements',
    '',
    '## Functional Requirements',
    '',
    '| ID | Requirement |',
    '| --- | --- |',
    '| FR-002 | The UI displays all tables and their columns. |',
    '',
    'The package must run in-process and must not open another port.',
  ].join('\n');

  const first = compileClaimCandidates({
    segment_id: 's0001-g0001',
    char_start: 0,
    content,
  });
  const second = compileClaimCandidates({
    segment_id: 's0001-g0001',
    char_start: 0,
    content,
  });

  assert.deepEqual(second, first);
  assert.deepEqual(first.map(({ candidate_id, statement, unit_kind, section_path }) => ({
    candidate_id,
    statement,
    unit_kind,
    section_path,
  })), [
    {
      candidate_id: 's0001-g0001/q0001',
      statement: '| FR-002 | The UI displays all tables and their columns. |',
      unit_kind: 'table_row',
      section_path: ['Requirements', 'Functional Requirements'],
    },
    {
      candidate_id: 's0001-g0001/q0002',
      statement: 'The package must run in-process and must not open another port.',
      unit_kind: 'paragraph',
      section_path: ['Requirements', 'Functional Requirements'],
    },
  ]);
  for (const candidate of first) {
    assert.equal(content.slice(candidate.char_start, candidate.char_end), candidate.statement);
    assert.match(candidate.statement_sha256, /^[0-9a-f]{64}$/);
  }
});

test('validates classifications against compiler-owned claim candidates', () => {
  const chunk = {
    protocol_version: '4.0',
    chunk_id: 'schematic-corpus-claims-0001',
    kind: 'corpus-claims',
    items: [{
      segment_id: 's0001-g0001',
      allowed_scope_anchor_names: ['Functional Requirements'],
      claim_candidates: [
        { candidate_id: 's0001-g0001/q0001' },
        { candidate_id: 's0001-g0001/q0002' },
      ],
    }],
  };
  const output = {
    protocol_version: '4.0',
    chunk_id: 'schematic-corpus-claims-0001',
    assessments: [{
      segment_id: 's0001-g0001',
      classifications: [
        {
          candidate_id: 's0001-g0001/q0001',
          disposition: 'claim',
          lifecycle: 'live',
          core_claim: false,
          scope_anchor_name: 'Functional Requirements',
        },
        {
          candidate_id: 's0001-g0001/q0002',
          disposition: 'not_claim',
          lifecycle: null,
          core_claim: false,
          scope_anchor_name: null,
        },
      ],
    }],
  };

  assert.deepEqual(validateStage(chunk, output), {
    valid: true,
    chunk_id: 'schematic-corpus-claims-0001',
    kind: 'corpus-claims',
    assessments: 1,
  });
});

test('builds a claim task item with source-valid scope anchors', () => {
  const segment = {
    segment_id: 's0001-g0001',
    source_id: 's0001',
    char_start: 0,
    content: 'The UI must remain usable.',
  };

  const item = compileClaimTaskItem(
    segment,
    { artifact_id: 'f0001', path: 'docs/requirements.md' },
    [
      { name: 'Requirements', source_ids: ['s0001'] },
      { name: 'Other component', source_ids: ['s0002'] },
    ],
  );

  assert.deepEqual({
    artifact_id: item.artifact_id,
    path: item.path,
    segment_id: item.segment_id,
    allowed_scope_anchor_names: item.allowed_scope_anchor_names,
    candidate_ids: item.claim_candidates.map((candidate) => candidate.candidate_id),
  }, {
    artifact_id: 'f0001',
    path: 'docs/requirements.md',
    segment_id: 's0001-g0001',
    allowed_scope_anchor_names: ['Requirements'],
    candidate_ids: ['s0001-g0001/q0001'],
  });
  assert.equal(item.evidence_segment, segment);
});

test('constrains structured model output to candidate classifications', () => {
  const classificationOutput = {
    protocol_version: '4.0',
    chunk_id: 'schematic-corpus-claims-0001',
    assessments: [{
      segment_id: 's0001-g0001',
      classifications: [{
        candidate_id: 's0001-g0001/q0001',
        disposition: 'claim',
        lifecycle: 'live',
        core_claim: false,
        scope_anchor_name: 'Functional Requirements',
      }],
    }],
  };

  assert.deepEqual(ClaimStageSchema.parse(classificationOutput), classificationOutput);
  assert.throws(() => ClaimStageSchema.parse({
    protocol_version: '4.0',
    chunk_id: 'schematic-corpus-claims-0001',
    assessments: [{
      segment_id: 's0001-g0001',
      claims: [{ claim_id: 'invented', statement: 'paraphrased' }],
    }],
  }));
});

test('replays the PR 63 split-versus-merge claim disagreement as one fixed candidate', () => {
  const fixture = JSON.parse(readFileSync(
    resolve(import.meta.dirname, 'fixtures/drift-v4-pr63-claim-disagreement.json'),
    'utf8',
  ));

  assert.equal(fixture.observed_outputs.run_1.length, 2);
  assert.equal(fixture.observed_outputs.run_2.length, 1);
  const candidates = compileClaimCandidates({
    segment_id: fixture.segment_id,
    char_start: 0,
    content: fixture.source_markdown,
  });
  assert.deepEqual(candidates.map(({ candidate_id, statement }) => ({ candidate_id, statement })), [{
    candidate_id: 's0001-g0001/q0001',
    statement: fixture.source_statement,
  }]);
});

test('keeps section paths dense when a source segment starts below heading level one', () => {
  const candidates = compileClaimCandidates({
    segment_id: 's0003-g0001',
    char_start: 0,
    content: '## Context\n\nAll existing TLS configuration must continue to work unchanged.',
  });

  assert.deepEqual(candidates[0].section_path, ['Context']);
});
