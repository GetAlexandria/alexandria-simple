---
type: Aggregate
prefLabel: "Source Conversion"
altLabels: ["source conversion", "SourceConversion"]
category: [Entities]
subcategory: [pipeline, process-record]
context: library
altitude: aggregate
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/knowledge-artifacts.ts
---

## WHAT
_Stub —_ A record of turning source material into a [[Aggregate - Source of Truth]]: which agent, which template, which source materials, and its lifecycle status.

## WHERE
_Stub —_ Bridges [[Aggregate - Source Item]] → [[Aggregate - Source of Truth]] within a [[Aggregate - Area]]; an internal pipeline record more than a user-facing object.

## WHY
_Stub —_ Marks the transform step explicitly; why it is modeled as a first-class record (provenance/audit?) is inferred, not stated.

## WHEN
_Stub —_ Runs when an agent converts gathered sources into a freezable document.

## HOW
_Stub —_ Fields: agentId, aidTemplateId, sourceMaterialIds, sourceOfTruthIds, status (started→ready_to_freeze→completed→failed).
