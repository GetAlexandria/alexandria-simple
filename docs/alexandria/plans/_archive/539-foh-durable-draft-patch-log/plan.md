# Issue 539 Technical Plan: Front-of-House Durable Draft Patch Log

## Header

- Issue reference: `GetAlexandria/alexandria-internal#539`
- Issue title: "Front-of-House apply-patch writes a durable draft patch log; the swept base stays frozen"
- Run ID: `01KWG4X60713FZ5GYWJQC5B0Z4`
- Date: 2026-07-02
- Plan path: `docs/alexandria/plans/539-foh-durable-draft-patch-log/plan.md`
- Status: Ready for implementation

## Goal

Make Front-of-House patch application support a durable draft-overlay write mode.
When a walk is run with a `draftLog` input, validated resolved patches are
appended to that JSON patch log and the swept bundle card files remain byte
unchanged. The existing in-place mutation behavior remains the default when no
draft log is bound.

The end state should let a director watch Raven's draft accumulate in the
PMS-Drafts overlay while PMS-Back continues showing the frozen Back-of-House
sweep.

## Linked Product-Plan Summary

There is no separate linked product-level plan for this issue. The issue body is
the product contract.

Related plans and already-landed context:

- `docs/alexandria/plans/446-pms-drafts/plan.md` created the read-only
  PMS-Drafts overlay that renders `libraryRoot + draftPatchLog`.
- `docs/alexandria/plans/464-pms-drafts-invalid-patches/plan.md` made the
  viewer read side tolerate invalid patch entries while still failing on
  structural log errors.
- `docs/alexandria/plans/507-foh-apply-patch-card-edits/plan.md` implemented
  the current in-place card update path.
- `docs/alexandria/plans/536-foh-rejected-bundle-patch-survival/plan.md` is
  now reflected in this checkout: `apply-patch-step`, derived
  `patch-<agendaItemId>` ids, rejection artifacts, and one-shot patch replan are
  present.
- `docs/alexandria/plans/537-foh-reactions-answer-banking/plan.md` is adjacent
  answer-banking work and should remain compatible.

## Sources Read

- Root `CLAUDE.md`, `README.md`, and `EVALS.md`.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md`.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md`.
- `packages/alexandria-plugin/CLAUDE.md` and
  `packages/alexandria-plugin/README.md`.
- `packages/viewer/README.md`.
- Issue body for GitHub `#539` as supplied in the task prompt.
- Attempted GitHub comment lookup with
  `gh issue view 539 --repo GetAlexandria/alexandria-internal --comments --json title,body,comments`;
  `gh` is not installed in this environment, so no additional comments were
  available locally.
