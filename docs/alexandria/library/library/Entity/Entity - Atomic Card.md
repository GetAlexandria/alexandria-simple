---
plane: product
status: confirmed
confidence: medium
altitude: aggregate
altLabels:
  - atomizer card
  - Cards
  - Library Card
evidence:
  - packages/ax/src/domain/atomic-card-categories.ts
  - packages/ax/src/domain/state-events.ts
links:
  conforms_to:
    - Entity - Atomic Card Category
  related_to:
    - Entity - Altitude
---

## WHAT

The card unit of the library, created and then updated as it is produced.
The canonical unit of the library — the final, atomic form knowledge takes
once filed. Category and card contract are two complementary layers of
that unit: the categories are the superstructure, the card contract is
the format.

## WHY

The card exists because knowledge that stays locked in narrative documents
is knowledge a colleague can only guess at rather than compose with, the
wager behind
[[Bet - Atomic, Agent-Readable Knowledge|atomic, agent-readable knowledge]].
Filing each piece once, in a fixed shape, is also how earlier work stays
reachable instead of being re-derived from scratch on every pass
([[Principle - Cumulative, Not Sisyphean]]).

## WHERE

Card files in the category folders; the events recording its creation and
update.

## HOW

Each card conforms to one [[Entity - Atomic Card Category]] bucket via
its Type, and carries one [[Entity - Altitude]] alongside it — the two
classifying axes every Atomic Card is filed under.
