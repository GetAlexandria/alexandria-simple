# Issue 501 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#501`
- Goal: make Raven Vision / Basic Product Description replay handle legacy slot
  events explicitly so historic ledgers neither crash nor silently lose authored
  Vision state after the 11-slot to four-slot reshape.
- Plan path:
  `docs/alexandria/plans/501-vision-legacy-slot-events/plan.md`
- Linked product plan: none found. The issue body is the source of truth for
  this slice.
- Run ID: `01KWD650D381NRVKYEZ1Z1N4FG`

## Source Context

Required guidance read:

- `CLAUDE.md` from the prompt
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `EVALS.md`
- `packages/ax/CLAUDE.md`
- `packages/ax/README.md`
- `packages/ax/docs/cli-design-principles.md`

GitHub context:

- The issue body was supplied in the run prompt.
- GitHub issue comments were checked through the connector. The only comment was
  the Fabro local run submission link, with no extra product decision.

Relevant implementation context read:

- `packages/ax/src/domain/raven-vision.ts`
- `packages/ax/src/domain/state-events.ts`
- `packages/ax/src/domain/project-state.ts`
- `packages/ax/src/effects/jsonl-state-store.ts`
- `packages/ax/src/effects/runtime-server.ts`
- `packages/ax/src/effects/runtime-client.ts`
- `packages/ax/src/commands/raven.ts`
- `packages/ax/tests/raven-vision.test.ts`
- `packages/ax/tests/events.test.ts`
- `packages/ax/tests/state.test.ts`
- `packages/ax/tests/cli.test.ts`
- `packages/viewer/src/app/runtime/schemas.ts`
- `packages/viewer/src/components/library/vision/vision-slot-guidance.ts`
- `packages/viewer/src/components/library/vision/VisionOnboardingView.tsx`

Related plans checked:

- `docs/alexandria/plans/444-vision-reshape/plan.md`
- `docs/alexandria/plans/476-library-search-prior/plan.md`
- `docs/alexandria/plans/feat-005-raven-slot-collaboration/plan.md`
- `docs/alexandria/plans/feat-007-bank-vision/plan.md`
- `docs/alexandria/plans/feat-008-knowledge-bank-banked-vision/plan.md`

## Scope

In scope:

1. Read-time handling for historic `raven.vision.slot.updated`,
   `raven.vision.slot.approved`, and `raven.vision.slot.skipped` events whose
   `payload.slotId` is a known retired Vision slot id.
2. An explicit legacy slot id map:
   - fold `shape` into current `the-work`;
   - retire `named-pain`, `discovered-pain`, `shift`, `inadequacy`,
     `felt-experience`, and `proof`.
3. Legacy-aware Vision replay state/projection metadata that records the retired
   slot events instead of losing them.
4. Legacy-aware status computation so a ledger that was `ready_to_bank` under
   the 11-slot model does not quietly project as ordinary `in_progress` after
   replay.
5. Read-time event parsing that accepts known legacy Vision slot ids in existing
   ledger JSONL while keeping supported append/schema behavior current-slot only.
6. Focused deterministic tests for the legacy matrix in the issue: removed slot
   present, `shape` to `the-work`, old-ready no silent downgrade, current-only
   regression, mixed legacy/current, and idempotent replay.
7. Minimal downstream type/schema updates only if required by the chosen
   observable status/projection shape.

## Non-Goals

Out of scope:

1. Reintroducing any retired slot to the current four-slot Basic Product
   Description manifest.
2. Changing current labels, prompts, order, Source of Truth Markdown headings, or
   the `library-search-prior.v1` handoff shape.
3. Rewriting ledger history or adding a stored migration table.
4. Allowing new supported CLI/runtime appends for retired slot ids.
5. Building a guided reconfirmation workflow, Viewer banner, or plugin skill
   behavior for repairing legacy Vision content.
6. Changing Raven drafting or elicitation skill prompts.
7. Writing to `docs/alexandria/library/`.
8. Editing vendored repositories under `repos/`.

## Current Gap

Current implementation:

1. `RAVEN_VISION_SLOT_IDS` is the current four-slot tuple:
   `person`, `mechanism`, `the-work`, and `refusal`.
