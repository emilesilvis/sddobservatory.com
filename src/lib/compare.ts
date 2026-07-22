import type { CollectionEntry } from 'astro:content';

/** A framework flattened into the fields the comparison view lays side by side. */
export interface FrameworkProfile {
  id: string;
  name: string;
  website?: string;
  repo?: string;
  summary: string;
  coreApproach: string;
  workflow: string[];
  maturity: string;
  supportedTools: string[];
  strengths: string[];
  limitations: string[];
  featured: boolean;
  /** Number of tracked projects that reference this framework. */
  adoption: number;
}

/**
 * Flatten framework entries into comparison profiles, counting the tracked
 * projects that reference each one (the join used in `frameworks/[slug].astro`).
 */
export function buildProfiles(
  frameworks: CollectionEntry<'frameworks'>[],
  projects: CollectionEntry<'projects'>[],
): FrameworkProfile[] {
  const adoptionByFramework = new Map<string, number>();
  for (const project of projects) {
    const id = project.data.framework.id;
    adoptionByFramework.set(id, (adoptionByFramework.get(id) ?? 0) + 1);
  }

  return frameworks.map((framework) => ({
    id: framework.id,
    name: framework.data.name,
    website: framework.data.website,
    repo: framework.data.repo,
    summary: framework.data.summary,
    coreApproach: framework.data.coreApproach,
    workflow: [...framework.data.workflow],
    maturity: framework.data.maturity,
    supportedTools: [...framework.data.supportedTools],
    strengths: [...framework.data.strengths],
    limitations: [...framework.data.limitations],
    featured: framework.data.featured,
    adoption: adoptionByFramework.get(framework.id) ?? 0,
  }));
}

/**
 * The sorted union of tools supported by any of the given profiles — the row
 * axis for the supported-tools matrix.
 */
export function unionTools(profiles: FrameworkProfile[]): string[] {
  return [...new Set(profiles.flatMap((profile) => profile.supportedTools))].sort();
}
