---
type: value
prefLabel: Event
altLabels: [event, ledger event]
category: runtime
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/RUNTIME.md L20-90
context: runtime
altitude: value
---

## WHAT
_Stub —_ one immutable record in the play's lifecycle log: `play.started`, `play.completed`, `play.failed`, `play.status_observed`, `play.human_input_requested`, `play.human_input_resolved`, plus play-specific variants (`raven.vision.slot.updated`, `raven.vision.banked`).

## WHERE
Appended to `events.jsonl` by the runtime — never by the agent directly. State-events defined in `packages/ax/src/domain/state-events.ts` (per docs; not opened by this scan).

## WHY
"The runtime is the only writer." Validation, idempotency, and projection stay consistent. The agent calls an AX command; the runtime writes the event.

## WHEN
Emitted on every lifecycle transition.

## HOW
- Lifecycle = `play.started / completed / failed / status_observed`.
- Human pair = `play.human_input_requested` / `play.human_input_resolved`.
- Idempotency keys per unit / question id.
- "Input by file / stdin, not shell interpolation" (apostrophes survive).
