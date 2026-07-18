---
name: BMAD-Method
website: https://docs.bmad-method.org/
repo: bmad-code-org/BMAD-METHOD
summary: >-
  Agile AI development framework that simulates a full team of specialized
  agent personas across a four-phase lifecycle, scaling its ceremony to
  project complexity.
coreApproach: >-
  Simulates an agile team of 12+ specialized AI agent personas (PM, Architect,
  Developer, UX, and more) that facilitate structured workflows across a
  four-phase lifecycle. Planning depth auto-adjusts to project complexity,
  from bug fixes to enterprise systems. Installed via npx as a module
  ecosystem with 34+ workflows in the core module.
workflow:
  - "Phase 1 · Analysis (optional) — brainstorming, idea forging, domain/market/technical research, product brief"
  - "Phase 2 · Planning — PRD and UX workflows"
  - "Phase 3 · Solutioning — architecture, epic and story creation, implementation-readiness gate"
  - "Phase 4 · Implementation — sprint planning, story development, code review, course correction, retrospective"
  - "Parallel Quick Flow track — quick-dev and an unattended dev loop for small changes"
supportedTools:
  - Claude Code
  - Cursor
  - Codex CLI
  - Gemini Gems (planning)
  - ChatGPT Custom GPTs (planning)
maturity: established
strengths:
  - "Broadest lifecycle coverage of the frameworks tracked here — ideation through retrospective, not just spec-to-code"
  - "Modular ecosystem (builder, test architect, game dev, creative suite) plus web bundles that offload planning to flat-rate LLM subscriptions"
  - "Scale-adaptive planning depth, with a help workflow that guides users to the next step"
  - "Free and open source with a large, active community and frequent releases"
limitations:
  - "Heavyweight and ceremony-rich compared to lighter SDD kits — many agents, phases, and workflows to learn"
  - "V6 was a breaking restructure; upgrading from v4/v5 requires a dedicated migration guide"
  - "Prerequisites span Node.js 20.12+, Python 3.10+, and uv"
  - "The repo does not visibly dogfood its own story/PRD artifacts in-tree, and BMAD/BMad are trademarks with usage restrictions"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: true
---

BMAD reads less like a spec format and more like an operating model: it recreates the roles of an agile team as
agent personas and routes work through their ceremonies. That makes it the most complete lifecycle of the tracked
frameworks and also the heaviest. Its repository moved from `bmadcode/BMAD-METHOD` to the `bmad-code-org`
organization, and GitHub reports its license as "Other" because the MIT text carries a custom preamble. Well-starred
active adopters are hard to observe in public — code search finds ~400 v4-era `.bmad-core` configs, but the most
visible ones have gone idle — so evidence of long-term outcomes is currently thin.
