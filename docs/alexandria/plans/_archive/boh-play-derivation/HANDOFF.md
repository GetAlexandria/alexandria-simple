# Handoff: Derive the Back-of-House Walk via Make-a-Play

For the agent taking this on (2026-07-02). Mission: turn the Back-of-House
Walk (EL2) from a Gate-1-approved brief into a registered, provable play — by
**dogfooding make-a-play** as the derivation engine. This is deliberately a
two-for-one: BoH is the most important undelivered play, and this is
make-a-play's hardest real rep. Director ruling: "if I can dogfood it to make
the back-of-house play, that's time well spent." Both outcomes are wins —
a derived play, or the best make-a-play defect list yet. Report failures as
findings, never as workarounds smuggled past the meta-play.

## Inputs (all on main unless noted)

- **The brief**: `studio/plays/back-of-house-walk/brief.md` (1,161 lines,
  Gate 1 approved 2026-06-24; §4 move graph, §6 draft prompt language, §7
  proof-spec/risk-map seeds) + `moves.md` + `risk-map.md`.
- **Two real executions as golden traces** (agent-executed to the brief's
  method): the PMS sweep (`studio/sweeps/playmaker-studio/`) and the
  Alexandria scan (`docs/alexandria/sweeps/alexandria-product/`, esp. its
  `runtime/` artifacts: source-ladder, EVENTS, contexts, altitudes,
  check-verdict). These are your fixture/eval raw material.
- **The engine**: make-a-play (registry status `built`; modules
  `make-a-play`, `:design`, `:build`; run via `ax run make-a-play
  --review-level …`). Read `studio/plays/make-a-play/brief.md` +
  `hardening.md` + `studio/plays/AUTHORING.md` + `TESTING.md` first.
- Deterministic gates: `studio/tools/` validators (check-workflows,
  check-threads, check-keystone, risk-map/play conformance), the play
  conformance gate in the ax/viewer suites.

## Phases

**A — Brief refresh (small, surgical).** Reconcile the brief with canon that
postdates it, folding in what the two live runs proved: emit must satisfy the
keystone conformance gate (#546) — the emitted `_index` story uses all and
only the carved containers; the scope fence (#547) — out-of-scope piles
become `out_of_scope_suspect` threads, never containers; the sweep's output
home convention post-#563 (`docs/alexandria/sweeps/<product>/` for
Alexandria-side products, `studio/sweeps/` for PMS); **all four inputs
declared** (manifest, output_path, answer_key, basic_product_description) —
the play must refuse loudly on undeclared/dropped inputs (the 2026-07-02
draftLog silent-drop is the cautionary specimen); §7's fixtures section names
the two golden traces. Do not redesign the move graph — Gate 1 approved it.

**B — The make-a-play dogfood run.** Run make-a-play against the refreshed
brief. The director holds its review gates (coordinate session timing with
him; he is the human in this loop). Capture every friction, wrong output, and
manual intervention as a finding with evidence — the meta-play's defect list
is half the deliverable. If make-a-play cannot complete derivation, stop and
report; hand-finishing is a separate, explicit director decision.

**C — Prove.** (1) Deterministic conformance: derived workflow validates
(`fabro validate`), placeholders use the single-underscore `AX_` runtime
convention, risk-map carries post-#269 canonical family ids (the known
detonation trap), studio↔plugin copies in sync. (2) N=1 smoke on a small
fixture (author a mini-manifest fixture in the play's `fixtures/`; the
`small-el2`-style pattern). (3) One real rep: re-scan a known corpus (e.g.
`test-scan-03-studio`'s target or the PMS scope) and diff the bundle against
its golden trace — structure-level agreement (contexts, card counts ±,
thread kinds), not byte equality.

**D — Register and wire.** Registry entry advances from `designed`; plugin
payload carries the workflow + skill; the play declares its place in the
coming compound play (Basic Product Description → BoH → FoH — "Power Up
Product Library"); note EL1's absence honestly (manifest authored by director
ruling remains the documented interim input path).

## Fences

- Make-a-play is the tool under test as much as the tool: do not silently
  patch around it; findings go to issues.
- No lodestone/cascade/notepad implementation here (companion plans own
  those); BoH emits today's contracts.
- Do not touch the live sweeps' content; they are goldens.
- PRs per repo convention: independent, no auto-merge, director QAs.
