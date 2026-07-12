# Golden-Path Play Upgrades — Project Plan

Bring every play on Raven's golden path up to the architecture that
`frame-the-problem` now demonstrates: **simpler, interactive, and event-sourced
through the trigger/ledger runtime** — same canon content, new mechanics.

Branch: `danversfleury/golden-path-play-upgrades`. Reference instance:
`studio/plays/frame-the-problem/`. Governing docs: `studio/plays/RUNTIME.md`,
`BIG-EDIT.md`, `TESTING.md`, `AUTHORING.md`, `PROJECTION.md`,
`docs/alexandria/plans/frame-the-problem-coin/`.

> **Status (2026-06-24).** Captured during the demo push; **none of the upgrade
> work below has merged.** The rung-2 (`write-the-one-pager`) recast was built
> end-to-end on branch `danversfleury/golden-path-play-upgrades` (PR #315) but
> never landed — it is **pre-proof** (graded campaign + fixtures + hardening
> re-audit owed) and now stale against `main`, which still carries every target
> play as `slot`. Treat that branch as the **design-of-record for rung 2** (its
> §4 recast, ▲A–▲E decisions, 3-node prompts, risk-map reshape), to be redone
> fresh against current `main` when rung 2 is scheduled. The strategy, recipe,
> and sequencing below stand.

---

## 1. What the frame-the-problem rewrite established (the pattern to propagate)

The rewrite did **not** touch the grounded canon. It replaced the *mechanics*:

| Axis | Old (`frame-the-problem-baseline/`) | New (`frame-the-problem/`) |
|---|---|---|
| Shape | one monolithic prompt, single-agent, one shot | small Fabro graph: `pre_fill → review ⇄ revise → exit` |
| Human role | reads the brief *after* the run | reviews each draft *in* a loop, mediated by Raven |
| Gate | none (or a blocking console node) | **non-blocking, event-sourced** suspend point |
| Runtime | none | `play.*` ledger events + run-bridge + wake → skill |
| Feedback | n/a | `ax raven answer` (HTTP POST) back to the waiting run |
| Testing | manual read | deterministic gate grading via `--reactions` |

The contract is codified in `studio/plays/RUNTIME.md` — six obligations of a
runtime-aware play, **ported from the shipped Raven Vision power-up**. The
generic plumbing (the run-bridge as sole event emitter, the seven `play.*`
events, `ax raven answer`, `--reactions`, the coin `play.requested` trigger, the
projection-backed Play Tracker) is **already shipped and play-agnostic** (Slice
1 #305/#309, slices 2–4 #312, apostrophe fix #310). Upgrading another play is
therefore **graph + prompts + skill + fixtures + event-routing — not new runtime
code.**

---

## 2. Honest starting state

`frame-the-problem` is the **only** play that is both registered/runnable and
runtime-aware — and it reached the runtime contract the hard way (designed under
the old model, then re-architected across the coin slices). **Director's call:
it stays frozen at its current pre-bank (smoke) state** — it is the reference
*by shape*, not by proof, and its own owed proving work (the k≈30 campaign, the
full interactive loop, the IN-1/IN-2 invariance pairings) is **out of scope
here.** Every other golden-path play is still a `slot` "full sketch": a brief + grounding + draft
prompts authored 2026-06-12 under the elicitation-review experiment and
re-scoped by the source-canon audit, but **never proven, never banked to the
plugin, no Raven skill, and designed under the old multi-move shape.**

So "the same improvement process" for these plays is larger than a `BIG-EDIT`:
it is **recast-to-runtime-contract _plus_ the full proving pipeline
(`slot → … → registered`)**, with the runtime contract baked into the design
from the start so we skip frame-the-problem's re-architecture detour.

Roster (source of truth: `studio/plays/registry.js`):

| Rung | Play | Slug | Prio | Status today |
|---|---|---|---|---|
| 1 | Frame the Problem | `frame-the-problem` | core | **registered, pre-bank (smoke)** — the model |
| 2 | Write the One-Pager / PRD | `write-the-one-pager` | core | slot · full sketch · compound |
| 3 | Scope an MVP | `scope-an-mvp` | core | slot · full sketch |
| 4 | Architecture-Aware Build Plan | `architecture-aware-build-plan` | core | slot · full sketch |
| 0 | Run Internal Feature Discovery | `run-internal-feature-discovery` | stretch | slot · full sketch · open seam question |
| 2b | Feasibility Check | `feasibility-check` | input | slot · full sketch |
| 2c | Survey the Existing System | `survey-the-existing-system` | input | slot · full sketch |
| 2f | Capture Technical Constraints | `capture-technical-constraints` | input | slot · full sketch |
| 3b | Write Acceptance Criteria | `write-acceptance-criteria` | stretch | slot · full sketch |

(Parked, out of scope: 2a, 2d, 2e, c1, c2, c3 — see `PARKING-LOT.md`.)

---

## 3. Definition of "upgraded" (per-play target end-state)

A play is done when **all** hold:

1. **Runtime-contract compliant** (`RUNTIME.md` checklist): a named review
   *unit* with its own state; draft written through AX; turn ends; the resolving
   event wakes the next unit; **no blocking gate**; drafting split from
   elicitation; inputs by file; idempotent writes.
2. **Banked**: studio ≡ plugin (`bank.sh`), bank/placeholder/risk-map
   conformance gates green.
3. **Proven**: a graded campaign at the right `k` (TESTING.md) with the gate
   graded via `--reactions`, plus an honest read-out. Never `--interactive`,
   never `--auto-approve` for gate grading.
4. **Registered & runnable**: in the plugin manifest, `ax run <slug>` live;
   `registry.js` status advanced to `registered`; board stage updated.
5. **Wired into the surface**: a Raven skill (modeled on
   `skills/frame-the-problem/SKILL.md`), `legs.json` tracker legs, the play's
   `play.*` events routed in `alexandria-event-log`, coin slot + tracker "Raven
   needs you" verified.

---

## 4. Build-once vs per-play

**Already shipped — reuse, do not rebuild:** the run-bridge
(`packages/ax/src/effects/run-bridge.ts`), the `play.*` event types
(`domain/state-events.ts`), `ax raven answer` (`domain/play-answer.ts`),
`--reactions` (`effects/scripted-answerer.ts`), shared `placeholders.ts`, the
tooling (`studio/tools/{derive-views.sh,bank.sh,generate-story.py}`), the three
conformance gates, the coin trigger + Play Tracker, the risk taxonomy spine
(`studio/plays/research/testing/RISKS.md`), and the doc canon.

**Per play (each upgrade authors its own):** `brief.md` §4 move graph,
`prompts/<move>.md`, derived `workflow.fabro`/`diagram.svg`/`story.md`,
`fixtures/` + `reactions.json`, `hardening.md`/`lint.md`/`known-fps.md`,
`risk-map.md`, `dry-runs/` + read-out, plugin `legs.json`, the Raven `SKILL.md`,
and the event-routing entry.

---

## 5. The per-play upgrade recipe (the repeatable "play")

Each play runs this ordered sequence. Steps 1–9 fold `RUNTIME.md`'s porting
checklist into `BIG-EDIT.md`'s edit order; the order is load-bearing (each step
invalidates the next if skipped).

0. **Gate-1 design confirm (Director).** Confirm the re-scoped content is
   approved to build. The design largely exists; this is a workshop checkpoint,
   not a from-scratch design. *Human dependency — cannot be self-approved.*
1. **Recast the move graph to the runtime contract** (`brief.md` §4 only — never
   the renderings). Name the review *unit*; design the draft → review ⇄ revise
   loop with a **non-blocking** event-sourced gate; split drafting vs
   elicitation; inputs by file; single-`AX_` placeholders; output-discipline
   clause on every file-writing move. **Content unchanged — mechanics only.**
   This is the heart of the upgrade and the real design lift.
2. **Derive renderings** — `studio/tools/derive-views.sh <play-dir>` (validates
   `workflow.fabro`, regenerates `diagram.svg` + `story.md`). Never hand-edit.
3. **Author the move prompts** — `pre_fill` writes the unit + a
   `runtime/for-the-director.md` marching-orders file; `revise` folds the
   reaction. Write files; don't narrate them.
4. **Audit** — fresh `hardening.md` + `lint.md` (Protocols A–E; E = brief ↔
   workflow ↔ prompts parity + `fabro validate`); re-disposition `known-fps.md`.
5. **Build fixtures + `reactions.json`** — behavior-class kit (baited golden,
   refusal, degradation, state-case, factored ceiling + blind answer key) per
   `TESTING.md`; scripted reactions to grade the gate.
6. **Bank** — `studio/tools/bank.sh <play-dir>` (studio → plugin). Until banked,
   the factory runs the stale copy. Conformance gates hold the copies equal.
7. **Wire the surface** — Raven `SKILL.md` from the template, plugin
   `legs.json`, and route the play's `play.*` events into
   `skills/alexandria-event-log/SKILL.md`.
8. **Prove** — graded campaign (estimate k≈30; ship-gate k≥100 for core rungs),
   gate graded through the bridge's suspend/answer events via `--reactions`;
   write the honest read-out; sideline any pre-edit runs.
9. **Register & record** — land in the plugin manifest, confirm `ax run <slug>`
   + coin + tracker; advance `registry.js` status and board stage (never ahead
   of what's earned).

---

## 6. Sequencing & PR strategy

**PR strategy** (per the standing QA preference): **one play per PR**, branched
off `main`, **non-stacked**, **no auto-merge** — each QA'd by hand. Cross-play
artifact dependencies (one-pager consumes the problem brief, MVP consumes the
one-pager, etc.) are satisfied through **fixtures with stub artifacts**, not
code stacking, so the PRs stay independent. If a play's recast design is
contentious, split a cheap design-confirm PR (brief §4 + renderings) ahead of
its build PR.

**frame-the-problem is frozen** — no Wave 0. We copy its *current* shape as the
template and accept it isn't fully proven (see §8). The kit-extraction that
Wave 0 would have done is folded into the first core play below as a one-time
upfront task.

**Wave 1 — The core spine (the demo backbone): rung 2 → 3 → 4**
- **First, once:** extract the reusable **upgrade kit** from frame-the-problem
  as-is — a skill template (from `skills/frame-the-problem/SKILL.md`), a
  `legs.json` template, the `reactions.json` schema, and a fixtures skeleton — so
  the rest of the plays copy a shape instead of reverse-engineering one. The
  first core play doubles as the kit shakeout.
- Then `write-the-one-pager` → `scope-an-mvp` → `architecture-aware-build-plan`.
- Sequential, because each play's deliverable is the next play's tested input —
  doing them in chain order lets each output seed the next play's golden fixture.
- Highest value (this is the path the demo walks) and highest design lift
  (`write-the-one-pager` is an 11-move compound — see §7).

**Wave 2 — The input plays: 2b, 2c, 2f** *(parallelizable)*
- `feasibility-check`, `survey-the-existing-system`, `capture-technical-constraints`.
- These feed rung 2 and are independent of each other → can run in parallel.
  Smaller scope (re-scoped to the startup floor).

**Wave 3 — The stretch plays: rung 3b, then rung 0**
- `write-acceptance-criteria` (gates into rung 4), then
  `run-internal-feature-discovery`.
- Lowest priority. Note rung 0 is the one play that *precedes* frame-the-problem
  (the conversational on-ramp), not part of the chain that follows it — and it
  carries an unresolved seam question (separate play vs. interactive mode of
  rung 1, see §7). Defer until that's decided; it may not need a separate
  runtime-aware play at all.

---

## 7. Play-by-play notes (per-play specifics)

- **`write-the-one-pager` (2, core).** The heaviest recast: ~11 moves, 36 KB
  brief, **compound** — context inputs are owned by 2b/2c/2f and compounded in
  when their artifact is missing; business-context questions are absorbed as
  elicitation moves; market scan + sizing are parked (summon on demand). Map
  the compound inputs to the `--input`/file contract and decide which become
  review units vs background gather. Largest design and fixture surface.
- **`scope-an-mvp` (3, core).** Re-scoped to the startup floor (DSDM/GDS dropped
  for Shape-Up-native mechanics; hypothesis gate re-grounded in the Mom Test).
  Frame ratification + queued decision briefs owed at Director review. A clean
  candidate for the draft → review ⇄ revise shape.
- **`architecture-aware-build-plan` (4, core).** The hand-off to Fabro; its
  compound inputs all map to existing plays (no new gaps). Its output is the
  build hand-off, so its golden fixture should exercise the full upstream chain.
- **`feasibility-check` (2b, input).** Straightforward input play; validates the
  idea against the architecture. Good second-wave warm-up.
- **`survey-the-existing-system` (2c, input).** Re-scoped to the startup floor:
  one context sketch + hotspot/risk list + discrepancy note. Lighter judgment —
  confirm whether it needs a full review gate or a single confirm unit.
- **`capture-technical-constraints` (2f, input).** The worked example brief at
  `plays/examples/` is this play. Mostly structured capture — the recast may be
  the simplest; verify the runtime gate is warranted at all.
- **`run-internal-feature-discovery` (0, stretch).** **Open design question
  leads its decision queue:** separate play vs. an interactive *mode* of rung 1.
  Resolve this at Gate-1 before building — it may collapse into rung 1 rather
  than become its own runtime-aware play.
- **`write-acceptance-criteria` (3b, stretch).** Cardinal sin designed in:
  criteria may never smuggle scope that rung 3 already cut. Bake that as an
  adversarial fixture class (scope-creep bait) in the test kit.

---

## 8. Risks, dependencies, open questions

- **The template is unproven (accepted).** frame-the-problem is frozen pre-bank
  (smoke only), so the shape we copy hasn't passed a graded campaign. Mitigation:
  the *runtime plumbing* it rides (bridge, events, `--reactions`) is shipped and
  proven independently; what's unproven is the prompt/gate content, which each
  play re-grades on its own fixtures anyway. The first core play is the kit
  shakeout — expect to find and fix template holes there, not in frame-the-problem.
- **Director Gate-1 is a human gate.** Each play needs a design confirm before
  build; this plan cannot self-drive past those checkpoints.
- **Not every play is a clean draft → review ⇄ revise.** Step 1 is genuine
  per-play design, not a template fill. Input/capture plays (2c, 2f) and the
  conversational rung 0 may need a different unit shape — or no gate. Decide the
  unit per play; don't force the frame-the-problem graph.
- **Compound-input contract** (2 ← 2b/2c/2f). Pin how missing artifacts compound
  in and how they map to fixtures, so Wave-1 work doesn't block on Wave-2 plays.
- **Plan-doc roadmap drift.** The delivery-roadmap phase list in
  `testing-center-viewer-port/plan.md` is mirrored on a feature branch; verify
  before relying on its ordering.

---

## 9. Rough effort sketch

- **Each core play (Wave 1):** the largest unit of work — full recast + prove +
  register; `write-the-one-pager` is the biggest, and it carries the one-time
  kit extraction.
- **Each input play (Wave 2):** smaller; lighter judgment, smaller fixture kit.
- **Stretch (Wave 3):** 3b small; rung 0 gated on a design decision (may drop).

Total: **up to 8 plays × the recipe** (7 if rung 0 collapses into rung 1), shipped
as independent, hand-QA'd PRs — no separate reference-hardening effort.

---

## 10. Kit shakeout — what the write-the-one-pager (rung 2) attempt established (2026-06-19)

The first core play was built end-to-end on branch
`danversfleury/golden-path-play-upgrades` (PR #315) — deterministic recipe,
conformance gates + `ax` typecheck green — but **was not merged** and is
**pre-proof**. It is the **design-of-record** for rung 2 and the worked reference
for the recipe, alongside frame-the-problem. **The recipe holds**; the captured
learnings below are the reusable output even though the build itself must be
redone fresh against current `main`. Concrete notes for parallel work:

**Templates to copy** — the same Riff shape, two worked instances:
`studio/plays/{frame-the-problem,write-the-one-pager}/` (`brief.md` §4,
`workflow.fabro`, `prompts/{pre_fill,revise}.md`, `moves.md`, `synopsis.md`),
`packages/alexandria-plugin/skills/{frame-the-problem,write-the-one-pager}/SKILL.md`,
`packages/alexandria-plugin/workflows/<slug>/legs.json`. Read
write-the-one-pager's brief §4 "Why this looks nothing like the old §4" to see a
12-move pipeline collapsed.

**Per-play files (no cross-play conflict — safe to parallelize):** each play owns
`studio/plays/<slug>/*` and `packages/alexandria-plugin/{workflows,skills}/<slug>/*`.

**The shared-file integration seam (serialize — do NOT edit in parallel):**
- `packages/ax/src/domain/plays.ts` — the `PlayId` union + a `PLAY_MANIFEST` entry
  (`requiredInputs` = the play's input key; the workflow graph/target paths).
- `packages/ax/tests/state.test.ts` — `playbook.plays` length + the per-index
  `matchObject` (a new play bumps the count and inserts an entry).
- `packages/ax/tests/events.test.ts` — the `play.started` `playId` `allowedValues`
  enum (sorted; add the new id).
- `studio/plays/registry.js` — the play's status line (→ `derived`) + description.
- Event-routing in `alexandria-event-log/SKILL.md` is now **play-agnostic**
  (dispatches to "the play's own skill") — **no per-play edit needed.**

The lead integrator applies these four edits per play at merge, so parallel
branches never collide on them.

**Self-verify tooling (run before handing off):**
`studio/tools/derive-views.sh <play-dir>` (validate + diagram + story) →
`studio/tools/bank.sh <play-dir>` (studio→plugin) →
`cd packages/viewer && bun test src/components/studio/{bank,placeholder,riskMap}Conformance.test.ts`.

**Pattern pre-authorized (2026-06-19, Director):** apply the recast pattern
without per-play Gate-1 blocking — collapse machine-checker/bounce nodes into the
director's review ⇄ revise loop; drop any spoken-paragraph node (the face's job);
fold elicitation + escalation into the loop; refusal-as-state. Each play **flags
its own ▲ decisions** in `brief.md` §4 for batch Director review at PR-QA time.

**Parallel build attempt (2026-06-19, not landed):** rung 2 was built (PR #315,
unmerged); scope-an-mvp (rung 3), architecture-aware-build-plan (rung 4), and
feasibility-check (2b) were started by parallel agents — but **none merged**, and
all remain `slot` on `main`. When this resumes, each is one PR off current
`main`; registration + the shared-file seam are applied at integration.
