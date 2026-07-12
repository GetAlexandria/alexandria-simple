# Corporate Library Index — Research Synthesis

## Purpose

This document synthesizes findings from four research veins into a candidate
knowledge area index for a corporate-level context library. It proposes:

1. The knowledge areas and their domain groupings
2. Configuration dimensions for the corporate wizard
3. The federation boundary (corporate vs. product vs. shared)
4. Design constraints from staleness research

---

## The Four-Layer Skeleton Holds

The product wizard uses five domains (Vision & Strategy, Architecture & Nouns,
Experience & Feel, Visual & Interaction, Decision History). The corporate library
maps to the same four-layer skeleton that's invariant across all Alexandria
library types, but with different vocabulary:

| Layer | Product Library | Corporate Library |
|-------|----------------|-------------------|
| **Identity** | Product vision, strategy, personas | Company mission, values, founding thesis |
| **Domain** | Architecture, nouns, entities, systems | Markets, customers, business model, org structure |
| **Experience** | Journeys, aesthetics, loops, interaction | Brand, culture, operations, stakeholder relationships |
| **Temporal** | Decisions, roadmap, institutional memory | Goals, metrics, risks, financial health, governance |

---

## Candidate Corporate Knowledge Areas

### Domain 1: Identity & Purpose (Layer: Identity)

These are the "who we are" knowledge areas. They change slowly (years) and
anchor all other decisions. Every framework surveyed includes some version of
these.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C1.1** | **Company Vision & Mission** | Why the company exists, what it aspires to become, the future state it's building toward. | No strategic anchor. Divisions optimize for local goals that don't add up to a coherent whole. | V1 (all frameworks), V2 (EOS V/TO, Scaling Up BHAG), V4 (board decks) |
| **C1.2** | **Core Values & Principles** | The behavioral standards that define "how we work here." Used as hiring/firing criteria, not wall art. | Culture is implicit and inconsistent. Each team develops its own norms. New hires learn by trial and error. | V2 (EOS, Scaling Up), V3 (Netflix deck, GitLab handbook), V4 (governance) |
| **C1.3** | **Founding Thesis & Differentiation** | Why this team, why this approach, what we know that others don't. The unfair advantage narrative. | The "why us" story fragments across pitch decks, about pages, and hallway conversations. No single coherent version. | V1 (Lean Canvas unfair advantage, Sequoia "why now"), V4 (investor narrative) |
| **C1.4** | **Value Proposition** | What we promise to customers. The core deal — what they get, why it's worth it. Must be measurable. | Product teams build features without a shared understanding of the customer promise they're serving. | V1 (all frameworks), V2 (Scaling Up brand promise) |

### Domain 2: Market & Competitive Position (Layer: Domain)

These describe the external terrain the company operates in. They change at
medium cadence (quarterly-annually) and require ongoing intelligence.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C2.1** | **Customer Segments** | Who we serve, how we segment them, which segments matter most. Includes ideal customer profiles. | Different functions target different customers. Marketing attracts people product wasn't designed for. | V1 (5/6 frameworks), V2 (EOS marketing strategy, Scaling Up core customer, VPC) |
| **C2.2** | **Market Landscape & Sizing** | TAM/SAM/SOM, industry trends, market dynamics. Where the opportunity lives. | Strategic decisions are made without grounding in market reality. Over-invest in shrinking segments. | V1 (traditional BP, pitch decks, Porter's), V4 (10-K industry section) |
| **C2.3** | **Competitive Intelligence** | Who else operates here, how we differentiate, competitive dynamics, win/loss patterns. | Builders create category-generic solutions. Sales loses deals without understanding why. | V1 (4/6 frameworks), V2 (EOS 3 uniques, Scaling Up 3 advantages), V4 (board decks, 10-K) |
| **C2.4** | **Regulatory & Compliance Landscape** | What rules apply, what's changing, what constrains our options. Industry-specific. | Compliance surprises delay launches. Regulatory changes blindside the company. | V1 (traditional BP, Porter's barriers), V4 (10-K risk factors, governance) |

