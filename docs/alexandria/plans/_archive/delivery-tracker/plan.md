# Play Tracker Technical Implementation Plan

Issue: GitHub #294, "Build the Play Tracker - director-facing live run-status tab in Studio"

Goal: add a director-facing Play Tracker tab to the Viewer Studio so a Director can open a live play run link and understand the play, current step, health, progress, ETA, and any standardized problem state without using the raw Factory Runs debug view.

Linked product artifacts:

- `docs/alexandria/plans/delivery-tracker/solution-brief.md` on branch `danversfleury/play-delivery-tracker`
- `docs/alexandria/plans/delivery-tracker/build-plan.md` on branch `danversfleury/play-delivery-tracker`
- `docs/alexandria/plans/delivery-tracker/plan.md` on branch `danversfleury/play-delivery-tracker`
- Reference mockups: `studio/play-tracker.html` and `studio/plays-in-flight.html` on branch `danversfleury/play-delivery-tracker`

Current run context from the issue: `01KVC3HV7GF0XBSFRAXFTY3H4W`, reported as 0 of 10 stages completed.

## Scope

This slice ships the whole v1 tracker in one implementation pass:

- Add a `Play Tracker` tab in `packages/viewer/src/components/studio/StudioApp.tsx`, positioned next to `Factory runs`.
- Add a `PlayTrackerTab` React surface that has two modes: a plays-in-flight landing when no run is selected, and a single-run tracker when `run=<fabro-run-id>` is present.
- Reuse `GET /api/studio/runs/{id}/events` and `fetchStudioRunEvents` as the live run source. The tracker reads `inspect[0]` as the `RunProjection`.
- Add `GET /api/studio/runs` for the active-runs list. Prefer `fabro ps --server <target> --json`; if the local Fabro binary does not support that shape, fall back to the Alexandria play-run ledger/run store so the endpoint still ships.
- Add narrow Viewer runtime schemas and client functions for active runs; keep `RunProjection` itself decoded as unknown and interpreted by pure model code with type guards.
- Add pure tracker model modules for stage parsing, graph/order mapping, ETA, state-machine derivation, and standardized exception sentences.
- Add play-owned leg metadata for labels, descriptions, and cold-start budgets. The default path is a per-play `legs.json` next to the plugin workflow, exposed through the existing runtime playbook projection. The tracker falls back to `RunProjection.spec.graph` labels and handler-kind budgets when metadata is absent.
- Preserve Factory Runs as a co-equal raw-events/debug lens.
- Surface a tracker path from invocation: `?tab=tracker&run=<id>` on the Studio route, derived from the Fabro run id. Current Viewer-launched runs should show/open the tracker once the `play.started` projection contains `fabroRunId`; CLI output should include a deterministic relative tracker path when a Fabro run id is known.

## Non-Goals

- Do not replace or remove Factory Runs.
- Do not use `/api/studio/fabro/.../stages` or `/api/studio/fabro/runs` for the local v1. That proxy returns 501 when the embedded factory is on a Unix socket.
- Do not add pause, cancel, approve, deny, or any other control surface to the tracker.
- Do not add historical median estimates. The v1 estimator uses authored budgets plus live pace.
- Do not add push notifications or proactive alerts.
- Do not add phase grouping in v1. The reference branch explicitly moved v1 to a windowed step list plus "View all N steps".
- Do not write to `docs/alexandria/library`.
- Do not edit vendored repositories under `repos/`.

## Linked Product-Plan Summary

The product plan defines Play Tracker as the director-facing counterpart to Factory Runs. Both read the same underlying Fabro run data, but they serve different jobs:

- Factory Runs: raw event stream and inspect payload for debugging.
- Play Tracker: narrative status, progress, ETA, and "is this OK?" interpretation.

The tracker must answer, without scrolling: what play is running, where Raven is now, how long remains, whether the run is healthy, and what happened if it is not. The mockup's preview control bar is scaffolding only; the states it fakes are the real v1 states:

`on-track`, `running-slow`, `circling-back`, `stuck`, `refused`, `failed`, `blocked`, `done`.

Exception copy is not free text. It is a fixed template taxonomy filled from run signals:

- Failure: `{step} failed - {why} - at {when}.`
- Double-back: `Doubled back to {step} at {when} because {why}.`
- Stuck: `Stuck - tried {step} {N}x without getting past it; needs a human.`
- Blocked: `Waiting on you - {step} needs input.`

