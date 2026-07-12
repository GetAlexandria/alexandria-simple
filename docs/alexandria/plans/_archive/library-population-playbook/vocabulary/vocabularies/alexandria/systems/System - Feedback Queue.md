---
type: System
prefLabel: Feedback Queue
altLabels:
  - feedback-queue.jsonl
  - Gap Signal Queue
  - Demand Signal
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Feedback Queue.md
---

# Feedback Queue

## WHAT: Definition

_Stub — the Feedback Queue accumulates actionable signals from library operations: gap manifest entries from Bridget's assemblies (cards that should exist but don't), weak-card flags (cards retrieved but too thin to be useful), retrieval misses (cards the retrieval profile should have found but didn't), and relationship discoveries (connections noticed during traversal that are not recorded as wikilinks). Items are written to `feedback-queue.jsonl`. Conan consumes the queue during health checks to prioritize maintenance work. The Feedback Queue is the library's memory of its own service quality. The full system card is at [[System - Feedback Queue]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[System - Feedback Queue]] (full card), [[Role - Bridget the Briefer]] (the primary writer), [[Role - Conan the Librarian]] (the consumer during Health Checks), [[System - Provenance Log]] (sibling — the Provenance Log records what happened; the Feedback Queue records what should improve)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub._
