# Taxonomy & organizers — state of the state (investigation, 2026-07-05)

Four parallel code-grounded investigations, triggered by the question: how are the
organizing concepts (Domain / Plane / Context) and the card-type language
(Entity / Surface / … / Economy) actually modeled, and does the library process
establish the card-types or only the nouns?

## Verdict up top

Alexandria has **two organizing axes in very different states of health.**

- **Organizers (Plane → Context)** — real, enforced, and confirmed by the process.
  This half works.
- **Card-type language (the "ten buckets")** — defined in **four places that don't
  agree**, orphaned from the live pipeline, and **never established or confirmed
  per product.** The redesign dropped the one step that used to do it (the
  Vocabulary / noun-matching module) and deliberately deferred the replacement,
  which was never built.

Both of your instincts were correct: the Index defines contexts but not
card-types, and the new process confirms nouns but never establishes the type
vocabulary — so "if something like economy doesn't come up, we do nothing about it"
is literally true.

## RULED 2026-07-05 — the two-axis model (the resolution)

The taxonomy is **two orthogonal axes, not one contested list.** This dissolves
every symptom above.

- **`type` = the families categories** (product-descriptive — Roles, Surfaces,
  Entities, Capabilities, Systems/Mechanics, Patterns, Economy, Domains; +
  owner-supplied Rationale/Research). **Primary:** "what the user meets."
  Aesthetics-first, research-backed (`families.md`).
- **`altitude` = the DDD/ES/C4 grain** (aggregate, value, component, read-model,
  capability, context, pillar). **Secondary:** "structural role / lifecycle."
  *Already live* as the `altitude` frontmatter field — the June-21 reorg's real
  contribution, which only *looked* like a rival to families because it overwrote
  `type` instead of living here.
- **Organizers (Plane / Context / Domain) are a third thing** — containers, not
  categories (families: "Domain is a label, not a category"). Modeled per the
  reflexive-concepts requirement below.

**No intellectual sacrifice:** DDD isn't ditched, it's *relocated* to the axis it
always described; families anchors `type` because the library is product-descriptive
(the scalpel = user-facing first).

**Reverses the earlier Economy→Values rename.** families defines Economy as *real*
economics (Seats, Currency, Stock, Tiers); Alexandria is families' Family-2
("agentic"), where Economy is a known *gap* (token cost, context window) — so it's
rightly ~empty. The current "Economy" cards (Plane, Thread Status, Schema Mode) are
`altitude: value` value-objects **mis-filed**: rehome them (Thread Status = a
lifecycle-state value; Plane = an organizer concept; Schema Mode = likely
implementation). "value" is an altitude, never a category rename.

**Next:** Step 1 locks the container word + the `type` list against families;
`altitude` formalizes the DDD grain values already in use.

## The reflexive point: these concepts are a product *feature*, not just plumbing

Domain, Plane, Context — and the card-type taxonomy itself — are not only the
*machinery* that organizes a library. They are **key product concepts Alexandria
must clearly define, explain, and model in its own library** (Danvers, 2026-07-05:
"functionally a key feature of the system"). Alexandria's job is teaching a
product-knowledge model, so its meta-concepts are simultaneously its product
surface *and* content its own library must contain — the map is also the territory.

The irony the investigation exposes: **the concepts that most define the product
are the worst-modeled in the product's own library.** Plane is buried as an
`Economy` value-object; Domain and Company aren't authored as concepts at all; the
card-type taxonomy is an orphaned prompt-string instead of the arguable, authored
artifact the old `Artifact - Type Taxonomy` used to be. So the taxonomy/process
effort (below) carries a second requirement beyond reconciling the machinery:
**author first-class concept cards that define Plane, Context, Domain, and the
card-type taxonomy in Alexandria's own library — dogfooding the feature.**

## 1. The organizer hierarchy — only the bottom half exists

Modeled and enforced (`packages/ax/src/domain/library-catalog.ts`):

- **Plane** — hard enum `{strategy, product, learning}` (`:38`, validated `:957`;
  client mirror `viewer/.../schemas.ts:61`).
- **Context** — the container level (`catalog.areas`, keyed
  `area:${plane}:${context}`, `:434`); required on every card but a **free string,
  no canonical set**.
- **Card** — belongs to exactly one context within one plane.
- The alexandria-product bundle = **7 contexts** (library, playbook, viewer,
  triggers, ledger, canvas, +`_index` keystone), 74 cards.

Prose-only — NOT in code:

- **Domain** and **Company** as container levels above Plane. "Domain" is
  overloaded **≥3 ways**: the `domains` card-category bucket; a
  `LibrarySearchPriorDomain` metadata struct; and Studio's *separate*
  `Company → Division → Function → Play` play-filing model (`Alexandria_Prime`;
  `docs/.../studio-fixes/org-model.md`, `studio/plays/registry.js`).
- **Company / federation** above product is explicitly deferred (survives only in
  an archived plan). "SocioTechnica" appears only in Damien's agent docs.

