# Automated drift monitoring handover — 2026-08-09

> **Implemented on 2026-08-11:** the incremental claim state, delta planner, scheduled workflow, and single-PR
> publication proposal described below now exist. See
> [`2026-08-11-drift-assessment-automation.md`](2026-08-11-drift-assessment-automation.md) for the current operating
> model and one-time baseline boundary.

This note preserves the outcome of [issue #60](https://github.com/emilesilvis/sddobservatory.com/issues/60) and the
smallest useful continuation point. The work answers whether unchanged repository states can be re-rated reliably;
it does not ship an automated publisher.

## Decision

Do not schedule full-history LLM reassessment.

The original blind experiment achieved only 11/22 exact agreement. A deterministic evidence compiler plus a much
more precise semantic protocol eventually achieved 22/22 agreement in v3.2, but five results were mechanically
`unknown`, the successful rules were calibrated on the same sample, and the first v3 compiler had imported semantic
classifications from an earlier assessment.

A prospective source-only compiler removed that circular dependency and reproduced its packets exactly, but nine of
22 projects failed closed as oversized. V4 made all nine oversized projects plus three controls losslessly
assessable, but expanded one blind run to 430 semantic tasks. Two blind runs would require 860 tasks before drift
matching. That fails the operational scalability gate.

The supported conclusion is narrower: deterministic evidence compilation can make ratings reproducible, but a
scheduled system must be incremental and review-only. It must not silently replace published ratings.

## Retained evidence

The branch retains:

- the exact historical pins and the full v1 through v3.2 blind assessor outputs;
- frozen v2, v3, v3.1, v3.2, prospective, and v4 protocols;
- the prospective source-only packet builder, validators, and mechanical tests;
- the v4 lossless chunker and stage validators;
- the experiment reports and the methodology correction describing AI-assisted editorial review.

Start with:

- [`2026-08-09-drift-rating-reproducibility.md`](2026-08-09-drift-rating-reproducibility.md)
- [`2026-08-09-drift-prospective-validation.md`](2026-08-09-drift-prospective-validation.md)
- [`2026-08-09-drift-v4-scalability.md`](2026-08-09-drift-v4-scalability.md)
- [`drift-rubric-v4.md`](drift-rubric-v4.md)

## Deliberately excluded generated artifacts

The generated packet directories are ignored rather than committed:

| Directory | Approximate size | Files | Disposition |
|---|---:|---:|---|
| `drift-evidence-v3/` | 50 MB | 23 | Regenerate from the frozen v3 manifest. |
| `drift-evidence-prospective-v1/` | 104 MB | 23 | Regenerate from the frozen prospective manifest. |
| `drift-evidence-v4/` | 266 MB | 1,143 | Regenerate from prospective and raw packets. |

The v4 build produced identical hashes for all 1,143 files across two builds. Its index canonical hash is
`3bb72c91e9b85b07fb0b21513c31907fd86d9623832962c6949c8bd70dcd4f07`.

### V4 regeneration caveat

`build-drift-evidence-v4.ts` currently reads normal prospective packets and a fallback directory containing
unbounded packets for `desktop-cc-gui`, `growi`, and `wukongim`. The fallback defaults to
`/tmp/sdd-drift-v4-raw`, so a clean checkout must create it first:

```sh
npm run drift:evidence:prospective -- \
  --manifest docs/research/drift-projects-prospective-2026-08-09.json \
  --output-dir /tmp/sdd-drift-v4-raw \
  --unbounded \
  --slugs desktop-cc-gui,growi,wukongim
npm run drift:evidence:prospective -- \
  --manifest docs/research/drift-projects-prospective-2026-08-09.json
npm run drift:evidence:v4
npm run drift:evidence:v4:validate
```

The repository cache lives under the operating-system temporary directory. Large promisor blobs for those three
repositories may need an explicit Git fetch if an upstream server does not satisfy lazy blob requests. Making this
raw-extraction step portable and first-class is unfinished work, not a property to hide in automation.

## Recommended next slice: incremental delta review

Build a persistent claim index instead of rebuilding complete history on every schedule:

1. Key corpus segments by repository, path, Git blob SHA, and segment SHA-256.
2. Reuse claims for byte-identical blobs and send only changed or new segments for semantic extraction.
3. Compare the last reviewed pin with the new pin and inspect only commits in that delta.
4. Deterministically cluster related commits, retaining an exhaustive commit-to-cluster mapping and source hashes.
5. Run two isolated assessments over only the changed claims and behavior clusters.
6. Derive ratings mechanically and open a review-only draft PR when a rating changes or evidence is incomplete.

Precommit this gate before implementing scheduling:

- all nine previously oversized projects are supported;
- 100% of changed corpus segments and commits are accounted for;
- no more than 20 semantic tasks per changed project;
- two blind runs produce identical project ratings with no two-level swings; and
- no project content is published without editorial review.

If the gate passes on a future snapshot, add a scheduled GitHub workflow that opens draft PRs. If it fails, retain
the evidence and keep scheduling disabled.

## Validation already completed

The retained implementation passed:

```sh
npm run drift:evidence:test
npm run drift:evidence:prospective:validate
npm run drift:evidence:v4:validate
npx tsc --noEmit
npm run build
git diff --check
```

V4 was also built twice with identical hashes across all generated files. The stage validator was exercised with
synthetic valid outputs for corpus claims, materiality, and pinned-state checks. No v4 semantic blind runs were
started after the 860-task capacity failure was known.
