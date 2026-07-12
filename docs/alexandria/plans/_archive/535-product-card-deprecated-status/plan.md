# Issue 535 Technical Plan: Product-Card Deprecated Status

Issue: GitHub `#535`, "Front-of-House patch: a director demotion ruling must
be expressible (add `deprecated` to the product card status set)"
Date: 2026-07-01
Status: Ready for implementation

## Goal

Add `deprecated` as a first-class product-card lifecycle status so a
Front-of-House director demotion ruling can be represented by the existing
bundle-patch contract:

```text
stub | confirmed | deprecated
```

The same catalog-owned status set must drive product-card parsing and
Front-of-House patch validation. `deprecated` is a persisted card lifecycle
value: the card stays in the bundle and library, and no deletion or stripping
path is introduced.

Linked product plan: none separate from the issue body. The issue text and its
acceptance criteria are the product contract for this slice.

## Scope

In scope:

- Extend the catalog-owned product-card status vocabulary in
  `packages/ax/src/domain/library-catalog.ts` from `stub | confirmed` to
  `stub | confirmed | deprecated`.
- Preserve the existing `ProductCardStatus` type derivation from the status
  value tuple.
- Let the Front-of-House patch parser in
  `packages/ax/src/domain/library-front-of-house.ts` accept `deprecated`
  wherever it currently accepts `stub` and `confirmed`, using the same imported
  status tuple.
- Keep existing closed-set normalization behavior: patch input and frontmatter
  case variants are canonicalized to lowercase values.
- Update the Front-of-House patch-planning prompt at
  `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
  to state that the only legal `cardUpdates[].set.status` values are
  `stub`, `confirmed`, and `deprecated`.
- Add deterministic tests for accepted demotion patches, rejected unknown
  statuses, idempotent patch replay, catalog parsing of deprecated cards, and
  unchanged `stub`/`confirmed` behavior.
- Add viewer decode/render smoke coverage proving a catalog payload containing
  `status: deprecated` does not crash the empty-library and related catalog
  surfaces.

## Non-Goals

- Do not add lifecycle values other than `deprecated`.
- Do not add patch fields, patch types, or a deletion/removal workflow.
- Do not mass-edit existing product cards or re-status existing fixtures except
  narrow test fixtures created for this issue.
- Do not create dedicated viewer UI treatment for deprecated cards in this
  slice.
- Do not change relationship replacement semantics, path validation,
  small-floor required-field checks, patch event schema, or patch idempotency
  key format.
- Do not write to `docs/alexandria/library/`.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `packages/alexandria-plugin/CLAUDE.md` and `packages/alexandria-plugin/README.md`.
- `packages/viewer/README.md`.
- Issue body for GitHub `#535` as supplied in the task prompt.
- Attempted GitHub comment lookup:
  `gh issue view 535 --repo GetAlexandria/alexandria-internal --comments ...`,
  but `gh` is not installed in this environment. No additional issue comments
  were available locally.
- Related plans:
  - `docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md`
  - `docs/alexandria/plans/514-foh-read-path-efficiency/plan.md`
  - `docs/alexandria/plans/front-of-house-walk-reshape/plan.md`
  - `docs/alexandria/plans/front-of-house-handshake/plan.md`
- Current implementation:
  - `packages/ax/src/domain/library-catalog.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/domain/state-events.ts`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
  - `packages/viewer/src/app/runtime/schemas.ts`
  - `packages/viewer/src/components/library/EmptyLibraryView.tsx`
  - `packages/viewer/src/components/library/engine-view-model.ts`
- Current tests:
  - `packages/ax/src/domain/library-catalog.test.ts`
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - `packages/ax/src/domain/library-draft-overlay.test.ts`
  - `packages/viewer/src/app/runtime/client.test.ts`
  - `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`
  - `packages/viewer/src/components/library/engine-view-model.test.ts`
  - `packages/viewer/tests/library-browser.spec.ts`

