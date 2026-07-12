---
type: Read Model
prefLabel: "Library"
altLabels: ["library graph", "LibraryGraph", "context graph", "the whole card graph"]
category: [Entities]
subcategory: [knowledge, graph]
context: library
altitude: pillar
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/library-graph.ts
  - packages/ax/src/effects/library-graph-loader.ts
---

## WHAT
_Stub —_ The whole graph of product knowledge: a set of [[Aggregate - Atomic Card]] nodes plus directed edges, with meta listing territories and subfolders.

## WHERE
_Stub —_ The data behind [[Surface - Library]] (both Constellation and Folder modes); called the "context graph" in plugin guidance.

## WHY
_Stub —_ It is the central product artifact; why a graph (vs. flat docs) is implied by the product thesis but not argued in code.

## WHEN
_Stub —_ Built by scanning the workspace's cards; loaded on demand by the viewer.

## HOW
_Stub —_ `{ cards, edges, meta: { cardCount, edgeCount, territories, subfolders }, scanErrors }`, decoded from a runtime/library-graph loader.
