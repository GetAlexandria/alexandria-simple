---
type: Capability
prefLabel: Output Bank
context: runs
plane: Product
status: stub
altitude: capability
altLabels: [Bank, Output Bank]
source_evidence:
  - studio/plays/RUNTIME.md:109
  - studio/plays/RUNTIME.md:116
confidence: medium
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Ledger
  related_to:
    - Capability - Package Bank
---

## WHAT
The operation that banks a play's *deliverable* into the library / state when the
units resolve (Vision: `ax raven vision bank` → `raven.vision.banked`). It is NOT the
package bank.

## WHERE
RUNTIME.md §6 ("Output bank"), explicitly distinguished from `bank.sh`.

## HOW
The Output Bank writes a banked event to the [[Entity - Ledger]]; it is the
deliverable-banking counterpart of the [[Capability - Package Bank]] (the bank
polysemy — see HOT-SPOTS).
