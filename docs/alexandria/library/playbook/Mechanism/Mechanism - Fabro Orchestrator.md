---
plane: product
status: confirmed
confidence: high
altitude: component
altLabels:
  - embedded orchestrator
evidence:
  - packages/ax/src/domain/orchestration.ts
links:
  operates_on:
    - Entity - Play Run
  related_to:
    - Entity - Workflow Package
---

## WHAT

The embedded engine that executes plays. This card is the
shipped-orchestrator hat only — the Fabro software factory that
builds this repository is out of scope.

## WHY

One engine executing every play, rather than each colleague running its
own process, is what makes the shared playbook actually agent-executable
instead of a shared document colleagues merely consult —
[[Bet - Shared, Agent-Executable Playbook]]. Its scope stays fixed to the
shipped, embedded engine so the wager is tested against how colleagues
run plays in the live product, not against the separate factory that
builds the repository.

## WHERE

Its own orchestration logic; runs are submitted to it fire-and-forget
by default.

## HOW

It operates on each [[Entity - Play Run]] — starting it, suspending it at
gates, terminating it — by executing the play's rendered
[[Entity - Workflow Package]].
