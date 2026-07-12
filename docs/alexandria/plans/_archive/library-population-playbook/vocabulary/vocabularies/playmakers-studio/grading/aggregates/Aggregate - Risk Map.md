---
type: aggregate
prefLabel: Risk Map
altLabels: [risk-map.md, coverage map]
category: grading
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L126-149; studio/plays/frame-the-problem/risk-map.md L1-80
context: grading
altitude: aggregate
---

## WHAT
_Stub —_ the per-play coverage table the **Play Testing** viewer surface renders from. Rows = canonical risk ids (RE / IN / OUT / ADV / CHN families + play-specific rows). Columns: state (covered ● / partial ◐ / gap ○ / n/a), fixture, run results (n · pass-rate · CI).

## WHERE
`studio/plays/<slug>/risk-map.md`. Authored from [[Value - Proof Spec]] (§7 of the brief). Rendered by the viewer. Coverage state hand-authored; `runs`/`results` axis is **measured**.

## WHY
Coverage is measured, not asserted. The brief authors the shape (real risks → real fixtures, results blank); runs fill the numbers later. "A brief that ships green numbers is fabricating."

## WHEN
Authored at Brief from §7. `results:` field is reset on a big edit (BIG-EDIT step 5: "every recorded pass measured the *retired* play").

## HOW
- Canonical risk-id families (prefix-bands the surface): **RE** Reasoning, **IN** Input, **OUT** Output, **ADV** Adversarial, **CHN** Chain/Systemic.
- "Reclassification" — play-specific risks (formerly `FTP-*`) re-filed under canonical ids.
- Risk-map drift gate fires CI loudly on off-taxonomy ids.
