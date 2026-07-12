# Handoff — learning-plane elicitation (2026-07-07)

The elicitation walk (the critical-path step in `launch-plan.md`) is **complete**. This PR
freezes it so nothing lives only in a gitignored `.context` scratch area.

## What is in this PR

- **`elicitation-results.md`** — the full, faithful 1:1 capture of every ruling and
  refinement the director made in the session (the committed copy of the otherwise-gitignored
  `.context/learning-plane-elicitation/session-capture.md`). This is the source of truth for
  the design-log fold below.
- **`cards/`** — two authored, machine-language-gated exemplar cards:
  - `Research - Attribution State of the Art.md` — desk-research, 19 real citations,
    `kind: distilled`.
  - `Experiment - Ten-Director Library Pilot.md` — the one real Experiment from the walk.

## What the elicitation produced (index; full detail in `elicitation-results.md`)

- **Evidence Strength** (renamed from "grade ladder"): grade words say/demo/pilot/market →
  **reported → demonstrated → piloted → at-scale**; grade = **stage-only, verdict-neutral**;
  the per-claim "B grade" = the **Bet-risk's confidence** (a rollup, not a new field); N is
  not a rung; grade is per-claim.
- **Arc vocabulary**: unit = **Arc** (not "release"); the whole = a loose **timeline in three
  tenses**, not a ladder; roles **`headline` | `supporting`**; arc heart is plural +
  cross-plane (altitude-default, `role` override); arc **mad-lib** = Bet → product → evidence;
  field renames `milestone`→`arc`, `gate`→`role`.
- **Past = three corpora** (merged 4→3): **System-Builders**, **Tools for Thought** (was
  "Cognition"), **High-Reliability Systems** (merged high-tempo + NASA/navy). Plus three
  internal learnings, renamed; product Pattern **"The Approach" → "Library Organization
  Method"** (separate product-plane edit).
- **Golden metric = employee labor-equation ROI** = volume of use × fair-market ROI per
  AI-employee, cost = tokens + director time-in; quality read by a monthly performance review
  + a daily andon pull; doubles as the per-employee pricing basis (→ the Economy story).
- **Attribution is an Experiment, not a Measure.** **Initiatives ≠ Experiments** (arc + bullpen
  work + Research yield). De-risking: value/feasibility → probes, reversibility → a stance.

## What happens next (see `launch-plan.md` for the workstreams + agent prompts)

1. **Fold `elicitation-results.md` into `design-log.md`** and **apply the card-contract
   refinements** (Evidence Strength stage-only + the new grade words; the Arc/`role` vocabulary;
   a desk-research `kind: distilled` grounding exception — `source_evidence` citations satisfy
   the "cite ≥1 case" rule when no case card exists yet). *Deferred out of this PR for
   reliability; both are fully specified in `elicitation-results.md`.*
2. The walk **unblocks A5** (scaffolding cards) and feeds F2a/F2b (type + vitals factory
   issues), A1 (altitude map), and the **evidence-map linking pass** (learning ↔ strategy ↔
   product ↔ **Raven's Library-Operations card**, which must carry her evidence-lifecycle
   responsibilities).

## Dependency / caveat

Jess's library migration (plan **#666**) is moving `docs/alexandria/sweeps/alexandria-product`
out from under this work, and **A5 is on hold for it**. So the two cards here stay as
**plan-folder exemplars** — do **not** drop them into the sweep until the migration settles and
the learning plane scaffolds.
