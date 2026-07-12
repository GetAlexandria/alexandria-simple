# Alexandria of Alexandria

## What TCLoA Is

TCLoA is a **construction system for program-level knowledge**. It comprises a set of specialized
agents (Conan, Sam, Bridget, Raven, Solomon), an initialize flow, deterministic
tooling (graph parser, DAG engine, grade computation, linting CLI, eval harness), templates, and
a type taxonomy. Together these components build, maintain, and quality-check context
libraries for any product domain.

The ~120 cards at `docs/alexandria/` are the system documenting itself — a special case,
not an exemplar. Downstream products build exemplar libraries using TCLoA as their
construction system. LifeBuild's context library is an exemplar. A book author's character/arc
library would be an exemplar. Exemplars are produced BY the system; they are not the system
itself.

The genus index below is a **navigation aid for bootstrapping** — it helps a new team answer
"what kind of context library do I need?" and find the right starting vocabulary, retrieval
profiles, and agent configurations for their factory type.

## The One-Paragraph Version

Every context library has the same skeleton: a **knowledge layer** (what you know), a
**factory** (what you produce), and a **feedback loop** (what you learn from producing it).
The knowledge layer is always a graph. The factory always prints tokens. The feedback loop
always updates the graph. What *changes* across libraries is the **shape of the tokens**
coming out and the **shape of the knowledge** going in. Alexandria of Alexandria is
the index that maps every combination of "what I know" to "what I'm making" — from a
megacorporation running twelve factories in parallel to a shark comedy blogger running one.

## The Skeleton Every Library Shares

Before we get to the species, here's what's invariant. Every context library, regardless of
what it's for, has four layers:

| Layer | Question it answers | Software example | Book example | Comms example |
|-------|-------------------|------------------|--------------|---------------|
| **Identity** | Who are we and what do we believe? | Product Thesis, Principles, Standards | Premise, Narrative Rules, Style Guide | Brand Identity, Voice Principles, Messaging Standards |
| **Domain** | What are the things we're working with? | Domains, Components, Systems | Arcs, Characters, Settings | Audiences, Channels, Campaigns |
| **Experience** | How should the output feel to the receiver? | Loops, Journeys, Experience Goals | Tone, Pacing, Emotional Arcs | Resonance, Cadence, Engagement Patterns |
| **Temporal** | What's changed, what's decided, what's next? | Decisions, Releases, Initiatives | Revision History, Draft Status, Editor Notes | Campaign Calendar, Approvals, Metrics |

The five dimensions — WHAT / WHERE / WHY / WHEN / HOW — also transfer. A character card in
a book library still needs to say what this character *is*, where they sit in the story's
web of relationships, why they exist in narrative terms, when they were introduced or
changed, and how they behave on the page. A campaign card in a comms library still needs all
five.

The wikilink graph, the retrieval profiles, the assembly-then-build pattern, the
Conan/Sam-style maintenance loop — all invariant. The *vocabulary inside them* changes.

---

## Zone Model: Where Program Libraries Live

The genus index below describes **Program-zone** species — libraries for individual programs
or functions within an organization. Programs don't exist in isolation. Every program
operates within a corporation, and every corporation operates within a market. The
**three-zone model** is the layer above the genus index:

| Zone | Scope | Knowledge focus |
|------|-------|-----------------|
| **Market Zone** | Extra-organizational | Market landscape, competitive intelligence, regulatory environment, industry trends, category formation |
| **Corporate Zone** | Intra-organizational | Identity & purpose, business model, people & org, strategy & execution, governance |
| **Program Zone** | Program/Project level | What this factory builds, its domain vocabulary, feedback loops, and how it fits the corporate strategy |

**The genus index describes species within the Program zone.** A software product library
(I-A), a comms library (III-A), and a documentation library (II-C) are all Program-zone
libraries. They are siblings under the same Corporate zone, informed by the same Market zone.

**Information flows are circulatory, not hierarchical.** Zones are nested structurally —
a program is part of a corporation, a corporation is part of a market — but information
does not respect that nesting. A factory-floor discovery can reshape corporate strategy.
A market shift can reshape program architecture. The word is **"informs"** not "inherits":
every zone generates insights that flow to every other zone in both directions.

