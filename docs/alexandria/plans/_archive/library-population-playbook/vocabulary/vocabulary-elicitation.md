# Lexicon Elicitation — Per-Category Deep Guidance and Raven's Pegs

For each of the 10 universal categories, this doc names: what the category is, what it's *not*, the common failure modes, the sharpness target, the diagnostic tests Raven runs against any proposed noun, how the category varies across software types, which corpus exemplars to point at, and the Pegs Raven uses to elicit the director's actual product vocabulary.

A Lexicon is bankable at B+ or above (per `grading-rubric.md`). The guidance below is what Raven loads when a director engages a category during a Lexicon session.

**Files Raven loads alongside this one:**
- `families.md` — the per-software-type category-cuts catalog
- `lexicons/<closest-fit>/` — the worked Lexicon Raven proposes as a starting frame
- `grading-rubric.md` — the quality bar applied at draft time and at bank time

---

## Cross-category diagnostics

These apply across every category. Raven runs them continuously, not per-category.

### The MDA inversion guard

> *If the noun describes what the user sees on screen during the moment, it's aesthetics-named. If it describes an object in the orchestrator's state machine, it's mechanism-named.*

Apply to every concept where `user_visible: true`. Mechanism-named user-facing nouns require permanent prose to explain (Stripe's `PaymentIntent`, OpenAI's `Run`). Flag and prompt: "This noun names an engine state — what does the user *feel* in that moment? Try the felt-experience name first; back-fill the mechanism if it earns its keep."

Engine-internals (`user_visible: false`) are exempt — mechanism-naming is fine when the user never encounters the noun.

### The three leak modes

Three distinct failure patterns, each with a different fix:

