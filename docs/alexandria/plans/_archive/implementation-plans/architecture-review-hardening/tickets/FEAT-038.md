---
id: FEAT-038
title: "Add briefing compliance check to alxndr lint L6"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [System - Retrieval and Assembly Engine, Capability - Linting]
---

## Motivation

After Bridget assembles a context briefing, Nit currently checks compliance agentically: are mandatory categories from the retrieval profile present? Is the card budget met? Is provenance logged? All of these are boolean/countable checks that should be software.

## Description

Add a `briefings` check to `alxndr lint` L6 that validates a CONTEXT_BRIEFING.md against the retrieval profile that produced it:

- Mandatory categories from the profile are present in the briefing
- Card budget not exceeded
- All referenced cards exist on disk
- Provenance log entry exists for this assembly (if provenance-log file exists)

## Context

Retrieval profiles are defined in `skills/context-briefing/retrieval-profiles.md`. The CONTEXT_BRIEFING.md format is defined in `agents/bridget.md`. The provenance schema is in `skills/context-briefing/provenance-schema.md`.

## Acceptance Criteria

- [ ] `alxndr lint briefings <briefing-path>` validates briefing compliance
- [ ] Checks mandatory categories, card budget, card existence, provenance presence
- [ ] Test suite covers compliant and non-compliant briefings
- [ ] Integrates with existing lint output format

## Implementation Notes

The briefing file needs to be parsed for card references (wikilinks). The retrieval profile that was used may need to be inferred or stored in the briefing/provenance. Consider adding a `profile:` field to the briefing frontmatter if one doesn't exist.
