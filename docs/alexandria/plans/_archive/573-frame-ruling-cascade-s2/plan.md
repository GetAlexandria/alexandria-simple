# Issue #573 - Frame-Ruling Cascade S2: Agenda Re-Projection and Auto-Resolution

Issue: https://github.com/GetAlexandria/alexandria-internal/issues/573

Goal: when a resolved Front-of-House frame patch carries a
`containerMapping`, the existing patch-apply step also re-projects the
prepared walk agenda. Items in renamed or merged containers stage under the
surviving container labels, items in demoted containers are recorded as
process-authored residual settlements with frame-ruling provenance, and held
or kept containers behave as they do today.

Linked product plan:
`docs/alexandria/plans/frame-ruling-cascade/plan.md`, section 4.4 and slice S2.
The linked feature plan is read-only input. This technical handoff lives in a
separate per-issue directory so it does not overwrite the shared cascade plan.

Issue comments checked:

1. Post-#589 builder orientation: consume the exported
   `resolveFrontOfHouseContainerMapping` in
   `packages/ax/src/domain/library-front-of-house.ts`; it is the canonical
   vocabulary and validation source for per-container dispositions. Do not
   re-implement mapping semantics.
2. Fabro local run submitted:
   `01KWJAY7RE31NBY6Z4SJRD18ZQ`.

## Linked Product-Plan Summary

The product plan's S2 contract is:

1. S1 already accepts `containerMapping` and fans out `rename` / `merge` to
   ordinary draft-log `cardUpdates`.
2. S2 stays in the same `apply-patch` / `apply-patch-step` workflow. It does
   not add a new command surface or require a separate user action.
3. The cascade is projection, not judgment. AX deterministically replays the
   director-authorized mapping; it does not infer extra structure.
4. `rename` and `merge` retarget agenda items from source containers to the
   surviving container.
5. `demote` auto-resolves affected agenda items through
   `library.front_of_house.residual_gap_recorded`, not a new event type.
6. Each cascade settlement uses the process actor and a reason beginning with
   `settled by frame ruling <answerEventId>: <basis>` so it is visibly distinct
   from a director-ruled answer.
7. `hold` is first-class. Items in held containers stay staged normally.
8. `keep` and absent mappings preserve current walk behavior.
9. `stage-next` continues from the re-projected agenda; per-play-run resolved
   id scoping remains unchanged.
10. Auto-resolved items render in `RESIDUAL-GAPS.md` under the heading
    `Settled by the frame ruling`.
11. Re-applying the same frame patch is idempotent: no duplicate residual
    events, draft-log entries, or residual report entries.

## Scope

This slice lands:

1. A deterministic agenda projection helper in `packages/ax` that consumes the
   resolved container disposition map produced by
   `resolveFrontOfHouseContainerMapping`.
2. Retargeting for filed agenda items in `rename` and `merge` source
   containers:
   - update `context`, `contextDisplayLabel`, and `contextKey` from the target
     container;
   - update `plane` from the surviving target container when it exists, or
     from the renamed source container for a newly created rename target;
   - preserve agenda item ids, titles, text, evidence, concerns, origin,
     confidence, and ordering.
3. Process-authored residual settlement events for unresolved agenda items in
   `demote` source containers, using the existing
   `library.front_of_house.residual_gap_recorded` event type and idempotency key
   shape.
4. A frame-ruling residual reason builder with the stable prefix
   `settled by frame ruling`.
5. `RESIDUAL-GAPS.md` rendering that groups cascade settlements under
   `Settled by the frame ruling` while preserving current rendering for normal
   residual gaps.
6. Integration with `apply-patch` and `apply-patch-step` when
   `containerMapping` is present, including the already-appended-patch path so
   a retry completes any missing projection effects.
7. Black-box CLI tests for exit codes, JSON output fields, agenda files,
   residual events, `stage-next`, `finalize`, and idempotent re-apply.

## Non-Goals

1. No changes to S1 mapping parsing, mapping prompt vocabulary, or card fan-out
   except where small shared helpers are needed to avoid duplicate code.
