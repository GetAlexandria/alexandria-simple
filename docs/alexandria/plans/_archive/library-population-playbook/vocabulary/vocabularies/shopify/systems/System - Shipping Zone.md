---
type: System
prefLabel: Shipping Zone
altLabels:
  - Delivery Zone
  - Shipping Rate Zone
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/zone
  - https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/setting-up-shipping-rates
---

# Shipping Zone

## WHAT: Definition

_Stub — the geography-to-carrier-rule mapping system: a Shipping Zone defines which countries or regions receive which shipping rates. A [[Role - Merchant]] configures Shipping Zones in the [[Surface - Admin]]'s shipping settings; during [[Entity - Checkout]], the system matches the shopper's shipping address to the applicable Zone and presents the configured rates. Shopify uses Zones to gate which regions a Merchant ships to and at what prices._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (the Zone is applied during address entry), [[Entity - Order]] (the selected shipping rate is recorded on the Order), [[Entity - Fulfillment]] (the carrier and rate inform Fulfillment), [[Domain - Fulfillment]] (the domain that owns shipping configuration)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Zone definition (country / province / postal code targeting); flat rate, weight-based, and price-based shipping rates within a Zone; carrier-calculated rates (live rates from UPS, FedEx, DHL — available on certain Plans); free shipping thresholds; local delivery and local pickup as Zone alternatives; Shopify Shipping discounts (pre-negotiated carrier rates available to Merchants via Shopify Payments)._
