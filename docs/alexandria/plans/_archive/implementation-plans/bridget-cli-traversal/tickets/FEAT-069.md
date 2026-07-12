---
id: FEAT-069
title: "Wire Bridget step 6 to alxndr retrieve and pass eval gate"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-067, FEAT-068]
blocks: []
cards: [Agent - Bridget the Briefer, Capability - Context Assembly, Principle - Agentic-Deterministic-Agentic Pattern, System - Eval Harness, Principle - Measure Before Promoting]
---

## Motivation

This ticket delivers the migration: replace Bridget's manual hop-by-hop wikilink walk with a single deterministic CLI call, and prove it doesn't degrade quality. It satisfies both must outcomes (O-1: the wiring; O-2: the eval gate). The work is one ticket because the implementer needs to iterate the wiring against the eval until it passes — splitting "wire" and "verify" would force a green eval before the wiring is allowed to be tuned.

## Description

Update `skills/context-briefing/protocol.md` step 6 so Bridget calls `alxndr retrieve` (via Bash) using the flag values from the FEAT-068 mapping table. Use the CLI's position fields (`beginning`, `middle`, `end`) directly for U-shape ordering rather than re-implementing the ordering. Define the fallback rule for missing mandatory categories: agentic discretion is allowed, every fallback decision must be logged to `provenance-log.md` with the category that was missing, the action taken, and why. Update `agents/bridget.md` to reflect the new procedure. Do not move task classification, profile selection, seed identification, gap detection, or narrative assembly out of the agentic layers. Iterate the wiring against `bin/alexandria-eval run bridget/assembly` and `bin/alexandria-eval compare bridget/assembly` until scores hold or improve vs. the FEAT-067 baseline. Check in the new baseline alongside the wiring change.

## Context

- `Principle - Agentic-Deterministic-Agentic Pattern` is the architectural rationale; the three-layer boundary must remain identifiable after this change.
- `Principle - Serve Incomplete Libraries Honestly` still governs gap detection; the CLI returns a card set, but Bridget owns the Gap Manifest.
- `Principle - Attention Is a Resource with a Shape` is honored by using the CLI's existing position fields for U-shape ordering — do not re-rank.
- Anti-patterns to avoid: double traversal (CLI + manual wikilink walk in the same pass), eval-at-the-end (only running evals after the PR is up), treating criterion 7 regressions as noise, and silently patching missing knobs in the skill instead of surfacing them as a CLI config follow-on.

## Acceptance Criteria

```gherkin
Feature: Bridget step 6 wired to alxndr retrieve

  Scenario: Mechanical traversal calls the CLI
    Given a classified task with a chosen profile and complexity
    When Bridget executes step 6
    Then `alxndr retrieve` is invoked with flag values from the FEAT-068 mapping
    And no manual wikilink hop expansion occurs in the same pass

  Scenario: U-shape ordering uses CLI position fields
    Given `alxndr retrieve` returns cards with position fields
    When Bridget assembles the briefing
    Then ordering reflects the CLI's `beginning`, `middle`, `end` fields directly

  Scenario: Missing mandatory category triggers logged fallback
    Given the CLI result is missing a mandatory category
    When Bridget exercises agentic discretion to find it
    Then `provenance-log.md` records the missing category, the fallback action, and the reason

  Scenario: Eval gate passes
    Given the baseline from FEAT-067 is the comparison anchor
    When `bin/alexandria-eval compare bridget/assembly` runs against the wired Bridget
    Then scores hold or improve, including criterion 7 (retrieval profile adherence)

  Scenario: Three-layer boundary is preserved
    Given a reader inspects the updated protocol and agent card
    When they look for the agentic outer, deterministic middle, and agentic inner layers
    Then each layer is identifiable and the CLI sits squarely in the middle

  Scenario: Missing CLI knob surfaces as a follow-on, not a skill patch
    Given a regression is traced to a missing CLI profile knob
    When the implementer responds
    Then a root-cause note and a follow-on plan or issue are produced against the CLI
    And the skill is not patched to re-introduce agentic traversal as a workaround
```

## Implementation Notes

Bridget already has Bash in her tool surface — no agent-frontmatter change needed. Keep the epistemic hedge in `Capability - Context Assembly` ("BUILD TO LEARN") intact; CLI traversal is also pre-validation. Iterate against the eval; expect at least one regression-and-fix cycle before scores settle. If criterion 7 stays red after a real attempt to identify the missing knob, stop and queue the follow-on rather than chasing it through skill prose.
