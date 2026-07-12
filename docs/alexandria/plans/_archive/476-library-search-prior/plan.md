# Issue 476 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#476`
- Goal: translate the banked four-section Basic Product Description into a
  structured `library-search-prior.v1` sidecar that seeds the Back-of-House Walk
  before it scans source, then confirm or correct that prior against source.
- Depends on: `#475`, the Basic Product Description surface with the four prose
  sections `The Person`, `The Mechanism`, `The Work`, and `What It's Not`.
- Linked local plans and design records:
  - `docs/alexandria/plans/capture-the-work/plan.md`
  - `docs/alexandria/plans/capture-the-work/HANDOFF.md`
  - `docs/alexandria/plans/capture-the-work/move-c-issue.md`
  - `docs/alexandria/plans/capture-the-work/move-c-proposal.md`
  - `docs/alexandria/plans/capture-the-work/pms-workflow-reconstruction.md`
  - `docs/alexandria/plans/339-back-of-house-walk-gate-1-reconciliation/plan.md`
  - `studio/plays/back-of-house-walk/{brief.md,moves.md,risk-map.md}`

## Scope

- Add a durable `library-search-prior.v1` contract for the Back-of-House Walk:
  `domain`, `workThread`, `fence`, and `openQuestions`.
- Define the translation rubric from the four Basic Product Description prose
  sections into that prior:
  - `The Person` -> actors and vocabulary.
  - `The Mechanism` -> capability, category, and vocabulary.
  - `The Work` -> unit, path, state field, places, and inferred work shape.
  - `What It's Not` -> out-of-scope areas, external neighbors, and look-alikes.
- Add an opening Back-of-House play move that reads the description, emits
  `library-search-prior.json` when a description exists, and emits nothing when
  no description exists.
- Update `survey`, `pass1_events`, `emit_bundle`, and `check_bundle` guidance so
  the prior is used as leads, not as truth:
  - positive prior entries widen the suspect lineup;
  - only high-confidence fence entries prune;
  - pass1 confirms, corrects, or rejects prior inferences against source events;
  - unresolved low-confidence items become `threads.json` entries.
- Add deterministic validation for the new JSON contract, following the existing
  `check-threads.mjs` and `check-workflows.mjs` pattern.
- Keep the work scoped to the canonical Back-of-House Walk and supporting
  deterministic validation. If a derived or banked Back-of-House workflow exists
  by implementation time, update it only through the Studio derive/bank path.

## Non-Goals

- Do not change the four Basic Product Description questions from `#475`.
- Do not reintroduce a director-authored `The Shape` section or parse shape from
  a heading.
- Do not build a Viewer review UI for the prior.
- Do not build front-of-house resolution mechanics beyond emitting the threads
  EL3 already receives.
- Do not write to `docs/alexandria/library/`.
- Do not run a canonical re-sweep or promote new `studio/sweeps/` output in this
  slice unless implementation explicitly includes a proving fixture.
- Do not manually edit generated Studio renderings, derived workflow packages,
  or banked plugin copies. Derive and bank through Studio tools when those files
  exist.

## Current Gap

- The checked-out Back-of-House brief still has an optional `vision` input and
  says the Vision's authored `The Shape` selects suspects. Issue `#476` replaces
  that with a prior inferred from the Basic Product Description's `The Work`.
- There is no `library-search-prior.v1` schema, parser, contract example, or
  validator.
- `pass1_events` currently knows to look for the central record, status field,
  and stage loop only when `The Shape` is present. It does not have an explicit
  confidence-tagged prior or open-question handoff.
- `threads.json` already has the right notepad structure (`question`,
  `reason`, `emittingMove`, `sourceEvidence`), but the play does not yet say how
  unresolved low-confidence prior inferences become threads.
- The existing Studio guards validate `library-workflows.v1` and
  `library-threads.v1` examples with the shipped AX parsers. There is no
  equivalent early-warning guard for the search-prior contract.
- With no description present, the intended behavior is unchanged source-only
  inference. The current design has that property for missing `vision`; the
  implementation must preserve it for missing Basic Product Description input.

## Architectural Boundaries

- `studio/plays/back-of-house-walk/` owns the guided play design, prompt
  language, moves overlay, and risk-map updates.
- `packages/ax` may own a small deterministic parser for
  `library-search-prior.v1`, mirroring the existing AX ownership of
  `library-threads.v1` and `library-workflows.v1`. This parser validates shape;
  it does not perform prose interpretation.
- `studio/tools/` should own the Studio-side drift guard that extracts fenced
  `library-search-prior.v1` examples from play briefs and validates committed
  `library-search-prior.json` artifacts.
- The Viewer should not parse or display the prior in this slice. Unknown
  top-level JSON sidecars are already outside the markdown card loader path.
