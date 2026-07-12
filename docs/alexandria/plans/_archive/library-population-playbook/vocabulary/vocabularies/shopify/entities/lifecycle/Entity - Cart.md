---
type: Entity
prefLabel: Cart
altLabels:
  - Shopping Cart
  - Basket
category: [Entities]
subcategory: [lifecycle]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/storefront/current/objects/Cart
  - https://help.shopify.com/en/manual/online-store/storefront
---

# Cart

## WHAT: Definition

_Stub — the pre-purchase line-item container; the first named state in the [[Pattern - Cart-to-Order Lifecycle]]. A Cart holds one or more [[Entity - Variant]]-keyed line items, an optional [[Economy-instance - Discount]] code, and estimated totals. Cart is freely mutable: line items can be added, changed, or removed without restriction. No payment authorization is involved; no [[Entity - Customer]] account is required. Cart lives in the Storefront API — it is a Shopper-side noun, not a Merchant-side noun._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (the next state — Cart converts to Checkout when the shopper begins finalization), [[Entity - Variant]] (Cart line items are keyed on Variant), [[Surface - Cart Drawer]] (the surface where the Cart is displayed without leaving the current page), [[Pattern - Cart-to-Order Lifecycle]] (Cart is the first named state in the lifecycle), [[Pattern - Abandoned Cart Recovery]] (a Cart that never becomes a Checkout triggers recovery flows)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Cart persistence (session vs signed-in Customer vs anonymous token); line item structure (Variant ID, quantity, custom attributes); Cart-level vs line-item-level discount application; Cart webhooks; the distinction between Storefront API Cart (modern) and older Checkout API (legacy); [[System - Inventory Reservation]] behavior at Cart stage vs Checkout stage._
