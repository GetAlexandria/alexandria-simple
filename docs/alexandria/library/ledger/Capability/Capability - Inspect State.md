---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels: []
evidence:
  - docs/alexandria/plans/library-word-legibility/library-update-worklog.md
  - packages/ax/src/commands/inspect.ts
links:
  operates_on:
    - Entity - Ledger
  related_to:
    - Mechanism - Monitor
---

## WHAT

Read and validate the project's derived state, event ledger, and
triggers.

## WHY

Being able to read the record back out, rather than trusting whatever an
agent last claimed happened, turns a project's state into something a
director or colleague can check rather than take on faith. That same read
path is what makes it possible to catch drift between events that were
recorded and the state a run believes is true — a divergence that would
otherwise surface only as a broken play, if it surfaced at all. Watching
for new events and inspecting existing state are two views onto the same
question: what does the record actually say.

## WHERE

Wherever a director or a colleague checks the project's current,
recorded state.

## HOW

It operates on the [[Entity - Ledger]] and is related to the
[[Mechanism - Monitor]] that watches the same record for new events.
