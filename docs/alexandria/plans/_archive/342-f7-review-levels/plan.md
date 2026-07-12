# Issue 342 Technical Plan - F7 Review Levels

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/342
Run ID: 01KVVEF8CYEWEW9BGZ9MVFV7NB
Project: Studio Operations
Phase: 2
Tier: should
Blocked by: issue #341, merged as PR #372

## Goal

Implement F7 as a runtime/CLI composition capability for the Playmaker Studio
play-writing play.

A writer can start `make-a-play` with Low, Medium, or High Review. Each level is
a named composition over versioned step-plays:

`Ground -> Brief -> Harden -> Derive -> Test -> Run -> Bank/Register`

The review level decides which seams become human gates. The selected level and
gate confirmations are Ledger facts about the run. The built play does not gain
a permanent review-level field.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define the package boundaries and the
  canonical Studio surface.
- `skills/maintainer/technical-planning/SKILL.md` defines this planning
  standard.
- `EVALS.md` defines when skill and agent evals are required.
- Issue #342 text supplied in the run prompt freezes the F7 contract and the
  2026-06-23 surface correction.
- `docs/alexandria/plans/studio-fixes/F7-review-levels.md` is the product
  orientation for review levels as play-writing compositions.
- `docs/alexandria/plans/studio-fixes/org-model.md` owns the
  Company -> Division -> Function -> Play model and PlaymakerStudio / Production
  ownership.
- `docs/alexandria/plans/studio-fixes/issue-plan.md` records that issue #342 is
  Phase 2 and unblocked by #341.
