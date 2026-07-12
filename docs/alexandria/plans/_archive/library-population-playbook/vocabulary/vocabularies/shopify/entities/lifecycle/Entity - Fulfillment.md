---
type: Entity
prefLabel: Fulfillment
altLabels:
  - Shipment
  - Fulfillment Record
category: [Entities]
subcategory: [lifecycle]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/fulfillment
  - https://help.shopify.com/en/manual/orders/fulfillments
---

# Fulfillment

## WHAT: Definition

_Stub — the shipment binding to an [[Entity - Order]]; the fourth named state in the [[Pattern - Cart-to-Order Lifecycle]]. A Fulfillment records the physical dispatch of one or more line items from an Order: which items shipped, from which Location, with which carrier and tracking number. An Order may have multiple Fulfillments if items ship separately. Fulfillment is an Admin-side noun — the [[Role - Merchant]] creates Fulfillments; the [[Role - Customer|Shopper]] sees tracking information as a downstream effect._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Order]] (the Order this Fulfillment is bound to), [[Entity - Inventory Item]] (stock is decremented when a Fulfillment is created), [[Capability - Fulfilling]] (the Capability that creates this Entity), [[Domain - Fulfillment]] (the domain that owns this Entity), [[Pattern - Cart-to-Order Lifecycle]] (Fulfillment is the fourth named state)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Fulfillment status (Pending / Open / Success / Cancelled / Error / Failure); partial fulfillment (some line items shipped, some not); third-party fulfillment services (Shopify Fulfillment Network, 3PL integrations); tracking number and carrier assignment; fulfillment holds (delay fulfillment pending fraud review); the relationship between Fulfillment creation and inventory decrement timing._
