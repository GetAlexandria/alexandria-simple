# Federation Architecture — Design Decisions

Captured during Raven wizard session, 2026-04-10. These are foundational
architectural decisions that shape everything downstream: the wizard, the
library topology, and the information model.

---

## Decision 0: Two Faces of the Same Knowledge

The federated library system has two access patterns for the same underlying
knowledge:

| Face | Structure | Consumer | Navigation |
|------|-----------|----------|------------|
| **Index** | Nested zones: Market → Corporate → Program | Humans | Hierarchical, structured, bookshelf |
| **Knowledge Graph** | Nodes with bidirectional "informs" edges | AI agents | Associative, follows connections anywhere |

The topology IS nested. A corporation exists within a market. Programs exist
within a corporation. That's structural reality. Humans navigate this nesting
— they drill down, drill up, find what they need on a bookshelf.

But information doesn't respect the nesting. A factory-floor insight can
reshape market understanding. A customer interview can rewrite corporate
strategy. AI agents follow connections wherever they lead, across zone
boundaries, in any direction.

Same knowledge. Two access patterns. Just like the product library today —
the manifest is an index for humans, the wikilink graph is for AI. AI doesn't
care about the index. Most humans will never traverse the knowledge graph.

---

## Decision 1: Three Zones

The federation has three **zones**, derived from the role complexity model
(sociotechnica.org/role-complexity/). The zones are structurally nested —
a corporation is part of a market, programs are part of a corporation — but
information flows between them are bidirectional ("informs," not "inherits").

### Market Zone (Extra-organizational)

Knowledge about the world the company operates in. Industry-level concerns.

- Customer Segments & Buyer Intelligence
- Market Landscape & Sizing
- Competitive Intelligence
- Regulatory & Compliance Landscape
- Industry Trends & Category Formation
- Market Evidence (user research, surveys, field data)

This is the **Industry level** in the role complexity model. It impacts the
enterprise but is not the enterprise.

### Corporate Zone (Intra-organizational, Enterprise level)

Knowledge about the company itself. Who we are, how we operate, where we're
going.

- Identity & Purpose (Vision, Values, Founding Thesis, Value Proposition)
- Business Model & Economics (Revenue Model, Cost Structure, Financial Health,
  Partnerships)
- People & Organization (Org Structure, Talent Health, Culture & Norms)
- Strategy & Execution (Priorities, Metrics, Risks, Product Posture, GTM)
- Governance (Decision Authority)

~18 knowledge areas in 5 domains.

### Program Zone (Program/Project level — one of many)

Knowledge about how specific buildable surfaces work. A product library is
one Program zone. A marketing team's content library is another. An ops
team's process library is another. They are siblings under the same
Corporate zone, informed by the same Market zone.

The existing 22-area product wizard applies to the Software/Product program
type, minus the areas that lift to corporate or market intelligence. Other
program types (marketing, ops, research) would have their own area indexes
appropriate to what their factory prints.

### Why "Program" Not "Product"

"Product" is one species of program. A company might have many program-level
libraries: the software product, the marketing operation, the customer
success function, the research agenda. Each is a distinct factory that prints
a different kind of output. "Program" is the role complexity term AND it
captures this multiplicity.

---

## Decision 2: "Where You Sit" Refracts Across Libraries

The knowledge of market positioning — "what we are and what we're not" — is
not a single thing that lives in one place. It **refracts** across all three
library types at different fidelity:

| Library | How "where you sit" manifests |
|---------|------------------------------|
| **Market Zone** | "Here's the landscape and where the lanes are." Category formation, adjacent spaces, competitor positions. |
| **Corporate Zone** | "We chose THIS lane. Here's why. Here's what we're NOT." Identity by exclusion. Strategic positioning. |
| **Program Zone** | "Given our lane, here's what we build vs. integrate vs. depend on." Architecture boundaries, technical positioning. |

This is not duplication. Each library holds the version at its zoom level.
The blurriness at the boundaries is the information flow working correctly —
the same underlying insight resolving at different fidelity for different
consumers.

---

## Decision 3: The Library IS Institutional Memory

Knowledge areas that describe what the library itself does are not categories
within the library. They are properties of the medium:

- **Key Decisions & Rationale** → Every card captures decisions. This is what
  the library does, not a section of it.
- **Institutional Memory & Lessons** → The library IS institutional memory.
- **Capital & Investor Relations** → This is a consumer of corporate knowledge
  (the board deck assembles from the library), not a source.

These were removed from the corporate index. Governance & Decision Authority
survives because "who decides what" is structural knowledge about the
organization, not about the library.

---

## Decision 4: The User Never Decides on Federation

The wizard scopes the federation topology behind the scenes. The user
experiences gap analysis — natural questions about their business, market,
and product. The system routes knowledge to the right zone based on
what level it belongs to.

- "Tell me about your competitive landscape" → Market zone
- "What are you NOT?" → Corporate zone (identity)
- "What do you build vs. buy?" → Program zone (architecture)

A solo founder's answers might all land in one collapsed library. A division
head's answers naturally distribute across three zones. The wizard decides
the topology; the user just answers questions about their business.

---

## Decision 5: Information Flow Is Circulatory

Zones are nested structurally, but information doesn't respect the nesting.
Any zone can generate an insight that flows to any other zone:

- A task-level discovery (factory floor) can reshape program architecture
- A program-level insight can reshape corporate strategy
- A corporate strategy shift can reshape market positioning
- A market shift can reshape everything

**For the index (human view):** Updates are presented within the zone
structure. A human reviews changes in context — "here's what changed in
the Corporate zone this quarter."

**For the graph (AI view):** Signals flow freely. The signal queue concept
(already in Alexandria) is the mechanism — signals generated at any level
can target any zone for review.

The word **"informs"** replaces "inherits" throughout the architecture.
"Inherits" implies one-way cascade. "Informs" captures bidirectional flow.

---

## Implications for the Wizard

The wizard's job is to:

1. **Scope the topology** — How many zones does this organization need?
   (Determined by organizational complexity and functional breadth, not by
   user selection. A solo founder might have everything collapsed into one
   library. A division head needs three distinct zones.)
2. **Assess each zone** — What knowledge areas are active? What's present,
   what's missing?
3. **Sequence the build** — Given the current state, what should be built
   first? Across ALL zones, not just one.
4. **Map the flows** — What information flows exist between zones? Where
   are the connections that need to be maintained?

The user experiences this as: "Tell me about your business" → "Here's what
your knowledge system should look like" → "Here's what to build first."

The user never sees the word "federation." They never choose between zones.
They answer questions about their business, their market, and their product.
The wizard routes knowledge to the right zone and presents the result as a
structured index they can navigate.
