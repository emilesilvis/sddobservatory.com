import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PACKET_DIR = resolve(ROOT, 'docs/research/drift-evidence-v3');
const input = process.argv[2];
const assessorProtocol = process.argv[3] ?? '3.0';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function exactKeys(value: Record<string, unknown>, expected: string[], label: string) {
  const actual = Object.keys(value).sort();
  assert(JSON.stringify(actual) === JSON.stringify([...expected].sort()), `${label}: keys ${actual.join(', ')}`);
}

function idsInOrder(actual: any[], expected: any[], key: string, label: string) {
  assert(
    JSON.stringify(actual.map((item) => item[key])) === JSON.stringify(expected.map((item) => item[key])),
    `${label}: ${key} coverage/order mismatch`,
  );
}

function expectedRating(packet: any, result: any): { rating: string; rule: string; adoption: { numerator: number; denominator: number; percentage: number | null } } {
  const integrityKeys = [
    'corpus_complete',
    'first_parent_membership_complete',
    'material_candidates_complete',
    'pinned_state_checks_complete',
    'neutral_summaries_valid',
    'cross_references_valid',
    'bounds_valid',
  ];
  if (packet.packet_status !== 'valid' || packet.integrity.tree_truncated !== false || integrityKeys.some((key) => packet.integrity[key] !== true)) {
    return { rating: 'unknown', rule: 'U1', adoption: { numerator: 0, denominator: 0, percentage: null } };
  }
  const candidates = new Map<string, any>(packet.material_behavior_candidates.map((candidate: any) => [candidate.candidate_id, candidate]));
  const commits = new Map<string, any>(packet.first_parent_commits_90d.map((commit: any) => [commit.commit_id, commit]));
  const inScope = result.candidate_assessments.filter((assessment: any) => assessment.scope === 'in_scope');
  const contradictedCore = [
    ...inScope.filter((assessment: any) => assessment.status === 'contradicted' && assessment.core_claim),
    ...result.pinned_state_assessments.filter((assessment: any) => assessment.status === 'contradicted' && assessment.core_claim),
  ];
  const driftCommitIds = new Set(
    inScope
      .filter((assessment: any) => ['omitted', 'contradicted'].includes(assessment.status))
      .map((assessment: any) => candidates.get(assessment.candidate_id)?.commit_id)
      .filter((commitId: string | undefined) => commitId && commits.get(commitId)?.after_comparison_start),
  );
  let rating: string;
  let rule: string;
  if (contradictedCore.length) [rating, rule] = ['high', 'H1'];
  else if (packet.window.spec_is_stale_90d && driftCommitIds.size >= 3) [rating, rule] = ['high', 'H2'];
  else if (
    inScope.some((assessment: any) => ['omitted', 'contradicted'].includes(assessment.status)) ||
    result.pinned_state_assessments.some((assessment: any) => ['omitted', 'contradicted'].includes(assessment.status))
  ) [rating, rule] = ['moderate', 'M1'];
  else if (
    inScope.some((assessment: any) => assessment.status === 'minor_gap') ||
    result.pinned_state_assessments.some((assessment: any) => assessment.status === 'minor_gap')
  ) [rating, rule] = ['low', 'L1'];
  else [rating, rule] = ['none', 'N1'];

  const denominatorIds = new Set(packet.material_behavior_candidates.map((candidate: any) => candidate.commit_id));
  const numeratorIds = new Set(inScope.map((assessment: any) => candidates.get(assessment.candidate_id)?.commit_id));
  const denominator = denominatorIds.size;
  const numerator = numeratorIds.size;
  return { rating, rule, adoption: { numerator, denominator, percentage: denominator ? Math.round((numerator / denominator) * 1000) / 10 : null } };
}

assert(input, 'Usage: tsx scripts/validate-drift-assessment-v3.ts <assessment.json>');
const outputPath = resolve(ROOT, input);
const results = JSON.parse(readFileSync(outputPath, 'utf8'));
const index = JSON.parse(readFileSync(resolve(PACKET_DIR, 'index.json'), 'utf8'));
assert(Array.isArray(results) && results.length === 22, 'Assessment must be a 22-object JSON array');

