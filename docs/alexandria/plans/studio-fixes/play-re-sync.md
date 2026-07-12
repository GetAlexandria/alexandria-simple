> **Agent-drafted 2026-06-22** for director review. Play Re-sync = the IG6 ruling (the retired "big edit"). Draft — not ruled. Replaces `studio/plays/BIG-EDIT.md`.

# DESIGN SPEC — Play Re-sync

*A Playmaker's Studio play. Director ruling, 2026-06-22. Replaces `studio/plays/BIG-EDIT.md` ("big edit" retired as a misleading frame). Grounded against BIG-EDIT.md, PROJECTION.md (Protocol E), AUTHORING.md (Protocols A–E), the derive/bank/check toolchain under `studio/tools/`, registry.js (compound-play precedent), and `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md`.*

---

## 1. What it is + the gap it fills

**Play Re-sync is the play that, after any edit to a play, computes what else just went stale and either re-derives it or flags it for re-authoring.** It is invoked as a sub-play inside *every* play-editing workflow — not occasionally, not only for "large" changes.

The old frame, **"big edit," was wrong on two counts**:

1. **It keyed on size.** BIG-EDIT.md gates the whole sequence on a cold-reader judgment call — *"would a cold reader of the old `story.md` / `diagram.svg` / `risk-map.md` be misled after your change?"* — and explicitly exempts small edits: *"A one-line prompt typo is not a big edit — fix it, re-derive (step 2), bank (step 6), done."* But that "small" path **is Play Re-sync, run with a small stale-set**. The size threshold is a fiction; the real question — *what else just changed, or needs to change?* — is asked by **every** edit. The difference between a typo and a graph reshape is not *whether* you re-sync but *how large the computed stale set is*.

2. **It was a checklist you were supposed to follow, not a thing that runs.** BIG-EDIT.md is governance-doc-shaped: eight ordered steps a human is trusted to execute in order. Its own header records why this is the gap — its seed was the *Frame the Problem → Riff promotion, "a large edit that silently invalidated the play's renderings, tests, audit, and recorded results — because the downstream steps were skipped."* A checklist's failure mode is the skipped step. **Play Re-sync removes the trust**: it detects the change, computes the consequences, and runs the mechanical ones, so a step *cannot* be skipped.

The director's framing of why this matters: Studio's superpower is that **one play is rendered many ways at once** — brief, diagram, story, Fabro build, tests — so a human gets "so many looks at the same thing" and can comprehend and QA it. The curse is **alignment**: edit one view and the others silently drift. Play Re-sync **pays that alignment tax mechanically instead of by hand**. "We've got to keep it all aligned and parallel as we edit."

---

## 2. The artifact-dependency graph — the heart of the spec

A fully-drafted play is a set of artifacts (`studio/plays/<slug>/`: `brief.md`, `workflow.fabro`, `prompts/<move>.md`, `diagram.svg`, `story.md`, `fixtures/`, `risk-map.md`, `known-fps.md`, `hardening.md`, `lint.md`, `moves.md`, plus the banked plugin copy and `legs.json`). The director's insight: **these artifacts have explicit, computable dependencies on each other** — "when X changes, Y is now stale." The data model is this edge set. Play Re-sync runs *on* it.

Edges below are derived from BIG-EDIT.md's eight steps, PROJECTION.md's projection table + Protocol E's parity clauses (E.1–E.7), and the derive/bank/check tooling.

