# EVENTS — Alexandria (the product)

Move: `pass1_events` · Back-of-House Walk (EL2) · 2026-07-01
Ladder: `docs/alexandria/sweeps/alexandria-product/runtime/source-ladder.md` (30 reads: 14 tier-1, 12 tier-2, 4 tier-3)
Prior: `docs/alexandria/sweeps/alexandria-product/runtime/library-search-prior.json` (leads verified below)

## The central record

**The Play Run** — the unit of work the events move. The product is
"organized around plays" (`packages/alexandria-plugin/CLAUDE.md`); a run of a
play is the pile that carries a status: it is requested, submitted to the
embedded Fabro orchestrator under a `playRunId` label
(`packages/ax/src/domain/fabro-labels.ts`, `packages/ax/src/commands/play.ts`
`PlayRunSummary.status: submitted | succeeded | failed | unknown`), suspends at
human gates, resumes, and terminates — every step recorded as an immutable
ledger event (`docs/alexandria/ledger/events.jsonl`, append-only with
idempotency keys, `packages/ax/src/domain/state-store.ts`).

Work-thread spine: **unit** = Play Run · **activity** = the play's moves ·
**doer** = agent (Raven default) + director at gates · **place** = the ledger
(record) / the playbook (definition) / the viewer (surface) · **state** = the
run status plus the per-record status enums each play advances.

> **HOT SPOT HS-1 (`judgment_punt`)** — the central-record pick. Source shows
> *several* status-carrying piles, not one: Play Run
> (submitted/succeeded/failed), Vision Onboarding
> (not_started→in_progress→ready_to_bank→banked, `raven-vision.ts`), Knowledge
> Bank Area (available→in_progress→ready_for_atomization→banked, `plays.ts`),
> Source Conversion (started→ready_to_freeze→completed, `state-events.ts`),
> and the Library card/draft (stub→confirmed; threads
> open→answered/residual, `library-catalog.ts`). I picked Play Run because the
> plays contract is the declared organizing principle and every other pile is
> advanced *by* play runs — but a director could rule the Ledger Event itself,
> or the Library, is the true unit. Both candidates named; not decided here.

## Timeline