→ Company → Domain → Plane → Context is **half-built**: Plane/Context are real and
enforced; Domain/Company are intentions.

## 2. The card-type language — four non-agreeing vocabularies

| # | Where | Vocabulary | Role in the system | Status |
|---|---|---|---|---|
| 1 | `ax/…/atomic-card-categories.ts` | rationale, research, roles, domains, surfaces, entities, capabilities, mechanisms, patterns, economy | the "ruled ten" | **Orphaned** — only gates a legacy `categoryId` field; the live loader/scanner never import it |
| 2 | `back-of-house-walk/prompts/pass2_carve.md` | Role, Surface, Entity, Component, Capability, Mechanism, Pattern, Economy, Reference (9) | **what actually types cards** | Live. Adds off-canon Component/Reference; omits rationale/research/domains |
| 3 | `viewer/…/engine-view-model.ts` `ENGINE_TYPE_ICON_SET` | Surface, Capability, System, Aggregate, Component, Read-Model, Entity, Agent, User, External | Engine icons + color | DDD vocabulary; overlaps ruled ten on **3/10** → the `?` icons |
| 4 | `viewer/…/notepad-view-model.ts` `roleStyle` | aggregate, read-model, value, component, capability | story-chip + notepad color | overlaps ruled ten on **1** |

Plus: `type` is the **one required card field with no enum validation anywhere**
(loader uses presence-only `productCardString`; `plane`/`status` use
`productCardEnum` against real allowlists). The Vocabulary module (§4) used a 5th,
slightly different list ("Systems-Mechanics"). Nothing reconciles these.

## 3. Economy — conflation confirmed

Every card that ever landed in Economy is a **value-object / enum** — Plane, Thread
Status, Catalog Schema Mode, all `altitude: value` — not a real economy. Its only
in-repo definition (`pass2_carve.md`: *"a resource, price, or value-unit"*) is
broad enough to mean **both** a real economy and a closed value set; the conflation
is baked into the seed. Alexandria has no marketplace/currency/points economy yet,
so the bucket is correctly *empty of that sense* but *misnamed for it*. "Value
object" has been independently reinvented **3×** (a live `"value"` case in
`roleStyle`; a discarded re-type experiment `test-scan-02-reorganized`; our plan's
Economy→Values).

→ Two rulings: rename **Economy → Values** for the value-object sense, and decide
whether a **separate "real economy" bucket** is ever needed (for products — eBay,
games — that have one). They are two different animals sharing one name.

## 4. The missing step — dropped, then deliberately deferred

- The **Vocabulary / noun-matching module**
  (`docs/…/library-population-playbook/vocabulary/`) — 12 exemplar products incl.
  **Airbnb** and **Hollow Knight**, ~440 worked cards, and a **"Closest fit"**
  matching explorer — was the step that **established a product's card-type
  language**: category by category, show what comparable products call things, let
  the director adopt / mix / reject — including "do you even have an economy?" It
  was **Brick 1** of the rebuild, flagged *"built, but broken, unskinned, and
  unbound,"* **never finished or wired in**. The shipped scanner replaced it with
  the generic **freight-terminal analogy** in `pass2_carve.md`.
- Downstream, the chain **explicitly excludes `type` from every correction
  surface**: FoH `plan_bundle_patch.md:63`, FoH `SKILL.md`, EL4
  `empty-library-confirm`, EL5 `triage.md` all permit only
  `prefLabel / context / plane / status / relationships`.
- `brick-0-foundations.md` ruled the type enum **once**, as a *global, additive
  palette* with each library a *"curated subset,"* and **deferred per-product
  retyping** (*"Job B (deferred): … EL3-walk tuning, not a foundation call"*) —
  never resumed.
- The **old** system reified the taxonomy as a first-class, arguable library
  artifact (`_archive/type-claim-taxonomy/`: `Artifact - Type Taxonomy`, a 21-row
  audited claim table). The new chain **demoted it to a constant string in a
  prompt.**

→ The **type axis lost both its establishment step** (Vocabulary matching) **and
its confirmation gate** (deferred, never built). The noun/structure axis kept both.

## Implication — this is two efforts, not one

1. **Presentation** (the original QoL issues; plan Parts A/B/C): one canonical
   type → color + legend, name-first chips, Engine × Constellation. Unblocked the
   moment we pick the single source. *Ships value now.*
