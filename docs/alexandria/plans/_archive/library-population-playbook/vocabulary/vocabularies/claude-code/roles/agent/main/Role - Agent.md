---
type: Role
prefLabel: Agent
altLabels:
  - Claude
  - Main agent
  - Assistant
category: [Roles]
subcategory: [agent, main]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/overview
---

# Agent

## WHAT: Definition

_Stub — the main Claude agent loop. The Agent receives a task from the User, calls Tools to read and modify the Workspace, reasons over outputs, calls more Tools, and continues until the task is complete or the User interrupts. The Agent operates within a single Context Window per turn; Memory is loaded into that Context Window at the start of each Session._

_In families.md terms, the Agent is the LLM-driven loop that "chooses what to do next given goal + tools + context." It is distinct from a Subagent (which the Agent itself dispatches) and from a Tool (which is atomic, not a loop)._

## WHERE: Ecosystem

_Stub — links to: [[Role - User]] (the human directing this Agent), [[Role - Subagent]] (agents this Agent may dispatch), [[Entity - Tool]] (the capabilities this Agent calls), [[Entity - Session]] (the durable transcript), [[Economy-instance - Context Window]] (the Agent's resource budget), [[System - Tool Dispatcher]] (the runtime resolving Tool calls)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: loop termination conditions, interrupt handling, how the Agent loads Memory at Session start, and the Agent's behavior in Plan mode vs execution mode._
