---
type: Economy
prefLabel: Run State
context: runs
plane: Product
status: stub
altitude: value
altLabels: [Status, Run Status]
source_evidence:
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:18
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:41
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Play Run
    - Economy - Needs-You State
    - Surface - Play Tracker
---

## WHAT
The status unit a run carries on the Tracker — on-track, running-slow, circling-back,
stuck, refused, blocked, failed, infra-error (factory problem), or done. Distinct
failure exits (refused / stuck / failed) are kept apart here even though the ledger's
`play.failed` collapses them.

## WHERE
`PlayTrackerTab.tsx` (`PlayTrackerState`, `statusLabel`, `stateClasses`).

## HOW
A Run State is the value an [[Entity - Play Run]] carries, shown on the
[[Surface - Play Tracker]]; the blocked case is the [[Economy - Needs-You State]].
