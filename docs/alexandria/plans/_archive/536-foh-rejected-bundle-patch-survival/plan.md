# Issue 536 Technical Plan: Front-of-House Rejected Bundle Patch Survival

Issue: GitHub `#536`, "Front-of-House walk must survive a rejected bundle patch instead of failing the whole run".
Run ID: `01KWFWVBBWZ20PBZK6RKAHY7JB`
Date: 2026-07-01
Status: Ready for implementation

## Goal

Make the EL3 Front-of-House Walk tolerate bad ACP-authored bundle patches without losing the rest of the director session. AX must derive the canonical patch identity from the agenda item, not from planner-authored `patchId`, and the workflow must turn repeated patch-content rejection into the existing residual-gap path after one replan attempt.

The desired end state is:

- valid patches still apply and replay idempotently;
- one invalid patch gets exactly one ACP replan with the exact AX validation error in context;
- a second validation failure for the same item records `library.front_of_house.residual_gap_recorded` with reason `patch rejected: <validation error>`;
- later agenda items continue;
- `finalize` writes `RESIDUAL-GAPS.md`;
- the Fabro run completes for mixed applied/residual walks;
- ACP transport failure still fails the run through `acp_failed`.

Linked product plan: none separate from the issue body. Related historical Front-of-House context is in:

- `docs/alexandria/plans/library-elicitation-plays/plan.md`
- `docs/alexandria/plans/front-of-house-handshake/plan.md`
- `docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md`
- `docs/alexandria/plans/535-product-card-deprecated-status/plan.md`
- `docs/alexandria/plans/537-foh-reactions-answer-banking/plan.md`

## Scope

In scope:

- Derive the canonical Front-of-House patch id in AX as exactly `patch-<agendaItemId>`.
- Treat a planner-supplied `patchId` as advisory input only. If it disagrees with the derived id, AX accepts the patch and uses the derived id for:
  - `library.front_of_house.bundle_patch_applied.payload.patchId`;
  - the `foh:patch:<playRunId>:<patchId>` idempotency key;
  - `apply-patch` JSON/human output;
  - patch-log parsing and draft-overlay patch identity where parsed Front-of-House patch objects are consumed.
- Preserve direct `ax internal front-of-house apply-patch` CLI semantics for humans and tests: success exits `0`, invalid patch input exits `2`, operational failure exits `1`, stdout/stderr remain separated.
- Add a workflow-facing AX patch step, preferably `ax internal front-of-house apply-patch-step`, that wraps the shared apply core and classifies patch-content rejection without failing the Fabro node:
  - applied or already-applied patch: exit `0`, output a stable `PATCH_APPLIED` marker, include derived `patchId`;
  - invalid patch content/provenance/validation: exit `0`, output a stable `PATCH_REJECTED` marker, write the exact validation error to a runtime rejection artifact;
  - operational AX failure: nonzero exit and no rejection classification.
- Add a deterministic AX command, preferably `ax internal front-of-house record-patch-rejection`, that reads the latest rejection artifact for the current item and appends/reuses the existing residual event with reason `patch rejected: <validation error>`.
- Refactor `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` into an explicit one-shot replan shape:
  - first planner;
  - first apply step;
  - replan planner only on `PATCH_REJECTED`;
  - second apply step;
  - residual recording only on the second `PATCH_REJECTED`;
  - no apply-step edge to `acp_failed`.
- Keep ACP planner transport failures routed to `acp_failed` from both planner nodes.
- Add or update the patch-planning prompt so the first plan uses `patch-<agendaItemId>` for legibility and the replan prompt reads the rejection artifact containing the exact AX validation error.
- Increase `max_node_visits` enough for a 12-item agenda where every item takes the replan/residual path.
- Add deterministic AX tests, workflow graph tests, plugin validation, and conditional Front-of-House eval coverage.

## Non-Goals

