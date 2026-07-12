---
type: Standard
prefLabel: Figma Nomenclature Signature
altLabels: []
category: [Rationale]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://help.figma.com/hc/en-us/
  - https://www.figma.com/blog/
  - https://developers.figma.com/
---

# Figma Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Figma's existing public vocabulary:

1. **Short, single-word English nouns for design primitives.** Frame, Layer, Component, Variant, Page, File. Prefer monosyllabic or two-syllable nouns. Avoid Latinate compounds or mechanism-derived names: "Artboard" became Frame; "Symbol" became Component; "Overrides" is not an entity but a pattern.
2. **Borrowed software-engineering vocabulary for collaboration features.** Branch, Merge, Comment, Library, Publish — process-vocabulary borrows that work because the primary audience is design teams working directly alongside developers. Each borrow transfers cleanly because the workflow analogy holds: diverge-work-reconcile for Branch/Merge; share-subscribe-update for Library/Publish.
3. **Compound nouns are two plain words, not CamelCase.** Auto Layout, Dev Mode, Variant Matrix, Smart Animate, Starter Plan. Not `AutoLayout`, not `DevMode`. The space is the canonical separator in written form.
4. **Modes get aesthetic-named noun-state pairings.** Prototype Mode, Dev Mode — the noun names the state the editor is in. The "Mode" suffix is appended to signal the UI is in a distinct capability state, not navigated to a separate surface.
5. **Seats are named for their capability tier, not for the role that holds them.** Editor Seat, Viewer Seat, Dev Mode Seat — the tier name describes *what the seat can do* (edit, view, dev-mode access), not who holds it (Designer, Stakeholder, Developer). This makes the pricing model legible without requiring audience-role knowledge.
6. **No invented vocabulary.** Even Figma's most distinctive feature (the Component/Instance/Variant trio) reuses vocabulary from software engineering (Component, Instance) and plain English (Variant). The Figma Plugin API is named "Plugin" — unadorned. There is no Figma-invented brand noun equivalent to Duolingo's Streak or Lingot.

Figma's Component/Instance/Variant trio deserves note as a clean Container-vs-Item-style cut at the design-primitive layer. Component is the master (the class); Instance is the placed copy (the object); Variant is an enumerated subtype (the variant within a class hierarchy). This three-part vocabulary resolves the long-standing ambiguity in design-system practice between "what is the reusable thing" and "how do I handle its states" — a problem older tools (Sketch, InVision DSM) addressed less cleanly. The trio is the most teachable concept in Figma's vocabulary and the most imitated by later tools.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns (e.g., if "Artboard" resurfaces), and worked examples of named-correctly vs flagged-for-rename._
