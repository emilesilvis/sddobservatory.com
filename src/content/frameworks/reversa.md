---
name: Reversa
website: https://sandeco.github.io/reversa/
repo: sandeco/reversa
summary: >-
  Reverse-engineering-first SDD framework that turns legacy code into
  confidence-scored, traceable specifications before an agent evolves,
  migrates, debugs, or refactors the system.
coreApproach: >-
  Coordinates specialist agents through a five-phase discovery pipeline that
  inventories a legacy system, excavates its code, infers business and
  architectural knowledge, generates operational specifications, and reviews
  contradictions and gaps with the user. Checkpoints live in `.reversa/`, while
  specs, confidence reports, and code-to-spec and impact matrices are written
  under `_reversa_sdd/` by default; follow-on workflows use those artifacts to drive
  forward development and migration.
workflow:
  - "`npx reversa install` — detect supported agents, install project-local skills and steering files, and initialize `.reversa/` state"
  - "Reconnaissance — the Scout inventories the repository, dependencies, languages, frameworks, and entry points"
  - "Excavation — the Archaeologist analyzes one module at a time, recording algorithms, control flow, data structures, and a data dictionary"
  - "Interpretation — the Detective recovers business rules and retroactive decisions while the Architect produces architecture, data, integration, and debt models"
  - "Generation — the Writer turns the recovered knowledge into confidence-marked component specifications, API and user-story artifacts, and traceability matrices under the default `_reversa_sdd/` path"
  - "Review — the Reviewer challenges contradictions, reclassifies unsupported claims, asks the user about gaps, and emits a confidence report"
  - "`/reversa-forward` — evolve one feature through requirements, clarification, quality review, a delta plan, atomic actions, cross-checking, coding, and optional `/reversa-sync` convergence"
supportedTools:
  - Claude Code
  - Codex
  - Cursor
  - Gemini CLI
  - Windsurf
  - Antigravity
  - Kiro
  - OpenCode
  - Cline
  - RooCode
  - GitHub Copilot
  - Amazon Q Developer
  - Aider
maturity: emerging
strengths:
  - "Makes brownfield specification recovery the primary workflow rather than a preparatory option inside a greenfield-oriented method"
  - "Combines code inventory, business-rule extraction, architecture reconstruction, confidence labels, unresolved-gap reporting, and human validation"
  - "Explicit code-to-spec and spec-impact matrices give subsequent agents a traceability model for change analysis"
  - "Follow-on workflows cover forward feature delivery, migration, defect handling, documentation, and behavior-preserving refactoring without discarding the recovered system model"
  - "Project-local checkpoints and restricted output directories make long analyses resumable and limit where discovery agents are instructed to write"
limitations:
  - "A very young project with concentrated maintenance and limited independent production evidence"
  - "Its linked migration paper is maintainer-authored, so it explains the method but does not independently validate its results"
  - "The large and quickly expanding roster of specialist teams and commands creates substantial selection and review overhead"
  - "Claude Code is documented as the most-tested engine; many other integrations are steering-file and shared-skill compatibility surfaces rather than equally demonstrated native runtimes"
  - "Output can be redirected or excluded from version control; public discovery sees only teams that commit the default `_reversa_sdd/` path"
added: 2026-08-01
lastReviewed: 2026-08-01
featured: false
---

Reversa fills a gap in the current catalog: it begins with code that already exists but lacks trustworthy
specifications. Its [discovery pipeline](https://sandeco.github.io/reversa/pipeline/) separates observation from
interpretation before a writer produces operational contracts, then marks claims as confirmed, inferred, or gaps
for a reviewer and the user to resolve. After that recovery pass, the same repository-local artifacts can drive
feature work, migration, debugging, or refactoring. AI Unified Process also offers reverse engineering, but
Reversa's dedicated confidence model and code-to-spec and spec-impact matrices make legacy traceability the center
of the method. The repository is active and publicly usable today, yet its concentrated maintainer base and lack of
independent outcome evidence make the emerging label deliberately provisional.
This assessment observes the repository at
[`4f57467`](https://github.com/sandeco/reversa/tree/4f574679399b7b4e567ba751baee3ac6849f7872).
