# Brick 0 — Foundations Ruling Agenda

**Status:** DRAFT-FOR-RULING (2026-06-20). Sits next to `plan.md`. Authored from the grounding in `studio/plays/research/library-elicitation/`, the dogfood scans in `test-scan-{01,02-reorganized,03-studio}/`, and a code-level read of the existing Standard and the Vocabulary explorer. **The architect rules; the author proposes.**

## How to use this document

Planes are settled (Strategy / Product / Learning — see [[rebuilding-the-library-plan]]). Three foundations remain unpinned: the **type enum**, the **link-type vocabulary**, and the **frontmatter reconciliation**. Each currently has three competing sets in active use, each blocks downstream work (EL2/EL4/EL5; VB1/VB2/VB3), each answerable in ~5 minutes given the grounding pre-assembled below. Per foundation: de-facto situation → three options → grounding cite → author's best-guess recommendation (**not** a decision) → the ruling the architect is asked to make. Cross-cutting section at the end. **Nothing here is decided; everything is proposed.**

---

## Scope — ruled 2026-06-22 (governs all three foundations)

**Director:** "we are making what will be a separate library for playmaker's studio different from alexandria's - so removing something should just be for it, as a standalone thing - never removed from alexandria's"

**Palette vs. profile (the model this establishes):**

- The **foundation is a shared, additive palette** — every type and link-verb any Alexandria-built library may draw from. It only ever *grows* (Role, the epistemic links, `derived_from` are additions to it).
- Each **library is a profile** — a curated subset of the palette + its own tuning. Studio's library and Alexandria's library are two different profiles.
- **Removal is profile-scoped, never destructive.** Every "OUT / dropped / collapsed" in these rulings means *Studio's standalone library doesn't use it* — it is never deleted from the palette and never stripped from Alexandria's existing library. Alexandria's library changes only when its own rebuild (Brick 6) regenerates it.

---

## Foundation 1 — The type enum

### Problem

Three overlapping type-sets are in active use, none canonical:

- **Canonical 21-type taxonomy** (`Artifact - Type Taxonomy.md`, `Standard - Card Frontmatter Schema.md`): Product Thesis · Principle · Standard · Domain · Section · Governance · Primitive · Template · Component · Artifact · System · Agent · Prompt · Capability · Experience Goal · Force · Loop · Journey · Decision · Initiative · Future. On disk: 17 of 21 actually used as filename prefixes (Prompt / Decision / Initiative / Future have zero cards). The set `ax cards list` queries.
- **Reorganization set** (`test-scan-02-reorganized/`): Surface · Entity · **Aggregate** · Component · **Value** · **Read Model** · Capability · Agent · System · **Implementation**. Four new types (bold) — Aggregate (lifecycle-bearing instances), Read Model (derived views, never stored), Value (enum-shaped, no identity), Implementation (UL-test failures kept as audit trail). Dissolves the three named confusions in `THREE-CONFUSIONS.md` empirically.
- **Vocabulary-explorer set** (`build-vocabularies-json.ts`, `UNIVERSAL_CATEGORIES`): Rationale · Research · **Role** · **Domain** · Surface · Entity · Capability · Mechanism · **Pattern** · **Economy**. Used across ~440 worked cards in 13 reference lexicons (figma, linear, notion, shopify…). Three pure additions (Role, Pattern, Economy).

Provenance: canonical is **claim-shape-derived** ("one claim-sentence per type"); reorganization is **DDD-tactical-derived** (inherits Alexandria-specific scar tissue from our polysemy problems); explorer is **product-anthropology-derived** (tuned across 13 third-party products).

### Options

- **Option A — Minimum-change.** Keep canonical 17-in-use, add **Read Model** only. Lowest cost; covers the single most-cited gap (grounding §3). Leaves Aggregate / Value / Implementation out-of-vocabulary despite empirical evidence they do real work.
- **Option B — Adopt the DDD-derived reorganization set.** Add Aggregate / Value / Read Model / Implementation; retire Primitive (overlaps Value/Entity) and Governance (no scan put anything there). Net change +4/−2. Empirically dogfooded on Alexandria's own cards.
- **Option C — Vocabulary-explorer base + Option B additions.** Adds Role · Pattern · Economy on top of Option B. Largest set, but the only one with cross-product proof; matches "point this at any product, not just Alexandria" framing of EL1–EL2.

