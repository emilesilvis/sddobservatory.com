---
name: Logitune
repo: mmaher88/logitune
framework: superpowers
summary: >-
  A Linux configuration app for Logitech devices (an Options+ clone) that has routed nearly every
  feature and bug fix through paired Superpowers design specs and implementation plans since its
  first week.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two subdirectories: `plans/` holds 29 dated implementation plans (e.g.
    `2026-04-24-semantic-action-presets.md`, `2026-04-15-editor-mode.md`) and `specs/` holds 21
    design documents suffixed `-design.md` (e.g. `2026-04-13-optionsplus-extractor-design.md`).
    Everything is Markdown with `YYYY-MM-DD-topic.md` naming; the largest plans run past 90 KB.
drift: low
timeline:
  - date: 2026-03-29
    title: Superpowers adopted
    description: "First commit to `docs/superpowers/` — `refactor: pluggable architecture with interfaces and device descriptors` — landed the initial plans and design specs four days after the repository was created."
  - date: 2026-04-29
    title: Largest spec-driven feature merged
    description: "`Semantic action presets with per-DE invocation (closes #110) (#113)` merged alongside its roughly 100 KB implementation plan and paired design spec."
  - date: 2026-06-19
    title: Latest spec activity
    description: "`ci: derive Debian QML deps from code, gate drift in CI + pre-push (#138)` — a spec-and-plan-backed fix for a shipped packaging defect, landed in the same push as the repository's latest activity."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. The newest of the 22 commits touching `docs/superpowers/` lands in the very same push as the repository's
latest activity, and every substantive feature since adoption arrives with a paired design spec and implementation
plan in the same PR. Two caveats keep this from "none": a late-April burst of CI and packaging fixes went in
code-only, and completed plans are point-in-time documents that are not revised when later refactors supersede
them (the `AppController` to `AppRoot` extraction, for example, renames classes that earlier plans still describe)
— though dated, immutable plans are how the Superpowers model is meant to work.

## Defects and rework

Defects get the same treatment as features here. Bug fixes such as `2026-04-19-stale-property-notifys.md` and
`2026-04-20-appindicator-detection.md` went through the full spec-plus-plan pipeline, and the June fix is the
standout: a Ubuntu package shipped missing `qml6-module-qtquick-dialogs`, so the app started with no window; the
resulting `2026-06-13-code-derived-debian-deps-design.md` documents the defect and replaces the hand-maintained
dependency list with one derived from QML `import` statements, gated against drift in CI and pre-push. Testing is
also specced — a comprehensive test-plan spec plus phased implementation plans (including a behavioral suite and
hardware-test phases) sit in the same tree.

## Maintenance outcomes

Early but notable. With three contributors — essentially a solo maintainer — the project sustained roughly 50
dated spec documents across three months while shipping ten tagged releases (`v0.2.3` through `v0.3.6`) with
multi-distro packaging. The most recent maintenance change converted a recurring class of packaging drift into a
generated, CI-checked artifact, which suggests the spec habit is being used to prevent defect classes rather than
just to plan features.
