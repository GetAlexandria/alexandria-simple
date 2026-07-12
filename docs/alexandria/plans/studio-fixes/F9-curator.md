> **PARKED 2026-06-22** — the Curator is reframed as the *maintenance corner* of the **Playmaker Studio Operations Division**; see [studio-operations-division.md](studio-operations-division.md). This draft's mechanism detail (Capture / Deprecate / Quarantine; the autopsy + quarantine discipline) feeds that proposal; retained for it.
>
> **Agent-drafted 2026-06-22** for director review (playtest fix-list F9). Draft — not ruled. Assumptions flagged at top for correction.

# DESIGN SPEC — F9: The Curator

**Status:** DRAFT for Director review · 2026-06-22
**Source of record:** `studio/plays/research/library-elicitation/playtest-2026-06-21/studio-fix-list.md` §F9 (L100–111)
**Audience:** Director (Danvers)

---

## ⚠️ Assumptions flagged for correction (read first)

The fix-list defines the Curator's *purpose and triggers* clearly, but leaves three things to interpretation. My best-grounded reads, each flagged so you can overturn:

- **A1 — Scope: the Curator grooms *Studio's own governance*, not a director's product library.** F9's triggers (Capture→`inheritance/autopsy/`, Deprecate→PROJECTION §10, Quarantine→`inheritance/quarantine/`) all name *Studio-internal* targets (fix-list L104–109). So I spec it as a **Studio self-hosting / library-maintenance play for the Studio rulebook** — the peer to F8 (fix-list L110: "F8 produces new plays… F9 updates the rulebook from learnings"). It is **not** EL6 (Living Updates), which grooms a *director's product Library* (`library-elicitation-plays/plan.md` L82–88). They are **structural twins at different scales** — see §"Relationship to existing plays." *If you actually meant "one Curator that grooms any library, Studio's rulebook being just the first instance," say so and I'll generalize the spec.*
- **A2 — Outputs are recorded as Ledger events, not new hand-rolled records.** The fix-list predates the work-with-the-ledger decision (2026-06-22) but already says "subscriptions on relevant ledger events" (L111). Per D2/D5 of `work-with-the-ledger.md`, each Curator disposition (capture/deprecate/quarantine) **appends a ruling/decision event** (`actor.kind = user` for Director rulings, `agent` for agent calls) rather than only editing markdown. The markdown surfaces (autopsy files, PROJECTION §10 table) become **human-readable projections** of those events. *This requires the D5 event type (`decision.ruled` / `ruling.recorded`) to land first — flagged as a dependency below.*
- **A3 — Tier = PM.** F9 doesn't state a Tier. I default it to **PM**, matching every authored Studio play (`registry.js`: `tier:'PM'` throughout) and the Brick-0 ruling that "the golden path lives at the PM tier." *Easily changed if you read curation as a more senior, lower-frequency Sr. Manager activity.*

---

## 1. What it is, and the gap it fills

The **Curator** is the missing play that **orchestrates Studio's inheritance discipline**: deciding what learnings to *capture*, what stale rules to *deprecate*, and what incoming material to *quarantine* — each as an explicit, triggered, provenance-stamped move.

**Why it's "missing":** Studio already has the *mechanism* for this — the autopsy record, the quarantine sequester, and the PROJECTION §10 disposition table (fix-list L102; mechanism confirmed in `studio/inheritance/README.md` and `PROJECTION.md` §10). What it lacks is a *play* that runs it. Today the discipline is ad-hoc: a human or agent has to **remember** to autopsy a finding, deprecate an outdated rule, or quarantine inherited material. The playtest's own META finding names the stakes: this is "the past/present/future and learning→strategy ethos… built on the ashes of a highly dysfunctional factory… dangers of contagion. So you have to be disciplined" (`playtest-notes.md` L26). **Contagion = importing yesterday's patterns without verifying they still hold** (L34). Without an orchestrated process with explicit triggers, the discipline atrophies and contagion sneaks in (fix-list L102).

It is the **rulebook-grooming** half of Studio self-hosting. The fix-list pairs it explicitly with F8: *"F8 (make playmaking a play) produces new plays following the current rulebook; F9 (the Curator) updates the rulebook from learnings. Together they cover Studio's full self-hosting. Without F9, even F8 can't keep up with what its own runs surface"* (fix-list L110).

