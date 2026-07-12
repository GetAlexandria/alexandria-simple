---
id: FEAT-040
title: "Add conformance checking to alxndr lint"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [Capability - Linting]
---

## Motivation

Product-layer cards in governed domains must link to their constraining Standards via a "Conforms to:" link. Currently Nit checks this agentically. It's a boolean graph query: does the card have a conformance link? Does the target Standard exist?

## Description

Add a conformance check to `alxndr lint` that for each product-layer card:

1. Determines if the card is in a governed domain (per `reference.md` conformance obligations table)
2. If yes, checks that the card's WHERE section contains a `Conforms to:` wikilink
3. Verifies the linked Standard exists on disk

## Context

The conformance obligations table is in `docs/alexandria/reference.md`. The rubrics specify that missing conformance when obligated = C ceiling for WHERE grade. This check is structural, not qualitative — it's "does the link exist?" not "is the conformance meaningful?"

## Acceptance Criteria

- [ ] Lint identifies product-layer cards in governed domains
- [ ] Flags missing conformance links as warnings
- [ ] Verifies conformance link targets exist
- [ ] Test suite covers governed and ungoverned cards
- [ ] Integrates with existing lint output format

## Implementation Notes

The conformance obligations table in `reference.md` maps domains to Standards. Parse this table to build a lookup, then check each card in those domains. Could extend the existing L4 `layers` sweep or create a new check.
