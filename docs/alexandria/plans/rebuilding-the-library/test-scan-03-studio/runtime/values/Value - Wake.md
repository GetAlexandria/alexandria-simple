---
type: value
prefLabel: Wake
altLabels: [wake, wake signal, wake subscription]
category: runtime
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/RUNTIME.md L90-104
context: runtime
altitude: value
---

## WHAT
_Stub —_ the reactivation signal: a monitor injects a ledger [[Value - Event]] into a session and the agent picks up. The event is a *signal*, not a full brief — agent inspects projected state if needed, then acts.

## WHERE
Subscriptions register which events wake which behavior. Mentioned: `commands/subscriptions.ts`, `domain/wake-subscriptions.ts`, the `alexandria-event-log` skill.

## WHY
Non-blocking event-sourced design needs a wake mechanism — otherwise the agent ends its turn and nothing resumes. Wake is what closes the loop.

## WHEN
Fired on every event subscribed for (e.g., `raven.vision.slot.approved` wakes Raven for the next slot).

## HOW
- Read the event → decide if it asks for action → optionally `ax inspect state --json` for context → act → write back through AX.
- Underlying: Raven Vision is the shipped reference; generic play-side plumbing is in flight (frame-the-problem-coin Slice 1 / #305).
