# EVENTS — Playmaker Studio (PMS), the work, time-first (pass1_events)

**Method:** Event Storming projected onto a code + docs reader. Past-tense Domain
Events only — "something meaningful happened in the domain." Each names its
trigger, where it lands, and (when it advances the work) the **state** it lands the
unit in.

## The central record — the Play

The unit the work moves is the **Play**: a named-but-empty slot carried up a
six-stage production ladder to *live* (registered, user-runnable). The "pile that
carries a status" is the **Board** (`board-state.json` → `stages{}`), which holds
each Play's current stage. The ladder is
**Backlog → Sourced → Designed → Built → Proven → Live** (board-model.js
`STAGE_KEYS`; README "The Board is the single source of truth"). The timeline below
is that Play's lifecycle. A second, smaller record rides alongside — the **Work
Order** (a Testing/Improvement/Bug card with its own `open → in-progress →
done / wont-do` status) — and a third, the **detached Fabro run** that a built Play
executes; both are surfaced after the main spine.

(No Vision supplied → the shape and the work-thread are inferred from source. The
README's eight-step loop + the make-a-play meta-arc are the declared throughline;
events are read from them and confirmed against board-model.js / board-state.json.)

## The Play's lifecycle — the work-thread spine

| # | Event (past tense) | Triggered by | Lands in | State after (the Play) |
|---|---|---|---|---|
| 1 | Play Slot Named | Director adds an identity row | `registry.js` RUNGS (slug, Division, Function, `prio` Tier) | backlog |
| 2 | Play Carded onto the Board | a slug placed in a stage list | `board-state.json` `stages.backlog[]` | backlog |
| 3 | Source Material Grounded (Step 0) | Director + orchestrator agree the frame, then Sonnet researchers cite prior art | `<slug>/research/grounding.md` (+ `extracted-claims.md`) | **sourced** |
| 4 | Brief Drafted | Brief-drafter agent fills `TEMPLATE-brief.md` one section at a time from Director intent | `<slug>/brief.md` (§4 = the move graph) | designed (pending gate) |
| 5 | Brief Hardened | Hardener interviews the brief (Solomon's method: one Q at a time; Outcome/Reasoning/Breakdown + state audit) | `<slug>/hardening.md`; brief revised in place | designed (pending gate) |
| 6 | Design Confirmed — Gate 1 | Director confirms the design AND the graph shape; rules decomposition granularity | approval noted atop the brief; Board advance (▸) | **designed** |
| 7 | Workflow Derived | Author projects approved §4 per PROJECTION.md | `<slug>/workflow.fabro` + `prompts/<move>.md` + run config | built (in progress) |
| 8 | Views Derived | `studio/tools/derive-views.sh` runs after projection | `diagram.svg` + `story.md` (+ `moves.md` overlay refreshed) | built (in progress) |
| 9 | Workflow Linted | Checker runs Protocols A–E (+ `check-moves.ts`, `fabro validate`) | `<slug>/lint.md` | built (in progress) `[Hot Spot HS-PARITY]` |
| 10 | Fixtures Authored & Chosen | Author builds one fixture per failure class (golden/refusal/empty/rerun/hard-case) + seeds the risk map | `<slug>/fixtures/<case>/`, `<slug>/risk-map.md` | **built** |
| 11 | Play Registered for Run | a `PLAY_MANIFEST` entry is added (Register moved to the Derive seam) | `packages/.../plays.ts`; `ax run <slug>` now boots | built (run-enabled, not banked) `[Hot Spot HS-REGISTER]` |
| 12 | Run Validated | `fabro validate` + `check-workflow-edges.py` on the materialized package | factory pre-run check | built |
| 13 | Campaign Run on the Factory | `ax run <slug> --fixture <case>` boots the embedded Fabro / ACP (claude-acp) | `<slug>/dry-runs/<case>-run-*/` (records + handles) | built (proving) |
| 14 | Run Graded | a fresh-eyes, blind Grader scores the run record against the answer key + §7 (independent of the author) | `<slug>/dry-runs/read-out.md` / `grade.md` | built (proving) |
| 15 | Pass Rate Written Back | the run→risk-map pipeline writes `n · pass · CI` | `risk-map.md` runs/result columns + coverage | built (proving) |
| 16 | Advance Contract Evaluated | the TESTING.md auto-advance contract checks 5 conditions (tier-bar · proof-spec · no-unclassified-failure · no-regression · independent-grade) | the "night report" (one line per card) | built → branch |
| 17a | Play Auto-Advanced (clean) | all 5 conditions cleared | Board advance, tag auto/probationary | **proven** |
| 17b | Play Held for Review | any condition missed | the held queue, tagged with the failing condition | built (held) `[Hot Spot HS-LADDER]` |
| 18 | Proven Confirmed — Gate 2 | Director judges the read-out vs the proof spec, rules granularity, banks the play | the bank (`bank.sh`, studio → plugin) | **proven** |
| 19 | Play Registered Live | the banked package lands in `packages/.../workflows/<slug>/`; `PLAY_MANIFEST` live; `ax run <slug>` smoke-proven | the shipped plugin copy | **live** |
| 20 | Play Graduated | Director graduates a Live play off the active Board | `board-state.json` `graduated[]` + `graduatedAt{}` | (off-board; still registered) |

## The Work Order side-thread (a second record; its own status, never a Play stage)

| # | Event (past tense) | Triggered by | Lands in | State after (the Work Order) |
|---|---|---|---|---|
| 21 | Work Order Filed | Director (or a seed) creates a Testing/Improvement/Bug card | `board-state.json` `cards[]` (Division/Function/priority/source) | open |
| 22 | Testing Card Auto-Seeded | a board-visible play lacks its one Testing card | `cards[]` (`board:auto-testing-card`) | open |
| 23 | Work Order Started | the "Start" action | the In-Progress lane | in-progress |
| 24 | Work Order Closed | the "Close" action | the Done lane; `terminalAt` stamped | done (terminal) |
| 25 | Work Order Declined | the "Won't do" action | the Won't-Do lane; `terminalAt` stamped | wont-do (terminal) |
| 26 | Work Order Archived | age window (7d) elapses past `terminalAt`, or "Archive now" | the Archive (derived membership) | archived |

## The runtime-run side-thread (the detached Fabro run a built Play executes)

| # | Event (past tense) | Triggered by | Lands in | State after (the run) |
|---|---|---|---|---|
| 27 | Play Run Launched | `ax run <play>` (default detached / fire-and-forget) or a `play.requested` trigger | the embedded factory; `play.started` on the ledger | running |
| 28 | Run Status Observed | the runtime emits `play.status_observed` | the Play Tracker's run-state model | on-track / running-slow / circling-back |
| 29 | Human Input Requested | the agent does one unit, marks it awaiting review, and ends its turn (`play.human_input_requested`; Vision: slot → `needs_review`) | the Tracker shows "Raven needs you" (needs_human_feedback) | blocked (awaiting director) `[Hot Spot HS-GATE]` |
| 30 | Human Input Resolved | the director reviews asynchronously and approves / revises / skips (`play.human_input_resolved`; Vision: `slot.approved/skipped`) — which **wakes** the agent | the next unit drafts | running |
| 31 | Run Completed | the workflow reaches `exit` succeeded | `play.completed` on the ledger | done |
| 32 | Run Failed / Refused / Frozen | an ACP work-node failed-closed (`outcome!=succeeded` → exit 1), survey refused, or check froze (three-strikes) | `play.failed`; Tracker → refused/stuck/failed | failed (terminal) `[Hot Spot HS-REVIEW]` |

## Hot Spots surfaced at the event where they bit

- **HS-LADDER** (at #16–17, `runtime_vs_design`): two parallel advancement
  mechanisms coexist — the **Director's manual ▸ confirm** on the Board
  (StudioApp.tsx `move()`; README "advances one stage only on the Director's
  confirm") **and** the **auto-advance contract** that promotes a card on 5
  passing conditions and only *holds* exceptions (make-a-play §4 `advance_contract`).
  Which one is canonical for a given Play is not stated; the meta-play even
  routes its own exemplar to *held* rather than proven. Real product tension.
- **HS-PARITY** (at #9, `docs_disagree`): the brief's §4 move graph is the single
  source, yet `workflow.fabro`/`prompts/`/`diagram.svg`/`story.md`/`moves.md` are
  all *derived* and can drift — the source guards against this with Protocol E +
  `check-moves.ts` + the sync rule + `play-resync.py`. The doc names drift as a
  live, guarded-against hazard ("Grammar drift killed runs").
- **HS-REGISTER** (at #11, `docs_disagree`): "Register" sits in **two** places —
  README Step 8 lists Register as the *end of the line* (Backlog…Live), but
  TESTING.md + PROJECTION.md say "Register moved from the end of the line to the
  Derive seam" so a play can be dry-run. The ladder table and the runtime text
  disagree on when registration happens.
- **HS-GATE** (at #29, `runtime_vs_design`): PROJECTION.md §7 documents a
  **blocking** Fabro human gate (`hexagon`), then RUNTIME.md says that model is
  *wrong* for a detached run (it deadlocks) and the shipped pattern is
  **non-blocking, event-sourced** (Raven Vision). Two human-gate models in the
  source; the blocking one is explicitly corrected but still documented.
- **HS-REVIEW** (at #32, `judgment_punt`): three distinct failure exits —
  a **designed refusal** (survey can't scan → refusal-report), an **ACP/runtime
  failure** (exit 1), and a **FREEZE** (the output is incoherent) — are kept
  distinct in the back-of-house-walk brief but the general PMS runtime
  (`play.failed`) collapses them; the Tracker re-splits into refused/stuck/failed.
- **HS-AGENT-NAMING** (at #1, `polysemy`): "Tier" means **two** things — a Play's
  *criticality* Tier (`prio`: core/input/stretch/parked, the Golden-Path bands)
  **and** a *role* Tier (Coordinator/PM/Senior, the build-an-employee sheet).
  Same word, two records. Proposed as a split in pass2.
- **HS-DAMIEN** (at #13/#15, `judgment_punt`): the **Damien** tab is a *Demo
  Factory* (a skill-station org producing a product-launch video — Demo Thesis,
  Story Spine, Demo Path) — a wholly separate production line from the play
  factory, sharing only the viewer chrome. It is product surface (it ships in the
  Studio) but it does not move the Play. Carded in its own context, flagged for
  the director: is the Demo Factory in PMS scope, or a co-resident tool?

## Self-check (pass1)

- Every event is past-tense: yes (Named, Grounded, Drafted, Hardened, Confirmed,
  Derived, Linted, Authored, Registered, Run, Graded, Written Back, Evaluated,
  Advanced/Held, Banked, Graduated; Filed/Started/Closed; Launched/Observed/
  Requested/Resolved/Completed/Failed).
- Every event has a trigger: yes (each row names it).
- Every event lands somewhere: yes (a file, a board list, a ledger event, a UI
  state).
- Count: 32 events across three threads (main spine 20 + work-order 6 + runtime-run
  6) — within the 20–30-per-thread scale; the spine alone is 20.
- No invented events: every row traces to README / board-model.js / board-state.json
  / PROJECTION.md / TESTING.md / RUNTIME.md / make-a-play/brief.md.
