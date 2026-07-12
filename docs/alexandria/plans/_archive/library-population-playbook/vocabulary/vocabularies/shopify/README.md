# The Shopify Lexicon

The Shopify Lexicon — the worked example of what Vocabulary would emit for Shopify's commerce platform. A Lexicon is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide) + Deprecation tombstones (rename history). Together they're the named-inventory of what's in this product, with the rules for naming new things.

This is the `families.md` exemplar of the **most stabilized core vocabulary across any software type**. Product / Variant / Cart / Checkout / Order / Customer is so settled that non-commerce CMSes borrow it for monetization features. Shopify effectively invented the modern e-commerce noun set, and most other platforms — Saleor, WooCommerce, Medusa, even Webflow's e-commerce bolt-on — adopted it wholesale.

Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what a commerce-platform vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Shopify-shaped, the module can offer this whole shell as a starting frame: "Want to start from Shopify's worked vocabulary? You'll get these 10 folders and these stubs; rename, drop, add as you go."

## Folder structure

```
shopify/
├── _signature/
│   └── Standard - Shopify Nomenclature Signature.md
├── _deprecations/
│   └── Deprecation - Sources API.md
├── roles/         (Merchant, Staff, Customer, Guest, B2B Buyer — 5 stubs)
├── entities/      (Shop, Product, Variant, Collection, Cart, Checkout, Order, Customer, Inventory Item, Fulfillment — 10 stubs)
├── surfaces/      (Admin, Online Store, PDP, PLP, Cart Drawer, Checkout, Order Confirmation — 7 stubs)
├── capabilities/  (Add to Cart, Applying a Discount, Checking Out, Fulfilling, Refunding — 5 stubs)
├── systems/       (Inventory Reservation, Payment Authorization vs Capture, Tax Calculation, Shipping Zone — 4 stubs)
├── patterns/      (Cart-to-Order Lifecycle, Catalog Fanout, Two-Audience API Split, Abandoned Cart Recovery — 4 stubs)
├── economy/       (Currency, Plan, Discount, Tax Class, Reserved Stock, Refund — 6 stubs)
└── domains/       (Catalog, Fulfillment, Payments, Marketing — 4 stubs)
```

45 stubs + 1 signature card + 1 deprecation tombstone = 47 files. Some concepts appear across multiple folders as facet pairs — Checkout is both an Entity and a Surface; Discount is both an Economy-instance and a Capability. The card lives in its primary-category folder; facet membership is signaled in frontmatter only.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single value; drives the file path
subcategory: [<tags>]          # drives view-time grouping; [] if flat
facets: [<other categories>]   # only for genuine multi-category cards; omit otherwise
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is always a single-element list. The card lives in its primary-category folder. Genuine multi-category concepts add `facets: [<other categories>]` — e.g., `Entity - Checkout` has `facets: [Surfaces]`; `Economy-instance - Discount` has `facets: [Capabilities]`. Facets are rare; most cards omit them.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — merchant-side (Merchant, Staff); customer-side (Customer, Guest); b2b (B2B Buyer)
- **entities/** — shop-level (Shop); catalog (Product, Variant, Collection); lifecycle (Cart, Checkout, Order, Fulfillment); customer-data (Customer); inventory (Inventory Item)
- **surfaces/** — admin-side (Admin); storefront (Online Store, PDP, PLP, Cart Drawer, Checkout, Order Confirmation); email (Order Confirmation)
- **capabilities/** — shopper-action (Add to Cart, Applying a Discount, Checking Out); merchant-action (Fulfilling, Refunding)
- **patterns/** — lifecycle (Cart-to-Order, Abandoned Cart Recovery); architecture (Catalog Fanout, Two-Audience API Split)
- **economy/** — pricing (Currency); discount (Discount, Refund); tax (Tax Class); stock (Reserved Stock); tier (Plan)
- **systems/, domains/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

## Note: E-commerce vocabulary stability

This product is the `families.md` positive example of *settled-by-convention* vocabulary — Shopify invented the modern e-commerce noun set, which most other platforms then adopted. The Cart → Checkout → Order lifecycle is this family's defining Pattern: each state is named as a first-class Entity, each has distinct mutation rules, and the sequence has produced the clearest lifecycle-as-Pattern example in any software family surveyed. The merchant-vs-shopper two-audience split is equally structural — the Admin API and Storefront API surface the same underlying data under different noun shapes, and the split is explicit in Shopify's own developer documentation. Directors building commerce-flavored products should borrow this noun set verbatim rather than reinventing.
