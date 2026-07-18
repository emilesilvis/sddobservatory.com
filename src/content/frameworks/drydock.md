---
name: Drydock
website: https://webcloudstudio.com/
repo: webcloudstudio/Drydock
summary: >-
  A complete SDLC for specifications, grounded in Agile and Test-Driven
  Development.
coreApproach: >-
  Process-first: reuse the Agile and Test-Driven Development practices teams
  have relied on for years to deliver reproducible results and maintain working
  software. Delivery is driven from a `drydock` CLI that plans a Manifest and
  Blueprints, validates each Blueprint's Typed Specification, and builds the
  target software alongside a built-in web console.
workflow:
  - "`drydock init` — initialize a target workspace"
  - "`drydock import` — copy your specifications into the workspace"
  - "`drydock analyze` — decompose imported sources into stories, blockers, and acceptance milestones"
  - "`drydock plan` — create the Manifest and Blueprints"
  - "`drydock validate` — validate a Blueprint's Typed Specification"
  - "`drydock build` — build or inspect build state"
  - "`drydock refit` — update Blueprint and target software together"
  - "`drydock score` — evaluate acceptance and release readiness"
  - "`drydock document` / `drydock publish` — generate project documentation and render Markdown into publishable HTML"
supportedTools:
  - Claude
  - Codex
maturity: established
strengths:
  - "Reuses familiar Agile and TDD practices rather than introducing a new process"
  - "Feature set spans compression, stack prompting, a dynamic build plan, and a built-in web console"
  - "Lets users define their own best practices for non-Python stacks and configure branding and cosmetics"
limitations:
  - "Initial release July 2026"
added: 2026-07-18
lastReviewed: 2026-07-18
---

Drydock is a specification-driven software delivery methodology from Ed Barlow / Web Cloud Studio that
combines Agile and Test-Driven Development. Work is organized around Blueprints with Typed Specifications
and a Manifest, driven from a `drydock` CLI and accompanied by a web console for Commander-to-LLM
interaction. The approach is documented in the preprint *Improving Step Accuracy in Specification-Driven
Development* (Edward Barlow, 2026). It currently targets Claude and Codex and had its initial release in
July 2026, so it is one to watch as adopters put its process claims to the test.
