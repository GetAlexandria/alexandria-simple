# Fabro Playbook And PlayRun State Model

- Status: first implementation slice complete; follow-up model review remains open
- Issue: none yet
- Goal: agree on the minimal Alexandria state needed to power a Playbook viewer
  and a Plays / runs status UI while keeping Fabro workflows, runs, stages, and
  human-gate state as the execution source of truth.

## Summary

Alexandria Next already proves the narrow Fabro path:

- `packages/alexandria-next-plugin` owns the playbook payload.
- `packages/alexandria-next-plugin/workflows/source-assessment/workflow.fabro`
  is a plugin-owned Fabro workflow template.
- `ax2 run source-assessment` renders that workflow, starts a Fabro sidecar,
  executes the workflow, and writes `play.started` plus terminal play events to
  the Alexandria ledger.
- Viewer Next had the Raven / Knowledge Bank surface and disabled Playbook and
  Ledger concepts before this slice. The first implementation now enables the
  Playbook tab.

The first slice removes the obsolete `PlayIntent` model and replaces it with a
real `PlayRun` model. Alexandria holds only product-level metadata and pointers
that Fabro does not know about: play identity, agent identity, knowledge
eligibility context, and the Fabro run pointer. Fabro remains responsible for
workflow graph semantics, run status, runtime stage state, logs, artifacts, and
human questions.

## Pre-Implementation Gap

Before this slice, state had three mismatches with the desired product model:

1. `PlayIntent` is still present as a request/queue model even though no active
   user depends on it and the desired surface is direct play execution plus run
   status.
2. `play.started`, `play.completed`, and `play.failed` events exist, but
   Alexandria state does not expose them as `playRuns`.
3. `PLAY_MANIFEST` only contains `id` and `name`, so the viewer cannot render a
   meaningful Playbook, required KB areas, eligible agent, or workflow metadata.

## Source Of Truth Boundaries

| Concept | Source of truth | Notes |
| --- | --- | --- |
| Playbook / plays | Alexandria Next plugin and AX2 static manifest | The plugin owns workflow templates; AX2 can carry a typed manifest for deterministic CLI/viewer output. |
| Fabro run target | `workflow.toml` run config when present; otherwise `.fabro` graph | Alexandria should point at the Fabro run target, not reinterpret Fabro config. |
| Fabro workflow graph | `.fabro` workflow graph referenced by the run target | Alexandria should not duplicate graph internals as durable state. |
| Fabro run lifecycle | Fabro run store / server API / CLI output | Alexandria stores a pointer and may derive a high-level status for the viewer. |
| Move | `.fabro` workflow graph on disk | Alexandria derives a static Move model from Fabro nodes for the Playbook viewer. |
| Fabro runtime stage state | Fabro run stages and events | Alexandria should not persist move execution state. |
| Human-gate questions | Fabro questions API and run `current_question` | Alexandria can surface "needs human feedback" as a derived status. |
| Agent / job title / KB eligibility | Alexandria config and static agent/KB manifests | Fabro does not know Alexandria agents or product knowledge gates. |
| History | Alexandria ledger plus Fabro run history | Alexandria ledger records product-level lifecycle and pointers. |

## Proposed Model Review

This section is the model-by-model proposal to iterate on before implementation.

### PlayIntent

Decision: delete it.

`PlayIntent` currently means "some actor wants a play to happen." It overlaps
with future run-launch UI, but it is neither an Alexandria run nor a Fabro run.
There is no migration requirement.

Remove:

- `play.intent.created`
- `play.intent.claimed`
- `play.intent.completed`
- `play.intent.failed`
- `PlayIntent` model and any current projection type
- active docs, tests, and plugin skill guidance that teach intent events

Do not replace it in this slice. If the viewer later needs a queueable request
that cannot start a run directly, design that as a separate model after the
Playbook and PlayRun surfaces exist.

### Playbook

Purpose: static catalog of plays available in an Alexandria Next installation.

Persistence: none. It is derived from the plugin/AX2 manifest and workflow
template lookup.

Minimal shape:

```ts
interface Playbook {
  plays: Play[];
}
```

The Playbook viewer should render this catalog even when no play has ever run.

### Play

Purpose: Alexandria product metadata for a Fabro workflow that can be run as a
play.

Persistence: static manifest only. Do not persist per-workspace copies unless a
future customization feature requires it.

Minimal shape:

```ts
interface Play {
  id: PlayId;
  name: string;
  description?: string;
  defaultAgentId: AgentId;
  requiredKnowledgeBaseAreaIds: KnowledgeBaseAreaId[];
  workflow: {
    engine: "fabro";
    targetPath: string;
    graphPath?: string;
  };
  moves: Move[];
  transitions: MoveTransition[];
}
```

