---
type: Role
prefLabel: Staff
altLabels:
  - Staff Member
  - Store Staff
category: [Roles]
subcategory: [merchant-side]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/your-account/staff-accounts
  - https://shopify.dev/docs/api/admin-rest
---

# Staff

## WHAT: Definition

_Stub — Merchant-side users with operational rights granted by the [[Role - Merchant]]. Staff access the [[Surface - Admin]] and can perform configured operations (fulfill [[Entity - Order|Orders]], manage [[Entity - Product|Products]], handle [[Capability - Refunding|Refunds]]) but do not have billing access and cannot delete the [[Entity - Shop]]._

## WHERE: Ecosystem

_Stub — links to: [[Role - Merchant]] (the owner who grants Staff access), [[Entity - Shop]] (the tenant Staff operate within), [[Surface - Admin]] (the surface Staff work in), [[System - Permission Model]] (the permissions that constrain which Staff can do what)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: permission granularity (which Admin areas can be granted or restricted per Staff member); Staff account limits by [[Economy-instance - Plan]] tier; the distinction between Staff with full Admin access and Staff with scoped access; how Staff accounts differ from the Merchant account in billing and ownership._