2. **Taxonomy & process** (surfaced here):
   - **Reconcile the 4 vocabularies onto one** — make `atomic-card-categories.ts`
     the single source the scanner prompt, loader validation, and viewer palette
     all consume (Economy→Values; rule Component / Reference / Roles).
   - **Lock the taxonomy as the WARM capstone of the FoH walk** (Danvers ruled,
     2026-07-05 — *not* the old up-front "cold shower" Vocabulary station; people
     don't think taxonomy-first). After the walk has surfaced the product's real
     language, a final step: start from Alexandria's generic canonical taxonomy →
     present a best-guess adaptation from the words actually used → offer the
     exemplar comparison (the old Vocabulary module's Compare / "Closest fit" view —
     Airbnb, Hollow Knight — folded in here, warm, with max context) → the director
     locks it in. The Vocabulary corpus survives as *content*; its *position* moves
     from cold-open to warm-close. This is where brick-0's deferred "profile — a
     curated subset" (Job B) finally gets chosen.
     Mechanism: a `typeMapping` turn mirroring the already-shipped container-mapping
     / `proposed-index-card-approval` gate, with its own Ledger event; competing
     word-choices surface as threads/hot-spots (the same open-questions machinery as
     the rest of the walk).
   - **Same lane discipline as planes/contexts, all the way through.** Kill the 3–4
     competing type vocabularies so exactly one canonical set travels the pipeline.
     (Precision: planes get *enum* discipline; contexts are still a free string,
     disciplined only by *process*/the gate — so "one lane" for card-types means the
     container-mapping-style gate + threads, and is a chance to tighten contexts to
     match if we want true single-source across all three organizers.)
   - **Dogfood target:** Alexandria's own 74-card bundle is already warmed-up and
     one step from launched — the perfect first run of this capstone.
   - **Make the taxonomy a first-class library artifact again** — a card the
     library owns and can argue about, not a prompt constant.

The presentation work is the visible symptom; the taxonomy/process work is the
disease. Part A of `plan.md` (one canonical type language) is the hinge between
them — do it once, both efforts consume it.

## Step 1 input — the container noun & its areas (history reconstructed 2026-07-05)

**No single canonical word exists.** Four competing terms, none reconciled:

- **"Atomic Card Category"** — `atomic-card-categories.ts` (live code, but used only
  in an ax event/plays schema, *not* the library ingestion path).
- **"the superstructure"** — the live `Reference - Atomic Card Category` card
  (describes the old 10-bucket scheme).
- **"Vocabulary Families"** — `families.md` (the research redefinition; never
  revisited).
- **"canonical category"** — `pass2_carve.md`, the scanner's inline term; unnamed as
  a noun but *operative* (it produced the live library).

**Three category schemes, from three moments — only the last is live:**

| When | Scheme | Categories | Research backing | Status |
|---|---|---|---|---|
| **May 29** (`families.md`, "vocabulary v2") | 10 research families | Rationale, Research, Roles, Domains, Surfaces, Entities, Capabilities, **Systems/Mechanics**, Patterns, Economy | **Strong** — 4 software-type families, worked exemplars w/ public-doc URLs, 8 cited cross-cuts (MDA paper…) | Frozen, never revisited |
| **June 21** (`test-scan-02-reorganized`, PR #322) | DDD / bounded-context reorg | shelved by context, typed with Aggregate, Component, Value, Read-Model, Surface, Capability, Agent, System, Implementation | Has rationale (`THREE-CONFUSIONS.md`) + `REORGANIZATION-NOTES.md` | PoC on Alexandria's own scan only |
| **July 3** (`pass2_carve.md`, PR #598) | 9 "canonical categories" | Role, Surface, Entity, **Component**, Capability, **Mechanism**, Pattern, Economy, **Reference** | **Thin** — freight-terminal analogy, no citations | **LIVE — built the current library** |

`atomic-card-categories.ts` matches *none* of these and carries an internal
inconsistency (id `mechanisms`, `folderName: "systems"`).

**Example-update to-do: barely started (~1 of 9).** Only Alexandria's own scan was
reorganized (`alexandria-code` → `alexandria-code-reorganized`), and under the
*DDD* scheme, not the families one. **Airbnb, Hollow Knight, and all 8 other
exemplars are untouched**, on the original 10-category scheme. No tracked to-do
exists — the memory of a partial update is real, but it was never a checklist, and
it conflates two different redefinitions (May-29 families vs June-21 DDD reorg).

**Two flags before locking:**

1. **Economy vs "Values" is contested across two axes.** No source ever renamed
   Economy → Values (our earlier decision). But "value" *already exists* as a
   separate **altitude** (`altitude: value` = value-object, orthogonal to category)
   — and every Economy card is `altitude: value`. Open question: is "Economy" a real
   *category* of product-noun, or just the *value-object altitude* mis-slotted as a
   category? (This is the root of "how is Plane an Economy card.")
2. **The live scheme already ruled Domain OUT as a category** — pass2_carve: *"Domain
   is a label, not a category"* (a bounded-context folder name / a Reference label).
   Conflicts with `atomic-card-categories.ts` (still lists `domains`) but aligns with
   the org-hierarchy finding (Domain isn't a container level in code).

**Recommendation for Step 1:** anchor the *substance* on the research-backed
**families.md** scheme, reconciled with the live scanner's already-made rulings
(add Component; decide Rationale/Research vs folding into Reference; treat Domain as
a label not a category; resolve Economy vs value-object-altitude) → produce ONE
named list under ONE chosen container word. That becomes the single lane.