Notes:

- `source-assessment` can start with `requiredKnowledgeBaseAreaIds: ["vision"]`
  if Vision is the first real gate.
- `defaultAgentId` is the agent Alexandria should associate with the play unless
  a future run path explicitly chooses another eligible agent. It does not mean
  the play belongs to that agent.
- `requiredKnowledgeBaseAreaIds` is enough for now. Do not add a generic
  prerequisite model until there is a second concrete prerequisite type.
- `workflow.targetPath` points at the plugin-owned Fabro run target. Prefer
  `workflow.toml` when the play needs run config, inputs, model/sandbox
  defaults, hooks, or an explicit graph pointer. A bare `.fabro` graph is still
  valid for simple plays.
- `workflow.graphPath` is a display/diagnostic pointer to the Graphviz graph
  when it is known. The graph remains Fabro-owned.

### Move

Decision: Alexandria should have its own `Move` model, but it should be
read-only and derived from Fabro workflow files on disk.

In product language, a Move is Alexandria's model of a Fabro workflow node.
It is useful for the Playbook viewer even when no run exists. It is not the same
thing as Fabro's runtime stage execution state:

- graph nodes come from the `.fabro` workflow
- transitions come from Fabro graph edges
- runtime stage state comes from Fabro run stages
- logs, artifacts, and events come from Fabro run APIs

Minimal Alexandria rule:

```text
Move = static Alexandria model derived from a Fabro workflow node on disk.
```

Fabro's static graph node and edge models are intentionally small:

```ts
interface FabroNode {
  id: string;
  attrs: Record<string, FabroAttrValue>;
  classes: string[];
}

interface FabroEdge {
  from: string;
  to: string;
  attrs: Record<string, FabroAttrValue>;
}

type FabroAttrValue =
  | { kind: "string"; value: string }
  | { kind: "integer"; value: number }
  | { kind: "float"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "duration"; value: string };
```

Alexandria should derive Fabro nodes and edges into viewer-friendly static
shapes:

```ts
interface Move {
  id: MoveId;
  playId: PlayId;
  nodeId: string;
  label: string;
  kind: MoveKind;
  shape: string;
  classes: string[];
  source: {
    graphPath: string;
    nodeId: string;
  };
}

type MoveKind =
  | "start"
  | "exit"
  | "agent"
  | "prompt"
  | "human"
  | "conditional"
  | "parallel"
  | "parallel.fan_in"
  | "command"
  | "tool"
  | "stack.manager_loop"
  | "wait"
  | "unknown";

interface MoveTransition {
  fromMoveId: MoveId;
  toMoveId: MoveId;
  label?: string;
  condition?: string;
}
```

Field mapping:

| Alexandria field | Source |
| --- | --- |
| `Move.id` | Alexandria-generated stable id, likely `${playId}:${node.id}` |
| `Move.playId` | Parent `Play.id` |
| `Move.nodeId` | Fabro `Node.id` |
| `Move.label` | Fabro node `label` attr; falls back to `Node.id` |
| `Move.kind` | Fabro node `type` attr when present; otherwise Fabro's shape-to-handler mapping; `unknown` if neither resolves |
| `Move.shape` | Fabro node `shape` attr; defaults to `box` in Fabro |
| `Move.classes` | Fabro `Node.classes`, derived from node `class` attr and subgraph context |
| `Move.source.graphPath` | Parent `Play.workflow.graphPath` |
| `Move.source.nodeId` | Fabro `Node.id`, repeated for source traceability |
| `MoveTransition.fromMoveId` | Fabro `Edge.from` resolved through the play's move ids |
| `MoveTransition.toMoveId` | Fabro `Edge.to` resolved through the play's move ids |
| `MoveTransition.label` | Fabro edge `label` attr, when present |
| `MoveTransition.condition` | Fabro edge `condition` attr, when present |

Fabro edges also expose `weight`, `fidelity`, `thread_id`, `loop_restart`, and
`freeform`. Do not add them to `MoveTransition` for the first Playbook viewer
unless the UI needs to display or sort by them.

Do not introduce a separate `MoveRunOverlay` model in the first slice. Runtime
move progress belongs under `PlayRun`, if it is needed at all. The
Playbook viewer can show the static moves and transitions immediately. The
Plays / runs status UI should start with run-level status only; if it later needs
a "current move" label, derive that from Fabro run stages as a transient
`PlayRun` field.

### PlayRun

Purpose: Alexandria's product-level wrapper around one Fabro run of one play by
one Alexandria agent.

