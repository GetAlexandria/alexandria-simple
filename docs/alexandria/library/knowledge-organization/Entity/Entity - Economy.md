---
plane: product
status: confirmed
confidence: high
altitude: value
altLabels: []
evidence:
  - packages/ax/src/domain/atomic-card-categories.ts
  - docs/alexandria/plans/library-word-legibility/plan.md
  - docs/alexandria/plans/library-word-legibility/taxonomy-state-of-the-state.md
links:
  related_to:
    - Entity - Atomic Card Category
    - Entity - Type
    - Entity - Altitude
---

## WHAT

One of the eleven families-category buckets: real product economics —
currency, pricing, stock, seats, tiers. Alexandria, an agentic product,
has none of these yet, so the bucket is correctly empty rather than a
coverage gap to fill.

## WHY

The empty shelf is deliberate. The day pricing, seats, or costs exist,
[[Bet - Atomic, Agent-Readable Knowledge]] wants them atomized into a
bucket that already means economics, not squeezed into a neighbor that
means something else. Holding that line — real economics, not a
structural grain that merely sounds like it — keeps the director's read
of the taxonomy true, [[Principle - Legible Graph]].

## WHERE

The bucket a card's [[Entity - Type]] would carry if its subject were a
real economic mechanic. No card carries it today.

## HOW

Economy, one of the buckets in the [[Entity - Atomic Card Category]],
is easy to confuse with the [[Entity - Altitude]] value grain —
meaning-by-content, no identity — because both read as "just a value."
They are not the same axis: a handful of cards once sat in Economy for
exactly this confusion (Plane, Thread Status, and others), and were
rehomed as `altitude: value` attributes of the entities they actually
describe once the two axes were told apart. Economy stays reserved for
the day Alexandria prices, seats, or tiers something for real.
