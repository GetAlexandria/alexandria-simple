---
type: Capability
prefLabel: Grading
altLabels:
  - Quality Grading
  - Card Grading
  - Scoring
category: [Capabilities]
subcategory: [play]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/capabilities/Capability - Grading.md
  - docs/alexandria/library/product/systems/System - Quality Grading Engine.md
---

# Grading

## WHAT: Definition

_Stub — Grading is Conan's capability: applying the five-dimension rubric (WHAT, WHERE, WHY, WHEN, HOW) to produce card-level letter grades, zone-level aggregate scores, and a system-wide score. Each dimension is scored A through F with equal 20% weighting. Zone scores aggregate card scores with a completeness cap. Grading is judgment-based (human-quality assessment), not deterministic (Linting handles structural checks). The full capability card is at [[Capability - Grading]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Grading]] (full card), [[Role - Conan the Librarian]] (the only agent who grades), [[System - Quality Grading Engine]] (the mechanism), [[Capability - Linting]] (structural pre-screen that runs before Grading)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — Grading sampling rate: 20% minimum (minimum 10 cards). Full population grading is reserved for initial seeding and health checks. Conan's rage meter communicates grade severity: silent at A, apoplectic at F._