## Product Contract Summary

The Front-of-House walk asks directors to rule on hot spots whose honest ruling
can be demotion. The observed dogfood run wrote the natural patch:

```json
{
  "set": {
    "status": "deprecated"
  }
}
```

`ax internal front-of-house apply-patch` rejected it because
`PRODUCT_CARD_STATUS_VALUES` currently contains only `stub` and `confirmed`.
That rejection killed the walk even though the planner represented the
director's ruling accurately.

The requested contract is:

- `deprecated` is a valid persisted product-card status.
- Front-of-House patch validation accepts it through the existing
  `cardUpdates[].set.status` field.
- Unknown statuses, for example `retired`, still fail with the existing
  "is not one of ..." diagnostic, now listing all three allowed values.
- The prompt names the complete legal set so the planner does not invent values.
- Catalog parsing and viewer runtime surfaces treat deprecated cards as known
  data and do not crash.

## Current Gap

`packages/ax/src/domain/library-catalog.ts` defines:

```ts
export const PRODUCT_CARD_STATUS_VALUES = ["stub", "confirmed"] as const;
export type ProductCardStatus = (typeof PRODUCT_CARD_STATUS_VALUES)[number];
```

The product-card parser validates frontmatter `status` with that tuple and
emits diagnostics like:

```text
Invalid card invalid/Ready Status.md: status "ready" is not one of stub, confirmed
```

`packages/ax/src/domain/library-front-of-house.ts` imports
`PRODUCT_CARD_STATUS_VALUES` and uses it in `CLOSED_SET_FIELD_VALUES.status`.
The patch parser normalizes status values to lowercase and rejects unknowns
with diagnostics like:

```text
cardUpdates[0].set.status "banked" is not one of stub, confirmed.
```

`applyFrontOfHousePatch` already keeps mutations staged until validation and
answer provenance checks pass, and `runFrontOfHouseApplyPatch` appends the
`library.front_of_house.bundle_patch_applied` event with idempotency key
`foh:patch:${playRunId}:${patch.patchId}`. Valid replay currently returns
`already_appended` and preserves byte-identical card content.

The Front-of-House patch-planning prompt says `status` is patchable but does
not enumerate legal values. That leaves the planner to infer or invent a value
when the director demotes a card.

Viewer catalog card schemas currently decode card `status` as `Schema.String`,
so no viewer schema enum expansion appears necessary. The issue still requires
test coverage that a deprecated card flows through catalog decode/render paths
without a crash.

## Architectural Boundaries

- `packages/ax/src/domain/library-catalog.ts` remains the source of truth for
  product-card lifecycle statuses. Do not copy the status list into
  Front-of-House or viewer code.
- `packages/ax/src/domain/library-front-of-house.ts` remains the deterministic
  patch-contract validator. It should inherit the new value by importing the
  catalog tuple, not by adding a local exception.
- `packages/ax/src/commands/front-of-house.ts` should not need command-shape or
  event-shape changes. Existing stdout/stderr split and exit code `2` for
  invalid patches must remain stable.
- The plugin owns guided play behavior. Prompt wording changes belong in the
  shipped `front-of-house-walk` workflow prompt, and plugin validation must run.
- Viewer should stay tolerant of catalog card statuses as strings for this
  slice. Do not introduce UI filtering, hiding, badges, or special styling for
  deprecated cards unless a focused test exposes an actual crash.
- Existing `stub` and `confirmed` parsing, normalization, patch application, and
  tests remain valid. This slice extends the set; it does not reinterpret older
  values.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Product-card catalog status set | `packages/ax/src/domain/library-catalog.ts` | Add `deprecated` to `PRODUCT_CARD_STATUS_VALUES`; derived `ProductCardStatus` widens automatically. |
