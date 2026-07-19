---
name: Folo
repo: RSSNext/Folo
framework: superpowers
summary: >-
  AI RSS reader (TypeScript) that drove one substantial feature — its
  over-the-air update service `apps/ota` — from design spec to shipped
  implementation through a superpowers spec-and-plan cycle over three days in
  April 2026.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two spec/plan pairs: `specs/` holds `2026-04-10-ota-design.md` and
    `2026-04-11-desktop-ota-unification-design.md`, genuine design docs
    (Summary / Goals / Non-Goals / Key Decisions), each with a much larger
    matching implementation plan in `plans/` (the desktop unification plan
    alone is about 1,400 lines). All four files describe a single initiative:
    a standalone OTA update service in `apps/ota` built on Expo Updates and
    Cloudflare Workers/R2.
drift: moderate
timeline:
  - date: 2026-04-10
    title: OTA design spec added
    description: "First commit to `docs/superpowers/`: `docs(ota): add OTA service design spec`. Scaffolding of `apps/ota` began within minutes."
  - date: 2026-04-11
    title: Desktop unification spec added
    description: "`docs(spec): add desktop ota unification design`."
  - date: 2026-04-12
    title: OTA implementation landed
    description: "`feat(ota): unify desktop updates with ota service` — a 42-file commit that also added the desktop implementation plan; the last substantive commit under `docs/superpowers/`."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Moderate, with the nuance common to bounded adoptions. One feature went spec → plan → implementation in three
days in April 2026: the `apps/ota` scaffold commit landed twelve minutes after the design spec, and the 42-file
implementation commit followed on 2026-04-12. Since then `docs/superpowers/` has been dormant — its only later
commit is an incidental three-line edit from a dependency-update PR (`chore(deps): update frontend dependencies
(#5038)`, 2026-07-10) — while `apps/ota` picked up follow-up fixes through late May and the repository as a whole
ships near-daily. The specs still describe the initiative they were written for, but none of the later OTA fixes
updated them, and divergence has not been audited. This reads as a single-initiative adoption rather than an
embedded team practice.

## Defects and rework

A short, ordinary shakedown tail followed the launch: fixes within days (`fix(ota): restore desktop binary
manifest updates`, `fix(ota): harden store sync and observability`, both 2026-04-15) and stragglers into May
(`fix(ota): include Expo config in manifests`; `fix(download): route direct downloads through ota`). Roughly half
a dozen fix commits against a service built in three days is unremarkable; whether it is better or worse than the
project's baseline has not been measured.

## Maintenance outcomes

The spec-driven service appears to have reached stability — since late May 2026 the only change under `apps/ota`
has been a dependency chore, while the app keeps shipping desktop and mobile releases that depend on it. The
signal to watch is whether the practice returns for a second feature: a heavily shipped consumer app trying SDD
once, succeeding, and not (yet) repeating it is itself a data point.
