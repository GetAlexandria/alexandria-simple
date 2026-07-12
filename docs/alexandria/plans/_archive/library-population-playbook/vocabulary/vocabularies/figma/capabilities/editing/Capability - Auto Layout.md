---
type: Capability
prefLabel: Auto Layout
altLabels:
  - Responsive Layout
  - Flex Layout
category: [Capabilities]
subcategory: [editing]
facets: [Mechanisms]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties
---

# Auto Layout

## WHAT: Definition

_Stub — the capability to apply responsive layout constraints to a [[Entity - Frame]] so that it resizes and reflows its children dynamically. When Auto Layout is applied to a Frame, children stack horizontally or vertically with configurable gap, padding, and sizing rules. The Frame grows or shrinks as content changes, enabling designs that respond to content without manual resizing._

_Auto Layout is both a Capability (the act of applying it and configuring its properties) and a System (the engine that enforces responsive constraints at runtime in Figma's renderer). The facet `Mechanisms` captures the system dimension. The naming is compound-noun style ("Auto Layout") rather than a branded term — it describes what the feature does (automatic layout management) plainly, consistent with [[Standard - Figma Nomenclature Signature]] rule 3._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Frame]] (Auto Layout is applied to Frames), [[System - Auto Layout Engine]] (the underlying engine that implements this capability), [[Entity - Component]] (Components with Auto Layout resize responsively when Instance content changes), [[Surface - Properties Panel]] (Auto Layout controls are in the right panel)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: direction (horizontal/vertical/wrap), gap and padding configuration, child sizing modes (fixed/hug/fill), min/max size constraints, absolute positioning within an Auto Layout Frame, and nested Auto Layout behavior._
