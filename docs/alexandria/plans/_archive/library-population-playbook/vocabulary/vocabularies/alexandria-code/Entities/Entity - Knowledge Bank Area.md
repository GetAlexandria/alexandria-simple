---
type: Entity
prefLabel: "Knowledge Bank Area"
altLabels: ["knowledge bank area", "KnowledgeBankArea", "subject"]
category: [Entities]
subcategory: [knowledge, unit]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/plays.ts
---

## WHAT
_Stub —_ One subject area within a [[Entity - Knowledge Bank]] (e.g. Vision, Vocabulary), with its own status, prerequisites, source-of-truth, and resulting cards.

## WHERE
_Stub —_ Belongs to an agent's [[Entity - Knowledge Bank]]; gated by `prerequisiteKnowledgeBankAreaIds`; a required input to certain [[Entity - Play]]s.

## WHY
_Stub —_ Prerequisite chaining implies an intended ordering of knowledge work; the curriculum logic is NOT spelled out in code.

## WHEN
_Stub —_ Worked one area at a time as the user builds out product knowledge with an agent.

## HOW
_Stub —_ Tracks status, completionCategoryIds, cardPaths, frozenSourceOfTruthIds; advances available→in_progress→ready_for_atomization→banked.
