---
type: Role
prefLabel: Background Agent
altLabels:
  - Remote Agent
  - Cloud Agent
category: [Roles]
subcategory: [agent, background]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/background-agent
---

# Background Agent

## WHAT: Definition

_Stub — an Agent running in a separate cloud-provisioned workspace, asynchronously, without requiring the Developer's local machine to remain open. The Developer queues a task, the Background Agent executes in Cursor's infrastructure, and results are returned when the task completes. The Background Agent's workspace is isolated from the Developer's local Workspace for the duration of the task._

## WHERE: Ecosystem

_Stub — links to: [[Role - Agent]] (the Background Agent is an Agent variant; the same autonomous-loop role, different execution environment), [[Entity - Workspace]] (the Background Agent operates in a cloud-provisioned workspace separate from the Developer's local workspace), [[Pattern - Background Loop]] (the asynchronous execution Pattern this role instantiates)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the Developer queues a Background Agent task, how results are surfaced when the task completes, what tools and context the Background Agent has access to, and the isolation model between the Background Agent's workspace and the Developer's local workspace._
