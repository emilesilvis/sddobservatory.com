# Framework candidates — 2026-08-01

## Recommendation

Add these frameworks, in order:

1. **AWS AI-DLC Workflows 2.0** — strongest new end-to-end lifecycle candidate.
2. **Conductor** — repository-native context, specification, plan, implementation, and review.
3. **Spec Kitty** — a Spec Kit descendant with a materially broader governed-execution layer.
4. **Reversa** — fills the catalog's brownfield, reverse-engineering-first gap.

All four have a public, usable-today methodology for driving AI-assisted development from specifications and are absent from the current 14-entry catalog. Maturity labels are provisional. Repository statistics are snapshots from 2026-08-01 and are triage signals, not evidence that a methodology works. This research used primary sources only and did not change catalog data.

## Add now

### 1. AWS AI-DLC Workflows 2.0

**Provisional maturity: Emerging.** AWS's v2 implementation defines 5 phases, 32 stages, 14 agents, 9 adaptive scopes, stage approvals, and deterministic state/audit handling. It distributes workflows for Claude Code, Kiro, Codex, and OpenCode. Despite the similar name, it is a separate methodology from AI Unified Process and is more operationally prescriptive.

The repository had 3,812 stars and 643 forks; its protected `v2` branch was updated on 2026-08-01 and `v2.3.0` was tagged on 2026-07-09. Caveat: the default branch and some release surfaces still expose v1 while the `v2` branch calls itself GA, so the entry must identify version 2 explicitly.

