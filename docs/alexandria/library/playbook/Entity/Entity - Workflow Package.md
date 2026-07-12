---
plane: product
status: confirmed
confidence: high
altitude: component
altLabels:
  - workflow.fabro
  - legs.json
evidence:
  - packages/alexandria-plugin/workflows/frame-the-problem/legs.json
links:
  contains:
    - Entity - Move
  related_to:
    - Entity - Play
---

## WHAT

The play's machine contract — the workflow template the orchestrator renders
and runs. A component of a play: "the play" is the definition; this
is one of its two subordinate parts, with its own card.

## WHY

Splitting the play into a human-legible definition and a separate machine
contract means an orchestrator can run the work exactly as written, without
the play itself turning into orchestration plumbing. A director or an
author can still reason about what a play does in plain terms, while the
runtime gets something precise enough to execute without guesswork.
Collapse the two into one and every change to how a play runs starts
risking a change to what the play means.

## WHERE

Kept alongside the play it belongs to.

## HOW

It contains the ordered [[Entity - Move]] graph and is the runnable half of
its [[Entity - Play]]: running the play renders it into the orchestrator.
