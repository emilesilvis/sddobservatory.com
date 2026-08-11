# Automated drift assessment runner — 2026-08-11

## Outcome

The v4 evidence protocol now has an executable assessment runner. For one selected frozen project it:

1. validates the content-addressed evidence set;
2. dispatches two independent OpenAI Responses API calls for every corpus-claim and materiality chunk;
3. validates every structured response against both a JSON schema and the existing fail-closed stage validator;
4. stops as `unknown` when claim extraction, materiality, model identity, or task-budget gates fail;
5. runs pinned-state checks and, when material behaviors exist, drift matching against the complete merged live-claim index;
6. compares the isolated runs and derives the final rating mechanically; and
7. optionally opens a draft PR containing the complete assessment record when a rating changes or evidence is incomplete.

The runner never edits published project content. A maintainer must review the draft assessment and make any public
content change separately.

## Local invocation

Set an API key and explicitly choose the project and model:

```sh
export OPENAI_API_KEY='...'
npm run drift:assess:v4 -- \
  --project schematic \
  --model gpt-5.6 \
  --max-tasks-per-run 20
```

The official OpenAI Structured Outputs interface is used through `responses.parse` with Zod schemas. Every call is
stateless (`store: false`), receives no tools, and gets only the frozen rubric and current task JSON. See the
[OpenAI Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

Local run bundles are written under `.drift-runs/` and ignored by git. Add `--publish-draft-pr` only when the current
GitHub credentials may create branches and draft pull requests.

## GitHub Actions

The manual **Assess project drift** workflow accepts a frozen v4 project slug, model, and task budget. It rebuilds
only the selected project's evidence, performs both isolated runs, and can open the review draft. Configure
`OPENAI_API_KEY` as a repository Actions secret before dispatching it.

There is deliberately no `schedule` trigger. Scheduled assessment remains disabled until the persistent claim index
and delta-only evidence compiler keep all nine formerly oversized projects within the precommitted 20-task budget.

## Fail-closed gates

- More than the configured semantic task budget returns `unknown` without starting model calls when known upfront.
- Invalid, refused, missing, or schema-incompatible model output returns `unknown` with the error retained.
- Corpus claims must match exactly between isolated runs.
- Materiality and atomic behavior counts must match before drift matching starts.
- Response IDs must be unique and every response must report the same model.
- Pinned-state and drift-matching dispositions must match between runs.
- Final ratings and rating rules must match.
- A drift-matching task above 2,000,000 bytes returns `unknown`; evidence is never sampled.

## Remaining scalability boundary

The runner fully automates assessment for projects that fit the gate. It intentionally fails closed for larger
projects. The persistent claim index and delta-only compiler remain necessary to make every tracked project fit the
same bounded workflow economically.
