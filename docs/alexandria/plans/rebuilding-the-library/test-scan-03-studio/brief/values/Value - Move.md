---
type: value
prefLabel: Move
altLabels: [move, step, node]
category: brief
subcategory: value
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L62-101; studio/plays/AUTHORING.md L41-80; studio/plays/PROJECTION.md L56-67
context: brief
altitude: value
---

## WHAT
_Stub —_ one block inside [[Aggregate - Move Graph]]: a named step with a doer, declared inputs (consumes), declared outputs (emits), an optional fidelity override, plain-English work description, optional bounces, optional checkpoint.

## WHERE
A row inside `brief.md` §4. Projects to a node in [[Aggregate - Workflow Package]] (id-equal). Each move with a judgment doer gets a [[Component - Node Prompt]].

## WHY
The unit small enough that a single cold-doer agent (or human gate, or shell script) can be held responsible for it. Doer honesty (declare judgment / mechanical / human) is enforced because mislabeling lets quality gates pass garbage — autopsy precedent.

## WHEN
Authored inside the Move Graph. Re-named or re-routed: kicks back to a brief amendment (BIG-EDIT).

## HOW
- Doer: judgment | mechanical | human.
- `consumes`/`emits` names are *exact strings* — they must match across brief §4, frontmatter, body, wiring (Protocol E string-checks).
- "Smallest steps you can defend" — but not so small the graph balloons.
