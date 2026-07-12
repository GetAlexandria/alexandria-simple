# Issue 574: Keystone Redraft Approval Gate

## Header

- Issue: GitHub #574, "Frame-ruling cascade S3: keystone redraft as the walk's one approval gate"
- Goal: after a frame-origin `containerMapping` patch is accepted, AX deterministically renders and validates a proposed index card against the post-cascade container set, appends it to the draft log as `keystoneDraft`, stages that proposed card as the next director gate, and defers agenda re-projection until the director approves that artifact.
- Linked product plan: `docs/alexandria/plans/frame-ruling-cascade/plan.md`, especially §4.3, §4.6, §8.1, and slice S3.
- Output path: this per-issue technical plan. The linked product plan remains read-only input.

## Sources Read

- `CLAUDE.md`
- `README.md`
- `skills/maintainer/technical-planning/SKILL.md`
- `skills/maintainer/technical-planning/plan-template.md`
- `EVALS.md`
- `packages/ax/CLAUDE.md`
- `packages/ax/README.md`
- `packages/ax/docs/cli-design-principles.md`
- `packages/alexandria-plugin/CLAUDE.md`
- `packages/alexandria-plugin/README.md`
- `docs/alexandria/plans/frame-ruling-cascade/plan.md`
- `packages/ax/src/domain/library-front-of-house.ts`
- `packages/ax/src/commands/front-of-house.ts`
- `packages/ax/src/effects/front-of-house-answer-banking.ts`
- `packages/ax/src/domain/library-draft-overlay.ts`
- `packages/ax/src/domain/state-events.ts`
- `packages/ax/src/domain/play-answer.ts`
- `packages/ax/src/commands/play-answer.ts`
- `studio/tools/check-keystone.ts`
- `studio/tools/check-keystone.test.ts`
- `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`
- `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`
- `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
- `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/replan_bundle_patch.md`
- `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`
- Existing front-of-house tests under `packages/ax/tests/`
- Existing front-of-house structural eval configs under `packages/ax/tests/eval-cases/front-of-house-walk/`

## Linked Product-Plan Summary

The frame-ruling cascade plan establishes that a director's frame-level ruling is a lodestone for the rest of the Front-of-House walk. S1 lets the planner express a frame ruling as a `containerMapping`, while AX derives whole-container card fan-out. S2 re-projects the remaining agenda through that mapping and records deterministic auto-resolutions with provenance. S3 adds the approval boundary: the director should see exactly one redrafted index card before downstream agenda mechanics fire.

For this slice, the conversational frame answer already authorizes the mapping. The new gate approves the artifact produced from that mapping. The base keystone card remains byte-identical; the redraft exists only in the draft overlay as `keystoneDraft`. Approval and correction still bank through `library.front_of_house.answer_recorded`; residual handling still uses `library.front_of_house.residual_gap_recorded`; no new Ledger event types are introduced.

## Scope

This slice lands:

1. A deterministic AX renderer for a proposed index card from a frame patch's accepted `containerMapping`, the director answer text, the selected base keystone card metadata, and the post-cascade product-map container set.
2. Validation of that rendered draft using the existing `check-keystone` set-equality invariant: story wikilinks must equal the post-cascade container set in both directions.
3. AX-owned population of the patch-log `keystoneDraft` field for frame mapping patches. The planner may propose `containerMapping`; AX owns the draft card body.
4. A pending keystone-gate runtime artifact and staged `current-item.*` files so the proposed index card is the walk's next director gate.
5. Re-ordering of the current S2 trigger: `apply-patch-step` validates and logs mapping fan-out plus `keystoneDraft`, but does not write `agenda.json` changes or append cascade residuals until the keystone gate is approved.
6. Deterministic approval/correction routing through existing answer receipts:
   - approval applies the deferred agenda projection and continues to `stage-next`;
   - first correction sends the planner through one mapping revision pass and re-stages the gate;
   - second rejection records a residual for the proposed-index-card gate and continues without another loop.
7. Front-of-House workflow, prompt, leg metadata, and skill updates so Raven presents the proposed index card as one approve-or-correct turn and sends a machine-readable answer shape through `ax raven answer`.
8. CLI black-box coverage for new command markers, exit codes, JSON fields, no-early-cascade behavior, correction loop behavior, and no-mapping regression.
9. Plugin validation and front-of-house eval contract updates for the changed guided behavior.

## Non-Goals

1. Do not bank the approved draft into the base keystone card. Draft-to-base banking remains the later deliberate bank act from product plan §8.3.
2. Do not write or rewrite card bodies in base bundle files.
3. Do not add Ledger event types for keystone approval, correction, or rejection.
4. Do not implement Drafts surface rendering work from #575 beyond preserving the `keystoneDraft` data contract already consumed by the loader/viewer surface.
5. Do not implement S5 ruling-aware triage.
6. Do not change Back-of-House scanning, EL5 card-body emission, or `docs/alexandria/library/`.
7. Do not make the planner responsible for authoring the keystone draft body.

## Current Gap

The checkout already has substantial S1/S2 infrastructure:

- `FrontOfHousePatch` can parse and render `containerMapping` and `keystoneDraft`.
- `deriveFrontOfHouseContainerMappingCardUpdates` fans out rename/merge mappings to card `context` updates.
- `projectFrontOfHouseAgendaThroughContainerMapping` can retarget agenda items and compute demote settlements.
- `apply-patch-step` appends accepted patches to a draft log when `--draft-log` is provided.
- Draft overlay projection can expose zero-card rulings, `containerMapping`, and `keystoneDraft` display data when such data already exists in the patch log.

The missing behavior is the S3 sequencing and ownership:

- `keystoneDraft` is currently accepted if present; AX does not deterministically render it after mapping validation.
- Current `apply-patch-step` applies agenda projection effects immediately when a patch has `containerMapping`; demoted agenda items can be residualed before the director approves the proposed index card.
- The workflow routes every accepted patch straight back to `stage-next`; it has no director gate between mapping acceptance and agenda cascade.
- The current lifecycle projection treats normal `answer_recorded` events as agenda-item resolution, but there is no synthetic, non-agenda gate state for proposed index-card approval.
- The front-of-house skill has headline-opener guidance, but no movement for a proposed index-card approval turn or deterministic approve/correct answer shape.

## Architectural Boundaries

1. AX owns deterministic projection, validation, runtime gate state, idempotency, output markers, and all file writes under the bundle runtime/draft-log paths.
2. The plugin workflow owns the human/agent/control-flow shape: when to ask the director, when to invoke deterministic AX support, and when to give the planner one correction pass.
3. Raven's `front-of-house-walk` skill owns director-facing mediation and must translate the proposed index card into ordinary language while preserving one-decision turn discipline.
4. The patch planner owns `containerMapping` translation from director prose, not card membership and not the keystone draft body.
5. The base bundle remains frozen for keystone body content. With `--draft-log`, mapping patches may append draft overlay entries and write runtime files, but must not mutate base card files.
6. The existing answer machinery remains the event bank. Approval/correction answer text is structured for AX, but still lands as `library.front_of_house.answer_recorded`.
7. The existing residual machinery remains the no-loop escape hatch. A second rejected proposed index card is carried as a residual gap and the walk continues.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| AX front-of-house domain | `packages/ax/src/domain/library-front-of-house.ts` | Add keystone draft rendering, virtual post-cascade container-set projection, draft validation, pending gate artifact types, answer classification, and lifecycle helpers that keep pending gates separate from normal agenda resolution. |
| AX front-of-house CLI | `packages/ax/src/commands/front-of-house.ts` | Split mapping patch acceptance from agenda cascade effects; add a deterministic gate-resolution subcommand; add stable markers and JSON fields for staged, approved, correction, and residual outcomes. |
| Draft overlay contract | `packages/ax/src/domain/library-draft-overlay.ts` and tests if needed | Preserve existing `keystoneDraft` projection; ensure AX-produced entries are visible as rulings even with zero card updates. |
| Keystone invariant | `studio/tools/check-keystone.ts`, possibly a new shared AX domain helper | Reuse or extract the set-equality invariant so S3 can validate a virtual post-cascade container set without making `packages/ax` depend on `studio/tools`. Keep the Studio CLI behavior unchanged. |
| State events | `packages/ax/src/domain/state-events.ts` | No new event type expected. Only touch if existing schema docs or command output tests need updated descriptions. |
| Front-of-house workflow | `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` | Insert the keystone gate resolution node after director review, route mapping patches that stage a draft back to director review, defer agenda cascade until approval, and route correction/rejection outcomes. |
| Workflow metadata | `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json` | Describe the proposed index-card gate, one correction pass, and approval-triggered agenda cascade. |
| Workflow prompts | Existing patch prompts plus a new `revise_keystone_mapping.md` if cleaner than overloading `replan_bundle_patch.md` | Keep planner at mapping altitude; forbid planner-authored keystone bodies; on correction, revise the mapping exactly once from the original mapping plus the director's correction. |
| Product skill | `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` | Add "Proposed Index Card" movement: present the draft as one artifact, ask approve-or-correct, and send exact answer tokens through `ax raven answer --text-file`. |
| Tests and eval contracts | `packages/ax/tests/*`, `studio/tools/check-keystone.test.ts`, `packages/ax/tests/eval-cases/front-of-house-walk/*` | Add black-box CLI and workflow tests; add a structural eval case for the keystone approval gate; keep existing headline/opener/section/suspect contracts passing. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---|---|---|
| `front-of-house-walk` skill | Raven must recognize staged proposed-index-card gates, present the draft as the one lodestone artifact, and ask exactly one approve-or-correct question. | Update `SKILL.md`; add a structural eval case; rerun or compare existing front-of-house contract cases when the harness supports them. |
| Patch planning prompt | Planner still writes `containerMapping`, but must not write or rely on `keystoneDraft`; AX renders it. | Update `plan_bundle_patch.md`; update existing headline-opener eval config expectations if needed. |
| Keystone correction prompt | Planner gets one correction pass from the proposed-index-card rejection, revises mapping at container altitude, and re-stages via AX. | Add/update prompt; add workflow edges and tests proving no second planner loop. |
| Front-of-house workflow | Accepted frame mappings can stage a director gate instead of proceeding to `stage-next`; approval triggers cascade. | Update `workflow.fabro`, `legs.json`, workflow template tests, and plugin validation. |
| CLI support commands | New or changed internal markers become workflow routing API. | Black-box tests for human and JSON output, stable exit codes, and important fields. |

## Proposed Technical Shape

### 1. Keystone Draft Rendering

Add a pure renderer in AX domain code, for example:

```ts
renderFrontOfHouseKeystoneDraft({
  answerText,
  baseKeystone,
  containerMapping,
  preCascadeContainers,
  resolvedMapping,
})
```

The renderer should:

1. Copy `context`, `plane`, `prefLabel`, and `status` from the selected base keystone card unless a field is missing.
2. Compute a virtual post-cascade product-map container set:
   - `rename`: remove `from`, add `to`;
   - `merge`: remove `from`, add or retain `to`;
   - `keep` and unlisted containers: retain source;
   - `hold`: retain source;
   - `demote`: remove source from the product-map set without changing card status or base card context.
3. Render a deterministic body that includes the director ruling as prose and a generated story section with exactly one wikilink for each post-cascade product-map container.
4. Avoid embedding director prose in wikilink syntax; only generated container links should count toward the invariant.
5. Return both the `keystoneDraft` object and the normalized post-cascade container names used for validation.

The body text can be simple and stable. Polished prose is less important than deterministic validity and provenance. The director sees the artifact for approval; the later draft-to-base bank can improve final body prose if needed.

### 2. Keystone Invariant Reuse

Do not shell out from AX to `studio/tools/check-keystone.ts`. Instead, move or duplicate the small pure set helpers into an AX-owned module, then have the Studio CLI import those helpers:

- name normalization;
- story wikilink extraction from markdown;
- set comparison and violation formatting primitives.

The S3 renderer validates with:

```ts
compareKeystoneSets({
  containerNames: projectedPostCascadeContainerNames,
  storyNames: extractKeystoneStoryNames(keystoneDraft.body),
})
```

Any violation rejects the mapping patch before staging the director gate with a stable diagnostic such as `FrontOfHouseKeystoneDraftInvalid`.

### 3. Patch Acceptance Without Early Agenda Cascade

Refactor `applyFrontOfHousePatchCore` so a `containerMapping` patch:

1. validates the answer event and mapping as today;
2. derives rename/merge `cardUpdates` as today;
3. renders and validates the deterministic `keystoneDraft`;
4. writes the canonical patch with derived card updates and AX-owned `keystoneDraft` to the draft log;
5. appends the existing `library.front_of_house.bundle_patch_applied` event;
6. writes a pending keystone gate artifact under `runtime/front-of-house/`, for example `runtime/front-of-house/keystone-gate.json`;
7. stages `current-item.json`, `current-item.md`, and `for-raven.md` for the proposed-index-card gate;
8. returns a routing marker such as `KEYSTONE_DRAFT_STAGED`.

It must not call `applyAgendaProjectionEffects` in this path. That call moves to the approval command.

The pending gate artifact should include:

- `schemaVersion`;
- `playRunId`;
- original frame `agendaItemId`;
- mapping patch id and mapping answer event id;
- draft patch log path if provided;
- the deterministic `keystoneDraft`;
- normalized `containerMapping`;
- current attempt number, starting at `1`;
- enough data to recompute agenda projection on approval.

`stage-next` should check for an unresolved pending keystone gate before choosing a normal agenda item. This makes retries safe even if a workflow resumes at `stage-next` unexpectedly.

### 4. Gate Answer Shape

Keep event banking through `ax raven answer`, but make Raven's answer file deterministic for AX:

- Approval answer file first line: `APPROVE_KEYSTONE_DRAFT`
- Correction answer file first line: `CORRECT_KEYSTONE_DRAFT`
- Correction details follow after a blank line.

The director should not have to say these tokens. Raven translates "yes, approve" or a correction into this answer-file shape before calling:

```bash
ax raven answer \
  --run <fabroRunId> \
  --question <questionId> \
  --bundle /abs/path/to/bundle \
  --text-file /abs/path/to/answer.md \
  --json
```

AX classifies the answer receipt by the first non-empty line. Anything other than exact approval counts as correction/rejection for loop-bounding; tests should cover case sensitivity and whitespace.

### 5. Gate Resolution Command

Add an internal command such as:

```bash
ax internal front-of-house resolve-keystone-gate --bundle <path> [--json]
```

Behavior:

1. If `current-item.json` is not the proposed-index-card gate, return `NOT_KEYSTONE_GATE` with exit 0. Workflow routes this to ordinary patch planning.
2. If current item is the gate and the answer receipt is approval:
   - recompute agenda projection from the stored mapping, current `agenda.json`, and current Ledger events;
   - write the projected `agenda.json` if retargeted;
   - append `residual_gap_recorded` for demoted settled items using the existing reason prefix;
   - mark the pending gate artifact approved or remove it;
   - return `KEYSTONE_APPROVED` with JSON including `agendaProjection`.
3. If current item is the gate and the answer receipt is correction on attempt 1:
   - persist a correction artifact for the planner, including the original mapping, current draft, and correction text;
   - mark the gate attempt as awaiting revision;
   - return `KEYSTONE_CORRECTION_REQUESTED`.
4. If current item is the gate and the answer receipt is correction/rejection on attempt 2:
   - append `library.front_of_house.residual_gap_recorded` for the synthetic proposed-index-card gate;
   - mark or remove the pending gate artifact so `stage-next` continues;
   - do not apply agenda cascade;
   - return `KEYSTONE_REJECTED_RESIDUAL`.

All outcomes use exit code 0 when successfully classified. Operational failures use exit 1; invalid gate artifacts or malformed answer receipts use exit 2 with stable diagnostics.

### 6. Correction Revision Pass

Add a planner prompt or extend the existing replan prompt with a distinct keystone correction path. Prefer a dedicated prompt such as:

`packages/alexandria-plugin/workflows/front-of-house-walk/prompts/revise_keystone_mapping.md`

The prompt reads:

- pending gate artifact;
- proposed index card;
- original mapping patch;
- correction answer receipt;
- current item and for-Raven files.

It writes one replacement `patch.json` with a revised `containerMapping`. It must:

- cite the correction answer event;
- stay at container altitude;
- use original pre-cascade source container names unless the pending artifact explicitly says otherwise;
- not author `keystoneDraft`;
- not enumerate card membership;
- use `hold` for ambiguity.

The workflow then calls the same AX patch-application path. AX renders a new `keystoneDraft`, appends/logs it, updates the pending gate artifact to attempt 2, and stages the proposed-index-card gate again.

### 7. Workflow Routing

Update `workflow.fabro` so `director_review` first flows through the keystone-gate resolver:

1. `director_review -> resolve_keystone_gate`
2. `resolve_keystone_gate -- NOT_KEYSTONE_GATE -> plan_bundle_patch`
3. `resolve_keystone_gate -- KEYSTONE_APPROVED -> stage_next`
4. `resolve_keystone_gate -- KEYSTONE_CORRECTION_REQUESTED -> revise_keystone_mapping`
5. `resolve_keystone_gate -- KEYSTONE_REJECTED_RESIDUAL -> stage_next`

Update patch-application routing:

1. `apply_bundle_patch -- KEYSTONE_DRAFT_STAGED -> director_review`
2. `apply_bundle_patch -- PATCH_APPLIED -> stage_next`
3. `apply_bundle_patch -- PATCH_REJECTED -> replan_bundle_patch`
4. revised keystone mapping apply should route `KEYSTONE_DRAFT_STAGED -> director_review`;
5. invalid revised keystone mapping should not open an unbounded repair loop; route to the existing residual path or a dedicated residual command with a stable reason.

Keep `PATCH_APPLIED` for non-mapping patches so existing behavior is unchanged.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| AX domain tests | `bun test packages/ax/tests/library-front-of-house.test.ts` | Covers renderer validity, virtual post-cascade container set, no early agenda cascade, lifecycle, residuals, and parser behavior. |
| AX CLI black-box tests | `bun test packages/ax/tests/library-front-of-house-bundle.test.ts packages/ax/tests/play-reactions-cli.test.ts` or the new focused test file | Proves command markers, JSON fields, exit codes, draft-log writes, base immutability, approval cascade, correction loop, and no-mapping regression. |
| Draft overlay projection | `bun test packages/ax/src/domain/library-draft-overlay.test.ts packages/ax/tests/runtime-server.test.ts` | Ensures AX-produced `keystoneDraft` entries remain visible to loader/API consumers. |
| Keystone invariant | `bun test studio/tools/check-keystone.test.ts` | Ensures extracted/shared invariant preserves existing CLI behavior and new virtual validation coverage. |
| Workflow template/rendering | `bun test packages/ax/tests/play-workflow-template.test.ts packages/ax/tests/orchestration.test.ts packages/ax/tests/fixtures.test.ts` | Ensures workflow placeholders, optional draft log input, and new routing nodes render correctly. |
| Typecheck | `pnpm --filter @alexandria/ax run typecheck` | Required for Effect/TypeScript changes in AX. |
| AX tests | `pnpm --filter @alexandria/ax run test` | Broader regression pass for command/domain behavior. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required because workflow, prompts, and skill behavior change. |
| Markdown | `pnpm run lint:markdown` | Required for changed plan, skill, and prompt Markdown. |

Black-box tests must assert stdout/stderr placement and exit codes for:

1. `apply-patch-step` with a frame mapping returns `KEYSTONE_DRAFT_STAGED`, writes a draft-log entry with `keystoneDraft`, and does not include `agendaProjection`.
2. `resolve-keystone-gate` approval returns `KEYSTONE_APPROVED` and includes `agendaProjection` with retargeted and settled item ids.
3. Before approval, no demote settlement residual event exists and `agenda.json` is not reprojected.
4. First correction returns `KEYSTONE_CORRECTION_REQUESTED`, the revised mapping can re-stage the proposed card, and the attempt count becomes 2.
5. Second correction returns `KEYSTONE_REJECTED_RESIDUAL`, appends one residual event, clears the pending gate, and allows `stage-next` to continue.
6. A frame patch with no `containerMapping` returns the existing `PATCH_APPLIED` path and never writes the pending gate artifact.
7. The base keystone file bytes are unchanged after mapping, approval, correction, and residual paths.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---|---|---|---|
| `front-of-house-walk` skill | Structural contract cases exist for headline opener, drift reconciliation, section comprehension, and out-of-scope suspects. | Add a new structural contract case for proposed-index-card gate behavior; update existing cases if wording moves. | New `packages/ax/tests/eval-cases/front-of-house-walk/keystone-draft-gate-contract/config.json`. Intended rerun: `pnpm eval -- run front-of-house-walk/keystone-draft-gate-contract`. |
| Front-of-house workflow/prompts | Existing structural cases inspect prompt and workflow wording indirectly. | Add checks that planner prompts forbid authored `keystoneDraft`, the correction prompt allows exactly one revision, and workflow routing contains the new gate markers. | Same new case plus existing `front-of-house-walk/headline-opener-contract` and `front-of-house-walk/drift-reconciliation-contract`. |
| AX deterministic CLI | No eval-harness coverage required; this is deterministic support code. | Cover with Bun black-box/domain tests. | See Deterministic Verification. |

`EVALS.md` notes the current checkout's `pnpm eval` command is wired to the EL5 structural substitute runner rather than the historical live Claude eval harness. If the front-of-house eval runner is still unavailable during implementation, the slice should still add/update the structural eval config and record that the intended front-of-house eval rerun is blocked by harness availability. Do not skip deterministic tests or plugin validation.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| The existing S2 code auto-resolves demoted agenda items before artifact approval. | Move agenda projection side effects out of `apply-patch-step`; add a negative test that no residuals or agenda rewrites happen before `KEYSTONE_APPROVED`. |
| Demoted containers still have cards in the base bundle, so a filesystem-only keystone check would force the draft to name containers the director removed from the map. | Validate against a virtual post-cascade product-map set computed from `containerMapping`; test rename, merge, demote, hold, and keep together. |
| The planner could smuggle an authored `keystoneDraft` into the patch log. | AX overwrites or rejects planner-authored `keystoneDraft` for mapping patches and renders its own deterministic body. Prompts explicitly forbid authoring it. |
| A synthetic approval gate could be accidentally treated as a normal agenda item and skipped or resolved incorrectly. | Store pending gate state separately from `agenda.json`; make `stage-next` check the pending gate first; use a synthetic current item id that is not inserted into the agenda. |
| Approval/correction classification could become subjective if parsed from ordinary prose. | Raven writes exact first-line answer tokens to the answer file; AX classifies only those tokens. |
| Correction loop and existing patch-validation repair loop could combine into more than one director correction. | Track gate attempt in the pending artifact; allow one director correction only; route second rejection to residuals regardless of prompt behavior. |
| Revised mappings could be computed against the wrong container namespace after the first draft overlay entry. | Correction prompt and pending artifact should name the original pre-cascade mapping sources; domain tests should prove a revised mapping overwrites prior draft overlay context updates deterministically. |
| Base keystone immutability could regress through a non-draft-log path. | Keep `containerMapping` patches requiring `--draft-log`; add byte-identity tests for the base keystone file in mapping, approval, correction, and residual paths. |
| Workflow marker changes could break Fabro routing silently. | Add workflow template tests, plugin validation, and legs metadata updates in the same slice. |

## Implementation Steps

1. Add or extract shared keystone set-invariant helpers so AX can validate a virtual container set and `studio/tools/check-keystone.ts` keeps current CLI behavior.
2. Add domain types and helpers for post-cascade container-set projection, deterministic `keystoneDraft` rendering, draft validation, pending gate artifacts, and keystone gate answer classification.
3. Refactor `applyFrontOfHousePatchCore` to render/validate `keystoneDraft`, append the canonical draft-log entry, stage the pending gate, and return `KEYSTONE_DRAFT_STAGED` without applying agenda projection effects.
4. Add the gate-resolution CLI subcommand with stable human output, JSON output, and exit codes for `NOT_KEYSTONE_GATE`, `KEYSTONE_APPROVED`, `KEYSTONE_CORRECTION_REQUESTED`, and `KEYSTONE_REJECTED_RESIDUAL`.
5. Update `stage-next` to honor unresolved pending keystone gates before selecting ordinary agenda items.
6. Add the keystone correction prompt and update existing patch-planning prompts to state that AX owns `keystoneDraft`.
7. Update `workflow.fabro` and `legs.json` with the new resolver node, correction path, and routing markers.
8. Update `front-of-house-walk/SKILL.md` with the Proposed Index Card movement and exact answer-file shape.
9. Add or update deterministic tests in the order above, starting with pure domain tests before command/workflow tests.
10. Add the front-of-house structural eval config for the keystone draft gate.
11. Run focused tests, then package-level AX tests/typecheck, plugin validation, and markdown lint.

## Acceptance / Exit Criteria

1. A fixture with rename, merge, demote, hold, and keep mappings renders a `keystoneDraft` whose story links pass the check-keystone set invariant against the post-cascade product-map container set.
2. The draft log gains an AX-rendered `keystoneDraft` entry beside `cardUpdates`; the base keystone card is byte-identical across the whole walk path.
3. A frame mapping patch stages the proposed index card as the next gate and does not apply agenda projection before approval.
4. Approval of the proposed index card applies the agenda cascade: retargeted items move in `agenda.json`, demoted items residual with the frame-ruling reason prefix, and `stage-next` continues from the projected agenda.
5. Before approval, no agenda item is auto-resolved and no cascade residual event is appended.
6. A first correction routes to one mapping revision pass and re-stages a new proposed index card.
7. A second correction/rejection appends one residual for the proposed-index-card gate, clears the pending gate, and the walk continues without another correction loop.
8. A frame patch with no `containerMapping` never stages a keystone gate and follows the existing `PATCH_APPLIED` path.
9. Approval, correction, and rejection bank as existing `library.front_of_house.answer_recorded` events; no new Ledger event type is introduced.
10. CLI tests cover exit codes, stdout markers, stderr diagnostics, and important JSON fields for the changed internal commands.
11. Plugin validation passes for the changed workflow, prompts, and skill.

## Deferred Follow-Ups

1. Drafts surface rendering polish for `keystoneDraft` remains #575 unless not already completed.
2. Banking an approved draft into the base keystone remains the later draft-to-base bank act from product plan §8.3.
3. S5 ruling-aware agenda triage remains separate and should consume the provenance conventions established here.
4. If the full front-of-house eval harness is restored, add a conversational/adaptive eval that exercises approve and correction paths beyond the structural config case.