- Current implementation:
  - `packages/ax/src/commands/front-of-house.ts`
  - `packages/ax/src/domain/library-front-of-house.ts`
  - `packages/ax/src/domain/library-draft-overlay.ts`
  - `packages/ax/src/effects/library-graph-loader.ts`
  - `packages/ax/src/domain/orchestration.ts`
  - `packages/ax/src/domain/fixtures.ts`
  - `packages/ax/src/domain/plays.ts`
  - `packages/ax/src/commands/play.ts`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/replan_bundle_patch.md`
  - `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`
  - `studio/drafts/playmaker-studio/patches.json`
- Current tests and eval metadata:
  - `packages/ax/tests/library-front-of-house.test.ts`
  - `packages/ax/tests/library-front-of-house-bundle.test.ts`
  - `packages/ax/tests/fixtures.test.ts`
  - `packages/ax/tests/play-run-input.test.ts`
  - `packages/ax/tests/runtime-server.test.ts`
  - `packages/ax/tests/eval-cases/front-of-house-walk/*`

## Scope

In scope:

- Add an optional `draftLog` workflow input for `front-of-house-walk`.
- Preserve existing `front-of-house-walk --input bundle=<path>` callers by
  making the new workflow input truly optional.
- Add `--draft-log <path>` to:
  - `ax internal front-of-house apply-patch`
  - `ax internal front-of-house apply-patch-step`
- In draft-log mode, append validated `resolution: "resolved"` patches to the
  draft log and do not write card files under the bundle.
- In draft-log mode, do not refresh or rewrite the bundle manifest as a side
  effect of applying a patch.
- Keep the existing `library.front_of_house.bundle_patch_applied` event type,
  payload shape, and idempotency key shape:
  `foh:patch:<playRunId>:<patchId>`.
- Keep unresolved patches on the existing residual path; they must not be
  appended to the draft log.
- Make draft-log append idempotent by canonical `patchId`.
- Create a missing draft log on first append with JSON-array semantics.
- Reject malformed existing draft logs with a named validation error and leave
  the file untouched.
- Add deterministic black-box CLI coverage for the new draft mode and for the
  unchanged default in-place mode.
- Update shipped workflow metadata and validate the plugin.

## Non-Goals

- Do not implement materializing, banking, merging, or approving the accumulated
  draft onto the base bundle.
- Do not change the PMS-Drafts viewer read contract or UI.
- Do not change the Front-of-House patch schema version.
- Do not add a new Ledger event type.
- Do not change the `bundle_patch_applied` event payload shape even though the
  write target changes in draft-log mode.
- Do not make draft-log mode the default for all callers.
- Do not change Raven's director-facing skill behavior unless implementation
  finds existing wording that explicitly promises in-place bundle mutation.
- Do not write to `docs/alexandria/library/`.
- Do not edit vendored repositories under `repos/`.

## Current Gap

The current checkout already includes the issue `#536` prerequisite:

- `parseFrontOfHousePatchFile` derives canonical patch ids as
  `patch-<agendaItemId>`.
- `apply-patch-step` classifies valid and rejected patches for the Fabro graph.
- `record-patch-rejection` records repeated patch rejection as an existing
  residual gap.
- `front-of-house-walk/workflow.fabro` routes rejected patch content to one
  replan, then residual accounting.

The remaining gap is the write target for resolved patches. In
`packages/ax/src/commands/front-of-house.ts`, `applyFrontOfHousePatchCore`
currently:

1. reads `runtime/front-of-house/patch.json`;
2. validates the patch and matching director answer event;
3. calls `applyFrontOfHousePatch`, which computes card updates from bundle card
   content;
4. writes each updated card with `fs.writeTextAtomic`;
5. refreshes `runtime/empty-library/bundle.json`;
6. appends `library.front_of_house.bundle_patch_applied`.

That is correct for callers that intentionally mutate a bundle, but wrong for a
walk over a frozen swept bundle. The viewer already knows how to render a patch
log, but the Front-of-House write path never writes that log.

There is also an orchestration gap. If the workflow template simply references
`__AX_INPUT_DRAFTLOG__`, then current placeholder rendering treats that input as
required for direct `ax run` calls. The feature requires `draftLog` to be
optional.

## Architectural Boundaries

- The plugin workflow owns the play contract. The `front-of-house-walk` workflow
  should thread a draft-log binding to deterministic AX commands when present.
- AX owns deterministic mutation and draft-log write behavior. The card files,
  draft log, event store, and CLI exit contracts belong in `packages/ax`.
- PMS-Drafts remains a read-only viewer projection. This slice makes the writer
  produce the log shape the viewer already consumes; it should not add viewer
  write behavior.
- The draft log is durable project content, not bundle runtime scratch. The
  canonical product location is
  `studio/drafts/<bundle-slug>/patches.json`, but the CLI should accept any
  caller-provided path.
- The swept bundle is still used as validation input. Draft-log mode should read
  card files to validate paths, allowed fields, and computed patch metadata, but
  must not write those card files.
- Existing default behavior must stay unchanged when `--draft-log` is omitted
  or when the workflow optional input expands to an empty value.
- Expected draft-log validation failures should return structured CLI invalid
  input results with exit code `2`, stdout/stderr separation, and no partial
  file truncation.
- Operational failures such as unreadable bundle files, storage failures, or
  atomic write failures should remain operational failures with exit code `1`.
- Use existing Effect command patterns in `packages/ax`; do not introduce a new
  persistence stack.

## Draft-Log Write Contract

The draft log file is a JSON array of canonical `FrontOfHousePatch` entries.

Rules:

1. Missing log file means an empty array. The implementation should create the
   parent directory and write an array containing the first patch.
2. Existing log content must parse as a JSON array.
3. Existing log entries must all be valid Front-of-House resolved patch objects
   for the write path. Although the PMS-Drafts read path can tolerate invalid
   individual entries, the writer must not append onto a malformed log.
4. Append order is command execution order, which corresponds to agenda order in
   the workflow.
5. Idempotency is by canonical `patchId`. If an entry with the same `patchId`
   is already present, leave the log unchanged and return success.
6. The appended entry should be the parsed canonical patch, not the raw planner
   bytes. That means `patchId` is `patch-<agendaItemId>` and closed-set values
   such as `plane` and `status` are normalized exactly as the parser already
   does.
7. `resolution: "unresolved"` patches are never appended to the draft log; they
   continue through `residual_gap_recorded`.
8. A malformed existing log must fail before any write and must not truncate or
   rewrite the file.

Event rules in draft-log mode:

- `library.front_of_house.bundle_patch_applied` is still appended for resolved
  patches so lifecycle projection and `stage-next` continue to work.
- The event payload shape stays unchanged:
  `playRunId`, `bundlePath`, `patchId`, `answerEventId`, `touchedCardPaths`,
  `contentHash`.
- `contentHash` and `touchedCardPaths` should be computed from the same
  in-memory patch application used by the current in-place path.
- The log append should happen before the Ledger event append. If the event
  append fails after the log write, a retry can observe the already-logged
  patch and finish the event append without duplicating the log entry.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Front-of-House CLI options | `packages/ax/src/commands/front-of-house.ts` | Add optional `--draft-log <path>` parsing and help for `apply-patch` and `apply-patch-step`. Treat an empty inline value from workflow templating as absent. |
| Shared apply core | `packages/ax/src/commands/front-of-house.ts` | Split resolved patch handling into default in-place mode and draft-log mode. Draft-log mode validates against bundle cards, appends/reuses a patch-log entry, appends/reuses the existing Ledger event, and skips card and manifest writes. |
| Draft-log persistence helper | `packages/ax/src/commands/front-of-house.ts` or a small domain helper in `packages/ax/src/domain/library-front-of-house.ts` | Read/create/append a strict JSON-array patch log with atomic writes and idempotency by canonical `patchId`. |
| Patch-log parser reuse | `packages/ax/src/domain/library-front-of-house.ts` | Reuse `parseFrontOfHousePatchLog` for structural parsing, but add a strict writer-side wrapper that rejects non-empty `invalidPatches`. Keep the read-side tolerant parser behavior intact. |
| Workflow input optionality | `packages/ax/src/domain/plays.ts`, `packages/ax/src/domain/orchestration.ts`, `packages/ax/src/domain/fixtures.ts`, `packages/ax/src/commands/play.ts` if needed | Add optional workflow input support so `draftLog` can be declared and substituted as empty when omitted without making all existing direct runs invalid. Preserve required `bundle`. |
| Front-of-House workflow | `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro` | Pass `--draft-log='__AX_INPUT_DRAFTLOG__'` or equivalent to both `apply-patch-step` nodes. Empty value must behave as absent. |
| Workflow leg metadata | `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json` | Update apply-leg descriptions to say accepted patches append to the draft log when one is bound, otherwise mutate the bundle as before. |
| Play manifest | `packages/ax/src/domain/plays.ts` | Keep `requiredInputs: ["bundle"]`; add `draftLog`/`draftlog` as an optional input for `front-of-house-walk` without breaking fixture resolution. |
| AX black-box tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Cover draft-mode append/frozen base, default in-place regression, idempotent re-append, unresolved-not-logged, missing-log creation, malformed-log rejection, and `apply-patch-step` marker behavior. |
| Orchestration tests | `packages/ax/tests/play-run-input.test.ts`, `packages/ax/tests/fixtures.test.ts`, possibly `packages/ax/tests/orchestration.test.ts` | Prove `--input draftLog=<path>` binds `__AX_INPUT_DRAFTLOG__`, omission renders as empty for optional inputs, fixtures still work without a draft log, and missing required inputs still fail. |
| Plugin validation / structural eval metadata | `packages/ax/tests/eval-cases/front-of-house-walk/*` if needed | Keep structural checks aligned with changed workflow/prompt wording. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `front-of-house-walk` Fabro workflow | The apply nodes can write to a durable draft log when `draftLog` is bound. Without the binding, they keep the existing in-place behavior. | Update workflow graph scripts and leg metadata. Run plugin validation and workflow/static tests. |
| `ax internal front-of-house apply-patch` | Adds an explicit draft-log mode while preserving current exit codes and output style. In draft mode, resolved patches append to log and emit the same Ledger event without card writes. | Add black-box CLI tests for stdout JSON fields, stderr validation errors, exit codes, no card writes, no manifest rewrite, and no duplicate log entries. |
| `ax internal front-of-house apply-patch-step` | Workflow-facing classifier gains the same draft-log target. `PATCH_APPLIED` still routes the workflow forward; `PATCH_REJECTED` behavior remains unchanged. | Add tests for `PATCH_APPLIED` with a draft log and `PATCH_REJECTED` not writing the log. |
| Workflow input binding | `draftLog` becomes an optional play input. | Add orchestration/fixture tests so existing runs with only `bundle` continue to render and explicit `--input draftLog=<path>` works. |
| Raven Front-of-House skill | No director-facing behavior change is planned. Raven still mediates answers and writes patch files for AX to validate. | Do not edit `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` unless implementation discovers stale wording. If edited, rerun/update FoH eval checks. |
| PMS-Drafts viewer | No behavior change. It already consumes the same patch-log shape. | No Viewer unit/build/browser validation is required unless implementation touches viewer code. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused FoH domain tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts` | Guards canonical patch parsing, strict/tolerant patch-log behavior, lifecycle projection, and no regressions in shared FoH domain helpers. |
| FoH black-box CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Main acceptance coverage for draft-mode append, frozen base, default in-place regression, idempotent re-append, unresolved-not-logged, missing-log creation, malformed-log rejection, and workflow step markers. |
| Run input and fixture tests | `pnpm --filter @alexandria/ax test -- tests/play-run-input.test.ts tests/fixtures.test.ts tests/orchestration.test.ts` | Verifies optional `draftLog` workflow input behavior without breaking existing required input handling or fixtures. |
| Workflow edge/static checks | `pnpm --filter @alexandria/ax test -- tests/studio-workflow-edge-guard.test.ts` | Ensures the edited Front-of-House workflow remains structurally valid and keeps ACP failure routing discipline. |
| Runtime server / overlay regression | `pnpm --filter @alexandria/ax test -- tests/runtime-server.test.ts src/domain/library-draft-overlay.test.ts` | Confirms the existing read side still accepts the log shape written by the CLI and path-safety behavior remains intact. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Guards option unions, orchestration input types, and apply-core result typing. |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches style/import issues in touched AX files and tests. |
| Plugin validation | `pnpm --filter @alexandria/plugin run validate` | Required because the shipped workflow graph and leg metadata change. |
| Optional scripted smoke | `ax run front-of-house-walk --input bundle=<abs-bundle> --input draftLog=<abs-draft-log>/patches.json --reactions <reactions.json> --json` | Final confidence that the rendered workflow threads the optional input into `apply-patch-step` and leaves bundle cards untouched. This does not replace deterministic tests. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Front-of-House workflow and prompts | Structural FoH eval metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/`. Current `EVALS.md` says the broader live eval harness is not present in this branch and `pnpm eval` is currently wired to the EL5 atomic-card structural substitute runner. | Update FoH structural metadata if workflow/prompt checks need new expected strings for `draftLog` or draft-log mode. Attempt the targeted FoH eval rerun if the harness lists it; otherwise document harness unavailability in implementation notes. | Preferred: `pnpm eval -- run front-of-house-walk/all`. If unavailable: `pnpm eval -- list`, then rely on plugin validation and deterministic AX tests. |
| Front-of-House Raven skill | No skill edit is planned. | No eval rerun required if `packages/alexandria-plugin/skills/front-of-house-walk/SKILL.md` is untouched. If it changes, rerun/update FoH eval cases. | Conditional: `pnpm eval -- run front-of-house-walk/all` if available. |
| AX deterministic CLI and orchestration | Covered by Bun tests rather than eval harness. | Add black-box tests for CLI behavior, exit codes, and JSON output fields. | Not eval-backed. |
| Viewer | Not touched. | No eval-harness or browser validation required. | Not required. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Adding `__AX_INPUT_DRAFTLOG__` makes `draftLog` accidentally required and breaks every existing `front-of-house-walk --input bundle=...` run. | Add explicit optional workflow input support and tests for both omitted and supplied `draftLog`. Keep `bundle` as the only required input. |
| `draftLog` casing drifts between the user-facing contract, placeholder discovery, fixture binding, and substitution. | Use `__AX_INPUT_DRAFTLOG__` in templates and add tests for `--input draftLog=<path>`. If optional defaults are keyed internally as `draftlog`, ensure user-provided keys that map to the same placeholder win over the empty default. |
| Draft mode still writes bundle card files or refreshes the bundle manifest through a shared helper. | Put the branch at the point where `applied.updates` are available but before `fs.writeTextAtomic` and `refreshEmptyLibraryBundleManifest`. Add byte-for-byte assertions on cards and manifest. |
| The Ledger event is skipped in draft mode, causing `stage-next` to keep restaging the same item. | Keep appending `library.front_of_house.bundle_patch_applied` with the unchanged payload shape. Add a staged-agenda test that applies with `--draft-log`, then `stage-next` advances. |
| The log is appended after the Ledger event, and a log write failure leaves lifecycle advanced with no visible draft. | Write or confirm the draft-log entry before appending the event. If the event append fails afterward, retry can complete the event without duplicating the log. |
| A malformed log is silently overwritten during missing-file creation logic. | Distinguish missing file from unreadable/malformed file. Only missing file gets empty-array semantics. Existing invalid JSON, non-array JSON, or invalid entries return a named invalid-input error before any write. Add an unchanged-bytes assertion. |
| Writer strictness conflicts with PMS-Drafts read-side invalid-entry tolerance. | Keep `parseFrontOfHousePatchLog` tolerant for the read side and add a writer-only strict wrapper that rejects `invalidPatches.length > 0`. Test both contracts. |
| Idempotent re-append corrupts order or duplicates entries. | Search existing entries by canonical `patchId`; if found, leave the array unchanged and return success. Add a two-run test that expects one entry and original order. |
| Unresolved patches start filling the draft log even though they have no overlay content. | Keep unresolved handling before the draft-log branch and assert no log file is created or no new entry is added for `resolution: "unresolved"`. |
| Direct default `apply-patch` behavior regresses while adding draft mode. | Preserve the no-`--draft-log` branch and keep existing in-place tests. Add explicit default-mode regression coverage in the new test matrix. |
| `apply-patch-step` treats malformed draft logs as `PATCH_REJECTED`, incorrectly converting infrastructure/log corruption into a residual gap. | Classify malformed draft-log errors as invalid input/operational command failure, not patch-content rejection. Add a test that exit code is `2`, stdout has no marker, and no residual artifact is written. |
| Same `patchId` with different content is underspecified. | Treat the first logged canonical `patchId` as the durable draft entry for this slice. Do not duplicate or overwrite it. If implementation detects an existing conflicting Ledger event, keep the existing idempotency conflict behavior. Defer richer conflict reporting to a future banking/review slice. |

## Implementation Steps

1. Extend the Front-of-House command option types in
   `packages/ax/src/commands/front-of-house.ts` so `apply-patch` and
   `apply-patch-step` accept optional `draftLog?: string`.
2. Update `formatApplyPatchHelp`, `formatApplyPatchStepHelp`, and
   `parsePatchCommandArgs` for `--draft-log <path>`.
   - Support `--draft-log=<path>` as well as `--draft-log <path>`.
   - Treat `--draft-log=` as absent so the workflow can pass an empty optional
     input without changing behavior.
3. Add a small draft-log helper, either near the apply core or in
   `library-front-of-house.ts`, that:
   - resolves relative paths against `cwd`;
   - reads an existing file or treats missing file as `[]`;
   - parses with `parseFrontOfHousePatchLog`;
   - fails if the structural parser returns `Error`;
   - fails if `invalidPatches` is non-empty;
   - returns existing patches plus whether the target `patchId` is already
     present;
   - writes the updated array atomically with a trailing newline only after all
     validation passes.
4. Refactor the resolved branch of `applyFrontOfHousePatchCore` after
   `applyFrontOfHousePatch` succeeds:
   - compute the same `payload` and `idempotencyKey` as today;
   - preflight an existing Ledger event as today;
   - if `draftLog` is absent, keep current card writes, manifest refresh, event
     append, and output fields;
   - if `draftLog` is present, append/reuse the patch-log entry, skip card
     writes, skip manifest refresh, append/reuse the Ledger event, and return a
     result that includes `draftLogPath` and a draft-log status such as
     `appended` or `already_logged`.
5. Keep unresolved patch handling before the resolved draft-log branch so it
   continues to append/reuse `residual_gap_recorded` and never touches the
   draft log.
6. Update `applyResultToCliResult` and `runApplyPatchStep` JSON/human output for
   draft-mode resolved results:
   - preserve existing fields used by callers (`patchId`, `status`,
     `contentHash`, `touchedCardPaths`, `eventId`);
   - add draft-specific fields such as `draftLogPath` and `draftLogStatus`;
   - keep `PATCH_APPLIED` marker behavior for `apply-patch-step`.
7. Ensure draft-log validation failures produce direct CLI invalid-input results
   for both `apply-patch` and `apply-patch-step`, not `PATCH_REJECTED`.
8. Add optional workflow input support:
   - extend the play manifest model with optional inputs or an equivalent
     placeholder-default mechanism;
   - mark Front-of-House `draftLog`/`draftlog` optional while keeping `bundle`
     required;
   - ensure missing optional placeholders render as empty strings;
   - ensure explicit `--input draftLog=<path>` maps to
     `__AX_INPUT_DRAFTLOG__` and wins over the empty default.
9. Update `packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro`
   so both apply nodes pass the optional draft-log binding to
   `apply-patch-step`, using an inline form that can expand to an empty value
   without producing a missing-value parse error.
10. Update `packages/alexandria-plugin/workflows/front-of-house-walk/legs.json`
    to describe the draft-log write target when bound.
11. Add/extend AX tests:
    - draft-mode `apply-patch` appends a resolved patch to a missing log,
      creates parent directories, appends the unchanged Ledger event, and leaves
      card files plus bundle manifest byte-identical;
    - draft-mode `apply-patch-step` emits `PATCH_APPLIED` and writes the same
      log entry;
    - default no-draft-log `apply-patch` still mutates card files and does not
      create the draft log;
    - reapplying the same patch id leaves exactly one log entry and exits `0`;
    - unresolved patch records residual and adds nothing to the log;
    - malformed existing log fails with a named error, leaves file bytes
      unchanged, writes no card files, and appends no event;
    - `stage-next` advances after draft-mode apply because the Ledger event is
      still present.
12. Add/extend orchestration tests:
    - `ax run front-of-house-walk --input bundle=<path>` renders without a
      missing `draftlog` input error;
    - `ax run front-of-house-walk --input bundle=<path> --input draftLog=<path>`
      renders the draft-log path into the workflow;
    - fixture resolution for Front-of-House still works when the fixture only
      supplies `bundle`.
13. Update FoH structural eval metadata only if the changed workflow or prompt
    strings need new assertions.
14. Run the deterministic verification matrix and record any unavailable eval
    harness command in the implementation notes.

## Acceptance / Exit Criteria

1. A Front-of-House walk rendered with `draftLog` bound passes the path through
   to both apply nodes.
2. `apply-patch --draft-log <path>` with a resolved patch appends the canonical
   patch object to the log, emits/reuses
   `library.front_of_house.bundle_patch_applied`, and leaves bundle card files
   and the bundle manifest byte-identical.
3. `apply-patch-step --draft-log <path>` preserves `PATCH_APPLIED` routing for
   resolved patches and `PATCH_REJECTED` routing for patch-content rejection.
4. Running without `--draft-log` preserves current behavior: card files mutate,
   the manifest refreshes, and no draft log is written.
5. Re-running an already logged `patchId` exits successfully and leaves one log
   entry for that id.
6. An unresolved patch still records/respects the existing residual path,
   produces `RESIDUAL-GAPS.md` after finalize, and adds nothing to the draft
   log.
7. A missing draft log is created as a valid JSON array.
8. A malformed existing draft log fails with a named validation error and the
   original file bytes remain unchanged.
9. Existing Front-of-House fixtures and tests that do not bind `draftLog`
   continue passing.
10. Plugin validation passes for the edited shipped workflow package.

## Deferred Follow-Ups

1. Implement the future deliberate "bank" operation that materializes a reviewed
   draft patch log onto the base bundle.
2. Decide whether same-`patchId` different-content draft-log replays should
   surface a specialized conflict result instead of "first logged entry wins".
3. Replace the checked-in PMS-Drafts fixture log with live dogfood output once
   the durable writer has been exercised in a real run.
4. Add viewer affordances for comparing base, draft overlay, and future final
   material if product review needs more than the current PMS-Drafts trail.
5. Consider adding a CLI inspection command for draft logs if operators need a
   deterministic way to list, validate, or prune draft entries outside the
   viewer.
