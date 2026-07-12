---
type: Surface
prefLabel: "Card Drawer"
altLabels: ["CardDrawer", "card detail", "CardMarkdown"]
category: [Surfaces]
subcategory: [reader, detail]
context: library
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/CardDrawer.tsx
  - packages/viewer/src/components/library/CardMarkdown.tsx
  - packages/viewer/src/components/library/hooks/useLibraryCardDetail.ts
---

## WHAT
_Stub —_ A side drawer that renders the full markdown content of a single selected [[Aggregate - Atomic Card]].

## WHERE
_Stub —_ Opens within [[Surface - Library]] when a card is selected; reads card detail (front-matter + body) for the chosen card path.

## WHY
_Stub —_ The reading-pane pattern is evident; no product rationale beyond "read one card" is encoded.

## WHEN
_Stub —_ When a user clicks a card node/row to read it in full.

## HOW
_Stub —_ Width-clampable drawer; fetches `LibraryCardDetail` by path and renders markdown with custom components.
