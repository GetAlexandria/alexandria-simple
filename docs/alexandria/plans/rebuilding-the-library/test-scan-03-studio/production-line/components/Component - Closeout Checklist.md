---
type: component
prefLabel: Closeout Checklist
altLabels: [CLOSEOUT.md, session close]
category: production-line
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/CLOSEOUT.md L1-76
context: production-line
altitude: component
---

## WHAT
_Stub —_ the session-end checklist that makes recorded state match actual state, so the next session launches clean. Six numbered steps + economics guidance.

## WHERE
`studio/plays/CLOSEOUT.md`. Triggered at every session end.

## WHY
"Sessions that skip it leave the next agent launching on stale ground." Read at session **start** too — the closeout defines what the end of the session owes.

## WHEN
Read at session start (so you know what you owe); executed at session end.

## HOW
Six steps:
1. Records before memory — every dry run, design change, prompt change in an artifact.
2. Growth plans are living — update §8s, dating items "executed."
3. The website tells the truth — registry, workshops, link checks.
4. Refresh the session-start package — date the state, sweep for invalidated sections.
5. Debts are declared, never silent.
6. **The cold launch test** — spawn a fresh Sonnet agent, have it read [[Component - Handoff Package]] only, report back.
