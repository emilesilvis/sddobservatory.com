---
name: The Edge Agent
repo: fabceolin/the_edge_agent
framework: bmad-method
summary: >-
  Neurosymbolic AI agent framework (LLM + Prolog reasoning, Python and Rust)
  running BMAD's story and QA-gate workflow at real scale — hundreds of story
  files and QA artifacts — while skipping the PRD and architecture documents.
status: active
specStructure:
  location: docs/
  formats:
    - Markdown
    - YAML
  notes: >-
    `docs/stories/` holds 366 story files with prefixed IDs (`TEA-*`, `BUG.*`,
    `TD.*`, `RUST.*`), including 21 epic story files; `docs/qa/assessments/`
    holds 280 date-stamped assessment docs and `docs/qa/gates/` 232 YAML gate
    files. The 75-file `.bmad-core/` install (agents, tasks, templates,
    checklists, workflows) configures `docs/prd.md` and `docs/architecture.md`
    — neither exists; the project runs the story + QA-gate loop only.
drift: none
timeline:
  - date: 2025-12-06
    title: First docs commit
    description: >-
      Oldest commit on `docs/`:
      `feat: implement yaml engine core logic src/the_edge_agent/yaml_engine.py`.
  - date: 2026-01-10
    title: BMAD core installed
    description: >-
      The full 75-file `.bmad-core/` install landed in a single commit.
  - date: 2026-05-07
    title: Latest docs update
    description: "`chore(release): bump version to 0.9.108`."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed while the project was moving: `docs/` took 415 commits through 2026-05-07, and the last docs commit
trailed the repository's final push by only about nine days — stories, QA gates, and code moved together. The
caveat is direction, not divergence: the repository has been quiet since 2026-05-17, and BMAD's configured PRD and
architecture artifacts were never created, so the practice here is the story + QA-gate loop rather than the full
BMAD document stack.

## Defects and rework

Not yet assessed in trend terms, but the raw material is unusual: 280 QA assessment docs and 232 YAML gate files
under `docs/qa/`, plus dedicated `BUG.*` and `TD.*` (technical debt) story prefixes — a future review could
measure rework directly from the gate outcomes.

## Maintenance outcomes

Not yet assessed. Notable as one of the heavier real-world BMAD users we have seen: 366 stories and over 500 QA
artifacts across a release train that reached `v0.9.108`, maintained alongside sizeable skill trees in
`.claude/skills/` and `.agents/skills/`.
