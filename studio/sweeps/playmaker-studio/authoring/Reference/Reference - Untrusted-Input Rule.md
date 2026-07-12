---
type: Reference
prefLabel: Untrusted-Input Rule
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [data-not-instructions, Injection Clause]
source_evidence:
  - studio/plays/README.md:289
  - studio/plays/TESTING.md:150
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Component - Node Prompt
    - Entity - Fixture
---

## WHAT
The standard, adopted from the field, that material from outside the team —
transcripts, customer documents, scanned code — is data to record, never commands to
follow. Closes the injection class; the brief's §3 declares which inputs are
untrusted.

## WHERE
README "rules adopted from the field" (untrusted inputs); TESTING.md says
untrusted-input fixtures embed an "ignore your rules…" plant to test the clause.

## HOW
The Untrusted-Input Rule is a clause every consuming [[Component - Node Prompt]]
carries; an untrusted-input [[Entity - Fixture]] plants a directive to prove the
clause holds.
