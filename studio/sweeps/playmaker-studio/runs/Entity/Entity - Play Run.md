---
type: Entity
prefLabel: Play Run
context: runs
plane: Product
status: stub
altitude: aggregate
altLabels: [Run, Fabro Run]
source_evidence:
  - studio/plays/RUNTIME.md:41
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:218
confidence: low
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Workflow Package
  related_to:
    - Economy - Run State
    - Surface - Play Tracker
    - Mechanism - Embedded Factory
---

## WHAT
A single in-flight execution of a play on the factory — `ax run <play>` is
start-only (default detached) and a run may also be fired by a `play.requested`
trigger. **Proposed for demotion** (a runtime-instance noun, not a peer of Play —
HOT-SPOTS): kept here as a runtime-state-bearing record, not a catalog entity.

## WHERE
RUNTIME.md §1 (Launch); surfaced as an active run in `PlayTrackerTab.tsx`.

## HOW
A Play Run is `derived_from` an [[Entity - Workflow Package]] executed by the
[[Mechanism - Embedded Factory]]; it carries a [[Economy - Run State]] shown on the
[[Surface - Play Tracker]].
