---
type: Read-Model
prefLabel: "Play Registry"
plane: Product
context: board
altitude: component
status: stub
confidence: medium
links:
  produces:
    - "[[Aggregate - Board]]"
    - "[[Aggregate - Board State]]"
altLabels:
  - "registry.js"
  - "registry.html"
proposed_by: scanner
source_evidence:
  - "studio/plays/registry.js L1-77"
  - "studio/plays/README.md L322-332"
---

## WHAT
What it does. Play Registry gives every play one identity the whole studio shares, so a play is the same thing on the [[Work Board]], in its brief, and in a run — never two half-records.

How it does it. Play Registry lists each play's slug, name, glyph, tier, job category, prio, and status, read from registry.js; it holds no state of its own — the [[Work Board]] and [[Board State]] read identity from it.

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
