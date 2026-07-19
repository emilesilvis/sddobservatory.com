---
name: sesh
repo: joshmedeski/sesh
framework: superpowers
summary: >-
  A smart `tmux` session manager written in Go, routing its recent feature work through the
  `superpowers` plan/spec workflow — paired design docs and implementation plans land in-repo with the code.
status: active
specStructure:
  location: docs/superpowers/
  formats:
    - Markdown
  notes: >-
    Two subdirectories: `plans/` holds three date-prefixed implementation plans (e.g.
    `2026-07-13-enrich-session-name.md`, up to ~1,100 lines of checkbox task steps that invoke
    `superpowers:subagent-driven-development`) and `specs/` holds the three matching design docs (e.g.
    `2026-07-13-enrich-session-name-design.md`).
drift: low
timeline:
  - date: 2026-06-27
    title: Design work begins
    description: >-
      Earliest date carried by the plan/spec files — the `sesh status` and status-cache pairs are both dated
      2026-06-27 in their filenames.
  - date: 2026-07-14
    title: Superpowers artifacts land on `main`
    description: 'All six plan/spec files merged in a single squashed PR — "Enrich tmux session names with GitHub issue titles (#408)" — alongside the implementation they describe.'
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low, with an unusual shape: the entire `docs/superpowers/` tree landed in one squashed PR (2026-07-14) together
with the code it describes, and the shipped `sesh rename --enrich` feature closely matches its 2026-07-13 design
(`seshcli/rename.go`, a new `github` package, and `namer/sanitize.go` all appear as planned). But two of the
three plan/spec pairs — the 2026-06-27 `sesh status` command and status-cache designs — describe status-bar and
cache machinery the final design explicitly replaced, and the shipped design's own header still reads
`Status: proposed`. The retained superseded plans read as design history rather than live spec.

## Defects and rework

The spec corpus itself documents one full rework cycle: roughly 2,200 lines of June planning for a `tmux`
status-bar feature (with a status cache and background refresher) were scrapped in favor of the far simpler
session-name enrichment in the 2026-07-13 design, whose motivation notes the replacement "collapses the feature
to a single command". Defect trends since the merge are not yet assessed — the feature is days old.

## Maintenance outcomes

Too early to judge — the framework artifacts were five days old at first review. The project itself is actively
maintained (a fix merged three days after the spec commit, and regular tagged releases, most recently
`v2.27.0`), so future reviews can watch whether subsequent features route through `docs/superpowers/` or the
directory stays a one-PR artifact.