2. No keystone draft, keystone approval gate, or base-bank behavior. That is S3
   / issue #574.
3. No Viewer Drafts rendering changes. That is S4 / issue #575.
4. No ruling-aware triage or generalized "answered by prior ruling" judgment.
   That is S5 / issue #576.
5. No new Front-of-House command, prompt workflow edge, state event type, or
   residual payload field.
6. No base-bundle card writes for mapped frame patches beyond S1's existing
   draft-log behavior.
7. No writes to `docs/alexandria/library/`.
8. No edits under `repos/`.

## Current Gap

Current behavior in this checkout:

1. `FrontOfHousePatch` already supports optional `containerMapping` and
   `keystoneDraft` fields in
   `packages/ax/src/domain/library-front-of-house.ts`.
2. `resolveFrontOfHouseContainerMapping` validates mapping sources and targets
   against the bundle's container set and returns a canonical per-source
   disposition map. The function comment explicitly names S2 agenda
   re-projection as a thin consumer.
3. `deriveFrontOfHouseContainerMappingCardUpdates` consumes that resolver and
   derives draft-log card updates for `rename` and `merge`.
4. `applyFrontOfHousePatchCore` in
   `packages/ax/src/commands/front-of-house.ts` expands mapped patches into
   effective card updates and requires `--draft-log`.
5. `buildFrontOfHouseAgenda` projects once at `prepare-agenda`; after that,
   `stage-next` only skips ids resolved by ledger events. It does not mutate or
   re-project `agenda.json` when a frame ruling changes containers.
6. Residual recording already exists through
   `library.front_of_house.residual_gap_recorded` with `DEFAULT_AX_ACTOR`, but
   there is no bulk cascade path for demoted containers.
7. `renderResidualGapsMarkdown` writes all residual gaps as ordinary `##`
   entries. It cannot distinguish frame-ruling settlements from director
   residuals.
8. `finalize` writes `RESIDUAL-GAPS.md`; individual residual commands append
   ledger events and rely on finalize for the report.

Result: after an 8-to-5 frame ruling patch applies, the draft log can contain
card fan-out, but the prepared agenda still points at the old container carve
and settled questions keep staging one by one.

## Architectural Boundaries

1. AX owns this slice. The work belongs in the deterministic CLI/domain layer,
   not the shipped plugin prompt planner.
2. The plugin already owns the act of producing `containerMapping`; S2 consumes
   that mapping only. Do not teach AX to infer mappings from prose.
3. `resolveFrontOfHouseContainerMapping` is the canonical disposition resolver.
   S2 may build a `basisBySourceKey` lookup from the original entries for
   residual reasons, but it must not duplicate validation or disposition rules.
4. `library.front_of_house.residual_gap_recorded` remains the only settlement
   event. Distinctness from director rulings comes from:
   - actor: `DEFAULT_AX_ACTOR` (`kind: "process"`, `host: "ax"`,
     `process: "cli"`);
   - reason prefix: `settled by frame ruling`;
   - reason body: frame `answerEventId` plus mapping `basis`.
5. Per-run lifecycle scoping stays in `deriveFrontOfHouseLifecycle`. Cascade
   residual events must carry the agenda's `playRunId` and use the same
   play-run-scoped idempotency key shape as existing residuals.
6. `stage-next` should not need a new branch. Once agenda items are retargeted
   and demoted items have residual events, the current `resolvedAgendaItemIds`
   skip logic should continue to work.
7. `finalize` remains the report writer for `RESIDUAL-GAPS.md`. The apply step
   records durable settlement events; finalize renders those events under the
   new heading.
8. All side effects must be validate-before-write and retry-safe. The existing
   store is not a cross-file transaction, so the implementation should make
   draft-log append, bundle-patch event append, residual event append, and
   agenda rewrite idempotent and complete missing work on re-apply.
9. Use Effect patterns already present in `packages/ax`; do not introduce a new
   runtime abstraction for this slice.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX agenda projection domain | `packages/ax/src/domain/library-front-of-house.ts` | Add a helper that projects `FrontOfHouseAgenda` through a resolved container map, retargets rename/merge items, identifies demote settlements, leaves hold/keep items unchanged, and preserves ordering. |
