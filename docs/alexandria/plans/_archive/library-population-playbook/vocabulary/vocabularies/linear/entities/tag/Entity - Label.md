---
type: Entity
prefLabel: Label
altLabels:
  - Tag
category: [Entities]
subcategory: [tag]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/labels
---

# Label

## WHAT: Definition

_Stub — a categorical tag applied to Issues, multi-select per Issue. Labels can be scoped at two levels: Workspace-level Labels are shared across all Teams, while Team-level Labels are scoped to a single Team. Labels serve cross-cutting categorization needs — "bug," "needs-design," "blocked" — that don't justify creating a separate [[System - Workflow State]], because they don't carry workflow semantics (no transitions, no assignee implications)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Issue]] (the Entity Labels are applied to), [[Entity - Team]] (Team-scoped Labels belong here), [[Entity - Workspace]] (Workspace-scoped Labels are defined at this level), [[Capability - Filtering]] (Labels are a primary filter predicate in Views)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Label color and name configuration; how Label conflicts between Workspace-level and Team-level are resolved; Label API identifiers; the maximum number of Labels per Issue; Label inheritance when Issues move between Teams._
