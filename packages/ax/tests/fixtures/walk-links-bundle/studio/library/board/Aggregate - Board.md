---
type: Aggregate
prefLabel: "Work Board"
plane: Product
context: board
altitude: pillar
status: stub
confidence: medium
links:
  contains:
    - "[[Read-Model - Play Registry]]"
    - "[[Aggregate - Board State]]"
  operates_on:
    - "[[Value - Stage]]"
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. The Work Board keeps play-making visible.

How it does it. It moves each play through [[Stage]] and records position in [[Board State]] from the [[Play Registry]].

## WHY
It exists so director-gated play progress stays visible in one board context.

## WHERE
Rendered on the Board.

## HOW
- Dragging changes order only after a Director gate.