- The plugin package owns shipped play behavior. If a
  `packages/alexandria-plugin/workflows/back-of-house-walk/` package exists by
  implementation time, update it through the Studio ladder and validate the
  plugin; do not hand-edit a banked copy as the source of truth.
- The Basic Product Description producer from `#475` remains prose. This work
  consumes its banked markdown; it does not push schema work into the
  director-facing surface.

## Search Prior Contract

Implementation should settle one concrete JSON representation before editing the
brief. The recommended shape is:

```json
{
  "schemaVersion": "library-search-prior.v1",
  "domain": {
    "actors": [{ "value": "director", "confidence": "high" }],
    "capability": { "value": "turn a play idea into a proven workflow", "confidence": "medium" },
    "category": { "value": "play production studio", "confidence": "medium" },
    "vocabulary": [
      { "value": "play", "confidence": "high" },
      { "value": "board", "confidence": "medium" }
    ]
  },
  "workThread": {
    "unit": { "value": "Play", "confidence": "high" },
    "path": [
      {
        "activity": { "value": "brief", "confidence": "high" },
        "place": { "value": "studio", "confidence": "medium" },
        "advance": { "value": "human gate approval", "confidence": "medium" }
      }
    ],
    "stateField": { "value": "status", "confidence": "low" },
    "places": [{ "value": "board", "confidence": "medium" }],
    "shape": {
      "value": "pipeline",
      "confidence": "high",
      "basis": "The Work names ordered, gated stages."
    }
  },
  "fence": {
    "outOfScope": [{ "value": "generic project management tracker", "confidence": "high" }],
    "external": [{ "value": "Fabro runtime", "confidence": "medium" }],
    "lookAlikes": [{ "value": "chatbot", "confidence": "high" }]
  },
  "openQuestions": [
    {
      "about": "stateField",
      "question": "Is the lifecycle marker actually named status in source?"
    }
  ]
}
```

Rules:

- Confidence values are `high`, `medium`, or `low`.
- `high` means the prose directly states the claim.
- `medium` means the prose implies it through multiple signals.
- `low` means the translator is guessing from a single ambiguous signal or from
  generic product-shape knowledge.
- Every low-confidence field adds an `openQuestions[]` entry.
- Fence entries prune only at `high` confidence and only when they came from
  `What It's Not`.
- The translator may add candidates when unsure. It must not delete positive
  suspects because of low or medium confidence.
- The inferred `shape` comes from `The Work`, with `basis`. It is never read
  from a director-authored `The Shape` section.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Back-of-House brief | `studio/plays/back-of-house-walk/brief.md` | Replace old `vision` / `The Shape` guidance with a Basic Product Description input, a `translate_search_prior` opening move, a `library-search-prior.v1` contract example, and pass1 rules for confirming/correcting the prior |
