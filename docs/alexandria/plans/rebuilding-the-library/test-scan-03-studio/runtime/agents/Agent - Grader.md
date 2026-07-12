---
type: agent
prefLabel: Grader
altLabels: [Grader]
category: runtime
subcategory: agent
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L53-56; studio/plays/TESTING.md L155-186
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ the agent that runs the workflow on the embedded factory against [[Aggregate - Fixture Kit]] and writes a graded read-out against [[Value - Proof Spec]].

## WHERE
Runs `ax run <slug> --fixture <case>` on the factory. Writes [[Aggregate - Run Record]] under `dry-runs/`. Consumes [[Component - Known FPs Ledger]] + [[Component - Answer Key]] before reporting.

## WHY
The output bank: a graded read-out is the artifact that goes to Gate 2 for the Director to judge. Grading is what carries a play from Built to Proven.

## WHEN
Rung 6 of the loop. Re-run on every big edit.

## HOW
- Fresh-eyes, blind to each other (multiple independents on the ceiling case).
- String-match every quote (character-exact).
- Mechanically count what can be counted.
- Attest coverage.
- Cold-reader comprehension gate for human-facing artifacts.
- "Suspect the key before the doers" when graders disagree.
- Subject to three-strikes-then-freeze.
