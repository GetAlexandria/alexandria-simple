---
type: Domain
prefLabel: Fulfillment
altLabels:
  - Fulfillment Domain
  - Order Operations
  - Logistics
category: [Domains]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/fulfillment
  - https://help.shopify.com/en/manual/orders/fulfillments
---

# Fulfillment

## WHAT: Definition

_Stub — the domain that owns shipping, tracking, and returns: everything that happens to an [[Entity - Order]] after it is placed and before (or after) the physical goods reach the [[Role - Customer|shopper]]. The Fulfillment domain owns [[Entity - Fulfillment]] records, [[Entity - Inventory Item]] stock levels, [[System - Shipping Zone|Shipping Zones]], and carrier integrations. This is the Merchant-execution layer of the [[Pattern - Cart-to-Order Lifecycle]]._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Fulfillment]] (primary domain entity), [[Entity - Inventory Item]] (stock tracked in this domain), [[Entity - Order]] (the Order being fulfilled), [[System - Shipping Zone]] (shipping rules owned by this domain), [[Capability - Fulfilling]] (primary domain capability)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Fulfillment domain API resources (Fulfillment, FulfillmentOrder, FulfillmentService, Location, InventoryItem, InventoryLevel); Shopify Fulfillment Network (SFN) as a third-party fulfillment service within this domain; Returns API; carrier integration (Shopify Shipping)._
