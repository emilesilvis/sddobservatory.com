// Fingerprint registry for the discovery sweep (scripts/discovery-sweep.ts).
//
// One entry per framework in src/content/frameworks/ — keyed by the content file
// slug, because a project page's `framework:` field is a hard reference to that
// slug. The sweep refuses to run when this registry and the content collection
// disagree in either direction, so adding a framework page forces a fingerprint
// decision here (a Fingerprint, or an Unmeasurable with the reason).
//
// Queries use GitHub's legacy code-search syntax (`filename:` matches basenames,
// `path:` token-matches directories loosely — hence pathPattern re-verification).

/** Minimum stars for a candidate to be ingested as a project page without an
 * explicit maintainer exception. Applied at ingest, not discovery: the sweep
 * records everything and flags candidates below the floor. Displayed on the
 * methodology page — keep the exported value the only copy of this number. */
export const STAR_FLOOR = 25;

export type DepthCheck =
  /** Count entries in dir (optionally trying fallbackDir when dir is absent). */
  | { kind: 'dir'; dir: string; fallbackDir?: string }
  /** Count entries in dir whose names match entryPattern. */
  | { kind: 'dirMatching'; dir: string; entryPattern: RegExp }
  /** OpenSpec layout: openspec/changes (excluding archive/) + openspec/specs,
   * plus archive children when still below the minimum. */
  | { kind: 'openspec' };

export interface Fingerprint {
  slug: string;
  measurable: true;
  /** Legacy code-search queries; hits from all queries are merged. */
  queries: string[];
  /** Exact re-verification applied to every hit's path. */
  pathPattern: RegExp;
  /** How to count committed specs; null means depth cannot be verified in-repo. */
  depth: DepthCheck | null;
  /** Flag added to every candidate when depth is null. */
  depthFlag?: string;
  /** Human-readable spec directory carried onto candidates (null when none). */
  specLocation: string | null;
  /** Depth threshold: candidates need at least this many spec entries. */
  minSpecEntries: number;
  /** Canary repos: the query scoped with `repo:` must return hits for at least
   * one of these, or the sweep warns that the fingerprint may have drifted. */
  knownUsage: string[];
  /** Framework-author orgs whose repos are excluded (own demos/dogfood). The
   * framework's own repo is excluded separately via content frontmatter. */
  authorOrgs: string[];
  notes?: string;
}

export interface Unmeasurable {
  slug: string;
  measurable: false;
  reason: string;
}

export type RegistryEntry = Fingerprint | Unmeasurable;

