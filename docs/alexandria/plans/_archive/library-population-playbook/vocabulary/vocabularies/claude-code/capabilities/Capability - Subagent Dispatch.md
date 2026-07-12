---
type: Capability
prefLabel: Subagent Dispatch
altLabels:
  - Spawning a subagent
  - Agent delegation
  - Sub-agent invocation
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/sub-agents
---

# Subagent Dispatch

## WHAT: Definition

_Stub — the act of the main Agent delegating a bounded task to a separately-context-windowed Subagent. The main Agent identifies a task that benefits from isolation (complexity, context-window budget conservation, parallelism) and dispatches it to a Subagent with a fresh context window. Subagent Dispatch is a capability of the Agent, not of the User — the User does not dispatch Subagents directly; they trust the main Agent to do so when appropriate._

## WHERE: Ecosystem

_Stub — links to: [[Role - Subagent]] (the agent being dispatched), [[Role - Agent]] (the agent doing the dispatching), [[Pattern - Subagent Delegation]] (the design pattern this capability implements), [[Economy-instance - Context Window]] (each dispatched Subagent gets its own, separate Context Window), [[Economy-instance - Token Budget]] (Subagent Dispatch increases total token consumption)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the main Agent specifies the Subagent's task, what context the Subagent receives, how results are passed back, whether multiple Subagents can run in parallel, and the nesting depth limits (can a Subagent dispatch further Subagents?)._
