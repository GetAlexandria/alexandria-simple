---
type: Pattern
prefLabel: Tool-Use Loop
altLabels:
  - ReAct loop
  - Think-call-observe loop
  - Agent loop
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Tool-Use Loop

## WHAT: Definition

_Stub — the repeated think → tool call → observe → think cycle that is the core of the Agent's execution. The Agent reasons about what it knows, decides which Tool to call next, calls the Tool, receives the result, incorporates the result into its reasoning, and repeats. The loop continues until the task is complete, the Agent determines it cannot proceed, or the User interrupts. This is the operational pattern underlying every Claude Code task, whether or not Plan-Then-Act is used._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Tool Calling]] (the atomic step in each loop iteration), [[Role - Agent]] (the Agent runs the loop), [[Economy-instance - Context Window]] (each loop iteration consumes Context Window budget — tool results accumulate), [[Pattern - Plan-Then-Act]] (Plan-Then-Act wraps the Tool-Use Loop with a pre-execution planning phase), [[System - Tool Dispatcher]] (the system that executes each Tool call in the loop)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: loop termination conditions, how the Agent signals completion vs failure, the context-window pressure that builds with each iteration, and the relationship between this loop and the ReAct paper (Yao et al. 2022)._
