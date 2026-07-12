---
type: component
prefLabel: Big Edit Playbook
altLabels: [BIG-EDIT.md, edit playbook]
category: production-line
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/BIG-EDIT.md L1-110
context: production-line
altitude: component
---

## WHAT
_Stub —_ the ordered playbook for re-entering [[Aggregate - The Loop]] when a play changes substantially: edit source → re-derive → re-tune tests → re-audit → sideline old runs → bank → re-run campaign + bookkeeping. **The order is load-bearing — each step invalidates the next if skipped.**

## WHERE
`studio/plays/BIG-EDIT.md`. Triggered by any change "large enough to invalidate a play's renderings, tests, or audit."

## WHY
The seed: the Frame the Problem → Riff promotion (2026-06-18) silently invalidated the play's renderings, tests, audit, and recorded results because downstream steps were skipped. Without the explicit playbook, the gates exist but the order between them is folklore.

## WHEN
Initiated on a brief amendment, graph reshape, move rewrite, contract change, or move added/removed.

## HOW
- Six explicit steps: source-edit · re-derive · re-tune tests · re-audit · sideline old runs · bank.
- Step 7-8 (re-run campaign + bookkeeping) pegged to frame-the-problem-coin Slice 1 (#305).
- Safety nets — conformance gates that fail CI loudly but don't do the re-tune for you: placeholder conformance · bank conformance · risk-map drift · Protocol E + `fabro validate`.
