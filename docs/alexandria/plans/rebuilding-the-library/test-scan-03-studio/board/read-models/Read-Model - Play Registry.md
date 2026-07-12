---
type: read-model
prefLabel: Play Registry
altLabels: [registry.js, registry.html]
category: board
subcategory: read-model
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/registry.js L1-77; studio/plays/README.md L322-332
context: board
altitude: component
---

## WHAT
_Stub —_ the canonical identity table for every play: slug, name, glyph, tier, job category, prio, status on the proving ladder, and a free-text description. Single source of truth for *identity*; the Board page and registry page both render from it.

## WHERE
`studio/plays/registry.js`. Rendered to `studio/plays/registry.html` (the golden-path chain). Stage column + priority order live in [[Aggregate - Board State]], NOT here.

## WHY
"One source of truth per fact." Identity and ladder-status here; stage there. Earned: previous inline-on-HTML registry mixed identity with stage and drifted.

## WHEN
Updated when a play moves rungs on the proving ladder (slot → designed → hardened → derived → proven → registered) or when its prio changes (e.g., parked by the source-canon audit).

## HOW
- Two axes: `status` (proving ladder) and `prio` (core / input / stretch / parked).
- Parked plays keep identity rows but neither Board nor registry page renders them.
- Hot Spot H1: the README's six-stage ladder and `registry.js`'s status ladder are different vocabularies running in parallel.
