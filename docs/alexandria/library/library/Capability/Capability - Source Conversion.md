---
plane: product
status: stub
confidence: high
altitude: capability
altLabels:
  - conversion
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  operates_on:
    - Entity - Source
  produces:
    - Entity - Source of Truth
---

## WHAT

The process that works a source toward freeze: the live library-building
process by which a director hands over material and it lands in the
library. Lifecycle-bearing: started, then ready to freeze, then completed
or failed.

## WHY

Working a handed-over source all the way to a frozen state of truth is
the pipeline that actually keeps the library fed with real material,
rather than leaving it to go stale between builds — the mechanics behind
[[Bet - Library as Living Source of Truth]]. Its own held stages, ready
to freeze, completed, or failed, are what let a director trust that
nothing lands in the library half-processed.

## WHERE

The events recording this pipeline's progress.

## HOW

It operates on an assessed [[Entity - Source]] and, when the director
freezes the output, produces the frozen state of the
[[Entity - Source of Truth]] the atomizer consumes.
