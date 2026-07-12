# Issue 548 - Plugin Monitor Pending Human-Input Wakes

## Goal

When the Claude Code plugin monitor connects, it must deliver a wake for every
currently pending `play.human_input_requested` ask, even when the request event
was written before the monitor lease existed or before this monitor process was
listening.

The important contract is connection-time reconciliation, not a different live
event stream:

- pending asks existing at connect time wake the session within 10 seconds of
  lease registration;
- reconnecting while an ask is still pending re-delivers that ask;
- resolving the ask suppresses future catch-up wakes;
- live `play.human_input_requested` events still deliver exactly once and keep
  their existing wake shape.

## Scope

In scope:

- `packages/ax` monitor/runtime behavior for
  `ax internal host claude monitor`.
- The wake-subscription delivery path used by the shipped Claude Code plugin
  monitor.
- A deterministic ledger-derived pending-human-input projection helper if the
  current projection does not expose pending question ids directly.
- Focused black-box AX tests and, if needed, a plugin wrapper integration test.

Out of scope:

- No `SKILL.md` changes in this slice.
- No changes to Front-of-House, Frame-the-Problem, or Fabro workflow prompts.
- No changes to how `ax raven answer` submits answers.
- No Viewer UI changes.
- No changes under `docs/alexandria/library/`.
- No vendored repository edits under `repos/`.

## Linked Product-Plan Summary

There is no separate product-level plan linked from Issue 548. The issue itself
is the product contract.

The issue describes a real Front-of-House walk on July 1, 2026:

- `play.started` at `21:46:38`;
- `play.human_input_requested` at `21:46:40`;
- the Claude Code monitor lease appeared at `21:47:28`;
- Raven then waited indefinitely for a wake that had already been emitted.

The requested fix is to reconcile monitor connection against pending run state
instead of relying only on events observed after the monitor cursor starts.

## Current Implementation Gap

The current monitor flow in `packages/ax/src/commands/host.ts` is:

1. resolve subscriptions for the connection;
2. write a connection lease;
3. call `runtime.listEventsByCursor`;
4. deliver wakes for matching events returned after the cursor;
5. advance the cursor over each source event.

The JSONL store bootstraps a missing cursor at the ledger tail unless
`fromBeginning` is true. That is correct for normal live monitoring, but it
means a `play.human_input_requested` event that pre-dates the monitor connection
is skipped forever.

The live wake path also records `session.wake.requested` with an idempotency key
based on `(host, subscriptionId, cursorId, sourceEventId)`. That protects normal
live delivery from duplicates, but Issue 548 needs a narrower rule: a still
pending question must be re-delivered on reconnect, while catch-up and live
delivery inside the same connection attempt must not double-deliver.

## Architectural Boundaries

- Keep the monitor deterministic in `packages/ax`; the plugin wrapper should
  continue to be a thin shell that registers subscriptions and delegates to AX.
- Keep live cursor semantics unchanged. Do not rewind cursors or change the
  default tail bootstrap behavior.
- Derive pending asks from the Alexandria ledger, not from session-local launch
  ownership. A parked run from another walk is still eligible for a catch-up
  wake; the skill decides whether to adopt or decline it.
- Use the same delivered wake line shape as live delivery:

  ```json
  {
    "message": "...",
    "event": {
      "type": "play.human_input_requested",
      "payload": {
        "fabroRunId": "...",
        "questionId": "...",
        "playRunId": "...",
        "prompt": "..."
      }
    }
  }
  ```

- Use Effect patterns already present in `host.ts`, `project-state-loader.ts`,
  `runtime-client.ts`, and `jsonl-state-store.ts`.

## File And Subsystem Touch Map

Likely implementation files:

- `packages/ax/src/commands/host.ts`
  - Add a connection-time pending-human-input catch-up pass.
  - Run the catch-up pass after lease registration and before live cursor
    processing.
  - Run catch-up once per monitor process in `--follow`; run it once for each
    one-shot invocation because a one-shot command is a fresh connect.
  - Preserve existing live wake delivery and cursor advancement.

- `packages/ax/src/domain/pending-human-input.ts` or
  `packages/ax/src/domain/project-state.ts`
  - Add a pure helper that derives currently pending human-input asks from
    ledger events.
  - It should key asks by `(fabroRunId, questionId)`, retain the source
    `play.human_input_requested` event, delete on
    `play.human_input_resolved`, and delete all asks for a run on terminal
    `play.completed` / `play.failed` / terminal status observations.

- `packages/ax/src/domain/state-events.ts`
  - Only touch if implementation updates wake audit descriptors. The runtime
    payload validators already allow optional `subscriptionId`; the event schema
    descriptor currently omits it. If catch-up tests assert schema output,
    update descriptors and tests in the same slice.

