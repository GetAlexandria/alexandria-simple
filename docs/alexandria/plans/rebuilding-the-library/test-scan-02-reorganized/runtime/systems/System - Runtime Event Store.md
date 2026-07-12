---
type: System
prefLabel: "Runtime Event Store"
altLabels: ["state store", "jsonl-state-store", "runtime server", "projection"]
category: [Mechanisms]
subcategory: [event-sourcing, state]
context: runtime
altitude: context
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/effects/jsonl-state-store.ts
  - packages/ax/src/domain/state-store.ts
  - packages/ax/src/domain/project-state.ts
  - packages/ax/src/effects/runtime-server.ts
---

## WHAT
_Stub —_ The event-sourced backbone: appends events to a JSONL ledger and projects them into the derived project state every surface reads. Per the data model: machine / Execution Layer (referenced, in no pillar); the implementation behind the Ledger pillar's append-and-project semantics.

## WHERE
_Stub —_ Feeds [[Aggregate - Ledger]], the project-state projection (agents, playbook, raven, sources, cards), and the runtime HTTP server the viewer/CLI call.

## WHY
_Stub —_ The whole product is built on append-only events + projections; the architectural rationale (auditability, replay, non-blocking agents) is implied, not documented in code.

## WHEN
_Stub —_ Continuously, as the source of truth for live state.

## HOW
_Stub —_ JSONL store + reducers build `RuntimeProjectState`; a runtime server exposes state/events; cursors track delivery to connected clients.
