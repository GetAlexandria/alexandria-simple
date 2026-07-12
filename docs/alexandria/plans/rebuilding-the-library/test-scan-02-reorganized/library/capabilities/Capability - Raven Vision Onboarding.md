---
type: Capability
prefLabel: "Vision Power-Up"
altLabels: ["Power up Raven: Vision", "vision onboarding", "raven vision"]
category: [Capabilities]
subcategory: [onboarding, vision]
context: library
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/domain/raven-vision.ts
  - packages/ax/src/commands/raven.ts
  - packages/alexandria-plugin/skills/raven-vision-drafting/SKILL.md
---

## WHAT
_Stub —_ The capability of co-authoring a product Vision with Raven, one [[Component - Vision Slot]] at a time, then banking it as canonical knowledge.

## WHERE
_Stub —_ Driven from [[Surface - Raven Vision Onboarding]] and the `ax raven vision slot …` commands; output banks into the Vision [[Aggregate - Area]].

## WHY
_Stub —_ Framed as the first Raven "power-up"; the strategic priority of Vision-first onboarding is implied, not argued, in code.

## WHEN
_Stub —_ Early in a project, before other knowledge areas.

## HOW
_Stub —_ `ax raven vision slot update|approve|skip` append events through the reducer; one slot updated → marked needs_review; whole vision → ready_to_bank → banked.
