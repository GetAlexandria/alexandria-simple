---
type: Entity
prefLabel: Variant
altLabels:
  - Component Variant
  - Component State
category: [Entities]
subcategory: [design-primitive]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants
---

# Variant

## WHAT: Definition

_Stub — a variation within a [[Entity - Component]] set. Variants bundle multiple states or types of the same concept into a single named grouping, organized as a Variant matrix — a grid of the Component in every combination of its defined properties (e.g., a Button has properties Type: Primary/Secondary and State: Default/Hover/Pressed, producing a 2×3 matrix of Variants). Designers swap between Variants of an Instance without detaching or rebuilding._

_The Variant vocabulary is Figma's solution to the combinatorial-states problem: before Variants, a button set required a separate named Component per state, producing dozens of Components with no structural relationship. Variants make the relationship explicit and the matrix browsable. The Variant matrix is itself a named UI pattern: a grid where each cell is a Component, each row is one property dimension, and each column is another._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Component]] (Variants are organized as Component sets), [[Entity - Instance]] (Instances expose Variant swap controls in the Properties Panel), [[Surface - Properties Panel]] (where Variant selection is done), [[Pattern - Variant Matrix]] (the design-system pattern Variants enable)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Variant property definition syntax, the Component Set container in the Layers Panel, how Instances expose Variant swap dropdowns, constraints on Variant property naming, and the relationship between Variants and [[Entity - Variable]]s._
