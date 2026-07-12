---
type: System
prefLabel: Permission Model
altLabels:
  - Permissions
  - Access control
  - Permission levels
category: [Mechanisms]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/members-permissions-roles-and-responsibility
  - https://www.notion.com/help/workspace-permissions
---

# Permission Model

## WHAT: Definition

_Stub — the hierarchical system governing who can read, edit, comment on, and manage [[Entity - Page]]s and [[Entity - Database]]s. The Permission Model has three nested levels: (1) Workspace level — set by [[Role - Workspace Owner]] and [[Role - Workspace Admin]]; (2) Teamspace level — set per [[Entity - Teamspace]], determining which [[Role - Member]]s can access the Teamspace's contents; (3) Page level — set per [[Entity - Page]], allowing individual permission grants that override inherited Teamspace defaults. Permissions cascade downward: a Page's permission level applies to all its [[Entity - Sub-page]]s unless a more restrictive grant is explicitly set on the Sub-page._

## WHERE: Ecosystem

_Stub — links to: [[Role - Workspace Owner]] (apex of the permission hierarchy), [[Role - Workspace Admin]] (Workspace-level configuration authority), [[Role - Member]] (the baseline role for Workspace participants), [[Role - Guest]] (per-page access without Workspace membership), [[Entity - Page]] (the unit on which Page-level permissions are set), [[Entity - Teamspace]] (the second-level permission scope), [[Capability - Sharing]] (Sharing is the user-facing action that changes permissions)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the five permission levels (Full access, Can edit, Can comment, Can view, No access), the inheritance-override rules for Sub-pages, the Teamspace default membership mode (Open/Closed/Private) and its permission implications, the SCIM/SSO integration rules, and the Guest access limit enforcement by plan tier._
