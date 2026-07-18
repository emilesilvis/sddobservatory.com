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

## What happens after you submit an issue

A validator agent (see [`.github/prompts/validate-submission.md`](.github/prompts/validate-submission.md))
checks every issue carrying the `submission` label and comments with its findings:

- **`needs-info`** — something is missing or invalid; the comment says exactly what. Edit the issue to re-run
  the check (the same comment updates in place).
- **`possible-duplicate`** — it may duplicate an existing entry or another open submission. The issue is left
  open for a maintainer to judge; the agent never closes anything.
- **`ready-for-review`** — everything checks out, and the agent has opened a draft PR with the content file for
  a maintainer to review.

A human maintainer reviews every submission before anything is published. Maintainers can opt a free-form
(non-form) issue into validation by adding the `submission` label plus `project` or `framework`, and re-trigger
a run by removing and re-adding `submission`.

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
- Wrap commands, file names, and paths in backticks — in frontmatter strings (`summary`, `workflow`,
  `strengths`, …) as well as body text, they render as inline code on the site. This is enforced for
  slash commands: `npm run build` (and CI on every PR) fails if a bare `/command` is found in content.

## Licensing of contributions

The code in this repository is licensed under the [MIT License](LICENSE); the curated content in `src/content/`
is licensed under [CC BY-SA 4.0](LICENSE-CONTENT.md).

By submitting a contribution (via pull request, issue form, or otherwise), you agree that:

1. Your contribution is licensed under the license covering the part of the repository it modifies — MIT for
   code, CC BY-SA 4.0 for content.
2. You additionally grant the project maintainer a perpetual, worldwide, non-exclusive, royalty-free,
   irrevocable, sublicensable, and transferable license to use, reproduce, modify, distribute, and build upon
   your contribution for any purpose, including commercial purposes.
3. You have the right to grant these licenses for the material you contribute.

The deal, stated plainly: the observatory's content is and will remain freely available under CC BY-SA 4.0.
The maintainer may build commercial offerings around the observatory (for example reports, sponsorships, or
services). Contributing means you're comfortable with both halves of that arrangement.

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
