---
name: GitHub Spec Kit
website: https://github.github.io/spec-kit/
repo: github/spec-kit
summary: >-
  Open-source toolkit from GitHub that scaffolds a phase-gated, spec-first
  workflow into any of 40+ AI coding agents.
coreApproach: >-
  Treats specifications as executable artifacts that directly generate working
  implementations rather than just guiding them. The `specify` CLI scaffolds a
  phase-gated slash-command workflow — grounded in a project "constitution" of
  governing principles — into whichever AI coding agent you use.
workflow:
  - "`/speckit.constitution` — create project governing principles"
  - "`/speckit.specify` — define what to build (requirements, user stories)"
  - "`/speckit.clarify` — optionally resolve underspecified areas before planning"
  - "`/speckit.plan` — technical implementation plan with the chosen tech stack"
  - "`/speckit.tasks` — generate an actionable task list (optionally converted to GitHub issues)"
  - "`/speckit.analyze` — optional cross-artifact consistency check"
  - "`/speckit.implement` — execute all tasks"
  - "`/speckit.converge` — assess the codebase against spec, plan, and tasks; append remaining work"
supportedTools:
  - Claude Code
  - GitHub Copilot
  - Cursor
  - Gemini CLI
  - Codex
  - Amp
  - Cline
  - OpenCode
  - Qwen Code
  - Kiro
  - Zed
  - Goose
maturity: established
strengths:
  - "Backed by GitHub, with a fast release cadence and very high activity"
  - "Widest agent integration surface of any SDD kit — 40+ agents and IDEs plus a generic fallback for unlisted ones"
  - "Extensible via extensions, presets, bundles, and project-local template overrides"
  - "Optional quality gates (`/speckit.clarify`, `/speckit.analyze`, `/speckit.checklist`) act as unit tests for English"
limitations:
  - "GitHub still frames the methodology as experimental, and the multi-phase ceremony can be heavy for small changes"
  - "Requires a Python/uv toolchain for the Specify CLI on top of the coding agent itself"
  - "Dogfooding is partial — the repo's own `.specify/` holds only a constitution, with no in-tree feature specs"
  - "The template/override stack (core vs extension vs preset vs local) adds configuration complexity"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: true
---

Spec Kit is the highest-profile SDD framework — created 2025-08-21 and past 120k stars within a year. Its bet is
that the spec, not the code, is the durable artifact: the same specification should be able to regenerate an
implementation through any of its 40+ supported agents. Interestingly, the project only partially dogfoods its own
method: its `.specify/` directory carries a constitution but no feature specs, so watching how adopters (rather
than the kit itself) maintain specs over time is where the evidence is.
