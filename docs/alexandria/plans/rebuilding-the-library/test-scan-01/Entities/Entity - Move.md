---
type: Entity
prefLabel: "Move"
altLabels: ["move", "RuntimeMove", "node"]
category: [Entities]
subcategory: [workflow, step]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/plays.ts
  - packages/viewer/src/components/studio/playMoves.ts
---

## WHAT
_Stub —_ One step in a [[Entity - Play]]'s workflow graph, typed by kind: start, exit, agent, prompt, human, conditional, parallel, command, tool, wait, etc.

## WHERE
_Stub —_ Composes a [[Entity - Play]]; rendered in the Studio Play page (Play Walk / diagram); the "human" kind marks human-in-the-loop pauses.

## WHY
_Stub —_ The move-kind vocabulary defines what a play can do; the design intent per kind is inferable but not documented in code.

## WHEN
_Stub —_ Traversed in order while a play run executes.

## HOW
_Stub —_ `{ id, kind, label, nodeId }`; derived from the Fabro workflow graph nodes.
