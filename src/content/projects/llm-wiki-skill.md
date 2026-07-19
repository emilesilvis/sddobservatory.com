---
name: llm-wiki
repo: sdyckjq-lab/llm-wiki-skill
framework: superpowers
summary: >-
  A personal knowledge-base skill implementing Andrej Karpathy's `llm-wiki` methodology across
  Claude Code, Codex, OpenClaw, and Hermes, plus a companion agent workbench (`workbench/`) and a
  shared interactive graph engine — all developed through `superpowers` plan and design documents.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
    - PNG
  notes: >-
    Two subdirectories: `plans/` (12 dated implementation plans, e.g.
    `2026-07-03-community-view-phase2-local-map.md`) and `specs/` (14 dated design docs, e.g.
    `2026-07-16-issue-159-graph-model-modules-design.md`), each with a PNG visual reference.
    Plans use checkbox task syntax and instruct agents to run `superpowers:subagent-driven-development`
    or `superpowers:executing-plans`. Completed docs are pruned rather than archived — spec-path
    commits reach back to 2026-05-13 but the oldest surviving file is dated 2026-06-20.
drift: low
timeline:
  - date: 2026-05-13
    title: Superpowers workflow adopted
    description: "First design doc added to `docs/superpowers/specs/` — commit \"docs: design graph node dragging\"."
  - date: 2026-07-16
    title: Largest design doc lands
    description: >-
      `2026-07-16-issue-159-graph-model-modules-design.md` specifies retiring the graph engine's
      `legacy-helpers.ts` toolbox; the corresponding refactor merged two days later.
  - date: 2026-07-17
    title: Latest spec activity
    description: "Commit \"docs(graph): record issue 159 ticket review\"."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. `docs/superpowers/` is a living workspace — 46 commits between 2026-05-13 and 2026-07-17 — and the newest
design doc (`2026-07-16-issue-159-graph-model-modules-design.md`, a plan to dissolve the 1,414-line
`packages/graph-engine/src/model/legacy-helpers.ts`) directly preceded the legacy-toolbox retirement merged on
2026-07-18. Against a tempo of dozens of commits per day, the one-day gap between the latest spec commit and the
latest push is negligible. Two caveats keep this at low rather than none: completed docs are deleted rather than
archived, which erases the historical record, and the repo runs parallel planning systems (`docs/plans/` phased
plans with JSON progress files, `docs/adr/`), so the `superpowers` folder covers mainly the graph-engine and
workbench workstream.

## Defects and rework

Rework is visibly routed back through the workflow: `2026-06-30-pr82-drawer-recovery.md` and its paired design
doc treat the recovery of a failed pull request as a first-class plan/spec cycle, and the `issue-159` design
records a verified baseline ("761 graph-engine tests passing", clean worktree) before work begins. Defect
trends beyond these workflow signals are not yet assessed.

## Maintenance outcomes

Early but promising: within two months of adoption the workflow has carried a sustained hardening campaign —
Sigma renderer subsystem boundaries, a camera frame contract, and the removal of a `@ts-nocheck` legacy module —
on an actively shipped TypeScript monorepo, driven by a small group of five contributors at very high daily
tempo. One release tag (`v2.1.0`) exists; long-term maintenance effects are not yet assessed.
