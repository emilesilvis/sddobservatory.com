# Contributing to SDD Observatory

The observatory is community-maintained. Every framework and project page is a Markdown file in this repo; adding
or improving one is a normal pull request. If you'd rather not write the file yourself, use the
[issue forms](https://github.com/emilesilvis/sddobservatory.com/issues/new/choose) instead.

## The one rule

**Humans edit `src/content/`; the bot edits `data/metrics/`.** Repository stats (stars, activity, contributors,
releases) are fetched daily by a scheduled workflow and written to `data/metrics/` — never edit those files, and
never copy stats into content frontmatter. Everything in `src/content/` is human judgment and stays that way.

## Ways to contribute

1. **Add a framework** — `src/content/frameworks/<slug>.md`
2. **Add a project** — `src/content/projects/<slug>.md`
3. **Refresh an assessment** — often the most valuable: pick a page with a stale `lastReviewed`, re-check the
   project against its spec directory, update the drift rating and narratives, and bump `lastReviewed`.

Inclusion criteria and copy-paste frontmatter templates live on the
[submit page](https://sddobservatory.com/submit/). The authoritative field definitions are the zod schemas in
[`src/content.config.ts`](src/content.config.ts) — the build fails with a precise error if frontmatter doesn't
match.

## Project pages: required body sections

Every project page's Markdown body must contain these three `##` sections, in this order:

```markdown
## Spec-to-code drift

## Defects and rework

## Maintenance outcomes
```

Write what you actually observed, with dates and links. `Not yet assessed.` is an honest and acceptable body for
any section — it renders as an invitation for someone else to pick it up. Rating definitions (maturity, drift,
status) are on the [methodology page](https://sddobservatory.com/methodology/).

## Evidence standards

- Every claim should be verifiable from a linked public source (a commit, a release, a directory, a doc page).
- Drift ratings compare spec-directory activity against code activity — say what you compared and when.
- Prefer the framework's own vocabulary for workflow steps (real command names, real phase names).

## Development setup

```sh
npm install
npm run dev        # localhost:4321
npm run build      # also validates all frontmatter against the schemas
```

To refresh metrics locally (optional — CI does this daily):

```sh
GITHUB_TOKEN=$(gh auth token) npm run metrics
```