| Catalog parser tests | `packages/ax/src/domain/library-catalog.test.ts` | Prove `status: deprecated` parses into a catalog card; update invalid-status diagnostics to list `stub, confirmed, deprecated`; keep `stub` and `confirmed` regression coverage. |
| FoH patch parser and applier | `packages/ax/src/domain/library-front-of-house.ts` | Accept `cardUpdates[].set.status: deprecated` through the existing closed-set path; no new field or patch type. |
| FoH domain and patch-log tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/src/domain/library-draft-overlay.test.ts` | Add accepted deprecated patch coverage and update invalid-status expectations to list all three values. |
| FoH black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Prove `apply-patch` writes `status: deprecated`, rejects an unknown status with exit `2`, and replays a demotion patch idempotently. |
| FoH patch-planning prompt | `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | State verbatim that `cardUpdates[].set.status` may only be `stub`, `confirmed`, or `deprecated`; direct demotion rulings to `deprecated`. |
| Viewer decode/render smoke | `packages/viewer/src/app/runtime/client.test.ts`, `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`, optionally `packages/viewer/tests/library-browser.spec.ts` | Confirm catalog payloads containing `status: deprecated` decode and render without dedicated UI treatment or crashes. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house apply-patch` | Existing `set.status` accepts one additional catalog-owned value: `deprecated`. Unknown statuses still fail before writes/events with exit code `2`. | Add black-box CLI coverage for success, rejection, stdout/stderr, card bytes, ledger event count, and replay idempotency. |
| Product-card catalog parsing | `status: deprecated` is now valid product-card frontmatter. | Add catalog parser coverage and update invalid-status expected diagnostics. |
| `front-of-house-walk` ACP patch planner | The prompt now tells the planner the exact legal `set.status` values and how to encode a demotion ruling. | Run plugin validation and front-of-house eval validation if the current eval harness supports the case. |
| Viewer empty-library/catalog surfaces | No intended product behavior change; deprecated remains an ordinary card status string. | Add decode/render smoke coverage and run targeted viewer unit/build/browser validation if viewer files or fixtures change. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX catalog and FoH domain tests | `pnpm --filter @alexandria/ax test -- src/domain/library-catalog.test.ts tests/library-front-of-house.test.ts src/domain/library-draft-overlay.test.ts` | Verifies catalog parsing, closed-set diagnostics, patch parser acceptance, patch-log behavior, and unchanged `stub`/`confirmed` behavior. |
| AX black-box FoH CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Verifies `apply-patch` exit codes, stderr/stdout, card frontmatter writes, ledger append behavior, and idempotent replay through the real command path. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Guards status type widening and imports. |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches style/import regressions in changed AX files. |
| Plugin validation | `pnpm --filter @alexandria/plugin run validate` | Required because the shipped workflow prompt changes. |
| Markdown lint for changed prose | `pnpm run lint:markdown` or `markdownlint-cli2 docs/alexandria/plans/535-product-card-deprecated-status/plan.md packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | Verifies the new plan and prompt wording meet repo markdown rules. |
| Viewer unit validation | `pnpm --filter @alexandria/viewer run test` | Verifies viewer runtime decode and component smoke tests after adding deprecated-status fixture coverage. |
| Viewer build/check validation | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Confirms no TypeScript/Astro build regression if viewer tests or fixtures are touched. |
| Viewer browser validation, conditional | `pnpm --filter @alexandria/viewer run test:e2e -- tests/library-browser.spec.ts` | Run if implementation changes viewer fixtures or browser assertions for the empty-library/catalog surface. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `front-of-house-walk` prompt behavior | Existing eval case metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/`, including `headline-opener-contract` and `section-comprehension-contract`. The current `EVALS.md` notes that `pnpm eval` is presently wired to the EL5 atomic-card substitute runner, so front-of-house eval execution may not be available in this branch. | Inspect `pnpm eval -- list`. If the front-of-house cases are runnable, rerun them after the prompt change. If not runnable, document that limitation in implementation closeout and rely on plugin validation plus deterministic prompt/CLI tests for this slice. | Preferred: `pnpm eval -- run front-of-house-walk/all`. Fallback: `pnpm eval -- list`, then document unsupported Front-of-House eval execution. |
| `ax internal front-of-house apply-patch` deterministic CLI behavior | Covered by Bun domain and black-box CLI tests. | No LLM eval-harness case is required for the parser/apply change itself. | Use the deterministic AX test commands above. |
| Viewer catalog rendering | Covered by viewer unit/browser tests, not LLM evals. | No eval-harness coverage required. | Use viewer validation commands above. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Status vocabulary drifts because a local Front-of-House list is updated separately. | Change only `PRODUCT_CARD_STATUS_VALUES` in `library-catalog.ts` and keep Front-of-House importing it through `CLOSED_SET_FIELD_VALUES.status`. |
| Unknown-status rejection loses the useful allowed-list diagnostic. | Update expected messages to require `stub, confirmed, deprecated` in both catalog and patch-parser tests. |
| The prompt says demotion is possible but does not name exact legal JSON values. | Add a direct rule in `plan_bundle_patch.md`: `cardUpdates[].set.status` may only be `stub`, `confirmed`, or `deprecated`; use `deprecated` for director demotion. |
| Idempotent replay accidentally rewrites the deprecated card before discovering the ledger event is already appended. | Preserve the existing command flow and add a black-box replay assertion: second apply returns `already_appended`, card bytes match the first apply, and only one `bundle_patch_applied` event exists. |
| Catalog parse accepts `deprecated` but viewer fixtures or view models assume only `stub`/`confirmed`. | Add viewer decode/render smoke coverage with a deprecated-status card and run viewer unit validation; add browser validation if fixture changes reach e2e. |
| Existing `stub` and `confirmed` behavior regresses while adding the new value. | Keep current status normalization assertions and add explicit regression coverage that `Stub` normalizes to `stub` and `confirmed` still parses/applies. |
| A mass fixture update obscures the intended contract change. | Create minimal deprecated-specific fixtures or local copies inside tests; do not re-status existing library cards. |

## Implementation Steps

1. Update `PRODUCT_CARD_STATUS_VALUES` in
   `packages/ax/src/domain/library-catalog.ts` to:

   ```ts
   export const PRODUCT_CARD_STATUS_VALUES = ["stub", "confirmed", "deprecated"] as const;
   ```

   Keep `ProductCardStatus` derived from the tuple.

2. Verify `packages/ax/src/domain/library-front-of-house.ts` still imports and
   uses `PRODUCT_CARD_STATUS_VALUES` in `CLOSED_SET_FIELD_VALUES.status`.
   No local Front-of-House status list should be added.

3. Add or update catalog parser tests in
   `packages/ax/src/domain/library-catalog.test.ts`:
   - Include a product-card fixture with `status: Deprecated` or
     `status: deprecated` and assert the parsed card status is `deprecated`.
   - Preserve current `stub` and `confirmed` assertions.
   - Update invalid-status expectations from `stub, confirmed` to
     `stub, confirmed, deprecated`.

4. Add or update Front-of-House domain tests in
   `packages/ax/tests/library-front-of-house.test.ts`:
   - `parseFrontOfHousePatch` accepts `set: { status: "Deprecated" }` and
     canonicalizes to `deprecated`.
   - `applyFrontOfHouseCardUpdateToContent` or `applyFrontOfHousePatch` writes
     `status: deprecated` in rendered frontmatter.
   - Unknown status `retired` or `banked` still rejects with
     `cardUpdates[0].set.status "<value>" is not one of stub, confirmed, deprecated.`
   - Patch-log parsing records unknown-status entries as invalid while valid
     entries remain parseable.

5. Update `packages/ax/src/domain/library-draft-overlay.test.ts` if existing
   invalid-status expectations mention the old two-value set. Add a narrow
   acceptance assertion there only if draft overlay coverage already exercises
   status application through the shared patch parser.

6. Add or update black-box CLI tests in
   `packages/ax/tests/library-front-of-house-bundle.test.ts`:
   - A resolved patch with `set.status: "deprecated"` exits `0`, emits JSON
     with `status: "appended"`, writes `status: deprecated` into the target
     card frontmatter, refreshes the manifest, and appends one
     `library.front_of_house.bundle_patch_applied` event.
   - Re-running the same patch id exits `0`, returns
     `status: "already_appended"`, preserves the content hash/touched paths,
     leaves card bytes unchanged from the first apply, and does not append a
     second patch-applied event.
   - A patch with `set.status: "retired"` exits `2`, emits no stdout, writes no
     card bytes, appends no event, and reports the three-value allowed list on
     stderr.
   - Existing valid `confirmed` and case-normalized `Confirmed` assertions
     still pass.

7. Update
   `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`:
   - Keep the current patch shape.
   - Add a rule that the only legal `cardUpdates[].set.status` values are
     `stub`, `confirmed`, and `deprecated`.
   - Add one sentence that director demotion rulings should be represented as
     `set.status: "deprecated"`.
   - Do not add product-specific examples beyond the generic Front-of-House
     patch contract already present.

8. Add viewer smoke coverage without introducing deprecated-specific UI:
   - In `packages/viewer/src/app/runtime/client.test.ts`, decode a catalog
     payload whose card has `status: "deprecated"` and assert the status value
     is preserved.
   - In `packages/viewer/src/components/library/EmptyLibraryView.test.tsx`,
     render a catalog copy with one deprecated card and assert the static markup
     still contains the expected catalog view/card test ids.
   - If e2e fixtures are changed, add a browser assertion in
     `packages/viewer/tests/library-browser.spec.ts` using the existing
     fixture mechanism. Otherwise, keep browser validation as a conditional
     command rather than adding new UI behavior.

9. Run the deterministic verification commands. If
   `pnpm eval -- list` shows runnable Front-of-House evals, run
   `pnpm eval -- run front-of-house-walk/all`; otherwise record the eval
   harness limitation in implementation closeout.

## Acceptance / Exit Criteria

1. `PRODUCT_CARD_STATUS_VALUES` is exactly `["stub", "confirmed", "deprecated"]`
   and all status validation paths consume that source.
2. A Front-of-House bundle patch with
   `"set": { "status": "deprecated" }` validates and applies; the card
   frontmatter contains `status: deprecated` afterward.
3. A patch with an unknown status, for example `retired`, is rejected with the
   existing style of diagnostic listing `stub, confirmed, deprecated`.
4. Unknown-status rejection exits `2` through
   `ax internal front-of-house apply-patch --json`, emits no stdout, leaves
   cards and ledger unchanged, and appends no patch-applied event.
5. Reapplying the same successful demotion patch with the same `patchId` keeps
   existing idempotency behavior: `already_appended`, no duplicate event, and no
   card corruption or double-write.
6. Catalog parsing of a product-card bundle containing `status: deprecated`
   succeeds without metadata issues for that status.
7. Catalog parsing still accepts and normalizes existing `stub` and `confirmed`
   statuses.
8. Viewer runtime decode and empty-library/catalog rendering do not crash on a
   deprecated-status card.
9. `plan_bundle_patch.md` names `stub`, `confirmed`, and `deprecated` as the
   only legal `cardUpdates[].set.status` values.
10. Targeted AX tests, plugin validation, markdown lint, and required viewer
    validation pass or any environment limitation is documented in the
    implementation closeout.

## Deferred Follow-Ups

1. Design viewer treatment for deprecated cards only after product direction is
   set. Possible future behavior could include muted styling, filters, or
   demotion notes, but none belongs in this slice.
2. Consider adding a shared exported product-card enum validation helper if
   more modules need to validate authored product-card fields beyond catalog
   parsing and Front-of-House patches.
3. Consider a focused Front-of-House eval case for demotion rulings once the
   general Front-of-House eval runner is restored and supports this workflow.
