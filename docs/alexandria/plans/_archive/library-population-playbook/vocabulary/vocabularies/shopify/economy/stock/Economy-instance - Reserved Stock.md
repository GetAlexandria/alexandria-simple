---
type: Economy-instance
prefLabel: Reserved Stock
altLabels:
  - Held Inventory
  - Pending Inventory
  - Committed Inventory
category: [Economy]
subcategory: [stock]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/products/inventory/managing-inventory
  - https://shopify.dev/docs/api/admin-rest/current/resources/inventorylevel
---

# Reserved Stock

## WHAT: Definition

_Stub — inventory promised but not yet fulfilled: the quantity of an [[Entity - Inventory Item]] held by the [[System - Inventory Reservation]] for in-progress [[Entity - Checkout|Checkouts]] or pending [[Entity - Order|Orders]]. Reserved Stock is deducted from available-for-sale quantity but not yet decremented from total inventory. It represents the "committed but not shipped" state in the stock ledger._

## WHERE: Ecosystem

_Stub — links to: [[System - Inventory Reservation]] (the System that creates and holds the reservation), [[Entity - Inventory Item]] (the stock record being reserved), [[Entity - Checkout]] (reservations are created during Checkout), [[Entity - Fulfillment]] (Fulfillment creation converts reservation to permanent decrement)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Reserved Stock appears in Shopify's Admin inventory view (Committed quantity field); the lifecycle of a reservation from Checkout entry through Order creation through Fulfillment; reservation expiry (abandoned Checkout releases hold); interaction with multi-Location inventory (which Location's stock is reserved); third-party inventory management system sync considerations._