- **Mechanism-named** — the engine's state-machine leaks (`PaymentIntent`, `Vector Store`, `Runnable`). Fix: name from the felt encounter.
- **Process-named** — the team's *how-we-build* vocabulary leaks (`Sprint`, `Standup`, `Velocity`, `Backlog Grooming`). Fix: name from the product's own concepts, not from the workflow used to ship them. Cycle replaces Sprint when generalizing beyond engineering.
- **Audience-fit drift** — a name that fit audience A is forced onto audience B (Jira's `Sprint` for HR teams). Fix: process-neutralize when broadening audience.

All three are "name leaked from somewhere it didn't belong." Raven runs each as a separate check.

### The two-audience problem

Most B2B products have two audiences for the same data: an *internal operator* (admin/owner/staff/merchant) and an *end customer* (member/guest/shopper/learner). Same person rarely plays both. If the product surfaces both, the Roles category needs the split. Stripe's integrator-vs-marketer split, Shopify's merchant-vs-shopper API split, and Slack's Connect bridge case all instantiate this.

### Facets vs single-category

A concept *genuinely* facets when it operates in multiple categories simultaneously — Linear's Cycle is an addressable Entity AND a recurring Pattern; Duolingo's Streak is an Entity AND an Economy resource AND a Pattern. Multi-facet cards are the exception, not the default. Most concepts sit cleanly in one category. Diagnostic: would removing one of the listed categories lose information? If no, drop it.

### Polysemy detection

When one word covers multiple concepts in the Lexicon (Claude Code's `Plan` = subscription tier vs Plan mode vs plan artifact; Alexandria's `Plan` = pricing tier vs implementation planning artifact), flag the homonym. Either: (1) pick distinct prefLabels for each concept and demote the homonym to altLabel on one of them, or (2) accept the homonym deliberately and document the disambiguation in the Nomenclature Signature.

### Engine-vs-content split (for layered products)

If the product has an engine AND content built on it (Unity vs Hollow Knight; LangChain vs agents-built-on-it; Sanity schema vs entries), the two layers should have *disjoint* vocabularies. Engine nouns belong to designers/builders; content nouns belong to players/end-users. Don't let them bleed.

### Some concepts resist all 10 categories

The clearest case in the corpus: Claude Code's *context window* — budget + surface + memory + capability constraint + pricing axis simultaneously. The form should have an "uncategorizable, multi-facet, owner-coins-a-name" slot for these. Often the most interesting concepts in a product.

---

## 1. Rationale

### Job
The claims layer: theses, principles, governance rules, standards, guardrails. The *why* behind the product's structure. Rationale cards say "we believe X" or "we commit to X" — claims that downstream cards link into via WHY.

### Owner-supplied, not exemplar-supplied
Rationale doesn't get exemplar Lexicons — every product's rationale is its own. The Vision module, the Bets module, and the Guardrails module populate this category directly. The Vocabulary module's job for Rationale is structural: declare the category exists, surface the folder structure (`rationale/principles/`, `rationale/standards/`, etc.), and link to the modules that fill it.

### Failure modes
- **Confusing Rationale with Capabilities.** "We do X" is a Capability; "we believe X is the right way to do it" is Rationale.
- **Confusing Standards with Systems.** A Standard is a binding rule (the threshold a thing must pass); a System is the mechanism that enforces it.
- **Empty stubs.** If the director hasn't done the upstream work (Vision, Bets, Guardrails), Rationale cards stay empty placeholders until those modules run.

### Raven's pegs

**Opener:** "Rationale is the why-layer — your theses, principles, standards. Most of these get filled by the Vision and Guardrails modules, not here. For Vocabulary, the question is: what *kinds* of why-claims does your product organize around? Standards (quality bars)? Principles (load-bearing beliefs)? Theses (positioning claims)? Pick the sub-types you'll use; we'll declare the folders and the upstream modules will populate them."

**Discovery prompts (when sources are thin):**
- "What's a decision you've made about the product that you wouldn't relitigate, and would want a new teammate to honor on day one?"
- "If a maintainer proposed building X tomorrow, what's the existing claim in your product that would tell them no?"

---

## 2. Research

### Job
The findings layer: market research, competitive intel, customer-call evidence, cross-industry analogues, performance data. Research cards capture *what was observed* and *what was learned*, dated and attributed. They link in from Rationale (theses cite Research evidence) and into Patterns (recurring observed behaviors).

### Owner-supplied, not exemplar-supplied
Like Rationale, Research is populated by upstream modules (User Research, Competitive Intel, Decision Trail, Product Evidence — the four areas of the Learning plane in `plan.md`). The Vocabulary module's job: declare the category, surface the folder structure, link to the modules that fill it.

### Failure modes
- **Treating Research as documentation.** Research isn't the README; it's the dated, attributed evidence the team's claims rest on.
- **Banking analytics dashboards.** Research is the *interpreted* finding, not the raw metric.

### Raven's pegs

**Opener:** "Research is what you've observed and learned — customer calls, market reports, cross-industry analogues, performance data. Most products under-bank this; the library is a chance to start. For Vocabulary, the question is: what kinds of evidence does your product reason from? Customer interviews? Analytics? Cross-industry research (the Raven coin came from air-traffic-control studies)? Declare the buckets; upstream modules populate them."

---

## 3. Roles

### Job
Who's involved — the named participants in the product's world. Users, operators, agents, characters. Roles answer "who is the subject of each Capability and the assignee of each Item?" Without named Roles, every other category abstracts into a faceless "user."

### Not the job
- Not segments (`Small Business`, `Enterprise` — those are sales taxonomy)
- Not personas (`The Pragmatist`, `The Innovator` — that's marketing)
- Not titles in a vacuum (`Admin` alone doesn't say what they do; pair with the boundary they own)
- Not the Capabilities the Role can do — the verb is its own category

### Failure modes
- **Single "User" Role.** Conflates two-audience cases. If admin and member do different things, name them separately.
- **Job titles as Roles.** "Senior Engineer" is not a Role; the product doesn't know about seniority. "Member" or "Editor" is.
- **Mixing engine Roles with player Roles.** If your product has internal agents AND end users, name both layers — Cursor names *Developer* (Role) and *Agent* (Role), not "user" for both.
- **Skipping the bridge case.** Cross-tenant collaboration is its own Role (Slack Connect, Notion Guest, Linear Customer) — usually a *sold feature*, always name it.

### Sharpness target
A reader of the Lexicon should be able to list every Role in the product and predict, for each Role, what actions they can take and what data they own.

### Diagnostic tests
- Can a stranger predict what a Role does on a typical Thursday from just the Role's name + one-line definition?
- Does the Role have its own *assignment surface* (who is the Role responsible TO), or is it just a label?
- If two Roles do the same things, you have one Role with two names — pick one and demote the other to altLabel.

### Cross-product variation

| Product family | Role density | Distinctive cuts |
|---|---|---|
| **B2B SaaS productivity** | Medium | Operator/end-user split (Owner+Admin vs Member+Guest); bridge case (Customer/Connect) for cross-tenant |
| **Software-with-agents** | Bright | Multiple agent Roles (main Agent, Subagent, Tool, Hook); the human Operator (Developer/Director); sometimes named Characters (Lily) |
| **Indie gaming** | Medium | Player/Avatar split (Pawn vs Controller from Unreal); NPCs as named Characters; Boss as a Role |
| **E-commerce** | Bright | Merchant + Staff + Customer + Guest + B2B Buyer — five distinct Roles is typical |
| **Gamified-life-OS** | Light | Learner + Friend + Coach + Family-Plan-Member — but most products lean on "you" rather than naming the Role explicitly |

### Exemplars in the corpus
- **Linear's Owner/Admin/Member/Guest/Customer** — clean five-Role partition with the bridge case explicit
- **Hollow Knight's Knight as deliberately nameless** — signature design that the Vessel has no name
- **Cursor's Developer + Agent + Background Agent** — names the four-tier autonomy ladder at the Role layer too
- **Claude Code's User + Agent + Subagent** — clean three-Role split for agent orchestration
- **Duolingo's Lily as a named Character Role** — gamified products bring entertainment Roles into first-class status

### Raven's pegs

**Opener:** "Let's name the Roles. Who shows up in your product? Don't start with the org chart — start with who's *doing things in the product*. I'll propose what I see in your sources; you confirm, edit, add what I missed."

**Discovery prompts (when sources are thin):**
- "When a new account signs up, who's the first person to do something inside the product? What do they call themselves?"
- "Is there an admin/owner role distinct from the day-to-day user role? What can the admin do that a regular user can't?"
- "Does your product cross tenant boundaries? Does someone from outside your customer's workspace ever participate? What do you call them?"

**Sharpening prompts (when a candidate is on the table):**
- "If I read this Role's name to a new hire on day one, what would they assume the Role can do? What would they get wrong?"
- "Is this Role a *who* or a *job description*? 'Admin' is a who; 'Senior Engineer' is a job description that doesn't belong in the product."
- "Does this Role have its own surface? An Inbox? An admin panel? If not, is it a real Role or a permission level?"

**Push-back on generic answers:**
- "'User' is the noun most products skip past. Who *specifically* — what kind of person, doing what kind of work — does your product talk to?"

---

## 4. Domains

### Job
The coverage axes the product addresses — what *kinds of things* the product is for. Hearthfire has 8 ADHD-self-management domains (Daily Living, Time Management, etc.). Shopify has Catalog + Fulfillment + Payments + Marketing. Alexandria has Library Interior + Library Boundary. Domains are the *subject-matter partitioning* the product organizes around.

### Not the job
- Not features (a feature lives *inside* a Domain)
- Not Roles (Domains are the *what*, Roles are the *who*)
- Not Surfaces (Domains can span multiple Surfaces)
- Not Patterns (Domains are subject areas, Patterns are recurring shapes inside them)

### Failure modes
- **Empty Domain layer.** Products with a single subject-matter area can skip Domains. Don't force the category if the product is domain-flat.
- **Domains as marketing pillars.** If "Productivity, Collaboration, Insights" is your homepage hero, those are *positioning*, not Domains.
- **Domains overlapping with Surfaces.** If your "Inventory Domain" is just "the Inventory page," it's a Surface, not a Domain.

### Sharpness target
A new contributor reading the Domain list should be able to predict which Capabilities and Entities live in which Domain.

### Diagnostic tests
- Could you take a new feature spec and confidently file it in exactly one Domain (with rare cross-Domain exceptions)?
- Does each Domain have its own *internal coherence* — would removing one and leaving the rest still produce a complete product?

### Cross-product variation

| Product family | Domain density | Notes |
|---|---|---|
| **B2B SaaS productivity** | Quiet | Most are domain-flat or single-domain |
| **Software-with-agents** | Suspiciously flat | "the codebase" or "the database" usually treated as undifferentiated; under-named |
| **Indie gaming** | Medium | Game's world is divided into named areas (Hollow Knight: Crossroads, Greenpath, City of Tears) |
| **E-commerce** | Medium | Catalog + Fulfillment + Payments + Marketing as the canonical four |
| **Gamified-life-OS** | Bright | Hearthfire's 8 ADHD domains; Duolingo's Course → Section → Unit hierarchy is domain-flavored |

### Exemplars in the corpus
- **Shopify's Catalog/Fulfillment/Payments/Marketing** — e-commerce's canonical four
- **Hollow Knight's five named world areas** — Domains as places in a game
- **Alexandria's Library Interior/Library Boundary** — spatial-metaphor naming

### Raven's pegs

**Opener:** "Domains are the *areas* your product addresses. Not features — areas. Shopify has Catalog, Fulfillment, Payments, Marketing. A meeting-notes tool might have one Domain (notes). A game has its named regions. Many products have *no* Domains worth naming. Should we?"

**Discovery prompts:**
- "If I had to file every Capability your product offers into 3-7 subject buckets, what would the buckets be?"
- "Does your product organize internally by area? Do different sub-teams own different parts? What do they call their parts?"

**Sharpening prompts:**
- "Could a new contributor read this Domain list and predict where to file a new feature?"
- "If we removed this Domain, would the product still feel complete? If yes, it might not be a real Domain — it might be a Surface or a Capability."

---

## 5. Surfaces

### Job
Where work happens. The named places — rooms, screens, panels, tabs, channels, CLIs — that users navigate and act in. Each Surface has its own conventions: what's visible, what's actionable, what's the affordance shape.

### Not the job
- Not the entities visible on the Surface (those are Entities)
- Not the verbs available on the Surface (those are Capabilities)
- Not the URL or route (the technical address is implementation, not vocabulary)
- Not the page title (titles are copy; the Surface is the *kind of place*)

### Failure modes
- **Surface conflated with the Entity displayed on it.** "Issue Page" is a Surface; "Issue" is the Entity. Different cards.
- **Naming the technology, not the encounter.** "React Component" is engine vocabulary; the user encounters a "Dashboard" or a "Drawer."
- **No Surfaces vocabulary at all.** Agentic products are especially guilty here — Cursor's Tab/Inline/Composer/Agent is the cleanest example of *deliberately* naming the surface vocabulary. Most products leave it nameless.
- **Mechanism-named surfaces.** OpenAI's "Run" surface is the engine state machine. Cursor's "Tab" is what the developer sees. Same job, two cuts; one is mechanism-named, one is felt-experience-named.

### Sharpness target
A user could walk through every Surface in the product and describe each in one sentence: what they see there, what they can do there, what surface they came from / go to next.

### Diagnostic tests
- Could a screenshot of this Surface, with the company logo cropped out, still be recognizable as *this product's* Surface to a power user?
- Does each Surface name a *kind of place* the user encounters? Or does it name the data the Surface displays?
- For each Surface: name one verb available there that's not available on any other Surface. If no such verb exists, the Surface might be redundant.

### Cross-product variation

| Product family | Surface density | Distinctive cuts |
|---|---|---|
| **B2B SaaS productivity** | Bright | View / Board / Dashboard / Inbox / Settings — Surfaces are usually well-named because product design is mature here |
| **Software-with-agents** | Bright **and live frontier** | No settled vocabulary yet: streaming surfaces, tool-call indicators, "agent thinking" affordances, diff-review, interrupt/takeover, checkpoint/rollback. Generative naming room. |
| **Indie gaming** | Bright — unusually rich | HUD, World, Map, Inventory, Codex, Save Screen, Shop — each a distinct display mode |
| **E-commerce** | Bright and well-named | PDP, PLP, Cart Drawer, Checkout, Order Confirmation — surfaces with conversion benchmarks attached |
| **Gamified-life-OS** | Medium | Home / Profile / Leaderboard / Shop — felt-experience-named |

### Exemplars in the corpus
- **Cursor's Tab / Inline Edit / Composer / Agent** — the four-tier autonomy ladder named at the Surface layer. Best example of *deliberate* surface naming in agentic software.
- **Hollow Knight's World / Map / Inventory / Charm Screen / Dialogue** — gaming's rich Surface vocabulary
- **Shopify's PDP / PLP / Cart Drawer / Checkout** — e-commerce's named-and-conversion-tracked Surfaces
- **Notion's Database View with six display modes** (Table / Board / Calendar / Gallery / List / Timeline) — naming display modes as named sub-types within a Surface
- **Claude Code's Plan Mode** — naming the *state* a Surface is in (thinking vs acting) as a Surface-flavored noun

### Raven's pegs

**Opener:** "Surfaces are the *places* in your product. Where does the user go to do things? Each Surface is a kind of room — not just a route, a *recognizable encounter*. Let me read your sources and propose what I see; you confirm what's a Surface and what's just a Page."

**Discovery prompts:**
- "Walk me through the product as a new user would — first Surface they land on, second, third. What do they call each one in their head?"
- "Is there a Surface in your product that, if you renamed it, would feel like you'd renamed a Beatles song? That's probably load-bearing."
- "For each Capability we've named, where does it happen? On what Surface? If multiple Capabilities share a Surface, name the Surface."

**Sharpening prompts:**
- "If I see this name out of context, do I picture a *place* or do I picture *data*? Surface names should make me picture a place."
- "Could you make a screenshot of this Surface and have a power user recognize it from the layout, without seeing the logo? If no, the Surface might not be distinctive."
- "Is this Surface name a verb-noun (`Compose Message`) or a noun (`Composer`)? Surface names are usually nouns; the verb belongs to a Capability."

**Push-back on agentic-flat answers:**
- "You're describing all of your AI features as 'the chat.' Cursor named four different surfaces inside what was 'the chat' for everyone else: Tab, Inline Edit, Composer, Agent. Is your product doing the same thing inside one undifferentiated 'chat'? If yes, that's where the unnamed Surfaces are hiding."

---

## 6. Entities

### Job
The noun-objects the product is made of. The things users address, count, link, version. Entities are the *what* — the durable instances users name and reference. Every product has Entities; most products have one *load-bearing* Entity (Linear's Issue, Notion's Page, Shopify's Product, Hollow Knight's Charm).

### Not the job
- Not the Surface the Entity appears on (PDP is a Surface; Product is an Entity)
- Not the Capability that acts on the Entity (Filtering is a Capability; the Issue is the Entity)
- Not the System that orchestrates Entities (Workflow State is a System; Issue is the Entity moving through it)
- Not the Pattern instantiated by Entities (Cart→Order Lifecycle is a Pattern; Cart, Order are Entities along it)

### Failure modes
- **Conflating Product with Variant.** Shopify's Product-vs-Variant cut is canonical: Product is the catalog shell; Variant is the buyable SKU. Failing to make this cut is a common e-commerce vocabulary failure.
- **Inventing the same concept twice.** Notion's Block, Page, and Sub-page sit cleanly; products that have "Note," "Document," and "Page" as three distinct Entities usually have one concept under three names.
- **Mechanism-naming addressable user-facing Entities.** OpenAI's `Run` and `Vector Store` are user-facing Entities in their docs; both are mechanism-named. PaymentIntent is the cautionary tale.
- **Single coarse "Entity" bucket missing the primitives/composites/templates cuts.** Alexandria's library distinguishes Primitive (atomic) vs Component (composed) vs Template (reusable shape) vs Artifact (output). The Entity category is broad; sub-distinguish.

### Sharpness target
A reader of the Lexicon should be able to pick any Entity and answer: what addresses it? What contains it? What's the unit of the next-finer Entity below it (if any)? What lifecycle does it participate in?

### Diagnostic tests
- **The Container/Item pair test:** every product needs a noun for "the thing that holds work" (Workspace/Project/Board/Base) and "the unit of work" (Issue/Task/Card/Record). What are yours? Pick both and hold them across the product.
- **The address test:** can a user refer to this Entity by a unique identifier (Linear's `ENG-123`, Shopify's order number)? If yes, it's a real Entity. If not, it might be an attribute or a tag.
- **The Wright sentence test:** *"Write the user's first three sentences using this noun."* If they don't compose with the verbs in your product, rename the Entity.

### Cross-product variation

| Product family | Entity density | Distinctive cuts |
|---|---|---|
| **B2B SaaS productivity** | Bright | Container/Item pair load-bearing; Sub-items distinct from Sections (ownership vs grouping); facet pairs common (Linear's Cycle as Entity + Pattern) |
| **Software-with-agents** | Bright | Tool / Message / Thread / Memory / Checkpoint — the settled core; multi-facet concepts common (Tool as Entity + Capability) |
| **Indie gaming** | Bright | Items + Currencies + Characters; engine Entities (Component, Actor) strictly disjoint from content Entities (Charm, Bench) |
| **E-commerce** | Brightest | Product/Variant cut sacred; Cart/Checkout/Order lifecycle as named Entities at each state |
| **Gamified-life-OS** | Bright | Currencies (XP, Gems, Hearts) and named milestones (Crown, Streak) as triple-facet Entities |

### Exemplars in the corpus
- **Linear's Issue** — the load-bearing Item noun, with a note about being a near-MDA-inversion case that survived
- **Shopify's Product/Variant pair** — the canonical container-shell vs buyable-unit cut
- **Notion's Block** — the canonical *MDA-survivor* mechanism-name (literally a React node) that works because users feel the bordered unit
- **Hollow Knight's Charm** — folk-fantasy register; aesthetic-named primitive
- **Duolingo's Streak as triple-facet Entity + Economy + Pattern** — the corpus's clearest multi-facet case
- **Alexandria's Card as the load-bearing primitive** — single-syllable Anglo-Saxon per the signature

### Raven's pegs

**Opener:** "Entities are the things in your product — the nouns users address, count, link. Let's start with the *load-bearing* Entity: what's the one noun your product is organized around? Linear is organized around Issues. Notion around Pages. Shopify around Products. You?"

**Discovery prompts:**
- "If I deleted every other Entity from your product and kept only one, which one would still make the product recognizable? That's your load-bearing Entity."
- "What's the smallest unit of work in your product — the thing a user creates, edits, and tracks? And what's the container that holds many of those units?"
- "Are there Entities your product *creates* (outputs, deliverables) that are distinct from the Entities your product *operates on*? Name both."

**Sharpening prompts:**
- "Can you write me three sentences a user would say using this noun? If they don't compose with the other verbs in your product, the noun is misshapen."
- "If a user pastes this Entity's name into a chat with a colleague, will the colleague know what they mean without explanation? If no, the noun is either mechanism-named or under-defined."
- "Does this Entity have a unique address (Issue #123, Order #45678)? Or is it part of another Entity's identity? Sub-items take the parent's address; standalone Entities have their own."
- "Is this Entity *the same thing* as one we already named, under a different word? Polysemy check — let's not bifurcate the same concept."

**Push-back on bloated Entity lists:**
- "You've listed 14 Entities. Most products have one load-bearing Entity and 4–6 supporting ones. Are some of these actually Capabilities (verbs) or Surfaces (places) misfiled here?"

**Facet check:**
- "Does this Entity *also* live in Patterns (it's a recurring shape) or Economy (it's a resource flow)? If yes, it's a facet card; mark both categories in frontmatter."

---

## 7. Capabilities

### Job
The verbs the product affords — what users *do* in the product. Each Capability is one specific action: Filtering, Assigning, Atomizing, Forging, Adding-to-Cart. Capabilities are the *how* at the action layer (one verb each); Systems are the *how* at the architectural layer (assemblies of multiple Capabilities + Entities + rules).

### Not the job
- Not the Surface where the Capability happens (a Capability can run from multiple Surfaces)
- Not the Entity the Capability acts on (Filtering is the Capability; Issue is the Entity being filtered)
- Not the System orchestrating multiple Capabilities (Quest Engine is a System; Foraging is a Capability inside it)
- Not the Pattern the Capability participates in (Lifecycle is a Pattern; Refunding is a Capability that moves an Order along that lifecycle)

### Failure modes
- **Capability named as a noun.** Linear uses gerunds (Filtering, Assigning) per its signature; Cursor uses bare verbs (Apply, Index) per its dev-tool register. Pick a convention and hold it; mixing produces inconsistency.
- **Engineering-named Capabilities.** "Vector Embedding" describes the mechanism; the user-facing Capability is "Semantic Search."
- **Capability that's actually a System.** "Inventory Management" is a System (many Capabilities coordinated). "Adding to Inventory" is a Capability (one verb).
- **Capability without an Entity.** Capabilities act on Entities. If your Capability has no Entity, it might be an event or a state-transition, not a Capability.

### Sharpness target
Each Capability is one specific action. A user could describe completing it in one sentence. The Lexicon should let a reader list all Capabilities and predict which Entities each one acts on.

### Diagnostic tests
- **The single-verb test:** can this Capability be described as one verb-and-object? "Filter issues by assignee" — yes. "Manage the workflow" — no, that's a System.
- **The convention test:** does this Capability's name match the product's verb convention (gerund vs bare verb)?
- **The Entity-pair test:** what Entity does this Capability act on? If you can't name one, the Capability isn't atomic.

### Cross-product variation

| Product family | Capability density | Conventions |
|---|---|---|
| **B2B SaaS productivity** | Medium | Gerunds (Filtering, Assigning, Commenting); 5-10 capabilities is typical |
| **Software-with-agents** | Densest category | Tool calling, Skill invocation, Subagent dispatch, Plan-and-execute — atomic capabilities the agent loop composes |
| **Indie gaming** | Bright | Player verbs: Foraging, Crafting, Dashing, Casting. Often the most-named category. |
| **E-commerce** | Medium | Add-to-Cart, Apply Discount, Checkout (verb), Fulfill, Refund — lifecycle-driven |
| **Gamified-life-OS** | Light | Completing a Lesson, Practicing, Listening, Speaking — modality-specific |

### Exemplars in the corpus
- **Alexandria's gerund-Capabilities** (Banking, Atomization, Grading, Briefing) — clean -ing form throughout
- **Cursor's bare-verb Capabilities** (Apply, Index, Tab Completion) — dev-tool register
- **Hollow Knight's Wall-Jumping as retroactive-unlock Capability** — gameplay-defining
- **Shopify's Refunding as `[Capabilities, Economy]` facet** — the action AND the economy event

### Raven's pegs

**Opener:** "Capabilities are what users *do* in your product. Verbs. Not features — verbs. 'Search' is a Capability. 'Search functionality' is a feature description. Let's list the things users do, named as verbs."

**Discovery prompts:**
- "What's the first thing a user does when they open your product? Name it as a verb."
- "List every action a user can take that produces a state change. Each one is a candidate Capability."
- "Are there Capabilities only certain Roles can do? Note those — Permission Model will pair Roles with Capabilities."

**Sharpening prompts:**
- "Can you complete this Capability in one verb-and-object sentence? If not, it might be a System (many Capabilities) or a Pattern (a recurring sequence)."
- "Does this Capability match your verb convention? Linear's gerunds; Cursor's bare verbs. Either works; consistency matters."

---

## 8. Systems / Mechanics

### Job
The assemblies — bigger-shape architectures that combine Capabilities + Entities + rules into a coordinated mechanism. A System has internal structure (sub-rules, state transitions, sub-states). Examples: Hollow Knight's Charm Notch System (loadout economy); Alexandria's Quality Grading Engine (grading mechanism); Linear's Workflow State (state machine over Issues).

### Not the job
- Not a single Capability (one verb = Capability; a coordinated mechanism = System)
- Not a Domain (Systems live *inside* Domains)
- Not a Surface (Surfaces are encountered; Systems are *operated* — often invisibly)
- Not Patterns (Systems are *architectures*; Patterns are *recurring shapes* that may or may not have a System behind them)

### Failure modes
- **System named as the Entity it produces.** "Briefing" is a Capability or an output (Entity); "Bridget the Briefer" is a Role; "Briefing System" is the architecture coordinating them. Don't conflate.
- **System named at the wrong abstraction.** "User Authentication" can be a System (the whole login flow) or a Capability (the act of authenticating). Pick a level and hold it.
- **`user_visible: true` set on engine Systems.** Most Systems are engine-internal — users feel their effects, not their nouns. Default to `user_visible: false` for System cards; flip true only when the System surfaces as a named user concept.

### Sharpness target
Each System has a clear job (one sentence), names the Capabilities and Entities it coordinates, and either surfaces to users (with a felt-experience name) or stays internal (with a mechanism-acceptable name).

### Diagnostic tests
- **The architectural-layer test:** does this System coordinate multiple Capabilities and Entities? Or is it a single verb that should be a Capability?
- **The user-visibility test:** would a user say "the System did X" or "X happened"? If the latter, `user_visible: false`. Most Systems sit here.
- **The convention test:** does this System's name match the product's convention? Alexandria uses "<Function> Engine." Hollow Knight uses "Mechanic" or "System."

### Cross-product variation

| Product family | System density | Conventions |
|---|---|---|
| **B2B SaaS productivity** | Contested | Linear and Notion expose mechanism (Workflow State, Relation, Rollup); Trello and Basecamp hide it. Decide which you are. |
| **Software-with-agents** | Bright | Tool Dispatcher, Plan-mode, Sampling, Memory, MCP integration — usually engine-side |
| **Indie gaming** | Bright | XP System, Crafting System, Quest Engine, Charm Notch System — usually engine-named |
| **E-commerce** | Medium | Inventory Reservation, Payment Authorization, Tax Calculation — engineering-side |
| **Gamified-life-OS** | Medium | Streak Engine, Heart Regeneration, XP System — usually engine-side, user feels their effects |

### Exemplars in the corpus
- **Alexandria's "Quality Grading Engine"** — `<Function> Engine` convention
- **Hollow Knight's Charm Notch System** — gameplay-defining mechanic
- **Claude Code's Tool Dispatcher** — engine-internal, `user_visible: false`
- **Shopify's Payment Authorization vs Capture** — two-phase commit named as a System

### Raven's pegs

**Opener:** "Systems are the bigger mechanisms — architectures that combine multiple Capabilities and Entities into a coordinated whole. Most Systems are engine-internal; users feel their effects but don't address them as nouns. Let's identify the architectures your product runs on, then decide which surface as concepts."

**Discovery prompts:**
- "What's a feature in your product that's actually three or four Capabilities coordinated by rules? That's probably a System."
- "What runs *between* Capabilities — the things that coordinate, queue, route, retry? Each is a candidate System."
- "What was a System that started life as just a feature and grew into its own architecture? Those are the load-bearing Systems."

**Sharpening prompts:**
- "Is this a single verb or an assembly? Single verb = Capability. Assembly = System."
- "If we removed this System, would users notice immediately or only over time? Immediate = it's user-visible (rare); over time = engine-internal (typical)."

---

## 9. Patterns

### Job
The recurring shapes — loops, journeys, lifecycles, sequences — that play out across Entities and Capabilities. Patterns name the *temporal* and *structural* shapes the product instantiates. Cart→Checkout→Order is a Pattern (lifecycle). Run-vs-meta state is a Pattern (state-scope distinction). Retroactive Unlock is a Pattern (Metroidvania's defining shape).

### Not the job
- Not the Entities along the Pattern (Cart, Order are Entities; the lifecycle they participate in is the Pattern)
- Not the System orchestrating the Pattern (the state machine is a System; the lifecycle is a Pattern that names the shape)
- Not a single Capability (Refunding is a Capability; Cart→Refund→Returned is the Pattern)

### Failure modes
- **Pattern as anything that "repeats."** A Pattern is a *named recurring shape* with a clear before/after. "Users open the app" is not a Pattern; "Daily Engagement Loop" is.
- **Lifecycle Pattern left unnamed.** Every product has a state machine for its core Entity (Cart→Order; Backlog→Done; Active→Death→Meta-progression). Name it as a Pattern; cards link to each state by name.
- **Confusing Pattern with Capability.** Triaging an Issue is a Capability; the Triage queue-and-routing rhythm is a Pattern.

### Sharpness target
Each Pattern is a named recurring shape with a clear set of states or steps. A reader can describe what happens *before* the Pattern starts and what's true *after* it completes.

### Diagnostic tests
- **The lifecycle test:** does your product have a state machine for its core Entity? Name it as a Pattern. Each state name is a noun; the Pattern is the recurring movement through them.
- **The composition test:** does this Pattern compose multiple Capabilities into a recurring sequence? If yes, it's a Pattern. If it's one Capability, it's not.
- **The scope test:** does this Pattern recur at a known cadence (daily, per-run, per-Cycle, per-Order)? Name the cadence.

### Cross-product variation

| Product family | Pattern density | Distinctive cuts |
|---|---|---|
| **B2B SaaS productivity** | Bright | Cycle (time-box), Triage (incoming routing), Workflow (state machine), Activity Feed (change stream) |
| **Software-with-agents** | Medium | Plan-Then-Act, Tool-Use Loop, ReAct, Save-React, Human-in-the-Loop |
| **Indie gaming** | Brightest | Run-vs-meta, Retroactive Unlock, State-Capture-with-Cost (Bonfire), Lock-and-Key Gating, Temporal Scope (Deck/Hand/Discard/Exhaust) |
| **E-commerce** | Bright — lifecycle dominant | Cart-to-Order Lifecycle, Catalog Fanout, Abandoned-Cart Recovery, Two-Audience API Split |
| **Gamified-life-OS** | Bright | Daily Engagement Loop, Weekly League Cycle, Streak Recovery, Spaced Repetition |

### Exemplars in the corpus
- **Shopify's Cart-to-Order Lifecycle** — the canonical lifecycle-as-Pattern, names each state as a noun
- **Hollow Knight's Retroactive Unlock** — Metroidvania-defining; cite when explaining the "old surface gains new affordance" cut
- **Duolingo's Streak Recovery Pattern** — Freeze (preventive) + Repair (post-loss); families.md called this the canonical gamified-life-OS Pattern
- **Linear's Triage Pattern** — incoming-routing rhythm with cadence
- **Claude Code's Save-React** — the canvas-style discipline

### Raven's pegs

**Opener:** "Patterns are the recurring shapes in your product. Lifecycles. Daily rhythms. State machines. The thing that happens over and over the same way. Let's name them — every product has at least one, usually three or four."

**Discovery prompts:**
- "What's the state machine your core Entity moves through? Name each state. The whole machine is a Pattern; each state is part of the Pattern's shape."
- "Does your product have a daily rhythm users return to? A weekly cycle? A per-session loop? Each is a candidate Pattern."
- "Is there a recurring shape borrowed from outside your category — air-traffic-control sectors, kitchen pass, gaming lifecycle — that names something your product also does? Name the borrow."

**Sharpening prompts:**
- "Does this Pattern have a clear start and end? Name them. If the Pattern is ambient, name the cadence."
- "What's the *cadence* of this Pattern? Per-Order? Per-Cycle? Per-day? Per-Run? Cadence is part of the Pattern's identity."
- "Could you describe what's true *before* this Pattern starts vs *after* it completes? If you can't, the Pattern isn't sharply scoped."

---

## 10. Economy

### Job
Closed-loop flow systems — currencies, resources, scarcities, tiers, sinks and sources. Economy nouns have different math than Entities: they accumulate, flow, drain, balance. Hearts, Gems, XP, Streak, Tax Class, Reserved Stock, Seat, Plan — all are Economy.

### Not the job
- Not pricing pages (those are marketing, not vocabulary)
- Not Entities that *also* happen to flow (a Cart contains line items but the Cart isn't an Economy noun; line items are Entities)
- Not the System orchestrating the flow (Inventory Reservation is a System; Reserved Stock is the Economy resource)
- Not a Capability (Refunding is a Capability; Refund-as-economic-event is the Economy facet)

### Failure modes
- **No Economy category at all in products that have one.** B2B SaaS productivity often hides Economy in pricing tiers and Seat counts that aren't surfaced as product nouns. If your product has resource math, name it.
- **Economy noun named for the mechanism instead of the felt resource.** "Token Budget" is mechanism; "Hearts" or "Energy" is felt. (Both work in their context; pick the right register.)
- **Conflating Currency with Reward.** Currency is fungible (spend anywhere); Reward is one-time (acquired and used). Different sub-types.

### Sharpness target
Each Economy noun has a flow: source (where it comes from) and sink (where it goes). A reader can describe how the Economy noun accumulates, what it converts to, and what scarcity it represents.

### Diagnostic tests
- **The flow test:** name the source and the sink. If neither exists, it might not be Economy — it might be an Entity.
- **The accumulation test:** does this noun have a count (XP balance, Geo total, Reserved Stock count)? Economy nouns usually do.
- **The closed-loop test:** is the supply bounded by gameplay/business rules? Open-loop currencies (anyone can mint) are different from closed-loop (controlled emission).

### Cross-product variation

| Product family | Economy density | Notes |
|---|---|---|
| **B2B SaaS productivity** | Thin | Seat / Plan / Tier — most products stop there |
| **Software-with-agents** | Quiet — and a gap | Token cost, rate limits, context-window budgets exist but aren't first-class nouns. Context Window is the candidate noun. |
| **Indie gaming** | Bright | Currency (Geo, Souls, Lingots), Rarity Tiers (Common→Legendary), Inventory limits, Charm Notches |
| **E-commerce** | Brightest | Inventory, Stock, Reserved, Discount, Tax Class, Currency, Price List, Subscription Tier — densest of any family |
| **Gamified-life-OS** | Bright | XP, Gems, Hearts, Streak, Freeze (meta-resource), League (tier), Super (subscription) |

### Exemplars in the corpus
- **Duolingo's Freeze as meta-resource** — protects another resource (the Streak); 48% retention lift per Duolingo's reports
- **Hollow Knight's Geo/Soul/Mask as facet pairs** — each is an Entity AND an Economy; both cards
- **Shopify's Reserved Stock** — intermediate state between Stock (Economy) and Fulfilled (Order)
- **Claude Code's Context Window** — the un-named noun families.md flagged as the next vocabulary frontier
- **Linear's Bridge Customer** — Customer as Economy unit (cross-tenant collaboration as Plan feature)

### Raven's pegs

**Opener:** "Economy is the resource layer — things that flow, accumulate, drain. Most products have at least Seats and Plan tiers. Games have rich Economies (XP, currencies, scarcity tiers). Let's name what flows."

**Discovery prompts:**
- "What's something users *accumulate* in your product? A balance, a count, a progress bar that fills?"
- "What's the scarcity in your product? What runs out? What has a limit? Name the limit's currency."
- "Does your product have tiers — Free / Pro / Max? Name them. Subscriptions live in Economy."

**Sharpening prompts:**
- "Name the source and the sink for this Economy noun. If both don't exist, the noun might be an Entity, not an Economy item."
- "Is this Economy noun *felt* or *engineered*? Streak is felt; Token Budget is engineered. Pick the register that fits your audience."
- "Is there a *meta-resource* that exists only to protect another resource? (Freeze protects Streak.) Those are uniquely powerful; name them when they exist."

---

## How Raven uses this guide

At draft time:
1. **Read families.md first** to find the closest-fit Lexicon to propose as a starting frame.
2. **Read the relevant `lexicons/<closest-fit>/` cards** to seed concrete vocabulary candidates.
3. **For each category the director engages, load that category's section here** for Job/failure-modes/diagnostics + the Pegs script.
4. **Apply the cross-category diagnostics continuously** as candidates are proposed — MDA inversion, three leak modes, two-audience, facets, polysemy, engine-vs-content.
5. **Cite specific corpus exemplars** when proposing or sharpening — concrete beats abstract every time.

At bank time, this doc becomes the runtime quality bar (alongside `grading-rubric.md`).
