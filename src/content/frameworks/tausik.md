---
name: TAUSIK
website: https://tausik.tech/
repo: Kibertum/tausik-core
summary: >-
  Verification layer for AI coding agents that gates task start and completion
  on specifications and evidence, with project memory and signed receipts.
coreApproach: >-
  Runs over an existing agent through MCP tools, skills, and host-dependent
  hooks. QG-0 requires a goal and acceptance criteria before task start; QG-2
  checks verification evidence before task completion. Scoped verification
  runs can issue ed25519-signed receipts recording the checked code state,
  while a local database preserves decisions and dead ends across sessions.
workflow:
  - "Install as a git submodule and run the Python bootstrap for the chosen host"
  - "`/start` — open a session and load project state and knowledge"
  - "`/plan` — capture requirements and create tasks with goals and acceptance criteria"
  - "`/task <slug>` — pass QG-0 and implement within the task scope"
  - "`tausik verify --task <slug>` — run scoped checks and issue a receipt when signing is configured"
  - "`/ship` — review, test, verify acceptance criteria, pass QG-2, and commit"
  - "`/end` — capture knowledge and prepare the session handoff"
supportedTools:
  - Claude Code
  - Codex
  - Qwen Code
  - Cursor
  - Kilo
  - OpenCode
maturity: experimental
strengths:
  - "Task gates connect a written definition of done to recorded verification results"
  - "Signed receipts can be exported and checked offline with `tausik receipt verify`"
  - "Persistent project knowledge records decisions, patterns, and failed approaches"
  - "Integrates with several existing agents rather than requiring a replacement agent loop"
limitations:
  - "Hooks are strongest in Claude Code, Qwen Code, and trusted Codex projects; other hosts primarily enforce task start and completion"
  - "The signing key is accessible in the working tree: receipts provide integrity evidence, not independent attestation against the agent"
  - "Verification coverage depends on declared scope and configured gates; recorded exceptions and unsigned completion paths exist"
  - "No general token savings or independent production outcomes were established; the maintainer's reported token comparison found no saving"
added: 2026-09-30
lastReviewed: 2026-09-30
---

TAUSIK (Task Agent Unified Supervision, Inspection & Knowledge) implements a
task-specification and verification workflow over existing coding agents.
It declares conformance to [SENAR](/frameworks/senar/) Core. The reviewed
repository documents bootstrap installation, host integrations, task gates,
receipts, and self-use in TAUSIK's own development.

The submission's claim that every task needs a passing, signed receipt is
broader than the documented behavior. The receipt guide retains a fresh-run
completion path without an explicit signed handle, and the task reference
documents a recorded acknowledgment when no test gate applies. Receipt scope
divergence is recorded and does not always block completion. These distinctions
matter when interpreting a green result.

The experimental rating reflects limited independently verifiable adoption
and the evolving verification contract. This review checked public documentation
and the verify-first gate source; it did not run the software or independently
validate the project's self-reported effectiveness.

## Sources

- [README: installation, host matrix, self-use, and reported token comparison](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/README.md)
- [Task lifecycle and verification exceptions](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/docs/en/cli-tasks.md)
- [Signed receipts, scope, compatibility, and trust model](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/docs/en/receipts.md)
- [Verify-first gate implementation](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/scripts/gate_verify_first.py)
- [Planning skill](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/harness/skills/plan/SKILL.md)
- [Ship skill](https://github.com/Kibertum/tausik-core/blob/712bd43026a7775aebd0a31c05b797965b1084ef/harness/skills/ship/SKILL.md)