| AX residual provenance domain | `packages/ax/src/domain/library-front-of-house.ts` | Add stable helpers/constants for frame-ruling settlement reasons and for classifying residual gaps whose reason starts with the frame-ruling prefix. |
| AX residual report rendering | `packages/ax/src/domain/library-front-of-house.ts` | Render cascade settlements under `## Settled by the frame ruling` with per-item subheadings, while normal residual gaps keep current output. |
| AX apply-patch orchestration | `packages/ax/src/commands/front-of-house.ts` | When a resolved patch has `containerMapping`, read `agenda.json`, resolve the mapping once, run the agenda projection, append process-authored residual events for demoted unresolved items, write projected `agenda.json`, and expose projection counts/ids in JSON output. |
| AX residual event append helper | `packages/ax/src/commands/front-of-house.ts` | Extract or reuse a shared residual append path so unresolved patches, `record-residual`, `finalize`, and the cascade use the same actor, payload shape, and idempotency behavior. |
| State event schema | `packages/ax/src/domain/state-events.ts` | No schema change expected. Tests should assert cascade settlements still use `library.front_of_house.residual_gap_recorded` and the process actor. |
| AX tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | Add domain and black-box CLI coverage for rename, merge, demote provenance, hold staging, keep-only regression, and idempotent re-apply. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| Front-of-House workflow prompt | No planned prompt change in S2. The prompt/mapping contract was S1; this slice consumes its output. | No plugin validation or eval rerun is required unless implementation discovers prompt text that contradicts the S2 runtime behavior. |
| Raven / shipped plugin skills | No director-facing skill behavior change. Raven still banks the director's frame answer and sends it through the existing answer/patch flow. | No `SKILL.md` edits expected. If a shipped skill is edited, rerun the relevant plugin validation and Front-of-House eval family. |
| AX deterministic CLI | Existing `apply-patch` and `apply-patch-step` gain mapping-triggered agenda projection and residual settlement side effects. | Add black-box CLI tests for stdout/stderr, exit codes, important JSON fields, event attribution, agenda files, and idempotency. |

## Contract Details For Implementation

Add a small domain API in `library-front-of-house.ts` rather than spreading the
projection across the command:

```ts
export const FRONT_OF_HOUSE_FRAME_RULING_RESIDUAL_REASON_PREFIX =
  "settled by frame ruling";

export interface FrontOfHouseAgendaProjectionResult {
  agenda: FrontOfHouseAgenda;
  heldAgendaItemIds: string[];
  retargetedAgendaItemIds: string[];
  settled: Array<{
    agendaItem: FrontOfHouseAgendaItem;
    reason: string;
  }>;
}
```

Recommended helper shape:

```ts
projectFrontOfHouseAgendaThroughContainerMapping({
  agenda,
  answerEventId,
  alreadyResolvedAgendaItemIds,
  containerMapping,
  resolvedMapping,
})
```

Projection rules:

1. Operate only on filed agenda items with a `contextKey`. Unfiled and framing
   items are unchanged.
2. Preserve the existing `agenda.items` order. S2 is a projection, not an
   opportunity to re-triage priority.
3. For `rename` / `merge`, rewrite context identity from `entry.to` using
   `frontOfHouseContextIdentity(entry.to)`.
4. For `merge`, use the surviving target container's plane when the target
   already exists in `agenda.headline.containers`.
5. For `rename` to a new target, inherit the source container's plane.
6. For a merge into a target created by a same-mapping rename, use the renamed
   source container's plane.
7. If no target plane can be determined, preserve the item's current plane
   rather than inventing one.
8. For `demote`, leave the agenda item text and placement intact for accounting,
   but return it in `settled` when its id is not already in
   `alreadyResolvedAgendaItemIds`.
9. For `hold`, leave the item unchanged and include its id in
   `heldAgendaItemIds` for CLI reporting.
