---
plane: product
status: stub
confidence: medium
altitude: context
altLabels:
  - container
evidence:
  - docs/alexandria/plans/library-word-legibility/knowledge-organization-brief.md
links:
  related_to:
    - Entity - Plane
    - Entity - Atomic Card
---

## WHAT

A container within a Plane that holds cards — the level a working area of
the library is organized at, one step above the individual card.

## WHY

A flat plane of atomic cards would defeat the point of atomizing;
grouping them into working areas small enough to read together is how
[[Bet - Atomic, Agent-Readable Knowledge]] stays composable in practice.
One home per card is the [[Principle - Legible Graph]] half of the deal:
everything keeps a fixed address a director can find again.

## WHERE

Sits within a Plane; every card in the library is homed in exactly one
context.

## HOW

A Context sits below [[Entity - Plane]] and holds a set of
[[Entity - Atomic Card]]s; a Plane groups a set of contexts under one
knowledge band.