The corrected data path is `GET /api/studio/runs/{id}/events`, whose `inspect[0]` value is the Fabro `RunProjection` produced by `fabro inspect --json`. The double-back reason comes from `RunProjection.spec.graph.edges`, not a second call.

## Current Gap

`packages/viewer/src/components/studio/StudioApp.tsx` currently has tabs for `raven`, `damien`, `board`, `play`, and `runs`. The `RunsView` debug surface already accepts a run id, calls `fetchStudioRunEvents`, shows a raw event log, derives a simple `status.kind`, and has a loop-warning heuristic based on stage keys.

`packages/ax/src/effects/studio-api.ts` already serves `GET /api/studio/runs/{id}/events` by shelling:

- `fabro inspect --server <target> <run-id> --json`
- `fabro events --server <target> <run-id>`

It also intentionally 501s `/api/studio/fabro/*` for Unix-socket embedded factories. That confirms the tracker must not use the Fabro HTTP proxy for local v1 data.

Missing today:

- No Play Tracker tab.
- No director-facing `RunProjection` to tracker model.
- No active-runs list endpoint that works against the embedded Unix-socket factory.
- No ETA/state-machine/exception-sentence model.
- No leg-budget metadata exposed to the Viewer.
- No tracker link/path in the play invocation surfaces.

## Architectural Boundaries

- Viewer runtime boundary: new fetches belong in `packages/viewer/src/app/runtime/studio.ts` with Effect, schema decode, and typed Viewer errors. Visual components receive ordinary props/state.
- Tracker model boundary: keep `RunProjection` interpretation in pure TypeScript modules under `packages/viewer/src/components/studio/`, with focused unit tests. Do not bury state-machine logic inside JSX.
- AX Studio API boundary: `packages/ax/src/effects/studio-api.ts` may add read-only Studio endpoints. It should shell the configured embedded Fabro binary through the same `embeddedFabro` and `runCommandSync` pattern already used for run events.
- Play contract boundary: plugin/AX own play metadata. Viewer should not parse broad plugin or workspace files ad hoc. If `legs.json` is introduced, load/validate it through AX/project-state code and expose a narrow browser-facing projection.
- CLI boundary: if `ax run` output gains `trackerPath`, preserve deterministic stdout/stderr and existing exit codes; cover it with black-box tests.
- Factory Runs boundary: leave the raw debug lens intact and adjacent to Play Tracker.
- Vendored reference boundary: `repos/fabro` is read-only reference material. Implementation should verify the actual bundled/local Fabro binary supports the planned `ps --json` shape before relying on it.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Viewer Studio tabs | `packages/viewer/src/components/studio/StudioApp.tsx`, `packages/viewer/src/components/library/LibraryBrowserApp.tsx` | Register `tracker`, keep it next to `runs`, pass any needed playbook/run context into Studio. |
| Tracker UI | New `packages/viewer/src/components/studio/PlayTrackerTab.tsx` | Render plays-in-flight landing and single-run tracker matching the mock: at-a-glance box, progress bar, windowed steps, More info, problem state, View all. |
| Tracker model | New `playTrackerModel.ts`, `playTrackerEstimator.ts`, `playTrackerMessages.ts`, tests | Pure mapping from `RunProjection` plus leg metadata to UI model, ETA range, state, and standardized sentences. |
| Viewer Studio runtime | `packages/viewer/src/app/runtime/studio.ts` | Add `fetchStudioActiveRuns`; keep `fetchStudioRunEvents`; decode active-runs response narrowly. |
| Viewer runtime schemas | `packages/viewer/src/app/runtime/schemas.ts`, `client.ts` if playbook shape changes | Expose optional tracker leg metadata on runtime playbook only if the implementation chooses that path. |
| AX Studio API | `packages/ax/src/effects/studio-api.ts`, `packages/ax/tests/studio-api.test.ts` | Add `GET /api/studio/runs` with local embedded-factory support and deterministic error/fallback behavior. |
| AX play metadata | `packages/ax/src/domain/plays.ts`, `packages/ax/src/effects/project-state-loader.ts`, related tests | Load and validate optional per-play `legs.json`; expose labels/descriptions/budgets without moving play semantics into Viewer. |
| Plugin workflow metadata | `packages/alexandria-plugin/workflows/*/legs.json` | Add play-owned tracker leg metadata. This is metadata for visualization/ETA, not a guided-play prompt change. |
| Invocation link | `packages/ax/src/commands/play.ts`, `packages/ax/tests/*`, Viewer Playbook run table as needed | Include or derive `/studio?tab=tracker&run=<fabroRunId>` when a Fabro run id is known. |
| Browser validation | `packages/viewer/tests/library-browser.spec.ts`, fixture server as needed | Cover direct tracker URL, active-runs landing, and desktop/mobile visual constraints. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Alexandria plugin skills | No skill prompt or agent behavior should change in this slice. | No eval-harness rerun for skills unless implementation edits a skill file. |
| Plugin workflow payload | Add optional `legs.json` tracker metadata beside workflows. | Run `claude plugin validate ./packages/alexandria-plugin`; add deterministic metadata validation in AX tests. |
| AX CLI `ax run` | If `fabroRunId` is known, output a relative tracker path in JSON/text results. Exit codes remain unchanged. | Add black-box CLI tests for `trackerPath`, stdout fields, and failure/unknown-run-id behavior. |
| Viewer runtime/playbook | Viewer may expose tracker links and leg metadata, but does not change play execution. | Viewer unit, build, and browser validation. |

