---
name: RENAR
website: https://renar.tech/en/
repo: Kibertum/RENAR
summary: >-
  Requirements-first methodology that versions requirements, specifications,
  and test cases together before AI agents produce the implementation.
coreApproach: >-
  Treats business, system, and task requirements as the source of expected
  behavior. Specifications and positive/negative test cases form an approved
  description set, with verification tied to both its version and a product
  version. Human approvals govern artifact transitions; the storage backend
  must provide the standard's history, review, version-pinning, and attribution
  capabilities.
workflow:
  - "Register the client's statement of work (TZ) and review it for gaps and contradictions"
  - "Where clarification is needed, prepare an internal adaptation (ADAPT) and a client/vendor clarification protocol (ACTZ)"
  - "Derive business requirements (BR), system requirements (SR), specifications (SPEC), and task requirements (TR)"
  - "Create positive and negative test-case norms (TC) and approve the complete description-set version at QG-0"
  - "Implement and admit test cases at QG-1; use a different agent to implement the product"
  - "Run the version's admitted test cases against the product and record QG-2 verification"
  - "Derive isolated acceptance tests from the effective statement of work and obtain the applicable human approvals"
supportedTools:
  - Any AI coding agent
maturity: experimental
strengths:
  - "Versions requirements, specifications, and test-case norms as a coherent set, with explicit traceability"
  - "Separates contractual clarification, internal interpretation, test authorship, and implementation"
  - "Can be adopted independently of SENAR and on different versioned storage backends"
limitations:
  - "The repository supplies a standard and guides; teams must implement the required storage and gate capabilities"
  - "Artifact schemas, approval points, and separation of duties introduce substantial process overhead"
  - "Public documentation is detailed, but independent production adoption and comparative outcome evidence were not established in this review"
added: 2026-09-30
lastReviewed: 2026-09-30
---

RENAR (Requirements Engineering & Normative Adaptive Regulation), by Vadim
Soglaev and Andrey Yumashev, was included alongside SENAR in submission #83.
It merits its own framework entry: its documentation explicitly defines a
standalone SDD methodology and includes an English quickstart, artifact
templates, and an operational edition for agents, `RENAR-AGENT-EN.md`.

The reviewed v1.1 documentation distinguishes the architect-approved internal
ADAPT from the ACTZ signed by the client and vendor. The agent guide and
normative lifecycle chapter provide the detail behind the shorter summary.
QG-1 here admits a test-case implementation to runs; it is not simply a general
code-implementation phase.

[SENAR](/frameworks/senar/) provides the complementary supervision standard.
RENAR's experimental rating reflects the limited independently verifiable
adoption evidence reviewed. Detailed normative requirements are not proof that
a particular agent or backend enforces them.

## Sources

- [RENAR overview and release history](https://github.com/Kibertum/RENAR/blob/3a003bd3f0954c82b6f2e473ef2899d70acd486b/README.md)
- [English quickstart and artifact templates](https://github.com/Kibertum/RENAR/blob/3a003bd3f0954c82b6f2e473ef2899d70acd486b/guide/en/00-quickstart.md)
- [Working with an AI agent and human approval boundaries](https://github.com/Kibertum/RENAR/blob/3a003bd3f0954c82b6f2e473ef2899d70acd486b/guide/en/11-ai-agent-guide.md)
- [Normative lifecycle and quality gates](https://github.com/Kibertum/RENAR/blob/3a003bd3f0954c82b6f2e473ef2899d70acd486b/standard/en/10-lifecycle-qg.md)
