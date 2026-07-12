---
id: IMPL-007
title: "Skill: Steps 4-6 (gap analysis + ticket decomposition + dependency graph)"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-004, IMPL-006]
blocks: [IMPL-008]
cards: []
---

## Motivation

Steps 4-6 are where the plan materializes — gaps become tickets, decisions get resolved,
enablers are justified, and the dependency graph takes shape. This is the analytical core
of the skill, and it depends on both the DAG tool (for graph computation) and validated
Steps 1-3 (for the goal/outcomes foundation).

## Description

Implement Steps 4-6 of the implementation planning skill:

### Step 4: Gap Analysis & Decision Resolution

Compare goal (desired state) against context briefing (current state):
- Classify each gap as required (→ Must/Should/Could tickets) or presumptive
  (→ proposed as Should/Could or deferred)
- Present presumptive gaps to user for disposition
- Surface decisions inline — present options, ask user to choose
- Apply "imagine the refactoring" gut-check before creating enablers:
  "If we skip this spike and just build with approach A, how expensive
  would it be to refactor later?"
- Surface risks and assumptions → Risks and Assumptions table entries
- Track card updates as a running list

### Step 5: Ticket Decomposition

Break gaps into tickets following planning principles:
- **Vertical slicing** — smallest user-visible shippable value
- **End-to-end first** — thin path across all layers before deepening
- **Roller-skate staging** — propose simpler-first when features are large:
  "Can we deliver the value with a simpler version first?"
- **INVEST criteria** — independent, negotiable, valuable, estimable, small, testable
- Each ticket traces to an outcome, inherits tier (with possible override)
- Reference personas in ticket context when available

### Step 6: Dependency Graph

- Structure tickets as a DAG (enablers block dependents, technical ordering)
- Sequence for end-to-end first
- Call `bin/alxndr dag --validate` to verify the graph
- Plant re-planning triggers: every enabler completion is a trigger, plus
  any user-specified events

## Acceptance Criteria

- [ ] Gap analysis distinguishes required vs presumptive gaps
- [ ] Presumptive gaps presented to user for disposition
- [ ] Decisions surfaced and resolved inline during conversation
- [ ] "Imagine the refactoring" gut-check applied before creating enablers
- [ ] Risks and assumptions captured for release doc
- [ ] Tickets are vertically sliced (each delivers user-visible value)
- [ ] End-to-end first sequencing is the default
- [ ] Roller-skate alternatives proposed for large features
- [ ] Each ticket traces to an outcome with correct tier
- [ ] DAG tool validates the graph successfully
- [ ] Re-planning triggers planted for enabler completions
- [ ] Card updates tracked (not yet applied — that's Step 8)

## Implementation Notes

- This is where the DAG tool gets its first real use. The skill writes ticket files,
  calls `alxndr dag --validate`, and if it fails, fixes the issues.
- The "imagine the refactoring" gut-check is conversational — the skill proposes
  creating a spike, then immediately asks the user whether it's worth it.
- Roller-skate staging is also conversational — when the skill sees a large feature,
  it proposes the staged alternative. The user decides.
- Risks and assumptions are collected during the conversation and held for the release doc.
