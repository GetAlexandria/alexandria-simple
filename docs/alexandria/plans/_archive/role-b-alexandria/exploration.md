# Role B: Alexandria Meta-Library — Exploration

**Status:** Speculative. Pre-plan. Not a directive.
**Origin:** Raven product session, 2026-03-30. Captured before closing the workspace to
preserve the thinking. Role A structural repair must complete before this becomes a project.

---

## The Core Insight

Alexandria serves two roles:

**Role A** — The product library for Alexandria itself. Documents this product,
its agents, its capabilities, its design. A library *about* this specific software.

**Role B** — Alexandria meta-library. A reference foundation that helps any team build
any kind of context library. A library-of-libraries. The library *about* context libraries
in general.

These two roles have been conflated. The library was built correctly for Role A. It has not
been built for Role B. They have different requirements, and the noun structure needs
additional scaffolding to serve Role B.

**The foundational dependency:** Role A must be solid before Role B can be built.
You can only abstract correctly from a correct base. Every fuzzy type definition in Role A
becomes a structural defect in Role B's abstractions — multiplied across every genus and
species the meta-library tries to support.

This is why Role A repair came first (see `docs/plans/role-a-repair/plan.md`). This document
is what comes after.

---

## What the Noun Audit Revealed

During the Role A repair session, we audited the full type vocabulary against established
conventions. The audit produced three findings that directly shape Role B:

### Finding 1: The Vocabulary Has Two Layers That Don't Exist Yet

The current library has *concrete type labels* (Domain, Section, Template, Loop, Force, etc.).
What it doesn't have is the layer above them: **abstract type definitions** — the
genus-agnostic concept behind each label.

For example:
- **Domain** is the concrete label for Alexandria's top-level operational boundary
- The *abstract type* behind Domain is: "the primary organizational container of a library,
  grouping related knowledge by shared operational purpose or audience"
- In a book library, this abstract type might be instantiated as "Story Arc"
- In a comms library, it might be instantiated as "Channel"
- In a strategy library, it might be instantiated as "Workstream"

Without the abstract layer, a team starting a new library has to reverse-engineer the
concept from Alexandria's specific labels. The abstract layer makes the translation
explicit and portable.

This abstract layer doesn't exist anywhere in the current library. Alexandria document
describes it in prose, but it isn't formalized as cards.

### Finding 2: Type-to-Type Relationships Are Implicit, Not Formal

The containment and relationship rules between types exist as prose enforcement rules in the
Type Taxonomy decision tree. They're not expressed as a formal schema.

For a meta-library, this matters: downstream library builders need to know which types can
contain which types, which types require which other types, and which types are optional vs.
mandatory in a minimal library. Currently that knowledge requires reading the full taxonomy
and inferring the rules. It should be a navigable schema.

### Finding 3: No Type Provenance

The type taxonomy doesn't document *why* each label was chosen — which labels are
established conventions from known traditions (DDD, TOGAF, content strategy, systems
thinking), which are deliberate inventions, and which are gaming-vocabulary imports that
survived the Role A repair. This provenance is load-bearing for Role B: a team adapting the
taxonomy to their genus needs to know which terms are stable conventions they can trust vs.
invented terms they may want to translate.

---

## The "Noun Classification Bundles" Concept

During the session, the user introduced a concept that didn't have a prior name in the
library: **noun classification bundles**.

The idea: well-designed knowledge systems often have a meta-layer — a classification system
*for* the classification system. Not just "here are the types" but "here is how to choose
types for your specific genus, here is what each type abstracts over, here is the
relationship between types."

Alexandria is positioned as Alexandria reference — the one library every
other library can draw from. That positioning requires noun classification bundles: exportable
packages of type guidance that a new library builder can use to bootstrap their own
vocabulary without starting from scratch.

What a noun classification bundle might contain:
- The abstract type definition (genus-agnostic concept)
- The canonical instantiation (what Alexandria calls it)
- Example instantiations for common genera (book library, comms library, strategy library)
- The source tradition the concept draws from
- The minimum set of types required for a functioning library of this kind
- The optional extensions for more sophisticated libraries

