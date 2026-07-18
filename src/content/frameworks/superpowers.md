---
name: Superpowers
website: https://claude.com/plugins/superpowers
repo: obra/superpowers
summary: >-
  Skill-based agent discipline with hard gates: a mandatory
  brainstorm → spec → plan pipeline with human approval before any code, then
  per-task subagent execution under strict test-driven development.
coreApproach: >-
  Fourteen composable Markdown skills, bootstrapped by a session-start hook
  that makes their use mandatory ("IF A SKILL APPLIES TO YOUR TASK, YOU DO
  NOT HAVE A CHOICE"). Creative work must pass through `brainstorming`, which
  writes a design doc to `docs/superpowers/specs/` and hard-gates
  implementation until the user approves it; `writing-plans` then produces a
  plan of 2–5-minute tasks with exact file paths. Execution dispatches a
  fresh subagent per task, each diff judged first for spec compliance and
  then for code quality, under the TDD "Iron Law": no production code
  without a failing test first.
workflow:
  - "`superpowers:brainstorming` — one-question-at-a-time requirements refinement; writes a design doc to `docs/superpowers/specs/` and blocks implementation until the user approves"
  - "`superpowers:using-git-worktrees` — isolated workspace on a new branch with a clean test baseline"
  - "`superpowers:writing-plans` — plan in `docs/superpowers/plans/` with 2–5-minute tasks, exact file paths, and a no-placeholders rule"
  - "`superpowers:subagent-driven-development` (or `superpowers:executing-plans`) — fresh subagent per task; each diff must pass a spec-compliance verdict then a code-quality verdict, tracked in a `progress.md` ledger under `.superpowers/sdd/`"
  - "`superpowers:test-driven-development` — the Iron Law: no production code without a failing test first; untested code gets deleted and reimplemented"
  - "`superpowers:requesting-code-review` / `superpowers:receiving-code-review` — review against the plan, issues by severity"
  - "`superpowers:finishing-a-development-branch` — hard stop unless tests pass, then merge, push for PR, keep, or discard"
supportedTools:
  - Claude Code
  - Codex CLI
  - Codex App
  - Cursor
  - Antigravity
  - Factory Droid
  - GitHub Copilot CLI
  - Kimi Code
  - OpenCode
  - Pi
maturity: established
strengths:
  - "Enforcement, not suggestion — hard gates at every phase, from design approval before code to per-task review verdicts and a tests-must-pass stop before merging"
  - "Covers the whole loop, not just planning: `systematic-debugging`, `verification-before-completion`, code review, worktree hygiene, and branch finishing"
  - "Context-rot resistant by design — fresh subagents per task plus on-disk specs, plans, and a `progress.md` ledger mean state survives compaction and session resets"
  - "The largest adoption in the category, distribution through Anthropic's official plugin marketplace, and vendor-neutral skills across ten agent harnesses"
  - "Unusually empirical maintenance — a dedicated eval harness, with release notes documenting features removed when evals showed cost without quality gain"
limitations:
  - "Token and time overhead is the dominant user complaint; the project's own v6 releases are partly devoted to cutting bootstrap and review costs"
  - "The mandatory ceremony (brainstorm interview, TDD on every change, the delete-untested-code rule) is a poor fit for trivial fixes and exploratory or legacy-heavy work"
  - "Enforcement is prompt-level, not tool-level — the gates live in Markdown instructions, with no CI check or traceability tooling behind the artifacts"
  - "Specs are date-stamped point-in-time design docs with no update or delta mechanism — third-party hybrid projects exist specifically to graft spec lifecycle management onto it"
  - "High churn: six major versions in its first nine months, with slash commands added then removed and artifact directories relocated twice"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

Superpowers is this observatory's borderline case, included deliberately. It never calls itself spec-driven —
its self-description is "an agentic skills framework & software development methodology" — but it mandates
persistent, human-approved spec and plan artifacts before any code and judges every task's diff against them,
which meets a minimal definition of SDD with unusually hard gates. What it lacks is the spec lifecycle the
other tracked frameworks center on: no requirement IDs, no deltas, no traceability — just date-stamped design
docs — which is why a small ecosystem of third-party hybrids exists to bolt OpenSpec-style governance onto it.
It is also the category's biggest phenomenon: launched by Jesse Vincent (Request Tracker, Keyboardio) the day
Claude Code shipped plugins, it grew into one of GitHub's most-starred repositories within nine months. Its
signature idea is recursion — a `writing-skills` skill that teaches the agent to author new skills — and the
dogfooding is radical: Vincent reports having hand-written no code since October 2025, and the repo's own
plans are checked in under `docs/plans/`.
