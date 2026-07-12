---
type: Entity
prefLabel: Checkpoint
altLabels:
  - Snapshot
  - Restore Point
category: [Entities]
subcategory: [conversation]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/agent
---

# Checkpoint

## WHAT: Definition

_Stub — a captured state of the codebase that the Developer can restore to if an Agent run produces an undesirable outcome. Cursor creates Checkpoints automatically during Agent sessions, allowing the Developer to roll back to a known-good state without manually reverting file changes. Checkpoints are the primary safety affordance in the Apply-and-Review pattern._

## WHERE: Ecosystem

_Stub — links to: [[Role - Agent]] (Agent sessions produce Checkpoints), [[Pattern - Apply-and-Review]] (Checkpoints are the rollback mechanism in this pattern), [[Pattern - Background Loop]] (Background Agent sessions also produce Checkpoints), [[Entity - Session]] (Checkpoints are associated with the Session in which they were created)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: when Checkpoints are created during an Agent run, how the Developer triggers a restore, whether Checkpoints interact with git history, and Checkpoint storage limits._
