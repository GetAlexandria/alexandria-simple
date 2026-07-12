---
type: component
prefLabel: Answer Key
altLabels: [answer-key.md, expected/answer-key.md]
category: grading
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/TESTING.md L99-152
context: grading
altitude: component
---

## WHAT
_Stub —_ the pre-run expected-correct-behavior spec for a fixture: every plant verbatim-findable, counts matching, designed decoys documented. Written blind to any run.

## WHERE
`studio/plays/<slug>/fixtures/<case>/expected/answer-key.md`. Owned by the fixture, not the workflow.

## WHY
"Suspect the key before the doers" — rung 1's hunch-rule "2/4 miss rate" was really 4/4 because a loose intended-hunch clause in the key licensed the failure. The key is the grading reference; if it drifts, grading drifts.

## WHEN
Written when the fixture is built — before any run. Re-tuned on every big edit (BIG-EDIT step 3: "answer-keys to the new outputs and move names").

## HOW
- Mechanically verify the fixture before trusting results.
- Purity: prompt never contains a fixture's answer; fixture characters never appear in prompt exemplars.
- Documents intentional decoys (e.g., rung 1's budget block "vendor" hit by design).
