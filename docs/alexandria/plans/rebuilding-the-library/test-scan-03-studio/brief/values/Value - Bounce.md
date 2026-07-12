---
type: value
prefLabel: Bounce
altLabels: [bounce, bounce edge, kick back]
category: brief
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/PROJECTION.md L153-186; studio/plays/TEMPLATE-brief.md L70-90
context: brief
altitude: value
---

## WHAT
_Stub —_ a directed edge in [[Aggregate - Move Graph]] from a checking move *back to* the move that owns the failure. Carries a plain-English condition; projects to a condition-labeled Fabro edge.

## WHERE
Declared in a move's `bounces:` line. Projects to `workflow.fabro` edges per [[Component - Projection Rulebook]] §4. Visit-count escalates via [[Capability - Three Strikes Then Freeze]] to a Director gate or to exit.

## WHY
Bounces are play logic (the failure is owed back to its owner); retries are weather (transient infra). Three-strikes-then-freeze prevents an agent from grinding forever.

## WHEN
Authored at Move Graph time. A bounce existing only as prose is a hardening finding.

## HOW
- An ordering must be specified when a checker has *multiple* bounce targets and the failure case is mixed.
- ACP work nodes additionally need an outcome-guarded `exit-1` fallback (Protocol E.7 — enforced by `check-workflow-edges.py`).