export const REGISTRY: RegistryEntry[] = [
  {
    slug: 'openspec',
    measurable: true,
    queries: ['filename:project.md path:openspec'],
    pathPattern: /(^|\/)openspec\/(project|PROJECT)\.md$/,
    depth: { kind: 'openspec' },
    specLocation: 'openspec/',
    minSpecEntries: 2,
    knownUsage: ['studyzy/imewlconverter'],
    authorOrgs: ['Fission-AI'],
  },
  {
    slug: 'spec-kit',
    measurable: true,
    queries: ['filename:constitution.md path:.specify/memory'],
    pathPattern: /(^|\/)\.specify\/memory\/constitution\.md$/,
    depth: { kind: 'dir', dir: 'specs' },
    specLocation: 'specs/',
    minSpecEntries: 2,
    knownUsage: ['debrief/debrief'],
    // github/spec-kit is excluded via content frontmatter; the `github` org is
    // far too broad to exclude wholesale.
    authorOrgs: [],
  },
  {
    slug: 'kiro',
    measurable: true,
    queries: ['filename:requirements.md path:.kiro/specs'],
    pathPattern: /(^|\/)\.kiro\/specs\/.+\/requirements\.md$/,
    depth: { kind: 'dir', dir: '.kiro/specs' },
    specLocation: '.kiro/specs/',
    minSpecEntries: 2,
    knownUsage: ['kirodotdev/Kiro'],
    authorOrgs: ['kirodotdev'],
    notes:
      'Repos also matching the cc-sdd fingerprint are attributed to cc-sdd, not kiro — ' +
      'cc-sdd scaffolds the same `.kiro/specs/` layout.',
  },
  {
    slug: 'cc-sdd',
    measurable: true,
    queries: ['filename:spec.json path:.kiro/specs'],
    pathPattern: /(^|\/)\.kiro\/specs\/.+\/spec\.json$/,
    depth: { kind: 'dir', dir: '.kiro/specs' },
    specLocation: '.kiro/specs/',
    minSpecEntries: 2,
    knownUsage: ['gotalab/cc-sdd'],
    authorOrgs: [],
    notes:
      'A `spec.json` with approval-gate fields inside `.kiro/specs/<feature>/` is ' +
      'cc-sdd-only; the Kiro IDE never writes it.',
  },
  {
    slug: 'bmad-method',
    measurable: true,
    queries: ['filename:core-config.yaml path:.bmad-core'],
    pathPattern: /(^|\/)\.bmad-core\/.*core-config\.yaml$/,
    depth: { kind: 'dirMatching', dir: 'docs', entryPattern: /prd|architect|stor|epic|qa|brief/i },
    specLocation: 'docs/',
    minSpecEntries: 2,
    knownUsage: ['fabceolin/the_edge_agent'],
    authorOrgs: ['bmad-code-org'],
    notes: 'Fingerprints the v4/v5 `.bmad-core/` layout; artifacts live under `docs/`.',
  },
  {
    slug: 'grill-me-skills',
    measurable: true,
    queries: ['grill path:.claude/skills'],
    // The content term matches unrelated skills (literal cooking included); only
    // Matt Pocock's grill-me / grill-with-docs skill directories count.
    pathPattern: /(^|\/)\.claude\/skills\/(grill-me|grill-with-docs)(\/|$)/,
    depth: null,
    depthFlag: 'grill-me-unverifiable-depth',
    specLocation: null,
    minSpecEntries: 2,
    knownUsage: ['mattpocock/skills'],
    authorOrgs: [],
    notes:
      'Specs and tickets publish to the issue tracker; only `CONTEXT.md` and ADRs live ' +
      'in-repo, so multi-spec depth cannot be verified from the tree.',
  },
  {
    slug: 'agent-os',
    measurable: true,
    queries: ['path:.agent-os/product'],
    pathPattern: /(^|\/)\.agent-os\/product\//,
    depth: { kind: 'dir', dir: '.agent-os/specs', fallbackDir: 'agent-os/specs' },
    specLocation: '.agent-os/specs/',
    minSpecEntries: 2,
    knownUsage: ['olafkfreund/PFactory'],
    authorOrgs: [],
  },
  {
    slug: 'gsd',
    measurable: true,
    queries: ['filename:STATE.md path:.planning'],
    pathPattern: /(^|\/)\.planning\/STATE\.md$/,
    depth: { kind: 'dir', dir: '.planning/phases' },
    specLocation: '.planning/',
    minSpecEntries: 2,
    knownUsage: ['302ai/302-AI-Studio'],
    authorOrgs: ['open-gsd'],
  },
  {
    slug: 'superpowers',
    measurable: true,
    queries: ['path:docs/superpowers/specs filename:design', 'path:docs/superpowers/plans'],
    pathPattern: /(^|\/)docs\/superpowers\/(specs|plans)\//,
    depth: { kind: 'dir', dir: 'docs/superpowers/specs' },
    specLocation: 'docs/superpowers/',
    minSpecEntries: 2,
    knownUsage: ['RSSNext/Folo'],
    authorOrgs: [],
    notes:
      'Captures v5.0+ (2026-03) users only — earlier versions wrote to the generic ' +
      '`docs/plans/`, and the `.superpowers/` workspace is self-gitignored.',
  },
  {
    slug: 'musubi',
    measurable: true,
    queries: ['filename:constitution.md path:steering/rules'],
    pathPattern: /(^|\/)steering\/rules\/constitution\.md$/,
    depth: { kind: 'dir', dir: 'storage/specs' },
    specLocation: 'storage/specs/',
    minSpecEntries: 2,
    knownUsage: ['nahisaho/MUSUBIX'],
    authorOrgs: [],
  },
  {
    slug: 'tessl',
    measurable: true,
    queries: ['filename:tessl.json dependencies'],
    pathPattern: /(^|\/)tessl\.json$/,
    // Committed `.spec.md` specs separate spec-driven usage from registry-only
    // (package-manager) usage of Tessl.
    depth: { kind: 'dirMatching', dir: 'specs', entryPattern: /\.spec\.md$/ },
    specLocation: 'specs/',
    minSpecEntries: 2,
    knownUsage: ['lirantal/tokenu'],
    authorOrgs: ['tessl-labs', 'tesslio'],
  },
  {
    slug: 'ai-unified-process',
    measurable: true,
    // The mandated "Length/Precision" attribute-table header separates AIUP entity
    // models from the sea of generic `use_cases.puml`/`entity_model.md` UML docs —
    // do not fall back to the broad filename-only queries.
    queries: ['"Length/Precision" filename:entity_model.md'],
    pathPattern: /entity_model\.md$/,
    depth: { kind: 'dirMatching', dir: 'docs/use_cases', entryPattern: /^UC-/ },
    specLocation: 'docs/use_cases/',
    minSpecEntries: 2,
    knownUsage: ['simasch/aiup-petclinic'],
    authorOrgs: ['AI-Unified-Process'],
  },
  {
    slug: 'drydock',
    measurable: true,
    queries: ['filename:SEA_TRIALS.md'],
    pathPattern: /(^|\/)SEA_TRIALS\.md$/,
    depth: { kind: 'dir', dir: 'blueprint/changes' },
    specLocation: 'blueprint/',
    minSpecEntries: 2,
    knownUsage: [],
    authorOrgs: ['webcloudstudio'],
    notes: 'No real-world usage found as of 2026-07 — an empty result is expected, not a bug.',
  },
  {
    slug: 'augment-cosmos',
    measurable: false,
    reason:
      'Scaffolds nothing into user repos — specs and agent state live platform-side, ' +
      'so code search cannot detect usage.',
  },
];

export const FINGERPRINTS: Fingerprint[] = REGISTRY.filter(
  (entry): entry is Fingerprint => entry.measurable,
);

export const UNMEASURABLE: Unmeasurable[] = REGISTRY.filter(
  (entry): entry is Unmeasurable => !entry.measurable,
);
