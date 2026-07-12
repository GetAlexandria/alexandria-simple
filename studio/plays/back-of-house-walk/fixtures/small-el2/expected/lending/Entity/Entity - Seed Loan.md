---
type: Entity
prefLabel: Seed Loan
context: lending
plane: product
status: stub
confidence: high
proposed_by: back-of-house-walk
altitude: aggregate
altLabels:
  - loan
source_evidence:
  - source/lending.md
links:
  operates_on:
    - Entity - Seed Packet
  related_to:
    - Role - Borrower
---

## WHAT

A seed loan is the open record of a checkout: who took which seeds, and when.

## WHERE

Opened and closed at the lending desk.

## HOW

When a [[Role - Borrower]] checks out a packet, the desk opens a loan against that
[[Entity - Seed Packet]]. The loan stays open until the borrower brings a share
of the harvested seeds back.
