# Issue 732: Path-First Card Identity

Status: ready for implementation. Planning pass created 2026-07-08.

Issue:
<https://github.com/GetAlexandria/alexandria-internal/issues/732>

Product-plan input:
`docs/alexandria/plans/library-migration/plan.md`, section 2.2, Slice
4e-code. That product plan is read-only input for this issue-specific plan.

## Goal

Finish the code side of the 2026-07-08 card identity ruling:

- product-card identity comes from the path first;
- frontmatter `type`, `prefLabel`, and `context` stay readable as legacy
  compatibility input;
- frontmatter identity disagreement becomes a named `metadataIssues` entry;
- reserved card-bearing context names, starting with `runtime`, become
  mechanical catalog issues instead of silent loader skips;
- `Type - Name` stems are globally unique because wikilinks resolve by stem.

The current real library must still load through `/api/library/catalog` with
the same card count and no metadata issues. The current verified baseline is
`cardCount: 133` and `metadataIssues: []`.

## Sources Read

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- GitHub Issue #732 and its comments. The only issue comment is the Fabro run
  link.
- `docs/alexandria/plans/library-migration/plan.md`
- `packages/ax/CLAUDE.md`
- `packages/ax/README.md`
- `packages/viewer/README.md`
- `packages/pms/CLAUDE.md`
- `packages/library-card-resolver/README.md`
- `EVALS.md`
- Existing implementation and tests around:
  - `packages/ax/src/domain/library-catalog.ts`
  - `packages/ax/src/domain/library-catalog.test.ts`
  - `packages/ax/src/effects/library-graph-loader.ts`
  - `packages/ax/src/effects/runtime-server.ts`
  - `packages/ax/tests/runtime-server.test.ts`
  - `packages/library-card-resolver/src/index.ts`
  - `studio/tools/check-workflows.mjs`
  - `studio/tools/check-threads.mjs`
  - `studio/tools/check.sh`

## Scope

In scope:

- AX product-card catalog parsing and validation.
- Runtime API behavior for `GET /api/library/catalog`.
- Studio deterministic guard coverage that imports the shipped AX catalog
  parser, matching the `check-workflows` and `check-threads` discipline.
- Unit and black-box tests for the new identity lints and the real-library
  zero-issue regression.

Out of scope:

- No edits under `docs/alexandria/library/`.
- No `.github/workflows` changes.
- No card content migration or operator strip of legacy frontmatter fields.
- No changes to `rulings:`, `proposed_by:`, or `source_evidence:` handling.
- No plugin prompt, skill, or agent behavior changes.
- No viewer UI feature work. Viewer behavior changes only by receiving the
  catalog metadata already served by AX.

## Product-Plan Summary

The library migration plan rules that one card is addressed by path:
`<context>/<Type>/<Type> - <Name>.md`. The filename stem is what wikilinks
target, and the path already carries context and type, so frontmatter identity
is duplicate state that can drift. The code slice must make path identity the
read-side source of truth while keeping legacy cards readable until the later
4e-content operator strip removes legacy fields from the files.

The plan also blesses `_index` as the reserved keystone context and rejects
`runtime` as a card-bearing context because that name holds operational walk
state. The stranded `Capability - Inspect State` failure mode must become a
catalog lint.

## Current Implementation Gap

`createProductCatalogCardRecord` in
`packages/ax/src/domain/library-catalog.ts` already has some v2 tolerance, but
it still resolves identity in the wrong order:

- `type` prefers frontmatter before the filename type;
- `prefLabel` prefers frontmatter before the filename title;
- `context` prefers frontmatter before the first path segment;
- disagreement between frontmatter and path identity is not reported;
- duplicate stems are not checked globally;
- the loader currently treats `runtime/` as operational and skips it before the
  catalog builder can report a reserved-context issue.

The real-library regression currently passes with `cardCount: 133` and
`metadataIssues: []`. The known v2-frontmatter exception is
`docs/alexandria/library/_index/Concept - Learning.md`: it has no `type`,
`prefLabel`, or `context` frontmatter, and it must remain silent.

## Contract Clarification

