---
type: Surface
prefLabel: "Playbook"
altLabels: ["playbook", "strategy stone", "PlaybookView"]
category: [Surfaces]
subcategory: [plays, workflows]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/PlaybookView.tsx
  - packages/viewer/src/components/library/hooks/usePlayRunLauncher.ts
  - packages/ax/src/domain/plays.ts
---

## WHAT
_Stub —_ The surface listing the product's [[Entity - Play]] definitions — the guided, agent-run workflows a user can launch.

## WHERE
_Stub —_ "Playbook" stone in [[Surface - Stone Top Bar]] (route `/playbook`). Launches a [[Entity - Play Run]] via the run launcher; plays are executed through [[System - Fabro Workflow Engine]] and observed in [[Surface - Play Maker's Studio]].

## WHY
_Stub —_ Plugin guidance frames the whole product as "organized around plays," but the user-facing motivation for each play is NOT fully in code.

## WHEN
_Stub —_ Used when a user wants to run a guided product workflow (e.g. frame-the-problem, source-assessment).

## HOW
_Stub —_ Reads `RuntimePlaybook` (array of plays, each with moves + required knowledge-bank areas); a play-run launcher posts a launch and tracks status.