2. `slotIdFromPayload()` rejects any slot id outside that tuple.
3. `reduceRavenVisionEvents()` filters by event type, then calls
   `reduceRavenVisionState()`. If the per-event reducer returns an `Error`, the
   batch reducer `continue`s.
4. A known `raven.vision.slot.*` event with a retired id therefore follows the
   known event-type path, fails slot validation, and gets dropped by the generic
   error-swallow path.
5. `computeRavenVisionStatus()` only inspects the four current slots. Any
   approved text that lived only in retired slots disappears from readiness.
6. `projectRavenVision()` exposes no signal that retired authored content was
   present.
7. `state-events.ts` also builds the Vision slot payload schemas from
   `RAVEN_VISION_SLOT_IDS`. If read-time parsing remains strict, a historic
   ledger with retired slot ids can fail before the reducer gets a chance to
   handle the legacy event. The fix must cover replay parsing as well as
   reduction.

Issue requirement:

- Known retired slot events must be deterministic replay inputs, not anonymous
  invalid events.
- `shape` content should carry forward to `the-work` if the fold decision
  stands.
- Retired, non-folded content should be tolerated and recorded as legacy, not
  applied to current slots.
- A Vision that was ready under the old model must not silently become plain
  `in_progress`.
- Ledgers containing only the current four slots must reduce as they do today.

## Decision Contract

Implementation should confirm these product decisions before code changes if
they have not already been confirmed by the director:

1. Fold map: `shape -> the-work`.
2. Retired map: `named-pain`, `discovered-pain`, `shift`, `inadequacy`,
   `felt-experience`, and `proof` are recorded as legacy and never applied to a
   current slot.
3. Old readiness model: the legacy 11-slot model is considered
   `ready_to_bank` when all of these ids were reviewed
   (`approved` or `skipped`) and at least one reviewed slot had approved
   non-empty text:
   `person`, `named-pain`, `discovered-pain`, `shift`, `inadequacy`,
   `mechanism`, `shape`, `the-work`, `felt-experience`, `proof`, `refusal`.
4. Observable state: use a top-level Vision status
   `needs_reconfirmation` when replay proves the old 11-slot model was
   `ready_to_bank` but the current four-slot projection would otherwise compute
   as `in_progress`. Also expose legacy projection metadata so the operator can
   see which slot ids caused the state.
5. Clearing path: `needs_reconfirmation` is derived, not stored. If later
   current-slot events make the four-slot model `ready_to_bank`, status becomes
   `ready_to_bank` while legacy metadata remains visible.

If product direction rejects a new top-level status, use an equivalent
projection field such as `legacy.status: "needs_reconfirmation"` and update the
tests to assert the status is observable anywhere `ax inspect state --json`
reports Vision. Do not leave the only signal as plain `in_progress`.

## Architectural Boundaries

- `packages/ax/src/domain/raven-vision.ts` owns the Vision slot manifest, slot
  state machine, legacy fold/retire map, status computation, Source of Truth
  Markdown generation, and projection shape.
- `packages/ax/src/domain/state-events.ts` owns event envelope/payload
  validation and the machine-readable append schema. It should distinguish
  replay tolerance from new append validation rather than widening the supported
  append contract to legacy ids.
- `packages/ax/src/effects/jsonl-state-store.ts` should continue reading the
  ledger through the shared parser. If the parser gains a replay mode, this is
  the path that should use it.
- Runtime and CLI mutation paths should continue accepting only current slot ids.
  New legacy events should not be creatable through `ax raven vision slot ...`
  or `ax inspect events append`.
- Viewer changes, if any, should be limited to decoding/rendering the new
  status string. Do not add a legacy repair flow in this slice.
- Product plugin skills remain unchanged unless a separate guided
  reconfirmation issue is opened.

## Proposed Technical Shape

Add explicit legacy concepts in `raven-vision.ts`:

