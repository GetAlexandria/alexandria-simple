---
type: Pattern
prefLabel: Save → React
altLabels:
  - Save-React Pattern
  - Director Acts → Agent Reads
  - File-Save Trigger
category: [Patterns]
subcategory: [pattern]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/agents/Agent - Raven the Maven.md
  - docs/alexandria/library/product/agents/Agent - Solomon the Sorter.md
---

# Save → React

## WHAT: Definition

The Save → React pattern is the core interaction primitive in Alexandria's Claude Code integration: the Director performs an action (types a message, banks a card, updates a source file) → a state file changes on disk → an Agent reads the change and reacts. The pattern is the bridge between the Director's ambient working behavior and the agents' event-driven behavior. The Director never explicitly "calls" an agent; they simply act in their environment, and the agents watch for state changes that are relevant to their mandates.

This pattern is the architectural consequence of building Alexandria in Claude Code: the host environment is a file-system-watching agentic loop, and Save → React is how that loop integrates with Alexandria's agent team. It makes agents feel like colleagues watching the same workspace rather than tools being explicitly invoked (though Skills are the explicit invocation layer on top of this ambient pattern).

## WHERE: Ecosystem

_Stub — links to: [[Role - Director]] (the actor), [[Role - Solomon the Sentinel]] (watches the world → library channel via file-save triggers), [[Role - Raven the Maven]] (responds to Director turns in conversation), [[Entity - Skill]] (the explicit invocation layer that complements this ambient pattern)._

## WHY: Rationale

_Stub — owner-supplied. The Save → React pattern is what makes Alexandria feel like a continuously-present team rather than a tool you explicitly invoke. The ambient reaction is the felt-experience property._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — the pattern runs on Claude Code's hook system: deterministic shell side-effects bound to lifecycle events (file save, tool call, stop). The agent loop watches for relevant file mutations and dispatches to the appropriate agent's mandate. Anti-example: requiring the Director to explicitly type "/ax-triage my-notes.md" every time they save a meeting note — this forces explicit invocation where ambient reaction would be better._