- `packages/ax/tests/claude-monitor.test.ts`
  - Add black-box monitor tests for the Issue 548 contract.

- `packages/ax/tests/pending-human-input.test.ts` or existing projection tests
  - Add pure projection coverage if a new helper is introduced.

- `packages/alexandria-plugin/tests/claude-monitor-wrapper.test.ts`
  - Add a real-wrapper regression only if needed to prove the shipped wrapper's
    auto-registered `play.human_input_requested` subscription participates in
    catch-up.

Likely untouched files:

- `packages/alexandria-plugin/scripts/claude-monitor.sh`
- `packages/alexandria-plugin/monitors/monitors.json`
- plugin skills under `packages/alexandria-plugin/skills/`
- Viewer source under `packages/viewer/`

## Behavior Surfaces

| Surface | Files | Behavior change | Required coverage |
|---|---|---|---|
| AX Claude monitor CLI | `packages/ax/src/commands/host.ts` | On connect, pending human-input asks for the connection's subscribed event types are delivered before live follow. | Black-box CLI monitor tests for stdout JSON lines, exit code 0, lease creation, and dedupe. |
| Wake subscription domain | `packages/ax/src/domain/wake-subscriptions.ts` only if refactoring shared helpers | Matching rules stay event-type based; no subscription manifest change. | Existing `wake-subscriptions.test.ts`; add tests only if helper behavior moves. |
| Pending human-input projection | new helper or `project-state.ts` | Ledger events can answer "which `(fabroRunId, questionId)` asks are still pending?" | Pure tests for requested, resolved, terminal, malformed/missing fields, and multiple asks. |
| Plugin monitor wrapper | likely tests only | Wrapper still registers `play.human_input_requested` and delegates to AX; no script behavior change planned. | Wrapper test if catch-up needs shipped-path proof; plugin validation only if plugin payload files change. |
| Skills and agents | none | No behavior wording change. The existing event-log and Front-of-House skills already key asks by `(fabroRunId, questionId)`. | No skill eval rerun required. |

## Technical Design

### 1. Derive Pending Human-Input Asks From The Ledger

Add a pure helper that accepts ordered `AlexandriaStateEvent[]` and returns a
stable list of currently pending asks.

Suggested shape:

```ts
export interface PendingHumanInputAsk {
  fabroRunId: string;
  playId: PlayId;
  playRunId: string;
  prompt: string;
  questionId: string;
  sourceEvent: AlexandriaStateEvent;
}
```

Rules:

- On `play.human_input_requested`, require non-empty `fabroRunId`,
  `questionId`, `playRunId`, `playId`, and `prompt`; store or replace the ask
  by `(fabroRunId, questionId)`.
- On `play.human_input_resolved`, delete that exact `(fabroRunId, questionId)`.
- On `play.completed` or `play.failed`, delete all asks matching the event's
  `fabroRunId` or `playRunId`.
- On `play.status_observed` with `status` of `succeeded`, `failed`, or `dead`,
  also delete matching asks.
- Return asks sorted by source event order so reconnect delivery is stable.

Do not filter by "runs this session launched". The orphaned parked-run case is
part of acceptance.

### 2. Add A Catch-Up Pass To The Monitor Connect Path

In `runMonitorPass`, after subscriptions are resolved and after
`refreshConnectionLease` succeeds:

1. load a current ledger snapshot from the existing project state store;
2. derive pending asks from that snapshot;
3. filter to asks whose `sourceEvent` matches at least one subscription on the
   current connection;
4. deliver one wake per pending `(fabroRunId, questionId)`.

The catch-up pass must use the same `wakeLine` / delivery payload shape as live
delivery. The source event should be the original
`play.human_input_requested` event.

Run catch-up only at the connection boundary:

- for `--once`, run it once during that command invocation;
- for `--follow`, run it on the first pass after the process starts, then rely
  on the live cursor for new events;
- when the monitor process is killed and restarted, the new process gets a new
  catch-up pass.

This preserves live wake behavior for events that fire while the monitor is
already running.

### 3. Re-Delivery And Dedupe Semantics

The implementation must distinguish two kinds of dedupe:

- **within one connection attempt:** catch-up and live cursor processing must
  not produce two actionable wakes for the same `(fabroRunId, questionId)`;
- **across reconnects:** a still-pending ask must be delivered again, even if a
  prior monitor process already recorded `session.wake.requested`.

Plan the monitor with an in-memory per-process set, for example
`deliveredPendingAskKeys`, keyed by `(fabroRunId, questionId)`.