```ts
export const RAVEN_LEGACY_VISION_SLOT_IDS = [
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "shape",
  "felt-experience",
  "proof",
] as const;

export const RAVEN_LEGACY_VISION_SLOT_FOLD_MAP = {
  shape: "the-work",
} as const;

export const RAVEN_LEGACY_VISION_SLOT_RETIRE_IDS = [
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "felt-experience",
  "proof",
] as const;
```

Recommended projection metadata:

```ts
interface RavenVisionLegacyProjection {
  schemaVersion: 1;
  status: "legacy_present" | "needs_reconfirmation";
  wasReadyToBank: boolean;
  needsReconfirmation: boolean;
  foldedSlotIds: string[];
  retiredSlotIds: string[];
  slots: RavenVisionLegacySlotProjection[];
}
```

The exact TypeScript names can follow local style, but the JSON should make
these facts observable:

- legacy events were present;
- which ids were folded;
- which ids were retired;
- whether the old 11-slot model was ready;
- whether the current projection requires reconfirmation.

For `shape -> the-work`, treat the fold as a backfill, not a destructive
overwrite. If explicit current `the-work` events exist, current-slot authorship
should win. If the current `the-work` slot has no meaningful current content,
an approved or reviewed `shape` slot can populate `the-work` using the same
slot status semantics as a current slot event.