### Grounding cite

- **Grounding §3 (Read Model insight):** "Adding **Read Model** as a first-class type dissolves a whole class of Surface-vs-Entity confusions at once. … The Read Model card landed naturally." Rules out a pure status-quo option.
- **Grounding §1 + three-confusion convergence:** DDD, C4, ES independently arrived at the same resolutions for Play Run (→ Aggregate), Studio Board (→ Surface + Read Model split), Raven Connection (→ Implementation). Three independent frameworks converging is the strongest argument these three belong in the enum.
- **Grounding §2 + extracted-claims "Tactical DDD is opt-in per-context":** Evans is explicit. **Softens** the case for importing Aggregate wholesale — right for contexts with lifecycle-bearing instances (Playbook, Library), maybe over-spec elsewhere.
- **READ-LIKE-DATA-MODEL.md big-picture gaps:** Director · Plane · Job Title · Grant · Membership · Briefing · Ledger Event · Skill · Human-Role · Participant · Artifact — 10+ nouns the scan couldn't see. **None are type-additions** — they're noun-additions inside existing types. Confirms this is a type-enum decision, not a vocabulary one.
- **`Artifact - Type Taxonomy.md` line 35:** "**Stable** (the 21-type set), **Extensible** (new types may be added…)." Existing taxonomy explicitly admits extension.

### Recommendation (author's best guess, not a ruling)

**Option B.** Three reasons: (a) the three-framework convergence on Aggregate / Read Model / Implementation is the strongest empirical signal in the grounding; (b) it's been dogfooded on Alexandria's own scan and the architect can read the result against an answer key (7/10 backbone, READ-LIKE-DATA-MODEL.md); (c) it preserves the "claim-sentence per type" discipline. Explorer additions (Role, Pattern, Economy) reserved for a later ruling once rebuild evidence shows we need them — don't import what we haven't proven we need.

Counter-argument: EL1–EL6 is product-agnostic. If we'll point this at non-Alexandria products soon, Option C is forward-compatible and B will need a second migration. The author lacks evidence on the "second product" milestone — architect's call.

### Ruling needed

1. Which option, A / B / C? If B or C — confirm Primitive and Governance can be retired without rescuing dependents.
2. If B or C: do new types need claim-sentences before they go in, or ship with empty claim-sentences to be filled by use? (Affects whether Brick 0 blocks Brick 1.)

### RULED 2026-06-22 — product-descriptive enum; types earn their place against links

**Ruling (director, verbatim):** "product descriptive for this library -- I'm not convinced being more technical/jargony DDD gets us much but I do like that tiny clarification that something is just a display of something else vs. its own database....although honestly when I think about the *how* and *what* of a card, it can just say gets data from (link)....not sure the title does anything atomic linking can't do, but, not harmful."

**Resolved — not A/B/C as written, a product-descriptive minimal set:** Option A's restraint, reject B's DDD-tactical trio, adopt one of C's additions (Role), demote Read Model to a link.

- **Governing principle:** a type earns its place **only when it changes how a card is *rendered or found*.** If a link already states the relationship, use the link, not a new type. (Types = the expensive, stable layer; links = the cheap, living layer.)
- **DDD-tactical trio — OUT.** Aggregate, Value, Implementation not added; they read as data-model/jargon, and the dogfood proved Value becomes a catch-all (mis-filed Director / Orchestrator / Doer — *people* — as "values"; see `test-scan-03-studio/READ-LIKE-WHAT.md` ll. 91–96).
- **Read Model — NOT a type.** "Display-of-something vs. its own database" is captured as a **named link `derived_from: [[X]]`**, not a card type. (Formalized as a link-type in Foundation 2.)
- **Role — IN.** The one product-descriptive addition; gives Director / Orchestrator / Doer a correct home instead of "Value."
- **Primitive, Governance — not in Studio's profile.** Nothing on disk uses them; no dependents to rescue. (Per Scope: retained in Alexandria's library + the palette; not deleted.)

