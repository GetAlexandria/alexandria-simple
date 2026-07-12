---
type: value
prefLabel: Run Bar
altLabels: [run-count policy, smoke, estimate, ship-gate]
category: grading
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/TESTING.md L217-285
context: grading
altitude: value
---

## WHAT
_Stub —_ the policy that ties run count to likelihood × cost of failure: **smoke** (k≈5; gross flakiness), **estimate** (k≈30; ±~10% rate), **ship-gate** (k≥100, or rule-of-three for the reliability bar).

## WHERE
Applied at testing time. Recorded per eval row in [[Aggregate - Risk Map]] as `n · pass · CI`.

## WHY
"A single pass is a sample, not a measurement." Precision scales with √k. Rule of three: 0 failures in k runs puts the 95% upper bound at ~3/k. "10/10, ship it" actually means "failure rate could be ~26%."

## WHEN
Choose the bar per row based on cost of failure. Deterministic checks are exempt (`n=1` sufficient).

## HOW
- Continuous beats binary for precision.
- Two noise sources: SUT + grader. More runs shrink SUT noise but **cannot fix a biased grader**.
- Never pool across tests (Simpson's paradox trap).
- Label: `passing` = rate clears bar with adequate n; `needs work` = known crack carried; `provisional` = n too small to claim.
