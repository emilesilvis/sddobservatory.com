/**
 * Discovery sweep: finds real-world repos that use the SDD frameworks tracked on
 * the site, via GitHub code search on each framework's fingerprint files, and
 * writes the candidate list to data/discovery/<date>.json.
 *
 * Only machine-written files live in data/discovery/ — humans edit src/content/.
 * Run: GITHUB_TOKEN=$(gh auth token) npm run sweep
 *      npm run sweep -- --frameworks musubi,tessl --pages 1   (subset; merges into the dated file)
 *      npm run sweep -- --validate data/discovery/2026-07-19.json
 *
 * The star floor and per-framework fingerprints live in src/lib/discovery-registry.ts.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import matter from 'gray-matter';
import { SweepFileSchema, sweepFileName, type Candidate, type SweepFile } from '../src/lib/discovery-schema';
import {
  FINGERPRINTS,
  REGISTRY,
  STAR_FLOOR,
  UNMEASURABLE,
  type DepthCheck,
  type Fingerprint,
} from '../src/lib/discovery-registry';
import { stableStringify } from '../src/lib/stable-json';

const API = 'https://api.github.com';
const CONTENT_DIRS = ['src/content/frameworks', 'src/content/projects'];
const FRAMEWORKS_DIR = 'src/content/frameworks';
const DISCOVERY_DIR = 'data/discovery';
const STALE_DAYS = 90;
const EXCLUDE_KEYWORDS = /template|starter|boilerplate|example|tutorial|playground/i;
// Code search allows 10 requests/min; pace conservatively and back off on 403/429.
const SEARCH_INTERVAL_MS = 6500;
const DEPTH_CONCURRENCY = 5;

const { values: cli } = parseArgs({
  options: {
    frameworks: { type: 'string' },
    pages: { type: 'string', default: '3' },
    date: { type: 'string' },
    validate: { type: 'string' },
  },
});

// --validate: offline schema + slug check of an existing sweep file, then exit.
if (cli.validate) {
  const file = SweepFileSchema.parse(JSON.parse(readFileSync(cli.validate, 'utf8')));
  const known = new Set(REGISTRY.map((entry) => entry.slug));
  const bad = new Set<string>();
  for (const candidate of file.candidates) if (!known.has(candidate.framework)) bad.add(candidate.framework);
  for (const slug of Object.keys(file.meta.frameworks)) if (!known.has(slug)) bad.add(slug);
  if (bad.size > 0) {
    console.error(`Unknown framework slug(s) in ${cli.validate}: ${[...bad].sort().join(', ')}`);
    process.exit(1);
  }
  console.log(`OK ${cli.validate}: ${file.candidates.length} candidate(s), meta valid, all slugs known.`);
  process.exit(0);
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is required (locally: GITHUB_TOKEN=$(gh auth token) npm run sweep)');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

const sweepDate = cli.date ?? new Date().toISOString().slice(0, 10);
const pages = Number.parseInt(cli.pages ?? '3', 10);
const isSubsetRun = Boolean(cli.frameworks);

function checkRegistryCoverage(): void {
  const contentSlugs = new Set(
    readdirSync(FRAMEWORKS_DIR)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, '')),
  );
  const registrySlugs = new Set(REGISTRY.map((entry) => entry.slug));
  const missingFromRegistry = [...contentSlugs].filter((slug) => !registrySlugs.has(slug));
  const missingFromContent = [...registrySlugs].filter((slug) => !contentSlugs.has(slug));
  if (missingFromRegistry.length > 0 || missingFromContent.length > 0) {
    if (missingFromRegistry.length > 0) {
      console.error(
        `Framework page(s) without a fingerprint in src/lib/discovery-registry.ts: ${missingFromRegistry.join(', ')}\n` +
          'Add a Fingerprint (or an Unmeasurable entry with the reason) before sweeping.',
      );
    }
    if (missingFromContent.length > 0) {
      console.error(`Registry slug(s) with no framework page: ${missingFromContent.join(', ')}`);
    }
    process.exit(1);
  }
}

function collectTrackedRepos(): Set<string> {
  const repos = new Set<string>();
  for (const dir of CONTENT_DIRS) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const { data } = matter(readFileSync(path.join(dir, file), 'utf8'));
      if (typeof data.repo === 'string' && data.repo) repos.add(data.repo.toLowerCase());
    }
  }
  return repos;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastSearchAt = 0;
/** Paced, backoff-aware fetch for the code-search endpoint (hard 10 req/min). */
async function searchFetch(query: string, page: number): Promise<{ totalCount: number; items: { repo: string; path: string }[] }> {
  const params = new URLSearchParams({
    q: query,
    sort: 'indexed',
    order: 'desc',
    per_page: '100',
    page: String(page),
  });
  for (let attempt = 0; attempt < 4; attempt++) {
    const wait = lastSearchAt + SEARCH_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastSearchAt = Date.now();
    const res = await fetch(`${API}/search/code?${params}`, { headers });
    if (res.status === 403 || res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const reset = Number(res.headers.get('x-ratelimit-reset'));
      const backoff = retryAfter > 0 ? retryAfter * 1000 : reset > 0 ? Math.max(reset * 1000 - Date.now(), 5000) : 30000;
      console.warn(`  rate-limited (${res.status}); backing off ${Math.round(backoff / 1000)}s`);
      await sleep(backoff);
      continue;
    }
    if (!res.ok) throw new Error(`GET /search/code?q=${query} -> ${res.status}`);
    const body = await res.json();
    return {
      totalCount: body.total_count ?? 0,
      items: (body.items ?? []).map((item: { path: string; repository: { full_name: string } }) => ({
        repo: item.repository.full_name,
        path: item.path,
      })),
    };
  }
  throw new Error(`GET /search/code?q=${query}: rate-limited after retries`);
}

