# Build-a-Raven Onboarding — Plan

**Status:** design plan, MVP scope
**Supersedes (in spirit):** `docs/alexandria/plans/raven-codex/artifact-first-beats.md` as a director-facing ritual; the `/ax-library` engine/wizard as a configuration step
**Companion:** `build-plan.md` (the project plan for getting this built)

## The Reframe

Today, spinning up Alexandria has been *about spinning up Alexandria*. The director arrives, drops sources, answers questions, watches a configuration engine run. The library is the goal; the director is its supplier.

We're inverting that. The new onboarding is **build-a-Raven**: the director hires a teammate, feeds her, and watches her power up. The library is built as a downstream consequence — atomic cards crystallize from the conversations, but the director never thinks "I am building a library." They think "I am hiring Raven, and she's getting smarter."

The Knowledge Bank (Raven's) is no longer a progress meter. It is the **game board** for building Raven. Each area filled is an unlock. Each unlock is a felt moment — a coin lighting, a button appearing, a play becoming playable. The director sees Raven gain capability they can name.

People appreciate things they build themselves. So they build Raven. That is the onboarding.

But — and this is the architectural point that took several passes to land — the onboarding is the *first chapter* of a much bigger surface. The canvas isn't a configuration tool. It's the **living workspace** for a director running an AI-augmented company, where information flows in continuously, gets processed through stages, and lives across multiple agents over time. MVP builds the first chapter while the architecture allows the full surface to grow into it.

## What This Replaces

- **The engine** (`alexandria-config.json` wizard, mode × novelty × complexity, the 22-area tier algorithm) is killed as a director-facing concept. Whatever configuration the system needs gets inferred from build-a-Raven content, or surfaces as casual Raven questions in passing — never as a configuration ritual.
- **The "elicit-for-library" ritual** (the 9-beat first session as a library-construction process) is killed as the framing. Its underlying conversational beats survive as *the patterns Raven uses to power herself up*, not as a sequence the director performs to fill a library.
- **The phase rail as top-level onboarding navigator** is killed. The rail primitive survives, repurposed (see *Repurposed surfaces*).
- **The "atomic library" naming** retires from director-facing UI. The director sees **The Library**. "Atomic" stays as internal/technical vocabulary.
- **"Kanban" as a label** retires. The surface is **The Information Station** (see below).

## Architecture: Two Surfaces, Bridged

The canvas does not host Raven. Raven lives in the coding tool the director already uses — Claude Code, Cursor, terminal — invoked via the existing plugin/skill surface. The canvas is a *companion* surface running alongside.

- **Canvas** (browser, software-only): forms, knowledge-bank state, library viewing, document drop, agent statuses. No chat. No agent UI. Pure structured state.
- **Raven** (agent in the coding tool): conversation, judgment, redlining, banking. Where token spend happens. Where the director thinks out loud.
- **Hooks** (the bridge): canvas submits → coding tool receives → Raven runs her flow there → state updates reflect back to the canvas. The spike's `canvas-server.ts` + `hooks/hooks.json` are the substrate.

The director's attention is bimodal and the design embraces it: form-filling on the canvas, conversation in the coding tool, glance-back to canvas for state changes.

## The Three Registers of Canvas Navigation

The canvas has three persistent navigational registers, each with a distinct purpose. Together they answer *what, who, and where* for any moment in the director's work:

| Register | Lives | Job | Answers |
|---|---|---|---|
| **Top bar** | Top edge | Anchor + organization | Logo (home) + tabs to company-wide surfaces (Library, Playbook, Station) + ambient station indicator |
| **Center pane** | Middle | Workspace | Whatever the director is currently working on |
| **Agent bench** | Bottom edge | Team | The senior squad — who's available, who's working, who to wake |

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]    Home · Library · Playbook · Station   · 3 ⚠              │ ◀── TOP BAR
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                    CENTER PANE (workspace)                          │ ◀── CENTER
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│   ┌────┐  ┌────┐  ┌─────┐  ┌────┐  ┌────┐                          │ ◀── AGENT
│   │ ?? │  │ ?? │  │  R  │  │ ?? │  │ ?? │                           │     BENCH
│   └────┘  └────┘  └─────┘  └────┘  └────┘                           │
│   Engin.  Design   Product  Market  Research                        │
└─────────────────────────────────────────────────────────────────────┘
```

Top bar is the **anchor + organization** register: logo always returns to home, tabs reach company-wide surfaces, a small ambient indicator surfaces information-station activity without competing.

Bench is the **team** register: five seats, fixed positions, persistent across phases. The constant home in spirit — the director's relationship is with the team that lives on the bench, and the workspace adapts to whatever the team is doing.

Center pane is the **workspace** register: one work surface at a time, mode-switches by context (form, microscope, library, station, banked doc, etc.).

## Agent-Scoped vs. Company-Wide Surfaces

A critical architectural split that took several design passes to surface. Some surfaces belong to *individual agents*; others belong to the *company* and are shared across them.

**Per-agent surfaces** (live behind each agent's coin):
- **[Agent]'s Knowledge Bank** — the SoT docs that define what that agent knows about their domain.
- **[Agent]'s Playbook** — the plays *they* can currently run, filtered from the company-wide playbook by their capabilities.

For MVP only Raven is active, so the only populated per-agent surfaces are *Raven's Knowledge Bank* (which is what the existing three-plane KB renders) and *Raven's Playbook*.

**Company-wide surfaces** (reached via top-bar tabs, accessible to all agents):
- **The Library** — the shared atomic substrate. Every agent draws from it. Cross-agent graph of cards. (Renamed from "Atomic Library" in director-facing UI.)
- **The Playbook** — the canonical play repository. Multi-agent plays live here. Each agent's individual playbook is a filtered view onto this.
- **The Raw Materials Archive** — the firehose intake. Everything anyone has ever shared with the company. Searchable, datable, attributable. Accessed via Station drill-downs or a dedicated tab.
- **The Information Station** — the *traffic* of in-flight work. Items moving from raw → discussed → approved → banked.

For MVP most company-wide surfaces are *built but minimally populated* — the Library has Raven's atomized cards; The Playbook is the same content as Raven's Playbook (she's the only agent); Raw Materials Archive starts populating from the microscope; The Information Station mostly shows the build-Raven flow itself.

The architectural rule: **the bench is where you meet teammates and access what they know individually; the top bar is where you access what the company knows collectively.** Each register has a clean purpose.

## The Agent Bench

The agent bench is the **most load-bearing primitive on the canvas** — the one piece of UI that is persistent across every phase of the director's relationship with Alexandria. The work surface changes, the rail changes, the company surfaces grow — but the bench is constant. It is the canvas's identity anchor.

### Three jobs the coin does

These get conflated in most UIs but they shouldn't be:

| Job | What it is | When it speaks |
|---|---|---|
| **Identity / presence** | "Raven sits here. This is her seat." A portrait, an anchor, a face. | Always. Static. |
| **State indicator** | What is she doing *right now*? Working, idle, surfacing, needs you. | Ambient. Continuously updating. |
| **Action launcher** | What can I ask her to do? Knowledge Bank, Playbook, Wake. | On click. |

A well-designed coin does all three through *layered* signaling — identity is the base, state is the modulation, action is the on-click reveal. Air traffic control and cockpit instrumentation are the right references: *calm by default, glanceable, clear escalation, information in every visual property.*

### State vocabulary

Borrowing the ATC advisory-tier discipline (each state visually and auditorily distinct):

| State | Light | Motion | Sound | Sub-button label for Wake |
|---|---|---|---|---|
| **Dormant** | Dim, monochrome | Still | None | "Wake Raven" |
| **Working** | Lit, full color | Slow ambient pulse (~3s) | Faint mechanical (or none) | (sub-buttons hidden; don't interrupt) |
| **Surfacing** | Lit, brighter | Faster pulse (~1.5s) | Soft brass chime on first appearance | "Continue with Raven" |
| **Needs you** | Brightest, warm tint | Distinct two-beat rhythm | Distinct cue, long-delay repeat if unattended | "Continue with Raven" (with ⚠) |
| **Banking** | Brief golden flash | Single ripple outward | Single deeper chime | (transient; settles to next state) |
| **Returning from night work** | Soft glow on canvas re-open | Gentle one-time pulse | Optional quiet chime | "See what I did overnight" |

Status text near the coin updates with state: *"Raven is reviewing your Vision · Claude Code"* / *"Raven is sleeping — wake her when you're ready"* / *"Raven banked your Vocabulary source-of-truth — check Claude Code."*

### Sub-buttons when the coin is pressed

Three options rise from any agent's coin (illustrated for Raven):

1. **Raven's Knowledge Bank** — navigate to her game board (the three-plane KB)
2. **Raven's Playbook** — navigate to her filtered plays
3. **Wake Raven** — *invoke her*, not navigate. Sends a context-aware signal to the coding tool; Raven responds in conversation. Label changes by state (per table above).

The Wake button is semantically distinct from the navigation pair — it spends tokens. Visually it should be subtly differentiated (different icon, slight color shift) so the director knows what's destination vs. action.

Sub-buttons rise into a slim **tray zone** just above the bench, not into the center pane. The work surface is undisturbed by sub-buttons.

### The five-seat lineup

```
   ┌────┐    ┌────┐    ┌─────┐    ┌────┐    ┌────┐
   │ ?? │    │ ?? │    │  R  │    │ ?? │    │ ?? │
   │face│    │face│    │heads│    │face│    │face│
   │down│    │down│    │ lit │    │down│    │down│
   └────┘    └────┘    └─────┘    └────┘    └────┘
 Engineering  Design    Product   Market   Research
    🔒         🔒      (RAVEN)      🔒        🔒
