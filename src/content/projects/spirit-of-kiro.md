---
name: Spirit of Kiro
repo: kirodotdev/spirit-of-kiro
framework: kiro
summary: >-
  A game built with and powered by generative AI by the Kiro team — Kiro's own
  public showcase project.
status: active
specStructure:
  location: .kiro/
  formats:
    - Markdown
  notes: >-
    Currently contains only `steering/` (steering files); no `specs/` directory
    remains on the default branch. Kiro's spec dogfooding is better observed
    in kirodotdev/Kiro, whose `.kiro/specs/github-issue-automation/` holds
    `requirements.md`, `design.md`, and `tasks.md`.
drift: high
timeline:
  - date: 2025-05-09
    title: Kiro artifacts introduced
    description: First commit touching the .kiro/ directory.
  - date: 2025-07-02
    title: Last .kiro/ change
    description: '"Adding the right steering files to main" — the last time spec artifacts were touched.'
  - date: 2026-07-15
    title: Code development continues
    description: Latest code commit, with .kiro/ untouched for over a year.
added: 2026-07-18
lastReviewed: 2026-07-18
---

## Spec-to-code drift

High. The `.kiro/` directory hasn't changed since July 2025 while code development continued through July 2026,
and only steering files — not specs — remain in-tree. Whatever spec-driven process produced the game, its artifacts
are no longer maintained alongside the code.

## Defects and rework

Not yet assessed.

## Maintenance outcomes

A cautionary data point from a vendor's own showcase: even a first-party demo can end up with abandoned spec
artifacts once the launch push is over. It also illustrates a measurement gap this observatory has to live with —
for closed-source tooling, in-tree artifacts are the only observable trace of the process, and they may not
reflect how the team actually works day to day.
