---
plane: product
status: stub
confidence: medium
altitude: value
altLabels: []
evidence:
  - packages/ax/src/domain/atomic-card-categories.ts
  - docs/alexandria/plans/knowledge-organization-planes-contexts/plan.md
links:
  related_to:
    - Entity - Atomic Card Category
    - Entity - Type
    - Entity - Measure
    - Entity - Research
    - Experiment - The Tests We Run
---

## WHAT

One of the fourteen families-category buckets: a bounded test that earns
evidence a company does not yet hold. A prediction is written before the
run, and a stop is committed in advance — a span of time, a count of
attempts, a budget, or a guardrail breach — so the test is built to come
out either way rather than run until it says what its owner hoped.
Experiment lives on the Learning plane.

## WHY

A bounded test earns its own card so a colleague can weigh the
prediction and the stop apart from whatever the run turned up —
atomization applied to the test itself,
[[Bet - Atomic, Agent-Readable Knowledge]]. Committing the stop before
the run is what keeps a director able to tell what would have counted as
failure at a glance, rather than reconstructing it after the fact,
[[Principle - Legible Graph]].

## WHERE

The bucket a card's [[Entity - Type]] carries when its subject is a
bounded test. Experiment lives on the Learning plane, where
[[Experiment - The Tests We Run|the tests the product runs]] is the
shelf that carries this bucket's cards.

## HOW

Experiment, one of the buckets in the [[Entity - Atomic Card Category]],
differs from its nearest neighbor, [[Entity - Measure]], by how it ends:
an experiment is built to stop and resolve to a verdict, while a measure
reads without end and never resolves to one. Experiment is also
distinct from [[Entity - Research]]: the test is the bounded question
asked in advance, while a Research card is the settled result the test
leaves behind once it is called.
