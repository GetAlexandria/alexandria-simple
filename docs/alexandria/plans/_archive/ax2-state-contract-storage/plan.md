# AX2 State Contract And Storage

- Goal: define the Alexandria Next state contract and storage abstraction that
  will support Viewer Next, `ax2` state commands, plugin skills, and host
  background event adapters.
- Primary packages: `packages/ax-next`, `packages/viewer-next`,
  `packages/alexandria-next-plugin`.
- Related plans:
  `docs/alexandria/plans/ax2-source-assessment-slice/plan.md` and
  `docs/alexandria/plans/ax-next-viewer-bootstrap/plan.md`.

## Why This Comes First

The canvas spike proved a valuable interaction loop, but it used spike-local
state files under `docs/alexandria/.canvas-state/`. Alexandria Next should not
copy that storage shape directly.

The shared primitive for Next should be:

```text
project files + append-only state events -> current Alexandria state
```

This lets the viewer, CLI, agent skills, and background session adapters all
observe and mutate one contract instead of each inventing a private state file.

## Scope

In scope:

- Define the event envelope and initial event taxonomy.
- Define how the existing AX2 ledger taxonomy expands beyond play-scoped
  events.
- Define the durable storage abstraction for append-only state events.
- Choose the first storage backend.
- Define projection boundaries for current Alexandria state.
- Define cursor semantics for viewers, agents, and host adapters.
- Break implementation into independently verifiable slices.

Out of scope:

- Building the full Viewer Next redesign.
- Implementing Claude Code plugin monitors.
- Implementing Codex app-server injection or steering.
- Porting the canvas spike UI.
- Migrating Alexandria 1 plugin behavior.
- Choosing a permanent database technology before JSONL proves insufficient.

## Current State

AX2 already has several pieces that should be reused:

- Project config lives at `.alexandria-next/alexandria-config.json`.
- The config points to the workspace, defaulting to `docs/alexandria`.
- Append-only play history currently lives at
  `docs/alexandria/ledger/events.jsonl`.
- `ax2 init` creates the workspace, inbox, source-assessment directory, and
  ledger file.
- `ax2 triggers list --json` already derives active source triggers from inbox
  files plus ledger history.
- `ax2 viewer` serves Viewer Next and exposes a minimal `/api/health` endpoint.

The gap is that the ledger event shape is currently play-specific. Canvas,
viewer, and host session events need a more general state event contract.

## Existing Ledger Taxonomy

AX2 already has a small ledger event taxonomy:

- `play.started`
- `play.completed`
- `play.failed`
- `assessment.recorded`

The issue is not that a taxonomy is missing. The issue is that the current
event envelope requires every event to carry a `play` field, which makes
viewer, canvas, host-session, and state-observation events awkward to represent.

This plan should extend the existing taxonomy into a broader Alexandria state
event taxonomy. It should not discard the existing names or create a parallel
event stream.

## Resolved Decisions

- **Replace the experimental ledger envelope now.** AX2 has no users yet, so
  the old play-scoped ledger event shape can be deleted outright.
- **Raw event append is allowed.** `ax2 events append` can remain available in
  released builds as the low-level escape hatch for tools, hosts, and advanced
  users. In normal operation it should submit through the local Alexandria
  server, not write the JSONL file directly. Workflow-specific commands should
  still exist where they improve validation and ergonomics.
- **Cursor state lives with the configured Alexandria workspace.** Cursors are
  Alexandria-internal runtime state. They are transient and may be deleted or
  regenerated.
- **Writes are server-mediated.** The local Alexandria server is the single
  writer for a project. Viewer Next, CLI commands, plugin skills, and host
  adapters should send mutations to the server instead of appending directly to
  storage.

## Design Principles

1. **One durable event stream.** Viewer edits, CLI mutations, and agent actions
   should append to the same logical state stream.
2. **Projection over mutation.** Current state is derived from project files and
   events. Do not write per-feature config JSON files as the source of truth.
3. **JSONL first, database later.** Start with append-only JSONL behind an
   interface. Move to SQLite only when query shape, concurrency, or volume
   requires it.
4. **Host adapters are downstream.** Claude Code and Codex session integration
   should consume the same event stream and cursor semantics.
5. **Idempotency is part of the contract.** Repeated saves, retries, and
   duplicate monitor runs must not create ambiguous state.
6. **The plugin owns workflow.** AX2 validates and records deterministic events;
   the Next plugin decides which plays exist and how agents respond.

## State Event Envelope

All durable events should share this envelope:

```ts
interface AlexandriaStateEvent {
  schemaVersion: 1;
  id: string;
  type: AlexandriaStateEventType;
  at: string;
  actor: AlexandriaActor;
  idempotencyKey?: string;
  causationId?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}

interface AlexandriaActor {
  kind: "user" | "agent" | "process";
  host?: "viewer" | "ax2" | "claude-code" | "codex";
  process?: "viewer-server" | "host-adapter" | "monitor" | "cli";
  sessionId?: string;
  name?: string;
}
```

Field rules:

- `id` is a UUID assigned by the appending writer.
- `type` is a stable event type string.
- `at` is UTC ISO-8601 with millisecond precision.
- `actor.kind` is required so projections can distinguish human, agent, and
  automated process mutations.
- `actor.host` identifies the surface or host environment when relevant.
- `actor.process` identifies non-human, non-agent writers such as the local
  viewer server, host adapter, monitor, or CLI process.
- `idempotencyKey` is required for retryable mutations such as save, intent
  creation, and monitor-triggered wake events.
- `causationId` points to the event that directly caused this event.
- `correlationId` groups a multi-event flow, such as one play run.
- `payload` is type-specific and must be schema-validated by event type.

## Initial Event Taxonomy

Keep the taxonomy small enough to ship one vertical slice.

### Play Events

- `play.intent.created`
- `play.intent.claimed`
- `play.intent.completed`
- `play.intent.failed`
- `play.started`
- `play.completed`
- `play.failed`

The existing play lifecycle events can remain valid, but they should be adapted
to the general envelope.

### Source Assessment Events

- `assessment.recorded`

Existing source-assessment work already uses this event. It should become a
schema-backed payload under the general envelope.

### Canvas Events

- `canvas.session.started`
- `canvas.view.opened`
- `canvas.step.saved`
- `canvas.review.requested`
- `canvas.proposal.created`
- `canvas.proposal.accepted`
- `canvas.proposal.rejected`

These cover the spike's important behaviors without importing its storage
layout.

### Host Session Events

- `session.wake.requested`
- `session.wake.delivered`
- `session.wake.failed`

These let Claude Code monitors and Codex app-server adapters be observed without
making either host the source of truth.

## Storage Abstraction

AX2 should expose a state store boundary, not raw JSONL calls spread through the
codebase.

```ts
interface AlexandriaStateStore {
  appendEvent(
    event: AlexandriaStateEvent,
  ): Effect.Effect<AppendEventResult, StateStoreError>;

  listEvents(
    query: StateEventQuery,
  ): Effect.Effect<StateEventPage, StateStoreError>;

  readCursor(
    cursorId: string,
  ): Effect.Effect<StateCursor | null, StateStoreError>;

  writeCursor(
    cursor: StateCursor,
  ): Effect.Effect<void, StateStoreError>;
}
```

The interface should support:

- append one validated event
- list bounded events by cursor, type, actor, or time
- validate the log
- read and write named cursors
- report duplicate idempotency keys deterministically

The first backend should be `JsonlStateStore`.

## JSONL Backend

The initial backend should store durable events at:

```text
docs/alexandria/ledger/events.jsonl
```

Rationale:

- This path already exists in AX2.
- It is inspectable by humans and agents.
- It works without native dependencies.
- It keeps state portable with the project.

Cursor files are runtime metadata, not durable product history. They should live
under the configured Alexandria workspace, outside the ledger:

```text
docs/alexandria/.runtime/cursors/<cursor-id>.json
```

Cursor files may be regenerated or deleted without corrupting Alexandria state.

JSONL backend constraints:

- Append-only writes.
- One event per line.
- Reject malformed existing logs before appending.
- Preserve newline boundaries when appending to non-newline-terminated files.
- Validate event schema before write.
- Use idempotency keys to return the existing event when a retry repeats the
  same mutation.
- Treat cross-process locking as an explicit follow-up design point. The first
  implementation should document its write assumptions and avoid relying on
  idempotency for file-corruption safety.

## Local Server As Single Writer

The preferred write architecture is one local Alexandria server per configured
workspace.

```text
Viewer Next ─┐
ax2 CLI ─────┼─> local Alexandria server ─> AlexandriaStateStore ─> events.jsonl
plugin skill ┤
host adapter ┘
```

The server owns all mutation paths:

- validate event envelope and payload
- check idempotency keys
- append to the JSONL store
- update runtime cursors when needed
- broadcast state changes over SSE

Client behavior:

- Viewer Next calls local runtime APIs.
- `ax2` mutation commands resolve the local server and submit HTTP requests. If
  no server is running, the command may start a temporary server, perform the
  mutation, then stop the temporary server before exiting.
- Plugin skills prefer `ax2` commands, which in turn submit to the server.
- Host adapters submit wake-delivery and cursor mutations through the server.

Server lifecycle:

- Starting a server writes runtime metadata under the configured workspace,
  such as `docs/alexandria/.runtime/server.json`.
- Starting a second server for the same workspace should fail with a precise
  message that includes the existing server PID, URL, and workspace path.
- If the metadata points at a dead PID, the next start may reclaim it.
- Read-only commands may still read directly from disk if no server is running,
  but write commands should fail or start/reuse the server explicitly according
  to the command contract.

This keeps JSONL simple because there is only one process performing append
writes during normal operation.

## CLI Mutation Lifecycle

Write-capable CLI commands should support both interactive and headless use:

1. Resolve the configured Alexandria workspace.
2. Check `docs/alexandria/.runtime/server.json`.
3. If a live server is present, submit the mutation to that server and leave it
   running.
4. If no live server is present, start a temporary local server scoped to the
   CLI command, wait until it is healthy, submit the mutation, then stop it.
5. If startup fails because another server won the race, re-read server metadata
   and submit to the now-live server.

Effect primitives fit this shape:

- Use `Effect.acquireRelease` plus `Effect.scoped` for temporary server
  lifecycle, so the server is stopped even if the write fails.
- Use `Effect.makeSemaphore(1)` inside the server to serialize concurrent
  mutation handlers around the state-store critical section.
- Use a startup lock or atomic metadata create so two temporary server starts do
  not both claim the same workspace.

Long-running commands such as `ax2 viewer` or a future `ax2 server start` should
start or reuse the server and keep it alive. Short write commands such as
`ax2 events append` should leave no background process behind unless one already
existed.

## Idempotency And Locking

Idempotency and locking solve different classes of problems.

Idempotency prevents duplicated logical events. Example: the viewer posts
`canvas.step.saved` twice after a double-click or retry. If both requests carry
the same idempotency key, the state store should return the original event
instead of appending a second save.

Locking prevents physical or ordering corruption when two processes write at the
same time. The single-writer server model removes most runtime multi-writer
cases because viewer, CLI, plugin skills, and host adapters all submit writes to
one process.

Likely multi-writer cases:

- two server processes race during startup for the same workspace
- an emergency/offline repair command writes directly to disk
- a bug or old client bypasses the server and appends directly
- the server handles multiple concurrent HTTP mutation requests

The first implementation should still serialize writes inside the server. This
can be a small in-process promise queue around the critical section:

```text
read log -> validate -> check idempotency -> append -> broadcast
```

A startup lock is still useful so two `ax2 server` or `ax2 viewer` invocations
cannot both decide they are the first server. A full cross-process append lock
can wait unless AX2 adds direct offline write commands.

## SQLite Backend Later

SQLite should be a later backend behind the same interface, not a first
decision. It becomes worth considering when one of these is true:

- Viewer needs fast historical queries over large logs.
- Multiple host adapters write concurrently.
- Projections need indexed lookup by correlation, actor, or entity id.
- Event compaction or snapshots become necessary.

