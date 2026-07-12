# Issue 335 - Studio Catalog Division/Function Filing

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/335
Run ID: 01KVTG99P2TMP44ZE5BPNNVFFZ

## Goal

Implement the Studio catalog foundation ruled in
`docs/alexandria/plans/studio-fixes/org-model.md`: one company,
`Alexandria_Prime`, with plays filed by `Division` and then by that division's
own `Function` set. The catalog must present Product, fronted by Raven, and
PlaymakerStudio, fronted by William. Raven and William are derived views over
division slices, not fields stored on play records.

The immediate win is to retire the flat Product-only `job` model and the
"eight functions are universal" assumption from active Studio catalog surfaces.
The existing golden-path plays should read as Product / Product function /
Raven. Studio-owned plays should read as PlaymakerStudio / PlaymakerStudio
function / William.

## Sources Of Truth

- `docs/alexandria/plans/studio-fixes/org-model.md` is authoritative for the
  org spine and function contract.
- `docs/alexandria/plans/studio-fixes/studio-data-model.md` describes the
  Catalog, Board, Operations, and Ledger model that sits on that spine.
- `studio/README.md` and `studio/plays/README.md` define the current static
  Studio surface and state-file boundaries.
- Current implementation surfaces are `studio/plays/registry.js`,
  `studio/plays/registry.html`, `studio/plays/board.html`,
  `studio/index.html`, `studio/plays/TEMPLATE-brief.md`, and existing
  `studio/plays/*/brief.md` frontmatter.

## Catalog Contract To Implement

Store the catalog contract as data in `studio/plays/registry.js`:

```js
const COMPANY = 'Alexandria_Prime';
const DIVISIONS = {
  Product: {
    face: 'Raven',
    functions: [
      'Insight',
      'Strategy',
      'Definition',
      'Delivery',
      'Launch',
      'Analytics',
      'Communication',
      'Operations',
      'Library Operations',
    ],
  },
  PlaymakerStudio: {
    face: 'William',
    functions: [
      'Production',
      'Proving',
      'Operations',
      'Library Operations',
    ],
  },
};
```

Each active catalog play record declares `division` and `function`. It must not
declare `job`, `face`, `faceAgent`, `agent`, `ownerAgent`, or a built-by filing
field. The display derives the face agent from `DIVISIONS[play.division].face`.

Validation resolves a play's function only against
`DIVISIONS[play.division].functions`. There is no global function list. It is
acceptable for validation to assert that every division includes the two
universal functions, Operations and Library Operations, but that assertion must
not become the lookup path for play filing.

`board-state.json` remains the source of truth for lifecycle stage and priority
order. This issue does not change the Board persistence schema.

## Scope

- Convert active Studio catalog metadata from `job` to `division` plus
  `function`.
- Add per-division function definitions and catalog validation.
- Update the visible catalog surfaces so Product/Raven and
  PlaymakerStudio/William are first-class sections, each with its own functions.
- Update active play brief frontmatter and the brief template to declare
  `division` and `function` instead of `job`.
- Add a deterministic catalog checker that fails invalid division/function pairs
  and rejects retired catalog fields.
- Keep changes inside `studio/` plus this plan. No `packages/ax`,
  `packages/viewer`, or `packages/alexandria-plugin` behavior changes are
  planned for this slice.

## Non-Goals

- Do not move play directories or workflow files by division/function.
- Do not build William's coin, onboarding, or PlaymakerStudio library.
- Do not add a built-by field. Built-by provenance belongs on the Ledger and is
  out of scope here.
- Do not implement Board work-order cards, Board card schema changes, or ledger
  events.
- Do not write to `docs/alexandria/library/`.
- Do not expand or migrate the atomic-card / EL family as a family in this
  issue. If an existing `registry.js` row must remain active, only metadata
  normalization for that already-present row is in scope.

## Current Implementation Gap

`studio/plays/registry.js` is a flat `RUNGS` array. Each row uses `job`, and the
browser pages read `r.job` directly. `registry.html` presents the golden path as
core/input/stretch groups rather than as a company catalog partitioned by
division and function. `board.html` renders only the old job chip. `studio/index.html`
and `studio/research/*` still encode the old eight-job Product role model.

The current brief template uses:

```text
job:      <one of the eight job categories>
```

Several active briefs still carry `job:` values, including old long names such
as `Customer & Market Insight`, ambiguous values such as
`Definition / Delivery`, and library breadcrumbs such as `Library`.

The result is split-brained: the ruled model says functions are per division,
but the live catalog still behaves like one Product-only global function list.

## Initial Filing Map

The existing golden-path and parked Product play records should file under
Product and keep their Product function:

- Insight: `frame-the-problem`, `frame-the-problem-baseline`,
  `run-internal-feature-discovery`, `elicit-business-context`,
  `feasibility-check`, `market-competitor-scan`, `size-the-opportunity`,
  `capture-technical-constraints`.
- Strategy: `frame-a-bet`, `prioritize-the-backlog`,
  `riskiest-assumption-test`.
