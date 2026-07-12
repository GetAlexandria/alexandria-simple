---
type: System
prefLabel: Hook Execution
altLabels:
  - Hook runner
  - Hook runtime
  - Lifecycle event runner
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/hooks
---

# Hook Execution

## WHAT: Definition

_Stub — the shell-runner that fires Hook scripts on lifecycle events. When a lifecycle event occurs (PreToolUse, PostToolUse, Stop, Notification), the Hook Execution system fires the shell commands the User has configured for that event. This runs outside the LLM loop — the Agent does not know Hooks are firing, does not control them, and does not receive their output unless the Hook is configured to write back to the Agent's context. Hook Execution is deterministic: the same event always fires the same Hook, regardless of what the Agent is thinking._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Hook]] (the Hook definitions the system executes), [[System - Tool Dispatcher]] (PreToolUse and PostToolUse Hooks fire around Tool Dispatcher events), [[Role - User]] (the User configures Hook definitions in settings)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the event taxonomy, how event context is passed to Hook scripts (environment variables or stdin JSON), the failure contract (non-zero exit behavior), and whether Hooks can block the Agent loop or only observe it._
