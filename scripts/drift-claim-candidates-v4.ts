import { createHash } from 'node:crypto';

export type ClaimCandidate = {
  candidate_id: string;
  statement: string;
  statement_sha256: string;
  char_start: number;
  char_end: number;
  unit_kind: 'table_row' | 'paragraph';
  section_path: string[];
};

type SourceSegment = {
  segment_id: string;
  char_start: number;
  content: string;
};

type CorpusArtifact = {
  artifact_id: string;
  path: string;
  git_blob_sha: string;
};

type ScopeAnchor = {
  name: string;
  source_ids: string[];
};

type SourceLine = {
  text: string;
  start: number;
  end: number;
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function sourceLines(content: string): SourceLine[] {
  const lines: SourceLine[] = [];
  let start = 0;
  while (start < content.length) {
    const newline = content.indexOf('\n', start);
    const rawEnd = newline === -1 ? content.length : newline;
    const end = rawEnd > start && content[rawEnd - 1] === '\r' ? rawEnd - 1 : rawEnd;
    lines.push({ text: content.slice(start, end), start, end });
    if (newline === -1) break;
    start = newline + 1;
  }
  return lines;
}

function heading(line: string): { level: number; title: string } | null {
  const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
  if (!match) return null;
  return { level: match[1].length, title: match[2] };
}

function tableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}

function tableSeparator(line: string): boolean {
  if (!tableRow(line)) return false;
  const cells = line.trim().slice(1, -1).split('|').map((cell) => cell.trim());
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function compileClaimCandidates(segment: SourceSegment): ClaimCandidate[] {
  const lines = sourceLines(segment.content);
  const sections: Array<{ level: number; title: string }> = [];
  const units: Array<{ statement: string; start: number; end: number; unit_kind: ClaimCandidate['unit_kind']; section_path: string[] }> = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const next = lines[index + 1];
    const parsedHeading = heading(line.text);
    if (parsedHeading) {
      while (sections.length && sections[sections.length - 1].level >= parsedHeading.level) sections.pop();
      sections.push(parsedHeading);
      index += 1;
      continue;
    }
    if (!line.text.trim()) {
      index += 1;
      continue;
    }
    if (tableRow(line.text) && next && tableSeparator(next.text)) {
      index += 2;
      while (index < lines.length && tableRow(lines[index].text) && !tableSeparator(lines[index].text)) {
        const row = lines[index];
        units.push({ statement: row.text, start: row.start, end: row.end, unit_kind: 'table_row', section_path: sections.map((section) => section.title) });
        index += 1;
      }
      continue;
    }

    const paragraphStart = line.start;
    let paragraphEnd = line.end;
    index += 1;
    while (index < lines.length && lines[index].text.trim() && !heading(lines[index].text) && !tableRow(lines[index].text)) {
      paragraphEnd = lines[index].end;
      index += 1;
    }
    units.push({
      statement: segment.content.slice(paragraphStart, paragraphEnd),
      start: paragraphStart,
      end: paragraphEnd,
      unit_kind: 'paragraph',
      section_path: sections.map((section) => section.title),
    });
  }

  return units.map((unit, index) => ({
    candidate_id: `${segment.segment_id}/q${String(index + 1).padStart(4, '0')}`,
    statement: unit.statement,
    statement_sha256: sha256(unit.statement),
    char_start: segment.char_start + unit.start,
    char_end: segment.char_start + unit.end,
    unit_kind: unit.unit_kind,
    section_path: unit.section_path,
  }));
}

export function compileClaimTaskItem(
  segment: SourceSegment & { source_id: string },
  artifact: CorpusArtifact,
  scopeAnchors: ScopeAnchor[],
) {
  return {
    artifact_id: artifact.artifact_id,
    path: artifact.path,
    git_blob_sha: artifact.git_blob_sha,
    segment_id: segment.segment_id,
    evidence_segment: segment,
    allowed_scope_anchor_names: scopeAnchors
      .filter((anchor) => anchor.source_ids.includes(segment.source_id))
      .map((anchor) => anchor.name),
    claim_candidates: compileClaimCandidates(segment),
  };
}
