---
type: aggregate
prefLabel: Human Input Unit
altLabels: [unit, slot, review item]
category: runtime
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/RUNTIME.md L60-110
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ the unit of human review in a Raven-mediated play: a single item with state `awaiting review → approved / revised / skipped`. The play emits one unit, suspends, resumes per unit. The exemplar is the Vision *slot* (`empty → needs_review → approved / skipped`).

## WHERE
State carried in the runtime's run-state model. Resolution emits an event keyed by the unit id. Consumed and produced via AX commands; the runtime is the only writer to the event log.

## WHY
"Human judgment is non-blocking and event-sourced — never a blocking node." A blocking Fabro human node deadlocks a detached / Raven-mediated run. Units (not a boolean) let N open gates from day one.

## WHEN
Created when an agent reaches a review point. Resolved by Director reaction (approve / revise / skip). Resolution wakes the agent for the next unit.

## HOW
- One open ask at a time per reviewer is the safe default.
- Two agent roles split the work: a *drafting* path (produce a unit) and an *elicitation* path (help the human improve a unit).
- Idempotency-keyed by unit id.
- See [[Capability - Wake]].
