# Rebuilding the Library of Alexandria, Brick by Brick

**Status:** Plan / synthesis (2026-06-20). Consolidates one design conversation that ran from "the very first director question" through to atomic-card creation. Nothing here is new invention — it inventories the challenges we surfaced and the existing solution/prototype each one needs **modified, not rebuilt**.

## The goal

Use Alexandria's own tooling — the **Raven power-up** and the **atomic-conversion plays** — to build an **accurate, vibrant product library for Alexandria itself**. Dogfood: rebuilding our own library is what proves the tooling works.

- **Accurate** = the structure is right — correct nouns, correct shelves, correct edges.
- **Vibrant / living** = the library functions as a *living business plan*, not a static card dump.

## The organizing principle: horse before cart

We already have the **cart** — the Fabro-powered atomic-conversion plays (the old Conan/Sam work, reverse-derived). We are missing the **horse** — the power-up and the tooling/experience that builds and **confirms the empty library** (shelves, labels, layout) *before* anything is atomized into it. That experience has been prototyped several times but has never been **integrated, skinned, and tested in the new world**. This plan builds the horse, then re-points the cart, then dogfoods both on Alexandria.

Walking backwards from what a good atomic library needs: **aisles + shelves + labels + layout, confirmed first — then filled.** Every brick serves that.

## Frame: how the graph gets built — three passes

The graph is built in three successive passes; each is a different artifact, a different source, and needs a different view. The plan is organized around them.

| Pass | What it is | Sourced from | View |
|---|---|---|---|
| **1 · Nouns** | named cards on shelves (Vocabulary) | code/docs + director naming | folder / shelf |
| **2 · Structural edges** | containment + core paths (Skeleton/Surface) — the wikilink layout | code structure + Product Walk + director projection | constellation |
| **3 · Causal edges** | the Plane loop (Strategy→Product→Learning) — the *living business plan* | director intent + the Ledger | **does not exist yet** |

**Two axes, kept deliberately separate — this is a naming trap.** **Planes** (Strategy / Product / Learning) classify *what kind of knowledge* a card holds. The three **passes** above (nouns → structural edges → causal edges) are *how the graph gets built.* They are orthogonal — and the causal-edge pass is precisely what wires the Planes together into the living-business-plan loop. *(Terminology, settled: **Plane** is canonical — Strategy / Product / Learning. "Layer" / "causal layers" is a retired synonym that has drifted back in before; this plan uses "layer" for nothing — not the Planes, not the passes.)*

---

## The challenges (the big list)

Each: **the challenge · where it stands today · the modification** (not a rebuild).

### A. Sequencing — the empty library before the fill

