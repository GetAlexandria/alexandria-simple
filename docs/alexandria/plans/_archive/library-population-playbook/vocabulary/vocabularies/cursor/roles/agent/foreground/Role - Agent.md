---
type: Role
prefLabel: Agent
altLabels:
  - AI Agent
  - Cursor Agent
category: [Roles]
subcategory: [agent, foreground]
facets: [Surfaces]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/agent
---

# Agent

## WHAT: Definition

_Stub — the autonomous LLM-driven loop that acts on the codebase without requiring step-by-step instruction from the Developer. The Agent reads files, writes files, runs terminal commands, searches the codebase, and iterates until the given goal is reached or the Developer interrupts. The Agent is the fourth and highest-autonomy tier on Cursor's surface ladder._

_To understand Agent as a role, it helps to contrast it with the three tiers below it. Tab acts within a single cursor position and requires a keystroke to accept; the Developer stays in direct control of every character. Inline Edit acts within a selected text region and requires the Developer to issue a natural-language instruction; the scope is bounded and the change is reviewed before applying. Composer acts across multiple files and requires the Developer to review and apply a full diff; the Developer is still the approver of every change. Agent, by contrast, acts in a loop — it plans, executes tool calls, observes results, and replans — without requiring the Developer to approve each step. The Developer's role shifts from author to supervisor: they set the goal, watch the loop run, and intervene when needed. This is the MDA-inversion test passing: "Agent" names the encounter (the Developer is supervising an autonomous entity) not the mechanism (the LLM inference loop)._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Agent Surface]] (the UI mode where Agent work is visible and interruptible), [[Role - Background Agent]] (an Agent variant running asynchronously in a cloud workspace), [[Pattern - Autonomy Ladder]] (Agent is the fourth tier), [[Pattern - Apply-and-Review]] (the review pattern when Agent proposes changes), [[Pattern - Background Loop]] (long-running Agent work)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how an Agent session is initiated, what tools the Agent has access to, how the Developer interrupts or redirects a running Agent loop, and the checkpoint/rollback affordances available during Agent work._
