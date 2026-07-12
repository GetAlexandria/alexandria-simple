---
id: FEAT-097
title: "Add area-aware ax cards list reader and filter"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-096]
blocks: [FEAT-103]
cards: [Capability - Inventory, System - Knowledge Graph, Section - Card Repository]
---

## Motivation

FEAT-096 intentionally shipped only the inventory fields that were already
real: name, path, type, and layer. Area binding is still valuable, but it must
avoid the parser-only trap: the code can learn to read `area:`, but live
non-empty area behavior is not complete until FEAT-103 populates cards through
the Conan/Sam loop.

## Description

Extend the FEAT-096 inventory command with area support:

- Add `area?: string` to `CardFrontmatter`.
- Normalize numeric YAML values such as `area: 2.1` to string IDs.
- Add `area` to `ax cards list --json` output.
- Add `--area <A>` filter.
- Keep fixture tests non-empty so the reader/filter behavior is proven before
  the live library is populated.
- Coordinate with FEAT-103 so Sam/Conan populate `area:` on library cards.

Existing filters from FEAT-096 (`--type`, `--layer`) continue to compose via
AND. `--area` is also case-insensitive for consistency, though current area IDs
are numeric strings.

## Context

Reference cards:

- `[[Capability - Inventory]]` — the WHEN section will be updated to record the CLI surface introduction
- `[[System - Knowledge Graph]]` — the data the CLI walks
- `[[Section - Card Repository]]` — the filesystem location the CLI queries

Anti-pattern: do not treat this as complete end-to-end area binding by itself.
This ticket creates the reader contract; FEAT-103 supplies the writer/population
half. The live library may return zero rows for `--area` until FEAT-103 lands.

## Acceptance Criteria

- [ ] `CardFrontmatter` includes typed `area?: string`
- [ ] Numeric `area:` values parse as string IDs
- [ ] `ax cards list --json` includes `area`
- [ ] `ax cards list --area 1.1` returns only cards with `area: 1.1` in frontmatter
- [ ] Filters compose: `ax cards list --type Standard --layer rationale --area 1.1` returns the intersection
- [ ] Black-box integration test exercises the area filter against a fixture library with at least one matching card
- [ ] Live `docs/alexandria/library/` parses without errors; non-empty live `--area` assertions wait for FEAT-103
- [ ] `bun run check` passes (lint, types, formatting)

## Implementation Notes

Use only frontmatter `area:` for the filter. Do not fall back to matcher tables
inside `ax cards list`; matcher fallback belongs in scoreboard migration logic
until FEAT-103 finishes.

This is deliberately the reader/filter half of the area-binding slice. FEAT-103
is the Sam/Conan population half. Do not close the area-binding story as
user-visible until FEAT-103 has populated the live library.