| # | Edge (X → Y) | Direction | Staleness it implies when X changes | Disposition |
|---|---|---|---|---|
| **E1** | `brief §4 (move graph)` → `workflow.fabro` | one-way (projection) | Nodes/edges/types no longer project from the graph; editing `workflow.fabro` directly without a matching §4 change is itself the parity break | **needs-authoring** — re-project per PROJECTION.md §2; checked by Protocol E.1/E.3, `fabro validate` (E.6) |
| **E2** | `diagram.svg` ⇄ `workflow.fabro` | **both** ("fabro is the diagram and vice versa") | A graph change makes the drawing a lie; a hand-edited drawing is a forbidden authored rendering | **auto-derivable** — `derive-views.sh` → `fabro graph … -d tb` + `theme-diagram.py`; never hand-edited |
| **E3** | `story (confirmed)` → `diagram` → `fabro` | one-way down the chain | A confirmed change to the *read* of the play must land upstream in §4/prompts first, then re-propagate to diagram + story; a story edited in place is a Protocol E failure | **auto-derivable** for the re-render; **needs-authoring** for the upstream landing (the confirmed change goes to brief §4 / `prompts/`, never to `story.md`) |
| **E4** | `brief §4 / prompts` → `story.md` | one-way (projection) | `story.md` inlines each move's prompt in golden-path order; any §4 or prompt edit makes it stale | **auto-derivable** — `generate-story.py` assembles from `brief.md §4` + `workflow.fabro` + `prompts/` |
| **E5** | `input contract (consumes)` → `fixtures/` | one-way | Fixtures feed dead inputs or miss new ones; the contract is the play's declared `consumes` | **needs-authoring** — drop dead inputs, add new ones; fixtures are graded material |
| **E6** | `moves / outputs` → `answer-keys` | one-way | Keys grade against retired moves/artifacts (BIG-EDIT.md §3) | **needs-authoring** — re-key to new outputs and move names |
| **E7** | `moves / outputs` → `risk-map.md` ids | one-way | Risk-map terminology references retired moves/ids; canonical-family convention + drift gate enforce on-taxonomy ids | **needs-authoring** (terminology) — but **drift detection is automatable** (risk-map drift gate) |
| **E8** | `prompts / workflow.fabro` → **placeholder spelling** | one-way (invariant) | A move's external inputs must stay single-`AX_` (`__AX_INPUT_<KEY>__`, …); a dead `__AX2_` ships literally — a silent miss | **auto-detectable** — `check-placeholder-spelling.sh` + conformance gate; the *fix* is authoring |
| **E9** | `workflow.fabro` (ACP work nodes) → **failure-fallback edges** | one-way (invariant) | A new/edited ACP work node without an outcome-guarded exit-1 fallback lets failure fall through as normal progress (PROJECTION.md §4) | **auto-detectable** — `check-workflow-edges.py` (Protocol E.7); the *fix* is authoring |
| **E10** | `brief §4 ↔ prompts frontmatter` (`consumes`/`emits`/move id/routing labels) | both (parity) | Name/contract drift between the graph and the prompt frontmatter; routing prompts promising labels the node's edges don't have | **auto-detectable** — Protocol E.2/E.4 string-match; the *fix* is authoring |
| **E11** | `brief §4` → `moves.md` overlay | one-way | `moves.md` is an *authored* (not derived) explainer; a spine change can outrun it (`derive-views.sh` runs an **advisory** `check-moves.ts`) | **auto-detectable** (advisory in derive, gated at Lint) — the *fix* is authoring |
| **E12** | `brief §4 / workflow.fabro / prompts` → `hardening.md` + `lint.md` | one-way | The old audit is not carried (BIG-EDIT.md §4); a reshaped graph or rewritten move invalidates the recorded audit + the Protocol A–E lint | **needs-authoring** — fresh `hardening.md` + `lint.md`; pre-run Protocol E mechanically first |
| **E13** | `brief §4` (move added/removed) → `dry-runs/` + `risk-map results:` axis | one-way | Recorded runs measured the *retired* play; results no longer earned (BIG-EDIT.md §5) | **auto-derivable side** — archive pre-edit runs to `dry-runs/archive-<old-shape>/`, reset `results:` to unproven; **needs-runtime** to re-earn (see §3 + §9) |
| **E14** | `studio/<slug>/{workflow.fabro, prompts/}` → **plugin copy** (`packages/alexandria-plugin/workflows/<slug>/`) | one-way (deploy) | The factory runs the **stale plugin copy** until banked — *"the silent footgun this whole sequence closes"* (BIG-EDIT.md §6) | **auto-derivable** — `bank.sh` (re-derives, refuses dead placeholders, mirrors, validates); drift detected by `bank.sh --check` + bank conformance gate |
| **E15** | `workflow.fabro` (node set) → `legs.json` (plugin tracker metadata) | one-way | A leg points at a node the banked graph no longer has | **auto-detectable** (advisory in `bank.sh`; runtime degrades to no-legs) — the *fix* is authoring |
| **E16** | the whole edit → `registry.js status` / board stage | one-way (bookkeeping) | The play's stage on the proving ladder claims more than it has earned post-edit (BIG-EDIT.md §7–8) | **needs-authoring** — advance/reset stage to match earned reality, never ahead of it |

