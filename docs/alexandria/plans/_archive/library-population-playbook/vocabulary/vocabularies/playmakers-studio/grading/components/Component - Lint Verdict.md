---
type: component
prefLabel: Lint Verdict
altLabels: [lint.md, Protocols A-E]
category: grading
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/AUTHORING.md L225-265; studio/plays/README.md L66-68
context: grading
altitude: component
---

## WHAT
_Stub —_ [[Agent - Checker]]'s mechanical contract verdict on a workflow package — Protocols A-E run per node prompt (A coverage, B purity, C executability, D hygiene) plus E (parity, the anti-drift protocol; package-level).

## WHERE
`studio/plays/<slug>/lint.md`. Required for the **Built → Proven** transition. Blocks banking on Protocol E failure.

## WHY
Catches the class of error the Director can't read — self-contradictions, undeclared inputs, vague outputs, design rationale leaking into prompts, brief↔workflow drift.

## WHEN
Rung 5 of the loop. Re-run on every big edit (BIG-EDIT step 4).

## HOW
- **Protocol A** Coverage — every brief element present per move.
- **Protocol B** Purity — no provenance, no design rationale, no machinery nouns, no session vocabulary, no unresolvable refs, no seam-leak patches.
- **Protocol C** Executability — each prompt + Fabro context + declared inputs suffice for §7's part.
- **Protocol D** Hygiene — vocabulary purity, one-home-per-rule, definition-before-use.
- **Protocol E** Parity — brief↔workflow↔prompts, mechanical where possible. `fabro validate` is E.6; `check-workflow-edges.py` is E.7 (ACP fails closed).
- "Quote or demote" — every finding quotes the line, or is demoted.
