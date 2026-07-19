---
name: UniClipboard
repo: UniClipboard/UniClipboard
framework: gsd
summary: >-
  Local-first, end-to-end-encrypted clipboard sync tool in Rust whose
  `.planning/` tree is a heavily used working GSD instance — five completed
  milestone cycles with per-phase plan, progress, and findings docs.
status: active
specStructure:
  location: .planning/
  formats:
    - Markdown
    - JSON
  notes: >-
    Root state docs (`STATE.md`, `ROADMAP.md`, `PROJECT.md`,
    `REQUIREMENTS.md`, `MILESTONES.md`, `RETROSPECTIVE.md`, `config.json`),
    seven active phase dirs in `phases/` (numbered up to 100), and 96 archived
    phase dirs under `milestones/` across `v0.1`–`v0.5.0` — each milestone
    with its own `REQUIREMENTS.md`, `ROADMAP.md`, and `MILESTONE-AUDIT.md`.
    Sampled phases carry `task_plan.md`, `progress.md`, and `findings.md`.
    Planning docs mix Chinese prose into an English document structure.
drift: none
timeline:
  - date: 2026-03-02
    title: GSD adopted
    description: "First commit to `.planning/`: `docs: map existing codebase`."
  - date: 2026-07-19
    title: Latest planning commit
    description: >-
      `feat(clipboard-sync): durable inbound receive attempts + entry cancel
      (#1399)`.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed — this is planning-in-lockstep: at first assessment the latest `.planning/` commit landed about 47
minutes before the repository's latest push, and the path has taken 841 commits since 2026-03-02. Feature commits
touch the planning tree as part of normal PR flow.

## Defects and rework

Not yet assessed. The `.planning/` tree includes `debug/` and per-phase `findings.md` docs, so there may be
measurable rework signal in a future review.

## Maintenance outcomes

Not yet assessed in outcome terms, but the process evidence is unusually rich: five completed milestone cycles
(`v0.1` through `v0.5.0`), each closed out with its own `MILESTONE-AUDIT.md`, and a `RETROSPECTIVE.md` at the
root. GSD was adopted onto an existing codebase — the first planning commit is literally `docs: map existing
codebase`.
