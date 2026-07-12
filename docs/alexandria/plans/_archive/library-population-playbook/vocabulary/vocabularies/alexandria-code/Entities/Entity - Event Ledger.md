---
type: Entity
prefLabel: "Event Ledger"
altLabels: ["ledger", "event log", "events.jsonl", "RuntimeEvent"]
category: [Entities]
subcategory: [history, event-sourcing]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/state-events.ts
  - packages/ax/src/effects/jsonl-state-store.ts
---

## WHAT
_Stub —_ The append-only, event-sourced record of everything that happens in a project — each event carries type, actor, payload, idempotency key, and schema version.

## WHERE
_Stub —_ Surfaced by [[Surface - Ledger]]; written/read by the [[System - Runtime Event Store]]; the substrate all projections (state, vision, runs) are derived from.

## WHY
_Stub —_ Event-sourcing is clearly a core architectural commitment; the product-level "why audit everything" is implied but not argued in code.

## WHEN
_Stub —_ Continuously appended as plays run and agents act; queried for history/replay.

## HOW
_Stub —_ JSONL file (provisionally `docs/alexandria/ledger/events.jsonl`); appended via `ax inspect events append`; events validated against a published schema.
