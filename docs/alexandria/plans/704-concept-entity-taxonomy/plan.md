# Issue #704: apply the Concept-to-Entity taxonomy ruling

## Header

- Issue: [#704](https://github.com/GetAlexandria/alexandria-internal/issues/704)
- Goal: apply the ruled `Concept -> Entity` rename to the Alexandria product
  library card files, update every inbound reference, and delete this bundle's
  `gaps.json`.
- Linked product plan:
  `docs/alexandria/plans/library-migration/plan.md` section 2.5 and section 3,
  Slice 4c.
- Related completed work: #667/#668 added the backfill command and event schema;
  #669 ran the backfill; #690 moved the Play Run workflow into card `flow:`;
  #697/#720 moved threads to the Ledger; #716 added product-card v2 read
  tolerance for the Learning plane.
- Issue comments checked: #704 says the implementation landed on
  `flight/learning-plane` through merged PR #711, but stayed open until that
  branch reaches `main`. Treat #711 as prior art to reuse or reconcile, not as a
  reason to duplicate the work blindly.

## Scope

This slice is a library-data migration, not a loader rewrite.

- Rename every current v1 product card that carries `type: Concept` to
  `Entity - <Name>.md`.
- Preserve each card's context:
  - `knowledge-organization/Concept/Concept - <Name>.md` moves to
    `knowledge-organization/Entity/Entity - <Name>.md`.
  - `_index/Concept - Alexandria.md` and `_index/Concept - Strategy.md` rename
    in place to `_index/Entity - Alexandria.md` and
    `_index/Entity - Strategy.md`.
  - `viewer/Concept/Concept - AI Colleague.md` moves to
    `viewer/Entity/Entity - AI Colleague.md`.
- Update `type: Concept` to `type: Entity` in the renamed files only.
- Update all references to renamed stems inside `docs/alexandria/library`:
  wikilinks, `links:` frontmatter entries, and `flow:` refs.
- Delete `docs/alexandria/library/gaps.json` after confirming `typeMapping` is
  its only content.
- Keep the optional `gaps.json` / `typeMapping` parser behavior for other
  bundles unchanged.

The current planning checkout has 22 `Concept - *.md` filenames, but only 21 of
them are v1 `type: Concept` cards. The extra file is
`_index/Concept - Learning.md`, a product-card v2 Learning-plane keystone with
no `type:` frontmatter. It is intentionally out of scope for the file rename,
but its outbound links to renamed cards must still change from
`[[Concept - Alexandria]]` / `[[Concept - Strategy]]` to the new Entity stems.

## Non-Goals

- Do not emit new Ledger events. The authorizing `library.taxonomy_ruled` event
  was already backfilled from `gaps.json`.
- Do not hand-edit loader, resolver, Viewer, or CLI behavior for this slice.
- Do not remove `typeMapping` support from `packages/ax` or Viewer code.
- Do not change `.github/workflows`.
- Do not rewrite card body prose except the literal wikilink target substitutions
  needed for renamed cards.
- Do not rename `_index/Concept - Learning.md` in this slice. Its v2 contract
  deliberately uses a Concept-stem keystone/arc page and carries no
  `type: Concept` field.
- Do not sweep historical plans, archived docs, or test fixtures that mention
  `Concept - ...` as fixtures or history unless a deterministic product-catalog
  gate proves they affect the live library.

## Current Gap

The product library still depends on `docs/alexandria/library/gaps.json` to teach
catalog projections that the retired type word `Concept` resolves as `Entity`.
That sidecar currently contains a single `typeMapping` entry:

```json
{
  "from": "Concept",
  "to": "Entity",
  "disposition": "rename",
  "basis": "every type: Concept card in this bundle (Knowledge Organization's self-referential system cards plus the pre-existing whole-product/plane keystones) is an identity-bearing structural noun, not framework drift; Entity is the closest of the ten buckets (cardType is singular in atomic-card-categories.ts; the plural 'Entities' is only the category's display label and never resolves)"
}
```

That ruling is already represented as a backfilled `library.taxonomy_ruled`
event. The remaining gap is that the files themselves still use the old
`Concept` stem and frontmatter type, so deleting `gaps.json` before renaming the
cards would create raw off-taxonomy types and dangling references.

Two counts in the original issue body are stale against the current branch:

- The issue's `127` card catalog count predates the Learning-plane and v2 read
  tolerance work. The planning checkout's live-library file count is `133`.
- The issue's "21 files" estimate is right only when interpreted as
  "21 v1 cards with `type: Concept`"; a filename-only `find` sees the additional
  v2 `_index/Concept - Learning.md` keystone.

Implementation must derive the baseline counts from the target branch after
rebasing, then prove the card count is unchanged and the raw `type: Concept`
census goes to zero.

## Architectural Boundaries

- `docs/alexandria/library` is the only product surface intentionally changed.
  This plan is the approved exception to the usual "do not freehand-edit the
  live library" rule.
- The current parser contract remains: `gaps.json` is optional; when absent,
  extras load with `typeMapping: []` and no metadata issue for absence. Other
  bundles may still carry `gaps.json`.
- Card identity in current v1 rules still requires filename stem and frontmatter
  `type` to agree. Rename the file and update frontmatter in the same commit.
- Use `git mv` for every card rename so Git reports high-similarity renames.
  Keep card bodies otherwise stable to preserve rename detection.
- The Ledger is runtime state and is ignored at `docs/alexandria/ledger/`.
  Verify the taxonomy ruling through `ax inspect events` or the already merged
  #669/#711 evidence; do not try to commit raw `events.jsonl`.
- If landing from #711, reconcile that PR onto the current target branch instead
  of reimplementing from scratch. Preserve #711's accepted Learning-keystone
  exclusion.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Product library cards | `docs/alexandria/library/**/Concept - *.md` with `type: Concept` | 21 v1 cards become Entity-stem cards; context is preserved; frontmatter `type` matches the new stem. |
| Product library references | `docs/alexandria/library/**/*.md` | References to renamed stems resolve directly without `typeMapping`: wikilinks, frontmatter link lists, and Play Run `flow:` refs. |
| Learning v2 keystone | `docs/alexandria/library/_index/Concept - Learning.md` | File stays put, but outbound links to Alexandria and Strategy point at the renamed Entity keystones. |
| Sidecar | `docs/alexandria/library/gaps.json` | Deleted from this bundle because `typeMapping` is its only content and the ruling has been applied to files. |
| AX catalog parser | `packages/ax/src/domain/library-catalog.ts`, `library-catalog-links.ts`, `library-catalog-story.ts` | No code change. Existing tests continue to prove other bundles can still parse and apply `typeMapping`. |
| Viewer | `packages/viewer/src/components/library/*` | No code change. Viewer receives raw Entity card types from the catalog instead of display-resolving Concept through this bundle's mapping. |
| Workflows | `docs/alexandria/library/playbook/Entity/Entity - Play Run.md` | The existing 26-step `flow:` remains, with its Atomic Card Category ref updated to `Entity - Atomic Card Category`. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Shipped agents | None | No agent prompt or manifest update. |
| Shipped skills | None | No plugin skill update and no plugin validation required beyond full repo gates. |
| Maintainer skills | None | This plan uses the technical-planning skill but does not modify it. |
| CLI tools | None | `ax` behavior stays deterministic and unchanged; run catalog/runtime tests as regression coverage only. |
| Viewer behavior | Data-only change | Run Viewer unit/build/browser validation because the user-facing catalog and Workflow tab must still render the live data. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Pre-rename inventory | `find docs/alexandria/library -name 'Concept - *.md' -print` and `rg -n '^type: Concept$' docs/alexandria/library` | Derives the branch's real rename set before moving files. |
| Ruling evidence | `pnpm ax -- inspect events list --type library.taxonomy_ruled --json --limit 10` | Confirms the backfilled ruling exists when runtime state is available. If absent in a fresh worktree, cite #669/#711 and do not synthesize a new event. |
| Rename completeness | `rg -n '^type: Concept$' docs/alexandria/library` should return nothing; `find docs/alexandria/library -type d -name Concept -print` should return nothing. | Proves all v1 Concept cards were migrated and empty Concept directories are gone. |
| Learning exception | `find docs/alexandria/library -name 'Concept - *.md' -print` should return only `_index/Concept - Learning.md` on branches that include the Learning plane. | Keeps the accepted v2 keystone exception visible instead of treating it as drift. |
| Wikilink integrity | `rg -n '\[\[Concept - ' docs/alexandria/library` should return nothing. | Proves body wikilinks target the renamed cards. |
| Structured refs | `rg -n '(^[[:space:]]*- Concept - |refs:.*Concept - )' docs/alexandria/library` should return nothing. | Catches stale frontmatter link entries and `flow:` refs that the wikilink grep cannot see. |
| Story lint | `bun packages/ax/src/tools/library-catalog-story-lint.ts --project-root . --library-root docs/alexandria/library` | Catches orphaned story references and graph/story drift after renames. |
| Machine language | `node studio/tools/check-machine-language.mjs docs/alexandria/library` | Ensures the limited body substitutions did not introduce banned machine prose. |
| Workflow contract | `bun studio/tools/check-workflows.mjs` and `bun test studio/tools/check-workflows.test.mjs` | Proves `Entity - Play Run` still projects one 26-step workflow and the renamed flow ref resolves. |
| Studio data gate | `sh studio/tools/check.sh` | Runs the repo's combined Studio/library data guard, including story lint and machine-language checks. |
| AX focused tests | `pnpm --filter @alexandria/ax exec bun test tests/viewer.test.ts src/domain/library-catalog.test.ts src/domain/library-catalog-links.test.ts src/domain/library-catalog-story.test.ts tests/library-catalog-story-lint.test.ts` | Covers real catalog route expectations, parser regressions, typeMapping support for other bundles, and story derivation. |
| Viewer unit/build | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run build` | Confirms catalog consumers decode and render the changed data. |
| Viewer browser QA | `pnpm --filter @alexandria/viewer run test:e2e` or targeted `packages/viewer/tests/library-browser.spec.ts` if time is constrained | Confirms the Workflow tab and library navigation render in a browser. |
| Full gates | `pnpm run test` and `pnpm run check` | Final repo-level regression pass. |
| Git rename quality | `git status --short` and `git diff --stat --find-renames` | Confirms the card moves are renames, not delete/add churn, and no unrelated files moved. |

For live-route acceptance, start the viewer through the normal runtime path after
implementation and fetch `GET /api/library/catalog`. Verify:

- `meta.cardCount` equals the pre-rename branch baseline.
- `meta.metadataIssues` does not increase; on the current main-line expectation
  it should be zero, but Learning-plane branches may carry known v2 metadata
  issues until their parser work is complete. Do not hide a new dangling-link
  issue behind that known baseline.
- Raw type census has `Concept: 0` and `Entity` increased by the rename count.
- `workflows` contains `entity-play-run` with exactly 26 steps.
- `typeMapping` is empty for this bundle after `gaps.json` is deleted.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| Product agents and shipped skills | No behavior changes | No eval-harness rerun required | None |
| Maintainer planning workflow | This plan only | No eval-harness rerun required | None |
| Deterministic catalog/runtime behavior | Bun tests and Studio gates cover it | Run deterministic tests and live-route QA | Commands in the verification table |

No `pnpm eval` run is required because this slice changes checked-in product
library data only. It does not modify reusable plugin skills, agents, or
eval-backed behavior.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| The implementation blindly follows stale issue counts and renames the v2 Learning keystone. | Build the rename list from `rg '^type: Concept$'`, not filename count alone; keep `_index/Concept - Learning.md` as the explicit exception. |
| A frontmatter link or `flow:` ref remains as `Concept - ...` while wikilink grep passes. | Run the structured-ref grep and `check-workflows.mjs`; inspect `Entity - Play Run` specifically. |
| Body prose is rewritten beyond target substitutions, reducing rename similarity and changing card meaning. | Use targeted stem substitutions for `[[Concept - X]]` only; review `git diff --find-renames` and body hunks. |
| Deleting `gaps.json` accidentally removes parser coverage for other bundles. | Do not edit parser code; run catalog/link tests that retain synthetic `typeMapping` fixtures. |
| Known Learning-plane metadata issues obscure a new rename regression. | Compare before/after metadata issue lists, not only total count, on branches where the baseline is nonzero. |
| The local runtime is stale after rebasing or cherry-picking. | Restart `ax start viewer` before live-route QA, per the library-migration execution-log lesson. |
| Git reports delete/add pairs instead of renames. | Use `git mv` and avoid body edits beyond required references and `type:` fields. |

## Implementation Steps

1. Rebase onto the target branch and check whether #711 is already present. If
   it is available as an integration-branch commit, prefer cherry-picking or
   reconciling that exact implementation.
2. Record the branch baseline:
   - card count from `find docs/alexandria/library -type f -name '*.md' -print`
   - v1 Concept cards from `rg -l '^type: Concept$' docs/alexandria/library`
   - existing metadata issues and workflow step count from the live catalog or
     `loadLibraryCatalogRoot` tests.
3. Verify `docs/alexandria/library/gaps.json` contains only the single
   `typeMapping` entry shown above.
4. Build the rename manifest from files that have `type: Concept`. On the
   current branch this is:
   - `_index/Concept - Alexandria.md`
   - `_index/Concept - Strategy.md`
   - `knowledge-organization/Concept/Concept - Altitude.md`
   - `knowledge-organization/Concept/Concept - Atomic Card Category.md`
   - `knowledge-organization/Concept/Concept - Capabilities.md`
   - `knowledge-organization/Concept/Concept - Company.md`
   - `knowledge-organization/Concept/Concept - Context.md`
   - `knowledge-organization/Concept/Concept - Domain.md`
   - `knowledge-organization/Concept/Concept - Economy.md`
   - `knowledge-organization/Concept/Concept - Entities.md`
   - `knowledge-organization/Concept/Concept - Knowledge Organization.md`
   - `knowledge-organization/Concept/Concept - Library.md`
   - `knowledge-organization/Concept/Concept - Mechanisms.md`
   - `knowledge-organization/Concept/Concept - Patterns.md`
   - `knowledge-organization/Concept/Concept - Plane.md`
   - `knowledge-organization/Concept/Concept - Rationale.md`
   - `knowledge-organization/Concept/Concept - Research.md`
   - `knowledge-organization/Concept/Concept - Roles.md`
   - `knowledge-organization/Concept/Concept - Surfaces.md`
   - `knowledge-organization/Concept/Concept - Type.md`
   - `viewer/Concept/Concept - AI Colleague.md`
5. Create any needed `Entity` directories, then use `git mv` for each file.
   Remove empty `Concept` directories after the moves.
6. In the renamed files only, change frontmatter `type: Concept` to
   `type: Entity`.
7. Replace references to each renamed stem throughout `docs/alexandria/library`:
   frontmatter `links:` values, body wikilink targets, and `flow:` refs. Include
   links inside `_index/Concept - Learning.md`, even though that file itself is
   not renamed.
8. Delete `docs/alexandria/library/gaps.json`.
9. Run the negative greps and focused data gates. Fix only stale references or
   migration-caused metadata issues.
10. Run focused AX and Viewer tests, then full gates.
11. Start/restart the runtime and verify `GET /api/library/catalog` on the real
    repo with the acceptance checks above.
12. Review `git diff --find-renames` and keep the commit scoped to card renames,
    reference updates, and `gaps.json` deletion. Do not include `.github`
    changes.

## Acceptance / Exit Criteria

1. All v1 cards that had `type: Concept` are renamed to Entity stems and have
   `type: Entity`.
2. On Learning-plane branches,
   `find docs/alexandria/library -name 'Concept - *.md' -print` returns only
   `_index/Concept - Learning.md`; on branches without the Learning plane it
   returns nothing.
3. `find docs/alexandria/library -type d -name Concept -print` returns nothing.
4. `rg -n '^type: Concept$' docs/alexandria/library` returns nothing.
5. `rg -n '\[\[Concept - ' docs/alexandria/library` returns nothing.
6. No `links:` entry or `flow:` ref under `docs/alexandria/library` still points
   at `Concept - ...`.
7. `docs/alexandria/library/gaps.json` is deleted.
8. `GET /api/library/catalog` keeps the branch's pre-rename `cardCount`, has no
   new metadata issues or dangling links, reports raw `Concept` type count `0`,
   and reports `Entity` increased by the number of renamed v1 cards.
9. The Workflow tab still renders `entity-play-run` with 26 steps.
10. Parser behavior for other bundles remains covered by existing
    `typeMapping` tests; no loader code is changed.
11. Git reports the moved cards as renames with high similarity.
12. Story lint, machine-language, workflow checks, focused AX/Viewer tests, and
    full repo gates pass or have only documented pre-existing failures that are
    proven unchanged by before/after comparison.

## Deferred Follow-Ups

1. Product-card v2/frontmatter cleanup remains Slice 4e: strip identity fields,
   remove `rulings:`/`proposed_by:`, rename `source_evidence:` to `evidence:`,
   and enforce path identity.
2. Drafts / `library.json` / `patches.json` retirement remains Slice 4d.
3. Learning-plane v2 parser surfacing and any remaining metadata baselines stay
   with the Learning-plane follow-up issues, not this taxonomy rename.
4. Historical plan prose that names old Concept stems can be swept later only if
   it is still active documentation and not archive/history.