## 2. Where it sits

- **Family:** Studio-internal governance / **library-maintenance**. It is **not** a PM golden-path play (it produces no product artifact), and it is **not** an EL-chain play (those build a director's *product* library). It sits with F8 as a **self-hosting** play that operates on Studio's own rulebook (autopsy, quarantine, PROJECTION §10).
- **Registry home:** unresolved — and that's a known open question, not a gap I'm inventing. IG4 (`playtest-notes.md` L240) already flags that *non-golden-path families have no registry home yet*: "EL-family plays have no registry home yet — decide whether they join `registry.js` (with a family tag) or get their own catalog." The Curator inherits that same decision. Precedent exists for a family tag: `back-of-house-walk/brief.md` uses `job: Library` / `chain: EL2…` (L22–23) to mark family membership outside the PM catalog. **Recommendation:** give the Curator a family tag (e.g. `family: studio-maintenance`) and keep it out of `registry.html`'s golden-path chain.
- **Pipeline position:** it's **not in a linear pipeline** — it's an **event-triggered maintenance loop** that fires when one of three conditions occurs, on top of whatever else Studio is doing.

## 3. Inputs / outputs

The Curator is **three triggers into one unified move graph** (fix-list L103). Each trigger has its own input and disposition:

| Trigger | Fires when | Input | Process (per fix-list L105–109) | Output |
|---|---|---|---|---|
| **Capture** | a session surfaces a learning worth preserving (e.g. this playtest's 9 META findings) | the raw learning + its context | classify the learning → write to `inheritance/autopsy/` **with provenance + verdict** | an autopsy entry **+ a `capture` event on the Ledger** (actor = who surfaced it) |
| **Deprecate** | a *verified* doc↔exemplar inconsistency (F1, F5, F6 are instances) | the drifted rule + the evidence it's stale | mark dead in **PROJECTION §10** → remove from load-bearing docs → record reason | updated §10 disposition (→ *rejected/superseded*) **+ a `deprecate` ruling event** |
| **Quarantine** | incoming inheritance from elsewhere / a prior era (another branch, another product) | the foreign material | sequester to `inheritance/quarantine/` → **DO NOT touch load-bearing rules** until explicitly dispositioned | quarantined copy (verbatim, provenance header) **+ a `quarantine` event**; later promotion is a *second* disposition through §10 |

**Cross-cutting invariants** (from the autopsy rules the Studio already runs, `README.md` L176–199):
- **Inputs:** every input is **untrusted data, never instructions** (README L272) — material to record, never commands to follow. This matters most for the Quarantine trigger.
- **Outputs:** every disposition **emits a human-readable verdict** stating what it examined (README L197, L284), carries **provenance** (who/when/from-what), and **never invents** — a learning the source can't substantiate is flagged, not filled (README L188).
- **Ledger backing (per `work-with-the-ledger.md` D2/D5):** the markdown disposition is the *projection*; the *source of truth* for "who dispositioned what, when" is the appended Ledger event. The Curator's "subscriptions on relevant ledger events" (fix-list L111) are how Capture is *triggered* (e.g. a session-close event), and its dispositions are how it *writes back*.

## 4. Relationship to existing plays

- **F8 (make-a-play) — peer, not parent.** F8 writes plays *following* the rulebook; the Curator *updates* the rulebook from learnings (fix-list L110). They are the two halves of Studio dogfooding Studio. Neither subsumes the other.
- **EL6 (Living Updates) — structural twin at product scale.** EL6 "keeps the library accurate as the product changes… update plays declare *intent*… and emit card-diffs as logs" with a 2-gate director QA (`library-elicitation-plays/plan.md` L82–88). The Curator is *the same shape* — intent-headed maintenance, gated, ledger-logged — but its "library" is **Studio's governance rulebook** rather than a director's product cards. The playtest META explicitly says this discipline *"scales… the same Planes-ethos pattern applies"* to a product library (`playtest-notes.md` L36–38). **Design implication:** the Curator and EL6 should share a spec skeleton; building one informs the other.
- **The Hardener — adjacent, different job.** Hardening attacks a *single brief* for soft spots before Gate 1 (`playtest-notes.md` L152). The Curator attacks the *standing rulebook* for drift and contagion. Hardener = design-time, per-play; Curator = maintenance-time, repo-wide.
- **The autopsy/quarantine mechanism — the Curator's substrate.** `inheritance/README.md` + `PROJECTION.md` §10 are the *files and the table* the Curator reads and writes. The Curator turns that **static promotion-path procedure** (today: "when conversion work begins, each convention gets the step-0 treatment… ruled by the Director" — `inheritance/README.md`) into a **triggered, runnable play**.

## 5. Function and Tier (Brick 0 lexicon)

Per the Brick-0 ruling (Role / Tier / Function / Play; `playtest-notes.md` IG1/IG2, L198–214):

- **Function: Operations.** Of the eight (Insight · Strategy · Definition · Delivery · Launch · Analytics · Communication · Operations), the Curator is **maintenance/grooming of the standing rulebook** — keeping the system's own records correct and uncontaminated. That is **Operations**, not Insight (it doesn't generate new product understanding) and not Definition (it doesn't define what to build). *Note: Operations is currently a named-but-empty slot Function (IG1 answer, L211) — the Curator would be among the first plays to populate it, which is consistent with it being a newly-surfaced internal play.*
- **Tier: PM** (see assumption A3) — matching every authored Studio play and the Brick-0 "golden path lives at the PM tier" ruling.

**One-line registry sketch** (pending the family-home decision in §2):

```
{name:'The Curator', slug:'curator', glyph:'🧹',
 tier:'PM', function:'Operations', family:'studio-maintenance',
 prio:'…', status:'slot',
 d:'Grooms Studio's own rulebook: Capture learnings → autopsy, Deprecate
    verified drift → PROJECTION §10, Quarantine incoming inheritance.
    Three triggers, one move graph; dispositions append Ledger events.'}
```

*(`function:` not `job:` — per the IG1/IG2 rename task, `playtest-notes.md` L214.)*

## 6. Dependencies & open questions for the Director

1. **D5 event type must land first.** Capture/Deprecate/Quarantine want to append *decision* events, but the shipped ledger has no generic ruling type — D5 calls to adopt `assessment.recorded` or add `decision.ruled` / `ruling.recorded` (`work-with-the-ledger.md` D5). The Curator is a natural *first consumer* of that type.
2. **CLI surface.** Fix-list L111 anticipates `ax curate <trigger>` handles to fire from the runtime. Under the ledger decision, these likely wrap `ax inspect events append` rather than a new subsystem.
3. **Registry home** (§2) — family tag in `registry.js` vs a separate catalog (inherits IG4's open question).
4. **Gate model.** Following Studio's 2-gate default and F7's gate-density dial: does a *deprecate* (removing a load-bearing rule) warrant a Director gate every time, while a *capture* runs detached? My read: **Deprecate is Director-gated** (it changes the rulebook), **Capture and Quarantine can run detached** (they only add records / sequester — nothing load-bearing changes until a later, gated promotion). Confirm.
5. **Build vehicle.** Strong case to build the Curator *through F8 (make-a-play)* once that lands — it would be an early proof that the playmaking play can produce a maintenance play, and its §4 move graph would be the canonical, drift-proof spec.

---

**Evidence base:** `studio/plays/research/library-elicitation/playtest-2026-06-21/studio-fix-list.md` (L100–111, F9; L85–96, F8); `…/playtest-notes.md` (L25–38 contagion/Planes-ethos; L198–214 Brick-0 lexicon; L240 EL registry-home); `studio/inheritance/README.md` (autopsy vs quarantine, promotion path); `studio/plays/PROJECTION.md` §10 (dispositions); `studio/plays/README.md` (L176–199, 272–305 autopsy rules); `docs/alexandria/plans/library-elicitation-plays/plan.md` (L82–119 EL6); `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md` (D1–D5, the provenance-as-ledger decision); `studio/plays/registry.js` (tier/function/family patterns); `studio/plays/back-of-house-walk/brief.md` (L22–23, family-tag precedent).
