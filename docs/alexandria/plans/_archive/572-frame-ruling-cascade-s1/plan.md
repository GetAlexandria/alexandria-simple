# Issue #572 - Frame-Ruling Cascade S1: `containerMapping` Fan-out

Issue: https://github.com/GetAlexandria/alexandria-internal/issues/572

Goal: make a Front-of-House frame ruling durable as a structured
`containerMapping`, then have AX deterministically derive whole-container
`set.context` card updates into the draft patch log. This is slice S1 only:
mapping in, mechanical fan-out, no agenda re-projection.

Linked product plan:
`docs/alexandria/plans/frame-ruling-cascade/plan.md` on branch
`danversfleury/frame-ruling-cascade-plan`, sections 4.1-4.2 and slice S1.
The linked plan is read-only input for this issue. This handoff plan lives in a
separate per-issue directory so later cascade issues do not overwrite the
product/design plan.

Issue comments checked: the only comment records Fabro local run
`01KWHWX9CTJVB49FKNJK0HPQDK`.

## Linked Product-Plan Summary

The product plan's S1 contract is:

1. A resolved Front-of-House frame patch may include `containerMapping`.
2. Mapping dispositions are the closed set `keep`, `rename`, `merge`, `demote`,
   and `hold`.
3. The planner may enumerate container-level dispositions, but must not
   enumerate card membership at frame altitude.
4. AX enumerates cards from the bundle filesystem and derives `set.context`
   updates for every card in `rename` and `merge` source containers.
5. `demote`, `hold`, `keep`, and unlisted containers derive zero card updates.
   `demote` must not touch card `status`.
6. Derived updates land in the durable draft log, not in base bundle cards.
7. The slice does not change agenda projection, staging, `stage-next`,
   keystone drafting, or the Viewer Drafts surface.

## Scope

This slice lands:

1. Optional `containerMapping` support on resolved Front-of-House patch entries.
2. Syntactic validation for mapping entries: object shape, closed disposition
   set, duplicate `from`, required `to` for `rename` and `merge`, and no `to`
   for `keep`, `demote`, or `hold`.
3. Bundle-aware semantic validation before any mutation: unknown source
   container and dangling `merge` target fail with named errors.
4. Mechanical fan-out from mapping to ordinary `cardUpdates`:
   - `rename` sets every source-container card's `context` to the renamed
     target.
   - `merge` sets every source-container card's `context` to the surviving
     target.
   - `demote`, `hold`, and `keep` derive no updates.
5. Durable log behavior: append the canonical frame patch with the original
   `containerMapping` retained for audit and the AX-derived `cardUpdates`
   included for replay.
6. Idempotent re-apply through the existing patch id and event idempotency
   machinery.
7. Prompt updates so `plan_bundle_patch.md` can emit `containerMapping` for
   frame-origin rulings while preserving the ban on planner-authored per-card
   membership guesses.
8. Deterministic AX tests plus Front-of-House prompt/eval-contract updates.

## Non-Goals

1. No agenda re-projection, item retargeting, or auto-resolution. That is S2
   / issue #573.
2. No keystone draft, keystone approval gate, or base-bank path. That is S3.
3. No Viewer Drafts rendering of empty rulings or map deltas. That is S4.
4. No ruling-aware agenda triage or generalized "answered by prior ruling"
   judgment pass. That is S5.
5. No Back-of-House scanner changes.
6. No writes to `docs/alexandria/library/`.
7. No edits under `repos/`.
8. No seeding of the absent live log
   `studio/drafts/alexandria-product/patches.json`; tests should use temp
   fixtures.

## Current Gap

Current behavior in this checkout:

