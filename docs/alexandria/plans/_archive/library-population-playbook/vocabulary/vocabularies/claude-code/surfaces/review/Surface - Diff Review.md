---
type: Surface
prefLabel: Diff Review
altLabels:
  - Edit review
  - Change review
  - Proposed changes
category: [Surfaces]
subcategory: [review]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Diff Review

## WHAT: Definition

_Stub — the surface where the User approves or rejects Agent-proposed file changes. When the Agent proposes to edit files, the proposed changes are rendered in a diff format (additions in green, removals in red, context lines in grey) and the User confirms or rejects before the change is applied. Diff Review is the primary human-in-the-loop safety gate for file modification._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Tool]] (Edit and Write Tools produce diffs for review), [[Surface - CLI]] (Diff Review is rendered inline in the CLI), [[Surface - IDE Extension Pane]] (Diff Review may have richer rendering in the IDE pane), [[Role - User]] (the User approves or rejects diffs), [[Entity - Checkpoint]] (Checkpoints are the rollback path if the User approves then regrets)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the diff rendering format, the approval gestures (yes/no/edit), how partial acceptance works, whether the User can edit the proposed diff before applying, and the auto-approve setting for Users who want a less-interrupted flow._
