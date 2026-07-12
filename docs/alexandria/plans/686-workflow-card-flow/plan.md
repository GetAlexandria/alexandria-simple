# Issue #686 Technical Plan: Workflow Card Flow Projection

Issue: <https://github.com/GetAlexandria/alexandria-internal/issues/686>

Goal: teach the Alexandria library catalog to project Workflow-tab data from
authored aggregate-card `flow:` frontmatter, while preserving
`workflows.json` as the fallback when no card declares `flow:`.

Linked product plan:
[`docs/alexandria/plans/library-migration/plan.md`](../library-migration/plan.md),
section 2.2 (`flow:` contract) and section 3, Slice 4a-code.

GitHub comments checked on 2026-07-08: the issue thread only adds the Fabro
local run link for run `01KX0M85ZEQC546NQJ2D2F72Q6`; it does not add or change
the technical scope.

## Scope

- Add the card-derived workflow projection in `packages/ax`, where the library
  catalog contract already lives.
- Keep the existing `/api/library/catalog` response shape and the
  `LibraryCatalogWorkflow` / `LibraryCatalogWorkflowStep` viewer contract.
- Preserve current `workflows.json` parsing when no card declares `flow:`.
- Make source precedence explicit: any product-card frontmatter `flow:` field
  selects card-flow mode; `workflows.json` is ignored in that mode.
- Report card-flow contract problems through `meta.metadataIssues` without
  crashing catalog load.
- Update `studio/tools/check-workflows.mjs` and its tests so the Studio guard
  validates both the existing sidecar contract and the new card-flow contract
  through the shipped `packages/ax` parser/catalog path.
- Add deterministic unit and black-box API coverage for the issue acceptance
  matrix.

## Non-Goals

- Do not author `flow:` on `docs/alexandria/library/playbook/Entity/Entity -
  Play Run.md` in this slice.
- Do not delete or edit `docs/alexandria/library/workflows.json` in this slice.
- Do not change `WorkflowView`, `WorkflowLensView`, routing, or visual design.
- Do not change `.github/workflows`.
- Do not change plugin play prompts, Back-of-House emit behavior, or shipped
  skills in this issue. Those belong to the later Slice 5 play/skill update.
- Do not implement the Slice 4b thread ledger projection.
- Do not perform product-card v2 identity cleanup beyond what is necessary to
  read `flow:` safely.

## Current Gap

Today `loadLibraryCatalogRoot` reads `workflows.json`, parses it with
`parseLibraryCatalogWorkflows`, merges its `metadataIssues` into the catalog,
and passes `workflows.workflows` into `buildLibraryCatalog`.

`buildLibraryCatalog` only sorts and validates the workflows it is handed. It
does not derive workflows from card frontmatter.

Product-card parsing currently reads frontmatter `flow:` as a string list on
the card record. That supports the existing Pattern/staged-Mechanism staged-loop
convention, for example:

```yaml
flow:
  - Backlog
  - Sourced
  - Designed
```

The new contract is a different shape: an aggregate card owns a list of step
objects and those steps project into `catalog.workflows`.

```yaml
flow:
  - activity: Lease the session connection
    doer: Monitor
    stateAfter: connected
    refs: [Entity - Session, Entity - Connection Lease, Mechanism - Monitor]
```

`WorkflowView` already consumes `catalog.workflows ?? []` and renders an empty
state when there are no workflows. The viewer does not need a rendering change.

`studio/tools/check-workflows.mjs` currently guards only fenced
`library-workflows.v1` JSON examples and committed `workflows.json` files. It
does not validate card-authored `flow:` blocks.

## Architectural Boundaries

- `packages/ax/src/domain/library-catalog.ts` owns the catalog-domain contract:
  parsing card `flow:`, projecting workflows, source precedence, and workflow
  reference validation belong there.
- `packages/ax/src/effects/library-graph-loader.ts` may read sidecar content,
  but it must not decide to merge sidecar and card-derived workflows. The source
  choice should be centralized in the catalog domain so tests and Studio guards
  exercise the same behavior.
