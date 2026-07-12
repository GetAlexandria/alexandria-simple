---
type: Capability
prefLabel: Harden
context: authoring
plane: Product
status: stub
altitude: capability
altLabels: [Hardening, Interview]
source_evidence:
  - studio/plays/README.md:73
  - studio/plays/registry.js:27
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Brief
  related_to:
    - Role - Hardener
---

## WHAT
The fresh-eyes interview step that attacks a brief's content and shape one question
at a time, surfacing soft spots before the design confirm. The step is alive and
well; only the legacy status *name* "hardened" is archeological.

## WHERE
README "The loop" Step 2; `frame-the-problem/hardening.md` is the worked example
(noted in `registry.js`).

## HOW
Harden operates on the [[Entity - Brief]] and is performed by the
[[Role - Hardener]]; it emits a hardening transcript and the brief is revised in
place.