This concept is not yet implemented anywhere. It's the core deliverable of Role B.

---

## The Spatial UI Possibility

During the session, the user raised the possibility of a LifeBuild-like spatial interface
for Alexandria — a visual, traversable environment where you can navigate your
product knowledge the way you navigate a metroidvania map.

This is speculative and untested. But it has implications for Role B:

**The key insight:** The type system and the UI vocabulary are separable concerns. You can
build a spatial UI on top of a functional type vocabulary. The UI rendering layer translates
`Domain` into "Zone" and `Section` into "Room" if you want the spatial experience. The type
names don't need to be spatial vocabulary to support spatial navigation.

This means Role B's abstract type definitions should be **rendering-agnostic** — they should
describe concepts, not navigation experiences. The spatial possibility doesn't change the
type system design; it changes the rendering layer design.

**What Role B should not do:** Bake spatial vocabulary into the abstract type definitions.
That would repeat the mistake of baking gaming vocabulary into the concrete type labels.

**What Role B might eventually do:** Define a rendering protocol — a spec for how each
abstract type should be rendered in different UI contexts (text list, spatial map, graph
view, conversation). That's a long-horizon capability, not a near-term deliverable. But it
should be named here so it doesn't get lost.

---

## What Role B Is (and Isn't)

**Role B is:**
- The formal definition of the abstract type layer above the concrete vocabulary
- A type-to-type relationship schema that is machine-navigable, not just prose
- Type provenance documentation for each type in the taxonomy
- Noun classification bundles — exportable packages of type guidance for common genera
- A federation pattern for compound libraries (libraries that span multiple genera)
- The formalization of what Alexandria document describes in prose

**Role B is not:**
- A rewrite of Role A (that's done before Role B starts)
- A content project (no new product-knowledge cards)
- A UI project (the spatial interface is downstream of Role B, not part of it)
- A refactor of the agent team or the play system

---

## Dependencies

Role B cannot start until:

1. **Role A is complete** — all five type renames applied, definitions tightened, taxonomy
   docs updated. Role B requires stable concrete definitions to abstract from.

2. **Exemplar Workstream Layers 1-2 are complete (or well underway)** — the abstract type
   definitions in Role B should be able to point to real exemplars of each type. An abstract
   definition for "Template" that can link to a real Template card (e.g., `Template - Card`)
   is more useful than one that can only describe the concept. Layers 1-2 produce the model
   Artifacts that ground Role B's abstractions.

See `docs/plans/role-a-repair/plan.md` for the Role A execution plan.

---

## Open Questions for Role B Planning

These are not answered yet. They're the questions that need answering before Role B gets a
directive plan:

1. **Where do abstract type definitions live?** As a new card type? As a section within each
   type's canonical card? As a separate Alexandria document? As a machine-readable schema
   file? The location determines how they're retrieved and used.

2. **What genera should Role B support first?** Alexandria document lists several:
   software product (covered by Role A), book/prose, communications, strategy, research.
   A focused first pass on 2-3 genera would validate the abstract type approach before
   generalizing to all genera.

3. **What does a noun classification bundle look like as a deliverable?** A card? A document?
   A template that library builders fill in? A CLI tool that generates the bundle for a
   given genus?

4. **How does the rendering protocol relate to the type system?** If the spatial UI ever
   materializes, how does a type definition specify how it should be rendered in spatial vs.
   text contexts?

5. **How does Role B relate to the wizard?** The wizard currently asks questions and
   recommends card types for a specific library. A Role B-complete library would let the
   wizard recommend *abstract types* and then translate them to genus-specific labels. That's
   a materially different wizard capability.

---

## The Thesis

Alexandria is not yet the library-of-libraries it's positioned to be. It's a
good library for one product. Making it Alexandria reference requires one additional
layer: the abstract type system that sits above the concrete vocabulary and can be projected
onto any genus.

That layer is the core deliverable of Role B. Everything else — the rendering protocol, the
noun classification bundles, the federation pattern — is built on top of it.

Role A clears the ground. Role B builds the foundation.
