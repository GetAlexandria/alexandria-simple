---
type: Entity
prefLabel: Shop
altLabels:
  - Store
  - Shopify Store
category: [Entities]
subcategory: [shop-level]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/shop
  - https://help.shopify.com/en/manual/your-account
---

# Shop

## WHAT: Definition

_Stub — the top-level Merchant tenant. A Shop is the root object in Shopify's data model: it owns the [[Entity - Product]] catalog, all [[Entity - Order|Orders]], all [[Entity - Customer|Customers]], and the [[Surface - Online Store]]. A Shop has a single [[Role - Merchant]] account holder and any number of [[Role - Staff]] members. The `.myshopify.com` subdomain is the canonical Shop identifier._

## WHERE: Ecosystem

_Stub — links to: [[Role - Merchant]] (the account holder), [[Entity - Product]] (the catalog), [[Entity - Order]] (the order record), [[Entity - Customer]] (the customer base), [[Surface - Admin]] (the Merchant's management surface), [[Surface - Online Store]] (the shopper-facing storefront), [[Economy-instance - Plan]] (the billing tier this Shop is on)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Shop identity (myshopify.com subdomain as permanent identifier vs custom domain); Shopify Plus multi-store organization model; Shop-level settings (currency, locale, tax, shipping); the relationship between a Shop and its Channels (Online Store, Point of Sale, Buy Button, etc.)._
