---
name: discovery-sweep
description: Run the GitHub code-search discovery sweep that finds real projects using the tracked SDD frameworks and writes data/discovery/<date>.json. Use when asked to run a sweep, discover candidate projects, or update the fingerprint registry after a framework is added.
---

# Discovery sweep

Finds real-world repos that use the frameworks tracked on the site, by code-searching each
framework's fingerprint files (the paths its tooling scaffolds into user repos). The deterministic
pipeline lives in `scripts/discovery-sweep.ts`; the per-framework fingerprints, exclusions, and
the `STAR_FLOOR` ingestion constant live in `src/lib/discovery-registry.ts`. Your job when running
a sweep is the judgment around the script, not reimplementing it.

## Run

```
GITHUB_TOKEN=$(gh auth token) npm run sweep
```

- A full sweep takes ~10 minutes; code search allows only 10 requests/min and the script paces
  itself. Do not run two sweeps concurrently.
- Subset runs merge into the same dated file (useful for retries and new frameworks):
  `GITHUB_TOKEN=$(gh auth token) npm run sweep -- --frameworks musubi,tessl --pages 1`
- `npm run sweep -- --validate data/discovery/<date>.json` schema-checks a file offline.

## Manual duties after a run

1. **Act on canary warnings.** For each framework the script checks that a known real usage
   still matches the fingerprint query. A `WARN … canary no longer matches` means the framework
   changed its scaffolding (or the query rotted) — fix the registry entry before trusting that
   framework's results.
2. **Review flags, don't delete candidates.** `name-looks-demo`, `config-collection?`, and
   `grill-me-unverifiable-depth` mark candidates needing human judgment at ingest time. Leave
   them in the data.
3. **Spot-check 2–3 unflagged candidates** per framework you care about: open the repo, confirm
   the spec directory is real and multi-feature.

## Caveats to keep in mind (and mention when reporting results)

- **Sampled, not exhaustive**: each query takes the ~300 most recently indexed matches
  (`--pages` × 100); `meta.frameworks[slug].searchHits` records the full index count.
- **Index lag**: GitHub's code-search index trails recent pushes — a repo that adopted a
  framework this week may be missing.
- **drydock returning zero candidates is expected** (no real-world adoption yet), and
  **augment-cosmos is unmeasurable by design** — both are reported in `meta` every run.

## Committing

Review the diff, then commit the new/updated `data/discovery/<date>.json` as
`Discovery sweep <date>`. Files under `data/discovery/` are machine-written — never hand-edit
them (same rule as `data/metrics/`).

## Registry maintenance (new framework on the site)

The sweep refuses to run when `src/content/frameworks/` and the registry disagree, listing the
unmapped slugs. To add an entry:

1. Work out what the framework scaffolds into a **user's** repo (its own repo's templates,
   installer code, or docs) and pick the most distinctive committed path. Beware: generic names
   (`docs/`, `specs/`, `use_cases.puml`) drown in false positives — prefer branded paths or add
   a distinctive content term to the query.
2. Verify the query returns at least one known real usage before trusting it, and record that
   repo in `knownUsage` (it becomes the canary).
3. Add the `Fingerprint` to `src/lib/discovery-registry.ts` — or an `Unmeasurable` entry with
   the reason, if the framework leaves no repo footprint (see `augment-cosmos`).
4. Run a subset sweep for just that slug and sanity-check the candidates.
