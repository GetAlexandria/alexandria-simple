---
type: surface
prefLabel: Site Server
altLabels: [site-server.py, the server]
category: production-line
subcategory: surface
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/HANDOFF.md L304-312
context: production-line
altitude: component
---

## WHAT
_Stub —_ the Python server (`site-server.py`) that serves the Studio site AND persists [[Aggregate - Board State]] via one POST endpoint (`/api/board-state`). NOT plain `http.server` — the Board needs the persist endpoint or drags don't save.

## WHERE
`studio/site-server.py`. Run from `studio/` with `python3 site-server.py 8778`. Listens on port 8778.

## WHY
"One endpoint" design — the Board's only state mutation is a single POST. Trying to use plain `http.server` serves the site but Board drags silently fail; the page says so loudly.

## WHEN
Started at session boot when working on Studio surfaces. Now redundant with the viewer-next surface but kept as fallback until the Director-session test retires it.

## HOW
- One endpoint: POST `/api/board-state` → writes `plays/board-state.json`.
- Static-file serving for everything else.
