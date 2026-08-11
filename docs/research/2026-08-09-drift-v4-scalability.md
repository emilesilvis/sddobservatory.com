# Drift v4 scalability experiment — 2026-08-09

## Question

Can lossless chunking and an explicit materiality stage make the nine prospective oversized projects assessable
without silently dropping evidence?

## Experiment

V4 was run on the nine oversized projects plus three controls (`agentic-context-engine`, `logitune`, and
`schematic`). The compiler retained the frozen fresh pins, complete first-parent disposition, immutable sources, and
the v3 rating tree. It introduced:

- lossless 40,000-character source segments with reconstruction hashes;
- a hard 2,000,000-byte ceiling for every JSON chunk;
- explicit corpus-claim and change-materiality stages;
- deterministic preclassification of explicit `archive/` paths as historical while retaining every archived path in
  the inventory;
- self-contained semantic chunks with attached evidence;
- fail-closed coverage, reference, disposition, and roll-up contracts.

## Mechanical result

- 12 of 12 projects validate, including all nine that were previously oversized.
- 5,136 archived Desktop CC GUI artifacts remain inventoried; none are treated as live claims.
- Every corpus artifact, source segment, 90-day commit, candidate, exclusion, window-history entry, and pinned check
  is represented exactly once where required.
- 1,130 bounded chunks were produced; no chunk exceeded 2,000,000 bytes.
- Two builds produced identical hashes for all 1,143 JSON files (index, project manifests, and chunks).
- Root canonical hash: `3bb72c91e9b85b07fb0b21513c31907fd86d9623832962c6949c8bd70dcd4f07`.

## Capacity result

The lossless design creates 430 semantic work items per blind run:

- 280 corpus-claim chunks covering 2,189 source segments;
- 149 materiality chunks covering 1,159 raw candidates;
- 1 pinned-state chunk.

Two isolated runs therefore require 860 semantic assessments before drift matching, disagreement review, or rating
roll-up. The generated v4 evidence occupies about 266 MB because semantic work items embed their evidence while a
canonical segmented source store is also retained.

## Decision

The evidence-completeness and deterministic-chunking gates pass. The operational scalability gate fails. Blind runs
were not launched: doing hundreds of semantic calls twice would test brute-force spending, not a viable scheduled
workflow.

Scheduling remains disabled. The next protocol must reduce semantic work before model assessment—most likely by
building a deterministic live-claim index incrementally and reviewing only changed corpus segments, while clustering
raw commits into auditable behavior groups. Any reduction must preserve exhaustive IDs and hashes so it cannot hide
evidence. Only then should two isolated blind runs and drift matching be repeated.
