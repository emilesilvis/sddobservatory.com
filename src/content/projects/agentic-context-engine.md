---
name: Agentic Context Engine
repo: kayba-ai/agentic-context-engine
framework: spec-kit
summary: >-
  Kayba's open-source Python framework for agents that learn from experience,
  distilling strategies from session traces into a persistent skillbook. Its
  OpenClaw integration and optional MCP server were both built through Spec Kit.
status: active
specStructure:
  location: specs/
  formats:
    - Markdown
  notes: >-
    Two feature directories: `001-openclaw-integration` carries the full Spec Kit
    artifact set (`spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`,
    `quickstart.md`, `contracts/cli.md`) while `002-ace-mcp-server` has `spec.md` and
    `contracts/tool-schemas.md`. A `.specify/` directory holds the versioned ACE
    Framework Constitution (`memory/constitution.md`) plus templates and scripts.
drift: moderate
timeline:
  - date: 2026-02-27
    title: Spec Kit adopted
    description: First commit to the `specs/` directory — "Work on spec-kit for openclaw".
  - date: 2026-03-02
    title: MCP server specced and shipped
    description: >-
      `002-ace-mcp-server` drafted and implemented the same day — "feat(mcp): add
      optional ACE MCP server with session-scoped tools and safety guards".
  - date: 2026-03-24
    title: Latest spec activity
    description: "feat(providers): add Bedrock API key support + fix sandbox imports"
added: 2026-07-19
lastReviewed: 2026-07-19
---

## Spec-to-code drift

Moderate. Both specced features shipped, but the `specs/` tree has been frozen since 2026-03-24 (10 commits total)
while the project kept shipping through April–June 2026 — releases `v0.11.0` and `v0.12.0`, a v2 `Skill` schema for
the skillbook, and substantial reflector and skill-manager rework all landed with no spec updates. The drift reaches
back into the specced features themselves: an April commit realigned the MCP and OpenClaw tests to the v2 schema
without touching their spec folders, and `002-ace-mcp-server/spec.md` still reads `Status: Draft` even though its
implementation landed and was hardened in early March.

## Defects and rework

The spec-path history records a same-day hardening loop: the MCP server landed on 2026-03-02 and was followed within
hours by three `fix(mcp)` commits ("fix semantic bugs, harden safety guards, and expand test coverage", "enforce
optional dependency boundary and remove unsupported request flags", "add learn timeouts, resolve paths canonically,
harden registry draining"). Whether spec-driven features accumulate more or less rework than the project's unspecced
work is not yet assessed.

## Maintenance outcomes

Too early to judge, and the open question is whether Spec Kit sticks: adoption here looks like a two-feature burst
(late February to late March 2026) rather than a standing practice, with later minor releases shipping significant
behaviour changes and no `003-*` spec directory appearing. The `.specify/` constitution is versioned and maintained
(bumped to v1.1.0 with a sync-impact report), so the scaffolding remains live even while the `specs/` tree idles.