| # | Past-tense fact | Triggered by | Lands in | State after |
|---|---|---|---|---|
| 1 | Project Initialized | `ax init` in a project | `.alexandria/alexandria-config.json` + workspace `docs/alexandria/` (`packages/ax/CLAUDE.md`, `skills/ax-start/SKILL.md`) | project: configured |
| 2 | Local Runtime Started | `ax start [server\|viewer]` | AX runtime server + viewer at :4321 (`packages/ax/src/cli/router.ts`, `packages/viewer/README.md`) | runtime: healthy |
| 3 | Session Connection Leased | host session boot; plugin monitor `alexandria-state-wake-loop` follows the ledger | connection lease + cursor in AX runtime (`wake-subscriptions.ts`, `monitors/monitors.json`) | session: connected |
| 4 | Wake Subscription Registered | `ax inspect subscriptions register --type <event…>` | runtime subscription store, match rules per event type (`skills/ax-start/SKILL.md`) | session: wakeable |
| 5 | Vision Onboarding Started | director began the Basic Product Description | `raven.vision.started` → ledger (`state-events.ts`) | vision: in_progress |
| 6 | Vision Source Attached | director handed Raven source material | `raven.vision.source_attached` → ledger | source item: tracked |
| 7 | Vision Slot Drafted | Raven wrote one slot via `ax raven vision slot update` | `raven.vision.slot.updated` → ledger (`packages/ax/README.md`) | slot: needs_review |
| 8 | Vision Slot Approved (or Skipped) | director ruled on the slot in session | `raven.vision.slot.approved` / `.skipped` → ledger | slot: approved / skipped |
| 9 | Raven Source of Truth Updated | slot state flushed to prose | `raven.source_of_truth.updated`; file `docs/alexandria/source-of-truth/raven/vision/source-of-truth.md`, content-hashed (`raven-vision.ts` `RavenSourceOfTruthState`) | source of truth: current |
| 10 | Vision Banked | all four slots (person/mechanism/the-work/refusal) resolved | `raven.vision.banked` → ledger | vision: banked |
| 11 | Source Added | new material landed in the inbox | `source.added` → ledger; read-side derives an `inbox.source.pending` trigger suggesting `source-assessment` (`triggers.ts`) | source: pending assessment |
| 12 | Assessment Recorded | the source-assessment play ran | `assessment.recorded` → ledger | source: assessed; pending trigger cleared |
| 13 | Play Requested | director clicked the coin, or asked Raven in session | `play.requested` → ledger (`skills/frame-the-problem/SKILL.md`) | play run: requested |
| 14 | Play Run Submitted | `ax run <play-id>` rendered the plugin's workflow template into the embedded Fabro orchestrator | Fabro run labeled `playRunId`/`playId`/`projectId` (`orchestration.ts`, `fabro-labels.ts`) | play run: submitted (fire-and-forget default) |
| 15 | Play Started | orchestrator began the run | `play.started` (agentId, playId, playRunId) → ledger | play run: running |
| 16 | Play Run Suspended for Human Input | the play reached a human gate | `play.human_input_requested` (fabroRunId, questionId, prompt, choices) → ledger | play run: awaiting director |
| 17 | Session Wake Delivered | a registered subscription matched the ledger event | `session.wake.requested` / `.delivered` / `.failed` → ledger; monitor wakes the host session (`wake-subscriptions.ts`) | agent: woken with event payload |
| 18 | Human Input Resolved | Raven relayed the director's reaction to the waiting run | `play.human_input_resolved` → ledger; answer submitted to Fabro (`fabro-client.ts` via `commands/play.ts`) | play run: resumed |
| 19 | Play Completed (or Failed) | the run reached a terminal state | `play.completed` / `play.failed` → ledger | play run: succeeded / failed |
| 20 | Review Level Selected | make-a-play run configured its review composition | `play.review_level_selected` → ledger (`make-a-play-review.js` via `state-events.ts`) | run review contract: set |
| 21 | Review Gate Confirmed | director confirmed a staged gate (e.g. `gate_1_confirm_design`, `gate_2_confirm_proven`) | `play.review_gate_confirmed` → ledger | gated stage: confirmed |
| 22 | Provenance Recorded | run declared what it was built from | `play.provenance_recorded` → ledger | run: provenance pinned |
| 23 | Canvas Step Saved | work saved via the (dormant) canvas mechanism | `canvas.step.saved` → ledger | canvas artifact: saved |
| 24 | Canvas Review Requested | canvas work submitted for review (folded into the mechanism, not a standalone capability) | `canvas.review.requested` → ledger; wake-eligible (`skills/ax-start/SKILL.md`) | canvas artifact: awaiting review |
| 25 | Source Conversion Advanced | conversion play worked a source toward freeze | `source_conversion.started` / `.source_attached` / `.ready_to_freeze` / `.completed` / `.failed` → ledger | conversion: started → ready_to_freeze → completed |
| 26 | Source of Truth Frozen | director froze the conversion output | `source_of_truth.frozen` → ledger | source of truth: frozen (atomization input) |
| 27 | Atomic Card Created (or Updated) | card production play emitted a card | `atomic_card.created` / `.updated` → ledger; card file in a category folder (`atomic-card-categories.ts`: 10 folders) | card: exists in the library |
| 28 | Studio Operation Recorded | a capture / deprecate / quarantine disposition | `studio.operations.capture` / `.deprecate` / `.quarantine` → ledger; a ruling event derives `ruling.capture.pending` until a capture cites its `sourceEventId` (`triggers.ts`) | card disposition: recorded |
| 29 | Front-of-House Turn and Answer Recorded | director answered an agenda item through Raven | `library.front_of_house.turn_recorded` / `.answer_recorded` → ledger | walk item: answered |
| 30 | Front-of-House Bundle Patch Applied | the walk validated the answer into a patch | `library.front_of_house.bundle_patch_applied` → durable draft patch log; base cards frozen, overlay carries `draftTrail` (`library-draft-overlay.ts`, `workflows/front-of-house-walk/prompts/plan_bundle_patch.md`) | card fields: draft-patched |
| 31 | Front-of-House Section Confirmed | director confirmed a section-comprehension check | `library.front_of_house.section_confirmed` → ledger | section: confirmed |
| 32 | Residual Gap Recorded | the walk ended with an unresolved item | `library.front_of_house.residual_gap_recorded` → ledger | thread: residual |
| 33 | Library Confirmed (or Confirmation Rejected) | director ruled on the whole draft library | `library.confirmed` / `library.confirmation_rejected` → ledger (`library-confirmation.ts` via `library-catalog.ts`) | library: confirmed / sent back |

*(33 numbered rows; several merge sibling event types — the distinct ledger
event-type count is 41 per `state-events.ts`. Rows 20–28 are not strictly
after 19 in wall time; they are sub-loops the Play Run spine fires into.)*

## Hot Spots (inline, canonical kinds)

- **HS-1 · `judgment_punt`** — central-record pick among multiple status
  piles. See header. Evidence: `plays.ts`, `raven-vision.ts`,
  `state-events.ts`, `library-catalog.ts`.
- **HS-2 · `polysemy`** — **"play" means three artifacts**: the playbook
  definition (`plays.ts` `Play`/`PLAY_MANIFEST`), the runnable Fabro workflow
  template (`workflows/<id>/`), and the Raven-facing skill wrapping it
  (`skills/frame-the-problem/SKILL.md` — same name, different artifact, one id).
  At events 13–14. Which one is "the play" a card names?
