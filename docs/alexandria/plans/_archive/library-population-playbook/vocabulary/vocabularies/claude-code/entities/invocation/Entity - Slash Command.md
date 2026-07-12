---
type: Entity
prefLabel: Slash Command
altLabels:
  - /command
  - Command
  - Built-in command
category: [Entities]
subcategory: [invocation]
facets: [Surfaces]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Slash Command

## WHAT: Definition

_Stub — a `/name` invocation that runs a Skill or triggers a harness action. The User types `/command-name` at the CLI prompt to invoke a named behavior. Built-in slash commands (`/plan`, `/clear`, `/help`, `/review`) trigger harness-level actions. User-defined slash commands invoke Skills. The slash-prefix convention is borrowed from shell culture and from chat interfaces (Slack, Discord) — the gesture is immediately recognizable to the target audience of developers without any onboarding._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Skill]] (Slash Commands are the invocation surface for Skills), [[Surface - CLI]] (the surface where Slash Commands are typed), [[Role - User]] (the User types Slash Commands), [[Role - Agent]] (the Agent executes the resulting Skill or action)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the full built-in slash command inventory, how user-defined commands are discovered, argument passing syntax, and the namespacing convention for Skills (`/skill-name` vs `/plugin:skill-name`)._
