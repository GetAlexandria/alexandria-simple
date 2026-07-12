---
type: Aggregate
prefLabel: "Source Item"
altLabels: ["source item", "SourceItem", "source material"]
category: [Entities]
subcategory: [intake, raw-material]
context: library
altitude: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/sources.ts
  - packages/viewer/src/components/library/vision/VisionSourceIntake.tsx
---

## WHAT
_Stub —_ A piece of raw input material — a file or source-code path — brought into a project to be summarized and turned into knowledge.

## WHERE
_Stub —_ Intake on [[Surface - Info Hub]] and in [[Surface - Raven Vision Onboarding]]; consumed by a [[Aggregate - Source Conversion]] toward [[Aggregate - Atomic Card]]s.

## WHY
_Stub —_ The product clearly ingests code/files as evidence; the curation policy (what counts as a good source) is NOT in code.

## WHEN
_Stub —_ Added by user or agent before/while building a knowledge area.

## HOW
_Stub —_ Fields: kind (file|source_code), sourcePath, pathType (file|directory), status (unprocessed→processing→processed→failed), addedBy, plus a latest-summary excerpt/path.
