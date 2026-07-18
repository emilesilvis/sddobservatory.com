---
name: OpenSpec
website: https://openspec.dev/
repo: Fission-AI/OpenSpec
summary: >-
  Change-folder-based SDD for AI coding assistants — fluid, iterative, and
  explicitly built for brownfield codebases, not just greenfield.
coreApproach: >-
  Each unit of work is a change folder under openspec/changes/ containing a
  proposal, requirement deltas (ADDED/MODIFIED blocks with WHEN/THEN
  scenarios), a design doc, and a task list. On completion the change is
  archived and its deltas merge into living specs under openspec/specs/. The
  workflow was recently rebuilt around the artifact-guided "OPSX" commands.
workflow:
  - "/opsx:explore — optional no-stakes thinking partner to shape the idea"
  - "/opsx:propose — create openspec/changes/<id>/ with proposal, spec deltas, design, and tasks"
  - "/opsx:apply — implement the task checklist"
  - "/opsx:sync — reconcile artifacts with reality"
  - "/opsx:archive — archive the change and update the living specs"
  - "Expanded profile adds /opsx:new, /opsx:continue, /opsx:ff, /opsx:verify, /opsx:bulk-archive, /opsx:onboard"
supportedTools:
  - Claude Code
  - Cursor
  - Codex
  - Gemini CLI
  - GitHub Copilot
  - Windsurf
  - Amazon Q Developer
  - Kiro
  - OpenCode
  - RooCode
  - Cline
  - Qwen Code
maturity: established
strengths:
  - "Heavily dogfooded — the repo itself carries 36 live capability specs and over a dozen in-flight changes"
  - "Explicitly brownfield-friendly; artifacts are plain Markdown with no special syntax"
  - "Very broad tool support — 34 documented integrations via skills and slash commands"
  - "Stores (beta) share planning repos across teams and repositories for cross-repo features"
limitations:
  - "Fast-moving: the workflow was just rebuilt (legacy to OPSX), so guidance churn is real"
  - "The Stores multi-repo feature is still in beta"
  - "Requires Node.js 20.19+ and a global npm install"
  - "The spec-delta format (ADDED/MODIFIED requirement blocks) has its own conventions to learn"
exampleRepos:
  - akkadotnet/akka.net
  - farm-fe/farm
  - Fission-AI/OpenSpec
added: 2026-07-18
lastReviewed: 2026-07-18
featured: true
---

OpenSpec's change-folder model is the clearest instance of "diff-based" specs: instead of one big spec that slowly
rots, every change carries its own requirement deltas that merge into living specs on archive. It is also the
best-dogfooded framework we track — OpenSpec is built with OpenSpec, and its spec directory moves on the same days
as its code. GitHub code search finds roughly 8,000 `openspec/changes` proposal files across public repos, the
largest observable adopter base of the frameworks tracked here.
