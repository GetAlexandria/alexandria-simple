---
type: Capability
prefLabel: Skill Invocation
altLabels:
  - Running a skill
  - Slash command execution
  - Custom command execution
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Skill Invocation

## WHAT: Definition

_Stub — the act of running a packaged Skill by typing its slash command. The User types `/skill-name` at the CLI (or IDE Extension Pane); the harness loads the Skill's instruction file; the Agent executes the Skill's instructions as a new task in the current Session. Skill Invocation is the User's gesture for accessing repeatable, named workflows without having to type out a full prompt from scratch each time._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Skill]] (the Skill being invoked), [[Entity - Slash Command]] (the invocation gesture), [[Role - User]] (the User invokes Skills), [[Role - Agent]] (the Agent executes the Skill's instructions), [[Entity - Session]] (Skill Invocation runs within the current Session)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the harness resolves `/name` to a Skill file, argument passing, how the Skill's instructions are injected into the Agent's context, and the difference between built-in slash commands (harness-handled) and user-defined Skills (Agent-handled)._
