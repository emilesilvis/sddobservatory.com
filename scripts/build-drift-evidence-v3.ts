import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

type Scope = 'canonical' | 'change-scoped';

type ManifestRow = {
  slug: string;
  repository: string;
  pin_sha: string;
  pin_time_utc: string;
  scope: Scope;
  entry_points: string[];
};

type Manifest = {
  schema_version: '1';
  snapshot_time_utc: string;
  projects: ManifestRow[];
};

type Source = {
  source_id: string;
  kind: 'corpus_blob' | 'code_blob' | 'diff' | 'normalized_delta' | 'commit_metadata';
  repository: string;
  sha: string;
  path: string | null;
  line_start: number;
  line_end: number;
  content: string;
  content_sha256: string;
  url: string;
};

export type ChangedFile = {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  before_blob: string | null;
  after_blob: string | null;
  additions: number;
  deletions: number;
};

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_MANIFEST_PATH = resolve(ROOT, 'docs/research/drift-projects-v3.json');
const DEFAULT_OUTPUT_DIR = resolve(ROOT, 'docs/research/drift-evidence-prospective-v1');
const CACHE_DIR = resolve(tmpdir(), 'sdd-observatory-drift-v3-cache');
const BUILDER_VERSION = '3.1.0-source-only';
const MAX_CORPUS_FILES = 512;
const MAX_CORPUS_BYTES = 2_000_000;
const MAX_CANDIDATES = 64;
const MAX_CHECKS = 64;
const MAX_SOURCES = 1024;
const MAX_PACKET_BYTES = 5_000_000;

const PINNED_CHECKS: Record<
  string,
  Array<{ question: string; artifact_path: string; code_path: string; artifact_needles: string[]; code_needles: string[] }>
> = {
  schematic: [
    {
      question:
        'Do the live non-PostgreSQL ER-diagram statements agree with each other and with the pinned generic INFORMATION_SCHEMA implementation?',
      artifact_path: 'docs/requirements.md',
      code_path: 'src/main/java/com/bjoernkw/schematic/TablesController.java',
      artifact_needles: ['FR-011', 'C-006'],
      code_needles: ['INFORMATION_SCHEMA', 'driverClassName'],
    },
  ],
  'spirit-of-kiro': [
    {
      question: 'Does the live image-generation provider claim match the provider selected by pinned code?',
      artifact_path: '.kiro/steering/product.md',
      code_path: 'item-images/lib/item-image.ts',
      artifact_needles: ['Nova Canvas'],
      code_needles: ['stability', 'Stable Image'],
    },
  ],
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export function compareInstants(left: string, right: string): number {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  assert(!Number.isNaN(leftTime) && !Number.isNaN(rightTime), `Cannot compare invalid timestamps: ${left}, ${right}`);
  return leftTime - rightTime;
}

function runText(command: string, args: string[], cwd?: string): string {
  return execFileSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function runBuffer(command: string, args: string[], cwd?: string): Buffer {
  return execFileSync(command, args, { cwd, encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 });
}

function git(repoDir: string, args: string[]): string {
  return runText('git', ['--git-dir', repoDir, ...args]);
}

function gitBuffer(repoDir: string, args: string[]): Buffer {
  return runBuffer('git', ['--git-dir', repoDir, ...args]);
}

function gitBlobsBatch(repoDir: string, objectIds: string[]): Map<string, Buffer> {
  const uniqueIds = [...new Set(objectIds)];
  if (!uniqueIds.length) return new Map();
  const output = execFileSync('git', ['--git-dir', repoDir, 'cat-file', '--batch'], {
    input: Buffer.from(`${uniqueIds.join('\n')}\n`),
    maxBuffer: 512 * 1024 * 1024,
  });
  const blobs = new Map<string, Buffer>();
  let offset = 0;
  for (const expectedId of uniqueIds) {
    const headerEnd = output.indexOf(10, offset);
    assert(headerEnd >= 0, `${expectedId}: missing batch blob header`);
    const header = output.subarray(offset, headerEnd).toString('utf8');
    const match = header.match(/^([0-9a-f]{40}) blob (\d+)$/);
    assert(match && match[1] === expectedId, `${expectedId}: invalid batch blob header ${header}`);
    const size = Number(match[2]);
    const contentStart = headerEnd + 1;
    const contentEnd = contentStart + size;
    assert(output[contentEnd] === 10, `${expectedId}: invalid batch blob terminator`);
    blobs.set(expectedId, output.subarray(contentStart, contentEnd));
    offset = contentEnd + 1;
  }
  assert(offset === output.length, 'Unexpected trailing batch blob bytes');
  return blobs;
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

function validateManifest(manifest: Manifest): ManifestRow[] {
  assert(manifest.schema_version === '1', 'Manifest schema_version must be 1');
  assert(!Number.isNaN(Date.parse(manifest.snapshot_time_utc)), 'Manifest snapshot_time_utc must be an ISO timestamp');
  const rows = manifest.projects;
  assert(rows.length === 22 && new Set(rows.map((row) => row.slug)).size === 22, 'Frozen manifest must have 22 rows');
  for (const row of rows) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug), `${row.slug}: invalid slug`);
    assert(/^[^/]+\/[^/]+$/.test(row.repository), `${row.slug}: invalid repository`);
    assert(/^[0-9a-f]{40}$/.test(row.pin_sha), `${row.slug}: invalid pin SHA`);
    assert(!Number.isNaN(Date.parse(row.pin_time_utc)), `${row.slug}: invalid pin time`);
    assert(['canonical', 'change-scoped'].includes(row.scope), `${row.slug}: invalid scope`);
    assert(row.entry_points.length > 0 && new Set(row.entry_points).size === row.entry_points.length, `${row.slug}: invalid entry points`);
  }
  return rows;
}

