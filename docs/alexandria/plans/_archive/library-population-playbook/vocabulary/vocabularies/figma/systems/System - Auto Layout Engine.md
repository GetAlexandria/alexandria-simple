---
type: System
prefLabel: Auto Layout Engine
altLabels:
  - Layout Engine
  - Flexbox Engine
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties
---

# Auto Layout Engine

## WHAT: Definition

_Stub — the internal engine that resolves responsive layout constraints on [[Entity - Frame]]s that have [[Capability - Auto Layout]] applied. The engine recalculates child positions and frame dimensions whenever content changes (text resize, child addition/removal, Instance variant swap). It is not user-named; designers interact with it through the Auto Layout capability controls in the [[Surface - Properties Panel]]._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Auto Layout]] (the user-facing capability this engine implements), [[Entity - Frame]] (the objects this engine operates on), [[System - Constraints]] (the companion system for non-Auto-Layout positional rules), [[Entity - Component]] (Auto Layout behavior is preserved and propagated through Component/Instance pairs)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the layout algorithm (closely mirrors CSS Flexbox), rendering order, how the engine handles conflicting constraints, and performance characteristics at large frame counts._
