---
type: Entity
prefLabel: Brief
altLabels:
  - Context Briefing
  - CONTEXT_BRIEFING.md
category: [Entities]
subcategory: [artifact]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/templates/Template - Context Briefing.md
  - docs/alexandria/library/product/agents/Agent - Bridget the Briefer.md
---

# Brief

## WHAT: Definition

The Brief (also: Context Briefing) is the assembled context object that Bridget delivers to factory builder agents before they begin work. It is the library's runtime output — the point at which encoded product knowledge translates into better agent behavior. A Brief contains five named regions: Task Frame (scope and acceptance criteria), Primary Cards (3–5 full cards at highest relevance), Supporting Cards (graph-expanded summaries), Relationship Map (typed triples showing how cards connect), and Gap Manifest (topics the assembler searched for but could not find). The Brief is always named `CONTEXT_BRIEFING.md` — one file, one assembly, one task scope. The template lives at [[Template - Context Briefing]] in the existing library.

## WHERE: Ecosystem

_Stub — links to: [[Template - Context Briefing]] (the Brief's production shape), [[Role - Bridget the Briefer]] (the assembler), [[System - Retrieval and Assembly Engine]] (the mechanism that produces the Brief), [[Surface - Assembly Workspace]] (where the Brief is written), [[Entity - Card]] (Briefs are assembled from Cards)._

## WHY: Rationale

_Stub — owner-supplied. The Brief is what makes the library useful to builder agents. Without a Brief, builder agents receive either unstructured file dumps or no context at all. The Brief's five-region structure provides both the right cards and the attention ordering that enables a builder agent to use them._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — the Brief's contract: exact filename (CONTEXT_BRIEFING.md), U-shaped attention ordering (most important first, then supporting, then gap manifest), and mandatory Gap Manifest (no Brief claims perfect coverage). Card budget: 3-5 Primary Cards, 5-8 Supporting Cards (guidelines, not hard limits)._
