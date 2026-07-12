---
type: System
prefLabel: Signal Queue
altLabels:
  - signal-queue.jsonl
  - Contested Claims Queue
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Signal Queue.md
---

# Signal Queue

## WHAT: Definition

_Stub — the Signal Queue is a persistent staging area for claims that are not yet settled enough to enter the library as source material. Solomon writes contested and open claims to `signal-queue.jsonl` with structured metadata: the claim text, positions held, evidence for each position, affected library cards, resolution criteria, a revisit date, and epistemic status. Raven reads the queue during product conversations to surface unresolved claims. Conan reads it during Health Check. The queue is consumed when evidence arrives and the Director resolves the claim. The full system card is at [[System - Signal Queue]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[System - Signal Queue]] (full card), [[Role - Solomon the Sentinel]] (writes to the queue), [[Role - Raven the Maven]] (reads during product conversations), [[Role - Conan the Librarian]] (reads during Health Check)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — items enter the queue from Solomon's triage. Items leave when the Director resolves the claim (via the standard source update pipeline). Unresolved items stay in the queue with revisit dates._
