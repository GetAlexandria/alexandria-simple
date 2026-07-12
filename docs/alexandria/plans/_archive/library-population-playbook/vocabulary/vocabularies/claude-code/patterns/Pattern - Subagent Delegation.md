---
type: Pattern
prefLabel: Subagent Delegation
altLabels:
  - Task delegation
  - Context isolation
  - Fresh-context dispatch
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/sub-agents
---

# Subagent Delegation

## WHAT: Definition

_Stub — the design pattern of dispatching bounded tasks to fresh-context Subagents rather than executing them inline in the main Agent's loop. The main Agent identifies a task that is well-scoped, requires deep focus, or would pollute the main context window with irrelevant detail — and delegates it to a Subagent. The Subagent returns a result; the main Agent incorporates it and continues. The key discipline: the delegated task should be bounded enough that the Subagent can complete it with only the context it receives at dispatch time, without needing to reference the full main Agent conversation history._

## WHERE: Ecosystem

_Stub — links to: [[Role - Subagent]] (the agent receiving the delegation), [[Capability - Subagent Dispatch]] (the capability implementing this pattern), [[Economy-instance - Context Window]] (the isolation benefit — Subagent gets its own, fresh window), [[Economy-instance - Token Budget]] (the cost tradeoff — delegation increases total token consumption)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: task-scoping heuristics (when to delegate vs inline), how to write a good delegation prompt, result handoff format, and the failure modes (what to do if the Subagent's result is incomplete or wrong)._