1. `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
   explicitly says not to invent a container rename event, patch type, or
   schema field. When membership is unsafe, the planner writes an empty patch.
2. `FrontOfHousePatch` in
   `packages/ax/src/domain/library-front-of-house.ts` has only
   `cardUpdates`; unknown top-level fields are not part of the typed result and
   are not rendered back out.
3. `parseFrontOfHousePatchLog` and `renderFrontOfHousePatchLog` preserve only
   parsed `cardUpdates`. A log entry with a future `containerMapping` would not
   replay fan-out unless AX had already materialized card updates.
4. `applyFrontOfHousePatch` validates the answer event and applies only
   authored `cardUpdates` to in-memory card content.
5. `apply-patch --draft-log` appends the canonical patch and leaves bundle
   cards frozen, but it does not derive updates from container-level rulings.
6. `applyLibraryDraftOverlay` replays the draft log by applying ordinary
   `cardUpdates`; this should remain true after S1.
7. The named Alexandria product sweep exists at
   `docs/alexandria/sweeps/alexandria-product/`; the live draft log path named
   by the issue is absent in this checkout, matching the Alexandria Drafts
   plan's note.

Result: the live 8->5 frame ruling can bank as
`library.front_of_house.answer_recorded` and produce
`patch-frame-search-space` with `cardUpdates: []`, but no durable card-level
draft effects are created.

## Architectural Boundaries

1. The plugin owns guided play behavior and prompt contracts. It may teach the
   planner to emit a structured mapping at the frame gate, but it must not ask
   the planner to list affected cards.
2. AX owns deterministic filesystem enumeration, validation, fan-out, idempotent
   logging, and CLI output.
3. The draft log remains the replay boundary. The log entry should preserve the
   human-readable mapping and store derived `cardUpdates` so the overlay does
   not need to re-enumerate the bundle later.
4. The base bundle must not be written for mapped frame patches. If a
   `containerMapping` patch is applied without a usable `--draft-log`, fail with
   a named error before event, log, manifest, or card writes.
5. Mapping validation should use the resolved bundle's base catalog, loaded from
   the bundle path, not an overlay-mutated view and not planner-provided card
   membership.
6. Context comparison is by existing Front-of-House context identity rules
   (`canonicalFrontOfHouseContextKey`). Derived `set.context` values should be
   deterministic and sorted by card path.
7. Mapping-less patches must keep current behavior, including the existing
   bundle-write path for callers that do not pass `--draft-log`.

## Contract Details For Implementation

Add these public domain shapes in `library-front-of-house.ts`:

```ts
export const FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITIONS = [
  "keep",
  "rename",
  "merge",
  "demote",
  "hold",
] as const;

export type FrontOfHouseContainerMappingDisposition =
  (typeof FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITIONS)[number];

