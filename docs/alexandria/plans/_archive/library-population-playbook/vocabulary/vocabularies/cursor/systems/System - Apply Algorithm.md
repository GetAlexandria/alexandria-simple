---
type: System
prefLabel: Apply Algorithm
altLabels:
  - Diff Engine
  - Merge Algorithm
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/composer
---

# Apply Algorithm

## WHAT: Definition

_Stub — the diff-and-merge mechanism that commits Composer and Agent proposed changes to the file system when the Developer chooses to Apply. The Apply Algorithm receives the proposed diff, resolves merge conflicts if any exist between the proposal and any Developer edits made since the proposal was generated, and writes the result to disk. Not user-visible; the Developer sees only the Apply gesture and its outcome._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Applying]] (the user-visible capability the Apply Algorithm executes), [[Surface - Composer]] (Composer proposals are committed by the Apply Algorithm), [[Surface - Agent Surface]] (Agent-proposed changes are also committed by the Apply Algorithm), [[Entity - Checkpoint]] (Checkpoints allow rollback after the Apply Algorithm has written to disk)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the diff format the Apply Algorithm expects, conflict resolution behavior when the Developer has edited a file between proposal generation and apply, the streaming-apply experience (apply progress for large multi-file diffs), and failure modes (what happens when apply partially fails)._
