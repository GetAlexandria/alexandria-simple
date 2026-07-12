---
type: Entity
prefLabel: Variant
altLabels:
  - SKU
  - Product Variant
category: [Entities]
subcategory: [catalog]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/product-variant
  - https://help.shopify.com/en/manual/products/variants
---

# Variant

## WHAT: Definition

_Stub — the buyable unit of a [[Entity - Product]]: the specific size/color/material combination that carries a price, a SKU, and its own [[Entity - Inventory Item]]. A Variant is the thing that enters a [[Entity - Cart]], not the Product. Every [[Entity - Product]] has at least one Variant; a Product with options (Size: S/M/L, Color: Red/Blue) generates a Variant for each valid combination. Price, compare-at price, weight, and inventory are all Variant-level, not Product-level._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (the catalog shell this Variant belongs to), [[Entity - Inventory Item]] (the stock-tracking record for this Variant), [[Entity - Cart]] (Cart line items reference Variants), [[Capability - Add to Cart]] (the action that creates a Variant-keyed line item in the Cart)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Variant option values (the specific combination this Variant represents); price and compare-at price fields; SKU and barcode; inventory policy (continue selling when out of stock vs block); weight for shipping calculation; Variant image assignment; the 100-Variant-per-Product limit in standard Shopify (higher limits on Plus)._
