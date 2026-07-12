---
type: capability
prefLabel: Gate 1
altLabels: [Gate 1, Confirm the Design, design confirm]
category: brief
subcategory: capability
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L60-70; studio/plays/PROJECTION.md L70-72
context: brief
altitude: capability
---

## WHAT
_Stub —_ the first Director gate: approves [[Aggregate - Brief]] (including the graph shape of [[Aggregate - Move Graph]]) at the top of the brief. Nothing is derived before this.

## WHERE
On [[Aggregate - Board]] — transitions a play from Designed → Built. Recorded as a YAML header in `brief.md`: `gate-1: approved by Director` + date.

## WHY
The brief is the design; the workflow is its projection. Gating on the brief means the design is settled before any mechanical derivation; the alternative is litigating design questions after they've leaked into prompts.

## WHEN
After Hardening, before Derive. Re-required on a brief amendment that changes graph shape.

## HOW
- Lives outside the run, on the Board — NOT projected as a hexagon Fabro node.
- "Mechanics-forced detail calls are taste, not Director-challenge" — the studio decides micro-decisions an approved graph forces, surfaces them at the next gate.