**The initialize flow configures a Program zone.** When Raven runs the Alexandria initialize
flow, it scopes one program library — one team, one factory, one output type. The genus
index and 22-area initialize flow are unchanged. The zone model is the larger system they
fit into.

---

## How the Index Is Organized

Alexandria index is organized by **what your factory prints**. That's the most natural
entry point for a human asking "what kind of context library do I need?" You don't start
with "how complex is my knowledge graph" — you start with "what am I making?"

The definitive test for whether an output type constitutes a genus is: **does the output cross
shipping/receiving and land in the marketplace where economic value is created?** Four genera
always pass this test (Software, Prose, Communications, Media). Three are conditional — they
are genera when sold externally, but corporate context when consumed internally (Professional
Services, Research, Education).

Within each genus, species vary by **scope** (how big is the operation), **cadence** (how
often do you ship), and **permanence** (does the output accumulate into a single artifact or
scatter into the world as discrete pieces).

```
ALEXANDRIA INDEX
│
├── I.   SOFTWARE         — Your factory prints code
├── II.  PROSE            — Your factory prints written works
├── III. COMMUNICATIONS   — Your factory prints messages
├── IV.  MEDIA            — Your factory prints experiences
├── V.   PROFESSIONAL SERVICES — Your factory prints advice
├── VI.  RESEARCH         — Your factory prints insights
└── VII. EDUCATION        — Your factory prints understanding
```

---

## I. SOFTWARE — Your Factory Prints Code

The original genus. The one we've built. Code has a special property: it's
*machine-verifiable*. Tests pass or fail. The compiler accepts or rejects. This tight
feedback loop is why the Product Alexandria matured here first — you can measure
whether the context helped.

### I-A. Product (SaaS, App, Platform, Game)

**The flagship species.** You're building a thing that users interact with. The domain layer
is rich — domains, sections, components, systems, governance. The experience layer matters because
users have feelings about your product. The identity layer is heavy because product
decisions cascade.

*This is LifeBuild. This is the species we've shipped.*

Scale range: Solo indie dev → 500-person product org.
Cadence: Continuous (sprints, releases).
Permanence: Accumulating — the codebase grows, the product evolves.

### I-B. Library / SDK / Developer Tool

A narrower variant. Your "users" are developers. The experience layer tilts toward
ergonomics and developer experience rather than emotional aesthetics. The domain layer is
shallower (APIs, modules, types) but precision matters more — a confusing API name is a bug.

Scale range: Solo maintainer → platform team.
Cadence: Versioned releases.
Permanence: Accumulating with semver boundaries.

### I-C. Infrastructure / Platform Engineering