10. For `keep` and unlisted containers, leave the item unchanged.
11. Do not rewrite `concerns`; those are card links, not container labels.
12. Do not recompute keystone drift in S2. Keystone repair belongs to S3.

Residual settlement reason:

```text
settled by frame ruling <answerEventId>: <basis>
```

For every demoted item that will be settled, the matching mapping entry must
provide a non-empty `basis`. If a demote entry with affected items has an empty
basis, reject the patch before any write with a stable error such as
`FrontOfHouseFrameRulingMissingBasis`. A demote entry with no affected agenda
items may remain a no-op.

Command integration details:

1. In `applyFrontOfHousePatchCore`, when `patch.containerMapping` is present,
   load the current prepared agenda before any mutation. If
   `runtime/front-of-house/agenda.json` is missing or invalid, reject before
   writes with a named error such as
   `FrontOfHouseAgendaProjectionRequiresPreparedAgenda`.
2. Build the bundle container key set from the same catalog/card data used by
   S1 fan-out, call `resolveFrontOfHouseContainerMapping`, and pass the resolved
   map into both card fan-out and agenda projection. If the implementation keeps
   `deriveFrontOfHouseContainerMappingCardUpdates` as-is, call the resolver
   separately for the projection but do not duplicate its semantics.
3. Compute `alreadyResolvedAgendaItemIds` from the current event page and the
   agenda's `playRunId`.
4. Append cascade residual events with:
   - type: `library.front_of_house.residual_gap_recorded`;
   - actor: `DEFAULT_AX_ACTOR`;
   - idempotency key: `foh:residual:${playRunId}:${agendaItemId}`;
   - payload: current residual payload shape, with the frame-ruling reason.
5. If an item is already answered or residualed for the same play run, do not
   append a cascade event for it.
6. Write `agenda.json` atomically only when the projected agenda differs from
   the current agenda. A keep-only mapping should leave the agenda file
   byte-identical.
7. The already-appended patch branch must still run the projection and residual
   append path idempotently. This is what lets a retry complete after any
   partial write failure.
8. Preserve existing human markers. `apply-patch-step` should still emit
   `PATCH_APPLIED` for accepted resolved patches.

Recommended JSON output addition for `apply-patch` and `apply-patch-step` when
`containerMapping` is present:

```json
{
  "agendaProjection": {
    "agendaPath": "<bundle>/runtime/front-of-house/agenda.json",
    "heldAgendaItemIds": ["canvas-question"],
    "retargetedAgendaItemIds": ["product-shell-question"],
    "settledAgendaItemIds": ["vision-onboarding-question"],
    "status": "projected"
  }
}
```

Use `status: "unchanged"` when the mapping produces no agenda changes and no
new settlements. Do not add this field for mapping-less patches, so absent
mapping behavior stays byte-compatible for callers.

`RESIDUAL-GAPS.md` rendering:

1. Classify recorded gaps whose reason starts with
   `settled by frame ruling `.
2. If frame-ruling gaps exist, render:

   ```md
   ## Settled by the frame ruling

   ### <agendaItemId> - <title>
   ...
   ```

3. Normal residual gaps should keep their current `## <id> - <title>` rendering.
4. `No residual gaps.` should render only when there are neither normal gaps nor
   frame-ruling settlements.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX domain projection and rendering | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Covers agenda projection helper behavior, frame-ruling reason helpers, residual markdown grouping, lifecycle scoping, and mapping-less regressions. |
| AX black-box Front-of-House CLI | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Covers `apply-patch` / `apply-patch-step` exit codes, JSON fields, ledger events, agenda file rewrites, `stage-next`, `finalize`, and retry idempotency. |
| AX answer/residual lifecycle regression | `cd packages/ax && bun test tests/front-of-house-answer-banking.test.ts` | Ensures answer banking and residual lifecycle assumptions still hold after shared residual append refactoring. |
| Focused AX suite | `cd packages/ax && bun test tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts tests/front-of-house-answer-banking.test.ts` | Practical merge gate for the changed package. |
| Package lint/typecheck if available | `cd packages/ax && bun run typecheck` or the existing package-level equivalent | Catches exported helper/type drift. Use the package's actual script name from `package.json`. |
| Repo markdown/lint if available | `pnpm lint` or the repo's focused markdownlint command | Validates the new plan and any touched markdown/JSON. Use a narrower existing command if full lint is too broad. |

