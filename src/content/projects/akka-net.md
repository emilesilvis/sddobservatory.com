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
drift: none
timeline:
  - date: 2026-05-10
    title: OpenSpec adopted
    description: First commit to the openspec/ directory.
  - date: 2026-07-18
    title: Latest spec proposal merged
    description: "OpenSpec: propose internal-serializers-messagepack-v2 (#8402)"
added: 2026-07-18
lastReviewed: 2026-07-18
---

## Spec-to-code drift

None observed so far — spec commits land through normal PR review on the same days as code, and proposals were
still flowing on the day of our first assessment. The caveat is that adoption is only about two months old, so
there has been little time for drift to accumulate; this is the project to watch for how SDD holds up in a large,
old codebase.

## Defects and rework

Not yet assessed. Akka.NET's mature issue and release discipline should make defect trends measurable in a future
review, including whether spec-driven changes regress less than pre-adoption changes.

## Maintenance outcomes

Too early to judge — but this is the most significant independent adoption we track: a 5k-star, decade-old
distributed-systems library using OpenSpec for genuinely hard work (remoting and serialization modernization)
rather than a greenfield demo.
