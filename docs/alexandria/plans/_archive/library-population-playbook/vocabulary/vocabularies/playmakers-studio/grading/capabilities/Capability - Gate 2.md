---
type: capability
prefLabel: Gate 2
altLabels: [Gate 2, Confirm It's Proven, proven confirm, bank]
category: grading
subcategory: capability
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L82-100
context: grading
altitude: capability
---

## WHAT
_Stub —_ the second Director gate: judges [[Aggregate - Run Record]] against [[Value - Proof Spec]], rules decomposition granularity (a coarse graph is a legitimate projection), banks the play.

## WHERE
On [[Aggregate - Board]] — transitions a play from Built → Proven. Followed by the Register step (orchestrator action) which moves Proven → Live.

## WHY
Proves the play behaves as designed under real fixtures on the embedded factory — golden path passes every check AND at least one failure path is demonstrated.

## WHEN
After Lint and dry-runs. Re-required on a big edit's re-run campaign (BIG-EDIT step 7).

## HOW
- Definition of proven: golden run passes proof-spec eyeball checks; one failure path behaves as designed; Director rules granularity and banks.
- Hot Spot H2 — "bank" here is the *confirm* sense; `bank.sh` is the *file copy* sense; Vision's "banked" is the *output to library* sense. Three different operations.
