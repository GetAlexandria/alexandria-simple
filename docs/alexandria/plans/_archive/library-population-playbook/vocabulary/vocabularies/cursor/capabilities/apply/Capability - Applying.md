---
type: Capability
prefLabel: Applying
altLabels:
  - Apply
  - Accept Changes
  - Apply All
category: [Capabilities]
subcategory: [apply]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/composer
---

# Applying

## WHAT: Definition

_Stub — the capability of committing a proposed diff to the file system, making the AI-suggested changes permanent in the Workspace. The Apply gesture is the final step in the Apply-and-Review pattern: the Developer reviews a diff (from Inline Edit, Composer, or Agent), decides to accept it, and Applies it. Applying is irreversible without a rollback to a Checkpoint or a git revert._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Apply-and-Review]] (Applying is the final step of this pattern), [[Entity - Checkpoint]] (Checkpoints allow the Developer to undo an Apply during Agent work), [[System - Apply Algorithm]] (the diff-and-merge mechanism that executes the Apply), [[Surface - Composer]] (the primary surface where the Developer applies multi-file diffs), [[Surface - Agent Surface]] (Agent-proposed changes are also committed via Apply)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the Apply button placement in Composer and Inline Edit, partial-apply behavior (applying individual file changes from a multi-file diff), the Apply All vs file-by-file apply options, and the interaction between Apply and git staging._
