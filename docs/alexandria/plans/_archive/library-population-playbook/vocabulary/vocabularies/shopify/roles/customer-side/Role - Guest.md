---
type: Role
prefLabel: Guest
altLabels:
  - Guest Shopper
  - Anonymous Buyer
category: [Roles]
subcategory: [customer-side]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/checkout-settings/customer-accounts
---

# Guest

## WHAT: Definition

_Stub — a shopper purchasing without a [[Entity - Customer]] account. The Guest completes [[Entity - Checkout]] and creates an [[Entity - Order]] without registering; their email and address are captured for fulfillment but no persistent account is created unless they opt in post-purchase. Guest checkout is a conversion optimization: removing the account-creation gate reduces abandonment._

## WHERE: Ecosystem

_Stub — links to: [[Role - Customer]] (the registered alternative; Guests may be converted to Customers post-purchase), [[Entity - Checkout]] (where Guest status is confirmed), [[Entity - Order]] (the Order is created regardless of Guest vs Customer status), [[Surface - Checkout]] (the surface where the Guest/Customer distinction is resolved)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Merchant settings for requiring vs offering vs hiding account creation; post-purchase account creation offer; how Guest Orders appear in the Admin (attributed to email address, not a Customer record) until the Guest converts; interaction with [[Pattern - Abandoned Cart Recovery]] (Guests who abandon before entering email cannot be recovered)._