Persistence: derived from Alexandria ledger events plus optional live Fabro
lookup. Store only Alexandria fields and the direct Fabro run pointer.

Minimal shape:

```ts
interface PlayRun {
  id: PlayRunId; // Alexandria id generated before launching Fabro
  playId: PlayId; // Alexandria ledger payload; links to Play.id
  agentId: AgentId; // Alexandria ledger payload; usually Play.defaultAgentId
  status: PlayRunStatus; // derived from lifecycle events, later refined by Fabro
  fabroRunId?: string; // Fabro run id from Fabro run.created / run store
  fabroStatus?: FabroRunStatusKind; // optional live Fabro run status lookup
  workflowTargetPath?: string; // copied from Play.workflow.targetPath
  workflowGraphPath?: string; // copied from Play.workflow.graphPath
  createdAt: string; // timestamp of Alexandria play.started event
  updatedAt: string; // timestamp of latest lifecycle or status-sync event
  startedAt?: string; // Alexandria play.started timestamp or Fabro run start
  completedAt?: string; // Alexandria play.completed timestamp or Fabro terminal time
  failedAt?: string; // Alexandria play.failed timestamp
  error?: string; // Alexandria play.failed payload
}

type PlayRunStatus =
  | "submitted"
  | "running"
  | "needs_human_feedback"
  | "paused"
  | "succeeded"
  | "failed"
  | "dead"
  | "unknown";
```

Minimal ledger events:

```text
play.started
play.completed
play.failed
```

Payload changes:

The event payloads should use the same field names as `PlayRun` where possible:
`playRunId`, `playId`, `agentId`, `fabroRunId`, `workflowTargetPath`,
`workflowGraphPath`, and terminal details such as `error`.
`PlayRun.id` is exposed as `playRunId` in ledger payloads to avoid ambiguity with
the ledger event id.

Open decision: keep the existing event names or rename to `play.run.started`,
`play.run.completed`, and `play.run.failed`. Keeping current names is lower
churn. Adding the first-class PlayRun id is the key fix.

Derivation rules:

1. A `play.started` event creates or updates one `PlayRun`.
2. `PlayRun.id` is the Alexandria identity. `fabroRunId` is the direct pointer
   to the Fabro run.
3. A terminal event sets `succeeded` or `failed`.
4. A started run with no terminal event is `running` unless the payload or live
   Fabro lookup says a more precise status.
5. Fabro `blocked` with pending questions maps to `needs_human_feedback`.
6. Fabro `paused` maps to `paused`.
7. Fabro `dead` maps to `dead`.
8. Do not store Fabro stage lists, logs, artifacts, or question bodies in the
   Alexandria ledger.

There should not be a separate `FabroRunPointer` model. `PlayRun.fabroRunId`
points directly at the Fabro run, and the workflow paths stay on `PlayRun` for
diagnostics and viewer display.

### Fabro Run Status Mapping

Fabro run statuses to account for:

```text
submitted
pending
runnable
starting
running
blocked
paused
removing
succeeded
failed
dead
```

Alexandria display mapping:

| Fabro status | Alexandria display |
| --- | --- |
| submitted, pending, runnable, starting | submitted |
| running | running |
| blocked with pending question | needs_human_feedback |
| blocked without question | running or unknown, with detail if available |
| paused | paused |
| succeeded | succeeded |
| failed | failed |
| dead | dead |
| removing | unknown or hidden |

First slice can rely on Alexandria ledger status only. A later slice can query
Fabro by `fabroRunId` to refine non-terminal statuses and human-gate state.

### Agent

Purpose: Alexandria actor that can run plays and hold Knowledge Base state.

Persistence: existing config plus static agent manifest. Do not create a new
agent table in this slice.

Minimal shape:

```ts
interface Agent {
  id: AgentId;
  name: string;
  jobTitle: string;
  status: "available" | "locked";
  knowledgeBaseAreaIds: KnowledgeBaseAreaId[];
}
```

Current concrete agent:

```text
raven = Product Owner
```

The viewer already has Raven plus locked future seats. Keep that model. A
`PlayRun` should refer to `agentId`.

### KnowledgeBaseArea

Purpose: Alexandria-only eligibility gate for plays.

Persistence: existing agent config for durable state; static manifests for
definitions.

Minimal shape:

```ts
interface KnowledgeBaseArea {
  id: KnowledgeBaseAreaId;
  agentId: AgentId;
  label: string;
  status: "available" | "in_progress" | "banked" | "locked";
}
```

For Raven, this can map directly onto current Knowledge Bank subjects:

```text
vision
vocabulary
bets
guardrails
user-research
```

