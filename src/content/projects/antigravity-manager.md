---
name: Antigravity Manager
repo: Draculabo/AntigravityManager
framework: openspec
summary: >-
  An Electron desktop app for managing Antigravity IDE accounts and processes —
  account switching, backups, and AI resource pools — with OpenSpec in the repo
  from its very first commit.
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
  notes: >-
    A `project.md` conventions file plus `changes/` holding seven change folders
    (e.g. `refactor-db-drizzle`, `update-device-fingerprint-hardening`,
    `add-multiarch-release-artifacts`), each typically containing `proposal.md`,
    `tasks.md`, `design.md`, and a `specs/<capability>/spec.md` — 28 Markdown
    files in all, with no archive directory.
drift: high
timeline:
  - date: 2025-12-01
    title: OpenSpec adopted at birth
    description: >-
      The repository's "Initial Commit" already included eight `openspec/`
      files — the framework was in place from day one.
  - date: 2026-02-07
    title: Proposals backfilled
    description: "Commit \"docs(openspec): backfill missing proposals\" — specs were catching up to already-landed work."
  - date: 2026-02-09
    title: Latest spec activity
    description: "Commit \"docs: upgrade openspec workflow (#85)\" — the last change to the spec directory to date."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

High. Only six commits ever touched `openspec/`, all between 2025-12-01 and 2026-02-09, while the codebase kept
shipping through mid-July 2026 — three releases in June alone, and pull-request numbers roughly tripling since the
last spec commit. Recent feature work (a cloud account pool, proxy gateway streaming, tray localization) landed
with no corresponding change folders, and the seven folders under `openspec/changes/` sit unarchived. The February
commit `docs(openspec): backfill missing proposals` suggests specs were already trailing code before spec activity
stopped entirely.

## Defects and rework

Not yet assessed.

## Maintenance outcomes

Not yet assessed in depth. The project's release cadence (three tagged releases in June 2026, 22 contributors)
shows that abandoning the spec workflow has not visibly slowed shipping — but there is no pre-drift baseline to
compare against, so this remains an open question for a future review.
