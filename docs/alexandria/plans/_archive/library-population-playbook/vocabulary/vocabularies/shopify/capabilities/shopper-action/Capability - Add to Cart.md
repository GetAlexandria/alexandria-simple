---
type: Capability
prefLabel: Add to Cart
altLabels:
  - Add to Bag
  - Add to Basket
category: [Capabilities]
subcategory: [shopper-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/storefront/current/mutations/cartLinesAdd
  - https://help.shopify.com/en/manual/online-store/themes
---

# Add to Cart

## WHAT: Definition

_Stub — the action that converts a [[Entity - Product]] + [[Entity - Variant]] selection into a line item in the [[Entity - Cart]]. Add to Cart is the primary conversion action on the [[Surface - PDP]] and the primary metric tracked at that surface. The action requires a selected Variant (even for Products with only one Variant); the Cart records the Variant ID, quantity, and any custom attributes._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Cart]] (the Cart this action mutates), [[Entity - Variant]] (the Variant added as the line item), [[Surface - PDP]] (the surface where this action most commonly fires), [[Surface - Cart Drawer]] (the surface that displays post-action)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Add to Cart vs Buy Now (Cart addition vs direct-to-Checkout); multi-quantity Add to Cart; Cart attribute passing (custom engraving, gift message); add-to-cart redirect behavior (open Cart Drawer vs go to Cart page vs stay on PDP); Add to Cart button state management (disabled when out of stock; loading during AJAX call); Storefront API mutation `cartLinesAdd`._
