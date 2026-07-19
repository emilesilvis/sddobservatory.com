// Imports zod directly (not astro:content) so scripts/discovery-sweep.ts can share it.
import { z } from 'zod';

const repoId = z.string().regex(/^[\w.-]+\/[\w.-]+$/);

export const CandidateSchema = z.object({
  repo: repoId,
  // Content slug of src/content/frameworks/<slug>.md — validated against the
  // registry at runtime (not a zod enum) so adding a framework never edits this file.
  framework: z.string(),
  stars: z.number(),
  pushedAt: z.string(),
  description: z.string().nullable(),
  // Directory the spec-depth check inspected; null when the framework keeps specs
  // outside the repo (e.g. grill-me-skills publishes to the issue tracker).
  specLocation: z.string().nullable(),
  specCount: z.number().nullable(),
  // Judgment signals for the ingest step, e.g. "below-star-floor", "name-looks-demo",
  // "config-collection?", "grill-me-unverifiable-depth". Flagged candidates are kept
  // in the data but refused at ingest without explicit maintainer opt-in.
  flags: z.array(z.string()),
  // The code-search query that surfaced this repo.
  query: z.string(),
});

export const SweepFileSchema = z.object({
  meta: z.object({
    sweepDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    // Pages-per-query sampled this run (each page holds up to 100 hits).
    pages: z.number(),
    // Per-framework stage counts. Nullable so converted/partial files validate
    // when a count was never captured.
    frameworks: z.record(
      z.string(),
      z.object({
        queries: z.array(z.string()),
        searchHits: z.number().nullable(),
        pathVerified: z.number().nullable(),
        candidates: z.number(),
      }),
    ),
    // Frameworks that cannot be discovered by code search, reported honestly
    // every sweep instead of silently skipped.
    unmeasurable: z.array(z.object({ framework: z.string(), reason: z.string() })),
    notes: z.array(z.string()),
  }),
  candidates: z.array(CandidateSchema),
});

export type Candidate = z.infer<typeof CandidateSchema>;
export type SweepFile = z.infer<typeof SweepFileSchema>;

export function sweepFileName(date: string): string {
  return `${date}.json`;
}
