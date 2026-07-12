---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [draft patch log]
evidence:
  - packages/ax/src/domain/library-draft-overlay.ts
links:
  contains:
    - Entity - Bundle Patch
  operates_on:
    - Entity - Atomic Card
---

## WHAT
The durable draft layer over a frozen base: walk answers become patches
appended to a log, and the overlay carries the draft trail while base
cards stay untouched. Machinery inside the Library; the patches carry
the history, the overlay has no states of its own.

## WHY

Letting a library keep moving under active revision, without ever
touching the frozen base beneath it, is how it stays a living source of
truth rather than a document that must be torn up and rewritten to
change, [[Bet - Library as Living Source of Truth]].

## WHERE
Where the appended patch log lives, alongside the frozen base cards.

## HOW
It contains the appended [[Entity - Bundle Patch]] log and operates
on each [[Entity - Atomic Card]] entry's draft view without mutating the
frozen base.