Issue #732 contains one wording tension: the title says legacy identity fields
become lint-flagged, but the acceptance criteria require matching legacy
frontmatter to flag nothing. This implementation should follow the acceptance
criteria:

- matching frontmatter identity fields do not emit a metadata issue;
- missing frontmatter identity fields do not emit a metadata issue when the
  path supplies identity;
- mismatched frontmatter identity fields do emit a metadata issue;
- the later 4e-content slice owns removing the matching legacy fields from
  real cards.

## Architectural Boundaries

- AX owns catalog construction and runtime API behavior.
- The viewer should not duplicate identity validation. It consumes
  `meta.metadataIssues` from AX through the existing runtime API.
- PMS should not import AX internals. The requested `studio/tools` guard is a
  repo-maintainer data guard, not PMS product code.
- `@alexandria/library-card-resolver` is the shared resolver for wikilink label
  behavior. Duplicate-stem detection should mirror resolver normalization
  rather than inventing a different notion of equality.
- The existing operational runtime skip in `library-graph-loader` must not hide
  card-shaped files under a reserved context from the catalog lint. Operational
  reports and empty-library runtime artifacts still need their existing
  skip behavior where they are not card files.

## Touch Map

Likely implementation files:

- `packages/ax/src/domain/library-catalog.ts`
  - add exported issue-prefix constants for the new named metadata issues;
  - add a path identity helper for product cards;
  - invert identity resolution to path first, then frontmatter fallback;
  - compare legacy frontmatter identity fields against path identity;
  - add reserved context and duplicate-stem validations.
- `packages/ax/src/effects/library-graph-loader.ts`
  - refine the blanket `runtime/` skip so card-shaped reserved-context paths
    can reach catalog validation while operational artifacts remain skipped.
- `packages/ax/src/domain/library-catalog.test.ts`
  - cover path-first resolution, matching legacy frontmatter, mismatch,
    reserved context, duplicate stem, fallback for non-shaped filenames, and
    the `_index/Concept - Learning.md` v2-frontmatter case;
  - keep or update the real-library zero-issue regression at `cardCount: 133`.
- `packages/ax/tests/runtime-server.test.ts`
  - add or extend a black-box `/api/library/catalog` test that fetches a
    real-library copy and asserts `meta.cardCount === 133` and
    `meta.metadataIssues === []`.
- `studio/tools/check-library-identity.mjs` or an equivalent extension to an
  existing guard.
- `studio/tools/check-library-identity.test.mjs`.
- `studio/tools/fixtures/library-identity/**`.
- `studio/tools/check.sh`
  - run the new guard and its test.

Do not touch:

- `docs/alexandria/library/**`
- `.github/workflows/**`
- `packages/alexandria-plugin/**`
- `packages/viewer/**`, unless implementation discovers a failing client
  schema test caused by an already served field shape. No viewer behavior
  change is intended.

## Behavior Surfaces

Catalog domain:

- `LibraryCatalogCard.type`, `prefLabel`, and `context` project from path
  identity whenever a path-shaped filename is present.
- Legacy frontmatter stays readable for compatibility and fallback.
- New identity violations appear in `catalog.meta.metadataIssues`; they do not
  throw and do not turn the whole catalog response into an HTTP error.

Runtime API:

- `GET /api/library/catalog` returns the same catalog shape and status codes.
- New identity issues are visible in `meta.metadataIssues`.
- The real repository library still returns `cardCount: 133` and zero issues.

Studio tools:

- A deterministic guard exercises the shipped AX parser against identity
  fixtures and the real library.
- `studio/tools/check.sh` runs that guard.

Reusable agents, skills, and templates:

- No behavior changes in this slice.

## Implementation Steps

1. Add identity issue constants in `library-catalog.ts`.

   Suggested prefixes:

   - `Library card identity mismatch`
   - `Reserved library context`
   - `Duplicate library card stem`

   Export the constants so tests and the Studio guard can assert stable names
   without brittle full-string duplication.

