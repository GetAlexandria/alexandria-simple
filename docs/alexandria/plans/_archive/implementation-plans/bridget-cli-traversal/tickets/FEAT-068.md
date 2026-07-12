---
id: FEAT-068
title: "Document task-modifier to CLI-flag mapping table in task-modifiers.md"
outcome: O-3
tier: should
enabler: false
blocked-by: []
blocks: [FEAT-069]
cards: [Capability - Context Assembly, Agent - Bridget the Briefer]
---

## Motivation

The context briefing flagged this as the highest-risk gap for the migration: the skill currently describes traversal behaviors in prose ("architecture change → max upstream + lateral") but doesn't say which `alxndr retrieve` flags those behaviors map to. If FEAT-069 picks the wrong flag values at runtime, criterion 7 will regress with no obvious diagnosis. Producing the mapping as a Day-1 artifact converts an implicit choice into a reviewable table.

## Description

Add (or update) a section in `skills/context-briefing/task-modifiers.md` containing an explicit table that maps every task type / modifier combination Bridget classifies into the corresponding `--profile` and `--complexity` values for `alxndr retrieve`. Reference this table from `protocol.md` at the point where step 6 will invoke the CLI.

## Context

- `skills/context-briefing/task-modifiers.md` already enumerates modifiers in prose.
- `skills/context-briefing/retrieval-profiles.md` defines the profiles that the CLI loads.
- `src/tools/retrieve.ts` is the CLI implementation; its `--profile` and `--complexity` flags are the fixed interface.
- Anti-pattern (per briefing): "baking task modifier mappings silently into flag values" at the call site rather than documenting them.

## Acceptance Criteria

```gherkin
Feature: Task-modifier to CLI-flag mapping

  Scenario: Mapping table is complete
    Given a reader knows a task type and modifier
    When they consult the mapping table in task-modifiers.md
    Then they can determine the exact `--profile` and `--complexity` values without runtime judgment

  Scenario: Mapping is referenced from protocol
    Given the protocol describes invoking `alxndr retrieve`
    When the reader follows the protocol
    Then the protocol points back to the mapping table for flag values

  Scenario: Mapping covers every documented task type
    Given the existing list of task types and modifiers in task-modifiers.md
    When the table is reviewed
    Then no task type / modifier combination is missing
```

## Implementation Notes

Keep the table inline in `task-modifiers.md` rather than introducing a new skill file. Preserve the existing prose; the table augments it. If a task type / modifier combination has no clean CLI mapping, log that as a feedback-queue entry and propose the missing knob — do not invent a flag value to hide the gap.
