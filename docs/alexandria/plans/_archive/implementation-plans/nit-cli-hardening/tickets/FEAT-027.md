---
id: FEAT-027
title: "alxndr lint wizard — wizard arithmetic verification"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker]
---

## Motivation

The wizard configuration has pool sizes that must total correctly per mode. Manual edits can introduce arithmetic errors that silently break tier assignments.

## Description

Implement `alxndr lint wizard <path>` that reads `alexandria-config.json` and `docs/initialize/initialize-engine.yaml`, verifies pool size arithmetic (total areas = sum of tier assignments), and checks configuration table counts match. Mismatch = critical.

## Context

From `skills/nit/sweeps.md` sweep 6: "Pool sizes must total correctly (mode-specific counts). Count assignments vs. expected per configuration table. Mismatch = critical."

## Acceptance Criteria

- [ ] Reads alexandria-config.json and initialize-engine.yaml
- [ ] Verifies pool_size matches sum of distribution values
- [ ] Verifies area count matches pool_size
- [ ] Arithmetic mismatch produces critical-severity finding
- [ ] Deterministic tests with valid and invalid fixture configs

## Implementation Notes

Parse JSON and YAML, sum tier counts, compare. The existing `tests/qa-initialize.test.ts` may already cover some of this — check for overlap and avoid duplication.
