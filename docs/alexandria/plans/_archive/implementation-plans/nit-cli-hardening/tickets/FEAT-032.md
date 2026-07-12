---
id: FEAT-032
title: "Refactor job-health-check.md to consume alxndr health-check output"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-024, FEAT-031]
blocks: []
cards: [Agent - Conan the Librarian, Capability - Health Check, Principle - Structural Quality Before Functional Quality]
---

## Motivation

Conan currently does all health-check work via LLM, including mechanical counting that the CLI now handles. This refactor tells Conan to call the CLI first and use its output, reserving LLM budget for judgment-only phases.

## Description

Update `skills/conan/job-health-check.md` to add a "CLI Pre-flight" section before the assessment steps begin:

1. Run `alxndr health-check <library-path>` and capture JSON output
2. Use the `inventory` section for inventory reconciliation — data is pre-computed
3. Use the `standards_health` section for Standards structural sub-checks — only apply judgment to content quality checks
4. Use the `metrics` section as the basis for later sample sizing and selection
5. Document graceful degradation: if `alxndr` is not available, Conan falls back to doing the mechanical work himself

## Context

This is a skill file edit, not a code change. The health-check skill currently has no eval coverage, so deterministic test coverage for the CLI output is the primary quality gate.

## Acceptance Criteria

- [ ] `skills/conan/job-health-check.md` includes a "CLI Pre-flight" section
- [ ] Section specifies exact CLI command and JSON fields to read
- [ ] Inventory reconciliation instructions reference CLI output instead of manual counting
- [ ] Standards structural checks reference CLI output for structural sub-checks
- [ ] Graceful degradation path documented
- [ ] Skill file passes markdownlint

## Implementation Notes

Keep the current six-step assessment procedure inside `job-health-check.md` distinct from the unified maintenance play in the playbook. The pre-flight is an addition, not a replacement. Each assessment step that benefits from CLI data should say "read `<field>` from CLI output" with a fallback "if CLI unavailable, perform manually."