**Read the graph as a propagation front.** `brief §4` is the root: it fans out to `workflow.fabro` (E1), which fans to `diagram.svg` (E2) and `story.md` (E3/E4), and — through its move/output/contract identity — to `fixtures` (E5), `answer-keys` (E6), `risk-map ids` (E7), the audits (E12), the runs (E13), and finally the plugin bank (E14) and bookkeeping (E16). The invariant gates (E8–E11, E15) sit across the edges as fail-closed checks. **Editing any node makes its entire downstream cone stale.** Play Re-sync computes that cone and acts on it.

---

## 3. How it's mechanical

The director's claim is that this is **100% mechanical, not a judgment call**. That holds because each step is a deterministic operation on the edge graph above — *what* re-syncs is computed, even where the *fix* is handed to an agent. Three phases:

**(a) Detect what changed vs. the last consistent state.** A "consistent state" is one where every edge holds (Protocol E green, bank in sync, renderings derived). Detect the delta against it — the changed paths since the last re-sync (a diff over `studio/plays/<slug>/`): which of `brief.md §4`, `prompts/<move>.md`, `workflow.fabro`, the input contract changed. A mechanical scan, not a judgment.

**(b) Compute the stale downstream set.** Walk the edge graph forward from each changed artifact to its transitive closure. A change to `brief §4` marks E1→E16 stale; a change to a single `prompts/<move>.md` marks E4 (story), E8 (placeholder), E10 (frontmatter parity), E12 (lint), E14 (bank) — a *smaller* cone. This closure **is** the re-sync work order, computed from the data model.

**(c) Propagate (auto) vs. flag (human/agent).** Partition the stale set:

| **Automatable — Play Re-sync runs it** | **Tool / gate** |
|---|---|
| Re-derive `diagram.svg` + `story.md` (E2, E4; E3 re-render) | `derive-views.sh <play-dir>` |
| Detect dead placeholders (E8) | `check-placeholder-spelling.sh` |
| Detect failure-blind ACP edges (E9) | `check-workflow-edges.py` |
| Detect `moves.md` overlay drift (E11) | `check-moves.ts` (advisory) |
| Detect risk-map id drift (E7 detection) | risk-map drift gate |
| Detect brief↔workflow↔prompts parity breaks (E1, E10) | `fabro validate` (E.6) + Protocol E string-checks |
| Archive pre-edit runs + reset `results:` (E13 mechanical half) | move `dry-runs/` → `dry-runs/archive-<old-shape>/`; set `results:` unproven |
| Bank studio→plugin (E14): re-derive + refuse dead placeholders + mirror + validate | `bank.sh <play-dir>` (`bank.sh --check` for drift-only) |
| Detect `legs.json` node drift (E15) | advisory inside `bank.sh` |

| **Needs human/agent re-authoring — Play Re-sync flags + routes** | **Why a human/agent, not a script** |
|---|---|
| Re-project `brief §4` → `workflow.fabro` (E1) | The projection is mechanical *as a mapping* but is authored work (PROJECTION.md §2); a graph reshape is a brief amendment, Director-ruled |
| Land a confirmed `story`-level change upstream (E3) | A hot-fix found in a rendering "is a parity failure by definition: the fix goes to the brief" (AUTHORING.md E) — judgment about *what to change* |
| Re-tune `fixtures/` to the new `consumes` (E5) | Graded material; which inputs are dead/new is content judgment |
| Re-key `answer-keys`/grading to new moves+outputs (E6) | Grading intent |
| Re-map `risk-map.md` ids/terminology (E7 fix) | Re-disposition risks against the new moves |
| Re-disposition `known-fps.md` provenance | *"a pattern dispositioned against the old play may no longer hold"* |
| Fresh `hardening.md` + `lint.md` (E12) | Design-interview + Protocol A–E judgment (Protocol E pre-runnable mechanically) |
| Advance `registry.js status` / board stage (E16) | Honest bookkeeping — *"never ahead of it"* |

**The honest line:** Play Re-sync **mechanically owns the entire detect+compute step and every auto-derivable propagation**; for the needs-authoring set it **mechanically produces the exact work order** (which artifact, which edge, why stale) and routes it to an agent, then **mechanically verifies** the result through the gates (Protocol E, bank conformance, drift gates). Nothing is left to "remember to." The judgment is bounded to *content of the fix*; the *existence and scope* of every fix is computed.

