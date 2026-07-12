---
type: Surface
prefLabel: "Play Tracker"
altLabels: ["tracker", "PlayTrackerTab"]
category: [Surfaces]
subcategory: [run-status, live]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx
  - packages/viewer/src/components/studio/playTrackerModel.ts
  - packages/viewer/src/components/studio/playTrackerEstimator.ts
---

## WHAT
_Stub —_ A live status view of a running [[Entity - Play Run]]: which [[Entity - Tracker Leg]] is active, estimated timing, and whether the run needs human feedback.

## WHERE
_Stub —_ A tab inside [[Surface - Play Maker's Studio]]; reads a play's `trackerLegs` and run status from [[System - Runtime Event Store]] / [[System - Fabro Workflow Engine]].

## WHY
_Stub —_ Gives a director real-time visibility into a detached run; the precise UX intent (vs. raw Factory runs log) is partly inferred.

## WHEN
_Stub —_ While a play is executing, especially long agent-mediated runs with human-in-the-loop pauses.

## HOW
_Stub —_ Maps run events onto the play's ordered tracker legs (each with typical seconds + beats); estimates progress and surfaces a "needs_human_feedback" state.
