---
name: ingest-candidates
description: Turn discovery-sweep candidates from data/discovery/<date>.json into draft project pages and draft PRs. Use when asked to ingest candidates, add discovered projects, or draft project pages from a sweep.
---

# Ingest candidates

Turns entries from a `data/discovery/<date>.json` sweep file into `src/content/projects/<slug>.md`
pages, one draft PR per project. This skill writes **only** `src/content/projects/` — never
`data/**`. The issue-form → validator pipeline remains the route for outside submissions.

## 1. Pick candidates

Use the sweep file the user names, or the newest file in `data/discovery/`. If the user hasn't
chosen repos, propose a shortlist and let them pick: prefer frameworks with no tracked project
yet (coverage beats stars), then higher stars. Present a table: repo, framework, stars,
`specCount`, flags.

**Star floor.** Candidates flagged `below-star-floor` (floor = `STAR_FLOOR` in
`src/lib/discovery-registry.ts`) are refused by default — the floor keeps review effort on
projects with real adoption. One exception: if a framework has **zero** candidates above the
floor, the maintainer may explicitly choose its best below-floor candidate; the drafted page's
body must then note that the project was ingested under the small-framework exception. All other
flags (`name-looks-demo`, `config-collection?`) also need explicit user opt-in — they usually
mean "not a real project".

## 2. Skip what's already tracked

Skip any candidate whose repo already appears (case-insensitively) in a `repo:` frontmatter field
under `src/content/projects/` or `src/content/frameworks/`. Candidates reappearing across sweep
files are normal.

## 3. Research — evidence only

Every fact in the drafted page must come from something you fetched this run. Per candidate:

- `gh api repos/<repo>` — default branch, description, timestamps.
- List the spec tree at the candidate's `specLocation` — structure, formats, how many
  changes/features.
- `gh api "repos/<repo>/commits?path=<specLocation>&per_page=100"` — first and latest spec
  commits become `timeline` entries; compare spec-dir recency against overall `pushedAt` for the
  drift assessment. If the evidence is thin, keep `drift: unknown` — never guess.

## 4. Draft the page

Follow the drafting rules in `.github/prompts/validate-submission.md` **Step 5** — that file is
the canonical rulebook; don't restate it here. In short: slug = kebab-case name; frontmatter
exactly per the zod schema in `src/content.config.ts` (`framework:` is the framework's file
slug — the sweep file already uses those); omit optional fields rather than inventing values;
body sections `## Spec-to-code drift`, `## Defects and rework`, `## Maintenance outcomes` in that
order, with `Not yet assessed.` where you have no evidence; backtick-wrap every command, path,
and file name (frontmatter strings included, per `CLAUDE.md`); `added`/`lastReviewed` = today
(`date -u +%F`). No stars or stats in content — the metrics workflow discovers the new `repo:`
automatically. Use `src/content/projects/akka-net.md` as the formatting reference.

## 5. Verify

`npm run lint:content`, then `npm run build`. Fix until green.

## 6. PR

One branch and one draft PR per project:

- Branch: `discovery/<sweep-date>-<slug>` off `origin/main`.
- Title: `Add project: <Name>`; body per `.github/pull_request_template.md`, plus a provenance
  line naming the sweep file, framework, and the fingerprint query that surfaced the repo (from
  the candidate's `query` field) — and the star-floor exception note when one applies.
