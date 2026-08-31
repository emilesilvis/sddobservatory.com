---
name: Setlist
website: https://github.com/AlexCiortan/setlist
repo: AlexCiortan/setlist
summary: >-
  Spec-driven development for Claude Code in which specs, rather than chat
  history, are the control surface, and generated projects carry tracked Git
  hooks that enforce closed-spec discipline on pushes to the trunk.
coreApproach: >-
  A human directs as architect and reviewer while a Planner writes one small
  spec with explicit out-of-scope boundaries and exhaustive acceptance
  criteria, then a Builder implements it. Two QA passes and a completed Closing
  report gate closure; stamped Git hooks check commits and merges and run a
  push-time audit of trunk history, while the Claude Code session hooks are
  advisory.
workflow:
  - "`/setlist:new` — bootstrap an empty directory through an interview, approved foundational decisions, and a two-phase project stamp"
  - "`/scaffold` — use the generated project-local skill to wire the test harness, record the gate command, create the first commit, and arm the Git hooks"
  - "Plan one spec at a time — the Planner re-grounds from repository artifacts, writes explicit scope and acceptance criteria, and parks ambiguities instead of improvising"
  - "`/setlist:checkpoint` — open the spec branch, survey and commit spec-scoped work, run the close gate, and merge with `--no-ff`"
  - "Build and verify — the Builder implements in small commits, then records automated criterion-by-criterion QA and a human spot-check in the Closing report"
  - "`/setlist:validate` and `/setlist:gate` — check instance health and govern transitions between roadmap stages"
  - "`/setlist:journal` — capture a substantive session's raw findings and surprises in the repository"
  - "`/setlist:retrofit` or `/setlist:upgrade` — adopt Setlist around an existing codebase or migrate an earlier framework edition"
supportedTools:
  - Claude Code
maturity: emerging
strengths:
  - "Tracked Git hooks provide commit- and merge-time checks plus a push-time trunk audit, so the core discipline survives context loss and model changes"
  - "Every release is cold-dogfooded end to end, while a hostile automated suite attacks secret scanning, style checks, incomplete Closing reports, and unspecced trunk work"
  - "Known boundaries, defects, upstream conditions, and bypass routes are documented unusually explicitly, including the distinction between cooperating discipline and security"
  - "Deep Claude Code integration uses plan mode, model switching, session hooks, generated project-local skills, and plugin distribution instead of a lowest-common-denominator workflow"
limitations:
  - "Discipline control, not a security boundary — local Git hooks can be bypassed or left unwired, and deliberate enforcement belongs in forge-side branch protection and required checks"
  - "The supported bootstrap and operating ceremony is Claude Code-specific, even though Git runs the installed enforcement hooks independently of the agent harness"
  - "Execution is deliberately sequential: only one spec is active and coupled code is not written by multiple agents concurrently, though read-only parallel research is allowed"
  - "The advisory session-hook reasons are not shown to the model on documented current Claude Code versions, so practical feedback arrives from later Git-hook refusals"
added: 2026-08-31
lastReviewed: 2026-08-31
featured: false
---

Setlist makes the repository the durable memory for an AI-directed project: specs, a bounded status file,
decision records, journals, and a living architecture diagram survive session resets, while a Planner/Builder
split maps onto Claude Code's plan and execution modes. Its published operating loop is intentionally serial:
plan one spec, branch, build, run two QA passes, complete the Closing report, close, then repeat. The framework
document defines the spec contract in detail, including explicit out-of-scope items, acceptance criteria, QA
verdicts, and the required Closing report. See the [versioned README's principles and operating
loop](https://github.com/AlexCiortan/setlist/blob/v2.3.0/README.md#after-bootstrap-the-operating-loop) and the
[v1.11 spec template](https://github.com/AlexCiortan/setlist/blob/v2.3.0/setlist.md#appendix-c---the-spec-template).

The strongest differentiator is mechanical enforcement. A generated instance includes tracked Git hooks for
early commit and merge checks plus a `pre-push` audit that examines trunk history for code that did not arrive
through a closed spec. Setlist is careful not to overstate that mechanism: its documentation calls it a
discipline control for cooperating use, lists known ways determined committers can evade local enforcement, and
directs security-sensitive users to forge-side branch protection and required checks. The same documentation
also records a current harness limitation: advisory session-hook reasons are dropped on Claude Code's allow
path, leaving Git-hook refusals as the feedback users actually see. See the [trunk-audit and limitations
documentation](https://github.com/AlexCiortan/setlist/blob/v2.3.0/README.md#the-trunk-audit-opt-in) and the
[stamped Git-hook templates](https://github.com/AlexCiortan/setlist/tree/v2.3.0/templates/git-hooks).

The project reports both cold end-to-end dogfood runs and hostile subprocess tests before release, with an
automated hook suite running on Linux and macOS. Its rapid release history reached plugin v2.3.0 and framework
edition v1.11 in August 2026, which supports an emerging maturity rating: the mechanics are substantial and
actively tested, while the published limitations remain extensive and the interface is still changing. See
[the testing account](https://github.com/AlexCiortan/setlist/blob/v2.3.0/README.md#does-it-actually-work), the
[test suite](https://github.com/AlexCiortan/setlist/tree/v2.3.0/test), and the [first-party release
history](https://github.com/AlexCiortan/setlist/releases).
