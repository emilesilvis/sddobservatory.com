# Drift protocol v4 — bounded staged assessment

V4 preserves the immutable repository evidence and rating tree from v3 while removing the assumption that one
project must fit in one model context. It is a staged protocol: bounded corpus-claim extraction, bounded change
materiality review, drift matching against the merged live-claim index, then mechanical rating roll-up.

## Mechanical packet compiler

The compiler reads only a frozen repository manifest and immutable Git/GitHub evidence. It must not read an earlier
assessment. It inventories every nominated corpus path and every first-parent commit in the 90-day window.

Files under an explicit `archive/` or `archives/` path are retained in the inventory and preclassified historical;
their content is not sent for live-claim extraction. All other text is split losslessly into source segments. Every
source is reconstructable byte-for-byte from its ordered segments and verified against its original SHA-256.

Every JSON chunk is at most 2,000,000 bytes, content-addressed, and listed in a content-addressed project manifest.
Missing, duplicated, stale, oversized, or unreferenced evidence invalidates the project.

## Stage A: corpus claims

For every non-archived corpus source segment, emit the segment ID exactly once and zero or more neutral atomic
claims. Each claim has a locally unique ID, statement, lifecycle (`live`, `future`, or `historical`), `core_claim`
boolean, and optional scope-anchor name. Extraction disagreement or incomplete coverage makes the project
`unknown`; claims are never silently selected between runs.

## Stage B: materiality

For every raw change candidate, emit exactly one decision:

- `non_material`, with no behaviors; or
- `material`, with one or more atomic observable behaviors identified as `<candidate-id>/bNN`.

Material means a change to user-visible behavior, a public API/CLI/event/protocol/configuration semantic, an
architectural responsibility, persisted/domain data, or a property governed by the corpus. Tests, documentation,
dependencies, release mechanics, formatting, CI, and internal implementation are non-material unless their diff
demonstrates one of those effects. Two runs must agree on materiality and atomic behavior count; disagreement makes
the project `unknown` pending editorial review.

## Stage C: drift matching

Assess every material atomic behavior and pinned-state check against the complete merged set of live claims. Scope
and status retain the v3 meanings: `covered`, `omitted`, `contradicted`, or `minor_gap`. A change-scoped behavior
requires a concrete live scope-anchor match. Missing or duplicate assessments make the project `unknown`.

## Deterministic roll-up

Apply the rating tree in order:

1. `H1`: a core live claim is contradicted.
2. `H2`: the corpus is stale for 90 days and drift comes from at least three distinct source commits.
3. `M1`: any in-scope omission or contradiction.
4. `L1`: minor gaps only.
5. `N1`: every in-scope behavior/check is covered, or none are in scope.

Any failed integrity, coverage, or inter-run agreement gate returns `unknown`. No chunk may be sampled or omitted.

## Blind-run boundary

Each rater receives only this rubric, the v4 index/project manifests, and the chunks assigned to the current stage.
The rater may not use Git, GitHub, network access, prior outputs, or unstated knowledge. Stage outputs are validated
before the next stage is assembled. Two complete isolated runs are required before scheduling can be enabled.
