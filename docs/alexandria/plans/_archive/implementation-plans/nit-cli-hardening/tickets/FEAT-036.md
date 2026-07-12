---
id: FEAT-036
title: "alxndr lint library — add terminology sweep across all cards"
outcome: O-5
tier: could
enabler: false
blocked-by: [FEAT-020]
blocks: []
cards: [Capability - Linting]
---

## Motivation

The library lint target (former sweep 5) is missing a terminology sweep across all cards. Individual card terminology checks (FEAT-034) catch per-line issues; this target catches library-wide inconsistency patterns.

## Description

Add to the library lint target: grep for known terminology variants across all cards in the library and report inconsistency clusters. For example, if 15 cards use "wikilink" and 3 use "wiki-link", report the cluster with counts and file locations.

## Context

From `skills/nit/sweeps.md` sweep 5: "Terminology sweep: grep for known terminology variants across all cards. Report inconsistency clusters."

## Acceptance Criteria

- [ ] Scans all cards for terminology variant pairs
- [ ] Reports clusters with variant counts and file locations
- [ ] Minority-form usage produces warning-severity findings
- [ ] Deterministic tests with fixture library containing mixed terminology

## Implementation Notes

Reuse the terminology variant list from FEAT-034 (lines target). The difference: lines checks individual cards, library checks aggregate patterns. The cluster report helps prioritize which variant to standardize.
