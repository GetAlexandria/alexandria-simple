---
type: Pattern
prefLabel: Component Override
altLabels:
  - Instance Override
  - Local Override
category: [Patterns]
subcategory: [design-system]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360039150173-Create-and-insert-component-instances
---

# Component Override

## WHAT: Definition

_Stub — the design-system practice of customizing individual [[Entity - Instance]]s of a [[Entity - Component]] without detaching them from the master. Overrides allow text content, fill colors, and child layer visibility to differ per instance while the structural properties (layout, size ratios, nesting) remain governed by the Component. Overrides persist through Component updates unless the updated property was overridden._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Instance]] (the object overrides are applied to), [[Entity - Component]] (the master whose updates override instances still receive), [[Surface - Properties Panel]] (where overrides are applied), [[Entity - Variant]] (Variant swap is a structured form of override)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: which properties can be overridden (text, fill, visibility, swap nested components), how to reset overrides, the distinction between detaching and overriding, and override propagation rules when nested Instances are inside a parent Component._
