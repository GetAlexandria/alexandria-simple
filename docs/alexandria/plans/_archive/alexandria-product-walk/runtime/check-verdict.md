# check_bundle verdict — alexandria-product

Move: `check_bundle` · Back-of-House Walk (EL2) · 2026-07-01
Read cold, no upstream reports consulted. Deterministic checker:
`bun studio/tools/check-threads.mjs` → **PASS** ("Thread contract check
passed: 3 library-threads.v1 source(s) parse with the shipped catalog
parser", exit 0).

## Findings

1. **LOW — altitudes.md summary tally disagrees with its own tables.**
   `runtime/altitudes.md:16-17` claims "pillar 5 · context 8 · aggregate 11 ·
   component 23 · value 14 · capability 9 = 70", but the per-context tables in
   the same file (and the cards' frontmatter) yield **context 9 · aggregate
   10** — the other four rungs match. One card is transposed in the summary
   line only; every per-card altitude row agrees with the card it describes,
   and no consumer reads the summary line. Cosmetic; correct opportunistically
   at the next emit or via EL3.
2. **INFO — `library.json` is a schema-mode marker only**
   (`{"schemaVersion": "product-card.v1"}`). Noted so a later reader does not
   mistake it for a missing catalog index; the cards themselves are the
   catalog. Not a checklist defect.

## Checks walked (all green)

1. **Typed links** — all 141 `[[...]]` references across the 71 cards and the
   keystone resolve to existing cards or context directories; every
   `links:`-block target (relations: `conforms_to`, `contains`,
   `derived_from`, `operates_on`, `produces`, `related_to`) resolves. Zero
   dangling targets.
2. **Frontmatter** — all 71 cards carry `type`, `prefLabel`, `context`,
   `plane`, `status`, `confidence`, `proposed_by`; every card's `context`
   matches its folder, and its `type` matches both its type directory and its
   filename.
3. **EVENTS.md nouns** — every noun the 33 timeline rows advance is carded;
   the four uncarded nouns (william, the legacy 208-card library, Hosted
   Product Instance, Library Area / Fill Readiness) are honestly declared in
   `runtime/contexts.md` § "Nouns honestly not carded".
4. **HOT-SPOTS.md** — all 21 hot spots name real cards (every backticked
   card reference exists) and each maps to a loadable thread in
   `threads.json`; the prior-gap section points at real threads.
5. **STAGE-2-BRIEF.md** — all 20 questions reference real cards and real
   thread ids; the 25 thread references cover exactly the 25 threads in
   `threads.json`, none dangling, none orphaned.
6. **threads.json provenance** — 25 threads, each with a director-register
   `question` distinct from its builder-register `reason`, an `emittingMove`
   (`pass1_events` / `pass2_carve` / `pass3_altitude` /
   `translate_search_prior`), and `sourceEvidence` whose file paths all exist
   in the repo; `sourceEvidence: []` appears only on the four prior-derived
   `translate_search_prior` threads, as allowed.
7. **Altitude consistency** — no containment inversion anywhere: no
   `contains` edge points from a lower rung to a higher one; no context mixes
   a pillar under a component parent. The four genuinely ambiguous calls are
   threaded (HS-18–21), not silently picked.
8. **workflows.json** — one workflow (`play-run-lifecycle`, unit = Play Run),
   26 steps; every step's `context` is a carved context directory, every
   `cardRef` resolves to a real card, every `evidence` path exists, and the
   33 EVENTS.md rows all map to a step (events 1–2 → steps 0–1, 3–4 → 2–3,
   5–10 → 4–5, 11–12 → 6–8, 13–22 → 9–17, 23–24 → 18, 25–28 → 19–21,
   29–33 → 22–25). No unit-advancing event is uncovered.
9. **library-search-prior.json** — root and runtime copies are identical.
   Every lead is dispositioned in EVENTS.md § "Prior-lead deltas": unit and
   shape CONFIRMED, path and places CONFIRMED (coin open question RESOLVED),
   stateField CORRECTED ("plural"), the three unconfirmable leads (living
   business plan, operating plane/mission control, federation mechanism)
   THREADED as gap threads plus the `frame-search-space` confirmation thread;
   the "responsibility" vocabulary lead is carried into the `Role - Agent`
   card body and the keystone. No lead silently dropped; no lead pruned by
   the fence.
10. **Keystone** — `_index/Concept - Alexandria.md` links exactly the eight
    context directories that hold cards (canvas, knowledge-production,
    ledger, library, playbook, product-shell, session-wake,
    vision-onboarding); set equality holds in both directions.

## Routing

The bundle is coherent end to end: 71 cards across 8 carved contexts plus a
keystone, 25 provenance-bearing threads, a covering workflow, a fully
dispositioned prior, and a passing deterministic thread check. The single
defect is a one-card tally slip in a summary line of a rationale document,
which no downstream consumer reads and which contradicts nothing at the card
level.

{"verdict": "PASS"}
