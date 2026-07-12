---
plane: product
status: confirmed
confidence: high
altitude: pillar
altLabels:
  - ax
evidence:
  - packages/ax/README.md
  - packages/ax/src/cli/router.ts
links:
  operates_on:
    - Entity - Project
    - Entity - Play Run
  related_to:
    - Mechanism - AX Runtime Server
---

## WHAT
The terminal place the product is met — one of the product's headline
parts. Its command set is the product's verb map: initialize, start, run,
inspect, work with Raven. It gives the deterministic side of the product
(ledger, runs, runtime server) a single spoken surface.

## WHY
A command surface exists so the product never depends on a browser being
open to be used. Every deterministic action the product supports —
starting a project, submitting a run, talking to the runtime underneath —
gets a single spoken vocabulary, so a director typing by hand and a script
calling the same commands in sequence are doing the identical thing.
Without it, automation and headless use would have no way in at all.

## WHERE
The public Alexandria CLI, whose command table is the product's terminal
vocabulary.

## HOW
It operates on the [[Entity - Project]] (initializing it) and on the
[[Entity - Play Run]] (submitting a run by play id), and it starts and
talks to the [[Mechanism - AX Runtime Server]] behind the surfaces.
