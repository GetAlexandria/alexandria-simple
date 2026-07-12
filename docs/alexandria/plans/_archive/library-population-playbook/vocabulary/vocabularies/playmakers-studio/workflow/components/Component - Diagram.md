---
type: component
prefLabel: Diagram
altLabels: [diagram.svg, the logic drawing]
category: workflow
subcategory: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L108-125; studio/plays/PROJECTION.md L36-44
context: workflow
altitude: component
---

## WHAT
_Stub —_ the logic drawing of a play — an SVG generated mechanically from `workflow.fabro` by `fabro graph workflow.fabro -o diagram.svg`. Never hand-drawn.

## WHERE
`studio/plays/<slug>/diagram.svg`. Emitted by [[Component - Derive Views Tool]] alongside [[Component - Story View]].

## WHY
Renderings derive from one source — a hand-edited rendering is a Protocol E parity failure. The diagram lets a Director judge graph shape visually without reading DOT.

## WHEN
Emitted at Derive. Re-emitted on every edit (BIG-EDIT step 2).

## HOW
Pure derivation — `fabro graph` on the workflow file.
