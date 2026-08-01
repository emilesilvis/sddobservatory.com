---
name: Spec Kitty
website: https://docs.spec-kitty.ai/
repo: Priivacy-ai/spec-kitty
summary: >-
  Spec Kit descendant that extends spec, plan, and task generation into a
  governed, repository-native execution loop with work packages, isolated
  worktrees, review state, acceptance, and merge decisions.
coreApproach: >-
  Builds on GitHub Spec Kit's specification → plan → tasks lineage, then adds
  canonical mission state and a runtime for executing it. Mission artifacts
  live under `kitty-specs/`; tasks become work packages that advance through
  lifecycle lanes in isolated `.worktrees/`. A `next → review → accept → merge`
  loop keeps implementation, acceptance criteria, review evidence, and merge
  decisions in Git, with a local dashboard and retrospective closing the loop.
workflow:
  - "`spec-kitty init` — install the selected agent integrations and initialize repository-local configuration"
  - "`/spec-kitty.charter` — establish the project's governing principles"
  - "`/spec-kitty.specify` — turn product intent into a mission specification under `kitty-specs/`"
  - "`/spec-kitty.plan` — research the codebase and produce the implementation plan"
  - "`/spec-kitty.tasks` — decompose the plan into acceptance-bound work packages and lifecycle lanes"
  - "`spec-kitty next --agent <agent> --mission <slug>` — choose the next eligible action and dispatch implementation in an isolated worktree"
  - "`/spec-kitty.review` and `/spec-kitty.accept` — review completed packages, record decisions, and validate the approved mission"
  - "`/spec-kitty.merge` — merge accepted work to the target branch; a mission review and `retrospective.yaml` capture follow-up learning"
supportedTools:
  - Claude Code
  - Codex
  - Cursor
  - Gemini CLI
  - GitHub Copilot
  - Windsurf
  - OpenCode
  - Qwen Code
  - Kiro
  - Antigravity
  - Kilo
  - Augment
  - Pi
  - Mistral Vibe
  - Letta Code
maturity: emerging
strengths:
  - "Repository-native governance preserves specs, plans, work packages, agent actions, review evidence, acceptance, and merge state as an auditable trail"
  - "Work-package boundaries, explicit lifecycle lanes, and isolated Git worktrees give parallel agents a concrete coordination model"
  - "Completes the post-planning loop that its Spec Kit ancestor historically left to the agent: `next`, review, acceptance, merge, and retrospective are first-class stages"
  - "Local-first operation does not require its optional hosted tracker or sync service, and the dashboard makes mission progress inspectable"
  - "Broad, explicitly documented integrations expose the same workflow across slash-command hosts and project-local skill hosts"
limitations:
  - "The project itself says the workflow is overkill for one-off edits, tiny scripts, and teams that do not use Git"
  - "Conventions are still moving quickly: the current documentation treats both the 1.x and 2.x lines as historical and requires migrations into 3.x"
  - "Its mission state, work-package lanes, worktrees, governance commands, dashboard, and retrospectives create substantially more ceremony than the Spec Kit workflow it extends"
  - "The Python CLI and its wide compatibility matrix add installation, upgrade, and host-parity maintenance that prompt-only frameworks avoid"
added: 2026-08-01
lastReviewed: 2026-08-01
featured: false
---

Spec Kitty is a descendant, not an unrelated reinvention, of GitHub Spec Kit: its maintainer described it as
"my fork" in a [Spec Kit design discussion](https://github.com/github/spec-kit/discussions/152), and its current
[FAQ](https://github.com/Priivacy-ai/spec-kitty#how-is-spec-kitty-different-from-prompt-templates-or-spec-kit)
identifies the layer it adds — mission state, work-package lanes, worktree isolation, a dashboard, governance
commands, and the explicit `next → review → accept → merge` runtime. That governed execution layer is the reason to
track it separately. The [supported-agents reference](https://github.com/Priivacy-ai/spec-kitty/blob/main/docs/api/supported-agents.md)
documents 16 host surfaces; the legacy Amazon Q surface is deliberately omitted above.
This assessment observes the 3.x repository at
[`f9fde44`](https://github.com/Priivacy-ai/spec-kitty/tree/f9fde44bb453eb37e49a85788ae9a678a2f0b9a6).
