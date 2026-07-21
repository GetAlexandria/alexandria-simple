---
plane: product
status: confirmed
confidence: high
altitude: pillar
altLabels:
  - the work system
evidence:
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
  - docs/alexandria/sources/systems-vs-projects.html
  - docs/alexandria/plans/work-system/plan.md
  - docs/alexandria/plans/map-tab/plan.md
links:
  contains:
    - Entity - Work Board
    - Entity - System
    - Entity - Work Project
    - Entity - Work Item
  related_to:
    - Surface - Work Map
    - Pattern - Systems Generate, Projects Contain
    - Pattern - Multi-Level Ownership
    - Entity - Domain
    - Bet - Map-First Work Surface
  relegates:
    - Mechanism - Materialize-on-Read
---

## WHAT

The work system is how the company holds and runs its actual work: one
board of record where every piece of work lives as a card, a small set
of primitives — Systems that generate work, Projects that contain it,
stray items that belong to neither — and a map that makes the whole
thing visible and actable at a glance. It was ruled into being in one
day of decisions: the board is the source of truth and QA surface, a
known and deliberately un-innovative primitive, and the map is a
reflection of it.

## WHY

Before the work system, the map and the board grew up separately and
described the same work in colliding vocabularies. Unifying them under
one contract is what makes [[Bet - Map-First Work Surface]] livable:
the director sees the company's work from orbit and acts on it where
they see it, while everything underneath stays plain files a person
could open in an editor. It also gives the company a place to put work
that never ends — the recurring obligations that had no shape when
everything was a project.

## WHERE

The work half of the company's world: every work item carries its
[[Entity - Domain]] as its home, the board renders as the Info Hub, and
the map renders the same work as geography.

## HOW

All work lives on the [[Entity - Work Board]] — the system of record —
as [[Entity - Work Item]] cards. Two shapes organize those cards: an
[[Entity - System]] is persistent infrastructure that generates its own
recurring work and is judged by health, while an
[[Entity - Work Project]] is bounded work that contains its cards, ends,
and is judged by progress — the split held by
[[Pattern - Systems Generate, Projects Contain]]. Accountability runs
at three levels at once — who owns a system, who owns a project
improving it, who works the cards it spawns — per
[[Pattern - Multi-Level Ownership]]. The [[Surface - Work Map]] reflects
all of it spatially: divisions as regions, Systems and Projects as
placed tiles with health and progress visible, and a room behind every
tile where the work is read and acted on. The machinery that actually
mints a System's due cards is an internal of the System primitive, kept
one altitude down.
