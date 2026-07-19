---
name: 深蓝词库转换 (IME WL Converter)
repo: studyzy/imewlconverter
framework: openspec
summary: >-
  A free, open-source input-method dictionary converter ("Deep Blue") that translates word libraries
  between 20+ Chinese IMEs — a 2012-vintage C#/.NET tool now routing its feature work through
  Chinese-localized OpenSpec change folders.
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
    - YAML
  notes: >-
    Top level holds `config.yaml` (`schema: spec-driven`, with Chinese-language project context) and
    `project.md`. `specs/` contains six capability specs (`build-system`, `cmd-args-parsing`,
    `word-rank-management`, `llm-word-rank-generation`, `llm-configuration-cli`,
    `llm-configuration-ui`), each a single `spec.md`. `changes/archive/` holds four completed change
    folders (e.g. `2026-05-12-export-scel`, `2026-02-03-replace-search-word-freq-with-llm`) with
    `proposal.md`, `design.md`, `tasks.md`, and delta specs — about 30 files in all, and no active
    change folders at review time.
drift: low
timeline:
  - date: 2026-01-15
    title: OpenSpec adopted
    description: >-
      First commit touching `openspec/` — "refactor: 实现版本号自动化生成机制" (implement automated
      version-number generation) — created `project.md`, `AGENTS.md`, and the first change folder,
      `refactor-version-automation`.
  - date: 2026-01-31
    title: Re-initialized with Chinese-localized OpenSpec
    description: >-
      "init openspec-cn" refreshed the setup with Chinese-language `config.yaml` and instructions;
      the first two completed changes were archived the same day ("archive 2 openspecs").
  - date: 2026-02-01
    title: LLM word-rank feature driven through a change folder
    description: >-
      "feat: Use LLM to generate Word Rank" implemented the `replace-search-word-freq-with-llm`
      change, archived on 2026-02-03 with four delta specs.
  - date: 2026-05-12
    title: Latest spec activity
    description: >-
      "chore: 清理历史遗留代码和过期文档" (clean up legacy code and outdated docs) — the same day the
      `export-scel` change was archived, after the Sogou `scel` export feature shipped in `v3.4.1`.
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Low. The archived change folders map cleanly onto shipped work: `export-scel` was archived on 2026-05-12 as the
Sogou `scel` export feature landed in the `v3.4.0`/`v3.4.1` releases, and the LLM word-rank change matches the
early-February feature commits. Since the last spec commit (2026-05-12) the repo has stayed active — sixteen
commits and the `v3.4.3` release through 2026-06-29 — but nearly all of it is bug fixing (issues #397–#408) and
dependency bumps that would not call for change proposals. One small feature (a missing exporter plus a
`SinaPinyin` separator fix, 2026-06-16) did land without touching `openspec/`, which keeps this from being rated
`none`.

## Defects and rework

Largely not yet assessed. One early datapoint: the spec-driven LLM word-rank change needed a follow-up bug fix
the next day ("fix: LLM generate word rank error"), and the June bug-fix run added regression tests for issues
#403, #406, and #408 — too little history yet to compare spec-driven against pre-adoption work.

## Maintenance outcomes

A fourteen-year-old, actively released tool (created 2012, 18 contributors, monthly-ish tagged releases in 2026)
that adopted OpenSpec in January 2026 for new feature work only: the six capability specs cover recent additions
(CLI argument parsing, build/version automation, LLM word ranking, `scel` export), not the legacy converter core.
It is also the first project we track using a Chinese-localized OpenSpec setup ("openspec-cn"), with all project
context and specs maintained in Chinese. Too early to judge long-term outcomes.