- `docs/alexandria/plans/studio-fixes/board-surface-decision.md` rules that
  `:8778` is retired and the viewer `/studio` tab is canonical.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md` define deterministic CLI behavior,
  Effect usage, stable exit codes, and black-box CLI tests.
- `packages/alexandria-plugin/CLAUDE.md` and `packages/alexandria-plugin/README.md`
  define the plugin as the play contract owner and require plugin validation for
  plugin changes.
- `packages/viewer/README.md` defines the viewer runtime boundary:
  local AX API -> Schema decode -> React adapter.
- GitHub comments beyond the supplied issue body were not available in this
  environment: `gh` is not installed, and the issue body in the prompt is the
  planning source used here.

## Scope

- Add the public run-start selector:
  `ax run make-a-play --review-level <low|medium|high>`.
- Default `ax run make-a-play` to Low Review.
- Keep existing `ax run make-a-play:design`, `make-a-play:build`, and
  `make-a-play:prove` module ids working for compatibility and direct module
  verification.
- Introduce plugin-owned, versioned step-play composition data for:
  Ground, Brief, Harden, Derive, Test, and Run.
- Introduce three plugin-owned review compositions:
  Low Review, Medium Review, and High Review.
- Render a composed Fabro workflow at run start from the selected composition,
  inserting human gate nodes only at the selected seams.
- Record the selected review level as an idempotent Ledger run fact.
- Record F7 gate confirmations as idempotent Ledger run facts with an
  `AlexandriaActor`.
- Project those facts through AX project state and expose them to the viewer
  Play Tracker through AX runtime APIs.
- Add a small viewer Play Tracker readout for the selected review level and
  confirmed gates. This is display only; no run-launch UI is in scope.
- Add deterministic tests for CLI parsing, defaults, invalid inputs, generated
  gate placement, ledger schema/projection, idempotent reruns, and viewer tracker
  fact rendering.
- Validate plugin structure after workflow/composition data changes.

## Non-Goals

- Do not build or revive any `studio/*.html`, `board-ui.js`, or
  `studio/site-server.py` UI. The retired `:8778` site is out of scope.
- Do not build a viewer run-launch selector. Future run-launch UI belongs in
  the viewer, but this issue verifies selection through CLI.
- Do not implement mid-stream level switching. A `playRunId` that already has a
  selected level keeps that level for the run.
- Do not redesign step-play internals. This slice wraps the current #341
  make-a-play work into versioned composition units.
- Do not change the TESTING.md proof bar, statistical thresholds, or Gate 2
  proof standard.
- Do not add a permanent `reviewLevel`, `trustLevel`, or equivalent field to a
  play record, registry row, brief, board card, or config file.
- Do not create per-feature config JSON files.
- Do not write to `docs/alexandria/library/`.
- Do not use the word `trust` as a runtime setting, CLI flag, label, JSON field,
  composition id, or viewer label.

## Linked Product-Plan Summary

F7 reframes the old hard-coded review cycle as a choice made at run start. The
choice is not a dial. It is a pre-composed Play-Writing play: a stringing of
versioned step-plays with gates at chosen seams.

The allowed gate seams are:

| After step | Gate label | Levels |
|---|---|---|
| Ground | Review the grounding | High |
| Brief | Review the brief | High |
| Harden | Gate 1 - confirm the design | Low, Medium, High |
| Derive | Review the drawing and approve prompts | Medium, High |
| Test | Approve the test tuning | High |
| Run | Gate 2 - confirm it is proven | Low, Medium, High |

Low Review is today's default behavior: only Gate 1 after Harden and Gate 2
after Run. Medium adds the after-Derive review. High gates every F7 seam.

The selected review level is run provenance on the Ledger. It is not written as
play configuration.

## Current Implementation Gap

Current #341 make-a-play support exists, but it is not yet F7:

- `packages/ax/src/domain/plays.ts` exposes `make-a-play:design`,
  `make-a-play:build`, and `make-a-play:prove`.
- `packages/ax/src/commands/play.ts` special-cases those module ids and routes
  them into `runMakeAPlayModule()`.
- `packages/ax/src/domain/make-a-play.ts` models three coarse modules:
  Design, Build, and Prove.
- `packages/alexandria-plugin/workflows/make-a-play/*` contains the module
  workflows and tracker legs. The current design leg labels `draft_brief` as
  "Draft"; F7 needs the review composition language to expose the step-play as
  Brief.
- `runMakeAPlayModule()` is deterministic and useful for #341, but it does not
  compose Low / Medium / High at run start and it does not use the generic Fabro
  human-gate bridge.
- `ax run` already supports `--reactions`, `--auto-approve`, `--wait`, and
  detached runtime observation for ordinary Fabro workflows.
- `packages/ax/src/effects/run-bridge.ts` emits generic play lifecycle and
  human input events from Fabro observations, but it does not know F7 review
  levels or gate seam names.
- `packages/ax/src/domain/state-events.ts` has `play.provenance_recorded`, but
  no review-level-selected or review-gate-confirmed event types.
- `packages/ax/src/domain/project-state.ts` projects play run status but not
  run facts such as selected review level or confirmed F7 gates.
- `packages/ax/src/effects/studio-api.ts` exposes tracker run state from Fabro
  and active runs from the Ledger projection, but does not attach F7 run facts.
- `packages/viewer/src/components/studio/PlayTrackerTab.tsx` renders tracker
  status and step progress, but not review level or gate confirmations.

## Architectural Boundaries

- `packages/alexandria-plugin` owns the play contract: step-play definitions,
  review-level compositions, labels, and workflow fragments live with the
  make-a-play workflow package.
- `packages/ax` owns deterministic run-start selection, composition rendering,
  CLI validation, event schemas, ledger appends, and projections.
- The generic run bridge remains the sole owner of generic play lifecycle
  events: `play.started`, `play.completed`, `play.failed`,
  `play.status_observed`, `play.human_input_requested`, and
  `play.human_input_resolved`.
- F7 may add non-lifecycle run fact events from AX:
  `play.review_level_selected` and `play.review_gate_confirmed`.
- The viewer reads F7 facts only through AX runtime APIs. It must not read
  `events.jsonl` directly.
- `studio/plays/registry.js`, `board-state.json`, play briefs, and built play
  records must not receive a permanent review-level field.
- Composition data should be declarative. Adding a fourth level should be data:
  a new composition over the same step-play ids and gate seams.

## Data Contract

Add plugin-owned composition data under the make-a-play workflow package. The
exact filenames can be adjusted during implementation, but the source of truth
should stay in `packages/alexandria-plugin/workflows/make-a-play/`, not in a
separate config file.

Proposed shape:

```json
{
  "schemaVersion": 1,
  "stepPlays": [
    {
      "id": "ground",
      "label": "Ground",
      "version": "1",
      "nodeIds": ["ground"]
    },
    {
      "id": "brief",
      "label": "Brief",
      "version": "1",
      "nodeIds": ["draft_brief"]
    },
    {
      "id": "harden",
      "label": "Harden",
      "version": "1",
      "nodeIds": ["harden"]
    },
    {
      "id": "derive",
      "label": "Derive",
      "version": "1",
      "nodeIds": ["derive", "lint"]
    },
    {
      "id": "test",
      "label": "Test",
      "version": "1",
      "nodeIds": ["author_fixtures"]
    },
    {
      "id": "run",
      "label": "Run",
      "version": "1",
      "nodeIds": ["run_campaign", "grade", "writeback", "advance_contract"]
    }
  ],
  "mechanicalAfterRun": ["register_for_run", "register_live"],
  "reviewLevels": [
    {
      "id": "low",
      "label": "Low Review",
      "compositionId": "make-a-play:review:low",
      "version": "1",
      "gatesAfter": ["harden", "run"]
    },
    {
      "id": "medium",
      "label": "Medium Review",
      "compositionId": "make-a-play:review:medium",
      "version": "1",
      "gatesAfter": ["harden", "derive", "run"]
    },
    {
      "id": "high",
      "label": "High Review",
      "compositionId": "make-a-play:review:high",
      "version": "1",
      "gatesAfter": ["ground", "brief", "harden", "derive", "test", "run"]
    }
  ]
}
```

The implementation should validate this data with an explicit schema before
rendering workflows:

- every `gatesAfter` value must name a step-play id
- every step in the canonical order must exist once
- every review level must include `harden` and `run`
- Low must include only `harden` and `run`
- labels must use review-cycle language, not retired setting names
- `mechanicalAfterRun` nodes must not be gate seams

## CLI Contract

Add `make-a-play` as the composed Play-Writing play id.

Usage:

```bash
ax run make-a-play [--review-level low|medium|high] [existing ax run options]
```

Rules:

- `--review-level` is accepted only for `make-a-play` in this slice.
- Omitting `--review-level` selects `low`.
- Invalid values exit `2`, list `low, medium, high`, and include an example.
- JSON output includes at least:
  - `play: "make-a-play"`
  - `playRunId`
  - `reviewLevel: "low" | "medium" | "high"`
  - `reviewLevelLabel`
  - `compositionId`
  - `gateSeams`
  - `workflowTargetPath`
  - `ledgerPath`
- Human output prints the selected review level and gate count.
- `--review-level` must not appear in help for unrelated commands.
- If the same `--play-run-id` already has a selected review level:
  - same level: treat selection as idempotent and continue
  - different level: reject before launch; mid-stream switching is out of scope
- For F7 runs, live `--interactive` must not bypass gate-confirmation facts. The
  implementation should either route attended answers through AX-owned answer
  logic or reject `--interactive` for `make-a-play` review compositions with a
  clear exit-2 message. Default detached runs, `ax raven answer`, `--reactions`,
  and `--auto-approve` are sufficient for this issue's verification.

## Composition Rendering Contract

The composition renderer should be a pure, testable AX domain module, with file
I/O kept at the command boundary.

Inputs:

- step-play definitions
- review-level composition
- `playRunId`
- existing confirmed gate facts for that `playRunId`
- workflow template paths and AX placeholder values

Outputs:

- a generated workflow file under the run workspace
- tracker-leg metadata for the composed workflow
- selected gate seam metadata for the Ledger fact and CLI output

Rules:

- Low Review renders exactly two F7 human gates: after Harden and after Run.
- Medium Review renders exactly three F7 human gates: after Harden, after
  Derive, and after Run.
- High Review renders exactly six F7 human gates: after Ground, Brief, Harden,
  Derive, Test, and Run.
- Already-confirmed gates for the same `playRunId` and review level are omitted
  or rendered as deterministic pass-through nodes so a retry does not re-fire
  them.
- Gate ids are stable and seam-based:
  - `review_after_ground`
  - `review_after_brief`
  - `gate_1_confirm_design`
  - `review_after_derive`
  - `review_after_test`
  - `gate_2_confirm_proven`
- Gate labels match the F7 contract. Gate 1 and Gate 2 keep their names.
- Bank/Register mechanical work is not a gate seam.
- A fourth level test should be able to pass a new composition object to the
  renderer and get a valid workflow without adding branching code.

## Ledger Contract

Add two event types to `packages/ax/src/domain/state-events.ts`.

`play.review_level_selected` payload:

```json
{
  "playId": "make-a-play",
  "playRunId": "run-1",
  "fabroRunId": "01FAB",
  "reviewLevel": "medium",
  "reviewLevelLabel": "Medium Review",
  "compositionId": "make-a-play:review:medium",
  "compositionVersion": "1",
  "gateSeams": ["harden", "derive", "run"],
  "stepPlayVersions": [
    { "step": "ground", "version": "1" },
    { "step": "brief", "version": "1" }
  ]
}
```

Idempotency key:

```text
make-a-play:<playRunId>:review-level
```

`play.review_gate_confirmed` payload:

```json
{
  "playId": "make-a-play",
  "playRunId": "run-1",
  "fabroRunId": "01FAB",
  "reviewLevel": "medium",
  "compositionId": "make-a-play:review:medium",
  "gateId": "review_after_derive",
  "afterStep": "derive",
  "questionId": "review_after_derive"
}
```

Idempotency key:

```text
make-a-play:<playRunId>:review-gate:<gateId>
```

The event actor is the confirming actor. For automated paths, use the process
actor. For CLI human answers, prefer a user actor through the same actor parsing
rules used by `ax inspect events append`.

The event schema must reject unknown review levels, unknown gate seam ids, and
payloads that carry retired setting fields.

## Projection And Query Contract

Extend the Ledger-derived project state with review facts on play runs. This is
a projection, not stored play configuration.

Proposed `PlayRun` addition:

```ts
review?: {
  level: "low" | "medium" | "high";
  label: string;
  compositionId: string;
  gateSeams: string[];
  gates: Array<{
    afterStep: string;
    confirmedAt?: string;
    gateId: string;
    questionId?: string;
    status: "pending" | "confirmed";
  }>;
};
```

Query surfaces:

- `ax inspect events list --type play.review_level_selected --json` shows the
  raw run fact.
- `ax inspect state --json` shows the derived review facts under the matching
  run.
- `/api/studio/runs/<fabroRunId>/events` attaches the review facts for the
  matching run so the Play Tracker can render them.

Do not add review level to:

- `studio/plays/registry.js`
- `studio/plays/*/brief.md` as a current setting
- `studio/plays/board-state.json`
- `.alexandria/alexandria-config.json`
- built workflow package metadata as permanent play config

## Viewer Contract

The viewer change is read-only display in the existing Play Tracker:

- Extend `StudioRunEventsSchema` in `packages/viewer/src/app/runtime/studio.ts`
  with optional review facts from AX.
- Render the selected level in the tracker side panel, for example
  `Review level: Medium Review`.
- Render the F7 gate list with confirmed/pending state when available.
- Do not add run-launch controls.
- Do not read `events.jsonl` or workspace files directly.
- Do not touch retired `:8778` files.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Plugin workflow contract | `packages/alexandria-plugin/workflows/make-a-play/**` | Adds versioned step-play and review-composition data; may add composed-workflow fragments while preserving current module internals |
| AX play manifest and CLI parsing | `packages/ax/src/domain/plays.ts`, `packages/ax/src/commands/play.ts`, tests | Adds `make-a-play`, `--review-level`, default Low Review, invalid-value diagnostics, JSON output fields |
| AX composition domain | new `packages/ax/src/domain/*review*.ts` or adjacent make-a-play domain module | Validates composition data and renders selected gates without low/medium/high branching |
| AX ledger schema | `packages/ax/src/domain/state-events.ts`, `packages/ax/tests/events.test.ts` | Adds review-level-selected and review-gate-confirmed event schemas |
| AX gate answer path | `packages/ax/src/commands/play-answer.ts`, `packages/ax/src/commands/raven.ts`, related tests | Emits idempotent review-gate confirmation facts when answering F7 gates |
| AX project state | `packages/ax/src/domain/project-state.ts`, `packages/ax/tests/state.test.ts` | Projects review facts onto play runs from the Ledger |
| AX Studio API | `packages/ax/src/effects/studio-api.ts`, `packages/ax/tests/studio-api.test.ts` | Exposes review facts to the Play Tracker endpoint |
| Viewer runtime and tracker | `packages/viewer/src/app/runtime/studio.ts`, `packages/viewer/src/components/studio/PlayTrackerTab.tsx`, tests | Displays selected review level and gate confirmations; no launch UI |
| Documentation / plan only | this plan | Records no writes to `docs/alexandria/library` and no `:8778` work |

## Affected Behavior Surfaces

CLI tools:

- `ax run` gains `make-a-play --review-level`.
- `ax raven answer` may gain actor-aware review-gate confirmation for F7 gates.
- `ax inspect events schema` lists the new event types.
- `ax inspect state --json` includes run-level review facts.

Plugin workflows:

- The shipped plugin includes review-composition data for make-a-play.
- No shipped skill text is expected to change.

Viewer:

- Play Tracker displays run facts already produced by AX and the Ledger.
- No viewer mutation or launch flow changes.

Evals:

- No existing eval-harness case is known to cover make-a-play review-level
  composition.
- Deterministic tests and plugin validation are the primary gates unless the
  implementation changes shipped skill or agent behavior.

## Implementation Steps

1. Add plugin-owned step-play and review-composition data for make-a-play,
   preserving current module internals and labels where possible.
2. Add an AX domain module that loads or imports the composition data, validates
   it, maps F7 steps to current workflow fragments, and renders a composed
   workflow.
3. Add `make-a-play` to the play manifest and update run help to include
   `--review-level` for that play.
4. Parse `--review-level`, default to `low`, reject invalid values, and reject
   cross-run level changes for an existing `playRunId`.
5. Render the selected composition at run start and launch it through the normal
   Fabro `ax run` path so existing runtime bridge behavior observes human gates.
6. Append `play.review_level_selected` after a run is successfully started and
   before returning success to the caller.
7. Extend the F7 gate-answer path to append `play.review_gate_confirmed`
   idempotently when a selected F7 gate is answered.
8. Make composition rendering consult existing gate-confirm facts for the same
   `playRunId` so retries skip already-confirmed gates.
9. Add event schemas and event-schema tests for the new Ledger facts.
10. Extend project-state projection and `ax inspect state` tests for review facts.
11. Extend Studio API run-event response with matching run facts.
12. Extend viewer runtime schema and Play Tracker display with focused unit tests.
13. Run targeted tests and validation listed below.

## Deterministic Tests And Validation

Required targeted tests:

| Area | Command | Coverage |
|---|---|---|
| AX parser and composition unit tests | `bun test packages/ax/tests/make-a-play.test.ts packages/ax/tests/play-run-input.test.ts` | `--review-level` parsing, default Low Review, invalid values, generated gate seams, custom fourth composition |
| AX CLI black-box behavior | `bun test packages/ax/tests/ax.integration.test.ts` plus any new focused test file | Exit codes, JSON fields, human output fields, fake-Fabro workflow generation |
| Ledger schema | `bun test packages/ax/tests/events.test.ts` | New event types, allowed values, idempotency, negative unknown fields |
| Gate answer idempotency | `bun test packages/ax/tests/play-answer.test.ts packages/ax/tests/scripted-answerer.test.ts` | Review-gate confirmation fact emitted once; already-resolved gates remain success |
| Project-state projection | `bun test packages/ax/tests/state.test.ts` | `playRuns[].review` derives from Ledger facts and does not require play config |
| Studio API | `bun test packages/ax/tests/studio-api.test.ts` | Run events endpoint includes review facts for the selected Fabro run |
| Viewer runtime/model | `pnpm --filter @alexandria/viewer run test` | Schema decode and Play Tracker rendering of review level and gate facts |
| AX package | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run test` | Package-level type and test gate |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Plugin structure after composition/workflow data changes |
| Viewer build/check if viewer changed | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Astro type/build validation |
| Repo gate before handoff | `pnpm run check` | Lint, formatting, markdown, shell, and typecheck gate |

Specific required assertions:

- `ax run make-a-play --json` reports `reviewLevel: "low"`.
- `ax run make-a-play --review-level medium --json` reports gate seams
  `["harden", "derive", "run"]`.
- Low Review generated workflow has no Ground, Brief, Derive, or Test review
  gate.
- High Review generated workflow has Ground, Brief, Harden, Derive, Test, and
  Run review gates.
- A test-defined fourth composition renders through the same function without
  adding switch branches.
- Selecting a different level for an existing `playRunId` fails before launch.
- Re-running the same `playRunId` and level does not duplicate
  `play.review_level_selected`.
- Re-running after a gate-confirm fact does not render that gate again.
- No selected level writes a review-level field onto registry, board, config, or
  built play records.
- New CLI help, JSON output, viewer labels, and composition data do not introduce
  retired setting terminology.
- No implementation files under the retired `:8778` surface are changed.

## Eval Impact

No eval-harness rerun is required by default for this slice because the planned
changes are deterministic CLI/runtime, ledger schema/projection, plugin workflow
data, and viewer display. The shipped skill files under
`packages/alexandria-plugin/skills/` are not expected to change.

If implementation changes a shipped skill or agent file to explain or operate
review levels, run the targeted evals for that surface per `EVALS.md`. If no
existing eval case covers that new product-facing behavior, add a focused eval
case in the same implementation slice or document why deterministic black-box
coverage is sufficient.

Plugin workflow changes still require:

```bash
claude plugin validate ./packages/alexandria-plugin
```

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Review levels become hard-coded branches instead of compositions | Keep Low, Medium, and High in declarative composition data; add a fourth-composition unit test |
| Step-play versioning is only a label and cannot be queried later | Record step-play versions in `play.review_level_selected`; validate every selected composition includes the canonical step order |
| Gate confirmations duplicate on retries | Use stable `playRunId + gateId` idempotency keys and make renderer skip already-confirmed gates |
| A direct interactive Fabro run bypasses AX gate-confirm facts | Route F7 interactive answers through AX-owned answer logic or reject `--interactive` for F7 with a clear exit-2 message |
| The viewer starts owning run-launch choice | Limit viewer work to reading and displaying AX-provided facts; no launch UI in this issue |
| Review level leaks into permanent play config | Add negative tests over registry, board, config, and built play artifacts; keep projection derived from Ledger only |
| Existing `make-a-play:design/build/prove` users break | Preserve those module ids and tests; add `make-a-play` as the composed run id |
| The current Design/Build/Prove modules do not align perfectly with F7 steps | Treat F7 step-plays as versioned wrappers around current node groups and explicitly document node mapping in composition data |
| Retired setting language returns in flags or labels | Use `--review-level`, labels `Low Review` / `Medium Review` / `High Review`, and targeted string tests for new surfaces |
| Generic run bridge ownership becomes muddled | Keep bridge responsible for generic lifecycle events only; emit F7 run facts from AX commands with separate event types |

## Acceptance And Exit Criteria

- Ground, Brief, Harden, Derive, Test, and Run exist as versioned step-play
  composition units.
- Low, Medium, and High Review exist as declarative review compositions.
- `ax run make-a-play` defaults to Low Review.
- A writer can select `low`, `medium`, or `high` at run start through CLI.
- Low Review renders and fires only Gate 1 after Harden and Gate 2 after Run.
- Medium Review adds the after-Derive review gate.
- High Review adds the after-Ground, after-Brief, after-Derive, and after-Test
  review gates in addition to Gate 1 and Gate 2.
- Adding a fourth level is demonstrated as new composition data, not new gate
  machinery.
- The selected review level is queryable from the Ledger and projected run
  state.
- F7 gate confirmations are Ledger run facts with actors.
- No built play carries a permanent review-level config field.
- Retired setting terminology does not appear as a new setting, flag, field, or
  label.
- Re-selecting the same level for the same `playRunId` is idempotent and does
  not duplicate selected-level or gate-confirm facts.
- Retried runs do not re-fire gates already confirmed for the same `playRunId`.
- The viewer Play Tracker displays the selected level and gate facts from AX.
- No retired `:8778` implementation files are changed.
- Targeted tests, plugin validation, viewer validation, and repo checks pass or
  any unavailable check is explicitly documented in the implementation handoff.

## Deferred Follow-Ups

- Viewer run-launch UI for selecting a review level.
- Mid-stream review-level switching.
- Public direct `ax run make-a-play:<step>` entry points for single step-play
  execution, if operators need them beyond composition tests.
- Catalog-home decisions for where review-level presets live as Studio product
  catalog records.
- Gate 2 proof-bar/statistical-policy work beyond recording the gate fact.
- Historical backfill for make-a-play runs created before F7 review-level facts
  existed.
