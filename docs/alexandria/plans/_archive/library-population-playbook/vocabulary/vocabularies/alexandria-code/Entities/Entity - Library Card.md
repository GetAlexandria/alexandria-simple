---
type: Entity
prefLabel: "Library Card"
altLabels: ["card", "LibraryGraphCard", "LibraryCardDetail"]
category: [Entities]
subcategory: [knowledge, node]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/library-graph.ts
---

## WHAT
_Stub —_ The atomic unit of product knowledge: a typed markdown card with id, title, type, and a territory/subfolder location, plus outbound links to other cards.

## WHERE
_Stub —_ Nodes of the [[Entity - Library Graph]], displayed on [[Surface - Library]] and read in the [[Surface - Card Drawer]]; produced as [[Entity - Atomic Card]] outputs.

## WHY
_Stub —_ Cards are the substrate of "a knowledge graph for your product"; the editorial rules for a good card are NOT in code.

## WHEN
_Stub —_ Created/updated as the product's knowledge is captured and atomized; read whenever someone browses the Library.

## HOW
_Stub —_ Schema fields: id, title, type, territory, subfolder, outbound[]; detail variant adds full `content` (markdown body).