Each `KnowledgeBaseArea` belongs to one `Agent`. Do not generalize beyond Raven
unless the implementation needs it for the Playbook viewer. The play manifest
can still use ids that survive additional agents later.

## Minimal Viewer Surfaces

### Playbook Viewer

Goal: enable the existing Playbook tab with a simple catalog.

Inputs:

- `state.playbook.plays`
- `state.agents`
- `state.knowledgeBaseAreas`

Display:

- play name
- eligible/default agent
- workflow engine: Fabro
- required knowledge base areas and whether they are satisfied
- last run status, if any

Non-goals:

- no complex graph editor
- no Kanban
- no move-level persisted state
- no run launch button unless it can directly call a real execution path

### Plays / Runs Status

Goal: show current and recent play executions.

Inputs:

- `state.playRuns`
- optional Fabro status lookup by `fabroRunId` in a later slice

Display:

- play
- agent
- Alexandria status
- Fabro run id
- started/completed time
- error, if failed
- human feedback marker, when Fabro reports a pending question

Rows are enough. Do not start with a Kanban board.

## Proposed Alexandria State Shape

```ts
interface AlexandriaStateSnapshot {
  playbook: Playbook;
  agents: Agent[];
  knowledgeBaseAreas: KnowledgeBaseArea[];
  playRuns: PlayRun[];
  // Existing non-Fabro-play state remains unchanged and is omitted here.
}
```

Remove:

```ts
playIntents: PlayIntent[];
```

The implementation file may remain `packages/ax-next/src/domain/project-state.ts`
for now. This plan should not introduce "Alexandria Project" as product
vocabulary.

## Event Schema Changes

Remove from `ALEXANDRIA_STATE_EVENT_TYPES`:

```text
play.intent.created
play.intent.claimed
play.intent.completed
play.intent.failed
```

Keep and extend:

```text
play.started
play.completed
play.failed
```

Minimum required payload fields after the change:

| Event | Required | Optional |
| --- | --- | --- |
| `play.started` | `playRunId`, `playId`, `agentId` | `fabroRunId`, `workflowTargetPath`, `workflowGraphPath`, `acpProvider` |
| `play.completed` | `playRunId`, `playId`, `agentId` | `fabroRunId`, `workflowTargetPath`, `workflowGraphPath`, `status`, `exitCode` |
| `play.failed` | `playRunId`, `playId`, `agentId` | `fabroRunId`, `workflowTargetPath`, `workflowGraphPath`, `status`, `exitCode`, `error` |

Potential follow-up events, not required for first slice:

```text
play.human_feedback.requested
play.human_feedback.answered
play.status.synced
```

Prefer not adding these until Fabro question/status sync exists.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX2 play manifest | `packages/ax-next/src/domain/plays.ts` | Expand from `id`/`name` to play metadata, default agent, Fabro run target pointer, graph pointer, and required KB areas |
| AX2 state events | `packages/ax-next/src/domain/state-events.ts` | Delete `play.intent.*`; require `playRunId` and `agentId` for play lifecycle events |
| AX2 state builder | `packages/ax-next/src/domain/project-state.ts` | Delete `playIntents`; add `playbook`, `agents`, `knowledgeBaseAreas`, and `playRuns` |
| AX2 run command | `packages/ax-next/src/commands/play.ts` | Generate `playRunId`; write enriched play lifecycle payloads; keep Fabro execution behavior |
| AX2 state summary | `packages/ax-next/src/commands/state.ts` | Replace play-intent count with play-run count and maybe playbook count |
| Alexandria Next plugin skills | `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`, `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` | Remove PlayIntent guidance; teach play runs only if needed |
| Viewer runtime schema | `packages/viewer-next/src/app/runtime/schemas.ts` | Decode `playbook` and `playRuns`, stop decoding `playIntents` |
| Viewer app navigation | `packages/viewer-next/src/components/library/**`, `packages/viewer-next/src/app/navigation/top-navigation.fixtures.ts` | Enable Playbook tab and add simple Playbook / play-run rows |
| Viewer tests/fixtures | `packages/viewer-next/tests/**` | Add fixture data and Playwright assertions for Playbook and play-run status |
| Local playground / docs | `packages/ax-next/e2e/local-playground/**`, `packages/ax-next/README.md` | Remove intent examples; add play-run examples where useful |

## Behavior Surfaces

| Surface | Behavior shift | Validation |
| --- | --- | --- |
| AX2 CLI | `ax2 run <play-id>` creates a first-class Alexandria `PlayRun` around the Fabro run | AX2 integration and state tests |
| Runtime state | `/api/state` exposes `playbook` and `playRuns` instead of `playIntents` | Runtime server tests and viewer schema tests |
| Viewer | Playbook tab becomes usable; runs status appears as rows | Viewer unit and Playwright tests |
| Plugin skills | Event-log guidance stops talking about play intents | Plugin validation; no LLM eval unless skill behavior materially changes |

