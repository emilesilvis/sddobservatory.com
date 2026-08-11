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
drift: moderate
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
lastReviewed: 2026-08-11
---

## Spec-to-code drift

Moderate (`M1`). Both isolated runs agreed that the pinned check “Do the live non-PostgreSQL ER-diagram statements
agree with each other and with the pinned generic INFORMATION_SCHEMA implementation?” is contradicted. The finding
is non-core, so M1 applies.

The automated v4 assessment used 28 live claims and completed all two-run agreement gates. See the
[complete assessment record](https://github.com/emilesilvis/sddobservatory.com/blob/main/docs/research/drift-assessments/2026-08-11-schematic-d37d893a02df.json).

## Defects and rework

Not yet assessed.

## Maintenance outcomes

Not yet assessed. Worth watching as a small-team data point: a solo-maintained production-shaped tool (Maven
build, `compose.yaml`, `SECURITY.md`) that adopted the AI-UP document stack wholesale about three and a half years
into the project's life.
