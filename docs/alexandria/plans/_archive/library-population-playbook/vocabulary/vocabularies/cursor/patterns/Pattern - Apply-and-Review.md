---
type: Pattern
prefLabel: Apply-and-Review
altLabels:
  - Review and Apply
  - Diff Review
  - Human-in-the-Loop Review
category: [Patterns]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/composer
  - https://docs.cursor.com/agent
---

# Apply-and-Review

## WHAT: Definition

_Stub — the pattern in which the AI proposes a change (a diff) and the Developer reviews it before any file modification is committed to disk. Apply-and-Review is the safety contract that runs at tiers 2, 3, and 4 of the Autonomy Ladder. The Agent proposes; the Developer approves. The Developer may accept the full diff, accept file by file, reject entirely, or roll back to a Checkpoint if the change was already applied and the outcome was wrong._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Inline Edit]] (Apply-and-Review runs at tier 2), [[Surface - Composer]] (Apply-and-Review runs at tier 3), [[Surface - Agent Surface]] (Apply-and-Review runs at tier 4, with interrupt affordances), [[Entity - Checkpoint]] (the rollback mechanism for already-applied changes), [[Capability - Applying]] (the Apply step that concludes the pattern)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the diff display format for each tier, the accept/reject/partial-accept gestures, the interrupt gesture during Agent runs, and the relationship between Apply-and-Review and git staging (does applying auto-stage?)._
