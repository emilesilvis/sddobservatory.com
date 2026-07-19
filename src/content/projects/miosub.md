---
name: MioSub
repo: corvo007/MioSub
framework: openspec
summary: >-
  One-stop automated subtitle generator covering downloading, transcription, translation, and
  hardcoding end to end — a TypeScript/React/Electron app built on Google Gemini and Whisper.
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
  notes: >-
    Ten Markdown files: `AGENTS.md` and `project.md` at the root, `specs/` with two capability
    specs (`chunk-processing/spec.md` with seven requirements, `batch-operations/spec.md` with
    two), and `changes/archive/` with two completed change folders from 2026-01-14
    (`refactor-generation-pipeline`, `replace-fix-timestamps-with-regenerate`), each holding
    `proposal.md`, `design.md`, and `tasks.md`. No active change folders. Permanent capability
    specs are English; the archived change docs mix some Chinese prose.
drift: high
timeline:
  - date: 2026-01-14
    title: OpenSpec adopted
    description: >-
      First commit to `openspec/`: "chore: add agent specifications and open specs
      configuration". The same day, two change proposals were completed and archived
      ("docs(openspec): archive completed proposals and add permanent specs").
  - date: 2026-01-18
    title: Latest spec activity
    description: >-
      "docs: rename project to MioSub and update core documentation" — the last commit to touch
      the `openspec/` path.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

High. OpenSpec usage was a four-day burst in mid-January 2026: two change proposals
(`refactor-generation-pipeline`, `replace-fix-timestamps-with-regenerate`) were proposed, implemented, and
archived on 2026-01-14, and the last spec-path commit is the 2026-01-18 project rename. The project itself has
shipped continuously since — five releases from `v3.1.5` through `v3.1.9` between June and 2026-07-18, with
multiple commits on the last push day — while `openspec/` went untouched for six months. Both permanent specs
still carry the scaffolded placeholder purpose ("TBD - created by archiving change … Update Purpose after
archive"), so even the surviving specs were never finished after archiving.

## Defects and rework

Not yet assessed. The two archived change folders each include a `tasks.md`, so a future review could compare
rework on the spec-driven generation-pipeline refactor against the project's ordinary fix cadence.

## Maintenance outcomes

A single-maintainer project with a fast release tempo where OpenSpec reads as a completed experiment rather than
an ongoing practice: the framework structured one refactor and one feature replacement in January 2026, then
development returned to shipping without specs. Worth watching whether the `openspec/` tree is revived, updated,
or removed.
