---
type: Capability
prefLabel: Plan-and-Execute
altLabels:
  - Plan then act
  - Think then do
  - Planning then execution
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Plan-and-Execute

## WHAT: Definition

_Stub — the two-phase capability flow where the Agent first produces a plan (in Plan mode) and then, upon User approval, executes it. Phase one: the Agent reads the Workspace and reasons about the task, producing a written plan with no side-effects. Phase two: the User reviews and approves the plan, then the Agent executes it via Tool calls. The two phases are separated by an explicit User gate — the Agent cannot self-transition from planning to execution._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Plan Mode]] (the surface where phase one occurs), [[Pattern - Plan-Then-Act]] (the pattern this capability implements), [[Role - User]] (the User approves the transition between phases), [[Role - Agent]] (the Agent executes both phases), [[Entity - Checkpoint]] (Checkpoints are typically created before execution begins)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the User enters Plan mode, what the plan artifact looks like, the approval gesture for transitioning to execution, and whether the User can modify the plan before approving it._
