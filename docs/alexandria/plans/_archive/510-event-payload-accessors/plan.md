# Issue 510: Shared Event Payload Accessors

Status: implementation plan, 2026-07-01.

## Header

- Issue: GitHub #510, "One event-payload accessor with a single empty-value convention".
- Goal: replace the duplicated `event.payload` string, string-array, and number readers in
  `packages/ax` with one documented accessor family exported from `state-events.ts`.
- Linked product plan: none separate from the issue body. The issue body is the binding
  product contract for this slice.
- GitHub issue comments reviewed: one Fabro local run link for
  `01KWF146MY1T1AAX4VVN3M6W1T`; it adds no extra technical contract.
- Primary package: `packages/ax`.

## Scope

In scope:

1. Add exported `payloadString`, `payloadStringArray`, and `payloadNumber` helpers in
   `packages/ax/src/domain/state-events.ts`, beside `AlexandriaStateEvent` and the existing
   exported state-event utilities.
2. Document the canonical empty-value convention in doc comments on the helpers:
   missing, non-string, or `""` string values read as `null`; missing or non-array string arrays
   read as `[]`; empty string array entries are dropped; missing, non-number, non-finite, and
   non-safe-integer numbers read as `null`.
3. Delete the private helper copies from:
   - `packages/ax/src/commands/play-answer.ts`
   - `packages/ax/src/commands/studio-operations.ts`
   - `packages/ax/src/commands/play.ts`
   - `packages/ax/src/commands/front-of-house.ts`
   - `packages/ax/src/domain/library-front-of-house.ts`
   - `packages/ax/src/domain/library-confirmation.ts`
   - `packages/ax/src/domain/atomic-cards.ts`
4. Import the shared helpers in those files and migrate call sites to the shared names.
5. Preserve observable command and projection behavior at migrated call sites. Any call site that
   previously relied on the local helper returning `""` must coalesce the shared `null` result to
   `""` at the call site.
6. Add focused deterministic tests for the accessor contract and the affected projections/commands.
7. Add a post-migration search gate proving no private accessor definitions remain outside
   `state-events.ts`.

## Non-Goals

1. Do not change any `*PayloadSchema` in `state-events.ts`.
2. Do not add, remove, or rename any state-event type or payload field.
3. Do not introduce a second generic `Record<string, unknown>` payload-reader family.
4. Do not edit shipped plugin skills, workflows, Viewer code, deploy tooling, or vendored repos.
5. Do not write to `docs/alexandria/library/`.
6. Do not refactor unrelated event projection logic while migrating imports.

## Current Implementation Gap

The same conceptual helper is currently hand-copied with different empty-value contracts:

| Area | Current helper behavior |
| --- | --- |
| `commands/play-answer.ts` | `eventPayloadString` returns `null` for missing, non-string, or `""`. |
| `commands/play.ts` | `payloadString` returns `undefined` for missing, non-string, or `""`. |
| `commands/front-of-house.ts` | `eventPayloadString` returns `""` for missing or non-string and passes `""` through. |
| `commands/studio-operations.ts` | `payloadString(payload, key)` reads a raw record, returns `""`, and is also used for nested row objects. |
| `domain/library-front-of-house.ts` | `payloadString` returns `null`; `payloadStringArray` returns `[]` and filters empty string entries. |
| `domain/library-confirmation.ts` | `eventPayloadString` and `eventPayloadInteger` return `null`. |
| `domain/atomic-cards.ts` | `eventPayloadString`, `eventPayloadStringArray`, and `eventPayloadNumber` return `undefined`; its array reader keeps empty strings and rejects any non-string item. |

This creates a latent correctness problem: a present-but-empty field may be absent, undefined, or
valid empty text depending on which consumer reads it. `state-events.ts` already owns
`AlexandriaStateEvent`, but it does not yet export typed payload accessors.

## Architectural Boundaries

`state-events.ts` owns the shared accessors because they are read-side helpers for
`AlexandriaStateEvent.payload`, not domain-specific projection rules.

Implement the helpers as small, schema-free readers:

```ts
export function payloadString(event: AlexandriaStateEvent, key: string): string | null;
export function payloadStringArray(event: AlexandriaStateEvent, key: string): string[];
export function payloadNumber(event: AlexandriaStateEvent, key: string): number | null;
```

