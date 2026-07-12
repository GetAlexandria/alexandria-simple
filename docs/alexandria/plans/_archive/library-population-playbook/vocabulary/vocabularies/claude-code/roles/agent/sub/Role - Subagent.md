---
type: Role
prefLabel: Subagent
altLabels:
  - Sub-agent
  - Child agent
  - Delegated agent
category: [Roles]
subcategory: [agent, sub]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/sub-agents
---

# Subagent

## WHAT: Definition

_Stub — a separately-context-windowed agent that the main Agent dispatches to execute a bounded task. The Subagent gets its own Context Window, its own Tool access, and runs its assigned task to completion before returning results to the dispatching Agent. Because the Subagent has a fresh context window, it is not burdened by the main Agent's accumulated conversation history — this is the primary reason to dispatch a Subagent rather than having the main Agent do the work inline._

_How Subagent differs from Tool: A Tool is atomic — a single function call (read a file, run a command, search a codebase). A Subagent is an agent loop — it reasons, calls multiple Tools, observes results, and reasons again. A Tool is a capability; a Subagent is an independent actor with its own context and its own reasoning loop. How Subagent differs from Skill: A Skill is a packaged workflow with instructions invoked by the User via a slash command. A Subagent is dispatched programmatically by the main Agent, not by the User, and it runs in a separate context window rather than within the main Agent's loop. A Skill executes within the main Agent's context; a Subagent gets its own._

## WHERE: Ecosystem

_Stub — links to: [[Role - Agent]] (the agent that dispatches this Subagent), [[Entity - Tool]] (the capabilities the Subagent can call), [[Economy-instance - Context Window]] (each Subagent has its own, separate from the main Agent's), [[Capability - Subagent Dispatch]] (the act of dispatching), [[Pattern - Subagent Delegation]] (the design pattern)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the main Agent passes task context to the Subagent, how results are returned, whether Subagents can dispatch further Subagents, and the context-window isolation guarantees._