export interface FrontOfHouseContainerMappingEntry {
  from: string;
  disposition: FrontOfHouseContainerMappingDisposition;
  to: string | null;
  basis: string;
}
```

Extend `FrontOfHousePatch` with:

```ts
containerMapping?: FrontOfHouseContainerMappingEntry[];
```

Validation and derivation:

1. `from` and non-null `to` are compared by canonical context key.
2. A listed `from` must match at least one base bundle card context. The library
   index context is not a source container.
3. The same canonical `from` may appear only once.
4. `rename` requires a non-empty `to`. A rename target may be new; this entry
   creates it for the mapping.
5. `merge` requires a non-empty `to`. The target must be an existing base
   container or one of the rename targets created by the same mapping.
6. `keep`, `demote`, and `hold` must have `to: null` or an omitted/null value
   after parsing normalization.
7. Unlisted source containers are treated as `keep`.
8. Derived `cardUpdates` are ordinary `FrontOfHouseCardUpdate` values with only:

   ```json
   {"cardPath": "<relative card path>", "set": {"context": "<target>"}}
   ```

9. Derived updates are sorted by relative card path, then appended to any
   existing `cardUpdates` only after duplicate resolved-card validation. The
   prompt should keep mapped frame patches' authored `cardUpdates` empty.
10. Named errors should include stable prefixes:
    - `FrontOfHouseContainerMappingUnknownSource`
    - `FrontOfHouseContainerMappingDuplicateSource`
    - `FrontOfHouseContainerMappingDanglingTarget`
    - `FrontOfHouseContainerMappingRequiresDraftLog`

If implementation also rejects invalid disposition shape or target shape with
dedicated names, keep those names similarly stable and cover them with focused
unit tests.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX patch schema and parser | `packages/ax/src/domain/library-front-of-house.ts` | Parse, normalize, validate syntactic mapping shape, preserve `containerMapping` through patch-log render, and keep mapping-less patches byte-compatible at the API level. |
| AX mapping fan-out | `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/commands/front-of-house.ts` | Load the bundle catalog, validate mapping against real containers, derive whole-container `set.context` updates, compute touched paths/content hash from the expanded patch, and reject mapped patches without `--draft-log`. |
| Draft log append/replay | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/src/domain/library-draft-overlay.ts` | Append expanded patches to `patches.json`; retain `containerMapping` for audit; continue replaying only logged `cardUpdates` in the overlay. |
| CLI output and exit behavior | `packages/ax/src/commands/front-of-house.ts` | Existing output remains for mapping-less patches. Mapped patches report derived `touchedCardPaths`, existing draft-log fields, and named validation errors on stderr with no partial writes. |
| Front-of-House workflow prompt | `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`, `replan_bundle_patch.md` if needed | Permit `containerMapping` only for frame-origin product-map rulings, require ambiguity as `hold`, forbid per-card enumeration, and state that `demote` never sets card status. |
| Front-of-House eval contracts | `packages/ax/tests/eval-cases/front-of-house-walk/headline-opener-contract/config.json` and possibly sibling structural configs | Update structural prompt checks from the old empty-card-update fallback to the new mapping contract. |
| Tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, `packages/ax/src/domain/library-draft-overlay.test.ts` | Cover parser, fan-out, draft-log idempotency, validation negatives, replay provenance, no status demotion, and mapping-less regression. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| `front-of-house-walk` workflow patch planner | The frame patch planner gains a structured container-level vocabulary. For frame-origin rulings, it emits `containerMapping` and leaves card membership to AX. | Update `plan_bundle_patch.md`; keep `replan_bundle_patch.md` aligned through its "same shape and rules" reference or add a direct mapping reminder if tests need it. Run plugin validation and Front-of-House structural evals. |
| `front-of-house-walk` Raven skill | No director-facing behavior change is required in S1. Raven still asks one product-map ruling and sends the agreed answer through `ax raven answer`. | No `SKILL.md` edit expected unless implementation discovers the skill currently contradicts the prompt. If edited, rerun the same eval family. |
| AX deterministic CLI | `apply-patch` and `apply-patch-step` mechanically derive draft updates for mapped frame patches. | Add black-box tests for stdout/stderr, exit codes, important JSON fields, idempotency, and no base-bundle writes. |

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX domain patch tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Covers parser, mapping validation helpers, rename/merge/demote/hold derivation, and mapping-less regression. |
| AX draft overlay tests | `cd packages/ax && bun test src/domain/library-draft-overlay.test.ts` | Proves a log entry retaining `containerMapping` replays through ordinary derived `cardUpdates` and carries draft trail provenance. |
| AX black-box Front-of-House CLI | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Covers `apply-patch` / `apply-patch-step` JSON output, exit codes, named validation errors, durable draft log, idempotent re-apply, and frozen bundle files. |
| Focused AX suite | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts src/domain/library-draft-overlay.test.ts` | Fast implementation gate for the changed deterministic surfaces. |
| Plugin package validation | `claude plugin validate ./packages/alexandria-plugin` | Required because shipped workflow prompt text changes. |
| Markdown / repo lint if available | `pnpm lint` or the repo's focused markdownlint command for changed markdown | Ensures the new plan/prompt/eval markdown and JSON stay repo-conformant. Use the narrower existing command if full lint is too broad. |

The black-box CLI tests should assert at least:

1. `rename` from a fixture container writes one draft-log patch whose
   `cardUpdates` contain all N source cards with `set.context` equal to the
   target and whose top-level `answerEventId` is the ruling event id.
2. `merge` into an existing container fans out to the surviving name.
3. `merge` into a target created by a same-mapping `rename` validates and fans
   out to the renamed target.
4. `demote` and `hold` derive zero updates and leave affected source card
   `status` bytes unchanged.
5. Unknown `from`, duplicate `from`, and dangling `merge` target fail with
   named errors, exit non-zero for `apply-patch`, and leave draft log, ledger,
   manifest, and bundle files untouched.
6. Applying the same mapped patch twice leaves the draft log equivalent:
   second run reports existing idempotent status and does not duplicate derived
   updates.
7. A patch without `containerMapping` produces exactly the current draft-log
   and bundle-write behavior.
8. A mapped patch without `--draft-log` fails before any base card write.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| Front-of-House workflow prompt | Structural eval case `front-of-house-walk/headline-opener-contract` currently checks the old prompt fallback: `cardUpdates[].set.context`, empty `cardUpdates`, and unresolved fallback. | Update the case to check `containerMapping`, closed dispositions, ambiguity as `hold`, "AX enumerates cards", and the continued ban on planner card membership enumeration. | `pnpm eval -- run front-of-house-walk/all` |
| Front-of-House skill | Structural cases exist for headline opener, drift reconciliation, section comprehension, and out-of-scope suspect behavior. No director-facing skill change is planned. | Rerun the family because a shipped workflow prompt changes in the same play package. Add a new eval case only if prompt changes cannot be covered by the existing headline-opener structural config. | `pnpm eval -- run front-of-house-walk/all` |
| AX deterministic fan-out | No eval harness coverage is needed for deterministic CLI mechanics; use Bun black-box tests instead. | No new eval case for AX fan-out. | Covered by `bun test` commands above. |

If the current branch's eval harness is still limited, record the attempted
command and rely on the updated structural config plus deterministic tests as
the merge gate.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| The planner starts enumerating card membership again under the new schema. | Prompt says `containerMapping` is frame-level only and AX enumerates cards. Eval checks for the wording. Deterministic tests do not rely on planner-authored membership. |
| `demote` is accidentally treated as deprecation and changes card status. | Prompt states demotion off the map is not status deprecation. Domain and CLI tests assert demote/hold derive zero updates and card status bytes are unchanged. |
| Draft overlay behavior diverges if it re-derives mapping from a changed bundle. | Log the derived `cardUpdates` at apply time. Overlay replays only logged updates and treats `containerMapping` as audit metadata. |
| Target validation mishandles merge into a renamed target because validation runs entry-by-entry. | Build the full initial context set and rename-target set before validating merge targets. Add explicit merge-into-renamed-target coverage. |
| Idempotency breaks because fan-out order depends on filesystem traversal order. | Sort derived updates by relative card path before hashing/logging. Re-apply test asserts equivalent log and existing event status. |
| Mapping validation accidentally changes ordinary patch behavior. | Keep mapping logic behind `containerMapping != null`; add mapping-less regression tests for both draft-log and bundle-write paths. |
| A mapped patch without a draft log writes base bundle cards. | Add an early `FrontOfHouseContainerMappingRequiresDraftLog` failure before applying updates. Black-box test asserts no card, manifest, log, or ledger mutation. |
| Validation errors append a patch-applied event before failing. | Run all parse, answer-event, draft-log, and mapping validations before appendEvent or writeTextAtomic. Negative tests check ledger and draft-log bytes. |
| Live specimen paths tempt implementation to mutate standing product data. | Use temp fixtures for automated tests. If using `docs/alexandria/sweeps/alexandria-product/` manually, copy it first and verify `git status --short docs/alexandria/sweeps/alexandria-product` stays empty. |

## Implementation Steps

1. Add `FrontOfHouseContainerMappingDisposition` and
   `FrontOfHouseContainerMappingEntry` types plus parse helpers in
   `library-front-of-house.ts`.
2. Extend `FrontOfHousePatch` and `parsePatchObject` to preserve optional
   `containerMapping`, normalize syntactic fields, and report duplicate `from`
   with `FrontOfHouseContainerMappingDuplicateSource`.
3. Add a domain helper, for example
   `deriveFrontOfHouseContainerMappingCardUpdates`, that accepts base catalog
   cards plus a mapping and returns either sorted derived updates or a named
   `Error`.
4. In `applyFrontOfHousePatchCore`, after parsing and answer-event validation,
   detect `patch.containerMapping`. If present, require a non-empty resolved
   draft log path before deriving any updates.
5. Load the base bundle catalog with the existing bundle-root path
   (`loadLibraryCatalogRoot(bundle, bundle)` as used by agenda projection),
   derive mapping updates, and build an expanded canonical patch retaining
   `containerMapping` and including derived `cardUpdates`.
6. Run `applyFrontOfHousePatch` against the expanded patch so content hash,
   `touchedCardPaths`, duplicate resolved path checks, and frontmatter
   validation stay on the existing path.
7. Append the expanded canonical patch to the draft log. Keep the existing
   patch-id idempotency rule so re-apply reports `already_logged` and does not
   duplicate entries.
8. Ensure `renderFrontOfHousePatchLog` serializes `containerMapping` when
   present and existing logs without the field render unchanged.
9. Keep `applyLibraryDraftOverlay` replaying `cardUpdates`; add only the small
   adjustments needed for TypeScript compatibility and audit preservation.
10. Update `plan_bundle_patch.md` with the frame-only `containerMapping` JSON
    shape, disposition rules, and planner guardrails. Let `replan_bundle_patch.md`
    inherit that shape, or add a direct sentence if the eval needs a stable
    string.
11. Update `front-of-house-walk/headline-opener-contract/config.json` structural
    checks from the old empty-update fallback to the new mapping contract.
12. Add/extend Bun tests in the domain, black-box CLI, and overlay test files.
13. Run the deterministic verification and eval/plugin validation commands
    listed above.

## Acceptance / Exit Criteria

1. A frame patch renaming a fixture container appends derived `set.context`
   updates for every card in that container to the draft log, with the ruling
   `answerEventId` preserved on the patch and visible in draft trail
   provenance.
2. `demote` and `hold` mappings append no derived updates and do not change card
   `status`.
3. `merge` into an existing container and `merge` into a target created by a
   same-mapping `rename` both validate and fan out to the surviving target.
4. Unknown source, duplicate source, and dangling target failures surface named
   errors and leave draft log, ledger, manifest, and bundle files unchanged.
5. Re-applying the same mapped patch twice leaves the durable draft log
   equivalent and reports the existing idempotent status.
6. Mapping-less patches behave exactly as they do before this issue.
7. Base bundle files are never written for a mapped patch; temp-fixture hash
   tests prove it, and live product bundle `git status` remains clean if a
   manual smoke is performed.
8. The Front-of-House planner prompt emits `containerMapping` for frame rulings,
   keeps per-card enumeration forbidden, and treats ambiguity as `hold`.
9. No agenda, `stage-next`, keystone, Viewer, or base-library behavior changes
   land in this slice.

## Deferred Follow-Ups

1. S2 / issue #573: agenda re-projection and deterministic auto-resolution of
   items settled by the frame ruling.
2. S3: keystone draft overlay artifact and director approval gate.
3. S4: Viewer Drafts rendering of zero-card patches, map deltas, and future
   keystone drafts.
4. S5: ruling-aware agenda triage that can classify remaining items as
   unaffected, answered, or reframed with machine-attributable provenance.
5. A future live-specimen regression can use a copied
   `docs/alexandria/sweeps/alexandria-product/` bundle and a temp
   `studio/drafts/alexandria-product/patches.json` after S1 lands, but this
   issue should not create or commit that live draft log.
