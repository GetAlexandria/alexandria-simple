---
type: Entity
prefLabel: Fixture
context: proving
plane: Product
status: stub
altitude: aggregate
altLabels: [Case, Test Case]
source_evidence:
  - studio/plays/TESTING.md:59
  - studio/plays/TESTING.md:99
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Answer Key
  conforms_to:
    - Reference - Fixture Kit
  related_to:
    - Capability - Dry-Run
    - Reference - Untrusted-Input Rule
---

## WHAT
A behavior case bought by failure class, not difficulty — each fixture earns its
place by exposing a failure mode no other does. One directory per case, holding the
workflow's inputs as files named by input key.

## WHERE
`plays/<slug>/fixtures/<case>/`; TESTING.md "The fixture principle" and "Fixture
layout".

## HOW
A Fixture conforms to the [[Reference - Fixture Kit]] (its case is one of the kit's
classes) and may contain an [[Component - Answer Key]] under `expected/`; it is
consumed by a [[Capability - Dry-Run]]. An untrusted-input fixture plants the
[[Reference - Untrusted-Input Rule]] test.
