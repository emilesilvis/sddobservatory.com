---
name: Sokuji
repo: kizuna-ai-lab/sokuji
framework: superpowers
summary: >-
  Live speech translation for meetings — an Electron desktop app and Chrome extension mixing
  on-device AI models with cloud providers — where features ship through dated Superpowers
  plan and design-spec documents.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
    - HTML
  notes: >-
    `plans/` holds 121 dated implementation plans (e.g. `2026-04-04-audio-pipeline-redesign.md`,
    `2026-07-19-soniox-both-single-session.md`) and `specs/` holds 95 design documents (e.g.
    `2026-06-21-native-python-sidecar-local-inference-design.md`), plus a one-file `notes/`
    spike log and an HTML mockup in `demos/`. Plans carry the framework's agent boilerplate
    (`superpowers:executing-plans`, `superpowers:subagent-driven-development`) and link back to
    their design specs.
drift: none
timeline:
  - date: 2026-03-12
    title: Superpowers adopted
    description: "First plan file (`plans/2026-03-13-unify-main-panels.md`) added in commit
      'refactor(ui): unify MainPanel and SimpleMainPanel into single component'; the first
      design spec ('docs: add SignPath Windows code signing design spec') followed the next
      day."
  - date: 2026-06-21
    title: Major migration decomposed into phase plans
    description: "A native Python sidecar for local inference was planned as one design spec
      plus ten phase plans landed over a single day, starting with 'docs(native):
      Python-sidecar local-inference design + Phase 1 plan'."
  - date: 2026-07-19
    title: Latest spec activity
    description: "Spec-path commit 'fix(soniox): discard connect/reconnect that completes
      after disconnect; fail streams fast on pre-open close' landed the same day as the
      `v0.33.0` release."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed. 276 commits have touched `docs/superpowers/` since adoption in March 2026, and the newest one
landed on the same day as the repository's latest push and the `v0.33.0` release — in a project that ships
near-daily, the spec path keeps pace exactly. Plans for in-flight work are dated to the current day
(`plans/2026-07-19-soniox-both-single-session.md`), and follow-up fixes update the plan documents in the same
commits as the code.

## Defects and rework

Not yet assessed as a trend. What is visible now is that rework is recorded inside the spec corpus itself:
plans receive self-review revisions before execution (e.g. "docs(plans): concretize mode selector in
Soniox both-session plan (self-review)") and design specs gain dated addenda that newer plans cite, so the
paper trail from defect to plan change is unusually legible for a future review.

## Maintenance outcomes

Too early to score, but the tempo is notable: a small team (seven contributors) has shipped frequent tagged
releases while routing roughly a plan-plus-spec pair per feature through `docs/superpowers/`, including a
ten-phase plan decomposition for a native local-inference sidecar that later shipped as its own
`sidecar-v0.1.x` release line. Whether the plan discipline survives contributor growth is the thing to watch.
