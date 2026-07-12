---
type: Pattern
prefLabel: Autonomy Ladder
altLabels:
  - Autonomy Tiers
  - Four-Tier Ladder
  - Escalation Tiers
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/tab/overview
  - https://docs.cursor.com/inline-edit
  - https://docs.cursor.com/composer
  - https://docs.cursor.com/agent
---

# Autonomy Ladder

## WHAT: Definition

_Stub — Cursor's signature organizing pattern: a four-tier escalation of AI involvement from minimal assistance to full autonomous loop. The four tiers, in ascending order of autonomy: Tab → Inline Edit → Composer → Agent. Each tier is named for the Developer's felt encounter during that interaction, not for the orchestrator's internal state. This is Cursor's defining contribution to agentic-software vocabulary and the reason `families.md` names Cursor as the canonical positive exemplar of MDA-inversion-avoided in Family 2._

_Each tier increases both scope and autonomy. Tab (tier 1): the AI suggests the next token(s) at the cursor; the Developer accepts with one keystroke; scope is the current insertion point; the Developer remains the author of every decision. Inline Edit (tier 2): the AI proposes a rewrite of a selected region based on a natural-language instruction; the Developer reviews the diff and applies or rejects; scope is the selection. Composer (tier 3): the AI proposes a coordinated change across multiple files based on a natural-language instruction; the Developer reviews the full diff before applying; scope is the codebase. Agent (tier 4): the AI runs a plan-act-observe loop, calling tools, writing files, running commands, and iterating until the stated goal is met; the Developer supervises rather than authors; scope is unlimited and the loop self-directs. The ladder makes autonomy a first-class named dimension of the product rather than an engineering property hidden behind a single "AI" label._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Tab]] (tier 1), [[Surface - Inline Edit]] (tier 2), [[Surface - Composer]] (tier 3), [[Surface - Agent Surface]] (tier 4), [[Pattern - Apply-and-Review]] (the review pattern used at tiers 2, 3, and 4), per the families.md survey (names Cursor's four-tier ladder as the exemplar for clean autonomy-tier surface naming)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the escalation gestures between tiers (when does a Developer naturally step up from Tab to Inline Edit to Composer to Agent), the overlap zones (cases where multiple tiers could apply), and the decision rubric Cursor's documentation recommends for choosing a tier._
