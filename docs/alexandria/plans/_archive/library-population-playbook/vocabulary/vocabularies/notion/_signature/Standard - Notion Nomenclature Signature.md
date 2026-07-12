---
type: Standard
prefLabel: Notion Nomenclature Signature
altLabels: []
category: [Rationale]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help
  - https://developers.notion.com
---

# Notion Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Notion's existing public vocabulary:

1. **Short, lower-case-in-prose, generic English nouns.** Page, Block, Database, Property, Relation, View — nothing invented. Every noun passes the "would this appear in a dictionary" test. Notion's vocabulary is the anti-Stripe: where Stripe coins `PaymentIntent` and `SetupIntent`, Notion picks the most available English word for the concept.
2. **Compounds are two plain words, never CamelCased.** Teamspace, Sub-page, Page Property, Sync Block — the two-word form is the canonical written form everywhere the product uses it. "Teamspace" is the one compressed exception (single word, product-specific term for the second-level container).
3. **Database vocabulary borrowed from spreadsheets and RDBMS.** Property (column), Rollup, Relation, Filter, Sort — explicit pedagogical borrowing from the vocabulary a spreadsheet-literate user already knows. The borrowing is intentional: recognizability over novelty, lower onboarding cost.
4. **The Page-vs-Database cut is sacred.** Pages are documents; Databases are queryable collections of Pages-as-rows. Every Database row is itself a Page. This duality is the product's organizing principle. Any new feature must declare which side of this cut it lives on (or acknowledge that it spans both, which is itself a product decision).
5. **Block is the atomic primitive.** Everything visible on a Page is a Block — paragraph, heading, image, embed, sub-page reference, database inline view. Block-based composition is the engine. New content types are Blocks; new layout concepts reference Blocks.
6. **Sharing and permissions vocabulary inherited from filesystem and SaaS conventions.** Workspace, Member, Guest, Share, Permission — recognizable to any SaaS user. Notion does not invent permission terminology.

**The Block primitive's MDA position — a working inversion.**

Block is a mechanism-named noun (it is literally a React node in Notion's original front-end architecture) that became user-facing because users genuinely feel the bordered visual unit on screen. When a user clicks on a paragraph in Notion, a drag handle appears and the unit is visually bounded — that bounded unit is what users call a Block. This is the `families.md` note about Block being a *working* MDA-inversion case: mechanism-named survived the boundary because the mechanism is aesthetically visible. The test is strict — if users could not see and feel the unit as a discrete bordered object, "Block" would be a mechanism leak. Because they can, it is a legitimate aesthetic name that happens to match the implementation. This is rare. It does not license naming other mechanism-level constructs (AST nodes, render passes, API objects) as user-facing nouns. Each case requires the same test: can the user see and feel this discrete unit on screen during their moment of use?

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename. Special note: the Page-vs-Database cut should be encoded as a hard lint rule — any new noun that spans the cut without declaring how requires explicit director sign-off._
