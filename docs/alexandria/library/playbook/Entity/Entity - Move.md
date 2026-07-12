---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [leg, workflow node]
evidence:
  - packages/ax/src/domain/plays.ts
links:
  related_to:
    - Entity - Workflow Package
---

## WHAT
One step of a play — the spoken word is "move"; "leg" survives as an
older label for the same thing. A piece with no independent
lifecycle.

## WHY

Breaking a play into discrete steps is what lets a run stop exactly where a
human judgment is required and pick back up from that same point rather than
restarting or skipping ahead. Because each step carries no lifecycle of its
own, nothing about it needs separate tracking or cleanup — the play's run is
simply where it currently sits in the sequence. Precision at that level is
what keeps a suspended run legible — lose it, and no one looking at a paused
run could point to exactly which step it's waiting on.

## WHERE
Defined as part of a play's step-by-step contract.

## HOW
Moves are the ordered contents of a [[Entity - Workflow Package]]; a run
walks them, suspending where a move needs a human.
