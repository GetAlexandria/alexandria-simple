---
type: aggregate
prefLabel: Run
altLabels: [run, play run, Fabro run]
category: runtime
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/RUNTIME.md L41-118; studio/plays/TESTING.md L17-55
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ one execution of a registered [[Aggregate - Play]] on the embedded Fabro factory: launched, narrated to the event log, possibly suspended for human review, possibly woken, eventually completed/failed and (for human-in-the-loop plays) banked.

## WHERE
Launched by `ax run <slug>`. Lifecycle events written to `events.jsonl` by the runtime (never directly by the agent). Tracked in the Play Tracker. Records pulled into [[Aggregate - Run Record]] for grading.

## WHY
"A play is started, it does not start itself" — runs are first-class lifecycle things, not just invocations. Lifecycle events: `play.started / completed / failed / status_observed`.

## WHEN
On every `ax run` call (or trigger event). Suspended at human-input moments, resumed by wake.

## HOW
- Run modes: default fire-and-forget (detached); `--interactive` (attended TTY); `--auto-approve` (gates auto-resolved — smokes only); `--wait` (gather result inline).
- Trigger events: e.g., coin emits `play.requested`; Vision woken by `raven.vision.drafting_requested`.
- Idempotent: a re-delivered event or retried write is a graceful no-op (carry an idempotency key).
