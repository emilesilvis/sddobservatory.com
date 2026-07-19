---
name: WuKongIM
repo: WuKongIM/WuKongIM
framework: superpowers
summary: >-
  "More than just IM" — a distributed instant-messaging platform in Go whose v3
  rewrite (multi-raft runtime, cluster storage, gateway) is driven through a
  large corpus of `superpowers` design specs and implementation plans.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
    - Plain text
  notes: >-
    Five subdirectories — `specs/` (276 dated design docs, e.g.
    `2026-03-25-multiraft-api-design.md`), `plans/` (358 implementation plans
    with checkbox step tracking, e.g.
    `2026-03-25-multiraft-library-implementation.md`), `reports/` (11 analysis
    and verification reports), `runbooks/` (7 operational runbooks), and
    `perf/` (benchmark captures as `.txt` baselines plus Markdown notes). Files
    follow a `YYYY-MM-DD-topic` naming convention; most specs are written in
    Chinese.
drift: none
timeline:
  - date: 2026-04-02
    title: superpowers directory created
    description: >-
      First commit to `docs/superpowers/`: "docs: add docs-site design spec".
  - date: 2026-04-25
    title: v3 spec corpus imported
    description: >-
      The "upgrade to v3" commit (300 files) landed the accumulated v3
      design specs and plans, with filenames dating back to 2026-03-25.
  - date: 2026-07-17
    title: Latest spec activity
    description: >-
      "Improve cloud simulation analysis evidence (#577)".
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed — the spec tree is effectively the project's development journal. More than 500 commits have
touched `docs/superpowers/` since April 2026, the latest on 2026-07-17, two days before the repo's most recent
push, on a project that merges multiple PRs per day. Each plan opens with a directive to execute it via
`superpowers:executing-plans` or `superpowers:subagent-driven-development`, and implementation branches carry an
`agent/` prefix, so specs and code land through the same PR flow.

## Defects and rework

Rework is visible inside the spec corpus itself: `reports/` holds bug-hunt and verification write-ups (e.g.
`2026-05-20-docker-wk-sim-bughunt.md`, `2026-05-25-unified-db-verification.md`), and plans such as
`2026-04-07-delivery-review-fixes.md` record review-driven fixes as first-class planned work. No defect-trend
comparison against pre-adoption development has been made yet.

## Maintenance outcomes

Too early to judge, but the scale is notable: a v3 rewrite of a distributed IM platform executed spec-first,
pairing 276 design specs with 358 implementation plans in under four months. The stable v2 line continues to
ship tagged releases while the spec-driven v3 work proceeds on `main`; whether the dated, append-only spec
corpus stays navigable as it grows is the thing to watch here.
