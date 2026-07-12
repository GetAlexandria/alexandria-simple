---
type: Pattern
prefLabel: Two-Audience API Split
altLabels:
  - Admin API vs Storefront API
  - Merchant vs Shopper API
  - Dual API Architecture
category: [Patterns]
subcategory: [architecture]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest
  - https://shopify.dev/docs/api/storefront
---

# Two-Audience API Split

## WHAT: Definition

_Stub — the structural pattern by which Shopify serves the same underlying data through two separate APIs with different noun shapes: the Admin API ([[Role - Merchant]] side — Order, Fulfillment, Inventory, Customer record, Staff, Shop configuration) and the Storefront API ([[Role - Customer|Shopper]] side — Cart, Product, Collection, Checkout). The same physical product is a Product in both APIs but is accompanied by different fields, different write semantics, and different authentication models. Admin API requires Merchant authentication; Storefront API uses a public access token._

_The two-audience split is `families.md`'s named example of the two-audience problem in e-commerce. The same data, two read-models, two APIs — and making that split explicit rather than trying to unify it is what makes Shopify's API ergonomic for both audience types. The unifying force is the source of every leaky Stripe-style problem; Shopify avoids it by committing to the split as a first-class architectural decision. Directors building commerce-flavored products should treat this split as a starting assumption: name the Merchant nouns, name the Shopper nouns, and don't try to unify them into a single API._

## WHERE: Ecosystem

_Stub — links to: [[Role - Merchant]] (Admin API audience), [[Role - Customer]] (Storefront API audience), [[Entity - Cart]] (Storefront-side noun), [[Entity - Order]] (Admin-side noun for the same purchase), [[Pattern - Catalog Fanout]] (the Channel model is the Admin-side control for what the Storefront API surfaces)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Admin API authentication (private apps, custom apps, OAuth public apps); Storefront API authentication (public storefront access token, delegated access tokens); overlapping nouns and how they diverge (Product in Admin vs Product in Storefront: Admin has draft/archived status, cost price, internal notes; Storefront omits these); headless architecture pattern (Storefront API as the data layer for a custom frontend); GraphQL vs REST versions of each API._
