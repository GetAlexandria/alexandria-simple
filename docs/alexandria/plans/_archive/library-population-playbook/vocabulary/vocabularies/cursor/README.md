# Cursor Lexicon — worked example

The Cursor Lexicon — the worked example of what Vocabulary would emit for cursor.com. A Lexicon is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide). Together they're the named-inventory of what's in this product, with the rules for naming new things.

This is what good output looks like for a software-with-agents-in-it product. Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what an agentic developer-tool vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Cursor-shaped, the module can offer this whole shell as a starting frame: "Want to start from Cursor's worked vocabulary? You'll get these 7 folders and these stubs; rename, drop, add as you go."

## Cursor's distinguishing contribution

Cursor's signature contribution to agentic-software vocabulary is the **four-tier autonomy ladder of surfaces**: Tab → Inline Edit → Composer → Agent. Each tier names the *felt encounter* the developer has during that interaction, not the orchestrator's internal state. `families.md` flags this as the cleanest surface naming in the agentic-software space — the canonical positive example of MDA-inversion-avoided. No other product in Family 2 has a fully named, user-visible, four-rung escalation from keystroke-autocomplete to autonomous codebase-wide loop. Directors building tools in this space should treat the Cursor autonomy ladder as the reference shape for naming agentic UI surfaces.

## Folder structure

```
cursor/
├── _signature/
│   └── Standard - Cursor Nomenclature Signature.md
├── roles/       (Developer, Agent, Background Agent — 3 stubs)
├── entities/    (Workspace, File, Chat, Session, Checkpoint, Index, Rule, .cursorrules — 8 stubs)
├── surfaces/    (Tab, Inline Edit, Composer, Agent Surface, Chat, Browser — 6 stubs)
├── capabilities/ (Tab Completion, Inline Editing, Composing, Semantic Search, Applying — 5 stubs)
├── systems/     (Tab Engine, Indexing Pipeline, Apply Algorithm — 3 stubs)
├── patterns/    (Autonomy Ladder, Apply-and-Review, Background Loop — 3 stubs)
└── economy/     (Fast Request, Slow Request, Plan — 3 stubs)
```

31 stubs + 1 signature card = 32 files. The surfaces category is intentionally the richest category for this product — it is where the autonomy ladder lives. The Agent concept appears as both a Role and a Surface (Agent Surface) because it operates as a named participant in the developer's mental model *and* as a named UI mode; each facet gets its own card in its primary folder.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single value — drives the file path
subcategory: [<tags>]          # drives view-time sub-grouping; [] if none
facets: [<other categories>]   # only for genuine multi-category concepts; omit or [] otherwise
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is single-valued — it names the primary folder the card lives in. Concepts that genuinely span multiple categories declare secondary categories in `facets:` — e.g., Cursor's `Agent` has `category: [Roles]` and `facets: [Surfaces]`; `Index` has `category: [Entities]` and `facets: [Mechanisms]`. Facets are rare and optional; most cards omit the field entirely.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — human (Developer); agent / foreground (Agent); agent / background (Background Agent)
- **entities/** — workspace-artifact (Workspace, File); conversation (Chat, Session, Checkpoint); index (Index); configuration (Rule, .cursorrules)
- **surfaces/** — autonomy-tier (Tab, Inline Edit, Composer, Agent Surface); conversational (Chat); other (Browser)
- **capabilities/** — edit-operation (Tab Completion, Inline Editing, Composing); search (Semantic Search); apply (Applying)
- **economy/** — request-type (Fast Request, Slow Request); plan (Plan)
- **systems/, patterns/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

## Note: Surfaces density

This product's richest category is Surfaces, consistent with the `families.md` "software-with-agents-in-it" finding that surfaces are the live frontier. The autonomy ladder (Tab → Inline Edit → Composer → Agent) is not just a vocabulary set — it is the product's primary organizing metaphor. Directors building in this space should expect Surfaces to carry as much conceptual weight as Entities, not to be an afterthought. The six surface cards here (four ladder tiers + Chat + Browser) are the load-bearing vocabulary of the product.
