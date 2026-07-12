---
type: capability
prefLabel: Three Strikes Then Freeze
altLabels: [three strikes, freeze, max_visits, escalation edge]
category: runtime
subcategory: capability
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/PROJECTION.md L208-234; studio/plays/README.md L290-294
context: runtime
altitude: capability
---

## WHAT
_Stub —_ the standing rule: any agent loop (author fix-cycles, grader re-runs, hardening rounds, [[Value - Bounce]] loops) that fails the same defect three times stops, preserves state, and kicks to the Director with what was tried.

## WHERE
Layered: bounce-receiving checker carries an escalation edge guarded by `condition="context.internal.node_visit_count >= 3"` to a hexagon Director gate or to exit; `max_visits` on looping nodes caps runaway cycles at the engine level.

## WHY
"Three strikes" is gstack-adopted (Director ruling, 2026-06-11). Extends the doer's "re-check once" rule to every loop. Earned: agent loops can grind forever otherwise.

## WHEN
Every bounce loop. Every fix cycle.

## HOW
- Escalation edge set ONE visit before backstop trips — freeze is a designed handoff, not an engine failure.
- Distinct from node *retries* (`retry_policy` / `max_retries`) — those are weather, not play logic.
- Bounces are play logic and ride edges; retries are weather and ride retry policy.
