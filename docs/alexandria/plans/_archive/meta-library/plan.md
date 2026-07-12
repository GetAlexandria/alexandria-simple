# Meta-Library: An Alexandria for Software Product Context Libraries

**Goal:** Build a context library that backstops Alexandria plugin itself — encoding
the methodology, architecture, agent plays, wizard logic, integration patterns, and
accumulated learnings into a proper knowledge graph that Conan can assemble from and Sam can
maintain.

**Why now:** The plugin is approaching real-world deployment (Phase 5: Hearthfire test). Once
multiple teams are using it, learnings will pour in faster than conversational memory can
track. The meta-library captures those learnings structurally so they improve the template
system, agent definitions, and wizard rather than living only in someone's head.

**Depends on:** Plugin structure (done, PR #1), Wizard skill (Phase 4, in progress)
**Feeds into:** Template system improvements, Alexandria genus/species support, 1,000-user
scaling goal

---

## Part 1: Architecture

### What genus is this library?

**Software Product (I-A)** from Alexandria taxonomy. Alexandria plugin IS a
software product. Its factory prints code — agent definitions, skill procedures, wizard
logic, templates, and eventually MCP tools. The existing type taxonomy applies because we're
building software, but the *domain vocabulary* is specialized: the "product" being described
is a knowledge management system.

### Wizard configuration for this library

Running the wizard on ourselves:

- **AI Mode:** Factory — agents (Conan/Sam) will maintain this library autonomously
- **Domain Novelty:** High — context libraries for AI is a pioneering concept with no
  established category to draw from
- **Product Complexity:** High — wizard, agents, cards, assembly, maintenance, templates,
  and feedback all cascade into each other

**Result:** Factory × High × High = all 22 knowledge areas, nearly all at Foundation or
Core tier. Maximum coverage. This is expected — the product that helps others document
everything needs to document itself thoroughly.

### The four layers, instantiated

**Identity Layer (Rationale) — WHY Alexandria exists**

| Type | Cards | What they capture |
|------|-------|-------------------|
| Product Thesis | 3-4 | The core bets: implicit→explicit knowledge, typed knowledge graphs beat documents, AI agents need product context to make aligned decisions, composability across domains |
| Principle | 6-8 | Generalization rule, atomicity, five dimensions, build-sequence discipline, structural-vs-functional quality, the "six-month employee" heuristic, separation of assessment/creation |
| Standard | 5-7 | Card format standard, grading rubric standard, retrieval profile standard, wizard configuration standard, naming/folder conventions, conformance obligation rules |

**Domain Layer (Product) — WHAT Alexandria is**

| Type | Cards | What they describe |
|------|-------|-------------------|
| Zone | 3 | The three major subsystems: Configuration Engine (wizard), Knowledge Graph (library + cards), Agent Workbench (Conan + Sam + plays) |
| Room | 6-8 | Wizard Intake, Gap Analysis, Card Workspace, Assembly Desk, Maintenance Bay, Feedback Queue, Template Workshop, Integration Dock |
| System | 8-10 | Sensitivity profile engine, pool membership engine, gap scoring algorithm, retrieval profile system, traversal engine, grade computation system, provenance tracking, feedback triage, downstream sync, blast radius calculator |
| Component | 4-6 | Card (the unit), Wikilink (the edge), Context Briefing (the output), Wizard Config (the configuration artifact), Inventory Manifest, Seeding Plan |
| Capability | 5-7 | Context assembly, library grading, card creation, source assessment, health checking, surgery planning, downstream sync |
| Primitive | 3-4 | Knowledge Area (the 22 catalog items), Card Type (the 18 types), Dimension (the 5 per card), Tier (Foundation/Core/Amplifier/Deprioritized) |
| Agent | 4-5 | Conan (the librarian), Sam (the scribe), Nit (the linter), Bridget (the briefer), Builder Agent (the consumer) |
| Artifact | 2-3 | Context Briefing document, Provenance Log, Feedback Queue |

**Experience Layer — HOW using Alexandria feels**

| Type | Cards | What they describe |
|------|-------|-------------------|
| Loop | 3-4 | The build cycle (inventory→create→grade→fix→review), the assembly cycle (request→assemble→implement→feedback), the maintenance cycle (health check→diagnose→recommend→surgery→review), the evolution cycle (product change→source assessment→inventory→build) |
| Journey | 2-3 | New user onboarding (wizard→first library→first assembly→first maintenance), Library maturation (sparse→functional→rich→self-sustaining), Alexandria expansion (software→first new genus→compound libraries) |
| Aesthetic | 2-3 | "The library makes you smarter" (assembly provides context you didn't know you needed), "The agents keep it honest" (maintenance catches drift before it compounds), "It works for any product" (generalization is real, not aspirational) |
| Dynamic | 2-3 | Knowledge decay (cards drift from reality over time), Cascade fragility (upstream weakness propagates), Context amplification (good library → better AI output → better feedback → better library) |

**Temporal Layer**

| Type | Cards | What they capture |
|------|-------|-------------------|
| Decision | 5-8 | Key architectural decisions: why typed graph not documents, why five dimensions not three, why separate Conan/Sam roles, why wizard has three axes not two, why build-sequence discipline exists, why provenance logging matters |
| Initiative | 2-3 | Beadification/MCP integration, Alexandria genus expansion, 1,000-user scaling |

### The meta-recursive property

This library documents the system used to build libraries. Three implications:

1. **Self-reference is structural, not accidental.** A card about "System — Grade
   Computation" will reference "Standard — Grading Rubric" which is both a card in this
   library AND a real Standard that Conan applies. That's fine — the wikilink is honest
   about the relationship.

2. **External validation is mandatory.** A normal library validates internally (cards
   reference each other consistently, grades are defensible). This library must ALSO
   validate against external evidence: user outcomes, support tickets, adoption metrics,
   failure reports from real deployments. The temporal layer tracks these external signals.

3. **The bootstrap sequence matters.** We're using Conan/Sam to build a library ABOUT
   Conan/Sam. The agents can do this — they're describing what they do, not evaluating
   whether they should exist. But the grading step needs human oversight at the identity
   layer: a system shouldn't grade its own Product Thesis without external calibration.

---

## Part 2: Source Inventory

We're not starting from scratch. The plugin repo already contains rich source material:

| Source | Location | Coverage | Quality |
|--------|----------|----------|---------|
| System Story | `docs/design/system-story.md` | Comprehensive — all 7 phases, rules engine, 10 engineering opportunities | High — thorough, well-structured |
| Wizard Engine + Config | `docs/wizard/wizard-engine.yaml`, `skills/wizard/engine.md`, `docs/wizard/phase-3-configurations.md` | Complete — pools, profiles, configurations, patterns | High — locked and QA'd |
| Wizard Phase 6 | `docs/wizard/phase-6-intake-engine.md` | Complete — intake, gap scoring, sequencing | High — spec-quality |
| Beadification Plan | `docs/design/beadification-plan.md` | Complete — 5-phase roadmap with code sketches | Medium — LifeBuild-specific paths need adaptation |
| Alexandria Outline | `docs/design/alexandria.md` | Draft — 7 genera, species, cross-cutting patterns | Medium — needs validation against real non-software implementations |
| Conan Agent Definition | `agents/conan.md` | Complete — both modes, all jobs, type taxonomy, rubrics | High — battle-tested on LifeBuild |
| Sam Agent Definition | `agents/sam.md` | Complete — 3 jobs, card-building rules | High — battle-tested |
| Skill Files | `skills/conan/`, `skills/sam/`, `skills/nit/`, `skills/context-briefing/`, `skills/shared/`, `skills/wizard/` | Complete — all procedures | High |
| Templates | `templates/` | Partial — library-readme, reference | Medium — needs expansion |
| LifeBuild Implementation | External (github.com/sociotechnica-org/lifebuild) | Complete reference implementation | High — 100+ cards, full lifecycle |
| Project Plans | `docs/plans/` | Partial — plugin restructure, gap analysis, solicitation | High |

**Source assessment prediction:** READY for most knowledge areas. The WHY layer is
well-documented (the system story explains rationale for nearly every design decision). The
HOW layer is thorough (skill files are step-by-step procedures). The main gap is the
Experience layer — we haven't formally captured what the user journey feels like, what the
failure modes are as dynamics, or what the engagement loops are. Those will need to be
authored, not extracted.

---

## Part 3: Species of Knowledge

Within this library, knowledge clusters into seven natural categories. These aren't card
types (we use the standard type taxonomy for that). They're **topic neighborhoods** — groups
of cards that are tightly interlinked and tend to be retrieved together.

### Species 1: The Card System

The atomic unit of the library and its five-dimension structure.

**Cards:** Standard — Card Format, Standard — Naming Conventions, Primitive — Card Type,
Primitive — Dimension, System — Card Parser (future, beadification), Component — Card,
Component — Wikilink, Principle — Atomicity, Principle — Five Dimensions

**Why it matters:** Every other species depends on cards being well-defined. Template
improvements, new genus support, and the MCP layer all trace back to "what is a card and
what makes a good one?"

### Species 2: The Configuration Engine

The wizard — how you decide what to build.

**Cards:** Zone — Configuration Engine, Room — Wizard Intake, Room — Gap Analysis,
System — Pool Membership Engine, System — Sensitivity Profile Engine, System — Gap Scoring,
Primitive — Knowledge Area, Primitive — Tier, Capability — Wizard Configuration,
Decision — Three Axes Not Two, Decision — 22 Areas Not 15

**Why it matters:** The wizard is the entry point for every new user. Getting it right
determines whether the library they build will serve them. Also the most likely place where
Alexandria-driven changes land (adding the "zeroth question" for genus selection).

### Species 3: The Agent Plays

Conan's jobs, Sam's procedures, and how they interact.

**Cards:** Agent — Conan, Agent — Sam, Agent — Nit, Agent — Bridget, Agent — Builder Agent, Zone — Agent Workbench,
Room — Maintenance Bay, Room — Card Workspace, Capability — Context Assembly,
Capability — Library Grading, Capability — Card Creation, Capability — Source Assessment,
Capability — Health Checking, Capability — Surgery Planning, Loop — Build Cycle,
Loop — Maintenance Cycle, Principle — Separation of Assessment and Creation,
Decision — Why Separate Conan and Sam

**Why it matters:** The agent plays are the runtime of the system. When users report
"Conan missed something" or "Sam's cards are thin on WHY," the fix traces back to a play.

### Species 4: The Assembly Pattern

How context gets assembled and delivered to builders.

**Cards:** Agent — Bridget, Room — Assembly Desk, System — Retrieval Profile Engine, System — Traversal
Engine, Standard — Retrieval Profile Format, Component — Context Briefing, Artifact —
Context Briefing Document, Artifact — Provenance Log, Loop — Assembly Cycle,
Capability — Context Assembly, Decision — Attention-Aware Ordering,
Decision — Card Budgets by Complexity

**Why it matters:** Assembly is the library's primary value delivery. The moment a
builder agent gets a useful briefing, the library has paid for itself. Assembly quality is
the ultimate measure.

### Species 5: The Quality System

Grading, rubrics, maintenance, and feedback.

**Cards:** Agent — Nit, Standard — Grading Rubric, System — Grade Computation, System — Feedback Triage,
System — Blast Radius Calculator, System — Provenance Tracking, Room — Feedback Queue,
Artifact — Feedback Queue, Capability — Downstream Sync, Loop — Maintenance Cycle,
Dynamic — Knowledge Decay, Dynamic — Cascade Fragility, Principle — Structural vs
Functional Quality, Principle — Six-Month Employee Heuristic

**Why it matters:** Quality is what separates a useful library from a document graveyard.
The rubrics, maintenance jobs, and feedback loops are the immune system.

### Species 6: The Template & Scaffolding System

How new libraries get bootstrapped.

**Cards:** Room — Template Workshop, Component — Library README Template, Component —
Reference Template, Component — Card Templates (per type), Capability — Library
Scaffolding, System — Build Sequence Discipline, Standard — Folder Conventions,
Journey — New User Onboarding

**Why it matters:** The template system is the distribution mechanism. When a new user
runs the wizard, what they get is templates. Template quality determines first impressions
and whether the library structure starts healthy.

### Species 7: The Integration & Composability Layer

How libraries connect to factories and to each other.

**Cards:** Room — Integration Dock, System — MCP Tool Surface (future), System — Bead
Cross-Reference (future), Initiative — Beadification, Initiative — Alexandria Expansion,
Journey — Library Maturation, Dynamic — Context Amplification, Decision — Composable Not
Monolithic

**Why it matters:** This is the growth frontier. The beadification plan, Alexandria
genus expansion, and compound library federation all live here. Most cards in this species
will start as Initiative/Decision/Future cards and evolve into System/Capability cards as
implementation proceeds.

---

## Part 4: Build Plan

### Phase 0: Preparation (this PR)

- [x] Alexandria outline written (`docs/design/alexandria.md`)
- [x] This plan written and reviewed
- [ ] Decide where the meta-library lives physically

**Location decision:** The meta-library lives at `docs/alexandria/` within this plugin
repo, following the same convention that any product's context library lives alongside the
product. The plugin IS the product. The library describes the plugin.

This means Conan and Sam can maintain it using their standard procedures — no special
tooling needed. The agents/skills work on this library the same way they work on LifeBuild's
library.

### Phase 1: Identity Layer — Standards and Rationale

**Estimated cards:** 14-19
**Sources:** system-story.md (primary), agent definitions, skill files

**Step 1a: Source Assessment (Conan Job 0)**

Run Conan's source assessment against the existing docs to confirm readiness. Prediction:
READY, with the Experience layer marked GAPS (no formal experience documentation exists yet).

**Step 1b: Inventory (Conan Job 1)**

Conan inventories the full library from source material. The inventory produces the manifest
that governs everything Sam builds. Expected inventory size: 60-80 cards across all layers.

**Step 1c: Build Standards (Sam)**

Standards first — they constrain everything downstream. Expected standards:

1. Standard — Card Format (the five-dimension anatomy)
2. Standard — Naming Conventions (Type - Name.md, folder paths)
3. Standard — Grading Rubric (dimension rubrics, grade scale, computation)
4. Standard — Retrieval Profile Format (mandatory categories, hop depth, dimension priority)
5. Standard — Wizard Configuration Format (3 inputs, 22 areas, tier assignments)
6. Standard — Conformance Obligations (which types must link to which Standards)
7. Standard — Wikilink Context Phrases (no naked wikilinks, relationship labels)

**Step 1d: Spot-Check Gate (Conan Job 2.5)**

Conan verifies Standards before proceeding.

**Step 1e: Build Product Thesis and Principles (Sam)**

The WHY layer. Expected cards:

Product Theses (3-4):
1. Product Thesis — Implicit Knowledge Made Explicit (the core bet: AI needs explicit
   product context to avoid contextually wrong outputs)
2. Product Thesis — Typed Knowledge Graphs Beat Documents (graphs are traversable and
   queryable; documents are not)
3. Product Thesis — Composable Across Domains (one methodology, many product types — the
   Alexandria thesis)
4. Product Thesis — Quality Through Maintenance Loops (libraries degrade without active
   upkeep; the Conan/Sam loop is the answer)

Principles (6-8):
1. Principle — Generalization Rule (no product-specific assumptions in the plugin)
2. Principle — Atomicity (one concept per card)
3. Principle — Five Dimensions (WHAT/WHERE/WHY/WHEN/HOW at equal weight)
4. Principle — Build Sequence Discipline (upstream before downstream)
5. Principle — Separation of Assessment and Creation (Conan assesses, Sam creates)
6. Principle — Structural Before Functional (integrity before utility)
7. Principle — The Six-Month Employee (would they say "not wrong, but missing the real
   story"?)
8. Principle — External Validation for Meta-Libraries (self-referential systems need
   external calibration)

**Step 1f: Spot-Check Gate (Conan Job 2.5)**

Conan verifies the rationale layer before product-layer work begins.

### Phase 2: Domain Layer — Systems and Structures

**Estimated cards:** 35-45
**Sources:** system-story.md, wizard docs, agent definitions, skill files, beadification plan

**Step 2a: Build Zones (Sam)**

Three top-level zones:

1. Zone — Configuration Engine (wizard, gap analysis, genus selection)
2. Zone — Knowledge Graph (cards, wikilinks, types, dimensions, the graph itself)
3. Zone — Agent Workbench (Conan, Sam, their jobs, the assembly/maintenance loops)

**Step 2b: Build Rooms (Sam)**

6-8 rooms nested within zones. These are the functional workspaces where distinct
activities happen.

**Step 2c: Build Systems (Sam)**

8-10 systems — the invisible mechanisms. This is the heaviest lift in the domain layer
because Alexandria has many interacting subsystems. Each system card needs rich
HOW sections drawn from the skill files.

**Step 2d: Build remaining product types (Sam)**

Components, Capabilities, Primitives, Agents, Artifacts — in build-sequence order.

**Step 2e: Grade (Conan Job 2)**

Full grading pass on all domain-layer cards. Expected issues: HOW sections may be thin
on cards describing future systems (beadification). WHEN sections will need careful
reality-vs-vision marking.

**Step 2f: Fix cycle (Sam → Conan Job 5)**

Address grading feedback. Re-grade.

### Phase 3: Experience Layer

**Estimated cards:** 10-13
**Sources:** Partially from system-story.md, partially authored from first-hand experience

**Step 3a: Build Loops (Sam)**

The four cycles: build, assembly, maintenance, evolution.

**Step 3b: Build Journeys (Sam)**

Onboarding journey, library maturation journey, Alexandria expansion journey.

**Step 3c: Build Aesthetics and Dynamics (Sam)**

This is where the most original authoring happens. Source material describes *what* the
system does but not *how it feels* or *what emergent behaviors arise*. The experience cards
need to be authored from observation of real library usage (LifeBuild) and the known
fragilities documented in the system story.

**Step 3d: Grade and fix (Conan → Sam → Conan)**

### Phase 4: Temporal Layer and Meta-Files

**Estimated cards:** 7-11

**Step 4a: Build Decision cards (Sam)**

5-8 decisions. These are important for this library specifically because the design
decisions behind Alexandria are non-obvious and frequently questioned by new
users. "Why separate Conan and Sam?" "Why five dimensions not three?" "Why typed graph
not documents?" Capturing these decisions with their rationale prevents re-litigation.

**Step 4b: Build Initiative cards (Sam)**

2-3 initiatives: Beadification, Alexandria, 1,000-user scaling.

**Step 4c: Downstream Sync (Conan Job 9)**

After the full library is built, verify that all meta-files (agent definitions, skill
procedures, retrieval profiles, templates) are consistent with the library's content.
This is especially important for the meta-library because the meta-files ARE the product
being documented.

**Step 4d: Health Check (Conan Job 8)**

Full system health check as the capstone. Produces a baseline quality score.

### Phase 5: Feedback Pipeline from Real Usage

**Not a build phase — an ongoing process.** Once the meta-library exists, it needs a
pipeline for ingesting learnings from real deployments.

**Step 5a: Define feedback signal types**

What counts as a learning worth capturing:

- **Wizard misconfiguration:** A team's wizard output led them to build the wrong things
  first. The wizard's sensitivity profiles or mode floors may need adjustment.
- **Agent play failure:** Conan missed something during assembly, or Sam produced
  consistently thin cards in a specific area. The play's procedure may need refinement.
- **Template inadequacy:** A new user's scaffolded library was missing structure that every
  implementation needs. The template needs expansion.
- **Type taxonomy friction:** A team couldn't classify something using the existing types.
  The taxonomy or guardrails may need expansion.
- **Grading rubric blind spot:** Conan's grading consistently missed a quality dimension
  that users care about. The rubric needs updating.

**Step 5b: Define ingestion flow**

External signal → temporal layer card (Decision or Initiative) → identity layer update
(if the learning changes a Standard, Principle, or Product Thesis) → downstream sync →
template system update.

The key discipline: learnings don't go directly into templates or agent definitions. They
go through the library first, get connected to the knowledge graph, and THEN propagate
to the artifacts that users see. The library is the source of truth; templates and agents
are downstream.

**Step 5c: Cadence**

- After each new team onboarding: review their wizard config and first Conan health check
  for signals
- Monthly: batch review of provenance logs across deployments
- Quarterly: full health check of the meta-library itself

---

## Part 5: What This Unlocks

### For the Template System

Today templates are static files. With the meta-library, templates become *views into the
knowledge graph*. When a card about "Standard — Card Format" gets updated with a new
learning (e.g., "WHEN sections need a 'Source of Truth' subfield for libraries in regulated
industries"), that learning can propagate to the card format template automatically — or at
least flag the template as stale.

### For Alexandria

The meta-library's Species 2 (Configuration Engine) is where genus-specific wizard
adaptations live. When we add the "zeroth question" (what is your factory printing?), the
cards documenting the wizard's axis interpretations per genus live here. The meta-library
becomes the authoritative source for "how does the wizard work for a book vs. software
vs. comms?"

### For the 1,000-User Goal

Without the meta-library, learnings from 1,000 users live in GitHub issues, support
threads, and memory. With it, each learning gets connected to the relevant cards — a
wizard misconfiguration links to the sensitivity profile cards, a grading blind spot
links to the rubric standard. Pattern recognition across learnings becomes a graph
traversal problem instead of a memory problem.

### For the Beadification/MCP Layer

The meta-library is also the *test library* for MCP tool development. When building
`cl_card`, `cl_query`, `cl_assemble`, etc., having a real library to test against
matters. And this library is always available — it lives in the same repo as the
tools being built.

---

## Status

- [x] Alexandria outline (docs/design/alexandria.md)
- [x] Plan written and reviewed
- [x] Phase 0: Location decision (confirm docs/alexandria/)
- [ ] Phase 1: Identity layer (Standards, Product Thesis, Principles)
- [ ] Phase 2: Domain layer (Zones, Rooms, Systems, Components, etc.)
- [ ] Phase 3: Experience layer (Loops, Journeys, Aesthetics, Dynamics)
- [ ] Phase 4: Temporal layer + meta-files + health check
- [ ] Phase 5: Feedback pipeline defined and operational
