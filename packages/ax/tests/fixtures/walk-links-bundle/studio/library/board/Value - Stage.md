---
type: Value
prefLabel: "Stage"
plane: Product
context: board
altitude: value
status: stub
confidence: medium
flow:
  - Backlog
  - Sourced
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. Stage describes the column.

How it does it. Stage is Backlog -> Sourced and writes to [[Board State]].

## WHY
It exists so board tests can exercise lifecycle vocabulary.

## WHERE
It appears on the Board.

## HOW
- Stage is distinct from status.
