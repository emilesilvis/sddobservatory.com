---
name: EvalAI
repo: Cloud-CV/EvalAI
framework: superpowers
summary: >-
  Cloud-CV's open platform for evaluating and comparing AI algorithms at scale —
  a decade-old Django codebase that used `superpowers` specs and plans to build
  its Yutori-driven benchmark scouting and outreach subsystem.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two subdirectories: `specs/` holds two design documents
    (`2026-06-06-yutori-scouting-design.md`, `2026-06-06-yutori-outreach-design.md`)
    and `plans/` holds one large implementation plan (`2026-06-06-scout.md`) with
    checkbox task tracking and instructions for agentic workers to use
    `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
drift: none
timeline:
  - date: 2026-06-14
    title: Superpowers adopted
    description: "Specs, plan, and the full `apps/scout/` implementation land together in one squash-merged commit — \"Backend: Add scout app for Yutori-driven benchmark discovery and outreach (#5119)\". This is also the latest commit on the spec path."
  - date: 2026-06-30
    title: Follow-up on the spec-driven app
    description: "\"Scout: Regenerate initial migration (#5130)\" — the only commit touching `apps/scout/` since adoption; the spec directory itself is unchanged."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed — but the sample is a single change. Two design specs (Yutori scouting and outreach email pipelines)
plus one implementation plan landed in the same squash-merged PR #5119 as the complete `apps/scout/` implementation
on 2026-06-14, so specs and code were born in sync. The only commit touching the app since is a regenerated
migration (PR #5130, 2026-06-30), which the plan already anticipated as `makemigrations` output. The repository
itself stayed active afterwards (about 26 commits on `master` between mid-June and early July), so the quiet spec
directory reflects a finished feature rather than an abandoned one.

## Defects and rework

Not yet assessed. The specs record one design revision before implementation (both are marked "revised 2026-06-06
to move package to top-level `apps/scout/` and replace JSON-file storage with DB models"), and the plan bakes
testing into each task (`pytest`, `responses` for HTTP mocking, `jsonschema` for schema validation), but there is
no post-merge defect history on the subsystem yet beyond the migration regeneration.

## Maintenance outcomes

Too early to judge, though the adoption pattern is notable: a mature, multi-contributor platform (around 100
contributors, running since 2016) used `superpowers` to deliver an entire new subsystem — Django models, webhook
receiver, Celery outreach task, and management commands across 40 files — in a single reviewed PR. The plan names
the specs as its "source of truth" and targets agentic execution, making this a clean example of spec-first
feature delivery inside an established codebase rather than a greenfield demo.
