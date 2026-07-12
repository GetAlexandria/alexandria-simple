---
type: Capability
prefLabel: Checking Out
altLabels:
  - Checkout
  - Complete Purchase
  - Place Order
category: [Capabilities]
subcategory: [shopper-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/storefront/current/mutations/checkoutCreate
  - https://help.shopify.com/en/manual/checkout-settings
---

# Checking Out

## WHAT: Definition

_Stub — the verb form of the [[Entity - Checkout]] noun: the act of converting a [[Entity - Cart]] into an [[Entity - Order]] by completing the finalization funnel. Checking Out encompasses the full [[Surface - Checkout]] flow — entering contact details, shipping address, selecting a shipping method, entering payment, and confirming. The capability's completion event is Order creation._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Cart]] (the Cart being converted), [[Entity - Checkout]] (the intermediate state during this Capability), [[Entity - Order]] (the outcome this Capability creates), [[Surface - Checkout]] (the surface where this Capability is exercised), [[Pattern - Cart-to-Order Lifecycle]] (this Capability drives the Cart-to-Order transition)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: express checkout paths (Shop Pay — pre-filled details for returning shoppers; Apple Pay / Google Pay — payment-first flows); Checking Out as a [[Role - Guest]] vs as a [[Role - Customer]]; cart abandonment definition (shopper reaches Checkout but does not complete); the [[System - Payment Authorization vs Capture]] event sequence during this Capability; Checkout recovery link mechanics._
