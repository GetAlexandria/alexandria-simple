---
type: Entity
prefLabel: Card
altLabels:
  - Library Card
  - Knowledge Card
  - Bead
category: [Entities]
subcategory: [primitive]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/primitives/Primitive - Card.md
  - docs/alexandria/library/product/templates/Template - Card.md
---

# Card

## WHAT: Definition

The Card is the irreducible noun of Alexandria — the atomic knowledge unit from which every other construct is built. A Card is a bounded piece of knowledge that makes exactly one claim, carries a type, has a name, and connects to other Cards through explicit wikilink relationships. Everything in Alexandria is either a Card or describes how Cards behave. The library is a graph of Cards; agents read, write, grade, lint, and assemble Cards; the Director banks Cards.

Card exists as both a Primitive (ontological claim: Card exists as an irreducible kind in this system) and a Template (production shape: the five-section format all Cards follow). These are two different claims about the same concept — the Primitive card and the Template card are both in the existing library and are not redundant. The full primitive card lives at [[Primitive - Card]]; the template lives at [[Template - Card]].

## WHERE: Ecosystem

_Stub — links to: [[Primitive - Card]] (the existing library card establishing Card as an irreducible kind), [[Template - Card]] (the five-section production shape), [[System - Knowledge Graph]] (Cards are the nodes; wikilinks are the edges), [[Capability - Card Building]] (how Cards are made), [[Capability - Grading]] (how Card quality is assessed), [[Surface - Card Repository]] (where all Cards live)._

## WHY: Rationale

_Stub — owner-supplied. Without Card as an explicit primitive, the library is a folder of files. Files have no inherent type, no claim shape, no connection semantics. The Card primitive is what licenses typed retrieval profiles, per-type grading rubrics, and explicit graph traversal._

## WHEN: Timeline

_Stub — Card was established at product design as the foundational knowledge unit. The Primitive - Card card was created 2026-04-25 to fill a self-referential gap: the library had a Template and Artifact describing Card, but no Primitive asserting Card exists as an irreducible kind._

## HOW: Specification

_Stub — a Card is any markdown file in the library that: (1) follows the Type - Name.md filename convention, (2) carries a type from the taxonomy, (3) encodes exactly one claim, (4) is placed in the folder corresponding to its type, (5) has five H2 sections (WHAT, WHERE, WHY, WHEN, HOW), (6) connects to other Cards via wikilinks with context phrases._
