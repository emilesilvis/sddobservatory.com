import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { compareInstants, mechanicallyExcluded } from './build-drift-evidence-v3.ts';

const ROOT = resolve(import.meta.dirname, '..');
function readOption(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  assert(process.argv[index + 1], `${name} requires a value`);
  return resolve(process.cwd(), process.argv[index + 1]);
}

const PACKET_DIR = readOption('--packet-dir', resolve(ROOT, 'docs/research/drift-evidence-v3'));
const MAX_CORPUS_FILES = 512;
const MAX_CORPUS_BYTES = 2_000_000;
const MAX_CANDIDATES = 64;
const MAX_CHECKS = 64;
const MAX_SOURCES = 1024;
const MAX_PACKET_BYTES = 5_000_000;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => Buffer.from(a).compare(Buffer.from(b)))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalize(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function validatePacket(packet: any, file: string, order: number) {
  const label = `${file}:${packet?.identity?.slug ?? '?'}`;
  assert(packet.protocol_version === '3.0', `${label}: protocol version`);
  assert(packet.identity.order === order, `${label}: manifest order`);
  assert(packet.packet_id === `p03-${String(order).padStart(2, '0')}-${packet.identity.slug}`, `${label}: packet id`);
  assert(/^[0-9a-f]{40}$/.test(packet.identity.pin_sha), `${label}: pin sha`);
  assert(
    !Number.isNaN(Date.parse(packet.identity.pin_time_utc)) && /(?:Z|\+00:00)$/.test(packet.identity.pin_time_utc),
    `${label}: pin time`,
  );

  const expectedHash = packet.integrity.canonical_json_sha256;
  packet.integrity.canonical_json_sha256 = '0'.repeat(64);
  const actualHash = sha256(canonicalize(packet));
  packet.integrity.canonical_json_sha256 = expectedHash;
  assert(actualHash === expectedHash, `${label}: canonical hash mismatch`);

  const sources = new Map<string, any>();
  for (const source of packet.sources) {
    assert(!sources.has(source.source_id), `${label}: duplicate source ${source.source_id}`);
    assert(source.content_sha256 === sha256(source.content), `${label}: source hash ${source.source_id}`);
    assert(
      source.url === `https://github.com/${source.repository}/commit/${source.sha}` ||
        source.url.startsWith(`https://github.com/${source.repository}/blob/${source.sha}/`),
      `${label}: non-immutable source URL ${source.source_id}`,
    );
    sources.set(source.source_id, source);
  }
  const requireSources = (ids: string[], owner: string) => {
    for (const id of ids) assert(sources.has(id), `${label}: ${owner} references missing source ${id}`);
  };

  const artifacts = new Map<string, any>();
  let corpusBytes = 0;
  for (const fileEntry of packet.corpus.files) {
    assert(!artifacts.has(fileEntry.artifact_id), `${label}: duplicate artifact ${fileEntry.artifact_id}`);
    assert(fileEntry.url.startsWith(`https://github.com/${packet.identity.repository}/blob/${packet.identity.pin_sha}/`), `${label}: artifact URL`);
    if (fileEntry.source_id !== null) {
      requireSources([fileEntry.source_id], fileEntry.artifact_id);
      const source = sources.get(fileEntry.source_id);
      assert(source.kind === 'corpus_blob' && source.path === fileEntry.path, `${label}: artifact/source mismatch`);
      corpusBytes += Buffer.byteLength(source.content);
    }
    artifacts.set(fileEntry.artifact_id, fileEntry);
  }

  const anchors = new Set<string>();
  for (const anchor of packet.corpus.scope_anchors) {
    assert(!anchors.has(anchor.anchor_id), `${label}: duplicate anchor ${anchor.anchor_id}`);
    requireSources(anchor.source_ids, anchor.anchor_id);
    anchors.add(anchor.anchor_id);
  }
  for (const candidate of packet.window.substantive_update_candidates) {
    requireSources([candidate.normalized_delta_source_id], `history ${candidate.sha}`);
  }

  const commits = new Map<string, any>();
  for (const commit of packet.first_parent_commits_90d) {
    assert(!commits.has(commit.commit_id), `${label}: duplicate commit id ${commit.commit_id}`);
    assert(/^[0-9a-f]{40}$/.test(commit.sha), `${label}: bad commit sha ${commit.commit_id}`);
    requireSources(commit.diff_source_ids, commit.commit_id);
    commits.set(commit.commit_id, commit);
  }

  const dispositions = new Map<string, string>();
  for (const candidate of packet.material_behavior_candidates) {
    assert(commits.has(candidate.commit_id), `${label}: candidate missing commit ${candidate.commit_id}`);
    assert(!dispositions.has(candidate.commit_id), `${label}: duplicate disposition ${candidate.commit_id}`);
    for (const id of candidate.proposed_scope_anchor_ids) assert(anchors.has(id), `${label}: candidate missing anchor ${id}`);
    requireSources(candidate.diff_source_ids, candidate.candidate_id);
    requireSources(candidate.pinned_state_source_ids, candidate.candidate_id);
    dispositions.set(candidate.commit_id, 'candidate');
  }
  for (const exclusion of packet.excluded_commits) {
    assert(commits.has(exclusion.commit_id), `${label}: exclusion missing commit ${exclusion.commit_id}`);
    assert(!dispositions.has(exclusion.commit_id), `${label}: duplicate disposition ${exclusion.commit_id}`);
    requireSources(exclusion.source_ids, exclusion.commit_id);
    assert(
      ['before_comparison_start', 'dependency_only', 'docs_only', 'release_only', 'format_only', 'merge_only', 'reverted_pair', 'tests_only', 'internal_only'].includes(exclusion.code),
      `${label}: unknown exclusion code ${exclusion.code}`,
    );
    dispositions.set(exclusion.commit_id, 'excluded');
  }
  assert(dispositions.size === commits.size, `${label}: not every 90-day commit has one disposition`);

  const checks = new Set<string>();
  for (const check of packet.pinned_state_checks) {
    assert(!checks.has(check.check_id), `${label}: duplicate check ${check.check_id}`);
    for (const artifactId of check.artifact_ids) assert(artifacts.has(artifactId), `${label}: check missing artifact ${artifactId}`);
    requireSources(check.code_source_ids, check.check_id);
    requireSources(check.corpus_source_ids, check.check_id);
    checks.add(check.check_id);
  }

  const boundFailures: string[] = [];
  if (packet.corpus.files.length > MAX_CORPUS_FILES) boundFailures.push(`corpus_files>${MAX_CORPUS_FILES}`);
  if (corpusBytes > MAX_CORPUS_BYTES) boundFailures.push(`corpus_bytes>${MAX_CORPUS_BYTES}`);
  if (packet.material_behavior_candidates.length > MAX_CANDIDATES) boundFailures.push(`material_candidates>${MAX_CANDIDATES}`);
  if (packet.pinned_state_checks.length > MAX_CHECKS) boundFailures.push(`pinned_checks>${MAX_CHECKS}`);
  if (packet.sources.length > MAX_SOURCES) boundFailures.push(`sources>${MAX_SOURCES}`);
  const bytes = Buffer.byteLength(JSON.stringify(packet));
  if (bytes > MAX_PACKET_BYTES) boundFailures.push(`packet_bytes>${MAX_PACKET_BYTES}`);
  const preflightMatch = /^corpus_files>512 \(actual (\d+)\)$/.exec(packet.packet_failure ?? '');
  const bytePreflightMatch = /^corpus_bytes>2000000 \(actual (\d+)\)$/.exec(packet.packet_failure ?? '');
  const preflightOversize = Boolean(
    (preflightMatch && Number(preflightMatch[1]) > MAX_CORPUS_FILES) ||
      (bytePreflightMatch && Number(bytePreflightMatch[1]) > MAX_CORPUS_BYTES),
  );
  assert(packet.packet_status === (boundFailures.length || preflightOversize ? 'oversize' : 'valid'), `${label}: status disagrees with bounds`);
  assert(packet.integrity.bounds_valid === !(boundFailures.length || preflightOversize), `${label}: bounds integrity flag`);
  if (packet.packet_status === 'valid') {
    assert(packet.integrity.corpus_complete && packet.integrity.first_parent_membership_complete, `${label}: incomplete corpus/history`);
    assert(packet.integrity.material_candidates_complete && packet.integrity.pinned_state_checks_complete, `${label}: incomplete evidence`);
    assert(packet.integrity.neutral_summaries_valid && packet.integrity.cross_references_valid, `${label}: invalid summaries/references`);
  }
  return { slug: packet.identity.slug, status: packet.packet_status, hash: expectedHash, bytes, candidates: packet.material_behavior_candidates.length, commits: commits.size };
}

const index = JSON.parse(readFileSync(resolve(PACKET_DIR, 'index.json'), 'utf8'));
const files = readdirSync(PACKET_DIR).filter((file) => /^\d{2}-.+\.json$/.test(file)).sort();
assert(files.length === 22 && index.packets.length === 22, 'Packet set must contain exactly 22 packets');
const rows = files.map((file, position) => {
  const packet = JSON.parse(readFileSync(resolve(PACKET_DIR, file), 'utf8'));
  const row = validatePacket(packet, file, position + 1);
  const indexed = index.packets[position];
  assert(indexed.file === file && indexed.slug === row.slug && indexed.status === row.status && indexed.sha256 === row.hash, `${file}: index mismatch`);
  return row;
});
assert(new Set(rows.map((row) => row.slug)).size === 22, 'Packet slugs must be unique');
if (index.builder_version?.includes('source-only')) {
  assert(/^[0-9a-f]{64}$/.test(index.manifest_sha256), 'Source-only index must identify its manifest hash');
  assert(!Number.isNaN(Date.parse(index.snapshot_time_utc)), 'Source-only index must identify its snapshot time');
  for (const file of files) {
    const packet = JSON.parse(readFileSync(resolve(PACKET_DIR, file), 'utf8'));
    assert(packet.integrity.builder_version === index.builder_version, `${file}: builder version mismatch`);
    assert(packet.integrity.built_at_utc === index.snapshot_time_utc, `${file}: snapshot time mismatch`);
    const commits = new Map(packet.first_parent_commits_90d.map((commit: any) => [commit.commit_id, commit]));
    for (const candidate of packet.material_behavior_candidates) {
      const commit: any = commits.get(candidate.commit_id);
      assert(compareInstants(commit.time_utc, packet.window.comparison_start_utc) > 0, `${file}:${candidate.commit_id}: candidate predates comparison start`);
      assert(candidate.diff_source_ids.length === 1, `${file}:${candidate.commit_id}: candidate needs one source diff`);
      assert(mechanicallyExcluded(commit.changed_files) === null, `${file}:${candidate.commit_id}: mechanically excludable candidate`);
    }
    for (const exclusion of packet.excluded_commits) {
      const commit: any = commits.get(exclusion.commit_id);
      assert(exclusion.source_ids.length === 1, `${file}:${exclusion.commit_id}: exclusion needs one source diff`);
      if (exclusion.code === 'before_comparison_start') {
        assert(compareInstants(commit.time_utc, packet.window.comparison_start_utc) <= 0, `${file}:${exclusion.commit_id}: invalid before-start exclusion`);
      } else {
        assert(compareInstants(commit.time_utc, packet.window.comparison_start_utc) > 0, `${file}:${exclusion.commit_id}: post-start exclusion expected`);
        assert(mechanicallyExcluded(commit.changed_files) === exclusion.code, `${file}:${exclusion.commit_id}: source-only disposition mismatch`);
      }
    }
  }
}
console.log(JSON.stringify({ packets: rows.length, valid: rows.filter((row) => row.status === 'valid').length, oversize: rows.filter((row) => row.status !== 'valid').length, rows }, null, 2));
