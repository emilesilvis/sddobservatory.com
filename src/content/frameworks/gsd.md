---
name: GSD (Get Shit Done)
website: https://opengsd.net
repo: open-gsd/gsd-core
summary: >-
  Context-engineering-first SDD loop — fresh-context subagents, persistent
  state artifacts, and phase-gated milestones — continued by the community
  OpenGSD org after the original repo was archived.
coreApproach: >-
  Treats context rot as the core failure mode of long agent sessions. Work is
  broken into milestone phases executed by fresh-context subagents in parallel
  git worktrees, while continuity lives in structured artifacts like `STATE.md`
  and `CONTEXT.md` rather than in the conversation itself. A Node CLI installs
  the same hyphen-style slash-command workflow into a dozen-plus runtimes.
workflow:
  - "`/gsd-new-project` — interactive setup with research, requirements, and roadmap (or `/gsd-onboard` for existing codebases)"
  - "`/gsd-discuss-phase` — lock implementation preferences and assumptions"
  - "`/gsd-plan-phase` — research, planning, and feasibility verification"
  - "`/gsd-execute-phase` — parallel execution in isolated worktrees with clean contexts"
  - "`/gsd-code-review` — structured review before human verification"
  - "`/gsd-verify-work` — manual UAT of the built work"
  - "`/gsd-ship` — create the pull request and archive the phase"
  - "`/gsd-complete-milestone` — audit requirements coverage, tag, and finalize"
supportedTools:
  - Claude Code
  - GitHub Copilot
  - OpenCode
  - Cursor
  - Windsurf
  - Cline
  - Codex
  - Qwen Code
  - Kilo
  - CodeBuddy
  - Augment
  - Antigravity
  - Trae
  - Hermes
maturity: emerging
strengths:
  - "Context engineering is the product: fresh-context subagents plus `STATE.md`/`CONTEXT.md` continuity directly target context rot, which most other kits ignore"
  - "Covers the full loop from idea to PR — research, planning, parallel worktree execution, code review, UAT, and shipping"
  - "One `npx` installer deploys the same workflow across 14 runtimes, with router bundles for tools that can't nest skills"
  - "Growing companion ecosystem under the OpenGSD org — `gsd-browser` for verification evidence, `gsd-pi` as a standalone harness"
limitations:
  - "Governance churn: the original repo (`gsd-build/get-shit-done`, ~65k stars) was archived in June 2026, and the community is still consolidating around the `gsd-core` continuation"
  - "Large command surface (~30 slash commands) with its own vocabulary of milestones, phases, seeds, and threads — a real learning curve"
  - "The Node.js/`npx` installer is mandatory; manually copying files between runtimes is unsupported"
  - "Claude Code-first heritage shows — several runtimes need namespace-router workarounds for non-recursive skill loading"
exampleRepos:
  - UniClipboard/UniClipboard
  - bonigarcia/context-engineering
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

GSD is the observatory's clearest governance case study. The original repo by TÂCHES went from creation in December
2025 to roughly 65k stars in six months — the fastest rise of any SDD tool we track — and was then archived in June
2026, with development handed to the community OpenGSD org, whose site now states that "trust is part of the
product". Its thesis also stands apart: where Spec Kit treats the spec as the durable artifact, GSD treats context
as the scarce resource, and its state files exist so that agents survive session resets. GitHub code search finds
140-odd public repos carrying GSD state files; whether that adopter base follows the star count to the new repo is
exactly what the metrics here are for.