### Domain 3: Business Model & Economics (Layer: Domain)

These describe how the company creates and captures value. Financial health
knowledge with zero staleness tolerance lives here.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C3.1** | **Revenue Model & Pricing** | How we make money. Pricing structure, revenue streams, unit economics. The economic engine. | Pricing decisions are ad hoc. Revenue forecasting is unreliable. Nobody can explain the full economic model. | V1 (5/6 frameworks), V2 (Scaling Up Profit per X, Cash chapter), V4 (investor metrics) |
| **C3.2** | **Cost Structure & Efficiency** | What we spend, fixed vs. variable, where money goes, efficiency metrics (burn multiple, CAC payback). | Growth outpaces financial discipline. Cash surprises. Can't answer "how efficient are we?" | V1 (Lean Canvas, BMC, traditional BP), V2 (Scaling Up Cash), V4 (10-K, board decks) |
| **C3.3** | **Financial Health & Runway** | Cash position, burn rate, runway, P&L trends, budget vs. actuals. The existential numbers. | The most dangerous kind of missing knowledge — existential risk that isn't tracked at the right cadence. | V2 (all frameworks), V4 (zero staleness tolerance — monthly refresh) |
| **C3.4** | **Partnerships & Ecosystem** | Key partnerships, vendor dependencies, ecosystem strategy, platform relationships. | Strategic dependencies are invisible. A key vendor change blindsides the company. | V1 (BMC key partnerships), V2 (Scaling Up), V4 (10-K contractual obligations) |

### Domain 4: People & Organization (Layer: Experience)

These describe the human side of the company — who does what, how we work
together, how the organization is structured.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C4.1** | **Organizational Structure & Accountability** | Who owns what function. How accountability flows. The structure the business needs (not just who happens to be there). | Accountability gaps. Two people think the other one owns something. Functions fall through cracks during growth. | V2 (EOS accountability chart, Scaling Up FACe/PACe), V4 (board governance) |
| **C4.2** | **Talent & People Health** | Key person dependencies, succession depth, hiring pipeline, attrition, culture health signals. | Key person leaves and a function collapses. Culture problems are invisible until they become crises. | V2 (EOS people analyzer, Scaling Up A-player profiles), V3 (onboarding), V4 (board comp committee) |
| **C4.3** | **Brand, Culture & Operating Norms** | How we communicate, how decisions get made, what meetings look like, how information flows. The lived operating system. | The handbook says one thing; reality is another. Remote and in-person teams develop incompatible norms. | V3 (GitLab handbook, Netflix deck, Basecamp), V2 (EOS process, Scaling Up meeting rhythm) |

### Domain 5: Strategy & Execution (Layer: Temporal)

These are time-bound knowledge areas that track the company's movement through
time. They require the highest refresh cadence.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C5.1** | **Strategic Priorities & Goals** | What matters most right now. Annual goals, quarterly priorities (Rocks/OKRs), critical numbers. Multi-horizon. | Everyone is busy, nobody is aligned. Effort is distributed across too many fronts. No shared definition of "winning this quarter." | V2 (all frameworks — EOS Rocks, Scaling Up OPSP, OKRs), V4 (board strategic discussion) |
| **C5.2** | **Metrics & Scorecard** | The 5-15 numbers that tell you how the business is doing. Each with an owner, a target, and a trend. Leading indicators, not just trailing. | Managing by feelings, not facts. Problems visible in metrics 6 weeks before they hit revenue are missed. | V2 (EOS scorecard, Scaling Up critical number, OKR key results), V4 (investor KPIs) |
| **C5.3** | **Risk Register** | What could go wrong, likelihood, impact, mitigation status. Operational, financial, market, regulatory, technology. | Internal teams fight fires but never enumerate all known risks. A preventable risk becomes a crisis. | V1 (Sahlman, SWOT threats), V4 (10-K risk factors, board audit committee) |
| **C5.4** | **Product & Technology Posture** | High-level view of what's shipped, what's planned, technical health (debt, architecture bets). Not the product library — the board-deck version. | Leadership can't connect product decisions to business strategy. Tech debt is invisible to non-engineers. | V2 (Scaling Up execution), V4 (board product update) |
| **C5.5** | **Go-to-Market & Growth** | How we acquire customers, channels, sales pipeline, marketing effectiveness, distribution strategy. | Growth efforts are disconnected from strategy. Marketing and sales optimize for different targets. | V1 (traditional BP, Lean Canvas channels), V2 (Scaling Up), V4 (board GTM update) |