## Data Contracts

### Active Runs Endpoint

Add `GET /api/studio/runs` returning:

```json
{
  "runs": [
    {
      "runId": "01KVC3HV7GF0XBSFRAXFTY3H4W",
      "playId": "frame-the-problem",
      "playName": "Frame the Problem",
      "workflowSlug": "frame-the-problem",
      "workflowName": "Frame the Problem",
      "status": "running",
      "startedAt": "2026-06-18T00:00:00.000Z",
      "elapsedMs": 123000,
      "trackerPath": "/studio?tab=tracker&run=01KVC3HV7GF0XBSFRAXFTY3H4W"
    }
  ],
  "source": "fabro-ps"
}
```

Implementation notes:

- Prefer `fabro ps --server <target> --json` because the vendored CLI reference shows `ps` filters to active runs by default and supports global `--json`.
- Normalize Fabro rows from fields such as `run_id`, `workflow_slug`, `workflow_name`, `status`, `start_time`, and `wall_time_ms`.
- If `fabro ps` fails or is unavailable, use the Alexandria ledger/project state to return active play runs with known `fabroRunId`; set `source` to `ledger-fallback`.
- If the embedded factory is not running, return 503 with the same actionable style as the existing run-events endpoint.

### Leg Metadata

Add a per-play `legs.json` schema owned by the play/workflow package:

```json
{
  "playId": "frame-the-problem",
  "legs": [
    {
      "nodeId": "locate",
      "label": "Locate the thread boundary",
      "description": "Find the messages and context this play should inspect.",
      "typicalSeconds": 60,
      "kind": "agent"
    }
  ]
}
```

Rules:

- `nodeId` must match a non-structural workflow graph node.
- `label` should match the graph label unless there is an intentional display override.
- `typicalSeconds` is the cold-start budget used by the ETA estimator.
- Missing metadata is not fatal. The tracker falls back to graph labels and handler-kind defaults.

### Tracker Model

The tracker model should expose a component-friendly object:

```ts
interface PlayTrackerModel {
  runId: string;
  playName: string;
  state: "on-track" | "running-slow" | "circling-back" | "stuck" | "refused" | "blocked" | "failed" | "done";
  currentStep: TrackerStep | null;
  steps: TrackerStep[];
  progress: { completed: number; total: number; percent: number; label: string };
  eta: { lowSeconds: number | null; highSeconds: number | null; confidence: "defaults-only" | "authored" | "live-pace"; label: string };
  exception: { kind: string; sentence: string; targetStepId?: string } | null;
}
```

Model rules:

- Parse stage ids as `nodeId@visit`; visits greater than 1 are re-entry signals.
- Derive current step from `running` or `retrying` stage state first, then latest non-terminal activity.
- Order by `legs.json`/playbook order where available; otherwise derive a golden-path order from `spec.graph` and fall back to first-seen stage order.
- Treat loops as revisits of a leg, not as a separate hardcoded pipeline length.
- Keep structural nodes (`start`, `exit`) out of the normal step list, while still using exit edges for refused detection.

## State Machine

Priority order matters:

1. `refused`: terminal success reached through an early edge to `exit` whose label/condition marks refusal, with main work nodes never run. If this cannot be distinguished from normal completion, return `done`.
2. `done`: `status.kind === "succeeded"` and not refused.
3. `stuck`: failed run whose failure detail category is `compilation_loop`, or a loop-cap equivalent from visits when the failure shape is missing.
4. `failed`: `status.kind === "failed"` and not stuck.
5. `blocked`: `status.kind === "blocked"`, `blocked_reason === "human_input_required"`, or non-empty `pending_interviews`.
6. `circling-back`: any non-structural node has a visit >= 2 and the run has not completed past the revisited range.
7. `running-slow`: live pace factor exceeds the threshold chosen in the estimator, with no higher-priority exception.
8. `on-track`: active/running with none of the above.

Double-back reason:

- Use `RunProjection.spec.graph.edges`.
- Find the edge from the checker/failing node to the revisited node.
- Prefer edge `label`; fall back to edge `condition`; fall back to `rework`.
- Do not parse DOT in the Viewer for this; use the structured projection graph.

## Estimator

Inputs:

- Leg budgets from `legs.json`.
- Handler-kind defaults when no budget exists.
- Actual completed-stage wall time from `StageProjection.timing.wall_time_ms` or equivalent timing fields.
- Running-stage elapsed time from `started_at` to now when wall time is absent.

Algorithm:

1. Compute expected time for completed valid steps.
2. Compute actual time for completed valid steps.
3. Pace factor = `actual / expected`, clamped to a reasonable range so one tiny fast/slow step does not dominate.
4. Remaining expected time = sum budgets for uncompleted work, plus current-step overrun if any.
5. ETA range widens early and narrows as completed/budgeted coverage increases.
6. Suppress countdown for `blocked`, `stuck`, `failed`, and `refused`; show the problem sentence instead.

The UI should lead with progress certainty and present time as a range, not a precise countdown.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX unit/black-box tests | `pnpm --filter @alexandria/ax run test` | Covers Studio API, active-runs fallback, CLI tracker path, play metadata loading, and existing runtime behavior. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Ensures endpoint and play metadata changes keep TypeScript contracts sound. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Covers tracker model, estimator, messages, runtime client decode, and route behavior. |
| Viewer check | `pnpm --filter @alexandria/viewer run check` | Astro/TypeScript validation. |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Ensures the new tab and assets build in the static viewer. |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Covers direct `/studio?tab=tracker&run=...`, active-runs landing, and desktop/mobile layout. |
| Plugin validation | `claude plugin validate ./packages/alexandria-plugin` | Required if `legs.json` is added to the plugin payload. |
| Optional formatting check | `pnpm --filter @alexandria/viewer run format:check` and `pnpm --filter @alexandria/ax run format:check` | Confirms changed TS/JSON formatting. |

Manual validation:

- Start the viewer with `ax start viewer`.
- Ensure a local embedded Fabro server has a live or recent run.
- Open `/studio?tab=tracker&run=01KVC3HV7GF0XBSFRAXFTY3H4W` or another live run id.
- Confirm the tracker shows play name, current step, pulsing Raven, ETA range, progress, and any relevant problem sentence.
- Open `/studio?tab=tracker` without a run and confirm active runs are listed and link into the tracker.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| Viewer Play Tracker | No eval-harness coverage; deterministic UI/model surface. | Add unit and browser tests. No eval harness required. | `pnpm --filter @alexandria/viewer run test`; `pnpm --filter @alexandria/viewer run test:e2e`. |
| AX Studio API / CLI output | Covered by deterministic Bun tests, not eval harness. | Extend AX tests for active-runs endpoint and `ax run` tracker path. No eval harness required. | `pnpm --filter @alexandria/ax run test`. |
| Plugin workflow metadata | Plugin validation exists; no skill eval unless skill text changes. | Validate plugin package. Add metadata consistency tests in AX if possible. | `claude plugin validate ./packages/alexandria-plugin`. |
| Product skills/agents | No prompt or agent behavior change planned. | Do not run skill evals. If implementation edits `packages/alexandria-plugin/skills/*` or agent prompts, rerun the relevant eval set per `EVALS.md`. | Not required for the planned slice. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| `RunProjection` shape is richer and less stable than the Viewer needs. | Keep the wire value `unknown`; interpret only the fields the tracker needs with narrow type guards and fixtures. |
| Active-runs command differs across the actual bundled Fabro binary and the vendored reference. | Verify the local binary help/JSON shape during implementation. Keep a ledger/run-store fallback so `/api/studio/runs` still ships. |
| Refused detection mislabels a normal early success. | Only return `refused` when an explicit early exit edge to `exit` is traversed and main work nodes did not run; otherwise return `done`. |
| ETA implies false precision. | Show a range and confidence label; suppress ETA for blocked/stuck/failed/refused states. |
| Leg metadata drifts from workflow graph nodes. | Validate `legs.json` node ids against the parsed workflow graph in deterministic tests; fall back gracefully when metadata is missing. |
| Direct tracker links may arrive before `fabroRunId` is known. | Viewer-launched runs keep polling project state until `fabroRunId` appears; CLI includes `trackerPath` only when known and otherwise returns `null` without changing exit codes. |
| The new director lens hides useful debug detail. | Keep Factory Runs adjacent and add "More info" / problem detail affordances that can point back to raw run detail without duplicating it. |
| Mobile layout regresses because the mock was desktop-first. | Add Playwright coverage for desktop and narrow mobile viewports with no horizontal overflow. |