The JSONL contract should remain exportable even if SQLite becomes the primary
store.

## Projection Contract

AX2 should expose a pure projection:

```ts
interface AlexandriaProjectState {
  config: AlexandriaNextConfig;
  workspace: {
    path: string;
  };
  ledger: {
    eventCount: number;
    lastEventAt?: string;
  };
  inboxSources: SourceIdentity[];
  activeTriggers: ActiveTrigger[];
  playIntents: PlayIntentProjection[];
  canvas: CanvasProjection;
}
```

Projection inputs:

- project config
- workspace files
- event stream

Projection outputs should be read-only objects used by:

- `ax2 state get --json`
- Viewer Next runtime endpoints
- agent skills that need current state
- host adapters deciding whether to wake a session

## CLI Surface

The first CLI should be narrow:

```bash
ax2 state get --json
ax2 events list [--type <type>] [--limit <n>] [--json]
ax2 events validate [--json]
```

The raw append command is acceptable as a general low-level mutation surface. In
normal operation it should submit to the local Alexandria server:

```bash
ax2 events append --type <type> --payload <json> --idempotency-key <key> --json
```

Workflow-specific commands should still be added where they provide a better
contract:

```bash
ax2 play intent create --play <play> --payload <json> --json
ax2 canvas save --step <step> --payload <json> --json
ax2 canvas review-request --step <step> --payload <json> --json
```

## Viewer Runtime API

`ax2 viewer` should eventually expose local runtime APIs backed by the same
state store:

```text
GET  /api/state
GET  /api/events
POST /api/events
GET  /api/events-stream
POST /api/play-intents
POST /api/canvas/save
POST /api/canvas/review
```

The static Viewer Next app should call these local endpoints. It should not read
project files directly or maintain its own event rules.

## Agent And Host Integration

Plugin skills should use AX2 commands for state reads and writes. That keeps the
behavior portable across Claude Code, Codex, shells, tests, and future hosts.

Host adapters should be thin:

| Host | Adapter responsibility |
|------|------------------------|
| Claude Code | Monitor the event stream, use a cursor, inject async rewake guidance |
| Codex | Use app-server thread APIs to inject non-user context and steer turns |
| Viewer | Append events and subscribe to local SSE updates |

Adapters should not define event types or projection rules.

## Verification Slices

This should be one architecture epic with a few testable slices. Each slice
should prove a user- or host-observable contract, not merely land an internal
layer.

### Slice 1: Verifiable State Log

Question this slice answers:

> Can AX2 treat the ledger as one validated Alexandria state stream and project
> current state from it?

Scope:

- Add schema-backed state event domain types in `packages/ax-next`.
- Replace existing ledger validation with the general envelope.
- Add `AlexandriaStateStore` and `JsonlStateStore`.
- Implement append, list, validate, and idempotent retry handling.
- Keep storage at `docs/alexandria/ledger/events.jsonl`.
- Move source trigger projection behind a broader `deriveProjectState`
  contract.
- Include ledger summary, inbox sources, active triggers, play intents, and an
  empty canvas projection.
- Add `ax2 state get --json`.
- Add `ax2 events list`, `ax2 events validate`, and `ax2 events append`.

Verification:

- Black-box CLI tests show valid events can be appended, listed, validated, and
  projected.
- Tests cover malformed logs, newline repair, duplicate idempotency keys,
  bounded list output, unknown fields, invalid actor, and invalid payloads.
- Existing AX2 tests are updated to the new envelope.
- No viewer server or host adapter is required to prove this slice.

## Issue #137 Slice 1 Implementation Plan

