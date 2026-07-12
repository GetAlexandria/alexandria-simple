---
type: Surface
prefLabel: "Alexandria Home"
altLabels: ["home", "AlexandriaHome"]
category: [Surfaces]
subcategory: [landing, onboarding]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/AlexandriaHome.tsx
  - packages/viewer/src/components/library/viewer-routes.ts
---

## WHAT
_Stub —_ The landing surface (route `/`). Foregrounds [[Agent - Raven]] as a coin and offers a single primary action: "Connect Raven" then "Power up Raven: Vision".

## WHERE
_Stub —_ Entry point of [[Surface - Viewer Shell]]; gateway into [[Capability - Raven Vision Onboarding]] and the [[Entity - Raven Connection]] state.

## WHY
_Stub —_ Code implies onboarding starts at Vision, but the strategic reason Vision is the first "power-up" is NOT in code.

## WHEN
_Stub —_ First screen on open; shows connection status (active/none) and gates the Vision call-to-action on a live Raven connection.

## HOW
_Stub —_ Reads `RavenConnectionState`; CTA flips between `onRavenAction` (connect) and `onVisionStart` (begin Vision) based on connectivity.
