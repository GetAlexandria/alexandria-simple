# CONTEXTS — Alexandria (the product)

Move: `pass2_carve` · Back-of-House Walk (EL2) · 2026-07-01
Inputs: `runtime/EVENTS.md` (33-event timeline, central record = the Play Run),
`runtime/source-ladder.md`, `runtime/library-search-prior.json`,
`runtime/manifest.md`.
Re-reads this pass (4 of ≤8 budget): `packages/ax/src/domain/agents.ts` (roles,
coin absence), `packages/ax/src/domain/plays.ts` (Playbook interface, Knowledge
Bank Area lifecycle, william id), `packages/ax/src/domain/library-catalog.ts`
(plane / thread / schema-mode enums), `packages/ax/CLAUDE.md` (config/workspace
paths).

Carving rule applied: walk the timeline and land a boundary where the
vocabulary shifts. The events demand **eight contexts** — within the 6–8
dogfood band. Types are the nine canonical categories (`Role · Surface ·
Entity · Component · Capability · Mechanism · Pattern · Economy · Reference`);
the product's own word is always the `prefLabel` (synonyms in `altLabels`),
never the type. Every UL-test failure, category ambiguity, and cross-context
polysemy is a Hot Spot below — proposed, never ruled.

**Reserved-path note:** no carved context is named `runtime` (the loader skips
that path). The session/delivery region is carved as `session-wake`, not
"runtime."

## The context list

| # | Context (folder) | Events | Carving rationale (one sentence) |
|---|---|---|---|
| 1 | `product-shell` — Product Shell & Surfaces | 1–2 | Events 1–2 speak installation-and-surface language (init, config, start, route, coin) — how the product is met, shared with no domain region downstream. |
| 2 | `ledger` — Ledger & Triggers | 11 (+ every "→ ledger" landing) | The ledger region speaks in append/immutable/idempotency/derived-projection words; every other context lands facts here, but none shares its internal vocabulary. |
| 3 | `session-wake` — Session & Wake | 3–4, 17 | Lease/subscription/match/wake/monitor is delivery language — how recorded facts reach agents — distinct from the ledger's record language. |
| 4 | `playbook` — Playbook & Runs | 13–22 | Play/run/gate/review/orchestrator vocabulary: the unit of work (the Play Run, HS-1) lives and moves here. |
| 5 | `vision-onboarding` — Vision Onboarding | 5–10 | Slot/bank/source-of-truth language belongs to the Basic Product Description chain and appears nowhere else. |
| 6 | `knowledge-production` — Knowledge Production | 11–12, 25–28 | One pipeline vocabulary — source, assessment, conversion, freeze, atomize, capture/deprecate/quarantine — turning raw material into cards. |
| 7 | `library` — Library & Walks | 27 (landing), 29–33 | Card/plane/thread/patch/section/confirm language: the knowledge store and the walks that refine and confirm it (the `library.*` event namespace says so itself). |
| 8 | `canvas` — Canvas | 23–24 | A small but unmistakable region: its own `canvas.*` event namespace and save/review words shared with nothing else. |

**Federation ruling (from the manifest):** the Playmaker's Studio is **not** a
scanned context. It federates as a pointer: one card, `Reference - Playmaker's
Studio Library`, planned in the `library` context, linking out to
`studio/sweeps/playmaker-studio/`. The federation is recorded as structure,
never as scanned contexts — see the HS-8 treatment below and the pass1 gap
candidate ("federation is organizational, not yet mechanical"), which stays a
thread.

---

## 1. `product-shell` — Product Shell & Surfaces

