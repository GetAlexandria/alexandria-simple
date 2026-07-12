---
type: Economy
prefLabel: Needs-You State
context: runs
plane: Product
status: stub
altitude: value
altLabels: [needs_human_feedback, Raven needs you]
source_evidence:
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:224
  - studio/plays/RUNTIME.md:112
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Economy - Run State
    - Mechanism - Human-Input Pair
---

## WHAT
The run-status value that means a run is waiting on the director — surfaced as the
"Raven needs you" badge (`needs_human_feedback`). It is the visible face of a pending
review unit.

## WHERE
`PlayTrackerTab.tsx` (the `needs_human_feedback` branch; the "Raven needs you"
badge).

## HOW
A Needs-You State is a particular [[Economy - Run State]] raised by the
[[Mechanism - Human-Input Pair]] when a unit is awaiting the director.
