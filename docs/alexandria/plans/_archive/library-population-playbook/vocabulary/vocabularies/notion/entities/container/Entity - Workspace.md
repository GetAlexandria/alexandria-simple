---
type: Entity
prefLabel: Workspace
altLabels:
  - Notion Workspace
category: [Entities]
subcategory: [container]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/intro-to-workspaces
  - https://www.notion.com/help/workspace-settings
---

# Workspace

## WHAT: Definition

_Stub — the top-level tenant boundary in Notion. A Workspace contains all Teamspaces, Pages, and Databases that belong to a single account or organization. It is simultaneously the billing boundary (the unit that maps to a Plan and Seat count), the access boundary (Members and Guests are scoped to a Workspace), and the vocabulary boundary (Teamspaces, Pages, and Databases exist within exactly one Workspace)._

## WHERE: Ecosystem

_Stub — links to: [[Role - Workspace Owner]] (the apex role governing this boundary), [[Role - Workspace Admin]] (the delegated configuration role), [[Entity - Teamspace]] (the second-level container within the Workspace), [[System - Permission Model]] (Workspace is the root of the permission hierarchy), [[Economy-instance - Plan]] (a Workspace subscribes to a Plan), [[Economy-instance - Seat]] (Seats are counted per Workspace)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the Workspace creation flow, the multi-workspace account rules (one Notion account can belong to multiple Workspaces), the Workspace switching UI, data isolation guarantees between Workspaces, and the Workspace deletion and data-export rules._
