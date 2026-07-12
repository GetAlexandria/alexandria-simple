---
type: Pattern
prefLabel: Background Loop
altLabels:
  - Async Agent Loop
  - Remote Agent Loop
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/background-agent
---

# Background Loop

## WHAT: Definition

_Stub — the pattern of long-running autonomous Agent work executed asynchronously in a separate cloud-provisioned workspace, without requiring the Developer's local machine or attention to remain active. The Developer queues a task for a Background Agent, continues other work (or closes the machine), and later retrieves the result. The Background Loop is the asynchronous variant of the Agent loop; the same plan-act-observe pattern runs, but in Cursor's infrastructure rather than the Developer's local environment._

## WHERE: Ecosystem

_Stub — links to: [[Role - Background Agent]] (the role that executes the Background Loop), [[Role - Agent]] (the synchronous foreground Agent that Background Loop contrasts with), [[Entity - Checkpoint]] (Checkpoints are created during Background Loops so the Developer can review the state at task completion), [[Pattern - Apply-and-Review]] (the Developer reviews Background Agent output before changes are integrated)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the Developer is notified when a Background Loop completes, how results are surfaced (diff review UI, summary), the isolation model between Background Agent workspace and Developer's local workspace, and how the Developer accepts or rejects Background Agent output._
