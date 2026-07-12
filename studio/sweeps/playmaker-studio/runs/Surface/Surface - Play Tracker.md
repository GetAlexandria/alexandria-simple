---
type: Surface
prefLabel: Play Tracker
context: runs
plane: Product
status: stub
altitude: pillar
altLabels: [Tracker]
source_evidence:
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:593
  - studio/plays/RUNTIME.md:111
confidence: high
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Play Run
  contains:
    - Economy - Run State
  related_to:
    - Mechanism - Human-Input Pair
    - Surface - Factory Runs
---

## WHAT
The director-facing live run-status surface — "Plays in flight," each run's current
step, progress, ETA, and the "Raven needs you" state. Fed by the runtime's one
run-state model.

## WHERE
`/studio?tab=tracker`, rendered by `PlayTrackerTab.tsx`
(`ActiveRunsLanding`/`TrackerRunView`); RUNTIME.md §6 (Tracked).

## HOW
The Play Tracker is `derived_from` the active [[Entity - Play Run]] set and shows
each run's [[Economy - Run State]]; the "Raven needs you" badge is the
[[Mechanism - Human-Input Pair]]'s pending state. The raw events live on the
[[Surface - Factory Runs]].
