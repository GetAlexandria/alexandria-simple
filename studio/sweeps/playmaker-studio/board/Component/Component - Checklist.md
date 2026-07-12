---
type: Component
prefLabel: Checklist
context: board
plane: Product
status: stub
altitude: component
altLabels: [Testing Checklist]
source_evidence:
  - studio/plays/board-model.js:180
  - studio/plays/board-model.js:536
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Component - Testing Card
---

## WHAT
The priority-ordered list of steps inside a Testing card — each item a text plus a
done boolean. Only Testing cards may carry one.

## WHERE
`board-model.js` (`validateChecklist`, `parseChecklist`, `checklistToText`).

## HOW
A Checklist is a part of a [[Component - Testing Card]]; its items track the steps
of that play's testing campaign.
