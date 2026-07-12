---
type: Entity
prefLabel: Subfolder
altLabels:
  - Type Folder
  - Zone
category: [Entities]
subcategory: [primitive]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/sections/Section - Card Repository.md
  - docs/alexandria/plans/canvas-library-spike/prototype/product-library/raven-assets/library-graph.json
---

# Subfolder

## WHAT: Definition

_Stub — a Subfolder is a type-typed sub-area within a Territory. The library has 18 Subfolders (per library-graph.json): experience/experience-goals, experience/forces, experience/journeys, experience/loops, product/agents, product/artifacts, product/capabilities, product/components, product/domains, product/governance, product/primitives, product/sections, product/systems, product/templates, rationale/principles, rationale/product-theses, rationale/standards, temporal/root. Each Subfolder is a folder whose path encodes the card type that lives there: cards in `product/agents/` are Agent-type cards; cards in `rationale/principles/` are Principle-type cards. Folder path is part of a card's identity._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Territory]] (Subfolders are contained by Territories), [[Entity - Card]] (Cards live in Subfolders), [[Surface - Card Repository]] (the Subfolders form the repository's type-taxonomy)._

## WHY: Rationale

_Stub — owner-supplied. Without type-encoded folder paths, glob-based discovery (how alxndr lint and Bridget's retrieval profiles work) is not possible._

## WHEN: Timeline

_Stub — 18 Subfolders as of 2026-05._

## HOW: Specification

_Stub — the build sequence within Subfolders is strict: Standards first, then Product Theses and Principles, then Systems, then Domains and Sections, then Governance, Templates, Artifacts, Components, Capabilities, then Agents and experience-layer cards. This ordering ensures every wikilink target exists when the link is written._
