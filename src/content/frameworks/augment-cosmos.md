---
name: Augment Cosmos
website: https://www.augmentcode.com/
summary: >-
  Augment Code's commercial "Unified Agents Platform": a reviewed spec as the
  human checkpoint for fleets of agents — Experts with persistent memory and
  durable Sessions, orchestrated org-wide on Augment's Context Engine.
coreApproach: >-
  Org-level agent infrastructure rather than a spec format. The primitives
  are Environments (where agents run — laptop, VM, or Augment's cloud),
  Experts (narrowly scoped agents whose domain memory converts corrections
  into persistent knowledge), and durable Sessions, all grounded by Augment's
  Context Engine. Specs enter as the governance artifact: a single reviewed
  document of requirements, acceptance criteria, data models, and API
  contracts that parallel Experts implement and verify against — the human
  checkpoint sits on the spec, before agents write code. Reference Experts
  ship for deep code review, PR authoring, end-to-end testing, and incident
  response, with a Cosmos Advisor meta-agent routing work.
workflow:
  - "Start a Session from Cosmos Home — pick an Expert, or describe the task and let the Cosmos Advisor route it to the right Expert and Environment"
  - "Write the spec — a single document of requirements, acceptance criteria, data models, and API contracts"
  - "Human spec review — the explicit checkpoint before agents write code, where a correction costs the least"
  - "Parallel implementation — Experts such as the PR Author implement against the spec, grounded by the Context Engine"
  - "Verification — the Deep Code Review Expert checks results against the spec and surrounding codebase; low-risk changes can auto-approve"
  - "Corrections feed back into Expert memory; Automations fire from Triggers (events, schedules, webhooks) across one repo or thousands"
  - "Project Builder Expert — feature description, human-in-the-loop design, tickets, then orchestrated implementation, making the project rather than the PR the unit of work"
supportedTools:
  - Cosmos web app
  - Auggie CLI
  - VS Code
  - JetBrains IDEs
  - Vim/Neovim
  - Slack
maturity: experimental
strengths:
  - "Built on a mature substrate — Augment's Context Engine represents four years and $252M of investment in codebase-scale retrieval, the load-bearing layer for spec-faithful multi-agent work"
  - "The human checkpoint is placed on the spec, matching SDD orthodoxy, and is implemented concretely as review gating before parallel Experts run"
  - "Persistent shared agent memory with a real feedback taxonomy — task corrections vs mental-model corrections, shared vs private tiers, and an Expert Registry for team-wide propagation"
  - "Broad surface coverage at launch: web, CLI, VS Code, JetBrains, Vim, Slack, MCP integrations, and multi-model routing across local, VM, and cloud execution"
limitations:
  - "Weeks old — public preview in May 2026, broadened launch in June 2026, with availability and pricing gates already changed once in between"
  - "Nearly all evidence is vendor-authored: the throughput and cost figures are internal benchmarks, and the 'specs as operational infrastructure' framing itself comes from Augment's own comparison pages; independent coverage is one trade-press article and one review site"
  - "Specs are a practice, not a first-class artifact — the documented primitives are Experts, Sessions, and Environments, while the spec's format, storage location, and versioning story are not publicly documented"
  - "Fully closed source and enterprise-priced: $200/developer/month during preview, credit-metered after, with no self-hosting of the control plane"
added: 2026-07-18
lastReviewed: 2026-07-18
featured: false
---

Cosmos is the strongest commercial articulation of specs as the coordination layer for fleets of agents. The
launch thesis is that individual-agent gains failed to compound at team level because context and knowledge
stayed siloed per developer, and that the fix is an organizational system: shared memory, durable sessions,
and a reviewed spec as the single point of human governance before parallel implementation. For this
observatory it is also the hardest entry to evidence — the spec artifact itself is the least documented of
any framework tracked here (no public format, storage, or versioning story), the outcome numbers are
Augment's own dogfooding metrics, and the product is absent so far from the neutral SDD analyses that cover
Kiro, Spec Kit, and Tessl. It earns tracking on the strength of the thesis and the maturity of the context
engine beneath it; what the record needs next is observable adopters.
