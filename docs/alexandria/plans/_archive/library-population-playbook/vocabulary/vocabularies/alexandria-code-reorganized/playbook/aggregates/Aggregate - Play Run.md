---
type: Aggregate
prefLabel: "Play Run"
altLabels: ["play run", "RuntimePlayRun", "factory run", "live run-state"]
category: [Entities]
subcategory: [workflow, execution]
context: playbook
altitude: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/effects/run-bridge.ts
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx
---

## WHAT
_Stub —_ A single execution instance of a [[Aggregate - Play]]: tracks the agent, lifecycle status, and a link to the underlying Fabro factory run. Per the data model: the durable, inspectable state of an executing play — supports freeze/resume; the "now" surface watched by triggers.

## WHERE
_Stub —_ Launched from [[Surface - Playbook]]; observed in [[Surface - Play Tracker]] and the Studio "Factory runs" tab; bridged into the [[Aggregate - Ledger]].

## WHY
_Stub —_ The "needs_human_feedback" status reveals an intended human-in-the-loop pattern; the product reasoning for non-blocking runs is implied, not stated.

## WHEN
_Stub —_ Exists from the moment a play is launched until it succeeds/fails/dies.

## HOW
_Stub —_ Fields: playId, agentId, status (submitted→running→needs_human_feedback→succeeded/failed/dead), fabroRunId, trackerPath, timestamps.