## Implementation Steps

This plan is intentionally ordered so model deletion and state derivation happen
before UI polish.

1. Delete `PlayIntent` event types, schemas, state derivation, CLI docs, and
   tests.
2. Expand `PLAY_MANIFEST` into a typed play manifest for the Playbook viewer.
3. Add `playRunId` generation to `ax2 run <play-id>` and include `agentId` plus
   Fabro pointers in lifecycle event payloads.
4. Add `derivePlaybook` and `derivePlayRuns` to Alexandria state.
5. Update `ax2 inspect state --json` and `/api/state` schemas/tests to expose
   `playbook` and `playRuns`.
6. Update runtime/viewer decode schemas.
7. Enable the Viewer Playbook tab and render a simple play catalog.
8. Add a simple runs status table/row list, either inside the Playbook view or
   as a separate Plays view depending on the smallest viewer change.
9. Run focused AX2 and Viewer tests.
10. Add Fabro live-status/question refinement only after the first static state
    shape and UI are working.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX2 state/event tests | `cd packages/ax-next && bun test tests/events.test.ts tests/state.test.ts` | Proves event schema deletion/addition and `playRuns` derivation |
| AX2 run integration | `cd packages/ax-next && bun test tests/ax2.integration.test.ts tests/play-workflow-template.test.ts` | Proves `ax2 run` still runs Fabro and writes enriched lifecycle events |
| AX2 full package | `pnpm --filter @alexandria/ax-next run test` | Catches cross-command regressions |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Validates Effect/Schema/type changes |
| Viewer schema/unit tests | `pnpm --filter @alexandria/viewer-next run test` | Proves runtime decode and component behavior |
| Viewer browser tests | `pnpm --filter @alexandria/viewer-next run test:e2e` | Proves Playbook and play-run UI renders |
| Fabro product E2E | `pnpm --filter @alexandria/ax-next e2e:fabro-product -- --skip-browser` or full browser run when UI is included | Proves installed AX2 + Fabro play execution still works |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` | Required if plugin skills/manifests change |

## Eval Impact

No Alexandria 1 eval rerun is required if this work only changes AX2, Viewer
Next, and Alexandria Next plugin guidance. If `packages/alexandria-next-plugin`
skills change materially, run plugin validation and record that a Next-specific
skill eval harness remains deferred.

The main quality gate is deterministic AX2, runtime, viewer, and Fabro product
E2E coverage.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Alexandria starts duplicating Fabro's workflow/run/stage model | Keep persisted Alexandria state to play/agent/KB/Fabro pointers; derive moves and human-question status from Fabro |
| `PlayRun` status becomes stale after detached runs | First slice can show ledger-derived status; later add live Fabro status sync/query by `fabroRunId` |
| Legacy AX2 ledgers contain `play.intent.*` or old play lifecycle payloads | Backward compatibility is not required for AX2; reset or reinitialize stale dev ledgers instead of adding legacy parsing |
| Play required KB areas overfit Raven | Use durable knowledge-base-area ids but only implement Raven subjects initially |
| Viewer takes on model ownership | Viewer consumes `/api/state`; AX2/domain model remains the contract owner |
| Event schema churn creates noisy tests | Delete intent tests intentionally; add focused play-run state tests before UI work |

## Acceptance Criteria

1. `PlayIntent` event types, state derivation, docs, and active tests are gone.
2. `ax2 inspect events schema --json` no longer lists `play.intent.*`.
3. `ax2 run source-assessment --json` records a `play.started` event with
   `playRunId`, `playId`, `agentId`, and the Fabro run pointer when available.
4. `ax2 inspect state --json` exposes `playbook.plays` and `playRuns`.
5. Viewer Playbook tab renders at least the `source-assessment` play.
6. Viewer shows play-run status rows for running/succeeded/failed play runs.
7. No Alexandria state stores Fabro stage logs, artifacts, or question bodies.
8. Existing Raven Knowledge Bank behavior still works.
9. Fabro product E2E still passes for the source-assessment workflow.

## Deferred Follow-Ups

- Live Fabro status refresh by `fabroRunId`.
- Human feedback UI backed by Fabro pending questions.
- Richer run launch controls, such as selecting a non-default agent once more
  agents exist.
- Live move progress display for runs, derived from Fabro stages.
- Additional agents and generalized Knowledge Bank manifests.
- Separate Ledger viewer.
