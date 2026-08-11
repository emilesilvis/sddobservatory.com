import type { AssessmentBundle } from './drift-assessment-v4.ts';

export type PublicationFile = {
  path: string;
  content: string;
};

export type PublicationProposal = {
  branch: string;
  title: string;
  body: string;
  reportPath: string;
  files: PublicationFile[];
};

type ProposalInput = {
  bundle: AssessmentBundle;
  chunks: any[];
  projectMarkdown: string | null;
  repository: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function replaceFrontmatterField(markdown: string, field: string, value: string): string {
  const pattern = new RegExp(`^${field}:\\s*.*$`, 'gm');
  const matches = markdown.match(pattern) ?? [];
  assert(matches.length === 1, `Project Markdown must contain exactly one ${field} field`);
  return markdown.replace(pattern, `${field}: ${value}`);
}

function replaceSection(markdown: string, heading: string, body: string): string {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  assert(start >= 0, `Project Markdown is missing ${marker}`);
  const bodyStart = start + marker.length;
  const nextHeading = markdown.indexOf('\n## ', bodyStart);
  const end = nextHeading === -1 ? markdown.length : nextHeading;
  return `${markdown.slice(0, bodyStart)}\n\n${body.trim()}\n${markdown.slice(end)}`;
}

function pinnedQuestion(chunks: any[], checkId: string): string | null {
  for (const chunk of chunks.filter((item) => item.kind === 'pinned-checks')) {
    for (const item of chunk.items ?? []) {
      if (item.check?.check_id === checkId && typeof item.check.question === 'string') return item.check.question;
    }
  }
  return null;
}

function assessmentNarrative(bundle: AssessmentBundle, chunks: any[], repository: string, reportPath: string): string {
  const rating = `${bundle.rating[0].toUpperCase()}${bundle.rating.slice(1)}`;
  const runOnePinned = bundle.calls
    .filter((call) => call.run_id === 'run-1' && call.kind === 'pinned-checks' && call.status === 'ok')
    .flatMap((call) => call.output?.assessments ?? []);
  const materialPinned = runOnePinned.find((assessment: any) =>
    ['omitted', 'contradicted'].includes(assessment.status),
  );
  const question = materialPinned ? pinnedQuestion(chunks, materialPinned.check_id) : null;
  const finding = question
    ? `Both isolated runs agreed that the pinned check “${question}” is ${materialPinned.status}.`
    : `Both isolated runs agreed on the complete evidence set and the mechanical ${bundle.rule} rating rule.`;
  const severity = materialPinned && !materialPinned.core_claim
    ? `The finding is non-core, so ${bundle.rule} applies.`
    : `The ${bundle.rule} rule applies.`;
  const reportUrl = `https://github.com/${repository}/blob/main/${reportPath}`;
  return [
    `${rating} (\`${bundle.rule}\`). ${finding} ${severity}`,
    '',
    `The automated v4 assessment used ${bundle.run_rollups[0]?.live_claims ?? 0} live claims and completed ` +
      `all two-run agreement gates. See the [complete assessment record](${reportUrl}).`,
  ].join('\n');
}

function updateProjectMarkdown(input: ProposalInput, reportPath: string): string {
  const { bundle, chunks, projectMarkdown, repository } = input;
  assert(projectMarkdown !== null, `${bundle.project.slug}: project Markdown is required for a rating change`);
  assert(bundle.status === 'accepted' && bundle.rating !== 'unknown', 'Only accepted ratings may update project content');
  let updated = replaceFrontmatterField(projectMarkdown, 'drift', bundle.rating);
  updated = replaceFrontmatterField(updated, 'lastReviewed', bundle.created_at_utc.slice(0, 10));
  return replaceSection(updated, 'Spec-to-code drift', assessmentNarrative(bundle, chunks, repository, reportPath));
}

export function buildPublicationProposal(input: ProposalInput): PublicationProposal | null {
  const { bundle } = input;
  assert(bundle.mode === 'live', 'Fixture assessments cannot be published');
  if (!bundle.publication.draft_pr_required) return null;

  const reportPath = `docs/research/drift-assessments/${bundle.created_at_utc.slice(0, 10)}-${bundle.project.slug}-${bundle.project.pin_sha.slice(0, 12)}.json`;
  const files: PublicationFile[] = [{ path: reportPath, content: `${JSON.stringify(bundle, null, 2)}\n` }];
  const updatesProject = bundle.status === 'accepted' && bundle.publication.reason === 'rating_changed';
  if (updatesProject) {
    files.push({
      path: `src/content/projects/${bundle.project.slug}.md`,
      content: updateProjectMarkdown(input, reportPath),
    });
  }

  const title = bundle.status === 'accepted'
    ? `Review drift assessment: ${bundle.project.slug} → ${bundle.rating}`
    : `Review incomplete drift assessment: ${bundle.project.slug}`;
  const disposition = updatesProject
    ? `This draft records the evidence and updates the public project assessment. Nothing is published until a maintainer merges it.`
    : `This draft records incomplete evidence and does not change published project content.`;
  const body = [
    '## Automated assessment',
    '',
    `- Project: \`${bundle.project.slug}\``,
    `- Pin: \`${bundle.project.pin_sha}\``,
    `- Model: \`${bundle.requested_model}\``,
    `- Result: \`${bundle.status}\``,
    `- Reasons: \`${bundle.reasons.length ? bundle.reasons.join(', ') : 'none'}\``,
    `- Proposed rating: \`${bundle.rating}\``,
    `- Previous rating: \`${bundle.previous_rating ?? 'unknown'}\``,
    `- Agreement gates: \`${JSON.stringify(bundle.agreement)}\``,
    '',
    `The complete reviewable assessment record is in \`${reportPath}\`.`,
    disposition,
  ].join('\n');

  return {
    branch: `automation/drift-${bundle.project.slug}`,
    title,
    body,
    reportPath,
    files,
  };
}
