// Imports zod directly (not astro:content) so scripts/fetch-metrics.ts can share it.
import { z } from 'zod';

export const MetricsSchema = z.object({
  repo: z.string(),
  fetchedAt: z.string(),
  stars: z.number(),
  forks: z.number(),
  openIssues: z.number(),
  contributors: z.number().nullable(),
  createdAt: z.string(),
  pushedAt: z.string(),
  sizeKB: z.number(),
  license: z.string().nullable(),
  latestRelease: z
    .object({
      tag: z.string(),
      publishedAt: z.string().nullable(),
    })
    .nullable(),
  weeklyCommits: z.array(z.number()).nullable(),
});

export type RepoMetrics = z.infer<typeof MetricsSchema>;

export function metricsFileName(repo: string): string {
  return `${repo.toLowerCase().replace('/', '--')}.json`;
}