### Domain 6: Governance & Institutional Memory (Layer: Temporal)

These are the knowledge areas that keep the company coherent over time and
accountable to external stakeholders.

| ID | Name | Description | When Missing | Source Veins |
|----|------|-------------|-------------|-------------|
| **C6.1** | **Key Decisions & Rationale** | What was decided, when, by whom, and why. Especially: what was rejected and why. | Settled decisions get relitigated. Past mistakes get repeated. New leaders reverse decisions without understanding the original reasoning. | V1 (absent from all — identified as gap), V3 (Nonaka externalization), V4 (board minutes) |
| **C6.2** | **Institutional Memory & Lessons** | What we've learned. Failed approaches, postmortems, pivots, the history that explains the present. | The most expensive failure: months rediscovering that an approach doesn't work. Organizational amnesia after key departures. | V3 (KM literature, after-action reviews), V4 (10-K MD&A "why did this change") |
| **C6.3** | **Governance & Decision Authority** | Board structure, committee charters, delegation of authority, stakeholder communication frameworks. Who decides what. | Decision-making bottlenecks. Unclear authority leads to either paralysis or rogue decisions. | V4 (board governance, committee structure, 10-K Part III) |
| **C6.4** | **Capital & Investor Relations** | Fundraising status, investor relationships, cap table, runway scenarios, external communication narrative. | Fundraising catches the company flat-footed. Investor narrative is inconsistent across conversations. | V1 (pitch decks, traditional BP funding request), V4 (investor updates, board decks) |

---

## Summary: 24 Corporate Knowledge Areas in 6 Domains

| Domain | Areas | Count |
|--------|-------|-------|
| 1. Identity & Purpose | Vision & Mission, Core Values, Founding Thesis, Value Proposition | 4 |
| 2. Market & Competitive Position | Customer Segments, Market Landscape, Competitive Intelligence, Regulatory Landscape | 4 |
| 3. Business Model & Economics | Revenue Model, Cost Structure, Financial Health, Partnerships & Ecosystem | 4 |
| 4. People & Organization | Org Structure & Accountability, Talent & People Health, Brand/Culture/Operating Norms | 3 |
| 5. Strategy & Execution | Strategic Priorities, Metrics & Scorecard, Risk Register, Product & Tech Posture, GTM & Growth | 5 |
| 6. Governance & Institutional Memory | Key Decisions, Institutional Memory, Governance & Decision Authority, Capital & Investor Relations | 4 |
| **Total** | | **24** |

Note: 24 areas, close to the product library's 22. This feels right — enough
granularity to be useful, not so much that it becomes overhead.

---

## Configuration Dimensions

The product wizard uses three dimensions: AI Mode (prescriptive), Domain Novelty
(advisory), Product Complexity (advisory). The corporate wizard needs different
dimensions that determine which of the 24 areas are active and how deep each
needs to be.

### Dimension 1: Organizational Complexity (Prescriptive)

*Analogous to AI Mode — this is the primary driver that determines the
knowledge pool ceiling.*

This is the stakeholder power law. It determines how many knowledge areas are
active and how much coordination overhead the library must carry.

