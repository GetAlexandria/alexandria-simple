---
type: Mechanism
prefLabel: Auto-Advance Contract
context: production-ladder
plane: Product
status: stub
altitude: capability
altLabels: [Advance Contract, Night Report, Contract]
source_evidence:
  - studio/plays/make-a-play/brief.md:154
  - studio/plays/make-a-play/brief.md:210
confidence: medium
proposed_by: back-of-house-walk
flow:
  - tier-bar
  - proof-spec
  - no-unclassified-failure
  - no-regression
  - independent-grade
links:
  operates_on:
    - Entity - Play
    - Entity - Risk Map
  related_to:
    - Pattern - Production Ladder
    - Mechanism - Director Gate
    - Economy - Pass Rate
---

## WHAT
The rule that decides, after a graded campaign, whether a Play promotes itself: it
evaluates five conditions and, on all-pass, auto-advances (tagged probationary);
on any miss, holds the card with the failing condition. It emits the "night
report" — one line per card.

## WHERE
`make-a-play/brief.md` §4 (`advance_contract`); the conditions are TESTING.md's
"Advancing a card". It correctly routes frame-the-problem's own exemplar to *held*.

## HOW
It is a staged evaluation — its five conditions in order are tier-bar,
proof-spec, no-unclassified-failure, no-regression, independent-grade — operating
on the [[Entity - Play]] and reading the [[Entity - Risk Map]] and
[[Economy - Pass Rate]]. It coexists with the manual [[Mechanism - Director Gate]]
on the same [[Pattern - Production Ladder]] — which is canonical for a given Play
is unstated (see HOT-SPOTS, runtime_vs_design).