- The fallback sidecar parse issues must be attached to `meta.metadataIssues`
  only when fallback mode is selected. In card-flow mode, the sidecar is ignored
  completely, including malformed sidecar content.
- Keep the existing staged-loop card field separate from workflow projection.
  A string-list `flow:` remains `LibraryCatalogCard.flow?: string[]`; an
  object-list `flow:` on an aggregate card derives `LibraryCatalogWorkflow`.
- Do not add a broad YAML dependency for this slice. Follow the existing local
  parser pattern used by `links:` and `risks:`: parse the limited canonical
  frontmatter shape, report off-contract lines as metadata issues, and keep
  loading other cards.
- The viewer boundary remains unchanged. AX must continue emitting the shape the
  viewer already expects, including `step.context`.
- Because authored aggregate-flow steps do not include `context`, derive each
  projected step's `context` from the lifecycle-bearing card's catalog
  `context`.
- `studio/tools/check-workflows.mjs` must not duplicate the card-flow parser.
  It should import the shipped AX catalog parser/build path, as it already does
  for `workflows.json`.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX catalog domain | `packages/ax/src/domain/library-catalog.ts` | Parse object-list card `flow:`, project aggregate-card workflows, select card-flow vs sidecar source, and report card-flow metadata issues. |
| AX catalog loader | `packages/ax/src/effects/library-graph-loader.ts` | Pass sidecar workflows and sidecar parse issues as fallback input so `buildLibraryCatalog` can ignore them when card-flow mode is active. |
| AX domain tests | `packages/ax/src/domain/library-catalog.test.ts` | Cover no-flow fallback, aggregate projection, precedence, invalid altitude, malformed step degradation, dangling refs, duplicate derived workflow ids if applicable, and staged-loop string-list compatibility. |
| AX black-box API tests | `packages/ax/tests/viewer.test.ts` | Cover `/api/library/catalog` fallback behavior against the real library or a fixture root, and precedence behavior through the runtime API. |
| Studio workflow guard | `studio/tools/check-workflows.mjs` | Validate committed card-flow blocks through the shipped AX parser/catalog path while keeping the `workflows.json` check until the file is deleted in 4a-content. |
| Studio guard tests/fixtures | `studio/tools/check-workflows.test.mjs`, `studio/tools/fixtures/workflows/**` | Add accepted and rejected card-flow fixtures matching the parser messages. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Product agents | None. No shipped agent instructions change in this slice. | None. |
| Product skills | None. Back-of-House emit-contract changes are deferred to Slice 5. | None in this PR. |
| Maintainer Studio guard | `check-workflows` begins guarding card-authored `flow:` in addition to sidecars. | Update guard tests and any guard fixture docs in the same slice. |
| Viewer | No behavior or rendering code change. It continues reading `catalog.workflows`. | Existing viewer Workflow tests should remain green; no new view copy or route changes. |

## Detailed Behavior Contract

1. Card-flow detection is based on a top-level `flow:` field in a product-card
   frontmatter block. Detection happens before source selection. If any card
   declares `flow:`, card-flow mode is selected even if the declaring card or
   step is invalid.
2. In card-flow mode, the catalog uses only workflows derived from cards.
   `workflows.json` workflows and `workflows.json` metadata issues are ignored.
3. In fallback mode, when no card declares `flow:`, the current
   `workflows.json` behavior remains unchanged.
4. A workflow-producing `flow:` is valid on `altitude: aggregate` cards. Existing
   staged-loop string-list `flow:` remains valid on Pattern/staged-Mechanism
   cards but does not produce a Workflow-tab workflow.
5. An object-list `flow:` on a non-aggregate, non-Pattern/staged-Mechanism card
   is dropped and reported as a named `metadataIssues` entry for that card.
6. Each valid aggregate card with object-list `flow:` projects one workflow:
   `id` is the card id slugified with lowercase hyphen separators, `unit` is
   the card `prefLabel`, and `steps` are in authored array order.
7. Each valid step projects `order` from the zero-based array index,
   `activity` as required, optional `doer`, optional `stateAfter`, optional
   `refs` as `cardRefs`, and `context` from the owning card's catalog context.