| Moves overlay | `studio/plays/back-of-house-walk/moves.md` | Add the prior translation move and update `pass1_events` / `emit_bundle` reader-facing prose so the play story matches the new graph |
| Risk map | `studio/plays/back-of-house-walk/risk-map.md` | Add coverage for prior fidelity, fence over-pruning, low-confidence question handoff, and no-description regression; update OUT-6 / golden-studio expectations to include prior-confirmation deltas |
| AX domain parser | `packages/ax/src/domain/library-search-prior.ts` and `packages/ax/tests/library-search-prior.test.ts` | Validate the new sidecar schema and expose constants such as `LIBRARY_SEARCH_PRIOR_FILE` and `LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION`; no CLI behavior change |
| Studio prior guard | `studio/tools/check-search-prior.mjs`, `studio/tools/check-search-prior.test.mjs`, `studio/tools/fixtures/search-prior/**`, `studio/tools/check.sh` | Validate embedded prior contract examples and committed `library-search-prior.json` artifacts, using the AX parser as the single contract |
| Derived or banked workflow, conditional | `studio/plays/back-of-house-walk/workflow.fabro`, `prompts/**`, `story.md`, `packages/alexandria-plugin/workflows/back-of-house-walk/**` if present | Regenerate and bank through Studio only if those files exist by implementation time; keep bank conformance clean |
| Viewer, normally untouched | `packages/viewer/**` | No behavior change unless implementation intentionally parses or displays the prior, which is out of scope for this slice |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Back-of-House Walk play | Adds an opening translation move and changes pass1 from "read authored Shape" to "use confidence-tagged prior derived from The Work" | Update brief, moves overlay, risk map, and any derived prompts/workflow in the same Studio slice |
| Back-of-House output contract | Adds optional `library-search-prior.json` when a Basic Product Description is present | Add parser, fixtures, Studio guard, and contract example |
| Thread emission discipline | Low-confidence prior inferences unresolved by source become `threads.json` entries with director-register `question` and builder-register `reason` | Update `emit_bundle` and `check_bundle` guidance; extend risk map fixtures |
| Product skills | No planned change | If implementation discovers `#475` is not present and must alter Raven vision/description skills, stop or split that work; any product skill prompt change requires targeted eval reruns |
| CLI behavior | No command or exit-code change planned | If a validation command is added anyway, add black-box CLI tests for exit codes and JSON output fields |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Search-prior parser | `cd packages/ax && bun test tests/library-search-prior.test.ts` | Proves valid, malformed, missing-confidence, duplicate/open-question, and low-confidence cases decode as intended |
| Studio prior guard | `bun studio/tools/check-search-prior.mjs` | Validates embedded `library-search-prior.v1` examples and committed sidecars |
| Studio prior guard tests | `bun test studio/tools/check-search-prior.test.mjs` | Keeps the guard in parser parity with AX, like threads/workflows |
| Full Studio data checks | `sh studio/tools/check.sh` | Runs catalog, board, risk-map, workflows, threads, and the new prior guard together |
| Back-of-House play conformance | `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` if the script supports per-play checks | Catches drift in Back-of-House play contract wording and gate/bank assumptions |
| AX regression | `cd packages/ax && bun test tests/library-catalog.test.ts tests/library-catalog-story.test.ts tests/library-front-of-house.test.ts` if AX domain exports change | Guards existing catalog sidecars and front-of-house thread consumption |
| Plugin validation, conditional | `claude plugin validate ./packages/alexandria-plugin` | Required only if a derived/banked plugin workflow is touched |
| Viewer validation, conditional | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run check` | Required only if the prior is intentionally surfaced or viewer schemas change |

No CLI command behavior changes are planned. Therefore no CLI black-box tests
are required unless the implementation adds a user-facing validation command.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Back-of-House Walk design | Covered by Studio risk-map planning and deterministic conformance, not by the current `pnpm eval` harness | Update `risk-map.md` with new fixture obligations: `description-golden-studio`, `low-confidence-unresolved`, `fence-prunes-only-high`, and `no-description-regression` | No `pnpm eval` rerun in this planning slice |
| `library-search-prior.v1` parser | No existing parser | Add deterministic parser tests and Studio guard fixtures | `cd packages/ax && bun test tests/library-search-prior.test.ts`; `bun test studio/tools/check-search-prior.test.mjs` |
| Product Raven/description skills from `#475` | Existing Raven skill/eval coverage may apply, but this issue should not edit those skills | No action if `#475` is already present; if implementation changes product skills, run targeted Raven evals | Likely `pnpm eval -- run raven/all` after using `/targeted-evals` to narrow the set |
| Derived Back-of-House workflow | Current repo has the play design but no packaged Back-of-House workflow in `packages/alexandria-plugin/workflows/` | Defer full stochastic play eval until Derive/Prove; update risk-map fixture list now | Future Studio dry-runs over the risk-map fixtures, especially `golden-studio` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The implementation accidentally recreates an authored `The Shape` slot | Make the brief say shape is inferred from `The Work`; add contract examples with `shape.basis`; search for and remove `The Shape says` wording from Back-of-House artifacts |
| The prior becomes a hidden assertion layer instead of a search lead | Require confidence on every inferred field; pass1 must confirm/correct against source; check_bundle flags asserted-but-unproven prior entries |
| Low-confidence guesses leak into cards or workflows as fact | Low confidence creates `openQuestions`; unresolved questions become `threads.json` entries, not asserted cards or final workflow steps |
| Fence entries over-prune the source search | Prune only `high` confidence exclusions from `What It's Not`; medium/low fence items become questions or candidates to inspect |
| No-description runs drift from current behavior | Add a no-description regression fixture in the risk map; the translation move emits no prior sidecar and survey/pass1 follow the existing source-only path |
| Human-ese prose is too loose for deterministic parsing | Keep translation as an agent move with a rubric; deterministic code validates only the emitted JSON shape |
| New JSON sidecar drifts from the documented contract | Add an AX parser and Studio guard, importing the parser into `check-search-prior.mjs` like threads/workflows |
| The approved Studio move graph changes without Studio ladder hygiene | Treat the new opening move and pass1 changes as a play amendment: update brief, moves, risk map, run Studio checks, and re-derive/re-bank only through Studio tools when derived files exist |
| AX parser grows into viewer feature work | Keep parser output out of `LibraryCatalog` in this slice; defer viewer prior review to a separate issue |
| Implementation starts before `#475` is actually landed | First implementation step verifies the four-section Basic Product Description source and stops if the repo still only has the old Vision slot model |

## Implementation Steps

1. Verify the `#475` dependency in the target branch:
   - identify the banked Basic Product Description path and exact input name;
   - confirm it has `### The Person`, `### The Mechanism`, `### The Work`, and
     `### What It's Not`;
   - confirm no implementation code expects a director-authored `The Shape` for
     Back-of-House.
