---
name: Hermes Feishu Streaming Card Plugin
repo: baileyh8/hermes-feishu-streaming-card
framework: superpowers
summary: >-
  A Feishu/Lark plugin for Hermes Agent Gateway that folds agent thinking, tool calls,
  approvals, and final answers into one continuously updating interactive card — with
  nearly every feature and fix since April shipped through dated design docs and plans
  under `docs/superpowers/`.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two subdirectories: `specs/` holds 22 dated design documents (e.g.
    `2026-04-24-sidecar-only-design.md`,
    `2026-07-17-issue-135-reliable-system-notice-delivery-design.md`) and `plans/` holds 32
    dated implementation plans (e.g. `2026-07-10-v3-9-operations-reliability.md`), several
    of them 25–60 KB. Filenames encode date plus release version or issue number. Specs mix
    substantial Chinese prose with English headings and identifiers; issue traffic is
    largely Chinese.
drift: none
timeline:
  - date: 2026-04-28
    title: Superpowers-style specs adopted
    description: >-
      First commit touching `docs/superpowers/` — "[codex] Complete sidecar-only Feishu
      streaming cards (#2)" — landed the phase-1 design and plan dated 2026-04-24.
  - date: 2026-07-12
    title: V4 rewrite specced and shipped
    description: "Live runtime card UX design and plan land alongside \"feat: release V4 live runtime cards\"."
  - date: 2026-07-18
    title: Latest spec activity
    description: "\"Release v4.0.12: compaction and credential visibility (#139)\" — specs updated in the release commit itself."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed. The newest of the 30 commits on `docs/superpowers/` landed on 2026-07-18, minutes before the
repo's last push, and the design docs dated 2026-07-17/18 cover exactly the issues fixed in the `v4.0.10`–`v4.0.12`
releases shipped those same days. This is a near-daily-release project, and the specs move at the same tempo as
the code — spec updates travel inside the release commits themselves.

## Defects and rework

Unusually visible: external users file bug reports and the maintainer answers with a dated design doc and
implementation plan before the fix release (issues 118, 133, 135, and 136 each have spec files named after them,
e.g. `2026-07-18-issue-135-reliable-notice-delivery.md`). The issue-135 design doc even records overruling the
reporter's proposed fix layer after analysis — rework is routed through the spec rather than around it. A dedicated
hotfix plan (`2026-07-01-v3-8-1-hotfix-commands.md`) shows the same discipline holding under time pressure.

## Maintenance outcomes

Healthy for a three-month-old project: a steady march from `v3.x` to `v4.0.12` with roughly ten tagged releases in
July alone, release-verification results recorded back into the docs (`docs: record v4.0.12 release verification`),
and fixes from external bug reports turning around in days. Six contributors have landed commits, though the
project is effectively single-maintainer with small outside patches. Too early for long-horizon maintenance
judgments.