2. Add a product-card path identity helper.

   It should compute, from the POSIX path relative to the library root:

   - `relativePath`
   - `context` from the first segment;
   - `type` and `prefLabel` from a `Type - Name` filename stem;
   - the raw `stem`;
   - whether the path is the regular shape
     `<context>/<Type>/<Type - Name>.md`;
   - whether the path is the blessed `_index/<Type - Name>.md` shape.

   `_index` must be allowed as a context without a middle type directory.
   Regular card paths should use the filename stem as the identity source and
   may cross-check the middle type directory when present. If implementation
   reports a directory-type mismatch, keep it as a metadata issue, not a crash,
   and add a focused test.

3. Invert identity resolution in `createProductCatalogCardRecord`.

   For path-shaped product cards:

   - `type` comes from path identity first;
   - `prefLabel` comes from path identity first;
   - `context` comes from path identity first;
   - frontmatter identity fields are only compatibility inputs and mismatch
     checks.

   For non-`Type - Name` filename stems, preserve existing compatibility
   behavior: frontmatter identity can still load the card, and existing path
   fallback behavior should not become noisier.

4. Add legacy frontmatter mismatch reporting.

   When both path identity and a frontmatter identity field exist and the
   trimmed values differ, append one metadata issue naming the field, the
   frontmatter value, the path value, and the card path. Required cases:

   - `type: Concept` on `Entity - X.md` reports a mismatch;
   - matching `type: Entity` reports nothing;
   - no `type`, `prefLabel`, or `context` frontmatter reports nothing when the
     path supplies identity.

   Apply the same comparison pattern to `prefLabel` and `context`; the test
   matrix must include `type` because the issue names that exact example.

5. Add reserved context validation.

   Treat `runtime` as a reserved card-bearing context. A card at
   `runtime/Entity/Entity - X.md` must produce a named metadata issue that
   includes the card path and the rule. `_index` is explicitly allowed.

   Avoid silently skipping card-shaped reserved-context markdown before the
   catalog builder runs. Preserve existing skips for operational reports and
   empty-library runtime artifacts that are not card files.

6. Add duplicate-stem validation.

   In `buildLibraryCatalog`, after records are built for a product-card root,
   group path-shaped cards by their filename stem using resolver-compatible
   normalization from `@alexandria/library-card-resolver`. For every group with
   more than one distinct relative path, append a duplicate-stem metadata issue
   for each card in the group. The issue should name the stem and all colliding
   relative paths.

   Required fixture: both
   `alpha/Entity/Entity - Same.md` and
   `beta/Entity/Entity - Same.md` are flagged.

7. Add AX tests.

   Required unit tests in `library-catalog.test.ts`:

   - path identity beats disagreeing frontmatter while emitting mismatch;
   - matching legacy frontmatter emits no issue;
   - non-shaped filename with only frontmatter identity preserves existing
     behavior;
   - `runtime/Entity/Entity - X.md` emits the reserved-context issue;
   - duplicate stems across contexts flag both cards;
   - `_index/Concept - Learning.md` style v2 frontmatter with no identity
     fields emits no issue;
   - the real library still has `cardCount: 133` and `metadataIssues: []`.

8. Add or extend a runtime-server test.

   Prefer a black-box test that copies `docs/alexandria/library` into a temp
   initialized project, starts the API server, fetches
   `/api/library/catalog`, and asserts:

   - HTTP 200;
   - `catalog.meta.cardCount === 133`;
   - `catalog.meta.metadataIssues === []`.

   If the existing runtime test helpers make this expensive, keep the direct
   loader real-library regression and document the reason in the test comment,
   but the acceptance target is the live API surface.

9. Add the Studio guard.

   Preferred shape:

   - create `studio/tools/check-library-identity.mjs`;
   - import `buildLibraryCatalog` and `PRODUCT_CARD_SCHEMA_VERSION` from the
     shipped AX source;
   - collect markdown files deterministically like `check-workflows.mjs`;
   - validate fixture roots under `studio/tools/fixtures/library-identity`;
   - validate the real `docs/alexandria/library` root;
   - fail with parser metadata issue messages, not a second hand-written
     validator contract.

   Add `studio/tools/check-library-identity.test.mjs` with fixture assertions
   for:

   - reserved `runtime`;
   - duplicate stems;
   - identity mismatch;
   - matching frontmatter;
   - v2 frontmatter with no identity fields.

   Add the guard and test to `studio/tools/check.sh`.

