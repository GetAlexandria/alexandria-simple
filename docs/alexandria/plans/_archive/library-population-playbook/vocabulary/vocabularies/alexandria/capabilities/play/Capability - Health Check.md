---
type: Capability
prefLabel: Health Check
altLabels:
  - Library Health Check
  - Periodic Assessment
category: [Capabilities]
subcategory: [play]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/capabilities/Capability - Health Check.md
---

# Health Check

## WHAT: Definition

_Stub — Health Check is the assessment capability at the front of Alexandria's periodic maintenance cycle. Conan answers "how healthy is the library right now?" by consuming the feedback queue (gap signals from Bridget's assemblies), the signal queue (contested claims from Solomon's triage), and provenance analytics (card usage patterns). Health Check is the big-picture, periodic read — distinct from Grading (which scores individual cards) and Linting (which checks structure). The full capability card is at [[Capability - Health Check]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Health Check]] (full card), [[Role - Conan the Librarian]] (executor), [[System - Feedback Queue]] (primary input), [[System - Signal Queue]] (secondary input)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — Health Check produces a prioritized maintenance agenda that feeds Surgery. It is periodic (not triggered by every card change) and consumes accumulated demand signal rather than point-in-time structural state._
