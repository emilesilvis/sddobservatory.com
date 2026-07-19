---
name: Desktop CC GUI
repo: zhukunpenglinyutong/desktop-cc-gui
framework: openspec
summary: >-
  An open-source desktop client (Tauri 2 + React 19 + Rust) that wraps `Claude Code`, `Codex CLI` and other
  AI coding tools in a GUI — running the heaviest OpenSpec workspace we track, with hundreds of archived
  change folders and strict validation gates.
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
    - YAML
    - JSON
  notes: >-
    Roughly 4,200 files. `specs/` holds about 395 capability specs (e.g. `agent-task-center`,
    `capability-aware-policy-router`), and `changes/` holds 26 active change folders plus an `archive/` of
    about 598 completed ones — each with `proposal.md`, `design.md`, `tasks.md` and spec deltas, often a
    `verification.md` and `.openspec.yaml`. `config.yaml` pins OpenSpec CLI 1.3.x planning context and
    quality gates; `docs/` holds about 25 dated audit, regression and manual-test-matrix reports.
drift: none
timeline:
  - date: 2026-02-11
    title: Earliest archived change
    description: >-
      The oldest completed change folder in the workspace, `2026-02-11-add-kanban-linked-issues-and-bulk-delete`,
      dates from eight days after the repository was created — the OpenSpec workflow predates its public import.
  - date: 2026-04-16
    title: OpenSpec workspace landed in the repository
    description: "Commit `c80bb56`, \"chore(workflow): 引入 OpenSpec 与 Trellis 团队协作基线\" (introduce the
      OpenSpec and Trellis team collaboration baseline), imported the existing workspace wholesale — 300 files
      and about 87,000 lines — as the team-shared source of truth for proposals, specs and changes."
  - date: 2026-07-16
    title: Latest spec activity
    description: "Commit `9da8688`, \"feat(git): 完善多仓库提交工作区\" (refine the multi-repository commit
      workspace), landed the same day as the latest code commits on `main`."
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed. More than 500 commits have touched `openspec/` in the three months since the workspace landed,
and the newest spec-path commit is same-day with the newest code commit on `main` — feature and fix commits are
interleaved within minutes with `chore(task): archive …` commits that close the matching change folder.
`config.yaml` mandates that behavior changes start from a change under `openspec/changes/<change-id>/` and
gates archiving on `openspec validate --all --strict --no-interactive` plus synced main specs. The one internal
staleness signal is documentation lag: the snapshot counts in `config.yaml` (208 capabilities, 224 archived
changes) trail the actual tree (about 395 and 598).

## Defects and rework

Bug fixes flow through the same spec pipeline as features: 161 of the roughly 598 archived change folders are
`fix-`prefixed, and 71 changes carry a `verification.md`. The `docs/` directory keeps dated regression and
audit artifacts — for example `lazy-state-extension-regression-2026-06-11.md` and several manual test
matrices — and the archive includes a recurring retro change
(`2026-07-15-retro-weekly-code-change-spec-coverage-2026-07-15`) that audits how much of the week's code
change was covered by specs.

## Maintenance outcomes

Ten contributors have shipped tagged releases through `v0.7.4` at a fast tempo while completing roughly 600
spec changes between February and July 2026 — several per day on average. Quality gates codified in
`config.yaml` (`npm run typecheck`, Vitest suites, `cargo test`) apply to every archived change. Adoption is
only five months old, so long-run maintenance conclusions are premature, but this is currently the highest
spec-throughput OpenSpec project in the observatory.