8. Missing `activity`, non-object steps, non-list `refs`, or non-string `refs`
   entries produce card-scoped metadata issues. Invalid steps are dropped; valid
   steps on the same or other cards still load.
9. A card-flow workflow with no valid steps is not emitted and gets a
   card-scoped metadata issue.
10. Dangling `refs` use the existing workflow card-reference validation class:
    the catalog reports an unknown-card metadata issue and keeps the workflow.
11. Sidecar workflow sorting and step sorting stay byte-identical in fallback
    mode. Card-derived step order is already the authored array index, so sorting
    must preserve authored order.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX domain tests | `bun test packages/ax/src/domain/library-catalog.test.ts` | Proves parser/projection/source-precedence behavior without a server. |
| AX runtime/API black-box | `bun test packages/ax/tests/viewer.test.ts` | Proves `/api/library/catalog` exposes the selected workflow source and preserves fallback behavior. |
| Studio guard unit tests | `bun test studio/tools/check-workflows.test.mjs` | Proves the guard reports the same parser metadata issues as AX. |
| Studio guard executable | `bun studio/tools/check-workflows.mjs` | Proves committed workflow sidecars and card-flow blocks pass the guard. |
| Studio aggregate checks | `sh studio/tools/check.sh` | Proves the workflow guard still works inside the full Studio data-check suite. |
| AX story lint | `pnpm --filter @alexandria/ax run lint:library-stories` | Proves catalog story lint still passes against `docs/alexandria/library`. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Proves catalog type changes are sound. |
| Viewer contract safety | `pnpm --filter @alexandria/viewer run test` | Proves existing Workflow consumer tests stay green with the unchanged data shape. |

If implementation unexpectedly touches viewer source, also run
`pnpm --filter @alexandria/viewer run build` and the relevant Playwright smoke
for the Library Workflow route. That should not be necessary for the planned
AX-only rendering contract change.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX catalog projection | Unit and runtime tests, not eval-harness backed. | Add deterministic tests in `library-catalog.test.ts` and `viewer.test.ts`; no eval rerun required. | `bun test packages/ax/src/domain/library-catalog.test.ts`; `bun test packages/ax/tests/viewer.test.ts` |
| Studio `check-workflows` guard | Guard tests, not product eval-harness backed. | Add guard fixtures/tests for card-flow validation; no eval rerun required. | `bun test studio/tools/check-workflows.test.mjs` |
| Product agents/skills | No behavior changes in this slice. | No eval-harness coverage required. Future Slice 5 prompt/skill changes must name their eval reruns. | None for issue #686. |
| Viewer Workflow tab | Existing unit tests cover render/empty states. | Rerun viewer unit tests for contract safety; no new browser/eval case unless viewer code changes. | `pnpm --filter @alexandria/viewer run test` |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Fallback sidecar parse errors leak into `metadataIssues` even when card-flow mode should ignore the sidecar. | Pass sidecar workflows and sidecar issues as fallback data, and attach them only after the catalog domain selects fallback mode. Add a precedence test with malformed or contradictory sidecar content. |
| The new object-list `flow:` is accidentally treated as the old string-list `card.flow`, producing bad card display data. | Parse the raw `flow:` block into a discriminated internal shape and only populate `card.flow` for string-list staged loops. Add a staged-loop compatibility test. |
| The viewer step type requires `context`, but the new authoring contract does not. | Derive projected step `context` from the owning card context and assert it in tests. |
| Invalid card flow suppresses sidecar fallback and makes the Workflow tab empty. | This is the required precedence rule. Make the metadata issue explicit and test the invalid-only case so the empty state is explainable. |
| Studio guard drifts from the runtime parser by adding its own frontmatter parser. | Import and exercise the shipped AX catalog path from `check-workflows.mjs`; keep fixture assertions on AX metadata issue text. |
| Card-flow parsing becomes too permissive and silently reshapes malformed authored content. | Follow the existing card parser pattern: accept the canonical shape, report off-contract step shapes as metadata issues, and drop only malformed steps. |
| The no-flow regression is missed because unit tests bypass `/api/library/catalog`. | Add a black-box runtime API test that fetches the catalog and compares `workflows` to the parsed fallback sidecar output when no card flow exists. |

