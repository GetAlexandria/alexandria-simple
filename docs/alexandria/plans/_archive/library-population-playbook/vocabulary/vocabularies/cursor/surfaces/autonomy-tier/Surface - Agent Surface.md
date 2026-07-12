---
type: Surface
prefLabel: Agent Surface
altLabels:
  - Agent Mode
  - Agentic Mode
category: [Surfaces]
subcategory: [autonomy-tier]
facets: [Roles]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/agent
---

# Agent Surface

## WHAT: Definition

_Stub — the autonomous-loop surface; the fourth and highest tier on Cursor's autonomy ladder. When the Developer activates Agent mode, Cursor runs a plan-act-observe loop: it reads the codebase, proposes actions, executes terminal commands, writes files, and iterates until the stated goal is reached or the Developer interrupts. The Developer's role on the Agent Surface is supervisor, not author — they set the goal, observe the loop, and intervene when needed. Checkpoints are created during the loop so the Developer can roll back to any prior state._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Autonomy Ladder]] (Agent Surface is the fourth tier), [[Role - Agent]] (the AI participant the Developer supervises on this surface), [[Pattern - Apply-and-Review]] (review and interrupt affordances during Agent loops), [[Entity - Checkpoint]] (Checkpoints are created by Agent runs on this surface), [[Surface - Composer]] (the tier below Agent Surface), [[Surface - Browser]] (the Agent can open the embedded Browser to read web content during a loop)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Agent mode is activated within Composer, what tools the Agent has access to during a loop, the interrupt gesture, how the Developer provides mid-loop feedback, and how the Agent Surface renders progress (tool calls, file changes, terminal output) as the loop runs._
