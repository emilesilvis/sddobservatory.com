---
name: Debrief
repo: debrief/debrief
framework: spec-kit
summary: >-
  Long-running open-source maritime analysis workbench (active since the
  1990s) using Spec Kit to drive a documentation and migration effort.
status: active
specStructure:
  location: .specify/ and specs/
  formats:
    - Markdown
  notes: >-
    .specify/ holds Spec Kit's memory/, scripts/, and templates/; a root
    specs/ directory contains numbered feature folders such as
    001-document-debrief-algorithms. Default branch is develop.
drift: moderate
timeline:
  - date: 2026-01-09
    title: Spec Kit adopted
    description: First commit to the .specify/ directory.
  - date: 2026-02-07
    title: Last spec change
    description: Specification added for documenting Debrief algorithms and tools for migration.
  - date: 2026-06-21
    title: Code development continues
    description: Latest commit on the develop branch, with specs untouched since February.
added: 2026-07-18
lastReviewed: 2026-07-18
---

## Spec-to-code drift

Moderate. The `specs/` directory has been untouched since 2026-02-07 while code kept moving through at least
2026-06-21 — roughly four and a half months of divergence. The nuance: Spec Kit appears to have been adopted for a
bounded initiative (documenting algorithms ahead of a migration) rather than for ongoing feature development, so
the stale specs describe a completed effort more than an abandoned practice. We rate it moderate rather than high
because the specs still accurately scope the initiative they were written for.

## Defects and rework

Not yet assessed.

## Maintenance outcomes

A useful pattern to watch: SDD applied as a campaign tool for a specific initiative inside a 30-year-old codebase,
rather than as the project's day-to-day workflow. Whether the spec directory gets revived for the next initiative
or quietly rots will say a lot about how bounded adoption plays out.
