---
id: FEAT-079
title: "Unify knowledge-area → card-type mapping in typed code"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-076]
blocks: []
cards: [Artifact - Type Taxonomy, Artifact - Noun Vocabulary]
---

## Motivation

Three separate vocabularies exist today: the initialize engine's 22 knowledge areas, Sam's 18 card types, Bridget's 15 retrieval profiles. They drift; several areas have no card type and several card types have no area. Scratchpad lines 62 and 67 document the problem. This ticket lands one canonical knowledge-area → card-type map in typed code, read by all three subsystems.

## Description

Design and land a single mapping data structure (TypeScript module) that encodes area → card-type relationships. Initialize engine, scoreboard matchers, and Bridget's retrieval profiles consume it. Surface missing-area and orphan-type warnings at build time or startup.

## Context

See scratchpad `docs/alexandria/updates/2026-04-10-architecture-review-scratchpad.md` lines 62-67. Affects `packages/alexandria-plugin/docs/initialize/`, scoreboard matchers, Bridget's profile definitions.

## Acceptance Criteria

- [ ] A single typed module exports the canonical area → type map.
- [ ] Scoreboard matchers, initialize engine, and Bridget's profiles read from that module.
- [ ] Orphan areas (no type) and orphan types (no area) are either mapped or explicitly marked orphan with a rationale.
- [ ] Tests cover: map completeness, no-drift assertion.

## Implementation Notes

This is structural and can grow — orphan handling should produce a deliberate list (e.g., "Market Requirements is a source-only area, no card type") rather than silent misalignment. Consider exposing a CLI command like `ax taxonomy check` that prints the state.