function ensureRepository(row: ManifestRow): string {
  mkdirSync(CACHE_DIR, { recursive: true });
  const repoDir = join(CACHE_DIR, `${row.slug}.git`);
  if (!existsSync(join(repoDir, 'HEAD'))) {
    mkdirSync(repoDir, { recursive: true });
    runText('git', ['init', '--bare', '-q', repoDir]);
    git(repoDir, ['remote', 'add', 'origin', `https://github.com/${row.repository}.git`]);
  }
  git(repoDir, ['remote', 'set-url', 'origin', `https://github.com/${row.repository}.git`]);
  git(repoDir, ['-c', 'protocol.version=2', 'fetch', '--force', '--filter=blob:none', '--no-tags', 'origin', row.pin_sha]);
  assert(git(repoDir, ['rev-parse', row.pin_sha]).trim() === row.pin_sha, `${row.slug}: pin fetch mismatch`);
  return repoDir;
}

function isArchivePath(path: string): boolean {
  return /(^|\/)(archive|archives)(\/|$)/i.test(path);
}

function parseTree(repoDir: string, pin: string, entryPoints: string[], suppressArchiveContent = false) {
  const output = gitBuffer(repoDir, ['ls-tree', '-r', '-z', pin, '--', ...entryPoints]);
  const rows = output
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+blob\s+([0-9a-f]{40})\t([\s\S]+)$/);
      assert(match, `Unparseable tree row: ${line}`);
      return { mode: match[1], blob: match[2], size: 0, path: match[3] };
    })
    .sort((a, b) => Buffer.from(a.path).compare(Buffer.from(b.path)));
  const sizedRows = suppressArchiveContent ? [] : rows;
  if (sizedRows.length) {
    const output = execFileSync('git', ['--git-dir', repoDir, 'cat-file', '--batch-check=%(objectname) %(objectsize)'], {
      input: `${sizedRows.map((row) => row.blob).join('\n')}\n`,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
    const sizes = new Map(output.split('\n').filter(Boolean).map((line) => {
      const [oid, size] = line.split(' ');
      return [oid, Number(size)];
    }));
    for (const row of sizedRows) {
      assert(Number.isSafeInteger(sizes.get(row.blob)), `${row.path}: missing blob size`);
      row.size = sizes.get(row.blob)!;
    }
  }
  return rows;
}

function decodeText(buffer: Buffer): string | null {
  if (buffer.includes(0)) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return null;
  }
}

function lastPathChange(repoDir: string, pin: string, path: string): { sha: string; time: string } {
  const output = git(repoDir, ['log', '-1', '--format=%H%x09%cI', pin, '--', path]).trim();
  const [sha, time] = output.split('\t');
  assert(/^[0-9a-f]{40}$/.test(sha) && Boolean(time), `${path}: missing last-change metadata`);
  return { sha, time };
}

