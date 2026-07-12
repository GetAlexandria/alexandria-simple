---
plane: product
status: stub
confidence: medium
altitude: aggregate
altLabels:
  - Vision
  - Raven Vision
evidence:
  - packages/ax/src/domain/raven-vision.ts
links:
  contains:
    - Entity - Vision Slot
  produces:
    - Entity - Source of Truth
  related_to:
    - Role - Raven
---

## WHAT

The director's own account of the product, drafted slot by slot and
banked — it seeds everything downstream, becoming the search prior the
library scan starts from. It moves through a clear lifecycle: not
started, in progress, ready to bank, and banked. It is not a product
region of its own: it is one play among what will be thousands.
"Basic Product Description" is the director-facing name; the
underlying build still carries the earlier "vision" naming.

## WHY

Seeding the library scan with the director's own account of the product is
the first concrete step toward one living, always-current source of
truth rather than scattered, stale knowledge —
[[Bet - Library as Living Source of Truth]]. Drafting it slot by slot and
banking it as soon as all four resolve is also what gets a new director to
a first real, useful loop quickly, before the rest of the library exists
([[Principle - First Servable Loop]]).

## WHERE

Its own domain logic; its history in the ledger; its surface in the
Vision view.

## HOW

It contains the four [[Entity - Vision Slot]] pieces (person,
mechanism, the work, and refusal), is drafted and mediated by
[[Role - Raven]], and as slots resolve it produces the current
[[Entity - Source of Truth]] prose; once all four slots are
resolved, it banks.
