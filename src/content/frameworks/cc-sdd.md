---
name: cc-sdd
repo: gotalab/cc-sdd
summary: >-
  Kiro-style spec harness installed as Agent Skills into eight coding agents
  from one `npx` command, now centered on long-running autonomous
  implementation with per-task independent review.
coreApproach: >-
  A faithful port of Kiro's requirements → design → tasks process into
  agent-agnostic tooling: `npx cc-sdd@latest` installs the same 17-skill set
  into whichever agent you use, with spec artifacts in `.kiro/specs/<feature>/`
  (EARS-format `requirements.md`, `design.md` with a File Structure Plan,
  `tasks.md` with parallel waves) and project memory in `.kiro/steering/`.
  Its stance is that the spec is a contract between parts of the system, not a
  master command document — code remains the source of truth. Humans approve
  each phase at gates recorded in `spec.json`, then implementation runs
  autonomously with a per-task trio of fresh implementer, independent
  reviewer, and on-demand debugger.
workflow:
  - "`/kiro-discovery` — entry-point router that writes `brief.md` and decides: extend an existing spec, implement directly with no spec, create one spec, or decompose into several"
  - "`/kiro-spec-init` — create the `.kiro/specs/<feature>/` workspace"
  - "`/kiro-spec-requirements` — EARS-format requirements, then a human approval gate"
  - "`/kiro-spec-design` — `design.md` with Mermaid diagrams and a File Structure Plan, then an approval gate"
  - "`/kiro-spec-tasks` — task list with parallel-wave labels and boundary annotations, then an approval gate"
  - "`/kiro-impl` — autonomous implementation: per task, a fresh implementer (TDD behind feature flags), an independent reviewer, and a debugger spawned in a clean context when blocked"
  - "`/kiro-validate-impl` — feature-level validation with `GO` / `NO-GO` verdicts"
  - "Optional: `/kiro-steering` for project memory, `/kiro-validate-gap` for brownfield gap analysis, `/kiro-spec-batch` for parallel multi-spec creation with cross-spec review"
supportedTools:
  - Claude Code
  - Codex
  - Cursor
  - GitHub Copilot
  - Windsurf
  - OpenCode
  - Gemini CLI
  - Antigravity
  - Qwen Code
maturity: emerging
strengths:
  - "Covers execution, not just planning — the `/kiro-impl` harness runs task-by-task with independent review, bounded debug loops, an evidence gate before success claims, and interruption-safe re-runs"
  - "Approval gates are operational, not aspirational: phase approvals are recorded in `spec.json` and downstream commands refuse to run until the prior phase is approved"
  - "Two-way Kiro portability — existing Kiro specs remain compatible, so teams can move between Kiro IDE and any of the eight supported agents on the same `.kiro/` tree"
  - "Exceptional i18n for the category: 13 generated-document languages and fully mirrored Japanese docs"
  - "Documented restraint — the docs include a 'when you do not need cc-sdd' section, and `/kiro-discovery` can legitimately route small work around the ceremony entirely"
limitations:
  - "Effectively a single-maintainer project — a personal GitHub account and sole npm publisher, despite community contributions"
  - "The workflow is not yet settled: three major versions in eight months, with v3.0 deprecating the entire legacy `/kiro:*` command surface in favor of skills — most third-party tutorials already document the outdated flow"
  - "Six of the eight platform integrations are beta and one is experimental; Qwen Code is supported only through the legacy pre-skills mode, and parity is claimed for the templates but battle-tested mainly on Claude Code and Codex"
  - "The community's center of gravity is Japanese (Zenn, Qiita); English-language coverage is modest next to Spec Kit and BMAD"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

cc-sdd was created three days after AWS's Kiro IDE went into public preview, as an explicit recreation of
Kiro's spec-driven process inside Claude Code — the homage is fossilized in every command name and the `.kiro/`
directory, and two-way spec compatibility with Kiro is a maintained feature. The name outgrew itself: "cc"
meant Claude Code, but the same skill set now installs into eight agents. Its most articulated position is the
inverse of Spec Kit's: code, not the spec, remains the source of truth, and the spec is a human-approved
contract that fixes boundaries while leaving the design space inside them to the agent. With v3.0 the project
repositioned from spec generator to autonomous implementation harness, and unusually for the category it
dogfoods in the open — the repo carries a live `.kiro/` tree with example specs, and its own `CLAUDE.md`
mandates the three-gate workflow for the project's development.
