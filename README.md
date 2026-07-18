# SDD Observatory

**Tracking spec-driven development in the wild** — [sddobservatory.com](https://sddobservatory.com)

An open directory of spec-driven development (SDD) frameworks and the real-world projects using them, tracked over
time to evaluate how effective different approaches are in practice.

## How it works

- **Content** (`src/content/frameworks/`, `src/content/projects/`) is human-curated Markdown, schema-validated at
  build time. Framework pages cover approach, workflow, tools, maturity, strengths, and limitations. Project pages
  cover spec structure, spec-to-code drift, defects and rework, maintenance outcomes, and a timeline.
- **Metrics** (`data/metrics/`) are machine-written: a [scheduled workflow](.github/workflows/metrics.yml) pulls
  repo stats from the GitHub API daily, commits changes, and redeploys the site. Humans never edit these files —
  and bots never edit content.
- **The site** is [Astro](https://astro.build/), statically built and deployed to GitHub Pages on every push to
  `main`.

## Contributing

Submissions and assessment refreshes are the lifeblood of the project — see [CONTRIBUTING.md](CONTRIBUTING.md),
the [submit page](https://sddobservatory.com/submit/), or open an
[issue form](https://github.com/emilesilvis/sddobservatory.com/issues/new/choose).

## Development

```sh
npm install
npm run dev        # localhost:4321
npm run build
GITHUB_TOKEN=$(gh auth token) npm run metrics   # refresh data/metrics/ locally
```

Note for the maintainer's setup: if your clone lives inside Dropbox on macOS, exclude the churn-heavy dirs once
with `xattr -w com.dropbox.ignored 1 node_modules dist .astro`.
