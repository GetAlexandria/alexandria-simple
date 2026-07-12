---
type: Pattern
prefLabel: Catalog Fanout
altLabels:
  - Channel Fanout
  - Multi-Channel Publishing
  - Catalog Distribution
category: [Patterns]
subcategory: [architecture]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/apps/build/online-store/multiple-stores
  - https://help.shopify.com/en/manual/channels
---

# Catalog Fanout

## WHAT: Definition

_Stub — the pattern by which one [[Domain - Catalog]] feeds many Channels, which feed many Storefronts. A [[Role - Merchant]] manages one canonical Product catalog in the [[Surface - Admin]]; individual [[Entity - Product|Products]] are published to one or more Channels (Online Store, Point of Sale, Buy Button, Google, Meta, Amazon). Each Channel may have its own pricing, availability, and [[Entity - Collection]] configuration derived from the same underlying catalog._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (the catalog object being fanned out), [[Entity - Collection]] (the groupings that structure each Channel's view), [[Surface - Online Store]] (the primary Channel), [[Domain - Catalog]] (the source domain), [[Pattern - Two-Audience API Split]] (the API-level reflection of the Channel fan: Storefront API presents the Channel view)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Channel publishing UI in Admin (product availability checkboxes); Channel-specific pricing (Shopify Markets for multi-currency/multi-region); publication status per Product per Channel; headless storefronts as a Channel pattern (one Admin, multiple Storefront API-consuming frontends); the Shopify Markets model (one [[Entity - Shop]], multiple regional storefronts with localized pricing)._
