---
type: aggregate
prefLabel: Fixture Kit
altLabels: [fixture kit, fixtures, the minimum viable kit]
category: grading
subcategory: aggregate
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/TESTING.md L68-134
context: grading
altitude: aggregate
---

## WHAT
_Stub —_ a play's set of test cases, organized by **failure class** (not difficulty): **golden** (baited), **refusal**, **empty** (degradation), **rerun** (state), **hard-case** (factored ceiling). One directory per case under `fixtures/`.

## WHERE
`studio/plays/<slug>/fixtures/<case>/`. Each case dir holds workflow inputs as files named by input key (`transcript.md`, `surface_map.md`, …). Optional `expected/` subdir holds answer keys.

## WHY
"Fixtures are bought by failure class, not difficulty" — a fixture earns its place by exposing a failure mode no other exposes. A medium-difficulty fixture buys grader noise, not information.

## WHEN
Authored at the **Built** stage alongside the workflow package — a play is not Built until its fixtures exist.

## HOW
- Classes 1-3 (golden, refusal, empty) are universal.
- Class 4 (rerun) for plays that revise prior artifacts.
- Class 5 (hard-case) is owed before bank, not before Gate 1.
- Inputs are passed as file paths (not inlined content); a deliberately omitted optional input passes empty.
- `expected/` is never passed as input — it's grading material.
