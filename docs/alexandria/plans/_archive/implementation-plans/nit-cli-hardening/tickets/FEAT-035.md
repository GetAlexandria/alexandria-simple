---
id: FEAT-035
title: "alxndr lint layers — add manifest reconciliation checks"
outcome: O-5
tier: could
enabler: false
blocked-by: [FEAT-020]
blocks: []
cards: [Capability - Linting]
---

## Motivation

The layers lint target (former sweep 4) is missing manifest reconciliation checks defined in `sweeps.md`: fidelity, cross-reference completeness, conformance map accuracy, and enumeration decision drift.

## Description

Add to the layers lint target (when an inventory manifest exists):
- **Manifest fidelity**: Cards in manifest but not on disk = warning. Cards on disk but not in manifest = note.
- **Cross-reference completeness**: For each card in the manifest's cross-references table, verify the card's WHERE section contains the claimed dependency wikilinks.
- **Conformance map accuracy**: For each card in the manifest's conformance map, verify `Conforms to:` links match claimed standards.
- **Enumeration decision drift**: For each enumeration decision, verify the count matches reality.

## Context

These checks depend on an inventory manifest existing. If no manifest, skip gracefully.

## Acceptance Criteria

- [ ] Manifest fidelity check: missing-on-disk = warning, missing-in-manifest = note
- [ ] Cross-reference completeness check compares manifest claims to card WHERE sections
- [ ] Conformance map check verifies `Conforms to:` links
- [ ] Enumeration drift check counts actual cards vs manifest claims
- [ ] Graceful skip when no manifest exists
- [ ] Deterministic tests with fixture manifest

## Implementation Notes

The manifest format may vary. Check what `conan` produces as inventory output to determine the expected structure.
