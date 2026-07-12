---
type: Entity
prefLabel: "Vision Slot"
altLabels: ["vision slot", "RavenVisionSlot", "slot"]
category: [Entities]
subcategory: [vision, onboarding]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/viewer/src/components/library/vision/vision-slot-guidance.ts
  - packages/alexandria-plugin/skills/raven-vision-drafting/references/slots/
---

## WHAT
_Stub —_ One of nine named prompts that together compose a product Vision: shift, person, named-pain, discovered-pain, inadequacy, mechanism, felt-experience, proof, refusal — each with length guidance, a "pulling for," and a quick test.

## WHERE
_Stub —_ Filled in [[Surface - Raven Vision Onboarding]]; collectively bank into the Vision [[Entity - Knowledge Bank Area]]. Drafted by [[Agent - Raven]].

## WHY
_Stub —_ The slots encode a sharp positioning methodology; its provenance/authority is NOT in code (only the prompts themselves).

## WHEN
_Stub —_ During Vision onboarding, one slot at a time, each reviewed before the Vision can bank.

## HOW
_Stub —_ Each slot has status empty→needs_review→approved/skipped, the user/Raven text, and Raven's drafting notes; a manifest sets label/order/purpose.
