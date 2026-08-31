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
drift: moderate
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
lastReviewed: 2026-08-31
---

## Spec-to-code drift

Moderate (`M1`). Manual review found one in-scope behavior absent from the live spec corpus: after a KVM or
other-host round trip, Logitune now forces the main wheel's diversion target back to hardware/native mode so
scrolling does not silently stop. The corpus governs high-resolution wheel behavior and the exact scroll test
surface, but it does not state that target-bit invariant or the observable post-KVM outcome. Other retained changes
— Hyprland integration and active-profile DPI/SmartShift persistence — follow affirmative live design contracts.

The editorial v4 review covered all 21 nominated spec artifacts, 1,081 compiler-owned claim candidates, and the
complete 90-day first-parent window without using the OpenAI API. See the
[manual assessment record](https://github.com/emilesilvis/sddobservatory.com/blob/main/docs/research/drift-assessments/2026-08-31-logitune-6c1d66fc4fde-manual.json).

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
