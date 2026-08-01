---
name: Conductor
repo: gemini-cli-extensions/conductor
summary: >-
  Repository-native SDD plugin that carries durable product context into a
  track-based spec, plan, implementation, review, and recovery loop.
coreApproach: >-
  Treats project context as a version-controlled artifact alongside the code.
  A one-time setup records the product, guidelines, tech stack, code style, and
  team workflow under `conductor/`. Each feature or bug becomes a track under
  `conductor/tracks/<id>/` with its own `spec.md`, `plan.md`, and
  `metadata.json`; after plan approval, the agent implements tasks, updates
  shared context, reviews the result against the plan and guidelines, and can
  revert a logical track, phase, or task through Git history.
workflow:
  - "`/conductor:conductor-setup` — establish product context, guidelines, tech stack, code style, workflow preferences, and the track registry"
  - "`/conductor:conductor-new-track` — interview for a feature or bug, then write `conductor/tracks/<id>/spec.md`, `plan.md`, and `metadata.json` for approval"
  - "`/conductor:conductor-implement` — execute the approved plan task by task, checking off work and synchronizing project context on completion"
  - "`/conductor:conductor-status` — report progress across active and completed tracks"
  - "`/conductor:conductor-review` — audit completed work against the plan and project guidelines, run tests, and append a review-fixes phase when needed"
  - "`/conductor:conductor-revert` — roll back a whole track, phase, or task and reset its plan state for another attempt"
supportedTools:
  - Antigravity
  - Claude Code
maturity: emerging
strengths:
  - "Joins durable product, technology, style, and workflow context to each feature's spec and plan instead of leaving that context in chat history"
  - "Covers the delivery loop beyond artifact generation: implementation, progress tracking, review corrections, and logical-unit reverts are first-class operations"
  - "Works with both greenfield and brownfield repositories, and its plain Markdown artifacts remain visible and reviewable in Git"
  - "Human control is built into the documented flow: the plan is approved before implementation and completed work can be reviewed against both plan and guidelines"
limitations:
  - "The current installation documentation explicitly covers only Antigravity and Claude Code, a much narrower surface than broad multi-agent SDD kits"
  - "The release line is still pre-1.0, and the July 2026 move from a Gemini CLI extension to a cross-agent plugin means its packaging and interaction model are newly settled"
  - "Conductor warns that repeatedly reading project context, specifications, and plans can consume substantial tokens, especially in large projects"
  - "The documented artifact model has no requirement-ID traceability matrix or mechanical CI gate; its quality controls are carried out by the coding agent"
added: 2026-08-01
lastReviewed: 2026-08-01
featured: false
---

Conductor began as a Gemini CLI extension, but Google announced its move to a portable agent plugin in July 2026.
The [official migration announcement](https://developers.googleblog.com/evolving-spec-driven-development-conductor-now-supports-antigravity/)
preserves its original idea — persistent, version-controlled context — while making conversation, rather than a rigid
command sequence, the front door. The current [repository lifecycle](https://github.com/gemini-cli-extensions/conductor#usage--lifecycle)
still exposes explicit setup, track, implementation, status, review, and revert operations. That recent transition and
pre-1.0 release line keep the maturity rating at emerging, even though the methodology is complete enough to use today.
This assessment observes the post-migration repository at
[`99ba10e`](https://github.com/gemini-cli-extensions/conductor/tree/99ba10e1a11130fc159f681b7ba8803489239cbf).
