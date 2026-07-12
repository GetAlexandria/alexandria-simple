---
type: Surface
prefLabel: Factory Runs
context: runs
plane: Product
status: stub
altitude: context
altLabels: [Runs Tab]
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx:272
  - studio/plays/TESTING.md:55
confidence: medium
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Play Run
  related_to:
    - Surface - Play Tracker
---

## WHAT
The debug surface where runs are watched at the raw-event level — the studio's
Factory-runs tab. Where you watch and debug a run, complementary to the Tracker's
director-facing view.

## WHERE
`/studio?tab=runs` (the `runs` tab in `StudioApp.tsx`); TESTING.md "Watch and debug
runs in the studio's Factory-runs tab".

## HOW
Factory Runs is `derived_from` a [[Entity - Play Run]]'s event stream; it is the
raw-event sibling of the [[Surface - Play Tracker]].
