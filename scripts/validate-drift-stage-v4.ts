import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function exactKeys(value: Record<string, unknown>, expected: string[], label: string) {
  const actual = Object.keys(value).sort();
  assert(JSON.stringify(actual) === JSON.stringify([...expected].sort()), `${label}: keys ${actual.join(', ')}`);
}

function idsInOrder(actual: any[], expected: any[], key: string, label: string) {
  assert(JSON.stringify(actual.map((item) => item[key])) === JSON.stringify(expected.map((item) => item[key])), `${label}: ${key} coverage/order`);
}

function validateCorpusClaims(chunk: any, output: any) {
  idsInOrder(output.assessments, chunk.items, 'segment_id', chunk.chunk_id);
  for (const assessment of output.assessments) {
    exactKeys(assessment, ['segment_id', 'claims'], `${chunk.chunk_id}:${assessment.segment_id}`);
    assert(Array.isArray(assessment.claims), `${assessment.segment_id}: claims array`);
    const claimIds = new Set<string>();
    for (const [position, claim] of assessment.claims.entries()) {
      exactKeys(claim, ['claim_id', 'statement', 'lifecycle', 'core_claim', 'scope_anchor_name'], `${assessment.segment_id}:claim`);
      assert(claim.claim_id === `${assessment.segment_id}/c${String(position + 1).padStart(2, '0')}`, `${claim.claim_id}: claim ID/order`);
      assert(!claimIds.has(claim.claim_id), `${claim.claim_id}: duplicate`);
      assert(typeof claim.statement === 'string' && claim.statement.trim().length > 0, `${claim.claim_id}: statement`);
      assert(['live', 'future', 'historical'].includes(claim.lifecycle), `${claim.claim_id}: lifecycle`);
      assert(typeof claim.core_claim === 'boolean', `${claim.claim_id}: core_claim`);
      assert(claim.scope_anchor_name === null || (typeof claim.scope_anchor_name === 'string' && claim.scope_anchor_name.trim().length > 0), `${claim.claim_id}: scope anchor`);
      claimIds.add(claim.claim_id);
    }
  }
}

function validateMateriality(chunk: any, output: any) {
  idsInOrder(output.assessments, chunk.items, 'candidate_id', chunk.chunk_id);
  const items = new Map(chunk.items.map((item: any) => [item.candidate_id, item]));
  for (const assessment of output.assessments) {
    exactKeys(assessment, ['candidate_id', 'materiality', 'reason', 'behaviors'], `${chunk.chunk_id}:${assessment.candidate_id}`);
    assert(['material', 'non_material'].includes(assessment.materiality), `${assessment.candidate_id}: materiality`);
    assert(typeof assessment.reason === 'string' && assessment.reason.trim().length > 0, `${assessment.candidate_id}: reason`);
    assert(Array.isArray(assessment.behaviors), `${assessment.candidate_id}: behaviors`);
    assert(assessment.materiality === 'material' ? assessment.behaviors.length > 0 : assessment.behaviors.length === 0, `${assessment.candidate_id}: materiality/behavior mismatch`);
    const allowedPaths = new Set((items.get(assessment.candidate_id) as any).candidate.affected_paths);
    for (const [position, behavior] of assessment.behaviors.entries()) {
      exactKeys(behavior, ['behavior_id', 'behavior', 'affected_paths'], `${assessment.candidate_id}:behavior`);
      assert(behavior.behavior_id === `${assessment.candidate_id}/b${String(position + 1).padStart(2, '0')}`, `${behavior.behavior_id}: behavior ID/order`);
      assert(typeof behavior.behavior === 'string' && behavior.behavior.trim().length > 0, `${behavior.behavior_id}: behavior text`);
      assert(Array.isArray(behavior.affected_paths) && behavior.affected_paths.length > 0, `${behavior.behavior_id}: affected paths`);
      assert(new Set(behavior.affected_paths).size === behavior.affected_paths.length && behavior.affected_paths.every((path: string) => allowedPaths.has(path)), `${behavior.behavior_id}: unknown/duplicate path`);
    }
  }
}

function validatePinnedChecks(chunk: any, output: any) {
  const expected = chunk.items.map((item: any) => ({ check_id: item.check.check_id }));
  idsInOrder(output.assessments, expected, 'check_id', chunk.chunk_id);
  const items = new Map(chunk.items.map((item: any) => [item.check.check_id, item]));
  for (const assessment of output.assessments) {
    exactKeys(assessment, ['check_id', 'status', 'claim_segment_ids', 'code_segment_ids', 'core_claim'], `${chunk.chunk_id}:${assessment.check_id}`);
    assert(['covered', 'omitted', 'contradicted', 'minor_gap'].includes(assessment.status), `${assessment.check_id}: status`);
    const allowed = new Set((items.get(assessment.check_id) as any).source_segment_ids);
    for (const ids of [assessment.claim_segment_ids, assessment.code_segment_ids]) {
      assert(Array.isArray(ids) && new Set(ids).size === ids.length && ids.every((id: string) => allowed.has(id)), `${assessment.check_id}: evidence IDs`);
    }
    assert(typeof assessment.core_claim === 'boolean' && (!assessment.core_claim || assessment.status === 'contradicted'), `${assessment.check_id}: core claim`);
  }
}

export function validateStage(chunk: any, output: any) {
  assert(chunk.protocol_version === '4.0', 'Chunk protocol must be 4.0');
  exactKeys(output, ['protocol_version', 'chunk_id', 'assessments'], 'output');
  assert(output.protocol_version === '4.0' && output.chunk_id === chunk.chunk_id, 'Output identity mismatch');
  assert(Array.isArray(output.assessments), 'Output assessments must be an array');
  const serialized = JSON.stringify(output);
  assert(!/https?:\/\/|\b[0-9a-f]{40}\b/i.test(serialized), 'Output must reference evidence by existing IDs, not raw URLs or SHAs');
  if (chunk.kind === 'corpus-claims') validateCorpusClaims(chunk, output);
  else if (chunk.kind === 'materiality') validateMateriality(chunk, output);
  else if (chunk.kind === 'pinned-checks') validatePinnedChecks(chunk, output);
  else throw new Error(`Unsupported semantic chunk kind: ${chunk.kind}`);
  return { valid: true, chunk_id: chunk.chunk_id, kind: chunk.kind, assessments: output.assessments.length };
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) {
  const [chunkPath, outputPath] = process.argv.slice(2);
  assert(chunkPath && outputPath, 'Usage: tsx scripts/validate-drift-stage-v4.ts <chunk.json> <output.json>');
  const chunk = JSON.parse(readFileSync(resolve(process.cwd(), chunkPath), 'utf8'));
  const output = JSON.parse(readFileSync(resolve(process.cwd(), outputPath), 'utf8'));
  console.log(JSON.stringify(validateStage(chunk, output), null, 2));
}
