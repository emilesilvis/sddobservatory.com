---
name: ArcReel
repo: ArcReel/ArcReel
framework: superpowers
summary: >-
  Open-source AI video workspace powered by AI agents — novel to character, scene, and prop design
  to script, storyboard, and video, with cross-shot consistency — built almost entirely through
  Superpowers plan/design-doc pairs.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    143 Markdown files in three subdirectories: `plans/` holds 72 dated implementation plans
    (checkbox task lists that invoke `superpowers:executing-plans`), `specs/` holds 70 matching
    design docs suffixed `-design.md`, and `release-notes/` holds one entry. Files pair up under a
    `YYYY-MM-DD-<topic>` convention, e.g. `2026-05-18-log-persistence.md` and
    `2026-05-18-log-persistence-design.md`.
drift: moderate
timeline:
  - date: 2026-02-06
    title: Superpowers workflow present from the first commit
    description: >-
      The initial commit (`chore: initialize project from template`) already carried dated plans
      and design docs under the earlier `docs/plans/` path, the oldest dated 2026-01-21 —
      spec-first from day one.
  - date: 2026-03-17
    title: "`docs/superpowers/` directory created"
    description: "First files on the tracked path — an Alembic best-practices plan and design doc — landed in commit #115."
  - date: 2026-05-21
    title: Spec tree consolidated and curated
    description: >-
      Commit #595 ("docs: verify and clean up outdated design documents", translated) renamed 36
      legacy `docs/plans/` files into `docs/superpowers/` and deleted 10 stale docs.
  - date: 2026-05-23
    title: Latest spec activity
    description: >-
      Commit #620 ("fix(logging): move log directory out of the projects root + harden migration
      and agent sandbox", translated) touched the log-persistence plan and spec; the tree has been
      static since.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Moderate. The spec tree has been frozen since 2026-05-23 while the project ships at high tempo — four releases
(`v0.19.1` through `v0.22.0`) landed in the eight weeks since, none adding plans or specs here. The staleness
looks like deliberate process migration rather than neglect: a May 2026 curation pass verified the docs and
deleted ten stale ones, and `AGENTS.md` now routes new design work through `docs/adr/` (active through
2026-07-17) and spec-labelled GitHub issues, leaving `docs/superpowers/` as an archive of completed work that
newer code no longer updates.

## Defects and rework

Rework was routed back through the same spec workflow rather than patched ad hoc: bug fixes got their own
plan/design pairs (e.g. `2026-03-23-session-memory-leak-fix`, `2026-04-02-grok-issues-fix`), and plans embed
test-first checkboxes ("write failing test" steps) per task. Whether spec-driven changes regressed less than
untracked ones is not yet assessed.

## Maintenance outcomes

A striking velocity case: from template initialization (2026-02-06) to a released multi-provider product
(`v0.22.0` by 2026-07-15) in about five months, with roughly 70 design docs covering the buildout across 11
contributors. The specs stayed load-bearing after implementation — the living `AGENTS.md` architecture guide
cites individual design docs (e.g. `2026-04-13-session-actor-design.md`) as the reference for subsystems. The
open question is the migration away from the tracked directory: whether ADRs plus issue-tracked specs preserve
the same spec-to-code traceability.
