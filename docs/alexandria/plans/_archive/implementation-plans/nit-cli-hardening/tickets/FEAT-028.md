---
id: FEAT-028
title: "alxndr lint counts — design doc count verification"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker]
---

## Motivation

Design docs and skill files state specific counts ("22 knowledge areas", "16 card types"). When the underlying data changes, these prose claims become stale lies.

## Description

Implement `alxndr lint counts <path>` that scans key documentation files for numeric count claims and verifies them against the actual data. For example, if a doc says "22 knowledge areas," count the areas in initialize-engine.yaml and compare. Mismatch = warning.

## Context

From `skills/nit/sweeps.md` sweep 6: "Documents that state specific counts ('22 knowledge areas', '16 card types') — verify against reality. Mismatch = warning."

## Acceptance Criteria

- [ ] Scans design docs and skill files for numeric count claims
- [ ] Verifies claims against actual data sources (wizard config, type taxonomy, etc.)
- [ ] Mismatch produces warning-severity finding with expected vs actual
- [ ] Deterministic tests with fixture docs containing correct and incorrect counts

## Implementation Notes

Start with known count patterns: "N knowledge areas" (check initialize-engine.yaml), "N card types" (check KNOWN_TYPES set). Expand as more patterns are identified. Use regex to extract claimed counts from prose.