For old banked projects, preserve the banked event. A replayed
`raven.vision.banked` event should be accepted when the state was bankable under
the current model or under the reconstructed legacy 11-slot model at that point.
New runtime banking remains gated on the projected current status being
`ready_to_bank`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Vision domain reducer | `packages/ax/src/domain/raven-vision.ts` | Add legacy slot constants, classify known retired ids before the generic error path, record legacy slots, fold `shape` into `the-work`, compute legacy readiness, and surface `needs_reconfirmation` when old-ready would otherwise become ordinary `in_progress` |
| Vision projection / banking helpers | `packages/ax/src/domain/raven-vision.ts` | Include legacy metadata in `projectRavenVision()` only when legacy events exist; keep Source of Truth Markdown generated from current approved slots only; preserve replayed banked events that were valid under the legacy readiness model |
| Event replay validation | `packages/ax/src/domain/state-events.ts`, possibly `packages/ax/src/effects/jsonl-state-store.ts` | Add a replay-tolerant validation path for known legacy Vision slot ids so historic ledgers load; keep append validation and event schema documents current-slot only |
| Project state JSON | `packages/ax/src/domain/project-state.ts` | No separate derivation expected; `raven.vision` should carry the new projection metadata from `projectRavenVision()` |
| Runtime/CLI output | `packages/ax/src/effects/runtime-server.ts`, `packages/ax/src/commands/raven.ts` | Usually no formatter change beyond the status/projection shape. If `needs_reconfirmation` is top-level status, command JSON and human output should show that string through existing formatting |
| AX tests | `packages/ax/tests/raven-vision.test.ts`, `packages/ax/tests/events.test.ts`, `packages/ax/tests/state.test.ts`, `packages/ax/tests/cli.test.ts` | Add reducer, parser, projection, and black-box inspect coverage for legacy ledgers and current-only regressions |
| Viewer runtime schema, conditional | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/components/library/vision/vision-slot-guidance.ts` | Required only if `needs_reconfirmation` becomes a top-level status returned to Viewer; add the enum literal and label without adding a full legacy UI |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Raven Vision reducer/projection | Known retired slot events become explicit replay inputs with legacy metadata | Deterministic AX tests; no skill eval required |
| AX event append schema | Supported new appends remain current-slot only even though replay accepts legacy ids | Event schema/append tests must prove legacy ids are rejected on append |
| `ax inspect state --json` | May include `raven.vision.status: "needs_reconfirmation"` and/or `raven.vision.legacy` when a legacy ledger is replayed | Add black-box CLI coverage for status, `readyToBank`, and legacy metadata fields |
| Viewer Basic Product Description | No product workflow change. If top-level status changes, Viewer only learns the status label so runtime decoding does not fail | Run focused Viewer unit/build validation only if Viewer files are touched |
| Product plugin skills | No planned change | No plugin validation or eval rerun unless implementation expands scope into skills |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Vision reducer matrix | `cd packages/ax && bun test tests/raven-vision.test.ts` | Proves removed-slot handling, `shape -> the-work`, old-ready no silent downgrade, current-only regression, mixed legacy/current precedence, banked replay preservation, and idempotency |
| Event parser/schema behavior | `cd packages/ax && bun test tests/events.test.ts` | Proves historic replay accepts known legacy slot ids while append/schema behavior still lists and accepts only current slot ids |
| Project state projection | `cd packages/ax && bun test tests/state.test.ts` | Proves `deriveProjectState()` / inspect projection includes observable legacy metadata and preserves normal empty/current Vision output |
| CLI black-box output | `cd packages/ax && bun test tests/cli.test.ts` | Proves `ax inspect state --json` exits `0` and reports the important Vision fields for a legacy ledger fixture |
| Runtime banking regression, if touched | `cd packages/ax && bun test tests/runtime-server.test.ts` | Needed if implementation changes the runtime banking gate or response handling |
| Viewer schema, conditional | `cd packages/viewer && pnpm run test` and `cd packages/viewer && pnpm run build` | Required only if `RuntimeRavenVisionStatusSchema` or status labels change |

No browser validation is required unless implementation adds a visible Viewer
legacy banner or changes Basic Product Description UI behavior beyond decoding a
new status label.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| AX Vision reducer and projection | Deterministic Bun tests cover the reducer, event schema, project state, CLI help/output, and runtime behavior | Add focused deterministic tests; no LLM eval needed | `cd packages/ax && bun test tests/raven-vision.test.ts tests/events.test.ts tests/state.test.ts tests/cli.test.ts` |
| Product Raven skills | Raven skill evals exist for product-facing behavior, but this slice does not change skill prompts or guided drafting logic | No eval rerun required | None |
| Viewer Basic Product Description | Viewer tests cover runtime decode/client behavior; no eval harness coverage applies | Run unit/build only if schema or labels change | `cd packages/viewer && pnpm run test`; `cd packages/viewer && pnpm run build` |
| Contributor planning skill | This plan uses the maintainer skill but does not change it | No eval required for contributor-skill usage | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Replay still fails before the reducer because strict payload validation rejects retired slot ids | Add a replay-tolerant validation path for known legacy Vision slot ids and cover it with event parser/state-store tests |
| Widening the event schema accidentally allows new retired-slot appends | Keep append validation and `ax inspect events schema --json` current-slot only; add a negative append test for `slotId: "shift"` |
| `shape` fold overwrites explicit current `the-work` content in mixed ledgers | Treat `shape` as a backfill; current `the-work` events win. Add mixed legacy/current tests for both event orders if practical |
| Old-ready projects still look like plain `in_progress` to operators | Add top-level `needs_reconfirmation` or equivalent explicit legacy projection state and black-box `ax inspect state --json` coverage |
| A previously banked old Vision loses its `banked` state because the bank event is revalidated against the new model | Accept replayed bank events that were valid under reconstructed legacy readiness; add a reducer regression test |
| Legacy metadata pollutes new projects | Omit the `legacy` field entirely when no known legacy slot events are present; add a current-only deep regression test |
| Source of Truth banking starts including retired sections | Keep `buildRavenSourceOfTruthMarkdown()` manifest-driven over the four current slots; add an assertion that retired slot labels do not appear in generated Markdown |
| The reconfirmation state becomes impossible to clear | Derive `needs_reconfirmation` only when legacy old-ready would otherwise compute current `in_progress`; once current events make the four-slot state ready, top-level status becomes `ready_to_bank` |

## Implementation Steps

1. Confirm the decision contract:
   - `shape -> the-work`;
   - all other removed ids retired;
   - observable state is top-level `needs_reconfirmation` or an equivalent
     explicit legacy projection field.
2. Add legacy slot constants and helpers in
   `packages/ax/src/domain/raven-vision.ts`:
   - `RAVEN_LEGACY_VISION_SLOT_IDS`;
   - fold map;
   - retired id set;
   - old 11-slot readiness id order.
3. Add a legacy slot state/projection model:
   - record latest text/status/review timestamps for folded and retired ids;
   - omit legacy metadata from projections with no legacy events;
   - keep current slot state shape unchanged for current-only ledgers.
4. Refactor slot event reduction enough to route by slot classification:
   - current ids use the existing reducer semantics;
   - `shape` records legacy state and backfills `the-work` only when it will not
     overwrite explicit current `the-work` content;
   - retired ids record legacy state and do not mutate current slots;
   - truly unknown ids still remain invalid for the per-event reducer.
5. Update status computation:
   - compute current four-slot status as today;
   - reconstruct old 11-slot readiness from current plus legacy slot states;
   - emit `needs_reconfirmation` or equivalent explicit legacy status when old
     readiness was true and current readiness would be ordinary `in_progress`;
   - keep `readyToBank` true only for `ready_to_bank`.
6. Preserve historical banking:
   - ensure replayed `raven.vision.banked` can apply when the state was bankable
     under current or reconstructed legacy readiness;
   - keep new runtime banking blocked unless the current projection is
     `ready_to_bank`.
7. Add replay-tolerant event validation:
   - allow known legacy slot ids when parsing existing ledger JSONL;
   - keep `validateAlexandriaStateEvent()` or append-specific validation strict
     for new append requests;
   - keep `ax inspect events schema --json` allowed values current-only.
8. Add reducer tests in `packages/ax/tests/raven-vision.test.ts`:
   - removed retired slot present and recorded;
   - `shape` update/approval reflected in `the-work`;
   - old 11-slot ready with only retired approved text reports
     reconfirmation, not plain `in_progress`;
   - current four-slot ledger matches the previous state/projection;
   - mixed `shape` plus current `the-work` preserves current `the-work`;
   - replaying the same events twice returns equal state;
   - historical bank event remains `banked`.
9. Add event/parser tests in `packages/ax/tests/events.test.ts`:
   - ledger/replay validation accepts a known legacy slot id;
   - append validation rejects the same id and lists current valid ids;
   - event schema document still exposes only the four current ids.
10. Add project-state and CLI black-box tests:
    - derive or inspect a fixture legacy ledger;
    - assert exit code `0`, `readyToBank: false`,
      `status: "needs_reconfirmation"` or equivalent legacy status, and visible
      legacy slot metadata.
11. If top-level `needs_reconfirmation` reaches Viewer runtime payloads, update
    Viewer status schema and label, then run the conditional Viewer validation.
12. Run the deterministic verification commands and record any intentionally
    skipped conditional checks in the implementation handoff.

## Acceptance / Exit Criteria

1. A ledger containing known retired `raven.vision.slot.*` ids replays without
   parse failure, reducer error, or silent anonymous drop.
2. Retired ids are explicitly represented in `raven.vision.legacy` or the
   equivalent projection field.
3. A `shape` update plus approval is reflected in current `the-work` after
   replay when no explicit current `the-work` content should win.
4. Retired ids other than `shape` do not mutate current slots.
5. A ledger that was `ready_to_bank` under the 11-slot model but would otherwise
   become plain four-slot `in_progress` reports an observable
   needs-reconfirmation state.
6. Current-slot-only ledgers produce the same current slots, status, readiness,
   Source of Truth Markdown, and absence of legacy metadata as before.
7. Replaying the same ledger twice yields deep-equal Vision state/projection.
8. Supported append paths still reject retired ids; new projects can only append
   the four current slot ids through supported commands.
9. Historical banked Vision ledgers remain `banked` after replay when their bank
   event was valid under the old readiness model.
10. All required AX tests pass, and Viewer validation passes if Viewer schema or
    labels were touched.

## Deferred Follow-Ups

1. Add a guided Viewer/operator reconfirmation flow if directors need an
   in-product way to review retired content and explicitly accept the four-slot
   projection.
2. Teach Raven product skills how to respond to a needs-reconfirmation Vision
   state if that workflow becomes common.
3. Correct stale examples in `packages/ax/README.md` that still show `shift` as
   a normal slot id, unless implementation chooses to include that small docs
   cleanup in this slice.
4. Consider a generic event-replay diagnostics facility for known schema
   migrations so future derived-state migrations cannot disappear behind
   `continue` without a projection signal.
