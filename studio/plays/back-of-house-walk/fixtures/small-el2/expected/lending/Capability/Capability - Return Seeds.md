---
type: Capability
prefLabel: Return Seeds
context: lending
plane: product
status: stub
confidence: high
proposed_by: back-of-house-walk
altitude: capability
altLabels:
  - return
source_evidence:
  - source/lending.md
links:
  operates_on:
    - Entity - Seed Loan
  produces:
    - Entity - Seed Packet
---

## WHAT

Returning seeds is how a loan is closed: the borrower brings back a share of the
harvested seeds.

## WHERE

At the lending desk, at the end of the growing season.

## HOW

A return closes the [[Entity - Seed Loan]] and adds the returned seeds back to the
catalog as a new [[Entity - Seed Packet]].