Sources: [v2 repository](https://github.com/awslabs/aidlc-workflows/tree/v2), [v2 specification](https://github.com/awslabs/aidlc-workflows/blob/v2/assets/AI-DLC-Workflows-2.0-Specification.pdf), [AWS methodology article](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/).

### 2. Conductor

**Provisional maturity: Emerging.** Conductor persists product context, guidelines, stack, workflow rules, and a track registry under `conductor/`. Each feature or bug track carries a specification, plan, and metadata through implementation, status checks, review, and logical reverts. It therefore joins durable product context to a complete delivery loop.

Its closest catalog neighbors are Spec Kit, Kiro, and Agent OS. The distinction is that Conductor owns implementation, review, and revert, while Agent OS v3 stopped owning implementation orchestration. The repository had 3,681 stars, 286 forks, 15 contributors, a 2026-07-29 push, and release `conductor-v0.4.1`. Searches for `conductor/tracks.md` show a promising public footprint, but results need false-positive sampling before becoming a discovery fingerprint. Pre-1.0 status and the recent shift from a Gemini CLI extension toward Antigravity and Claude plugins justify the conservative label.

Sources: [repository and workflow](https://github.com/gemini-cli-extensions/conductor#readme), [official Google announcement](https://developers.googleblog.com/evolving-spec-driven-development-conductor-now-supports-antigravity/), [releases](https://github.com/gemini-cli-extensions/conductor/releases).

### 3. Spec Kitty

**Provisional maturity: Emerging.** Spec Kitty extends the familiar specification, plan, and task sequence with canonical mission state, work-package lanes, isolated worktrees, `next → review → accept → merge`, persisted review artifacts, recovery, a dashboard, and multiple mission types. Its catalog entry should explicitly identify it as a Spec Kit descendant, not an unrelated invention.

It supports major coding agents and leaves distinctive state in `kitty-specs/` and `.kittify/config.yaml`. The repository had 1,472 stars, 132 forks, 63 contributors, a push on 2026-08-01, and release `v3.2.5` from 2026-07-08. Clear migration docs help, but rapid 1.x-to-3.x evolution shows that conventions are still settling.

Sources: [repository](https://github.com/Priivacy-ai/spec-kitty#readme), [documentation](https://docs.spec-kitty.ai/), [mission types](https://docs.spec-kitty.ai/reference/missions.html), [v3.2.5](https://github.com/Priivacy-ai/spec-kitty/releases/tag/v3.2.5).

### 4. Reversa

**Provisional maturity: Emerging, low confidence.** Reversa makes brownfield specification recovery the center of its methodology. Its pipeline moves from reconnaissance and excavation through interpretation, architecture, generation, and review. It stores state under `.reversa/` and emits architecture, domain, and unit specs, confidence/gap reports, and code-to-spec and impact matrices under `_reversa_sdd/`. It also documents forward evolution, migration, synchronization, debugging, and refactoring.

AI Unified Process has a reverse-engineering entry point, but no current catalog entry offers Reversa's dedicated traceability model. The repository had 1,431 stars, 376 forks, a 2026-07-31 push, and package version `1.2.57`. Caveats are substantial: one contributor and no GitHub releases. Its exploratory COBOL-to-Go paper is maintainer-authored and did not complete final cutover, so it is supporting detail, not independent validation.

Sources: [repository](https://github.com/sandeco/reversa#readme), [documentation](https://sandeco.github.io/reversa/), [maintainer-authored case study](https://arxiv.org/abs/2605.18684).

## Watchlist

| Candidate | Why it is interesting | Reason to wait |
| --- | --- | --- |
| [Context Engineering Kit — SDD](https://github.com/NeoLabHQ/context-engineering-kit) | Arc42-derived task specs, specialist agents, brownfield impact analysis, and judge gates. | Verify a stable discovery fingerprint and distinguish it more sharply from Superpowers and MUSUBI; do not repeat vendor success claims as evidence. |
| [MoAI-ADK](https://github.com/modu-ai/moai-adk) | Concrete `plan → run → sync`, persistent specs, TDD/DDD, and mechanical TRUST 5 gates. | Claude-Code-only runtime and overlap with Superpowers/MUSUBI need review after the v3 transition settles. |
| [Flow-Next](https://github.com/gmickel/flow-next) | Strong acceptance-criteria lineage, cross-model review, receipts, and a full capture-to-PR loop. | External artifact footprint was thin and releases were arriving several times within days. |
| [Spec Workflow MCP](https://github.com/Pimzino/spec-workflow-mcp) | Observable requirements/design/tasks workflow with approval records and UI support. | The maintainer currently announces a break; reassess when maintenance resumes. |

## Not recommended now

- **Pilot Shell** and **Qoder Quest / Code with Spec** are commercial or proprietary and may be unmeasurable from public project artifacts. Revisit after a methodology-level decision on such frameworks.
- **ProductSpec** explicitly stops at product intent and handoff rather than governing implementation.
- **SpecShip** labels itself an experimental AWS sample and depends on other methodologies.
- **codex-spec** and **SpecDrive** did not show enough sustained public methodology or maintenance evidence.

## Required review when adding a framework

For each accepted candidate, the Observatory methodology still requires work beyond the inclusion decision:

1. Author a sourced framework page and record supported tools without inferring support from generic compatibility claims.
2. Confirm maturity against the documented definitions, separating activity/adoption evidence from marketing claims.
3. Add a discovery-registry entry with either a stable repository fingerprint or an explicit `unmeasurable` classification.
4. Run and manually spot-check the fingerprint before reporting adoption.
5. Source the exact version or branch observed, especially for fast-moving or pre-1.0 projects.

The commercial/unmeasurable question exposed by Pilot Shell and Qoder merits a separate methodology review before either is cataloged.

## Post-addition discovery verification

After the four entries were added, a one-page subset sweep on 2026-08-01 produced 81 candidates: 2 for AI-DLC,
35 for Conductor, 19 for Spec Kitty, and 25 for Reversa. This is a recent-index sample, not an exhaustive adoption
count. Only Conductor's `wshobson/maverick-mcp` candidate cleared the Observatory's 500-star project-review floor;
the other results remain supporting discovery evidence rather than publishable project entries.
The final editorial review therefore set AI-DLC to `experimental`; Conductor, Spec Kitty, and Reversa remain
`emerging` based on broader observable usage, with Reversa's rating explicitly provisional.

Manual tree checks confirmed substantive framework artifacts in representative hits:

- AI-DLC: [`otomatty/zedi`](https://github.com/otomatty/zedi/tree/develop/aidlc/spaces) and
  [`otomatty/aidlc-guide`](https://github.com/otomatty/aidlc-guide/tree/main/aidlc/spaces) each contain a persisted
  intent state plus multi-stage construction artifacts. Both remain flagged for manual depth review because intent
  directories are dynamically named.
- Conductor: [`wshobson/maverick-mcp`](https://github.com/wshobson/maverick-mcp/tree/main/conductor),
  [`JustLookAtNow/pt_mate`](https://github.com/JustLookAtNow/pt_mate/tree/master/conductor), and
  [`salmanbappi/AniZen`](https://github.com/salmanbappi/AniZen/tree/master/conductor) each have multiple track
  directories with specification and plan artifacts; `maverick-mcp` has three complete tracks with metadata.
- Spec Kitty: [`LynnColeArt/ShovelerDB`](https://github.com/LynnColeArt/ShovelerDB/tree/main/kitty-specs),
  [`mgifford/open-scans`](https://github.com/mgifford/open-scans/tree/main/kitty-specs), and
  [`mgifford/vital-core`](https://github.com/mgifford/vital-core/tree/main/kitty-specs) contain mission directories;
  the first two expose specification, plan, and task artifacts directly, while `vital-core` carries 25+ missions.
- Reversa: [`perna/podigger`](https://github.com/perna/podigger/tree/main/_reversa_sdd),
  [`tjsasakifln/SmartLic`](https://github.com/tjsasakifln/SmartLic/tree/main/_reversa_sdd), and
  [`Hermenics/deepseek-code`](https://github.com/Hermenics/deepseek-code/tree/main/_reversa_sdd) contain architecture,
  requirements, design, traceability, or task artifacts under the default output path. Reversa candidates remain
  flagged for manual depth review because its output layouts do not expose one mechanically reliable multi-feature
  directory.
