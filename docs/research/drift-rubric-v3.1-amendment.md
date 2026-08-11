# Drift rubric v3.1 amendment

Status: frozen before the two v3.1 blind runs. This amendment and
`drift-rubric-v3.md` together form assessor protocol 3.1. All v3 packet bytes, packet IDs, source IDs, anchors,
candidate lists, and integrity results remain unchanged. Where this amendment conflicts with v3, this amendment
governs. Every other v3 rule remains normative.

## 1. Property-level scope match

Replace the change-scoped anchor-match rule in section 3.1 with this rule:

A `change-scoped` candidate is `in_scope` only when the candidate's material externally observable behavior or
governed design property is explicitly named by, or is logically required for, an affirmative live claim under at
least one selected predeclared anchor. The match must be at the property level. Sharing a feature, product,
platform, file family, workflow, toolchain, or broad heading is insufficient.

In particular, a CI runner OS version, compiler or SDK version, workflow path trigger, dependency packaging detail,
or equivalent execution-environment substitution is `out_of_scope` unless an affirmative live claim explicitly
governs that exact property. A claim that builds or publishing occur does not govern which runner, SDK version, or
path trigger performs them. When no property-level claim exists, return `out_of_scope` even if the candidate's
proposed anchor list contains a broad matching heading.

The `canonical` default-scope rule is unchanged. For `canonical` packets, an in-scope candidate may have an empty
`scope_anchor_ids` array because the nominated corpus claims project-wide authority unless it explicitly excludes
the behavior.

## 2. Contradicted-property core test

Add this requirement to section 3.4:

Apply both core-claim tests to the contradicted property itself, not to its enclosing feature. The importance of a
feature does not transfer automatically to every named implementation detail beneath it. A provider, model,
vendor, version, library, runner, or toolchain identity has `core_claim: false` when pinned code preserves the
stated capability and the packet shows only an implementation substitution. Such an identity can be core only when
the live corpus itself makes that identity a required system boundary, invariant, acceptance criterion, or public
interface and packet evidence shows a consequence to externally observable behavior, compatibility, security, data
integrity, or the project's stated primary purpose.

## 3. Assessor output

Use the unchanged section 5 schema except that the top-level `protocol_version` value is `"3.1"`. Packet objects
remain evidence protocol `"3.0"`; copy their existing packet IDs unchanged.

When U1 applies because a packet or integrity field is non-valid, do not perform or fabricate semantic assessments.
Return empty `artifact_lifecycle`, `candidate_assessments`, and `pinned_state_assessments` arrays for that packet.
This overrides v3's general one-to-one semantic coverage requirement only for U1 packets. Valid packets retain full
one-to-one coverage.

## 4. Exact v3.1 blind prompt

```text
Perform one blind semantic drift-rating run under assessor protocol 3.1 using the attached `drift-rubric-v3.md`, `drift-rubric-v3.1-amendment.md`, and the same 22 attached v3 evidence packets.

Treat the two rubric files and packets as your complete universe of evidence. The amendment governs any conflict with v3. You may use read-only local file commands solely to read those attached inputs and may write only your requested output file. Do not use network access, GitHub, repository or Git-history tools, search, prior knowledge, or any file not attached to this run. Do not reconstruct or change repository identity, pins, nominated paths, scope anchors, path history, the selected latest spec update, timestamps, windows, first-parent membership, materiality, excluded commits, source summaries, or source identifiers. Do not add evidence or type a SHA, URL, path, timestamp, or count.

For each valid packet, classify every artifact lifecycle, decide scope for every prelisted material behavior candidate using the property-level rule, compare every in-scope candidate and pinned-state check with the complete corpus and pinned code evidence, decide core-claim status for the contradicted property itself, and apply the ordered rating tree literally. Use all tie-breaks. If a packet is invalid or oversize, apply U1, return empty semantic arrays, and do not repair or assess it.

Return only the JSON array required by section 5, with `protocol_version` set to `3.1`, exactly 22 objects in manifest order, and no Markdown or prose outside the JSON. Before returning, verify full one-to-one coverage for every valid packet, empty semantic arrays for every U1 packet, and that every referenced ID already exists in its packet.
```