const summary: any[] = [];
for (const [position, indexed] of index.packets.entries()) {
  const packet = JSON.parse(readFileSync(resolve(PACKET_DIR, indexed.file), 'utf8'));
  const result = results[position];
  const label = `${input}:${indexed.slug}`;
  assert(result && typeof result === 'object' && !Array.isArray(result), `${label}: object required`);
  exactKeys(result, ['protocol_version', 'packet_id', 'artifact_lifecycle', 'candidate_assessments', 'pinned_state_assessments', 'drift_rating', 'rating_rule', 'rationale'], label);
  assert(result.protocol_version === assessorProtocol && result.packet_id === packet.packet_id, `${label}: identity mismatch`);
  assert(Array.isArray(result.artifact_lifecycle) && Array.isArray(result.candidate_assessments) && Array.isArray(result.pinned_state_assessments), `${label}: arrays required`);

  const integrityKeys = [
    'corpus_complete',
    'first_parent_membership_complete',
    'material_candidates_complete',
    'pinned_state_checks_complete',
    'neutral_summaries_valid',
    'cross_references_valid',
    'bounds_valid',
  ];
  const u1Packet = packet.packet_status !== 'valid' || packet.integrity.tree_truncated !== false || integrityKeys.some((key) => packet.integrity[key] !== true);
  const skipSemantic = assessorProtocol !== '3.0' && u1Packet;
  const expectedArtifacts = skipSemantic ? [] : packet.corpus.files.filter((artifact: any) => artifact.assess_lifecycle);
  idsInOrder(result.artifact_lifecycle, expectedArtifacts, 'artifact_id', `${label}: artifacts`);
  const sourceIds = new Set(packet.sources.map((source: any) => source.source_id));
  const anchorIds = new Set(packet.corpus.scope_anchors.map((anchor: any) => anchor.anchor_id));
  const requireSourceIds = (ids: string[], owner: string) => {
    assert(Array.isArray(ids), `${label}: ${owner} source IDs must be an array`);
    assert(new Set(ids).size === ids.length && ids.every((id) => sourceIds.has(id)), `${label}: ${owner} has unknown/duplicate source IDs`);
  };
  for (const lifecycle of result.artifact_lifecycle) {
    exactKeys(lifecycle, ['artifact_id', 'lifecycle', 'basis_source_ids'], `${label}:${lifecycle.artifact_id}`);
    assert(['live', 'future', 'historical'].includes(lifecycle.lifecycle), `${label}:${lifecycle.artifact_id}: lifecycle`);
    requireSourceIds(lifecycle.basis_source_ids, lifecycle.artifact_id);
    assert(lifecycle.basis_source_ids.length > 0, `${label}:${lifecycle.artifact_id}: lifecycle basis required`);
  }

  idsInOrder(result.candidate_assessments, skipSemantic ? [] : packet.material_behavior_candidates, 'candidate_id', `${label}: candidates`);
  for (const assessment of result.candidate_assessments) {
    exactKeys(assessment, ['candidate_id', 'scope', 'scope_anchor_ids', 'status', 'claim_source_ids', 'code_source_ids', 'core_claim'], `${label}:${assessment.candidate_id}`);
    assert(['in_scope', 'out_of_scope'].includes(assessment.scope), `${label}:${assessment.candidate_id}: scope`);
    assert(Array.isArray(assessment.scope_anchor_ids) && new Set(assessment.scope_anchor_ids).size === assessment.scope_anchor_ids.length, `${label}:${assessment.candidate_id}: anchor IDs`);
    assert(assessment.scope_anchor_ids.every((id: string) => anchorIds.has(id)), `${label}:${assessment.candidate_id}: unknown anchor`);
    requireSourceIds(assessment.claim_source_ids, assessment.candidate_id);
    requireSourceIds(assessment.code_source_ids, assessment.candidate_id);
    assert(typeof assessment.core_claim === 'boolean', `${label}:${assessment.candidate_id}: core_claim`);
    if (assessment.scope === 'out_of_scope') {
      assert(assessment.status === 'not_assessed' && assessment.scope_anchor_ids.length === 0, `${label}:${assessment.candidate_id}: out-of-scope fields`);
      assert(!assessment.claim_source_ids.length && !assessment.code_source_ids.length && !assessment.core_claim, `${label}:${assessment.candidate_id}: out-of-scope evidence`);
    } else {
      assert(['covered', 'omitted', 'contradicted', 'minor_gap'].includes(assessment.status), `${label}:${assessment.candidate_id}: status`);
      if (packet.corpus.scope === 'change-scoped') {
        assert(assessment.scope_anchor_ids.length > 0, `${label}:${assessment.candidate_id}: in-scope anchor required`);
      }
      assert(assessment.code_source_ids.length > 0, `${label}:${assessment.candidate_id}: code evidence required`);
      if (assessment.status !== 'omitted') assert(assessment.claim_source_ids.length > 0, `${label}:${assessment.candidate_id}: claim evidence required`);
      assert(!assessment.core_claim || assessment.status === 'contradicted', `${label}:${assessment.candidate_id}: illegal core claim`);
    }
  }

  idsInOrder(result.pinned_state_assessments, skipSemantic ? [] : packet.pinned_state_checks, 'check_id', `${label}: checks`);
  for (const assessment of result.pinned_state_assessments) {
    exactKeys(assessment, ['check_id', 'status', 'claim_source_ids', 'code_source_ids', 'core_claim'], `${label}:${assessment.check_id}`);
    assert(['covered', 'omitted', 'contradicted', 'minor_gap'].includes(assessment.status), `${label}:${assessment.check_id}: status`);
    requireSourceIds(assessment.claim_source_ids, assessment.check_id);
    requireSourceIds(assessment.code_source_ids, assessment.check_id);
    assert(assessment.code_source_ids.length > 0, `${label}:${assessment.check_id}: code evidence required`);
    if (assessment.status !== 'omitted') assert(assessment.claim_source_ids.length > 0, `${label}:${assessment.check_id}: claim evidence required`);
    assert(typeof assessment.core_claim === 'boolean' && (!assessment.core_claim || assessment.status === 'contradicted'), `${label}:${assessment.check_id}: illegal core claim`);
  }

  assert(typeof result.rationale === 'string' && !/https?:\/\/|\b[0-9a-f]{40}\b/i.test(result.rationale), `${label}: rationale contains raw evidence`);
  const expected = expectedRating(packet, result);
  assert(result.drift_rating === expected.rating && result.rating_rule === expected.rule, `${label}: expected ${expected.rating}/${expected.rule}, received ${result.drift_rating}/${result.rating_rule}`);
  summary.push({ slug: indexed.slug, rating: expected.rating, rule: expected.rule, adoption: expected.adoption });
}

console.log(JSON.stringify({ file: input, valid: true, projects: summary }, null, 2));
