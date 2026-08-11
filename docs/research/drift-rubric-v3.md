# Drift rating protocol v3.0: frozen hybrid retest rubric

Status: proposed protocol for the issue #60 hybrid retest
Protocol date: 2026-08-09
Protocol owner: SDD Observatory

## Purpose and design conclusion

V2 improved exact agreement from 11/22 to 16/22, but failed because the two assessors independently reconstructed different evidence. They selected different spec-history commits, omitted different pinned contradictions, disagreed about whether the same change was covered, and produced one invalid SHA cross-reference. V3 removes that work from the assessor.

Each repository is compiled once into a validated, immutable evidence packet. Both blind runs receive byte-identical packets. The assessor has no network or repository tools and makes only five semantic decisions:

1. artifact lifecycle;
2. whether each prelisted material behavior is inside the predeclared corpus scope;
3. whether current pinned code is covered, omitted, contradicted, or differs only in a minor detail;
4. whether a contradicted live claim is a core claim; and
5. which first branch of the ordered rating tree applies.

The assessor must not discover repositories, fetch GitHub data, select paths, identify a pin, choose a spec update, calculate a window, enumerate commits, classify materiality, create evidence summaries, search for extra evidence, or type a SHA or URL. Those are packet-production or validation responsibilities.

## What is sourced and what is prescribed

