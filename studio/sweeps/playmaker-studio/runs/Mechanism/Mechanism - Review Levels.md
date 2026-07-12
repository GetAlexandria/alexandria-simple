---
type: Mechanism
prefLabel: Review Levels
context: runs
plane: Product
status: stub
altitude: component
altLabels: [Low/Medium/High Review]
source_evidence:
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx:383
  - studio/plays/registry.js:142
confidence: low
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Director Gate
    - Surface - Play Tracker
    - Pattern - Make-a-Play Arc
---

## WHAT
The proving-cycle design for low / medium / high review — compositions of
play-writing step-plays with specific Director gates. A run carries its review level
and its gate confirmations (Director-confirmed vs auto-approved).

## WHERE
The `ReviewFacts` panel in `PlayTrackerTab.tsx` (review label, composition id, gates);
registry seed PS2 "Review Levels" (a specced design artifact).

## HOW
Review Levels compose [[Mechanism - Director Gate]] checkpoints around a play's
modules (cf. the [[Pattern - Make-a-Play Arc]]); the chosen level's gates show on the
[[Surface - Play Tracker]].
