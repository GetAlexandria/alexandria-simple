# Playmaker Studio Library — Session Handoff, Project Plan & Opening Prompts

**Date:** 2026-06-27. **Purpose:** capture a long working session so a fresh agent can pick it up. Read this top-to-bottom; everything you need is here or pointed to.

---

## 1. TL;DR — where we are

We're building a **preliminary product library for Playmaker Studio** by running a **Back-of-House (BoH) sweep** (read the source → draft cards + a list of gaps/problems), anchored by a **Vision**, rendered on the existing empty-library surface. Then a **Front-of-House (FoH)** Raven↔director conversation tunes it, and the director approves a final.

- **Surface foundation: SHIPPED on `main`** — #429 (Card contract + first-class `plane`), #430 (what-it-does/how-it-does-it stories + type-keyed diagrams), #432 (threads + fill-readiness), #434 (typed-link contract, diagrams derived), #438/#439 (fill-readiness accuracy). #440 (index/appendix altitude) is OPEN, unstarted, safe to dispatch anytime.
- **BoH sweep: DOGFOODED** — a blind, Vision-anchored, source-disciplined sweep (2 passes: frame-out → emit) ran on Playmaker Studio → a draft library at **`studio/sweeps/playmaker-studio/`** (39 cards · 8 contexts · 11 threads). It renders and passes the story lint against `main`'s surface. Self-check PASS. It found 3 integration seams (see §5).
- **NEXT (this handoff's project):** build the **3-tab PMS pipeline** (Back / Drafts / Final) in Alexandria's library section. See §6.

---

## 2. The discipline (load-bearing — do not violate)

- **Three PURE states, made visible as 3 tabs.** PMS-Back (pure BoH output) → PMS-Drafts (Raven FoH tuning, version-controlled) → PMS-Final (director approval). Keep each state **pure for an archaeological dig**: BoH output is *immutable, never hand-edited*; FoH changes *layer as tracked patches/events*, they don't overwrite the BoH baseline.
- **Don't blur BoH and FoH.** BoH = read source, produce the draft library + threads. FoH = Raven's director conversation that resolves threads and *updates* the rendering. They are separate states and separate steps.
- **Raven asks the director for clarification IN FoH — the builder does NOT.** The **threads** (gaps + hot_spots) the sweep found *are Raven's FoH agenda*. Resolving a thread (e.g. "which type vocabulary is right") is FoH/Raven's job, never a question put to the director by the build agent.
- **FoH improves the rendering.** The controlled experiment = Raven consumes the BoH rendering + threads, runs the director conversation, and *updates* the rendering (it gets better). **Open question (deferred):** whether/when the director *sees* the surface live during FoH — for the controlled start, it's about Raven updating it, not live integration.
- **Born atomic:** cards are the source of truth (no intermediate document); the catalog/empty-library surface IS the library.
- **Canon = the operational code**, not plan/Brick docs (those are partly stale/aspirational). Verify against `schemas.ts`, `library-catalog.ts`, `library-catalog-story.ts`, `library-graph-loader.ts`, `library-front-of-house.ts`, `engine-view-model.ts`.

---

## 3. The Vision — Playmaker Studio (standalone product), 9 slots

Drafted conversationally with the director (90% — good enough for the test). Written for Playmaker Studio as its own product, even though it currently lives inside Alexandria. (Bank to `raven-product-context.md` when finalized.)

**1 · Shift —** Until ~2023 the binding question about AI was capability — could a model do the task at all? By 2025 that's settled: a competent agent can draft the strategy, run the analysis, write the code. What it still can't do is the same task the *same way, well, every time* — one prompt is clean today and subtly broken tomorrow, and one good run says nothing about the next hundred. Scarcity inverted: capability went abundant, **reliability became the bottleneck**. And reliability turned out to be a discipline (process + prompt + orchestration + a test suite that proves it), not a prompt. Most of the world is still writing prompts.

**2 · Person —** **Danvers** — years into prompt engineering, an operator more than a software engineer but fluent at getting models to do real work. He's building an operation that needs *thousands* of reliable agentic workflows. He knows the recipe (process · prompt · orchestration · tests) but holds all four at once, scattered across tools, files, and a chat window, with no way to see how they fit or where a result went wrong. He's sick of carrying the complexity, and wants the agents themselves to do more of the building without quality slipping. Stands for anyone running complex agents at scale, Alexandrian or not.

**3 · Named Pain —** *"Good agentic work means juggling four things — process, prompt, orchestration, a test suite to prove it — and I track all of it in my head across five tools and a chat box. When something's wrong I can't tell which of the four broke it. And I need this thousands of times, at a quality bar I can't hit hand-crafting each one. None of it is anywhere I can see it."*

**4 · Discovered Pain —** *"I thought the work was just inherently complex and I had to hold it together. The real problem was it was invisible and scattered — I could never see the seams, trace a failure, or hand the building off. The moment it's all in one place, the complexity stops living in my head: I can walk a broken result straight to its cause, and agents can build the next thousand into a structure that exists. I didn't need to hold more. I needed to see it."*

**5 · Inadequacy —** Prompting/one-off runs were built for "can it do the task," not "the same result every time"; nothing accumulates (work re-derived each run); "it worked once" masquerades as proof on a stochastic runtime; verification lands on the one person who can't read the work; prose rules get evaded; it doesn't scale (quality stuck in one head).

**6 · Mechanism —** **Playmaker Studio is the only place that builds an AI agent's whole craft — its process, prompt, orchestration, and test suite — on one visual, traceable surface, so you can see exactly how a play works and walk any failure straight to its cause.** A play is designed once, *derived* (never hand-edited) into a runnable workflow, proven by k-run statistics, promoted up a fixed ladder (Backlog→Sourced→Designed→Built→Proven→Live) on human confirms at gates. Self-hosting (the play that builds plays is itself a play); agents do most authoring at volume, the human spends judgment at gates. The *tactical* layer — not giving an agent a seat or memory, but making the agent's work reliable, consistent, traceable. Primitives: the play (typed move graph → story + diagram + workflow) · the ladder + two gates · proving-as-statistics · the traceable play surface · make-a-play.

**7 · Felt Experience —** A play goes soft; instead of three hours poking across tools, he opens it — process, prompts, orchestration, test results on one surface — and sees it immediately (a missing fixture let a weak spot through "green" for weeks). He adds the fixture, re-proves (30 runs), it climbs back to Live. Then he names three new plays and the agents build them up the board to his gates. By Friday three more reliable plays he barely had to build. He's not holding the machine in his head — he can see it, trace it, and let agents build into it.

**8 · Proof —** Plays authored mostly by agents at volume still clear a stated reliability bar (human time at gates, not hand-building); when a play misbehaves, root cause found in minutes (the specific move/prompt/missing test); outside teams adopt it.

**9 · Refusal —** Never a prompt hidden in a chat window (the whole craft is visible or it isn't a play); never "it ran, ship it" (a real run count + a human confirm on a legible artifact; a new unexplained failure stops the line; a play refuses, never invents); never the colleague-or-context layer (it makes the *work* reliable/traceable; works for anyone, not one ecosystem).

> **Vision-as-anchor rule for the sweep:** inject **Mechanism + Felt Experience + Proof** as the lens (salience, what to look for, the product's language). It is the *intended* story — the **source is the only authority for what exists**; deltas (intended-but-absent, or contradicted) are the most valuable output (= threads). For *this* product the contextually-real "refusal" is a **scope fence**: Playmaker Studio is buried inside Alexandria — scan only the Studio (`studio/**`, `packages/viewer/src/components/studio/**` + its concepts), NOT Alexandria's library/atomizer/Raven-colleague/runtime (note those as external dependencies, never cards).

---

## 4. The BoH sweep — how it works (the spec → becomes the play)

Architecture: one agent run over the product's source, producing a born-atomic Product-plane draft library (stub cards with WHAT/WHERE/HOW bodies + typed links) + a structured `threads.json`, into a fresh root. It's the `back-of-house-walk` brief's move spine instantiated for the shipped contracts + the Vision discipline. Run it with **blind agents** (no conversation context) so it reads cold and doesn't confirm what we already "know."

Passes (the brief's `survey → pass1_events → pass2_carve → pass3_altitude → emit_bundle → check_bundle`, instantiated): **0 Orient** (read-ladder, ~30-read cap) · **1 Harvest** (domain events + nouns, each with file:line) · **2 Carve + Reconcile** (bounded contexts where vocabulary shifts; sort every noun into CONFIRMED / GAP / SURPRISE; flag hot_spots) · **3 Classify** (type/altitude/confidence — from source, don't normalize to an external list) · **4 Emit** (cards + `library.json` {schemaVersion:"product-card.v1"} + `threads.json` + READ-COHERENCE) · **5 Self-check** (cold re-read → PASS/REPAIR/FREEZE). Run as two blind agents (frame-out, then emit) with a review gate between.

Output contract (the shipped shapes): card = Small-floor frontmatter (`type·prefLabel·plane·context·status`) + `confidence` + provenance (`proposed_by`+`source_evidence`) + typed `links:` + body `## WHAT/## WHERE/## HOW`. The exact frame-out + emit prompts from this session are reconstructable from §3's anchor + this spec; the dogfood proved them.

---

## 5. Dogfood result + the 3 seams (fix in the PROCESS, keep BoH pure)

`studio/sweeps/playmaker-studio/` — 39 cards / 8 contexts (production-line, brief, workflow, proving, board, catalog, operations, make-a-play) / 11 threads (5 gap, 6 hot_spot). Renders + story-lint clean. Self-check PASS. Validated the approach: the blind agent flagged *"proving is specified but never performed"* as a **gap** instead of hallucinating it built.

**Seam 1 — diagrams don't draw.** The sweep used the source's own type-words (Concept/Stage/Gate/Agent/Mechanic/Value/Rendering); the diagram renderer keys off a different set (Aggregate/Value/Read-Model/Surface). 0/39 diagrams. Pictures aren't needed for QA (Raven doesn't need them) — but this symptom exposed a **real must-fix**: see §5b. The PMS-Back QA surface ships stories-without-diagrams for now.

**Seam 2 — `threads.json` shape ≠ the catalog's thread parser** → 9 of 11 threads rejected ("missing/invalid kind; concern missing context or plane"). **Pin the real `threads.json` contract from the code** (`library-catalog.ts` thread/fill-readiness parser) and make the sweep emit exactly that. The threads contract is under-documented — read the parser, don't trust prose.

**Seam 3 — `READ-COHERENCE.md` mis-parsed as a card** (a sibling `.md` in the root). Move BoH's reports under `runtime/` (excluded from the card scan), like the real empty-library bundles do.

---

## 5b. The real issue under Seam 1: our category-words ≠ the director's product-words (MUST-FIX)

Raven doesn't need the *pictures* (diagrams deferred — confirmed). But "0 diagrams" exposed a real problem: a card's `type` is a **category of word** (Entity, Value, Capability…), and those category-words are generally **not** the words a director uses to describe their product. The sweep conflated them — it used the Studio's own domain words (Stage, Gate, Play, Mechanic…) **as types**. Those are **instances**, not categories.

**The fix (Danvers: "we definitely need to fix this"):** classify each card into a **stable, shared category vocabulary** (the `type` — render-keyable, consistent across every director's library) and keep the **director's own word as the label/prefLabel** (the instance). A card is "category = Value, label = Stage," not "type = Stage."

**Use the existing asset:** the **Vocabulary** work — the big batch of *company vocabularies* (e.g., Airbnb, a video game like Hollow Knight) that takes each **category** and gives the **specific example each company uses** for it — is exactly the category↔instance bridge. The sweep's classify step (Pass 3) should map a director's found word → its stable category *by analogy to those examples*, keeping the word as the label and surfacing low-confidence/ambiguous mappings as **threads** for Raven's FoH. See `docs/alexandria/plans/library-population-playbook/vocabulary/` (the explorer + ~440 worked cards) and the **Name-the-Things** play (synonym/instance unification). *Verify the exact path/state before relying on it.*

Corollary: the canonical **category set** still needs settling (the long-running type reconciliation — `studio/library`'s DDD words vs the conformance validator vs the Engine render set). That settled set becomes the shared category vocabulary the sweep classifies into. This is the work that makes diagrams render later AND honors the director's language now.

## 6. THE PROJECT PLAN — the 3-tab PMS pipeline

Add three tabs to Alexandria's library section. Each tab is one of the three pure states.

- **Tab 1 · PMS-Back (build first).** Render the **pure BoH output** (`studio/sweeps/playmaker-studio/`, or a chosen libraryRoot) read-only. Scope: fix **Seam 2** (pin + emit the real `threads.json` contract so the gaps/hot_spots load) and **Seam 3** (reports under `runtime/`). Leave **Seam 1** (diagrams) deferred — stories + the loaded threads list = QA-able. This *is* the QA-able preliminary library. Reuses the shipped surface (#429–#439).
- **Tab 2 · PMS-Drafts.** Raven's FoH workspace: a **working copy** of the Back state that Raven edits during the director conversation, **with version control around the edits** (every change tracked → the archaeological trail). Back stays pure; Drafts is the editable layer. The FoH walk play (`front-of-house-walk`, already *built*) is the engine — wire it to read the Back state + threads and write the Drafts state as tracked patches.
- **Tab 3 · PMS-Final.** The director's approval surface — what the director reviews and confirms (the confirm gate, `library.confirmed`) as the last step before the library is built. Likely reuses the empty-library confirm gate (`empty-library-confirm`, built).

Sequence: **Back → Drafts → Final.** Build Back first (it's the QA-able surface and needs only Seams 2+3). Each as its own PR. Keep BoH/FoH/approval as distinct states throughout.

---

## 7. Opening prompt for the next build agent (Tab 1 · PMS-Back)

> Read `docs/alexandria/plans/pms-library-handoff/HANDOFF.md` first (it has the full context, discipline, and the data shapes). Then build **PMS-Back**: a new tab in the Alexandria library section that renders a Playmaker-Studio draft library read-only, pointed at `studio/sweeps/playmaker-studio/`. Two fixes are required for it to render cleanly, and BOTH must be done in the code/contract, never by hand-editing the swept files (BoH output must stay pure): **(a)** read the actual `threads.json` parser in `packages/ax/src/domain/library-catalog.ts`, pin its exact schema, and make the sweep's `threads.json` conform so all threads load (today 9/11 are rejected); **(b)** make the library loader treat `READ-COHERENCE.md` (and other BoH reports) as runtime/excluded, not as cards. Do NOT chase the missing type-keyed diagrams for PMS-Back (not needed for QA). The underlying issue IS a real must-fix (§5b — classify into a stable category vocabulary, keep the director's word as the label, via the company-vocabularies asset), but that's a *sweep-refinement* track, separate from rendering the existing swept output. Verify by loading the library through the real surface (a worktree at `origin/main` works; `bun src/tools/library-catalog-story-lint.ts --project-root ../.. --library-root <root>` lints it). Then write a short factory-style issue for Tab 2 (PMS-Drafts) and Tab 3 (PMS-Final) per §6, but build only Back.

---

## 8. Pointers

- **Issues:** #429–#439 (merged: contract/surface/threads/links/fill-readiness) · #440 (index altitude, open) · drafts PLB-001..006 under `docs/alexandria/plans/preliminary-library-build/`. *(Note: `main`'s `preliminary-library-build/plan.md` was authored by #432's Fabro run and differs from the working-branch copy — reconcile if needed.)*
- **Swept library (the dogfood / PMS-Back source):** `studio/sweeps/playmaker-studio/` (in this commit).
- **Board:** the work-orders were reconciled on the working branch `danversfleury/library-stub-fill-opening-moves` (one tracker, importance-ordered; shipped work folded to Done). Port that `studio/plays/board-state.json` edit if you want it on main.
- **Working branch** `danversfleury/library-stub-fill-opening-moves` is behind main and carries local WIP (incl. an `EmptyLibraryView.tsx` edit and untracked `studio/library/{_index,brief,grading}` hand-authored cards) — treat as scratch, prefer `main`.
- **Test harness:** a clean `origin/main` worktree renders/validates the swept library (deps must be linked from a working checkout).
- **Memory:** the `library-health-area-jtbd` auto-memory holds the full arc + decisions.
