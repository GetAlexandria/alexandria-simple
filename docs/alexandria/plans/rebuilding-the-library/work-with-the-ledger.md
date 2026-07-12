# Work with the Ledger — provenance is a ledger projection, not a hand-rolled field

**Status:** DECISION + PLAN (2026-06-22). Sits next to `plan.md` and `brick-0-foundations.md`. Triggered by the playtest IG5 (Provenance Tag) thread: Studio's provenance discipline and the library's frontmatter provenance both looked like they were *duplicating* a ledger — and a check of the actual code (`packages/ax`) confirmed the ledger primitive already ships. **The decision: stop hand-rolling provenance; work with the ledger.**

## The thesis

The library (frontmatter `proposed_by` / `source_evidence`, the Large-tier "state" fields) and Studio (the Provenance Tag: Grounded / Orchestrator-call / Director-ruling) each keep their **own** hand-maintained record of *who established a claim or decision, and when*. They do this as if Alexandria has no ledger. **It does.** Both are re-implementing — inconsistently, by hand, in different vocabularies, in two products — the exact thing the shipped ledger already does: an append-only, typed, actor-attributed event log.

**Decision recorded here: provenance is the ledger's job. The library and Studio *project from* the ledger (and *append to* it). They never keep a parallel source of truth.**

## What actually ships today (the correction)

The master plan calls the Ledger "the least-built pillar" (C7). That is true **only of the Learning-plane semantics on top** — turning events into evidence that tests a bet (the feedback arc). The **substrate ships and is load-bearing** in `packages/ax`:

- **An append-only event ledger.** `effects/jsonl-state-store.ts` appends typed events to a per-workspace `ledgerPath` (JSONL = append-only); `effects/project-state-loader.ts` resolves `ledgerPathForWorkspace`. State is a *projection*: `commands/state.ts` reports `ledger: { eventCount, lastEventAt }`.
- **A CLI surface.** `ax inspect events append | list | validate | schema` (`commands/events.ts`), schema-versioned (`STATE_EVENT_SCHEMA_VERSION = 1`).
- **A typed event vocabulary** (`ALEXANDRIA_STATE_EVENT_TYPES`): `play.*` (started / completed / failed / requested / human_input_*), `source_conversion.*`, `source_of_truth.frozen`, **`atomic_card.created` / `atomic_card.updated`**, **`assessment.recorded`**, `canvas.*`, `session.wake.*`, `source.added`, `raven.vision.*`.
- **An actor model (the "who").** Every event carries an `AlexandriaActor`: **kind ∈ {user, agent, process}** × host ∈ {viewer, ax, claude-code, codex, freeq, freeq-raven} × process. `DEFAULT_AX_ACTOR = {kind: process, host: ax, process: cli}`.
- **The runtime already writes it.** `effects/run-bridge.ts` "folds each observation into the ledger" and seeds per-run memory "from the ledger projection" on restart (issue #305). Triggers (`ax inspect triggers list`) and wake (`session.wake.*`) are events in the same system.

**So the primitive — append-only, typed, actor-attributed, projectable — is real.** What is unbuilt is the *meaning* layer (Learning reading the events to test a bet). We must not let the library or Studio paper over the substrate just because the meaning layer is young.

## The duplication

| Hand-rolled today | Where | What it really is |
|---|---|---|
| Provenance Tag — Grounded / Orchestrator-call / Director-ruling | Studio brief sections, RULED stamps, decision queue | event `actor.kind` (agent / agent / user) + a "decision recorded" event |
| `proposed_by` — scanner / director / agent | library frontmatter (Brick 0 F3) | event `actor.kind` (agent / user / agent) |
| `source_evidence` | library frontmatter | the `source.added` / `source_conversion.*` event(s) the card derives from |
| Large-tier "state" (bet tested / holding) | library frontmatter (Brick 0 F3, Brick-7-gated) | a projection over `assessment.recorded` + outcome events |

All four are the **same fact** — *who established this, when, from what* — kept by hand, in three vocabularies, in two products.

## Decisions

- **D1 — One provenance "who", and it's the ledger actor.** Studio's provenance classes and the library's `proposed_by` both collapse onto **`AlexandriaActor.kind` (user / agent / process)** (+ host for detail). Retire the parallel enums; there is one honesty-layer vocabulary, and it is the ledger's.
- **D2 — Provenance records are ledger events, not hand-kept tags.** A Director ruling is an appended event (`actor.kind = user`); an agent/orchestrator call is an appended event (`actor.kind = agent`); "grounded from source" is the `source.added` / `source_conversion.*` event. Studio writes rulings via `ax inspect events append`; it stops re-deriving the same record by hand in markdown.
- **D3 — Frontmatter provenance becomes a projection.** `proposed_by` / `source_evidence` (Brick 0 F3) are **read from the ledger**, not authored by hand. The atomizer already emits `atomic_card.created` *with an actor* — so a card's provenance is in the ledger the moment it is made; the frontmatter field is a cached view, not the source of truth. (Refines Brick 0 F3: these are Tier-2 **derived** fields, not hand-set.)
- **D4 — This de-risks Brick 7.** The "data-availability gate" flagged in Brick 0 F3 (Large-tier state needs the Ledger) is smaller than stated: the **event substrate already exists**; only the Learning *interpretation* (assessment → bet-holds / contested) remains. Brick 7 builds the *reading*, not the *writing*.
- **D5 — Close the one real gap: a decision/ruling event type.** The shipped event types are domain-specific (play / source / vision / atomic_card); the closest generic primitive is `assessment.recorded`. Before Studio rulings + card-classification decisions can live in the ledger, either formally adopt `assessment.recorded` for them or add a `decision.ruled` / `ruling.recorded` type. **This is the first concrete implementation step.**

## Plan (phased — design now, code later)

0. **Decide (this doc).** Provenance is ledger-sourced; the vocabularies unify on the actor model. ✅
1. **Vocabulary reconciliation (design).** Map Studio Provenance Tag + library `proposed_by` → `AlexandriaActor`; choose the event type(s) for "decision recorded" (D5); update Brick 0 F3 to mark `proposed_by` / `source_evidence` as **derived**.
2. **Wiring (implementation — its own PR in `packages/`; NOT this session).** Studio ruling-capture → `ax inspect events append`. Atomizer (EL5) card creation → `atomic_card.created` with the right actor. Library viewer → project `proposed_by` / provenance from the ledger.
3. **Learning layer (Brick 7).** Read `assessment.recorded` + outcome events → bet tested / holding / contested. The feedback arc, built on a substrate now acknowledged to exist.

## Cross-references

- **Brick 0 F3** — frontmatter provenance fields; this doc reclassifies `proposed_by` / `source_evidence` as **derived from the ledger**, not hand-set.
- **Brick 7 / C7** — the causal/feedback arc; de-risked by D4.
- **EL5 (atomizer re-point)** — `atomic_card.created` is the provenance *write*; the re-pointed atomizer must emit it with a correct actor.
- **Playtest IG5** (Provenance Tag) — the thread that surfaced this.
- **Studio provenance discipline** — kept as the *human-readable* surface, but **backed by ledger events, not a parallel record.**
