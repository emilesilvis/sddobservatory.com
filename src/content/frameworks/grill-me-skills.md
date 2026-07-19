---
name: Grill-Me Skills
website: https://skills.sh/mattpocock/skills
repo: mattpocock/skills
summary: >-
  Matt Pocock's composable family of agent skills built around "grilling" — a
  relentless one-question-at-a-time interview that aligns human and agent
  before code is written — chaining into spec, tickets, and TDD implementation.
coreApproach: >-
  Deliberately anti-pipeline: the README names Spec Kit and BMAD as approaches
  that "own the process" at the cost of user control, and offers small,
  hackable, composable skills instead. The core primitive is `grilling` — walk
  the plan's decision tree one question at a time, each question paired with a
  recommended answer, reading the codebase for anything it can settle itself.
  Two front doors wrap it: `grill-me` (stateless, leaves no artifacts) and
  `grill-with-docs` (writes a `CONTEXT.md` ubiquitous-language glossary and
  sparing ADRs as terms and decisions resolve), feeding a
  spec → tickets → implement chain the user drives step by step.
workflow:
  - "`/setup-matt-pocock-skills` — one-time per-repo config: issue tracker (GitHub, Linear, or local files), triage labels, doc locations"
  - "`/grill-me` or `/grill-with-docs` — one-question-at-a-time interview down the plan's decision tree; the docs variant captures terms into `CONTEXT.md` and hard-to-reverse decisions into ADRs inline"
  - "`/to-spec` — synthesize the settled conversation into a spec (problem, user stories, seams, out-of-scope) and publish it to the tracker, without re-interviewing"
  - "`/to-tickets` — split the spec into tracer-bullet vertical-slice tickets, each declaring its blocking edges"
  - "`/implement` — build the tickets via red-green-refactor TDD at the pre-agreed seams, then run `/code-review` (standards + spec axes) and commit"
  - "`/wayfinder` — optional upstream step for efforts too big for one session: chart a map of investigation tickets first"
supportedTools:
  - Claude Code
  - Codex
  - Any skills-compatible agent
maturity: emerging
strengths:
  - "Small, composable, editable skills instead of a phase-gated pipeline — the user keeps control of the process and can debug it"
  - "One question at a time with a recommended answer each; questions the codebase can settle are answered by reading, not asking"
  - "`grill-with-docs` leaves durable in-repo artifacts — a `CONTEXT.md` glossary and sparing ADRs — building a DDD-style ubiquitous language that cuts agent verbosity"
  - "Tracer-bullet vertical-slice tickets with explicit blocking edges, so several agents can work the frontier in parallel"
  - "Explosive adoption (176k+ stars within six months) and two install philosophies: hackable copies via skills.sh, or a managed Claude Code plugin"
limitations:
  - "Deliberately not turnkey — you orchestrate the chain yourself, and the interview-driven flow demands sustained human attention per change"
  - "The engineering chain needs per-repo setup (tracker, triage labels, doc locations) before `to-spec` and `to-tickets` work"
  - "Specs and tickets publish to the issue tracker rather than versioning in-repo — only the glossary and ADRs live in the tree, so spec-to-code drift is hard to observe"
  - "Young and fast-moving under a single maintainer, with skills still being deprecated and reshaped (`deprecated/` and `in-progress/` directories in-tree)"
exampleRepos:
  - mattpocock/course-video-manager
added: 2026-07-18
lastReviewed: 2026-07-18
featured: true
---

The grill-me family is the explicit counter-position to the pipelines tracked elsewhere in this observatory: its
README argues that frameworks like Spec Kit and BMAD help by owning the process, but in doing so take away control
and make process bugs hard to fix. Its bet is the opposite — that alignment (via the grilling interview) matters
more than artifacts, and that the durable in-repo record should be a vocabulary (`CONTEXT.md`) and decision log
(ADRs) rather than regenerable specs, which it publishes to the issue tracker as coordination artifacts instead.
Unusually for the category, the repo dogfoods its own method: an `.agents/` directory, in-tree ADRs, and
changeset-driven releases.
