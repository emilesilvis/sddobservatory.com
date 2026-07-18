---
name: MUSUBI
repo: nahisaho/MUSUBI
summary: >-
  Maximalist open-source SDD: EARS-format requirements, a nine-article
  constitution, CLI-enforced requirements-to-test traceability, and delta
  specs, installed into seven coding agents from one `npx` command.
coreApproach: >-
  Rigor turned all the way up. Work is governed by nine "immutable"
  constitutional articles — test-first, EARS requirement syntax with
  `REQ-XXX-NNN` IDs, 100% requirements → design → code → test traceability —
  enforced by a `constitution-enforcer` skill and audited by dedicated CLIs
  (`musubi-trace`, `musubi-gaps`). Spec artifacts live under `storage/`
  (specs, design, tasks, validation reports), project memory under
  `steering/`, and every generated document is produced bilingually in
  English and Japanese. The README credits six predecessor frameworks,
  taking constitutional governance from Spec Kit and delta specs from
  OpenSpec, and orchestrates roughly 25 specialized agent skills across the
  lifecycle.
workflow:
  - "`npx musubi-sdd init` — scaffold commands, steering, and templates for the chosen agents (or `musubi-onboard` to reverse-engineer steering docs from an existing codebase)"
  - "`/sdd-steering` — generate project memory (structure, tech stack, product context, rules)"
  - "`/sdd-requirements` — EARS-format requirements with unique requirement IDs"
  - "`/sdd-design` — design document with C4 model and ADRs"
  - "`/sdd-tasks` — task breakdown"
  - "`/sdd-implement` — test-first implementation"
  - "`/sdd-validate` — constitutional-compliance check"
  - "Brownfield track — `/sdd-change-init` with automatic impact analysis, then `/sdd-change-apply` and `/sdd-change-archive`, using `ADDED`/`MODIFIED`/`REMOVED` requirement deltas"
  - "Per-stage review gates — `/sdd-review-requirements`, `/sdd-review-design`, `/sdd-review-implementation`"
supportedTools:
  - Claude Code
  - GitHub Copilot
  - Cursor
  - Gemini CLI
  - Codex CLI
  - Qwen Code
  - Windsurf
maturity: experimental
strengths:
  - "The most formally rigorous open SDD tool tracked here — traceability is enforced by real tooling (`musubi-trace` coverage thresholds, gap detection, impact analysis), not just by prompts"
  - "Serious brownfield story: OpenSpec-style requirement deltas plus `musubi-onboard`, which generates steering documents from an existing codebase before iteration begins"
  - "Seven coding agents supported from one installer, each in its native command format plus an `AGENTS.md` definition for non-Claude platforms"
  - "Unusually extensive documentation for the project's size, with English and Japanese mirrors of every rule and guide"
limitations:
  - "Marginal adoption and apparently stalled — a single maintainer, no commits or releases since January 2026, and the author has already started a successor project (MUSUBIX)"
  - "Heavy ceremony: nine constitutional articles, EARS syntax, C4 diagrams, and a traceability matrix before code — and some articles (library-first, a CLI for every library, no mocks) are opinionated to the point of being unworkable for many codebases"
  - "The full experience is Claude Code-only by the project's own platform comparison — auto-invoked skills, orchestration, and traceability auto-audit don't reach the other six agents, which get static prompt files"
  - "Single-author velocity over polish: 75 npm versions across six major versions in the first 46 days, with internal inconsistencies in the docs (conflicting skill counts, license vs project plan)"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

MUSUBI is the maximalist pole of the SDD spectrum — 2026 framework surveys use it as the rigor-extreme
datapoint opposite the lightweight, high-adoption kits. It is explicitly a synthesis play: the README credits
six predecessors, taking constitutional governance from Spec Kit and delta specs from OpenSpec, then turning
both up — the constitution ships in a file literally marked "Immutable", and traceability is a CLI-enforced
100% requirement rather than an aspiration. As evidence for the observatory it cuts both ways: proof that full
requirements → design → code → test traceability can be tooled end-to-end by a single author, and — with a
few dozen stars, a repo quiet since January 2026, and that author already building a successor — a datapoint
that maximal rigor has not yet found an adopter base to sustain it.