- Do not add new Ledger event types.
- Do not change the schemas or meaning of `library.front_of_house.answer_recorded`, `library.front_of_house.section_confirmed`, `library.front_of_house.bundle_patch_applied`, or `library.front_of_house.residual_gap_recorded`.
- Do not change the director-answer banking contract from issue `#537`.
- Do not solve product-card status vocabulary again; issue `#535` owns `deprecated`. Tests for this slice should use a still-invalid value such as `retired` or an invalid `plane` when they need a rejected patch.
- Do not make invalid patches silently "successful" for the direct `apply-patch` command.
- Do not mask ACP adapter failures, missing Fabro transport, missing bundle files, malformed agenda runtime files, or other deterministic operational failures as residual gaps.
- Do not add Viewer behavior.
- Do not write to `docs/alexandria/library/`.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and `packages/ax/docs/cli-design-principles.md`.
- `packages/alexandria-plugin/CLAUDE.md` and `packages/alexandria-plugin/README.md`.
- Issue body for GitHub `#536` as supplied in the task prompt.
- Attempted GitHub comment lookup with `gh issue view 536 --repo GetAlexandria/alexandria-internal --comments --json title,body,comments`; `gh` is not installed in this environment, so no additional comments were available locally.
- Related plans:
  - `docs/alexandria/plans/library-elicitation-plays/plan.md`
  - `docs/alexandria/plans/front-of-house-handshake/plan.md`
  - `docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md`
  - `docs/alexandria/plans/535-product-card-deprecated-status/plan.md`
  - `docs/alexandria/plans/537-foh-reactions-answer-banking/plan.md`
- Current implementation:
  - `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
  - `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md`
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/domain/library-draft-overlay.ts`
  - `packages/ax/src/domain/state-events.ts`
  - `packages/ax/src/effects/jsonl-state-store.ts`
- Current tests and fixtures:
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - `packages/ax/tests/play-reactions-cli.test.ts`
  - `packages/ax/tests/studio-workflow-edge-guard.test.ts`
  - `packages/ax/tests/fixtures.test.ts`
  - `packages/ax/tests/eval-cases/front-of-house-walk/*`
  - `studio/plays/front-of-house-walk/fixtures/invalid-director-patch/README.md`

## Product Contract Summary

The issue reports two real failure modes from July 1, 2026:

- Fixture run `01KWFP9NWWE0KJ9342BC63J2N8`: item 3 of 4 failed because the ACP planner reused a prior patch id, causing `Idempotency key conflict for foh:patch:<playRunId>:stage2-director-review-001`.
- Real run `01KWFQFT2JGAR8XNYECX3NJQGF`: item 4 of 12 failed because the patch used a status value rejected by the validator. Eight remaining items never staged, finalize never ran, and `RESIDUAL-GAPS.md` was not written.

The director's answers were valid and already banked in the Ledger. The failure was in the patch-production/apply step. The walk already has a residual-gap contract for items that cannot be ruled or safely applied; patch-content rejection should use that path instead of killing the run.

The derived patch identity contract is explicit: AX treats `patch-<agendaItemId>` as canonical regardless of what the ACP planner writes in `patchId`.

## Current Gap

`packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` currently routes:

- `plan_bundle_patch -> acp_failed [condition="outcome!=succeeded"]`
- `apply_bundle_patch -> acp_failed [label="patch failed", condition="outcome!=succeeded"]`

`acp_failed` exits `1` with:

```text
Front-of-house walk failed; refusing to silently fill or skip agenda items
```

That is correct for a dead ACP planner turn, but wrong for invalid patch content because the walk can honestly carry that item as a residual and continue.

`packages/ax/src/commands/front-of-house.ts` currently:

1. reads `runtime/front-of-house/patch.json`;
2. parses it with `parseFrontOfHousePatchFile`;
3. finds the cited answer event;
4. for resolved patches, calls `applyFrontOfHousePatch`;
5. writes card files;
6. refreshes the bundle manifest;
7. appends `library.front_of_house.bundle_patch_applied` with idempotency key `foh:patch:${playRunId}:${patch.patchId}`.

The raw planner `patch.patchId` is therefore load-bearing. Two different agenda items can collide if the planner repeats a patch id. Also, because writes happen before event append, an idempotency conflict can occur after card bytes were already written.

The residual path already exists:

