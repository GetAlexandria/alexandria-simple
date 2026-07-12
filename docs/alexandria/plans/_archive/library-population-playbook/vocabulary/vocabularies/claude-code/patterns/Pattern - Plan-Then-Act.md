---
type: Pattern
prefLabel: Plan-Then-Act
altLabels:
  - Plan then execute
  - Think before acting
  - Plan-first discipline
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Plan-Then-Act

## WHAT: Definition

_Stub — the discipline of separating the Agent's reasoning phase from its execution phase, with an explicit User gate between them. The Agent reads the Workspace and produces a plan; the User reviews it; the User approves before any file is touched or command is run. The plan is not merely "internal thinking" — it is a surfaced artifact the User reads, critiques, and may modify before execution begins._

_Plan-Then-Act is Claude Code's named instantiation of the planner-executor pattern from families.md, but with a distinctive twist: the User is not just a passive approver but an active collaborator who can redirect the plan before execution. This places Claude Code closer to the "human-in-the-loop" shape than to a fully autonomous planner. The pattern is user-opt-in — the User enters Plan mode to use it; the default is direct execution. This is the correct default for experienced users who trust the Agent; Plan-Then-Act is the discipline for uncertain or high-stakes changes._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Plan Mode]] (the user-facing implementation of this pattern), [[Capability - Plan-and-Execute]] (the capability that operationalizes the pattern), [[Entity - Checkpoint]] (Checkpoints are best created at the plan-to-execution transition), [[Pattern - Tool-Use Loop]] (execution phase uses the Tool-Use Loop)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: when to use Plan-Then-Act vs direct execution (risk surface heuristics), how to write a good plan prompt, what makes a plan artifact complete enough to approve, and how to handle plan deviations during execution._
