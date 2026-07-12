---
type: Reference
prefLabel: Known-FPs Ledger
context: proving
plane: Product
status: stub
altitude: component
altLabels: [known-fps.md, Known False Positives]
source_evidence:
  - studio/plays/README.md:306
  - studio/plays/TESTING.md:172
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Role - Grader
    - Role - Checker
---

## WHAT
A per-play ledger of the patterns a fresh-eyes checker or grader reliably flags that
are dispositioned by design, each with provenance. It never excuses a novel
instance — entries name exact patterns.

## WHERE
`plays/<slug>/known-fps.md`; README "rules adopted from the field" (each play keeps
one); checkers and graders consume it before reporting.

## HOW
The Known-FPs Ledger is read by the [[Role - Grader]] and the [[Role - Checker]]
before they report, so a by-design pattern is not re-flagged.
