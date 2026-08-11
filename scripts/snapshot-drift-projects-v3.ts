import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Project = {
  slug: string;
  repository: string;
  pin_sha: string;
  pin_time_utc: string;
  scope: 'canonical' | 'change-scoped';
  entry_points: string[];
};

type Manifest = {
  schema_version: '1';
  snapshot_time_utc: string;
  projects: Project[];
};

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

function ghJson(endpoint: string): any {
  return JSON.parse(execFileSync('gh', ['api', endpoint], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}

const manifestPath = readOption('--manifest', resolve(ROOT, 'docs/research/drift-projects-v3.json'));
const previous = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
assert(previous.schema_version === '1' && previous.projects.length === 22, 'Expected a 22-project version 1 manifest');

const projects = previous.projects.map((project) => {
  const repository = ghJson(`repos/${project.repository}`);
  const head = ghJson(`repos/${repository.full_name}/commits/${repository.default_branch}`);
  assert(/^[0-9a-f]{40}$/.test(head.sha), `${project.slug}: GitHub returned an invalid head SHA`);
  assert(!Number.isNaN(Date.parse(head.commit.committer.date)), `${project.slug}: GitHub returned an invalid head time`);
  return {
    ...project,
    repository: repository.full_name,
    pin_sha: head.sha,
    pin_time_utc: head.commit.committer.date,
  };
});

const snapshot: Manifest = {
  schema_version: '1',
  snapshot_time_utc: new Date().toISOString(),
  projects,
};

process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