- Definition: `write-the-one-pager`, `scope-an-mvp`,
  `survey-the-existing-system`, `write-acceptance-criteria`.
- Delivery: `architecture-aware-build-plan`.
- Library Operations: only the already-present `build-atomic-card` row if it
  stays in the active registry for validation. Do not add the rest of the
  atomic-card or EL family in this slice.

Seed the PlaymakerStudio catalog with existing Studio-owned specs so William's
view is not empty:

- Production: a `play-writing` or `make-a-play` catalog record pointing at
  `studio/plays/README.md` and the F8/F7 design material.
- Proving: a `review-levels` or `play-proving` record pointing at
  `docs/alexandria/plans/studio-fixes/F7-review-levels.md` and
  `studio/plays/TESTING.md`.
- Operations: `play-re-sync` pointing at
  `docs/alexandria/plans/studio-fixes/play-re-sync.md`.
- Library Operations: show the function under PlaymakerStudio even if it has no
  play rows yet.

These records are catalog entries for existing Studio-owned design artifacts;
they do not build the plays or change runtime behavior.

## Architecture And Boundaries

- Keep the Studio site as static HTML plus plain JavaScript. Do not introduce a
  package build step.
- Keep `registry.js` as the shared identity/catalog source that
  `registry.html` and `board.html` consume.
- Keep lifecycle stage in `board-state.json`; catalog filing is separate from
  production progress.
- Derive "Raven's plays" and "William's plays" by filtering play records on
  `division` and then looking up the division face. Do not duplicate the face on
  each play.
- Let validation return structured errors that both the browser and a CLI-like
  checker can report.
- Keep historical/archive docs readable. Only active catalog surfaces and active
  play metadata need to satisfy the retired-`job` negative criterion.

## Touch Map

- `studio/plays/registry.js`
  - Add `COMPANY`, `DIVISIONS`, validation helpers, and derived grouping
    helpers.
  - Rename play field `job` to `function`.
  - Add `division` to every active catalog record.
  - Remove copy that treats face agent as play ownership, such as "NOT a Raven
    play", replacing it with division/function filing language.
- `studio/plays/registry.html`
  - Rework the main catalog view around division sections.
  - For each division, show the face agent and that division's functions.
  - Inside Product, preserve the golden path/readiness signal as a Product
    catalog lens rather than the whole catalog.
  - Render validation errors visibly if the catalog contract is broken.
- `studio/plays/board.html`
  - Replace `r.job` chips with `division / function` and derived face text.
  - Keep drag, confirm, and persistence behavior unchanged.
- `studio/index.html`
  - Retitle/reframe the landing surface from one Raven Product role model to the
    company catalog entry point.
  - Show Product/Raven and PlaymakerStudio/William with their own functions.
  - Either update the old Product role model to Product-only language or link it
    as historical research, not as the catalog contract.
- `studio/plays/TEMPLATE-brief.md`
  - Replace the `job:` frontmatter slot with `division:` and `function:`.
  - Name the two division function sets or point to `org-model.md`.
- `studio/plays/*/brief.md`
  - Update active play frontmatter from `job:` to `division:` and `function:`.
  - Normalize Product function names to the contract names above.
- `studio/tools/check-catalog.mjs` (new)
  - Load/evaluate `registry.js`.
  - Assert division/function validity, no retired play fields, universal
    function presence per division, and negative invalid-function behavior.

## Affected Behavior Surfaces

Catalog data:
`registry.js` changes from a flat Product-biased rung list to a company catalog
with division-scoped functions and validation.

Studio catalog browser:
`registry.html` changes from "Golden Path Registry" as the whole surface to a
division catalog where Raven and William are derived faces.

Studio Board:
`board.html` continues to track lifecycle stage, but play cards display the new
filing metadata. Board writes remain exactly the same.

Studio landing page:
`studio/index.html` becomes a catalog entry point instead of implying one
universal Product function set.

Play authoring template and active briefs:
New and existing play metadata declare `division` and `function`. The retired
frontmatter key `job:` stops appearing in active play briefs.

No reusable plugin agent, product skill, CLI command, or viewer package behavior
changes in this slice.

## Deterministic Tests And Validation

Add and run:

```bash
node studio/tools/check-catalog.mjs
```

The checker should fail if:

- a catalog play lacks `division` or `function`;
- a play's function is not in its own division's function set;
- a play declares `job`, `face`, `faceAgent`, `agent`, `ownerAgent`, or a
  built-by filing field;
- Product or PlaymakerStudio is missing Operations or Library Operations;
- a deliberate negative fixture such as
  `{ division: 'PlaymakerStudio', function: 'Definition' }` is accepted.

Run syntax and targeted drift checks:

```bash
node --check studio/plays/registry.js
node --check studio/tools/check-catalog.mjs
python3 -m json.tool studio/plays/board-state.json >/tmp/studio-board-state.json
rg "^job:" studio/plays/TEMPLATE-brief.md studio/plays -g "brief.md"
rg "r\\.job|\\bJOBS\\b|eight job|8 jobs|canonical 8" \
  studio/index.html studio/plays/registry.html studio/plays/board.html \
  studio/plays/registry.js studio/plays/TEMPLATE-brief.md
```

