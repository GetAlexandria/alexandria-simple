---
type: Aggregate
prefLabel: "Source of Truth"
altLabels: ["source of truth", "SourceOfTruth", "SOT"]
category: [Entities]
subcategory: [knowledge, frozen]
context: library
altitude: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/knowledge-artifacts.ts
---

## WHAT
_Stub —_ A frozen, content-hashed canonical document for a knowledge area — the agreed truth produced from a source conversion, from which cards are atomized.

## WHERE
_Stub —_ Belongs to a [[Aggregate - Area]]; created by freezing a [[Aggregate - Source Conversion]]; precedes [[Aggregate - Atomic Card]] generation.

## WHY
_Stub —_ Freezing implies a deliberate "lock the truth before atomizing" discipline; the governance intent is implied, not stated.

## WHEN
_Stub —_ At the point an area is reviewed and marked ready_for_atomization.

## HOW
_Stub —_ Fields: path, contentHash, frozenAt, knowledgeBankAreaId, sourceConversionId; banking events record frozen → updated transitions.
