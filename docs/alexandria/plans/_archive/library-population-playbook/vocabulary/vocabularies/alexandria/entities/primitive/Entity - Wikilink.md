---
type: Entity
prefLabel: Wikilink
altLabels:
  - Link
  - Edge
  - Cross-Reference
category: [Entities]
subcategory: [primitive]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Knowledge Graph.md
  - docs/alexandria/library/product/primitives/Primitive - Card.md
---

# Wikilink

## WHAT: Definition

_Stub — a Wikilink is the inter-card connection that forms an edge in the Knowledge Graph. Written as `[[Type - Name]]` with a mandatory context phrase (e.g. "— this standard defines the quality bar Conan applies when grading"). Wikilinks are directional: the card containing the link is declaring a dependency or relationship to the linked card. Reverse edges are discoverable by searching for cards that reference a given card name. Every wikilink must include an explanatory context phrase; naked links (no context) are a quality failure detectable by alxndr lint._

## WHERE: Ecosystem

_Stub — links to: [[System - Knowledge Graph]] (wikilinks are the edges in the graph), [[Entity - Card]] (wikilinks connect Cards to Cards), [[Capability - Linting]] (alxndr lint's graph target checks broken wikilinks)._

## WHY: Rationale

_Stub — owner-supplied. Without explicit wikilinks with context phrases, the library is a collection of isolated documents. The edges are what enable typed traversal, cascade analysis, and blast radius calculation._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — format: `[[Type - Name]]` with a context phrase describing the relationship. Anti-example: `[[Standard - Five-Dimension Card Requirements]]` alone (no context). Correct form: `[[Standard - Five-Dimension Card Requirements]] — the quality contract this card must satisfy`._
