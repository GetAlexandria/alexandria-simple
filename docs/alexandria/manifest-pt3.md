# Zone Inventory Supplement: Part 3 (Roadmap, Competitive, Market)

Source: `sources/roadmap.md`, `sources/competitive-analysis.md`, `sources/market-requirements.md`

Date: 2026-03-24

Configuration: Factory × High Novelty × High Complexity
Covered areas: 5.3 Roadmap, 1.4 Competitive Analysis, 1.5 Market Requirements
These three areas were previously deferred in the primary manifest pending solicitation.

---

## Expected Cards

### Product Theses (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Product Thesis - The Bottleneck Is Context, Not Model Capability | sources/market-requirements.md §Core Thesis Under Test; sources/competitive-analysis.md §Theory 3 | Missing | Market-level bet: the gap for agent autonomy is structured context, not model capability. Distinct from the existing "Product Thesis - Better Context Produces Better Agent Output" (product mechanic) because this is about the market landscape — models could get good enough to make context wrangling unnecessary (the prompt engineering analogy). One could validate without the other. |

### Principles (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Principle - Show, Don't Tell for Category Creation | sources/roadmap.md §The Demo; sources/market-requirements.md §Non-Obvious, §Blank Stares, §Not Socializing | Missing | Rule of thumb: non-obvious products require demonstration, not explanation. Governs go-to-market timing and marketing approach. "Nobody is angry about not having a context library yet" — category awareness must come through demonstration. |
| Principle - Nail One Factory Before Expanding | sources/roadmap.md §What Would Change This; sources/competitive-analysis.md §Our Position | Missing | Rule of thumb: prove deep value on one platform before integrating with others. "Nail Claude Code first, expand later." Governs integration priorities and factory-of-record decisions. Trades off against breadth — relevant when tempted to add factory integrations. |