The helpers must not validate event type, allowed values, or payload schemas. They only normalize
the value stored at `event.payload[key]`.

Canonical convention:

1. `payloadString` returns a string only when the payload value is a string with `length > 0`.
   It returns `null` for a missing key, non-string value, or `""`. It should not trim or otherwise
   rewrite non-empty strings.
2. `payloadStringArray` returns `[]` for a missing key or non-array value. For arrays, it keeps only
   string items whose `length > 0` and preserves kept strings verbatim. This matches the existing
   Front-of-House array normalization and avoids trimming user-authored card paths or labels.
3. `payloadNumber` returns a number only when the payload value is a JavaScript number and
   `Number.isSafeInteger(value)` is true. It returns `null` for missing, non-number, non-finite,
   fractional, or unsafe integer values. The helper name is `payloadNumber` to provide one number
   sibling, but the accepted number domain is the current safe-integer domain.

Call-site boundaries:

1. Files that currently return `null` should mostly switch imports and names.
2. Files that currently return `undefined` should use `== null` or `!= null` checks where needed,
   and update local type annotations from `undefined` to `null`.
3. Files that currently return `""` must coalesce before string interpolation, payload writes,
   table cells, or rendered fallback text when that output previously relied on a string.
4. `studio-operations.ts` is the only shape mismatch. Its disposition rows contain persisted
   events and pre-append draft rows, and the old helper is also used for nested `source`,
   `verdict`, and `projection` objects. Use the shared accessor for top-level event payload cells
   through a narrowly named local wrapper that delegates to `payloadString` and coalesces to `""`;
   do not call that wrapper `payloadString`. For nested row objects, use explicit `typeof` reads
   for each nested cell so no second generic payload accessor is introduced.

## Touch Map

| Surface | Files / areas | Planned change |
| --- | --- | --- |
| State event payload accessors | `packages/ax/src/domain/state-events.ts` | Export the three documented helpers. Keep payload schemas unchanged. |
| Play answer banking | `packages/ax/src/commands/play-answer.ts` | Delete `eventPayloadString`; import `payloadString`; preserve `null` checks. |
| Make-a-play review run | `packages/ax/src/commands/play.ts` | Delete local `payloadString`; import shared helper; update `undefined` annotations/checks to `null`-aware checks. |
| Front-of-House command | `packages/ax/src/commands/front-of-house.ts` | Delete `eventPayloadString`; import `payloadString`; coalesce to `""` where existing idempotency keys, payload writes, or rendered fallback text depended on string output. |
| Studio Operations command | `packages/ax/src/commands/studio-operations.ts` | Delete raw-record `payloadString`; import shared helper; keep disposition rows byte-identical with a narrow delegating top-level cell wrapper and explicit nested object reads. |
| Front-of-House domain projections | `packages/ax/src/domain/library-front-of-house.ts` | Delete local `payloadString` and `payloadStringArray`; import shared helpers; keep section confirmations and turn-presentation projections unchanged for valid events. |
| Library confirmation domain | `packages/ax/src/domain/library-confirmation.ts` | Delete `eventPayloadString` and `eventPayloadInteger`; import `payloadString` and `payloadNumber`; keep exact product/path/version matching. |
| Atomic cards domain | `packages/ax/src/domain/atomic-cards.ts` | Delete `eventPayloadString`, `eventPayloadStringArray`, and `eventPayloadNumber`; import shared helpers; update mismatch types and null checks. |
| AX tests | `packages/ax/tests/**` | Add focused tests for the helper contract and affected projections/commands. |

## Affected Behavior Surfaces

| Surface | Behavior shift | Downstream updates |
| --- | --- | --- |
| AX read-side state-event helpers | One documented empty-value convention replaces seven local contracts. | Add unit coverage in AX tests and use imported helpers at all migrated call sites. |
| AX CLI command output | No intended output change. The former `""` helper consumers in Front-of-House and Studio Operations must explicitly coalesce to keep output stable. | Add/keep black-box tests for Front-of-House command output and Studio Operations disposition rows. |
| AX domain projections | No intended valid-event behavior change. Invalid or malformed event payload reads now follow the shared convention. | Add focused projection tests for Front-of-House section confirmations, library confirmation matching, and atomic-card section-summary inputs. |
| Shipped plugin skills/workflows | No prompt or workflow behavior changes. | No plugin edits or plugin validation required for this slice. |
| Viewer | No runtime, API, or browser behavior changes. | No Viewer validation required unless implementation unexpectedly touches Viewer files. |

