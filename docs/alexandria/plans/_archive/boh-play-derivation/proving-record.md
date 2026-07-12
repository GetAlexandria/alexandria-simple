# Phase C — Proving record (back-of-house-walk)

What was proven when the play was derived, 2026-07-03. Per the risk-map's own
discipline ("Leave the results empty — coverage is measured, not asserted"), the
`runs`/`result` columns stay blank until a graded live run lands; this record is
the deterministic + structural proof that the packaged play is coherent and its
contracts are satisfiable.

## C1 — Deterministic conformance (all green)

- `fabro validate` — OK (10 nodes, 19 edges).
- `check-workflow-edges.py` (ACP fail-closed, with the F6 fix) — OK.
- `check-placeholder-spelling.sh` (single-`AX_`) — OK.
- `check-moves.ts` (authored overlay ↔ derived spine) — OK.
- `check-risk-maps.mjs` — the BoH risk-map (incl. new OUT-10) bands into canonical
  families (ADV/CHN/IN/OUT/RE); the post-#269 detonation trap is clear.
- `studio/tools/check.sh` (full studio CI gate) — "All Studio data checks passed"
  (keystone `--all-sweeps`, risk-maps, workflows, threads, search-prior,
  machine-language on the golden traces, board-model).
- `packages/pms/tests/studio-workflow-edge-guard.test.ts` — 9/9 (incl. the 5 new
  F6 cases + the BoH-workflow case).

## C2 — N=1 smoke on a mini-fixture

`fixtures/small-el2/` — a fictional **Seed Library** (a domain no golden trace or
prompt example uses). Input (manifest + scope + a 3-doc source corpus) and an
**expected answer-key bundle** that passes **every** gate the play runs:

- `check-keystone.ts` — PASS (2 containers: catalog, lending; clean, not
  grandfathered).
- `check-machine-language.mjs` — PASS (7 card bodies read as product English).
- `check-workflows.mjs` shipped parser — the fixture `workflows.json` parses as
  `library-workflows.v1`, 0 failures.
- `check-threads.mjs` shipped parser — the fixture `threads.json` parses as
  `library-threads.v1`, 0 failures.
- No Basic Product Description supplied → **no** `library-search-prior.json`
  emitted (exercises IN-6, the no-description regression).

**Structural smoke** — `fabro run --dry-run` (simulated LLM) executes the graph
end-to-end and terminates SUCCEEDED; the simulated ACP node routes to the
fail-closed sink, confirming the ACP-fail edges are live and there are no dead
ends. (The golden-path traversal itself needs a real backend — owed with the
graded run.)

## C3 — Structure-level agreement with the golden traces

The two golden traces are real outputs of this method at their post-#563 homes;
running the play's contracts over them is the structure-level "diff." Fingerprint:

| bundle | contexts | cards | keystone | thread kinds | workflow | prior |
|---|---|---|---|---|---|---|
| `studio/sweeps/playmaker-studio` | 6 | ~92 | grandfathered | runtime_vs_design·docs_disagree·judgment_punt·split·demotion·missing_material·missing_context | 18 steps | no |
| `docs/alexandria/sweeps/alexandria-product` | 6 | 74 | **PASS clean** | +polysemy·missing_card | 26 steps | yes |
| `fixtures/small-el2/expected` | 2 | 7 | **PASS clean** | docs_disagree·missing_material·out_of_scope_suspect | 3 steps | no |

The fixture is a faithful miniature: same bundle contract (`<context>/<type>/`
cards + `_index` keystone + `library.json` + `workflows.json` + `threads.json` +
three reports), every thread kind canonical, every gate green. The play's emitted
contracts match what real runs produce.

## C3b — Graded live rep (2026-07-03, `--wait` through the embedded factory)

Ran the play for real via `ax run back-of-house-walk --input … --wait`. What it
proved and caught:

- **codex ACP fails on this host** — the default `codex-acp` adapter turn errors
  ~2s in (no API key; ChatGPT-subscription auth doesn't drive ACP turns, though
  `ax doctor` shows green). Ran instead with the installed **`claude-code-acp`**
  adapter via `--adapter-command`; real Claude ACP turns then executed.
- **Sandbox root is `docs/alexandria`**, file access confined to that subtree. A
  first attempt with the fixture under `studio/` (a sibling) had survey correctly
  **refuse** — proving the refuse → `acp_failed` → exit-1 path end to end with a
  real agent decision. Staging the corpus under `docs/alexandria/` fixed it.
- **F9 — the routing bug** (see findings): survey then did clean work but was
  mis-routed to `refuse` by an un-conditioned decision edge winning the
  unconditional tie-break. Fixed (weight the golden forward edge); the dry-run now
  traverses the full path. **This is the rep's headline result** — every
  deterministic gate had passed a non-executing golden path.
- **After the fix: a full green run.** The play executed the whole golden path
  (translate → survey → pass1 → pass2 → pass3 → emit → check → PASS → exit) and
  emitted a **gate-passing bundle**: `check-keystone` PASS (2 containers, clean),
  `check-machine-language` PASS (18 bodies read as product English), valid
  `workflows.json` (12 steps) and `threads.json` (all canonical kinds —
  docs_disagree · judgment_punt · polysemy · demotion · missing_card ·
  out_of_scope_suspect). `check_bundle` ran **both** deterministic gates itself
  (incl. the #595 machine-language gate) and resolved all 47 typed-links, the
  Small floor on every card, and both `out_of_scope_suspect` piles (no cards, no
  containers).
- **Structure-level agreement with the answer key:** same two contexts
  (`catalog`, `lending-desk`), same canonical thread-kind vocabulary; the live run
  was *richer* — 18 cards vs the fixture's minimal 7 (it carded Shelf Code,
  Variety, Return Window, two lifecycle Patterns, …). Same shape, more detail —
  exactly the "structure-level, not byte-equal" bar.

## Owed before `proven`

The N=1 graded rep is now **done and green** (above). What remains for `proven`
is the risk-map's measured campaign — k≈30 golden/hard-case runs, k≥100
adversarial — written back to the `runs`/`result` columns; that is a deliberate
batch, not a one-off. Reproduce a run: stage corpus + manifest + scope + output
under `docs/alexandria/` (the sandbox root), then `ax run back-of-house-walk
--input manifest=… scope=… output_path=… --wait --adapter-command
~/.alexandria/tools/acp/claude/latest/bin/claude-code-acp` (codex-acp needs an
API key on this host; the claude adapter works today).
