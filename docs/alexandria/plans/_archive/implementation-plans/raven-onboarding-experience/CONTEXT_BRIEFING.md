# Context Briefing: Raven Onboarding Experience

This briefing was assembled from the Raven onboarding planning conversation, the prototype at `docs/alexandria/plans/canvas-library-spike/`, the current product plan at `docs/alexandria/plans/_archive/raven-onboarding-experience/plan.md`, and the AX2 / Viewer Next package guidance. A separate Bridget context-library pass was not run for this local drafting pass.

## Primary Context

- AX2 owns deterministic runtime support, config state, event ledger projection, and local viewer APIs.
- Viewer Next is a static Astro/React interface served by `ax2 start viewer`; it should call local runtime APIs instead of reading workspace files or ledger JSONL directly.
- Raven is the first Alexandria Next agent surfaced in this experience. Raven belongs on the bottom agent shelf, not in top-level navigation.
- Source intake is Alexandria-wide. Sources are not Raven-specific, and a source item should be usable by later agents and plays.
- Raven's Knowledge Bank is a checklist/status map for Raven capability areas. It is not the Library and should not look like a parallel library of cards.

## Decisions Carried Into Tickets

- `alexandria-config.json` stores compact config pointers and Raven state. Source inventory is projected to `sourcesPath`, defaulting to `.alexandria-next/sources.jsonl`.
- The source projection is reducer-produced from ledger events and atomically rewritten.
- Source originals live under `docs/alexandria/sources/originals/`; processed summaries live under `docs/alexandria/sources/processed/<sourceId>/<runId>.md`.
- URL, typed note, conversation, and voice note intake first become workspace files, then source items.
- Source-code processing is modeled but deferred.
- Raven connection state is runtime/plugin-derived and not stored in `agents.raven`.
- Vision onboarding status is `not_started`, `in_progress`, `ready_to_bank`, or `banked`.
- Vision slot status is `empty`, `needs_review`, `approved`, or `skipped`.
- Manual slot editing is always supported.
- Raven's Source of Truth is a whole internal Markdown document, not user-facing sections keyed by Knowledge Bank subjects.
- Play unlocks are computed from Knowledge Bank state plus the play manifest, not stored in Raven state.

## Anti-Patterns

- Do not recreate the prototype's long `1.1` to `1.9` phase rail.
- Do not put Raven in top-level app navigation.
- Do not put Sources under Raven.
- Do not use source sliders.
- Do not use one textarea with "one source per line."
- Do not generate Library cards in this slice.
- Do not defer Web UI or CLI verification to a final cleanup ticket; every ticket must prove both surfaces.