function lastPathChangesBatch(
  repoDir: string,
  pin: string,
  entryPoints: string[],
  paths: string[],
): Map<string, { sha: string; time: string }> {
  const wanted = new Set(paths);
  const found = new Map<string, { sha: string; time: string }>();
  const output = git(repoDir, ['log', '--format=%x1e%H%x09%cI', '--name-only', pin, '--', ...entryPoints]);
  for (const record of output.split('\x1e').filter(Boolean)) {
    const [header, ...changedPaths] = record.replace(/^\n+/, '').split('\n');
    const [sha, time] = header.split('\t');
    assert(/^[0-9a-f]{40}$/.test(sha) && Boolean(time), `Unparseable path-history record: ${header}`);
    for (const path of changedPaths.filter(Boolean)) {
      if (wanted.has(path) && !found.has(path)) found.set(path, { sha, time });
    }
    if (found.size === wanted.size) break;
  }
  for (const path of wanted) {
    if (!found.has(path)) found.set(path, lastPathChange(repoDir, pin, path));
  }
  return found;
}

function excerpt(content: string, needles: string[], radius = 3): { content: string; lineStart: number; lineEnd: number } {
  const lines = content.split('\n');
  const matches = lines
    .map((line, index) => (needles.some((needle) => line.toLowerCase().includes(needle.toLowerCase())) ? index : -1))
    .filter((index) => index >= 0);
  if (!matches.length) return { content: lines.slice(0, 40).join('\n'), lineStart: 1, lineEnd: Math.min(40, lines.length) };
  const start = Math.max(0, Math.min(...matches) - radius);
  const end = Math.min(lines.length, Math.max(...matches) + radius + 1);
  return { content: lines.slice(start, end).join('\n'), lineStart: start + 1, lineEnd: end };
}

function parseChangedFiles(output: string): ChangedFile[] {
  const raw = new Map<string, { status: ChangedFile['status']; before: string | null; after: string | null }>();
  const counts = new Map<string, { additions: number; deletions: number }>();
  for (const line of output.split('\n').filter(Boolean)) {
    if (line.startsWith(':')) {
      const match = line.match(/^:\d+\s+\d+\s+([0-9a-f]{40})\s+([0-9a-f]{40})\s+([A-Z])\d*\t(.+)$/);
      if (!match) continue;
      const status = ({ A: 'added', M: 'modified', D: 'deleted', R: 'renamed', C: 'added' } as const)[match[3]] ?? 'modified';
      raw.set(match[4].split('\t').at(-1)!, {
        status,
        before: /^0+$/.test(match[1]) ? null : match[1],
        after: /^0+$/.test(match[2]) ? null : match[2],
      });
    } else {
      const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
      if (match) counts.set(match[3].split('\t').at(-1)!, { additions: Number(match[1]) || 0, deletions: Number(match[2]) || 0 });
    }
  }
  return [...raw.entries()]
    .map(([path, value]) => ({ path, status: value.status, before_blob: value.before, after_blob: value.after, ...(counts.get(path) ?? { additions: 0, deletions: 0 }) }))
    .sort((a, b) => Buffer.from(a.path).compare(Buffer.from(b.path)));
}

function changedFiles(repoDir: string, sha: string): ChangedFile[] {
  return parseChangedFiles(git(repoDir, ['diff-tree', '--root', '-r', '--raw', '--numstat', '--format=', sha]));
}

function changedFilesBatch(repoDir: string, shas: string[]): Map<string, ChangedFile[]> {
  if (!shas.length) return new Map();
  const output = execFileSync(
    'git',
    ['--git-dir', repoDir, 'diff-tree', '--stdin', '--root', '-r', '--raw', '--numstat', '--format=%x1e%H'],
    { input: `${shas.join('\n')}\n`, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  const result = new Map<string, ChangedFile[]>();
  for (const record of output.split('\x1e').filter(Boolean)) {
    const [sha, ...body] = record.replace(/^\n+/, '').split('\n');
    assert(/^[0-9a-f]{40}$/.test(sha), `Unparseable batched diff record: ${sha}`);
    result.set(sha, parseChangedFiles(body.join('\n')));
  }
  for (const sha of shas) {
    if (!result.has(sha)) result.set(sha, []);
  }
  return result;
}

function normalizedDelta(diff: string): string {
  return diff
    .split('\n')
    .filter((line) => /^[+-](?![+-])/.test(line))
    .map((line) => line.replace(/\]\([^)]*\)/g, ']').replace(/^[+-]\s*/, '').replace(/[#>*_`~\[\](){}|]/g, ' ').replace(/\b(?:v?\d+(?:[.:-]\d+)+|\d{4}-\d{2}-\d{2})\b/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((line) => (line.match(/[\p{L}\p{N}]/gu) ?? []).length >= 3)
    .join('\n');
}

function commitLog(repoDir: string, pin: string) {
  const format = '%H%x09%cI%x09%P%x09%s';
  return git(repoDir, ['log', '--first-parent', `--format=${format}`, pin])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, time, parents, ...message] = line.split('\t');
      return { sha, time, parents: parents ? parents.split(' ') : [], message: message.join('\t') };
    });
}

