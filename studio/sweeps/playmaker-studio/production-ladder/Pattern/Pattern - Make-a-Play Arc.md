---
type: Pattern
prefLabel: Make-a-Play Arc
context: production-ladder
plane: Product
status: stub
altitude: context
altLabels: [Make a Play, Meta-Play, Self-Hosting Loop]
source_evidence:
  - studio/plays/make-a-play/brief.md:54
  - studio/plays/make-a-play/brief.md:186
confidence: high
proposed_by: back-of-house-walk
flow:
  - Design
  - Build
  - Prove
links:
  operates_on:
    - Entity - Play
  related_to:
    - Pattern - Production Ladder
    - Mechanism - Auto-Advance Contract
  contains:
    - Component - Design Confirm
---

## WHAT
The PlaymakerStudio production loop rendered as a self-hosting play: three
modules, Design → Build → Prove, each its own `ax run`, one human glance between
each. It is the process that builds plays, made itself an orderly workflow.

## WHERE
`make-a-play/brief.md` (§4 move graph; the "Phases & the Board" table mapping
module → on-screen phases → resting stage). Filed PlaymakerStudio / Production,
fronted by William.

## HOW
It operates on the [[Entity - Play]], walking it up the same
[[Pattern - Production Ladder]] — Design rests at Designed (through
[[Component - Design Confirm]]), Build at Built, Prove at Proven→Live. Its Prove
module ends in the [[Mechanism - Auto-Advance Contract]].
