---
type: System
prefLabel: Tool Dispatcher
altLabels:
  - Tool executor
  - Tool runtime
  - Tool resolver
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Tool Dispatcher

## WHAT: Definition

_Stub — the harness runtime that resolves Tool calls from the Agent to actual executions. When the Agent emits a Tool call (e.g., "call Read with path=src/index.ts"), the Tool Dispatcher receives the call, verifies permissions, executes the Tool's underlying implementation, and returns the result to the Agent. From the Agent's perspective, it calls a Tool and gets back a result; the Tool Dispatcher is the invisible intermediary that makes that happen._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Tool]] (the Tools the Dispatcher resolves), [[Capability - Tool Calling]] (the user-facing capability this system enables), [[Entity - Hook]] (Hooks fire around Tool Dispatcher events — PreToolUse, PostToolUse), [[System - MCP Integration Layer]] (MCP-provided Tools are routed through the Dispatcher the same as built-in Tools)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the permission-check logic (which Tools require User confirmation, which are auto-approved), the error-handling contract (what happens when a Tool call fails), and how MCP-provided Tools are registered with the Dispatcher._
