---
type: Role
prefLabel: Guest
altLabels:
  - External Guest
  - External Collaborator
category: [Roles]
subcategory: [page]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/guests-and-external-collaborators
  - https://www.notion.com/help/members-permissions-roles-and-responsibility
---

# Guest

## WHAT: Definition

_Stub — a user with access limited to specific Pages they have been individually invited to; does not consume a billable seat. Guests can view, comment, or edit individual Pages depending on the permission level granted per-page, but cannot see the broader Workspace, Sidebar, or Teamspace structure. Guest access is typically used for external collaborators (contractors, clients, partners)._

_This is the `families.md` "Bridge" pattern in B2B SaaS: a named role for limited cross-boundary access that is a sold product feature. Notion uses Guest as the mechanism for sharing individual Pages with users outside the Workspace without adding them to the tenant. The seat-free economics make it distinct from the Member role in a way that directly maps to the billing model._

## WHERE: Ecosystem

_Stub — links to: [[Role - Member]] (the contrasting full-access role), [[Entity - Page]] (the unit to which Guest access is granted), [[Capability - Sharing]] (Sharing is the mechanism for inviting Guests), [[System - Permission Model]] (Guest access is per-page, not Workspace-wide)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: per-page permission levels available to Guests (Full access / Can edit / Can comment / Can view), the Guest invitation flow, the plan-tier Guest limits, and the Guest-to-Member upgrade path._
