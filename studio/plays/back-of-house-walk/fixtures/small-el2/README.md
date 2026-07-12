# small-el2 — Back-of-House Walk mini-fixture

A minimal, self-contained input + expected-output pair for the Back-of-House
walk, in the shape the `small-el2` pattern uses for the chain. It exists to give
the play an N=1 smoke target small enough to read whole and to prove the emit /
check contracts are *satisfiable and gate-passing*.

The product under scan is a fictional **Seed Library** (a community seed-lending
catalog + lending desk) — a domain no other fixture or golden trace uses, so an
answer here cannot be pattern-matched from elsewhere.

## input/

What a run consumes:

- `manifest.md` — the EL1-style source list (roots + globs).
- `scope.yaml` — the operator product boundary (in-scope / out-of-scope).
- `source/` — the tiny product corpus the walk reads (three docs).

No Basic Product Description is supplied, so a correct run emits **no**
`library-search-prior.json` and stays source-only (exercises IN-6).

## expected/

The answer-key bundle a correct run should produce — used to grade a real run at
structure level (contexts, card counts ±, thread kinds), never byte-for-byte:

- two card-bearing contexts, `catalog` and `lending`; the `_index` keystone
  story names both and only both (passes `check-keystone.ts`);
- six stub cards, each with the Small floor + `confidence`/`proposed_by` and a
  product-English `## WHAT`/`## WHERE`/`## HOW` body (passes
  `check-machine-language.mjs`);
- `workflows.json` — the Seed Packet lifecycle (catalogue → borrow → return);
- `threads.json` — one `docs_disagree` hot spot and one `missing_material` gap,
  each with full notepad provenance;
- the three reports (`STAGE-2-BRIEF.md`, `HOT-SPOTS.md`, `READ-COHERENCE.md`).

## Proof status

The expected bundle passes every deterministic gate the play runs
(`check-keystone`, `check-machine-language`, `check-workflows`, `check-threads`).
The graded live run against this input is owed — coverage is measured, not
asserted (risk-map "Leave the results empty").