interface Hit {
  repo: string;
  query: string;
}

async function searchStage(fp: Fingerprint): Promise<{ hits: Hit[]; searchHits: number; pathVerified: number }> {
  // repo -> first query that surfaced a path-verified hit
  const byRepo = new Map<string, string>();
  let searchHits = 0;
  let raw = 0;
  let verified = 0;
  for (const query of fp.queries) {
    for (let page = 1; page <= pages; page++) {
      const { totalCount, items } = await searchFetch(query, page);
      if (page === 1) searchHits += totalCount;
      raw += items.length;
      for (const item of items) {
        // The legacy `path:` qualifier token-matches loosely — re-verify every hit.
        if (!fp.pathPattern.test(item.path)) continue;
        verified++;
        if (!byRepo.has(item.repo)) byRepo.set(item.repo, query);
      }
      if (items.length < 100) break;
    }
  }
  console.log(`  search: ${raw} hit(s) sampled, ${verified} path-verified, ${byRepo.size} repo(s)`);
  return {
    hits: [...byRepo].map(([repo, query]) => ({ repo, query })),
    searchHits,
    pathVerified: verified,
  };
}

/** Scoped-query canary: warns when a known usage no longer matches the fingerprint. */
async function canaryCheck(fp: Fingerprint): Promise<void> {
  if (fp.knownUsage.length === 0) return;
  const canary = fp.knownUsage[0];
  for (const query of fp.queries) {
    const { totalCount } = await searchFetch(`${query} repo:${canary}`, 1);
    if (totalCount > 0) return;
  }
  console.warn(
    `  WARN [${fp.slug}]: canary ${canary} no longer matches — the fingerprint or the ` +
      'framework scaffolding may have changed. Verify before trusting these results.',
  );
}

interface RepoMeta {
  isFork: boolean;
  isArchived: boolean;
  pushedAt: string;
  stars: number;
  description: string | null;
}

