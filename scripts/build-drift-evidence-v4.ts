import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { compileClaimTaskItem } from './drift-claim-candidates-v4.ts';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_PRIMARY_DIR = resolve(ROOT, 'docs/research/drift-evidence-prospective-v1');
const DEFAULT_FALLBACK_DIR = '/tmp/sdd-drift-v4-raw';
const DEFAULT_OUTPUT_DIR = resolve(ROOT, 'docs/research/drift-evidence-v4');
const MAX_CHUNK_BYTES = 2_000_000;
const MAX_SOURCE_SEGMENT_CHARS = 40_000;
const TARGET_SLUGS = new Set([
  'agentic-context-engine',
  'akka-net',
  'arcreel',
  'desktop-cc-gui',
  'growi',
  'logitune',
  'openspec',
  'schematic',
  'sokuji',
  'uniclipboard',
  'wukongim',
  'yserver',
]);

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

function optionalOption(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  assert(process.argv[index + 1], `${name} requires a value`);
  return process.argv[index + 1];
}

function readPackets(directory: string): Map<string, any> {
  const packets = new Map<string, any>();
  if (!existsSync(directory)) return packets;
  for (const file of readdirSync(directory).filter((name) => /^\d{2}-.+\.json$/.test(name)).sort()) {
    const packet = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    packets.set(packet.identity.slug, packet);
  }
  return packets;
}

function splitContent(source: any): any[] {
  const content = source.content as string;
  if (!content.length) {
    return [{
      segment_id: `${source.source_id}-g0001`,
      source_id: source.source_id,
      segment_index: 1,
      segment_count: 1,
      char_start: 0,
      char_end: 0,
      content: '',
      content_sha256: sha256(''),
      source: {
        kind: source.kind,
        repository: source.repository,
        sha: source.sha,
        path: source.path,
        line_start: source.line_start,
        line_end: source.line_end,
        url: source.url,
        original_content_sha256: source.content_sha256,
      },
    }];
  }
  const parts: string[] = [];
  for (let start = 0; start < content.length;) {
    let end = Math.min(content.length, start + MAX_SOURCE_SEGMENT_CHARS);
    if (end < content.length && /[\uD800-\uDBFF]/.test(content[end - 1])) end -= 1;
    parts.push(content.slice(start, end));
    start = end;
  }
  let offset = 0;
  return parts.map((part, index) => {
    const charStart = offset;
    offset += part.length;
    return {
      segment_id: `${source.source_id}-g${String(index + 1).padStart(4, '0')}`,
      source_id: source.source_id,
      segment_index: index + 1,
      segment_count: parts.length,
      char_start: charStart,
      char_end: offset,
      content: part,
      content_sha256: sha256(part),
      source: {
        kind: source.kind,
        repository: source.repository,
        sha: source.sha,
        path: source.path,
        line_start: source.line_start,
        line_end: source.line_end,
        url: source.url,
        original_content_sha256: source.content_sha256,
      },
    };
  });
}

type ChunkRef = { kind: string; chunk_id: string; file: string; sha256: string; bytes: number; item_count: number };

