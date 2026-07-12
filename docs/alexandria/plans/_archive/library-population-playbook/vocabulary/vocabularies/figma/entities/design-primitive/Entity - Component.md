---
type: Entity
prefLabel: Component
altLabels:
  - Master Component
  - Symbol
category: [Entities]
subcategory: [design-primitive]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
---

# Component

## WHAT: Definition

_Stub — a reusable design element that acts as the master definition. When a designer creates a Component from a [[Entity - Frame]] or [[Entity - Group]], that object becomes the source of truth; all copies are [[Entity - Instance]]s that inherit the Component's properties and can be overridden locally. The Component/Instance split is Figma's canonical master-vs-copy cut at the design-primitive layer._

_Figma extends Components further with [[Entity - Variant]]s, which bundle multiple states of the same concept into a single Component set (e.g., a Button Component with Primary/Secondary and Default/Hover/Pressed states). This three-part vocabulary — Component, Instance, Variant — is Figma's distinctive contribution to design-system naming: a clean hierarchical cut analogous to a class (Component), an object instance (Instance), and an enumerated subtype (Variant)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Instance]] (copies of this Component placed in designs), [[Entity - Variant]] (Variants group related Components into a set), [[Entity - Library]] (Libraries publish Components for cross-File reuse), [[System - Component System]] (the engine that keeps Instances in sync with their Component)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Component creation from existing Layers, the master Component panel indicator, the "Detach Instance" action, publishing a Component to a [[Entity - Library]], and how Component updates propagate to all Instances._