## Implementation Steps

1. Add tracker tab wiring in `StudioApp.tsx`: extend the `StudioTab` union/guard, add `{ key: "tracker", label: "Play Tracker" }` immediately after Factory Runs, and render `PlayTrackerTab`.
2. Add active-runs API support in AX: implement `GET /api/studio/runs`, normalize `fabro ps --json` rows, add ledger fallback, and cover 200/503/fallback cases in `studio-api.test.ts`.
3. Add Viewer Studio runtime support: `StudioActiveRunsSchema`, `fetchStudioActiveRuns`, and tests for decode failures and request paths.
4. Add leg metadata support: introduce `legs.json` schema, load it through AX/project-state or an equivalent narrow API, add plugin workflow metadata, and validate consistency against workflow graph nodes.
5. Add pure tracker model modules: stage id parser, graph order builder, projection-to-steps mapper, state-machine function, estimator, and exception-message templates.
6. Add model unit tests using projection fixtures for on-track, slow, circling-back, stuck loop cap, blocked, failed, refused, and done.
7. Build `PlayTrackerTab`: no-run landing, run-id input fallback, active-runs rows, 5 second polling for selected runs, at-a-glance status, progress, ETA, current-step Raven, windowed step list, More info, View all, and problem detail affordance.
8. Add invocation links: derive `/studio?tab=tracker&run=<fabroRunId>` wherever play run data displays a Fabro id; add `trackerPath` to `ax run` JSON/text output if the run id is known.
9. Add Viewer browser coverage for `/studio?tab=tracker`, `/studio?tab=tracker&run=<id>`, no active runs, mocked active runs, mocked problem states, and desktop/mobile overflow.
10. Run the deterministic verification commands and manually validate against a real local Fabro run.

## Acceptance / Exit Criteria

1. `/studio?tab=tracker` opens the Play Tracker tab and shows a plays-in-flight list from `GET /api/studio/runs`.
2. `/studio?tab=tracker&run=<id>` opens the same tab directly on that run.
3. A live run shows play name, current step, a pulsing Raven on the current step, elapsed/current-step timing, progress, and an ETA range.
4. Circling-back, stuck, refused, blocked, failed, and done states render from real `RunProjection` signals, not preview controls or hardcoded mock state.
5. Exception messages use the standardized templates and fill their fields from the projection.
6. Double-back "why" comes from `RunProjection.spec.graph.edges`.
7. Active-runs listing works for the local Unix-socket embedded factory and does not use the 501ing `/api/studio/fabro/*` proxy.
8. Factory Runs remains present and functional as the raw debug view.
9. `ax run --json` and text output remain deterministic, preserve exit codes, and include a tracker path when `fabroRunId` is known.
10. Viewer unit/build/browser validation, AX tests/typecheck, and plugin validation pass.

## Deferred Follow-Ups

1. Historical median ETA layer over past runs.
2. SSE/live attach stream instead of polling.
3. Phase grouping once the play model has an authored or derived phase layer.
4. Multi-user provenance fields such as requester and conversation/context label.
5. Notifications or proactive alerts when a run blocks, fails, or completes.
6. Control actions from the tracker, if a future Director workflow needs them.
