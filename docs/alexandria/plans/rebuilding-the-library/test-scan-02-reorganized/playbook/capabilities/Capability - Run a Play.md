---
type: Capability
prefLabel: "Run a Play"
altLabels: ["ax run", "play run", "launch play"]
category: [Capabilities]
subcategory: [workflow, execution]
context: playbook
altitude: context
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/commands/play.ts
  - packages/viewer/src/components/library/hooks/usePlayRunLauncher.ts
  - packages/ax/src/effects/run-bridge.ts
---

## WHAT
_Stub —_ The capability of executing a guided [[Aggregate - Play]] through the factory, optionally detached, producing a tracked [[Aggregate - Play Run]].

## WHERE
_Stub —_ Triggered from [[Surface - Playbook]] (launcher) or `ax run <play-id>`; runs on [[System - Fabro Workflow Engine]]; observed via [[Surface - Play Tracker]].

## WHY
_Stub —_ Running plays is the product's core verb; per-play intent lives in skills/prose, not the runtime.

## WHEN
_Stub —_ Whenever a user wants to perform a guided unit of product work.

## HOW
_Stub —_ `ax run <play-id> [--detach] [--adapter-command …]`; a run bridge streams Fabro stages into the [[Aggregate - Ledger]].
