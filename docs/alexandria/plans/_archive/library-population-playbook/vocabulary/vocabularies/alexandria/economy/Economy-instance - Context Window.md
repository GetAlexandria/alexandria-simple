---
type: Economy-instance
prefLabel: Context Window
altLabels:
  - Token Budget
  - Context Budget
  - Context Limit
category: [Economy]
subcategory: []
facets: [Mechanisms, Entities]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/plans/library-population-playbook/vocabulary/families.md
  - docs/alexandria/library/product/systems/System - Retrieval and Assembly Engine.md
---

# Context Window

## WHAT: Definition

The Context Window is the bounded space available to an Agent in a single session for prompt, retrieved cards, tool outputs, conversation history, and system instructions. For Alexandria, the Context Window governs how many cards can fit in a briefing, how long a grading session can run before truncation, and how deep a Raven conversation can go before earlier turns must be dropped. The Context Window is simultaneously a budget (constrained resource), a surface (the space where the agent "thinks"), a memory boundary (what the agent can see at any moment), and a pricing proxy (larger context = higher API cost per session).

No product has named the Context Window as a first-class noun in its user-facing vocabulary — it is widely felt but rarely surfaced as a product concept the Director must manage. Alexandria's position is that Context Window management is a first-class product constraint that Directors encounter every session: the Retrieval and Assembly Engine's card budget, the Grading Sampling Rate, and the Briefing's card limit all exist to keep assemblies within a workable Context Window. The families.md Family 2 cross-cut identifies Context Window as "the next vocabulary frontier" and the "likely candidate for a coined product-level term." This is that coin.

## WHERE: Ecosystem

_Stub — links to: [[System - Retrieval and Assembly Engine]] (card budgets exist to fit within the Context Window), [[Economy-instance - Plan]] (the Plan tier determines maximum Context Window size), [[Standard - Grading Sampling Rate]] (the 20% sampling rate is partly a Context Window management decision), [[Role - Director]] (the Director manages their context window implicitly through how they use Alexandria)._

## WHY: Rationale

_Stub — owner-supplied. The Context Window is the hidden constraint that explains many of Alexandria's design decisions: card budgets in briefings, sampling rates in grading, the U-shaped attention ordering in context assembly, the five-section card structure (dense information, compact format). Every design choice that looks like "efficiency" is actually a Context Window management choice._

## WHEN: Timeline

_Stub — context window sizes have grown dramatically (4K → 8K → 32K → 200K tokens). Alexandria's design assumes 200K context windows are available for production use, but designs conservatively to work in smaller windows. Context Window as a first-class noun may be more or less important depending on how context window sizes evolve over Alexandria's lifetime._

## HOW: Specification

_Stub — the three axes of Context Window that Alexandria manages: (1) Budget — how many tokens are available; (2) Utilization — how much is consumed by different content types (system prompt, card content, conversation history, tool outputs); (3) Attention — where in the context window important information should be placed for the model to attend to it well (the U-shaped attention ordering hypothesis). Each axis has design implications._
