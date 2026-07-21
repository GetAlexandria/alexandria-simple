---
plane: product
status: stub
confidence: medium
altitude: context
altLabels:
  - business unit
  - division
evidence:
  - docs/alexandria/plans/library-word-legibility/knowledge-organization-brief.md
  - docs/alexandria/plans/library-word-legibility/taxonomy-state-of-the-state.md
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
  - docs/alexandria/map/map-state.json
links:
  related_to:
    - Entity - Company
    - Entity - Plane
    - Domain - Skillmaker.Studio Library
    - Surface - Work Map
---

## WHAT

A Domain is a division, or business unit, of an organization — the level
between the Company and the knowledge bands, and the single organizing
level of the company's work map. SocioTechnica's real shape, ruled after
the Skillmaker pivot, is five divisions: Alexandria (Raven's domain),
Skillmaker.Studio (William's), New Media (Damien's), Business
Development (Rob's), and Operations — which is deliberately unowned.
Operations was dropped in the pivot and then returned the same week the
System primitive arrived: a division of pure recurring obligations had
no shape on a map that only knew projects, and systems are what made it
coherent. Its unclaimed nameplate is a standing demand signal for the
back-office colleague who does not exist yet.

Domain plays two roles that name the same thing from two altitudes. As an
organizer, it is the container level itself — the shelf a company's
divisions sit on. As one of the ten families-category buckets, it is also
the classification a card gets when its own subject is a division —
[[Domain - Skillmaker.Studio Library]] carries `type: Domain` for exactly
that reason. The two readings describe one concept, not a naming
collision to resolve.

## WHY

Domain marks where one division's work and library end and another's
begin, so that as the company grows, [[Bet - Atomic, Agent-Readable Knowledge]]
scales by federation instead of collapsing every division into one
undifferentiated graph. It is also the join key that keeps the company's
surfaces speaking one vocabulary: a work item's home is the same word on
the [[Entity - Work Board]], on the [[Surface - Work Map]], and in the
library, [[Principle - Legible Graph]].

## WHERE

The regions of the work map, the home field on every work item, and the
intended level of a company's library between the Company and the Plane.
On the map this level is real and enforced today; in the library it
remains a named-ahead-of-need container.

## HOW

A Domain sits below [[Entity - Company]] and above [[Entity - Plane]],
grouping a set of planes; on the [[Surface - Work Map]] each Domain is a
region holding its division's Projects, Systems, and stray work. A
Domain may carry an owner — a human or a colleague — and an unowned
Domain renders visibly unclaimed on purpose: the empty nameplate is
demand for the person or colleague who should hold it. The
[[Domain - Skillmaker.Studio Library]] is a worked example: a sibling
Domain with its own product library, and also the concrete instance card
that carries this category as its Type.