Repository identity, commit objects and parents, Git trees and blobs, and path-filtered commit history are factual inputs obtained from GitHub. GitHub documents the relevant first-party operations in its [repository](https://docs.github.com/en/rest/repos/repos#get-a-repository), [commit-list](https://docs.github.com/en/rest/commits/commits#list-commits), [single-commit](https://docs.github.com/en/rest/commits/commits#get-a-commit), [Git-tree](https://docs.github.com/en/rest/git/trees#get-a-tree), and [Git-blob](https://docs.github.com/en/rest/git/blobs#get-a-blob) REST API references. Immutable `github.com/{owner}/{repo}/blob/{sha}/...`, `/tree/{sha}/...`, and `/commit/{sha}` URLs in the packet are human-readable views of those same pinned objects.

The pin-reconstruction method and the primary-source evidence for all 22 frozen inputs are retained in [`2026-08-09-drift-rating-reproducibility.md`](2026-08-09-drift-rating-reproducibility.md). The same note records the V2 disagreement and adherence audit that motivates this design.

Everything else here—including scope assignments, the 90-day interval, candidate rules, packet limits, semantic definitions, tie-breaks, schemas, and rating thresholds—is a **prescriptive protocol choice**, not a claim made by GitHub or an upstream project.

## Frozen manifest

The following identity, pin, nominated paths, and scope values are inputs. Neither the packet builder nor an assessor may replace or reinterpret them.

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

## 1. Evidence-packet production

Produce one JSON packet per manifest row. Freeze and validate all 22 packets before either blind run. A correction after either assessor sees a packet invalidates both runs and requires two fresh runs.

### 1.1 Identity, tree, and corpus

The builder must:

1. require the repository API's canonical `full_name` to equal the manifest value byte-for-byte;
2. fetch the exact 40-character pin and require its committer timestamp to equal `pin_time_utc`;
3. recursively enumerate the pinned tree and fail closed if GitHub reports `truncated: true`;
4. resolve each nominated entry point against that tree, without adding adjacent paths;
5. list every blob beneath each nominated directory and the exact nominated file blobs;
6. include the complete decoded contents and pinned URL of every UTF-8 or ASCII text blob in the nominated corpus; and
7. include path, mode, byte size, Git blob SHA, media classification, and pinned URL for every non-text blob.

The corpus is exhaustive, not sampled. A missing path, undecodable claim-bearing file, truncated tree, or corpus exceeding the bounds below is a packet failure and produces `unknown`; it must never be silently shortened.

`scope` and `scope_anchors` are predeclared packet data. For this retest, scope comes from the manifest. The packet compiler derives anchors once from explicit named features, components, interfaces, acceptance criteria, and code paths in the nominated corpus, freezes them before the blind runs, and gives each a corpus source ID. An anchor is a navigation aid, not an assessor-created expansion of scope.

### 1.2 Verified corpus path history and comparison start

For each nominated path, list path-filtered commits reachable from the pin, deduplicate by SHA, and order by `(committer_time descending, sha ascending)`. For each entry include parents, changed corpus paths, before/after blob IDs, and the normalized text delta.

A `substantive_update_candidate` is mechanically any path-history entry whose normalized text delta adds, deletes, or replaces a nonblank line with at least three Unicode letters or digits after removing Markdown link destinations, heading punctuation, checkbox glyphs, whitespace, and date/version-only tokens. Blob-identical moves, permission-only changes, whitespace-only changes, generated-index-only changes, and link-target-only changes are not candidates. This label means only “mechanically eligible to reset the window”; the assessor never chooses among candidates.

Include every candidate from the pin back through the first candidate at or before `window_floor_utc`, plus the two next older candidates if they exist. The selected latest update is the first candidate in the verified order. If none exists, it is `null`. Set:

- `window_floor_utc = pin_time_utc - 90 * 24 hours`;
- `comparison_start_utc` to the selected candidate's committer time only when it is strictly later than the floor; otherwise to the floor; and
- `spec_is_stale_90d` to `true` when the selected candidate is absent or is at/before the floor.

This deterministic rule intentionally prefers repeatability over an assessor's opinion about whether a small textual edit was meaningful. It prevents the V2 pattern in which two assessors selected different windows from the same history; an imperfect mechanical candidate still produces the same window in both runs.

### 1.3 Exact first-parent membership

Starting at the pin, follow `parents[0]` to the root. Do not stop at the first old timestamp because commit timestamps need not be monotonic. Filter that complete chain to commits whose committer time is in `(window_floor_utc, pin_time_utc]`. Preserve pin-to-root topological order and include each member's SHA, first-parent SHA, committer time, message, changed-file manifest, and immutable commit URL.

For each member, compare its tree to its first parent's tree; compare a root commit to the empty tree. Membership is never selected with a branch-head query and is never inferred from author dates. The packet additionally marks whether each exact member falls in `(comparison_start_utc, pin_time_utc]`.

### 1.4 Prelisted material behavior candidates

Materiality is settled before the blind runs. A packet compiler reviews the exact first-parent diffs under this fixed rule: a behavior is material only if it changes user-visible behavior, a public API/CLI/event/protocol/configuration semantic, an architectural boundary or responsibility, a persisted/domain model, or a property explicitly governed by the nominated corpus. Pure dependency, documentation, release, formatting, topology-only merge, exact reverted-pair, test-only, and internal build/CI/observability/implementation changes are excluded unless they change one of those governed or externally observable properties.

Split a qualifying commit into atomic `material_behavior_candidates` when it has independently assessable effects. Every candidate receives a builder-created ID and exactly one source commit. The assessor may decide scope, but may not reject the candidate's materiality, merge candidates, split candidates, or introduce a candidate. The packet must also list every excluded in-window commit with a fixed exclusion code and diff source, so validation proves that the membership was exhausted.

For each material candidate include:

- a neutral present-tense description of the pinned externally observable behavior or governed design;
- its source commit ID and affected paths;
- the exact supporting diff hunks when the complete diff is within bounds;
- otherwise a complete changed-file manifest, per-file additions/deletions, a neutral summary, and exact supporting excerpts;
- current pinned contents or excerpts sufficient to verify that the behavior remains observable at the pin; and
- zero or more scope-anchor IDs proposed by the packet compiler.

The compiler must also add `pinned_state_checks` for material current-code-versus-corpus questions not introduced by an in-window candidate, including mutually incompatible live corpus statements and current code evidence relevant to them. This is what makes older or same-commit contradictions, such as the V2 Schematic case, visible without allowing the assessor to search.

Summaries may compress evidence but may not add an interpretation such as “covered,” “omitted,” “contradicted,” “in scope,” or “core.” Each factual sentence must cite one or more packet source IDs.

### 1.5 Deterministic bounds

There is no random or model-selected sampling.

- A packet may contain at most 512 corpus text blobs and 2,000,000 decoded corpus bytes.
- A single full diff is included up to 200,000 UTF-8 bytes or 4,000 changed lines. Above either limit, use the complete changed-file manifest plus supporting exact hunks/excerpts.
- A packet may contain at most 64 material behavior candidates, 64 pinned-state checks, 1,024 source excerpts, and 5,000,000 decoded bytes total.
- Sort corpus paths bytewise ascending; history as specified above; first-parent commits pin-to-root; candidates by `(commit chain position, candidate ID)`; and all source registries by source ID.
- If the complete evidence cannot fit these limits, do not sample. Set `packet_status: "oversize"`, identify the exceeded bound, omit no integrity metadata, and require an `unknown` result for that repository.

These are per-repository packets so one large repository cannot consume another repository's assessment budget.

## 2. Evidence-packet schema

The normative schema is the field contract below. `[]` means an array of objects of the shown shape. All fields are required; empty arrays are permitted only when factually empty.

```json
{
  "protocol_version": "3.0",
  "packet_id": "p03-{order}-{slug}",
  "packet_status": "valid | invalid | oversize",
  "packet_failure": null,
  "identity": {
    "order": 1,
    "slug": "manifest slug",
    "repository": "Owner/Repo",
    "pin_sha": "40 lowercase hex characters",
    "pin_time_utc": "ISO-8601 UTC",
    "repository_api_url": "first-party GitHub API URL",
    "pin_api_url": "first-party GitHub API URL",
    "pin_html_url": "immutable GitHub commit URL"
  },
  "corpus": {
    "scope": "canonical | change-scoped",
    "entry_points": ["manifest path"],
    "scope_anchors": [
      {"anchor_id": "a001", "kind": "feature | component | interface | criterion | code_path", "name": "exact corpus term", "source_ids": ["s001"]}
    ],
    "files": [
      {"artifact_id": "f001", "path": "path", "git_blob_sha": "40 hex", "size_bytes": 0, "media": "text | binary", "assess_lifecycle": true, "last_change_sha": "40 hex", "last_change_time_utc": "ISO-8601 UTC", "url": "immutable URL", "source_id": "s001 or null; complete text is stored once in this source"}
    ]
  },
  "window": {
    "window_floor_utc": "ISO-8601 UTC",
    "substantive_update_candidates": [
      {"sha": "40 hex", "time_utc": "ISO-8601 UTC", "parents": ["40 hex"], "paths": ["path"], "before_after_blob_ids": [{"path": "path", "before": "40 hex or null", "after": "40 hex or null"}], "normalized_delta_source_id": "s002"}
    ],
    "selected_latest_update_sha": "40 hex or null",
    "selected_latest_update_time_utc": "ISO-8601 UTC or null",
    "comparison_start_utc": "ISO-8601 UTC",
    "spec_is_stale_90d": false
  },
  "first_parent_commits_90d": [
    {"commit_id": "c001", "sha": "40 hex", "first_parent_sha": "40 hex or null", "time_utc": "ISO-8601 UTC", "message": "verbatim message", "after_comparison_start": true, "changed_files": [{"path": "path", "status": "added | modified | deleted | renamed", "before_blob": "40 hex or null", "after_blob": "40 hex or null", "additions": 0, "deletions": 0}], "url": "immutable URL", "diff_source_ids": ["s003"]}
  ],
  "material_behavior_candidates": [
    {"candidate_id": "m001", "commit_id": "c001", "behavior": "neutral current behavior", "affected_paths": ["path"], "proposed_scope_anchor_ids": ["a001"], "diff_source_ids": ["s003"], "pinned_state_source_ids": ["s004"]}
  ],
  "excluded_commits": [
    {"commit_id": "c002", "code": "dependency_only | docs_only | release_only | format_only | merge_only | reverted_pair | tests_only | internal_only", "source_ids": ["s005"]}
  ],
  "pinned_state_checks": [
    {"check_id": "p001", "question": "neutral current-code-versus-corpus question", "artifact_ids": ["f001"], "code_source_ids": ["s006"], "corpus_source_ids": ["s001"]}
  ],
  "sources": [
    {"source_id": "s001", "kind": "corpus_blob | code_blob | diff | normalized_delta | commit_metadata", "repository": "Owner/Repo", "sha": "40 hex", "path": "path or null", "line_start": 1, "line_end": 10, "content": "exact content, diff, or metadata", "content_sha256": "64 hex", "url": "immutable GitHub URL"}
  ],
  "integrity": {
    "canonical_json_sha256": "64 hex; calculated with this field set to 64 zeroes",
    "tree_truncated": false,
    "corpus_complete": true,
    "first_parent_membership_complete": true,
    "material_candidates_complete": true,
    "pinned_state_checks_complete": true,
    "neutral_summaries_valid": true,
    "cross_references_valid": true,
    "bounds_valid": true,
    "builder_version": "exact version",
    "built_at_utc": "ISO-8601 UTC"
  }
}
```

`canonical_json_sha256` uses UTF-8 JSON with object keys sorted bytewise, arrays in their prescribed order, no insignificant whitespace, and the hash field temporarily replaced by 64 ASCII zeroes. This canonicalization is a protocol definition.

## 3. Semantic assessment rules

### 3.1 Unit and scope

The unit is the nominated corpus at the immutable pin, not overall documentation quality or whole-team SDD adoption.

- For `canonical`, a material candidate is `in_scope` unless a live corpus statement explicitly excludes its feature/component/interface. The assessor must cite that exclusion to return `out_of_scope`.
- For `change-scoped`, a candidate is `in_scope` only when its behavior implements or changes at least one predeclared scope anchor. Shared technology, nearby files, the same product, or thematic similarity is insufficient. Without a concrete anchor match, return `out_of_scope`.
- Proposed anchor IDs are hints. The assessor must affirm at least one actual anchor match; it may select another predeclared anchor but cannot create one.
- Scope is decided per atomic behavior candidate, not per commit. Out-of-scope work can affect separately derived adoption coverage but never drift.

### 3.2 Artifact lifecycle

Assign exactly one lifecycle to every corpus artifact whose packet field `assess_lifecycle` is `true`. The field is `false` only for non-text blobs that cannot contain prose claims.

- `historical`: an ancestor path segment is exactly `archive`, `archived`, `history`, `historical`, `completed`, `superseded`, `deprecated`, `retired`, or `reverted`; or artifact-level frontmatter, title-adjacent status, or an owning index explicitly assigns one of those states to the whole artifact.
- `future`: `historical` is false and artifact-level frontmatter, title-adjacent status, or an owning index explicitly assigns `draft`, `proposal`, `proposed`, `planned`, `future`, or `not implemented` to the whole artifact.
- `live`: neither test passes.

The words above count only as whole-artifact status markers, not when they appear inside requirements, examples, changelogs, task prose, or descriptions of another artifact. Age, unchecked boxes, append-only history, implementation-looking code, or an assessor's belief that a workflow was abandoned never changes lifecycle. If status signals conflict, use `historical` over `future` over `live`. A live artifact may contain locally future or historical statements; such a statement is not an affirmative live claim unless its local status says it governs current behavior. Only affirmative live claims can create drift.

### 3.3 Current pinned-state classification

For every `in_scope` material behavior candidate and every pinned-state check, choose exactly one status:

- `contradicted`: an affirmative live claim and pinned code cannot both be true under the same conditions. Direct incompatibility is required; silence, different terminology, missing detail, or a future/historical statement is not contradiction.
- `covered`: `contradicted` is false and an affirmative live claim accurately states the behavior's externally observable outcome or the governed design property. It need not use the same identifier or describe internal mechanics.
- `omitted`: `contradicted` and `covered` are false, the current behavior is material and in scope, and no affirmative live claim states its outcome or governed property anywhere in the complete corpus.
- `minor_gap`: the same current behavior is covered, but an affirmative live claim is inaccurate only about a nonmaterial internal detail that does not change observable behavior, compatibility, security, data integrity, public interfaces, architecture, or the project's stated primary purpose.

Apply the statuses in that order. A behavior with both a matching and an incompatible live claim is `contradicted`. Partial coverage is `covered` only if every externally observable or explicitly governed part of the atomic candidate is stated accurately; otherwise it is `omitted`, unless an explicit claim is directly incompatible, which is `contradicted`. External ADRs, issues, pull requests, READMEs, or docs outside the packet corpus cannot repair an omission or contradiction.

For a pinned-state check that compares two corpus claims with code, return `contradicted` only when code satisfies one live affirmative claim and violates the other. If code evidence cannot distinguish them, return `minor_gap`. Packet summaries are navigation aids; exact source content wins.

### 3.4 Core claims

Evaluate `core_claim` only for a `contradicted` live claim. It is `true` only when both tests pass:

1. **Text test:** the corpus itself presents the claim as a goal, primary workflow, system boundary, invariant, required/must/shall behavior, acceptance criterion, or public interface/schema.
2. **Consequence test:** the packet evidence shows that violating it changes externally observable behavior, compatibility, security, data integrity, or the project's stated primary purpose.

A heading, keyword, severity adjective, or broad architecture prose alone does not pass both tests. If either test lacks cited evidence, `core_claim` is `false`.

### 3.5 Ordered rating tree

Apply these branches in order and stop at the first match:

1. **`unknown` (`U1`)** — `packet_status` is not `valid`, `tree_truncated` is not `false`, or any other integrity boolean is not `true`. Semantic uncertainty is not `unknown`; use the lower-severity tie-break below.
2. **`high` (`H1`)** — at least one `contradicted` item has `core_claim: true`.
3. **`high` (`H2`)** — `H1` is false, `spec_is_stale_90d` is true, and at least three distinct source commits after `comparison_start_utc` each contain an `in_scope` candidate rated `omitted` or `contradicted` at the pin.
4. **`moderate` (`M1`)** — both high branches are false and at least one `in_scope` candidate or pinned-state check is `omitted` or `contradicted`.
5. **`low` (`L1`)** — all earlier branches are false and at least one item is `minor_gap`.
6. **`none` (`N1`)** — every in-scope candidate and pinned-state check is `covered`, or there are no in-scope candidates/checks, and there are no minor gaps.

Count distinct commit IDs for `H2`, never behaviors, files, hunks, or claims. Pinned-state checks with no in-window source commit can trigger `H1` or `M1` but never count toward `H2`. Age alone, out-of-scope work, historical/future artifacts, incomplete adoption, or assessor confidence cannot change the level.

## 4. Tie-breaks

Use these rules in order:

1. Exact packet source content beats a neutral packet summary.
2. Pinned code beats commit-message intent, and corpus text beats a scope-anchor label.
3. Apply lifecycle before comparing claims; unmarked artifacts and unmarked statements in a live artifact are live.
4. Direct logical incompatibility beats coverage; coverage beats omission; omission beats a speculative minor gap.
5. For change-scoped candidates, absence of a concrete predeclared anchor match means `out_of_scope`.
6. When two live artifacts conflict, the artifact with the later verified last-change commit in the packet governs. If they were last changed in the same commit, use the pinned-state-check rule in section 3.3.
7. Do not infer absence from a summary. `omitted` is permitted only because the packet contains the complete corpus; if `corpus_complete` is false, the rating is `unknown` under `U1`.
8. If two ratings remain plausible after applying the tree, choose the lower severity unless every condition of the higher branch has cited packet IDs.
9. Never create or transcribe an evidence identifier, SHA, URL, path, timestamp, or count. Select only IDs present in the packet; the validator derives the underlying facts.

## 5. Semantic-only assessor output schema

Return one JSON array in manifest order and no prose. Each packet produces exactly one object with exactly these fields:

```json
{
  "protocol_version": "3.0",
  "packet_id": "existing packet ID",
  "artifact_lifecycle": [
    {"artifact_id": "existing artifact ID", "lifecycle": "live | future | historical", "basis_source_ids": ["existing source ID"]}
  ],
  "candidate_assessments": [
    {"candidate_id": "existing candidate ID", "scope": "in_scope | out_of_scope", "scope_anchor_ids": ["existing anchor ID"], "status": "covered | omitted | contradicted | minor_gap | not_assessed", "claim_source_ids": ["existing corpus source ID"], "code_source_ids": ["existing code/diff source ID"], "core_claim": false}
  ],
  "pinned_state_assessments": [
    {"check_id": "existing check ID", "status": "covered | omitted | contradicted | minor_gap", "claim_source_ids": ["existing corpus source ID"], "code_source_ids": ["existing code source ID"], "core_claim": false}
  ],
  "drift_rating": "unknown | none | low | moderate | high",
  "rating_rule": "U1 | H1 | H2 | M1 | L1 | N1",
  "rationale": "at most three factual sentences using packet IDs, never raw SHAs or URLs"
}
```

Every artifact with `assess_lifecycle: true`, every candidate, and every pinned-state check must appear exactly once and in packet order. Artifacts with `assess_lifecycle: false` must not appear. An out-of-scope candidate must use `status: "not_assessed"`, empty claim/code source arrays, and `core_claim: false`. An in-scope candidate and every pinned-state check must use one of the other four statuses. `core_claim` may be true only with `status: "contradicted"`. The assessor does not output repository identity, windows, commit membership, URLs, coverage arithmetic, or confidence.

## 6. Exact blind prompt

Give each isolated assessor this file and the same 22 validated packet files. Paste the following text unchanged. Do not provide earlier ratings, project records, run outputs, or the reproducibility report.

```text
Perform one blind semantic drift-rating run under protocol 3.0 using the attached `drift-rubric-v3.md` and the 22 attached evidence packets.

Treat the rubric and packets as your complete universe of evidence. You may use read-only local file commands solely to read the attached rubric and packets and may write only your requested output file. Do not use network access, GitHub, repository or Git-history tools, search, prior knowledge, or any file not attached to this run. Do not reconstruct or change repository identity, pins, nominated paths, scope, scope anchors, path history, the selected latest spec update, timestamps, windows, first-parent membership, materiality, excluded commits, source summaries, or source identifiers. Do not add evidence or type a SHA, URL, path, timestamp, or count.

For each packet, classify every artifact lifecycle, decide scope for every prelisted material behavior candidate, compare every in-scope candidate and pinned-state check with the complete corpus and pinned code evidence, decide core-claim status only for contradictions, and apply the ordered rating tree literally. Use the tie-breaks whenever needed. If a packet is invalid or oversize, apply U1 and do not repair it.

Return only the JSON array required by section 5, with exactly 22 objects in manifest order and no Markdown or prose outside the JSON. Before returning, verify that every artifact, candidate, and pinned-state check appears exactly once in packet order and that every referenced ID already exists in its packet.
```

## 7. Validation and derived observations

Run validation before comparing results.

### Packet validator

For every packet, independently recompute or verify:

- manifest identity, canonical repository name, full pin, pin time, and pinned URL shapes;
- recursive-tree completeness and exact nominated-path membership;
- each corpus blob's Git object ID, decoded content hash, pinned path, last-change commit/time, lifecycle flag, and URL;
- path-history reachability, candidate ordering, normalized deltas, and selected latest update;
- 90-day floor, comparison start, staleness, and exact first-parent membership by walking parents from the pin;
- changed-file and before/after blob cross-references;
- that every in-window commit is represented exactly once by one or more material candidates or one excluded-commit record;
- material-candidate and pinned-state-check completeness certifications, neutral-summary review, source-content hashes, source-to-SHA/path consistency, and all internal IDs;
- bounds, prescribed array order, and `canonical_json_sha256`.

Any failure sets `packet_status: "invalid"`; it is not repaired by an assessor.

### Assessor-output validator

Reject a run unless it has 22 unique objects in manifest order, exact keys/enums, and complete one-to-one coverage of packet artifacts/candidates/checks. Reject unknown IDs, duplicate IDs, raw SHA/URL transcription, invalid lifecycle/status combinations, `core_claim: true` on a non-contradiction, nonempty assessment fields on out-of-scope candidates, or missing required citations.

Recompute `drift_rating` and `rating_rule` mechanically from the semantic decisions and packet window fields. A mismatch invalidates the run; the validator's recomputed value does not silently replace it.

After validation, derive change-scoped adoption coverage without asking the assessor: denominator = distinct 90-day commits with at least one material candidate; numerator = distinct such commits with at least one `in_scope` candidate. Report the exact fraction and one-decimal percentage, or `0/0` and `null`. This observation never changes drift.

## 8. Frozen retest gate

Run two isolated assessments with the byte-identical rubric and packet set. Compare only validated `drift_rating` values by slug using the order `unknown`, `none`, `low`, `moderate`, `high`.

Accept V3 for automation only if:

- at least **18 of 22** ratings match exactly; and
- **no** project differs by two or more levels.

This is the unchanged [issue #60](https://github.com/emilesilvis/sddobservatory.com/issues/60) gate. A structurally invalid run, a failed packet, or any packet correction after a run begins rejects the retest; it is not counted as agreement.
