---
type: Entity
prefLabel: Collection
altLabels:
  - Category
  - Product Group
category: [Entities]
subcategory: [catalog]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/collection
  - https://help.shopify.com/en/manual/products/collections
---

# Collection

## WHAT: Definition

_Stub — a curated or rule-based group of [[Entity - Product|Products]]. Collections come in two types: Manual Collections (the [[Role - Merchant]] explicitly adds specific Products) and Smart Collections (Products are automatically included when they match configured criteria — tag, price, vendor, etc.). Collections are the primary navigation structure in the [[Surface - Online Store]]; the [[Surface - PLP]] is typically a Collection page._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (the Products this Collection groups), [[Surface - PLP]] (a PLP is typically scoped to a Collection), [[Surface - Online Store]] (Collections form the navigation hierarchy), [[Pattern - Catalog Fanout]] (Collections are the filtering layer in the fanout from Catalog to Storefront), [[Domain - Catalog]] (the domain this Entity belongs to)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Manual vs Smart Collection distinction; Smart Collection condition types (tag, product type, vendor, price, weight, compare-at price, inventory stock); Collection image and description fields; Collection sort order; nesting (Shopify does not natively nest Collections — third-party navigation menus fake this); the relationship between Collection handles and storefront URLs._
