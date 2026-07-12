---
type: Standard
prefLabel: Alexandria Nomenclature Signature
altLabels: []
category: [Rationale]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/agents/
  - docs/alexandria/library/product/capabilities/
  - docs/alexandria/library/product/systems/
  - docs/alexandria/library/product/primitives/
  - docs/alexandria/library/rationale/principles/
  - docs/alexandria/library/rationale/standards/
---

# Alexandria Nomenclature Signature

## WHAT: Definition

The naming style Alexandria commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override. The signature has eight rules, inferred directly from Alexandria's existing 208-card vocabulary.

1. **Agents are named human first names from cultural reference families.** Conan (the librarian / the barbarian), Sam (the scribe / Lord of the Rings), Bridget (the briefer / Irish lore), Raven (Norse / totemic), Solomon (biblical / wisdom). The first name is the felt-encounter name; the epithet encodes the role. Never job titles alone ("the Grader," "the Writer") — the felt-encounter identity comes first.
2. **Capabilities are gerunds.** Linting, Grading, Briefing, Atomization, Health Check, Card Building, Cascade Analysis, Surgery. The -ing form or a gerund-adjacent noun phrase. The capability is *the doing*, not the doer.
3. **Systems use "\<Domain\> Engine" or a noun-of-mechanism pattern.** Quality Grading Engine, Quest Engine, Wizard Configuration Engine, Retrieval and Assembly Engine, Gap Analysis Engine, Codebase Scanner, DAG Engine, Eval Harness, Signal Queue, Feedback Queue, Provenance Log. The pattern names the substrate and the function — never the user's encounter with it.
4. **Primitives prefer Anglo-Saxon monosyllables.** Card, Coin, Bench, Bank, Skill. Avoid Latinate (Module, Component when it can be helped, though Component is used for composed card sections). The closer to a concrete object a user can picture, the better. "Card" beats "Document." "Bank" beats "Repository" in casual reference.
5. **Principles are full declarative sentences.** "One Concept Per Card," "Each Card Type Makes One Kind of Claim," "Build Upstream Before Downstream," "Read but Never Write (Conversational Agent)." The principle title IS the claim. Never a noun phrase.
6. **Standards are noun phrases naming the bar.** "Five-Dimension Card Requirements," "Day-1 Complexity Ceiling," "Card Frontmatter Schema," "Grading Sampling Rate." A standard title describes what is being held to a standard, not what the standard says.
7. **Domains are spatial-metaphor names.** "Library Interior," "Library Boundary" — the substrate is figuratively a building. Agents move *inside* or *at the boundary of* the library. This spatial framing is consistent throughout: rooms, sections, workspaces are all architectural metaphors.
8. **Unified user+engineer corpus.** Alexandria's named-team-of-agents is visible to both maintainers and end users — rare in this category. Products with an engine-vs-content split (Unity / LangChain) keep two disjoint vocabularies. Alexandria collapses this deliberately. Implication: the same naming rules apply whether a concept is internal plumbing or end-user-facing. There is no "internal only" escape hatch.

**MDA inversion guard:** This signature would lint a future "Component - Vector Store" as violating both the Anglo-Saxon-primitive rule and (worse) the MDA inversion rule — Vector Store is a mechanism-named concept, not a felt-encounter name. The correct form would be something like "Entity - Knowledge Pool" or "Primitive - Memory."

## WHERE: Ecosystem

_Stub — links to: [[Standard - Five-Dimension Card Requirements]] (the quality contract every card in this lexicon must satisfy), [[Principle - One Concept Per Card]] (the atomicity rule that governs card-naming), and every card type in this library that the signature constrains._

## WHY: Rationale

_Stub — owner-supplied. The signature exists because naming drift is the most common quality failure in a growing library. Once "Module," "Component," "Vector Store," and "Agent" coexist for the same class of concept, retrieval precision drops and the graph loses its type-semantic integrity._

## WHEN: Timeline

_Stub — stamped at bank time when the Vocabulary module is run. Re-banked when the signature is updated (drift detected during lint or director-initiated). This instance extracted from the 208-card library as of 2026-05._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints for each of the eight rules), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename. Specific worked example: "Component - Vector Store" → flagged for rules 4 (not Anglo-Saxon monosyllable) and 3 (mechanism-named, not felt-encounter). Override would require director sign-off with written rationale._
