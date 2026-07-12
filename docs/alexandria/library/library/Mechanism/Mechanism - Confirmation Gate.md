---
plane: product
status: stub
confidence: high
altitude: capability
altLabels: [library confirm, EL4 gate]
evidence:
  - packages/ax/src/domain/library-confirmation.ts
links:
  operates_on:
    - Entity - Alexandria Product Library
  related_to:
    - Role - Director
    - Capability - Library Confirmation
---

## WHAT
The whole-library ruling: confirmed, or rejected and sent back.

## WHY

The gate exists because a source of truth only earns that name once the
director has actually stood behind it — an unconfirmed draft cannot yet
be the
[[Bet - Library as Living Source of Truth|living source of truth]] the
rest of the company reads from. Holding the whole library open until
that verdict is recorded is also what keeps the director in control of
what gets treated as settled, never sliding a draft past them as if it
were already agreed ([[Principle - Never-Violate User Assumptions]]).

## WHERE
Recorded when the director confirms or rejects the draft library.

## HOW
It operates on the whole draft [[Entity - Alexandria Product Library]]
and is answered only by the [[Role - Director]] — the last gate of the
elicitation chain. The [[Capability - Library Confirmation]] records the
verdict this gate is waiting on.
