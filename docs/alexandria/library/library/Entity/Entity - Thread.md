---
plane: product
status: stub
confidence: high
altitude: aggregate
altLabels: [gap thread, hot-spot thread]
evidence:
  - packages/ax/src/domain/library-catalog.ts
links:
  related_to:
    - Capability - Front-of-House Walk
---

## WHAT
An open question the library carries about itself — a gap or hot spot raised
by a scan, answered or left residual by the walks. Lifecycle-bearing: it
moves through open (when raised), answered (when the director rules), or
residual (when a walk ends without resolving it) — a "residual gap" is a
Thread left in residual status, not a separate noun.

## WHY

Carrying its own open questions forward, rather than quietly dropping
them, is part of what lets the library call itself a living source of
truth instead of a snapshot frozen at scan time,
[[Bet - Library as Living Source of Truth]]. Naming a gap explicitly,
and tracking whether it was answered or left residual, is also what
keeps the library's state something a director can actually read, not
just an agent ([[Principle - Legible Graph]]).

## WHERE
Loaded from a bundle's recorded thread list.

## HOW
Each thread is worked by the [[Capability - Front-of-House Walk]], which
flips its status between those three states when the director answers.
