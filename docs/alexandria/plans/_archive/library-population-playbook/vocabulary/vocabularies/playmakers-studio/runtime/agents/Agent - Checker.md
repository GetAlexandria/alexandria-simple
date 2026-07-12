---
type: agent
prefLabel: Checker
altLabels: [Checker]
category: runtime
subcategory: agent
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L50-53; studio/plays/AUTHORING.md L225-265
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ the agent that runs the mechanical contract lint (Protocols A-E) on the workflow package and writes [[Component - Lint Verdict]].

## WHERE
Reads [[Aggregate - Workflow Package]] + [[Aggregate - Brief]] + [[Component - Known FPs Ledger]]. Writes `lint.md`.

## WHY
Catches the error class the Director can't read — self-contradictions, undeclared inputs, vague outputs, design rationale leaking into prompts, brief↔workflow drift.

## WHEN
Rung 5 of the loop. Blocks the Built → Proven transition.

## HOW
- A through D run per node prompt; E runs on the package.
- "Quote or demote" findings.
- Consumes `known-fps.md` before reporting.
- Subject to three-strikes-then-freeze.
- "Attested coverage" — verdicts say what was examined ("examined X, nothing flagged"), never silence.