**Non-blocking:** ruling-needed #2 now concerns only **Role** (the lone new type) — settle its claim-sentence when its card is written; does not block Brick 1. **Job B (deferred):** how Studio's own cards re-type under this (which become Roles, which Values collapse into fields, what each `derived_from` points at) is EL3-walk tuning, not a foundation call.

---

## Foundation 2 — The link-type vocabulary

### Problem

Link types are **prose conventions in the WHERE section**, not an enum. A grep over the live library finds **50+ distinct prefixes** in active use: `Contains` / `Contained by` / `Operated by` / `Operated on by` / `Conforms to` / `Conforming` / `Governs` / `Governed by` / `Implements` / `Implemented by` / `Invokes` / `Invoked by` / `Validates` / `Validated by` / `Consumes` / `Consumed by` / `Reads` / `Read by` / `Writes to` / `Written by` / `Produces` / `Produced by` / `Composes` / `Subsumes` / `Generalizes` / `Extends` / `Supersedes` / `Parallels` / `Traverses` / `Affects` / `Shapes` / `Reinforced by` / `Prevented by` / `Remediated by` / `Related` / `Related to` / `Home` / `Parent` / `Children` / `Capabilities` / `Principles` / `Standards` / `Serves` / `Populates` / `Production shape defined by` / `Involves` / `Enabled by` / `Constrained by` / `Referenced by` / `References` — and more. Some redundant (`Related` vs `Related to`), some one-offs, none enforced. The canonical Schema declares only three frontmatter edges (`depends_on`, `constrains`, `parent`) and says nothing about WHERE-section prose. Reorganization preserved existing prose verbatim. Explorer treats wikilinks as untyped.

This is **two problems wearing one coat**:
- **2a — Structural edges** (existing prose). Too many synonyms, no list, no validation. *Cleanup problem.*
- **2b — Causal / epistemic edges.** Brick 7 needs three first-class typed cross-plane edges: *proposes/embodies* · *produces-evidence* · *confirms-refutes*. Don't exist in any form today. *Net new problem.*

### Options

- **Option A — Keep prose, no enum.** Authors write what fits. Maximum freedom, no migration; but no validation, synonym explosion continues, Brick 7's typed cross-plane edges have nowhere to live. *Defers the decision.*
- **Option B — Adopt DDD Context Map's 8 cross-context relationships** for inter-context edges, keep prose within-context. The 8: **Shared Kernel · Customer-Supplier · Conformist · Anti-Corruption Layer · Open Host Service · Published Language · Partnership · Separate Ways** (contextmapper.org, verbatim in extracted-claims.md). But the existing 50+ prose verbs are *operational* (Conforms-to, Operated-by, Consumes…); the 8 are *structural-relational* designed for inter-team coordination, not graph traversal. Awkward mix.
- **Option C — Minimal closed enum + three epistemic types.**
  - **Structural (within-context):** *Contains* · *Conforms-to* · *Operates-on* · *Produces* · *Related-to* (catch-all). Other prose collapses into these or grandfathers with deprecation.
  - **Causal / cross-plane:** *Proposes* (Strategy → Product) · *Produces-evidence* (Product → Learning) · *Confirms-or-refutes* (Learning → Strategy).
  - DDD's 8 reserved for inter-context layer if/when VB2 needs them — deferred. YAGNI.

### Grounding cite

- **Grounding §7:** "DDD Context Map relationship types … → **Rebuilding Brick 0** (the link-type vocabulary) and **VB2** (drawing typed connections between contexts)." Grounding routes DDD's 8 here but conflates structural-within and structural-between.
- **Extracted-claims "C4 has no typed relationship vocabulary":** "Lines have labels; flow is in optional Dynamic diagrams with numbered interactions." **No framework gives us a within-context typed set — we choose ours.**
- **Grounding §5 (Planes uncovered ground):** "The Planes loop is therefore **Alexandria's own contribution** and is not on the shelf to be borrowed." The three epistemic types *must* be added by us; no off-the-shelf source.
- **C7 in `plan.md`:** "add three **epistemic edge types** (proposes/embodies · produces-evidence · confirms/refutes) as first-class typed links" — already named in the master plan. Confirmation, not open question.
- **Empirical (the 50+ prefix grep):** ~80% of the 50+ collapse cleanly into Contains / Conforms-to / Operates-on / Produces / Related-to.

