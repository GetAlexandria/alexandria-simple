---
id: IMPL-000
title: "Update context library with implementation planning decisions"
outcome: Context library reflects current product knowledge
tier: must
enabler: false
blocked-by: []
blocks: []
cards: []
---

## Motivation

The Release 2 planning process — including dialogue over 24 Fowler-sourced
recommendations — produced substantial new product knowledge. This knowledge
currently lives in plan docs and research recommendations, not in the context
library where Conan can surface it in future briefings.

This is exactly the gap the implementation planning skill is designed to fill:
the PATCH step that updates cards after planning. Since the skill doesn't exist
yet, we do it manually.

## Description

Create or update context library cards for concepts introduced during Release 2
planning:

**New cards:**
- System - Implementation Planning Engine (the skill's core: goal → outcomes → tickets)
- System - DAG Computation Tool (deterministic graph analysis, bin/alxndr dag)
- Capability - Implementation Planning (goal-driven planning conversations)
- Artifact - Success Outcome (first-class planning object with tier + validation criteria)
- Artifact - Release Doc (point-in-time plan summary)
- Artifact - Scope Tier (Must/Should/Could classification)
- Artifact - Risks and Assumptions Table
- Component - Re-planning Trigger (gates for /revise-plan)
- Agent - Bob the Builder (future: codebase assessment + technical spikes)

**New principles:**
- Principle - End-to-End First (thin path across all layers before deepening)
- Principle - Roller-Skate Staging (deliver value with simpler implementation first)
- Principle - Imagine the Refactoring (gut-check before creating enablers)
- Principle - Plans Are Instruments, Not Contracts (scope flexes, learning is the goal)

**New decisions:**
- Decision: No special ticket types (just tickets + enablers)
- Decision: Decisions resolved inline, not deferred as tickets
- Decision: Card updates automatic after plan approval
- Decision: DAG computation must be software, not LLM
- Decision: Markdown intermediate format with adapter skills for trackers
- Decision: Outcomes as first-class objects (own files, own directory)
- Decision: Scope tiers at outcome level, inherited by tickets
- Decision: Required vs presumptive gap classification feeds scope tiers

**New anti-patterns:**
- Anti-Pattern: Fixed Scope Plans (treating ticket set as committed, not negotiable)
- Anti-Pattern: Horizontal Slicing (DB layer ticket, then API ticket, then UI ticket)

**Decisions deferred (record as open/future):**
- Capacity envelope + scope negotiation (needs team context)
- Estimation (needs team context)
- Hypothesis/bet-driven planning (future planning mode)
- Is/IsNot/Does/DoesNot structured scope (future enhancement)

**Update existing cards:**
- Artifact - Product Roadmap — note implementation planning as the skill that
  breaks roadmap items into actionable tickets
- System - Gap Analysis Engine — note relationship to implementation planning
  (wizard gap analysis identifies knowledge gaps; implementation planning
  identifies product/feature gaps)
- Agent - Conan the Librarian — note that implementation planning consumes
  Conan's context briefings as primary input

## Acceptance Criteria

- [ ] New cards created following library conventions (WHAT/WHERE/WHY/WHEN/HOW)
- [ ] Cards use wikilinks to reference related cards
- [ ] Updated cards reflect new knowledge without losing existing content
- [ ] Decisions recorded with options considered and rationale
- [ ] Anti-patterns reference the Fowler articles that informed them
- [ ] Deferred decisions marked as open/future with context for when to revisit
- [ ] Principles reference the research recommendations doc for provenance
