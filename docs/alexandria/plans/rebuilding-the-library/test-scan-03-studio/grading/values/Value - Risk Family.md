---
type: value
prefLabel: Risk Family
altLabels: [risk family, canonical risk spine, RE, IN, OUT, ADV, CHN]
category: grading
subcategory: value
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/frame-the-problem/risk-map.md L42-78
context: grading
altitude: value
---

## WHAT
_Stub —_ one of five canonical families on the risk spine: **RE** Reasoning, **IN** Input, **OUT** Output, **ADV** Adversarial, **CHN** Chain/Systemic. Risk ids are prefix-banded so the Play Testing surface groups them by family.

## WHERE
Encoded as the prefix on every risk-id row in [[Aggregate - Risk Map]]. Spine source-of-truth is `research/testing/RISKS.md` (cited in the risk-map's frontmatter — not opened by this scan).

## WHY
One canonical taxonomy beats per-play bespoke ids. Earned: play-specific risks (formerly `FTP-*` for frame-the-problem) were really "input/output/reasoning risks in disguise" and got re-filed under canonical ids.

## WHEN
Used at risk-map authoring. Re-filed at big edits.

## HOW
- Five families, prefix-banded.
- Drift gate enforces canonical ids in CI.
