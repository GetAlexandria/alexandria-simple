# AX2 Viewer And Agent Architecture

- Goal: track the larger Alexandria Next architecture needed for a viewer-led,
  agent-collaborative product experience.
- Related plan:
  `docs/alexandria/plans/ax2-state-contract-storage/plan.md`.
- Primary packages: `packages/viewer-next`, `packages/ax-next`,
  `packages/alexandria-next-plugin`.

## Summary

Alexandria Next needs more than a better viewer shell. The intended experience
requires five connected surfaces:

1. A visually strong Viewer Next application.
2. A local Alexandria state runtime.
3. CLI access to that state.
4. Agent access to that state from Claude Code and Codex.
5. Background event delivery that can occasionally wake or steer an agent turn.

The state contract and storage abstraction plan is the foundation. This plan
tracks the larger product architecture built on top of it.

## Guiding Shape

The target shape is:

```text
Viewer Next
AX2 CLI
Plugin skills
Claude Code monitor
Codex app-server adapter
        |
        v
Local Alexandria server
        |
        v
Alexandria state stream + projections
```

The local Alexandria server is the normal write boundary. JSONL or SQLite is an
implementation detail behind the state store.

## Component 1: Viewer UI Upgrade

Viewer Next needs to become a real Alexandria workspace rather than a shell.

Scope:

- Visual system for Alexandria Next.
- Homepage that explains project state and gives a clear first action.
- Workspace chrome for active plays, state, sources, and history.
- Status surfaces for local server connection and project initialization.
- Responsive layouts for laptop and large-display use.
- A first usable play surface, likely Source Assessment or an inbox/source
  review dashboard.

Important constraints:

- Do not port Alexandria 1 visuals wholesale.
- Do not make the viewer own state rules.
- The viewer should call local runtime APIs exposed by `ax2 viewer` or the
  local Alexandria server.

Verification:

- Viewer builds and typechecks.
- Browser smoke test opens the homepage through `ax2 viewer`.
- Runtime connection state is visible and backed by `/api/state`.
- No viewer-only state model exists for Alexandria project state.

## Component 2: Local State Runtime

The viewer must read and update local Alexandria state through the shared
runtime.

Scope:

- Event stream and projection contract.
- Local server as the single writer.
- Runtime endpoints for state, events, mutations, and event streaming.
- Storage backend hidden behind an abstraction.
- JSONL first, SQLite later if the query and concurrency needs justify it.

The current decision is JSONL first at:

```text
docs/alexandria/ledger/events.jsonl
```

Runtime metadata and cursors live under:

```text
docs/alexandria/.runtime/
```

Verification:

- State can be appended, listed, validated, and projected by AX2.
- Viewer and CLI writes go through the local server.
- Starting a second server for the same workspace fails or reuses according to
  an explicit command contract.
- A temporary server can be started for short CLI writes and stopped afterward.

## Component 3: CLI State Access

The CLI is the deterministic interface for humans, agents, tests, and host
adapters.

Initial surfaces:

```bash
ax2 state get --json
ax2 events list --json
ax2 events validate --json
ax2 events append --type <type> --payload <json> --idempotency-key <key> --json
```

Likely workflow-specific surfaces:

```bash
ax2 play intent create --play <play> --payload <json> --json
ax2 play intent complete --id <id> --payload <json> --json
ax2 canvas save --step <step> --payload <json> --json
ax2 canvas review-request --step <step> --payload <json> --json
```

Design notes:

- Read-only commands may read from disk when no server is running.
- Write commands should submit to the local server.
- If no server is running, short write commands should start a scoped temporary
  server, submit the mutation, then stop it.
- Raw event append remains available, but schema validation is mandatory.

Verification:

- Black-box CLI tests cover exit codes, stdout/stderr split, and JSON shape.
- Write commands work both with and without a pre-existing server.
- Commands do not leave a temporary server running after completion.

## Component 4: LLM State Access

Agents need a host-neutral way to read and update Alexandria state.

Preferred path:

