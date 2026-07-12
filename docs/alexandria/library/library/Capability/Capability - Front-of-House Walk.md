---
plane: product
status: stub
confidence: high
altitude: capability
altLabels: [FoH walk, EL3]
evidence:
  - packages/ax/src/domain/state-events.ts
  - packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md
links:
  operates_on:
    - Entity - Alexandria Product Library
  contains:
    - Entity - Walk Turn
    - Entity - Section
  produces:
    - Entity - Bundle Patch
  related_to:
    - Entity - Thread
---

## WHAT
The named arc that refines a draft library with the director: turn →
answer → patch → section-confirm → residual. Its own family of
recorded events names it. A capability, not a place: an operation
performed on the library. It is one step of the one-time work that
builds a library's foundation — the section-by-section comprehension
review capability.

## WHY

Walking the draft with the director, section by section, is what turns a
scanned structure into something the director has actually understood
and stands behind — the difference between a document and a genuine
[[Bet - Library as Living Source of Truth|living source of truth]].
Doing it as a bounded, readable arc rather than an opaque batch process
also keeps the library's structure something a director can follow
([[Principle - Legible Graph]]), and never advancing past a section the
director hasn't confirmed is a guarantee the walk cannot cross,
[[Principle - Never-Violate User Assumptions]].

## WHERE
The front-of-house walk play in the plugin; its events in the ledger.

## HOW
It operates on the draft [[Entity - Alexandria Product Library]],
contains each recorded [[Entity - Walk Turn]] and each
[[Entity - Section]] comprehension check, produces a validated
[[Entity - Bundle Patch]] per accepted answer, and works each open
[[Entity - Thread]] — answering it or leaving it residual.