Where the product is installed, started, and met: the project workspace, the
CLI, the viewer, and the actor roster (roles cross-cut every context; their
cards are homed here as the product's front door).

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Project | Entity | workspace, Alexandria project | `packages/ax/CLAUDE.md` (config → workspace); event 1 | The initialized workspace everything else lives in. |
| Alexandria Config | Component | `.alexandria/alexandria-config.json` | `packages/ax/CLAUDE.md` | Part of the Project; no independent lifecycle. |
| AX CLI | Surface | ax | `packages/ax/README.md`, `src/cli/router.ts` | The terminal place the product is met; the router is its verb map. |
| AX Runtime Server | Mechanism | runtime server | event 2; `src/cli/router.ts` | The engine behind the surfaces; not itself a place. |
| Viewer | Surface | visual interface, local viewer | `packages/viewer/README.md`, `viewer-routes.ts` | Carries **HS-4** (README says one route; code ships twelve+). |
| Viewer Route | Component | route, mode | `viewer-routes.ts` | Pieces of the Viewer; the `/ledger`, `/playbook`, library-mode views are `derived_from` their domain cards, not new card types. |
| Coin | Surface *(provisional — HS-9)* | agent coin | `viewer/src/assets/agents/agent-coin-*.png`; `/agents/:id` | Prior open question resolved at pass1: the coin is the agent's rendering, not a distinct place — which is exactly why its category is ambiguous. See **HS-9**. |
| Agent | Role | AI colleague, AI employee | `plays.ts` `Agent`, `agents.ts` `BUILT_IN_AGENTS` | Carries **HS-6** (marketing "five agents" vs two built-ins + the `william` id at `plays.ts:7`; william is **not carded** — flagged, not ruled). |
| Raven | Role | Product Owner | `agents.ts:14-36` | Default agent (`DEFAULT_AGENT_ID`). |
| Damien | Role | Executive Producer of New Media | `agents.ts:37-58` | |
| Director | Role | team leader | prior actors; gate events 8, 21, 33 | The human who rules at every gate. |

## 2. `ledger` — Ledger & Triggers

The append-only record of what happened, and the projections derived from it.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Ledger | Mechanism | event log, immutable ledger | `state-store.ts`, `docs/alexandria/ledger/events.jsonl` | Typed Mechanism (the record-keeping engine the product runs), not Entity: the work never moves the ledger, it accrues into it. The `/ledger` route is a derived view (`derived_from`), not a second card. |
| Ledger Event | Entity | event | `state-events.ts` | Identity-bearing (idempotency-keyed) record; **HS-1**'s alternate central-record candidate — carded so the director can re-point the spine at EL3. |
| Event Type | Economy | — | `state-events.ts` (41 distinct types) | The ledger's value-unit vocabulary. |
| Trigger | Mechanism | pending trigger, derived trigger | `triggers.ts` | Carries **HS-3**: the design noun ("programmatic conditions which trigger a play") is bigger than the shipped runtime (two kinds, derived on read, never materialized). |
| Pending Trigger Kind | Economy | `inbox.source.pending`, `ruling.capture.pending` | `triggers.ts` | The two shipped values. |
| State Store | Mechanism | — | `state-store.ts` | **HS-11 demotion-proposed**: implementation machinery exposed as a noun; would the architect *say* "state store"? Kept as a drafted card pending the director's call. |
| Idempotency Key | Component | — | `state-store.ts` | **HS-12 demotion-proposed**: plumbing vocabulary, likely a source-evidence note on Ledger Event rather than a card. |

## 3. `session-wake` — Session & Wake

How recorded facts reach a live agent: leases, subscriptions, wakes, and the
monitor loop.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Session | Entity | host session | events 3–4 (connected → wakeable) | |
| Connection Lease | Component | lease | `wake-subscriptions.ts` | Rides the Session. |
| Wake Subscription | Entity | subscription | `wake-subscriptions.ts`; event 4 | Registered independently via `ax inspect subscriptions register`. |
| Match Rule | Component | — | event 4 (match rules per event type) | Piece of a subscription. |
| Wake | Capability *(provisional — HS-17)* | session wake | `session.wake.requested/.delivered/.failed` | The requested→delivered/failed lifecycle makes an Entity reading honest too. See **HS-17**. |
| Monitor | Mechanism | plugin monitor, `alexandria-state-wake-loop` | `monitors/monitors.json` | The CC-managed loop that follows the ledger. |
| Cursor | Component | — | `wake-subscriptions.ts` | **HS-13 demotion-proposed**: at-least-once delivery machinery; fails the spoken-vocabulary test outside the wake internals. |

## 4. `playbook` — Playbook & Runs

The play vocabulary and the Play Run — the central record (HS-1) — with its
gates, reviews, and the embedded orchestrator.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Play | Entity *(provisional — HS-2)* | play definition | `plays.ts` `Play` / `PLAY_MANIFEST` | **HS-2 polysemy treatment**: "play" names three artifacts under one id — the definition (this card), the machine template (`Entity - Workflow Package`), and the Raven-facing wrapper (`Entity - Play Skill`). All three are drafted, `related_to`-linked; the director rules which is "the play" at EL3. |
| Playbook | Entity *(provisional — HS-15)* | /playbook | `plays.ts:130` `Playbook` interface; `viewer-routes.ts` | The registry-vs-route reading splits Entity vs Surface. See **HS-15**; the route is treated as a derived view of the registry. |
| Workflow Package | Component | workflow.fabro, legs.json | `workflows/frame-the-problem/legs.json` | The play's machine contract; HS-2 sibling. |
| Move | Component | leg, workflow node | `plays.ts` `Move`, `MoveKind`, `TrackerLeg` | The spoken word is "move"; "leg" kept as altLabel. |
| Play Skill | Component | skill | `skills/frame-the-problem/SKILL.md` | The Raven-facing procedure wrapping the play; HS-2 sibling. |
| Play Run | Entity | run | `commands/play.ts` `PlayRunSummary` | **The central record** (HS-1 carried: alternates Ledger Event and Library are carded in their own contexts so the director can re-point the spine). |
| Play Run Status | Economy | submitted, succeeded, failed, unknown | `commands/play.ts` | |
| Human Gate | Mechanism | gate, human input gate | event 16 (`play.human_input_requested`) | The suspend-for-director mechanism; label "gate" per the vocabulary table. |
| Human Input Request | Component | question | event 16 payload (fabroRunId, questionId, prompt, choices) | Rides the Play Run; its requested→resolved states are the run's states. |
| Review Level | Economy | — | event 20; `make-a-play-review.js` | The review-composition value a run selects. |
| Review Gate | Mechanism | `gate_1_confirm_design`, `gate_2_confirm_proven` | event 21 | The staged, named gates; `related_to` Human Gate (the general mechanism they specialize). |
| Provenance Record | Component | provenance | event 22 (`play.provenance_recorded`) | What the run declared it was built from. |
| Fabro Orchestrator | Mechanism | embedded orchestrator | `orchestration.ts` | Carries **HS-7**: the shipped-orchestrator hat only; the software factory that builds this repo is out of scope and never merged here. |
| Run Labels | Component | playRunId, playId, projectId | `fabro-labels.ts` | **HS-14 demotion-proposed**: line-label nouns — exactly the class the UL test exists to catch. |

## 5. `vision-onboarding` — Vision Onboarding

The Basic Product Description chain: slots drafted, ruled, flushed to prose,
banked.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Basic Product Description | Entity | Vision, Raven Vision | `raven-vision.ts`; events 5–10 (not_started → banked) | **HS-16**: director-facing name vs the internal `vision` id/events/route — prefLabel proposed as the director-facing name, EL3 ratifies. |
| Vision Slot | Component | slot (person, mechanism, the-work, refusal) | `raven-vision.ts`; events 7–8 | Has its own status enum but no life outside the description — the altitude half of this call is threaded at pass3 (HS-21). |
| Slot Status | Economy | needs_review, approved, skipped | events 7–8 | |
| Source Item | Entity | attached source | event 6 (`raven.vision.source_attached`) | Identity-bearing; its lifecycle rides the Vision chain. |
| Raven Source of Truth | Entity | `source-of-truth.md` | `raven-vision.ts` `RavenSourceOfTruthState`; event 9 | **HS-10 split pair A** — see the split proposal below. |

## 6. `knowledge-production` — Knowledge Production

The pipeline that turns raw material into cards: intake, assessment,
conversion, freeze, atomization, disposition.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Source | Entity | inbox source | event 11 (`source.added`); `triggers.ts` | pending → assessed. |
| Inbox | Surface | — | `triggers.ts` (`inbox.source.pending`) | The place material lands. |
| Source Assessment | Capability | assessment | event 12; `workflows/source-assessment` | The operation the source-assessment play performs. |
| Source Conversion | Entity | conversion | `state-events.ts` `source_conversion.*` | started → ready_to_freeze → completed. |
| Frozen Source of Truth | Entity | source of truth (atomization input) | event 26 (`source_of_truth.frozen`) | **HS-10 split pair B** — see the split proposal below. |
| Knowledge Bank Area | Entity | knowledge subject, area | `plays.ts` `KnowledgeBankArea` (available → in_progress → ready_for_atomization → banked; also locked) | The five ids: vision, vocabulary, bets, guardrails, user-research; HS-1 named it as a status pile the Play Run advances. |
| Atomic Card | Entity | card (legacy taxonomy) | event 27; `atomic-card-categories.ts` | **HS-5 pair A**: the 10-folder taxonomy's card. Not merged with Product Card — `related_to` link; the director rules the library's future vocabulary. |
| Atomic Card Category | Reference | rationale, research, roles, domains, surfaces, entities, capabilities, mechanisms, patterns, economy | `atomic-card-categories.ts` | Typed Reference (a taxonomy/standard the product ships), not Economy: it classifies, it is not a value-unit. |
| Studio Operation | Capability | capture, deprecate, quarantine | event 28 (`studio.operations.*`) | The disposition verbs. |
| Director Ruling | Reference | ruling | event 28 (a ruling event derives `ruling.capture.pending` until a capture cites its `sourceEventId`) | Owner-supplied rationale, recorded. |

## 7. `library` — Library & Walks

The knowledge store — cards, planes, threads, drafts — and the front-of-house
walk and confirmation gate that refine and rule it.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Library | Entity *(provisional — HS-8)* | context library | `library-catalog.ts` `LibraryCatalog`; event 33 | **HS-8 treatment**: this card is the `product-card.v1` catalog. The pre-convention 208-card legacy library stays **uncarded** (excluded oracle per the manifest — proposed, not ruled); the PMS library federates as the Reference card below. Director ratifies the three-way carve at EL3. |
| Product Card | Entity | card | `library-catalog.ts` `LibraryCatalogCard`; `ProductCardStatus` stub → confirmed | **HS-5 pair B**; `related_to` Atomic Card. |
| Catalog Schema Mode | Economy | legacy, product-card.v1 | `library-catalog.ts:35` | The projection-gate value; HS-5 evidence. |
| Plane | Economy | strategy, product, learning | `library-catalog.ts:38` | |
| Thread | Entity | gap thread, hot-spot thread | `library-catalog.ts` `LibraryCatalogThread` | open → answered / residual; event 32's "residual gap" is a Thread in `residual` status, not a separate noun. |
| Thread Status | Economy | open, answered, residual | `library-catalog.ts:56` | |
| Draft Overlay | Mechanism | draft patch log | `library-draft-overlay.ts` | Base frozen; overlay carries `draftTrail`. |
| Bundle Patch | Component | draft patch | event 30; `workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | Appended to the Draft Overlay's log. |
| Front-of-House Walk | Pattern | FoH walk, EL3 | events 29–32; `workflows/front-of-house-walk/` | The named arc turn → answer → patch → section-confirm → residual; gets a `flow:` at emit. |
| Walk Turn | Component | turn, answer | event 29 (`turn_recorded` / `answer_recorded`) | |
| Section | Component | section-comprehension check | event 31 (`section_confirmed`) | |
| Confirmation Gate | Mechanism | library confirm, EL4 gate | `library-confirmation.ts`; event 33 | confirmed / sent back. |
| Playmaker's Studio Library | Reference | PMS library, federated library | manifest federation ruling; `studio/sweeps/playmaker-studio/` | **The federation pointer card** — links out to the PMS library; PMS is never a scanned context here. |

## 8. `canvas` — Canvas

The dormant canvas mechanism: its own event namespace, save-and-review vocabulary.

| Noun (prefLabel) | type | altLabels | Evidence | Notes |
|---|---|---|---|---|
| Canvas | Mechanism | canvas mechanism, artifact review loop | events 23–24 (`canvas.*`) | Retyped from Surface (2026-07-05): a dormant-but-intended generic mechanism, not a bounded work surface. |
| Canvas Step | Component | canvas artifact | event 23 (`canvas.step.saved`) | |
| Canvas Review | Capability *(deprecated)* | review request | event 24 (`canvas.review.requested`; wake-eligible) | Folded into the Canvas mechanism — not a standalone live capability. |

---

## Split proposal (HS-10): "Source of Truth"

The term means two things in two contexts — DDD's textbook polysemy case:

- **`Entity - Raven Source of Truth`** (`vision-onboarding`) — the
  content-hashed prose file the Vision slots flush into
  (`docs/alexandria/source-of-truth/raven/vision/source-of-truth.md`), kept
  *current* as slots resolve.
- **`Entity - Frozen Source of Truth`** (`knowledge-production`) — the
  conversion output the director *freezes* (`source_of_truth.frozen`), the
  atomization input.

Both cards are drafted, `related_to`-linked. They share a folder family and a
name but have different lifecycles, different owners, and different consumers.
Proposed split; the director may instead rule them one noun with two states.

## Prior-lead status changes at this pass

- **"Is the coin a distinct place?"** — resolved at pass1 (rendering, not
  place); that resolution is what makes its *category* ambiguous → **HS-9**.
- **"Federated set of context libraries"** (pass1 gap candidate) — still a gap
  thread (no federation *mechanism* in source), but the carve now gives it a
  structural anchor: `Reference - Playmaker's Studio Library`.
- **HS-1 (central record)** — kept open; the carve keeps Play Run as the spine
  and cards both alternates (Ledger Event, Library) so EL3 can re-point without
  re-carving.

## Nouns honestly not carded

- **william** (`plays.ts:7`) — an agent id with no built-in roster entry;
  evidence inside HS-6, not a card.
- **The legacy 208-card library** — excluded oracle per the manifest; named in
  HS-8's treatment, not carded.
- **Hosted Product Instance** (`ops/product-hosting-runbook.md`) — no event
  names it; deployment shape, not spoken product vocabulary. Flagged here so
  EL3 can promote it if the director disagrees.
- **Library Area / Fill Readiness** (`library-catalog.ts` `LibraryCatalogArea`)
  — read-side projection vocabulary the events never name; left as source
  evidence on the Library card.

---

## Hot-spot ledger (running, through pass2)

| id | kind | what | where |
|---|---|---|---|
| HS-1 | judgment_punt | Central-record pick: Play Run chosen as spine; Ledger Event and Library are honest alternates (several status piles in source). Both alternates carded. | `playbook` / Play Run; `ledger` / Ledger Event; `library` / Library. Evidence: `plays.ts`, `raven-vision.ts`, `state-events.ts`, `library-catalog.ts` |
| HS-2 | polysemy | "Play" names three artifacts under one id: definition, workflow template, skill wrapper. All three drafted + `related_to`; director rules the primary. | `playbook` / Play, Workflow Package, Play Skill. Evidence: `plays.ts`, `workflows/<id>/`, `skills/frame-the-problem/SKILL.md` |
| HS-3 | runtime_vs_design | "Trigger": design noun (first-class programmatic conditions) bigger than runtime (two derived-on-read kinds, never materialized). | `ledger` / Trigger. Evidence: `triggers.ts`, `packages/alexandria-plugin/CLAUDE.md` |
| HS-4 | docs_disagree | Viewer README claims "/" is the only route; code ships twelve+. Code is canon; README stale. | `product-shell` / Viewer, Viewer Route. Evidence: `packages/viewer/README.md` vs `viewer-routes.ts` |
| HS-5 | docs_disagree | Two card taxonomies coexist: 10-folder atomic-card categories vs `product-card.v1` (+ explicit `legacy` mode). Both carded, `related_to`; never merged here. | `knowledge-production` / Atomic Card; `library` / Product Card, Catalog Schema Mode. Evidence: `atomic-card-categories.ts`, `library-catalog.ts:35` |
| HS-6 | docs_disagree | `plugin.json` markets "five specialized agents"; two ship built-in (Raven, Damien) plus an un-rostered `william` id. William not carded. | `product-shell` / Agent. Evidence: `plugin.json`, `agents.ts:13-59`, `plays.ts:7` |
| HS-7 | runtime_vs_design | Fabro wears two hats: shipped embedded orchestrator (in scope) vs the factory that builds this repo (out). Carve keeps the boundary. | `playbook` / Fabro Orchestrator. Evidence: `orchestration.ts`, `ops/product-hosting-runbook.md` |
| HS-8 | polysemy | "Library" = legacy 208-card library (excluded oracle, uncarded) vs `product-card.v1` catalog (the Library card) vs federated PMS library (Reference pointer card). Proposed carve, director ratifies. | `library` / Library, Playmaker's Studio Library. Evidence: `library-catalog.ts`, manifest ruling |
| HS-9 | polysemy | Coin: **Surface** (the place a director meets and fires an agent) vs **Component** (a rendering inside the agents surface). Drafted provisionally as Surface; both candidates named. | `product-shell` / Coin. Evidence: `viewer/src/assets/agents/agent-coin-*.png`, `/agents/:id` |
| HS-10 | split | "Source of Truth" means two things in two contexts: Raven Vision's current prose vs the conversion's frozen atomization input. Both cards drafted + `related_to`. | `vision-onboarding` / Raven Source of Truth; `knowledge-production` / Frozen Source of Truth. Evidence: `raven-vision.ts`, `state-events.ts` (`source_of_truth.frozen`) |
| HS-11 | demotion | State Store fails the spoken-vocabulary test (implementation machinery exposed as a noun). Proposed demotion to source-evidence note on Ledger; never deleted. | `ledger` / State Store. Evidence: `state-store.ts` |
| HS-12 | demotion | Idempotency Key: plumbing vocabulary; proposed demotion to a source-evidence note on Ledger Event. | `ledger` / Idempotency Key. Evidence: `state-store.ts` |
| HS-13 | demotion | Cursor: at-least-once delivery machinery; proposed demotion to a note on Wake Subscription. | `session-wake` / Cursor. Evidence: `wake-subscriptions.ts` |
| HS-14 | demotion | Run Labels (playRunId/playId/projectId): line-label nouns, the exact class the UL test catches; proposed demotion to a note on Play Run. | `playbook` / Run Labels. Evidence: `fabro-labels.ts` |
| HS-15 | polysemy | Playbook: **Entity** (the registry — `Playbook` interface, `PLAY_MANIFEST`) vs **Surface** (the `/playbook` route). Drafted provisionally as Entity with the route as a derived view; both candidates named. | `playbook` / Playbook. Evidence: `plays.ts:130`, `viewer-routes.ts` |
| HS-16 | judgment_punt | Naming: director-facing "Basic Product Description" vs internal `vision` id / `raven.vision.*` events / `/raven/vision` route — which is the prefLabel? Drafted with the director-facing name; EL3 ratifies. | `vision-onboarding` / Basic Product Description. Evidence: `raven-vision.ts`, `viewer-routes.ts` |
| HS-17 | judgment_punt | Wake: **Capability** (the waking operation) vs **Entity** (the wake request record with a requested → delivered / failed lifecycle). Drafted provisionally as Capability; both candidates named. | `session-wake` / Wake. Evidence: `wake-subscriptions.ts`, `session.wake.*` events |
