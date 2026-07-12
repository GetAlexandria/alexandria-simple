# Design brief — the **Knowledge Organization** area

*A build brief for a fresh agent. Self-contained. Ruled by the director 2026-07-05.*

## Why this exists (read first)

The meta-lesson of Alexandria's taxonomy work is this: **Alexandria has never
written down how it organizes libraries.** An entire multi-hour working session
happened *because* that source of truth didn't exist — the organizing scheme was
being invented on the fly. This area fixes that. It is the **Dewey Decimal system
of the product** — the enshrined, first-class account of the *system of knowledge
organization*: how a library is structured, how its nouns are classified, and how
those choices are named.

It is not just containerization; it is **wordification** — the words matter as much
as the boxes. And the approach is not frozen: the area **connects to the Strategy
plane (to evolve the approach) and to Learning (to capture what's learned about
organizing).** "Organizing concepts are a product feature," made literal — the
*approach itself* is library content.

## The build principle: **atomic + relational, from the start**

Author this as **atomic cards** — one concept per card — not as a monolithic doc.
Every card must speak to two things:

1. **Its job** — what this concept *does* in the system.
2. **Its relationships** — how it connects to the other concepts (typed links).

The set of atomic cards **plus their links IS the model.** Build the SYSTEM: a
graph of interrelated concepts, each stating its role and its edges. If a card reads
like a dictionary entry rather than a working part of a system, it's not done.

## The system to model — concepts, jobs, relationships

Card each of these. Names in **bold** are the concept (pick the canonical word;
reconcile synonyms — e.g. the unit is **Atomic Card**, not "Cards" or "Library
Card", which become altLabels).

### 1. The unit being organized
- **Atomic Card** — *job:* holds one unit of product intent. *Relationships:*
  classified by exactly one **Type** and one **Altitude** (the two axes below);
  carries **Status**, **Confidence**, **prefLabel/altLabels**, and typed **Links**
  to other cards; homed in one **Context**.

### 2. The containers (organizers — a *third thing*, NOT card-types)
The containment hierarchy: **Company → Domain → Plane → Context → Atomic Card.**
(Only Plane→Context→Card is enforced in code today; Company/Domain are the intended
upper levels — say so.)
- **Domain** — *job:* the divisions / business units of an organization. *Instance
  (SocioTechnica):* New Media, Product, Software Development (informal today); wanted
  additions — Operations, Sales & Marketing, with New Media nesting under Marketing.
- **Plane** — *job:* the three knowledge bands — Strategy, Product, Learning. Groups
  contexts. (Well-defined already.)
- **Context** — *job:* a container within a plane; holds cards.
- **Library** — *job:* the whole graph; the thing being organized.

### 3. The two classifying axes (orthogonal — the central ruling)
- **Type** — *job:* the **product-descriptive** axis — which *families category* a
  card is (what kind of product-noun, as the user meets it). **Primary.**
- **Altitude** — *job:* the **structural-grain** axis — the DDD / Event-Storming /
  C4 role & lifecycle (pillar, aggregate, component, value, capability, context,
  read-model…). **Secondary.**
- *Relationship:* every Atomic Card carries **one of each**; the axes are
  **orthogonal, not competing lists.** (This is the load-bearing insight — see the
  two-axis ruling in grounding.)

### 4. The category system (the metaschema)
- **Atomic Card Category** (the metaschema) — *job:* the ten universal families
  buckets a card's Type is drawn from: Rationale, Research, Roles, Domains,
  Surfaces, Entities, Capabilities, Systems/Mechanics, Patterns, Economy. *(This is
  the metaschema; the director ruled it lives HERE, not in Rationale/Research.)*
- Each **families category** — *job:* one product-noun kind; card its definition +
  how it differs from its nearest neighbor.
- The **altitude grains** — card the DDD grain set and what each means.

### 5. The descriptors (a card's metadata)
- **Status** (stub / confirmed / deprecated — "how real"), **Confidence**
  (high/medium/low), **prefLabel / altLabels** (naming), **Links** (the typed edges
  that form the graph — contains / related_to / operates_on / part-of / derived_from
  …), **Provenance / Rulings / source_evidence**.

### 6. The approach & its evolution
- **The Approach** — *job:* the current method for organizing — **DDD + families
  taxonomy.** *Relationship:* it is **not fixed**; it connects to **Strategy** (to
  decide/evolve the approach) and **Learning** (to capture organizing lessons). Card
  this so the model can improve itself.

## Relationship map (make these edges explicit)
- **Containment:** Company ⊃ Domain ⊃ Plane ⊃ Context ⊃ Atomic Card.
- **Classification:** Atomic Card —*has-type*→ one Families Category (Type axis);
  —*has-grain*→ one Altitude.
- **Vocabulary:** the Type axis draws its values from **Atomic Card Category**.
- **Metadata:** every card carries Status + Confidence + Links + provenance.
- **Governance:** **The Approach** governs the whole system and links out to
  **Strategy** and **Learning** for evolution.

## Quality bar
- **Atomic** — one concept per card; product-English; WHAT (its job) + relationships
  in the body; no code paths in prose.
- **Systemic** — every card names how it relates to the others; the reader can
  traverse the model as a graph.
- **Reconciled naming** — one canonical word per concept (wordification); synonyms
  become altLabels.

## Self-referential note (flag for the builder)
These meta-concepts *describe the very axes that classify them*, so their own Type
and Altitude are a genuine design question — the organizers (Domain/Plane/Context,
Type, Altitude, the categories) are the "third thing," not ordinary product-nouns.
Propose their typing grounded in the two-axis model; don't force-fit.

## Grounding — read these before building (don't start cold)
- **The two-axis ruling:** `docs/alexandria/plans/library-word-legibility/taxonomy-state-of-the-state.md` → "RULED 2026-07-05 — the two-axis model."
- **Every ruling from the session:** `docs/alexandria/plans/library-word-legibility/library-update-worklog.md` (esp. "Batch-review discussion rulings" → the Structure/Knowledge-Organization area).
- **The ten categories, in code:** `packages/ax/src/domain/atomic-card-categories.ts`.
- **The research behind the families:** `docs/alexandria/plans/library-population-playbook/vocabulary/families.md`.
- **The director's own data model:** the Library/Playbook/Ledger model doc (Company→Domain→Plane→Context; model-vs-machine; front/back-of-house) — attached in the session's `.context/attachments/`.
- **Memories:** `alexandria-organizing-concepts-are-product-feature`, `alexandria-two-axis-taxonomy`.

## Placement
A new **Context** (working name `knowledge-organization`) whose cards are the
system above. Wire the area to the **Strategy** and **Learning** planes per §6. Its
cards should be authored to the same bar as the rest of Alexandria's library.

## Canonical decisions already locked (don't relitigate)
- Area name: **Knowledge Organization** (library-science lineage).
- The card unit is **Atomic Card** (canonical; "Card"/"Library Card" → altLabels).
- **Type = families categories** (product-descriptive), **Altitude = DDD grain** —
  orthogonal axes.
- Organizers (Domain / Plane / Context) are a **third thing**, not card-types.
- The metaschema (**Atomic Card Category**) lives in this area.
