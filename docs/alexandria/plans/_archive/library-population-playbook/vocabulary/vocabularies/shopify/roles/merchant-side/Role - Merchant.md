---
type: Role
prefLabel: Merchant
altLabels:
  - Seller
  - Store Owner
category: [Roles]
subcategory: [merchant-side]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest
  - https://help.shopify.com/en/manual/your-account
---

# Merchant

## WHAT: Definition

_Stub — the seller; the customer of Shopify's platform. The Merchant is the business or individual that owns a [[Entity - Shop]], manages [[Entity - Product]] catalog, fulfills [[Entity - Order|Orders]], and pays Shopify for platform access via an [[Economy-instance - Plan]]. The Merchant is the primary audience for the [[Surface - Admin]]._

_The Merchant-vs-Shopper split is this product's two-audience naming axis: every noun that appears in the Admin API is a Merchant noun (Order, Fulfillment, Inventory); every noun that appears in the Storefront API is primarily a Shopper noun (Cart, Product, Collection). The Merchant never sees the Storefront API's representation of their own data in the same form their customers do._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Shop]] (the Merchant's tenant), [[Surface - Admin]] (the Merchant's primary surface), [[Economy-instance - Plan]] (the Merchant's billing tier), [[Role - Staff]] (users the Merchant grants operational rights to), [[Pattern - Two-Audience API Split]] (the structural divide between Merchant and Shopper vocabulary)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: account ownership and billing rights; how a Merchant relates to multiple Shops (Shopify Plus multi-store); the Merchant's rights relative to [[Role - Staff]]; the account creation and identity verification flow._