| Level | Label | Characteristics | Pool Size |
|-------|-------|----------------|-----------|
| **Solo/Founding** | Napkin | 1-5 people. No formal structure. Everything in the founder's head. | ~8-10 |
| **Small Team** | Whiteboard | 5-25 people. Shared context, informal coordination. First explicit roles. | ~14-16 |
| **Departments** | Playbook | 25-100 people. Functional teams. First middle management. Information loss across groups. | ~18-20 |
| **Divisions** | Operating System | 100-500 people. Managers managing managers. First federation. Multiple strategies coexist. | ~22-24 |
| **Enterprise** | Institution | 500+ people. Full governance. Multi-market, multi-product. Network of networks. | 24 (full pool) |

**Why this is prescriptive:** Getting this wrong structurally changes what the
library needs to do. A solo founder maintaining 24 knowledge areas would drown
in overhead. An enterprise maintaining 10 would have critical blind spots.

### Dimension 2: Functional Breadth (Advisory)

*Analogous to Domain Novelty — determines which knowledge areas are most
important within the active pool.*

What functions does the company operate? This determines which knowledge areas
carry the most weight.

| Level | Label | Characteristics |
|-------|-------|----------------|
| **Single-function** | Focused | Pure product company, pure services firm, pure research org. Most knowledge lives in one downstream library. Corporate layer is thin. |
| **Multi-function** | Integrated | Product + GTM + Ops. The corporate library needs to carry shared context that connects all functions. |
| **Full-stack** | Conglomerate | Multiple product lines, multiple markets, internal services. Corporate library is heavy — it's the connective tissue. |

**What it affects:** At Single-function, GTM & Growth (C5.5) might be
deprioritized. At Full-stack, every area is load-bearing because every area
has multiple downstream consumers.

### Dimension 3: Governance Exposure (Advisory)

*Analogous to Product Complexity — determines the fidelity and freshness
requirements.*

Who's asking? External accountability forces certain knowledge areas to stay
fresh at higher fidelity.

| Level | Label | Characteristics |
|-------|-------|----------------|
| **None** | Self-accountable | No board, no investors, no external reporting obligations. Freshness is self-imposed. |
| **Advisory** | Light accountability | Advisory board or angels. Informal reporting. Some external pressure to maintain strategy and financial knowledge. |
| **Board** | Formal accountability | Formal board with fiduciary duties. Quarterly board decks. Monthly investor updates. Significant freshness requirements. |
| **Public/Regulated** | Maximum accountability | SEC reporting, regulatory compliance, audit committees. Zero staleness tolerance on financial and risk knowledge. |

**What it affects:** At None, the Governance domain (C6.x) is mostly
deprioritized. At Public/Regulated, Governance is Foundation and drives the
freshness cadence for everything else.

---

## Pool Mechanics (How Areas Enter by Complexity Level)

Modeling after the product wizard's pool structure:

### Napkin (Solo/Founding) — Pool: ~10 areas

```
C1.1  Company Vision & Mission        (Identity)
C1.3  Founding Thesis & Differentiation (Identity)
C1.4  Value Proposition                (Identity)
C2.1  Customer Segments                (Market)
C2.3  Competitive Intelligence         (Market)
C3.1  Revenue Model & Pricing          (Economics)
C3.3  Financial Health & Runway        (Economics)
C5.1  Strategic Priorities & Goals     (Execution)
C5.2  Metrics & Scorecard              (Execution)
C6.1  Key Decisions & Rationale        (Memory)
```

This is the "living business plan" — the minimum viable corporate knowledge.

### Whiteboard (Small Team) — Adds ~5 areas

```
+ C1.2  Core Values & Principles        (Identity)
+ C2.2  Market Landscape & Sizing        (Market)
+ C4.1  Org Structure & Accountability   (People)
+ C5.5  Go-to-Market & Growth            (Execution)
+ C6.2  Institutional Memory & Lessons   (Memory)
```