For catch-up wake audit events, use an idempotency scope that is unique to the
monitor connection attempt, such as a generated `connectionAttemptId` passed
from `runClaudeMonitor` / `startFollowMonitor` into `runMonitorPass`.

Concretely:

- keep the existing live wake idempotency key unchanged;
- add an optional idempotency suffix/scope to `wakeRequestedInput`,
  `wakeDeliveredInput`, and `wakeFailedInput`;
- use that suffix only for catch-up delivery;
- after catch-up delivers an ask, record its pending ask key in the in-memory
  set;
- before live delivery of a `play.human_input_requested` event, skip it if the
  same ask key was already delivered by catch-up in this process.

This allows reconnect re-delivery while preventing the connect-boundary double
wake.

### 4. Keep Live Cursor Behavior Unchanged

Do not change:

- cursor validation;
- missing-cursor tail bootstrap;
- cursor advancement order;
- live matching by subscription event type;
- stdout JSON-line shape;
- delivery failure handling for live wakes.

Existing live monitor tests should continue to pass without assertion churn
except where new human-input-specific catch-up tests require additional helper
fixtures.

### 5. Resolved And Terminal Negative Cases

Resolved or terminal asks should be suppressed by projection, not by
session-local delivery history.

The catch-up sweep should produce no wake when the ledger snapshot already has:

- `play.human_input_resolved` for the same `(fabroRunId, questionId)`;
- `play.completed` or `play.failed` for the same run;
- terminal `play.status_observed` for the same run.

If a resolve happens after the catch-up snapshot but before delivery, the
delivery may race. That is acceptable for this slice because `ax raven answer`
already treats resolved questions idempotently, but tests should cover the
deterministic "resolved before sweep" case.

## Deterministic Tests

Add or update AX tests:

- `packages/ax/tests/claude-monitor.test.ts`
  - pending-at-connect: append `play.human_input_requested`, then run the
    monitor with a missing/tail cursor and a matching subscription; assert exit
    code 0, one JSON wake line, and payload fields `fabroRunId`,
    `questionId`, `playRunId`, `prompt`.
  - reconnect re-delivery: run the same one-shot monitor twice while the ask is
    still pending; assert each invocation emits one wake.
  - resolved suppression: append request then `play.human_input_resolved`; run
    monitor; assert no stdout wake.
  - terminal suppression: append request then `play.completed` or `play.failed`;
    run monitor; assert no stdout wake.
  - live-path dedupe: initialize cursor while no ask exists, append
    `play.human_input_requested`, then run monitor; assert exactly one wake and
    no duplicate `session.wake.*` action for the same invocation.
  - no session filter: append a pending request for a stale/orphaned play run
    not launched by the current test session; assert it still wakes.
  - non-human historical events remain historical: preserve the existing
    "bootstraps a missing cursor at tail and emits no historical wake" behavior
    for `play.started`.

- Pure projection helper tests, if using a new helper file:
  - multiple pending asks on one run;
  - resolving one ask leaves the other;
  - malformed request payloads are ignored;
  - terminal events clear all asks for a run.

- `packages/alexandria-plugin/tests/claude-monitor-wrapper.test.ts`, if added:
  - use the real AX shim and wrapper;
  - append a pending `play.human_input_requested` before wrapper start;
  - run wrapper one-shot with `--json-lines`;
  - assert the shipped auto-registered play lifecycle subscription receives the
    catch-up wake.

Recommended commands after implementation:

```bash
cd packages/ax && bun test tests/claude-monitor.test.ts tests/wake-subscriptions.test.ts tests/run-bridge.test.ts
```

If a pending projection helper or event schema descriptor changes:

```bash
cd packages/ax && bun test tests/state.test.ts tests/events.test.ts
```

If plugin wrapper tests change:

```bash
cd packages/alexandria-plugin && bun test tests/claude-monitor-wrapper.test.ts
```

If any plugin payload file changes, also run from the repo root:

```bash
claude plugin validate ./packages/alexandria-plugin
```

For broader package safety:

```bash
pnpm --filter @alexandria/ax run typecheck
pnpm --filter @alexandria/ax run lint
```

## Manual Acceptance Test

Use a real initialized Alexandria project with the viewer/runtime bridge and
Fabro available.

1. Launch a play that reaches a human gate, such as Front-of-House Walk.
2. Wait until `play.human_input_requested` is present in the ledger and the
   active run is `needs_human_feedback`.
3. Start the Claude monitor:

   ```bash
   ax internal host claude monitor \
     --connection host:claude-code:default \
     --cursor host:claude-code:default \
     --follow \
     --json-lines
   ```

4. Confirm the lease appears:

   ```bash
   ax inspect connections list --json
   ```

5. Confirm the session receives the wake within 10 seconds of lease
   registration.
