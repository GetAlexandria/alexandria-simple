---
type: Capability
prefLabel: Fulfilling
altLabels:
  - Fulfill Order
  - Ship Order
  - Mark as Fulfilled
category: [Capabilities]
subcategory: [merchant-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/fulfillment
  - https://help.shopify.com/en/manual/orders/fulfillments
---

# Fulfilling

## WHAT: Definition

_Stub — the act of binding a shipment to an [[Entity - Order]] by creating an [[Entity - Fulfillment]] record. Fulfilling advances the Order's fulfillment status and triggers the [[Surface - Order Confirmation|shipping notification email]] to the [[Role - Customer|shopper]]. The [[Role - Merchant]] or [[Role - Staff]] performs Fulfilling in the [[Surface - Admin]]; third-party fulfillment services and Shopify Fulfillment Network perform it programmatically via the Fulfillment API._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Fulfillment]] (the Entity this Capability creates), [[Entity - Order]] (the Order being fulfilled), [[Entity - Inventory Item]] (stock is decremented when Fulfillment is created), [[Domain - Fulfillment]] (the domain that owns this Capability)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: manual vs automatic fulfillment (Merchant chooses in settings); partial fulfillment; bulk fulfillment in Admin; Fulfillment Services API (third-party 3PL integration); hold-for-fraud workflows (fulfill only after risk review passes); tracking number and carrier fields; post-fulfillment email notification to customer._