```

Five fixed seats on a continuous stone plinth. Raven center, slightly larger socket (visual hierarchy). Each future agent has a permanent seat with a named role on the plate — *Engineering / Design / Market / Research* — face-down with lock explainers. Sam, Conan, Bridget are *not* on the bench; they're back-of-house agents subsumed into Raven's plays.

The roles map to functions the director would actually hire for. The director's mental model is *"I have a head of Product, Engineering, Design, Market, Research"* — a real org chart, not Alexandria internals.

### Bench as home, in spirit

The director's home isn't a *surface* — it's the *team they live with*. The bench is constant; the center pane adapts to whatever the team is doing. This is the bench-as-home reframe that previous design passes missed: when the director wants "to come back," they're coming back to Raven and the squad, not to a specific KB or playbook screen.

The morning-return ritual reinforces this: when night work has landed something, the canvas opens with the bench quietly glowing. Director's eye is drawn down. The team has news.

## Top-Bar Navigation

The top edge holds the **anchor + organization** register.

- **Logo (top-left)** — universal home affordance. Click returns to home view. At MVP, home is *Raven's Knowledge Bank* (the build-phase default); later it may shift (e.g., to the Playbook in play-phase). Logo doesn't do anything else.
- **Tabs (top-center)** — direct navigation to company-wide surfaces:
  - **Home** (Raven's KB at MVP)
  - **Library** (The Library — cross-agent atomic substrate)
  - **Playbook** (The Playbook — full play repo)
  - **Station** (toggles into Information Station mode)
- **Ambient station indicator (top-right)** — *the one piece that earns the top bar's keep for deep work.* A small badge reading like *"Station: 3 incoming · 1 awaiting you ⚠"*. Cool gray for ambient counts; warm with ⚠ when the director's specific action is needed. One-click jumps to Station mode.

The ambient indicator is the answer to *"how does canvas mode know what the station knows without being distracting?"* Glanceable, escalates cleanly, never demands attention without earning it.

## The Information Station

What the existing prototype called "kanban view" becomes **The Information Station** — a richer, on-brand visualization of how information *flows* through the company. Stone-headed lanes, items as visible objects, motion when items progress. Show, don't tell.

### Four lanes

```
═══════════════════════════════════════════════════════════════════════
    INFORMATION STATION
