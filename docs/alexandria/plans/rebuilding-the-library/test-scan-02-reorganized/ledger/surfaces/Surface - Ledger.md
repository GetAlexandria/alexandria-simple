---
type: Surface
prefLabel: "Ledger"
altLabels: ["ledger", "ledger stone"]
category: [Surfaces]
subcategory: [events, history]
context: ledger
altitude: pillar
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/navigation/top-navigation.fixtures.ts
  - packages/viewer/src/components/library/viewer-routes.ts
  - packages/ax/src/domain/state-events.ts
---

## WHAT
_Stub —_ A surface (route `/ledger`) presenting the project's append-only event history — the structured log of everything that happened.

## WHERE
_Stub —_ "Ledger" stone in [[Surface - Stone Top Bar]] (currently shown locked/disabled). Reads the [[Aggregate - Ledger]] populated by the [[System - Runtime Event Store]].

## WHY
_Stub —_ Plugin guidance names the Ledger a core surface ("structured log of all events"); why it is gated/locked in the nav at scan time is NOT explained in code.

## WHEN
_Stub —_ For auditing or replaying what agents and plays did over time.

## HOW
_Stub —_ Backed by the runtime event page schema (events with type, actor, payload, schemaVersion); the nav stone is currently `enabled: false`.
