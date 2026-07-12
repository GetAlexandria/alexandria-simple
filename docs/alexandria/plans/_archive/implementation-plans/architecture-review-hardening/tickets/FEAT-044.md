---
id: FEAT-044
title: "Fix terminology drift in docs/design/alexandria.md"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: []
cards: []
---

## Motivation

`docs/design/alexandria.md` (the genus index / Alexandria of Alexandria doc) still uses pre-migration terminology: "Zones" instead of "Domains", "Rooms" instead of "Sections", "Structures" instead of "Templates", "Overlays" instead of "Governance", "Aesthetics" instead of "Experience Goals", "Dynamics" instead of "Forces". This creates confusion when the active type taxonomy uses the current terms.

## Description

Update all terminology in `docs/design/alexandria.md` to match the current type vocabulary in `skills/conan/type-taxonomy.md`:

| Old Term | New Term |
|----------|----------|
| Zone | Domain |
| Room | Section |
| Structure | Template |
| Overlay | Governance |
| Aesthetic | Experience Goal |
| Dynamic | Force |

## Context

The `core/` directory (which had the same drift) was already deleted. This is the remaining file with old terminology. The terminology mapping is documented in `skills/conan/job-downstream-sync.md`.

## Acceptance Criteria

- [ ] Zero instances of old terminology (Zone/Room/Structure/Overlay/Aesthetic/Dynamic) used as type names in the file
- [ ] All examples and tables use current terminology
- [ ] Meaning preserved — only terminology changes, not content
- [ ] `alxndr lint` passes after changes

## Implementation Notes

Mostly find-and-replace but be careful with "Zone" — the three-zone model (program zone, corporate zone, market zone) is a different concept from the card type formerly called "Zone." Only replace "Zone" when it refers to the card type, not the zone model.
