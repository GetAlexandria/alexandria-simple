---
id: FEAT-031
title: "alxndr health-check — structured JSON output for Conan"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-024, FEAT-025, FEAT-026, FEAT-027, FEAT-028, FEAT-029, FEAT-030]
blocks: [FEAT-032]
cards: [Capability - Health Check, Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]
---

## Motivation

Conan's health-check assessment uses a six-step internal procedure. The earlier inventory and Standards checks have a mechanical substrate that the CLI can pre-compute. `alxndr health-check` runs all lint targets and organizes the output into a JSON structure that maps directly to those assessment inputs, so Conan can skip the counting and focus on judgment.

## Description

Implement `alxndr health-check <path>` as a top-level subcommand that:
1. Runs all lint targets internally
2. Organizes findings into a JSON structure keyed by Conan's health-check phases
3. Includes inventory data (expected vs actual cards by type), standards structural sub-checks (link counts, anti-example presence), and library metrics

The JSON schema should include:
- `inventory`: expected cards, actual cards, missing, unexpected, by-type breakdown
- `standards_health`: for each Standard card, mechanical pass/fail on WHY links, HOW spec presence, anti-example presence, conforming cards
- `metrics`: total cards, type distribution, layer distribution, link density, orphan count, broken links
- `findings`: all lint findings grouped by target

## Context

This is the bridge between the lint CLI and Conan's health-check skill. The JSON output is consumed by `job-health-check.md` in the next ticket. See [[Capability - Health Check]] and the health-check assessment-step definitions in `skills/conan/job-health-check.md`.

## Acceptance Criteria

- [ ] `alxndr health-check <path>` emits valid JSON to stdout
- [ ] JSON includes `inventory`, `standards_health`, `metrics`, and `findings` sections
- [ ] Exit code 0 on success, 1 on internal error (not on findings — findings are data, not failures)
- [ ] Deterministic tests verify JSON schema against a fixture library
- [ ] Output is stable (deterministic ordering for consistent diffs)

## Implementation Notes

Internally, this runs all lint sweep functions plus additional aggregation for inventory and standards data. The `Library` class provides most of the raw data. The health-check command composes lint results into the assessment-oriented schema.
