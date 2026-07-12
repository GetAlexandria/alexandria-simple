---
type: Entity
prefLabel: "Atomic Card"
altLabels: ["atomic card", "AtomicCard"]
category: [Entities]
subcategory: [knowledge, output]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/atomic-card-categories.ts
---

## WHAT
_Stub —_ A single knowledge card atomized from a frozen Source of Truth, filed under one of ten categories: rationale, research, roles, domains, surfaces, entities, capabilities, mechanisms(systems), patterns, economy.

## WHERE
_Stub —_ The output end of the knowledge pipeline; becomes a [[Entity - Library Card]] node in the [[Entity - Library Graph]]; categorized by the product's own card taxonomy.

## WHY
_Stub —_ The ten-category taxonomy is the product's intended shape for product knowledge; the rationale per category is NOT in code (labels only).

## WHEN
_Stub —_ Produced when a [[Entity - Knowledge Bank Area]] is banked / atomized.

## HOW
_Stub —_ Fields: id, categoryId, path, title, contentHash; categories defined once in `atomic-card-categories.ts` with labels + folder names.