**C1 — The atomizer reproduces "pell-mell."**
The Source-of-Truth Atomic Conversion play eats *any* document and lets its triage step invent categories and pick which synonym wins — the exact old-Conan pathology, faithfully re-coded.
*Stands:* `studio/plays/atomic-card-planning/` (registry `AC1`) + the three Fabro builds (planning / creation / build) parked on `restore-atomic-card-plays` (#228). They predate the 0.12.0 rename (call `ax2 cards`), are a reference snapshot, and carry the eval suite conan/sam/bridget/solomon.
*Modify:* change the input from "a doc" to "a doc **+ the confirmed Skeleton (shelves) + Vocabulary (lexicon)**"; triage slots concepts onto confirmed shelves in confirmed words; a concept with no shelf becomes a **gap report**, not an invented category. Migrate `ax2 cards`→`ax`, re-target to the pinned taxonomy, re-prove via the evals.

**C2 — There is no "empty library" to confirm.**
The reframe's keystone — *"yes, these are my words; yes, this is where things live"* — has no surface.
*Stands:* nothing built; the viewer already has folder + constellation views that could render an empty skeleton; the build-a-Raven plan describes the confirm concept.
*Modify:* render the confirmed shelves + lexicon + skeleton as a library view with **empty card bodies**, and make director sign-off a **gate** that precedes any atomization.

### B. Pass 1 · Nouns — Vocabulary

**C3 — Vocabulary tooling is built, but broken, unskinned, and unbound.** The furthest-along piece by far.
*Stands:* `docs/alexandria/plans/library-population-playbook/vocabulary/` — a working explorer SPA (4 views) + a Bun corpus→JSON compiler + ~440 worked cards across 10 products. It already emits library-form output (shelf folders, `Type - Name.md`, `[[wikilinks]]`, WHAT/WHERE/WHY/WHEN/HOW). But: it won't run (an abandoned vocabulary→lexicon rename — build reads `lexicons/`, data is in `vocabularies/`); its 9-field frontmatter is its **own** schema, not the canonical `Standard - Card Frontmatter Schema`; and there is no elicitation **form** (the explorer is a QA browser).
*Modify:* (a) fix the ~3-line rename; (b) reconcile/translate its frontmatter to the canonical schema; (c) build the missing canvas elicitation form; (d) skin into the new viewer.

### C. Pass 2 · Structural edges — Skeleton + Surface

**C4 — Skeleton is spec-only and outputs prose, not the wikilink layout.**
*Stands:* `…/library-population-playbook/skeleton/` is a single 118-line template — but it is *already a graph elicitation* (entry stops, hubs with inbound/outbound, the main-path chain, side-trip branches). Its sibling `surface/` captures containment (places + what's here + capabilities). The mature relative is `product-walk/` (a static mock + one dogfooded `draft-walk.md`). All dormant since 2026-05-30. Both templates explicitly say *"output is a narrative doc; atomization is downstream"* and *"names are provisional; Vocabulary sharpens them later."*
*Modify:* retarget the output from narrative doc to **library-form nodes + edges** (containment tree + core-path edges as `[[wikilinks]]`); **bind to the lexicon** (stops/entities *are* Vocabulary nouns); raise to Vocabulary's maturity (guidance, examples, mock, form); adopt the sufficiency bar **"spine complete / periphery deferred"** — containment + one core path + load-bearing hubs; the long tail accretes later, because relationships are cheap to add and names are not.

### D. Sourcing the bricks (brownfield-first)

**C5 — Elicitation is "describe from memory"; code-as-source isn't wired.**
For a pre-existing product, the code holds the nouns and (at implementation altitude) the relationships; git holds the past.
*Stands:* `System - Codebase Scanner` is designed and claims-shipped (v0.5.0) — directory-pattern heuristics (not AST), "scanner proposes, human decides." But it is a **noun/boundary discoverer**, accuracy unvalidated, and not visibly wired into the current line; the only *proven* worked corpus (figma) was built from docs (help.figma.com), not code.
*Modify:* wire the scanner into the new line; extend it from nouns to **draft relationships**; add the director **projection** step (collapse implementation structure → product structure: 40 components → one Surface; `UserProfileServiceImpl` → "Account"); add **git-history** mining for "what it was"; and make the per-dimension **source map** the backbone of the on-ramp — **code → WHAT/WHERE/HOW · git → the past · director → the future + the why.** Scan + git first; director projects/confirms/names; elicit only the why and the not-yet-built.

### E. Pass 3 · Causal edges — the living business plan

**C6 — The planes aren't pinned.**
*Stands:* the on-disk library uses planes `experience / product / rationale / temporal`; the data model uses `Strategy / Product / Learning` (third name still open); the build-a-Raven substrate uses the three-plane causal model. Three different plane sets.
*Modify:* pin the planes and their causal connector semantics (Strategy *proposes* → Product *embodies* → Learning *tests* → updates the bet); and retire **"layer"** as a synonym for Plane — it is a recurring drift (it sits in the build-a-Raven substrate doc as "causal layers").

**C7 — The causal loop has no edge types, no view, and no state.** What makes the library *living* — and the newest, least-built pass.
*Stands:* WHERE-links are structural only (Contained-by, Operated-on-by…). The **forward arc** half-exists — every card's WHY chains up to a Product Thesis + Principle ("built to serve this bet"). The **feedback arc** (Product→Learning→Strategy: "produces evidence," "updates the bet") is missing because it lives in the **Ledger**, the least-built pillar. The build-a-Raven substrate explicitly defers "cross-plane edges *with state*."
*Modify:* add three **epistemic edge types** (proposes/embodies · produces-evidence · confirms/refutes) as first-class typed links; wire Product→Learning→Strategy through the Ledger; build the **causal-edge view** that draws the loop and **lights it with state** (this bet: tested-and-holding / contested / never-tested; this area: has evidence / dark). A drawn loop is a diagram; a lit loop is a business plan.

### F. The dogfood target + new-world integration

**C8 — Alexandria's own library is stale (this is the dogfood target).**
*Stands:* `docs/alexandria/library/` — 208 cards, but only **2** carry the frontmatter the schema mandates; the viewer's hardcoded layout has drifted from the folders; the `artifacts/` shelf holds **91** cards (one shelf swallowing ~half the library — the pell-mell problem made physical); names predate several reframes.
*Modify:* don't hand-patch it — **rebuild it brick-by-brick through the new tooling** (scan Alexandria's code + git → confirm the empty library → atomize). Producing Alexandria's own vibrant library *is* the test of the tooling.

**C9 — The prototypes are scattered and un-integrated.**
*Stands:* two overlapping plans — `library-population-playbook/` (the 5-bar Product plane, where the real prototypes are) and `build-a-raven-onboarding/` (the four madlibs + the raw→SoT→atomized provenance trail) — plus standalone HTML in `canvas-library-spike/prototype/product-library/`.
*Modify:* reconcile them into **one power-up flow**, and integrate + skin + test it in the new viewer/canvas — the "new world" work the prototypes have never had.

---

## The plan, brick by brick

Ordered so each brick stands on the last: the **horse** (bricks 0–4) before the **cart** (brick 5) before the **dogfood** (brick 6) before the **vibrancy capstone** (brick 7). Integration/skinning (C9) threads through every brick.

- **Brick 0 — Pin the foundations.** The planes (C6), the category taxonomy, the canonical frontmatter schema, and the link-type vocabulary (structural + the three epistemic types). The "decide the shelves/labels/layout enums" step; unblocks everything and resolves the drift.
- **Brick 1 — Vocabulary to done (C3).** Closest to the finish line; finishing it proves the node layer and the emit-library-form pattern end-to-end.
- **Brick 2 — Skeleton + Surface to peer (C4).** Now you have nodes + structural edges = the empty library's shelves and wikilink layout.
- **Brick 3 — Brownfield sourcing (C5).** Wire the scanner, add projection + git-past, encode the source map — so the empty library is drafted from Alexandria's own code/git, not memory.
- **Brick 4 — The confirm gate + empty-library view (C2).** The "yes, these are my words; yes, this is where things live" moment.
- **Brick 5 — Re-point and migrate the atomizer (C1).** `ax2`→`ax`, input = confirmed Skeleton + Vocabulary, no-shelf→gap-report; re-prove via evals.
- **Brick 6 — Dogfood the fill (C8).** Run the whole pipeline on Alexandria: scan → confirm → atomize → a current, accurate Alexandria library.
- **Brick 7 — Causal edges + the living-plan view (C7).** Epistemic edges + Ledger feedback + the loop-with-state view. The capstone that makes the library *vibrant*.

---

## What success looks like

Having rectified all of the above:

- **Alexandria has a current, accurate, vibrant product library — rebuilt through its own tooling, not by hand.** That fact is the proof the tooling works.
- **The power-up is one experience:** point it at an existing product → it scans code + git → the director projects/confirms the empty library (shelves + lexicon + skeleton) in a single view → signs off. Vocabulary, Skeleton, and Surface are **peers**, all emitting library-form, all bound to **one lexicon**, integrated and skinned in the new viewer.
- **The atomizer fills confirmed shelves in confirmed words.** Concepts with no shelf surface as **gap reports**, never invented categories. The Fabro plays run on `ax` and pass the conan/sam/bridget/solomon evals.
- **Every card's evidence is correctly sourced** (code/git/director per the source map); the raw→SoT→atomized provenance trail is intact and walkable.
- **The library reads as a living business plan:** the planes are pinned, the three epistemic cross-plane edges exist, and the causal-edge view draws the loop **lit with state** — walk a bet → what was built for it → what was learned → whether it still holds.
- **The "out of date" signals are gone:** frontmatter conforms, the viewer layout matches the shelves, no single shelf swallows the library.

**One-line test:** a cold agent (or a new director) opens Alexandria's library and, without a human, traverses from any card *up* to the bet it serves and *down* to the evidence for it — and the whole thing was produced by the power-up, not authored by hand.

---

## Source material — where the real artifacts live (don't reinvent)

- **Reframe + empty-library concept:** this conversation; `studio/plays/ATOMIC-CARDS.md`.
- **Atomizer (the cart):** `studio/plays/atomic-card-planning/`, `…/atomic-card-creation/`, `…/build-atomic-card/`; Fabro builds on `restore-atomic-card-plays` (#228); evals conan/sam/bridget/solomon.
- **Vocabulary (Layer 1):** `docs/alexandria/plans/library-population-playbook/vocabulary/` (`explorer/`, `vocabularies/`, `vocabulary-elicitation.md`, `grading-rubric.md`).
- **Skeleton / Surface / Walk (Layer 2):** `…/library-population-playbook/{skeleton,surface,product-walk,product-plane-bars}/`.
- **Codebase scanner (sourcing):** `docs/alexandria/library/product/systems/System - Codebase Scanner.md`; prototype `…/canvas-library-spike/prototype/product-library/scan.html`.
- **Power-up / canvas (the experience):** `docs/alexandria/plans/build-a-raven-onboarding/{plan.md,forward-plan.md,build-plan.md}`; `…/canvas-library-spike/prototype/product-library/*.html`.
- **The viewer (where it's skinned):** `packages/viewer/src/components/library/` (ConstellationView, FolderLibraryView, vision/).
- **The current library (dogfood target):** `docs/alexandria/library/`; `…/rationale/standards/Standard - Card Frontmatter Schema.md`.
- **North-star data model (Layer 3 / the whole shape):** the Library/Playbook/Ledger XL data model (the partner brief) — currently outside the repo; worth vendoring into this plan dir.
