# Prospective drift evidence validation — 2026-08-09

## Question

Can the drift evidence compiler operate on repository history alone, at previously unseen pins, without importing
semantic classifications from an earlier rating run?

## Change

The compiler now reads `drift-projects-v3.json`, a dedicated manifest containing only repository identity, pin,
corpus scope, and nominated entry points. It no longer reads either v2 assessor output. Its exclusion rule is
deliberately conservative and based only on changed paths: empty changes, lockfile-only changes,
documentation-only changes, test-only changes, and CI-configuration-only changes may be excluded. Everything
ambiguous is retained for review. Commit-message conventions are not trusted.

Every candidate and exclusion now carries an immutable source diff. The validator independently recomputes the
source-only disposition from each commit's changed-file list.

## Fresh snapshot

The snapshot was frozen at `2026-08-09T17:38:49.783Z`. Seventeen repositories had advanced beyond the July
experiment pin; five were unchanged. The canonical manifest hash recorded by the builder is
`b49293e890d6818933165025919c4b532c9772889a49dc8f558beba4bce226d0`.

## Result

- 22 of 22 packets were produced and passed structural, hash, source-reference, disposition, and fail-closed bounds
  validation.
- Two independent builds from the frozen manifest produced identical hashes for all 22 packets.
- 13 packets were within the assessment bounds.
- 9 packets failed closed as oversized:
  - `akka-net`, `openspec`, and `sokuji`: packet byte limit.
  - `arcreel` and `uniclipboard`: material-candidate limit.
  - `desktop-cc-gui`: corpus-file limit.
  - `growi` and `wukongim`: corpus-byte limit.
  - `yserver`: source-count limit.

## Interpretation

The circular dependency is removed: a fresh, deterministic packet set can be built without consulting previous
ratings. This passes the source-independence and reproducibility gate.

It does not pass the scheduling gate. Conservative compilation increased fail-closed packets from five in the
frozen v3 experiment to nine in the prospective run, and the compatible v3 field name
`material_behavior_candidates` now means “potentially material” rather than a settled semantic judgment. Before
scheduling, the protocol needs a bounded materiality-review stage and a chunking or summarization design that keeps
large histories auditable without silently discarding them. Published ratings must remain editorially reviewed.

## Commands

```sh
npm run drift:snapshot
npm run drift:evidence:prospective -- --manifest docs/research/drift-projects-prospective-2026-08-09.json
npm run drift:evidence:prospective:validate
npm run drift:evidence:test
npx tsc --noEmit
npm run build
```
