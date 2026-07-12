# Read-Coherence — Playmaker Studio (PMS)

The back-of-house walk's honest self-assessment: what a stranger would and wouldn't
understand from this bundle, written plain. This doubles as the bundle's navigation
(there is deliberately no top-level README — the loader would read it as a card).

## What this bundle is

A draft product-knowledge library for **Playmaker Studio** — the play-writing studio
where Raven's plays are written, proven, and registered. 91 stub cards across **six
bounded contexts**, plus the work-thread (`workflows.json`), the open threads
(`threads.json`), and the director agenda (`STAGE-2-BRIEF.md`). It was carved blind
from the source (governance docs, the Board model + state, the registry, the
validators, the viewer Studio surface), with no answer key and no Vision.

## How to read it (navigation)

- The spine is the **`production-ladder`** context: the `Pattern - Production Ladder`
  card is the product's defining arc (Backlog → Sourced → Designed → Built → Proven →
  Live). Start there.
- The central record is **`Entity - Play`** (in `catalog`). The whole bundle is the
  story of moving a Play up the ladder; `workflows.json` is that lifecycle as ordered
  steps.
- The six contexts, in reading order: **production-ladder** (the stages + gates) →
  **board** (the work-pool surface + work orders) → **catalog** (org filing:
  Company/Division/Function, the face agents) → **authoring** (making a play's logic:
  the five doer roles, brief, derive, lint) → **proving** (fixtures, risk map, the
  three testing lenses, measurement) → **runs** (a play executing: ledger, wake,
  the non-blocking human gate, the Tracker).
- Cards link by typed `links:` and name each linked card in `## HOW`. Diagrams draw
  from `flow:` on the three Pattern/staged-Mechanism cards (Production Ladder,
  Make-a-Play Arc, Auto-Advance Contract).

## What a stranger WOULD understand

- **The core loop, end to end.** A Play goes from a named slot to live through six
  stages, gated twice by the Director; agents author and verify, the human judges.
  The eight-step loop (Ground → Brief → Harden → Confirm → Derive → Lint → Dry-run →
  Confirm) is fully recovered, with the five agent roles distinct.
- **The Board as the source of truth** for production progress, and the parallel
  Work Order system (testing/improvement/bug) with its own status that never moves a
  Play stage.
- **The one-source-derived-renderings discipline** — the brief §4 is the source; the
  workflow package, diagram, and story view derive from it and can't drift (guarded).
- **The testing model** — fixtures bought by failure class, the risk map with two
  honest axes (authored Coverage vs measured Validation), and the measurement policy
  (k, pass rate, rule of three).
- **The non-blocking runtime contract** — ported from Raven Vision: one unit at a
  time, event-sourced, the agent ends its turn and is woken; "Raven needs you" on the
  Tracker.

## What a stranger would NOT understand (the gaps)

- **The "why".** No value proposition, market positioning, or strategic intent — they
  don't live in the source read. This is by design; the front-of-house walk fills it.
- **Which advancement mechanism wins.** The manual confirm and the auto-advance
  contract both exist; the bundle flags the tension but cannot resolve it.
- **The full authoring craft.** AUTHORING.md (Protocols A–E in detail) was sampled,
  not read in full, so `Capability - Lint` and `Component - Node Prompt` are thinner
  than the proving cards.

## Two named reservations

The Demo Factory (Damien) launch-video line — a separate production line that ships
in the Studio surface but moves no Play — was swept, flagged as a scope question, and
**ruled out of PMS scope** (removed in slice 4c). It is intentionally absent from this
bundle.

1. **The type vocabulary is the default, not the architect's.** PMS does not ship its
   own card taxonomy in source, so every `type` is one of the canonical nine by
   analogy — not necessarily the words the architect would choose. Ratify or replace
   at EL3. (Where PMS *does* have strong native words — Stage, Doer, Tier — they are
   kept as `prefLabel`/`altLabels`, never as the `type`.)
2. **The polysemy and demotion calls are proposals, not rulings.** "Tier" and "bank"
   are split into two cards each; "Board" is split surface-vs-state; "Play Run" and
   "Legacy Status" are proposed for demotion. The director may keep any of them as
   one noun — the walk flags, it does not rule.

## Hot Spots that are likely real product flaws (not the walk's confusion)

Four findings are the *source* contradicting itself, not the reader being uncertain
(full detail in `HOT-SPOTS.md`): the **two advancement mechanisms**, the **two
human-gate models** (one explicitly corrected but still documented), the **"Register"
timing disagreement** between the README and TESTING/PROJECTION, and the **named
derived-rendering drift hazard**. A director scanning the bundle should read these as
real product tensions to resolve, not as gaps in the scan.

## Confidence

High on the core loop, the Board, authoring, proving, and the runtime contract
(grounded in README + board-model.js + board-state.json + PROJECTION + TESTING +
RUNTIME, which are internally consistent on the spine). Medium on Review Levels. The
single largest honest gap is that **nothing here is
measured** — proving is fully specified but only frame-the-problem has any graded run
(N=1 smoke), so every Validation axis reads "not yet measured."
