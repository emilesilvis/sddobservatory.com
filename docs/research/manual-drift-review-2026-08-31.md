# Manual drift review — 2026-08-31

## Purpose and boundary

This note replaces the incomplete semantic work in the credit-exhausted draft assessments for Agentic Context
Engine, Logitune, Schematic, Akka.NET, Sokuji, and yserver. It applies the repository's
[`drift-rubric-v4.md`](drift-rubric-v4.md) manually to the exact immutable pins recorded by those drafts. The
evidence is limited to the pinned upstream Git history, nominated specification corpus, pinned source code, and the
v4 rubric. No OpenAI API call or GitHub Actions run was used.

This is an editorial assessment, not a claim that two automated blind runs completed. The recommendation for each
project follows v4's semantic definitions and deterministic rating tree: a change-scoped behavior requires a
concrete live scope-anchor match; omission and contradiction produce `M1` unless `H1` or `H2` applies; a canonical
corpus also permits pinned-state checks; dependency, CI, documentation, and release changes are non-material unless
their diff demonstrates a governed or externally observable behavior change.

## Recommendations

| Project | Assessed pin | Scope | Material finding | Recommended v4 result |
|---|---|---|---|---|
| Agentic Context Engine | [`321d430e520f`](https://github.com/kayba-ai/agentic-context-engine/commit/321d430e520f369315bad512cd2d90f1fa14a596) | change-scoped | One browser-use success-semantics change is in scope and omitted; the stale-corpus rule lacks three source commits. | **moderate (`M1`)** |
| Logitune | [`6c1d66fc4fde`](https://github.com/mmaher88/logitune/commit/6c1d66fc4fded7d22883145657178f2b1ecc8b63) | change-scoped | The KVM-safe main-wheel target is a post-spec, in-scope observable behavior not stated by the live scroll contract. | **moderate (`M1`)** |
| Schematic | [`4b5345195cb7`](https://github.com/BjoernKW/Schematic/commit/4b5345195cb7f47642fe4095ade13f35cd95f37c) | canonical | The non-PostgreSQL ER-diagram statements remain mutually incompatible; current code implements the generic path. | **moderate (`M1`)** |
| Akka.NET | [`b2cff22b8153`](https://github.com/akkadotnet/akka.net/commit/b2cff22b81530a72b3e769707575afa44e335689) | change-scoped | DotNetty hostname validation changed in a property explicitly anchored by the live TLS design, but the outbound-only target semantics are omitted. | **moderate (`M1`)** |
| Sokuji | [`c854c3685af9`](https://github.com/kizuna-ai-lab/sokuji/commit/c854c3685af952ebb9a3e4b39ae1fbd052debe0a) | change-scoped | The merge brings the account-slot implementation and corrected live design together; no later material delta exists at the pin. | **none (`N1`)** |
| yserver | [`e8b050cba338`](https://github.com/joske/yserver/commit/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5) | change-scoped | Post-spec Present code lets a tagged active sequence advance the completion clock, directly reversing a core live invariant. | **high (`H1`)** |

## Agentic Context Engine

### Pin and corpus

- Assessed pin: [`321d430e520f369315bad512cd2d90f1fa14a596`](https://github.com/kayba-ai/agentic-context-engine/commit/321d430e520f369315bad512cd2d90f1fa14a596), committed `2026-08-29T01:24:12Z`.
- Nominated corpus: [`.specify/`](https://github.com/kayba-ai/agentic-context-engine/tree/321d430e520f369315bad512cd2d90f1fa14a596/.specify) and [`specs/`](https://github.com/kayba-ai/agentic-context-engine/tree/321d430e520f369315bad512cd2d90f1fa14a596/specs), with `change-scoped` scope.
- The latest nominated-corpus change is [`66ef4925`](https://github.com/kayba-ai/agentic-context-engine/commit/66ef492541aff7a303e49173f027a150000f2587) at `2026-03-24T15:35:23Z`, before the 90-day floor. The corpus is therefore stale for `H2`, but age alone cannot raise the rating.

### Live claims

The corpus contains three relevant lifecycle groups:

1. The [ACE Framework Constitution](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/.specify/memory/constitution.md#L28-L52) is live. It explicitly names `browser-use` as an integration that must have a copy-pasteable quick start, and requires integration wrappers to add measurable learning or skillbook value.
2. The [OpenClaw feature specification](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/specs/001-openclaw-integration/spec.md#L1-L20) declares `Status: Implemented`. Its live claims cover transcript discovery and parsing, learning, skillbook persistence, workspace sync, incremental processing, reprocessing, and dry-run behavior; the functional requirements are stated explicitly in [FR-001 through FR-013](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/specs/001-openclaw-integration/spec.md#L100-L116).
3. The MCP [feature spec](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/specs/002-ace-mcp-server/spec.md#L1-L10) and [tool contract](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/specs/002-ace-mcp-server/contracts/tool-schemas.md#L1-L7) both declare `Draft`; their affirmative behavior is future under v4 and cannot create current drift.

### Implementation and change evidence

The first-parent 90-day chain contains five commits. Three are license or README-only changes. The
[`6388b0d6`](https://github.com/kayba-ai/agentic-context-engine/commit/6388b0d6ebf10437481b030fc862cb37a03d9c6e)
merge updates browser-use documentation and a code docstring/example import, so its attached diff does not show a
material runtime behavior.

The material change is
[`321d430e`](https://github.com/kayba-ai/agentic-context-engine/commit/321d430e520f369315bad512cd2d90f1fa14a596):
browser-use execution no longer reports every exception-free run as successful. At the pin,
[`BrowserExecuteStep`](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/ace/integrations/browser_use.py#L91-L103)
sets success only when `history.is_successful()` returns exactly `true`, preserving semantic task failures for the
learning trace. The accompanying pinned
[tests](https://github.com/kayba-ai/agentic-context-engine/blob/321d430e520f369315bad512cd2d90f1fa14a596/tests/test_browser_use_integration.py#L14-L61)
exercise `true`, `false`, and unknown outcomes.

### Drift classification

- **In scope:** the constitution explicitly names the browser-use integration, satisfying v4's concrete-anchor rule.
- **Omitted:** no affirmative live corpus claim states how a browser-use run's semantic success or failure must be mapped into the ACE trace. The broad learning-value principle does not state this observable outcome, so it cannot count as full coverage.
- **Not contradicted:** no live claim requires exception-free runs to be treated as successful; the new behavior and the live corpus can both be true.
- **No `H1`:** there is no contradicted core live claim.
- **No `H2`:** the corpus is stale, but only one distinct in-scope source commit carries omitted or contradicted behavior; v4 requires at least three.
- **No additional pinned-state finding:** the implemented OpenClaw slice remains represented by affirmative live claims, while the implemented MCP code is governed only by draft/future corpus artifacts for lifecycle purposes.

**Recommendation: moderate (`M1`).** The single in-scope omission triggers `M1`. This preserves the currently
published level, but replaces the old general “continued shipping without specs” rationale with the narrower v4
finding that actually counts for a change-scoped corpus.

## Logitune

### Pin and corpus

- Assessed pin: [`6c1d66fc4fded7d22883145657178f2b1ecc8b63`](https://github.com/mmaher88/logitune/commit/6c1d66fc4fded7d22883145657178f2b1ecc8b63), committed `2026-07-31T16:10:17Z`.
- Nominated corpus: [`docs/superpowers/specs/`](https://github.com/mmaher88/logitune/tree/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs), with `change-scoped` scope. It contains 21 design documents at the pin.
- The latest corpus change is the code-derived Debian dependencies spec in [`3232e817`](https://github.com/mmaher88/logitune/commit/3232e817eeb8ff0791b6718df6cc822fabd6a3b9), committed `2026-06-19T02:14:07Z`. The corpus is not stale for 90 days at the assessed pin, so `H2` cannot apply.

### Relevant live claims

The live corpus claims directly anchor the post-spec behaviors:

- The [stale-property design](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs/2026-04-19-stale-property-notifys-design.md#L1-L52) says hardware-originated SmartShift and DPI-cycle changes must reach QML instead of remaining stale, and describes the display-cache invalidation behavior.
- The [DPI-cycle design](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs/2026-04-18-dpi-cycle-design.md#L9-L35) makes the action user-selectable for adjustable-DPI devices and states its ring/wrap behavior. It also says `cycleDpi()` writes through `setDPI()` and emits `currentDPIChanged` in its [implementation contract](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs/2026-04-18-dpi-cycle-design.md#L135-L157).
- The [semantic-action-preset design](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs/2026-04-24-semantic-action-presets-design.md#L74-L110) defines KDE, GNOME, and Generic as the live shipping matrix, then lists Hyprland only as a future, separate follow-up using IPC.
- The [logging and bug-report design](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/docs/superpowers/specs/2026-03-29-logging-bug-report-design.md#L93-L176) governs the settings UI's bug-report affordances, but contains no claim for a deliberately crashing end-user control or a debug-build gate.

### Implementation and change evidence

Seven first-parent commits follow the last spec update. Documentation-only and release-CI changes are non-material.
The material pinned outcomes classify as follows:

1. [`ab79e6f4`](https://github.com/mmaher88/logitune/commit/ab79e6f4971facc5f1d2e711625594a0bbd2df6d) changes main-wheel behavior after a KVM/other-host round trip. Pinned [`HiResWheel::buildSetWheelMode`](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/src/core/hidpp/features/HiResWheel.cpp#L18-L34) forces the diversion target to hardware/native mode so scrolling does not silently stop. The corpus names high-resolution-wheel support and its scroll test surface, but does not state this externally observable target-bit invariant.
2. [`4c3a82aa`](https://github.com/mmaher88/logitune/commit/4c3a82aa5393b04906e2cf2a3a7c7addf0b30876) ships Hyprland support. The pinned [`HyprlandDesktop`](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/src/core/desktop/HyprlandDesktop.cpp#L36-L108) detects the compositor, tracks availability, returns `hyprland` as its variant, and resolves named actions via Hyprland bindings or app launches. This is **covered** as a governed design property: the live additive architecture says each new desktop is one `IDesktopIntegration` implementation, one `variantKey`, one `resolveNamedAction`, and new `actions.json` variants; the code follows that pattern. The old Hyprland table row is locally future, so it does not create a contradiction.
3. [`6a7bb6cf`](https://github.com/mmaher88/logitune/commit/6a7bb6cf6010681c22aa2fb36f246a20db7d1f17) makes button-initiated DPI and SmartShift changes persist into the active hardware profile. The pinned [`ProfileOrchestrator`](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/src/app/services/ProfileOrchestrator.h#L42-L78) now distinguishes displayed-profile edits from hardware-originated edits, persists the latter to disk, and refreshes the UI only when the viewed profile is active. This is **covered**: the stale-property spec states the UI-propagation outcome, while the comprehensive test plan requires DPI/SmartShift/scroll changes to save to the correct profile and permits displayed and hardware profiles to differ.
4. [`7c633949`](https://github.com/mmaher88/logitune/commit/7c633949f56e282b7055cba9e2ac61732a3c98c0) removes the deliberately crashing “Test Exception” button from release builds. Pinned [`SettingsModel`](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/src/app/models/SettingsModel.h#L13-L41) exposes a constant debug-build property, and the pinned [QML](https://github.com/mmaher88/logitune/blob/6c1d66fc4fded7d22883145657178f2b1ecc8b63/src/app/qml/AppSettingsView.qml#L139-L157) gates the crash control on it. This is **covered** by the live production Settings contract, which defines the shipped controls as debug logging, Report Bug, and the log-file path; the crash trigger remains a debug-only test seam.

The Arch `uinput` hook fix in
[`232a3728`](https://github.com/mmaher88/logitune/commit/232a372881ba966247ea0e2ce69e5810338f1f67)
does not have a sufficiently concrete property-level anchor in the nominated specs, and the README follow-up and OBS
release-gate commits are documentation/release mechanics. They do not need to count to reach the rating.

### Drift classification

- **Omitted:** the KVM-safe main-wheel target is a material, in-scope outcome. The corpus names the high-resolution wheel, `setScrollConfig`, and the exact scroll test surface, so the property-level anchor is concrete; however, its affirmative claims cover high-resolution and invert flags, not the diversion-target invariant or the observable “wheel still scrolls after returning from another host” outcome.
- **Covered:** the Hyprland extension architecture, correct-profile DPI/SmartShift persistence, and release Settings surface each have an affirmative live claim of their observable outcome or governed design property.
- **Not contradicted:** the current code and live claims can all be true together. Hyprland's old “future follow-up” language is a future boundary, not an affirmative live claim that Hyprland must remain unsupported.
- **No `H1`:** no core live claim is contradicted.
- **No `H2`:** the latest spec update is only about 42 days before the pin, so the required 90-day staleness predicate is false regardless of commit count.
- **No minor-gap-only outcome:** the uncovered wheel behavior changes observable compatibility, so it is a material omission rather than an internal-detail inaccuracy.

**Recommendation: moderate (`M1`).** At least one in-scope material behavior is omitted, while both high branches are
false. This raises the published `low` assessment to `moderate` under the narrower, deterministic v4 tree.

## Schematic

### Pin and corpus

- Assessed pin: [`4b5345195cb7f47642fe4095ade13f35cd95f37c`](https://github.com/BjoernKW/Schematic/commit/4b5345195cb7f47642fe4095ade13f35cd95f37c), committed `2026-08-27T15:50:42Z`.
- Nominated canonical corpus: [`docs/requirements.md`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/docs/requirements.md).
- The requirements file was last changed in [`d148a040`](https://github.com/BjoernKW/Schematic/commit/d148a040c3547b23cab79d90fe9ba3eadc266d1d) at `2026-05-05T12:34:34Z`, so it is stale for the 90-day rule. The retained finding is a pinned-state contradiction, which cannot supply source commits for `H2`.

### Live claims

All 28 requirement rows are affirmative current claims under the nominated canonical corpus. The decisive rows are:

- [`FR-011`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/docs/requirements.md#L17) says ER-diagram generation beyond PostgreSQL is `Implemented`.
- [`C-006`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/docs/requirements.md#L42) says the current release is limited to PostgreSQL and other JDBC databases show no diagram.
- [`C-007`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/docs/requirements.md#L43) requires standard `INFORMATION_SCHEMA` reliance for portable schema introspection.

`FR-011` and `C-006` cannot both describe the same current release. V4's pinned-check rule asks which statement the
current code satisfies.

### Implementation and change evidence

Pinned [`TablesController.generateERDiagram`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/src/main/java/com/bjoernkw/schematic/TablesController.java#L208-L262)
uses the PostgreSQL catalog query for the PostgreSQL driver and otherwise calls
`generateERDiagramFromInformationSchema`. That fallback queries standard
[`INFORMATION_SCHEMA.tables`, `columns`, and `referential_constraints`](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/src/main/java/com/bjoernkw/schematic/TablesController.java#L284-L361)
and returns Mermaid diagram source. The pinned
[controller test](https://github.com/BjoernKW/Schematic/blob/4b5345195cb7f47642fe4095ade13f35cd95f37c/src/test/java/com/bjoernkw/schematic/TablesControllerTest.java#L251-L281)
checks that the `INFORMATION_SCHEMA` path produces an ER diagram containing the table.

After the previous accepted pin, the seven first-parent commits update Maven wrapper distributions, CodeQL and Java
setup actions, the Spring Boot parent from `4.1.0` to `4.1.1`, and workflow configuration. For example, the complete
[`42b95202`](https://github.com/BjoernKW/Schematic/commit/42b952021b31af7f69bfae3c13f31b07f1336016)
product diff is the one-line Spring Boot parent version update. These are dependency/build/CI changes whose diffs do
not demonstrate a changed user-visible or corpus-governed behavior, so no new material behavior advances to drift
matching.

### Drift classification

- **Contradicted pinned check:** current code satisfies `FR-011` and `C-007` by producing a generic `INFORMATION_SCHEMA` diagram, and directly violates `C-006`'s “other JDBC databases show no diagram” statement.
- **Non-core:** the contradiction concerns one medium-priority database compatibility constraint, not Schematic's primary purpose or a system-wide invariant. It therefore does not satisfy both v4 core-claim tests.
- **No `H1`:** the contradiction is non-core.
- **No `H2`:** pinned-state checks do not count as source commits, and the post-review commits contain no material drift behavior.
- **No new omission or minor gap:** the new dependency and workflow diffs are non-material under the rubric.

**Recommendation: moderate (`M1`).** The non-core pinned contradiction continues to trigger `M1`; the newer pin does
not change that conclusion.

## Akka.NET

### Pin and corpus

- Assessed pin: [`b2cff22b81530a72b3e769707575afa44e335689`](https://github.com/akkadotnet/akka.net/commit/b2cff22b81530a72b3e769707575afa44e335689), committed `2026-08-08T19:37:51Z`.
- Nominated corpus: [`openspec/`](https://github.com/akkadotnet/akka.net/tree/b2cff22b81530a72b3e769707575afa44e335689/openspec), with `change-scoped` scope and 41 files at the pin.
- The latest nominated-corpus change is [`5b025a56`](https://github.com/akkadotnet/akka.net/commit/5b025a56a6ce53643c3c008929106b3c84f9912d), committed `2026-07-18T17:04:23Z`. It is only 21 days before the pin, so `H2` cannot apply.

### Relevant live claims

The live [Akka.IO TLS design](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/openspec/changes/akka-io-tls-support/design.md#L1-L18) concretely anchors the current DotNetty TLS surface: it names hostname validation, requires the existing TLS configuration to continue working, and makes certificate validation a goal. Its [configuration mapping](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/openspec/changes/akka-io-tls-support/design.md#L45-L63) maps `ssl.validate-certificate-hostname` to a SAN/CN callback. The artifact has no whole-artifact `draft`, `proposal`, or other future marker; under v4, unchecked tasks do not change lifecycle.

The live [Artery design](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/openspec/changes/artery-tcp-remoting/design.md#L286-L300) says `DaemonMsgCreate` does not enter the reliable system-message stage while DeathWatch does. It also makes DeathWatch and remote-deploy correctness an explicit [G3 gate](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/openspec/changes/artery-tcp-remoting/design.md#L337-L345).

### Implementation and change evidence

Nineteen first-parent commits follow the last corpus update. The concrete in-scope results are:

1. [`010e0fd6`](https://github.com/akkadotnet/akka.net/commit/010e0fd6c88d938794c8dbb6cde42be45c3bdc9c) fixes Artery remote-deployment ordering. Pinned [`ArteryRemoting.Send`](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/src/core/Akka.Remote/Artery/ArteryRemoting.cs) routes `DaemonMsgCreate` as a plain control-channel envelope ahead of `Watch`, while the inbound path buffers early ordinary messages and retries resolution without putting `DaemonMsgCreate` into the reliable system-message wrapper. That preserves the live design property and satisfies its remote-deploy correctness gate.
2. [`b2cff22b`](https://github.com/akkadotnet/akka.net/commit/b2cff22b81530a72b3e769707575afa44e335689) changes DotNetty's certificate validation semantics. [`DotNettyTransportSettings`](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/src/core/Akka.Remote/Transport/DotNetty/DotNettyTransportSettings.cs) now supplies the outbound connection target explicitly for CN/SAN comparison, uses `SslStream` policy errors when no explicit name is supplied, and does not infer a hostname for inbound client certificates. The pinned [security documentation](https://github.com/akkadotnet/akka.net/blob/b2cff22b81530a72b3e769707575afa44e335689/docs/articles/remoting/security.md#L125-L164) records the observable security direction: hostname validation is an outbound server-identity check; inbound identity requires a custom validator.

The bounded-shard default, TestKit timeout fixes, multi-node test fixes, throttler-child policy, torn-read fix, and ClusterClient rediscovery fix are material in the product generally, but no concrete predeclared `openspec/` anchor governs those atomic behaviors. Shared Akka subsystems or nearby remoting code are insufficient under the change-scoped rule. Dependency, CI, and de-flaking-only changes are non-material.

### Drift classification

- **Covered:** Artery's ordering/retry fix implements the live G3 remote-deploy outcome while retaining the explicit design boundary that `DaemonMsgCreate` is not a reliably wrapped system message.
- **Omitted:** the TLS corpus concretely anchors hostname validation but never states its material direction: validate the outbound server against the intended connection target, do not infer an inbound client hostname, and require custom policy for inbound identity. The generic “SAN/CN callback” statement is only partial coverage of this security behavior, so v4 classifies the atomic behavior as omitted.
- **Not contradicted:** no live claim requires bidirectional inferred-hostname validation, and the pinned TLS behavior can coexist with every affirmative live claim.
- **No `H1` or `H2`:** there is no contradicted core claim, and the corpus is not 90 days stale.

**Recommendation: moderate (`M1`).** The hostname-direction omission triggers `M1`; the other post-spec product changes are covered or out of scope.

## Sokuji

### Pin and corpus

- Assessed pin: [`c854c3685af952ebb9a3e4b39ae1fbd052debe0a`](https://github.com/kizuna-ai-lab/sokuji/commit/c854c3685af952ebb9a3e4b39ae1fbd052debe0a), committed `2026-08-24T02:59:13Z`.
- Nominated corpus: [`docs/superpowers/specs/`](https://github.com/kizuna-ai-lab/sokuji/tree/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/docs/superpowers/specs), with `change-scoped` scope and 111 files.
- The latest corpus commit is [`11b5c9ea`](https://github.com/kizuna-ai-lab/sokuji/commit/11b5c9eac5b44c1a63b6c037b9ecc602c734f2e9), committed `2026-08-23T23:32:04Z` on the feature side of the pin's merge. It corrects the title-bar design before merge, so the corpus is not stale.

### Live claims and implementation evidence

The live [Title Bar Account Slot design](https://github.com/kizuna-ai-lab/sokuji/blob/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/docs/superpowers/specs/2026-08-24-titlebar-account-slot-design.md#L44-L60) says the account entry lives in the title bar, renders when signed out, opens a popover, removes the old settings account section, and makes Logs advanced-only. Its [component contract](https://github.com/kizuna-ai-lab/sokuji/blob/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/docs/superpowers/specs/2026-08-24-titlebar-account-slot-design.md#L98-L153) specifies the signed-in/out mark, compact balance, and warning-dot precedence, while its [tests section](https://github.com/kizuna-ai-lab/sokuji/blob/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/docs/superpowers/specs/2026-08-24-titlebar-account-slot-design.md#L350-L405) pins the externally visible outcomes.

The pin is merge commit [`c854c368`](https://github.com/kizuna-ai-lab/sokuji/commit/c854c3685af952ebb9a3e4b39ae1fbd052debe0a). Relative to its feature parent, it is topology-only: the corrected design and implementation already have identical tree content. At the pin, [`AccountButton.tsx`](https://github.com/kizuna-ai-lab/sokuji/blob/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/src/components/TitleBar/AccountButton.tsx) owns signed-in/out rendering, compact balance, popover requests, verification refresh, and warning precedence; [`TitleBar.tsx`](https://github.com/kizuna-ai-lab/sokuji/blob/c854c3685af952ebb9a3e4b39ae1fbd052debe0a/src/components/TitleBar/TitleBar.tsx) places it before the subtitle control and gates Logs with `showLogsButton`. The old account section is absent, matching the migration claim.

One feature-branch commit follows the last corpus edit before the topology merge. [`7ba8fd13`](https://github.com/kizuna-ai-lab/sokuji/commit/7ba8fd1392c8d59844e90205580284502b2bf5a3) catches a rejected Electron `open-external` promise and writes a console warning. It does not change the target, success behavior, UI outcome, public interface, or governed architecture; the user still remains on the same surface if the external page cannot open. It is therefore non-material under Stage B rather than an omitted behavior.

### Drift classification

- **Covered:** every material title-bar/account behavior introduced by the merge has a concrete affirmative claim in the corrected live design, including the less obvious signed-out entry, compact balance, status priority, Logs gating, and settings migration.
- **No post-spec omission or contradiction:** the rejected-promise catch is non-material, and the final merge adds no source diff relative to the feature parent.
- **No `H1`, `H2`, or `L1`:** there is no contradiction, the corpus is fresh, and no inaccurate non-material detail remains in the assessed delta.

**Recommendation: none (`N1`).** All in-scope material behavior at the exact merge pin is covered, and there are no minor gaps.

## yserver

### Pin and corpus

- Assessed pin: [`e8b050cba338ec21d0dbc5e7042c493c4f49a5a5`](https://github.com/joske/yserver/commit/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5), committed `2026-08-13T22:03:24Z`.
- Nominated corpus: [`docs/superpowers/specs/`](https://github.com/joske/yserver/tree/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/docs/superpowers/specs), with `change-scoped` scope and 67 files.
- The latest corpus update is [`5b730f75`](https://github.com/joske/yserver/commit/5b730f753097aa0d0003d70b69b8fb7e1967bf7e), committed `2026-08-12T10:17:07Z`; it merges the DRI3 1.4 syncobj design and implementation. The 90-day stale predicate is false.

### Relevant live claims

Three live contracts directly anchor the later fixes:

1. The [DRI3 syncobj design](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/docs/superpowers/specs/2026-08-08-dri3-syncobj-drm-signal-design.md#L217-L249) requires the capability query and every syncobj ioctl to use the render node, explicitly naming Raspberry Pi and Asahi split display/render systems. Its data-flow table says release completion is a host `syncobj_timeline_signal` after GPU completion.
2. The [Present completion-clock design](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/docs/superpowers/specs/2026-07-28-present-completion-clock-provenance-design.md#L96-L112) labels as invariants that active sequence events cannot release Pixmap completions, only a sequence observed while idle may advance the completion clock, and `signal_present_wake` is the sole post-copy wake path.
3. The [XComposite design](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/docs/superpowers/specs/2026-05-11-x11-composite-design.md#L425-L440) defines redirect ownership/conflict behavior, while its [subtree contract](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/docs/superpowers/specs/2026-05-11-x11-composite-design.md#L515-L536) says descendant redirects are inherited rather than flattened.

### Implementation and change evidence

Ten first-parent commits follow the latest corpus update; three change only `docs/superpowers/plans/`, outside the nominated corpus. The relevant material results are:

- [`68df57b0`](https://github.com/joske/yserver/commit/68df57b08d7f4ea1e2ca5edb1f6611b743ecd330), [`9c915eba`](https://github.com/joske/yserver/commit/9c915eba3c0bb95b2807f34ebf897934df1e80a7), and the robustness part of [`9f0d958d`](https://github.com/joske/yserver/commit/9f0d958d0cf82c4a761953507ef87a8775f6cb85) preserve pinned syncobj identity and ownership and implement the documented eventfd-to-poll fallback. These are covered by the DRI3 and deferred-completion contracts. The additional logging changes, including [`8a88a336`](https://github.com/joske/yserver/commit/8a88a3361ceccc0e1d74a03c050b932764d915cb), are non-material.
- [`be034c2f`](https://github.com/joske/yserver/commit/be034c2fc348f58c5e0725b8c51d3f8b8448ad3a) publishes a still-pending GPU `sync_file` fence directly into the client's release timeline. Pinned [`present_completion.rs`](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/crates/yserver/src/kms/render/present_completion.rs) replaces the host-signal wake after successful publication, allowing clients to queue dependent work immediately while the kernel fence still prevents reuse. This is materially different from the live host-signal-only completion path.
- [`c913e5f4`](https://github.com/joske/yserver/commit/c913e5f469ff97e30ef46eeb700a82838a529c61) makes explicitly tagged absolute sequence events completion-eligible even while a page flip is active. Pinned [`backend.rs`](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/crates/yserver/src/kms/render/backend.rs#L7034-L7052) implements `tagged || present_completion_is_idle()`. The same commit also rejects Muffin's redundant direct Manual redirect when the window already inherits Manual redirect, preventing a stale backing after reparent.
- The pin, [`e8b050cb`](https://github.com/joske/yserver/commit/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5), resolves a render node on split display/render SoCs by preferring the sysfs sibling, accepting the sole candidate when no sibling can exist, and refusing ambiguous multi-GPU guesses. Pinned [`render_node.rs`](https://github.com/joske/yserver/blob/e8b050cba338ec21d0dbc5e7042c493c4f49a5a5/crates/yserver/src/kms/render_node.rs#L132-L179) directly implements the live one-render-node invariant, so this behavior is covered.

### Drift classification

- **Core contradiction:** the tagged-active-sequence behavior in `c913e5f4` directly violates the live invariants that active sequence events cannot release Pixmap completions and that only idle sequences advance the completion clock. The text test is satisfied because the corpus labels these as invariants; the consequence test is satisfied because the commit changes observable fullscreen pacing and prevents the client from settling at a fractional refresh rate.
- **Additional contradiction:** `be034c2f` replaces the claimed sole post-copy host wake with kernel fence publication at submission. The buffer remains safely fenced, but the client-visible scheduling semantics and governed architecture are different, so both claims cannot describe the pinned behavior.
- **Covered:** syncobj identity/ownership, eventfd fallback, and split-SoC render-node resolution implement affirmative live claims.
- **Omitted, but not rating-determinative:** the inherited-Manual redirect rejection is a material XComposite edge case with a concrete redirect/subtree anchor, but the corpus does not state the cross-key same-client `BadAccess` rule or the reparent failure it prevents. The older same-key no-op claim is not directly incompatible because it governs a different key shape.
- **No `H2`:** the corpus is about two days old at the pin; `H1` already decides the roll-up in any event.

**Recommendation: high (`H1`).** A post-spec source commit directly contradicts a core, consequence-bearing Present invariant. The additional wake-path contradiction and redirect omission reinforce the editorial need to update the live corpus but do not change the rule.

## Editorial publication guidance

The manual findings support completing the six failed drafts as follows:

- Agentic Context Engine: retain `moderate`, replace the old broad narrative with the browser-use omission and the explicit one-commit `H2` exclusion.
- Logitune: change `low` to `moderate`, citing the post-spec main-wheel omission above.
- Schematic: retain `moderate`, advance the assessed pin, and state that all intervening changes are non-material while the existing pinned contradiction remains.
- Akka.NET: publish `moderate`, citing the omitted outbound-only hostname-validation semantics; do not count unrelated Akka fixes merely because they share remoting code.
- Sokuji: publish `none`; the corrected design and implementation enter the assessed tree together and the merge adds no post-design behavior.
- yserver: change `low` to `high`, citing `c913e5f4` as an `H1` contradiction of the completion-clock invariant and noting the additional release-wake contradiction.
