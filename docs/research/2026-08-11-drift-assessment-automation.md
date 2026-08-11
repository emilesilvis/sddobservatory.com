# Automated drift assessment runner — 2026-08-11

## Outcome

Drift assessment is now scheduled, incremental, and review-gated. Every Monday the **Assess project drift** workflow:

1. snapshots the selected upstream repository's current default-branch head;
2. rebuilds and validates complete source evidence for that pin;
3. loads the project's integrity-protected claim state from its dedicated `automation/drift-state-<slug>` branch;
4. reuses claims only for byte-identical corpus blobs and assesses only new corpus segments and first-parent commits;
5. runs two isolated OpenAI assessments under the 20-task-per-run gate;
6. advances internal claim state only after an accepted assessment; and
7. opens one draft PR containing both the assessment record and the proposed public project update when the accepted
   rating changed.

An `unknown` result can open an evidence-only draft but can never change a public rating. An accepted unchanged result
updates only internal state and opens no PR. The workflow has no merge or auto-merge operation, so the steady-state
maintainer action is simply to review and merge a generated draft when one appears.

The accepted Schematic result from 2026-08-11 is also reflected on its project page: `low` became `moderate` under
the non-core contradiction rule `M1`.

## Incremental state

State is deliberately separate from `main`. Each project gets one persistent branch and one JSON record:

```text
automation/drift-state-<slug>
└── docs/research/drift-state-v1/<slug>.json
```

Each claim source is keyed by path, Git blob SHA, segment index, and segment SHA-256. The record includes the last
accepted pin, rating, rule, stable live-claim IDs, reviewed material behaviors, their agreed dispositions, and an
integrity hash. Behaviors remain in the rollup while their commits remain in the current evidence window and expire
when those commits leave it. If any corpus evidence or assessment scope changes, all retained behaviors are matched
again against the new complete live-claim set, so an old omission can become covered rather than being carried
forever. A new run fails closed before model calls if the state identity is wrong, its integrity hash fails, or its
prior pin cannot be reached through the current first-parent evidence window. Deleted or changed corpus blobs do not
carry their old claims forward.

Advancing this branch is an internal cache update, not publication. Public content changes only through a draft PR.

## Scheduled coverage and one-time baselines

The full v4 matrix contains twelve projects. Six fit the 20-task gate without prior state and begin scheduled
assessment immediately:

| Project | Compiled baseline tasks | Maximum including drift matching |
|---|---:|---:|
| `agentic-context-engine` | 6 | 7 |
| `akka-net` | 8 | 9 |
| `logitune` | 4 | 5 |
| `schematic` | 3 | 4 |
| `sokuji` | 16 | 17 |
| `yserver` | 10 | 10 |

The remaining projects are skipped on the schedule until a maintainer explicitly approves their larger one-time
baseline by manually dispatching the same workflow with a raised task budget:

| Project | Baseline tasks per run | Safe bootstrap budget including possible drift matching |
|---|---:|---:|
| `arcreel` | 79 | 80 |
| `desktop-cc-gui` | 100 | 100 |
| `growi` | 31 | 31 |
| `openspec` | 62 | 63 |
| `uniclipboard` | 75 | 76 |
| `wukongim` | 36 | 36 |

After an accepted manual baseline creates that project's state branch, the workflow detects it automatically and
includes the project in every later weekly run under the normal 20-task gate. A future delta above that gate fails
closed rather than silently expanding spend.

If an upstream force-push or a state-integrity failure makes an existing baseline unusable, manually dispatch with
**Force baseline** enabled and the appropriate bootstrap budget. That explicit recovery replaces the state only
after another accepted complete assessment.

## Local invocation

For a baseline or a run using a local state file:

```sh
export OPENAI_API_KEY='...'
npm run drift:assess:v4 -- \
  --project schematic \
  --model gpt-5.6 \
  --max-tasks-per-run 20

npm run drift:assess:v4 -- \
  --project schematic \
  --model gpt-5.6 \
  --max-tasks-per-run 20 \
  --state-file .drift-runs/<run>/review-state.json
```

Local bundles and next-state files are written under `.drift-runs/` and ignored by Git. In automation,
`--publish-state` loads and advances the remote state branch, while `--publish-draft-pr` creates or updates the
project's deterministic review branch.

## Fail-closed gates

- Incomplete incremental lineage or state identity returns `unknown` before model calls.
- More than the configured semantic task budget returns `unknown`; evidence is never sampled.
- Invalid, refused, missing, or schema-incompatible model output remains auditable as `unknown`.
- Claim classification, materiality, pinned checks, drift matching, and final rating must agree across both runs.
- Response IDs must be unique and every response must report the same model.
- A drift-matching task above 2,000,000 bytes returns `unknown`.
- Only an accepted assessment can advance state or propose a public project edit.
- No workflow path merges its own proposal.
