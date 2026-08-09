# Drift rubric v3.2 amendment

Status: frozen before the two v3.2 blind runs. Assessor protocol 3.2 consists of `drift-rubric-v3.md`,
`drift-rubric-v3.1-amendment.md`, and this file, with the newest amendment governing conflicts. The v3 evidence
packet bytes and identifiers remain unchanged.

## 1. Explicit translated lifecycle marker

Add `待用户审核` to the section 3.2 `future` artifact-status vocabulary. It means “awaiting user review.” It counts
only when it is the value of artifact-level frontmatter, a title-adjacent status line, or an owning-index status for
the whole artifact. Incidental use in requirements or prose does not change lifecycle. The existing lifecycle
precedence and every other marker rule remain unchanged.

## 2. Exact literal-value comparison

Add this tie-break after v3 section 4.1:

An affirmative live claim that supplies an exact expected literal, mapping-table value, before/after value, or
enumerated name beats a broader summary of the same policy. If pinned code uses a different literal for the same key
or condition, classify the property as `contradicted`; do not call it `covered` merely because the new value seems
cleaner, shorter, more consistent, or compatible with the general policy. Lifecycle still applies first, so values
in a `future` or `historical` artifact cannot create drift.

## 3. Assessor output and U1

Use the v3.1 output rules, including empty semantic arrays for U1 packets, but set top-level `protocol_version` to
`"3.2"`. Copy existing v3 packet IDs unchanged.

## 4. Exact v3.2 blind prompt

```text
Perform one blind semantic drift-rating run under assessor protocol 3.2 using the attached `drift-rubric-v3.md`, `drift-rubric-v3.1-amendment.md`, `drift-rubric-v3.2-amendment.md`, and the same 22 attached v3 evidence packets.

Treat the three rubric files and packets as your complete universe of evidence. Newer amendments govern conflicts. You may use read-only local file commands solely to read those attached inputs and may write only your requested output file. Do not use network access, GitHub, repository or Git-history tools, search, prior knowledge, or any file not attached to this run. Do not reconstruct or change repository identity, pins, nominated paths, scope anchors, path history, the selected latest spec update, timestamps, windows, first-parent membership, materiality, excluded commits, source summaries, or source identifiers. Do not add evidence or type a SHA, URL, path, timestamp, or count.

For each valid packet, classify every artifact lifecycle including the explicit translated marker, decide scope for every prelisted material behavior candidate using the property-level rule, compare exact literal claims before broader summaries, compare every in-scope candidate and pinned-state check with the complete corpus and pinned code evidence, decide core-claim status for the contradicted property itself, and apply the ordered rating tree literally. Use all tie-breaks. If a packet is invalid or oversize, apply U1, return empty semantic arrays, and do not repair or assess it.

Return only the JSON array required by section 5, with `protocol_version` set to `3.2`, exactly 22 objects in manifest order, and no Markdown or prose outside the JSON. Before returning, verify full one-to-one coverage for every valid packet, empty semantic arrays for every U1 packet, and that every referenced ID already exists in its packet.
```
