---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [section-comprehension check]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  related_to:
    - Capability - Front-of-House Walk
---

## WHAT
One section-comprehension check of the walk — a bounded slice of the
draft library the director confirms as understood.

## WHY

Bounding the walk into sections a director can actually finish and
confirm, rather than reviewing the whole draft library in one sitting, is
what keeps the library legible to the person reading it rather than only
to the machinery that built it ([[Principle - Legible Graph]]). Recording
each confirmation is also how the library earns the right to call itself
current — the director's understanding, not just an agent's draft, is
what becomes the living source of truth,
[[Bet - Library as Living Source of Truth]].

## WHERE
The event recorded when a section is confirmed.

## HOW
Sections are the confirmation units inside the arc of the
[[Capability - Front-of-House Walk]].
