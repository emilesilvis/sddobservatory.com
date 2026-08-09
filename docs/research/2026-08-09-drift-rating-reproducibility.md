# Historical repository pins for drift-rating reproducibility

Date: 2026-08-09
Scope: pin reconstruction and repository/spec-path evidence for [issue #60](https://github.com/emilesilvis/sddobservatory.com/issues/60). No drift rating is attempted here.

## Result

All 22 repository states were pinned. Every SHA is currently reachable through GitHub, every requested repository identifier resolves to the same canonical `full_name` (including case), and every pinned recursive tree was returned without truncation. No missing, renamed, or unreachable pin was found.

The evidence in this note comes only from first-party GitHub repository data: the Observatory Git history, each upstream repository's metadata, commits, and pinned trees. Project records were not read while reconstructing the pins.

## Deterministic pin rule

The date-only `lastReviewed` value is not precise enough to choose a unique commit. For each project, use this rule:

1. Find the Observatory commit that first added the project record, without reading the record contents. Treat that commit's **committer timestamp**, converted to UTC, as the review/import cutoff. This is the closest durable upper bound recorded by the review workflow and disambiguates all date-only values.
2. Resolve the upstream repository's **currently reported default branch** from GitHub repository metadata.
3. Ask GitHub's [List commits API](https://docs.github.com/en/rest/commits/commits#list-commits) for that branch with `until=<cutoff>` and `per_page=1`. The returned first commit is the pin: the latest commit reachable from that branch which GitHub returns no later than the cutoff.
4. Record `commit.committer.date` as the pin timestamp, then verify the SHA with GitHub's commit endpoint and enumerate evidence paths with the [recursive Git Trees API](https://docs.github.com/en/rest/git/trees#get-a-tree). A recursive response with `truncated: false` is required.
5. Once recorded, the SHA—not a repeated date query—is the reproducible identity. If a default branch is later renamed or force-rewritten, the stored SHA remains the intended pin; a future failure to fetch it is a pin-integrity failure, not permission to silently select a replacement.

This rule is deliberately mechanical. It does not claim that the import timestamp is the exact instant the reviewer opened the upstream repository; it is a consistent, repository-recorded upper bound. GitHub's current metadata does not expose a historical timeline of default-branch-name changes, so the present default branch is an explicit assumption. No requested repository currently shows a rename or resolution mismatch.

## Pin and path evidence

`Cutoff` links point to the Observatory import commit used to derive the exact UTC cutoff. Spec-path links are concise entry points, not an exhaustive inventory.

| Slug | Repository | `lastReviewed` | Pinned SHA | Pin timestamp (UTC) | Default branch | Spec path(s) at pin | Pin caveat / cutoff |
|---|---|---:|---|---|---|---|---|
| `agentic-context-engine` | [kayba-ai/agentic-context-engine](https://github.com/kayba-ai/agentic-context-engine) | 2026-07-19 | [`96f7c9cfea1d`](https://github.com/kayba-ai/agentic-context-engine/commit/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a) | 2026-06-09T18:06:15Z | `main` | [`.specify/`](https://github.com/kayba-ai/agentic-context-engine/tree/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a/.specify), [`specs/`](https://github.com/kayba-ai/agentic-context-engine/tree/96f7c9cfea1d7cae74994c391ad7791e6cbf7f6a/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/e93286f034276b5904453253f46832855b7aab83) 2026-07-19T11:55:37Z |
| `akka-net` | [akkadotnet/akka.net](https://github.com/akkadotnet/akka.net) | 2026-07-18 | [`464d75766b9e`](https://github.com/akkadotnet/akka.net/commit/464d75766b9ecf195395981c77fc1b1d6c7c6e22) | 2026-07-18T03:11:08Z | `dev` | [`openspec/`](https://github.com/akkadotnet/akka.net/tree/464d75766b9ecf195395981c77fc1b1d6c7c6e22/openspec) | None; [shared cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/aea2d06097fa0eb5e867689272dbfcb3080a7e14) 2026-07-18T09:43:59Z |
| `arcreel` | [ArcReel/ArcReel](https://github.com/ArcReel/ArcReel) | 2026-07-19 | [`4270c404d653`](https://github.com/ArcReel/ArcReel/commit/4270c404d65389c521bc80115e11df87005c0d8e) | 2026-07-19T02:44:47Z | `main` | [`docs/superpowers/specs/`](https://github.com/ArcReel/ArcReel/tree/4270c404d65389c521bc80115e11df87005c0d8e/docs/superpowers/specs), [`openspec/`](https://github.com/ArcReel/ArcReel/tree/4270c404d65389c521bc80115e11df87005c0d8e/openspec) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/35f21a84b512769f2b6faa3d55f91549d53a3a58) 2026-07-19T11:55:31Z |
| `banana-slides` | [Anionex/banana-slides](https://github.com/Anionex/banana-slides) | 2026-07-19 | [`7b948fb6f2b6`](https://github.com/Anionex/banana-slides/commit/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e) | 2026-07-17T05:13:21Z | `main` | [`docs/specs/`](https://github.com/Anionex/banana-slides/tree/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e/docs/specs), [`docs/superpowers/specs/`](https://github.com/Anionex/banana-slides/tree/7b948fb6f2b630b4b9a07b6efa0c1266d298c91e/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/0d3ae625f05d5f1b9f37c61abbfeef86195ee5c0) 2026-07-19T11:55:15Z |
| `debrief` | [debrief/debrief](https://github.com/debrief/debrief) | 2026-07-18 | [`0696b105cf91`](https://github.com/debrief/debrief/commit/0696b105cf91c08466562a2ea03e3975034b5d6a) | 2026-06-21T18:57:05Z | `develop` | [`.specify/`](https://github.com/debrief/debrief/tree/0696b105cf91c08466562a2ea03e3975034b5d6a/.specify), [`specs/`](https://github.com/debrief/debrief/tree/0696b105cf91c08466562a2ea03e3975034b5d6a/specs) | None; [shared cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/aea2d06097fa0eb5e867689272dbfcb3080a7e14) 2026-07-18T09:43:59Z |
| `desktop-cc-gui` | [zhukunpenglinyutong/desktop-cc-gui](https://github.com/zhukunpenglinyutong/desktop-cc-gui) | 2026-07-19 | [`c1544f8f3f5d`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/commit/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6) | 2026-07-19T10:45:15Z | `main` | [`.trellis/spec/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/.trellis/spec), [`openspec/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/openspec), [`docs/superpowers/specs/`](https://github.com/zhukunpenglinyutong/desktop-cc-gui/tree/c1544f8f3f5d7ac1034c4a9276ab44164d56b0f6/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/8b3eb8fca312b33d254d0d81e09130ea7d22dc92) 2026-07-19T11:55:27Z |
| `evalai` | [Cloud-CV/EvalAI](https://github.com/Cloud-CV/EvalAI) | 2026-07-19 | [`d43da66bab66`](https://github.com/Cloud-CV/EvalAI/commit/d43da66bab66d7bb526058487fc9fb294ca5740f) | 2026-07-09T22:21:53Z | `master` | [`docs/superpowers/specs/`](https://github.com/Cloud-CV/EvalAI/tree/d43da66bab66d7bb526058487fc9fb294ca5740f/docs/superpowers/specs), [`docs/superpowers/plans/`](https://github.com/Cloud-CV/EvalAI/tree/d43da66bab66d7bb526058487fc9fb294ca5740f/docs/superpowers/plans) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/11bf83f3623017f7ec5dfc74fafdf1fff4b4b508) 2026-07-19T11:55:45Z |
| `folo` | [RSSNext/Folo](https://github.com/RSSNext/Folo) | 2026-07-19 | [`773f1bfe218a`](https://github.com/RSSNext/Folo/commit/773f1bfe218ac349b9fb9b5cbd982c320f6b414f) | 2026-07-15T01:00:49Z | `dev` | [`docs/superpowers/specs/`](https://github.com/RSSNext/Folo/tree/773f1bfe218ac349b9fb9b5cbd982c320f6b414f/docs/superpowers/specs), [`docs/superpowers/plans/`](https://github.com/RSSNext/Folo/tree/773f1bfe218ac349b9fb9b5cbd982c320f6b414f/docs/superpowers/plans) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/496a8c7ee3792e1b7de4cd3d327b9249b4870592) 2026-07-19T11:55:07Z |
| `growi` | [growilabs/growi](https://github.com/growilabs/growi) | 2026-07-19 | [`01bfdd3e4467`](https://github.com/growilabs/growi/commit/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c) | 2026-07-18T10:53:16Z | `master` | [`.kiro/specs/`](https://github.com/growilabs/growi/tree/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c/.kiro/specs), [`.kiro/settings/`](https://github.com/growilabs/growi/tree/01bfdd3e44675fcb9dbe34a07f3c68171c2adf4c/.kiro/settings) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/de16a45a110c5ab25245253507b16259747d9b92) 2026-07-19T11:41:26Z |
| `logitune` | [mmaher88/logitune](https://github.com/mmaher88/logitune) | 2026-07-19 | [`3232e817eeb8`](https://github.com/mmaher88/logitune/commit/3232e817eeb8ff0791b6718df6cc822fabd6a3b9) | 2026-06-19T02:14:07Z | `master` | [`docs/superpowers/specs/`](https://github.com/mmaher88/logitune/tree/3232e817eeb8ff0791b6718df6cc822fabd6a3b9/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/91363e2511e6ca1abea0d7d468b477558aa52a4b) 2026-07-19T11:55:59Z |
| `miosub` | [corvo007/MioSub](https://github.com/corvo007/MioSub) | 2026-07-19 | [`9c6fee25dd20`](https://github.com/corvo007/MioSub/commit/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79) | 2026-07-18T17:31:59Z | `main` | [`openspec/specs/`](https://github.com/corvo007/MioSub/tree/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79/openspec/specs), [`openspec/changes/`](https://github.com/corvo007/MioSub/tree/9c6fee25dd20a88edd8173bdeffbfa1d9b9e2d79/openspec/changes) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/b70527676682254f4a5d13f5b7d3dcb6ff87fe1d) 2026-07-19T11:55:56Z |
| `mos` | [Caldis/Mos](https://github.com/Caldis/Mos) | 2026-07-19 | [`5dfb2363331c`](https://github.com/Caldis/Mos/commit/5dfb2363331cf63f529fdafa27962c41f91feff4) | 2026-07-09T03:23:47Z | `master` | [`docs/superpowers/specs/`](https://github.com/Caldis/Mos/tree/5dfb2363331cf63f529fdafa27962c41f91feff4/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/014d4aa44b0bb12913021010190205bbbe71a582) 2026-07-19T11:55:12Z |
| `openspec` | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 2026-07-18 | [`46a4d782229e`](https://github.com/Fission-AI/OpenSpec/commit/46a4d782229ebb104268130a16e85cb7662a2281) | 2026-07-17T21:41:11Z | `main` | [`openspec/changes/`](https://github.com/Fission-AI/OpenSpec/tree/46a4d782229ebb104268130a16e85cb7662a2281/openspec/changes) | None; [shared cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/aea2d06097fa0eb5e867689272dbfcb3080a7e14) 2026-07-18T09:43:59Z |
| `schematic` | [BjoernKW/Schematic](https://github.com/BjoernKW/Schematic) | 2026-07-19 | [`79e3285716b2`](https://github.com/BjoernKW/Schematic/commit/79e3285716b2d1a0a5845c2208861db4d4799c20) | 2026-07-09T16:31:34Z | `main` | [`docs/requirements.md`](https://github.com/BjoernKW/Schematic/blob/79e3285716b2d1a0a5845c2208861db4d4799c20/docs/requirements.md) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/b1f5a84517b9f5d3deda05c6357e57f14554280f) 2026-07-19T11:41:33Z |
| `sesh` | [joshmedeski/sesh](https://github.com/joshmedeski/sesh) | 2026-07-19 | [`bf5adc733ebf`](https://github.com/joshmedeski/sesh/commit/bf5adc733ebf755a0dc47719b8eb79d71568efb5) | 2026-07-17T21:17:54Z | `main` | [`docs/specs/`](https://github.com/joshmedeski/sesh/tree/bf5adc733ebf755a0dc47719b8eb79d71568efb5/docs/specs), [`docs/superpowers/specs/`](https://github.com/joshmedeski/sesh/tree/bf5adc733ebf755a0dc47719b8eb79d71568efb5/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/387c0ee254d2a56a59bf37e990ae39cfdd375523) 2026-07-19T11:55:34Z |
| `sokuji` | [kizuna-ai-lab/sokuji](https://github.com/kizuna-ai-lab/sokuji) | 2026-07-19 | [`7c738d6158e1`](https://github.com/kizuna-ai-lab/sokuji/commit/7c738d6158e1b3cac2615ba3fa78aaa22e4d1f57) | 2026-07-19T02:49:06Z | `main` | [`docs/superpowers/specs/`](https://github.com/kizuna-ai-lab/sokuji/tree/7c738d6158e1b3cac2615ba3fa78aaa22e4d1f57/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/cc569b4f08b0f60d835db7522b05c216f72d91af) 2026-07-19T11:55:52Z |
| `spirit-of-kiro` | [kirodotdev/spirit-of-kiro](https://github.com/kirodotdev/spirit-of-kiro) | 2026-07-18 | [`ff0c8c22cb40`](https://github.com/kirodotdev/spirit-of-kiro/commit/ff0c8c22cb4026f83df5aa9155e9b7f410809f30) | 2026-07-15T20:52:08Z | `main` | [`.kiro/steering/`](https://github.com/kirodotdev/spirit-of-kiro/tree/ff0c8c22cb4026f83df5aa9155e9b7f410809f30/.kiro/steering), [`docs/ROADMAP.md`](https://github.com/kirodotdev/spirit-of-kiro/blob/ff0c8c22cb4026f83df5aa9155e9b7f410809f30/docs/ROADMAP.md) | No `.kiro/specs/` tree at pin; [shared cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/aea2d06097fa0eb5e867689272dbfcb3080a7e14) 2026-07-18T09:43:59Z |
| `the-edge-agent` | [fabceolin/the_edge_agent](https://github.com/fabceolin/the_edge_agent) | 2026-07-19 | [`14b64873fdeb`](https://github.com/fabceolin/the_edge_agent/commit/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963) | 2026-05-17T02:27:39Z | `main` | [`_bmad-output/implementation-artifacts/`](https://github.com/fabceolin/the_edge_agent/tree/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963/_bmad-output/implementation-artifacts), [`rust/src/engine/a2a/design.md`](https://github.com/fabceolin/the_edge_agent/blob/14b64873fdebd1b7fea6b3c2ef185a89cbaa0963/rust/src/engine/a2a/design.md) | Only one `_bmad-output` implementation artifact was present at pin; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/9c5b9cf6397b0c2f47e07131e41ccd6e4fbaa96d) 2026-07-19T11:42:05Z |
| `understand-anything` | [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | 2026-07-19 | [`5c3bc1b7fdef`](https://github.com/Egonex-AI/Understand-Anything/commit/5c3bc1b7fdefd17b19b44420e89d279ded21dce8) | 2026-07-19T03:22:01Z | `main` | [`docs/superpowers/specs/`](https://github.com/Egonex-AI/Understand-Anything/tree/5c3bc1b7fdefd17b19b44420e89d279ded21dce8/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/dfddbbc84f796ad9ae607c17f7e763ba220544fa) 2026-07-19T11:41:22Z |
| `uniclipboard` | [UniClipboard/UniClipboard](https://github.com/UniClipboard/UniClipboard) | 2026-07-19 | [`1c229e9e19d2`](https://github.com/UniClipboard/UniClipboard/commit/1c229e9e19d25839e63300ce75bcde547bb0ad61) | 2026-07-19T03:49:01Z | `main` | [`.planning/REQUIREMENTS.md`](https://github.com/UniClipboard/UniClipboard/blob/1c229e9e19d25839e63300ce75bcde547bb0ad61/.planning/REQUIREMENTS.md), [`.planning/ROADMAP.md`](https://github.com/UniClipboard/UniClipboard/blob/1c229e9e19d25839e63300ce75bcde547bb0ad61/.planning/ROADMAP.md) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/1e81dbec429155dbfd0878de7d8cfa48a45ff6e7) 2026-07-19T11:41:29Z |
| `wukongim` | [WuKongIM/WuKongIM](https://github.com/WuKongIM/WuKongIM) | 2026-07-19 | [`462caf0cefdd`](https://github.com/WuKongIM/WuKongIM/commit/462caf0cefdd3e7778b8d6daee93f09eae3fcc15) | 2026-07-19T10:55:48Z | `main` | [`docs/superpowers/specs/`](https://github.com/WuKongIM/WuKongIM/tree/462caf0cefdd3e7778b8d6daee93f09eae3fcc15/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/7349877370ce1d65f7d4d0e95317c9c8389ccad8) 2026-07-19T11:55:23Z |
| `yserver` | [joske/yserver](https://github.com/joske/yserver) | 2026-07-19 | [`055debc4b583`](https://github.com/joske/yserver/commit/055debc4b583e44de865d073a4caa27cbf9b1b3c) | 2026-07-17T06:57:45Z | `master` | [`docs/superpowers/specs/`](https://github.com/joske/yserver/tree/055debc4b583e44de865d073a4caa27cbf9b1b3c/docs/superpowers/specs) | None; [cutoff](https://github.com/emilesilvis/sddobservatory.com/commit/74d6d0fe24f0da6b2fb83b0d73960c73f9054fb8) 2026-07-19T11:56:06Z |

## Reproduction checklist

- Use the full 40-character SHA from the commit link; the table abbreviates only the visible label.
- Fetch source and spec evidence from that SHA, never from a moving branch or repository landing page.
- Preserve the listed default branch as pin-construction provenance; it is not needed after the SHA is known.
- Fail closed if a SHA becomes unreachable, a repository starts resolving to a different canonical `full_name`, or GitHub returns a truncated recursive tree.
- Keep rating runs blind to any previously recorded rating. This note supplies repository identity and evidence paths only.

## Blind rerating protocol

Two isolated OpenAI Codex (GPT-5) runs received the same five-level rubric, the same 22 full SHAs, and the same
known spec-path entry points. Neither run could read `src/content/projects/`, this note, the other run, or any stored
Observatory rating or narrative. Each run inspected primary GitHub source, tree, and history evidence at the exact
pin and returned a rating, confidence, rationale, and two to five pinned source URLs for every project.

The complete retained outputs are:

- [`drift-rerating-run-1.json`](drift-rerating-run-1.json)
- [`drift-rerating-run-2.json`](drift-rerating-run-2.json)

Both files parse as JSON, contain exactly 22 unique project slugs, use only the permitted rating and confidence
values, match the supplied pins, and contain the required primary-source URLs. This satisfies the 44/44 completeness
and retention check.

## Agreement result

| Comparison | Exact agreement | Rate |
|---|---:|---:|
| Run 1 vs. Run 2 | 11/22 | 50.0% |
| Run 1 vs. stored | 10/22 | 45.5% |
| Run 2 vs. stored | 6/22 | 27.3% |

Run 1 and Run 2 had no two-level swings: all 11 run-to-run disagreements were between adjacent levels. That clears
the swing guardrail but not the precommitted exact-agreement threshold of at least 18/22. The result is therefore
**rejected**.

| Project | Stored | Run 1 | Run 2 | Run-to-run exact? |
|---|---|---|---|---:|
| `agentic-context-engine` | moderate | moderate | high | No |
| `akka-net` | none | none | none | Yes |
| `arcreel` | moderate | high | high | Yes |
| `banana-slides` | moderate | moderate | high | No |
| `debrief` | moderate | none | none | Yes |
| `desktop-cc-gui` | none | none | none | Yes |
| `evalai` | none | moderate | low | No |
| `folo` | moderate | low | low | Yes |
| `growi` | none | low | moderate | No |
| `logitune` | low | none | none | Yes |
| `miosub` | high | high | high | Yes |
| `mos` | low | low | low | Yes |
| `openspec` | none | none | low | No |
| `schematic` | low | none | none | Yes |
| `sesh` | low | low | none | No |
| `sokuji` | none | none | low | No |
| `spirit-of-kiro` | high | low | moderate | No |
| `the-edge-agent` | none | moderate | low | No |
| `understand-anything` | none | low | moderate | No |
| `uniclipboard` | none | none | none | Yes |
| `wukongim` | none | low | low | Yes |
| `yserver` | low | none | low | No |

## Disagreement decision log

Every project where the three values were not identical was traced. Causes use the issue's precommitted categories;
there are zero unexplained disagreements.

| Project | Cause | Trace |
|---|---|---|
| `agentic-context-engine` | Rubric ambiguity | Both runs found the same 155-commit gap and a still-useful original slice; the rubric does not say when “noticeably lagging” becomes “stale or abandoned.” |
| `arcreel` | Rubric ambiguity | Both reruns treated the retired Superpowers tree as abandoned; the stored rating discounted that abandonment because the project deliberately migrated design work to ADRs and issues. The rubric does not define whether a process migration mitigates drift in the nominated corpus. |
| `banana-slides` | Rubric ambiguity | All evidence says two bounded efforts remain useful while much later work is uncovered. “Parts no longer described” and “abandoned while code moves” overlap for episodic adoption. |
| `debrief` | Model variance | The stored pass treated post-February repository activity as continuing code divergence. Both reruns scoped the later comparison to product code and found only documentation/catalog work after the relevant spec effort. The pin is identical; the evidence-window classification differed. |
| `evalai` | Rubric ambiguity | The stored pass judged the single Scout change in scope; both reruns also counted unrelated repository changes. The rubric does not declare whether a change-scoped adoption is rated against its feature or the whole repository, and the reruns then split on low versus moderate. |
| `folo` | Rubric ambiguity | All passes found a bounded OTA adoption followed by fixes. They differed on whether those uncovered fixes are minor gaps or noticeable lag; no threshold separates those levels. |
| `growi` | Rubric ambiguity | All passes found a large, active corpus with recent uncovered work. The rubric gives no sampling window or number/materiality threshold for none, low, or moderate. |
| `logitune` | Rubric ambiguity | The reruns treated an at-pin spec-and-code update as none; the stored pass retained low for older code-only packaging fixes and immutable plans with superseded names. The rubric does not specify the lookback window or treatment of historical plans. |
| `openspec` | Rubric ambiguity | Four post-spec commits were either harmless same-day movement or a concrete minor lag. “Alongside code” has no allowed lag window. |
| `schematic` | Model variance | The stored pass assigned low because post-spec work had not been verified; both reruns inspected it and classified it as dependency/workflow maintenance rather than behavior change. The pin was correct; evidence depth changed the result. |
| `sesh` | Rubric ambiguity | A narrow later bug fix and retained superseded design history were enough for low in some passes but not others. The rubric does not say whether completed change plans are expected to remain live descriptions. |
| `sokuji` | Rubric ambiguity | Same-day follow-up UI and validation changes were either compatible detail or slight lag. The rubric has no materiality rule for implementation details. |
| `spirit-of-kiro` | Rubric ambiguity | The stored pass required `.kiro/specs/` and rated their absence/staleness high; reruns treated `.kiro/steering/` as the corpus and rated its still-recognizable guidance. The rubric does not define what qualifies as a spec or its intended scope. |
| `the-edge-agent` | Model variance | Run 1 treated later BMAD assets, examples, and tracing changes as notable uncovered product work; Run 2 separated mostly framework/example churn from one narrow core fix. This is evidence classification variance at the same pin. |
| `understand-anything` | Rubric ambiguity | Twelve recent commits yielded none, low, or moderate depending on whether a stale-graph warning counted as a material new behavior area. The rubric does not define materiality or a fixed comparison window. |
| `wukongim` | Rubric ambiguity | Both reruns counted 27 later hardening commits as minor lag while the stored pass accepted a two-day delay in an active planning corpus as none. The rubric has no recency or minor-gap tolerance. |
| `yserver` | Rubric ambiguity | A GLX implementation followed by a revert either restored the described state or left a small plan mismatch. The rubric does not define how reverted changes and append-only plans affect drift. |

Cause totals: **14 rubric ambiguity, 3 model variance, 0 wrong pins, 0 unexplained**.

## Rubric tightening required before retest

The present scale conflates two different questions: whether an artifact still matches the code it claims to cover,
and how consistently a team uses specs for new work. It also lacks a fixed evidence window and a materiality rule.
A retest should precommit the following protocol before any model sees a repository:

1. **Declare corpus scope.** Classify the nominated corpus as project-wide/canonical or change-scoped. For a
   change-scoped corpus, unrelated unspecced work is workflow-coverage evidence, not spec-to-code drift. Report
   workflow coverage separately.
2. **Use a fixed comparison window.** Inspect material code changes from the latest substantive spec update through
   the pin, limited to the preceding 90 days. Record older corpus inactivity separately. Ignore merge-only,
   dependency-only, formatting-only, release-only, documentation-only, and cleanly reverted changes.
3. **Define material behavior.** A material change alters externally visible behavior, architecture, a data model,
   or a documented interface. Tests, packaging, deployment, and implementation details count only when the corpus
   explicitly claims to govern them.
4. **Apply non-overlapping levels within the declared scope.** `none`: no material omission or contradiction in the
   window. `low`: minor implementation-detail gaps only, with no material omission. `moderate`: at least one material
   omission or contradiction, while the corpus remains useful for most of its intended scope. `high`: core guidance
   is materially contradicted, or the corpus has no substantive update for 90 days while at least three material
   in-scope changes land. `unknown`: the pin, intended scope, or primary evidence cannot be established.
5. **Retain structured evidence.** Each rating must record scope type, comparison window, ignored commits by class,
   material in-scope changes, contradictions, and the final level. A second blind run must use the identical packet.

These rules are a proposed follow-up rubric, not a retroactive rewrite of the published 22 ratings. They must be
retested against the same pins and pass the original ≥18/22 exact-agreement and no-two-level-swing gate before any
scheduled reassessment is introduced.

## Decision

The slice fails its precommitted support gate: **11/22 exact run-to-run agreement is below 18/22**. Because the runs
were complete and blind, the failure is evidence about the rubric rather than a procedural failure. No scheduled
LLM reassessment, automatic rating update, or changed-rating flagging workflow should be added yet. The next slice
is to encode the tightened protocol above, retest it on these immutable pins, and automate only if that retest passes.

## Protocol v2 retest

The proposed follow-up was encoded as the frozen, self-contained
[`drift-rubric-v2.md`](drift-rubric-v2.md) before either new run began. It predeclared corpus scope for all 22 pins,
fixed a 90-day UTC window, defined artifact lifecycle and material/ignored commit classes, separated change-scoped
adoption coverage from drift, supplied an ordered non-overlapping rating tree, and required structured evidence.
The two isolated runs received the same protocol and differed only in the output filename.

The retained outputs are:

- [`drift-rerating-v2-run-1.json`](drift-rerating-v2-run-1.json)
- [`drift-rerating-v2-run-2.json`](drift-rerating-v2-run-2.json)

Both outputs parse and contain 22 unique objects in manifest order. Their top-level and nested keys, enums, rating
versus recorded-gap consistency, adoption-coverage arithmetic, and immutable evidence-URL shapes validate. Together
they retain 89,596 lines, 6.31 MB, and 14,265 immutable evidence URLs. A deeper adherence audit found the semantic
failures recorded below; structural validity alone was not sufficient.

### V2 agreement

| Comparison | Exact agreement | Rate |
|---|---:|---:|
| V2 Run 1 vs. V2 Run 2 | 16/22 | 72.7% |
| V2 Run 1 vs. stored | 11/22 | 50.0% |
| V2 Run 2 vs. stored | 11/22 | 50.0% |

The more precise rubric improved run-to-run exact agreement from 11/22 to 16/22, but still missed the 18/22 gate.
All six remaining disagreements were swings of two or more levels, so the retest also failed the swing guardrail.

| Project | V2 Run 1 | V2 Run 2 | Exact? | Level distance |
|---|---|---|---:|---:|
| `agentic-context-engine` | moderate | none | No | 2 |
| `akka-net` | none | none | Yes | 0 |
| `arcreel` | none | none | Yes | 0 |
| `banana-slides` | moderate | moderate | Yes | 0 |
| `debrief` | none | none | Yes | 0 |
| `desktop-cc-gui` | none | none | Yes | 0 |
| `evalai` | moderate | none | No | 2 |
| `folo` | moderate | none | No | 2 |
| `growi` | none | none | Yes | 0 |
| `logitune` | none | none | Yes | 0 |
| `miosub` | high | high | Yes | 0 |
| `mos` | none | none | Yes | 0 |
| `openspec` | none | none | Yes | 0 |
| `schematic` | high | none | No | 3 |
| `sesh` | none | none | Yes | 0 |
| `sokuji` | none | none | Yes | 0 |
| `spirit-of-kiro` | moderate | none | No | 2 |
| `the-edge-agent` | none | none | Yes | 0 |
| `understand-anything` | none | none | Yes | 0 |
| `uniclipboard` | moderate | moderate | Yes | 0 |
| `wukongim` | moderate | none | No | 2 |
| `yserver` | none | none | Yes | 0 |

### V2 disagreement and adherence log

| Project | Trace |
|---|---|
| `agentic-context-engine` | Both runs classified the same OpenClaw tracing-plugin commit as material and in scope, but only Run 1 recorded its absence from the corpus. Run 1 also selected merge `20345ee6` as the latest spec update even though GitHub's path history identifies [`66ef4925`](https://github.com/kayba-ai/agentic-context-engine/commit/66ef492541aff7a303e49173f027a150000f2587) as the latest commit to `specs/`; evidence extraction and protocol application both varied. |
| `evalai` | Both runs classified the Scout sender-address change as material and in scope; only Run 1 called it an omission. Run 1 then recorded a mistyped `change_sha` ending in `ff` rather than the classified immutable commit [`3257…f9e1`](https://github.com/Cloud-CV/EvalAI/commit/3257dd5a567321761dc31ec38dcb34a07e72f9e1), so its cross-reference is invalid. |
| `folo` | Run 1 used the latest substantive OTA spec commit and found a later direct-download behavior omission. Run 2 treated dependency-update PR [`1158281f`](https://github.com/RSSNext/Folo/commit/1158281f59b93cfa600f8ad0dd56d661bb8e7f07)—which incidentally touched an old plan—as a substantive spec update, contrary to the protocol's substantive-update rule, and excluded the earlier behavior change from its comparison window. |
| `schematic` | Run 1's pinned-state check found a same-corpus conflict: `FR-011` says non-PostgreSQL ER diagrams are implemented, while live constraint `C-006` says other databases show no diagram; pinned code implements the generic `INFORMATION_SCHEMA` path. Run 2 read the same corpus and code but missed the contradiction entirely. |
| `spirit-of-kiro` | Run 1 correctly identified [`4929512e`](https://github.com/kirodotdev/spirit-of-kiro/commit/4929512e9b5796f6a55c6412cf9e76f9c850eeae) as the latest nominated steering update and found that its Nova Canvas claim conflicts with pinned Stable Image Core code. Run 2 incorrectly used the repository pin itself as a spec update even though that commit touches neither `.kiro/steering/` nor `docs/ROADMAP.md`, leaving an empty comparison window and no contradiction. |
| `wukongim` | Both runs classified cloud-simulation OOM-evidence commit [`2f7c20f9`](https://github.com/WuKongIM/WuKongIM/commit/2f7c20f9cdba4ac0adbabd57e9a931fcbac8224f) as material and in scope. Only Run 1 recorded that the nominated cloud-simulation corpus omitted the new externally observable evidence behavior. |

There are zero unexplained V2 disagreements, but both runs contain at least one protocol-adherence defect. The result
is therefore a failure both on the numerical gate and on procedural validity.

### V2 decision

The precise prose rubric is **still not stable enough for scheduled independent end-to-end LLM reassessment**.
It reduced boundary ambiguity, but the dominant variance moved upstream: models independently derive different
windows, miss different pinned-state contradictions, and disagree about omissions even after classifying the same
commit as material and in scope. The exhaustive protocol is also operationally heavy, producing more than 6 MB of
evidence for one 22-project retest.

No automated rating or changed-rating flagging workflow should be added. The next viable design is hybrid rather
than a still-longer prompt: deterministically compute and validate pins, nominated-path history, first-parent windows,
commit membership, and SHA cross-references once; give both assessors the identical verified evidence packet; and use
the LLM only for the semantic pinned-claim versus code comparison. That design would need its own blind retest against
the same acceptance gate.

## Protocol v3 hybrid retest

The hybrid design was encoded in [`drift-rubric-v3.md`](drift-rubric-v3.md). A single evidence build produced 22
content-addressed packets in [`drift-evidence-v3/`](drift-evidence-v3/), and an independent validator recomputed
packet hashes, bounds, source hashes, internal references, manifest order, and complete commit dispositions before
either assessor started. The frozen set contains 17 valid packets and five deterministic `oversize` packets:

- `arcreel` and `uniclipboard` exceed the 64-candidate semantic budget;
- `desktop-cc-gui` exceeds the 512-file corpus budget; and
- `growi` and `wukongim` exceed the 2,000,000-byte decoded-corpus budget.

The two isolated assessors received only the byte-identical rubric and packet set. Their retained outputs are:

- [`drift-rerating-v3-run-1.json`](drift-rerating-v3-run-1.json)
- [`drift-rerating-v3-run-2.json`](drift-rerating-v3-run-2.json)

Both outputs pass independent schema, ID, one-to-one coverage, citation, and mechanically recomputed rating-tree
validation. They agree exactly on **20/22 ratings (90.9%)**, clearing the exact-agreement threshold. V3 is still
**rejected**, however, because one of the two disagreements is a prohibited two-level swing.

| Project | V3 Run 1 | V3 Run 2 | Level distance | Cause |
|---|---|---|---:|---|
| `folo` | moderate | none | 2 | A broad “Mobile Build and Publish Flow” anchor was either treated as governing four CI runner/Xcode-version substitutions or rejected because it states no such property. |
| `spirit-of-kiro` | high | moderate | 1 | Both runs found the Nova Canvas versus Stable Image Core contradiction; they differed on whether the importance of image generation makes the contradicted provider identity itself a core claim. |

The evidence packet eliminated the upstream pin, window, commit-membership, and missing-contradiction failures seen in
v2. The remaining variance is narrowly semantic: how concrete an anchor match must be, and whether importance can
transfer from a feature to one implementation detail. The frozen
[`drift-rubric-v3.1-amendment.md`](drift-rubric-v3.1-amendment.md) therefore requires a property-level scope match and
applies the core tests to the contradicted property itself. V3.1 uses the unchanged v3 packet hashes and requires a
new pair of blind outputs; the rejected v3 outputs above are not edited or reused.

## Protocol v3.1 retest

V3.1 retained the byte-identical v3 evidence packets and changed only the two semantic rules above. It also removed
meaningless placeholder assessment rows for U1 packets: non-valid packets now return empty semantic arrays. The two
new retained outputs are:

- [`drift-rerating-v3.1-run-1.json`](drift-rerating-v3.1-run-1.json)
- [`drift-rerating-v3.1-run-2.json`](drift-rerating-v3.1-run-2.json)

Both independently validate, and the two v3 disagreements converge. V3.1 reaches **21/22 exact agreement (95.5%)**,
but is still **rejected** because its sole disagreement is a three-level `none` versus `high` swing on `mos`.

Both runs classified the same pending Logitech CID-registry design as live because the rubric's lifecycle vocabulary
recognized only English status markers, even though its title-adjacent `待用户审核` status means “awaiting user
review.” They then disagreed about a later UI-label refactor: one treated shortened button names as covered by the
general Solaar naming strategy, while the other gave precedence to the design's exact expected-name table and called
the mismatch a core contradiction. The frozen
[`drift-rubric-v3.2-amendment.md`](drift-rubric-v3.2-amendment.md) classifies that explicit whole-artifact status as
`future` and states that exact literal-value claims beat generalized summaries after lifecycle is applied. V3.2
requires another new blind pair; no v3.1 output is edited or reused.

## Protocol v3.2 accepted retest

V3.2 again used the unchanged evidence-packet hashes. Its two fresh isolated outputs are:

- [`drift-rerating-v3.2-run-1.json`](drift-rerating-v3.2-run-1.json)
- [`drift-rerating-v3.2-run-2.json`](drift-rerating-v3.2-run-2.json)

Both files independently pass the assessor validator: exact protocol and packet identity, 22-object manifest order,
full ordered coverage for valid packets, empty semantic arrays for U1 packets, packet-local IDs and citations, legal
status/core-claim combinations, and mechanically recomputed rating rules.

### V3.2 agreement

| Comparison | Exact agreement | Two-level-or-greater swings | Gate |
|---|---:|---:|---|
| V3.2 Run 1 vs. V3.2 Run 2 | **22/22 (100%)** | **0** | **Accepted** |

Both runs have the same distribution: five `unknown`, twelve `none`, zero `low`, two `moderate`, and three `high`.

| Project | Both v3.2 runs |
|---|---|
| `agentic-context-engine` | none |
| `akka-net` | none |
| `arcreel` | unknown |
| `banana-slides` | moderate |
| `debrief` | none |
| `desktop-cc-gui` | unknown |
| `evalai` | high |
| `folo` | none |
| `growi` | unknown |
| `logitune` | none |
| `miosub` | high |
| `mos` | none |
| `openspec` | none |
| `schematic` | high |
| `sesh` | none |
| `sokuji` | none |
| `spirit-of-kiro` | moderate |
| `the-edge-agent` | none |
| `understand-anything` | none |
| `uniclipboard` | unknown |
| `wukongim` | unknown |
| `yserver` | none |

The agreement is not merely a rating-tree artifact. The runs also agree on all 723 artifact lifecycle decisions, all
two pinned-state checks, and 208 of 212 candidate semantic tuples (scope, selected anchors, status, and core flag).
The four lower-level candidate differences do not cross a rating boundary. This residual variation should still be
retained if workflow-adoption coverage is displayed separately.

### V3.2 decision and limits

V3.2 **passes the precommitted support gate**. The experiment supports a hybrid workflow in which repository facts
are compiled once into a validated, content-addressed packet and independent LLM work is restricted to explicit
semantic choices followed by mechanical rating derivation. It does not support returning to two independent
end-to-end repository investigations.

The pass has material limits:

- five of 22 ratings are deterministically `unknown`, not substantive agreement, because their complete evidence
  exceeds the frozen bounds;
- the packet set is approximately 50 MB and the largest histories are expensive to compile;
- the research builder bootstraps candidate materiality from the retained v2 classifications, so it is not yet a
  production scheduler for unseen future commits; that compiler input must be replaced by a separately validated,
  reproducible materiality stage; and
- v3.1 and v3.2 were calibrated on disagreements from this same 22-project set. The 100% result is an in-sample
  reproducibility result and needs prospective validation on a future snapshot before silent publication.

The safe implementation consequence is therefore narrower than automatic rating replacement: schedule packet
generation and one or more validated semantic assessments as a review aid, retain all artifacts, flag changed or U1
results, and require editorial review before changing published project content. Do not silently rewrite ratings.
