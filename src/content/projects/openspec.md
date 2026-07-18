---
name: OpenSpec
repo: Fission-AI/OpenSpec
framework: openspec
summary: >-
  The OpenSpec CLI and toolkit itself, developed with its own change-folder
  workflow — "OpenSpec is built with OpenSpec".
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
  notes: >-
    specs/ holds 36 capability spec directories (e.g. cli-init,
    artifact-graph); changes/ holds in-flight change folders plus an archive;
    also config.yaml, explorations/, initiatives/, and work/.
drift: none
timeline:
  - date: 2025-08-05
    title: Repository created
  - date: 2026-01-26
    title: v1.0.0 released
    link: https://github.com/Fission-AI/OpenSpec/releases/tag/v1.0.0
  - date: 2026-07-10
    title: v1.6.0 "OPSX Update, Tool Support" released
    description: The rebuilt artifact-guided OPSX workflow became the default.
    link: https://github.com/Fission-AI/OpenSpec/releases/tag/v1.6.0
added: 2026-07-18
lastReviewed: 2026-07-18
---

## Spec-to-code drift

None observed. The `openspec/` directory was last modified the same day as the repository's latest push, with 36
living capability specs and over a dozen changes in flight. Specs demonstrably move with the code — this is the
reference case for what healthy SDD looks like in the wild.

## Defects and rework

Not yet assessed. As the flagship dogfooding case, an interesting question for a future review is how often
archived changes get reopened or superseded — the change archive makes that unusually observable.

## Maintenance outcomes

The project migrated its own workflow from the legacy command set to OPSX using its change-folder process, and the
migration artifacts are visible in-tree. Surviving a breaking rebuild of your own methodology while using that
methodology is a meaningful early signal, though the project is still under a year old.
