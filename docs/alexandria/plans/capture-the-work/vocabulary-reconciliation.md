# Vocabulary Reconciliation — the `type` category set (capture-the-work §5b)

*Decision-ready proposal. Every claim is cited to `file:line` against the repo at
`/Users/danvers/conductor/workspaces/alexandria-internal/tunis`.*

---

## Rulings & implementation sequence (RULED 2026-06-28)

**Director rulings (accepted as proposed):**
- Canonical set = the **9 categories** (`Role · Surface · Entity · Component ·
  Capability · Mechanism · Pattern · Economy · Reference`); `Domain` demoted (9, not 10).
- `type` = the stable canonical **category**; the director's word lives in
  `prefLabel` / `altLabels`.
- Enforcement = a shared **`CANONICAL_CARD_TYPES` constant, NOT a hard enum**
  (Alexandria-safe — can never reject a card).
- `Process`/Production-Ladder → **Pattern** (the work as a named arc); the
  Stage/Gate/Mechanic machinery → **Mechanism** (per §4's worked mapping).
- `Reference` = the merged owner-supplied lane.
- **Extend to thread-kinds** (the v2-sweep drift): same constant-not-enum pattern —
  `kind` becomes free-string + a `CANONICAL_THREAD_KINDS` constant; retire the
  brittle alias maps.

**Implementation sequence** — separate, Alexandria-safe PRs; *additive-then-cleanup*
so nothing regresses:
1. **Engine · thread-kinds** *(non-gated, off main — branch `danversfleury/vocab-reconciliation`)*:
   relax thread `kind` to free-string + a `CANONICAL_THREAD_KINDS` constant; retire
   `THREAD_KIND_ALIASES`; widen the client schema. Clears the 14 v2-rejected threads
   and gives the frozen bundle precise kind labels — no regression.
2. **Engine · card-types** *(non-gated, additive)*: add `CANONICAL_CARD_TYPES`;
   `diagramForCatalogCard` *also* keys off the 9 categories (keep the existing
   render set + `DIAGRAM_TYPE_ALIASES` for back-compat → no regression).
3. **Brief classify** *(after #451 merges — builds on Move S)*: `pass2_carve`/`pass3`
   emit `type` = category + label = director's word (classify by analogy to the
   Vocabulary asset) + canonical thread kinds.
4. **Canonical re-sweep** *(after 3)*: blind sweep with the settled-vocab brief →
   the PMS bundle in the 9-category vocab + canonical threads + the work-thread →
   becomes canonical (replaces the frozen bundle and v2). Renders natively under 1–2.
5. **Cleanup** *(after 4)*: delete `DIAGRAM_TYPE_ALIASES` (no bundle uses the old
   card-type vocab anymore).

**Alexandria guardrails (held throughout):** constants, never hard enums (no
card/thread ever rejected); `docs/alexandria/library/` is legacy-schema → off the
product-card path → untouched; every slice verifies Alexandria's library + the
empty-library flow still load; non-stacked PRs off main.

---

## 0. The problem, stated precisely

A library card's `type` should be a **stable, render-keyable CATEGORY** that
means the same thing across every product's library. But the Back-of-House sweep
emitted the **director's own product-words AS the `type`**. The Playmaker Studio
sweep typed its 40 cards with `Concept` / `Stage` / `Gate` / `Agent` /
`Mechanic` / `Value` / `Process` / `Rendering`
(`studio/sweeps/playmaker-studio/production-line/Stage - Designed.md:2`,
`.../Gate - Director Gate.md:2`,
`.../workflow/Rendering - Diagram and Story View.md:2`). Those are **instances**
— the words the Studio's own architects say — not categories.

The symptom is concrete and already shipped as a workaround: because `Stage`,
`Gate`, `Concept`, etc. are not in the render set, the diagrams went blank, and
PMS-Back had to add a per-product alias bridge
(`packages/ax/src/domain/library-catalog-story.ts:317-325`) mapping each
product-word to `aggregate` just so a diagram draws. That bridge — and its
sibling for thread kinds (`packages/ax/src/domain/library-catalog.ts:273-282`) —
**are the debt this proposal retires.** They are explicitly labelled as interim:
"The durable fix is settling one shared category vocabulary (the §5b track),
after which this map can go" (`library-catalog-story.ts:315-316`).

The fix this proposal designs: **classify each card into a stable category (the
`type`) and keep the director's word as the label (`prefLabel` / `altLabels`)** —
"category = Mechanism, label = Stage," not "type = Stage."

---

## 1. The competing-vocabularies map

There are **six** type vocabularies live in the repo right now. They were
authored by different tracks at different times and do not agree.

| # | Vocabulary (the actual term set) | Source (file:line) | Role | Authority |
|---|---|---|---|---|
| **V1** | **Diagram render set:** `aggregate`, `surface`, `value`, `read-model` (the only four `type` values that produce a diagram) | `packages/ax/src/domain/library-catalog-story.ts:336-355` (`diagramForCatalogCard`) | What the shipped viewer actually keys rendering off | **Shipped code** — load-bearing |
| **V1-alias** | **Interim bridge:** `agent`, `concept`, `gate`, `mechanic`, `process`, `rendering`, `stage` → all routed to `aggregate` | `library-catalog-story.ts:317-325` (`DIAGRAM_TYPE_ALIASES`) | Patch so sweep cards draw at all | **Interim** — slated to retire |
| **V1-thread** | **Thread-kind bridge:** `asserted_not_demonstrated`, `built_not_proven`, `dangling_reference`, `demotion_runtime_vs_design`, `docs_disagree_polysemy`, `judgment_punt_runtime_vs_design`, `specified_not_performed`, `split_external` → canonical kinds | `library-catalog.ts:273-282` (`THREAD_KIND_ALIASES`) | Patch so swept *threads* load | **Interim** — slated to retire (sibling debt, same root cause) |
| **V2** | **Conformance validator:** bans `Aggregate`, `Value`, `Read Model`, `Implementation` (`RETIRED_TYPE_TERMS`); requires the Brick-0 profile `Surface / Entity / Component / Capability / Agent / System / Role` | `studio/tools/check-play-conformance.mjs:40` and `:157` | Gate on the sweep play's brief/contract | **Active gate** (manual, one play) |
| **V3** | **DDD set (studio/library):** `Aggregate`, `Value`, `Read-Model` | `studio/library/board/Aggregate - Board.md:2`, `.../Value - Stage.md:2`, `.../Read-Model - Play Registry.md:2` | An older hand-authored Studio library | **Legacy data** (9 cards) |
| **V4** | **Brick-0 / Studio profile:** `Surface`, `Entity`, `Component`, `Capability`, `Agent`, `System`, `Role` | `studio/plays/back-of-house-walk/brief.md:104-108`, restated `:457-463` | The type vocabulary the sweep brief *tells the agent to use* | **Active spec** (the play's contract) |
| **V5** | **Vocabulary 10-category set:** `Rationale`, `Research`, `Roles`, `Domains`, `Surfaces`, `Entities`, `Capabilities`, `Systems/Mechanics`, `Patterns`, `Economy` | `docs/alexandria/plans/library-population-playbook/vocabulary/families.md:14` | The category↔instance asset (~440 worked cards, 14 products) | **Reference asset** (the bridge) |
| **(V0)** | **The contract itself:** `LibraryCatalogCard.type` is a **free `string`** | `library-catalog.ts:92`; client schema `packages/viewer/src/app/runtime/schemas.ts:139` (`type: Schema.String`) | The data model — confirms nothing is enforced today | **Shipped code** |

### Where they conflict / overlap (the live contradictions)

1. **V2 bans the exact words V3 uses.** The validator retires `Aggregate`,
   `Value`, `Read Model`, `Implementation`
   (`check-play-conformance.mjs:40`), but the hand-authored
   `studio/library/` corpus *is built out of* `Aggregate` / `Value` /
   `Read-Model` (`studio/library/board/Aggregate - Board.md:2`). The two oldest
   Studio assets directly contradict each other. (V2's allowed set V4 and V3's
   set are different DDD/C4 dialects of the same idea.)

2. **V1 (render) and V4 (the brief's instruction) barely overlap.** The renderer
   only draws `aggregate` / `surface` / `value` / `read-model`
   (`library-catalog-story.ts:336-355`). The brief tells the agent to emit
   `Surface / Entity / Component / Capability / Agent / System / Role`
   (`brief.md:104-108`). Only **`Surface`** is in both. So a brief-conformant
   card is, by default, **undrawable** — which is the whole reason V1-alias
   exists. The render set and the authoring set were never reconciled.

3. **V1's render keys collide with the *altitude* vocabulary.** `aggregate` and
   `value` are render `type` keys (`library-catalog-story.ts:343,350`) **and**
   altitude values the same play assigns (`brief.md:219-224`:
   `pillar / context / aggregate / component / value / capability`; lead-rank
   table `library-catalog-story.ts:58-64` keys off `aggregate`/`value`/`pillar`/
   `capability`/`component` as **altitudes**). So the same words name two
   different axes — a card can be `type: Value` *and* `altitude: value`. This is
   the deepest source of confusion and a strong argument for **not** reusing
   DDD-altitude words as the category set.

4. **V4 (brief) vs V5 (Vocabulary) — singular vs plural, profile vs catalog.**
   Brick-0 says `Surface` / `Entity` / `Capability` (singular, per-card);
   Vocabulary says `Surfaces` / `Entities` / `Capabilities` (plural, as folder
   *categories*) plus `Roles` / `Domains` / `Systems` / `Patterns` / `Economy` /
   `Rationale` / `Research` (`families.md:14`). V4 is a 7-term subset; V5 is a
   10-term superset with three extra lanes (Patterns, Economy, Domains) plus two
   owner-supplied lanes (Rationale, Research). They are the **same family of
   ideas at two scales** — and V5 is the only one that ships a category↔instance
   bridge.

5. **The corpora themselves disagree internally.** Across the Vocabulary corpus
   the worked cards use *both* the V5 set (`Entity` ×122, `Surface` ×86,
   `Capability` ×74, `System` ×51, `Role` ×45, `Pattern` ×45,
   `Economy-instance` ×45, `Domain` ×13, `Standard` ×10, `Deprecation` ×3) **and
   a DDD lowercase set** in the `playmakers-studio` worked vocabulary
   (`aggregate` ×20, `value` ×20, `component` ×14, `capability` ×6, `agent` ×5,
   `surface` ×2, `read-model` ×1) — grep over
   `docs/alexandria/plans/library-population-playbook/vocabulary/vocabularies/`.
   Even the bridge asset is of two minds.

**Net:** five "real" sets (V1–V5) for the *same slot*, two of them shipped, two
of them active specs/gates, one a reference. None is canonical. The PMS sweep
picked a **sixth, product-word set** (Concept/Stage/Gate/...) and the alias maps
paper over the gap.

---

## 2. Recommended single canonical category set

The set must satisfy four hard constraints simultaneously:

- **(C1) Render-keyable** — the diagram switch
  (`library-catalog-story.ts:336-355`) must be able to map every category to a
  shape *natively*, with no alias table.
- **(C2) Conformance-clean** — must not contain any `RETIRED_TYPE_TERMS`
  (`check-play-conformance.mjs:40`), and must be a superset of what the brief
  already trains the agent to emit (`brief.md:104-108`).
- **(C3) Bridged** — must align with the Vocabulary asset's categories
  (`families.md:14`) so the classify step can map a director-word → category *by
  analogy to a worked corpus that already exists*.
- **(C4) Axis-clean** — must NOT reuse the **altitude** words (`aggregate`,
  `value`, `pillar`, `component`, `capability`, `context`) as category names, to
  end conflict #3.

### The recommended set — 9 categories

Anchored on the Vocabulary 10-category set (V5), singularized to match the
per-card Brick-0 form (V4), with the two owner-supplied lanes kept:

| Canonical `type` | What it categorizes | Justification (which sets it reconciles) | Diagram shape (C1) |
|---|---|---|---|
| **Role** | An actor: human or agent | V4 `Agent`/`Role`, V5 `Roles`. Folds V4's `Agent` in as a label. | hub (actor + its relations) |
| **Surface** | A place the user encounters the product | In **every** set (V1 `surface`, V4 `Surface`, V5 `Surfaces`). The one term needing no migration. | hub (already native, `:336`) |
| **Entity** | A thing with identity the work moves | V4 `Entity`, V5 `Entities`. Absorbs DDD `Aggregate` (V3) and `Read-Model` (V3) as **labels** — both are "things with identity," and both are V2-banned as types. | hub |
| **Component** | A part inside an Entity/Surface, no independent lifecycle | V4 `Component`. (V2 allows it; V5 folds it under Entities, but Brick-0 keeps it and the renderer can treat it as a hub node.) | hub |
| **Capability** | A verb / operation / affordance | V4 `Capability`, V5 `Capabilities`. | hub |
| **Mechanism** | An engine / system / rule the product runs (incl. **process/stage/gate** machinery) | V5 `Systems/Mechanics`; absorbs V4 `System` **and** the PMS `Mechanic` / `Process` / `Stage` / `Gate` product-words as **labels**. This is the category that captures *the work's machinery* — the capture-the-work throughline. | lifecycle when it has `flow`; else hub |
| **Pattern** | A named recurring shape / lifecycle (the work as a *named* arc) | V5 `Patterns`. New to Studio cards but **central to capture-the-work**: the work-thread / lifecycle is a Pattern. | lifecycle (drives the flow diagram) |
| **Economy** | A resource, price, or value-unit | V5 `Economy`. (Replaces DDD `Value` as a type — `Value` is V2-banned and collides with the altitude word.) | hub |
| **Reference** | Owner-supplied rationale, research, standards, deprecations | V5 `Rationale` + `Research` (both owner-supplied, `families.md:16-17,517-519`) plus the corpus's `Standard` (×10) and `Deprecation` (×3). One bucket for "context the director brings, not the source." | hub or none |

**Two deliberate cuts from V5:**

- **`Domain`** is **demoted to a label under `Reference`/`Mechanism`** rather than
  its own category. Rationale: the families guide itself says Domains is "Quiet"
  / "flat" for most products (`families.md:36,140`), and the carving step
  already produces `context` folders that do the bounded-context job
  (`brief.md:177-209`). A 9-set beats a 10-set when the 10th is near-empty.
  *(Director fork — see §6.)*
- **The render-only terms `aggregate` / `read-model` / `value`** do **not**
  survive as `type` values. `aggregate`→`Entity` (label), `read-model`→`Entity`
  (label), `value`→`Economy` (label). This is what frees the altitude axis
  (C4).

### How each existing term maps / merges / retires

| Existing term | Source set | Disposition |
|---|---|---|
| `Surface` | V1/V4/V5 | **Keep** (canonical) |
| `Entity` | V4/V5 | **Keep** (canonical) |
| `Capability` | V4/V5 | **Keep** (canonical) |
| `Component` | V4 | **Keep** (canonical) |
| `Role` | V4/V5 | **Keep** (canonical) |
| `Agent` | V4 (PMS ×6) | **Merge → `Role`**, label `Agent` |
| `System` | V4 | **Merge → `Mechanism`**, label `System` |
| `Mechanic`, `Process`, `Stage`, `Gate` | PMS sweep | **Merge → `Mechanism`**, label kept |
| `Concept` | PMS sweep (×20) | **Reclassify per card** (see §4) — `Concept` is a non-category catch-all |
| `Rendering` | PMS sweep | **Merge → `Surface`** (it's a derived view) or `Reference`; label `Rendering` |
| `Pattern` | V5 | **Promote to canonical** |
| `Economy-instance` | V5 corpus | **Rename → `Economy`** |
| `Domain` | V5 | **Demote to label** under `Reference`/`Mechanism` |
| `Standard`, `Deprecation` | V5 corpus | **Merge → `Reference`**, label kept |
| `Aggregate` | V3 / render | **Retire as type → `Entity`**; `aggregate` survives only as an **altitude** |
| `Read-Model` | V3 / render | **Retire as type → `Entity`** (label `Read-Model`) |
| `Value` | V3 / render | **Retire as type → `Economy`**; `value` survives only as an **altitude** |
| `Implementation` | V2-banned | **Stays retired** (already banned, `:40`) |

This set is **conformance-clean by construction** (no `RETIRED_TYPE_TERMS`), a
**superset of the brief's trained set** (V4 ⊂ canonical, with `Agent`/`System`
demoted to labels), **bridged to V5**, and **axis-clean** (no altitude-word
reuse).

---

## 3. The category↔instance model

### The data shape

The contract already has the two fields needed — no schema change is *required*
to carry the model (only to *enforce* it; see §5):

- `type` (`library-catalog.ts:92`, `schemas.ts:139`) carries the **canonical
  category** (one of the 9).
- `prefLabel` (`library-catalog.ts:84`) carries the **director's word** (the
  instance name).
- `altLabels` (`library-catalog.ts:68`) carries every other word the architect
  uses for the same concept.

So a Studio "Designed stage" card becomes:

```yaml
type: Mechanism          # canonical category
prefLabel: Designed       # the director's word (was the filename "Stage - Designed")
altLabels: [Stage, designed stage]
```

instead of today's `type: Stage` (`Stage - Designed.md:2`).

The director's word is **never lost** — it moves from the type slot to the label
slot, where it belongs and where the resolver already indexes it
(`createCatalogCardResolver` adds `prefLabel` and every `altLabel` to its lookup
index, `library-catalog-story.ts:241-245`). Wikilinks like
`[[Stage - Designed]]` still resolve because the resolver also indexes the
`<type> - <prefLabel>` id form (`:239`) and the filename basename (`:240`).

### The filename / id convention

Cards are named `<Type> - <Name>.md` and the id is derived from that
(`markdownCardName`, used at `library-catalog.ts:875`). Two options for the
director (§6 fork):

- **(a) Keep the category in the filename** → `Mechanism - Designed.md`. Clean,
  but renames every PMS sweep file.
- **(b) Keep the label-led filename, category in frontmatter only** →
  `Stage - Designed.md` stays, but its frontmatter says `type: Mechanism`. The
  id then carries the *label* not the *category*. The resolver tolerates this
  (it indexes both forms), but the `<type> - <prefLabel>` id convention
  (`:239`) would drift. **Recommend (a)** for cleanliness; it's a mechanical
  rename.

### Pass-3 classify (the new sweep step)

Today the sweep ends after `pass3_altitude` (`brief.md:212-235`) and
`emit_bundle` writes the cards. The category↔instance model adds a
**classification responsibility** — cleanest as an explicit duty inside
`pass2_carve` (which already does "type assignment per noun",
`brief.md:188-192`) rather than a brand-new node, so the move graph and the
conformance `EXPECTED_MOVES` list (`check-play-conformance.mjs:41-49`) don't
change.

The classify rule, by analogy to the Vocabulary asset:

1. For each found noun, the agent has a **director-word** (e.g. "Stage") and a
   one-line gloss from the source.
2. It maps the word → one of the 9 categories **by analogy to the worked
   corpus**: the Vocabulary families guide is loaded as the reference
   (`families.md`), and each family lists worked nouns under each category
   (e.g. agentic-software's `Loop` / `Plan` / `Run` / `Workflow` sit under
   *Systems/Mechanics*, `families.md:144,191-196`). "Stage" is a lifecycle-state
   of a Mechanism → category `Mechanism`, by analogy to how the agentic family
   files `Workflow`/`Run`.
3. The director-word becomes `prefLabel`; synonyms become `altLabels`.
4. **Low-confidence mappings surface as threads, not silent picks.** The thread
   model already exists and is the right home: a noun whose category is
   genuinely ambiguous emits a `hot_spot` thread of kind `polysemy` or
   `judgment_punt` (`library-catalog.ts:40-46`,
   `schemas.ts:174-184`) naming the two candidate categories. This reuses the
   sweep's existing "propose, never silently pick" discipline
   (`brief.md:200-209`) and the Stage-2 brief's "are these the right card
   types?" question (`brief.md:403`). No new mechanism — the classify step just
   feeds the thread channel that's already there.

This is exactly the bridge the Vocabulary asset was built to provide: it "takes
each **category** and gives the **specific example each company uses** for it"
(per the asset's premise) — Airbnb's `Listing` under `Entities`, Hollow Knight's
`Charm` under `Entities`, a video game's `Streak` under `Economy`
(`families.md:269,319`). The classify step runs that mapping *in reverse*:
director-word → category, grounded in ~440 worked examples instead of a guess.

---

## 4. Worked mapping for the PMS sweep

Every product-word the PMS sweep emitted, mapped to a canonical category with the
word kept as label. Counts from
`grep -rh '^type:' studio/sweeps/playmaker-studio/`.

| PMS `type` (today) | Count | → Canonical `type` | Kept as `prefLabel`/`altLabel` | Rationale (cite) |
|---|---|---|---|---|
| `Stage` | 6 | **Mechanism** | label `Stage` | A stage is a state of the production *machinery* (`Stage - Designed.md` body: "third ladder stage"). Lifecycle-of-a-Mechanism. |
| `Gate` | 1 | **Mechanism** | label `Gate` | A gate is a decision rule in the line (`Gate - Director Gate.md`); `gate: true` is already a *workflow-step* flag (`schemas.ts:202`), confirming it's machinery. |
| `Agent` | 6 | **Role** | label `Agent` | Author/Hardener/Checker/Director/Grader are actors (`production-line/Agent - *.md`). V4 already folds Agent toward Role (`brief.md:157`). |
| `Mechanic` | 2 | **Mechanism** | label `Mechanic` | e.g. `Mechanic - Bounce and Three-Strikes Freeze` — a rule the engine runs. |
| `Process` | 1 | **Mechanism** or **Pattern** | label `Process` | `Process - Production Ladder` is the *named lifecycle* → **Pattern** is the better fit (it IS the work-thread arc); director fork §6. |
| `Rendering` | 1 | **Surface** | label `Rendering` | `Rendering - Diagram and Story View` is a derived view the user sees; it already uses `derived_from` (`.../Rendering - *.md` links). |
| `Value` | 2 | **Economy** | label `Value` | `Value - Tier`, `Value - Proof Spec` — Tier is an Economy unit (`families.md:109,433`). (Frees the `value` altitude.) |
| `Concept` | 20 | **per-card** (see below) | label kept | `Concept` is a non-category catch-all; each must be reclassified. |

**The 20 `Concept` cards, reclassified** (from the file list under
`studio/sweeps/playmaker-studio/*/Concept - *.md`):

| Concept card | → Canonical `type` | Rationale |
|---|---|---|
| `Play` | **Entity** | The central record with identity and a lifecycle — the unit the work moves (capture-the-work memo: "the central record + its status field"). |
| `Board`, `Board State`, `Work Order` | **Entity** | Identity-bearing records (matches `studio/library/Aggregate - Board.md` → now Entity). |
| `Catalog`, `Play Registry`(impl) | **Entity** | Read-model-shaped records (was V3 `Read-Model`). |
| `Move`, `Move Graph`, `Brief`, `Doer`, `Workflow Package`, `Fabro Node Types`, `Embedded Factory` | **Component** | Parts inside a Play/workflow with no independent lifecycle. |
| `Fixture`, `Risk Map`, `Pass Rate`, `Run Record` | **Entity** (Run Record, Risk Map) / **Economy** (Pass Rate is a measure) / **Component** (Fixture) | Mixed — surfaces as a classify thread where ambiguous. |
| `Production Ladder` (if typed Concept anywhere) | **Pattern** | The named lifecycle arc. |
| `Validators`, `Studio Operations Plays`, `Studio Self-Library` | **Mechanism** / **Reference** | Operational machinery vs owner-supplied context. |
| `Make a Play`, `Auto-Advance Contract` | **Mechanism** / **Pattern** | The self-hosting meta-play arc. |

The mixed rows are the **honest output**: where the category is genuinely
contested, the sweep emits a `polysemy`/`judgment_punt` thread
(`library-catalog.ts:40-46`) rather than a silent pick — exactly the discipline
§3.4 prescribes.

---

## 5. What it retires + migration impact

### What the settled set retires

- **`DIAGRAM_TYPE_ALIASES`** (`library-catalog-story.ts:317-325`) — **deleted.**
  Once every card's `type` is a canonical category, the diagram switch
  (`:336-355`) maps natively: `Surface`/`Entity`/`Component`/`Role`/`Capability`/
  `Mechanism`/`Economy`/`Reference` → hub; `Pattern` (and a `Mechanism` with
  `flow`) → lifecycle. **One required code change:** the switch currently
  lowercases and matches `aggregate`/`surface`/`value`/`read-model`
  (`:331-355`); it must be rewritten to match the 9 canonical categories. This
  is the single load-bearing diff and the payoff: **diagrams render natively, no
  per-product aliasing.**
- **The per-product aliasing pattern generally.** The PMS-Back memo
  (`[[pms-back-tab-shipped]]`) and the capture-the-work memo both flag the alias
  bridges as "deliberate interim." A settled category set means the next
  product's sweep needs **zero** new alias entries — the whole class of debt
  goes away (`library-catalog-story.ts:315-316` says so explicitly).
- **`THREAD_KIND_ALIASES`** (`library-catalog.ts:273-282`) — **retires on the
  same principle but is a separate slice.** It's the sibling debt (the sweep
  emitting compound kind-words instead of canonical ones). Settling the *thread*
  vocabulary is out of scope for the `type` track but should be named as the
  next §5b slice; the comment at `:269-272` already points at "the sweep's emit
  step emitting canonical kinds directly."

### Migration impact, per asset

| Asset | Impact | Effort |
|---|---|---|
| `studio/sweeps/playmaker-studio/` (40 cards) | Rewrite `type:` per §4 mapping; rename files if fork (a); move director-words to `prefLabel`/`altLabels`. **Re-deriving via a fresh sweep run is the clean path** (the capture-the-work memo notes this bundle predates Move S anyway and a full re-run is owed). | Medium — one sweep re-run + verify, or a scripted rewrite of 40 frontmatters |
| `studio/library/` (9 cards) | `Aggregate`→`Entity`, `Read-Model`→`Entity` (label), `Value`→`Economy` (`studio/library/board/*.md:2`). Resolves conflict #1 (these are the V2-banned words). | Small — 9 files |
| `studio/tools/check-play-conformance.mjs` | Update `RETIRED_TYPE_TERMS` (`:40`) — `Aggregate`/`Value`/`Read Model` stay retired; the **allowed profile** (`:157`) widens from 7 to the 9 canonical, adding `Mechanism`/`Pattern`/`Economy`/`Reference` and dropping `Agent`/`System` (now labels). | Small — two constants + one regex |
| `studio/plays/back-of-house-walk/brief.md` | Update the trained profile (`:104-108`, `:457-463`) from the 7-term V4 set to the 9-term canonical set; add the classify-by-analogy duty + the Vocabulary-asset reference to `pass2_carve` (`:177-209`); add the low-confidence→thread rule. | Small-medium (brief edit; it's a play, goes through the Studio ladder per the memo, **not** an app factory issue) |
| `packages/ax/src/domain/library-catalog-story.ts` | Rewrite `diagramForCatalogCard` (`:327-358`) to key off the 9 categories; **delete** `DIAGRAM_TYPE_ALIASES`. | **The one load-bearing code diff** |
| Client schema `schemas.ts` | **No change required** if `type` stays free-string (`:139`). **One-line change** if the director picks the enum fork (§6): `Schema.String` → `Schema.Literal(...9...)`. | Trivial-to-none |
| Contract `library-catalog.ts:92` | Same as schema — free-string today; optional enum/validator (§6). | Trivial-to-none |
| Tests | `library-catalog.test.ts` fixtures use `type: Surface`/`Entity`/`Component` (`:48,398,443`) — already canonical, **no churn**. Diagram tests (none found keying off the alias map — grep clean) need cases for the new native mapping. | Small |

### The contract question (free-string vs enum)

`type` is **free string** today (`library-catalog.ts:92`; `schemas.ts:139`) and
nothing enforces a set anywhere in shipped code (grep confirms no enum). Three
options, in increasing strictness:

- **(i) Stay free-string; enforce in the validator only.** The renderer maps the
  9 known categories and *falls through to "no diagram"* for anything else (its
  current default, `:357`). `check-play-conformance.mjs` is the gate. Lowest
  blast radius; tolerant of products that genuinely need a 10th category.
- **(ii) Free-string + a shared exported constant.** Add
  `CANONICAL_CARD_TYPES` next to `LIBRARY_CATALOG_LINK_KEYS`
  (`library-catalog-links.ts:1`) as the single source of truth, consumed by the
  renderer, the validator, and the brief generator. Not enforced at decode, but
  one list to maintain. **Recommended** — it kills the "six competing sets"
  problem at the root without making the schema brittle.
- **(iii) Enum in the contract + client schema.** `Schema.Literal(...)` at
  `schemas.ts:139` and a typed union at `library-catalog.ts:92`. Strictest; any
  off-set card fails to decode. Risk: a future product with a real 10th category
  can't ship a card until the enum is widened — and the Vocabulary asset itself
  says "some concepts resist all 10 categories… owner-coins-a-name"
  (`families.md:513-515`), which argues *against* a hard enum.

---

## 6. Open decisions for the director

1. **Exact category names + count (9 vs 10).** Accept the 9-set, or keep
   `Domain` as a 10th category (V5 has it, `families.md:14`; this proposal
   demotes it because the carving step already produces context folders and the
   families guide calls Domains "Quiet"). Also: `Mechanism` vs `System` vs
   `Systems/Mechanics` as the headline word for the engine/process category.
2. **Free-string vs shared-constant vs enum** (§5, options i/ii/iii). Recommend
   **(ii)** — a shared `CANONICAL_CARD_TYPES` constant, not a hard schema enum,
   to leave room for the "uncategorizable, owner-coins-a-name" case the
   Vocabulary asset itself reserves (`families.md:513-515`).
3. **`Process`/`Production Ladder` → `Mechanism` or `Pattern`?** Both defensible;
   `Pattern` better captures capture-the-work's "the work is a named arc," but
   `Mechanism` keeps process-machinery in one bucket. (§4.)
4. **Filename convention** — rename PMS files to `<Category> - <Name>.md`
   (clean, fork a) or keep label-led filenames with category in frontmatter only
   (no renames, fork b, slight id-convention drift). (§3.)
5. **How strict the validator gets** — does `check-play-conformance.mjs`
   *require* every card's `type` ∈ canonical (hard fail), or *warn* on unknowns?
   Tied to decision 2.
6. **Migrate the PMS sweep by re-run or by script?** A fresh sweep re-bakes the
   bundle (and picks up Move S's `workflows.json`, owed per the memo); a scripted
   frontmatter rewrite is faster but doesn't refresh the rest. (§5.)
7. **`Reference` as a real category, or split back into Rationale/Research/
   Standard/Deprecation?** This proposal merges four owner-supplied/meta lanes
   into one; the director may want them distinct (V5 keeps Rationale and Research
   separate, `families.md:16`).

---

## Summary (5 lines)

- **Recommended canonical set (9):** `Role · Surface · Entity · Component ·
  Capability · Mechanism · Pattern · Economy · Reference` — anchored on the
  Vocabulary 10-category asset (`families.md:14`), singularized to the Brick-0
  per-card form (`brief.md:104-108`), with altitude-words (`aggregate`/`value`)
  deliberately **not** reused as types.
- **Category↔instance rule:** `type` = the stable canonical **category**;
  the director's word lives in `prefLabel` (+ synonyms in `altLabels`) — "category
  = Mechanism, label = Stage," never "type = Stage."
- **The classify step:** `pass2_carve` maps each found director-word → a category
  *by analogy to the ~440 worked Vocabulary cards* (`families.md`), and emits a
  `polysemy`/`judgment_punt` thread (`library-catalog.ts:40-46`) whenever the
  mapping is low-confidence — propose, never silently pick.
- **What it retires:** `DIAGRAM_TYPE_ALIASES`
  (`library-catalog-story.ts:317-325`) and the whole per-product aliasing class —
  diagrams render natively once `diagramForCatalogCard` (`:336-355`) keys off the
  9 categories; `THREAD_KIND_ALIASES` (`library-catalog.ts:273-282`) is the named
  next slice.
- **Biggest decision for the director:** **free-string vs shared-constant vs hard
  enum** for `type` (`library-catalog.ts:92`, `schemas.ts:139`) — recommended:
  a shared `CANONICAL_CARD_TYPES` constant (not a brittle schema enum), so the
  "owner-coins-a-name" case the Vocabulary asset reserves
  (`families.md:513-515`) stays possible.
