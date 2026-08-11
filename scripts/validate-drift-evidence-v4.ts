import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { compareInstants, mechanicallyExcluded } from './build-drift-evidence-v3.ts';

const ROOT = resolve(import.meta.dirname, '..');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(value: string | Buffer): string {
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

function readOption(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  assert(process.argv[index + 1], `${name} requires a value`);
  return resolve(process.cwd(), process.argv[index + 1]);
}

function verifyHash(value: any, label: string): string {
  const expected = value.integrity?.canonical_json_sha256;
  assert(/^[0-9a-f]{64}$/.test(expected), `${label}: missing canonical hash`);
  value.integrity.canonical_json_sha256 = '0'.repeat(64);
  const actual = sha256(canonicalize(value));
  value.integrity.canonical_json_sha256 = expected;
  assert(actual === expected, `${label}: canonical hash mismatch`);
  return expected;
}

const packetDir = readOption('--packet-dir', resolve(ROOT, 'docs/research/drift-evidence-v4'));
const index = JSON.parse(readFileSync(resolve(packetDir, 'index.json'), 'utf8'));
assert(index.protocol_version === '4.0' && index.builder_version === '4.0.0-chunked', 'Invalid v4 index');
verifyHash(index, 'index');
assert(index.projects.length > 0, 'V4 index must contain at least one project');
assert(new Set(index.projects.map((project: any) => project.slug)).size === index.projects.length, 'V4 index has duplicate projects');

const expectedFiles = new Set(['index.json']);
const summary: any[] = [];

for (const indexed of index.projects) {
  expectedFiles.add(indexed.file);
  const project = JSON.parse(readFileSync(resolve(packetDir, indexed.file), 'utf8'));
  assert(project.protocol_version === '4.0' && project.identity.slug === indexed.slug, `${indexed.slug}: project identity`);
  assert(verifyHash(project, indexed.file) === indexed.sha256, `${indexed.slug}: indexed project hash`);
  const segments = new Map<string, any>();
  const segmentsBySource = new Map<string, any[]>();
  const referencedSegments = new Set<string>();
  const artifacts = new Map<string, any>();
  const claimSegments = new Set<string>();
  const candidates = new Map<string, any>();
  const exclusions = new Map<string, any>();
  let historyCount = 0;
  let checkCount = 0;

  for (const chunkRef of project.chunks) {
    expectedFiles.add(chunkRef.file);
    const encoded = readFileSync(resolve(packetDir, chunkRef.file), 'utf8');
    const chunk = JSON.parse(encoded);
    assert(Buffer.byteLength(encoded) === chunkRef.bytes && chunkRef.bytes <= index.max_chunk_bytes, `${chunkRef.chunk_id}: byte bound`);
    assert(chunk.protocol_version === '4.0' && chunk.project_slug === indexed.slug, `${chunkRef.chunk_id}: identity`);
    assert(chunk.chunk_id === chunkRef.chunk_id && chunk.kind === chunkRef.kind, `${chunkRef.chunk_id}: reference mismatch`);
    assert(chunk.items.length === chunkRef.item_count, `${chunkRef.chunk_id}: item count`);
    assert(verifyHash(chunk, chunkRef.file) === chunkRef.sha256, `${chunkRef.chunk_id}: indexed hash`);

    if (chunk.kind === 'sources') {
      assert(chunk.items.length <= 32 && chunk.assessment_contract === null, `${chunkRef.chunk_id}: source chunk contract`);
      for (const segment of chunk.items) {
        assert(!segments.has(segment.segment_id), `${indexed.slug}: duplicate segment ${segment.segment_id}`);
        assert(segment.content_sha256 === sha256(segment.content), `${segment.segment_id}: content hash`);
        assert(segment.char_end - segment.char_start === segment.content.length, `${segment.segment_id}: character range`);
        segments.set(segment.segment_id, segment);
        segmentsBySource.set(segment.source_id, [...(segmentsBySource.get(segment.source_id) ?? []), segment]);
      }
    } else if (chunk.kind === 'corpus-inventory') {
      assert(chunk.items.length <= 64 && chunk.assessment_contract === null, `${chunkRef.chunk_id}: corpus inventory contract`);
      for (const artifact of chunk.items) {
        assert(!artifacts.has(artifact.artifact_id), `${indexed.slug}: duplicate artifact ${artifact.artifact_id}`);
        if (artifact.archive_suppressed) {
          assert(artifact.lifecycle_preclassified === 'historical' && artifact.source_segment_ids.length === 0, `${artifact.artifact_id}: archive rule`);
        }
        artifact.source_segment_ids.forEach((id: string) => referencedSegments.add(id));
        artifacts.set(artifact.artifact_id, artifact);
      }
    } else if (chunk.kind === 'corpus-claims') {
      assert(chunk.items.length <= 8 && chunk.assessment_contract?.coverage, `${chunkRef.chunk_id}: corpus-claim contract`);
      for (const item of chunk.items) {
        assert(item.segment_id === item.evidence_segment.segment_id, `${chunkRef.chunk_id}: claim evidence mismatch`);
        assert(!claimSegments.has(item.segment_id), `${indexed.slug}: duplicate claim segment ${item.segment_id}`);
        assert(item.evidence_segment.content_sha256 === sha256(item.evidence_segment.content), `${item.segment_id}: inline claim evidence hash`);
        claimSegments.add(item.segment_id);
        referencedSegments.add(item.segment_id);
      }
    } else if (chunk.kind === 'materiality') {
      assert(chunk.items.length <= 8 && chunk.assessment_contract?.output, `${chunkRef.chunk_id}: materiality contract`);
      for (const item of chunk.items) {
        assert(!candidates.has(item.candidate_id), `${indexed.slug}: duplicate candidate ${item.candidate_id}`);
        assert(compareInstants(item.commit.time_utc, project.window.comparison_start_utc) > 0, `${item.candidate_id}: comparison window`);
        assert(mechanicallyExcluded(item.commit.changed_files) === null, `${item.candidate_id}: mechanically excludable`);
        assert(JSON.stringify(item.evidence_segments.map((segment: any) => segment.segment_id)) === JSON.stringify(item.source_segment_ids), `${item.candidate_id}: inline evidence coverage`);
        item.evidence_segments.forEach((segment: any) => assert(segment.content_sha256 === sha256(segment.content), `${segment.segment_id}: inline materiality evidence hash`));
        item.source_segment_ids.forEach((id: string) => referencedSegments.add(id));
        candidates.set(item.candidate_id, item);
      }
    } else if (chunk.kind === 'exclusions') {
      assert(chunk.items.length <= 32 && chunk.assessment_contract === null, `${chunkRef.chunk_id}: exclusion contract`);
      for (const item of chunk.items) {
        const commitId = item.exclusion.commit_id;
        assert(!exclusions.has(commitId), `${indexed.slug}: duplicate exclusion ${commitId}`);
        const afterStart = compareInstants(item.commit.time_utc, project.window.comparison_start_utc) > 0;
        const expectedCode = afterStart ? mechanicallyExcluded(item.commit.changed_files) : 'before_comparison_start';
        assert(item.exclusion.code === expectedCode, `${commitId}: exclusion disposition`);
        item.source_segment_ids.forEach((id: string) => referencedSegments.add(id));
        exclusions.set(commitId, item);
      }
    } else if (chunk.kind === 'window-history') {
      assert(chunk.items.length <= 32, `${chunkRef.chunk_id}: history count`);
      historyCount += chunk.items.length;
      chunk.items.flatMap((item: any) => item.source_segment_ids).forEach((id: string) => referencedSegments.add(id));
    } else if (chunk.kind === 'pinned-checks') {
      assert(chunk.items.length <= 16 && chunk.assessment_contract?.output, `${chunkRef.chunk_id}: check contract`);
      checkCount += chunk.items.length;
      for (const item of chunk.items) {
        assert(JSON.stringify(item.evidence_segments.map((segment: any) => segment.segment_id)) === JSON.stringify(item.source_segment_ids), `${item.check.check_id}: inline evidence coverage`);
      }
      chunk.items.flatMap((item: any) => item.source_segment_ids).forEach((id: string) => referencedSegments.add(id));
    } else {
      throw new Error(`${chunkRef.chunk_id}: unknown chunk kind ${chunk.kind}`);
    }
  }

  for (const [sourceId, sourceSegments] of segmentsBySource) {
    sourceSegments.sort((left, right) => left.segment_index - right.segment_index);
    assert(sourceSegments.every((segment, index) => segment.segment_index === index + 1 && segment.segment_count === sourceSegments.length), `${sourceId}: segment order/count`);
    assert(sourceSegments.every((segment, index) => index === 0 || segment.char_start === sourceSegments[index - 1].char_end), `${sourceId}: segment continuity`);
    const content = sourceSegments.map((segment) => segment.content).join('');
    assert(sha256(content) === sourceSegments[0].source.original_content_sha256, `${sourceId}: reconstructed source hash`);
  }
  for (const segmentId of referencedSegments) assert(segments.has(segmentId), `${indexed.slug}: missing segment ${segmentId}`);
  assert(referencedSegments.size === segments.size, `${indexed.slug}: unreferenced source segments`);
  assert(artifacts.size === project.counts.corpus_artifacts, `${indexed.slug}: artifact completeness`);
  const expectedClaimSegments = new Set(
    [...artifacts.values()].flatMap((artifact: any) => artifact.source_segment_ids),
  );
  assert(claimSegments.size === project.counts.corpus_claim_segments && claimSegments.size === expectedClaimSegments.size, `${indexed.slug}: corpus-claim segment completeness`);
  for (const segmentId of claimSegments) assert(expectedClaimSegments.has(segmentId), `${indexed.slug}: unexpected claim segment ${segmentId}`);
  assert([...artifacts.values()].filter((item) => item.archive_suppressed).length === project.counts.historical_archive_artifacts, `${indexed.slug}: archive count`);
  assert(segments.size === project.counts.source_segments && segmentsBySource.size === project.counts.source_records, `${indexed.slug}: source completeness`);
  assert(candidates.size === project.counts.raw_candidates && exclusions.size === project.counts.exclusions, `${indexed.slug}: disposition counts`);
  assert(candidates.size + exclusions.size === project.counts.first_parent_commits_90d, `${indexed.slug}: commit disposition completeness`);
  assert(historyCount === project.counts.window_history, `${indexed.slug}: window-history completeness`);
  assert(checkCount === project.counts.pinned_checks, `${indexed.slug}: pinned-check completeness`);
  summary.push({ slug: indexed.slug, chunks: project.chunks.length, artifacts: artifacts.size, archives: project.counts.historical_archive_artifacts, candidates: candidates.size, exclusions: exclusions.size, segments: segments.size });
}

const actualFiles = new Set(readdirSync(packetDir).filter((file) => file.endsWith('.json')));
assert(actualFiles.size === expectedFiles.size && [...actualFiles].every((file) => expectedFiles.has(file)), 'V4 directory has missing or stale JSON files');
console.log(JSON.stringify({ valid: true, projects: summary.length, chunks: summary.reduce((sum, row) => sum + row.chunks, 0), rows: summary }, null, 2));