## Implementation Steps

1. Add focused failing tests in `packages/ax/src/domain/library-catalog.test.ts`
   for the full issue matrix: no-flow fallback, single aggregate flow,
   precedence over sidecar, invalid altitude, malformed step degradation,
   dangling refs, and staged-loop string-list compatibility.
2. Refactor `buildLibraryCatalog` workflow input so fallback sidecar workflows
   and fallback sidecar metadata issues are not pre-merged into general
   metadata issues before source selection.
3. Add a limited raw frontmatter parser for `flow:` blocks in
   `library-catalog.ts`. It should distinguish string-list staged loops from
   object-list workflow steps and should reuse existing value normalization
   helpers where possible.
4. Project valid aggregate object-list flows into `LibraryCatalogWorkflow`
   records with slugified card ids, card `prefLabel` units, zero-based step
   orders, owner-card contexts, optional `doer` / `stateAfter`, and
   `refs` mapped to `cardRefs`.
5. Apply source precedence in `buildLibraryCatalog`: card-flow mode when any
   card declares `flow:`, otherwise fallback sidecar mode.
6. Reuse the existing workflow card-reference validator against the selected
   workflow set.
7. Update `loadLibraryCatalogRoot` to pass sidecar parse results as fallback
   workflow data instead of always merging sidecar metadata issues.
8. Add black-box API coverage in `packages/ax/tests/viewer.test.ts`, including
   the real-library no-flow regression and a fixture root with card flow plus
   contradictory sidecar content.
9. Update `studio/tools/check-workflows.mjs` to collect card-flow sources and
   validate them through the shipped AX catalog parser/build path. Keep the
   existing fenced JSON and committed `workflows.json` checks.
10. Add or update Studio guard fixtures and tests for accepted aggregate flow,
    invalid owner, malformed step, and dangling refs.
11. Run the deterministic verification matrix above and fix only issues inside
    this slice's scope.

## Acceptance / Exit Criteria

1. With the current real library, where no card declares `flow:`,
   `/api/library/catalog` returns a `workflows` field byte-identical to the
   current `workflows.json` fallback projection.
2. Adding a fixture `flow:` block to an aggregate card yields one catalog
   workflow with the slugified card id, card `prefLabel` unit, zero-based
   ordered steps, optional doers, optional states, owner-card step context, and
   `refs` projected as `cardRefs`.
3. Existing `WorkflowView` renders the fixture-derived workflow without source
   changes.
4. When any card declares `flow:`, `workflows.json` workflows and metadata
   issues are ignored; there is no merge.
5. `flow:` on a non-aggregate, non-Pattern/staged-Mechanism card produces a
   named metadata issue and no workflow for that card.
6. Malformed steps produce metadata issues without dropping valid workflows from
   other cards.
7. Dangling `refs` produce the same class of unknown-card workflow metadata
   issue as dangling sidecar `cardRefs`.
8. Existing Pattern/staged-Mechanism string-list `flow:` remains accepted as a
   card field and does not project a Workflow-tab workflow.
9. `studio/tools/check-workflows.mjs` validates both current `workflows.json`
   contracts and new card-flow contracts with parser parity tests.
10. No live content changes land under `docs/alexandria/library` except test
    fixture reads; `workflows.json` remains in place for the follow-up content
    PR.

## Deferred Follow-Ups

1. Slice 4a-content: author the 26-step Play Run `flow:` on
   `Entity - Play Run`, derived from the archived walk record, and delete
   `docs/alexandria/library/workflows.json`.
2. Slice 4b: project threads from ledger events and delete `threads.json`.
3. Slice 5: update Back-of-House/Front-of-House play prompts and shipped plugin
   skills so future bundle emission writes aggregate card `flow:` instead of a
   sidecar.
4. Product-card v2 cleanup: strip retired identity/provenance frontmatter and
   derive identity from path per the library-migration plan.
