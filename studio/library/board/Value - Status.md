---
type: Value
prefLabel: "Status"
plane: Product
context: board
altitude: value
status: stub
confidence: medium
altLabels:
  - "status"
  - "ladder status"
  - "proving ladder"
proposed_by: scanner
source_evidence:
  - "studio/plays/registry.js L1-15"
  - "studio/plays/README.md L66-80"
---

## WHAT
_Stub —_ a play's rung on the *proving ladder*: `slot → designed → hardened → derived → proven → registered`. Distinct from [[Value - Stage]] (the Board column).

## WHERE
Stored in [[Read-Model - Play Registry]] (`registry.js` per row, `status:`). Advances only through the loop's gates.

## WHY
Identity ladder for *what's been proven of this play*, as opposed to *what column it sits in on the Board*. The two axes are documented as "deliberately distinct."

## WHEN
Updated when a play passes a gate — `slot` at creation, `designed` after Gate 1, `proven` after Gate 2, `registered` when banked into the plugin and `PLAY_MANIFEST`.

## HOW
- Reshape 2026-06-12 added `derived` and `registered`; `authored` was retired.
- Hot Spot H1 — the rungs `hardened` and `derived` don't map cleanly onto the six-stage column ladder.
