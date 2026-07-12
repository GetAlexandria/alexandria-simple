---
id: FEAT-030
title: "alxndr lint briefings — briefing compliance checks"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker]
---

## Motivation

After Bridget assembles a context briefing, the output should meet structural requirements: mandatory categories present, card budget respected, provenance logged, all referenced cards existing. These are all countable checks.

## Description

Implement `alxndr lint briefings <path>` that scans CONTEXT_BRIEFING.md files in implementation plan directories and verifies:
- Mandatory categories from retrieval profile are present in the briefing
- Card budget is met (not exceeded)
- Provenance log exists and is populated
- All card names referenced in the briefing resolve to actual library cards

Compliance failure = warning.

## Context

From `skills/nit/sweeps.md` sweep 6: "After Bridget assembles, verify: mandatory categories present, card budget met, provenance logged, all referenced cards exist."

## Acceptance Criteria

- [ ] Scans CONTEXT_BRIEFING.md files for structural compliance
- [ ] Checks mandatory briefing categories are present
- [ ] Checks card count against budget
- [ ] Checks provenance log exists
- [ ] Checks all referenced card names resolve
- [ ] Compliance failures produce warning-severity findings
- [ ] Deterministic tests with compliant and non-compliant fixture briefings

## Implementation Notes

Briefings are in `docs/alexandria/implementation-plans/*/CONTEXT_BRIEFING.md`. Parse the briefing structure, extract card references (wikilinks), and verify against the library. Card budget and mandatory categories may need to be read from retrieval profile config.
