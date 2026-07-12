---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [draft patch]
evidence:
  - packages/ax/src/domain/state-events.ts
  - packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md
links:
  related_to:
    - Mechanism - Draft Overlay
---

## WHAT
One validated correction from a walk answer — the unit the draft log is
made of.

## WHY

Turning a single walk answer into one small, appended correction, rather
than an unbounded rewrite, is what lets the library absorb what the
director just said and keep moving without breaking anything already
settled — the living-source-of-truth wager made concrete one answer at a
time, [[Bet - Library as Living Source of Truth]].

## WHERE
Appended to the draft patch log; planned by a move inside the
front-of-house walk.

## HOW
Each patch is appended to the [[Mechanism - Draft Overlay]]'s log,
leaving the base cards frozen.
