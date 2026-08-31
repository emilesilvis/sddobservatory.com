---
name: Akka.NET
repo: akkadotnet/akka.net
framework: openspec
summary: >-
  The canonical actor-model implementation for .NET — a major, long-running
  OSS project routing its modernization work through OpenSpec change folders.
status: active
specStructure:
  location: openspec/
  formats:
    - Markdown
  notes: >-
    `changes/` holds around eight active change folders (e.g.
    `artery-tcp-remoting`, `modernize-akka-io-tcp`,
    `internal-serializers-messagepack-v2`) plus an archive, an
    `IMPLEMENTATION_ORDER.md`, and a milestone-runner automation file.
drift: moderate
timeline:
  - date: 2026-05-10
    title: OpenSpec adopted
    description: First commit to the openspec/ directory.
  - date: 2026-07-18
    title: Latest spec proposal merged
    description: "OpenSpec: propose internal-serializers-messagepack-v2 (#8402)"
added: 2026-07-18
lastReviewed: 2026-08-31
---

## Spec-to-code drift

Moderate (`M1`). The live Akka.IO TLS design anchors hostname validation and SAN/CN matching, but never states its
material security direction: validate the outbound server against the intended connection target, do not infer an
inbound client hostname, and require custom policy for inbound identity. The pinned implementation now makes those
observable semantics explicit. The Artery remote-deploy ordering fix remains covered because it satisfies the live
G3 correctness gate without adding `DaemonMsgCreate` to reliable ACK/NACK/resend delivery.

The editorial v4 review covered all 41 nominated OpenSpec artifacts, 857 compiler-owned claim candidates, and the
complete 90-day first-parent window without using the OpenAI API. See the
[manual assessment record](https://github.com/emilesilvis/sddobservatory.com/blob/main/docs/research/drift-assessments/2026-08-31-akka-net-b2cff22b8153-manual.json).

## Defects and rework

Not yet assessed. Akka.NET's mature issue and release discipline should make defect trends measurable in a future
review, including whether spec-driven changes regress less than pre-adoption changes.

## Maintenance outcomes

Too early to judge — but this is the most significant independent adoption we track: a 5k-star, decade-old
distributed-systems library using OpenSpec for genuinely hard work (remoting and serialization modernization)
rather than a greenfield demo.