### Recommendation (author's best guess, not a ruling)

**Option C.** Two reasons: (a) the three epistemic types must exist (Alexandria's contribution, grounding §5 + C7) — any ruling without them is incomplete; (b) the 50+ prose-prefix sprawl needs a forcing function, and a 5-type closed enum + grandfathered prose is the smallest one. DDD's 8 are designed for team-coordination semantics, not graph traversal — wrong shape for the within-context job; reserve for VB2's inter-context drawing if that turns out to need them. Option A defers the epistemic-types problem, which Brick 7 cannot accept.

Counter-argument: Option C asks for an invented structural enum without precedent. If the architect prefers "let the second-pass library evolve the enum," that's **A + the three epistemic types** as a hybrid — the author's second choice.

### Ruling needed

1. Which option, A / B / C? (Or hybrid: A for structural, C-half for epistemic?)
2. Three epistemic-type names confirmed (`proposes` / `produces-evidence` / `confirms-refutes`) or rename? Casing convention?
3. If C: enforced in frontmatter (typed YAML lists) or prose-with-required-prefixes in WHERE? (Affects whether `ax lint` blocks unrecognized link types.)

### RULED 2026-06-22 — Option C, curated-but-open; typed links so they can be drawn

**Ruling (director, verbatim):** "C sounds great. Cards need to belong in planes for us to demonstrate the living business plan (strategy, product, learning) and relationships should be defined by a clear list. Small is fine, we may be open to it growing but cleaning things up will make atomic linking way more articulate. Right now a link is a link. With defined terms links could be visually differentiated"

**Resolved:**

- **Option C — curated-but-open.** Structural core: **Contains · Conforms-to · Operates-on · Produces · Related-to** + **`derived_from`** (the Read-Model link from Foundation 1). Small to start; **may grow** when a relationship genuinely isn't covered. ("Small is fine, we may be open to it growing.")
- **Epistemic / living-loop links — IN:** **Proposes** (Strategy→Product) · **Produces-evidence** (Product→Learning) · **Confirms-or-refutes** (Learning→Strategy). Adopted as proposed; renamable at detailed Brick 7 / VB3 design — the *requirement they exist* is ruled.
- **Cards must declare a `plane`** (Strategy / Product / Learning) — the living-business-plan enabler; the epistemic links run *between* planes, so plane membership is required metadata. **Pre-resolves part of Foundation 3:** `plane` is a mandatory frontmatter field.
- **Links are structured / machine-readable, not prose** (ruling-needed #3) — because the goal is visual differentiation ("right now a link is a link; with defined terms links could be visually differentiated"), the viewer must read link *type* per edge and color/style by relationship kind (grounding §9). Prose can't supply that reliably.
- **Casing (default, confirmable later):** machine keys snake_case (`conforms_to`, `produces_evidence`…), display labels Title Case.
- **Enforcement — soft** during the rebuild: an unrecognized link warns, doesn't block.
- **B — out:** DDD's 8 are team-coordination jargon, wrong shape for a product graph.

**Routes to:** VB1/VB2 edge rendering; grounding §9 (typed edges, color-by-relationship); Foundation 3 (`plane` mandatory).

---

## Foundation 3 — Frontmatter reconciliation

### Problem

Three frontmatter schemas exist; **none is operationally honored**:

- **(a) Canonical 9-field schema** — `Standard - Card Frontmatter Schema.md`:
  `type · layer · area · status · source · classification_rationale · depends_on · constrains · parent` (+ optional `flags`). Required: `type, layer, area, status`. **Empirically: only 2 of 208 cards in `docs/alexandria/library/` carry it.** The other 206 have *zero* frontmatter — not partial; zero.
- **(b) Vocabulary-explorer schema** — `build-vocabularies-json.ts`:
  `type · prefLabel · altLabels · category · subcategory · facets · user_visible · status · proposed_by · source_evidence`. Used across ~440 worked cards in 13 lexicons. Elicitation-flavored: `prefLabel`/`altLabels` from SKOS terminology; `proposed_by`/`source_evidence` capture provenance. No `layer`, `area`, or `classification_rationale`. Built for the empty-library catalog view and works for that job.
- **(c) Empty-library catalog minimum** — what EL4 / VB1 need to *render* without bodies:
  `type · prefLabel · context · altitude · status:stub · source_evidence`. ~6 fields. `context` is the DDD shelf; `altitude` is the C4 zoom. Neither exists in (a) or (b).

These are **schemas for different stages of the same card**: (c) at first stub, (b) when worked but pre-body, (a) when fully integrated. **Not in conflict — but the conflict has been treated as choose-one.** That's the framing trap to break.

### Options

- **Option A — Promote (b), retire (a).** Admits the 2-of-208 reality; (b) is what active tooling produces; minimum migration (translate the 2 compliant cards, grandfather the rest). But: loses `layer`, `area`, `classification_rationale`, `depends_on`, `constrains` — and these back real `ax` commands (`ax cards list --area 2.1`, `ax dag`, `ax conformance show`). Retiring them retires the commands.
- **Option B — Keep (a), retrofit the 206 cards.** Migration play back-fills `type / layer / area / status`. Preserves all `ax` commands. But: ignores (b)'s elicitation-stage needs, the 206-card retrofit doesn't move rebuild forward, and the back-fill re-shelves the *old* library into the *old* taxonomy — rejected by Brick 6 ("don't hand-patch it — **rebuild it brick-by-brick through the new tooling**").
- **Option C — Three-tier schema** (conformance surface + recommended + producer extensions; modeled on OGC / OKF "conformance class vs content model"):
  - **Tier 1 — Conformance surface (MUST, no exceptions):** `type · prefLabel · context · status`. Four fields. Machine-validatable. Smallest set that lets a card be machine-cataloged.
  - **Tier 2 — Recommended (SHOULD when knowable):** `altitude · source_evidence · proposed_by · classification_rationale`. Cards without these are valid but flagged low-metadata.
  - **Tier 3 — Producer-specific extensions, typed by `type:`.** Read Model declares `derivation_source:`; Aggregate declares `lifecycle_states:`; Surface declares `screenshot:`; Principle declares `governs:`/`governed_by:`. Lives under a `metadata:` block so tier-1/2 sweeps don't trip.
  - The old fields (`layer`, `area`, `depends_on`, `constrains`) become **tier-3 extensions for existing types** — preserved, not mandatory for new producers (the scanner doesn't know them and shouldn't invent them).

### Grounding cite

- **The 2-of-208 number.** `grep -l "^---"` on the live library returns 2 files. The canonical Standard governs at most 1% of cards it claims to govern. Not a policy gap, a policy collapse.
- **C8 in `plan.md`:** "208 cards, but only **2** carry the frontmatter the schema mandates" — cited as a top-line gap, puts reconciliation under Brick 0.
- **C3 in `plan.md`:** "its 9-field frontmatter is its **own** schema, not the canonical" — explorer schema acknowledged as a divergence requiring reconciliation, not replacement.
- **build-vocabularies-json.ts ll. 49-65:** the `Card` interface declares 10 fields verbatim. Tested, populated across ~440 cards. Not vaporware.
- **VB1 spec (library-visual-build/plan.md §VB1):** "Catalog-only render. Frontmatter + edges visible (`prefLabel`, shelf, `[[wikilinks]]`); **bodies hidden**." VB1 needs `prefLabel` + `context` (the shelf). Both in (b) and (c); canonical (a) has neither (`prefLabel` doesn't exist; `area` is a numeric code, not a part-first context). **Strongest single argument: the canonical schema cannot render the catalog the gate depends on.**
- **EL5 input contract (library-elicitation-plays/plan.md §EL5):** atomizer needs `type` and `context` at minimum. Same shape as VB1.
- **Cross-product portability:** tier-1 fields present in 13 lexicons across very different products. Proven minimum-viable.

### Recommendation (author's best guess, not a ruling)

**Option C.** Two reasons: (a) the underlying tension is *staged production*, not *competing standards* — (a)/(b)/(c) describe a card at different lifecycle stages, and a tiered model admits this; (b) the 2-of-208 is not a Standard under-enforced, it's a Standard whose requirements *exceed what producers can supply* — `area:` needed FEAT-103 mass back-fill; `classification_rationale:` needs an author who knows. Shrink the conformance surface to what producers can reliably supply (4 fields) and grandfather the rest. Unblocks EL2/EL4/EL5 immediately — they need (b)/(c)-shape, not (a)-shape.

Counter-argument: Option C is most complex. If the architect prefers a flat-list outcome, Option A is the second choice (admits the 2-of-208 reality, ships in one move). Option B is third — spends rebuild budget on a re-shelving the plan wants regenerated.

### Ruling needed

1. Which option, A / B / C?
2. If C: is `context` (DDD part-first shelf) tier-1 even though the *current* library is shelved by `layer` (rationale/product/experience/temporal)? Trade-off: tier-1 has to be small to be honored and to point at the new shelving, but diverges from disk reality today.
3. If A or C: do existing `ax cards list --area`, `ax dag`, `ax conformance show` ride out as legacy on tier-3 fields, or get rebuilt against the new shape?

### RULED 2026-06-22 — full schema = Large, enforced floor = Small, loop-fields phase in with Brick 7

**Ruling (director, verbatim):** "great call full Large enforced small"

**The false constraint, removed:** the 2-of-208 is an **Alexandria-legacy** artifact — the old library was built pre-frontmatter and pre-orchestrator, so nothing implemented it. It is **not** evidence fields are costly. Cards are AI-authored and the Conan/Sam orchestrated-card-creation draft scales production, so **tiny vs. XL is ~equal calories.** The author's cost case for a minimal schema is void. Frontmatter is **agent-forward communication — the point of the library** — which argues for richness.

**Resolved — a maturity / data-availability tier model (not a cost tier):**

- **Target / full schema = Large (~16 fields).** Only Large lets a cold agent traverse *up to the bet and down to the evidence with state lit* — the master plan's one-line success test. The shape every card aims for.
- **Enforced MUST-floor = Small (5 fields): `type · prefLabel · context · plane · status`.** What a card needs to exist and be found. Conformance lints against this floor (small floor → high conformance); below it = invalid.
- **Medium (~10)** = the natural SHOULD waypoint: Small + `altLabels · altitude · source_evidence · proposed_by` + structural links. Absent = valid-but-flagged-low-metadata.
- **Large-only fields phase in with Brick 7.** Epistemic links (`proposes · produces_evidence · confirms_refutes`), per-card/edge `state`, and `classification_rationale` can't be filled until the Ledger + causal loop exist — a **data-availability** gate, not a cost one.

**Sub-question resolutions:**

- **SQ1 (A/B/C):** C-shaped (tiered) — re-justified by maturity + data-availability, not cost. A loses queryable/renderable axes; B (retrofit) already killed by Scope.
- **SQ2 (shelf):** `context` is the **part-first folder shelf** (grounding §1: flat-by-type is the named anti-pattern); `plane` is an **orthogonal tier-1 tag** for the living-plan view. Both mandatory in the Small floor. *(Folder-layout default — confirmable when VB1's render is built.)*
- **SQ3 (ax commands):** existing `ax cards list --area` / `ax dag` / `ax conformance show` **ride out as legacy** on Alexandria's grandfathered fields (now tier-3); new libraries use the new shape; reconciled only when Alexandria's own rebuild (Brick 6) reaches them.

**Drift mitigation (the one real cost of Large):** derive-don't-duplicate (don't store what a link/body already implies) + orchestrator-refresh (regenerate, don't hand-maintain).

**Routes to:** EL2 / EL4 / EL5 output spec; VB1 catalog render (Small floor) + VB3 living view (Large fields); the Standard amendment (cross-cutting #1).

---

## Cross-cutting questions

These span foundations; don't answer separately.

1. **Is the canonical Standard retired, amended, or kept as historical?** Whatever Foundation 3 rules, the Standard's status needs an explicit call. Author's recommendation tracks F3: if C, **amend** to the three tiers; if A, **retire** with a deprecation pointing at (b); if B, **keep**.

2. **Migration vs grandfathering: propagate decisions to existing cards or let new tooling regenerate?** Brick 6 says "don't hand-patch — rebuild brick-by-brick." Tilts toward **grandfathering**: 206 non-compliant cards stay non-compliant until rebuild reaches them; new cards conform from day one; lint can be soft (warning) for legacy, hard (error) for new. Alternative (retrofit 208) spends Brick 6 budget on the wrong direction. Author recommends grandfathering — but grandfathering means the live library is non-conforming for the rebuild duration, with `ax conformance show` implications.

3. **Conformance enforcement: blocking gate or soft warning during Brick 1–6?** If F3 ships with `ax lint` errors, every existing card breaks the build. If warnings, rebuild proceeds without hand-fix. Author recommends warnings during 1–6, errors from 7 onward. Architect ruling needed: some agents (Conan, Bridget) read `status:` and behave on its value — a card without `status:` is functionally invisible to them today.

### RULED 2026-06-22 — resolved by the three foundation rulings + Scope

1. **Standard's fate → AMEND.** Foundation 3 went tiered, so the canonical Standard is rewritten to the Small-floor / Large-target model (not retired, not kept as-is).
2. **Migration vs grandfathering → GRANDFATHER.** Per Scope: Alexandria's existing library is untouched; non-conforming legacy cards stay legacy until Alexandria's own rebuild (Brick 6) regenerates them. New libraries (Studio) conform from card one.
3. **Enforcement → SOFT during the rebuild.** The Small floor is MUST (a card below it is invalid); everything above warns, doesn't block. `status:` sits in the Small floor, so the Conan/Bridget "invisible card" problem is closed for new cards. Hardens further from Brick 7 on.

---

## What unblocks once these are ruled

Direct cites from the two child plans:

- **EL2** (library-elicitation §EL2 — "brief + workflow + prompts + risk-map + dry-runs need writing"). EL2's output is a card bundle whose shape is the frontmatter schema. Pass 2 (DDD carving) chooses from the type enum. Pass 1 (Event Storming) writes wikilinks using the link-type vocabulary. **Until F3 ships, EL2 has no output spec.**
- **EL5** (§EL5 input contract — "the confirmed empty library + SoT docs"). Input = "catalog of cards with shelves and lexicon." Shelves = F1's type + F3's `context:`. Lexicon = explorer's `prefLabel`/`altLabels` (F3). **Until F1 and F3 ship, EL5 cannot be re-pointed.**
- **VB1** (library-visual §VB1 — "Catalog-only render. Frontmatter + edges visible…"). Renders frontmatter (F3); "shelf" is F1's context; "edges" use F2's link types. **VB1 cannot ship without all three.**
- **VB3** (§VB3 Plane Switcher — "Cross-plane edges (the three epistemic relations… *proposes/embodies, produces-evidence, confirms/refutes*) drawn with **state on the edges**"). The three epistemic edges are F2 directly. **VB3 cannot be designed without the epistemic-types ruling.**
- **Brick 7** (plan.md C7 — "add three **epistemic edge types** as first-class typed links"). Same as VB3; one is the type-vocabulary half, the other the view half.

Not blocking: **Brick 6 dogfooding** (regenerates from scratch using whatever rules apply, if grandfathering); **Brick 5 atomizer migration** needs F1 only.

**Net: one 15-minute set of rulings unblocks EL2, EL5, VB1, VB3, and Brick 7 — the largest single dependency sequence in the rebuild plan.**
