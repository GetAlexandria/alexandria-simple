# Linear Lexicon — worked example

The Lexicon that the Vocabulary module would produce if Linear's product owner ran it against linear.app. A Lexicon is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide) + Deprecation tombstones (rename history). Together they're the named-inventory of what's in this product, with the rules for naming new things.

This is what good output looks like. Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what a B2B SaaS productivity vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Linear-shaped, the module can offer this whole shell as a starting frame: "Want to start from Linear's worked vocabulary? You'll get these 7 folders and these stubs; rename, drop, add as you go."

## Folder structure

```
linear/
├── _signature/
│   └── Standard - Linear Nomenclature Signature.md
├── roles/     (Owner, Admin, Member, Guest, Customer — 5 stubs)
├── entities/  (Workspace, Team, Project, Issue, Sub-issue, Initiative, Roadmap, Milestone, Cycle, Label — 10 stubs)
├── surfaces/  (View, Inbox, Dashboard, Activity Feed — 4 stubs)
├── capabilities/  (Search, Filtering, Assigning, Commenting, Sharing — 5 stubs)
├── systems/   (Workflow State, Permission Model, Notification Routing — 3 stubs)
├── patterns/  (Triage, Cycle, Backlog — 3 stubs)
└── economy/   (Seat, Plan, Customer — 3 stubs)
```

33 stubs + 1 signature card = 34 files. Some concepts appear in two folders as facet pairs (Cycle as Entity + Pattern; Customer as Role + Economy) — the card lives in its primary-category folder, the facet is signaled in frontmatter.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — operator (Owner, Admin); end-user (Member, Guest); bridge (Customer)
- **entities/** — container (Workspace, Team, Project, Initiative, Roadmap); item (Issue); sub-item (Sub-issue); time-box (Cycle); time-marker (Milestone); tag (Label)
- **patterns/** — lifecycle (Backlog); rhythm (Triage, Cycle)
- **economy/** — seat (Seat); plan (Plan); bridge (Customer)
- **surfaces/, capabilities/, systems/** — flat for now

Subcategories live in card frontmatter and drive view-time grouping. Re-tagging is cheap; no file moves needed.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single-value YAML list — drives the file path
subcategory: [<tags>]          # view-time grouping tags; empty list if none
facets: [<other-categories>]   # optional; only for genuine multi-category cards; omit or [] when not applicable
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is a single-value list — the card's primary home. Concepts that genuinely span multiple categories carry a `facets:` field listing the secondary categories — e.g., Linear's `Cycle` entity has `category: [Entities]` and `facets: [Patterns]`; `Role - Customer` has `category: [Roles]` and `facets: [Economy]`. The card lives in the folder of its primary category; facets are signaled in frontmatter only. Facets are rare — most cards omit the field entirely.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.
