---
type: Pattern
prefLabel: Save-React
altLabels:
  - State-file loop
  - File-mediated feedback
  - Canvas-style discipline
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Save-React

## WHAT: Definition

_Stub — the pattern where a director (human or another tool) acts on a surface, their action changes a state file, and the Agent reads the changed file and reacts. The Agent is not invoked via a direct message; it observes state changes in the Workspace and responds to them. This decouples the director's action from the Agent's response — the state file is the contract between them. The pattern is named for the two steps: Save (something is written to a file) → React (the Agent reads it and acts)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Workspace]] (the state files live in the Workspace), [[Entity - Hook]] (Hooks can trigger Agent reactions on file-change events), [[Entity - Tool]] (the Agent uses Tools to read the changed state files), [[Pattern - Tool-Use Loop]] (the Agent's reaction is a Tool-Use Loop triggered by the state change), [[Entity - Memory]] (CLAUDE.md is the canonical Save-React state file for instruction changes)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the canonical state file formats (CLAUDE.md, task files, structured JSON), how the Agent knows to check for state changes, how Hooks can bridge the gap between file-change and Agent invocation, and failure modes (Agent reads stale state, Agent misses the change)._
