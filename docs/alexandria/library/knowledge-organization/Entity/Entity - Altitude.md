---
plane: product
status: stub
confidence: medium
altitude: context
altLabels: []
evidence:
  - docs/alexandria/plans/library-word-legibility/knowledge-organization-brief.md
  - docs/alexandria/plans/_archive/alexandria-product-walk/runtime/altitudes.md
links:
  related_to:
    - Entity - Atomic Card
    - Entity - Type
---

## WHAT

Altitude is the structural-grain classifying axis: a card's architectural
role and place in its lifecycle. The values in live use are keystone (a
whole plane's or area's overview), pillar (a headline, top-of-product
part), aggregate (lifecycle-bearing, with real state transitions),
component (a piece inside an aggregate with no independent lifecycle),
value (no identity, meaning by content), capability (a verb, operation,
or gate), and context (a bounded organizing part — the rung this area's
own container concepts sit at). It is the secondary axis a card is
classified by.

## WHY

Atomized cards flatten badly: cut everything to the same grain and a
keystone becomes indistinguishable from a footnote. Altitude is the axis
[[Bet - Atomic, Agent-Readable Knowledge]] leans on to keep scale
readable after the cutting — and scale is what lets a director descend
from architecture to detail without getting lost,
[[Principle - Legible Graph]].

## WHERE

Carried on every card in the library, alongside its other classifying
fields.

## HOW

Every [[Entity - Atomic Card]] carries one Altitude. Altitude is
orthogonal to [[Entity - Type]]: the two axes classify a card along
different, independent dimensions rather than competing to describe the
same thing. Type says what kind of product-noun a card is; Altitude says
how big a piece of the system it is and whether it carries its own
lifecycle — the same Type can sit at more than one Altitude (an Entity
can be an aggregate or a component), which is the proof the two axes are
genuinely independent rather than one dressed up as two.
