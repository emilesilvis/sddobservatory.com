# CLAUDE.md

## Content formatting (`src/content/`)

Wrap every slash command (`/specify`), CLI command (`npx …`), file name (`CONTEXT.md`),
directory path (`deprecated/`), and code identifier in backticks — in frontmatter strings
(`summary`, `coreApproach`, `workflow`, `strengths`, `limitations`, …) as well as Markdown
body text. Frontmatter strings render through `src/components/RichText.astro`, which turns
backtick spans into inline `<code>`; anything left bare renders as plain prose on the site.

`npm run build` runs `scripts/lint-content.ts` first and fails on any bare slash command in
content, frontmatter or body. Run `npm run lint:content` before committing content changes.

## The one content rule

Humans (and agents) edit `src/content/`; the metrics bot edits `data/metrics/`. Never edit
metrics files or copy stats into content frontmatter. See CONTRIBUTING.md for the rest.

The submission validator agent (`.github/prompts/validate-submission.md`) drafts content from
issue submissions; its rules are a superset of this one.
