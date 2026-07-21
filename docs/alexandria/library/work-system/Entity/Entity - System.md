---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - system
  - loop
evidence:
  - docs/alexandria/sources/systems-vs-projects.html
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
  - docs/alexandria/plans/work-system/plan.md
  - packages/ax/src/effects/map-state.ts
  - packages/ax/src/effects/system-generation.ts
links:
  related_to:
    - Entity - Work Project
    - Entity - Work Item
    - Pattern - Systems Generate, Projects Contain
    - Pattern - Multi-Level Ownership
    - Mechanism - Materialize-on-Read
---

## WHAT

A System is persistent infrastructure that generates work. It has no
finish line and no Complete button: the question is never "am I done?"
but "is it running smoothly?" Its anatomy, carried from the Lifebuild
research and re-adapted from life to work: a purpose (what it
maintains), a pattern (the plural rules for when work happens — every
six hours, every month, every quarter, every year), controls (on-time
rate, streak, next due), outputs (the cards it spawns), and delegation
(who works what). The company's first real System is LLC
Administration: monthly bookkeeping, quarterly estimated taxes, the
annual report.

## WHY

Recurring obligations are real work that a project model cannot hold —
a project half-done is progress, but car maintenance half-done is a
breakdown. Naming Systems as their own primitive is what let the
Operations division return to the map, and what lets a colleague own a
standing duty with its health visible rather than its tasks scattered.

## WHERE

Placed as a tile in its [[Entity - Domain|Domain's]] region on the map,
with health dots and an overdue flicker readable from orbit; behind the
tile, its room shows purpose, pattern, open queue, per-rule history,
and the queue of work improving it.

## HOW

A System's pattern rules spawn [[Entity - Work Item]] cards on their
rhythm — the generating half of
[[Pattern - Systems Generate, Projects Contain]] — through
[[Mechanism - Materialize-on-Read]]. Each rule can delegate its spawned
cards to a different person or colleague than the System's own owner,
per [[Pattern - Multi-Level Ownership]]. A System is improved, not
edited: an upgrade is a bounded [[Entity - Work Project]] linked back to
it, which ends while the System continues, better. Its lifecycle is
planted, hibernating (paused, configuration kept), or uprooted (ended
deliberately, history kept) — never completed. Health is derived, not
stored: a rule's windows are hit or missed, and the misses are what the
map makes visible.
