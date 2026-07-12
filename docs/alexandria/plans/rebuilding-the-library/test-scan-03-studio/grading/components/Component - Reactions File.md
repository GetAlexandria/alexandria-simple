---
type: component
prefLabel: Reactions File
altLabels: [reactions.json, scripted reactions]
category: grading
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/TESTING.md L46-55
context: grading
altitude: component
---

## WHAT
_Stub —_ a per-fixture JSON file that scripts pre-canned answers for every human gate the play encounters, in order. Lets a campaign grade gate behavior without a live human.

## WHERE
`studio/plays/<slug>/fixtures/<case>/reactions.json`. Consumed by `ax run <slug> --fixture <case> --reactions <case>/reactions.json`.

## WHY
The default `--auto-approve` (Yes / first option) is legal only for gateless plays or structural smokes — **never for grading a gate's behavior**. Reactions traverse the `review ⇄ revise` loop deterministically.

## WHEN
Authored when a gate-carrying play enters the testing phase. Required for any campaign that grades gate logic.

## HOW
- JSON array of pre-canned answers, in gate-encounter order.
- Wired through `--reactions` flag at run time.
- `--interactive` only for a human in their own terminal — it deadlocks a detached run.
