---
plane: product
status: confirmed
confidence: high
altitude: pillar
altLabels:
  - visual interface
  - local viewer
evidence:
  - packages/viewer/README.md
  - packages/viewer/src/components/library/viewer-routes.ts
links:
  contains:
    - Entity - Viewer Route
    - Surface - Tray
    - Surface - Builder
    - Mechanism - Canvas
  related_to:
    - Mechanism - AX Runtime Server
    - Surface - AX CLI
    - Role - Director
    - Entity - Coin
    - Role - AI Colleague
    - Entity - AI Colleague
    - Role - Raven
    - Role - Damien
    - Entity - Project
    - Entity - Alexandria Config
---

## WHAT

The visual, traversable interface that makes the whole system real and
usable to a human director — what you get instead of just a prompt
window. The director works across the Viewer (the web UI) and the AX CLI
together; the Viewer translates the library, playbook, ledger, and agents
into something you can see and interact with. Ships 18 screens today (7
top-level surfaces plus 11 library modes) — more than the single home
route it once offered.

## WHY

The viewer exists because work, agents, and context are meant to be seen
and moved through, not read from a prompt window —
[[Bet - A Visual, Traversible Work Environment]] — and because company
context should be navigated as a graph the director walks rather than a
pile of documents to search, [[Bet - Traversible Context]]. That graph
only pays off if it stays understandable to a human as it grows,
[[Principle - Legible Graph]], and the whole point is one coherent
system a director moves through, not a stitched-together set of
separate skills, [[Principle - A Full System, Not a Pile of Skills]].

## WHERE

The local viewer, served on its own local port once the runtime is
started.

## HOW

It contains the [[Entity - Viewer Route]] map (the Playbook view, the
Ledger view, the library modes), hosts the [[Surface - Tray]] where each
agent is met as its [[Entity - Coin]], hosts the [[Surface - Builder]]
where the library actually gets built, and hosts the
[[Mechanism - Canvas]] work surface; it reads everything through the
[[Mechanism - AX Runtime Server]], the same engine started and reached by
its sibling terminal surface, the [[Surface - AX CLI]] — together the two
give the [[Role - Director]], the human running the show, one product met
from two places. Each coin in the Tray is a rendering derived from a
[[Role - AI Colleague]], the class every named colleague instantiates; this
is how the viewer makes the [[Entity - AI Colleague]] — the job the whole
product is hired to do — visible and clickable. The built-in roster the
director meets there is [[Role - Raven]], the flagship instance who drafts
and mediates the product's own account of itself, and [[Role - Damien]],
coined with a coin and a few off-playbook skills. Behind the coins sits the
[[Entity - Project]] every session is scoped to — the workspace the AX CLI
initializes and whose identity is carried in the
[[Entity - Alexandria Config]] settings file it contains.
