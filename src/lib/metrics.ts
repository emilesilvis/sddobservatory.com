import { MetricsSchema, type RepoMetrics } from './metrics-schema';

const modules = import.meta.glob('../../data/metrics/*.json', { eager: true }) as Record<
  string,
  { default: unknown }
>;

const byRepo = new Map<string, RepoMetrics>();
for (const [path, mod] of Object.entries(modules)) {
  const parsed = MetricsSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new Error(`Invalid metrics file ${path}: ${parsed.error.message}`);
  }
  byRepo.set(parsed.data.repo.toLowerCase(), parsed.data);
}

/** Metrics for a repo ("owner/name"), or undefined if not yet fetched — render as "metrics pending". */
export function getMetrics(repo: string | undefined): RepoMetrics | undefined {
  return repo ? byRepo.get(repo.toLowerCase()) : undefined;
}
