---
name: yserver
repo: joske/yserver
framework: superpowers
summary: >-
  A modern X11 server written from scratch in Rust, developed spec-first from day one — every
  feature phase flows through dated design docs, implementation plans, and findings under
  `docs/superpowers/`.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Five subdirectories of dated Markdown artifacts: `plans/` (107 files), `specs/` (55),
    `findings/` (17), `notes/` (1), and `status/` (1). Plans pair with `-results.md` companions
    (e.g. the `rendering-rearchitecture-phase*` series), and `findings/` holds root-cause
    diagnoses like `2026-07-08-mate-compositor-drag-smear-diagnosis.md`.
drift: high
timeline:
  - date: 2026-04-27
    title: Superpowers adopted at project creation
    description: 'First spec-path commit — "docs: design for property storage + shared server state" — landed the day the repository was created.'
  - date: 2026-07-11
    title: Spec-tree retention audit
    description: '`status/2026-07-11-doc-retention-audit.md` inventoried the tree and classified 131 of its files as unreferenced "migration archaeology" to be archived.'
  - date: 2026-07-16
    title: Latest spec activity
    description: '"fix(grab): unify pointer-grab ownership + Xorg-faithful guard/attribution/lifetime" — spec, plan, and implementation for grab-ownership unification.'
added: 2026-07-19
lastReviewed: 2026-08-31
---

## Spec-to-code drift

High (`H1`). The live Present completion-clock design marks two rules as invariants: active sequence events cannot
release Pixmap completions, and only a sequence observed while idle may advance the completion clock. A post-spec
fix now makes explicitly tagged absolute sequence events completion-eligible even while a page flip is active,
directly reversing that core pacing rule. A second change replaces the claimed sole post-copy host wake with GPU
fence publication into the client's release timeline. Split-SoC render-node resolution and syncobj ownership fixes
remain covered by affirmative live claims.

The editorial v4 review covered all 67 nominated spec artifacts, 4,476 compiler-owned claim candidates, and the
complete 90-day first-parent window without using the OpenAI API. See the
[manual assessment record](https://github.com/emilesilvis/sddobservatory.com/blob/main/docs/research/drift-assessments/2026-08-31-yserver-e8b050cba338-manual.json).

## Defects and rework

Rework is unusually visible. `findings/` holds 17 dated root-cause documents (e.g.
`2026-06-09-glx-tfp-radv-export-rootcause.md`, `2026-07-08-mate-compositor-drag-smear-diagnosis.md`), and the
latest cycle explicitly targets a recurring bug class: the grab-ownership plan unifies three parallel grab
fields so that the "release routes to the wrong client / grab lingers" defect class collapses. Commit messages
show specs absorbing revision before code does ("codex-clean after 2 review rounds", "KMS teardown fix plan
v4").

## Maintenance outcomes

In under three months the project went from bootstrap to running full MATE, XFCE, and Cinnamon desktops,
tagging `v1.0.0` through `v1.3.0` along the way, with four contributors working through the shared spec tree.
The retention audit is itself a maintenance signal: the team treats the spec corpus as something to curate,
not a write-only log.
