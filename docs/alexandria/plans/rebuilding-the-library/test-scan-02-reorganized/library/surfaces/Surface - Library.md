---
type: Surface
prefLabel: "Library"
altLabels: ["library", "journal stone", "FolderLibraryView", "ConstellationView"]
category: [Surfaces]
subcategory: [knowledge-graph, browse]
context: library
altitude: context
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/ConstellationView.tsx
  - packages/viewer/src/components/library/FolderLibraryView.tsx
  - packages/viewer/src/components/library/viewer-routes.ts
---

## WHAT
_Stub —_ The browsable knowledge graph of the product: a body of cards organized into territories/subfolders. Two view modes — Constellation (graph topology) and Folders (containment tree).

## WHERE
_Stub —_ "Library" stone in [[Surface - Stone Top Bar]]. Renders [[Aggregate - Atomic Card]] nodes connected by [[Read Model - Library]] edges; cards open in a [[Surface - Card Drawer]]. Routes `/library` and `/library/folders`.

## WHY
_Stub —_ The product is described in code as "a knowledge graph for your product"; the Library is its primary read surface. Why two view modes coexist is NOT stated in code.

## WHEN
_Stub —_ Browsed when a user wants to read or navigate the product's accumulated knowledge cards.

## HOW
_Stub —_ Loads a `LibraryGraph` (cards + edges + meta of territories/subfolders); Constellation lays out a force/graph view, Folders groups by `territory/subfolder` with open-folder + selected-card URL state.
