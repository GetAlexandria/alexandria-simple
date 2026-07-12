---
plane: product
status: stub
confidence: high
altitude: aggregate
altLabels:
  - inbox source
  - source material
evidence:
  - packages/ax/src/domain/triggers.ts
  - packages/ax/src/domain/state-events.ts
links:
  related_to:
    - Surface - Inbox
---

## WHAT

Raw material entering the knowledge pipeline — added, then assessed.
Lifecycle-bearing: pending assessment, then assessed; while pending, its
very existence derives a trigger suggesting the assessment play.

## WHY

A source is the entry point for the wager that the library stays current
by continually taking in what the company actually produces, rather than
being written once and left to age,
[[Bet - Library as Living Source of Truth]]. Its pending state exists so
nothing handed over is quietly dropped before it is even looked at.

## WHERE

The events recording a source landing and being assessed; landed material
sits in the inbox.

## HOW

A source lands in the [[Surface - Inbox]] and waits there until an
assessment clears its pending trigger.