- Plugin skills instruct agents to use AX2 commands.
- AX2 commands submit writes through the local server.
- Agents do not hand-write state files.
- Host-specific tools are used only where the host requires them.

Claude Code:

- Next plugin skills provide guidance and command recipes.
- Plugin monitors handle background event observation.
- Agent state reads and writes happen through `ax2`.

Codex:

- Codex-facing instructions also use `ax2`.
- Codex-specific app-server integration handles thread context injection and
  steering.
- The state model remains identical to Claude Code.

Verification:

- A plugin skill can create and complete a play intent using only AX2 commands.
- The same commands work from a Codex session.
- No skill needs to parse or rewrite the ledger file directly.

## Component 5: Background Event Delivery

Alexandria state changes need to reach agent sessions without becoming ordinary
user messages. Some events should merely update context; some should trigger or
steer a turn.

Shared contract:

- Host adapters consume the same state stream.
- Each adapter maintains a cursor.
- Event classification decides whether an event is context-only or wake-worthy.
- Duplicate wakes are prevented by cursor advancement and event idempotency.

Claude Code likely path:

- Plugin monitor watches the local event stream or polls through AX2.
- Monitor injects async rewake guidance for wake-worthy events.
- Save and review events produce different guidance.

Codex likely path:

- Codex app-server observes Alexandria events.
- It uses thread context injection for background state updates.
- It uses turn steering or equivalent wake mechanics for wake-worthy events.

Verification:

- Host adapter tests cover cursor advancement, stale cursor recovery, duplicate
  event handling, and event classification.
- Claude Code smoke test proves a state event can wake the agent with the right
  guidance.
- Codex smoke test proves a state event can inject non-user context and steer or
  trigger a turn.

## Suggested Sequence

### Phase 1: Prove State

Deliver the state contract, store, projection, event CLI, and black-box tests.

Why first: every other component depends on the same contract.

### Phase 2: Prove Single-Writer Runtime

Deliver the local server runtime, server metadata, write-through CLI behavior,
and SSE.

Why second: viewer and host adapters should not create direct JSONL writers.

### Phase 3: Prove Viewer Reads State

Upgrade Viewer Next enough to show real project state and event updates.

Why third: this gives a visible workspace without requiring agent wake behavior.

### Phase 4: Prove Agent Writes State

Add plugin skill guidance and play intent commands so Claude Code and Codex
agents can read and mutate state through AX2.

Why fourth: this proves the agent can work against the same state model as the
viewer.

### Phase 5: Prove Background Wake

Implement host adapters for background event delivery, starting with Claude Code
and then Codex.

Why fifth: wake behavior is valuable only after state, server, viewer, and agent
write paths are coherent.

## Candidate Issues

This larger architecture can be tracked as one epic with these larger issues:

1. **AX2 state contract and local runtime** - state log, projection, CLI, local
   server, and SSE.
2. **Viewer Next product shell** - visual system, homepage, state dashboard, and
   first project-state views.
3. **Agent state bridge** - plugin skill guidance and AX2 play/canvas commands.
4. **Host event adapters** - Claude Code monitor and Codex app-server adapter
   over the same cursor and event classification contract.

The first issue may still be split into the verification slices from the state
contract plan if it becomes too large to review safely.

## Open Questions

1. What is the first viewer-led play surface: Source Assessment, inbox review,
   product orientation, or a minimal event dashboard?
2. Should `ax2 viewer` be the only long-running server command, or should there
   also be explicit `ax2 server start/status/stop` commands?
3. Which event types are stable enough to document in the first experimental
   release?
4. What is the minimum Codex app-server integration required to prove
   non-user-context injection?
5. Should Viewer Next expose raw event inspection for debugging, or keep that
   only in the CLI?

## Exit Criteria

This larger architecture is proven when:

1. Viewer Next can display live Alexandria project state from the local runtime.
2. AX2 can read and mutate the same state from the CLI.
3. Claude Code and Codex agents can read and mutate state through AX2.
4. At least one host adapter can observe state events in the background without
   turning them into ordinary user messages.
5. A wake-worthy event can trigger or steer one agent turn with dedupe and cursor
   semantics verified.