function main() {
  const primaryDir = readOption('--primary-dir', DEFAULT_PRIMARY_DIR);
  const fallbackDir = readOption('--fallback-dir', DEFAULT_FALLBACK_DIR);
  const outputDir = readOption('--output-dir', DEFAULT_OUTPUT_DIR);
  const requestedSlugs = optionalOption('--slugs')?.split(',').filter(Boolean) ?? null;
  const targetSlugs = requestedSlugs ? new Set(requestedSlugs) : TARGET_SLUGS;
  assert(targetSlugs.size > 0, '--slugs must select at least one project');
  for (const slug of targetSlugs) assert(TARGET_SLUGS.has(slug), `${slug}: not part of the frozen v4 project set`);
  assert(outputDir !== ROOT && outputDir !== resolve(ROOT, 'docs') && /(?:drift.*v4|v4.*drift)/.test(basename(outputDir)), 'Refusing unsafe v4 output directory');
  if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const primary = readPackets(primaryDir);
  const fallback = readPackets(fallbackDir);
  const packets = [...new Set([...primary.keys(), ...fallback.keys()])]
    .filter((slug) => targetSlugs.has(slug))
    .map((slug) => fallback.get(slug) ?? primary.get(slug))
    .sort((left, right) => left.identity.order - right.identity.order);
  assert(packets.length === targetSlugs.size, `Expected ${targetSlugs.size} target packets, received ${packets.length}`);

  const projectRefs: any[] = [];

  for (const packet of packets) {
    const slug = packet.identity.slug as string;
    console.log(`[${projectRefs.length + 1}/${packets.length}] ${slug}`);
    const segments = packet.sources.flatMap(splitContent);
    const segmentsById = new Map(segments.map((segment: any) => [segment.segment_id, segment]));
    const segmentsBySource = new Map<string, any[]>();
    for (const segment of segments) {
      segmentsBySource.set(segment.source_id, [...(segmentsBySource.get(segment.source_id) ?? []), segment]);
    }
    const segmentIds = (sourceIds: string[]) => sourceIds.flatMap((id) => (segmentsBySource.get(id) ?? []).map((item) => item.segment_id));
    const commits = new Map(packet.first_parent_commits_90d.map((commit: any) => [commit.commit_id, commit]));
    const chunkRefs: ChunkRef[] = [];

    const writeChunks = (kind: string, items: any[], maxItems: number, assessmentContract: any = null) => {
      const groups: any[][] = [];
      let group: any[] = [];
      for (const item of items) {
        const proposed = [...group, item];
        const preview = { protocol_version: '4.0', project_slug: slug, kind, items: proposed, assessment_contract: assessmentContract, integrity: { canonical_json_sha256: '0'.repeat(64) } };
        if (group.length && (proposed.length > maxItems || Buffer.byteLength(JSON.stringify(preview)) > MAX_CHUNK_BYTES)) {
          groups.push(group);
          group = [item];
        } else {
          group = proposed;
        }
      }
      if (group.length) groups.push(group);

      for (const [position, chunkItems] of groups.entries()) {
        const chunkId = `${slug}-${kind}-${String(position + 1).padStart(4, '0')}`;
        const chunk: any = {
          protocol_version: '4.0',
          project_slug: slug,
          chunk_id: chunkId,
          kind,
          items: chunkItems,
          assessment_contract: assessmentContract,
          integrity: { canonical_json_sha256: '0'.repeat(64) },
        };
        chunk.integrity.canonical_json_sha256 = sha256(canonicalize(chunk));
        const encoded = `${JSON.stringify(chunk, null, 2)}\n`;
        const bytes = Buffer.byteLength(encoded);
        assert(bytes <= MAX_CHUNK_BYTES, `${chunkId}: ${bytes} bytes exceeds ${MAX_CHUNK_BYTES}`);
        const file = `${chunkId}.json`;
        writeFileSync(join(outputDir, file), encoded);
        chunkRefs.push({ kind, chunk_id: chunkId, file, sha256: chunk.integrity.canonical_json_sha256, bytes, item_count: chunkItems.length });
      }
    };

    writeChunks('sources', segments, 32);

    const corpusItems = packet.corpus.files.map((artifact: any) => ({
      artifact_id: artifact.artifact_id,
      path: artifact.path,
      git_blob_sha: artifact.git_blob_sha,
      size_bytes: artifact.size_bytes,
      media: artifact.media,
      lifecycle_preclassified: artifact.archive_suppressed ? 'historical' : null,
      archive_suppressed: artifact.archive_suppressed ?? false,
      source_segment_ids: artifact.source_id ? segmentIds([artifact.source_id]) : [],
    }));
    writeChunks('corpus-inventory', corpusItems, 64);

    const artifactBySource = new Map(
      packet.corpus.files
        .filter((artifact: any) => artifact.source_id)
        .map((artifact: any) => [artifact.source_id, artifact]),
    );
    const claimItems = segments
      .filter((segment: any) => segment.source.kind === 'corpus_blob')
      .map((segment: any) => {
        const artifact: any = artifactBySource.get(segment.source_id);
        assert(artifact, `${slug}:${segment.segment_id}: corpus source lacks artifact`);
        return compileClaimTaskItem(segment, artifact, packet.corpus.scope_anchors);
      });
    writeChunks('corpus-claims', claimItems, 8, {
      output: [{
        segment_id: 'existing source segment ID',
        classifications: [{
          candidate_id: 'existing compiler-owned candidate ID',
          disposition: 'claim | not_claim',
          lifecycle: 'live | future | historical | null',
          core_claim: 'boolean',
          scope_anchor_name: 'allowed source anchor name | null',
        }],
      }],
      coverage: 'Every segment_id and compiler-owned claim candidate exactly once and in order. Candidate statements and IDs are immutable input.',
    });

    const materialityItems = packet.material_behavior_candidates.map((candidate: any) => ({
      candidate_id: candidate.candidate_id,
      commit: commits.get(candidate.commit_id),
      candidate,
      source_segment_ids: segmentIds([...candidate.diff_source_ids, ...candidate.pinned_state_source_ids]),
      evidence_segments: segmentIds([...candidate.diff_source_ids, ...candidate.pinned_state_source_ids]).map((id) => segmentsById.get(id)),
    }));
    writeChunks('materiality', materialityItems, 8, {
      output: [{
        candidate_id: 'existing candidate ID',
        materiality: 'material | non_material',
        reason: 'short evidence-bound reason',
        behaviors: [{ behavior_id: 'candidate ID plus /bNN', behavior: 'neutral atomic observable behavior', affected_paths: ['path'] }],
      }],
      coverage: 'Every candidate exactly once. non_material requires behaviors=[]; material requires one or more atomic behaviors.',
    });

    const exclusionItems = packet.excluded_commits.map((exclusion: any) => ({
      commit: commits.get(exclusion.commit_id),
      exclusion,
      source_segment_ids: segmentIds(exclusion.source_ids),
    }));
    writeChunks('exclusions', exclusionItems, 32);

    const historyItems = packet.window.substantive_update_candidates.map((candidate: any) => ({
      candidate,
      source_segment_ids: segmentIds([candidate.normalized_delta_source_id]),
    }));
    writeChunks('window-history', historyItems, 32);

    const checkItems = packet.pinned_state_checks.map((check: any) => ({
      check,
      source_segment_ids: segmentIds([...check.code_source_ids, ...check.corpus_source_ids]),
      evidence_segments: segmentIds([...check.code_source_ids, ...check.corpus_source_ids]).map((id) => segmentsById.get(id)),
    }));
    writeChunks('pinned-checks', checkItems, 16, {
      output: [{ check_id: 'existing check ID', status: 'covered | omitted | contradicted | minor_gap', claim_segment_ids: ['existing segment ID'], code_segment_ids: ['existing segment ID'], core_claim: 'boolean' }],
    });

    const project: any = {
      protocol_version: '4.0',
      project_id: `p04-${String(packet.identity.order).padStart(2, '0')}-${slug}`,
      source_packet_id: packet.packet_id,
      identity: packet.identity,
      corpus: { scope: packet.corpus.scope, entry_points: packet.corpus.entry_points, scope_anchors: packet.corpus.scope_anchors },
      window: {
        window_floor_utc: packet.window.window_floor_utc,
        selected_latest_update_sha: packet.window.selected_latest_update_sha,
        selected_latest_update_time_utc: packet.window.selected_latest_update_time_utc,
        comparison_start_utc: packet.window.comparison_start_utc,
        spec_is_stale_90d: packet.window.spec_is_stale_90d,
      },
      counts: {
        corpus_artifacts: corpusItems.length,
        historical_archive_artifacts: corpusItems.filter((item: any) => item.archive_suppressed).length,
        source_records: packet.sources.length,
        source_segments: segments.length,
        corpus_claim_segments: claimItems.length,
        corpus_claim_candidates: claimItems.reduce((sum: number, item: any) => sum + item.claim_candidates.length, 0),
        first_parent_commits_90d: packet.first_parent_commits_90d.length,
        raw_candidates: materialityItems.length,
        exclusions: exclusionItems.length,
        window_history: historyItems.length,
        pinned_checks: checkItems.length,
      },
      chunks: chunkRefs,
      rollup_contract: {
        claim_stage: 'Join assessor classifications to compiler-owned candidates by source segment and candidate ID; candidate text and IDs are never model-authored.',
        materiality_stage: 'Merge materiality outputs by candidate ID; only material atomic behaviors advance.',
        drift_stage: 'Assess every material atomic behavior against the complete merged live-claim index and every pinned-state check.',
        rating_tree: ['H1 core contradiction', 'H2 stale spec plus drift from at least three distinct commits', 'M1 any omission or contradiction', 'L1 minor gaps only', 'N1 all covered'],
        unknown_rule: 'Any missing, duplicate, invalid, or disagreeing required semantic item makes the project unknown; evidence is never silently discarded.',
      },
      integrity: { canonical_json_sha256: '0'.repeat(64) },
    };
    project.integrity.canonical_json_sha256 = sha256(canonicalize(project));
    const projectFile = `${slug}--project.json`;
    const encodedProject = `${JSON.stringify(project, null, 2)}\n`;
    assert(Buffer.byteLength(encodedProject) <= MAX_CHUNK_BYTES, `${slug}: project manifest exceeds chunk bound`);
    writeFileSync(join(outputDir, projectFile), encodedProject);
    projectRefs.push({ project_id: project.project_id, slug, file: projectFile, sha256: project.integrity.canonical_json_sha256, chunks: chunkRefs.length });
  }

  const index: any = {
    protocol_version: '4.0',
    builder_version: '4.1.0-deterministic-claims',
    project_selection: requestedSlugs
      ? `selected frozen v4 projects: ${[...targetSlugs].sort().join(',')}`
      : 'nine prospective oversize projects plus agentic-context-engine, logitune, and schematic controls',
    max_chunk_bytes: MAX_CHUNK_BYTES,
    projects: projectRefs,
    integrity: { canonical_json_sha256: '0'.repeat(64) },
  };
  index.integrity.canonical_json_sha256 = sha256(canonicalize(index));
  writeFileSync(join(outputDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Wrote ${projectRefs.length} v4 projects and ${projectRefs.reduce((sum, project) => sum + project.chunks, 0)} bounded chunks`);
}

main();
