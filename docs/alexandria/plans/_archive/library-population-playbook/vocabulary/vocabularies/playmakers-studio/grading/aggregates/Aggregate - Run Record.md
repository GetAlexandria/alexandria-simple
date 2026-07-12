---
type: aggregate
prefLabel: Run Record
altLabels: [run record, dry-runs, read-out]
category: grading
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TESTING.md L155-186; studio/plays/CLOSEOUT.md L18-23
context: grading
altitude: aggregate
---

## WHAT
_Stub —_ the durable record of one play run on the factory: per-stage prompts + responses, the graded read-out (against answer key + §7), failure traces verbatim, and a header stating what was tested and the grade.

## WHERE
`studio/plays/<slug>/dry-runs/` (or `fixtures/<case>/runs/` for case-scoped runs). Read-out is `dry-runs/read-out.md`. Pre-edit runs archived under `dry-runs/archive-<old-shape>/` on a big edit.

## WHY
"Every run gets a record … failures verbatim." "Failures are never cleaned up; they are the curriculum." The exemplar play's read-out is the standing testing curriculum.

## WHEN
Produced every time a graded run happens. Records carry n / pass-rate / CI for stochastic runs; "deterministic · 1/1" for mechanical checks.

## HOW
- Graders are fresh-eyes and blind to each other.
- String-match every quote (character-exact), count mechanically what can be counted.
- Consume `<slug>/known-fps.md` before reporting.
- Attest coverage: "examined X, nothing flagged" — never silence.
- "Cold-reader comprehension gate" for human-facing artifacts.