═══════════════════════════════════════════════════════════════════════
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │  INCOMING   │  │ IN DISCUSSION│  │  AWAITING   │  │   BANKED    │
  │             │  │              │  │  YOUR NOD   │  │             │
  │  raw drops  │  │ being shaped │  │ ready to    │  │ atomic in   │
  │             │  │ via forms +  │  │ approve     │  │ the Library │
  │             │  │ raven flow   │  │             │  │             │
  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
     📄 📄 📄         📄 📄              📄                 📚📚📚📚📚📚📚
```

Lane labels: **Incoming · In Discussion · Awaiting Your Nod · Banked**. Stone-slab headings with carved inset, matching the bench's material language.

Items take visual forms appropriate to their type and state: parchment shapes for raw materials, scrolls for SoTs in elicitation, sealed envelopes for approvals, atomic crystals or stars for banked items. Color/gilding indicates quality grade. Items animate across lanes when they progress (gentle, event-driven, not constant).

### Mode toggle, not permanent display

The Station is **accessed via mode toggle** (top-bar Station tab), not permanently visible. Director's canvas-mode work surface stays focused on deep work; Station mode is full-canvas takeover. This decision is deliberate — air-traffic-control discipline: *calm by default, escalate clearly via the ambient indicator, full surface available on demand.*

The ambient indicator in the top bar makes this work — director never goes information-blind in canvas mode, but never has Station traffic competing for attention either.

### What belongs vs. what doesn't

Everything that lives on the Station is information flow:
- Raw materials moving toward banked
- Plays-in-flight (the play *produces* information; shown as a distinct item shape in *In Discussion*)
- Decisions pending (collapses into *Awaiting Your Nod*)
- Open conflicts (items needing resolution)
- Night-token queue (async-processing items)
- Multi-agent collaboration items

Things that don't belong (and get their own surfaces later when relevant):
- Engineering tickets / bug tracker
- Marketing campaigns
- General task management

The Station is the **company's collective information-processing surface**, full stop. The scope is intentionally tight.

### Scale considerations (for later)

In a living 50-person company with continuous flow, the Station can get busy fast. At MVP it's mostly empty — only the build-Raven items move through. The architecture needs to allow for:
- Filtering by lane, by date, by agent owner
- Swim lanes by agent or by area when volume warrants
- Bulk operations (approve N items at once)
- Search across all items

None of this is built at MVP. But the data model should not preclude it.

## Raven's Knowledge Bank Substrate

The merged three-plane layout is the substrate for the build-Raven unlock game:

- **I · Strategy** — *the rationale, how we think we win.* Vision, Bets, Guardrails, Standards.
- **II · Product** — *the nouns, what we're actually making.* Vocabulary, Skeleton, Experience, Surface, Forward plan.
- **III · Learning** — *the evidence, what we actually know.* User research, Competitive intel, Decision trail, Product evidence.

13 areas total. Five glowing Foundations (Vision, Bets, Guardrails, Vocabulary, User research) are where most directors start.

The planes are not just categories — they're causal layers of a single hypothesis test. Strategy proposes; Product embodies; Learning tests. The connector lines on the bank already encode this: Strategy → Product is one-way ("informs what we build"); Product ⇄ Learning ⇄ Strategy is a cycle ("produces evidence · updates the bet"). The living-diagram potential (cross-plane edges with state) is deferred (see *Out of MVP scope*).

The current unlock logic baked into `data-unlock` attributes ("Unlocks when X reaches Elicited") is placeholder-grade AI improvisation and should not be relied on. Real unlock logic is one of the items the MVP needs to design.

The pipeline labels (swept / analyzed / elicited / atomized) are the old internal vocabulary. They should be renamed to the outside-facing **Shared / Read / Discussed / Banked** per `docs/alexandria/plans/canvas-source-material/source.md` Part VIII. The Information Station's *Banked* lane uses the same vocabulary.

## The MVP Onboarding Arc

The minimum onboarding that yields a useful Raven covers four areas across two planes:

| Stage | What the director does | What unlocks |
|---|---|---|
| 0 · Practice cave | Canvas literacy — small-talk gestures (drop the logo, redline a sentence). 2–3 minutes max. Introduces the bench: *"this is your senior squad. Raven — the Product one — is who you're hiring first."* | Microscope becomes available. |
| 1 · Microscope | Drop everything the director has: website, GitHub, docs, deck, Figma. Sort into piles. Director declares "I'm done sharing — let's start talking." | **First form** (Vision) opens; **The Raw Materials Archive** begins populating. |
| 2 · Conversation station — Vision | First form. Pre-filled madlib (where possible), redlined, submitted, Raven runs her numbered flow in the coding tool. Source-of-truth banked. | **The Library** unlocks (tab activates in top bar); first card lands. |
| 3 · Conversation station — Bets, Vocabulary, Skeleton | Three more forms, same shape, same rhythm. Each one banks a source-of-truth doc. | After Skeleton: **Raven's Playbook** unlocks. She is hired. |

Order: Vision → Bets → Vocabulary → Skeleton. Strategy plane first (the *why*), then Product plane (the *what*). Vision is the test for "does the form abstraction work when scan can't help"; Vocabulary is the test for "does it work when scan can pre-fill everything."

After the four are banked, Raven can talk about: *what the product is, who it's for, how it's trying to win, and what's load-bearing*. She is a non-technical product thought partner — a Product Coordinator. She can't yet plan technical sprints (needs the rest of Product plane). She can't yet manage the night shift (needs Learning plane). That's the next leveling arc.

## Progressive Unlock UX

The canvas reveals itself as the director progresses. Locked elements are visible but inert, with explainer text on the lock telling the director *what unlocks them*. Locks are tutorials.

```
On first open:
  Bench:
    [Raven]                  active   · "Your Product head, ready to be hired"
    [Engineering]            🔒       · "Future teammate — unlocked after Raven is hired"
    [Design / Market / Research] 🔒   · "Future teammates — unlocked later in the journey"

  Top bar tabs:
    [Home]                   active   (currently Raven's Knowledge Bank)
    [Library]                🔒       · "Unlocks after your first source of truth lands"
    [Playbook]               🔒       · "Unlocks when Raven has enough to be useful — fill four areas"
    [Station]                active   (mostly empty until information starts flowing)

  Center pane:
    [Microscope]             🔒       · "Unlocks after the practice cave"
```

Each unlock is a felt moment. The mechanical animation language already exists in the spike (sub-button rise, coin flip, recess-into-stone). It gets used here. The hire moment specifically — when Raven's Playbook tab activates and her coin completes its build-state animation — should be the most theatrical moment of MVP, because it sells the phase shift from build-Raven to play-with-Raven.

## The Form-as-Paperwork Model

Each Knowledge Bank area, when active, is **paperwork the director fills out**, with one important inversion of the doctor's-visit metaphor: **Raven pre-fills the paperwork before the director sees it.**

### Form behavior on the canvas

1. **Open the form.** Pre-filled where possible from microscope material. Empty where the system couldn't infer. **Conflict markers** flag where sources disagree.
2. **Redline, fill, refine.** Director edits inline. Adds material they remembered (drag in a new source mid-form; pre-fill updates with newly-attributed candidates).
3. **Grade hint.** Ambient meter on the form shows where it would grade out if submitted now ("you'd land at C+ here").
4. **Submit.** The pivot. Form locks, Raven coin animates, the form's top rail switches from form-progress to Raven-flow progress.

### What happens after submit (Raven's flow, in the coding tool)

The submit payload routes to the coding tool. Raven runs a numbered flow whose progress appears on the canvas as a rail:

1. **Understanding check / gap analysis.** "Here's what I have. Here's what's missing. Here's where I'm uncertain."
2. **Conflict cleanup.** "Your website says X, your README says Y — which is current?" Director resolves in conversation; canvas updates conflict markers in real time.
3. **Targeted asks.** The specific questions Raven needs answered to land the source-of-truth doc at a useful grade. Short, specific, easy to answer.
4. **Source-of-truth lands.** Banked on the canvas. Grade rendered. Item moves to the *Banked* lane in the Information Station. Director can move on, or redline further if they want.

The conversation is in the coding tool. The state changes are on the canvas. The director glances between them.

### Routing options at submit (MVP keeps it simple)

- **Run now** — synchronous flow, Raven in the coding tool, fast back-and-forth.
- **Run overnight** — deferred. Mentioned but not built in MVP. Belongs in the night-tokens follow-up.

### Save / checkpoint

Every form supports save-at-current-grade. Source-of-truth gets banked at whatever grade Raven assesses. The director can come back later with more material; the form re-opens with prior fills intact and Raven can re-run her flow incrementally.

## The Four MVP Madlibs (Sketch-Level Specs)

Full design is Phase 1 of the build plan. Sketches here so we can see the abstraction holds across the easy and hard cases.

### Vision

*The promise of this product, the company it makes us, the failure mode we're avoiding.*

Slots:
- Problem we're solving (one sentence)
- The win — how we win (one sentence)
- 3-year picture — what the product looks like when it has won
- Win condition — how we'll know we won
- Anti-position — what we deliberately won't be

Pre-fill candidates: pitch deck hero copy, website hero, README opening, any "vision" doc. Often sparse.

Conflict candidates: website hero vs. README opening (common); pitch deck claims vs. recent commit themes.

### Bets

*The testable claims we're operating on, and what would prove us wrong.*

Repeatable structure — director enters N bets (typically 3–5), each with:
- Testable claim
- The assumption it rests on
- What evidence would disqualify it
- Current confidence (high / medium / low / shaky)

Pre-fill candidates: any "we're betting on…" or "we believe…" phrases in dump material. Often sparse. Most of the work is conversation-derived.

Conflict candidates: stated bets in older docs vs. de facto bets implied by recent product direction.

### Vocabulary

*The terms that mean something specific in this product, and what they mean.*

Repeatable structure — director maintains a table:
- Term
- What it is, in one sentence
- Fields / shape (if structured)
- Cross-refs (other terms it relates to)
- Status (confirmed / emerging / derived / deprecated)

Pre-fill candidates: scan-derived `confirmed_entities` from code; README glossaries; type definitions. Often rich.

Conflict candidates: code calls it `Account`, README calls it `User Profile`; two terms for one concept; one term used two ways.

### Skeleton

*The structural shape of the product — the surfaces and how they connect.*

Repeatable structure — director walks the product:
- Surface name
- What lives here
- What links from here
- Proudest moment on this surface (one)
- Embarrassing moment on this surface (one)
- Core-action path traced through surfaces (one)

Pre-fill candidates: route files, file structure, named screens in design files. Medium-rich.

Conflict candidates: routes that exist in code but no nav; named surfaces in docs that don't exist in code; "core action" claims in dump vs. what the code emphasizes.

## Information Architecture: the Provenance Trail

The canvas exposes a vertical drill across three layers of information. Designed deliberately so directors can QA quality from any starting point without surface-hopping.

```
RAW MATERIALS                  SOURCE-OF-TRUTH DOCS              ATOMIC LIBRARY
(what you gave Raven)          (what we believe is true)         (atomized cards)

website-hero.txt       ──┐
README-2024.md         ──┼──► sources/vision.md ──atomized──►   Product Thesis -
deck-Q3.pdf            ──┘     grade B+                          Win-by-being-only-X.md

github-routes.json     ──┐
figma-export.json      ──┼──► sources/skeleton.md ──atomized──►  Component - …
README.md              ──┘     grade A-                          …
```

**Provenance is a property of content, not a location in the UI.** Every piece — raw material, SoT doc, atomic card — carries its links in itself. Cards declare which SoT they came from. SoTs declare which raw materials fed them and which cards descended from them. Raw materials declare which SoTs and cards descended from them.

### Three valid drill directions

1. **Top-down (planning posture):** *"What do I know about Vision?"* Click Vision in Raven's KB → see the SoT doc → optionally pop the raw materials and see the cards it produced.
2. **Bottom-up (QA posture):** *"This card looks wrong — where did it come from?"* Click the card in The Library → drawer opens with the card AND a provenance panel → expand the SoT, expand the raw materials. Fix at the right level.
3. **Conversational (ask Raven):** *"Hey Raven, where did this claim come from?"* Wake gesture, she walks the chain in Claude Code, she fixes at the right level if you ask her to. **This is the killer feature** — the director never has to follow the chain themselves unless they want to. Raven is the librarian. The visible chain is for when the director wants to look; the wake-and-ask is for when they'd rather have her answer.

### Storage locations on disk (proposed)

- **Raw materials:** `docs/alexandria/raw/<date-or-source>/<filename>` with index metadata
- **Source-of-truth docs:** `docs/alexandria/sources/<area>.md` with frontmatter (grade, banked-at, raw_materials, atomized_to, version)
- **Atomic cards:** existing `docs/alexandria/library/` structure (no change)

Frontmatter linking is the spine: SoTs link up and down; cards link to their SoT; raw materials index links to SoTs they fed.

### Raw materials access

Not a peer of KB / Library / Playbook in the sub-button or tab UI. Accessed via:
- Drill from any SoT or card drawer ("see source materials")
- A dedicated Raw Materials Archive view, accessed via the Information Station (probably from the *Incoming* lane's expanded view) or as a tertiary tab under company-wide surfaces

The microscope (Stage 1 of onboarding) is a *one-time orientation experience*, not a permanent surface. After Stage 1, the director can add raw material via universal drag-and-drop anywhere on the canvas — no dedicated UI surface needed.

## Canvas Configuration for MVP

The current spike has pieces strewn around an earlier story (source-feed onboarding). The MVP layout cleans this up.

**Top bar:**
- Logo (left) — home anchor
- Tabs (center) — Home / Library / Playbook / Station
- Ambient station indicator (right) — count + ⚠ when needed

**Form-internal rail** (when a form is active, *inside* the center pane):
- Form-progress before submit (Survey · Pointers · Draft · Submit)
- Raven-flow progress after submit (Understanding · Conflicts · Asks · ✓)

**Center pane** — the active surface. Default state changes with progression:
- Pre-microscope: practice-cave intro
- Microscope active (Stage 1): drop / sort / declare-done UI
- Default post-Stage-1: Raven's Knowledge Bank (game board)
- Form active: the current area's form (drill-down from KB)
- Form submitted: same form, locked, Raven-flow progress visible
- Banked: source-of-truth document for that area, optional redline mode
- Library tab: The Library (cross-agent atomic substrate, constellation + 2.5D folder views)
- Playbook tab: The Playbook (active plays, available plays, lock states)
- Station tab: The Information Station (four-lane flow view)

**Agent bench (bottom)** — five seats, Raven center and slightly larger, four face-down with role labels (Engineering / Design / Market / Research). Continuous stone plinth. Status text line under the row. Sub-buttons rise into the tray zone above the bench when a coin is pressed.

## Repurposed Surfaces

- **The phase rail** — was: top-level onboarding navigator. Now: form-internal rail (form-progress, then Raven-flow progress) when a form is active. Otherwise hidden.
- **The document dump station** — was: a feed-the-engine source intake. Now: the microscope (Stage 1 of the arc). After Stage 1, universal drag-and-drop replaces the dedicated UI.
- **The Knowledge Bank** — was: a generic progress dashboard. Now: *Raven's* Knowledge Bank (agent-scoped). The three-plane game board for building her up.
- **The agent bench** — Raven coin's role tightens to *status indicator for the coding tool* + action launcher. Bench expands conceptually to a five-seat senior squad with face-down future agents.
- **The Library viewer** — same role (read what's been atomized), now top-bar tab and renamed to *The Library*. Cross-agent substrate. Unlocks at Stage 2's first bank.
- **The kanban view** — was: a view-toggle within source pipelines. Now: *The Information Station* (renamed, rebranded, stone-headed lanes, mode-toggle from top bar). Existing Floor/Priority/Timeline view toggles are removed.

## Out of MVP Scope (Deferred)

- **Industry dimension.** Industry-aware Raven (different feel for fintech vs. consumer vs. devtools) is a meaningful future axis. Not now.
- **Night tokens.** The submit-routes-to-overnight option is real and beautiful, but designed and built post-MVP. MVP keeps "run now" only.
- **All 13 areas.** MVP covers 4. The remaining 9 follow the same pattern when reached.
- **Living diagram on the KB.** Cross-plane edges with state (open / supported / contested / disqualified), edge animations when content moves. Deferred.
- **Other agent unlocks.** Engineering, Design, Market, Research coins remain face-down at MVP. Sam, Conan, Bridget remain back-of-house (subsumed into Raven's plays).
- **Plays beyond starter set.** The basic playbook is what unlocks at MVP. Tiered plays (Common → Heroic), back-of-house plays, gating relationships are deferred.
- **Information Station scale features.** Filtering, swim lanes, bulk operations, search. MVP renders the four lanes with whatever items are in flow (sparse during build phase).
- **Bidirectional surfacing from Raven side.** If Raven notices a cross-area conflict mid-flow, MVP lets her message about it in the coding tool; canvas-side automatic conflict-marker injection is deferred.
- **Sound design.** State-vocabulary sounds (chimes, pulses) are designed but optional at MVP build; visual treatment ships first.
- **Re-running a banked area with new material.** Supported in concept (forms remember prior state); polished UX deferred.

Most company-wide surfaces (The Library, The Playbook, Raw Materials Archive, The Information Station) are **built at MVP as scaffolding** but lightly populated. They have to be present so the architecture proves out; their content grows as the canvas matures.

## Open Design Questions

Listed for explicit decision-making in Phase 1 of the build plan:

1. **Form granularity.** Single form per area with repeatable internal structures (working answer), or some areas decompose into sub-forms? Specifically Bets, Vocabulary, Skeleton.
2. **Source-of-truth doc format on disk.** Markdown with frontmatter (working answer); the exact frontmatter schema (grade, banked-at, raw_materials, atomized_to, version) needs a real spec.
3. **Grade rubric.** Letter, tier, both? Inputs: slots filled, confidence per slot, conflicts resolved, gap-question coverage. Needs a real spec.
4. **Hook protocol.** Form-submit, raven-status-update, conflict-update, banking events. Schema design.
5. **What "Raven's Playbook" actually contains at hire moment.** Working set: JTBD Mirror, Audience Sharpener, Anti-Position Pressure, Adversarial Pre-Mortem. Renames pending per `canvas-source-material/source.md` Part VIII.
6. **Microscope's "I'm done" gesture.** Explicit button (working answer), framed as "I've shared everything I want to for now — let's start talking."
7. **Empty-microscope path.** If the director gives nothing, Stage 1 becomes "skip — talk to Raven cold." Conversation station unlocks immediately. Forms start mostly empty.
8. **Information Station lane labels.** Working set: *Incoming · In Discussion · Awaiting Your Nod · Banked*. Alternative shapes (more verb-oriented? more pipeline-oriented?) worth a pass.
9. **Ambient station indicator placement.** Top-right of top bar (working answer); alternative locations (bench-side status line) worth considering.
10. **Raw Materials granularity.** Whole sources (a deck = one item) vs. fine grain (per slide). Working answer: keep coarse; granularity is what cards are for.
11. **Bench seat naming.** Five-seat lineup: Engineering · Design · Product (Raven) · Market · Research. Confirm before locking visually.
12. **What home actually is at MVP.** Working answer: Raven's Knowledge Bank. Alternative: a tiny synthesized landing showing bench status + recent Station activity. Defer the dashboard variant; KB-as-home for MVP.

## What "Done" Looks Like for MVP

A new director, given the canvas + Claude Code with the Alexandria plugin loaded:

1. Spends 2–3 minutes in the practice cave learning canvas gestures and meeting the bench.
2. Drops their material into the microscope (or skips if they have nothing).
3. Fills four forms — Vision, Bets, Vocabulary, Skeleton — over one or several sittings.
4. After each submit, talks with Raven in Claude Code, watches the canvas update.
5. Sees their first source-of-truth land, watches The Library tab activate.
6. After Skeleton bank: experiences the **hire moment** — Raven's Playbook tab activating, her coin completing its build-state animation, the phase shift from build-Raven to play-with-Raven made visible.
7. Ends with: four source-of-truth docs banked, Raven's Playbook visible and unlocked, The Library populated, the Information Station's *Banked* lane growing, Raven who can talk about their product as a non-technical PM.

The first-session director should feel: *I built her. She's mine. I want to keep going.* The architecture should feel: *this is just the first chapter — the canvas is going to grow into a real working environment as I bring on more of the team.*
