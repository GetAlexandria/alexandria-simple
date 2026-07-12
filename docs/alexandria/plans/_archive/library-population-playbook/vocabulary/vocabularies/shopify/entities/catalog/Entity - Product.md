---
type: Entity
prefLabel: Product
altLabels:
  - Listing
  - Item
category: [Entities]
subcategory: [catalog]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/product
  - https://help.shopify.com/en/manual/products
---

# Product

## WHAT: Definition

_Stub — the catalog shell: the thing the [[Role - Merchant]] sells as a concept, distinct from any specific purchasable configuration. A Product holds the title, description, images, tags, and [[Entity - Collection]] memberships. It is never purchased directly; only its [[Entity - Variant|Variants]] are added to a [[Entity - Cart]]. A Product with no options still has exactly one Variant — Shopify's data model enforces the Product-vs-Variant split even for undifferentiated items._

_The Product-vs-Variant cut is `families.md`'s named example of the Container-vs-Item pair in e-commerce. Product is the catalog container — the browsable, searchable, shareable thing. Variant is the buyable unit — the specific size, color, material combination with its own SKU, price, and inventory. Displaying a Product on the [[Surface - PDP]] shows all its Variants; adding to Cart always names the Variant. This distinction is load-bearing for how catalog, pricing, and inventory all work: discounts can target a Product (apply to all its Variants) or a specific Variant; inventory is tracked per Variant per Location, not per Product._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Variant]] (the buyable units this Product contains), [[Entity - Collection]] (the groups this Product belongs to), [[Surface - PDP]] (the single-product display surface), [[Surface - PLP]] (the listing surface where this Product appears), [[Capability - Add to Cart]] (which always routes through a Variant selection), [[Domain - Catalog]] (the domain this Entity belongs to)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Product status (Draft / Active / Archived); Product type and vendor fields; option names and values (Size, Color, Material — up to 3 option dimensions in standard Shopify); the relationship between Product images and Variant images; SEO fields (handle, meta title, meta description); Product publishing across Channels._
