# Figma Vocabulary — worked example

The Figma Vocabulary is the library shell + stub cards that the Vocabulary module would produce if Figma's product owner ran it against figma.com. A Vocabulary is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide). Together they're the named-inventory of what's in this product, with the rules for naming new things.

Figma demonstrates four things worth studying in this corpus:

1. **The Component/Instance/Variant trio** — a clean three-level Container-vs-Item-style cut at the design-primitive layer. Component is the master; Instance is the placed copy; Variant is the enumerated subtype. This resolves the combinatorial-states problem in design systems more clearly than any predecessor tool.
2. **A Library concept that clashes with Alexandria's.** Figma's Library is a published collection of design primitives (Components, Styles, Variables) shared across Files — a component library in the design-system sense. This is categorically distinct from Alexandria's Library (a knowledge wiki). When Figma appears as a comparator in a Vocabulary session, this polysemy must be flagged.
3. **Editor/Viewer/Dev Mode seat-tier economy** — a capability-named seat partition that enables broad stakeholder access without billing growth. Seats are named for what they can do, not for who holds them.
4. **Branch and Merge as deliberate process-vocabulary borrows that worked** — because Figma's audience is design teams working directly alongside developers who already use these terms. Contrast with Linear's Sprint → Cycle rename, which avoided the borrow for a broader audience.

## Folder structure

```
figma/
├── _signature/
│   └── Standard - Figma Nomenclature Signature.md
├── roles/
│   ├── editor/
│   │   ├── Role - Designer.md
│   │   └── Role - Developer.md
│   ├── viewer/
│   │   └── Role - Viewer.md
│   └── admin/
│       ├── Role - Admin.md
│       └── Role - Owner.md
├── entities/
│   ├── file-system/
│   │   ├── Entity - File.md
│   │   └── Entity - Page.md
│   ├── design-primitive/
│   │   ├── Entity - Frame.md
│   │   ├── Entity - Group.md
│   │   ├── Entity - Layer.md
│   │   ├── Entity - Component.md
│   │   ├── Entity - Instance.md
│   │   └── Entity - Variant.md
│   ├── library/
│   │   ├── Entity - Library.md
│   │   ├── Entity - Style.md
│   │   └── Entity - Variable.md
│   └── team-org/
│       ├── Entity - Team.md
│       ├── Entity - Project.md
│       └── Entity - Branch.md
├── surfaces/
│   ├── editor/
│   │   └── Surface - Canvas.md
│   ├── panel/
│   │   ├── Surface - Layers Panel.md
│   │   ├── Surface - Properties Panel.md
│   │   └── Surface - Assets Panel.md
│   ├── mode/
│   │   ├── Surface - Prototype Mode.md
│   │   └── Surface - Dev Mode.md
│   └── share/
│       ├── Surface - Share Modal.md
│       └── Surface - File Browser.md
├── capabilities/
│   ├── editing/
│   │   ├── Capability - Drawing.md
│   │   └── Capability - Auto Layout.md
│   ├── prototyping/
│   │   └── Capability - Connecting.md
│   ├── collaboration/
│   │   ├── Capability - Commenting.md
│   │   └── Capability - Branching.md
│   └── library-management/
│       └── Capability - Publishing.md
├── systems/
│   ├── System - Auto Layout Engine.md
│   ├── System - Constraints.md
│   ├── System - Component System.md
│   └── System - Plugin Runtime.md
├── patterns/
│   ├── workflow/
│   │   ├── Pattern - Branch-Merge Workflow.md
│   │   └── Pattern - Comment-Resolve.md
│   └── design-system/
│       ├── Pattern - Component Override.md
│       ├── Pattern - Variant Matrix.md
│       └── Pattern - Library Publishing.md
└── economy/
    ├── seat/
    │   ├── Economy-instance - Editor Seat.md
    │   ├── Economy-instance - Viewer Seat.md
    │   └── Economy-instance - Dev Mode Seat.md
    └── plan/
        └── Economy-instance - Plan.md
```

46 stubs + 1 signature card = 47 files.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — editor (Designer, Developer); viewer (Viewer); admin (Admin, Owner)
- **entities/** — file-system (File, Page); design-primitive (Frame, Group, Layer, Component, Instance, Variant); library (Library, Style, Variable); team-org (Team, Project, Branch)
- **surfaces/** — editor (Canvas); panel (Layers Panel, Properties Panel, Assets Panel); mode (Prototype Mode, Dev Mode); share (Share Modal, File Browser)
- **capabilities/** — editing (Drawing, Auto Layout); prototyping (Connecting); collaboration (Commenting, Branching); library-management (Publishing)
- **systems/** — flat (Auto Layout Engine, Constraints, Component System, Plugin Runtime)
- **patterns/** — workflow (Branch-Merge Workflow, Comment-Resolve); design-system (Component Override, Variant Matrix, Library Publishing)
- **economy/** — seat (Editor Seat, Viewer Seat, Dev Mode Seat); plan (Plan)

Subcategories determine file paths: a card with `subcategory: [editor]` lives at `roles/editor/<file>.md`; `subcategory: [design-primitive]` lives at `entities/design-primitive/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths are kept in sync.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single-valued YAML list — drives the file path
subcategory: [<tags>]          # view-time grouping tags; empty list [] if none
facets: [<other-categories>]   # optional; only for genuine multi-category cards; omit or [] when not applicable
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets in this Vocabulary.** Auto Layout has `facets: [Mechanisms]` — it is genuinely both a capability and a system. All Systems cards carry `user_visible: false` per the MDA-inversion guard. No other facet pairs are declared; the Library polysemy (Figma Library vs Alexandria Library) is noted in the Entity - Library WHAT body rather than as a facet, since the two concepts live in different product vocabularies rather than in different categories of the same one.

## What's NOT here

Rationale and Research cards. Those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules). The Vocabulary module surfaces these category folders but does not pre-populate them.
