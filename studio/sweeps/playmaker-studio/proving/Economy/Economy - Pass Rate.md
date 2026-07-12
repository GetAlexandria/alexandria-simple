---
type: Economy
prefLabel: Pass Rate
context: proving
plane: Product
status: stub
altitude: value
altLabels: [Rate, Reliability Parameter]
source_evidence:
  - studio/plays/TESTING.md:222
  - studio/plays/TESTING.md:274
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Economy - Validation
    - Reference - Measurement Policy
    - Mechanism - Auto-Advance Contract
---

## WHAT
The reliability parameter the studio actually cares about — the probability a play
clears the bar across runs, reported with its sample size (n · pass · CI), never a
bare label. A single run is a sample, not a measurement.

## WHERE
TESTING.md "Measurement, sampling & significance" (precision scales with √k; the rule
of three; n=1 is sufficient only for deterministic checks).

## HOW
A Pass Rate is the number behind the [[Economy - Validation]] axis, governed by the
[[Reference - Measurement Policy]] (how many runs), and read by the
[[Mechanism - Auto-Advance Contract]]'s tier-bar condition.
