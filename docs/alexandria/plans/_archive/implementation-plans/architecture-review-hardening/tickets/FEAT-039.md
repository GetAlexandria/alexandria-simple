---
id: FEAT-039
title: "Add design doc count verification to alxndr lint L6"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [Capability - Linting]
---

## Motivation

Documents that state specific counts ("22 knowledge areas", "16 card types") can drift from reality as the library evolves. Currently Nit verifies these agentically. It's a simple count comparison that should be software.

## Description

Add a `counts` check to `alxndr lint` L6 that finds numeric count claims in designated docs and verifies them against reality:

- Scan for patterns like "N knowledge areas", "N card types", "N agents"
- Count the actual items on disk
- Flag mismatches

## Context

Primary targets: `docs/design/alexandria.md` (genus index, type counts), `docs/initialize/` (pool sizes, knowledge area counts), any doc with explicit numeric claims about library structure.

## Acceptance Criteria

- [ ] `alxndr lint counts <repo-path>` finds and verifies numeric claims
- [ ] Covers knowledge area counts, card type counts, agent counts at minimum
- [ ] Test suite covers matching and mismatching counts
- [ ] Integrates with existing lint output format

## Implementation Notes

Consider a simple regex approach: find lines matching patterns like `\d+ (knowledge areas|card types|agents|...)` in known doc files, extract the number, count the reality, compare. Start with a hardcoded list of known count patterns rather than trying to find all numeric claims generically.