Values become necessary when hiring beyond founders. Accountability becomes
necessary when not everyone is in the same room.

### Playbook (Departments) — Adds ~4 areas

```
+ C3.2  Cost Structure & Efficiency      (Economics)
+ C4.2  Talent & People Health           (People)
+ C4.3  Brand, Culture & Operating Norms (People)
+ C5.3  Risk Register                    (Execution)
```

Culture documentation becomes necessary when the founder can't personally
onboard everyone. Risk enumeration becomes necessary when the blast radius
of decisions grows.

### Operating System (Divisions) — Adds ~3 areas

```
+ C3.4  Partnerships & Ecosystem         (Economics)
+ C5.4  Product & Technology Posture     (Execution)
+ C6.3  Governance & Decision Authority  (Memory)
```

Governance becomes necessary when divisions need explicit authority boundaries.
Product posture enters because leadership needs a board-deck view of technology.

### Institution (Enterprise) — Adds ~2 areas (full pool)

```
+ C2.4  Regulatory & Compliance Landscape (Market)
+ C6.4  Capital & Investor Relations      (Memory)
```

Full governance, full compliance, full reporting.

---

## Foundation Areas by Complexity Level

| Level | Foundation Areas |
|-------|-----------------|
| Napkin | C1.1 (Vision), C1.4 (Value Prop), C3.3 (Financial Health) |
| Whiteboard | C1.1 (Vision), C1.2 (Values), C1.4 (Value Prop), C4.1 (Accountability) |
| Playbook | C1.1 (Vision), C1.2 (Values), C4.1 (Accountability), C5.1 (Strategic Priorities) |
| Operating System | C1.1 (Vision), C1.2 (Values), C4.1 (Accountability), C5.1 (Strategic Priorities), C6.3 (Governance) |
| Institution | C1.1 (Vision), C1.2 (Values), C4.1 (Accountability), C5.1 (Strategic Priorities), C5.2 (Scorecard), C6.3 (Governance) |

---

## The Federation Boundary

### What Lifts OUT of the Product Library

These areas currently in the product library are corporate-level concerns:

| Current Product Area | Corporate Equivalent | Action |
|---------------------|---------------------|--------|
| Competitive Analysis (1.4) | C2.3 Competitive Intelligence | **Lift to corporate.** Product library inherits competitive context. |
| Market Requirements (1.5) | C2.2 Market Landscape | **Lift to corporate.** Market evidence is a company concern, not a product concern. |
| Product Strategy (1.2) — partial | C5.1 Strategic Priorities — partial | **Split.** Product strategy stays in product library. Company strategy lifts to corporate. |
| Key Decisions Log (5.1) — some | C6.1 Key Decisions — some | **Split.** Product decisions stay. Company-level decisions (pricing, market entry, partnerships) lift to corporate. |
| Institutional Memory (5.2+5.4) — some | C6.2 Institutional Memory — some | **Split.** Product lessons stay. Company-level lessons lift. |
| Roadmap (5.3) — partial | C5.4 Product & Tech Posture | **Split.** Detailed roadmap stays in product. Board-level posture goes to corporate. |

### What Stays in the Product Library

Everything about how the software works:

- Product Vision (narrowed to product scope, inherits company vision)
- Architecture, Nouns, Entities, System Design, GDD/PRD
- User Journey Maps, Emotional Goals, Engagement Loops, Progression
- Anti-Patterns, Design System, Interaction Patterns, Prototypes, Accessibility
- Product-level decisions and lessons

### What's Shared (Inherited)

The product library inherits from corporate but doesn't duplicate:

- **Company Vision → Product Vision**: Product vision is a concrete expression
  of company vision in software form.
- **Customer Segments → User Personas**: Product personas are the software-user
  subset of corporate customer segments.
- **Core Values → Anti-Patterns**: Product anti-patterns often encode company
  values in design terms.
