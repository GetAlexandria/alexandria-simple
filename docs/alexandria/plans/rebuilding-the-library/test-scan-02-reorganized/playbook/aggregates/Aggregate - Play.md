---
type: Aggregate
prefLabel: "Play"
altLabels: ["play", "RuntimePlay"]
category: [Entities]
subcategory: [workflow, definition]
context: playbook
altitude: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/plays.ts
  - packages/alexandria-plugin/workflows/frame-the-problem/workflow.fabro
---

## WHAT
_Stub —_ A named, guided workflow an agent runs — a sequence of [[Component - Move]]s with a default agent and required knowledge-bank areas. Known plays in code: frame-the-problem, source-assessment.

## WHERE
_Stub —_ Listed in the [[Surface - Playbook]]; produced/proved in [[Surface - Play Maker's Studio]]; executed through [[System - Fabro Workflow Engine]]; defined in the plugin's `workflows/*/workflow.fabro`.

## WHY
_Stub —_ Plays are described in code as the organizing principle of the product; the intent behind each specific play is partly in skill prose, not the runtime model.

## WHEN
_Stub —_ Launched by a user to do a unit of guided product work; the central "do something" action.

## HOW
_Stub —_ `{ id, name, defaultAgentId, moves[], requiredKnowledgeBankAreaIds[], trackerLegs[], workflow: { engine: "fabro" } }`.