Black-box CLI tests should assert at least:

1. A specimen-shaped mapping with `rename`, `merge`, `demote`, `hold`, and
   `keep` applies successfully through `apply-patch --draft-log --json`.
2. Renamed-container items stage under the new target context label after
   `stage-next`.
3. Merged-container items stage under the surviving target context label after
   `stage-next`.
4. Demoted-container items append residual events with actor
   `DEFAULT_AX_ACTOR`, event type
   `library.front_of_house.residual_gap_recorded`, and reason prefix
   `settled by frame ruling <answerEventId>:`.
5. Demoted settlement reasons include the mapping entry's `basis`.
6. Cascade settlements are not represented as
   `library.front_of_house.answer_recorded` and are not actor-attributed to a
   director or Raven.
7. `finalize` renders those settlements in `RESIDUAL-GAPS.md` under
   `Settled by the frame ruling`.
8. Held-container items remain in the agenda and can be staged normally.
9. A keep-only mapping leaves `agenda.json` byte-identical, appends no residual
   events, and preserves current `stage-next` behavior.
10. A mapping-less patch keeps existing output and behavior.
11. Re-applying the same mapped patch does not duplicate draft-log entries,
    residual events, or residual report entries, and returns an idempotent
    status consistent with existing patch behavior.

Domain tests should cover:

1. `projectFrontOfHouseAgendaThroughContainerMapping` retargets rename items.
2. The same helper retargets merge items.
3. The helper leaves hold and keep items unchanged.
4. The helper returns demote settlements only for unresolved ids in the current
   play run.
5. Empty demote basis is rejected when it would settle items.
6. The residual renderer separates frame-ruling settlements from ordinary
   residual gaps.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| AX deterministic CLI/runtime | No eval-harness coverage is needed for deterministic agenda projection and residual event mechanics. | Use Bun domain and black-box CLI tests as the merge gate. | Not applicable. |
| Front-of-House workflow prompt and shipped plugin skills | S1 owns the prompt contract that emits `containerMapping`. S2 does not plan to edit plugin prompts or skills. | No eval rerun required for this slice. If implementation touches `packages/alexandria-plugin`, run plugin validation and the Front-of-House eval family. | Conditional only: `claude plugin validate ./packages/alexandria-plugin`; `pnpm eval -- run front-of-house-walk/all`. |
| State event schema/introspection | Event type and payload schema remain unchanged. | No eval-harness coverage. Add deterministic assertions if schema output is touched unexpectedly. | Not applicable. |

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Mapping semantics drift from S1 because S2 implements its own disposition rules. | Consume `resolveFrontOfHouseContainerMapping`; only build a basis lookup from the original entries. Add tests that exercise rename, merge, demote, hold, keep through the shared resolver. |
| Cascade settlements become indistinguishable from director rulings. | Always append residual events with `DEFAULT_AX_ACTOR` and the `settled by frame ruling` reason prefix. Add negative tests that no cascade settlement is an `answer_recorded` event or director/Raven actor event. |
| A retry after partial side effects duplicates settlements or leaves the cascade incomplete. | Validate before writes, use existing idempotency keys, make agenda writes deterministic, and run the cascade path even when the bundle patch event already exists. Add re-apply tests that inspect ledger and report counts. |
| Keep-only or hold mappings accidentally perturb agenda order or staging. | Projection helper preserves order and no-ops hold/keep items. Add byte-level keep-only agenda regression and `stage-next` hold tests. |
| `RESIDUAL-GAPS.md` grouping hides ordinary residual gaps or changes no-gap output unexpectedly. | Classify only by the exact frame-ruling reason prefix; renderer tests cover mixed normal and frame-ruling gaps plus empty output. |
| Target plane selection for rename/merge invents structure. | Use only current agenda headline containers and source item planes. If no target plane is known, preserve the item plane rather than guessing. |
| Keystone drift shown in current-item markdown remains stale after the agenda projection. | Do not recompute keystone or drift in S2; call this out as deferred to S3's keystone draft/approval gate. Retargeted item placement still stages under the new labels. |

