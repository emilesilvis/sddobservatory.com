/**
 * Fetches GitHub repo metrics for every `repo` referenced in content frontmatter
 * and writes them to data/metrics/<owner>--<repo>.json.
 *
 * Only machine-written files live in data/metrics/ — humans edit src/content/.
 * Run: GITHUB_TOKEN=... npm run metrics
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { MetricsSchema, metricsFileName, type RepoMetrics } from '../src/lib/metrics-schema';
import { stableStringify } from '../src/lib/stable-json';

const API = 'https://api.github.com';
const CONTENT_DIRS = ['src/content/frameworks', 'src/content/projects'];
const METRICS_DIR = 'data/metrics';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is required (locally: GITHUB_TOKEN=$(gh auth token) npm run metrics)');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

function collectRepos(): string[] {
  const repos = new Set<string>();
  for (const dir of CONTENT_DIRS) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const { data } = matter(readFileSync(path.join(dir, file), 'utf8'));
      if (typeof data.repo === 'string' && data.repo) repos.add(data.repo);
    }
  }
  return [...repos].sort();
}

async function gh(pathname: string): Promise<Response> {
  return fetch(`${API}${pathname}`, { headers });
}

async function fetchWeeklyCommits(repo: string): Promise<number[] | null> {
  // GitHub returns 202 while it computes stats in the background.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await gh(`/repos/${repo}/stats/commit_activity`);
    if (res.status === 202) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }
    if (!res.ok) return null;
    const weeks: unknown = await res.json();
    if (!Array.isArray(weeks)) return null;
    return weeks.map((week: { total: number }) => week.total);
  }
  return null;
}

async function fetchContributors(repo: string): Promise<number | null> {
  const res = await gh(`/repos/${repo}/contributors?per_page=1&anon=true`);
  if (res.status === 204) return 0; // empty repo
  if (!res.ok) return null;
  const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  if (last) return Number(last[1]);
  const body: unknown = await res.json();
  return Array.isArray(body) ? body.length : null;
}

async function fetchRepoMetrics(repo: string): Promise<RepoMetrics | null> {
  const repoRes = await gh(`/repos/${repo}`);
  if (repoRes.status === 404) {
    console.warn(`SKIP ${repo}: 404 — renamed, deleted, or private?`);
    return null;
  }
  if (!repoRes.ok) throw new Error(`GET /repos/${repo} -> ${repoRes.status}`);
  const info = await repoRes.json();
  if (info.full_name.toLowerCase() !== repo.toLowerCase()) {
    console.warn(`NOTE ${repo} redirects to ${info.full_name} — update content frontmatter`);
  }

  const releaseRes = await gh(`/repos/${repo}/releases/latest`);
  const release = releaseRes.ok ? await releaseRes.json() : null;

  return MetricsSchema.parse({
    repo,
    fetchedAt: new Date().toISOString(),
    stars: info.stargazers_count,
    forks: info.forks_count,
    openIssues: info.open_issues_count,
    contributors: await fetchContributors(repo),
    createdAt: info.created_at,
    pushedAt: info.pushed_at,
    sizeKB: info.size,
    license: info.license?.spdx_id ?? null,
    latestRelease: release ? { tag: release.tag_name, publishedAt: release.published_at ?? null } : null,
    weeklyCommits: await fetchWeeklyCommits(repo),
  });
}

/** Skips the write when nothing but fetchedAt changed, so scheduled runs don't commit noise. */
function writeIfChanged(metrics: RepoMetrics): boolean {
  const file = path.join(METRICS_DIR, metricsFileName(metrics.repo));
  if (existsSync(file)) {
    const previous = JSON.parse(readFileSync(file, 'utf8'));
    const a = stableStringify({ ...previous, fetchedAt: null });
    const b = stableStringify({ ...metrics, fetchedAt: null });
    if (a === b) return false;
  }
  mkdirSync(METRICS_DIR, { recursive: true });
  writeFileSync(file, stableStringify(metrics) + '\n');
  return true;
}

const repos = collectRepos();
console.log(`Fetching metrics for ${repos.length} repo(s)…`);
let updated = 0;
for (const repo of repos) {
  const metrics = await fetchRepoMetrics(repo);
  if (!metrics) continue;
  const changed = writeIfChanged(metrics);
  console.log(`${changed ? 'UPDATED' : 'unchanged'} ${repo} (★ ${metrics.stars})`);
  if (changed) updated++;
}
console.log(`Done. ${updated} file(s) updated.`);
