---
type: System
prefLabel: Permission Model
altLabels:
  - Permissions
  - Access Control
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/members-and-permissions
---

# Permission Model

## WHAT: Definition

_Stub — the rules that determine which Role can perform which Capability against which Entity at which scope (Workspace / Team / Project / Issue). The Permission Model is the mechanism that enforces the distinctions between [[Role - Owner]], [[Role - Admin]], [[Role - Member]], and [[Role - Guest]]. It is mostly engineering-internal but its effects surface in the Settings UI as configurable options. `user_visible: false` reflects that users don't encounter "Permission Model" as a named noun; they encounter its effects — they either can or cannot perform an action._

## WHERE: Ecosystem

_Stub — links to: [[Role - Owner]] (the Role with the broadest permissions), [[Role - Admin]] (the Role that configures Workspace-level permissions), [[Role - Guest]] (the Role with the most constrained permissions), [[Entity - Workspace]] (the top scope in the permission hierarchy)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the permission scope hierarchy (Workspace > Team > Project > Issue); which specific Capabilities are gated at each scope; how permissions cascade (Team settings inherit from Workspace unless overridden); the SSO/SAML enforcement interaction; API token permission scopes._
