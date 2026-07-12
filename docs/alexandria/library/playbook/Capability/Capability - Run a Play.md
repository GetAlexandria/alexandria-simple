---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels: []
evidence:
  - docs/alexandria/plans/library-word-legibility/library-update-worklog.md
  - packages/ax/src/commands/play.ts
links:
  operates_on:
    - Entity - Play Run
  related_to:
    - Entity - Play
---

## WHAT

Execute a guided play through the factory, optionally detached,
producing a tracked play run.

## WHY

Carrying work out on the director's behalf, optionally detached, is how the
wager that a colleague executes independently rather than waiting on
instructions gets tested in practice —
[[Bet - Independent Execution]]. The play it executes is also the unit by
which that work is assigned, run consistently, and measured,
[[Bet - The Play as Unit of Ownership]], so this capability is the moment
ownership actually changes hands.

## WHERE

Wherever a director or a trigger calls a play and the work is carried
out on their behalf.

## HOW

It operates on the resulting [[Entity - Play Run]] and is related to
the [[Entity - Play]] definition being called.