---

## 4. How it's invoked — a compound sub-play

**Play Re-sync is compounded into any play-editing workflow**, exactly as the registry's input plays (2b/2c/2f) are *"compounded in when their artifact is missing."* The precedent for one play summoned inside another — *"relate as a candidate sub-play"* — is the model. The inversion: input plays are summoned when an upstream *artifact* is missing; **Play Re-sync is summoned when an artifact just *changed*.**

**The compounding contract:**

- **Trigger: every change, not just "big" ones.** Any workflow that writes to a play's `brief.md`, `workflow.fabro`, `prompts/`, or input contract ends by invoking Play Re-sync over that play directory. The explicit reversal of BIG-EDIT.md's size gate — there is no "this edit is too small to re-sync." A typo-fix invokes it with a one-edge cone; a graph reshape with the full cone. Same play, computed scope.
- **The host edit-play hands off** the changed-artifact set (or Play Re-sync recomputes it by diff against the last consistent state). It runs phases (a)–(c), returns: *re-derived artifacts* (done), *flagged work order* (routed to the host's agent), and *gate verdicts*.
- **Idempotent + safe to over-invoke.** Run against an already-consistent play, the computed stale set is empty and it is a no-op (mirroring `bank.sh`'s no-op + `derive-views.sh`'s atomic re-derive). A host workflow can invoke it liberally — the cheapness that makes "every change" viable.
- **It does not design.** Like the Author, Play Re-sync *"polishes and structures; you do not design."* A stale-set member needing a graph-shape decision is a Director-challenge, never auto-decided.

This is the concrete shape of **F8 (make-playmaking-a-play)** for the maintenance arc: the BIG-EDIT.md checklist becomes a play that **runs**, so the drift it used to depend on a human to prevent becomes a computed-and-gated step. Per the playtest, *"the moment playmaking is itself a play, this drift becomes a Protocol E lint failure."*

---

## 5. Scope

**Fully-drafted plays only.** Play Re-sync requires that **all of a play's representations already exist** — `brief.md §4`, `workflow.fabro`, `prompts/`, the derived renderings, `fixtures/`, `risk-map.md`. It is a **maintenance/edit play**, not initial assembly: it re-syncs artifacts *against each other*, so it presupposes a complete set to re-sync. The forward-design pipeline (research → brief → hardening → Gate 1 → derive → tests → Gate 2) **builds** the artifacts; Play Re-sync **keeps them aligned thereafter**.

Boundary cases:

- **Reverse-derived plays** (e.g. `build-atomic-card`, inline-prompt, no `prompts/` dir): `derive-views.sh` refuses without `prompts/`; the story re-derives directly via `generate-story.py`. Play Re-sync must branch on play shape when selecting the auto-derive tool. *(Assumption flagged — confirm the inline-prompt path, §9.)*
- **Pre-draft plays** (status `slot`, "grounding only" / "full sketch") are **out of scope** — no full artifact set to re-sync.

---

## 6. Function + Tier (Brick 0)

Per IG1/IG2 (*"a Play just declares its Function + Tier"*):

- **Function: Operations.** Play Re-sync produces no new design artifact and makes no product/insight call — it **maintains the integrity of an existing system of artifacts**. Of the eight Functions, Operations fits (keep the machine aligned and running). *(Operations is one of the four named-but-empty slot Functions today — IG1; Play Re-sync would be a first concrete Operations play. **Assumption flagged** — the Director may prefer Delivery if re-sync is framed as part of shipping the edit. §9.)*
- **Tier: Coordinator.** Bounded, mechanical, non-discretionary execution against a defined contract — not the PM-tier design ownership the golden path carries. *(This puts Play Re-sync **off the PM golden path** — like the EL-family plays, no `registry.js` home today; §9.)*
- **Compounded into other plays** — a sub-play, not a golden-path rung.

---

## 7. Relationship to existing pieces

- **BIG-EDIT.md — replaces.** Play Re-sync **formalizes its ordered steps 1–8 into a running play** and **retires its size gate**. BIG-EDIT.md's "order is load-bearing" property *becomes* the topological order of the edge graph (§2); its "safety net" gates *become* the auto-detection layer (§3a/b). The doc becomes the play's grounding, not a checklist a human follows.
- **PROJECTION.md / Protocol E + `derive-views.sh` + `bank.sh` — orchestrates.** Play Re-sync does not reimplement these; it **sequences the existing mechanical pieces**: re-derive → re-tune (flag) → re-audit (Protocol E pre-run + flag) → sideline (archive + reset) → bank → bookkeep. Protocol E remains the anti-drift law; Play Re-sync is what *invokes* it on every edit instead of trusting a human to.
- **F8 (make-playmaking-a-play) — instance of.** This is F8 for the edit/maintenance arc (§4) — the **maintenance** counterpart to `make-a-play`'s **assembly**.
- **The Ledger — records into.** Per work-with-the-ledger (D2): a re-sync run is a sequence of **ledger events**, not a hand-kept record. Auto-derivations carry `actor.kind = process/agent`; human/agent re-authoring carries `actor.kind = agent`; a Director ruling on a flagged graph-shape change carries `actor.kind = user`. The D5 gap (no generic `decision.ruled` event yet) applies — adopt `assessment.recorded` or wait for the new type.

---

## 8. The "tighter data model" it requires/implies — typed artifact links

Play Re-sync is **Brick 0's typed-links idea (F2) turned inward** — F2 types the links *between library cards*; Play Re-sync types the links *between one play's own artifacts*. The edge graph in §2 **is** that data model. Today those edges are **implicit** — encoded in tool behavior (`derive-views.sh` knows story derives from brief+workflow+prompts), in Protocol E's prose, and in BIG-EDIT.md's step order — but never declared as data. For re-sync to be *computable* rather than *re-discovered by reading the tools*, the play needs the edges as **typed, first-class artifact links**:

- **Each edge declared** with: source artifact, target artifact, **type** (`projection` / `bidirectional-faithful` / `grades` / `audits` / `deploys` / `invariant-gate`), and **disposition** (`auto-derivable` via named tool, vs `needs-authoring`). §2's table is the seed schema.
- **A "last consistent state" marker** per play, so (a)-detection has a baseline to diff against.
- **Yoking the artifacts to each other** (the director's phrase) is exactly this: `consumes`/`emits` already yoke moves to fixtures *informally*; typing every edge makes the stale-set closure a graph walk instead of a tool-by-tool re-run.

This typed-link model is the load-bearing dependency: **the play is only as mechanical as its edge graph is explicit.** Where an edge stays implicit, re-sync degrades to "run all the tools and trust they cover it" — BIG-EDIT.md's run-the-whole-sequence fallback, not the computed-cone ideal.

---

## 9. Open questions / dependencies for the Director

1. **Function ruling.** Operations vs Delivery (§6). Best-grounded read is **Operations**; Delivery is defensible if framed as "part of shipping the edit."
2. **Registry home.** Off the PM golden path (a Coordinator-tier compound sub-play), like the EL-family plays with no `registry.js` home yet (IG4). Family tag vs separate catalog — tied to the same deferred decision.
3. **The typed-link model is a real dependency (§8).** Declare the edge graph **as data** (a per-play `links` manifest), or accept **"re-sync = run the existing tools in BIG-EDIT order, computed-cone as a future upgrade"** for v1? The fully-mechanical ideal requires the former; v1 can ship on the latter.
4. **Inline-prompt plays (§5 boundary).** Confirm the re-sync path for plays with no `prompts/` dir (e.g. `build-atomic-card`). Branch on play shape, or out of scope for v1?
5. **Runtime-coupled edges (E13).** The *mechanical* half (archive runs, reset `results:`) is automatable now; **re-earning** proof depends on the `ax run` modes from #305. Play Re-sync flags re-proof as owed-runtime, not auto-run, until that lands. Confirm the boundary.
6. **Ledger event type (D5).** Re-sync dispositions need an event type — adopt `assessment.recorded`, or wait for `decision.ruled` / `ruling.recorded`?
7. **Detection baseline mechanism.** "Last consistent state" (§3a, §8) — committed git state, a re-sync checkpoint event in the ledger, or a stored hash set?

---

*This spec replaces the framing in `studio/plays/BIG-EDIT.md`. On adoption, BIG-EDIT.md's ordered steps become Play Re-sync's edge-graph traversal order; its safety-net gates become the detection layer; the "big edit" name is retired.*
