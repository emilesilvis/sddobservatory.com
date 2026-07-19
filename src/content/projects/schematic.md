---
name: Schematic
repo: BjoernKW/Schematic
framework: ai-unified-process
summary: >-
  A database management UI for Spring Boot (Java) that retrofitted the AI
  Unified Process artifact set — `vision.md`, `requirements.md`,
  `entity_model.md`, and fourteen use-case specs — onto a codebase started in
  2022.
status: active
specStructure:
  location: docs/use_cases/
  formats:
    - Markdown
  notes: >-
    `UC-001.md` through `UC-014.md`, each a structured use-case spec with an
    Overview (including a lifecycle `Status` field), Preconditions, Main
    Success Scenario, and Alternative Flows. Sibling AI-UP artifacts sit in
    `docs/`: `vision.md`, `requirements.md`, `entity_model.md`, and a
    `use_cases.puml` diagram.
drift: low
timeline:
  - date: 2026-04-24
    title: AI Unified Process adopted
    description: >-
      First commit to `docs/use_cases/`, titled `AI Unified Process` — the
      full artifact set was retrofitted in just over a week.
  - date: 2026-05-02
    title: Use-case set completed
    description: "Latest spec commit: `Implementing UC-012 to UC-014`."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. The specs were retrofitted in just over a week (2026-04-24 to 2026-05-02, five commits) and have been untouched
since, while the repository kept receiving pushes for roughly two more months. The mitigating signal is that the
use cases carry explicit lifecycle `Status` fields and the final spec commit was `Implementing UC-012 to UC-014` —
the spec set reads as completed for its scope rather than abandoned mid-flight. Whether the post-May commits are
feature work that bypassed the use cases has not been verified.

## Defects and rework

Not yet assessed.

## Maintenance outcomes

Not yet assessed. Worth watching as a small-team data point: a solo-maintained production-shaped tool (Maven
build, `compose.yaml`, `SECURITY.md`) that adopted the AI-UP document stack wholesale about three and a half years
into the project's life.
