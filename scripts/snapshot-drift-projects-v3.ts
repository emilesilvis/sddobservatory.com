import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { refreshSnapshotManifest, type SnapshotManifest } from './drift-snapshot.ts';

const ROOT = resolve(import.meta.dirname, '..');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
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

function ghJson(endpoint: string): any {
  return JSON.parse(execFileSync('gh', ['api', endpoint], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}

function main() {
  const manifestPath = readOption('--manifest', resolve(ROOT, 'docs/research/drift-projects-v3.json'));
  const outputPath = optionalOption('--output');
  const selectedSlugs = optionalOption('--slugs')?.split(',').filter(Boolean) ?? null;
  const previous = JSON.parse(readFileSync(manifestPath, 'utf8')) as SnapshotManifest;
  assert(previous.schema_version === '1' && previous.projects.length === 22, 'Expected a 22-project version 1 manifest');
  const snapshot = refreshSnapshotManifest(previous, selectedSlugs, (project) => {
    const repository = ghJson(`repos/${project.repository}`);
    const head = ghJson(`repos/${repository.full_name}/commits/${repository.default_branch}`);
    return {
      repository: repository.full_name,
      pin_sha: head.sha,
      pin_time_utc: head.commit.committer.date,
    };
  });
  const encoded = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (outputPath) writeFileSync(resolve(process.cwd(), outputPath), encoded);
  else process.stdout.write(encoded);
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) main();