- **Strategic Priorities → Roadmap**: Product roadmap serves company strategy.

---

## Freshness Cadences (from Governance Research)

The corporate library should encode expected refresh cadence per area:

| Cadence | Areas | Forcing Mechanism |
|---------|-------|-------------------|
| **Monthly** | C3.3 Financial Health, C5.2 Metrics & Scorecard | Cash position is existential. Metrics drive decisions. |
| **Quarterly** | C5.1 Strategic Priorities, C5.3 Risk Register, C2.3 Competitive Intelligence, C4.2 Talent Health, C5.5 GTM & Growth, C5.4 Product Posture | Board-meeting cadence. These are board deck sections. |
| **Annually** | C1.1 Vision, C1.2 Values, C1.4 Value Proposition, C2.2 Market Landscape, C2.4 Regulatory, C3.1 Revenue Model, C6.3 Governance | Identity knowledge. Changes slowly. Annual strategic planning. |
| **Event-driven** | C1.3 Founding Thesis (fundraising), C3.4 Partnerships (deal events), C6.4 Capital & IR (fundraising), C6.1 Key Decisions (as they happen) | Triggered by business events, not calendar. |

---

## Design Constraints from Staleness Research (Vein 3)

The corporate library must be built with these structural principles:

1. **Board-deck fidelity, not wiki fidelity.** Knowledge should be synthesized,
   prioritized, and coherent — the governance version, not the messy internal
   version. The governance version stays fresh because someone external asks
   for it.

2. **Ownership at the area level.** Every knowledge area has a DRI. Ownership
   transfers when people change roles. Orphaned knowledge is detected.

3. **Staleness is visible.** Freshness scores per area. Last-reviewed dates.
   Areas that fall below their expected cadence are flagged.

4. **Knowledge connects to the events that change it.** A funding round triggers
   review of C6.4 (Capital), C3.3 (Financial Health), and C1.3 (Founding
   Thesis). A reorg triggers review of C4.1 (Org Structure) and C4.2 (Talent
   Health).

5. **Normative and descriptive knowledge have different lifecycles.** Values
   (C1.2) and anti-patterns are normative — they correct drift. Org structure
   (C4.1) and financials (C3.3) are descriptive — they must track reality.

6. **The "always required" core exists at every level.** Even the thinnest
   corporate library (Napkin) needs: vision, value proposition, customers,
   revenue model, financial health, metrics, and decisions.

---

## Open Questions for Wizard Design

1. **Sensitivity profiles**: How do Functional Breadth and Governance Exposure
   interact to shift tiers? Need to build the equivalent of the product
   wizard's novelty/complexity sensitivity profiles.

2. **Disambiguation questions**: What's the corporate equivalent of the
   complexity checklist? Probably governance signals (board? investors?
   compliance requirements?) and functional breadth signals (how many
   departments report to a C-suite?).

3. **Mode narratives**: What's the "risk story" at each complexity level?
   - Napkin: "Knowledge lives in the founder's head. If they get hit by a bus,
     the company loses its memory."
   - Whiteboard: "The team thinks they agree on strategy. They don't, and
     they won't discover the disagreement until it's expensive."
   - Playbook: "Information degrades as it crosses team boundaries. Each
     department develops its own version of the truth."
   - Operating System: "Divisions optimize locally. Nobody sees whether the
     pieces add up to a coherent whole."
   - Institution: "Governance gaps become compliance risks. Institutional
     knowledge is concentrated in a few heads."

4. **AI Mode interaction**: The product wizard's AI Mode still applies to
   product libraries. But the corporate library doesn't have an AI Mode in the
   same sense — it's consumed by humans AND AI agents. Should the corporate
   wizard ask about AI consumption patterns?

5. **Multi-product handling**: When a company has multiple products, each with
   its own product library, the corporate library's C5.4 (Product & Tech
   Posture) needs to be an aggregate view. How does this work mechanically?
