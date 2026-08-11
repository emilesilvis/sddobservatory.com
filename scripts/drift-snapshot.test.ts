import assert from 'node:assert/strict';
import test from 'node:test';
import { refreshSnapshotManifest, type SnapshotManifest } from './drift-snapshot.ts';

const previous: SnapshotManifest = {
  schema_version: '1',
  snapshot_time_utc: '2026-08-09T00:00:00.000Z',
  projects: [
    {
      slug: 'alpha',
      repository: 'owner/alpha',
      pin_sha: '1'.repeat(40),
      pin_time_utc: '2026-08-01T00:00:00Z',
      scope: 'canonical',
      entry_points: ['spec.md'],
    },
    {
      slug: 'beta',
      repository: 'owner/beta',
      pin_sha: '2'.repeat(40),
      pin_time_utc: '2026-08-02T00:00:00Z',
      scope: 'change-scoped',
      entry_points: ['docs/'],
    },
  ],
};

test('refreshes only requested project pins while preserving the complete manifest', () => {
  const lookedUp: string[] = [];
  const result = refreshSnapshotManifest(previous, ['beta'], (project) => {
    lookedUp.push(project.slug);
    return {
      repository: 'renamed/beta',
      pin_sha: 'a'.repeat(40),
      pin_time_utc: '2026-08-11T09:00:00Z',
    };
  }, () => new Date('2026-08-11T10:00:00Z'));

  assert.deepEqual(lookedUp, ['beta']);
  assert.equal(result.projects.length, 2);
  assert.deepEqual(result.projects[0], previous.projects[0]);
  assert.equal(result.projects[1].repository, 'renamed/beta');
  assert.equal(result.projects[1].pin_sha, 'a'.repeat(40));
  assert.equal(result.snapshot_time_utc, '2026-08-11T10:00:00.000Z');
});

test('rejects an unknown or duplicate requested slug before any lookup', () => {
  let calls = 0;
  const lookup = () => {
    calls += 1;
    throw new Error('must not run');
  };
  assert.throws(() => refreshSnapshotManifest(previous, ['missing'], lookup), /not present/);
  assert.throws(() => refreshSnapshotManifest(previous, ['alpha', 'alpha'], lookup), /unique/);
  assert.equal(calls, 0);
});
