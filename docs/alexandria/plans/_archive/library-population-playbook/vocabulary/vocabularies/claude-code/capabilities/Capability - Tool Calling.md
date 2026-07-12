---
type: Capability
prefLabel: Tool Calling
altLabels:
  - Tool use
  - Tool invocation
  - Function calling
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Tool Calling

## WHAT: Definition

_Stub — a single Tool invocation within the Agent loop. The Agent decides to call a Tool, provides inputs, waits for the result, and incorporates the result into its next reasoning step. Tool Calling is the atomic unit of the Agent's interaction with the outside world: it cannot read a file, run a command, or search the codebase without calling a Tool. Each Tool Call is observable in the Stream as a visible action (e.g., "Reading file src/index.ts...")._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Tool]] (the Tool being called), [[System - Tool Dispatcher]] (the runtime that executes the call), [[Pattern - Tool-Use Loop]] (the repeated calling pattern), [[Role - Agent]] (the Agent calls Tools), [[Economy-instance - Context Window]] (Tool outputs consume Context Window budget)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the input/output schema per Tool, how the Agent signals a Tool call (structured JSON to the harness), permission model (which Tools require User confirmation), and how Tool call failures are handled._