2. Add the deterministic search-prior contract:
   - create `packages/ax/src/domain/library-search-prior.ts`;
   - export schema/file constants, confidence helpers, and
     `parseLibrarySearchPrior(content)`;
   - return metadata issues instead of throwing, following catalog sidecar
     parser style.
3. Add parser tests in `packages/ax/tests/library-search-prior.test.ts`:
   - good prior parses;
   - wrong schema version fails;
   - missing confidence fails;
   - invalid confidence fails;
   - low-confidence field without an open question fails or emits a metadata
     issue, according to the chosen parser policy;
   - high-confidence fence entries are distinguishable from medium/low entries.
4. Add the Studio guard:
   - create `studio/tools/check-search-prior.mjs`;
   - extract fenced JSON blocks containing `library-search-prior.v1` from play
     briefs;
   - scan committed `library-search-prior.json` files under `studio/sweeps/` if
     present;
   - validate all sources with the AX parser.
5. Add Studio guard fixtures and tests:
   - `studio/tools/fixtures/search-prior/good/library-search-prior.json`;
   - bad schema, missing confidence, bad shape, and low-confidence/no-question
     fixtures;
   - `studio/tools/check-search-prior.test.mjs`.
6. Wire the guard into `studio/tools/check.sh` after workflows/threads checks.
7. Update `studio/plays/back-of-house-walk/brief.md`:
   - replace optional `vision` wording with the `#475` Basic Product Description
     input;
   - add `translate_search_prior` before `survey`;
   - document the `library-search-prior.v1` contract example;
   - change `survey` so prior vocabulary/places widen file selection and
     high-confidence fence entries can prune;
   - change `pass1_events` so the inferred shape seeds the suspect lineup and
     is confirmed/corrected against source;
   - change `emit_bundle` so declared-but-absent stages, present-but-undeclared
     events, and unresolved low-confidence questions become threads;
   - change `check_bundle` so prior, workflows, events, and threads are checked
     together.
8. Update `studio/plays/back-of-house-walk/moves.md` so the reader-facing play
   story includes the new opening move and no longer says an authored Shape
   chooses suspects.
9. Update `studio/plays/back-of-house-walk/risk-map.md`:
   - add risks for prior mistranslation, fence over-pruning, silent
     low-confidence assertion, and no-description regression;
   - add fixture obligations for `description-golden-studio`,
     `low-confidence-unresolved`, `fence-prunes-only-high`, and
     `no-description-regression`;
   - update OUT-6 / `golden-studio` expectations to include prior-vs-source
     deltas.
10. If derived Studio artifacts exist by then, run the Studio derive/resync path
    instead of editing them directly. If a banked plugin workflow exists, bank
    through `studio/tools/bank.sh` and validate the plugin.
11. Run the deterministic verification commands and fix only the touched
    contract/play artifacts.
12. Do a final text search for retired wording:
    - `The Shape says`;
    - `Refusal & Fence` in Back-of-House consumption text;
    - `vision` as the Back-of-House prior input, unless retained only as a
      compatibility alias documented by `#475`.

## Acceptance / Exit Criteria

1. The Back-of-House Walk defines and emits a valid
   `library-search-prior.v1` sidecar when a Basic Product Description is
   present.
2. Every inferred field in the prior carries confidence.
3. Shape is inferred from `The Work` with `basis`; no Back-of-House artifact
   asks the director for an authored Shape section.
4. `pass1_events` uses the prior as a suspect lineup and confirms or corrects
   it against source events.
5. High-confidence `What It's Not` fence entries are the only entries that
   prune search.
6. Low-confidence inferences unresolved by source become `threads.json` entries
   with director-register `question`, builder-register `reason`,
   `emittingMove`, and `sourceEvidence`.
7. A declared stage with no source event and a source event with no declared
   stage are both surfaced as deltas, not hidden.
8. With no Basic Product Description input, the walk emits no prior sidecar and
   follows the existing source-only inference path.
9. Studio risk-map, moves overlay, and brief stay aligned.
10. New parser and Studio guard tests pass, and `sh studio/tools/check.sh`
    remains green.
11. No implementation writes to `docs/alexandria/library/`.

## Deferred Follow-Ups

1. Viewer-side review of `library-search-prior.json` before or after a walk.
2. Bank-time `vision.json` or `product-description.json` sidecar if a future
   issue wants the prior reviewed before Back-of-House runs.
3. EL3-specific UI or workflow mechanics for resolving prior-originated
   questions beyond receiving them as normal threads.
4. Full Back-of-House Fabro dry-runs over the new risk-map fixtures once the
   play is derived and in the Proven ladder.
5. Parsing the prior into `LibraryCatalog` if a future lens needs to show
   prior-vs-confirmed deltas in Viewer.
6. A canonical Playmaker Studio dogfood re-sweep using the new prior, after
   `#475` and this issue both land.
