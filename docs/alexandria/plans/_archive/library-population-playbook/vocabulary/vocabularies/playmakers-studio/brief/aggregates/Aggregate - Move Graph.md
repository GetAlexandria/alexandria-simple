---
type: aggregate
prefLabel: Move Graph
altLabels: [§4, move graph, golden path]
category: brief
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L52-101; studio/plays/PROJECTION.md L52-70; studio/plays/README.md L108-130
context: brief
altitude: aggregate
---

## WHAT
_Stub —_ the brief's §4: the play's logic authored as a directed graph of [[Value - Move]]s with explicit doers, contracts (consumes / emits), bounce edges, and in-play checkpoints. The single source from which workflow, diagram, and story view all derive.

## WHERE
Lives inside [[Aggregate - Brief]] §4. Projected into [[Aggregate - Workflow Package]] per [[Component - Projection Rulebook]]. Rendered as [[Component - Diagram]] and [[Component - Story View]] by [[Component - Derive Views Tool]]. Lives next to the **story** (a human-forward paragraph that opens §4).

## WHY
Authoring logic as a graph (not a monolithic prompt) means renderings can derive deterministically and parity can be lint-checked (Protocol E). Docs are explicit: "the workflow, the diagram, and the story view all derive from it."

## WHEN
Authored during the Brief step. Required for Gate 1. Re-authored when the play is edited (the BIG-EDIT order: edit brief → re-derive → re-tune fixtures → re-audit).

## HOW
- Each move block declares: `doer` (judgment | mechanical | human), `consumes`, `emits`, optional `fidelity`, `does`, `bounces`, optional `checkpoint`.
- "Edges, not margins" — a bounce described only in prose is a hardening finding.
- A checker with >1 bounce target must order the mixed-failure case.
