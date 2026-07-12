---
type: Reference
prefLabel: Measurement Policy
context: proving
plane: Product
status: stub
altitude: component
altLabels: [Run-Count Policy, Sampling Policy]
source_evidence:
  - studio/plays/TESTING.md:216
  - studio/plays/TESTING.md:265
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Economy - Pass Rate
    - Capability - Dry-Run
---

## WHAT
The standard for how many graded runs a claim needs — smoke (k≈5), estimate (k≈30),
ship-gate (k≥100 or rule-of-three for the reliability bar). Deterministic checks are
exempt (n=1). Never pool across tests; a risk's headline is its weakest required
test.

## WHERE
TESTING.md "Measurement, sampling & significance" and "Run-count policy".

## HOW
The Measurement Policy governs how a [[Economy - Pass Rate]] is earned across
[[Capability - Dry-Run]] repetitions and which label (passing / needs work /
provisional) the result derives.
