---
type: Economy
prefLabel: Ready Marker
context: production-ladder
plane: Product
status: stub
altitude: value
altLabels: [Ready, Awaiting Confirm]
source_evidence:
  - studio/plays/board-state.json:4
  - packages/viewer/src/components/studio/StudioApp.tsx:638
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Play
    - Economy - Stage Status
    - Mechanism - Director Gate
---

## WHAT
A per-Play flag meaning "the work for this stage is done and it is awaiting the
Director's confirm" — separate from the stage itself. The ● ready / ○ ready toggle
on a Board card.

## WHERE
The top-level `ready[]` list in `board-state.json`; the toggle in `StudioApp.tsx`
(`toggleReady`).

## HOW
It rides alongside the [[Economy - Stage Status]] on the [[Entity - Play]] without
changing it; clearing it happens when the [[Mechanism - Director Gate]] confirm
moves the Play.