10. Keep formatting and imports consistent.

    Use existing TypeScript style in AX. Keep Studio guard files consistent
    with the existing `.mjs` guard style.

## Deterministic Tests And Validation

Targeted tests during implementation:

```bash
bun test packages/ax/src/domain/library-catalog.test.ts
bun test packages/ax/tests/runtime-server.test.ts --test-name-pattern "library/catalog"
bun test studio/tools/check-library-identity.test.mjs
bun studio/tools/check-library-identity.mjs
sh studio/tools/check.sh
```

Full validation before handoff:

```bash
pnpm test
pnpm --filter @alexandria/ax run typecheck
pnpm --filter @alexandria/ax run lint
pnpm --filter @alexandria/ax run format:check
sh studio/tools/check.sh
```

Manual/API acceptance check:

```bash
pnpm ax start server
curl -fsS "http://127.0.0.1:4321/api/library/catalog" | jq '.meta'
```

The expected real-library meta remains:

```json
{
  "cardCount": 133,
  "metadataIssues": []
}
```

Use the actual port printed by `ax start server` if `4321` is unavailable.

## Eval Impact

No eval-harness rerun is required for this slice. The change is deterministic
AX catalog validation plus maintainer Studio guards; it does not change
product-facing agents, skills, workflows, or plugin prompts.

If implementation unexpectedly touches `packages/alexandria-plugin/**` or
product skill files, stop and update this plan before proceeding. The relevant
evals would then need to be named from `EVALS.md`.

## Risks And Mitigations

Risk: presence-only legacy frontmatter warnings would fail the real-library
zero-issue acceptance criteria.

Mitigation: implement mismatch-only metadata issues in this slice. Matching
frontmatter and absent identity frontmatter must be silent.

Risk: the existing `runtime/` operational skip hides the reserved-context
fixture before validation can see it.

Mitigation: split operational artifact skipping from card-shaped markdown
collection. Card-shaped reserved-context files must reach the catalog builder
and receive a metadata issue.

Risk: `_index` keystone cards look different from the regular
`<context>/<Type>/<Type - Name>.md` shape and could be falsely flagged.

Mitigation: encode `_index/<Type - Name>.md` as a blessed path shape and test
the real `Concept - Learning` v2-frontmatter case.

Risk: duplicate-stem detection could disagree with wikilink resolution.

Mitigation: use the shared resolver normalization primitives from
`@alexandria/library-card-resolver` when grouping stems.

Risk: changing identity order could alter card IDs or link resolution.

Mitigation: keep `id` as the filename stem, add focused tests for path-first
projection, and run existing story/link/workflow tests.

Risk: the Studio guard could become a second catalog validator.

Mitigation: import the shipped AX parser and assert its `metadataIssues`, the
same way `check-workflows.mjs` and `check-threads.mjs` do.

## Acceptance Criteria

- Real `/api/library/catalog` for this repository's library returns HTTP 200,
  `cardCount: 133`, and `metadataIssues: []`.
- A fixture at `runtime/Entity/Entity - X.md` yields a reserved-context
  metadata issue naming the card and the rule.
- Fixtures at `alpha/Entity/Entity - Same.md` and
  `beta/Entity/Entity - Same.md` both receive duplicate-stem metadata issues.
- A fixture with frontmatter `type: Concept` on path `Entity - X.md` emits an
  identity mismatch; matching `type: Entity` emits no issue.
- `_index/Concept - Learning.md` style v2 frontmatter with no `type`,
  `prefLabel`, or `context` field emits no identity issue.
- Studio guard covers reserved context, duplicate stem, mismatch, matching
  frontmatter, v2-frontmatter-silent, and the real-library zero-issue
  regression.
- Full validation passes with no `.github/workflows` changes and no
  `docs/alexandria/library` edits.

## Deferred Follow-Ups

- 4e-content operator strip removes matching legacy frontmatter identity fields
  from real cards.
- If the team wants presence-only legacy-field warnings after the strip, do it
  as a separate ruling and test update so it cannot break this slice's
  zero-issue acceptance criteria.
- A future write-path rename play should continue to handle stem changes by
  rewriting inbound wikilinks and emitting the appropriate ledger event. This
  slice only validates read-side catalog identity.
