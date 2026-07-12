---
type: Surface
prefLabel: PDP
altLabels:
  - Product Detail Page
  - Product Page
category: [Surfaces]
subcategory: [storefront]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/online-store/themes/theme-structure
  - https://shopify.dev/docs/storefronts/themes/architecture/templates/product
---

# PDP

## WHAT: Definition

_Stub — the Product Detail Page: the single-[[Entity - Product]] display surface with [[Entity - Variant]] picker and [[Capability - Add to Cart]] call to action. The PDP is where a shopper evaluates one Product — seeing images, description, price, available Variants, and inventory status — and converts by selecting a Variant and adding it to the [[Entity - Cart]]. The PDP-to-Cart conversion rate is the primary per-surface conversion metric tracked here._

_`families.md` called out this entire family of named surfaces — PDP, PLP, Cart Drawer, Checkout, Order Confirmation — as the defining characteristic of e-commerce surface vocabulary: these are named, versioned, and conversion-tracked surfaces, not just usability affordances. Every named surface has a known conversion benchmark, an A/B test history, and a line in analytics. The PDP is the most conversion-studied surface in e-commerce; Shopify's ecosystem of apps exists largely to improve PDP conversion (reviews, trust badges, urgency signals)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (the Product displayed), [[Entity - Variant]] (Variants displayed and selected here), [[Capability - Add to Cart]] (the primary action on this surface), [[Surface - PLP]] (the upstream surface that links here), [[Surface - Cart Drawer]] (shown after Add to Cart action)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: PDP sections (product images, title, price, Variant selector, description, Add to Cart button, reviews, recommendations); dynamic Variant selection (URL update on Variant change); media gallery types; structured data / rich snippets; PDP template customization in Online Store 2.0; app block insertion points on PDP._
