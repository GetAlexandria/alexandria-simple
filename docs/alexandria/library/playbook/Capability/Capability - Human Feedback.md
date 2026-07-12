---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels: []
evidence:
  - docs/alexandria/plans/library-word-legibility/library-update-worklog.md
  - packages/ax/src/commands/play-answer.ts
links:
  operates_on:
    - Entity - Play Run
  related_to:
    - Role - Raven
    - Capability - Wake
---

## WHAT

Answer a running play's pending question and resume it, banking the
answer.

## WHY

Answering and resuming a suspended run is what keeps independent execution
honest — a colleague runs with real work on its own,
[[Bet - Independent Execution]], but only so long as it still checks in
when a decision genuinely needs the director. Resuming from exactly the
banked answer, rather than guessing or drifting past it, is also how a
colleague avoids ever crossing a line the director never expected it to
([[Principle - Never-Violate User Assumptions]]).

## WHERE

Wherever a play run is suspended, waiting on the director's answer.

## HOW

It operates on the suspended [[Entity - Play Run]] and is related to
[[Role - Raven]], who mediates the exchange, and to
[[Capability - Wake]], which first brought the pending question to the
director's
attention.
