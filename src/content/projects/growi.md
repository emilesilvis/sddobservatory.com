---
name: GROWI
repo: growilabs/growi
framework: cc-sdd
summary: >-
  Team collaboration wiki (est. 2017) running feature development through
  Kiro-style spec folders — one folder per feature with `spec.json`,
  `requirements.md`, `design.md`, and `tasks.md`, plus a full steering set.
status: active
specStructure:
  location: .kiro/specs/
  formats:
    - Markdown
    - JSON
  notes: >-
    Nineteen feature spec folders (e.g. `collaborative-editor`,
    `opentelemetry`, `search-filters`), each with a `spec.json` +
    `requirements.md` + `design.md` + `tasks.md` core set; `research.md` is
    common and some add `brief.md` or `roadmap.md`. `.kiro/steering/` holds
    `product.md`, `structure.md`, `tech.md`, and `tdd.md`.
drift: none
timeline:
  - date: 2026-02-06
    title: Kiro-style specs adopted
    description: "First commit to `.kiro/specs/`: `add spec for oauth2-emil-support`."
  - date: 2026-07-09
    title: Latest spec merge
    description: >-
      Merge of PR #11401, landing the `share-link-comments` feature spec work.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

None observed. The `.kiro/specs/` tree has taken 295 commits between 2026-02-06 and 2026-07-09, and spec work
lands through normal PR review — the latest spec-path commit is itself a feature-PR merge. At first assessment the
spec tree sat about eight days behind the repository's latest push, consistent with a per-feature spec flow on a
codebase that ships daily rather than with staleness.

## Defects and rework

Not yet assessed.

## Maintenance outcomes

Too early to judge, but the shape of the adoption is notable: a production wiki platform dating from 2017 took on
the full Kiro-style layout — nineteen feature specs plus `product.md`/`structure.md`/`tech.md`/`tdd.md` steering
docs — and has sustained it for roughly five months of active development.