- Issue reference:
  [#137 AX2 state contract: verifiable state log](https://github.com/GetAlexandria/alexandria-internal/issues/137)
- Goal: replace the experimental play-scoped AX2 ledger envelope with one
  schema-backed Alexandria state event stream, then prove it through deterministic
  CLI reads, writes, validation, and projection.
- Linked product plan: this document, especially
  [Slice 1: Verifiable State Log](#slice-1-verifiable-state-log).
- Fabro run reference: `01KS1CXZ4SFMRJDNRB9A4R7QTN`.

### Slice Scope

This slice lands only the verifiable state log foundation:

- Add schema-backed state event domain types in `packages/ax-next`.
- Replace `LedgerEvent` validation with the general
  `AlexandriaStateEvent` envelope.
- Add an `AlexandriaStateStore` boundary and first `JsonlStateStore`
  implementation.
- Implement append, list, validate, newline repair, bounded list output, and
  duplicate idempotency-key handling.
- Keep durable storage at `docs/alexandria/ledger/events.jsonl`.
- Move trigger projection behind the broader `deriveProjectState` contract.
- Project ledger summary, inbox sources, active triggers, play intents, and an
  empty canvas projection.
- Add `ax2 state get --json`.
- Add `ax2 events list`, `ax2 events validate`, and `ax2 events append`.
- Update existing AX2 callers and tests that still emit or assert the old
  play-scoped envelope.

### Slice Non-Goals

- Do not add the local single-writer server, runtime metadata, HTTP mutation
  APIs, or SSE. That is Slice 2.
- Do not update Viewer Next runtime APIs beyond keeping existing tests passing
  against an empty or parseable event log.
- Do not add Claude Code or Codex host adapters, cursors, monitors, or wake
  delivery. That is Slice 3.
- Do not modify Alexandria 1 packages or migrate Alexandria 1 behavior.
- Do not write to `docs/alexandria/library/`.
- Do not create a SQLite backend or cross-process append lock.
- Do not add new Next plugin guided behavior in this slice.

### Linked Product-Plan Summary

The product contract is:

```text
project files + append-only state events -> current Alexandria state
```

The current ledger path remains the durable event stream. The old AX2
play-scoped ledger envelope can be replaced outright because AX2 has no users
yet. The new envelope must be general enough for play lifecycle events,
source-assessment events, future canvas events, and host-session events, while
the first implementation proves only the state-log and projection contract.

### Current Implementation Gap

AX2 currently has the right storage location and several useful building
blocks, but the contract is too narrow:

- `packages/ax-next/src/domain/ledger.ts` validates an event object with a
  required top-level `play` field and only four event types.
- `packages/ax-next/src/commands/ledger.ts` exposes `ax2 ledger add/list/validate`
  and writes directly to JSONL with command-local parsing and validation.
- `packages/ax-next/src/commands/play.ts` appends `play.started` and terminal
  events in the old envelope.
- `packages/ax-next/src/domain/project-state.ts` currently returns active
  triggers, inbox sources, and raw ledger events, but not a stable state
  projection shape.
- `packages/ax-next/src/commands/triggers.ts` loads files and ledger events
  itself instead of going through a shared state loader/store boundary.
- Existing tests assert the absence of `actor` and the presence of top-level
  `play`, so they must move to the new state event contract.

### Architectural Boundaries

AX2 owns deterministic state mechanics in this slice:

- event schemas and validation
- filesystem-backed state loading
- JSONL append/list/validate behavior
- idempotent retry handling
- current-state projection
- CLI parsing, stdout JSON, stderr diagnostics, and exit codes

The Alexandria Next plugin owns guided play behavior and should not gain new
workflow rules here. Viewer Next and host adapters consume the same state
contract later; they should not define event schemas or projection rules.

Use Effect patterns already present in `packages/ax-next`:

- `Effect.gen` command and storage flows returning `CliResult`.
- `effect/Schema` for new schema-backed domain contracts.
- A small `FileSystem`-backed store layer rather than ad hoc JSONL reads spread
  across commands.
- Stable operational failures mapped to CLI results instead of uncaught throws.

### Event Contract For This Slice

Durable events use this envelope:

```ts
interface AlexandriaStateEvent {
  schemaVersion: 1;
  id: string;
  type: AlexandriaStateEventType;
  at: string;
  actor: AlexandriaActor;
  idempotencyKey?: string;
  causationId?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}
```

`actor` is required and validated:

```ts
interface AlexandriaActor {
  kind: "user" | "agent" | "process";
  host?: "viewer" | "ax2" | "claude-code" | "codex";
  process?: "viewer-server" | "host-adapter" | "monitor" | "cli";
  sessionId?: string;
  name?: string;
}
```

Append commands should default omitted actors to:

```json
{ "kind": "process", "host": "ax2", "process": "cli" }
```

Unknown top-level envelope fields and unknown actor fields are invalid. Unknown
payload fields are invalid for event types with explicit payload schemas.

Initial payload schemas should cover the existing and projection-needed event
types:

| Event type | Payload contract in this slice |
|------------|--------------------------------|
| `play.started` | `{ "playId": KnownPlayId, "fabroRunId"?: string, "workflowPath"?: string, "acpProvider"?: string, "intentId"?: string }` |
| `play.completed` | `play.started` fields plus optional `{ "status"?: "succeeded" | "submitted", "exitCode"?: number }` |
| `play.failed` | `play.started` fields plus optional `{ "status"?: "failed", "exitCode"?: number, "error"?: string }` |
| `play.intent.created` | `{ "intentId": string, "playId": KnownPlayId, "payload"?: Record<string, unknown> }` |
| `play.intent.claimed` | `{ "intentId": string }` plus optional `{ "claimant"?: string }` |
| `play.intent.completed` | `{ "intentId": string }` plus optional `{ "result"?: Record<string, unknown> }` |
| `play.intent.failed` | `{ "intentId": string, "error": string }` |
| `assessment.recorded` | `{ "source": SourceIdentity, "assessment": { "path": string, "contentHash": string }, "readiness": "READY" | "GAPS" | "BLOCKED" }` |

Canvas projection is included, but canvas event handling can remain empty in
this slice. The state shape should still return an empty canvas object so later
viewer work has a stable slot.

### Store Contract

Add a state store boundary under the AX2 domain/effects split:

```ts
interface AlexandriaStateStore {
  appendEvent(
    input: AppendStateEventInput,
  ): Effect.Effect<AppendStateEventResult, StateStoreError>;

  listEvents(
    query: StateEventQuery,
  ): Effect.Effect<StateEventPage, StateStoreError>;

  validate(): Effect.Effect<StateLogValidationResult, StateStoreError>;
}
```

The append input should be the validated event content before assigning `id` and
`at`, so idempotent retries can return the existing event without generating a
false conflict from a new timestamp or UUID.

Idempotency behavior:

- If no `idempotencyKey` is provided, append a new event.
- If the key is new, append a new event and return
  `{ status: "appended", event }`.
- If the key already exists with the same `type`, `actor`, and `payload`, return
  `{ status: "already_appended", event }` without writing a second line.
- If the key already exists with different logical content, fail with a stable
  idempotency conflict error.

JSONL backend behavior:

- Read the whole log before append.
- Reject malformed existing logs before append.
- Preserve newline boundaries when appending after a non-newline-terminated
  file.
- Validate every parsed event against the schema.
- List events in file order after filtering, then apply the bounded most-recent
  limit used by existing CLI behavior.
- Report `returnedCount`, `totalCount`, `limit`, and `truncated` in JSON list
  output.

### CLI Contract

Add the new command group and keep the old `ledger` group only if needed as a
temporary compatibility alias during the implementation. Since AX2 has no
users, the preferred final surface for this slice is `events`.

```bash
ax2 events append --type <type> [--payload <json>] [--payload-file <path>] \
  [--actor <json>] [--idempotency-key <key>] [--json]
ax2 events list [--type <type>] [--limit <n>] [--json]
ax2 events validate [--json]
ax2 state get --json
```

Output and exit-code contract:

| Command | Success JSON | Exit codes |
|---------|--------------|------------|
| `events append --json` | `{ "status": "appended" \| "already_appended", "event": ..., "ledgerPath": ... }` | `0` success, `1` invalid or inaccessible state log, `2` invalid command input |
| `events list --json` | `{ "events": [...], "limit": n, "returnedCount": n, "totalCount": n, "truncated": boolean }` | `0` success, `1` invalid or inaccessible state log, `2` invalid command input |
| `events validate --json` | `{ "valid": true, "eventCount": n }` or `{ "valid": false, "eventCount": n, "error": ... }` | `0` valid, `1` invalid state log, `2` invalid command input |
| `state get --json` | `{ "config": ..., "workspace": ..., "ledger": ..., "inboxSources": [...], "activeTriggers": [...], "playIntents": [...], "canvas": ... }` | `0` success, `1` invalid project state, `2` invalid command input |

Human output can stay terse and table-oriented. Command data goes to stdout and
diagnostics/errors go to stderr.

### Projection Contract

`deriveProjectState` should become the single pure projection contract for this
slice:

```ts
interface AlexandriaProjectState {
  config: AlexandriaNextConfig;
  workspace: {
    path: string;
  };
  ledger: {
    eventCount: number;
    lastEventAt?: string;
  };
  inboxSources: SourceIdentity[];
  activeTriggers: ActiveTrigger[];
  playIntents: PlayIntentProjection[];
  canvas: CanvasProjection;
}
```

Projection rules:

- `ledger.eventCount` counts valid events.
- `ledger.lastEventAt` is the `at` value from the last valid event, if present.
- `inboxSources` continue to come from deterministic inbox discovery.
- `activeTriggers` continue to derive `inbox.source.pending` from inbox sources.
- `playIntents` derive from `play.intent.*` events by `intentId`, with later
  events winning status.
- `canvas` returns an empty projection such as `{ "sessions": [], "views": [] }`
  until canvas events are implemented.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| State event domain | `packages/ax-next/src/domain/state-events.ts` or replacement for `domain/ledger.ts` | Define schema-backed envelope, actor, event-type, and payload validation |
| State store | `packages/ax-next/src/domain/state-store.ts`, `packages/ax-next/src/effects/jsonl-state-store.ts` | Add append/list/validate boundary over `events.jsonl` |
| Project state | `packages/ax-next/src/domain/project-state.ts` | Project ledger summary, inbox sources, triggers, play intents, and empty canvas |
| CLI events | New `packages/ax-next/src/commands/events.ts`, router updates | Add `ax2 events append/list/validate` |
| CLI state | New `packages/ax-next/src/commands/state.ts`, router updates | Add `ax2 state get --json` |
| Existing ledger/play callers | `packages/ax-next/src/commands/ledger.ts`, `play.ts`, `triggers.ts` | Stop depending on top-level `play`; use state store/project state |
| Path/filesystem helpers | `packages/ax-next/src/domain/paths.ts`, `effects/filesystem.ts` if needed | Reuse existing ledger path and append/read helpers; avoid new state files |
| CLI tests | `packages/ax-next/tests/ledger.test.ts` or new `events.test.ts`, `triggers.test.ts`, `cli.test.ts`, `ax2.integration.test.ts` | Update black-box expectations to the new envelope and commands |
| Viewer tests | `packages/ax-next/tests/viewer.test.ts` only if needed | Keep existing empty-ledger endpoint tests passing; no new viewer API |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| AX2 CLI | New deterministic `events` and `state` surfaces replace the experimental `ledger` surface | Update root help and black-box CLI tests |
| Alexandria Next plugin skills | No behavior change in this slice | No skill eval rerun required; later slices should teach skills to call `ax2 state get` and workflow-specific commands |
| Host adapters | No behavior change in this slice | Slice 3 will consume the state store and cursor semantics |
| Viewer Next | No new behavior in this slice | Slice 2 will expose state/events through runtime APIs |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused AX2 state-log tests | `cd packages/ax-next && bun test tests/events.test.ts tests/state.test.ts tests/triggers.test.ts tests/cli.test.ts` | Proves new commands, projection, help, and trigger compatibility |
| Existing AX2 suite | `cd packages/ax-next && bun test` | Catches old envelope assumptions in init, play, viewer, and integration tests |
| Typecheck | `cd packages/ax-next && pnpm exec tsc --noEmit -p tsconfig.json` | Catches schema/type integration drift |
| Lint | `cd packages/ax-next && pnpm exec eslint src tests e2e` | Maintains package lint expectations |
| Format check | `cd packages/ax-next && bun ../ax/src/tools/repo-prettier.ts --check` | Checks TypeScript/JSON/YAML formatting touched in this slice |

Required black-box test cases:

- Append a valid `play.started` event with default actor.
- Append a valid `assessment.recorded` event with schema-valid payload.
- Append from `--payload-file`.
- Reject malformed payload JSON and non-object payload JSON.
- Reject schema-invalid payloads for known event types.
- Reject unknown event types.
- Reject unknown top-level event fields when validating a hand-written log.
- Reject invalid actor JSON and invalid actor enum values.
- Reject malformed existing logs on append/list/validate.
- Repair missing final newline before appending.
- Return the existing event for a duplicate idempotency key with identical
  logical content.
- Reject conflicting duplicate idempotency keys.
- Bound `events list --limit` output and include truncation metadata.
- Project `state get --json` with ledger summary, inbox sources, active
  triggers, play intents, and empty canvas.
- Update existing play/integration tests to assert payload `playId` instead of
  top-level `play`.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 CLI state/event behavior | Black-box Bun tests in `packages/ax-next/tests` | Add deterministic coverage in this slice | `cd packages/ax-next && bun test` |
| Alexandria Next plugin skills | No slice behavior change | No eval-harness rerun required | Not applicable |
| Reusable Alexandria 1 skills/agents | Not touched | No eval-harness rerun required | Not applicable |
| Eval harness | Not touched | No eval-harness rerun required | Not applicable |

No eval-harness coverage is required for Issue #137 because this slice changes
deterministic AX2 CLI/state behavior, not a reusable product skill, agent, or
eval-backed guided workflow. If implementation expands into
`packages/alexandria-next-plugin/skills`, run plugin validation and create or
rerun targeted Next plugin eval coverage in the same implementation slice.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Old play-scoped assumptions survive in `play`, `triggers`, or tests | Update all AX2 references from top-level `play` to payload `playId`; run the full `packages/ax-next` test suite |
| Idempotency treats different retries as the same event | Define logical comparison before implementation and add same-key/same-content and same-key/different-content tests |
| Schema validation becomes too loose because payload is `Record<string, unknown>` | Add explicit payload schemas for the event types used in this slice and reject unknown payload fields for those types |
| `events append` becomes a back door for malformed future events | Validate envelope, actor, type, timestamp, and payload before write; keep unknown event types invalid |
| The new state projection duplicates trigger-loading logic | Make `triggers list` consume the shared project-state loader/projection |
| JSONL append corrupts boundaries when a previous writer omitted the final newline | Preserve and test newline repair before append |
| The slice drifts into server/viewer/host runtime design | Keep server-mediated writes, SSE, cursors, and host wake behavior deferred to later slices |

### Implementation Steps

1. Replace or wrap `domain/ledger.ts` with schema-backed state event contracts:
   envelope, actor, known event types, payload schemas, parse/serialize helpers,
   and validation errors with line numbers.
2. Add `AppendStateEventInput`, `AppendStateEventResult`,
   `StateEventQuery`, `StateEventPage`, and `AlexandriaStateStore`.
3. Implement `JsonlStateStore` using the existing `FileSystem` service and
   `ledgerPathForWorkspace`.
4. Move command-local JSONL parsing from `commands/ledger.ts` and
   `commands/triggers.ts` behind the store/state loader.
5. Add `commands/events.ts` with `append`, `list`, and `validate`, including
   help text, JSON output, and stable exit codes.
6. Add `commands/state.ts` with `state get --json`; reject non-JSON state get
   until a human renderer is intentionally designed, or provide a terse summary
   while keeping `--json` as the tested contract.
7. Update `deriveProjectState` to accept config, workspace, inbox sources, and
   state events, and return the broader projection.
8. Update `triggers list` to call the shared project-state path and preserve its
   existing JSON contract.
9. Update `play run` ledger appends to emit the new envelope with default AX2
   process actor and payload `playId`.
10. Route `events` and `state` in `src/cli/router.ts`, and update root/help
    tests.
11. Replace or retire `ledger` command tests according to the selected alias
    choice; ensure no test still depends on the old envelope.
12. Run focused and full package verification.

### Acceptance / Exit Criteria

1. `docs/alexandria/ledger/events.jsonl` remains the only durable state log for
   this slice.
2. Every event in the log validates against the general
   `AlexandriaStateEvent` envelope with required `actor`.
3. `ax2 events append --json` appends valid events, rejects invalid inputs, and
   returns the existing event for idempotent retries.
4. `ax2 events list --json` returns bounded, filterable, parseable output with
   truncation metadata.
5. `ax2 events validate --json` reports valid and malformed logs with stable
   exit codes.
6. `ax2 state get --json` projects ledger summary, inbox sources, active
   triggers, play intents, and an empty canvas projection.
7. Existing AX2 tests are updated to the new envelope and pass.
8. No Next plugin behavior, viewer server API, host adapter, cursor, or
   Alexandria 1 surface is changed to complete this slice.

### Deferred Follow-Ups

1. Slice 2 local server as the single writer, including runtime metadata,
   duplicate-server handling, HTTP APIs, SSE, and temporary CLI server
   lifecycle.
2. Workflow-specific mutation commands such as `ax2 play intent create` and
   canvas save/review commands.
3. Cursor read/write support under `docs/alexandria/.runtime/cursors/`.
4. Host adapter wake loops for Claude Code and Codex.
5. Viewer Next state/events API migration from raw ledger reads to the state
   store.
6. SQLite backend, compaction, snapshots, or cross-process file locking if JSONL
   becomes insufficient.
7. Next plugin skill updates and eval coverage once guided workflows start
   consuming `ax2 state get` or workflow-specific commands.

### Blocking Open Questions For Slice 1

None. The remaining architecture questions below affect Slice 2 and later
runtime behavior, not the verifiable state-log implementation.

### Slice 2: Verifiable Single-Writer Runtime

Question this slice answers:

> Can all write clients mutate state through one local server while preserving
> CLI usability?

Scope:

- Add one local server per configured workspace.
- Write runtime metadata under `docs/alexandria/.runtime/server.json`.
- Reject duplicate server starts with a useful existing-server message.
- Reclaim stale metadata when the recorded PID is dead.
- Serialize mutation handlers in-process.
- Extend the server with `/api/state`, `/api/events`, and SSE.
- Route write-capable CLI commands through the server.
- Support scoped temporary server startup/cleanup when a CLI write runs without
  an already-running server.

Verification:

- Black-box process tests prove `ax2 events append` works with no pre-existing
  server, starts a temporary server, writes through HTTP, and stops the server
  before exit.
- Tests prove `ax2 events append` reuses a pre-existing long-running server and
  leaves it running.
- Tests prove duplicate server starts fail or reuse according to the selected
  command contract.
- SSE tests prove subscribers receive appended events and projected state
  changes.
- Concurrent HTTP append tests prove the server serializes mutation handlers and
  idempotency remains stable.

## Issue #138 Slice 2 Implementation Plan

- Issue reference:
  [#138 AX2 state contract: verifiable single-writer runtime](https://github.com/GetAlexandria/alexandria-internal/issues/138)
- Goal: make the local Alexandria runtime server the single writer for AX2 state
  mutations while keeping short CLI writes usable when no server is already
  running.
- Linked product plan: this document, especially
  [Slice 2: Verifiable Single-Writer Runtime](#slice-2-verifiable-single-writer-runtime).
- Fabro run reference: `01KS1G516ZQSYH8E90ZNQAT16C`.

### Slice Scope

This slice lands the local single-writer runtime:

- Add a local Alexandria runtime server for each configured workspace in
  `packages/ax-next`.
- Store runtime metadata at the configured workspace's
  `.runtime/server.json`, which is `docs/alexandria/.runtime/server.json` for
  the default workspace.
- Add runtime path helpers for `.runtime/`, `server.json`, and the startup claim
  file. Do not add per-feature config JSON.
- Start the runtime server in API-only mode for temporary CLI writes and in
  viewer mode for `ax2 viewer`.
- Extend the current viewer server implementation into the shared runtime
  server instead of creating a second unrelated HTTP server.
- Reject explicit duplicate long-running starts with a useful existing-server
  message that includes the existing PID, URL, and workspace path.
- Reclaim stale server metadata only when the recorded PID is dead.
- Serialize mutation handlers in the server process around the state-store
  critical section.
- Add runtime APIs:
  - `GET /api/health`
  - `GET /api/state`
  - `GET /api/events`
  - `POST /api/events`
  - `GET /api/events-stream`
- Keep `/api/alexandria/ledger` as a compatibility alias for this slice, backed
  by the same event listing path, so the current bundled viewer does not break
  before its API migration.
- Route write-capable AX2 commands through the runtime server. In the current
  codebase this means `ax2 events append` and the state event writes in
  `ax2 play run`.
- Support scoped temporary runtime startup for short write commands when no
  live server exists, and stop that temporary server before the command exits.
- Add black-box process, SSE, duplicate-start, stale-metadata, and concurrent
  HTTP append tests.

### Slice Non-Goals

- Do not implement host wake loops, named cursors, Claude Code monitors, Codex
  app-server adapters, or cursor files. Those remain Slice 3.
- Do not add workflow-specific mutation commands such as `ax2 play intent
  create` or canvas commands.
- Do not change Alexandria 1 packages.
- Do not write to `docs/alexandria/library/`.
- Do not change Next plugin guided play behavior or skill text in this slice.
- Do not redesign Viewer Next UI. This slice only changes the local runtime
  APIs used by the viewer.
- Do not add SQLite, event snapshots, compaction, or a cross-process append
  lock. The startup claim prevents duplicate runtime ownership; the server
  handles in-process serialization.
- Do not add a supported offline direct-write repair command. All normal writes
  go through the runtime server.
- Do not make `ax2 start` mean the AX2 state runtime. The existing `ax2 start`
  surface remains the Fabro product-services command for this slice.

### Linked Product-Plan Summary

The product-plan decision is that writes are server-mediated. The local
Alexandria runtime server owns validation, idempotency checks, JSONL append, and
state-change broadcast. CLI commands, Viewer Next, plugin skills, and future
host adapters should submit mutations to that server instead of each process
opening `events.jsonl` for append.

The usability requirement is that a short CLI write still works from a normal
terminal. If no long-running server exists, the CLI starts a scoped temporary
runtime server, performs the HTTP write, and stops that server before returning.
If a long-running server exists, the CLI reuses it and leaves it running.

### Current Implementation Gap

Slice 1 has landed the state event contract and JSONL store, but writes are not
yet single-writer:

- `packages/ax-next/src/commands/events.ts` parses
  `ax2 events append` input and calls `storage.store.appendEvent` directly.
- `packages/ax-next/src/commands/play.ts` creates a `JsonlStateStore` directly
  and appends `play.started` plus terminal play events from the CLI process.
- `packages/ax-next/src/effects/viewer-server.ts` serves static viewer assets,
  `/api/health`, `/api/alexandria/ledger`, orchestration metadata, and workflow
  SVGs, but it does not own state mutation.
- The server does not write `.runtime/server.json`, reject duplicate starts,
  reclaim stale metadata, expose `/api/state`, expose `/api/events`, accept
  `POST /api/events`, or broadcast SSE updates.
- There is no AX2 runtime-server client for resolving an existing local server,
  checking its health, starting a temporary server, or posting append requests.
- There is no process test proving that a CLI write went through HTTP or that a
  temporary server was cleaned up before CLI exit.
- Concurrent appends are idempotent at the store level, but the server has no
  in-process mutation queue because no mutation server exists yet.

### Command Contract Decision

This plan selects the command behavior for duplicate starts and short writes:

- `ax2 viewer` is the explicit long-running runtime start surface in this
  slice. It starts the local Alexandria runtime server in viewer mode and keeps
  the process alive.
- A second `ax2 viewer` for the same configured workspace fails with exit code
  `1`. The error goes to stderr and includes the existing PID, URL, and
  workspace path. With `--json`, the machine-readable error should still be on
  stderr because command data belongs on stdout.
- `ax2 events append` and `ax2 play run` reuse a healthy existing runtime server
  if one is recorded. They do not fail merely because a server already exists.
- If no healthy server exists, `ax2 events append` and `ax2 play run` start an
  API-only temporary runtime server with port `0`, wait for `/api/health`, post
  the mutation, then stop the temporary server with `Effect.acquireRelease`.
- If a temporary startup loses a race to another server, the command re-reads
  `server.json`, verifies the new server through `/api/health`, and reuses it.
- Read-only commands, including `ax2 events list`, `ax2 events validate`, and
  `ax2 state get`, may continue reading from disk in this slice.
- A public `ax2 server start/status/stop` command group is deferred until there
  is a clear user need beyond `ax2 viewer` and scoped CLI writes.

### Runtime Metadata Contract

Runtime metadata lives inside the configured workspace:

```text
<workspace>/.runtime/server.json
```

For the default workspace this is:

```text
docs/alexandria/.runtime/server.json
```

The metadata should be schema-validated before use:

```json
{
  "schemaVersion": 1,
  "serverId": "uuid",
  "pid": 12345,
  "url": "http://127.0.0.1:4321/",
  "host": "127.0.0.1",
  "port": 4321,
  "projectRoot": "/abs/project",
  "workspacePath": "/abs/project/docs/alexandria",
  "mode": "viewer",
  "startedAt": "2026-05-20T00:00:00.000Z"
}
```

Rules:

- `serverId` is generated for each server process and used to prevent one
  process from deleting another process's metadata during cleanup.
- `pid` is checked with the platform's normal liveness probe, such as
  `process.kill(pid, 0)` on Node-compatible runtimes.
- If `server.json` exists and the PID is alive, explicit starts fail with the
  existing-server message.
- If `server.json` exists and the PID is alive, write commands verify
  `/api/health` and reuse the server only when the response matches the
  expected `serverId` and workspace path.
- If `server.json` exists but the PID is dead, the next start removes or
  replaces the stale metadata.
- If the PID is alive but `/api/health` does not answer or reports a different
  workspace, do not reclaim the metadata automatically. Fail with a precise
  "recorded server is alive but unhealthy" diagnostic so the user can stop the
  process or delete stale metadata intentionally.
- Metadata writes use a temporary file plus rename after the HTTP server has
  successfully bound.
- Startup uses an exclusive claim file such as
  `<workspace>/.runtime/server.claim` so two processes cannot both decide they
  own the workspace.
- Shutdown removes `server.json` only when the file's `serverId` still matches
  the stopping server.

### Runtime API Contract

The shared runtime server should serve both API-only temporary mode and viewer
mode.

`GET /api/health` returns server and workspace identity:

```json
{
  "status": "ok",
  "serverId": "uuid",
  "pid": 12345,
  "url": "http://127.0.0.1:4321/",
  "projectRoot": "/abs/project",
  "workspacePath": "/abs/project/docs/alexandria",
  "mode": "viewer"
}
```

`GET /api/state` returns the same projected state as `ax2 state get --json`.

`GET /api/events` accepts the same bounded read query as
`ax2 events list --json`:

```text
GET /api/events?type=play.started&limit=50
```

The response is the existing `StateEventPage` shape:

```json
{
  "events": [],
  "limit": 50,
  "returnedCount": 0,
  "totalCount": 0,
  "truncated": false
}
```

`POST /api/events` accepts append input before `id` and `at` assignment:

```json
{
  "type": "play.started",
  "actor": { "kind": "process", "host": "ax2", "process": "cli" },
  "idempotencyKey": "optional-retry-key",
  "causationId": "optional-event-id",
  "correlationId": "optional-flow-id",
  "payload": { "playId": "source-assessment" }
}
```

The success response keeps the CLI append contract intact and may include
runtime details for testability:

```json
{
  "status": "appended",
  "event": {},
  "ledgerPath": "/abs/project/docs/alexandria/ledger/events.jsonl"
}
```

HTTP status rules:

- `200` for appended or already-appended events.
- `400` for invalid request JSON or schema-invalid append input.
- `409` for idempotency-key conflicts.
- `422` for malformed existing state logs.
- `500` for state-log access failures or unexpected runtime failures.

`GET /api/events-stream` is an SSE endpoint:

- It sends a `ready` event when the subscription is established. The payload
  includes `serverId` and the current projected state.
- After every successful append, it sends a `state-event` event whose data is
  the append result.
- After the same append, it sends a `project-state` event whose data is the
  projected state after that append.
- The `id:` field for both mutation-triggered SSE messages uses the appended
  event id so subscribers can correlate event and projection updates.
- The server removes subscribers when the request aborts.

### Serialization Contract

The runtime server serializes mutation handlers inside one process:

```text
parse request -> validate append input -> acquire mutation permit ->
read log -> validate log -> check idempotency -> append -> derive state ->
broadcast SSE -> release mutation permit
```

Implementation should use `Effect.makeSemaphore(1)` or an equivalent local
Effect queue owned by the runtime server instance. The semaphore must wrap the
store append and the follow-up projection/broadcast so subscribers observe
state changes in append order.

Read endpoints may run outside the mutation permit, but `POST /api/events`
must be the only normal code path that calls `AlexandriaStateStore.appendEvent`.

### CLI Runtime Client Contract

Add a small AX2 runtime client layer rather than placing HTTP and lifecycle code
inside individual commands.

The client should provide:

```ts
interface AlexandriaRuntimeClient {
  appendEvent(
    input: AppendStateEventInput,
  ): Effect.Effect<AppendEventThroughRuntimeResult, RuntimeClientError>;
}
```

The write lifecycle is:

1. Resolve project config and the configured workspace through the existing
   `loadProjectStorage` path.
2. Read and validate `.runtime/server.json`.
3. If a live, healthy server exists, post to `POST /api/events`.
4. If no live server exists, start an API-only temporary server inside
   `Effect.acquireRelease`, post to `POST /api/events`, and stop the server.
5. If startup reports that another process won the claim, re-read metadata and
   reuse the newly live server.
6. Map runtime failures into existing CLI exit-code buckets. Invalid command
   input remains exit code `2`; runtime or state-log failures remain exit code
   `1`.

`ax2 events append --json` should continue returning at least:

```json
{
  "status": "appended",
  "event": {},
  "ledgerPath": "/abs/project/docs/alexandria/ledger/events.jsonl"
}
```

It may add a `runtime` object such as:

```json
{
  "runtime": {
    "url": "http://127.0.0.1:4321/",
    "lifecycle": "temporary"
  }
}
```

Black-box tests should assert the existing stable fields and the lifecycle
field if it is added.

`ax2 play run` should use the same runtime append helper for its
`play.started` and terminal play events. The command may still run Fabro
locally in the CLI process; only state mutation moves behind the runtime server.

### Process Lifecycle

The implementation must make server cleanup explicit:

- Temporary CLI servers are acquired and released with `Effect.acquireRelease`
  so cleanup runs on success and on failure.
- Long-running `ax2 viewer` keeps the process alive and must retain the
  `StartedAlexandriaRuntimeServer.stop` action.
- Add signal handling for `SIGINT` and `SIGTERM` so normal viewer shutdown stops
  the Bun server and removes matching metadata.
- Abrupt process death may leave metadata behind; the stale PID reclaim path is
  the recovery mechanism for that case.

### Architectural Boundaries

AX2 owns deterministic runtime mechanics in this slice:

- runtime metadata schema and lifecycle
- local HTTP server implementation
- state/event API request validation
- mutation serialization
- HTTP client resolution for CLI writes
- temporary server startup and cleanup
- black-box CLI/process verification

The Alexandria Next plugin continues to own guided play behavior. This slice
does not add new play instructions, agent prompts, or skill workflows.

Viewer Next should consume the new APIs, but the current static app does not
need a UI redesign to complete this slice. Host adapters remain downstream
clients and should not define event schemas, projection rules, or server
lifecycle policy.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Runtime metadata domain | New `packages/ax-next/src/domain/runtime-server.ts`; `packages/ax-next/src/domain/paths.ts` | Define `.runtime/server.json`, startup claim paths, metadata validation, duplicate/stale server errors |
| Runtime server effect | Replace or extend `packages/ax-next/src/effects/viewer-server.ts`; possible new `effects/runtime-server.ts` | Start API-only and viewer-mode Bun servers, own metadata lifecycle, expose state/events APIs and SSE |
| Runtime client effect | New `packages/ax-next/src/effects/runtime-client.ts` or equivalent | Resolve/reuse existing server, start scoped temporary server, post write mutations through HTTP |
| State/project loading | `packages/ax-next/src/effects/project-state-loader.ts`, `domain/state-store.ts` if needed | Reuse existing store/projection behind runtime endpoints without duplicating JSONL parsing |
| CLI events | `packages/ax-next/src/commands/events.ts` | Route `append` through runtime client; preserve list/validate direct reads and output contracts |
| CLI play | `packages/ax-next/src/commands/play.ts` | Route play lifecycle event writes through runtime client instead of direct `JsonlStateStore` appends |
| CLI viewer | `packages/ax-next/src/commands/viewer.ts`, `src/cli/main.ts`, `src/cli/result.ts` if needed | Start the shared runtime server in viewer mode, reject duplicate starts, retain shutdown cleanup |
| Tests | New or updated `packages/ax-next/tests/runtime-server.test.ts`, `events.test.ts`, `viewer.test.ts`, `ax2.integration.test.ts` | Add black-box process, SSE, duplicate-start, stale-metadata, and concurrent HTTP append coverage |
| Next plugin package | No planned file changes | No guided behavior change; plugin validation is not required unless implementation scope expands into this package |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| AX2 CLI | Write-capable commands submit state mutations through the local runtime server instead of appending JSONL directly | Update help/output tests for `events append` if runtime lifecycle fields are exposed |
| Viewer Next runtime API | Server adds `/api/state`, `/api/events`, `POST /api/events`, and `/api/events-stream`; old ledger endpoint remains as a compatibility alias | Update viewer server tests; UI migration can remain deferred |
| Alexandria Next plugin skills | No behavior change in this slice; skills still prefer deterministic `ax2` commands | No skill text update and no skill eval rerun required |
| Host adapters | No behavior change in this slice | Slice 3 will add cursor and wake-loop behavior |
| Reusable Alexandria 1 agents/skills | Not touched | No downstream updates required |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused runtime server tests | `cd packages/ax-next && bun test tests/runtime-server.test.ts tests/events.test.ts tests/viewer.test.ts` | Proves server lifecycle, routed append behavior, duplicate starts, SSE, and viewer compatibility |
| Existing AX2 suite | `cd packages/ax-next && bun test` | Catches regressions in init, state projection, triggers, play, viewer, and integration flows |
| Typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches runtime metadata, Effect, and API contract type drift |
| Lint | `cd packages/ax-next && pnpm run lint` | Maintains package lint expectations |
| Format check | `cd packages/ax-next && pnpm run format:check` | Checks TypeScript/JSON/YAML formatting touched in this slice |

Required black-box test cases:

- `ax2 events append` in an initialized project with no pre-existing server
  starts a temporary runtime server, appends through HTTP, returns success JSON,
  removes matching `server.json`, and exits with code `0`.
- `ax2 events append` with a pre-existing `ax2 viewer` server reuses that
  server, appends through HTTP, leaves the viewer process running, and exits
  with code `0`.
- A second `ax2 viewer` for the same workspace exits with code `1` and prints
  the existing PID, URL, and workspace path.
- Dead-PID metadata is reclaimed on the next server start or short write.
- Alive-PID but unhealthy metadata is not reclaimed silently and produces a
  useful diagnostic.
- `GET /api/state` returns the same projection shape as
  `ax2 state get --json`.
- `GET /api/events` returns the same bounded page shape as
  `ax2 events list --json`.
- `POST /api/events` rejects malformed JSON, invalid event type, invalid actor,
  schema-invalid payload, malformed existing logs, and idempotency conflicts
  with the selected HTTP statuses.
- SSE subscribers receive `ready`, `state-event`, and `project-state` messages
  after an append.
- Concurrent HTTP appends with the same idempotency key produce one durable
  event and deterministic `already_appended` responses for retries.
- Concurrent HTTP appends with distinct idempotency keys produce valid JSONL
  with one complete event per line.
- `ax2 play run` no longer directly appends to the store; its play lifecycle
  events are observable through the runtime server/SSE path when a server is
  already running.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 CLI/runtime behavior | Black-box Bun tests in `packages/ax-next/tests` | Add deterministic runtime/process coverage in this slice | `cd packages/ax-next && bun test` |
| Alexandria Next plugin skills | No behavior change in this slice | No eval-harness rerun required | Not applicable |
| Alexandria Next plugin package validation | Package is not planned to change | No validation required unless implementation touches `packages/alexandria-next-plugin` | If touched, run `claude plugin validate ./packages/alexandria-next-plugin` |
| Reusable Alexandria 1 skills/agents | Not touched | No eval-harness rerun required | Not applicable |
| Eval harness | Not touched | No eval-harness rerun required | Not applicable |

No eval-harness coverage is required for Issue #138 because this slice changes
deterministic AX2 CLI/server behavior, not a reusable product skill, agent, or
eval-backed guided workflow. If implementation expands into Next plugin skill
behavior, create or rerun targeted plugin eval coverage in that implementation
slice.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Two processes race and both become writers for the same workspace | Use an exclusive startup claim file, re-read `server.json` after claim conflicts, and test racing temporary starts |
| Temporary server cleanup removes metadata for a different server | Include `serverId` in metadata and delete `server.json` only when it still matches the stopping server |
| PID reuse makes stale metadata look alive | Verify `/api/health` matches the expected `serverId` and workspace before reuse; fail rather than reclaim if PID is alive but health is wrong |
| API-only temporary writes accidentally depend on viewer asset discovery | Separate API-only runtime startup from viewer-mode static asset serving; only `ax2 viewer` requires bundled assets |
| `play run` remains a direct writer after `events append` is routed | Centralize append-through-runtime helper and update `play run` tests or process tests to observe play events through a running server |
| SSE tests become timing-sensitive | Emit a `ready` event after subscription setup and have tests wait for it before posting the mutation |
| HTTP append accepts data the CLI would reject | Reuse `validateAppendStateEventInput` and state-store errors for `POST /api/events`; add status-code tests for invalid inputs |
| Existing viewer tests or bundled UI break because `/api/alexandria/ledger` disappears | Keep the old endpoint as an alias backed by `GET /api/events` for this slice |
| Long-running viewer exits leave stale metadata | Add signal cleanup for normal shutdown and rely on dead-PID reclaim for abrupt termination |

### Implementation Steps

1. Add runtime path helpers in `domain/paths.ts` for `.runtime/`,
   `server.json`, and the startup claim file.
2. Add a runtime metadata domain module with schema validation, metadata
   serialization, existing-server errors, stale metadata checks, and
   server-health response types.
3. Refactor `effects/viewer-server.ts` into a shared runtime server service, or
   add `effects/runtime-server.ts` and make viewer mode use it.
4. Implement API-only runtime startup with host/port options, `serverId`
   generation, metadata claim, atomic metadata write, and stop cleanup.
5. Implement viewer-mode startup on top of the same service, including static
   asset serving and the existing orchestration/workflow SVG endpoints.
6. Add signal-aware cleanup for long-running viewer processes and scoped
   `Effect.acquireRelease` cleanup for temporary servers.
7. Add `/api/health`, `/api/state`, `/api/events`,
   `/api/alexandria/ledger`, `POST /api/events`, and
   `/api/events-stream` handlers.
8. Add in-process mutation serialization around `POST /api/events` using an
   Effect semaphore or equivalent queue.
9. Add an SSE subscriber registry, ready event, mutation broadcasts, abort
   cleanup, and deterministic JSON payload formatting.
10. Add a runtime client helper for write commands that reuses healthy existing
    metadata, starts temporary API-only servers when needed, and retries after
    startup races.
11. Update `runEventsCli` so `events append` posts through the runtime client
    while preserving current input validation, exit codes, and output fields.
12. Update `runPlay` so play lifecycle event writes use the same runtime append
    helper instead of direct `makeJsonlStateStore` calls.
13. Update `runViewer` to start the shared runtime server, reject duplicate
    starts, return existing-server diagnostics, and preserve `--open` behavior
    for successful starts.
14. Add runtime process tests for temporary append, existing-server reuse,
    duplicate viewer start, stale metadata reclaim, unhealthy metadata, SSE, and
    concurrent HTTP append behavior.
15. Run focused tests, the full AX2 suite, typecheck, lint, and format check.

### Acceptance / Exit Criteria

1. Normal state mutations from `ax2 events append` and `ax2 play run` go through
   `POST /api/events`.
2. `docs/alexandria/ledger/events.jsonl` remains the durable event stream, and
   the runtime server is the only normal append writer.
3. A running server writes valid metadata under the configured workspace's
   `.runtime/server.json`.
4. Duplicate long-running `ax2 viewer` starts fail with a useful existing-server
   message containing PID, URL, and workspace path.
5. Dead-PID metadata is reclaimed automatically on the next start or write.
6. Temporary CLI write servers are cleaned up before command exit and do not
   leave `server.json` behind.
7. CLI writes reuse a pre-existing long-running server and leave it running.
8. Server mutation handlers are serialized in-process, and concurrent HTTP
   append tests prove valid JSONL plus stable idempotency behavior.
9. `/api/state`, `/api/events`, `POST /api/events`, and
   `/api/events-stream` are covered by deterministic tests.
10. SSE subscribers receive appended event and projected state updates.
11. No Alexandria 1 package, Next plugin guided behavior, host adapter, cursor
    loop, or docs library file is changed to complete this slice.

### Deferred Follow-Ups

1. Public `ax2 server start/status/stop` commands if users need a headless
   long-running runtime separate from `ax2 viewer`.
2. Slice 3 cursor files under `docs/alexandria/.runtime/cursors/` and host
   wake-loop behavior.
3. Workflow-specific mutation commands for play intents and canvas operations.
4. Viewer Next UI migration from `/api/alexandria/ledger` to `/api/state`,
   `/api/events`, and `/api/events-stream`.
5. Cross-process append locking or SQLite if future supported direct-write
   repair commands require safe offline mutation.
6. Next plugin skill updates and eval coverage once guided workflows consume
   new workflow-specific AX2 commands.

### Blocking Open Questions For Slice 2

None. This plan selects duplicate-start failure for explicit long-running
`ax2 viewer` starts, reuse for write-capable CLI commands, and no supported
offline direct-write repair command in this slice.

### Slice 3: Verifiable Agent Wake Loop

Question this slice answers:

> Can an agent host observe Alexandria state changes through a cursor and wake
> exactly when the event contract says it should?

Scope:

- Add high-level commands for play intent creation and completion.
- Define idempotency keys for viewer and agent retries.
- Define named cursor behavior for host adapters.
- Add event classification for wake-worthy events.
- Update Next plugin skill guidance to use AX2 commands.
- Implement the Claude Code monitor first.
- Design the Codex app-server adapter against the same cursor rules.

Verification:

- Tests prove a play intent can be created, observed, claimed/completed, and
  projected.
- Monitor tests prove cursor advancement, no duplicate wakes, stale cursor
  recovery, and review-versus-save classification.
- A host smoke test proves a state event can trigger a non-user agent wake in
  the target host.
- Plugin skills no longer need to write state files directly.

## Issue #139 Slice 3 Implementation Plan

- Issue reference:
  [#139 AX2 state contract: verifiable agent wake loop](https://github.com/GetAlexandria/alexandria-internal/issues/139)
- Goal: prove that an agent host can observe Alexandria state changes through a
  named cursor and wake only for events classified as wake-worthy.
- Linked product plan: this document, especially
  [Slice 3: Verifiable Agent Wake Loop](#slice-3-verifiable-agent-wake-loop).
- Fabro run reference: `01KS2G0PD8CXD06J23S8X532E2`.
- External host references read for this plan:
  [Claude Code plugin monitors](https://code.claude.com/docs/en/plugins-reference#monitors),
  [Claude Code Monitor tool](https://code.claude.com/docs/en/tools-reference#monitor-tool),
  and
  [Codex app-server README](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md).

### Slice Scope

This slice lands the first end-to-end agent wake loop:

- Add workflow-specific AX2 commands for play intent creation, claim,
  completion, and failure.
- Define retry-safe idempotency-key conventions for viewer-originated and
  agent-originated state mutations.
- Add cursor domain types, JSONL-backed cursor persistence, and runtime cursor
  APIs under the configured Alexandria workspace.
- Add event types and schemas required by wake classification:
  `canvas.step.saved`, `canvas.review.requested`,
  `session.wake.requested`, `session.wake.delivered`, and
  `session.wake.failed`.
- Add shared event classification that distinguishes wake-worthy events,
  context-only events, and ignored/self-generated events.
- Implement the Claude Code monitor first, using the same local runtime server,
  cursor rules, and classification contract as other host adapters.
- Register the Claude monitor from the Alexandria Next plugin using Claude
  Code's experimental plugin monitor surface.
- Update Alexandria Next plugin skill guidance so skills use AX2 commands for
  state reads and play-intent writes instead of writing state files directly.
- Add a Codex adapter design document against the same cursor and
  classification contract, with implementation deferred.
- Add deterministic tests for intent command behavior, cursor advancement,
  classification, monitor dedupe, stale cursor recovery, and Claude monitor
  delivery through a fake host sink.
- Add a host smoke test that uses a real Claude Code interactive session when
  the local machine has a compatible `claude` CLI and monitor support.

### Slice Non-Goals

- Do not implement the Codex app-server adapter beyond the design artifact and
  shared contracts it will consume.
- Do not build the full Viewer Next canvas UI.
- Do not add high-level canvas save/review CLI commands unless they are needed
  for tests; raw `ax2 events append` can create the two canvas events for this
  slice.
- Do not implement durable cross-process exactly-once wake delivery across a
  process crash after host delivery but before `session.wake.delivered` is
  recorded. This slice must prevent duplicates across completed monitor loops.
- Do not add SQLite, log compaction, snapshots, or cross-process append locks.
- Do not change Alexandria 1 packages or migrate Alexandria 1 plugin behavior.
- Do not write to `docs/alexandria/library/`.
- Do not make host adapters define event schemas or projection rules.

### Linked Product-Plan Summary

The product contract remains:

```text
project files + append-only state events -> current Alexandria state
```

Slice 1 proved the state log and projection. Slice 2 proved the local runtime
server as the single normal writer. Slice 3 uses those foundations to prove
that hosts can maintain named cursors over the same event stream, classify new
events, and deliver wake guidance without polling the model in a loop or
creating host-specific state files.

The first host is Claude Code because it now supports plugin-declared
background monitors. Claude Code plugin monitors are session-scoped background
commands whose stdout lines become notifications to Claude. The same
Alexandria cursor and classification rules should later drive Codex app-server
thread injection and steering.

### Current Implementation Gap

The repository currently has the state and runtime foundation, but not the
agent wake loop:

- `packages/ax-next/src/domain/state-events.ts` includes play intent event
  schemas, but does not include canvas save/review events or `session.wake.*`
  events.
- `packages/ax-next/src/domain/project-state.ts` projects play intents from
  existing events, but lifecycle commands do not exist.
- `packages/ax-next/src/commands/play.ts` exposes only `ax2 play run`; there
  is no `ax2 play intent ...` command group.
- `packages/ax-next/src/domain/state-store.ts` and
  `packages/ax-next/src/effects/jsonl-state-store.ts` do not expose named
  cursor read/write or list-after-cursor behavior.
- `packages/ax-next/src/effects/runtime-server.ts` exposes state, events,
  append, and SSE, but no cursor APIs.
- There is no wake-classification module, no monitor loop, and no durable
  `session.wake.*` observability events.
- `packages/host-claude` and `packages/host-codex` are placeholder packages
  with only `package.json`.
- `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` mentions
  `ax2 init`, but does not yet teach agents to use `ax2 state get` or
  workflow-specific intent commands.
- The Next plugin manifest does not declare a Claude Code monitor.

### Slice Decisions

This revision makes these implementation decisions explicit:

- The play-intent command group includes `claim` and `fail` in addition to
  `create` and `complete`. The issue wording calls out creation and
  completion, but the verification path requires a created intent to be
  claimed before it is completed, and the existing event taxonomy already
  includes failed intents.
- Production host cursors initialize to the current event-stream tail. A first
  monitor start must not wake on historical events. Replay from the beginning is
  allowed only as a test helper or a future explicit admin command.
- Claude Code is the only implemented host adapter in this slice. Codex is a
  design artifact only, but that design must bind to the same cursor,
  classification, and `session.wake.*` contracts.
- Claude plugin monitor registration should use
  `packages/alexandria-next-plugin/monitors/monitors.json`. Add
  `.claude-plugin/plugin.json` `experimental.monitors` metadata only if
  `claude plugin validate` does not auto-discover the default monitors path.
- A real Claude Code smoke is required before the issue is closed in a
  compatible host environment. Local skips are acceptable only when the host
  lacks the required `claude` CLI or monitor capability.

### Architectural Boundaries

AX2 owns deterministic mechanics:

- event schemas for cursor, canvas-classification, and wake events
- play-intent command parsing and command output contracts
- cursor persistence and runtime cursor APIs
- event classification rules
- monitor loop state-machine tests
- CLI exit codes, stdout/stderr split, and JSON shapes

The Alexandria Next plugin owns guided play behavior:

- skills should tell agents when to call AX2 commands
- plugin monitor registration belongs in the plugin package
- skills should not hand-write `events.jsonl` or cursor files

Host adapter packages own host-specific delivery:

- `packages/host-claude` owns Claude Code monitor delivery and monitor-output
  formatting
- `packages/host-codex` owns the Codex app-server design document in this
  slice, then later implementation

The local runtime server remains the normal write boundary. Host adapters may
read cursor and event pages through runtime APIs; they should not append to
JSONL or write cursor files directly.

Use Effect patterns already present in `packages/ax-next`: `Effect.gen` flows,
schema-backed domain contracts, `Effect.acquireRelease` for long-lived runtime
resources, structured command results, and stable operational errors mapped to
CLI results.

### Play Intent Command Contract

Add a nested `intent` group under `ax2 play`:

```bash
ax2 play intent create --play <play-id> --idempotency-key <key> \
  [--intent-id <id>] [--payload <json>] [--payload-file <path>] [--json]

ax2 play intent claim --id <intent-id> --claimant <name> \
  --idempotency-key <key> [--json]

ax2 play intent complete --id <intent-id> --idempotency-key <key> \
  [--result <json>] [--result-file <path>] [--json]

ax2 play intent fail --id <intent-id> --error <message> \
  --idempotency-key <key> [--json]
```

Command rules:

- `create` requires `--idempotency-key` so viewer and agent retries can recover
  the same logical intent.
- `create` accepts `--intent-id` for callers that already have a stable
  request id.
- When `--intent-id` is omitted, AX2 derives a deterministic intent id from the
  idempotency key using a versioned helper. A retry with the same key therefore
  emits the same `play.intent.created` payload before store-level idempotency
  checks run.
- `--payload` and `--payload-file` are mutually exclusive and must parse to a
  JSON object.
- `claim`, `complete`, and `fail` require the target intent to exist in the
  projected state.
- `claim` should reject terminal intents. `complete` and `fail` should reject
  unknown or already terminal intents unless the repeated call is satisfied by
  the same idempotency key.
- All writes go through the runtime append path, not direct JSONL writes.
- Human output is terse. JSON output is the stable black-box contract.

Success JSON should include at least:

```json
{
  "status": "appended",
  "intent": {
    "intentId": "intent_...",
    "playId": "source-assessment",
    "status": "created"
  },
  "event": {},
  "ledgerPath": "/abs/project/docs/alexandria/ledger/events.jsonl",
  "runtime": {
    "lifecycle": "temporary",
    "url": "http://127.0.0.1:4321/"
  }
}
```

Exit-code contract:

| Command | Exit codes |
|---------|------------|
| `play intent create` | `0` created or already created, `1` invalid project state/runtime failure/idempotency conflict, `2` invalid command input |
| `play intent claim` | `0` claimed or already claimed, `1` unknown intent, terminal intent, invalid state/runtime failure, or idempotency conflict, `2` invalid command input |
| `play intent complete` | `0` completed or already completed, `1` unknown intent, terminal intent, invalid state/runtime failure, or idempotency conflict, `2` invalid command input |
| `play intent fail` | `0` failed or already failed, `1` unknown intent, terminal intent, invalid state/runtime failure, or idempotency conflict, `2` invalid command input |

### Idempotency Key Contract

Idempotency keys are caller-provided stable strings. AX2 should validate that
they are non-empty, UTF-8 strings and should not parse private structure from
them except for deterministic intent-id derivation on `create`.

Recommended key shapes:

| Caller | Mutation | Key shape |
|--------|----------|-----------|
| Viewer | Play intent create | `viewer:<viewer-session-id>:play-intent:create:<play-id>:<request-id>` |
| Viewer | Canvas step save | `viewer:<viewer-session-id>:canvas.step.saved:<step-id>:<content-hash>` |
| Viewer | Canvas review request | `viewer:<viewer-session-id>:canvas.review.requested:<step-id>:<review-request-id>` |
| Agent | Intent claim | `agent:<host>:<session-id>:play-intent.claimed:<intent-id>` |
| Agent | Intent complete | `agent:<host>:<session-id>:play.intent.completed:<intent-id>:<result-hash>` |
| Agent | Intent fail | `agent:<host>:<session-id>:play.intent.failed:<intent-id>:<error-hash>` |
| Monitor | Wake requested | `monitor:<host>:<cursor-id>:session.wake.requested:<source-event-id>` |
| Monitor | Wake delivered | `monitor:<host>:<cursor-id>:session.wake.delivered:<source-event-id>` |
| Monitor | Wake failed | `monitor:<host>:<cursor-id>:session.wake.failed:<source-event-id>:<error-hash>` |

Store-level behavior remains the Slice 1 contract:

- same key plus same logical event content returns `already_appended`
- same key plus different logical content fails with an idempotency conflict

### New Event Schemas

Add these event types to `ALEXANDRIA_STATE_EVENT_TYPES`:

| Event type | Payload contract |
|------------|------------------|
| `canvas.step.saved` | `{ "stepId": string, "contentHash": string, "canvasId"?: string, "payload"?: Record<string, unknown> }` |
| `canvas.review.requested` | `{ "stepId": string, "reviewId": string, "canvasId"?: string, "prompt"?: string, "payload"?: Record<string, unknown> }` |
| `session.wake.requested` | `{ "sourceEventId": string, "cursorId": string, "host": "claude-code" \| "codex", "reason": string, "message": string }` |
| `session.wake.delivered` | `{ "sourceEventId": string, "cursorId": string, "host": "claude-code" \| "codex", "requestedEventId": string, "delivery": Record<string, unknown> }` |
| `session.wake.failed` | `{ "sourceEventId": string, "cursorId": string, "host": "claude-code" \| "codex", "requestedEventId"?: string, "error": string }` |

Canvas payloads are intentionally minimal. They exist in this slice so the
classification contract can distinguish save events from review-request events
without importing a full canvas model.

`session.wake.*` events are observability events. They must never be classified
as wake-worthy, otherwise a monitor can wake on its own wake record.

### Cursor Contract

Cursor files are runtime metadata under the configured Alexandria workspace:

```text
docs/alexandria/.runtime/cursors/<cursor-id>.json
```

Cursor ids are stable names owned by the adapter. Initial ids:

| Host | Cursor id |
|------|-----------|
| Claude Code default project session | `host:claude-code:default` |
| Codex design target | `host:codex:<thread-id>` |
| Deterministic tests | `test:<name>` |

Cursor file schema:

```json
{
  "schemaVersion": 1,
  "cursorId": "host:claude-code:default",
  "owner": {
    "kind": "process",
    "host": "claude-code",
    "process": "monitor"
  },
  "afterEventId": "uuid-or-null",
  "afterEventAt": "2026-05-20T00:00:00.000Z",
  "updatedAt": "2026-05-20T00:00:01.000Z"
}
```

Rules:

- Cursor files are not durable product history. They can be deleted or
  regenerated without corrupting Alexandria state.
- Missing cursor means the adapter is starting fresh. The default behavior is
  bootstrap-to-tail with no wake delivery, then process future events.
- Tests may request `fromBeginning` behavior for deterministic coverage, but
  production monitors should not wake for historical events on first start.
- If `afterEventId` is present and found in the event stream, the next page
  starts after that event.
- If `afterEventId` is present but missing from the event stream, the cursor is
  stale. Recovery advances the cursor to the current tail and emits no wake for
  skipped historical events.
- If a cursor file is malformed, AX2 should move it aside to a sibling
  `.invalid` file when possible, create a fresh tail cursor, and emit a
  structured warning in monitor JSON output. It should not crash a long-lived
  monitor loop.
- Cursor writes use temp-file-plus-rename atomic writes.
- Cursor advancement happens after each source event reaches a terminal monitor
  outcome: context-only skipped, ignored, wake delivered, or wake failed.
- Cursor APIs should be available through the local runtime server so host
  adapters do not write cursor files directly.

Runtime API additions:

```text
GET  /api/cursors/<cursor-id>
PUT  /api/cursors/<cursor-id>
GET  /api/events?cursor=<cursor-id>&limit=<n>
POST /api/cursors/<cursor-id>/advance
```

`GET /api/events?cursor=...` should return a bounded page plus cursor status:

```json
{
  "cursor": {
    "cursorId": "host:claude-code:default",
    "status": "ready"
  },
  "events": [],
  "returnedCount": 0,
  "truncated": false
}
```

Cursor statuses:

- `ready`: cursor existed and pointed into the current log
- `initialized`: cursor was missing and was initialized to tail
- `stale_recovered`: cursor pointed to an event no longer in the log and was
  advanced to tail without emitting historical wakes
- `malformed_recovered`: cursor file was malformed and was recovered to tail

Cursor advancement should be compare-and-set style at the runtime API boundary:

- `POST /api/cursors/<cursor-id>/advance` accepts the processed source
  `eventId`, its `at` timestamp, and the caller's expected current
  `afterEventId`.
- If the cursor already points at or beyond the processed event, the call is
  idempotent and returns the current cursor.
- If the expected current `afterEventId` does not match, return a structured
  conflict so two monitors for the same cursor cannot silently skip each
  other's work.
- `PUT /api/cursors/<cursor-id>` is for recovery and tests, not the normal
  monitor loop. Production monitors should advance through the dedicated
  advance endpoint.

### Wake Classification Contract

Add a pure classifier that accepts the source event, current projected state,
host identity, and cursor id. It should return one of:

```ts
type WakeClassification =
  | {
      kind: "wake";
      reason: "play-intent-created" | "canvas-review-requested";
      message: string;
    }
  | {
      kind: "context";
      reason: "canvas-step-saved" | "state-observed";
    }
  | {
      kind: "ignore";
      reason:
        | "wake-event"
        | "agent-lifecycle-event"
        | "play-lifecycle-event"
        | "source-assessment-event"
        | "unknown-nonwake-event";
    };
```

Classification rules for this slice:

| Event type | Classification |
|------------|----------------|
| `play.intent.created` | `wake` with reason `play-intent-created` |
| `canvas.review.requested` | `wake` with reason `canvas-review-requested` |
| `canvas.step.saved` | `context` with reason `canvas-step-saved` |
| `play.intent.claimed` | `ignore` |
| `play.intent.completed` | `ignore` |
| `play.intent.failed` | `ignore` |
| `play.started` | `ignore` |
| `play.completed` | `ignore` |
| `play.failed` | `ignore` |
| `assessment.recorded` | `ignore` |
| `session.wake.requested` | `ignore` |
| `session.wake.delivered` | `ignore` |
| `session.wake.failed` | `ignore` |

Wake messages should be deterministic and short. They should identify the
source event id, event type, play or review id when present, and the AX2 command
the agent should use next. For example, a play-intent wake should guide the
agent toward:

```bash
ax2 state get --json
ax2 play intent claim --id <intent-id> --claimant <agent-or-session> --idempotency-key <key> --json
```

### Claude Code Monitor Contract

The Claude Code monitor should be a long-running command declared by the
Alexandria Next plugin. It uses the plugin monitor mechanism, so each stdout
line is delivered to Claude Code as a monitor notification in an interactive
session.

Implementation shape:

- Add host-specific monitor logic in `packages/host-claude`.
- Add a thin AX2 command or binary entry point that the plugin monitor can run,
  for example:

  ```bash
  ax2 host claude monitor --cursor host:claude-code:default --follow --json-lines
  ```

- The monitor resolves the current project from `CLAUDE_PROJECT_DIR` when
  present, otherwise from the process working directory.
- The monitor waits for or starts the local Alexandria runtime server using the
  same runtime client lifecycle as write-capable AX2 commands.
- The monitor reads event pages through the cursor API.
- Context-only and ignored events advance the cursor without printing a wake
  line.
- Wake-worthy events append `session.wake.requested`, print exactly one wake
  guidance line for Claude Code, append `session.wake.delivered` after the line
  is accepted by the process stdout path, then advance the cursor.
- If delivery fails before stdout write completes, append `session.wake.failed`
  and advance the cursor so the completed loop does not duplicate the same
  failed wake forever.
- The monitor should support `--once` for deterministic tests and `--follow`
  for plugin use.
- `--poll-interval-ms` should default to a conservative value such as `1000`
  milliseconds and be configurable for tests.
- Monitor stdout in `--json-lines` mode should be one JSON object per line with
  a stable shape:

  ```json
  {
    "schemaVersion": 1,
    "kind": "alexandria.wake",
    "sourceEventId": "uuid",
    "reason": "play-intent-created",
    "message": "..."
  }
  ```

- Diagnostics go to stderr, not stdout, so Claude Code receives only wake
  notifications as monitor output.
- The plugin manifest should declare the monitor under
  `packages/alexandria-next-plugin/monitors/monitors.json`. Claude Code plugin
  monitors require Claude Code v2.1.105 or later, run only in interactive CLI
  sessions, run unsandboxed at the same trust level as hooks, and are skipped
  on hosts where the Monitor tool is unavailable.

Recommended plugin monitor command:

```json
{
  "name": "alexandria-state-wake-loop",
  "command": "ax2 host claude monitor --cursor host:claude-code:default --follow --json-lines",
  "description": "Alexandria state wake loop"
}
```

If implementation finds that released plugin payloads cannot assume `ax2` is on
`PATH`, add a small plugin-bundled wrapper script that locates the installed
AX2 binary using the same install/update paths already used by Alexandria Next.

### Codex Adapter Design Contract

This slice should add a design artifact under `packages/host-codex`, not a
working adapter.

The design should bind Codex behavior to the same cursor and classification
rules:

- Adapter reads Alexandria events through the local runtime cursor APIs.
- Adapter stores no private cursor state outside the Alexandria cursor file.
- Context-only events use Codex app-server `thread/inject_items` when a target
  thread is available, because that API can add context without starting a
  user turn.
- Wake-worthy events use:
  - `turn/steer` when a target thread has an active turn and the adapter knows
    the expected active turn id
  - `thread/inject_items` followed by a deliberate `turn/start` when the thread
    is idle and the product wants a background turn
- The adapter records `session.wake.requested`, `session.wake.delivered`, and
  `session.wake.failed` using the same idempotency-key shapes as Claude.
- The design must name what thread identity the cursor id uses
  (`host:codex:<thread-id>`) and how the adapter discovers or receives the
  target thread id.
- The design must explicitly avoid direct Codex rollout-file edits or private
  TUI state mutation.

Implementation of the Codex adapter remains deferred until a follow-up slice
can test against a real or generated app-server protocol client.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| State event domain | `packages/ax-next/src/domain/state-events.ts` | Add canvas save/review and `session.wake.*` event schemas |
| Cursor domain | New `packages/ax-next/src/domain/state-cursors.ts`; `packages/ax-next/src/domain/paths.ts` | Define cursor ids, cursor file schema, cursor path helpers, stale/malformed recovery statuses |
| State store | `packages/ax-next/src/domain/state-store.ts`, `packages/ax-next/src/effects/jsonl-state-store.ts` | Add read/write cursor and list-after-cursor behavior |
| Runtime server | `packages/ax-next/src/effects/runtime-server.ts` | Add cursor APIs and event-page-by-cursor reads |
| Runtime client | `packages/ax-next/src/effects/runtime-client.ts` | Add cursor API helpers and reusable runtime resolution for monitor loops |
| Play intent commands | `packages/ax-next/src/commands/play.ts` or new `commands/play-intent.ts`; router/help tests | Add `ax2 play intent create/claim/complete/fail` |
| Wake classification | New `packages/ax-next/src/domain/wake-classification.ts` | Centralize wake/context/ignore classification |
| Claude host adapter | `packages/host-claude/src/*`, `packages/host-claude/package.json` | Add monitor loop and fake-delivery test seam |
| Codex host adapter | `packages/host-codex/README.md` or `packages/host-codex/docs/app-server-adapter.md` | Document Codex app-server design against the shared cursor rules |
| Next plugin monitor | `packages/alexandria-next-plugin/monitors/monitors.json`; `.claude-plugin/plugin.json` only if validation requires an explicit `experimental.monitors` path | Register Claude Code monitor command |
| Next plugin skill | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` | Instruct agents to use AX2 commands for state reads and play-intent writes; forbid direct state-file writes |
| Tests | `packages/ax-next/tests/*`, new `packages/host-claude/src/*.test.ts` or package tests, plugin validation | Add deterministic command, cursor, classification, and monitor tests |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| AX2 CLI | Agents and viewer automation get workflow-specific play-intent commands instead of raw event append for intent lifecycle | Root help, play help, black-box command tests |
| Alexandria Next plugin skill | `ax-next-start` guidance tells agents to read state with `ax2 state get --json` and mutate play intents with `ax2 play intent ...` commands | Plugin validation, markdown lint, and guidance tests if available |
| Claude Code plugin monitor | Plugin starts a background monitor that wakes Claude from AX2 state changes | Plugin manifest validation and host smoke |
| Host adapters | Claude Code gets first implementation; Codex gets design against same cursor rules | Shared cursor and classification tests prevent host drift |
| Viewer Next | No UI change required; viewer-originated events are represented by event schemas and idempotency conventions | No viewer build required unless implementation touches viewer code |
| Alexandria 1 agents/skills | Not touched | No downstream updates |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused AX2 intent/cursor tests | `cd packages/ax-next && bun test tests/events.test.ts tests/state.test.ts tests/runtime-server.test.ts tests/play-intent.test.ts tests/wake-classification.test.ts` | Proves command contracts, projection, cursor APIs, stale recovery, and classification |
| Full AX2 suite | `cd packages/ax-next && bun test` | Catches regressions in init, state, events, runtime, viewer, play, and integration flows |
| Host Claude tests | `cd packages/host-claude && bun test` | Proves monitor loop behavior without requiring a real Claude Code session |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches state/cursor/runtime type drift |
| AX2 lint | `cd packages/ax-next && pnpm run lint` | Maintains package lint expectations |
| Host package typecheck/lint | `pnpm --filter @alexandria/host-claude run typecheck` and `pnpm --filter @alexandria/host-claude run lint` if scripts are added | Keeps new host package production code checked |
| Format check | `cd packages/ax-next && pnpm run format:check` plus relevant host/plugin format checks | Checks TypeScript/JSON/YAML formatting touched in this slice |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` | Required because the Next plugin manifest/skill changes |
| Markdown lint | `pnpm run lint:markdown` or targeted markdownlint for changed docs/skills | Required for changed plan, skill, and Codex design docs |

Required black-box and integration-style test cases:

- `ax2 play intent create --json` creates a `play.intent.created` event with a
  deterministic intent id, stable output fields, and runtime lifecycle data.
- Repeating `play intent create` with the same idempotency key returns the same
  event and same intent projection.
- Repeating `play intent create` with the same key but different payload fails
  with an idempotency conflict.
- `play intent claim` appends `play.intent.claimed` and projection status moves
  to `claimed`.
- `play intent complete` appends `play.intent.completed` and projection status
  moves to `completed`.
- `play intent fail` appends `play.intent.failed` and projection status moves
  to `failed`.
- Claiming or completing an unknown intent fails with exit code `1` and a
  useful stderr diagnostic.
- `state get --json` shows created, claimed, completed, and failed intents in
  the projected `playIntents` array.
- Cursor APIs create a missing cursor at tail without waking on historical
  events.
- Cursor APIs list events after a valid cursor and advance the cursor
  atomically.
- A cursor whose `afterEventId` is absent from the event stream recovers with
  status `stale_recovered`, advances to tail, and emits no historical wakes.
- A malformed cursor file recovers with status `malformed_recovered` and does
  not crash the monitor.
- Two monitor instances racing to advance the same cursor receive a deterministic
  cursor conflict instead of silently overwriting each other.
- Wake classification marks `canvas.step.saved` as context-only and
  `canvas.review.requested` as wake-worthy.
- Wake classification marks `session.wake.*` as ignored.
- A monitor `--once` run over one wake-worthy event emits one stdout JSON line,
  records `session.wake.requested`, records `session.wake.delivered`, and
  advances the cursor.
- A second monitor `--once` run at the advanced cursor emits no duplicate wake.
- A monitor run over a context-only save event advances the cursor and emits no
  stdout wake line.
- A monitor delivery failure records `session.wake.failed` and advances the
  cursor.
- A running monitor can consume events from an existing long-running runtime
  server without creating a second server.
- The Next plugin validates after monitor registration and skill guidance
  updates.

Host smoke test:

- Add an opt-in smoke script, for example
  `packages/host-claude/smoke/wake-loop-smoke.ts`.
- The smoke prepares a temporary initialized project, loads the local
  Alexandria Next plugin into a real interactive Claude Code CLI session, and
  appends a `play.intent.created` or `canvas.review.requested` event through
  AX2.
- The smoke passes only when the Claude Code session receives the monitor
  notification as non-user context and the state log contains the matching
  `session.wake.requested` and `session.wake.delivered` events.
- If the local `claude` CLI is missing, older than the monitor-capable version,
  or running in a mode where plugin monitors are unavailable, the smoke should
  skip with a clear reason. That skip is acceptable for local development but
  not for marking the slice complete in an environment intended to prove host
  support.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 play intent, cursor, and wake-classification behavior | Black-box Bun tests in `packages/ax-next/tests` | Add deterministic tests in this slice | `cd packages/ax-next && bun test` |
| Claude host monitor behavior | No existing host package tests | Add deterministic fake-delivery monitor tests | `cd packages/host-claude && bun test` |
| Alexandria Next plugin skill/manifest | Plugin validation exists; eval harness currently targets the shipped Alexandria 1 plugin | Run plugin validation and markdown lint; do not require eval-harness rerun unless the harness gains Next plugin support in this slice | `claude plugin validate ./packages/alexandria-next-plugin` |
| Reusable Alexandria 1 skills/agents | Not touched | No eval-harness rerun required | Not applicable |
| Codex adapter design | No runtime behavior in this slice | No eval-harness rerun required | Design review plus markdown lint |

No existing eval-harness suite covers `packages/alexandria-next-plugin` as of
this plan. Because this slice changes a Next plugin skill, the implementation
must at minimum run plugin validation and markdown lint. If implementation adds
Next plugin support to the eval harness or a Next plugin eval suite already
exists by then, add one targeted `ax-next-start` eval proving the skill uses
AX2 commands and does not write state files directly. Otherwise, record the
absence of Next plugin eval-harness coverage in the PR and keep deterministic
AX2 plus host-monitor tests as the merge gate.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A monitor wakes on its own `session.wake.*` events and loops forever | Classify all `session.wake.*` events as ignored; add an explicit no-loop test |
| Missing cursor bootstrap wakes on old historical events | Default missing cursors to tail initialization and test that no historical wake is emitted |
| Stale cursor recovery hides a legitimate event after log reset | Treat stale recovery as a safety recovery that advances to tail and logs status; document that replay requires an explicit test-only or future admin mode |
| Two monitor processes use the same cursor and silently skip each other's events | Make cursor advancement compare-and-set style and add a conflict test |
| Intent create retries generate different intent ids before idempotency checks | Require `--idempotency-key` and derive the default intent id deterministically from it |
| High-level intent lifecycle validation races with another writer | Keep store-level idempotency authoritative; run command lifecycle validation against current projection and defer fully transactional workflow-specific runtime endpoints if needed |
| Monitor stdout includes diagnostics that Claude treats as wake context | Put diagnostics on stderr and reserve stdout for stable wake JSON lines only |
| Claude Code monitor support is unavailable in non-interactive or older hosts | Gate the real smoke on host capability, skip with a clear reason locally, and require a passing smoke in an environment that supports Claude Code plugin monitors before closing the issue |
| Delivery can duplicate after a crash between stdout delivery and `session.wake.delivered` append | Prevent duplicates across completed monitor loops now; record crash-exactly-once delivery as a deferred hardening item |
| Codex design drifts from Claude behavior | Make the Codex design consume the same cursor ids, event classification, and `session.wake.*` idempotency rules; do not let Codex define private event types |
| Skill guidance regresses into direct file writes | Add explicit "do not write state files directly" guidance and validate through plugin validation plus any available Next plugin eval/guidance test |

### Implementation Steps

1. Add state event schemas for `canvas.step.saved`,
   `canvas.review.requested`, `session.wake.requested`,
   `session.wake.delivered`, and `session.wake.failed`.
2. Add cursor path helpers for `.runtime/cursors/` and a schema-backed cursor
   domain module with validation, serialization, and recovery statuses.
3. Extend the JSONL state store with cursor read/write and list-after-cursor
   helpers, using atomic cursor writes.
4. Add runtime server cursor endpoints and runtime client helpers for cursor
   reads, event pages by cursor, and cursor advancement.
5. Add the pure wake-classification module and unit tests for every event type
   in the current taxonomy.
6. Add `ax2 play intent create/claim/complete/fail` parsing, help text, JSON
   output, exit-code handling, deterministic intent-id derivation, and runtime
   append calls.
7. Add or update projection tests so `state get --json` proves created,
   claimed, completed, and failed play intents.
8. Create the `packages/host-claude` implementation surface: package scripts,
   monitor loop, fake delivery sink for tests, and an AX2 command or binary
   entry point for plugin monitor execution.
9. Implement monitor `--once` and `--follow` modes over the runtime cursor APIs.
10. Record `session.wake.requested`, host delivery, `session.wake.delivered` or
    `session.wake.failed`, and cursor advancement in that order.
11. Add deterministic monitor tests for missing cursor bootstrap, valid cursor
    advancement, stale cursor recovery, malformed cursor recovery, no duplicate
    wakes, delivery failure, and save-versus-review classification.
12. Register the Claude monitor in the Alexandria Next plugin manifest or
    `packages/alexandria-next-plugin/monitors/monitors.json`, adding explicit
    manifest metadata only if plugin validation requires it.
13. Update `ax-next-start` skill guidance to use `ax2 state get --json` and
    `ax2 play intent ...` commands, and to avoid direct state-file writes.
14. Add the Codex app-server adapter design artifact under `packages/host-codex`
    using the shared cursor/classification contract and official app-server
    primitives.
15. Add the opt-in real Claude Code host smoke script and document its skip
    conditions.
16. Run focused AX2 tests, host-claude tests, full AX2 tests, typecheck, lint,
    format checks, plugin validation, markdown lint, and the host smoke in a
    compatible Claude Code environment.

### Acceptance / Exit Criteria

1. AX2 exposes high-level play intent create, claim, complete, and fail
   commands with stable JSON output and exit codes.
2. Play intent commands write through the runtime server and project correctly
   through `ax2 state get --json`.
3. Viewer and agent retry idempotency keys are documented and tested for
   logical duplicate and conflict cases.
4. Named cursor files live under the configured workspace's `.runtime/cursors/`
   directory and are accessed through runtime APIs by host adapters.
5. Cursor tests prove missing-cursor bootstrap, normal advancement, no duplicate
   wakes, stale cursor recovery, and malformed cursor recovery.
6. Classification tests prove `canvas.review.requested` wakes and
   `canvas.step.saved` does not.
7. Claude Code monitor tests prove one wake line per wake-worthy source event,
   no duplicate wake after cursor advancement, and `session.wake.*`
   observability events.
8. A real Claude Code host smoke proves a state event can trigger a non-user
   monitor notification when Claude Code monitor support is available.
9. Alexandria Next plugin guidance uses AX2 commands for state reads and play
   intent lifecycle writes, and no skill guidance tells agents to write
   `events.jsonl` or cursor files directly.
10. The Codex adapter design exists and is explicitly bound to the same cursor,
    classification, and wake-event contracts.
11. No Alexandria 1 package or `docs/alexandria/library/` file is changed to
    complete this slice.

### Deferred Follow-Ups

1. Implement the Codex app-server adapter and its smoke tests.
2. Add high-level canvas save/review commands once Viewer Next needs them.
3. Add transactional workflow-specific runtime endpoints if command-side
   lifecycle validation proves insufficient under concurrent writers.
4. Harden crash-exactly-once wake delivery across the stdout-delivered but
   `session.wake.delivered`-not-yet-written window.
5. Add replay/admin cursor commands for intentional historical replay after a
   stale cursor recovery.
6. Add Next plugin eval-harness support if it does not already exist when this
   implementation starts.
7. Revisit cursor storage if log compaction or SQLite snapshots change the
   stale-cursor recovery model.

### Blocking Open Questions For Slice 3

None. This plan selects Claude Code as the first implemented host, treats Codex
as a design-only deliverable for this slice, defaults new production cursors to
tail initialization, and records crash-exactly-once delivery as a follow-up
hardening problem.

## API Surface Notes

There is no storage-level distinction between public and internal event types:
all durable events live in the same validated event stream.

The distinction, if used, is about support level:

- **Stable events** are documented as part of the AX2 contract. Viewer Next,
  plugin skills, host adapters, and users can rely on them.
- **Experimental events** are schema-validated and durable, but may change while
  a feature is being proven.
- **Host-private payload fields** should be avoided in durable events. Host
  adapters can carry host-specific details inside a documented payload object,
  but projections should not depend on opaque private fields.

## Remaining Follow-Up Question

1. Do we need any supported offline/direct-write repair command after the
   single-writer runtime has shipped and been exercised?

## Acceptance Criteria

This architecture slice is complete when:

1. AX2 has a documented state event envelope and event taxonomy.
2. AX2 has a storage interface that can support JSONL now and SQLite later.
3. JSONL remains the first backend and uses the existing ledger path.
4. Viewer, CLI, plugin skills, and host adapters all have a clear integration
   path through the same contract.
5. The next implementable issue is small enough to start without revisiting the
   whole architecture.
