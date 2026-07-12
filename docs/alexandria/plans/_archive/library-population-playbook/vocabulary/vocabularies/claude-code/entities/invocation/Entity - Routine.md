---
type: Entity
prefLabel: Routine
altLabels:
  - Scheduled agent
  - Cron agent
  - Recurring task
category: [Entities]
subcategory: [invocation]
facets: [Patterns]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Routine

## WHAT: Definition

_Stub — a scheduled recurring agent task. A Routine is a cron-shaped autonomous agent run: a task definition bound to a time schedule, executing without a User present to initiate it. Routines extend Claude Code's model from interactive (User-directed) to autonomous (time-directed). A Routine runs the same Agent loop as an interactive Session but is triggered by a schedule rather than a User prompt._

## WHERE: Ecosystem

_Stub — links to: [[Role - Agent]] (the Agent loop that a Routine executes), [[Entity - Session]] (a Routine produces a Session transcript), [[Entity - Skill]] (Routines may invoke Skills as their task body), [[Role - User]] (the User configures Routines but is not present at run time)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the schedule format (cron expression or calendar-based), how the task body is specified, output delivery (where the Routine's results go if no User is present), and the permission model for unattended agent runs._
