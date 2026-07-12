---
type: Domain
prefLabel: Catalog
altLabels:
  - Product Catalog
  - Merchandise Catalog
category: [Domains]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/product
  - https://shopify.dev/docs/api/admin-rest/current/resources/collection
---

# Catalog

## WHAT: Definition

_Stub — the domain that owns [[Entity - Product|Products]], [[Entity - Variant|Variants]], and [[Entity - Collection|Collections]]: everything the [[Role - Merchant]] sells, how it's organized, and how it's displayed. The Catalog domain is the source of truth for what exists and how it's priced; it feeds the [[Pattern - Catalog Fanout]] to all Channels. Catalog is Merchant-managed via the [[Surface - Admin]] and Shopper-browsable via the [[Surface - Online Store]]._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (primary Catalog entity), [[Entity - Variant]] (buyable unit), [[Entity - Collection]] (organizational grouping), [[Pattern - Catalog Fanout]] (distribution to Channels), [[Domain - Fulfillment]] (Catalog supplies the items that Fulfillment ships)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Catalog as the Admin API's product/collection/variant resource group; the Catalog API (headless catalog syndication); Product import/export CSV; metafields for custom Catalog data; Catalog vs Channel (Catalog is what exists; Channel is where it's sold)._
