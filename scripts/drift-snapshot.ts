export type SnapshotProject = {
  slug: string;
  repository: string;
  pin_sha: string;
  pin_time_utc: string;
  scope: 'canonical' | 'change-scoped';
  entry_points: string[];
};

export type SnapshotManifest = {
  schema_version: '1';
  snapshot_time_utc: string;
  projects: SnapshotProject[];
};

type HeadSnapshot = Pick<SnapshotProject, 'repository' | 'pin_sha' | 'pin_time_utc'>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function refreshSnapshotManifest(
  previous: SnapshotManifest,
  requestedSlugs: string[] | null,
  lookup: (project: SnapshotProject) => HeadSnapshot,
  now: () => Date = () => new Date(),
): SnapshotManifest {
  assert(previous.schema_version === '1' && previous.projects.length > 0, 'Invalid previous drift manifest');
  const available = new Set(previous.projects.map((project) => project.slug));
  const selected = requestedSlugs ?? [...available];
  assert(selected.length > 0, '--slugs must select at least one project');
  assert(new Set(selected).size === selected.length, '--slugs entries must be unique');
  for (const slug of selected) assert(available.has(slug), `${slug}: not present in the drift manifest`);
  const selectedSet = new Set(selected);

  const projects = previous.projects.map((project) => {
    if (!selectedSet.has(project.slug)) return { ...project, entry_points: [...project.entry_points] };
    const head = lookup(project);
    assert(/^[^/]+\/[^/]+$/.test(head.repository), `${project.slug}: invalid repository returned by GitHub`);
    assert(/^[0-9a-f]{40}$/.test(head.pin_sha), `${project.slug}: invalid head SHA returned by GitHub`);
    assert(!Number.isNaN(Date.parse(head.pin_time_utc)), `${project.slug}: invalid head time returned by GitHub`);
    return { ...project, ...head, entry_points: [...project.entry_points] };
  });
  return {
    schema_version: '1',
    snapshot_time_utc: now().toISOString(),
    projects,
  };
}
