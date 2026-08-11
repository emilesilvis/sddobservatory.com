# Prospective drift evidence protocol v1

This follow-up removes the circular dependency discovered in the v3 reproducibility experiment. The packet builder
must not read an assessment or rating output. It reads one frozen project manifest and immutable GitHub repository
history at the manifest's pins.

## Boundary

- The manifest owns repository identity, pin, corpus scope, and nominated entry points.
- `snapshot-drift-projects-v3.ts` advances only repository identity and pin metadata. It does not classify changes.
- The builder derives the corpus, spec-update window, first-parent membership, changed paths, diffs, and candidate
  disposition from Git and GitHub.
- A commit at or before the comparison start receives `before_comparison_start`.
- After the comparison start, only empty changes, lockfile-only changes, documentation-only changes, test-only
  changes, and CI-configuration-only changes are mechanically excluded.
- Every other commit is conservatively retained as a review candidate. Commit-message prefixes never exclude work.
- Every candidate and exclusion carries an immutable diff source. Ambiguity becomes review work, not a silent
  exclusion.

The prospective packet still uses the v3 packet shape for compatibility. Its `material_behavior_candidates` field
should be read as “potentially material behavior candidates.” A later assessment protocol must explicitly decide
materiality before these packets can drive published ratings.

## Reproduction

```sh
npm run --silent drift:snapshot > /tmp/drift-projects-fresh.json
npm run drift:evidence:prospective -- --manifest /tmp/drift-projects-fresh.json
npm run drift:evidence:prospective:validate
npm run drift:evidence:test
```

The snapshot is frozen before building. Two builds from the same manifest must produce identical packet hashes.
Scheduling and publication remain out of scope until a prospective packet set has passed validation and editorial
inspection.