### Artifacts — Roadmap (5)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Product Roadmap | sources/roadmap.md (full file) | Missing | Content object: the master roadmap with 4-tier priority structure (Required to Ship → Extremely Important → Core QoL Backlog → Design Don't Build Yet), plus Project Infrastructure. Encodes sequencing logic and "what would change this" reversal conditions. Consulted during prioritization decisions. |
| Artifact - Roadmap: Beadification and MCP Compatibility | sources/roadmap.md §2. Beadification | Missing | Content object: the most detailed Required-to-Ship item. MCP compatibility + data model cleanup as same effort. Captures "moving target" concern about MCP landscape and need for landscape monitoring. Cross-references `docs/design/beadification-plan.md`. |
| Artifact - Roadmap: The Demo (15-Minute Library) | sources/roadmap.md §3. The Demo | Missing | Content object: category-creating demonstration artifact. Take a real open-source project, run wizard, show before/after. "Primary adoption artifact." Cross-references Principle - Show, Don't Tell for Category Creation. |
| Artifact - Roadmap: Cold Start Reduction | sources/roadmap.md §4. Cold Start Reduction | Missing | Content object: two approaches to closing the interest-to-value gap. Scan-and-seed agent (zero human input → draft library) and template libraries by domain (customize, don't create). Both feed the exemplar strategy. Cross-references Artifact - Roadmap: Exemplar Library Registry. |
| Artifact - Roadmap: Exemplar Library Registry | sources/roadmap.md §7. Exemplar Library Registry | Missing | Content object: registry of example library builds for borrowing, pre-population, editing-not-writing. Includes bootstrapping method (study + factory jobs → manufactured exemplars → community contributions) and distribution model (Markdown files, browsable catalog, CLI-installable). |

### Artifacts — Competitive (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Competitive Landscape: Three Theories of Agent Autonomy | sources/competitive-analysis.md §The Real Competition + §Theory 1-3 + §Adjacent Tools | Missing | Content object: analytical framework of three competing theories (Unleash, Built-in Model Features, Context-First Autonomy). Each theory has strengths, failure modes, and our counter-position. Adjacent tools section clarifies what overlaps but doesn't compete. |
| Artifact - Colleague Stack Requirements | sources/competitive-analysis.md §What Makes a Colleague, Not a Parrot | Missing | Content object: five-layer requirement stack for AI that feels like a colleague (context library + interface + independent memory + output capabilities + visual/spatial layer). Captures necessary vs. sufficient distinction and identifies the "killer app" layer. |

### Artifacts — Market (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Market Evidence: Five Pre-Launch Signals | sources/market-requirements.md §What We've Observed (Signals 1-5) | Missing | Content object: the only empirical observations about whether the product thesis holds. Five signals (compounding context, emergent coworker, gap briefing forcing function, 115% blog post, visual/prototype gap). Each includes epistemic caveats. Pre-launch, qualitative only. |
| Artifact - Market Landscape Assessment | sources/market-requirements.md §What the Market Looks Like + §Core Thesis Under Test + §Prompt Engineering Analogy | Missing | Content object: three audience segments (AI-savvy developers → non-obvious; senior developers → want to see it; non-AI → blank stares), the core thesis for/against evidence, and the prompt engineering analogy as strongest counter-signal. 30-month market readiness estimate. |

---

## Cross-References to Primary Manifest

| New Card | Links To (Primary Manifest) | Relationship |
|----------|----------------------------|-------------|
| Product Thesis - The Bottleneck Is Context, Not Model Capability | Product Thesis - Better Context Produces Better Agent Output | Market-level parent thesis; "Better Context" is the product-level implementation of this market bet |
| Product Thesis - The Bottleneck Is Context, Not Model Capability | Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward | Design bet that implements the market thesis through AI-native structure |
| Artifact - Roadmap: Beadification and MCP Compatibility | Artifact - Decision 22: Beads as AI-Native Knowledge Unit | Beadification is the roadmap item that implements Decision 22's design direction |
| Artifact - Roadmap: Beadification and MCP Compatibility | Artifact - Decision 23: Retrieval Profiles Over Free-Form Assembly | Retrieval profiles are part of the beadification roadmap |
| Artifact - Roadmap: Beadification and MCP Compatibility | System - Retrieval and Assembly Engine | Target system that beadification produces |
| Artifact - Roadmap: Cold Start Reduction | System - Wizard Configuration Engine | Cold start addresses wizard's upfront conversation cost |
| Artifact - Roadmap: Cold Start Reduction | Journey - Library Genesis to Steady-State | Cold start reduction shortens the Genesis phase |
| Artifact - Roadmap: The Demo | Principle - Show, Don't Tell for Category Creation | The demo IS the principle in action |
| Artifact - Competitive Landscape | Product Thesis - Better Context Produces Better Agent Output | Our Theory 3 is built on this thesis |
| Artifact - Market Evidence: Five Pre-Launch Signals | Product Thesis - Better Context Produces Better Agent Output | Signals 1-4 are evidence for/against this thesis |
| Artifact - Market Landscape Assessment | Artifact - Persona: The Solo Builder | Solo Builder maps to "AI-savvy developer" segment |
| Artifact - Market Landscape Assessment | Artifact - Persona: The Product Owner (Small Team) | Product Owner maps to "senior developer" segment |
| Artifact - Colleague Stack Requirements | System - Retrieval and Assembly Engine | Assembly engine is one layer of the colleague stack |
| Artifact - Colleague Stack Requirements | Agent - Bridget the Briefer | Bridget implements the "interface" and "output" layers |
| Principle - Nail One Factory Before Expanding | Artifact - Decision 27: Build to Learn, Not Build to Ship | Same epistemic caution applied to factory integration |
| Artifact - Product Roadmap | Journey - Library Genesis to Steady-State | Roadmap describes what comes after steady-state |

---

## Enumeration Decisions

| Entity | Types Found | Decision | Rationale |
|--------|-------------|----------|-----------|
| Roadmap items (18 items across 5 tiers) | 18 discrete items of varying depth | **1 master card + 4 individual cards** | The master Artifact - Product Roadmap captures the tier structure and "what would change this" conditions. Four items get individual cards because they have sufficient depth AND distinct retrieval value: Beadification (most detailed, cross-refs to beadification plan), The Demo (pivotal adoption artifact), Cold Start Reduction (two concrete approaches), Exemplar Registry (detailed bootstrapping plan). Remaining items are captured in the master card. |
| Market signals (5 signals) | 5 numbered observations with epistemic caveats | **One card** | All five are pre-launch observations from the same evidence base (product owner + handful of conversations). They'd always be retrieved together. A single card with all five and their caveats is more useful than 5 thin individual cards. |
| Competitive theories (3 theories) | 3 named approaches with strengths/weaknesses | **One card** | The three theories are a framework — they derive meaning from comparison. Retrieving one theory without the others loses the competitive context. One card with all three preserves the analytical structure. |
| Colleague stack layers (5 layers) | 5 requirements from necessary to visionary | **One card** | The layers form a stack — each builds on the previous. Splitting them would fragment a dependency chain. One card preserves the stack logic. |

---

## Build Order

Build in this sequence (rationale layer first, then product layer):

### Phase 1: Product Thesis

| Order | Card | Rationale |
|-------|------|-----------|
| 1.1 | Product Thesis - The Bottleneck Is Context, Not Model Capability | Market-level thesis that the two new Principles derive from. Must exist before Principles can link to it in WHY. |

### Phase 2: Principles

| Order | Card | Rationale |
|-------|------|-----------|
| 2.1 | Principle - Show, Don't Tell for Category Creation | Governs the demo roadmap item and all go-to-market decisions. Referenced by Artifact - Roadmap: The Demo. |
| 2.2 | Principle - Nail One Factory Before Expanding | Governs factory-of-record decisions and integration roadmap. Referenced by Artifact - Product Roadmap. |

### Phase 3: Artifacts — Competitive and Market (context for roadmap)

| Order | Card | Rationale |
|-------|------|-----------|
| 3.1 | Artifact - Competitive Landscape: Three Theories of Agent Autonomy | Establishes the competitive context that the roadmap responds to. |
| 3.2 | Artifact - Colleague Stack Requirements | Establishes what the full vision requires — roadmap items map to stack layers. |
| 3.3 | Artifact - Market Evidence: Five Pre-Launch Signals | Evidence base for the Product Thesis. Roadmap priorities are informed by these signals. |
| 3.4 | Artifact - Market Landscape Assessment | Market readiness context that shapes roadmap sequencing. |

### Phase 4: Artifacts — Roadmap

| Order | Card | Rationale |
|-------|------|-----------|
| 4.1 | Artifact - Product Roadmap | Master roadmap. Build after competitive/market context cards exist so links resolve. |
| 4.2 | Artifact - Roadmap: Beadification and MCP Compatibility | Most critical required-to-ship item. |
| 4.3 | Artifact - Roadmap: The Demo (15-Minute Library) | Links to Principle - Show, Don't Tell. |
| 4.4 | Artifact - Roadmap: Cold Start Reduction | Links to Exemplar Registry. |
| 4.5 | Artifact - Roadmap: Exemplar Library Registry | Build after Cold Start (referenced by it). |

---

## Summary

| Category | Count |
|----------|-------|
| Product Theses | 1 |
| Principles | 2 |
| Artifacts (Roadmap) | 5 |
| Artifacts (Competitive) | 2 |
| Artifacts (Market) | 2 |

**Expected Total: 12 cards**

**Existing: 0 (0%)**

**Missing: 12**

---

## Flags

### DESIGN_PROPOSED / PRE_VALIDATION

All 12 cards in this supplement carry epistemic caveats from their source material:

- **Product Thesis** — explicitly "under test" with zero external validation
- **Principles** — derived from pre-launch observations, not proven patterns
- **Roadmap Artifacts** — pre-PMF directional, contingent on market validation
- **Competitive Artifacts** — competitive landscape is speculative (pre-launch, two deployed libraries)
- **Market Artifacts** — "pre-launch, qualitative only" evidence status

Cards must preserve the honest hedging from source material. Do not present hypotheses as validated patterns. Use WHEN sections to mark temporal contingency.

### Cross-References to Primary Manifest

The 12 new cards must link to 16+ existing cards from the primary manifest (see Cross-References table above). Sam must create these links during build and add backlinks to existing cards where appropriate.

---

## Completion Status

**DONE**

Three previously deferred knowledge areas (5.3, 1.4, 1.5) now have source material and inventory. This closes the "deferred pending source material" flag from the primary manifest for these three areas. Remaining deferred areas: none (3.3, 3.4, 4.3 were covered in the primary manifest addendum).
