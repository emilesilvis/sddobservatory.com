---
name: Tessl
website: https://tessl.io/
summary: >-
  Commercial "spec-as-source" platform from Snyk founder Guy Podjarny: a
  `.spec.md` framework, a versioned registry of evaluated agent context, and
  MCP integration into any coding agent.
coreApproach: >-
  The bet is the most ambitious rung of SDD: specs, not code, persist as the
  primary artifact. Specs are Markdown files with a `.spec.md` extension and
  YAML frontmatter targeting the files they describe, each requirement tied
  to a verifying test via `[@test]` links. The closed-beta Tessl Framework
  generates code from specs (`tessl build`) and specs from existing code
  (`tessl document`); the open-beta registry distributes versioned,
  evaluated bundles of skills, rules, and docs that `tessl install` places in
  `.tessl/` as context for any MCP-compatible agent. Since January 2026 the
  company brands the platform as an "Agent Enablement Platform" and the
  registry as "the package manager for agent skills".
workflow:
  - "`tessl init` — create `tessl.json` and auto-configure detected coding agents for the Tessl MCP server"
  - "`tessl search` / `tessl install` — pull skills, rules, and docs from the registry into `.tessl/`"
  - "SDD plugin (`tessl-labs/spec-driven-development`) — requirement gathering one question at a time, `.spec.md` specs written into `specs/`, a stakeholder-approval pause, then implementation with `[@test]`-linked tests and a drift-catching work review"
  - "Framework (closed beta) — `tessl create` a spec from a prompt, `tessl build` to generate implementation and tests from it, `tessl document` to reverse-engineer specs from existing code"
  - "`tessl skill review` / `tessl eval run` / `tessl publish` — review, eval, and publish reusable agent context back to the registry"
supportedTools:
  - Claude Code
  - Cursor
  - Codex
  - Gemini CLI
  - GitHub Copilot
  - Any MCP-compatible agent
maturity: emerging
strengths:
  - "The registry is a genuine differentiator — no other SDD tool ships a versioned package registry for agent context with review evals, task evals, and per-skill security scores (via a Snyk partnership)"
  - "Agent-agnostic by design: MCP-based integration rather than a captive IDE, with plain-Markdown `.spec.md` files readable outside the ecosystem"
  - "Tests are wired into specs — the `[@test]` link mechanism ties each requirement to a verifying test, a more concrete verification story than most SDD tooling"
  - "Best-capitalized dedicated player in the space ($125M from Index, Accel, GV, and boldstart), with heavy ecosystem investment: the AI Native Dev podcast and community, an open tool landscape, and the DevCon conference series"
limitations:
  - "The core spec-as-source engine has never publicly shipped — the Framework has been in closed beta since September 2025, and independent hands-on review found the models often ignored the specs"
  - "Closed source at the core: the CLI and platform are proprietary; only peripheral plugins and GitHub Actions are open"
  - "Strategic drift is real — in under 18 months the pitch moved from AI that writes and maintains code, to spec registry plus framework, to package manager for agent skills"
  - "Everything is still beta and pre-1.0, with fast terminology churn (tiles became plugins mid-2026) and credit-based pricing whose unit economics aren't published"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

Tessl occupies the most ambitious rung of the SDD ladder: in Birgitta Böckeler's taxonomy on martinfowler.com
it is the only tool of the Kiro / Spec Kit / Tessl trio that aspires to "spec-anchored" and ultimately
spec-as-source development, where code is regenerated from persistent specs rather than merely guided by them.
The observatory-relevant irony is that this rung remains unproven even at its best-funded proponent: roughly
two years after a $125M raise, the Framework is still in closed beta, the shipped public product has pivoted
to being a package manager for agent skills, and spec-driven development itself now ships as one MIT-licensed
plugin among many on Tessl's own registry. What to watch is whether the spec-as-source engine ever reaches
general availability — and whether the registry's eval-and-security-score model becomes the distribution
standard for agent context regardless.
