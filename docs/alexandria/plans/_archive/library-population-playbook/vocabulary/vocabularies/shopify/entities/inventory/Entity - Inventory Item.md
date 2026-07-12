---
type: Entity
prefLabel: Inventory Item
altLabels:
  - Stock Item
  - SKU Record
category: [Entities]
subcategory: [inventory]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/inventoryitem
  - https://help.shopify.com/en/manual/products/inventory
---

# Inventory Item

## WHAT: Definition

_Stub — the stock-tracking record for a [[Entity - Variant]] at a specific Location. Every Variant has exactly one Inventory Item, and that Inventory Item can have inventory levels at multiple Locations. The Inventory Item carries the physical attributes used for shipping (weight, HS tariff code, country of origin, requires shipping flag). Inventory Item is Merchant-facing and Admin API only — shoppers never see an Inventory Item directly, only its downstream effect (in-stock / out-of-stock on the [[Surface - PDP]])._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Variant]] (each Variant has exactly one Inventory Item), [[System - Inventory Reservation]] (reservations are tracked against Inventory Items at Locations), [[Domain - Fulfillment]] (Inventory Items are the domain's stock-unit primitive)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Inventory Item vs Inventory Level distinction (Item is the thing; Level is the quantity at a Location); tracked vs untracked inventory; the Inventory Item adjustment API (add/subtract stock); multi-Location inventory distribution; how Inventory Items interact with [[System - Inventory Reservation]] during Checkout; physical attributes (weight, HS code) used in Fulfillment and customs._
