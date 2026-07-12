---
type: System
prefLabel: Inventory Reservation
altLabels:
  - Stock Hold
  - Inventory Hold
  - Reserve Inventory
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/inventorylevel
  - https://help.shopify.com/en/manual/products/inventory
---

# Inventory Reservation

## WHAT: Definition

_Stub — the system that holds stock for an in-progress [[Entity - Cart]] or [[Entity - Checkout]] to prevent overselling. An Inventory Reservation is created when a shopper advances into [[Entity - Checkout]]; the reserved quantity is deducted from available stock so other shoppers cannot purchase the same item simultaneously. The reservation expires if the shopper abandons the Checkout. Actual stock decrement happens when the [[Entity - Fulfillment]] is created; reservation is the interim hold._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (reservations are created at Checkout entry), [[Entity - Inventory Item]] (the stock level being held), [[Economy-instance - Reserved Stock]] (the Economy-instance representation of held stock), [[Entity - Fulfillment]] (permanent decrement happens at Fulfillment creation)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: reservation window duration (Shopify manages this internally; varies by plan and configuration); behavior when reservation expires (stock returns to available); multi-Location reservation routing; how reservation interacts with Inventory Item "continue selling when out of stock" setting; the distinction between reservation (soft hold) and decrement (permanent removal from stock)._
