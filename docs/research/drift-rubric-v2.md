# Drift rating protocol v2.0 (frozen retest rubric)

Status: frozen for the issue #60 retest
Protocol date: 2026-08-09
Protocol owner: SDD Observatory

This document is the complete instruction packet for two isolated rerating runs. The two runs must receive this exact file and the exact prompt at the end, without any stored Observatory rating, earlier run output, or project narrative.

## What is sourced and what is prescribed

The repository identities, immutable commits, commit timestamps, and nominated paths in the manifest are factual inputs backed by first-party GitHub repository, commit, and tree/blob links. GitHub documents the commit-list operation used to find a commit before a cutoff and the recursive tree operation used to enumerate a pinned repository ([Commits API](https://docs.github.com/en/rest/commits/commits#list-commits), [Git Trees API](https://docs.github.com/en/rest/git/trees#get-a-tree)).

Everything else in this document—the 90-day window, scope assignments, definitions, thresholds, tie-breaks, output schema, and blind-run rules—is a **protocol decision**. Those rules are not claims made by the upstream projects and must not be presented as sourced facts. The retest uses the same 22 pins and the precommitted acceptance gate from [SDD Observatory issue #60](https://github.com/emilesilvis/sddobservatory.com/issues/60): at least 18/22 exact run-to-run matches and no difference of two or more rating levels.

## Frozen input manifest

`scope` is deliberately predeclared. An assessor must not reclassify it. This removes scope discovery as a source of run-to-run variance. The classification rule in the next section is for interpreting the assignment and for future, separately versioned manifests.

| Order | Slug | Repository and immutable pin | Pin time (UTC) | Nominated corpus entry points | Scope |
|---:|---|---|---|---|---|
| 1 | `agentic-context-engine` | [`kayba-ai/agentic-context-engine@96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a`](https://github.com/kayba-ai/agentic-context-engine/commit/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a) | `2026-06-09T18:06:15Z` | [`.specify/`](https://github.com/kayba-ai/agentic-context-engine/tree/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a/.specify), [`specs/`](https://github.com/kayba-ai/agentic-context-engine/tree/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a/specs) | `change-scoped` |
| 2 | `akka-net` | [`akkadotnet/akka.net@464d75766b9ecf195395981c77fc1b1d6c7c6e22`](https://github.com/akkadotnet/akka.net/commit/464d75766b9ecf195395981c77fc1b1d6c7c6e22) | `2026-07-18T03:11:08Z` | [`openspec/`](https://github.com/akkadotnet/akka.net/tree/464d75766b9ecf195395981c77fc1b1d6c7c6e22/openspec) | `change-scoped` |
| 3 | `arcreel` | [`ArcReel/ArcReel@4270c404d65389c521bc80115e11df87005c0d8e`](https://github.com/ArcReel/ArcReel/commit/4270c404d65389c521bc80115e11df87005c0d8e) | `2026-07-19T02:44:47Z` | [`docs/superpowers/specs/`](https://github.com/ArcReel/ArcReel/tree/4270c404d65389c521bc80115e11df87005c0d8e/docs/superpowers/specs), [`openspec/`](https://github.com/ArcReel/ArcReel/tree/4270c404d65389c521bc80115e11df87005c0d8e/openspec) | `change-scoped` |
| 4 | `banana-slides` | [`Anionex/banana-slides@7b948fb6f2b630b4b9a07b6efa0c1266d298c91e`](https://github.com/Anionex/banana-slides/commit/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e) | `2026-07-17T05:13:21Z` | [`docs/specs/`](https://github.com/Anionex/banana-slides/tree/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e/docs/specs), [`docs/superpowers/specs/`](https://github.com/Anionex/banana-slides/tree/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e/docs/superpowers/specs) | `change-scoped` |
| 5 | `debrief` | [`debrief/debrief@0696b105cf91c08466562a2ea03e3975034b5d6a`](https://github.com/debrief/debrief/commit/0696b105cf91c08466562a2ea03e3975034b5d6a) | `2026-06-21T18:57:05Z` | [`.specify/`](https://github.com/debrief/debrief/tree/0696b105cf91c08466562a2ea03e3975034b5d6a/.specify), [`specs/`](https://github.com/debrief/debrief/tree/0696b105cf91c08466562a2ea03e3975034b5d6a/specs) | `change-scoped` |
| 6 | `desktop-cc-gui` | [`zhukunpenglinyutong/desktop-cc-gui@c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/commit/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6) | `2026-07-19T10:45:15Z` | [`.trellis/spec/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/.trellis/spec), [`openspec/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/openspec), [`docs/superpowers/specs/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/docs/superpowers/specs) | `change-scoped` |
| 7 | `evalai` | [`Cloud-CV/EvalAI@d43da66bab66d7bb526058487fc9fb294ca5740f`](https://github.com/Cloud-CV/EvalAI/commit/d43da66bab66d7bb526058487fc9fb294ca5740f) | `2026-07-09T22:21:53Z` | [`docs/superpowers/specs/`](https://github.com/Cloud-CV/EvalAI/tree/d43da66bab66d7bb526058487fc9fb294ca5740f/docs/superpowers/specs), [`docs/superpowers/plans/`](https://github.com/Cloud-CV/EvalAI/tree/d43da66bab66d7bb526058487fc9fb294ca5740f/docs/superpowers/plans) | `change-scoped` |
| 8 | `folo` | [`RSSNext/Folo@773f1bfe218ac349b9fb9b5cbd982c320f6b414f`](https://github.com/RSSNext/Folo/commit/773f1bfe218ac349b9fb9b5cbd982c320f6b414f) | `2026-07-15T01:00:49Z` | [`docs/superpowers/specs/`](https://github.com/RSSNext/Folo/tree/773f1bfe218ac349b9fb9b5cbd982c320f6b414f/docs/superpowers/specs), [`docs/superpowers/plans/`](https://github.com/RSSNext/Folo/tree/773f1bfe218ac349b9fb9b5cbd982c320f6b414f/docs/superpowers/plans) | `change-scoped` |
| 9 | `growi` | [`growilabs/growi@01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c`](https://github.com/growilabs/growi/commit/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c) | `2026-07-18T10:53:16Z` | [`.kiro/specs/`](https://github.com/growilabs/growi/tree/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c/.kiro/specs), [`.kiro/settings/`](https://github.com/growilabs/growi/tree/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c/.kiro/settings) | `change-scoped` |
| 10 | `logitune` | [`mmaher88/logitune@3232e817eeb8ff0791b6718df6cc822fabd6a3b9`](https://github.com/mmaher88/logitune/commit/3232e817eeb8ff0791b6718df6cc822fabd6a3b9) | `2026-06-19T02:14:07Z` | [`docs/superpowers/specs/`](https://github.com/mmaher88/logitune/tree/3232e817eeb8ff0791b6718df6cc822fabd6a3b9/docs/superpowers/specs) | `change-scoped` |
| 11 | `miosub` | [`corvo007/MioSub@9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79`](https://github.com/corvo007/MioSub/commit/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79) | `2026-07-18T17:31:59Z` | [`openspec/specs/`](https://github.com/corvo007/MioSub/tree/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79/openspec/specs), [`openspec/changes/`](https://github.com/corvo007/MioSub/tree/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79/openspec/changes) | `canonical` |
| 12 | `mos` | [`Caldis/Mos@5dfb2363331cf63f529fdafa27962c41f91feff4`](https://github.com/Caldis/Mos/commit/5dfb2363331cf63f529fdafa27962c41f91feff4) | `2026-07-09T03:23:47Z` | [`docs/superpowers/specs/`](https://github.com/Caldis/Mos/tree/5dfb2363331cf63f529fdafa27962c41f91feff4/docs/superpowers/specs) | `change-scoped` |
| 13 | `openspec` | [`Fission-AI/OpenSpec@46a4d782229ebb104268130a16e85cb7662a2281`](https://github.com/Fission-AI/OpenSpec/commit/46a4d782229ebb104268130a16e85cb7662a2281) | `2026-07-17T21:41:11Z` | [`openspec/changes/`](https://github.com/Fission-AI/OpenSpec/tree/46a4d782229ebb104268130a16e85cb7662a2281/openspec/changes) | `change-scoped` |
| 14 | `schematic` | [`BjoernKW/Schematic@79e3285716b2d1a0a5845c2208861db4d4799c20`](https://github.com/BjoernKW/Schematic/commit/79e3285716b2d1a0a5845c2208861db4d4799c20) | `2026-07-09T16:31:34Z` | [`docs/requirements.md`](https://github.com/BjoernKW/Schematic/blob/79e3285716b2d1a0a5845c2208861db4d4799c20/docs/requirements.md) | `canonical` |
| 15 | `sesh` | [`joshmedeski/sesh@bf5adc733ebf755a0dc47719b8eb79d71568efb5`](https://github.com/joshmedeski/sesh/commit/bf5adc733ebf755a0dc47719b8eb79d71568efb5) | `2026-07-17T21:17:54Z` | [`docs/specs/`](https://github.com/joshmedeski/sesh/tree/bf5adc733ebf755a0dc47719b8eb79d71568efb5/docs/specs), [`docs/superpowers/specs/`](https://github.com/joshmedeski/sesh/tree/bf5adc733ebf755a0dc47719b8eb79d71568efb5/docs/superpowers/specs) | `change-scoped` |
| 16 | `sokuji` | [`kizuna-ai-lab/sokuji@7c738d6158e1b3cac2615ba3fa78aaa22e4d1f57`](https://github.com/kizuna-ai-lab/sokuji/commit/7c738d6158e1b3cac2615ba3fa78aaa22e4d1f57) | `2026-07-19T02:49:06Z` | [`docs/superpowers/specs/`](https://github.com/kizuna-ai-lab/sokuji/tree/7c738d6158e1b3cac2615ba3fa78aaa22e4d1f57/docs/superpowers/specs) | `change-scoped` |
| 17 | `spirit-of-kiro` | [`kirodotdev/spirit-of-kiro@ff0c8c22cb4026f83df5aa9155e9b7f410809f30`](https://github.com/kirodotdev/spirit-of-kiro/commit/ff0c8c22cb4026f83df5aa9155e9b7f410809f30) | `2026-07-15T20:52:08Z` | [`.kiro/steering/`](https://github.com/kirodotdev/spirit-of-kiro/tree/ff0c8c22cb4026f83df5aa9155e9b7f410809f30/.kiro/steering), [`docs/ROADMAP.md`](https://github.com/kirodotdev/spirit-of-kiro/blob/ff0c8c22cb4026f83df5aa9155e9b7f410809f30/docs/ROADMAP.md) | `canonical` |
| 18 | `the-edge-agent` | [`fabceolin/the_edge_agent@14b64873fdebd1b7fea6b3c2ef185a89cbaa0963`](https://github.com/fabceolin/the_edge_agent/commit/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963) | `2026-05-17T02:27:39Z` | [`_bmad-output/implementation-artifacts/`](https://github.com/fabceolin/the_edge_agent/tree/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963/_bmad-output/implementation-artifacts), [`rust/src/engine/a2a/design.md`](https://github.com/fabceolin/the_edge_agent/blob/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963/rust/src/engine/a2a/design.md) | `change-scoped` |
| 19 | `understand-anything` | [`Egonex-AI/Understand-Anything@5c3bc1b7fdefd17b19b44420e89d279ded21dce8`](https://github.com/Egonex-AI/Understand-Anything/commit/5c3bc1b7fdefd17b19b44420e89d279ded21dce8) | `2026-07-19T03:22:01Z` | [`docs/superpowers/specs/`](https://github.com/Egonex-AI/Understand-Anything/tree/5c3bc1b7fdefd17b19b44420e89d279ded21dce8/docs/superpowers/specs) | `change-scoped` |
| 20 | `uniclipboard` | [`UniClipboard/UniClipboard@1c229e9e19d25839e63300ce75bcde547bb0ad61`](https://github.com/UniClipboard/UniClipboard/commit/1c229e9e19d25839e63300ce75bcde547bb0ad61) | `2026-07-19T03:49:01Z` | [`.planning/REQUIREMENTS.md`](https://github.com/UniClipboard/UniClipboard/blob/1c229e9e19d25839e63300ce75bcde547bb0ad61/.planning/REQUIREMENTS.md), [`.planning/ROADMAP.md`](https://github.com/UniClipboard/UniClipboard/blob/1c229e9e19d25839e63300ce75bcde547bb0ad61/.planning/ROADMAP.md) | `canonical` |
| 21 | `wukongim` | [`WuKongIM/WuKongIM@462caf0cefdd3e7778b8d6daee93f09eae3fcc15`](https://github.com/WuKongIM/WuKongIM/commit/462caf0cefdd3e7778b8d6daee93f09eae3fcc15) | `2026-07-19T10:55:48Z` | [`docs/superpowers/specs/`](https://github.com/WuKongIM/WuKongIM/tree/462caf0cefdd3e7778b8d6daee93f09eae3fcc15/docs/superpowers/specs) | `change-scoped` |
| 22 | `yserver` | [`joske/yserver@055debc4b583e44de865d073a4caa27cbf9b1b3c`](https://github.com/joske/yserver/commit/055debc4b583e44de865d073a4caa27cbf9b1b3c) | `2026-07-17T06:57:45Z` | [`docs/superpowers/specs/`](https://github.com/joske/yserver/tree/055debc4b583e44de865d073a4caa27cbf9b1b3c/docs/superpowers/specs) | `change-scoped` |

## 1. Unit of assessment and corpus scope

The rating unit is **one nominated corpus, in one repository, at one immutable commit**. It is not the quality of the project, the freshness of all documentation, or the team's general use of SDD.

Only files beneath the manifest's nominated entry points belong to the corpus. A linked or directly referenced file outside those paths belongs to the corpus only when a nominated file explicitly incorporates it as normative guidance. README files, issues, pull requests, ADRs, and other docs outside the corpus may corroborate facts but cannot repair a corpus omission or contradiction.

For this retest, use the manifest's scope without reconsidering it:

- `canonical`: the corpus claims to describe the current project, product, or system across changes. Material changes anywhere in the claimed project/system boundary are in scope unless the corpus explicitly excludes that area.
- `change-scoped`: the corpus describes one or more named features, proposals, fixes, or bounded implementation efforts. Only behavior and code implementing those named efforts are in scope. Unrelated repository work is out of scope for drift and is counted only in the separate adoption-coverage observation.

For future manifests, assign scope before blind rating. Use `canonical` only if a live nominated artifact explicitly says at least one of the following: it is authoritative/canonical/a source of truth; it applies to all changes or contributors; it defines the current project/product/system requirements or architecture; or a nominated project-level index declares the corpus current and lists at least two independently named product/component areas. Folder names, framework conventions, file names such as `spec`, and breadth inferred by the assessor are not enough. If no positive test passes, assign `change-scoped`. If both types exist, assign `canonical` only when the canonical artifact governs the change artifacts; otherwise split them into separate future assessment units. Never resolve scope during a rating run.

### Artifact lifecycle

Classify each nominated artifact before comparing it with code:

- `live`: it asserts current or required behavior and has no explicit historical/future status.
- `future`: it is explicitly `draft`, `proposal`, `planned`, or otherwise not yet accepted/implemented.
- `historical`: its path or text explicitly says `archive`, `archived`, `completed`, `implemented`, `superseded`, `deprecated`, `retired`, or `reverted`.

Only `live` claims can create an ordinary contradiction or omission. A `future` artifact can create a contradiction only if the repository explicitly marks the described work complete while leaving the artifact active and the implementation violates it. A `historical` artifact records past intent; later code is not required to match it, and retention of that artifact is never drift by itself. Do not infer lifecycle from age, immutable dates, unchecked task boxes, or an assessor's sense that a process was abandoned.

## 2. Fixed evidence window

All time calculations use UTC committer timestamps and exact instants, not calendar dates.

1. `pin_time` is the timestamp in the manifest.
2. `window_floor = pin_time - 90 × 24 hours`.
3. Find the most recent commit reachable from the pin that substantively changes a nominated corpus file. Adding the first substantive artifact counts. A substantive spec update changes a requirement, expected behavior, architecture, data model, documented interface, acceptance state, or explicit lifecycle status. Moves with unchanged content, formatting, spelling, generated indexes, and link repairs do not count.
4. If that update is later than `window_floor` and no later than `pin_time`, set `comparison_start` to its timestamp. Otherwise set `comparison_start` to `window_floor`.
5. Candidate code commits are commits on the pin's first-parent chain with committer time strictly after `comparison_start` and no later than `pin_time`. Compare each commit's tree with its first parent's tree. A merge commit that carries a content diff is classified by that diff; topology-only merges are ignored.
6. Independently compare all live corpus claims with the code tree at the pin. This pinned-state check prevents a recent spec edit from hiding an older contradiction.

Exact age handling:

- A latest substantive spec update with timestamp `> window_floor` is **recent**. Inspect candidate code changes after it and perform the pinned-state check.
- An update exactly at `window_floor`, an older update, or no identifiable substantive update is **stale for the 90-day rule**. Inspect the full 90-day window and perform the pinned-state check.
- A spec update in the same commit as code is treated as synchronized only if the pinned-state check shows that the text matches that code.
- An update timestamp later than `pin_time`, or history that cannot establish a reachable latest update, makes the result `unknown`; do not substitute author time or a branch tip.

## 3. Evidence classifications

### Material in-scope change

A code diff is `material_in_scope` only when both tests pass:

1. **Materiality:** the diff changes at least one of:
   - user-visible or externally observable behavior;
   - a public API, CLI, event, protocol, or configuration semantic;
   - an architectural component boundary, responsibility, or interaction;
   - a persisted/domain data model or schema;
   - a behavior, interface, deployment property, packaging property, test contract, or implementation detail that a live corpus claim explicitly governs.
2. **Scope:** for `canonical`, the changed behavior is inside the corpus's stated project/system boundary; for `change-scoped`, it implements or changes a named feature, acceptance criterion, component, interface, or code path in that corpus.

A bug fix is material only when it changes externally observable behavior or one of the explicitly governed properties above. Refactoring is material only when it changes a governed architectural boundary or externally observable contract. Count commits, not files or individual hunks: one qualifying first-parent commit is one material change even if it touches several behaviors.

### Material out-of-scope change

A diff that passes materiality but not the scope test is `material_out_of_scope`. It can affect adoption coverage for a change-scoped corpus. It can never create or increase that corpus's drift rating.

### Required ignored classes

Classify a commit as ignored only when its entire diff fits one class. If any hunk passes both materiality and scope, classify the whole commit `material_in_scope`; if no hunk is in scope but any hunk is material, classify it `material_out_of_scope`.

- `ignored_dependency`: lockfile or dependency version/range changes only, with no repository-authored runtime behavior, public configuration, architecture, or governed packaging change.
- `ignored_docs`: documentation, examples, comments, spelling, or catalog metadata only, outside the nominated corpus. A nominated substantive spec update is window metadata, not a code change.
- `ignored_release`: version numbers, changelogs, release notes, publishing metadata, or generated release artifacts only, with no governed packaging/runtime semantic change.
- `ignored_format`: whitespace, formatting, import ordering, lint-only edits, generated snapshots, or mechanical renames with no behavior, interface, architecture, or data-model change.
- `ignored_merge`: topology-only merge with no content delta on the first-parent comparison.
- `ignored_reverted`: an original change and its exact inverse both occur after `comparison_start` and before or at the pin, their combined pinned-state effect is zero, and no substantive corpus update adopted the transient state. Mark both commits ignored. A revert of a pre-window change is not an ignored pair; classify its in-window net effect normally. A partial revert is not ignored.
- `ignored_tests`: tests or fixtures only, unless a live corpus claim explicitly governs the test contract or the changed fixture alters shipped behavior.
- `ignored_internal`: build, CI, deployment, packaging, observability, performance tuning, examples, or internal implementation only, unless it changes an externally observable contract or a live corpus claim explicitly governs that property.

Commit messages are hints, never sufficient evidence. Classify from the pinned diff and affected code.

## 4. Gaps and contradictions

After commit classification and the pinned-state check, record discrepancies at the pin:

- `material_omission`: a current material in-scope behavior exists in code but the live corpus has no statement covering that behavior or its replacement. Cite the introducing/changing commit and the exhaustive corpus tree/search used to establish absence.
- `material_contradiction`: pinned code behaves incompatibly with a live affirmative corpus claim. Cite the exact claim and exact code/diff.
- `minor_gap`: a mismatch concerns only an internal or implementation detail that is not material under section 3. An omitted detail that the corpus never claimed to cover is not a gap at all.

A change is `covered` when the live corpus describes its externally observable result or governed design accurately; matching filenames or shared keywords are insufficient. A process migration, external ADR, issue, or newer documentation outside the nominated corpus cannot change `omitted` or `contradicted` to `covered`.

A **core claim** is a live affirmative statement that the corpus itself labels as a goal, primary workflow, system boundary, invariant, required/must/shall behavior, acceptance criterion, or public interface/schema, and whose violation changes externally observable behavior, compatibility, security, data integrity, or the project's stated primary purpose. Both the textual label and the material consequence are required. A heading or keyword alone is not enough.

## 5. Non-overlapping rating decision tree

Apply these branches in order and stop at the first match:

1. **`unknown`** — any required input cannot be established: the exact SHA is unreachable; canonical repository identity differs; the recursive tree is truncated/unavailable; a nominated path cannot be enumerated; first-parent commit history or a required diff is unavailable; the pin/spec timestamps are temporally inconsistent; or corpus scope was not predeclared. Ordinary uncertainty about interpretation is not enough—use the evidence and tie-breaks below.
2. **`high`** — at least one of these is true:
   - pinned code materially contradicts at least one core claim; or
   - the corpus is stale for the 90-day rule **and** at least three distinct `material_in_scope` commits in the fixed window each leave a material omission or material contradiction observable at the pin.
3. **`moderate`** — `high` is false, and at least one material omission or material contradiction is observable at the pin.
4. **`low`** — `high` and `moderate` are false, and at least one minor gap is observable at the pin.
5. **`none`** — no material omission, material contradiction, or minor gap is observable at the pin.

The number of unrelated repository commits, age alone, a framework directory's absence, historical artifacts, incomplete adoption, and low confidence cannot change the level.

## 6. Tie-break rules

Use these in order:

1. The immutable pinned tree beats branch heads, issue status, prose outside the corpus, and commit-message claims.
2. Explicit artifact lifecycle text/path beats inferred lifecycle. If there is no explicit marker, the artifact is `live`.
3. An explicit affirmative statement beats an implication. Silence can establish an omission only after the entire nominated corpus has been enumerated and searched.
4. When live nominated artifacts conflict in overlapping scope, use the one with the later substantive commit reachable from the pin. If they were last changed in the same commit, treat the conflict itself as a material contradiction only when pinned code satisfies one and violates the other; otherwise record a minor gap.
5. Materiality requires a concrete code/diff consequence from section 3. If that consequence cannot be shown, classify the change as ignored or the mismatch as minor; do not promote it speculatively.
6. Scope is the manifest value. For `change-scoped`, uncertainty about whether unrelated work should have had a spec is resolved as `material_out_of_scope`, never drift.
7. A clean revert pair is ignored exactly as defined above. Retained plans do not override the pinned net state.
8. Count distinct first-parent commits for the three-change `high` threshold. Never count files, hunks, requirements, or multiple effects within one commit.
9. When two levels still appear plausible, choose the lower severity unless the higher level's complete branch conditions are supported by pinned citations. Use `unknown` only for the evidence failures in branch 1.

## 7. Separate change-scoped adoption coverage

This observation is mandatory for `change-scoped` corpora and `not_applicable` for `canonical` corpora. It can never alter `drift_rating`.

Use the full repository interval `(window_floor, pin_time]`, not `comparison_start`. From the same first-parent chain and ignored rules, count:

- `material_repository_commits`: all commits passing the materiality test, whether in or out of nominated scope;
- `nominated_scope_commits`: those material commits that pass the nominated corpus's scope test.

Report `coverage_fraction` as the exact string `nominated_scope_commits/material_repository_commits` and `coverage_percent` rounded to one decimal. If the denominator is zero, report `0/0` and `null`. This is **nominated-corpus change coverage**, a reproducible proxy for how much recent material work belongs to the assessed change corpus. It does not claim that out-of-scope work lacked some other spec and must not be described as whole-team SDD adoption.

## 8. Evidence checklist

For every manifest row, complete all steps:

1. Resolve the exact repository name and 40-character pin; require an untruncated recursive tree.
2. Enumerate every file under every nominated entry point and record missing paths. Read all substantive spec/design/requirements/plan files; templates, scripts, and generated indexes can be listed without being treated as claims.
3. Record each artifact's `live`, `future`, or `historical` lifecycle with a pinned URL and, when non-live, the exact status word/path.
4. Locate the latest substantive corpus commit and compute `window_floor`, `comparison_start`, and `spec_is_stale_90d` exactly.
5. Enumerate every first-parent commit in `(comparison_start, pin_time]`; inspect its diff and assign exactly one commit class.
6. For change-scoped adoption coverage, also enumerate `(window_floor, comparison_start]` and classify materiality/scope.
7. Compare live claims directly with relevant code at the pin. Inventory covered changes, material omissions, material contradictions, and minor gaps.
8. Attach a pinned GitHub commit/blob/tree URL to every nonempty evidence item. Use current repository metadata only to verify identity; do not use moving branch content as evidence.
9. Apply the decision tree mechanically, validate the output schema, and return projects in manifest order.

## 9. Required structured output

Return one JSON array and no prose outside it. It must contain exactly 22 objects in manifest order. Use empty arrays, not omitted keys. Each object must have exactly these fields:

```json
{
  "protocol_version": "2.0",
  "slug": "manifest slug",
  "repository": "Owner/Repo",
  "pin_sha": "40-character lowercase SHA",
  "pin_time_utc": "ISO-8601 timestamp from manifest",
  "evidence_complete": true,
  "evidence_failure": null,
  "corpus": {
    "scope": "canonical | change-scoped",
    "entry_points": ["manifest path"],
    "enumerated_file_count": 0,
    "artifacts": [
      {
        "path": "path",
        "lifecycle": "live | future | historical",
        "status_basis": "short factual basis",
        "url": "pinned GitHub URL"
      }
    ]
  },
  "window": {
    "window_floor_utc": "ISO-8601 timestamp",
    "latest_substantive_spec_commit": "40-character SHA or null",
    "latest_substantive_spec_time_utc": "ISO-8601 timestamp or null",
    "comparison_start_utc": "ISO-8601 timestamp",
    "spec_is_stale_90d": false
  },
  "commits": [
    {
      "sha": "40-character SHA",
      "time_utc": "ISO-8601 timestamp",
      "classification": "material_in_scope | material_out_of_scope | ignored_dependency | ignored_docs | ignored_release | ignored_format | ignored_merge | ignored_reverted | ignored_tests | ignored_internal",
      "observable_effect": "one factual sentence",
      "url": "pinned commit URL"
    }
  ],
  "covered_changes": [
    {
      "change_sha": "40-character SHA",
      "spec_path": "path",
      "basis": "one factual sentence",
      "urls": ["pinned GitHub URL"]
    }
  ],
  "material_omissions": [
    {
      "change_sha": "40-character SHA",
      "behavior": "current omitted behavior",
      "absence_check": "where/how the complete corpus was checked",
      "urls": ["pinned GitHub URL"]
    }
  ],
  "material_contradictions": [
    {
      "claim": "short paraphrase of live claim",
      "core_claim": false,
      "code_conflict": "short factual conflict",
      "urls": ["pinned spec URL", "pinned code or commit URL"]
    }
  ],
  "minor_gaps": [
    {
      "gap": "non-material mismatch",
      "urls": ["pinned GitHub URL"]
    }
  ],
  "adoption_coverage": {
    "status": "measured | not_applicable",
    "material_repository_commits": 0,
    "nominated_scope_commits": 0,
    "coverage_fraction": "0/0",
    "coverage_percent": null
  },
  "drift_rating": "unknown | none | low | moderate | high",
  "rating_rule": "exact first matching decision-tree branch",
  "confidence": "high | medium | low",
  "rationale": "at most three factual sentences"
}
```

For `unknown`, set `evidence_complete` to `false`, fill `evidence_failure`, leave unavailable evidence arrays empty, set coverage counts to zero/`0/0`/`null`, and name the exact branch-1 failure in `rating_rule`. Otherwise `evidence_complete` must be `true` and `evidence_failure` must be `null`. Confidence reports evidence clarity only and cannot alter the rating.

## 10. Exact blind-run prompt

Paste the following text unchanged into each isolated run and attach this file unchanged. Do not include any other project record or prior assessment.

```text
Perform one blind drift-rating run for the 22 frozen repositories in the attached file `drift-rubric-v2.md`.

Treat that file as the sole rubric, input manifest, scope assignment, decision tree, evidence checklist, and output contract. Follow protocol version 2.0 literally. Inspect only first-party GitHub repository metadata, commit history, diffs, trees, and files at the exact manifest pins. Do not inspect `src/content/projects/`, any Observatory project record, `2026-08-09-drift-rating-reproducibility.md`, `drift-rerating-run-1.json`, `drift-rerating-run-2.json`, another assessor's work, or any stored/current drift rating or narrative. Do not search for prior Observatory conclusions.

Do not change a manifest repository, pin, timestamp, nominated entry point, or scope. Do not infer project-wide drift from unrelated work in a change-scoped repository. Compute all windows in UTC, classify every required first-parent commit, perform the pinned-state comparison, apply the non-overlapping decision tree in order, and keep adoption coverage separate from drift.

Return only the JSON array required by section 9, with exactly 22 objects in manifest order and no Markdown or prose outside the JSON. Before returning, verify every object against the schema and verify that every nonempty evidence item cites a first-party pinned GitHub URL.
```

## Retest decision rule

After both outputs pass schema/completeness validation, compare only `drift_rating` by slug using the order `unknown`, `none`, `low`, `moderate`, `high`. Accept the rubric for automation only if at least 18 of 22 ratings match exactly and no project differs by two or more levels. This is the frozen issue #60 gate, not a rating rule available to either blind assessor.
