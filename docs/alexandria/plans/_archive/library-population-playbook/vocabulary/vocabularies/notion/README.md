# Notion Lexicon — worked example

The Notion Lexicon — the worked example of what the Alexandria Vocabulary module would emit if Notion's product owner ran it against notion.so. A Lexicon is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide). Together they are the named-inventory of what's in this product, with the rules for naming new things.

This is what good output looks like for a B2B SaaS productivity product organized around document-vs-database duality. Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what a document-plus-database B2B SaaS vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Notion-shaped, the module can offer this whole shell as a starting frame: "Want to start from Notion's worked vocabulary? You'll get these 8 folders and these stubs; rename, drop, add as you go."

## Notion vs Linear — the distinguishing cut

The Linear Lexicon shows a product organized around the Container-vs-Item axis (Team → Project → Issue). Notion's distinguishing contribution is different: **Page-vs-Database is the load-bearing cut here.** Everything in Notion is either a prose document (a Page) or a queryable collection of Pages treated as rows (a Database). Every Database row is itself a Page. This duality — document and record, written and queried, narrative and structured — is the entire product. The Notion Lexicon is the canonical example in this set of what happens when a product makes a single ontological distinction its organizing principle and holds it across every surface and feature.

The second Notion-specific contribution to the set is **Block as a user-facing primitive.** Block is a rare successful MDA-inversion survivor — see [[Standard - Notion Nomenclature Signature]]. Both Linear and Duolingo name their primitives from user experience; Notion named its primitive from its React implementation and the name survived because users genuinely feel the bordered visual unit. This makes Block a worked example of the MDA exception condition: mechanism-naming that cleared the user-visibility test.

## Folder structure

```
notion/
├── _signature/
│   └── Standard - Notion Nomenclature Signature.md
├── roles/
│   ├── Role - Workspace Owner.md
│   ├── Role - Workspace Admin.md
│   ├── Role - Member.md
│   └── Role - Guest.md
├── entities/
│   ├── Entity - Workspace.md
│   ├── Entity - Teamspace.md
│   ├── Entity - Page.md
│   ├── Entity - Sub-page.md
│   ├── Entity - Block.md
│   ├── Entity - Database.md
│   ├── Entity - Property.md
│   ├── Entity - Relation.md
│   ├── Entity - Rollup.md
│   └── Entity - Template.md
├── surfaces/
│   ├── Surface - Sidebar.md
│   ├── Surface - Page View.md
│   ├── Surface - Database View.md
│   ├── Surface - Search.md
│   └── Surface - Comments.md
├── capabilities/
│   ├── Capability - Filtering.md
│   ├── Capability - Sorting.md
│   ├── Capability - Embedding.md
│   ├── Capability - Sharing.md
│   └── Capability - Mentioning.md
├── systems/
│   ├── System - Permission Model.md
│   ├── System - Block Tree.md
│   └── System - Sync Block.md
├── patterns/
│   ├── Pattern - Database as Application.md
│   ├── Pattern - Linked Database.md
│   ├── Pattern - Page Hierarchy.md
│   └── Pattern - Block Composition.md
└── economy/
    ├── Economy-instance - Seat.md
    ├── Economy-instance - Plan.md
    └── Economy-instance - Block Limit.md
```

34 stubs + 1 signature card = 35 files.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single-valued YAML list — drives the file path
subcategory: [<tag>, ...]      # drives view-time grouping; empty list [] for flat categories
facets: [<other-category>, ...]  # optional; only for genuine multi-category cards; omit or [] otherwise
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is always a single-valued list. Cards that genuinely span multiple categories add a `facets:` field listing the secondary categories — e.g., `Database View` has `category: [Surfaces]` and `facets: [Entities]`; `Block Limit` has `category: [Economy]` and `facets: [Mechanisms]`. Facets are rare; most cards omit the field entirely. The card lives in the folder of its primary category.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — workspace (Workspace Owner, Workspace Admin, Member); page (Guest)
- **entities/** — container (Workspace, Teamspace); document (Page, Sub-page); database (Database); database-piece (Property, Relation, Rollup); primitive (Block); template (Template)
- **surfaces/** — navigation (Sidebar, Search); content-display (Page View, Database View, Comments)
- **patterns/** — composition (Database as Application, Block Composition); hierarchy (Page Hierarchy); reuse (Linked Database)
- **capabilities/, systems/, economy/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

No `_deprecations/` folder. Notion's public vocabulary has not produced a major tombstone-worthy rename (no Lingot-to-Gems equivalent). If a future audit surfaces one (e.g., "Workspace" was briefly called "Organization" in early API beta docs), a `_deprecations/` folder should be added at that time.

## Note: Entities and Mechanisms density

This product is exceptionally rich in Entities and Mechanisms, consistent with the `families.md` "B2B SaaS productivity" finding for products that expose mechanism. Notion sits at the "exposed mechanism" end of the spectrum (along with Airtable, against Trello and Basecamp which hide it). Property, Relation, Rollup, and Block Tree are all surfaced as first-class user-facing nouns — the product's power users are comfortable with spreadsheet/RDBMS vocabulary and Notion deliberately borrows from that register. Directors building database-first tools should treat this Mechanisms depth as the expected output shape, not as a Notion quirk.