- unresolved patches can produce `library.front_of_house.residual_gap_recorded`;
- `record-residual` can append a residual for the current item;
- `finalize` writes `RESIDUAL-GAPS.md` from unresolved and recorded residual gaps.

The missing piece is routing patch rejection into that path with a bounded replan attempt and deterministic patch identity.

## Architectural Boundaries

- The Alexandria plugin owns the guided play and Fabro workflow shape. Workflow routing and prompt context belong in `packages/alexandria-plugin/workflows/front-of-house-walk/`.
- AX owns deterministic Front-of-House support commands and bundle mutation. Patch id derivation, patch validation, residual event appending, and CLI exit contracts belong in `packages/ax`.
- Keep direct CLI behavior deterministic and backward-compatible. Add a workflow-specific wrapper command rather than changing invalid direct `apply-patch` from exit `2` to exit `0`.
- Treat "patch rejection" as a known validation/provenance/content result from the shared apply core. Treat IO errors, missing runtime files, malformed agenda state, state-log access failure, and other unexpected operational failures as failures, not residuals.
- `acp_failed` should be a sink for ACP planner failures only. If a deterministic AX operational failure needs a named terminal node, use a separate label such as `foh_internal_failed` rather than reusing `acp_failed`.
- The rejection artifact is runtime state under `runtime/front-of-house/`, not durable library content. It may be overwritten per item and must not be written under `docs/alexandria/library/`.
- No new event type is needed. Patch rejection after the second attempt records the existing `library.front_of_house.residual_gap_recorded` event.
- Use existing Effect command patterns in `packages/ax`: `Effect.fn`, `FileSystem`, `loadProjectStorage`, structured `CliResult`, stable exit codes, stdout data, stderr diagnostics.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Canonical patch identity | `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/domain/library-draft-overlay.ts` if needed | Add/export a helper that derives `patch-${agendaItemId}`. Parsed FoH patch objects use the derived id even when raw `patchId` differs. Patch logs and overlay consumers no longer collide on planner-authored ids. |
| Direct apply-patch command | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | `apply-patch` uses the derived id for event payload, output, and idempotency key while preserving exit codes. It preflights existing derived-key events before writing files so replay does not double-write and conflicts do not happen after mutation. |
| Workflow apply classifier | `packages/ax/src/commands/front-of-house.ts` | Add `apply-patch-step` or equivalent internal subcommand that calls the shared apply core and emits `PATCH_APPLIED` or `PATCH_REJECTED` markers. Invalid patch content writes a rejection artifact and exits `0`; operational failure exits nonzero. |
| Patch rejection residual recorder | `packages/ax/src/commands/front-of-house.ts`, `packages/ax/src/domain/library-front-of-house.ts` | Add `record-patch-rejection` or equivalent helper that reads the rejection artifact for the current item and appends/reuses a residual event with reason `patch rejected: <validation error>`. |
| FoH workflow graph | `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` | Replace `apply_bundle_patch -> acp_failed` with first-apply classification, a single `replan_bundle_patch` ACP node, second-apply classification, and residual recording. Keep ACP failure edges from both planner nodes to `acp_failed`. Increase `max_node_visits`. |
| FoH patch prompts | `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`, new `replan_bundle_patch.md` if clearer | First prompt should tell the planner to write `patch-<agendaItemId>` for legibility while AX still derives. Replan prompt must read the rejection artifact and include the exact validation error in context before writing a corrected patch. |
| Workflow/static tests | `packages/ax/tests/studio-workflow-edge-guard.test.ts`, possibly a new graph-shape test | Prove Front-of-House ACP nodes still have failure sinks; prove apply nodes do not route to `acp_failed`; prove second rejection routes to residual, not another replan. |
| AX black-box tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts`, `packages/ax/tests/play-reactions-cli.test.ts`, `packages/ax/src/domain/library-draft-overlay.test.ts` | Cover derived ids, idempotency, rejection classification, one-shot replan/residual simulation, mixed applied/residual finalize, and clean-run regression. |
| Plugin validation / eval metadata | `packages/ax/tests/eval-cases/front-of-house-walk/*` if prompt checks need updating | Keep structural checks aligned with prompt/skill behavior and run plugin validation. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `front-of-house-walk` Fabro workflow | Patch-content failure no longer fails the whole run. The workflow replans once, then records a residual and advances. ACP planner failure still goes to `acp_failed`. | Update workflow graph, static workflow-edge tests, plugin validation, and conditional FoH eval checks. |
| ACP patch planner prompt | The first plan is told the canonical legible id is `patch-<agendaItemId>`. The replan prompt receives the exact validation error from AX and must write a corrected patch for the same current item and answer receipt. | Update prompt structural checks if existing FoH eval case metadata expects prompt snippets. |
| `ax internal front-of-house apply-patch` | Direct command preserves its exit-code contract but derives patch identity. A raw planner `patchId` mismatch is not an error. Replay of an already-applied item returns idempotently without double-writing. | Add black-box tests for output fields, idempotency keys, event payloads, no-write replay, and two agenda items with identical raw ids. |
| Workflow-only AX patch step | New internal command/mode exposes applied/rejected markers for Fabro routing and writes rejection diagnostics under runtime. | Add help text, parse tests, black-box JSON/human output tests, and workflow graph use. |
| Residual accounting | A second rejected patch becomes an existing residual event with reason `patch rejected: <validation error>`. `RESIDUAL-GAPS.md` includes that reason after finalize. | Add tests for residual event payload, idempotent residual replay, finalize output, and later agenda continuation. |
| Raven product skill | No direct human-facing skill procedure change is required. Raven still banks director answers and presents completion/residual results. | Do not edit `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` unless implementation discovers completion copy now misstates behavior. If edited, rerun the FoH eval checks. |
| Viewer | No behavior change. | No Viewer tests required for this slice. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts src/domain/library-draft-overlay.test.ts` | Verifies canonical patch id derivation, parser/log/overlay identity behavior, lifecycle projections, residual rendering, and clean existing domain behavior. |
| FoH black-box bundle CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Verifies direct `apply-patch` exit codes, derived event patch ids, idempotency keys, no double-write replay, rejection classification, residual recording, finalize output, and unchanged clean apply behavior. |
| Scripted FoH run tests | `pnpm --filter @alexandria/ax test -- tests/play-reactions-cli.test.ts` | Verifies a mixed applied/residual agenda can still report `status: "completed"` through the existing fake-Fabro reactions harness, later items continue, and clean scripted walks keep current behavior. |
| Workflow graph guard | `pnpm --filter @alexandria/ax test -- tests/studio-workflow-edge-guard.test.ts` | Ensures Front-of-House ACP planner nodes are outcome-guarded and apply-step rejection no longer routes to `acp_failed`. Extend the shipped-workflow list to include the FoH workflow. |
| Focused workflow validation | `python3 studio/tools/check-workflow-edges.py packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` | Direct guard for ACP failure-edge discipline on the edited workflow. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Guards command parser unions, shared apply core types, and canonical patch id plumbing. |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches import/style issues in touched AX files and tests. |
| Plugin validation | `pnpm --filter @alexandria/plugin run validate` | Required because the shipped workflow and prompt files change. |
| Optional real smoke with working ACP/Fabro | `ax run front-of-house-walk --fixture small-el2 --reactions studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json --json` | Final local confidence that the packaged play still launches and completes with a clean fixture. This does not replace deterministic tests. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Front-of-House workflow prompt | Structural FoH eval metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/`, including checks against `plan_bundle_patch.md`. The current `EVALS.md` notes the broader live eval harness is not present in this branch and `pnpm eval` is currently wired to EL5 atomic-card structural substitute coverage. | Update the FoH structural metadata if prompt snippets change. Attempt the targeted FoH eval rerun if the harness lists it; otherwise document harness unavailability in the implementation notes and rely on plugin validation plus deterministic AX tests. | Preferred: `pnpm eval -- run front-of-house-walk/all`. If unavailable: `pnpm eval -- list` to confirm, then run `pnpm --filter @alexandria/plugin run validate` and targeted AX tests. |
| Front-of-House Raven skill | No skill edit is planned. | No eval rerun required if `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` stays unchanged. If the skill changes, rerun/update FoH eval cases. | Conditional: `pnpm eval -- run front-of-house-walk/all` if available. |
| AX deterministic CLI | Covered by Bun tests rather than eval harness. | Add/extend black-box tests for exit codes and output fields. | Not eval-backed. |
| Viewer | Not touched. | No eval-harness or browser validation required. | Not required. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Patch identity derivation is applied only in the command path, leaving patch-log or draft-overlay consumers vulnerable to raw `patchId` collisions. | Put derivation in a shared domain helper and ensure parsed FoH patch objects expose the canonical id. Add tests for direct parse, patch-log parse, and draft-overlay duplicate raw ids on different agenda items. |
| Deriving `patch-<agendaItemId>` with sanitization would violate the issue contract and make event ids differ from expected output. | Use exact string concatenation. Agenda ids are already validated as non-empty strings; idempotency keys can carry the resulting string. Add tests with agenda ids containing punctuation such as `stage2:q1`. |
| Direct invalid `apply-patch` behavior changes from exit `2` to exit `0`, breaking CLI callers and existing tests. | Keep direct `apply-patch` semantics unchanged. Add a separate workflow-facing `apply-patch-step` classifier that exits `0` for known rejection markers. |
| Operational failures get misclassified as residual gaps, hiding broken runtime state. | Classify only shared-core invalid-input results as `PATCH_REJECTED`. Let IO/state-store/runtime errors return nonzero and route to a non-ACP internal failure or fail the run. Add a test for missing bundle/current item that does not record a residual. |
| Rejection artifacts go stale and a later item records the wrong validation error. | Store `schemaVersion`, `playRunId`, `agendaItemId`, `patchPath`, and `validationError` in the artifact. `record-patch-rejection` must compare the artifact to `current-item.json` before appending. The replan prompt must read only the artifact for the current item. |
| One-shot replan accidentally becomes an unbounded loop. | Model first apply and second apply as distinct workflow nodes. The first `PATCH_REJECTED` edge goes to `replan_bundle_patch`; the second `PATCH_REJECTED` edge goes only to `record_patch_rejection_residual`. Add graph-shape tests. |
| A 12-item agenda with many rejected patches exceeds `max_node_visits`. | Raise `max_node_visits` from `80` to a value with headroom, for example `140`, and note the worst case: prepare + 12 full rejection paths + final stage/finalize. |
| Replay of an already-applied item still rewrites card files before returning `already_appended`. | After computing the would-be applied payload and derived idempotency key, inspect existing events for that key before file writes. If the existing event payload matches, return `already_appended` without writes. Add a fake-filesystem or extracted-core test that asserts no write call on replay. |
| Same-item different-content replay creates an idempotency conflict after mutating cards. | Use the same preflight event check before writes. If the derived key exists with different payload, return a deterministic conflict before mutation. |
| `record-patch-rejection` conflicts if rerun after a residual was already recorded with a different reason. | Before appending, derive lifecycle for the current item. If it is already residual, return idempotently without appending. Otherwise append with `foh:residual:<playRunId>:<agendaItemId>`. |
| Prompt-only deterministic patch id wording appears to solve the issue but raw planner ids remain load-bearing. | Acceptance tests must force a raw patch id mismatch and duplicate raw ids across agenda items, then assert derived event ids and no idempotency conflict. |
| The replan prompt does not include the exact AX validation error, so the planner repairs the wrong issue. | Persist the exact validation error string from the failed AX result and have `replan_bundle_patch.md` explicitly read that file. Add a prompt structural check for the rejection artifact path and "exact validation error" wording. |

## Implementation Steps

1. Add a shared canonical id helper in `packages/ax/src/domain/library-front-of-house.ts`, for example:

   ```ts
   export function frontOfHousePatchIdForAgendaItem(agendaItemId: string): string {
     return `patch-${agendaItemId}`;
   }
   ```

2. Update resolved and unresolved patch parsing so `FrontOfHousePatch.patchId` is the derived id once `agendaItemId` is known. Keep validating that the authored `patchId` field is present and non-empty for schema compatibility, but do not compare it to the derived value or fail on mismatch.
3. Update `parseFrontOfHousePatchLog` and any draft-overlay consumers to rely on the canonical parsed `patchId`. Add tests where two entries use the same authored `patchId` but different `agendaItemId` values.
4. Refactor `runApplyPatch` into a shared internal apply function that returns a typed result instead of directly formatting `CliResult`. It should distinguish:
   - applied / already-appended;
   - invalid patch rejection with exact validation error;
   - operational failure.
5. In the shared apply function, derive `const canonicalPatchId = frontOfHousePatchIdForAgendaItem(patch.agendaItemId)` and use it for the event payload and idempotency key. Do not use the authored patch id after parsing except in diagnostics if useful.
6. Before writing card updates, compute the would-be `bundle_patch_applied` payload and inspect `eventPage.events` for the derived idempotency key. If an identical event already exists, return `already_appended` without card writes. If the key exists with different actor/type/payload, return a deterministic failure before card writes.
7. Keep the public `apply-patch` subcommand mapped to the shared apply function with existing exit behavior:
   - applied/already-appended -> exit `0`;
   - invalid patch rejection -> exit `2`, stderr exact validation error, stdout empty;
   - operational failure -> exit `1`.
8. Add a workflow-facing subcommand such as `apply-patch-step`:
   - parse the same `--bundle`, optional `--patch`, and `--json` flags as `apply-patch`;
   - applied/already-appended -> exit `0`, emit `PATCH_APPLIED` in human output and structured JSON fields in `--json`;
   - invalid patch rejection -> write `runtime/front-of-house/patch-rejection.json` with `schemaVersion`, `playRunId`, `agendaItemId`, `patchPath`, `patchId`, and exact `validationError`; exit `0`; emit `PATCH_REJECTED`;
   - operational failure -> exit nonzero with stderr.
9. Add `record-patch-rejection` or equivalent:
   - read `current-item.json` and `patch-rejection.json`;
   - reject if the artifact is missing or does not match the current `playRunId` and `agendaItemId`;
   - append `library.front_of_house.residual_gap_recorded` with reason `patch rejected: <validation error>`;
   - return idempotently if the item is already residual;
   - emit stable JSON/human output with `agendaItemId`, `eventId` when appended, and `status`.
10. Update command help and the typed `FRONT_OF_HOUSE_COMMANDS` registry for the new subcommands.
11. Update `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`:
    - change `apply_bundle_patch` to call `apply-patch-step`;
    - route `PATCH_APPLIED` to `stage_next`;
    - route first `PATCH_REJECTED` to a new `replan_bundle_patch` ACP node;
    - route `replan_bundle_patch` ACP failure to `acp_failed`;
    - add `apply_replanned_bundle_patch` calling the same step command;
    - route second `PATCH_APPLIED` to `stage_next`;
    - route second `PATCH_REJECTED` to `record_patch_rejection_residual`;
    - route `record_patch_rejection_residual` to `stage_next`;
    - remove any apply-node edge to `acp_failed`;
    - add a separate internal failure sink only if needed for non-content AX failures;
    - increase `max_node_visits`.
12. Add `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/replan_bundle_patch.md` or update the existing prompt with a clear replan section. The replan prompt must instruct the ACP planner to read the rejection artifact and use the exact `validationError` when correcting the patch.
13. Update `plan_bundle_patch.md` to say the legible patch id should be `patch-<agendaItemId>`, while AX will derive the canonical id. This is prompt hardening only; the AX derivation remains the enforcement.
14. Add domain tests for:
    - derived patch id from agenda id;
    - authored `patchId` mismatch accepted and canonicalized;
    - patch-log entries with duplicate authored ids but distinct agenda ids;
    - lifecycle/residual rendering with `patch rejected: ...`.
15. Add black-box CLI tests for direct `apply-patch`:
    - event payload and stdout use derived `patchId`;
    - two different agenda items with identical authored `patchId` append two different idempotency keys and do not conflict;
    - replay of an already-applied item returns `already_appended` without writing card files;
    - same-item different-content replay fails before writing;
    - invalid patch still exits `2` with stderr and no stdout.
16. Add black-box CLI tests for `apply-patch-step` and `record-patch-rejection`:
    - first invalid patch returns `PATCH_REJECTED`, writes exact validation error artifact, and writes no cards/events;
    - second invalid patch plus `record-patch-rejection` records residual reason `patch rejected: <validation error>`;
    - rerunning residual recording is idempotent;
    - missing/mismatched rejection artifact fails and does not record a residual.
17. Add a mixed agenda regression using the existing small bundle test helpers:
    - item 1 has a valid director answer but two invalid planner patches, then records residual;
    - item 2 applies a valid patch;
    - `stage-next` advances after the residual;
    - `finalize` exits `0`, writes `RESIDUAL-GAPS.md`, and includes the patch-rejected reason;
    - the final run-style output in the scripted/fake-Fabro harness is `status: "completed"` when the harness is used.
18. Add a clean walk regression where all patches are valid and behavior remains as today: no residual gaps, valid patch events, finalize output unchanged except for derived patch id where tests previously asserted authored ids.
19. Extend workflow graph tests:
    - Front-of-House workflow is included in the shipped ACP edge guard;
    - `plan_bundle_patch` and `replan_bundle_patch` route `outcome!=succeeded` to `acp_failed`;
    - `apply_bundle_patch` and `apply_replanned_bundle_patch` do not route to `acp_failed`;
    - only the first rejected apply routes to `replan_bundle_patch`;
    - the second rejected apply routes to residual recording.
20. Run the deterministic verification commands and handle conditional eval impact.

## Acceptance / Exit Criteria

1. A patch whose authored `patchId` differs from `patch-<agendaItemId>` applies successfully, and the `bundle_patch_applied` event payload uses the derived id.
2. Two different agenda items in the same run can use the same authored `patchId` without idempotency conflict; their event idempotency keys use their distinct derived ids.
3. Re-running an already-applied item returns idempotently with no duplicate event, no idempotency conflict, and no second card write.
4. A direct invalid `ax internal front-of-house apply-patch --json` still exits `2`, writes no stdout, writes the validation diagnostic to stderr, and mutates no cards/events.
5. A workflow apply step receiving an invalid patch emits `PATCH_REJECTED`, writes the exact validation error to the rejection artifact, exits `0`, and does not mutate cards/events.
6. The replan prompt receives the exact validation error from the first rejection artifact.
7. A second consecutive validation failure for the same item records exactly one `library.front_of_house.residual_gap_recorded` event with reason `patch rejected: <validation error>`.
8. After the residual is recorded, `stage-next` advances to later agenda items.
9. A mixed agenda with one patch-rejected residual and at least one later applied patch reaches finalize, writes `RESIDUAL-GAPS.md`, lists the rejected item with the `patch rejected:` reason, and reports completion in the scripted/fake-Fabro run harness.
10. A clean agenda where every patch is valid remains green: patches apply, residual gap count is `0`, and no rejection artifact affects later items.
11. ACP planner transport failure from either planner node still routes to `acp_failed` and fails the run.
12. `acp_failed` is no longer used for patch-content rejection.
13. Plugin validation passes for the edited workflow and prompts.
14. Targeted AX tests, AX typecheck, and AX lint pass.
15. Eval impact is handled: `front-of-house-walk/all` is rerun if available, or implementation notes explicitly record that the current harness does not expose that eval and list the deterministic/plugin validations run instead.

## Deferred Follow-Ups

1. Consider retiring or migrating authored `patchId` from the patch schema in a future schema version once all producers rely on derived identity.
2. Consider adding a shared Front-of-House workflow route test helper if more Fabro workflows need static graph-shape assertions beyond ACP edge guarding.
3. Consider adding a user-facing completion note in the Raven skill only if dogfood shows directors need explicit language distinguishing "residual because the patch was rejected" from "residual because the director deferred the item".
4. Consider a generic AX command-result classifier pattern if other workflows need to distinguish domain validation from operational failures without changing direct CLI exit codes.