async function enrichStage(repos: string[]): Promise<Map<string, RepoMeta>> {
  const meta = new Map<string, RepoMeta>();
  for (let i = 0; i < repos.length; i += 50) {
    const chunk = repos.slice(i, i + 50);
    const query =
      'query {' +
      chunk
        .map((repo, index) => {
          const [owner, name] = repo.split('/');
          return ` r${index}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner isFork isArchived pushedAt stargazerCount description }`;
        })
        .join('') +
      ' }';
    const res = await fetch(`${API}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query }) });
    if (!res.ok) throw new Error(`POST /graphql -> ${res.status}`);
    const body = await res.json();
    // Deleted/private repos come back as null aliases (with errors) — drop them.
    for (const value of Object.values(body.data ?? {})) {
      const repo = value as {
        nameWithOwner: string;
        isFork: boolean;
        isArchived: boolean;
        pushedAt: string;
        stargazerCount: number;
        description: string | null;
      } | null;
      if (!repo) continue;
      meta.set(repo.nameWithOwner.toLowerCase(), {
        isFork: repo.isFork,
        isArchived: repo.isArchived,
        pushedAt: repo.pushedAt,
        stars: repo.stargazerCount,
        description: repo.description,
      });
    }
  }
  return meta;
}

interface Filtered {
  repo: string;
  query: string;
  meta: RepoMeta;
  flags: string[];
}

function filterStage(fp: Fingerprint, hits: Hit[], meta: Map<string, RepoMeta>, tracked: Set<string>): Filtered[] {
  const cutoff = new Date(new Date(`${sweepDate}T00:00:00Z`).getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);
  const authorOrgs = new Set(fp.authorOrgs.map((org) => org.toLowerCase()));
  const kept: Filtered[] = [];
  for (const hit of hits) {
    const key = hit.repo.toLowerCase();
    const m = meta.get(key);
    if (!m) continue; // deleted or private
    if (m.isFork || m.isArchived) continue;
    if (new Date(m.pushedAt) < cutoff) continue;
    if (tracked.has(key)) continue;
    if (authorOrgs.has(key.split('/')[0])) continue;
    if (EXCLUDE_KEYWORDS.test(`${hit.repo} ${m.description ?? ''}`)) continue;

    const name = hit.repo.split('/')[1];
    const flags: string[] = [];
    if (/demo|petclinic|-test$/i.test(name)) flags.push('name-looks-demo');
    if (/dotfiles|claude-setup|claude-config/i.test(name)) flags.push('config-collection?');
    if (m.stars < STAR_FLOOR) flags.push('below-star-floor');
    if (fp.depth === null && fp.depthFlag) flags.push(fp.depthFlag);
    kept.push({ repo: hit.repo, query: hit.query, meta: m, flags });
  }
  return kept;
}

async function countDir(repo: string, dir: string, entryPattern?: RegExp): Promise<number | null> {
  const res = await fetch(`${API}/repos/${repo}/contents/${dir}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`  WARN: GET /repos/${repo}/contents/${dir} -> ${res.status}; counting as 0`);
    return 0;
  }
  const body = await res.json();
  if (!Array.isArray(body)) return 0;
  if (!entryPattern) return body.length;
  return body.filter((entry: { name: string }) => entryPattern.test(entry.name)).length;
}

async function countSpecs(repo: string, depth: DepthCheck): Promise<number> {
  if (depth.kind === 'dir') {
    const count = await countDir(repo, depth.dir);
    if (count !== null) return count;
    if (depth.fallbackDir) return (await countDir(repo, depth.fallbackDir)) ?? 0;
    return 0;
  }
  if (depth.kind === 'dirMatching') {
    return (await countDir(repo, depth.dir, depth.entryPattern)) ?? 0;
  }
  // openspec: active change dirs (excluding archive/) + spec capabilities,
  // plus archived changes when the active set alone is inconclusive.
  const changesRes = await fetch(`${API}/repos/${repo}/contents/openspec/changes`, { headers });
  const changes = changesRes.ok ? await changesRes.json() : [];
  const changeDirs = Array.isArray(changes)
    ? changes.filter((entry: { type: string; name: string }) => entry.type === 'dir' && entry.name !== 'archive')
    : [];
  const hasArchive = Array.isArray(changes)
    ? changes.some((entry: { type: string; name: string }) => entry.type === 'dir' && entry.name === 'archive')
    : false;
  let count = changeDirs.length + ((await countDir(repo, 'openspec/specs')) ?? 0);
  if (count < 2 && hasArchive) count += (await countDir(repo, 'openspec/changes/archive')) ?? 0;
  return count;
}

async function depthStage(fp: Fingerprint, candidates: Filtered[]): Promise<Candidate[]> {
  const results: Candidate[] = [];
  let index = 0;
  async function worker(): Promise<void> {
    while (index < candidates.length) {
      const candidate = candidates[index++];
      let specCount: number | null = null;
      if (fp.depth !== null) {
        specCount = await countSpecs(candidate.repo, fp.depth);
        if (specCount < fp.minSpecEntries) continue;
      }
      results.push({
        repo: candidate.repo,
        framework: fp.slug,
        stars: candidate.meta.stars,
        pushedAt: candidate.meta.pushedAt,
        description: candidate.meta.description,
        specLocation: fp.specLocation,
        specCount,
        flags: [...candidate.flags].sort(),
        query: candidate.query,
      });
    }
  }
  await Promise.all(Array.from({ length: DEPTH_CONCURRENCY }, worker));
  return results;
}

