# Schematic v4 semantic smoke test — 2026-08-11

## Boundary

This is a single-assessor smoke test against the frozen Schematic pin
`d37d893a02dfff586aa0a329752603f2477f4234`. It exercises the three v4 semantic chunk contracts using only their
embedded evidence. It is not a protocol-complete blind rerating because no isolated second run exists.

## Validated outputs

| Stage | Output | SHA-256 | Result |
|---|---|---|---|
| Corpus claims | [`drift-v4-schematic-smoke-claims.json`](drift-v4-schematic-smoke-claims.json) | `334416a4a7be2492bf9b4425e2b5512db946f07a283c45217f8c707b848bea2b` | Valid: all 28 compiler-owned candidates classified as claims, comprising 15 live and 13 future classifications. |
| Materiality | [`drift-v4-schematic-smoke-materiality.json`](drift-v4-schematic-smoke-materiality.json) | `4580bbb82cd8e7a0ca8647056aa4422a2b0aadbed93d72c9ed3bba050ae4ad26` | Valid: the Spring Boot parent-version change is non-material because its attached diff demonstrates no observable or corpus-governed behavior change. |
| Pinned state | [`drift-v4-schematic-smoke-pinned-checks.json`](drift-v4-schematic-smoke-pinned-checks.json) | `bd1304890d41141672c38dfb46dcd74f853c96dc3c5c942f1633a45d23f9ddee` | Valid: one non-core contradiction. |

All three outputs pass `npm run drift:stage:v4:validate` against their content-addressed task chunks.

## Finding

The live requirements say that entity-relationship diagrams work beyond PostgreSQL, while a live constraint says
the current release is PostgreSQL-only and shows no diagram for other JDBC databases. The pinned implementation has
a generic `INFORMATION_SCHEMA` fallback for non-PostgreSQL drivers. The implementation therefore supports the
functional requirement and contradicts the PostgreSQL-only constraint.

The only post-window candidate changes a Spring Boot parent version. Its attached diff does not demonstrate a
material behavior, so no change behavior advances to drift matching.

## Roll-up

If this single run were eligible for roll-up, the non-core pinned contradiction would produce `moderate` under
`M1`. The protocol result remains `unknown`: v4 requires two complete isolated runs to agree before a rating can be
accepted. Nothing in this smoke test should update the published Schematic assessment.

## Automation follow-up

The missing orchestration exposed by this smoke test is implemented in
[`2026-08-11-drift-assessment-automation.md`](2026-08-11-drift-assessment-automation.md). A live protocol-complete run
on 2026-08-11 showed that free-form claim atomization could vary between isolated runs. Stage A now compiles the 28
source-preserving requirement rows and asks assessors only to classify their fixed IDs. These manually authored smoke
outputs are retained as evidence that the amended stage contracts work.