The domain layer is *systems* all the way down — pipelines, clusters, regions, policies.
The experience layer is thin (ops don't care about delight, they care about reliability).
The identity layer is heavy on standards and principles (SLOs, security posture,
compliance).

Scale range: Platform team → enterprise infrastructure org.
Cadence: Continuous with change windows.
Permanence: Accumulating, with lifecycle management.

### I-D. Data Pipeline / Analytics

Domain layer is shaped like flows — sources, transforms, destinations, schemas, quality
rules. Experience layer is about the *consumer* of the data (analyst, dashboard viewer,
ML model). Temporal layer is unusually important — data has freshness, lineage, and drift.

Scale range: Data engineer → data platform team.
Cadence: Event-driven + scheduled.
Permanence: Schema accumulates; data flows through.

---

## II. PROSE — Your Factory Prints Written Works

Here the tokens are meant to be *read by humans for their own sake*. Voice, continuity, and
narrative structure matter in ways they never do for code. The feedback loop is slower and
more subjective — an editor's note, a beta reader's reaction, your own re-read six weeks
later.

### II-A. Long-Form Manuscript (Book, Thesis, Monograph)

**The 100,000-word challenge.** The domain layer is deep and interconnected — characters,
arcs, themes, settings, and the web of promises and payoffs that hold a long work together.
The experience layer is *the whole point* — pacing, tone, emotional arcs, the felt
experience of reading.

The factory here prints *draft prose*, not final prose. Revision is a first-class operation,
not a bug fix. The temporal layer tracks not just "what changed" but "what draft are we in"
and "what feedback have we received from which readers."

A context library for a book needs to solve a problem code libraries don't face:
**continuity at scale**. In chapter 47, the AI writing assistant needs to know that the
protagonist's left hand was injured in chapter 12 and that the author decided in draft 2 to
make the injury permanent. That's a knowledge graph problem.

Scale range: Solo author → author + editor + research assistant.
Cadence: Drafts, with revision cycles.
Permanence: Accumulating into a single artifact.

### II-B. Serial Publication (Blog, Newsletter, Column)

Each output is a *discrete piece* that stands alone but belongs to a larger body of work.
The identity layer carries the voice and recurring themes. The domain layer is lighter per
piece but accumulates — the shark comedy blogger's cast of recurring characters, running
jokes, established lore.

**This is where the shark blogger lives.** Their context library might be tiny: a voice
guide, a character sheet for "Dr. Finn," a list of running gags, and a style standard for
how scientific citations get satirized. Ten cards. But those ten cards mean every post
*sounds like them* even when an AI is drafting it.

The key difference from a book: each piece ships independently. There's no "chapter 47
needs to know about chapter 12" problem — but there IS a "post 47 should reference the
running joke from post 12 if relevant" problem. Lighter continuity, still real.

Scale range: Solo blogger → editorial team.
Cadence: Periodic (weekly, biweekly, monthly).
Permanence: Discrete pieces accumulating into an archive.

### II-C. Documentation / Knowledge Base

The unsung species. Your factory prints *explanations*. The domain layer mirrors whatever
you're documenting (a product, an API, a process). The experience layer is about clarity,
not beauty — scannability, progressive disclosure, task orientation.

Interestingly, this species often *lives alongside* another context library. Your product
has a Software library (I-A) for building it and a Documentation library (II-C) for
explaining it. They share upstream knowledge but have different factories.

Scale range: Solo technical writer → docs team.
Cadence: Tracks the thing being documented.
Permanence: Accumulating, with deprecation.

### II-D. Academic / Research Writing (Papers, Journals, Grant Proposals)

Domain layer is the *literature* — prior work, methodologies, findings, open questions. The
identity layer is heavy on standards (citation style, disciplinary conventions, ethical
frameworks). The experience layer is minimal but present — even a journal article has pacing
and argument flow.

Scale range: Solo researcher → research group.
Cadence: Project-driven (submission deadlines).
Permanence: Discrete artifacts, each standalone.

---

## III. COMMUNICATIONS — Your Factory Prints Messages

Messages are tokens aimed at *specific audiences through specific channels*. The defining
feature: the same underlying knowledge gets expressed differently depending on who's
listening and where they're listening. A press release, a tweet, an investor update, and an
internal memo might all communicate the same news — but they're four different outputs from
the same library.

### III-A. Brand & Marketing Communications

**The comms department library.** Domain layer is audiences, channels, campaigns, and
messaging frameworks. Identity layer is brand voice, positioning, and messaging
architecture. Experience layer is about resonance — does this land with this audience in
this channel?

The factory here has a unique property: **multi-channel multiplexing**. One piece of news
becomes five artifacts for five channels. The context briefing needs to include
channel-specific constraints (character limits, tone registers, visual requirements)
alongside the core message.

Scale range: Solo marketer → comms department.
Cadence: Campaign-driven + reactive (news cycle, crisis).
Permanence: Discrete, with campaign arcs.

### III-B. Internal Communications

Your audience is your own organization. Domain layer is org structure, initiatives, change
programs, cultural values. The experience layer is about trust and clarity — people detect
corporate BS instantly.

A species that often gets neglected but scales badly without a library. When your company
hits 200 people, the CEO can't just wing all-hands talking points. When it hits 2,000,
there's a whole team whose factory prints internal messages, and they need consistent
context about what's actually happening, what's been decided, and what the approved framing
is.

Scale range: Founder doing weekly updates → internal comms team.
Cadence: Regular cadence + event-driven.
Permanence: Ephemeral with institutional memory.

### III-C. Stakeholder & Investor Communications

High-stakes, low-frequency. Every word is scrutinized. The identity layer is heavy on
compliance and legal standards. The domain layer is financial performance, strategic
milestones, and risk factors. The experience layer is about *confidence* — projecting
competence and transparency.

Scale range: Founder → IR team.
Cadence: Quarterly + event-driven (fundraising, M&A, crisis).
Permanence: Archived, auditable.

### III-D. Community & Support Communications

Your audience is your user community. Domain layer is product knowledge (often shared with
a Software library), known issues, feature roadmap, community norms. The experience layer
is about helpfulness and belonging.

Interesting hybrid: support comms share a domain layer with the product's Software library
but have their own identity layer (support voice ≠ marketing voice) and their own experience
layer (empathy, resolution orientation).

Scale range: Solo founder answering support emails → community team.
Cadence: Continuous, reactive.
Permanence: Discrete interactions + knowledge base accumulation.

---

## IV. MEDIA — Your Factory Prints Experiences

The output is rich media — video, audio, interactive, visual. Tokens might literally be
tokens (AI-generated media) or might be *scripts and specifications* that humans then
produce. The experience layer is dominant — media IS experience.

### IV-A. Video / Film Production

Domain layer: scenes, characters, locations, shots, sequences. Identity layer: visual
language, directorial vision, genre conventions. Experience layer: emotional arc, pacing,
rhythm, tension-release patterns. The temporal layer tracks production status (pre-prod,
shooting, post, VFX, color, sound).

Scale range: Solo YouTuber → production company.
Cadence: Project-driven or serial.
Permanence: Discrete works.

### IV-B. Audio / Podcast Production

A lighter variant of IV-A. Domain layer: episodes, segments, recurring guests/characters,
sound design. The continuity problem resembles serial publication (II-B) more than film.

Scale range: Solo podcaster → audio production team.
Cadence: Episodic.
Permanence: Archive of episodes.

### IV-C. Game Design

A hybrid of Software (I-A) and Media. The domain layer is *both* technical (systems,
components, data schemas) and creative (narrative, characters, world-building, mechanics).
The experience layer is the product — engagement loops, progression, player emotion, flow
states. This species has one of the richest context libraries because games sit at the
intersection of engineering, design, and storytelling.

Scale range: Solo indie → AAA studio.
Cadence: Milestone-driven development.
Permanence: Accumulating artifact (the game).

### IV-D. Design / Visual Production

Domain layer: brand system, assets, layouts, typography, color. Identity layer: design
principles, aesthetic standards. Experience layer: visual hierarchy, emotional association,
accessibility. The factory prints *visual artifacts* — mockups, illustrations, design
systems, marketing collateral.

Scale range: Solo designer → creative agency.
Cadence: Project-driven or continuous (brand system maintenance).
Permanence: Mixed (campaigns are ephemeral; brand systems accumulate).

---

## V. PROFESSIONAL SERVICES — Your Factory Prints Advice

Consulting and advisory services ARE a genus because the output is sold to clients — strategy
documents, assessments, recommendations, and deliverables cross shipping/receiving and land in
the marketplace where economic value is created. Internal strategy and planning are corporate
context that belongs in the product library's identity layer, not a separate library.

### V-A. Consulting & Advisory

Domain layer: client context, engagement scope, methodology, market landscape, competitive
dynamics, findings. Identity layer: firm's frameworks, quality standards, IP, strategic
principles. Experience layer: how deliverables should land with the client
(executive-friendly, actionable, defensible).

A species with a unique property: the library is *partially portable*. The methodology and
frameworks carry across engagements; the client context is engagement-scoped.

Scale range: Solo consultant → consulting practice.
Cadence: Engagement-driven + planning cycles.
Permanence: Methodology accumulates; engagements archive.

### V-B. Program / Project Management

Domain layer: workstreams, dependencies, milestones, risks, resources. Identity layer:
governance standards, reporting frameworks, escalation policies. Temporal layer is
*dominant* — this species is all about time, status, and sequence.

This is a genus when project management is sold as a service (PMO consulting, outsourced
program management). When project management is purely internal, it is corporate context
that lives in the product library's temporal layer.

Scale range: Project lead → PMO.
Cadence: Continuous tracking with reporting cadence.
Permanence: Project-scoped (archive after completion).

---

## VI. RESEARCH — Your Factory Prints Insights

The output is *understanding*. Close to Prose (II) but the factory's job isn't to write
beautifully — it's to synthesize, analyze, and reveal.

### VI-A. Market / Competitive Intelligence

Domain layer: market segments, competitors, trends, signals, sources. Identity layer:
analytical frameworks, bias awareness, confidence standards. Temporal layer is critical —
intelligence decays fast.

Scale range: Solo analyst → intelligence team.
Cadence: Continuous monitoring + periodic deep dives.
Permanence: Insights are ephemeral; frameworks and source maps accumulate.

### VI-B. Scientific / Technical Research

Domain layer: hypotheses, experiments, datasets, methods, prior work, findings. Identity
layer: epistemological standards, reproducibility requirements. The temporal layer tracks
the research arc — question → hypothesis → experiment → analysis → conclusion.

Scale range: Solo researcher → lab group.
Cadence: Project-driven.
Permanence: Findings accumulate into a body of work.

---

## VII. EDUCATION — Your Factory Prints Understanding

The output is *learning*. The domain layer is the subject matter. The experience layer is
pedagogy — sequencing, scaffolding, engagement, assessment.

### VII-A. Curriculum / Course Design

Domain layer: topics, concepts, prerequisites, learning objectives, assessments. Identity
layer: pedagogical philosophy, accessibility standards, assessment principles. Experience
layer: learner journey, difficulty curve, engagement patterns.

Scale range: Solo instructor → curriculum team.
Cadence: Term-based with continuous refinement.
Permanence: Accumulating with versioned revisions.

### VII-B. Training / Enablement

A workplace variant. Domain layer: skills, processes, tools, roles, competency models.
Often shares domain knowledge with an Operations library (V-B). The experience layer is
about *time to competence* — how quickly can someone get productive?

Scale range: Solo trainer → L&D team.
Cadence: Onboarding cycles + continuous.
Permanence: Living content with deprecation.

---

## Zone Model in Context: Federated Organizations

Context libraries do not exist in isolation. In any organization beyond a single team,
knowledge lives across **zones**, and libraries at each zone serve different purposes:

```
MARKET ZONE
│  Landscape: customer segments, competitors, regulatory environment
│  Evidence: field data, surveys, industry trends
│
└── CORPORATE ZONE
    │  Identity: mission, values, market position
    │  Strategy: strategic bets, competitive thesis
    │  Governance: cross-cutting policies, compliance
    │
    ├── PROGRAM: Software Product    PROGRAM: Marketing    ...more
    │   + technical architecture     + channel strategy
    │   + product roadmap            + audience models
    │   + factory: Genus I (code)    + factory: Genus III (msgs)
    │
    └── MARKETPLACE ←→ SIGNAL (flows to any zone that needs it)
```

**Information informs across all zones.** A corporate strategic bet ("the bottleneck is
context, not model capability") informs how each program library interprets its work: the
software program reads it as "prioritize retrieval over model selection"; the comms program
reads it as "emphasize context quality over model power." A program-level discovery (unexpected
user behavior) can flow back to reshape corporate strategy or market understanding. No zone is
the terminal destination for any insight.

**Zones are structurally nested; information is not.** The nesting is real — a program is
part of a corporation, a corporation is part of a market. Humans navigate this nesting as a
hierarchy (the index face). But information doesn't respect the hierarchy. AI agents follow
connections wherever they lead across zone boundaries (the graph face). The same underlying
knowledge has two access patterns: nested index for humans, associative graph for AI.

**Documentation-as-conversation is the operating principle.** At every zone, context
documents are not files in folders — they are living participants in an ongoing organizational
conversation. Each card has explicit assumptions that can be challenged by incoming signal,
validation criteria that define what would change it, and cascade links that propagate changes
when it does change. The signal queue, feedback queue, and strategy cascade mechanisms already
in the construction system are the first generation of this infrastructure.

**When federation applies:** Federation is a Phase 4+ concern. A single team with one
factory does not need it — the program library's identity layer serves as de facto corporate
context. Federation becomes necessary when an organization has two or more programs that need
to share context but produce different outputs. The mandate is: nail one complete program
library (fully built and battle-tested) before expanding to multi-zone deployment. The
five-phase build sequence (Configuration → Seeding → Assembly → Feedback → Maintenance)
must be proven at the single-program level first.

---

## Cross-Cutting Patterns

A few things jump out when you look across all seven genera:

### The Compound Library

Most real organizations don't have one library — they have several. A startup might have:
- A **Product** library (I-A) for building the software
- A **Comms** library (III-A) for talking about it
- A **Documentation** library (II-C) for explaining it

Strategy knowledge belongs in the product library's identity layer — Product Theses,
Principles, and Decisions are the WHY layer of the product library, not a separate library.
Splitting them out would break the connections that make them useful (a Product Thesis is
valuable precisely because it is linked to the Domains, Systems, and Capabilities it governs).

These compound libraries share upstream knowledge (product vision, user personas, market
position) but have different factories and different domain vocabularies. Alexandria needs to
define the **federation pattern** — how libraries share identity-layer knowledge without
duplicating it.

### The Scale Spectrum

Every species exists on a spectrum from "one person, ten cards" to "large team, hundreds of
cards." The shark comedy blogger's Serial Publication library (II-B) has maybe ten cards.
LifeBuild's Product library (I-A) has 100+. A megacorp's full Compound Library might have
thousands across a dozen species.

The initialize flow needs to work at every point on this spectrum. A tiny library still benefits from
the identity layer (even if it's one card: "here's my voice"). A massive library needs the
full maintenance loop.

### The Cadence Axis

The biggest practical difference between species isn't *what* they know but *how often they
ship*:

- **Continuous** (Software I-A, Support III-D): Factory is always running. Assembly on demand.
- **Periodic** (Blog II-B, Newsletter III-B): Factory runs on a schedule. Batch assembly.
- **Project-driven** (Book II-A, Film IV-A, Consulting V-C): Factory runs in phases. Deep assembly.
- **Event-driven** (Crisis comms III-A, Intelligence VI-A): Factory fires on triggers. Rapid assembly.

Cadence shapes how the feedback loop works, how fresh the temporal layer needs to be, and
how heavy the maintenance burden is.

### The Permanence Axis

Some factories produce a single accumulating artifact (a book, a codebase, a game). Others
scatter discrete pieces into the world (blog posts, press releases, support responses). This
matters because:

- **Accumulating artifacts** have a *continuity problem* — the library must track the state of the growing whole
- **Discrete outputs** have a *consistency problem* — the library must ensure each independent piece aligns with identity

---

## What This Means for the Initialize Flow

The initialize flow's zeroth question becomes: **"What is your factory printing?"**

The answer selects a genus (and possibly species), which determines:
1. The **type vocabulary** for the domain layer
2. The **axis interpretations** for the three existing initialize questions
3. The **retrieval profile templates** for context assembly
4. The **output adapter** shape for the factory
5. The **feedback signal types** for the temporal layer

Then the existing three questions (AI mode, domain novelty, product complexity) run as
before — but with domain-appropriate semantics.

---

## Living Index

This document is the *human-navigable entry point* to Alexandria. The knowledge graph
underneath doesn't need these hard genus/species boundaries — a game design library (IV-C)
is genuinely a hybrid of Software (I) and Media (IV), and the graph should represent that
fluidity. But for the human standing at the front door asking "what do I need?", the genus
taxonomy is the map.

As we encounter new species in the wild, they get added here. As species prove to be
variants of each other, they get merged. The index evolves — but slowly, because its job is
to be stable enough for a newcomer to navigate.
