---
type: Capability
prefLabel: Applying a Discount
altLabels:
  - Apply Discount
  - Redeem Code
  - Apply Coupon
category: [Capabilities]
subcategory: [shopper-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/discount
  - https://help.shopify.com/en/manual/discounts
---

# Applying a Discount

## WHAT: Definition

_Stub — the action of reducing a [[Entity - Cart]] or [[Entity - Order]] total via a [[Economy-instance - Discount]]. Discounts can be applied by code entry (shopper types a code during Checkout), automatic application (discount applies to qualifying Carts without a code), or via the [[Surface - Admin]] (Merchant applies discount to a draft order). Discount application is one of the primary Merchant marketing tools._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Discount]] (the Discount resource being applied), [[Entity - Cart]] (the Cart total being reduced), [[Entity - Checkout]] (where code-based discounts are typically entered), [[Domain - Marketing]] (the domain that owns discount strategy)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: discount code entry UI in Checkout; automatic discounts (no code required — applied at Cart creation when conditions match); discount types (Percentage / Fixed amount / Free shipping / Buy X get Y); stackability rules (which discounts combine); Shopify Functions for custom discount logic; draft order discount application in Admin._
