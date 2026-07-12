---
type: Read-Model
prefLabel: "Play Registry"
plane: Product
context: board
altitude: component
status: stub
confidence: medium
links:
  produces:
    - "[[Aggregate - Board]]"
    - "[[Aggregate - Board State]]"
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. Play Registry gives each play one identity.

How it does it. The [[Work Board]] and [[Board State]] read identity from it.

## WHY
It exists so board tests can distinguish identity from board state.

## WHERE
It lives in registry.js.

## HOW
- Registry rows are read by the Board.
