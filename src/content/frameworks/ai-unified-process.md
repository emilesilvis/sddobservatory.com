---
name: AI Unified Process (AIUP)
website: https://unifiedprocess.ai/
repo: AI-Unified-Process/marketplace
summary: >-
  Requirements-centric SDD that adapts the Unified Process for AI: use cases
  owned by requirements engineers, with code, tests, and docs regenerated
  around them.
coreApproach: >-
  Adapts the Unified Process's four phases (Inception, Elaboration,
  Construction, Transition) to AI-native development. Use cases and entity
  models — not code — are the durable artifacts, specifying system behavior
  and maintained by requirements engineers for the life of the system. AI
  agents generate and regenerate code, tests, and documentation from them,
  with comprehensive tests protecting behavior across regenerations. Delivered
  as a Claude Code plugin marketplace: a stack-agnostic `aiup-core` plus
  technology-specific implementation plugins.
workflow:
  - "`/requirements` — create the requirements catalog (`aiup-core`)"
  - "`/entity-model` — create the entity model with ER diagrams"
  - "`/use-case-diagram` — generate a PlantUML system use case diagram"
  - "`/use-case-spec` — write a detailed use case specification"
  - "`/reverse-engineer` — brownfield entry point: recover AIUP artifacts from an existing codebase"
  - "`/implement` — generate the implementation from a use case (stack plugin: `aiup-vaadin-jooq` or `aiup-angular-jpa`)"
  - "Stack-plugin test commands (`/browserless-test`, `/playwright-test`, `/spring-boot-test`, `/vitest-test`) lock in behavior before regeneration"
supportedTools:
  - Claude Code
  - Codex CLI
  - Cursor
  - GitHub Copilot
  - Gemini CLI
  - OpenCode
maturity: emerging
strengths:
  - "Only framework tracked here rooted in the requirements-engineering tradition — specs describe system behavior and are owned by requirements engineers, not developer prompts discarded after implementation"
  - "First-class brownfield workflow: `/reverse-engineer` recovers entity models and use case specs from existing code before iteration begins"
  - "Real enterprise adoption signals — named practitioner testimonials, a third-party-contributed stack plugin (`aiup-angular-jpa`), and a companion IntelliJ plugin linking `@UseCase`-annotated tests to their UC-XXX specs"
  - "Distributed via open standards: Claude Code plugin marketplace plus `SKILL.md` skills installable through Tessl into Codex, Cursor, Copilot, Gemini CLI, and OpenCode"
limitations:
  - "Young and small — the marketplace repo dates from February 2026 and has under 100 stars"
  - "The full generate-and-test workflow is deepest on Java stacks (Vaadin + jOOQ, Spring Boot + Angular); other stacks get only the stack-agnostic core commands"
  - "Unified Process ceremony (vision documents, BPMN, software architecture document, four phases) can be heavy for small tools and solo projects"
  - "In-the-open dogfooding is still thin — the org's task-manager example carries a requirements catalog and entity model but only a single use case spec in-tree"
exampleRepos:
  - AI-Unified-Process/task-manager
  - AI-Unified-Process/book-library
added: 2026-07-18
lastReviewed: 2026-07-18
---

AIUP is the outlier among the frameworks tracked here: it comes from the requirements-engineering tradition
(Jacobson-style use cases, the Rational Unified Process's phase model) rather than from developer tooling. Its
explicit critique of other SDD tools is that their specs describe *the code* — an elaborate prompt discarded once
the feature ships — whereas AIUP use cases describe *system behavior* and outlive any implementation, with tests
as the consistency engine that makes regeneration safe. The thing to watch is whether behavior-first specs
maintained by requirements engineers survive contact with long-running maintenance better than developer-owned
specs do; the public evidence base (two small example apps in the org) is still thinner than the methodology's
enterprise framing.
