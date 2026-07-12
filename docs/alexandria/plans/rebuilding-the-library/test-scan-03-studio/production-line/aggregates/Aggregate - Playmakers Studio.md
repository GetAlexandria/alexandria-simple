---
type: aggregate
prefLabel: Playmaker's Studio
altLabels: [Studio, Playmaker Studio, the Studio]
category: production-line
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/README.md (not opened); studio/plays/README.md L1-30; studio/plays/HANDOFF.md L1-30
context: production-line
altitude: pillar
---

## WHAT
_Stub —_ the workbench where Plays are written. "How a play goes from a named slot to **live** — registered in Alexandria, runnable by users — who does what, and what each stage means." A docs-first, governance-led production line with a Director-gated loop and a live review site.

## WHERE
`studio/` in the alexandria-internal monorepo. Surfaces: [[Aggregate - Board]] (`board.html`), [[Read-Model - Play Registry]] (`registry.html`), per-play workshop pages (`<slug>/index.html`). Site served by `python3 site-server.py 8778`.

## WHY
"This is the front-end the old factory never had: the Director designs and judges outcomes; agents author and verify mechanically. Every checkpoint emits an artifact the Director can read and judge — never code."

## WHEN
Currently being considered for spin-out as its own product (per scan brief — not in docs).

## HOW
- Self-contained: static HTML + state files, no package tooling.
- Holds an "inheritance" archive — autopsy records + quarantined conventions ([[Aggregate - Inheritance]]).
- Two related but distinct lifecycles: the Studio's *production line* (how a play is made) and the Runtime's *run lifecycle* (how a registered play executes).