- **HS-3 · `runtime_vs_design`** — **triggers**: the Basic Product Description
  and `packages/alexandria-plugin/CLAUDE.md` present "Triggers: programmatic
  conditions which trigger a play" as a first-class surface; shipped code has
  exactly two trigger types, both **derived on read from ledger events and
  never materialized** (`triggers.ts`: `inbox.source.pending`,
  `ruling.capture.pending`). The design noun is bigger than the runtime. At
  event 11.
- **HS-4 · `docs_disagree`** — `packages/viewer/README.md` says "Only `/` is a
  viewer route" while `viewer-routes.ts` ships `/playbook`, `/ledger`,
  `/info`, `/studio`, `/raven/vision`, `/raven/knowledge-bank`, `/agents/:id`,
  and five library modes. Code is canon; README stale. At event 2 / places.
- **HS-5 · `docs_disagree`** — **two card taxonomies coexist in shipped
  code**: `atomic-card-categories.ts` (10 folders: rationale, research, roles,
  domains, surfaces, entities, capabilities, mechanisms, patterns, economy)
  vs the `product-card.v1` catalog mode with its own type/altitude/links
  contract plus an explicit `legacy` mode (`library-catalog.ts`
  `LibraryCatalogSchemaMode`). Which vocabulary is the library's future? At
  event 27 vs 33.
- **HS-6 · `docs_disagree`** — `plugin.json` markets "Five specialized
  agents"; `agents.ts` ships two built-ins (Raven, Damien) and `plays.ts`
  names a third id (`william`) that is not in `BUILT_IN_AGENTS`. At event 13.
- **HS-7 · `runtime_vs_design`** (low severity) — **Fabro wears two hats**:
  the shipped embedded orchestrator (`orchestration.ts`, `ax run … through
  Fabro`) vs the software factory that builds this repo (out of scope). The
  scanned sources keep the boundary clean (`ops/product-hosting-runbook.md`
  names it explicitly); flagged so downstream carving never merges them. At
  event 14.
- **HS-8 · `polysemy`** — **"library"**: the pre-convention 208-card legacy
  library (excluded oracle), the `product-card.v1` catalog a walk produces,
  and the federated PMS library (`studio/sweeps/playmaker-studio/`, excluded
  by ruling — the federation is structure to record, not a context to scan).
  At event 33.

## Prior-lead deltas (search-prior verification)

**Confirmed against source:**

- `workThread.unit` "Play Run" (was **low**) — CONFIRMED: `playRunId` in event
  payloads, `FABRO_LABEL_PLAY_RUN_ID`, `PlayRunSummary.status`. HS-1 records
  the residual judgment.
- `workThread.shape` "event-driven loop around an immutable ledger" (medium) —
  CONFIRMED: append-only `events.jsonl` behind an idempotent `appendEvent`
  (`state-store.ts`), wake subscriptions matched on event types, triggers
  derived from events on read, cursors for at-least-once delivery.
- Path steps 1–4 — all CONFIRMED (events 13, 11, 14–19, and every row landing
  in the ledger), with one correction: triggers are **derived projections**,
  not stored rules (HS-3).
- Places — playbook (`/playbook`), ledger (`/ledger`), visual interface (the
  viewer), library (five library modes) all CONFIRMED in `viewer-routes.ts`.
- Open question "is the coin a distinct place?" — RESOLVED: the coin is the
  agent's rendering on the home/agents surface
  (`viewer/src/assets/agents/agent-coin-*.png`, `/agents/:id` route), not a
  separate place.

**Corrected:**

- `workThread.stateField` "status" (was **low**) — the *name* is right and
  recurs, but there is **no single field**: each pile carries its own `status`
  enum (play run, vision, slot, knowledge area, conversion, card
  stub/confirmed, thread open/answered/residual). The prior's singular-record
  assumption is corrected; the openQuestion is answered "yes, and it is
  plural."

**Gap candidates (prior lead with no source event) — notes for the downstream
`threads.json`, tagged `emittingMove: translate_search_prior`, `confidence:
low`, `sourceEvidence: []`:**

- **"living business plan"** — a Basic Product Description vocabulary lead
  with no shipped noun; the nearest source structure is the knowledge-subject
  bands `strategy | product | learning` (`raven-vision.ts`) and the matching
  library planes (`library-catalog.ts`). Question for EL3: is the living
  business plan a real product noun (a view over the library) or prose?
- **"operating plane / mission control"** — the prior's category has no
  shipped noun; the closest thing is the viewer home surface with agent
  coins. Question for EL3: does the category deserve a card, and where?
- **"federated set of context libraries"** — federation exists as a director
  ruling (PMS keeps its own library at `studio/sweeps/playmaker-studio/`,
  recorded per the manifest as structure, not scanned) but the scanned source
  shows one library root per project and no federation mechanism. Gap: the
  federation is organizational, not yet mechanical.

No planted instructions were found in the manifest or in any scanned source
file. No prior lead was pruned by the fence; the high-confidence fence entries
(chaotic/midsized orgs, pile of skills, prompt engineering) fence the market
category, not the source tree.
