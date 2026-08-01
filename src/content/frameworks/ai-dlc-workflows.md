---
name: AWS AI-DLC Workflows 2.0
website: https://awslabs.github.io/aidlc-workflows/
repo: awslabs/aidlc-workflows
summary: >-
  AWS's harness-neutral implementation of a gated, adaptive development life
  cycle spanning intent, requirements, implementation, deployment, and
  operational feedback.
coreApproach: >-
  Encodes the AI-Driven Development Life Cycle as one harness-neutral `core/`
  rendered into native distributions for several coding agents. A conductor
  selects or composes an appropriate scope, coordinates 14 specialist and
  review agents across 5 phases and up to 32 stages, persists every intent's
  artifacts and audit trail under `aidlc/spaces/`, and pauses at approval and
  phase-verification gates before downstream work proceeds.
workflow:
  - "Initialization — scaffold an intent record, detect greenfield or brownfield context, and initialize deterministic state and audit records"
  - "Ideation — capture intent, assess feasibility, define scope, form the team, explore mockups, and approve the initiative"
  - "Inception — reverse-engineer existing code when needed, discover team practices, analyze requirements, design the application, generate units, and plan delivery"
  - "Construction — implement reviewable Bolt slices through functional, non-functional, and infrastructure design, code generation, build and test, and CI"
  - "Operation — prepare and execute deployment, provision environments, establish observability and incident response, validate performance, and feed findings into the next intent"
  - "Verification and control — run traceability checks between phases, approve material decisions, and resume, redo, or jump between persisted stages with `/aidlc` (`$aidlc` in Codex)"
supportedTools:
  - Claude Code
  - Kiro
  - Codex
  - OpenCode
maturity: experimental
strengths:
  - "Unusually complete lifecycle coverage, from initial intent through deployment, observability, incident response, and feedback"
  - "Nine stock scopes and three independent artifact-depth and test-strategy levels scale the 32-stage lifecycle from a bug fix or proof of concept to an enterprise initiative"
  - "Approval gates, phase-boundary traceability checks, persistent state, and a structured audit trail make decisions and resumptions explicit"
  - "One generated `core/` keeps the methodology aligned across four supported products instead of maintaining separate prompt sets"
  - "Walking-skeleton and Bolt-based construction limits review size, with an explicit choice between gated and autonomous execution after the first slice"
limitations:
  - "Version 2 is developed on the protected `v2` branch while the default `main` branch and GitHub Releases still foreground version 1; users must deliberately install and pin the intended version"
  - "The implementation is moving quickly despite its GA label, with substantial changes landing between tagged versions"
  - "All harness distributions require Bun; the bundled Claude Code and Codex configurations require Amazon Bedrock setup, while the recommended Kiro model requires a paid plan"
  - "Even with adaptive scopes, the full `feature` path has 32 stages and many approval gates, which is excessive for teams seeking a lightweight spec-to-code loop"
  - "The public evidence currently demonstrates a detailed implementation and early usage, not meaningful adoption or stable outcomes across multiple release cycles"
added: 2026-08-01
lastReviewed: 2026-08-01
featured: false
---

AWS AI-DLC Workflows 2.0 is the executable implementation of AWS's broader
[AI-Driven Development Life Cycle](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/), not a
new name for AI Unified Process. Its distinctive boundary is the whole delivery system: the
[version 2 documentation](https://awslabs.github.io/aidlc-workflows/) defines requirements and design artifacts, but
also a deterministic state machine, specialist reviewers, construction slices, deployment stages, operational
feedback, and durable team knowledge. The methodology is unusually explicit about its ceremony: a `feature` or
`enterprise` scope includes all 32 stages, while smaller stock scopes and the adaptive composer remove stages only
after showing the proposed plan for approval. That breadth and its fast-moving `v2` implementation support an
experimental rating rather than treating the project's GA label as evidence of broad adoption or a settled methodology.
This assessment observes the `v2` branch at
[`6b26408`](https://github.com/awslabs/aidlc-workflows/tree/6b26408177d530a6f468ae1f5870220538106884).