export function mechanicallyExcluded(files: ChangedFile[]): string | null {
  const paths = files.map((file) => file.path.toLowerCase());
  if (!files.length) return 'merge_only';
  if (paths.every((path) => /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.sum|cargo\.lock|poetry\.lock)$/.test(path))) return 'dependency_only';
  if (paths.every((path) => /(^|\/)(docs?|examples?)(\/|$)/.test(path) || /(^|\/)(readme|changelog)(\.|$)/.test(path))) return 'docs_only';
  if (paths.every((path) => /(^|\/)(tests?|__tests__|fixtures?)\//.test(path) || /(?:test|spec)\.[^.]+$/.test(path))) return 'tests_only';
  if (paths.every((path) => /(^|\/)(\.github|\.circleci|\.buildkite|\.gitlab)(\/|$)/.test(path))) return 'internal_only';
  return null;
}

function buildPacket(row: ManifestRow, order: number, builtAtUtc: string, unbounded: boolean) {
  const repoDir = ensureRepository(row);
  const repoMeta = JSON.parse(runText('gh', ['api', `repos/${row.repository}`]));
  assert(repoMeta.full_name === row.repository, `${row.slug}: canonical repository mismatch`);
  const pinMeta = JSON.parse(runText('gh', ['api', `repos/${row.repository}/commits/${row.pin_sha}`]));
  assert(pinMeta.sha === row.pin_sha && pinMeta.commit.committer.date === row.pin_time_utc, `${row.slug}: pin metadata mismatch`);
  const treeTruncated = runText('gh', ['api', `repos/${row.repository}/git/trees/${row.pin_sha}?recursive=1`, '--jq', '.truncated']).trim() === 'true';

  const windowFloor = new Date(new Date(row.pin_time_utc).getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const tree = parseTree(repoDir, row.pin_sha, row.entry_points, unbounded);
  if (!unbounded && tree.length > MAX_CORPUS_FILES) {
    const packet: any = {
      protocol_version: '3.0',
      packet_id: `p03-${String(order).padStart(2, '0')}-${row.slug}`,
      packet_status: 'oversize',
      packet_failure: `corpus_files>${MAX_CORPUS_FILES} (actual ${tree.length})`,
      identity: {
        order,
        slug: row.slug,
        repository: row.repository,
        pin_sha: row.pin_sha,
        pin_time_utc: row.pin_time_utc,
        repository_api_url: repoMeta.url,
        pin_api_url: pinMeta.url,
        pin_html_url: `https://github.com/${row.repository}/commit/${row.pin_sha}`,
      },
      corpus: { scope: row.scope, entry_points: row.entry_points, scope_anchors: [], files: [] },
      window: {
        window_floor_utc: windowFloor,
        substantive_update_candidates: [],
        selected_latest_update_sha: null,
        selected_latest_update_time_utc: null,
        comparison_start_utc: windowFloor,
        spec_is_stale_90d: true,
      },
      first_parent_commits_90d: [],
      material_behavior_candidates: [],
      excluded_commits: [],
      pinned_state_checks: [],
      sources: [],
      integrity: {
        canonical_json_sha256: '0'.repeat(64),
        tree_truncated: treeTruncated,
        corpus_complete: false,
        first_parent_membership_complete: false,
        material_candidates_complete: false,
        pinned_state_checks_complete: false,
        neutral_summaries_valid: false,
        cross_references_valid: true,
        bounds_valid: false,
        builder_version: BUILDER_VERSION,
        built_at_utc: builtAtUtc,
      },
    };
    packet.integrity.canonical_json_sha256 = sha256(canonicalize(packet));
    return packet;
  }

  const sources: Source[] = [];
  const addSource = (source: Omit<Source, 'source_id' | 'content_sha256'>): string => {
    const source_id = `s${String(sources.length + 1).padStart(4, '0')}`;
    sources.push({ ...source, source_id, content_sha256: sha256(source.content) });
    return source_id;
  };

  const pathsNeedingContent = tree.filter((item) => !(unbounded && isArchivePath(item.path)));
  const batchedBlobs = unbounded && tree.length > MAX_CORPUS_FILES
    ? gitBlobsBatch(repoDir, pathsNeedingContent.map((item) => item.blob))
    : null;
  const batchedLastChanges = tree.length > MAX_CORPUS_FILES
    ? lastPathChangesBatch(repoDir, row.pin_sha, row.entry_points, pathsNeedingContent.map((item) => item.path))
    : null;
  const corpusFiles = tree.map((item, index) => {
    const archiveSuppressed = unbounded && isArchivePath(item.path);
    const buffer = archiveSuppressed ? null : batchedBlobs?.get(item.blob) ?? gitBuffer(repoDir, ['cat-file', 'blob', item.blob]);
    if (buffer !== null) item.size = buffer.length;
    const content = buffer === null ? null : decodeText(buffer);
    const last = archiveSuppressed
      ? { sha: row.pin_sha, time: row.pin_time_utc }
      : batchedLastChanges?.get(item.path) ?? lastPathChange(repoDir, row.pin_sha, item.path);
    const url = `https://github.com/${row.repository}/blob/${row.pin_sha}/${item.path}`;
    const source_id =
      content === null
        ? null
        : addSource({ kind: 'corpus_blob', repository: row.repository, sha: row.pin_sha, path: item.path, line_start: 1, line_end: content.split('\n').length, content, url });
    return {
      artifact_id: `f${String(index + 1).padStart(4, '0')}`,
      path: item.path,
      git_blob_sha: item.blob,
      size_bytes: item.size,
      media: archiveSuppressed ? 'historical_archive' : content === null ? 'binary' : 'text',
      assess_lifecycle: content !== null,
      archive_suppressed: archiveSuppressed,
      content,
      last_change_sha: last.sha,
      last_change_time_utc: last.time,
      url,
      source_id,
    };
  });
  const decodedCorpusBytes = corpusFiles.reduce(
    (sum, file) => sum + (file.content === null ? 0 : Buffer.byteLength(file.content)),
    0,
  );
  if (!unbounded && decodedCorpusBytes > MAX_CORPUS_BYTES) {
    const packet: any = {
      protocol_version: '3.0',
      packet_id: `p03-${String(order).padStart(2, '0')}-${row.slug}`,
      packet_status: 'oversize',
      packet_failure: `corpus_bytes>${MAX_CORPUS_BYTES} (actual ${decodedCorpusBytes})`,
      identity: {
        order,
        slug: row.slug,
        repository: row.repository,
        pin_sha: row.pin_sha,
        pin_time_utc: row.pin_time_utc,
        repository_api_url: repoMeta.url,
        pin_api_url: pinMeta.url,
        pin_html_url: `https://github.com/${row.repository}/commit/${row.pin_sha}`,
      },
      corpus: { scope: row.scope, entry_points: row.entry_points, scope_anchors: [], files: [] },
      window: {
        window_floor_utc: windowFloor,
        substantive_update_candidates: [],
        selected_latest_update_sha: null,
        selected_latest_update_time_utc: null,
        comparison_start_utc: windowFloor,
        spec_is_stale_90d: true,
      },
      first_parent_commits_90d: [],
      material_behavior_candidates: [],
      excluded_commits: [],
      pinned_state_checks: [],
      sources: [],
      integrity: {
        canonical_json_sha256: '0'.repeat(64),
        tree_truncated: treeTruncated,
        corpus_complete: false,
        first_parent_membership_complete: false,
        material_candidates_complete: false,
        pinned_state_checks_complete: false,
        neutral_summaries_valid: false,
        cross_references_valid: true,
        bounds_valid: false,
        builder_version: BUILDER_VERSION,
        built_at_utc: builtAtUtc,
      },
    };
    packet.integrity.canonical_json_sha256 = sha256(canonicalize(packet));
    return packet;
  }

  const anchors: Array<{ anchor_id: string; kind: string; name: string; source_ids: string[] }> = [];
  const seenAnchors = new Set<string>();
  for (const file of corpusFiles.filter((item) => item.content !== null)) {
    const headings = file.content!
      .split('\n')
      .filter((line) => /^#{1,4}\s+\S/.test(line))
      .map((line) => line.replace(/^#{1,4}\s+/, '').replace(/[`*_]/g, '').trim());
    const names = [basename(file.path).replace(/\.[^.]+$/, ''), ...headings].filter((name) => name.length >= 3);
    for (const name of names) {
      const key = name.toLowerCase();
      if (seenAnchors.has(key) || anchors.length >= 128) continue;
      seenAnchors.add(key);
      anchors.push({ anchor_id: `a${String(anchors.length + 1).padStart(4, '0')}`, kind: 'feature', name, source_ids: [file.source_id!] });
    }
  }

  const pathHistoryShas = git(repoDir, ['log', '--format=%H', row.pin_sha, '--', ...row.entry_points]).split('\n').filter(Boolean);
  const historyCandidates: any[] = [];
  let olderCandidates = 0;
  for (const sha of pathHistoryShas) {
    const metaLine = git(repoDir, ['show', '-s', '--format=%cI%x09%P', sha]).trim();
    const [time, parentsRaw] = metaLine.split('\t');
    const parents = parentsRaw ? parentsRaw.split(' ') : [];
    const parent = parents[0];
    const diff = git(repoDir, ['diff', '--unified=1', parent || `${sha}^!`, sha, '--', ...row.entry_points]);
    const normalized = normalizedDelta(diff);
    if (!normalized) continue;
    const files = changedFiles(repoDir, sha).filter((file) => row.entry_points.some((entry) => file.path === entry.replace(/\/$/, '') || file.path.startsWith(entry)));
    const sourceId = addSource({ kind: 'normalized_delta', repository: row.repository, sha, path: null, line_start: 1, line_end: normalized.split('\n').length, content: normalized, url: `https://github.com/${row.repository}/commit/${sha}` });
    historyCandidates.push({
      sha,
      time_utc: time,
      parents,
      paths: files.map((file) => file.path),
      before_after_blob_ids: files.map((file) => ({ path: file.path, before: file.before_blob, after: file.after_blob })),
      normalized_delta_source_id: sourceId,
    });
    if (compareInstants(time, windowFloor) <= 0) olderCandidates += 1;
    if (olderCandidates >= 3) break;
  }
  historyCandidates.sort((a, b) => compareInstants(b.time_utc, a.time_utc) || a.sha.localeCompare(b.sha));
  const selected = historyCandidates[0] ?? null;
  const comparisonStart = selected && compareInstants(selected.time_utc, windowFloor) > 0 ? selected.time_utc : windowFloor;
  const stale = !selected || compareInstants(selected.time_utc, windowFloor) <= 0;

  const chain = commitLog(repoDir, row.pin_sha);
  const members = chain.filter(
    (commit) => compareInstants(commit.time, windowFloor) > 0 && compareInstants(commit.time, row.pin_time_utc) <= 0,
  );
  const firstParentCommits: any[] = [];
  const candidates: any[] = [];
  const exclusions: any[] = [];
  const filesBySha = changedFilesBatch(repoDir, members.map((commit) => commit.sha));

  for (const [position, commit] of members.entries()) {
    const files = filesBySha.get(commit.sha)!;
    const commitId = `c${String(position + 1).padStart(4, '0')}`;
    const mechanicalExclusion = mechanicallyExcluded(files);
    const afterComparisonStart = compareInstants(commit.time, comparisonStart) > 0;
    const isCandidate = afterComparisonStart && mechanicalExclusion === null;
    const diff = git(repoDir, ['show', '--format=', '--unified=3', commit.sha]);
    const boundedDiff = diff.length <= 200_000 && diff.split('\n').length <= 4_000 ? diff : JSON.stringify(files);
    const diffSource = addSource({ kind: 'diff', repository: row.repository, sha: commit.sha, path: null, line_start: 1, line_end: boundedDiff.split('\n').length, content: boundedDiff, url: `https://github.com/${row.repository}/commit/${commit.sha}` });
    if (!isCandidate) {
      firstParentCommits.push({
        commit_id: commitId,
        sha: commit.sha,
        first_parent_sha: commit.parents[0] ?? null,
        time_utc: commit.time,
        message: commit.message,
        after_comparison_start: afterComparisonStart,
        changed_files: files,
        url: `https://github.com/${row.repository}/commit/${commit.sha}`,
        diff_source_ids: [diffSource],
      });
      exclusions.push({
        commit_id: commitId,
        code: afterComparisonStart ? mechanicalExclusion : 'before_comparison_start',
        source_ids: [diffSource],
      });
      continue;
    }

    firstParentCommits.push({
      commit_id: commitId,
      sha: commit.sha,
      first_parent_sha: commit.parents[0] ?? null,
      time_utc: commit.time,
      message: commit.message,
      after_comparison_start: afterComparisonStart,
      changed_files: files,
      url: `https://github.com/${row.repository}/commit/${commit.sha}`,
      diff_source_ids: [diffSource],
    });
    const tokens = `${commit.message} ${files.map((file) => file.path).join(' ')}`.toLowerCase();
    const proposed = anchors.filter((anchor) => anchor.name.toLowerCase().split(/\W+/).some((token) => token.length >= 4 && tokens.includes(token))).slice(0, 8).map((anchor) => anchor.anchor_id);
    candidates.push({
      candidate_id: `m${String(candidates.length + 1).padStart(4, '0')}`,
      commit_id: commitId,
      behavior: commit.message.replace(/^(feat|fix)(\([^)]*\))?:\s*/i, '').replace(/\s*\(#\d+\)$/, '').trim(),
      affected_paths: files.map((file) => file.path),
      proposed_scope_anchor_ids: proposed,
      diff_source_ids: [diffSource],
      pinned_state_source_ids: [],
    });
  }

  const checks: any[] = [];
  for (const [index, definition] of (PINNED_CHECKS[row.slug] ?? []).entries()) {
    const artifact = corpusFiles.find((file) => file.path === definition.artifact_path);
    assert(artifact?.content && artifact.source_id, `${row.slug}: pinned check artifact missing`);
    const codeBuffer = gitBuffer(repoDir, ['show', `${row.pin_sha}:${definition.code_path}`]);
    const codeContent = decodeText(codeBuffer);
    assert(codeContent !== null, `${row.slug}: pinned check code is not text`);
    const codeExcerpt = excerpt(codeContent, definition.code_needles);
    const codeSource = addSource({ kind: 'code_blob', repository: row.repository, sha: row.pin_sha, path: definition.code_path, line_start: codeExcerpt.lineStart, line_end: codeExcerpt.lineEnd, content: codeExcerpt.content, url: `https://github.com/${row.repository}/blob/${row.pin_sha}/${definition.code_path}` });
    checks.push({
      check_id: `p${String(index + 1).padStart(4, '0')}`,
      question: definition.question,
      artifact_ids: [artifact.artifact_id],
      code_source_ids: [codeSource],
      corpus_source_ids: [artifact.source_id],
    });
  }

  const corpusBytes = corpusFiles.reduce((sum, file) => sum + (file.content === null ? 0 : Buffer.byteLength(file.content)), 0);
  const failures: string[] = [];
  if (treeTruncated) failures.push('recursive_tree_truncated');
  if (!row.entry_points.every((entry) => tree.some((item) => item.path === entry.replace(/\/$/, '') || item.path.startsWith(entry)))) failures.push('nominated_path_missing');
  if (corpusFiles.length > MAX_CORPUS_FILES) failures.push(`corpus_files>${MAX_CORPUS_FILES}`);
  if (corpusBytes > MAX_CORPUS_BYTES) failures.push(`corpus_bytes>${MAX_CORPUS_BYTES}`);
  if (candidates.length > MAX_CANDIDATES) failures.push(`material_candidates>${MAX_CANDIDATES}`);
  if (checks.length > MAX_CHECKS) failures.push(`pinned_checks>${MAX_CHECKS}`);
  if (sources.length > MAX_SOURCES) failures.push(`sources>${MAX_SOURCES}`);

  const packet: any = {
    protocol_version: '3.0',
    packet_id: `p03-${String(order).padStart(2, '0')}-${row.slug}`,
    packet_status: failures.length ? 'oversize' : 'valid',
    packet_failure: failures.length ? failures.join(', ') : null,
    identity: {
      order,
      slug: row.slug,
      repository: row.repository,
      pin_sha: row.pin_sha,
      pin_time_utc: row.pin_time_utc,
      repository_api_url: repoMeta.url,
      pin_api_url: pinMeta.url,
      pin_html_url: `https://github.com/${row.repository}/commit/${row.pin_sha}`,
    },
    corpus: {
      scope: row.scope,
      entry_points: row.entry_points,
      scope_anchors: anchors,
      files: corpusFiles.map(({ content: _content, ...file }) => file),
    },
    window: {
      window_floor_utc: windowFloor,
      substantive_update_candidates: historyCandidates,
      selected_latest_update_sha: selected?.sha ?? null,
      selected_latest_update_time_utc: selected?.time_utc ?? null,
      comparison_start_utc: comparisonStart,
      spec_is_stale_90d: stale,
    },
    first_parent_commits_90d: firstParentCommits,
    material_behavior_candidates: candidates,
    excluded_commits: exclusions,
    pinned_state_checks: checks,
    sources,
    integrity: {
      canonical_json_sha256: '0'.repeat(64),
      tree_truncated: treeTruncated,
      corpus_complete: !failures.includes('nominated_path_missing'),
      first_parent_membership_complete: true,
      material_candidates_complete: true,
      pinned_state_checks_complete: true,
      neutral_summaries_valid: true,
      cross_references_valid: true,
      bounds_valid: failures.length === 0,
      builder_version: BUILDER_VERSION,
      built_at_utc: builtAtUtc,
    },
  };
  const encodedBeforeHash = canonicalize(packet);
  packet.integrity.canonical_json_sha256 = sha256(encodedBeforeHash);
  if (Buffer.byteLength(JSON.stringify(packet)) > MAX_PACKET_BYTES && packet.packet_status === 'valid') {
    packet.packet_status = 'oversize';
    packet.packet_failure = `packet_bytes>${MAX_PACKET_BYTES}`;
    packet.integrity.bounds_valid = false;
    packet.integrity.canonical_json_sha256 = '0'.repeat(64);
    packet.integrity.canonical_json_sha256 = sha256(canonicalize(packet));
  }
  return packet;
}

function readOption(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  assert(process.argv[index + 1], `${name} requires a value`);
  return resolve(process.cwd(), process.argv[index + 1]);
}

function optionalOption(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  assert(process.argv[index + 1], `${name} requires a value`);
  return process.argv[index + 1];
}

function main() {
  const manifestPath = readOption('--manifest', DEFAULT_MANIFEST_PATH);
  const outputDir = readOption('--output-dir', DEFAULT_OUTPUT_DIR);
  const selectedSlugs = optionalOption('--slugs')?.split(',').filter(Boolean) ?? null;
  const unbounded = process.argv.includes('--unbounded');
  const manifestDocument = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  const completeManifest = validateManifest(manifestDocument);
  const manifest = selectedSlugs
    ? completeManifest.filter((row) => selectedSlugs.includes(row.slug))
    : completeManifest;
  if (selectedSlugs) {
    assert(manifest.length === selectedSlugs.length, 'Every --slugs entry must exist exactly once in the manifest');
  }
  mkdirSync(outputDir, { recursive: true });
  const index: Array<{ packet_id: string; slug: string; status: string; sha256: string; file: string }> = [];
  for (const [position, row] of manifest.entries()) {
    const order = completeManifest.findIndex((project) => project.slug === row.slug) + 1;
    console.log(`[${position + 1}/${manifest.length}] ${row.slug}`);
    const packet = buildPacket(row, order, manifestDocument.snapshot_time_utc, unbounded);
    const file = `${String(position + 1).padStart(2, '0')}-${row.slug}.json`;
    writeFileSync(join(outputDir, file), `${JSON.stringify(packet, null, 2)}\n`);
    index.push({ packet_id: packet.packet_id, slug: row.slug, status: packet.packet_status, sha256: packet.integrity.canonical_json_sha256, file });
  }
  writeFileSync(
    join(outputDir, 'index.json'),
    `${JSON.stringify({ protocol_version: '3.0', builder_version: BUILDER_VERSION, snapshot_time_utc: manifestDocument.snapshot_time_utc, manifest_sha256: sha256(canonicalize(manifestDocument)), packets: index }, null, 2)}\n`,
  );
  console.log(`Wrote ${index.length} packets: ${index.filter((item) => item.status === 'valid').length} valid, ${index.filter((item) => item.status !== 'valid').length} non-valid`);
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) main();
