---
type: Entity
prefLabel: Sub-issue
altLabels:
  - Subtask
  - Child Issue
category: [Entities]
subcategory: [sub-item]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/sub-issues
---

# Sub-issue

## WHAT: Definition

_Stub — a nested Issue with its own assignee, [[System - Workflow State]], and identity (TEAM-NNN), whose completion rolls up to its parent Issue. A Sub-issue is distinct from a Section (a visual grouping within a View that carries no ownership or state); the distinction matters because Sub-issues have independent lifecycle — they can be assigned to a different Member and completed in a different Cycle than the parent._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Issue]] (the parent; Sub-issues are Issues), [[Role - Member]] (assignee; can differ from the parent Issue's assignee), [[System - Workflow State]] (each Sub-issue has its own state), [[Entity - Cycle]] (Sub-issues can belong to a different Cycle than the parent)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: nesting depth limits (Linear caps at one level of Sub-issues as of current docs); rollup rules (how parent completion is calculated from Sub-issue states); whether Sub-issues appear in Team views independently; identity scheme (inherit parent TEAM prefix or get their own)._
