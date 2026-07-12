# Research Vein 1: Business Planning Frameworks — Recurring Knowledge Areas

**Purpose:** Identify the knowledge areas that business planning frameworks
maintain, to inform the design of a wizard configuration engine for
corporate-level context libraries.

**Method:** Analysis of six categories of business planning frameworks, drawing
on published templates and widely-cited canonical sources.

---

## 1. Traditional Business Plan (SBA / HBS Template)

### Source

The U.S. Small Business Administration (SBA) publishes a standard business plan
outline. Harvard Business School's entrepreneurship curriculum uses a similar
but more academically rigorous version (William Sahlman's "How to Write a Great
Business Plan," HBR 1997, remains canonical).

### Sections

| # | Section | What It Covers |
|---|---------|---------------|
| 1 | **Executive Summary** | Mission statement, product/service overview, leadership team, financial highlights, growth plans. Written last, summarizes everything. |
| 2 | **Company Description** | Legal structure, history, mission/vision, objectives, what differentiates the company, which markets it serves. |
| 3 | **Market Analysis** | Industry overview, target market segmentation, market size (TAM/SAM/SOM), trends, regulatory environment, competitive landscape. |
| 4 | **Organization & Management** | Org chart, ownership structure, management team bios, board of directors/advisors, hiring plan. |
| 5 | **Products & Services** | Description of offerings, lifecycle stage, IP/patents, R&D activities, competitive advantages. |
| 6 | **Marketing & Sales Strategy** | Pricing strategy, sales process, distribution channels, advertising plan, customer acquisition strategy, brand positioning. |
| 7 | **Funding Request** | Current funding requirements, future funding needs, how funds will be used, desired terms. |
| 8 | **Financial Projections** | Income statements (3-5 yr), balance sheets, cash flow statements, break-even analysis, key assumptions. |
| 9 | **Appendix** | Resumes, permits, leases, legal documents, product images, supporting data. |

### HBS Additions (Sahlman Framework)

Sahlman's framework reorganizes into four pillars:
- **People** — Who is on the team, what are their track records
- **Opportunity** — What is the business, who is the customer, can it grow
- **Context** — Macro environment, regulation, interest rates, technology trends
- **Risk & Reward** — What can go wrong, what are the returns, what are the milestones

### Always Present vs. Conditional

- **Always present:** Executive Summary, Company Description, Market Analysis, Products/Services, Financial Projections
- **Conditional on stage:** Funding Request (only if raising), Appendix (varies by audience)
- **Conditional on type:** Marketing & Sales section is thin for pre-product startups; Organization section is thin for solo founders

### Notably Absent

- No explicit section for **culture, values, or operating principles**
- No section for **technology architecture** or **technical decisions**
- No section for **customer feedback loops** or **product iteration process**
- No section for **partnerships and ecosystem** (sometimes folded into marketing)
- No section for **risk register** (Sahlman addresses this; SBA template does not)

---

## 2. Lean Canvas (Ash Maurya, 2010)

### Source

Ash Maurya's "Running Lean" (2010, updated 2012). Adaptation of Business Model
Canvas for startups. Single-page format, nine blocks.

### Sections (Nine Blocks)

| # | Block | What It Covers |
|---|-------|---------------|
| 1 | **Problem** | Top 3 problems the target customer has. Existing alternatives. |
| 2 | **Customer Segments** | Who has the problem. Early adopters specifically identified. |
| 3 | **Unique Value Proposition** | Single, clear, compelling message that states why you are different and worth attention. High-level concept (e.g., "YouTube for X"). |
| 4 | **Solution** | Top 3 features that address the top 3 problems. Kept intentionally minimal. |
| 5 | **Channels** | Path to customers — inbound, outbound, direct, indirect. |
| 6 | **Revenue Streams** | Revenue model, pricing, lifetime value, gross margin targets. |
| 7 | **Cost Structure** | Customer acquisition costs, hosting, people, fixed/variable cost breakdown. |
| 8 | **Key Metrics** | The one metric that matters now. Pirate metrics (AARRR): Acquisition, Activation, Retention, Revenue, Referral. |
| 9 | **Unfair Advantage** | Something that cannot be easily copied or bought — community, network effects, IP, team, existing customers. |

### Always Present vs. Conditional

- **Always present:** All nine blocks are expected for any startup, though answers vary in depth.
- **Conditional:** The canvas is inherently startup-oriented. Mature companies find "Problem" and "Unfair Advantage" less natural. Multi-product companies need one canvas per product line.

### Notably Absent

- No **team/people** block (deliberate omission — Maurya focuses on the business model, not the org)
- No **financial projections** beyond revenue/cost structure
- No **timeline or milestones**
- No **operational processes** or how the company actually delivers
- No **market sizing** (TAM/SAM/SOM)
- No **regulatory/legal** context

---

## 3. Business Model Canvas (Osterwalder & Pigneur, 2010)

### Source

Alexander Osterwalder & Yves Pigneur, "Business Model Generation" (2010).
Strategyzer is the commercial platform. Nine blocks, single-page format.

### Sections (Nine Blocks)

| # | Block | What It Covers |
|---|-------|---------------|
| 1 | **Customer Segments** | Who the company creates value for. Mass market, niche, segmented, diversified, multi-sided platforms. |
| 2 | **Value Propositions** | What value is delivered. Newness, performance, customization, design, brand/status, price, cost reduction, risk reduction, accessibility, convenience. |
| 3 | **Channels** | How value propositions are delivered. Awareness, evaluation, purchase, delivery, after-sales. Five channel phases. |
| 4 | **Customer Relationships** | Type of relationship: personal assistance, self-service, automated, communities, co-creation. |
| 5 | **Revenue Streams** | Asset sale, usage fee, subscription, lending/renting/leasing, licensing, brokerage, advertising. Pricing mechanisms (fixed vs. dynamic). |
| 6 | **Key Resources** | Physical, intellectual, human, financial assets required. |
| 7 | **Key Activities** | Production, problem solving, platform/network management. The most important things the company must do. |
| 8 | **Key Partnerships** | Strategic alliances, coopetition, joint ventures, buyer-supplier relationships. Motivations: optimization, risk reduction, resource acquisition. |
| 9 | **Cost Structure** | Cost-driven vs. value-driven. Fixed costs, variable costs, economies of scale, economies of scope. |

### Always Present vs. Conditional

- **Always present:** All nine blocks apply to any organization, from a one-person freelancer to a multinational. The canvas is intentionally universal.
- **Conditional:** Multi-sided platforms need separate Customer Segments and Value Propositions per side. Nonprofits adapt Revenue Streams to include grants/donations.

### Notably Absent

- No **competition/market analysis** — the canvas describes YOUR model, not the landscape
- No **team composition** or organizational structure
- No **mission/vision/values**
- No **financial projections** or timeline
- No **product roadmap** or technology stack
- No **regulatory environment**

---

## 4. Pitch Deck Conventions (Sequoia / YC Templates)

### Sequoia Capital Template

| # | Slide | What It Covers |
|---|-------|---------------|
| 1 | **Company Purpose** | One sentence defining the company. |
| 2 | **Problem** | Describe the pain point. Who has it. |
| 3 | **Solution** | How you fix it. Demo if possible. |
| 4 | **Why Now** | What has changed in the world to make this possible/necessary now. Market timing. |
| 5 | **Market Size** | TAM, SAM, SOM. Bottom-up analysis preferred. |
| 6 | **Product** | How it works. Architecture if relevant. Screenshots/demo. |
| 7 | **Business Model** | Revenue model, pricing, unit economics. |
| 8 | **Competition** | Competitive landscape. Differentiation matrix. |
| 9 | **Team** | Founders, key hires, relevant experience, why this team wins. |
| 10 | **Financials** | Revenue, burn rate, projections, key metrics. |
| 11 | **Ask** | How much you are raising, what you will do with it, milestones. |

### Y Combinator Template

| # | Slide | What It Covers |
|---|-------|---------------|
| 1 | **Title** | Company name, one-line description, contact. |
| 2 | **Problem** | What sucks about the status quo. |
| 3 | **Solution** | What you have built. |
| 4 | **Traction** | Growth metrics, revenue, users. The most important slide. |
| 5 | **Market** | How big is the opportunity. |
| 6 | **Product** | Demo, screenshots, how it works. |
| 7 | **Team** | Why you, specifically, will win. |
| 8 | **Business Model** | How you make money. |
| 9 | **Ask** | What you need and what you will accomplish. |

### Always Present vs. Conditional

- **Always present:** Problem, Solution, Market, Team, Business Model, Ask
- **Conditional:** "Why Now" (Sequoia emphasis, less common in seed decks). Traction (only if you have it). Financials detail (Series A+ vs. seed). Competition slide (varies).

### Notably Absent

- No **operational detail** — how the company actually runs
- No **culture or values**
- No **customer relationships / retention**
- No **partnerships** (unless critical to the model)
- No **risk analysis** (pitch decks are inherently optimistic)
- No **regulatory / compliance** (unless it IS the moat)

---

## 5. Strategic Planning Frameworks

### Porter's Five Forces (Michael Porter, 1979)

| # | Force | Knowledge Area |
|---|-------|---------------|
| 1 | **Threat of New Entrants** | Barriers to entry: capital requirements, economies of scale, brand loyalty, access to distribution, regulatory barriers, switching costs. |
| 2 | **Bargaining Power of Suppliers** | Supplier concentration, uniqueness of inputs, switching costs, threat of forward integration. |
| 3 | **Bargaining Power of Buyers** | Buyer concentration, price sensitivity, product differentiation, switching costs, threat of backward integration. |
| 4 | **Threat of Substitutes** | Availability of substitute products, relative price/performance, switching costs, buyer propensity to substitute. |
| 5 | **Industry Rivalry** | Number of competitors, industry growth rate, fixed costs, product differentiation, exit barriers, strategic stakes. |

### SWOT Analysis

| Quadrant | Type | Orientation |
|----------|------|-------------|
| **Strengths** | Internal | Positive |
| **Weaknesses** | Internal | Negative |
| **Opportunities** | External | Positive |
| **Threats** | External | Negative |

### OKRs (Objectives and Key Results)

- **Objectives**: Qualitative, inspirational, time-bound goals
- **Key Results**: Quantitative measures of progress toward objectives
- Typically set quarterly, reviewed weekly/monthly
- Cascade from company to team to individual

### Balanced Scorecard (Kaplan & Norton, 1992)

| # | Perspective | Knowledge Area |
|---|------------|---------------|
| 1 | **Financial** | Revenue growth, profitability, ROI, cash flow |
| 2 | **Customer** | Satisfaction, retention, market share, acquisition |
| 3 | **Internal Processes** | Operational efficiency, quality, cycle time, innovation pipeline |
| 4 | **Learning & Growth** | Employee skills, culture, technology infrastructure, information systems |

### Always Present vs. Conditional

- **Always present across strategic frameworks:** Competitive landscape, internal capabilities assessment, goal-setting structure
- **Conditional:** Porter's Five Forces is most relevant in established industries. Balanced Scorecard is enterprise-oriented. OKRs are stage-independent but adoption varies.

### Notably Absent

- Porter's Five Forces has no **internal** view (purely external/industry)
- SWOT has no **action plan** component
- OKRs have no **context** component (assume strategy is set elsewhere)
- Balanced Scorecard has no **competitive/market** perspective

---

## 6. Startup-Specific: Investor Updates & Board Decks

### Investor Update Template

| # | Section | What It Covers |
|---|---------|---------------|
| 1 | **Highlights / Wins** | Top 3-5 achievements this period. |
| 2 | **Lowlights / Challenges** | Top 3-5 problems or misses. Honesty is critical. |
| 3 | **KPIs / Metrics** | Revenue, MRR/ARR, burn rate, runway, users, growth rate, churn, NPS. |
| 4 | **Product Update** | What shipped, what is next, any pivots. |
| 5 | **Team** | Key hires, departures, open roles, org changes. |
| 6 | **Fundraising** | Current status, runway, next raise timeline. |
| 7 | **Asks** | Specific requests: intros, hiring help, advice on problems. |

### Board Deck Structure

| # | Section | What It Covers |
|---|---------|---------------|
| 1 | **Executive Summary** | State of the business in 1-2 slides. |
| 2 | **Financial Performance** | P&L, budget vs. actual, cash position, burn, runway. |
| 3 | **Key Metrics Dashboard** | Product metrics, sales pipeline, customer metrics. |
| 4 | **Strategic Priorities** | Progress against quarterly/annual goals. |
| 5 | **Product Roadmap** | What shipped, in progress, planned. |
| 6 | **Go-to-Market** | Sales performance, marketing performance, pipeline. |
| 7 | **Team & Org** | Headcount, key hires/departures, organizational health. |
| 8 | **Competitive Landscape** | New entrants, competitor moves, market shifts. |
| 9 | **Risks & Mitigations** | Top risks and what is being done about them. |
| 10 | **Discussion Topics** | Decisions that need board input. Open questions. |

---

## Cross-Framework Synthesis

### Recurring Knowledge Areas (3+ frameworks)

| Knowledge Area | Traditional BP | Lean Canvas | BMC | Pitch Deck | Strategic | Investor/Board | Count | Layer |
|---------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|-------|
| **Customer/Market Segments** | Y | Y | Y | Y | Y | - | 5 | Domain |
| **Value Proposition / Problem-Solution** | Y | Y | Y | Y | - | - | 4 | Identity |
| **Revenue Model / Pricing** | Y | Y | Y | Y | - | Y | 5 | Domain |
| **Cost Structure / Unit Economics** | Y | Y | Y | - | - | Y | 4 | Domain |
| **Competitive Landscape** | Y | - | - | Y | Y | Y | 4 | Domain |
| **Team / Organization** | Y | - | - | Y | - | Y | 3 | Identity |
| **Financial Performance / Projections** | Y | - | - | Y | Y | Y | 4 | Temporal |
| **Key Metrics / KPIs** | - | Y | - | Y | Y | Y | 4 | Temporal |
| **Product / Solution Description** | Y | Y | - | Y | - | Y | 4 | Domain |
| **Channels / Distribution** | Y | Y | Y | - | - | - | 3 | Domain |
| **Market Size / Opportunity** | Y | - | - | Y | Y | - | 3 | Domain |
| **Partnerships / Key Relationships** | - | - | Y | - | Y | - | 2* | Domain |
| **Funding / Capital Needs** | Y | - | - | Y | - | Y | 3 | Temporal |
| **Growth Strategy / Go-to-Market** | Y | Y | - | - | - | Y | 3 | Experience |
| **Risks & Challenges** | - | - | - | - | Y | Y | 2* | Temporal |
| **Goals / Strategic Priorities** | - | - | - | - | Y | Y | 2* | Temporal |

*Partnerships, Risks, and Goals appear in only 2 formal frameworks but are
nearly universal in practice.*

### Unique to One Framework but Important

| Knowledge Area | Framework | Why It Matters | Layer |
|---------------|-----------|---------------|-------|
| **Why Now / Timing** | Sequoia pitch deck | Forces articulation of macro context and market window | Temporal |
| **Unfair Advantage** | Lean Canvas | Identifies durable moats | Identity |
| **Customer Relationships** | BMC | Distinguishes relationship TYPE (self-service vs. high-touch vs. community) | Experience |
| **Key Activities** | BMC | What the company actually DOES day-to-day | Domain |
| **Key Resources** | BMC | Physical, IP, human, financial assets | Domain |
| **Highlights / Lowlights** | Investor updates | Temporal pulse check, forces honest self-assessment | Temporal |
| **Asks / Help Needed** | Investor updates | Explicit articulation of what is needed from stakeholders | Temporal |
| **Learning & Growth** | Balanced Scorecard | Employee development, knowledge systems, technology infrastructure | Experience |

### Layer Mapping — Full Taxonomy

#### Identity Layer (Who are we, what do we believe)

| Knowledge Area | Description | Source Frameworks |
|---------------|-------------|-------------------|
| **Mission & Vision** | Why the company exists; what it aspires to become | Traditional BP |
| **Value Proposition** | The core promise to customers; what makes us worth choosing | Lean Canvas, BMC, Pitch Decks, Traditional BP |
| **Unfair Advantage / Moat** | What cannot be easily copied or bought | Lean Canvas |
| **Team & Founders** | Who we are, what we have done, why we win | Traditional BP, Pitch Decks, Investor Updates |
| **Legal Structure & Ownership** | How the entity is organized | Traditional BP |
| **Culture & Values** | Operating principles, how decisions are made | *Absent from all frameworks* |

#### Domain Layer (What are the things we work with)

| Knowledge Area | Description | Source Frameworks |
|---------------|-------------|-------------------|
| **Customer Segments** | Who we serve; how we segment them | All except Investor Updates |
| **Market Size & Dynamics** | TAM/SAM/SOM, trends, growth rates | Traditional BP, Pitch Decks, Porter's |
| **Product / Service Description** | What we make or do | Traditional BP, Lean Canvas, Pitch Decks, Board Decks |
| **Revenue Model & Pricing** | How we make money, at what price points | Traditional BP, Lean Canvas, BMC, Pitch Decks |
| **Cost Structure** | What we spend money on, fixed vs. variable | Traditional BP, Lean Canvas, BMC |
| **Competitive Landscape** | Who else operates here, how we are different | Traditional BP, Pitch Decks, Porter's, Board Decks |
| **Channels & Distribution** | How we reach customers | Traditional BP, Lean Canvas, BMC |
| **Key Activities** | The core things the company does to create value | BMC |
| **Key Resources** | The assets we need to operate | BMC |
| **Key Partnerships** | Strategic relationships that extend our capabilities | BMC |
| **Regulatory Environment** | Laws, compliance, industry regulations | Traditional BP (partially), Porter's |
| **Technology & Architecture** | Technical stack, infrastructure decisions | *Absent from all frameworks* |

#### Experience Layer (How should output feel to the receiver)

| Knowledge Area | Description | Source Frameworks |
|---------------|-------------|-------------------|
| **Customer Relationships** | Type of relationship we maintain | BMC |
| **Growth Strategy / Go-to-Market** | How we acquire and retain customers | Traditional BP, Lean Canvas, Board Decks |
| **Brand & Positioning** | How we want to be perceived in the market | Traditional BP |
| **Operational Processes** | How we deliver value day-to-day | Balanced Scorecard |
| **Learning & Growth** | How we develop people and organizational capabilities | Balanced Scorecard |
| **Customer Voice** | Direct signal from the people we serve | *Absent from all frameworks* |
| **Internal Communications** | How information flows inside the company | *Absent from all frameworks* |
| **Knowledge Management** | How the company learns and retains what it learns | *Absent from all frameworks* |

#### Temporal Layer (What's changed, what's decided, what's next)

| Knowledge Area | Description | Source Frameworks |
|---------------|-------------|-------------------|
| **Financial Performance** | Actuals: P&L, cash flow, burn rate, runway | Traditional BP, Pitch Decks, Board Decks |
| **Financial Projections** | Forecasts: 3-5 year models, budget vs. actual | Traditional BP, Pitch Decks |
| **Key Metrics / KPIs** | The numbers that matter now | Lean Canvas, Pitch Decks, OKRs, Board Decks |
| **Goals & Strategic Priorities** | What we are trying to accomplish this period | OKRs, Board Decks |
| **Product Roadmap** | What shipped, in progress, planned | Board Decks, Investor Updates |
| **Funding Status & Needs** | Current raise, runway, next milestones | Traditional BP, Pitch Decks, Investor Updates |
| **Risks & Mitigations** | What could go wrong and what we are doing about it | Board Decks, SWOT, Sahlman |
| **Highlights & Lowlights** | Periodic wins and losses | Investor Updates |
| **Decisions & ADRs** | Key decisions made and their rationale | *Absent from all frameworks* |
| **Why Now / Timing** | Market window, macro conditions enabling this moment | Sequoia Pitch Deck |

---

## How Frameworks Handle Company Complexity

### Solo Founder vs. Small Team vs. Divisions vs. Enterprise

**Short answer: they mostly do not differentiate.**

- **Traditional business plan**: Scales somewhat — the Organization section can
  be one paragraph for a solo founder or multiple pages. Template structure is
  identical regardless of size.
- **Lean Canvas**: Explicitly designed for early-stage startups. No concept of
  organizational hierarchy or divisions.
- **Business Model Canvas**: More scalable — Osterwalder has written about
  "portfolio" views. But the base canvas has no built-in concept of
  organizational complexity.
- **Pitch decks**: Format is identical for a solo founder and a 100-person company.
- **Balanced Scorecard**: The only framework explicitly designed for organizational
  complexity. It cascades from corporate to business unit to department.
- **Board decks**: Scale naturally by adding sections and depth.

**Implication for the wizard:** No existing framework provides a clean
complexity dial. The wizard must explicitly model organizational scope,
team complexity, and decision-making structure.

### Different Company Types

| Dimension | Product Company | Services Company | Research/Academic |
|-----------|----------------|------------------|-------------------|
| Value Proposition | Feature-driven | Expertise-driven | Knowledge-driven |
| Key Resources | Code, IP, infrastructure | People, methodologies | Grants, labs, publications |
| Key Activities | Build, ship, iterate | Deliver, consult, advise | Investigate, publish, teach |
| Revenue Model | Subscription, licensing, transaction | Hourly, project, retainer | Grants, tuition, licensing |
| Customer Relationships | Often self-service/automated | Personal, high-touch | Institutional, peer |
| Competitive Landscape | Feature comparison, network effects | Reputation, relationships | Publication record, citations |

### Different Stages

| Stage | Primary Framework | Key Knowledge Focus |
|-------|-------------------|---------------------|
| **Pre-revenue / Idea** | Lean Canvas | Problem validation, customer discovery |
| **Seed / Early** | Lean Canvas + Pitch Deck | PMF signals, initial traction, team |
| **Growth / Series A-C** | Board Deck + OKRs | Metrics, GTM, unit economics, team scaling |
| **Mature / Public** | Balanced Scorecard + Traditional BP | Operational efficiency, portfolio management, governance |
| **Turnaround / Pivot** | Lean Canvas (restart) + SWOT | Reassessment of fundamentals |

---

## Key Findings for Wizard Design

### 1. There Are ~25 Distinct Knowledge Areas

Across all frameworks, approximately 25 distinct knowledge areas. Not all are
needed by every company.

### 2. The Four-Layer Model Works

Every knowledge area maps cleanly to Identity, Domain, Experience, or Temporal.
No area is orphaned.

### 3. Frameworks Have Systematic Blind Spots

Critical knowledge areas absent from ALL major frameworks:

| Missing Area | Why It Matters | Proposed Layer |
|-------------|---------------|----------------|
| **Culture & Operating Values** | Shapes every decision | Identity |
| **Technology & Architecture** | Foundation for product companies | Domain |
| **Decisions & Rationale (ADRs)** | Prevents re-litigation of settled questions | Temporal |
| **Customer Voice / Feedback Themes** | Direct signal from people you serve | Experience |
| **Internal Communications Model** | How information flows inside the company | Experience |
| **Knowledge Management** | How the company learns and retains | Experience |

### 4. Complexity Needs Three Dials

The wizard needs at least three independent dimensions:

1. **Stage**: Pre-revenue, Seed, Growth, Mature, Turnaround
2. **Type**: Product, Services, Research, Marketplace/Platform, Hybrid
3. **Scale**: Solo, Small Team, Mid-size, Enterprise, Multi-division

### 5. Temporal Knowledge Is Underserved

Most frameworks are snapshot-oriented. A corporate context library must be
opinionated about **cadence**: which knowledge areas need weekly, monthly,
quarterly, or annual refresh.

### 6. The "Always Required" Core

Regardless of stage, type, or scale, every company needs:

1. **Identity**: Who we are and what we are trying to do
2. **Customers**: Who we serve and what they need
3. **Offering**: What we make or do
4. **Economics**: How we make/spend money
5. **Metrics**: How we know if we are winning
6. **Team**: Who is doing the work

These six areas are the minimum viable corporate context library. Everything
else is conditional on the three complexity dials.

---

## Appendix: Framework-to-Layer Mapping (Complete)

```
IDENTITY                          DOMAIN
  Mission & Vision                  Customer Segments
  Value Proposition                 Market Size & Dynamics
  Unfair Advantage / Moat           Product / Service Description
  Team & Founders                   Revenue Model & Pricing
  Legal Structure                   Cost Structure
  Culture & Values*                 Competitive Landscape
                                    Channels & Distribution
                                    Key Activities
                                    Key Resources
                                    Key Partnerships
                                    Regulatory Environment
                                    Technology & Architecture*

EXPERIENCE                        TEMPORAL
  Customer Relationships            Financial Performance
  Growth / Go-to-Market             Financial Projections
  Brand & Positioning               Key Metrics / KPIs
  Operational Processes             Goals & Strategic Priorities
  Learning & Growth                 Product Roadmap
  Customer Voice*                   Funding Status & Needs
  Internal Communications*          Risks & Mitigations
  Knowledge Management*             Highlights & Lowlights
                                    Decisions & ADRs*
                                    Why Now / Timing

* = Absent from all surveyed frameworks; identified as gap
```
