---
type: System
prefLabel: Component System
altLabels:
  - Component Sync
  - Component Propagation
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma
---

# Component System

## WHAT: Definition

_Stub — the internal system that maintains the link between a [[Entity - Component]] and all its [[Entity - Instance]]s. When a Component is updated, the Component System propagates changes to all Instances in the same File and to Instances in Files that subscribe to the [[Entity - Library]] the Component is published in, while preserving local Instance overrides where they exist._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Component]] (the source object this system manages), [[Entity - Instance]] (the derived objects this system keeps in sync), [[Entity - Library]] (cross-File propagation routes through the Library subscription mechanism), [[Entity - Variant]] (the Component System governs Variant matrix relationships as well)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the propagation model (push vs pull update), override preservation rules, what happens when a Component is deleted, the "detach instance" escape hatch, and performance considerations for large Library propagation events._
