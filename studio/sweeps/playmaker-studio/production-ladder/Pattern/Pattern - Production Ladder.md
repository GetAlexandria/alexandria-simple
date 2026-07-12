---
type: Pattern
prefLabel: Production Ladder
context: production-ladder
plane: Product
status: stub
altitude: pillar
altLabels: [Ladder, Pipeline, Stage Ladder]
source_evidence:
  - studio/plays/README.md:6
  - studio/plays/board-model.js:4
  - packages/viewer/src/components/studio/StudioApp.tsx:56
confidence: high
proposed_by: back-of-house-walk
flow:
  - Backlog
  - Sourced
  - Designed
  - Built
  - Proven
  - Live
links:
  contains:
    - Mechanism - Stage
    - Component - Design Confirm
    - Component - Proven Confirm
  operates_on:
    - Entity - Play
  conforms_to:
    - Mechanism - Director Gate
  related_to:
    - Pattern - Make-a-Play Arc
    - Mechanism - Auto-Advance Contract
---

## WHAT
The named six-stage arc every Play travels to become live — Backlog → Sourced →
Designed → Built → Proven → Live. It is the product's defining lifecycle: the
thing the whole Studio exists to run. A Play advances one stage only on a confirm.

## WHERE
Defined in the README ("The Board is the single source of truth for production
progress") and encoded as the stage keys in `board-model.js` and `StudioApp.tsx`;
a Play's current rung is held on the Board.

## HOW
It contains the [[Mechanism - Stage]] machinery and its two checkpoints,
[[Component - Design Confirm]] (Gate 1) and [[Component - Proven Confirm]]
(Gate 2), and it operates on the [[Entity - Play]]. Each advance conforms to the
[[Mechanism - Director Gate]]. The rungs climb in fixed order — Backlog,
Sourced, Designed, Built, Proven, Live — one stage per confirm. The studio's
own self-hosting loop, the [[Pattern - Make-a-Play Arc]], walks this same
ladder; the [[Mechanism - Auto-Advance Contract]] is the alternate, contested
advancer.
