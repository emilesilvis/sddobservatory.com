---
name: SpecBuddy
website: https://specbuddy.dev
summary: >-
  A JetBrains IDE plugin that makes any AI coding agent spec-driven — write a
  spec and plan, then execute it step by step with a review gate after every
  step, without leaving the IDE.
coreApproach: >-
  Instead of chatting with an agent, the developer describes what to build as a
  specification and an implementation plan inside the IDE, and the agent
  executes that plan one step at a time. Control is applied at every stage — the
  spec and plan before any code is generated, step-by-step execution during, and
  a review of each step's result after (accept it, re-run the step with feedback,
  or amend the plan and regenerate). Specs and plans are plain Markdown kept in
  `specs/` in the repository, and a chat-first mode offers the same
  diff / review / rollback control over an ordinary agent chat.
workflow:
  - "Spec — describe what to build; SpecBuddy saves it as a Markdown spec in `specs/`"
  - "Plan — generate an ordered implementation plan (`specs/plans/<name>.md`) from the spec"
  - "Execute — the agent runs the plan one step at a time, with progress visible in the IDE"
  - "Review — after each step: accept the result, re-run the step with corrective feedback, or amend the plan and regenerate the affected step"
supportedTools:
  - Claude Code
  - Codex
  - OpenCode
  - JetBrains IDEs
maturity: emerging
strengths:
  - "IDE-native: the whole spec → plan → execute → review loop lives inside JetBrains as UI — no slash commands or new syntax to learn"
  - "Control before code — the plan is reviewable and editable before the agent writes a line, and every executed step has a review / re-run gate"
  - "Works on top of the agents you already use (Claude Code, Codex, OpenCode) instead of replacing them, and needs no IDE switch"
  - "Specs and plans are plain Markdown committed to the repo (`specs/`), so they stay tool-portable and version-controlled; parallel multi-agent execution ships in the beta"
limitations:
  - "Public beta launched July 2026, so there is not yet a long public track record of how specs are maintained over time"
  - "Closed source under a custom EULA, with no public repository"
  - "JetBrains-only, minimum IDE version 2026.1 — no VS Code / Cursor support yet"
  - "Agent support is limited to Claude Code, Codex and OpenCode"
added: 2026-07-24
lastReviewed: 2026-07-24
featured: false
---

SpecBuddy is spec-driven development delivered as an IDE plugin rather than a
methodology kit or a standalone IDE — it sits between Spec Kit (a slash-command
layer you install into an agent) and Kiro (a whole IDE you switch to), aiming to
make an existing JetBrains + agent setup spec-driven with no migration and no new
commands. It entered public beta in July 2026 (latest release v0.9.5) and is
closed source, so public evaluation currently draws on the landing site and the
JetBrains Marketplace listing rather than an open repository. Its distinguishing bets are control
*before* generation (an editable,
reviewable plan) plus a per-step review gate during execution, a chat-first mode
that layers the same diff / review / rollback control over an ordinary agent
chat, and parallel multi-agent execution.

On the roadmap, SpecBuddy aims to be an IDE-native *host* for multiple SDD
methodologies rather than only its own: OpenSpec support is under development,
with GitHub Spec Kit and BMAD-Method planned to follow, so a team could run any
of them through the same in-IDE spec → plan → execute → review controls. These
are in-progress and planned directions, not shipped today.