## Implementation Steps

1. In `state-events.ts`, add the exported helpers after `AlexandriaStateEvent` or near
   `isRecord`, with doc comments that state the empty-value convention. Do not edit any payload
   schemas or schema descriptor helpers.
2. Add or update an AX unit test for the helpers. Cover:
   - `payloadString`: missing key, non-string, `""`, and populated string.
   - `payloadStringArray`: missing key, non-array, mixed entries with an empty string, and a
     populated string array.
   - `payloadNumber`: missing key, non-number, fractional number, unsafe integer, and safe integer.
3. Migrate `play-answer.ts`: import `payloadString`, replace `eventPayloadString(...)` calls, and
   delete the local function.
4. Migrate `play.ts`: import `payloadString`, delete the local function, and adjust `existingLevel`
   or similar local types/checks from `undefined`-oriented handling to `null`-aware handling. Keep
   truthiness-independent comparisons unchanged.
5. Migrate `front-of-house.ts`: import `payloadString`, delete `eventPayloadString`, and audit every
   old call. For string interpolation, idempotency keys, and payload fields that previously received
   `""` from malformed/missing source events, use `payloadString(event, key) ?? ""`. For fallback
   text such as residual reasons, keep the existing observable fallback behavior.
6. Migrate `studio-operations.ts`: import `payloadString`. Replace top-level row cells with a
   narrowly named delegating helper, for example `operationPayloadCell(event, key)`, that returns
   `payloadString(eventLike, key) ?? ""` and exists only to bridge `OperationEventDraft` rows. Replace
   nested `verdict`, `source`, and `projection` string reads with explicit `typeof` checks and `""`
   fallback. Confirm generated `studio/inheritance/dispositions.md` rows remain byte-identical.
7. Migrate `library-front-of-house.ts`: import `payloadString` and `payloadStringArray`, delete both
   local functions, and keep `payloadAgendaItemKind` domain-specific because it validates a local
   enum rather than generic payload typing.
8. Migrate `library-confirmation.ts`: import `payloadString` and `payloadNumber`; replace
   `eventPayloadInteger` calls with `payloadNumber`; keep `criteriaMatchesEvent` exact-match
   behavior.
9. Migrate `atomic-cards.ts`: import all three helpers, delete local functions, and update local
   type annotations from `undefined` to `null` where needed. Keep `??` fallback sites such as card
   path fallback intact. Add targeted tests for `atomicCardSectionSummaryInputForEvent` and
   `latestAtomicCardSectionSummaryInputsByRunAndContextKey`, including empty string entries in
   `cards`/`unknowns` so the new canonical filtering is intentional.
10. Run a definition search and remove any remaining private definitions outside `state-events.ts`.
11. Run the focused AX tests, then package typecheck/lint/format checks.

## Deterministic Verification

Focused test commands:

| Area | Command | Why |
| --- | --- | --- |
| State-event accessor unit coverage | `cd packages/ax && bun test tests/events.test.ts` | Covers the three shared helpers and ensures state-event schema tests still pass. |
| Play answer migration | `cd packages/ax && bun test tests/play-answer.test.ts` | Covers `play answer` request lookup and answer banking. |
| Make-a-play review migration | `cd packages/ax && bun test tests/make-a-play.test.ts tests/ax.integration.test.ts tests/state.test.ts tests/studio-api.test.ts` | Covers review-level and review-gate payload reads that moved from `undefined` to `null`. |
| Front-of-House command/domain migration | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Covers turn/answer/section/residual projections plus `prepare-agenda` and `confirm-section` output. |
| Library confirmation migration | `cd packages/ax && bun test tests/library-confirmation.test.ts tests/library-confirmation-cli.test.ts` | Covers string and safe-integer matching for confirmation/rejection events. |
| Atomic-card migration | `cd packages/ax && bun test tests/cards.test.ts` | Covers section-summary input projection, latest-by-context selection, and number/string reads for audit mismatches. |
| Studio Operations migration | `cd packages/ax && bun test tests/studio-operations.test.ts` | Covers disposition row rendering and generated markdown output from former raw-payload helper callers. |

