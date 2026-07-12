---
type: System
prefLabel: Workflow State
altLabels:
  - Status
  - Stage
category: [Mechanisms]
subcategory: []
facets: [Patterns]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/workflows
---

# Workflow State

## WHAT: Definition

_Stub — the named state an Issue is in within its Team's workflow. Linear's default state set: Backlog → Triage → Todo → In Progress → In Review → Done → Cancelled. Customizable per Team — each Team picks its own state set and order. Workflow States are the heart of the Pattern Linear's product is organized around: Issues move through States; the dashboard shows distribution across States; the Cycle's burn-down measures movement across States._

_Each State has a *type* (one of: backlog, unstarted, started, completed, cancelled) that drives default behaviors (auto-archive, count toward velocity, etc.). The customizable name + fixed type is Linear's cut on the "process customization without breaking analytics" problem._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Issue]] (the State is a property on each Issue), [[Entity - Team]] (Workflow States are Team-scoped), [[Pattern - Triage]] (Triage is itself a Workflow State and a recurring Pattern), [[Entity - Cycle]] (Cycle metrics roll up across States)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the type taxonomy (backlog/unstarted/started/completed/cancelled), customization rules per Team, the auto-cancel-stale-issues policy, the workflow-transition-hook API for integrations._
