---
type: Entity
prefLabel: Hook
altLabels:
  - Lifecycle hook
  - Event hook
  - Shell hook
category: [Entities]
subcategory: [integration]
facets: [Mechanisms]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/hooks
---

# Hook

## WHAT: Definition

_Stub — a deterministic shell side-effect bound to a lifecycle event (PreToolUse, PostToolUse, Stop, Notification), running outside the LLM loop. A Hook is a shell command or script that fires automatically when a named event occurs during the Agent's operation. Hooks are not AI-driven — they run the same way every time regardless of what the Agent is thinking. They are the User's mechanism for injecting deterministic behavior (linting, logging, notifications, safety guards) into an otherwise probabilistic agent loop._

_The word "Hook" is borrowed from web and build-tool convention (React hooks, Git hooks, Webpack hooks) where it already carries the meaning "code that fires when a named event occurs." The borrow is intentional: developers using Claude Code have web or DevOps backgrounds and recognize the term immediately. This is consistent with the [[Standard - Claude Code Nomenclature Signature]] rule: integration points for power users can use mechanism-named terms when the users of those features benefit from precision._

## WHERE: Ecosystem

_Stub — links to: [[System - Hook Execution]] (the runtime that fires Hooks), [[Role - User]] (Hooks are configured by the User, not the Agent), [[Role - Agent]] (Hook events are triggered by Agent lifecycle transitions), [[Entity - Tool]] (PreToolUse and PostToolUse are the most common Hook points)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the full event taxonomy (PreToolUse, PostToolUse, Stop, Notification, and others), the shell command format, how Hooks receive event context as environment variables or stdin JSON, and failure behavior (what happens if a Hook exits non-zero)._
