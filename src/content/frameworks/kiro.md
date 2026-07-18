---
name: Kiro
website: https://kiro.dev/
summary: >-
  AWS's agentic IDE where specs are a native feature: requirements, design, and
  task artifacts with approval gates, living in `.kiro/` inside the repo.
coreApproach: >-
  Specs are a first-class IDE feature rather than a bolt-on process. Work is
  structured into requirements, design, and task artifacts with approval gates
  before implementation, complemented by steering files and hooks. Spec
  artifacts live in `.kiro/specs/<feature>/` in the repository.
workflow:
  - "Requirements phase — `requirements.md` with user stories and acceptance criteria (or `bugfix.md` for bug analysis)"
  - "Design phase — `design.md` with architecture, sequence diagrams, and implementation approach"
  - "Tasks phase — `tasks.md` with discrete executable tasks and real-time status tracking; dependency-graph waves enable parallel execution"
  - "Variants: Feature Specs (requirements-first or design-first), Quick Plan (no approval gates), and Bugfix Specs"
supportedTools:
  - Kiro IDE
  - Kiro CLI
  - Kiro web
  - Kiro mobile
maturity: established
strengths:
  - "Spec workflow is built into the IDE with approval gates and live task tracking — no scaffolding step"
  - "Generally available AWS product (GA November 2025) with team features and multiple surfaces (IDE, CLI, web, mobile)"
  - "Parallel task execution via dependency-wave scheduling"
  - "Free tier available; a public 'powers' extension system provides on-demand agent context"
limitations:
  - "Closed source — no public product repo; the public kirodotdev/Kiro repo is an issue and feedback tracker only"
  - "Credit-metered pricing, where model choice changes credit burn"
  - "Spec artifacts follow Kiro's own structure, making them less portable than tool-agnostic frameworks"
  - "Internals can't be inspected or extended by the community"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

Kiro is the strongest example of SDD as a product rather than a methodology kit: the workflow is enforced by the
IDE itself. AWS reported over 250k developers during the 2025 preview. Because the product is closed source, the
observable evidence is thinner than for the open frameworks — tracking here leans on Kiro's own public repos and on
adopters with `.kiro/` directories in-tree.
