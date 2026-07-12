---
type: Entity
prefLabel: Checkpoint
altLabels:
  - Save point
  - Session snapshot
  - Rollback point
category: [Entities]
subcategory: [session]
facets: [Patterns]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Checkpoint

## WHAT: Definition

_Stub — a captured Session state that the User can roll back to. A Checkpoint records the state of the Workspace and Session at a point in time, enabling the User to undo the Agent's work if a sequence of actions went in the wrong direction. Checkpoints are the safety mechanism that makes the Agent loop less risky: the User can let the Agent attempt ambitious edits knowing a rollback path exists._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Session]] (Checkpoints are points within a Session), [[Entity - Workspace]] (Workspace file state is part of what a Checkpoint captures), [[Role - User]] (the User creates and restores Checkpoints), [[Pattern - Plan-Then-Act]] (Checkpoints are the rollback safety net that enables confident execution)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Checkpoints are created (auto vs manual), what state is captured (file diffs, Session transcript, or both), the rollback mechanics, and the naming/identification of multiple Checkpoints within one Session._