function writeSweep(swept: Map<string, { candidates: Candidate[]; searchHits: number; pathVerified: number; queries: string[] }>): void {
  const file = path.join(DISCOVERY_DIR, sweepFileName(sweepDate));
  let previous: SweepFile | null = null;
  if (isSubsetRun && existsSync(file)) {
    previous = SweepFileSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
  }

  const sweptSlugs = new Set(swept.keys());
  const candidates = [
    // A subset run replaces only the swept frameworks' candidates.
    ...(previous?.candidates.filter((candidate) => !sweptSlugs.has(candidate.framework)) ?? []),
    ...[...swept.values()].flatMap((entry) => entry.candidates),
  ].sort((a, b) => (a.pushedAt === b.pushedAt ? a.repo.localeCompare(b.repo) : b.pushedAt.localeCompare(a.pushedAt)));

  const frameworks: SweepFile['meta']['frameworks'] = { ...(previous?.meta.frameworks ?? {}) };
  for (const [slug, entry] of swept) {
    frameworks[slug] = {
      queries: entry.queries,
      searchHits: entry.searchHits,
      pathVerified: entry.pathVerified,
      candidates: entry.candidates.length,
    };
  }

  const sweep: SweepFile = {
    meta: {
      sweepDate,
      pages,
      frameworks,
      unmeasurable: UNMEASURABLE.map(({ slug, reason }) => ({ framework: slug, reason })),
      notes: previous?.meta.notes ?? [],
    },
    candidates,
  };
  SweepFileSchema.parse(sweep);
  mkdirSync(DISCOVERY_DIR, { recursive: true });
  writeFileSync(file, stableStringify(sweep) + '\n');
  console.log(`Wrote ${file}: ${candidates.length} candidate(s) across ${Object.keys(frameworks).length} framework(s).`);
}

checkRegistryCoverage();

const selected = cli.frameworks
  ? FINGERPRINTS.filter((fp) => cli.frameworks!.split(',').includes(fp.slug))
  : FINGERPRINTS;
if (cli.frameworks) {
  const unknown = cli.frameworks.split(',').filter((slug) => !FINGERPRINTS.some((fp) => fp.slug === slug));
  if (unknown.length > 0) {
    console.error(`Unknown or unmeasurable framework slug(s): ${unknown.join(', ')}`);
    process.exit(1);
  }
}

const tracked = collectTrackedRepos();
console.log(`Sweep ${sweepDate}: ${selected.length} framework(s), ${pages} page(s)/query, ${tracked.size} tracked repo(s) excluded.`);

const swept = new Map<string, { candidates: Candidate[]; searchHits: number; pathVerified: number; queries: string[] }>();
const hitsBySlug = new Map<string, Hit[]>();
for (const fp of selected) {
  console.log(`${fp.slug}:`);
  const { hits, searchHits, pathVerified } = await searchStage(fp);
  await canaryCheck(fp);
  hitsBySlug.set(fp.slug, hits);
  swept.set(fp.slug, { candidates: [], searchHits, pathVerified, queries: fp.queries });
}

// cc-sdd scaffolds Kiro's `.kiro/specs/` layout; a repo carrying cc-sdd's spec.json
// is a cc-sdd project, not a plain-Kiro one.
if (hitsBySlug.has('kiro') && hitsBySlug.has('cc-sdd')) {
  const ccSddRepos = new Set(hitsBySlug.get('cc-sdd')!.map((hit) => hit.repo.toLowerCase()));
  hitsBySlug.set(
    'kiro',
    hitsBySlug.get('kiro')!.filter((hit) => !ccSddRepos.has(hit.repo.toLowerCase())),
  );
}

const allRepos = [...new Set([...hitsBySlug.values()].flat().map((hit) => hit.repo))];
console.log(`Enriching ${allRepos.length} unique repo(s)…`);
const meta = await enrichStage(allRepos);

for (const fp of selected) {
  const entry = swept.get(fp.slug)!;
  const filtered = filterStage(fp, hitsBySlug.get(fp.slug) ?? [], meta, tracked);
  entry.candidates = await depthStage(fp, filtered);
  console.log(`${fp.slug}: ${entry.candidates.length} candidate(s) after filters + depth check.`);
}

writeSweep(swept);
