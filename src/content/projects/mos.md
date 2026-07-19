---
name: Mos
repo: Caldis/Mos
framework: superpowers
summary: >-
  macOS scroll-smoothing utility (est. 2017, Swift) that adopted the
  Superpowers spec/plan workflow in March 2026 for feature work such as
  Logitech HID++ integration and custom shortcut bindings.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two directories: `specs/` (ten date-prefixed design documents such as
    `2026-03-16-logitech-hid-integration-design.md`, 7.5–67 KB) and `plans/`
    (thirteen implementation plans — ten matching the specs plus kickoff and
    follow-up docs — up to 119 KB). Spec and plan commits land in pairs per
    feature, with iterative review commits folding in agent-review rounds.
    Design docs and commit messages mix Chinese prose with English structure
    and identifiers.
drift: low
timeline:
  - date: 2026-03-16
    title: Superpowers workflow adopted
    description: >-
      First spec/plan pair: `docs: add Logitech HID++ 2.0 hardware button
      integration design spec` plus its implementation plan, committed the
      same day.
  - date: 2026-04-25
    title: Multi-round agent review on consolidation spec
    description: >-
      The `logi-module-consolidation` design was revised through four
      same-day review rounds, including `docs(spec): logi consolidation v2 —
      fold 27 codex findings`.
  - date: 2026-06-17
    title: Latest spec activity
    description: >-
      `STEP 03` `ScrollActionPort` spec and plans, closing with a wrap-up
      plan commit covering the `DGCharts` migration, `ModifierFlagsProviding`,
      and a doc refresh.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. The spec/plan practice ran from 2026-03-16 to 2026-06-17 — 29 commits on `docs/superpowers/` in paired
design-doc and implementation-plan sets — and includes an explicit re-sync commit (`docs+l10n: sync OpenTarget
spec to current implementation, machine-translate to 10 locales`). At first assessment the repository had kept
shipping for about a month past the last spec commit, including two features (a `HAPTIC` debug-panel control and
Logitech receiver multi-device handoff) that landed without spec/plan pairs. The specs are per-feature design
documents rather than a living system spec, so the quiet month reads mostly as a lull, with mild leakage of
un-specced feature work.

## Defects and rework

Not yet assessed as an outcome, but the history shows notable review discipline on the documents themselves: the
`logi-module-consolidation` spec absorbed four review rounds in one day (e.g. `fold 27 codex findings`), the
`Toast` spec absorbed two, and a post-implementation commit (`fix: address Codex review round 2 — ButtonBinding
sentinel/payload invariant`) corrected an invariant the review caught. A promising place to measure rework later.

## Maintenance outcomes

Not yet assessed. Mos is a 2017-era native utility with an active release train (4.x releases through May 2026);
the question it can answer over time is whether the spec/plan habit survives beyond the Logitech-integration push
that motivated its adoption.