6. Kill the monitor with the ask still pending, restart it, and confirm the wake
   is delivered again.
7. Answer the ask through the normal Raven answer path.
8. Restart the monitor again and confirm that question no longer produces a
   catch-up wake.
9. With the monitor already running, trigger a fresh human gate and confirm it
   produces exactly one wake.

## Eval Impact

No eval-harness rerun is required for this slice if implementation stays inside
AX monitor/runtime code and tests.

Reasoning:

- No product-facing `SKILL.md`, agent, prompt, or workflow behavior changes are
  planned.
- Existing Front-of-House and event-log skills already know how to handle a
  `play.human_input_requested` wake with `fabroRunId`, `questionId`,
  `playRunId`, and `prompt`.
- The regression is deterministic monitor delivery, so black-box CLI tests are
  the right gate.

If implementation unexpectedly changes plugin skills, rerun the targeted evals
for the touched skill. For `front-of-house-walk/SKILL.md`, that means the
Front-of-House eval cases under `packages/ax/tests/eval-cases/front-of-house-walk/`
or the current replacement harness named by `EVALS.md`.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Catch-up suppresses reconnect re-delivery because existing `session.wake.requested` events look like duplicates. | Use a catch-up idempotency scope per connection attempt and in-memory dedupe only within the current monitor process. Add a reconnect test. |
| Catch-up and live cursor both deliver the same pending ask on startup. | Run catch-up first, record `(fabroRunId, questionId)` in an in-memory delivered set, and have live processing skip matching human-input events in that process. Add a live-path dedupe test. |
| Running catch-up on every follow poll spams the same pending ask. | Run catch-up only on the first pass of a follow monitor process. One-shot invocations remain fresh connects by design. |
| Ledger-derived pending state misses a current ask if the request event is malformed. | Require the typed fields needed to deliver a useful wake; ignore malformed entries and keep event-schema tests covering valid payloads. |
| Terminal or answered runs still wake because only status is checked. | Projection must delete by explicit `play.human_input_resolved` and terminal run events/status. Add resolved and terminal negative tests. |
| Broadening shared `runMonitorPass` accidentally changes Codex monitor behavior. | Keep the feature scoped to Claude/plugin delivery unless implementation intentionally opts into shared behavior. If shared code is touched, add Codex monitor regression coverage or explicitly gate catch-up on `host === "claude-code"` and `deliveryMode === "plugin-monitor"`. |
| Event schema descriptor drift around optional `subscriptionId` confuses agents using `ax inspect events schema`. | If wake audit payload code is touched, align descriptors with validators and update `events.test.ts`. |

## Implementation Steps

1. Add the pure pending-human-input projection helper and tests.
2. Refactor monitor delivery helpers so catch-up can use the same wake line and
   delivery mechanics as live delivery while supplying an optional idempotency
   scope.
3. Add a `connectionAttemptId` and in-memory delivered pending-ask set to the
   Claude monitor execution path.
4. Add the catch-up pass after `refreshConnectionLease` and before
   `listEventsByCursor`.
5. Ensure `--follow` runs catch-up once on process start and then uses only live
   cursor polling.
6. Add black-box monitor tests for pending-at-connect, reconnect re-delivery,
   resolved suppression, terminal suppression, live-path dedupe, and orphaned
   pending asks.
7. Add or update plugin wrapper tests only if needed to prove the shipped
   wrapper path.
8. Run focused AX tests and type/lint checks.
9. Run plugin tests/validation only if plugin files or wrapper tests changed.
10. Perform the manual acceptance test against a real pending human gate before
    closing the issue.

## Acceptance And Exit Criteria

- A pending `play.human_input_requested` that exists before monitor connection
  produces a wake within 10 seconds of lease registration.
- Killing and restarting the monitor while the ask remains pending re-delivers
  the wake.
- Answering the ask suppresses future catch-up wakes for that question.
- A `play.human_input_requested` emitted while the monitor is live produces
  exactly one wake.
- Terminal runs and answered questions produce no catch-up wake.
- A stale pending ask from another walk still produces a wake the session can
  decline.
- Existing live wake delivery shape is unchanged.
- Focused black-box AX tests pass.
- No plugin skill changes are included.

## Deferred Follow-Ups

- Consider exposing pending question ids on the public `playRuns` projection or
  `/api/studio/runs` if Viewer needs to display exact pending asks later. This
  issue only needs monitor catch-up.
- Consider adding a monitor diagnostics command that lists pending catch-up asks
  without delivering them.
- Consider adding a durable `connectionAttemptId` or `leaseId` to connection
  lease files in a future schema version if more reconnect-aware delivery
  semantics are needed.
