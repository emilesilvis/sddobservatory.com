// Fails the build when content leaves slash commands outside backticks.
// The site only renders `backtick spans` as inline code (RichText.astro for
// frontmatter strings, Markdown for bodies) — a bare /command reads as plain
// prose, which is exactly the bug this guards against.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const BARE_SLASH_COMMAND = /(?:^|[\s("'[])(\/[a-z][a-z0-9-]+)/g;

function bareSlashCommands(text: string): string[] {
  const prose = text
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code spans
    .replace(/\]\([^)]*\)/g, ']'); // markdown link targets
  return [...prose.matchAll(BARE_SLASH_COMMAND)].map((m) => m[1]);
}

interface Violation {
  file: string;
  field: string;
  command: string;
}

const violations: Violation[] = [];

function check(file: string, field: string, value: unknown): void {
  if (typeof value === 'string') {
    for (const command of bareSlashCommands(value)) violations.push({ file, field, command });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => check(file, `${field}[${i}]`, item));
  } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    for (const [key, child] of Object.entries(value)) check(file, field ? `${field}.${key}` : key, child);
  }
}

for (const root of ['src/content/frameworks', 'src/content/projects']) {
  for (const name of readdirSync(root).filter((n) => n.endsWith('.md'))) {
    const file = join(root, name);
    const { data, content } = matter(readFileSync(file, 'utf8'));
    check(file, '', data);
    check(file, 'body', content);
  }
}

if (violations.length > 0) {
  for (const { file, field, command } of violations) {
    console.error(`${file} (${field}): wrap "${command}" in backticks so it renders as inline code`);
  }
  console.error(
    `\n${violations.length} bare slash command(s) found. Commands, file names, and paths must be` +
      ` backtick-wrapped — in frontmatter strings as well as body text. See CONTRIBUTING.md.`,
  );
  process.exit(1);
}

console.log('Content lint passed: all slash commands are formatted as code.');
