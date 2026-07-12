---
type: System
prefLabel: "Fabro Workflow Engine"
altLabels: ["fabro", "factory", "workflow engine"]
category: [Systems]
subcategory: [execution, orchestration]
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/effects/fabro-client.ts
  - packages/ax/src/effects/run-bridge.ts
  - packages/alexandria-plugin/workflows/frame-the-problem/workflow.fabro
---

## WHAT
_Stub —_ The workflow engine that actually executes plays — every [[Entity - Play]] declares `engine: "fabro"`, and runs are "factory runs."

## WHERE
_Stub —_ Behind [[Capability - Run a Play]]; produces fabroRunId on a [[Entity - Play Run]]; staged output bridged into the [[Entity - Event Ledger]]; watched in the Studio "Factory runs" tab.

## WHY
_Stub —_ Code treats Fabro as the only play engine; the build-vs-buy / why-Fabro decision is NOT in code.

## WHEN
_Stub —_ Every time a play runs.

## HOW
_Stub —_ A Fabro client submits a `workflow.fabro`; a run bridge polls/streams stages and maps them to ledger events and tracker legs.