## Implementation Steps

1. Add frame-ruling residual reason helpers and classification helpers in
   `packages/ax/src/domain/library-front-of-house.ts`.
2. Add the agenda projection domain helper that takes the current agenda,
   original `containerMapping`, resolved disposition map, frame `answerEventId`,
   and already-resolved ids.
3. Add domain tests for rename, merge, demote, hold, keep, empty demote basis,
   play-run scoping, and residual markdown grouping.
4. In `packages/ax/src/commands/front-of-house.ts`, extract a shared helper for
   appending a residual gap event with the existing payload and idempotency
   shape.
5. Wire `applyFrontOfHousePatchCore` so mapped resolved patches:
   - load and parse `agenda.json` before writes;
   - resolve the mapping through `resolveFrontOfHouseContainerMapping`;
   - derive S1 card updates as today;
   - project the agenda;
   - append cascade residual events idempotently;
   - write projected `agenda.json` atomically when changed;
   - include `agendaProjection` in JSON output.
6. Ensure the existing-event/idempotent apply branch also runs the projection
   and residual append path.
7. Update `renderResidualGapsMarkdown` to group frame-ruling settlements under
   `Settled by the frame ruling`.
8. Add black-box CLI tests in
   `packages/ax/tests/library-front-of-house-bundle.test.ts` for the full
   specimen-shaped flow, hold staging, keep-only regression, absent-mapping
   regression, and re-apply idempotency.
9. Run the focused AX test suite and any package typecheck/lint commands
   available in the checkout.
10. If implementation unexpectedly edits plugin prompt/skill files, run plugin
    validation and the Front-of-House eval family before merge.

## Acceptance / Exit Criteria

1. Applying a frame patch with a specimen-shaped `containerMapping` retargets
   agenda items in renamed containers so `stage-next` presents the new
   container label.
2. The same flow retargets agenda items in merged containers so `stage-next`
   presents the surviving container label.
3. Items in demoted containers append
   `library.front_of_house.residual_gap_recorded` events with process actor
   attribution and reason
   `settled by frame ruling <answerEventId>: <basis>`.
4. Demoted settlements render in `RESIDUAL-GAPS.md` under
   `Settled by the frame ruling` after `finalize`.
5. No cascade settlement is indistinguishable from a director-ruled answer:
   none uses `library.front_of_house.answer_recorded`, Raven actor, or a user
   actor.
6. Held-container items remain staged normally and can be reached by
   `stage-next`.
7. A keep-only mapping leaves agenda and walk behavior unchanged, including
   per-play-run resolved-id scoping.
8. A mapping-less patch keeps current apply-patch behavior and output.
9. Re-applying the same mapped frame patch does not duplicate residual events,
   draft-log entries, or residual report entries.
10. Focused domain and black-box AX tests pass.
11. Eval-harness coverage is explicitly not required unless plugin prompt or
    skill files are touched; if they are touched, the conditional validation
    commands in the Eval Impact section are run or their blocker is recorded.

## Deferred Follow-Ups

1. S3 / issue #574: insert the keystone draft and approval gate before the
   cascade trigger is reordered.
2. S4 / issue #575: render zero-card ruling patches, mapping deltas, and
   keystone drafts in the Viewer Drafts surface.
3. S5 / issue #576: add ruling-aware triage for non-mapping questions that are
   answered or reframed by prior rulings.
4. Notepad/audit surfaces: render cascade settlements as machine-made erasures
   distinct from director-ruled resolutions and make reopen flows explicit.
5. If product workflow later needs immediate residual report materialization at
   apply time, add it through a shared report writer rather than a second ad hoc
   `RESIDUAL-GAPS.md` path.
