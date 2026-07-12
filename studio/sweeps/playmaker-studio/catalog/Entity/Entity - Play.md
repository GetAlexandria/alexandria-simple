---
type: Entity
prefLabel: Play
context: catalog
plane: Product
status: stub
altitude: aggregate
altLabels: [Rung, Slot, Play Slot]
source_evidence:
  - studio/plays/registry.js:90
  - studio/plays/README.md:6
  - studio/plays/board-state.json:7
confidence: high
proposed_by: back-of-house-walk
links:
  conforms_to:
    - Reference - Function
  derived_from:
    - Entity - Brief
  related_to:
    - Pattern - Production Ladder
    - Entity - Workflow Package
    - Economy - Criticality Tier
---

## WHAT
The central record the whole Studio moves: a named, ultimately-runnable play —
Raven's tool for one job. It begins as an empty slot in the catalog and is carried
up the ladder to live (registered, `ax run <slug>` works). Its identity (slug,
Division, Function, Tier) is the unit of filing; its stage is the unit of progress.

## WHERE
Identity in `registry.js` (a `RUNGS` entry); stage on the Board
(`board-state.json`); README "The Play-Writing Loop" is the prose definition.

## HOW
A Play conforms to a [[Reference - Function]] (its catalog filing) and is
`derived_from` its [[Entity - Brief]]'s §4 logic; its deployable form is the
[[Entity - Workflow Package]]. It travels the [[Pattern - Production Ladder]] and
carries an [[Economy - Criticality Tier]].
