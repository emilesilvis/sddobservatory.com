---
name: SENAR
website: https://senar.tech/en/
repo: Kibertum/SENAR
summary: >-
  Tool-neutral methodology that starts AI-assisted changes with scoped tasks
  and acceptance criteria, then requires evidence before declaring them done.
coreApproach: >-
  SENAR Core treats a task's goal, acceptance criteria, negative scenarios,
  and scope as the specification. A Start Gate checks those inputs; a Done
  Gate checks the current work against recorded evidence, requirement-derived
  tests, a risk-based review checklist, and captured knowledge. The wider
  standard adds team roles, ceremonies, and governance.
workflow:
  - "Define the goal, independently verifiable acceptance criteria, and at least one negative scenario"
  - "Set scope boundaries and pass the Start Gate (QG-0) before writing code"
  - "Implement with an AI coding agent and verify each criterion against recorded evidence"
  - "Derive tests from requirements and review the work using the appropriate checklist tier"
  - "Record decisions, dead ends, and known issues; pass the Done Gate (QG-2) against the current version"
  - "Track first-pass success and dead-end rate against locally measured baselines"
supportedTools:
  - Any AI coding agent
  - Claude Code
  - Cursor
  - GitHub Copilot
  - Windsurf
maturity: experimental
strengths:
  - "Core is usable without dedicated software; gates may be applied manually or automated"
  - "Explicitly distinguishes evidence about the current version from stale results or an agent's assertion of completion"
  - "Connects task specifications, requirement-derived tests, risk-based review, and knowledge capture"
limitations:
  - "A written standard does not itself enforce gates; enforcement depends on the team's process or tooling"
  - "The quickstart's outcome evidence is an author-reported single-project experience that explicitly acknowledges confounding from team learning"
  - "The full standard introduces roles and ceremonies beyond the lightweight Core; adoption effort grows with scope"
added: 2026-09-30
lastReviewed: 2026-09-30
---

SENAR (Supervised Engineering & Normative AI Regulation), by Andrey Yumashev and
Vadim Soglaev, qualifies as a documented SDD methodology: tasks define expected
behavior before implementation, and completion depends on evidence against that
definition. This assessment uses the repository's v1.5 Core rather than treating
the website's older v1.4 overview as the current standard.

[TAUSIK](/frameworks/tausik/) is its reference implementation and declares SENAR
Core conformance. [RENAR](/frameworks/renar/) is a complementary, independently
adoptable requirements methodology. They have separate entries because the
standard, requirements lifecycle, and implementing tool serve different purposes.

The experimental rating reflects the limited independently verifiable adoption
and outcome evidence reviewed, rather than the breadth of the documentation.
The quickstart itself calls for independent replication of its reported results.

## Sources

- [SENAR repository overview](https://github.com/Kibertum/SENAR/blob/2d2bae57b013e8d3be5aad8b4c0596cbedef2c50/README.md)
- [SENAR Core v1.5: rules, gates, and metrics](https://github.com/Kibertum/SENAR/blob/2d2bae57b013e8d3be5aad8b4c0596cbedef2c50/core/en/senar-core.md)
- [Quickstart and single-project evidence caveat](https://github.com/Kibertum/SENAR/blob/2d2bae57b013e8d3be5aad8b4c0596cbedef2c50/guide/00-quickstart.md)
- [Tool integration guide](https://github.com/Kibertum/SENAR/blob/2d2bae57b013e8d3be5aad8b4c0596cbedef2c50/guide/10-tool-guides.md)
