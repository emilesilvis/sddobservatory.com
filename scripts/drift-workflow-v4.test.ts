import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolve } from 'node:path';

const workflow = readFileSync(resolve(import.meta.dirname, '../.github/workflows/drift-assessment.yml'), 'utf8');

test('runs scheduled baseline-safe projects and retains manual dispatch', () => {
  assert.match(workflow, /^\s{2}schedule:\s*$/m);
  assert.match(workflow, /cron:\s*['"]17 4 \* \* 1['"]/);
  assert.match(workflow, /^\s{2}workflow_dispatch:\s*$/m);
  for (const slug of ['agentic-context-engine', 'akka-net', 'logitune', 'schematic', 'sokuji', 'yserver']) {
    assert.match(workflow, new RegExp(`['"]?${slug}['"]?`));
  }
  assert.match(workflow, /matrix:/);
});

test('refreshes the selected pin and runs the incremental state path under the hard budget', () => {
  assert.match(workflow, /npm run drift:snapshot --/);
  assert.match(workflow, /--slugs "\$\{PROJECT\}"/);
  assert.match(workflow, /--output \/tmp\/drift-manifest\.json/);
  assert.match(workflow, /--manifest \/tmp\/drift-manifest\.json/);
  assert.match(workflow, /MAX_TASKS:.*20/);
  assert.match(workflow, /--publish-state/);
  assert.match(workflow, /--publish-draft-pr/);
  assert.match(workflow, /^\s{6}force_baseline:\s*$/m);
  assert.match(workflow, /args\+?=\(--force-baseline\)/);
});

test('can propose changes but never merges them', () => {
  assert.match(workflow, /^\s{2}contents: write$/m);
  assert.match(workflow, /^\s{2}pull-requests: write$/m);
  assert.doesNotMatch(workflow, /gh pr merge|--auto-merge|enablePullRequestAutoMerge/i);
});
