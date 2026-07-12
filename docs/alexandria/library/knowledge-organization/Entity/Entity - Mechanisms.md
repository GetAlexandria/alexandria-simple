---
plane: product
status: confirmed
confidence: high
altitude: value
altLabels:
  - Mechanism
  - Systems
evidence:
  - packages/ax/src/domain/atomic-card-categories.ts
  - docs/alexandria/plans/library-word-legibility/plan.md
links:
  related_to:
    - Entity - Atomic Card Category
    - Entity - Type
    - Entity - Capabilities
    - Mechanism - Confirmation Gate
    - Mechanism - Draft Overlay
---

## WHAT

One of the eleven families-category buckets: the rule or gate by which
something happens. Alexandria's worked examples are
[[Mechanism - Confirmation Gate]] and [[Mechanism - Draft Overlay]] —
the gate a reviewed library passes through, and the machinery that
tracks its patches.

## WHY

Rules deserve cards of their own. Buried inside the capability it
constrains, a gate is invisible to a colleague composing from
[[Bet - Atomic, Agent-Readable Knowledge|atomic cards]]; named apart,
it gives the director one fixed place to look for why something is
allowed to happen, [[Principle - Legible Graph]].

## WHERE

The bucket a card's [[Entity - Type]] carries when its subject is a
rule or gate, not the operation it governs.

## HOW

Mechanisms is the [[Entity - Atomic Card Category]] bucket that differs
from its nearest neighbor, [[Entity - Capabilities]], by being the gate,
not the operation: the
[[Mechanism - Confirmation Gate|Confirmation Gate]] is the rule a
reviewed library must pass, and the
[[Mechanism - Draft Overlay|Draft Overlay]] is the machinery that tracks
its patches without touching the frozen base — gates and machinery, not
the operations that pass through them.
