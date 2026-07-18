---
name: Agent OS
website: https://buildermethods.com/agent-os
repo: buildermethods/agent-os
summary: >-
  Standards-first system that extracts your codebase's real conventions and
  injects them into agent context to shape better specs.
coreApproach: >-
  Standards-first: extract the codebase's actual conventions into documented
  standards, inject the relevant ones into agent context on demand, and use
  them to shape specs. Version 3 deliberately retired its own task-breakdown
  and implementation orchestration, deferring to native tool features like
  Claude Code's plan mode.
workflow:
  - "`/discover-standards` — surface and document patterns from the codebase"
  - "`/index-standards` — keep standards organized and discoverable"
  - "`/inject-standards` — deploy relevant standards into any context: conversations, plans, skills"
  - "`/plan-product` — establish product mission and planning docs"
  - "`/shape-spec` — enhance plan mode with targeted questions informed by standards and mission; the resulting plan is saved to the Agent OS spec folder"
supportedTools:
  - Claude Code
  - Cursor
  - Windsurf
  - Codex
  - Antigravity
maturity: emerging
strengths:
  - "Lightweight and tool-agnostic — everything is Markdown, usable by any agent that reads files"
  - "Distinct niche: standards discovery and injection that complements modern plan modes instead of duplicating them"
  - "Profile system supports different stacks and teams, with standards syncing back to base profiles"
  - "Honest v3 philosophy — cut the features frontier tools now do better rather than accreting them"
limitations:
  - "Effectively a single-maintainer project (Brian Casel / Builder Methods)"
  - "Least active of the tracked frameworks — no release since v3.0.0 in January 2026"
  - "No longer covers implementation or orchestration, so it depends on external tools to complete the SDD loop"
  - "Smallest community of the tracked frameworks, with an adopter base that skews to small personal repos"
exampleRepos:
  - artisan-build/dogfood
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

Agent OS is the contrarian entry: where other frameworks add process, v3 removed it. Its thesis is that plan modes
in frontier tools already do task breakdown well, and what they lack is knowledge of *your* codebase's conventions
— so that is the only problem it tries to solve. Whether a deliberately narrow, single-maintainer tool can hold its
niche as agent platforms absorb more of the workflow is exactly the kind of question this observatory exists to
watch.
