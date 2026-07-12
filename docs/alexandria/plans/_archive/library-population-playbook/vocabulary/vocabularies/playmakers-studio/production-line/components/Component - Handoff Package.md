---
type: component
prefLabel: Handoff Package
altLabels: [HANDOFF.md, session-start package]
category: production-line
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/HANDOFF.md L1-30; studio/plays/CLOSEOUT.md L1-50
context: production-line
altitude: component
---

## WHAT
_Stub —_ the session-start package — the doc the next orchestrating agent reads first and trusts completely. Carries: standing rulings, read-order for the rulebooks, current state summaries, the next session's first move.

## WHERE
`studio/plays/HANDOFF.md`. Refreshed at every [[Component - Closeout Checklist]].

## WHY
"If it is stale, the next session starts on false ground and burns budget re-deriving or, worse, doesn't notice." The provenance anchor for the whole workstream.

## WHEN
Read at session start. Refreshed at session close (CLOSEOUT step 4). Validated by the cold launch test (CLOSEOUT step 6).

## HOW
- One line per fact; detail lives in dated session blocks and artifacts.
- Sections: standing rulings · read order · who you work for · model economics · where things go · booting · state-as-of (dated).
- "The missing exemplar" section names known gaps explicitly.
