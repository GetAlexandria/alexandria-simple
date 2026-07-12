---
plane: product
status: stub
confidence: high
altitude: capability
altLabels: [gate, human input gate]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  operates_on:
    - Entity - Play Run
  produces:
    - Entity - Human Input Request
  related_to:
    - Role - Director
---

## WHAT
The suspend-for-director mechanism: a play reaches a point only a human can
rule, records the question, and waits without blocking — the non-blocking,
event-sourced human-in-the-loop contract.

## WHY

Waiting rather than blocking is what makes independent execution real
instead of nominal — a colleague runs on its own and only surfaces the
moments a decision genuinely needs the director,
[[Bet - Independent Execution]]. Suspending cleanly at exactly those
moments, instead of guessing past them, is also how a run never crosses a
line the director never expected it to
([[Principle - Never-Violate User Assumptions]]).

## WHERE
Recorded as the matched pair of a question raised and an answer
resolved in the ledger.

## HOW
It operates on the [[Entity - Play Run]] (suspending it), produces a
[[Entity - Human Input Request]] into the ledger, and resumes when the
[[Role - Director]]'s answer is relayed back.
