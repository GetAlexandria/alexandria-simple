# Vocabulary Families — software-type catalog

A reviewable, choosable catalog of suggested organizing structures and recommended vocabularies for the four software types Alexandria's target market builds. Raven loads this at draft time and offers the closest-fit family (or a mix) to the director after reading the product's sources. Directors pick, mix, or ignore.

## How to read this

Each family has four blocks:

1. **Worked exemplars** — 2–4 shipped products that demonstrate this family well, with public docs URLs.
2. **This way of organizing** — the suggested category structure. Which of the 10 universal categories light up for this kind of product, with the sub-cuts the established frameworks in this space teach.
3. **Using these words** — the recommended vocabulary inside that structure. Each noun with a one-line definition.
4. **Specific recommendations** — actionable do-this-not-that pulled from the research briefs.

The 10 universal categories: **Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Systems/Mechanics · Patterns · Economy.**

Two of the 10 don't get family entries. **Rationale and Research are owner-supplied, not exemplar-supplied** — they describe why-this-exists and what-we-found, both of which live in the director's own product layer, not in the platform layer the exemplars publish. The director fills these directly from their own sources.

---

## Family 1 — B2B SaaS, productivity / collaboration

**Worked exemplars**

- **Linear** — [docs](https://linear.app/docs), [method](https://linear.app/method). Cleanest split of scope (Project) from time (Cycle) from strategy (Initiative).
- **Notion** — [help](https://www.notion.com/help), [developers.notion.com](https://developers.notion.com). The Page-vs-Database cut.
- **Slack** — [api.slack.com](https://api.slack.com), [help](https://slack.com/help). Three visibility shapes (Channel/DM/Thread); the only mature decoupling of Workspace's three meanings.
- **Asana** — [guide](https://asana.com/guide). Project/Section/Task/Subtask containment.

### This way of organizing

Every productivity SaaS picks a position on two axes: **Document vs Record** (prose-shaped vs row-shaped content) and **Container vs Item** (what holds work, what the unit of work is). The shape of that pair is the product's identity. Two-audience is real but usually inside a single tenant — operators (admin/owner) and end-users (member/guest) — not across two corpora the way Stripe runs.

| Universal category | What lights up here | Sub-cuts to consider |
|---|---|---|
| **Roles** | Bright | Internal Operator (Owner/Admin) vs End Customer (Member/Guest) — the same person rarely plays both. Bridge case (Slack Connect / Notion Guest / Linear Customer) gets its own noun because it's a sold feature. |
| **Domains** | Quiet | Most products in this category are domain-flat or single-domain. If your product spans domains, name them — but don't invent the category if it's empty. |
| **Surfaces** | Bright | View / Board / List / Calendar / Gantt / Dashboard / Page / Settings. Surfaces are usually the user's day-to-day vocabulary. |
| **Entities** | Bright | The Container/Item pair is load-bearing. Pick one Container noun and one Item noun and hold them across the product. |
| **Capabilities** | Medium | Search, Filter, Sort, Share, Assign, Comment, Notify, Schedule. The verbs the product affords. |
| **Systems/Mechanics** | Contested | Linear and Notion expose mechanism (Workflow State, Relation, Rollup, Formula); Trello and Basecamp hide it. Decide which you are. |
| **Patterns** | Bright | Cycle (time-box), Triage queue, Activity feed, Notification routing, Permissions cascade. |
| **Economy** | Thin | Seat-based pricing is the only economic vocabulary in most products. Multi-tenancy isolation (Silo/Pool/Bridge) stays engineering-internal unless your customers reach for it — only the Bridge case (cross-tenant collaboration as a sold feature) gets a user-facing noun. |

### Using these words

#### Roles

| Noun | One-line definition |
|---|---|
| **Owner** | The customer-side account holder; usually the billing contact. |
| **Admin** | Workspace-level configuration rights without billing ownership. |
| **Member** | A user with access to the workspace; consumes a seat. |
| **Guest** | A user with limited access; usually doesn't consume a seat. |
| **Bridge** (e.g. Connect Customer / External Member) | A user from a different tenant collaborating across the boundary. Name this if you sell cross-tenant collaboration. |

#### Entities

| Noun | One-line definition |
|---|---|
| **Workspace** | The top-level tenant boundary. Declare its semantics: billing boundary, access boundary, vocabulary boundary, or all three. Most products conflate; be intentional. |
| **Container** (pick one: Project / Board / Base / Space) | The unit that holds work. One word, used everywhere. |
| **Item** (pick one: Issue / Task / Card / Page / Record) | The unit of work itself. One word, used everywhere. |
| **Sub-item** (Subtask / Sub-issue) | A nested unit with independent ownership and rollup. Distinct from "Section" (visual grouping with no ownership). |
| **Document** vs **Record** | If you have both: Documents are prose-shaped; Records are row-shaped queryable collections. Name each. |

#### Surfaces

| Noun | One-line definition |
|---|---|
| **View** | A queried, filtered, or sorted display of Items. Board, List, Calendar, Gantt, Kanban are View types. |
| **Dashboard** | A multi-widget composed surface, usually read-only. |
| **Settings** | Workspace-level configuration surface. |
| **Activity Feed** | Time-ordered display of changes across the workspace. |
| **Inbox / Notifications** | User-scoped pending-attention surface. |

#### Capabilities

| Noun | One-line definition |
|---|---|
| **Search** | Find Items across the workspace by query. |
| **Filter / Sort** | Constrain or order the current View's contents. |
| **Assign** | Set an Item's owner. |
| **Comment / Mention** | Add discussion to an Item; tag a Role. |
| **Share / Invite** | Grant access to a Role or external Bridge. |
| **Schedule** | Bind an Item to a time. |

#### Systems / Mechanics

| Noun | One-line definition |
|---|---|
| **Workflow State** | The named state an Item is in (Backlog / Triage / In Progress / Done — customize). |
| **Permission** | A grant of action-rights to a Role on a Container or Item. |
| **Notification Routing** | The rules that decide who gets pinged when what changes. |
| **Relation / Rollup** (if Database-shaped) | Link Items across Tables; compute derived fields. |

#### Patterns

| Noun | One-line definition |
|---|---|
| **Cycle** | A recurring time-box that bounds a Container's work. Use this; not "Sprint" unless your customers are exclusively engineering teams. |
| **Triage** | The pattern of routing new Items to their next state. |
| **Activity feed** | Time-ordered event stream surfaced as both Pattern and Surface. |

#### Economy

| Noun | One-line definition |
|---|---|
| **Seat** | A licensed user slot. |
| **Plan / Tier** | A bundle of seats + features + limits at a price point. |
| **Bridge / Connect** | Cross-tenant collaboration; usually a billable feature. |

### Specific recommendations

- **Pick one Container noun and one Item noun, hold them.** Don't mix Project + Board in the same product. The pair IS the product's identity.
- **Declare your Workspace's boundary semantics explicitly.** Is it a billing boundary, an access boundary, a vocabulary boundary, or all three? Most products conflate; the leak shows up later when you try to add cross-tenant features. Slack Connect's "notoriously hard to explain" is the cautionary tale.
- **Use Cycle, not Sprint** — unless your audience is strictly engineering teams. Sprint is process-vocabulary that fails to generalize. Jira's leak to HR/Legal teams is the cautionary case; Linear's deliberate fix is the model.
- **Watch for process-vocabulary leak.** Sprint, Standup, Backlog Grooming, Velocity — these are how teams *build* software, not what's *inside* it. Don't ship them as product nouns unless the audience is the team that uses them.
- **Don't surface multi-tenancy isolation vocabulary** (Silo / Pool / Bridge) unless customers buy across the boundary. Most users never need it; engineering can keep it.
- **The Block primitive (Notion-style) earns its keep only when the UI surfaces the bordered visual unit.** Don't expose Block as a noun in a product where the user doesn't see blocks.

---

## Family 2 — Software-with-agents-in-it

**Worked exemplars**

- **Cursor** — [docs](https://cursor.com/docs). Tab / Inline edit / Composer / Agent as a four-tier autonomy ladder.
- **Claude Code** — [docs](https://code.claude.com/docs). Tool / Skill / Subagent / Hook separation; Plan mode as a named user-facing state.
- **OpenAI Assistants API** — [docs](https://platform.openai.com/docs/assistants). Assistant / Thread / Run / Run Step as persona-conversation-execution split (also the cleanest mechanism-leak example: `Run`, `Vector Store`).
- **LangChain / LangGraph** — [docs](https://docs.langchain.com). Chain vs Agent (deterministic vs planning loop); Tool as lingua franca.
- **MCP (Anthropic)** — [spec](https://modelcontextprotocol.io). Tool / Resource / Prompt as three server-side primitives; Sampling / Elicitation as client-side.

### This way of organizing

This is the most pre-paradigmatic of the four families — vocabulary is still settling. The settled core is **Agent / Tool / Message / Memory**, with **Thread/Session/Conversation** converging as the durable transcript object. The unsettled terms are **Skill** (means three incompatible things across products), **Workflow / Flow / Chain / Graph** (four names for the same deterministic-multi-step idea), and **Plan** (artifact vs mode vs internal step). Two layers usually exist — the agent framework and the agents built on it — and Vocabulary should make that split a top-level cut, not let the two bleed.

| Universal category | What lights up here | Sub-cuts to consider |
|---|---|---|
| **Roles** | Bright | Agent (LLM-loop-driven) vs Tool (atomic function) vs Subagent (separately-context-windowed agent the lead delegates to) vs Operator (human-in-the-loop). |
| **Domains** | Suspiciously flat | Most agentic software treats "the codebase" or "the database" as an undifferentiated context blob. If your agents specialize by domain, name the domains — most products under-do this. |
| **Surfaces** | Bright — and the **live frontier** | No settled vocabulary yet for streaming-token surfaces, tool-call-in-progress indicators, "agent thinking" affordances, diff-review surfaces, interrupt/takeover surfaces, checkpoint/rollback surfaces. Most generative naming room of any family. |
| **Entities** | Bright | Message, Thread/Session, Document, Node, Vector Store, Checkpoint, File. Watch for mechanism-leak. |
| **Capabilities** | Densest category | Tool / Function / Skill — be precise about which you mean. |
| **Systems/Mechanics** | Bright | Loop, Plan, Run, Reasoning, Sampling, Workflow, Process. Most leak when surfaced to users. |
| **Patterns** | Medium | ReAct, RAG, Tool-use, Planner-executor, Human-in-the-loop. These are pattern-named per the literature; usually internal. |
| **Economy** | Quiet — **and a gap.** | Token cost, rate limits, and context-window budgets exist everywhere but aren't first-class nouns in any framework. Probably the next vocabulary frontier; consider naming your own. |

### Using these words

#### Roles

| Noun | One-line definition |
|---|---|
| **Agent** | An LLM-driven loop that chooses what to do next given goal + tools + context. |
| **Subagent** | An Agent invoked by another Agent with a separate context window for a bounded task. |
| **Tool** | An atomic capability the Agent can call (read file, run command, search). The settled lingua franca term. |
| **Operator** (the human) | The user directing the Agent. Use a felt-experience name (Director, Pilot) rather than "User" if your product casts the operator as collaborator vs subject. |

#### Entities

| Noun | One-line definition |
|---|---|
| **Message** | A single turn in a Thread. |
| **Thread** / **Session** / **Conversation** | The durable transcript of Messages between Operator and Agent. Pick one term. |
| **Brief** / **Context** | The bundle of information handed to an Agent at task start. Brief = composed; Context = ambient. |
| **Memory** | Information the Agent retains across sessions. |
| **Checkpoint** | A captured state the Agent can roll back to. |
| **Knowledge** / **Document** / **Source** | Retrievable reference material. |

#### Surfaces

| Noun | One-line definition |
|---|---|
| **Composer / Chat** | The Operator's input surface to the Agent. |
| **Tab** (Cursor) / **Inline Edit** | Selection-scoped autonomous suggestion. |
| **Plan Mode** (Claude Code) | Named state where the Agent thinks but doesn't act. |
| **Stream** | The live token-by-token render of an Agent's output. |
| **Diff Review** | Surface where the Operator approves or rejects Agent-proposed changes. |
| **Interrupt** / **Takeover** | The Operator's affordance to pause or override the Agent loop. |

#### Capabilities

| Noun | One-line definition |
|---|---|
| **Tool call** | A single Tool invocation within an Agent loop. |
| **Skill** (Claude Code sense) | A packaged repeatable workflow with instructions, distinct from a Tool. **Pick a definition and hold it** — Skill means different things in different products. |
| **Hook** (Claude Code) | Deterministic shell side-effect bound to lifecycle events, outside the LLM loop. |

#### Systems / Mechanics

| Noun | One-line definition |
|---|---|
| **Loop** | The Agent's plan-act-observe cycle. |
| **Plan** | Either: an artifact (Devin, Copilot Workspace), a mode (Claude Code), or an internal step (LangChain). Pick one meaning. |
| **Workflow** / **Chain** / **Flow** / **Graph** | Same idea — a deterministic multi-step pipeline. Pick one term and stick. |
| **Reasoning** | The Agent's internal thinking trace (sometimes surfaced as Stream, sometimes hidden). |

#### Patterns

| Noun | One-line definition |
|---|---|
| **ReAct** | Reason-then-act loop pattern (Yao et al. 2022). |
| **RAG** (Retrieval-Augmented Generation) | The retrieve-then-generate pattern. |
| **Planner-Executor** | One Agent plans, another executes. |
| **Human-in-the-Loop** | Operator approval gates inside the Agent loop. |

#### Economy (under-named — the frontier)

| Noun | One-line definition |
|---|---|
| **Context Window** | The Agent's budget for prompt + memory + tool outputs. Currently fractured across budget/surface/memory/capability/pricing axes. Likely candidate for a coined product-level term. |
| **Token cost** | The currency unit of an Agent's work. |
| **Rate limit** | Throughput ceiling per Operator or workspace. |

### Specific recommendations

- **Use "Tool" — it's lingua franca.** MCP, OpenAI, LangChain, Claude Code, Cursor, CrewAI, LlamaIndex, Vercel all converge here. Don't reinvent.
- **Don't ship "Skill" without defining it.** Three products mean three different things by it. If you use it, declare which sense.
- **MDA inversion is rampant in this category — guard hard.** Diagnostic: *"if the noun describes what the user sees on screen during the moment, it's aesthetics-named; if it describes an object in the orchestrator's state machine, it's mechanism-named."* `PaymentIntent`'s agentic equivalents are `Run`, `Run Step`, `Vector Store`, `Runnable`, `Sampling`.
- **Surface vocabulary is the live frontier — don't borrow blindly.** Cursor's Tab and Composer, Claude Code's Plan Mode and Checkpoint, v0's Block, Copilot Workspace's Specification/Plan/Implementation/Test are all aesthetic-named and working. If your product invents a new agent UI element, name it from the Operator's encounter.
- **Name the engine-vs-content split as a top-level cut.** If your product has an Agent framework AND agents built on it, those two layers have *disjoint* vocabularies. Surface that split; don't let "the framework's Chain" leak into "the user's Chain."
- **Consider coining a Context Window-level noun.** No framework has named the budget+surface+memory+capability+pricing axis as a single first-class concept. This is your chance.

---

## Family 3 — Indie gaming (incl. gamified-life-OS)

**Worked exemplars**

- **Engine layer**: Unity ([docs](https://docs.unity3d.com/Manual/)), Unreal ([docs](https://dev.epicgames.com/documentation)), Godot ([docs](https://docs.godotengine.org)). Pawn-vs-Controller, GameObject-vs-Component, Signal-as-decoupling.
- **Genre exemplars**: Hollow Knight (Metroidvania), Hades / Balatro / Slay the Spire (Roguelike), Stardew Valley (Sim), Dark Souls (Soulslike).
- **Gamified-life-OS**: Duolingo ([blog](https://blog.duolingo.com)), Habitica ([habitica.com](https://habitica.com)), Hearthfire (Alexandria customer).
- **Design literature**: MDA paper (Hunicke/LeBlanc/Zubek, [PDF](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)).

### This way of organizing

Games name **aesthetics-inward** — Streak, Bonfire, Run, Crown — the opposite pole from Stripe's mechanism-outward. The engine-vs-content split is severe: Unity/Unreal vocabulary (Component, Actor, Blueprint) is *totally disjoint* from per-game vocabulary (Charm, Stag, Boon). Players never see engine nouns; designers live in both. For gamified-life-OS products, the lessons port selectively — player-side aesthetics (Streak, XP, Quest) port cleanly; engine internals (Tick) and antagonistic mechanics (Permadeath) don't.

| Universal category | What lights up here | Sub-cuts to consider |
|---|---|---|
| **Roles** | Medium | Player vs Designer/Developer vs NPC. For gamified-life-OS: Player vs Coach (the human or AI guiding). |
| **Domains** | Medium | Coverage areas of the game (Combat, Exploration, Crafting, Social) or — for gamified-life-OS — the life domains addressed (Hearthfire: 8 ADHD-self-management domains). |
| **Surfaces** | Bright — unusually rich | HUD, World, Map, Inventory, Codex, Pause Menu, Settings, Save Screen, Shop. Each is a distinct display mode. |
| **Entities** | Bright | Item, Material, Character/Avatar, Save, Quest, Building. |
| **Capabilities** | Bright | Foraging, Crafting, Combat, Exploration, Dialogue. The player's verbs. |
| **Systems/Mechanics** | Bright — engine-named | XP system, Crafting system, Quest engine, Economy, Difficulty curve. Usually engine-side; players don't see these as nouns. |
| **Patterns** | Brightest in this family | Run-vs-meta-state, Retroactive unlock, State-capture-with-cost, Temporal scope (Deck/Hand/Discard/Exhaust), Lock-and-key gating, Boss-phase escalation. |
| **Economy** | Bright | Currency (Gems / Lingots / Souls), Resource flow (sink/source balance), Inventory limits, Rarity tiers. Closed-loop, first-class. |

### Using these words

#### Roles

| Noun | One-line definition |
|---|---|
| **Player** / **Avatar** | The user's representation in the world (Unreal: Pawn). |
| **Controller** | The agent piloting the Avatar (Unreal split — useful for any product where identity ≠ acting body). |
| **NPC** | A non-player character with dialogue or quests. |
| **Coach** (gamified-life-OS) | The human or AI guide present in the user's loop. |

#### Entities

| Noun | One-line definition |
|---|---|
| **Item / Material / Provision** | A collectible or consumable resource. |
| **Save** / **Checkpoint** | Captured progress state. |
| **Quest** | A named goal with completion criteria. |
| **Power-Up / Ability** | A capability gained mid-game that retroactively unlocks earlier surfaces. |
| **Streak** (gamified-life-OS) | Consecutive-day participation count. Aesthetic-named loss-aversion mechanic. |

#### Surfaces

| Noun | One-line definition |
|---|---|
| **HUD** | The always-visible overlay showing vitals + currency. |
| **World** / **Level** / **Map** | The traversable space. |
| **Inventory** | The Player's owned items. |
| **Codex / Journal** | Read-only reference of discovered lore/entities. |
| **Save Room / Bonfire / Bench** | The state-capture surface (often with secondary purpose — rest, heal, fast-travel). |
| **Shop** | The economy surface where Currency converts to Items. |

#### Capabilities

| Noun | One-line definition |
|---|---|
| **Forage / Gather** | Collect resources from the World. |
| **Craft** | Combine resources into Items per a Recipe. |
| **Explore** | Traverse unmapped areas of the World. |
| **Combat / Battle** | The contested-action mechanic. |
| **Quest accept / complete** | Quest lifecycle verbs. |

#### Systems / Mechanics (usually engine-side; usually not user-facing)

| Noun | One-line definition |
|---|---|
| **XP / Leveling** | Player-progression mechanic. |
| **Crafting / Recipe Tree** | Item-combination ruleset. |
| **Tick** | Engine simulation step (NOT a player noun). |
| **Difficulty Curve** | The escalation pattern across the game's runtime. |

#### Patterns

| Noun | One-line definition |
|---|---|
| **Run vs Meta-state** | Within-session state that wipes vs cross-session state that compounds. |
| **Retroactive Unlock** | Old surfaces gain new affordances when later capabilities ship. (Metroidvania.) |
| **State-Capture-with-Cost** | Save action that bundles checkpoint + rest + risk-reset (Soulslike Bonfire). |
| **Temporal Scope** | A noun with nested scopes: Deck (whole game) / Hand (this turn) / Discard (this combat) / Exhaust (gone). |
| **Lock-and-Key Gating** | A blocked surface plus a separately-acquired ability that unblocks it. |
| **Boss Phase** | Escalating sub-states inside a single boss encounter. |

#### Economy

| Noun | One-line definition |
|---|---|
| **Currency** | Player-side fungible resource (Gems, Lingots, Souls, Runes). |
| **Rarity Tier** | Ordered classification of Items by scarcity (Common → Legendary). |
| **Source / Sink** | Where Currency enters / leaves the closed economy. |
| **Freeze** (gamified-life-OS) | A meta-resource whose only purpose is to protect another resource (the Streak). Cited 48% retention lift at Duolingo. |

### Specific recommendations

- **Pick a side on the engine-vs-content split early.** Engine nouns (Tick, GameObject, Actor, Blueprint, Pawn, Component) belong to designers and never reach players. Content nouns (Charm, Bench, Stag, Bonfire) belong to players. Mixing them is the leak; the leak is fatal for indie because the player encounter is the whole product.
- **Name from aesthetics first.** Hunicke's MDA: players meet aesthetics; designers reason mechanics. Streak beats `habit_completion_count`. Bonfire beats `checkpoint_with_world_reset`.
- **Use Unreal's Pawn vs Controller cut even outside games** — for any product where the acting body and the piloting identity differ. Maps to: user avatar vs identity vs permissions; Agent persona vs Agent runtime; tenant vs account vs session.
- **Borrow Freeze cleanly into gamified-life-OS.** A meta-resource that protects another resource is a portable mechanic. Hearthfire could ship it as-is.
- **Skip Permadeath in life-OS products.** Losing a real habit run is demotivating, not exciting. Roguelike's run-vs-meta still ports if the "death" is a soft reset.
- **Tick doesn't port to life-OS.** Life isn't simulated, it's reported. Use reporting language (Check-in, Update) instead of simulation language.
- **Name the lifecycle states.** Quest's lifecycle (Available → Accepted → Active → Completed → Turned-in) is a Pattern that deserves named nouns per state.

---

## Family 4 — E-commerce / website-as-software

**Worked exemplars**

- **Shopify** — [shopify.dev/docs](https://shopify.dev/docs), [help.shopify.com](https://help.shopify.com). Most settled core vocabulary in any category.
- **Webflow** — [developers.webflow.com](https://developers.webflow.com), [university.webflow.com](https://university.webflow.com). Page-vs-CMS-Collection-vs-Item cut.
- **Saleor** — [docs.saleor.io](https://docs.saleor.io). Channel-vs-Warehouse-vs-Stock as the cleanest separation of selling-context from inventory-context.
- **Sanity / Contentful** — [sanity.io/docs](https://www.sanity.io/docs), [contentful.com/developers](https://www.contentful.com/developers). Content Type-vs-Entry (schema-first).
- **Ghost** — [ghost.org/docs](https://ghost.org/docs). Member-vs-Tier-vs-Subscription for content-monetization.

### This way of organizing

The most stabilized vocabulary of any software type surveyed. Decades of e-commerce have settled the core (Product/Variant/Cart/Checkout/Order/Customer) so completely that non-commerce CMSes borrow it for monetization. Three live cuts: **Catalog-vs-Content** (whether the platform hardcodes Product or lets you author it as a schema), **Merchant-vs-Shopper** (two-audience problem made explicit in API design), and **Lifecycle as a first-class Pattern** (Cart → Checkout → Order → Fulfillment is the heart of the category).

| Universal category | What lights up here | Sub-cuts to consider |
|---|---|---|
| **Roles** | Bright | Merchant (Admin / Staff) vs Shopper (Customer / Guest) — usually split into two APIs. |
| **Domains** | Medium | Catalog, Fulfillment, Payments, Marketing, Tax — distinct sub-systems with their own vocabularies. |
| **Surfaces** | Bright — and well-named | Product Detail Page (PDP), Product Listing Page (PLP), Cart Drawer, Mini-Cart, Checkout (one-page vs multi-step), Order Confirmation, Account Page, Abandoned-Cart Email. These are named, versioned, conversion-tracked. |
| **Entities** | Bright | Product, Variant, Cart, Order, Customer, Inventory item, Shipping address. |
| **Capabilities** | Medium | Search, Filter (faceted), Recommend, Add-to-cart, Apply discount, Fulfill, Refund, Return. |
| **Systems/Mechanics** | Medium | Inventory reservation, Payment authorization-vs-capture, Tax calculation, Shipping zones, Webhook events. |
| **Patterns** | Bright — lifecycle dominant | Cart → Checkout → Order → Fulfillment → Delivered → Returned. Each state has different mutation rules. |
| **Economy** | Brightest of any family | Inventory, Stock, Reserved Stock, Discount, Voucher, Sale, Refund, Tax Class, Tax Rate, Currency, Price List, Channel-scoped pricing, Tier, Subscription. |

### Using these words

#### Roles

| Noun | One-line definition |
|---|---|
| **Merchant** | The seller; the customer of the platform. |
| **Admin** / **Staff** | Merchant-side users with operational rights. |
| **Customer** | The shopper; the end-user buying. |
| **Guest** | A shopper buying without an account. |
| **Member** (Ghost-shape) | A registered audience member; may or may not be a paying Subscriber. |

#### Entities

| Noun | One-line definition |
|---|---|
| **Product** | The catalog shell — the thing the Merchant sells. |
| **Variant / SKU** | The buyable unit of a Product (size/color/material combinations). |
| **Collection** / **Category** | A curated or rule-based group of Products. |
| **Cart** | Pre-purchase line items, freely mutable. |
| **Checkout** | The finalization handoff; usually a separate object with stricter rules. |
| **Order** | Post-purchase record; line items immutable; fulfillment mutable. |
| **Fulfillment** | The shipment(s) and tracking against an Order. |
| **Inventory Item** / **Stock** | Physical quantity available, usually per-Warehouse. |

#### Surfaces

| Noun | One-line definition |
|---|---|
| **PDP** (Product Detail Page) | Single-product display with Variant picker + add-to-cart. |
| **PLP** (Product Listing Page) | Multi-product display, filterable/sortable. |
| **Collection Page** | A PLP scoped to a Collection. |
| **Cart Drawer** / **Mini-Cart** | Persistent in-page Cart access. |
| **Checkout** | The funnel; one-page or multi-step. |
| **Order Confirmation** | Post-purchase landing + transactional email. |
| **Account Page** | Customer's own order history + addresses. |
| **Abandoned-Cart Email** | Triggered communication for Cart-without-Checkout. |

#### Capabilities

| Noun | One-line definition |
|---|---|
| **Add to Cart** | Convert Product+Variant selection into Cart line item. |
| **Apply Discount** | Reduce Cart total via Voucher / Code / Sale. |
| **Checkout** (verb) | Convert Cart to Order. |
| **Fulfill** | Bind shipment to an Order. |
| **Refund** | Reverse charge against an Order. |
| **Return** | Customer-initiated reverse-fulfillment. |

#### Systems / Mechanics

| Noun | One-line definition |
|---|---|
| **Inventory Reservation** | Hold stock for an in-progress Cart/Checkout. |
| **Payment Authorization vs Capture** | Two-phase commit — authorize at Checkout, capture at Fulfillment. |
| **Tax Calculation** | Per-jurisdiction tax lookup + apply. |
| **Shipping Zone / Method** | Geography → Carrier rule mapping. |
| **Webhook** | Outbound event notification to Merchant integrations. |

#### Patterns

| Noun | One-line definition |
|---|---|
| **Cart → Checkout → Order Lifecycle** | The canonical state machine. Name each state; cards link to them. |
| **Catalog Fanout (Channel / Storefront)** | One Catalog feeds many Channels feeds many Storefronts. |
| **Two-Audience API Split** | Admin API (Merchant nouns) vs Storefront API (Shopper nouns). |

#### Economy

| Noun | One-line definition |
|---|---|
| **Currency** | The pricing denomination. |
| **Price List** | Per-channel or per-customer-group pricing. |
| **Discount / Voucher / Sale** | The Merchant's price-reduction tools. |
| **Tax Class / Tax Rate** | What-kind-of-thing × where-it-ships → percentage. |
| **Tier / Subscription** | Recurring-revenue bundle (Ghost / SaaS-flavored e-commerce). |
| **Reserved Stock** | Inventory promised but not yet fulfilled. |

### Specific recommendations

- **Borrow the core verbatim.** Product / Variant / Cart / Checkout / Order / Customer is so universal that inventing alternatives is a tax. Use the standard.
- **Name the lifecycle states as cards.** Cart, Checkout, Order, Fulfillment, Delivered, Returned each get a Pattern card with mutation rules. Most e-commerce bugs are state-machine bugs; naming the states makes them visible.
- **Decide your catalog-vs-content cut.** Are you Shopify (hardcoded Product), Webflow (Pages first, Products bolted on), or Sanity (schema-first — everything is a Content Type)? Pick. The downstream surfaces follow.
- **Make the merchant-vs-shopper split explicit.** Two audiences = two read-models (often two APIs). Name them. Don't try to unify; the unifying force is the source of every leaky Stripe-style problem.
- **Channel vs Warehouse vs Stock** (Saleor's cut) is worth borrowing if you're multi-region or multi-storefront. Channel = where you sell (currency, country); Warehouse = where stock lives; Stock = the join.
- **Surfaces are conversion-tracked here, not just usability-tested.** PDP, PLP, Cart Drawer, Checkout each have known conversion benchmarks. When you name them, you're naming what gets A/B-tested.

---

## Universal cross-cuts (apply across all families)

Findings that emerged consistently across all four briefs. These belong in deep-guidance as universal diagnostics, but they're load-bearing enough to surface in any director's first pass.

### 1. The MDA inversion rule

*"If the noun describes what the user sees on screen during the moment, it's aesthetics-named. If it describes an object in the orchestrator's state machine, it's mechanism-named."* (Lifted verbatim from the agentic-software brief.)

Mechanism-named nouns that leak to user-facing surfaces require permanent prose to explain. Stripe's `PaymentIntent` is the canonical cautionary tale; the agentic-software equivalent is OpenAI's `Run / Run Step / Vector Store`.

Cross-family confirmations: Stripe `PaymentIntent` (e-commerce side), OpenAI `Run` (agentic), Notion `Block` (B2B SaaS — works because users feel the bordered unit), Unity `Component` (gaming — works because designers see them, players never).

### 2. The three leak modes

Three distinct failure patterns, each with a different fix:

- **Mechanism-named** — the engine's state-machine leaks (`PaymentIntent`, `Vector Store`). Fix: name from the felt encounter.
- **Process-named** — the team's how-we-build vocabulary leaks (`Sprint`, `Standup`, `Velocity`). Fix: name from the product's own concepts, not from the workflow used to ship them.
- **Audience-fit drift** — a name that fit audience A is forced onto audience B (Jira's `Sprint` for HR teams). Fix: process-neutralize when broadening audience (Linear's `Cycle`).

All three are "name leaked from somewhere it didn't belong." Different sources, different fixes.

### 3. The two-audience problem

Same data, two named views. Confirmed in every category surveyed:

- B2B SaaS: Admin vs Member (within tenant)
- Agentic: framework engineer vs product user (LangChain's `Runnable` leaking is the case)
- Gaming: Designer vs Player (engine vocab disjoint from player vocab)
- E-commerce: Merchant vs Shopper (Admin API vs Storefront API)

**Implication for the form**: the Roles category needs a sub-distinction between *internal operator role* and *end-customer role*. The same person rarely plays both.

### 4. The engine-vs-content split

For any layered product (engine + content built on it), the two layers have *disjoint* vocabularies. Vocabulary should make that split a top-level cut, not let the two bleed.

- Gaming: Unity (Component, Actor) vs Hollow Knight (Charm, Bench, Stag)
- Agentic: LangChain framework vs agents built on it
- E-commerce: Sanity schema vs entries
- B2B SaaS: Airtable Base vs Interface

If your product has both layers, name them separately and forbid bleed.

### 5. The Container-vs-Item pair

Every product picks a noun for "the thing that holds work" and "the unit of work." The pair IS the product's identity.

- B2B SaaS: Workspace → Project → Issue
- E-commerce: Catalog → Product → Variant
- Agentic: Workspace → Session → Thread → Message
- Gaming: World → Level → GameObject

Pick both. Hold them across the product. Don't mix Project + Board.

### 6. Lifecycle as a Pattern category

Every category instantiates a state machine. The noun set per state is the heart of the Patterns category.

- E-commerce: Browse → Cart → Checkout → Order → Fulfillment → Delivered → Returned
- B2B SaaS: Backlog → Triage → In Progress → Done (and Cycle as time-box around them)
- Gaming: Run-active → Death/Win → Meta-progression
- Agentic: Plan → Implementation → Test (Copilot Workspace) or planning → tool-call → observation (ReAct)

Name each state. Don't leave the state machine implicit.

### 7. Some concepts resist all 10 categories

The clearest case: agentic software's **context window** — it's a budget + a surface + a memory + a capability constraint + a pricing axis simultaneously, and no framework has named it as a first-class noun. The form needs an "uncategorizable, multi-facet, owner-coins-a-name" slot for these. Often the most interesting concepts in a product.

### 8. Rationale and Research are owner-supplied

Confirmed across all four briefs. Why-this-exists (Rationale) and what-we-found (Research) live in the *director's* product layer, not in the platform layer the exemplars publish. The Vocabulary module surfaces these categories for the director to fill, but doesn't supply families for them. (The companion modules Vision, Bets, Guardrails, User Research populate these directly.)

---

## How Raven uses this catalog

At draft time, after reading the director's sources, Raven:

1. Identifies the closest-fit family (or families) based on product shape — what the codebase looks like, what the docs say, what kind of users are named.
2. Proposes that family's category structure as a starting frame — "Your product looks B2B-SaaS-productivity-shaped; I'd suggest Roles split into Operator/End, and the Workspace → Container → Item containment. Here's how Linear and Notion each do it."
3. Surfaces specific recommendations the family teaches — "Use Cycle, not Sprint, unless your audience is exclusively engineering."
4. Marks nouns the director's existing material already covers vs nouns the family suggests are missing.
5. Runs the universal cross-cut diagnostics on every proposed noun (MDA inversion, leak-mode classification, audience check, engine-vs-content check).

The director shapes from there — accept the family's structure wholesale, mix from two families, override specific recommendations, or invent their own when a concept resists all 10 categories.
