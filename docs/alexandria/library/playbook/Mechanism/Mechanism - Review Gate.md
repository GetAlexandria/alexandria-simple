---
plane: product
status: stub
confidence: high
altitude: capability
altLabels: [gate_1_confirm_design, gate_2_confirm_proven]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  operates_on:
    - Entity - Play Run
  related_to:
    - Mechanism - Human Gate
---

## WHAT
The staged, named gates a reviewed run passes — a design-confirmation
gate and a proven-confirmation gate — each confirmed by the director. Which
gates a run must pass is set by the review level the run selects — how much
human review that run gets.

## WHY

Letting a director dial how much review a run gets is what keeps
independent execution trustworthy rather than all-or-nothing — a colleague
still runs on its own, but the director sets the ceiling on how deep that
trust extends for a given run, [[Bet - Independent Execution]]. Naming and
staging the gates explicitly, rather than reviewing informally, is also
what keeps a run's progress legible to the director at every checkpoint
([[Principle - Transparent Machinery]]).

## WHERE
Recorded in the ledger; surfaced per run.

## HOW
It operates on the [[Entity - Play Run]] at its staged checkpoints, shaped
by the run's selected review level, and specializes the general
[[Mechanism - Human Gate]] it is related to.
