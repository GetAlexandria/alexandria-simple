---
type: Surface
prefLabel: "Stone Top Bar"
altLabels: ["TopNavigation", "StoneTopBar", "viewer-top-bar"]
category: [Surfaces]
subcategory: [navigation, chrome]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/navigation/TopNavigation.tsx
  - packages/viewer/src/app/navigation/top-navigation.fixtures.ts
  - packages/viewer/src/components/library/StoneTopBar.tsx
---

## WHAT
_Stub —_ The primary navigation bar: an "ΛLEXΛNDRIΛ" home wordmark, four carved "stone" tabs (Library, Playbook, Info Hub, Ledger), and a ⌘K search trigger.

## WHERE
_Stub —_ Top chrome of [[Surface - Viewer Shell]]; each stone routes to its surface — [[Surface - Library]], [[Surface - Playbook]], [[Surface - Info Hub]], [[Surface - Ledger]].

## WHY
_Stub —_ The stone/archaeology motif is clearly intentional branding (library of Alexandria); the meaning behind locking specific stones is NOT in code.

## WHEN
_Stub —_ Always present; the constant wayfinding element across surfaces.

## HOW
_Stub —_ Tabs from a fixtures list with `enabled` flags (Ledger locked); active tab swaps to an "active" stone image; brand button returns home; search opens a command palette.