Post-migration search gates:

```bash
rg -n "function (event)?PayloadString|function payloadString|function payloadStringArray|function eventPayloadInteger|function eventPayloadNumber" packages/ax/src
rg -n "eventPayloadString|eventPayloadStringArray|eventPayloadInteger|eventPayloadNumber" packages/ax/src
```

Expected result: the only `function payloadString`, `function payloadStringArray`, and
`function payloadNumber` definitions are in `packages/ax/src/domain/state-events.ts`; the
`eventPayload*` symbols are gone from `packages/ax/src`.

Package checks:

```bash
cd packages/ax && pnpm run typecheck
cd packages/ax && pnpm run lint
cd packages/ax && pnpm run format:check
```

Run full AX tests if the focused matrix exposes shared-test coupling:

```bash
cd packages/ax && pnpm run test
```

## Eval Impact

No eval-harness coverage is required for the planned slice.

| Surface | Existing coverage | Action |
| --- | --- | --- |
| AX deterministic helper/domain/CLI behavior | Bun tests cover the affected code directly. | Add/update Bun tests listed above. |
| Shipped plugin skills/workflows | No plugin files should change. | No `pnpm eval` rerun required. If implementation unexpectedly edits `packages/alexandria-plugin`, stop and plan the relevant plugin validation/eval separately. |
| Viewer | No Viewer files should change. | No Viewer validation required unless implementation touches Viewer source or API contracts. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The Studio Operations migration accidentally creates a second generic record accessor under a different name. | Keep only a narrow top-level row-cell wrapper that delegates to `state-events.ts`, and use explicit nested-field reads for `verdict`, `source`, and `projection`. |
| Former `""`-returning Front-of-House command paths start writing `null` into idempotency keys, payloads, or rendered output. | Audit every migrated `front-of-house.ts` call and add `?? ""` where the old helper guaranteed a string. Verify with bundle-command tests. |
| Atomic-card malformed array behavior changes unnoticed because the shared array helper returns `[]`. | Add explicit atomic-card tests for section-summary inputs with empty string array entries, and document that valid schema-shaped events remain behaviorally unchanged while empty entries now follow the canonical filter. |
| `payloadNumber` is interpreted as accepting all finite numbers, weakening the current integer convention. | Implement and test `typeof value === "number" && Number.isSafeInteger(value)`. The helper name is generic, but the contract is safe integer. |
| The implementation edits payload schemas while colocating helpers in `state-events.ts`. | Keep schema blocks untouched and rely on `events.test.ts` plus review/search diff to confirm no schema changes. |
| Import churn masks unrelated refactors in large domain files. | Keep edits mechanical and limited to imports, helper deletion, call-site name changes, and required null/string coalescing. |

## Acceptance And Exit Criteria

1. `state-events.ts` exports exactly one `payloadString`, one `payloadStringArray`, and one
   `payloadNumber`.
2. No private `eventPayloadString`, `eventPayloadStringArray`, `eventPayloadInteger`,
   `eventPayloadNumber`, `payloadString`, or `payloadStringArray` definitions remain outside
   `state-events.ts`.
3. The seven issue-listed files import the shared helper family for event payload reads.
4. Helper doc comments state the empty-value convention.
5. Payload schemas and event wire shapes are unchanged.
6. Former `""`-returning call sites preserve observable CLI/table output through explicit
   coalescing.
7. Focused AX tests and package checks listed in Deterministic Verification pass.
8. No plugin, Viewer, docs library, or vendored-repo files are touched.

## Deferred Follow-Ups

1. If future non-event record readers need the same semantics, open a separate issue for a
   differently named record utility. Do not expand this slice beyond `AlexandriaStateEvent.payload`.
2. If additional duplicated payload readers are found outside the seven listed files, file a follow-up
   unless they are the same event-payload family and can be migrated without widening scope.
3. Consider adding a small lint or code-review checklist item for new `event.payload[...]` readers if
   drift recurs.