Black-box site verification:

```bash
cd studio
python3 site-server.py 8778
```

Then open:

- `http://127.0.0.1:8778/`
- `http://127.0.0.1:8778/plays/registry.html`
- `http://127.0.0.1:8778/plays/board.html`

Verify:

- Product is shown with face Raven and exactly Product's nine functions.
- PlaymakerStudio is shown with face William and exactly its four functions.
- Operations and Library Operations appear in both divisions.
- Frame the Problem reads Product / Insight / Raven.
- A PlaymakerStudio record reads PlaymakerStudio / Production, Proving, or
  Operations / William, never a Product function.
- Board drag and confirm behavior still persists the same `board-state.json`
  shape.

No `packages/ax` CLI behavior changes are planned, so no CLI black-box exit-code
tests are required. No Viewer package changes are planned, so no Viewer unit,
build, or browser validation is required beyond the static Studio site check.

## Eval Impact

No eval-harness rerun is required for this slice because it does not change a
bundled Alexandria plugin skill, agent prompt, CLI behavior, or eval-backed
runtime behavior. It changes the static internal Studio catalog and metadata.

If implementation expands beyond this plan and touches
`packages/alexandria-plugin/skills`, agents, or registered workflow behavior,
rerun the affected skill/workflow evals per `EVALS.md` before merge.

## Risks And Mitigations

Risk: the atomic-card / EL boundary is easy to blur because `org-model.md` says
those plays eventually file under Product / Library Operations, while this issue
says not to move that family here.
Mitigation: do not add the EL chain or move files. If the already-present
`build-atomic-card` registry row remains active, apply only the minimum metadata
normalization needed for the catalog validator and document that family migration
is deferred.

Risk: the face agent could accidentally become a stored play field.
Mitigation: keep `face` only on the division definition and make the checker
reject face-like keys on play records.

Risk: a global function list sneaks in through helper code.
Mitigation: validation must compute allowed functions from the play's division.
The checker should include the negative PlaymakerStudio / Definition fixture.

Risk: old `job:` metadata remains in briefs while the browser looks correct.
Mitigation: include active brief frontmatter in scope and run a targeted `^job:`
search before handoff.

Risk: research pages still contain old "eight jobs" wording and confuse the
catalog contract.
Mitigation: update or relabel any linked live catalog entry points. Treat dated
research/playtest notes as historical unless they are presented as the current
catalog surface.

Risk: seeding PlaymakerStudio with design-spec records may overstate built
status.
Mitigation: label those records as specced/design artifacts and keep lifecycle
stage separate from catalog filing.

## Implementation Steps

1. Add `COMPANY`, `DIVISIONS`, catalog grouping helpers, and validation helpers
   to `studio/plays/registry.js`.
2. Migrate current Product catalog records from `job` to `division: 'Product'`
   plus canonical Product `function`.
3. Add the minimal PlaymakerStudio catalog records for Production, Proving, and
   Operations from existing Studio-owned specs, with honest specced status.
4. Add `studio/tools/check-catalog.mjs` and make it validate both the real
   catalog and a deliberate invalid-function fixture.
5. Rework `registry.html` to render division sections, face-agent headers,
   function groups, and validation errors.
6. Update `board.html` to render division/function/derived-face metadata while
   keeping the existing stage and persistence code unchanged.
7. Update `studio/index.html` so the first catalog surface shows Product/Raven
   and PlaymakerStudio/William, each with its own function set.
8. Update `TEMPLATE-brief.md` and active play brief frontmatter from `job:` to
   `division:` plus `function:`.
9. Run deterministic checks and the static site verification.
10. Do a final targeted search for retired active-surface terms and fix any
    remaining active catalog drift.

## Acceptance Criteria

- Every active catalog play declares `division` and `function`.
- Every function validates against the declaring play's own division function
  set.
- Product appears with face Raven and functions Insight, Strategy, Definition,
  Delivery, Launch, Analytics, Communication, Operations, and Library
  Operations.
- PlaymakerStudio appears with face William and functions Production, Proving,
  Operations, and Library Operations.
- Operations and Library Operations appear under both divisions.
- Existing golden-path plays read as Product / Product function / Raven.
- William's plays are derivable by filtering `division === 'PlaymakerStudio'`;
  Raven's plays are derivable by filtering `division === 'Product'`.
- Face agent is not stored on individual play records.
- The retired active catalog `job` field is gone.
- A PlaymakerStudio play with a Product-only function is rejected by
  validation.

## Deferred Follow-Ups

- Full atomic-card and EL family Library Operations migration.
- Built-by provenance on the Ledger.
- Board work-order cards and per-division/per-function work views.
- William's coin, onboarding, and PlaymakerStudio library population.
- Consolidating old Product role-model research pages into the new catalog
  model.
- Directory-level filing by division/function, if that is ever desired.
