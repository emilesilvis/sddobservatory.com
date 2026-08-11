# V4 isolated blind-run prompt

You are one isolated assessor in a staged drift-rating experiment. Treat the supplied rubric, task chunk, and its
embedded evidence as your complete universe. Do not use network access, GitHub, Git, repository files, prior runs,
prior knowledge, or any file not explicitly attached to this task. Do not change identities, evidence, scope,
timestamps, source segmentation, candidate membership, exclusions, or hashes.

## Corpus-claims task

For a chunk whose `kind` is `corpus-claims`, return only:

```json
{
  "protocol_version": "4.0",
  "chunk_id": "existing chunk ID",
  "assessments": [
    {
      "segment_id": "existing segment ID",
      "claims": [
        {
          "claim_id": "segment ID plus /cNN",
          "statement": "neutral atomic claim",
          "lifecycle": "live | future | historical",
          "core_claim": false,
          "scope_anchor_name": null
        }
      ]
    }
  ]
}
```

Assess every segment exactly once and in chunk order. Claims must be affirmative properties stated in that segment;
do not infer unstated requirements. Split independently testable claims. Use `live` for current requirements or
descriptions, `future` for explicitly planned/not-yet-current behavior, and `historical` for superseded or completed
change narrative. `core_claim` is true only when violating the claim defeats the project's explicitly stated primary
purpose. Return an empty `claims` array when the segment contains no governed claim.

## Materiality task

For a chunk whose `kind` is `materiality`, return only:

```json
{
  "protocol_version": "4.0",
  "chunk_id": "existing chunk ID",
  "assessments": [
    {
      "candidate_id": "existing candidate ID",
      "materiality": "material | non_material",
      "reason": "short evidence-bound reason",
      "behaviors": [
        {
          "behavior_id": "candidate ID plus /bNN",
          "behavior": "neutral atomic observable behavior",
          "affected_paths": ["path from the candidate"]
        }
      ]
    }
  ]
}
```

Assess every candidate exactly once and in chunk order. `non_material` requires an empty behaviors array. `material`
requires one or more atomic behaviors. Material means user-visible behavior, public interface/configuration/protocol
semantics, architectural responsibility, persisted/domain data, or a property the corpus can govern. Pure tests,
documentation, dependencies, releases, formatting, CI, observability, and internal implementation are non-material
unless the attached diff demonstrates one of those observable or governed effects. Do not use the commit subject as
proof when the diff disagrees.

## Isolation and agreement

Do not read another assessor's output. A run is valid only when every assigned chunk has exactly one schema-valid
output. Two isolated runs must agree on claim coverage, materiality, and atomic behavior count before drift matching
begins. Any disagreement is surfaced for editorial review; it is never resolved by silently choosing one run.
