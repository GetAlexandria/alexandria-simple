---
type: Standard
prefLabel: Shopify Nomenclature Signature
altLabels: []
category: [Rationale]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs
  - https://help.shopify.com
---

# Shopify Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Shopify's existing public vocabulary:

1. **Plain English commerce nouns.** Product, Variant, Cart, Checkout, Order, Customer, Inventory, Fulfillment, Discount, Refund — universally recognizable without documentation. This is the opposite of mechanism-leaked nouns: no state-machine internals, no API plumbing terms surfaced to users.
2. **Lifecycle-stage names as nouns.** Cart, Checkout, Order, Fulfillment are *states* in the purchase lifecycle, each named as a first-class Entity. This is the load-bearing convention: the state machine is the product. Each state has distinct mutation rules (Cart is freely mutable; Order line items are immutable), and each is named as the noun the shopper or merchant encounters at that moment.
3. **Compounds are two plain words.** Payment Method, Shipping Zone, Tax Rate, Order Confirmation, Product Detail Page, Inventory Item. Not `PaymentMethod` (CamelCase) as a user-facing noun. The spaced two-word form is the canonical written form in help documentation and UI copy.
4. **Two-audience naming is explicit.** Admin-side nouns (Order, Fulfillment, Inventory) vs Storefront-side nouns (Cart, Product, Collection). The same underlying data is named differently depending on which API and which audience it is served to. Shopify formalizes this split structurally: the Admin API and Storefront API have separate schemas, not a unified one with mode flags.
5. **Variant is the buyable unit; Product is the catalog shell.** The Product-vs-Variant cut is `families.md`'s named example of a Container-vs-Item pair in e-commerce. A Product is never purchased directly — only a Variant is added to Cart. This distinction is central to how Shopify's catalog, pricing, and inventory all work, and it must be named explicitly.
6. **Product surface vocabulary is well-named and conversion-tracked.** PDP (Product Detail Page), PLP (Product Listing Page), Cart Drawer, Checkout, Order Confirmation, Abandoned Cart Email — all surfaces with named conversion metrics. When you name a Shopify surface, you are naming what gets A/B-tested and what appears in analytics dashboards. Surface names in Shopify aren't UX shorthand; they're measurement units.

Shopify is the `families.md` positive example of *settled-by-convention* vocabulary for Family 4 (E-commerce / website-as-software). It effectively invented the modern e-commerce noun set — Product / Variant / Cart / Checkout / Order / Customer — and that core has been so thoroughly adopted that WooCommerce, Saleor, Medusa, and even non-commerce CMSes with monetization features borrow it verbatim. This is the reference shape for any director building a commerce product: the nouns are plain-English, the lifecycle states are first-class, the two-audience split is structural, and surface names are conversion-event labels. Directors building commerce-flavored products should treat this signature as the starting vocabulary and deliberately override only what their product truly requires a different word for.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename._
