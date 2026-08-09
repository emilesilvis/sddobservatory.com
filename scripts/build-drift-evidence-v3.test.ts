import assert from 'node:assert/strict';
import test from 'node:test';
import { compareInstants, mechanicallyExcluded, type ChangedFile } from './build-drift-evidence-v3.ts';

function file(path: string): ChangedFile {
  return {
    path,
    status: 'modified',
    before_blob: '1'.repeat(40),
    after_blob: '2'.repeat(40),
    additions: 1,
    deletions: 1,
  };
}

test('excludes only path-provable dependency updates', () => {
  assert.equal(mechanicallyExcluded([file('pnpm-lock.yaml')]), 'dependency_only');
  assert.equal(mechanicallyExcluded([file('package.json'), file('pnpm-lock.yaml')]), null);
});

test('excludes changes confined to documentation', () => {
  assert.equal(mechanicallyExcluded([file('docs/guide.md'), file('README.md')]), 'docs_only');
  assert.equal(mechanicallyExcluded([file('docs/guide.md'), file('src/index.ts')]), null);
});

test('excludes changes confined to tests', () => {
  assert.equal(mechanicallyExcluded([file('src/__tests__/feature.test.ts'), file('tests/fixture.json')]), 'tests_only');
  assert.equal(mechanicallyExcluded([file('src/feature.ts'), file('src/feature.test.ts')]), null);
});

test('excludes changes confined to CI configuration', () => {
  assert.equal(mechanicallyExcluded([file('.github/workflows/ci.yml')]), 'internal_only');
  assert.equal(mechanicallyExcluded([file('.github/workflows/ci.yml'), file('src/feature.ts')]), null);
});

test('treats empty commits as merge-only and ambiguous changes as candidates', () => {
  assert.equal(mechanicallyExcluded([]), 'merge_only');
  assert.equal(mechanicallyExcluded([file('scripts/generate.ts')]), null);
});

test('compares timestamp instants rather than their offset-bearing text', () => {
  assert.equal(compareInstants('2026-03-24T16:35:23+01:00', '2026-03-24T15:40:00Z') < 0, true);
  assert.equal(compareInstants('2026-03-24T16:35:23+01:00', '2026-03-24T15:35:23Z'), 0);
});
