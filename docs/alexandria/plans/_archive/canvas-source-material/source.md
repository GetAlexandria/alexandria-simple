# Raven Canvas — Source Material for Library Updates

**Status:** draft · source material for Conan to do gap analysis against the existing library, and for Sam to atomize into entries
**Audience:** Conan (gap analysis), Sam (writer), maintainers
**Provenance:** design conversations May 2026 — Danvers, Claude (Opus). Captures decisions made during the Raven Canvas prototyping work in `docs/alexandria/plans/raven-codex/`, `docs/alexandria/plans/library-viewer/`, and `docs/alexandria/plans/raven-canvas/`.

This document is not yet atomic. It is source material — long-form, narrative, deliberately overlapping. The job is to give Conan enough surface area to spot what's new vs. what already exists, what should become which card type, and what's stale and needs updating.

The Alexandria library was written before there was a web interface. Much of what's described here is therefore *new content the library doesn't yet describe*. Treat the existence of an entry in the library as evidence the concept is captured; treat its absence as a gap.

---

## Part I — The Canvas

### What it is

The **Raven Canvas** is a unified workspace the director keeps open alongside their coding tool (Claude Code, Cursor, Conductor, whatever). It is the surface through which the director builds, navigates, and exercises the context library. It is not a wizard, not a one-off configuration step — it is the persistent home the director returns to over months.

The canvas's purpose is twofold:

1. **Make library construction visible.** The director can see what knowledge exists, what's being proposed, what's missing, and how each contribution makes Raven more capable.
2. **Make Raven's capabilities legible and accessible.** What can Raven do *right now* with the library as it stands? The canvas answers this directly and lets the director invoke any active capability.

The canvas is the *felt* expression of the library. The library is the substrate; the canvas is the room.

### Layout

The canvas has three horizontal regions, top to bottom:

- **Header strip** — the canvas crest (eventually: the director's product name + branding).
- **Working area** — the active surface. By default, a welcome message. When the director invokes Raven, this swaps to one of three surfaces: Knowledge Bank, Library, or Playbook.
- **Agent bench (bottom nav)** — a row of agent coins. Raven occupies the first slot, lit and active. Three face-down coins sit beside her for future agents (likely Sam, Conan, Bridget). Each coin sits in a recessed stone cut-out setting.

The canvas is designed to coexist with the director's coding tool — *companion, not replacement*. Hooks in onboarding flows can send signals to the coding tool so it knows when relevant context has been added or when Raven has something to surface.

### The mechanical feel

The canvas should feel mechanical. Coins turn. Stones press. Panels click into place. Rising sub-buttons emerge in sequence (~80ms stagger), not all at once. Transitions are brief but felt (~250–320ms ease). No fades for navigation; only for state changes within a surface.

This mechanical quality is a deliberate counterweight to the abstract nature of the work. Building a context library is conceptual; the surface that does it feels physical.

---

## Part II — The Agent Bench

### The Raven coin

Raven's coin is the activated agent — heads-up, lit when invoked. The director presses the coin to summon Raven's three sub-buttons.

The coin imagery shows the figure of a maven holding a raven, with bioluminescent circuitry etched into the bronze surface (heliocentric, originating from the figure's eye and the bird's eye). The coin has two visual states:

- **Unlit (dormant)** — bronze patina, dark circuitry. Used when no surface is active.
- **Lit (activated)** — circuitry glows cyan, lighthouse-beam intensity radiating from the figure. Used when the sub-buttons are extended or a surface is open.

The coin sits inside a **stone cut-out setting** — a carved warm-stone block with a recessed circular socket. The bevel on the rim catches light from the upper left; shadow falls into the lower right; the inner cavity is darker than the surrounding stone. The coin is *pushed into* this setting, not pasted on top. Hover or activation extends a teal halo around the rim.

### Future agent coins

Three slots beside Raven, currently dormant. Each shows the **tails side** of a coin — the Lighthouse of Alexandria etched into the bronze with the same bioluminescent treatment.

- **Unactivated tails** — dim. Gemstones embedded around the edge but no light flowing through the lighthouse.
- **Activated tails** — full bioluminescence, lighthouse beam projecting cyan.

The narrative: each agent has both a heads and a tails. Heads carries that agent's figure; tails carries the universal Lighthouse. Future agents are *showing their tails* because they aren't yet activated. When one is activated, the user will see their tails light up first (animation: unactivated → activated tails), then the coin flips to reveal the agent's heads.

This is a navigation primitive *and* a storytelling primitive. The bench is a coherent row regardless of how many agents are activated. Adding a new agent feels physical: a coin gets flipped, comes alive, becomes pressable.

### The sub-button rise

Pressing Raven's coin animates **three sub-buttons rising vertically** from the bench, stacked above the coin. They appear in sequence (top first), each as a brass-trimmed parchment button.

- **Knowledge Bank** — the progress meter for building the library
- **Library** — the actual library content, navigable in two views
- **Playbook** — Raven's active capabilities (plays)

Clicking a sub-button loads that surface into the working area. The sub-buttons retract. The Raven coin stays lit while a surface is active.

Clicking outside the bench, or clicking the Raven coin again, also retracts the sub-buttons.

---

## Part III — The Three Surfaces

### Surface 1 — Knowledge Bank

The Knowledge Bank is the **progress meter** for library construction. It shows the 22 director-facing topics organized into 5 sections, each topic with a 4-stage progress bar showing how far along it is.

This is the surface the director visits to see *"what's the state of my context library right now?"*

Key elements:

- **Five sections** as horizontal bands, top-to-bottom by leverage priority
- **22 topics** distributed across the sections
- **Five Foundations** (the Core Five) glow teal — these are the topics that activate basic Raven
- **Locked treatment** for topics whose Core sibling hasn't reached Discussed yet
- **Awaiting your input** state — orange dot on a stage segment where Raven is waiting on the director
- **Starter Playbook** — sticky right column showing 8 plays the director is working toward; each play has named knowledge prerequisites; earned plays glow gold, locked ones stay quiet but legible
- **Click a play card** → bars it requires get teal outlines, others dim, working area focuses on the path to that play

The Knowledge Bank is where the director feels their library *growing*.

### Surface 2 — Library

The Library is the **actual content**, navigable from the top down. It has two view modes accessible via toggle:

- **Constellation view** — the entire library as a star map. Each subfolder is a constellation (named cluster). Each entry is a star. Wikilink connections render as faint lines between stars; cross-cluster lines are visible. Hover any star → its connections light up, sidebar shows title/type/connections.
- **2.5D Folder view** — subfolders as 2.5D parchment folder-stacks (tilted, layered). Click a folder → it transforms in place, spans 4 grid columns, reveals its cards as flat document shapes. Click any document → a drawer slides in from the right with full card detail.

Both views share:
- **Search** across title, type, subfolder, territory. Matching content highlights teal; non-matching dims.
- **Card detail drawer** that slides in from the right when a card is selected. Closes on X, scrim click, or Escape.

The Library is where the director *reads* what's been banked.

### Surface 3 — Playbook

The Playbook is the **active capabilities** surface — the plays Raven can run right now. Each play is a concrete move (e.g., "Adversarial Pre-Mortem," "Surface Tour," "Vocabulary Triage"). Clicking a play card runs it immediately if it's single-step, or spins up an interactive sub-flow if multi-step.

Plays have prerequisites in the Knowledge Bank. A play is *earned* when its required topics reach a threshold. Earned plays glow gold; locked plays are visible but quiet, with their prerequisites named so the director can see what they're working toward.

Plays also have **tiers** (Common, Rare, Epic, Heroic) — the same play scales in capability as the underlying library deepens. Adversarial Pre-Mortem at Common produces three failure modes; at Heroic it produces five ranked modes with falsifiable tests scheduled as checks.

The Playbook surface is where the director *uses* Raven.

---

## Part IV — The Knowledge Model

### Five sections of director knowledge

Director knowledge is organized into five sections, top-down by leverage. This is the spine of the Knowledge Bank and the implicit organizing principle for the library:

1. **Why this exists** (Section I) — the bet, the purpose, the strategy.
2. **What we built** (Section II) — the product itself, topology + naming, the heaviest section.
3. **What we believe** (Section III) — settled trade-offs, principles, anti-position, forces resisting.
4. **How people use it** (Section IV) — loops, journeys, the aha path, the churn path, experience goals.
5. **What we're still figuring out** (Section V) — open bets, riskiest assumptions, signals that would change the mind.

The ordering is leverage-based: earlier sections are prerequisites for usefully filling later ones.

### Twenty-two topics

Each section has 3–7 topics. The full list (these are the labels the director sees on screen):

**Section I — Why this exists**
- What it does for them
- Who it's for
- Why the alternatives fail
- What success looks like

**Section II — What we built**
- What it looks like (the surface map)
- The features it can't ship without (load-bearing)
- How parts connect (interconnections)
- Trouble spots (gnarly bits)
- Edge cases and hidden places (corners)
- Where parts meet awkwardly (seams)
- The word the team can't agree on (most-debated)

**Section III — What we believe**
- What we refuse to be (anti-position)
- Trade-offs we've already made
- The rules outsiders get wrong (surprising principles)
- What's holding us back (forces resisting growth)

**Section IV — How people use it**
- The main ways people use it (core loops)
- The path to first value (aha journey)
- Why people leave (churn journey)
- How it should feel (experience goals)

**Section V — What we're still figuring out**
- Our biggest gamble (riskiest assumption)
- Evidence that would change our minds
- What we wish we could measure

### The Five Foundations (the Core Five)

Five topics are designated as **The Five Foundations** — they activate basic Raven. Until at least these five are Discussed, the rest of the bank is locked (or at minimum quiet). The Five:

1. **What it does for them** (Section I)
2. **Who it's for** (Section I)
3. **What it looks like** (Section II)
4. **The features it can't ship without** (Section II)
5. **What we refuse to be** (Section III)

These five together let Raven speak credibly about *what the product is, who it's for, what it looks like, what's load-bearing, and what it's not.* With these atomized, Raven can run her starter plays.

### The four pipeline stages

Each topic moves through four stages as the director and Raven build it up:

1. **Shared** — the director contributed something (a document, a website walk, a repo walk, an elicitation session). Raven has timestamped it but not vetted it.
2. **Read** — agents (Raven and her helpers) analyzed the source, judged its relevance, and posted a usefulness hypothesis. Irrelevant material is rejected here without ceremony.
3. **Discussed** — the director and Raven worked through the read together. Synthesis emerges from this conversation, not as a prior step.
4. **Banked** — written as canonical entries in the library, with wikilinks, grades (Conan), and provenance tiers.

Synthesis is not a separate stage; it is the *output* of Discussed. Banked is the final state.

### The three verbs

Three motions level Raven up:

- **Feed** — share documents, walk websites, walk repos, run elicitation sessions. Raises library coverage.
- **Work** — actually run plays against the library. Raises play mastery (reps).
- **Feedback** — grade outputs, prune sources, sharpen entries. Improves library quality and retrieval weight.

These three coupled loops produce three coupled gains: more library cells lit (feed), more play tiers (work), sharper library (feedback). The director feels growth most when all three are interleaved — feeding without working leaves Raven untested; working without feedback leaves her drift unchecked.

Every act of each verb should produce two visible outputs: **what you got right now** (an artifact, a play output, a sharpened entry) and **what you're now closer to** (a near-unlock countdown).

---

## Part V — The Plays

### What a play is

A **play** is a concrete move Raven runs *for* the director. Not a Claude skill. Not a generic prompt template. A named, library-grounded move — "Adversarial Pre-Mortem on the current proposal," "Surface Tour of the product for a new hire," "Vocabulary Triage on this PRD."

Plays have:
- A name
- A short description of what it does
- A set of **knowledge prerequisites** (which library topics need to be at what stage)
- An **execution shape** (single-step output, multi-step interactive flow, or background task)
- A **tier** (Common → Rare → Epic → Heroic)
- A **front-of-house / back-of-house** classification (director-facing vs library-maintenance)

Plays are the unit of Raven's capability legibility. The Playbook surface lists them all; the Knowledge Bank highlights which the director is working toward.

### The Starter Playbook — the first eight

These are the eight plays a basic Raven can run once the Five Foundations are Discussed. Each ties back to one or more Foundations.

1. **JTBD Mirror** — reflects the job your product is hired for, in the customer's words. (Prereq: *What it does for them*.)
2. **Audience Sharpener** — tightens who this is for and who it deliberately isn't. (Prereq: *Who it's for*.)
3. **Surface Tour** — walks a teammate or partner through the product, screen by screen. (Prereq: *What it looks like*.)
4. **Load-Bearing Audit** — names the features the product can't ship without. (Prereq: *Load-bearing features*.)
5. **Anti-Position Pressure** — stress-tests a proposal against what you've decided you are not. (Prereq: *What we refuse to be*.)
6. **Adversarial Pre-Mortem** — generates the strongest case against the current bet. (Prereqs: *Job + Who + Anti-Position*.)
7. **Vocabulary Triage** — catches sliding definitions in a doc against your settled vocabulary. (Prereqs: *Surface + Load-Bearing*.)
8. **PRD Critique** — capstone; reviews a PRD against all five Foundations. (Prereqs: *All five Foundations atomized*.)

These names are placeholders pending a renaming pass — see Part VIII.

### Tiered plays

Each play has a tier ladder. The same play scales as the library deepens. *Adversarial Pre-Mortem* is the worked example:

- **Tier 1 (Common, blue)** — three failure modes, listed flatly.
- **Tier 2 (Rare, purple)** — five modes, ranked by probability, names the load-bearing assumption.
- **Tier 3 (Epic, gold)** — five modes ranked by probability × severity, cites prior failures from the library.
- **Tier 4 (Heroic, red)** — adds one falsifiable test per top-3 mode, writes them into the bet's tracking surface as scheduled checks.

The same card, same name, redraws as the tier ticks up. Border color follows Hades.

### Front-of-house vs back-of-house

Some plays the director runs in conversation (front-of-house): *Pre-Mortem, Surface Tour, Vocab Triage, PRD Critique, JTBD Mirror.* Others Raven runs while no one's watching (back-of-house): *Source Pruning, Re-Grading Sweep, Signal-Queue Triage, Provenance Audit.* Both belong on the Playbook surface, side by side, equal visual treatment.

Some back-of-house plays *gate* front-of-house tier upgrades. *Adversarial Pre-Mortem → Epic* requires *Library Hygiene ≥ 3.* The director can see the dependency drawn on the Playbook.

---

## Part VI — The Onboarding Ritual

### The shift from question to artifact

The current `/ax-library` first-session ritual is question-driven: Raven asks, the director answers, Sam writes a card from the answer. The proposed shift is **artifact-first**: Raven drafts an artifact based on what she's already seen (the scan, prior session, a document the director dropped), the director redlines it, Sam atomizes the redlines into cards.

The bet is that directors react to wrongness faster than they generate from blank pages. *"No, X actually sits underneath Y"* is easy to say while pointing at a diagram. The same insight in response to *"describe the relationship between X and Y"* gets a hedged paragraph.

Per tier, the artifact shapes are:

- **Section I (Why this exists)** — Problem / Approach / Structure one-pager. Mirrors how directors do competitive analysis on alternatives — turned on their own product.
- **Section II (What we built)** — Surface map, system diagram. Director moves nodes, draws/cuts edges.
- **Section III (What we believe)** — Force-field diagram, anti-positioning chart.
- **Section IV (How people use it)** — Journey strip, loop diagram.
- **Section V (What we're still figuring out)** — Confidence grid (claims × certainty); or stay language-native.

### Beat 3.5 — the Tour

The biggest single change to the existing 9-beat first-session ritual: insert a **Tour** beat between Nouns and Configuration. The Tour is a narrated walkthrough of the product. Six prompts:

1. *Open the product. What's the first screen?*
2. *What lives here, and what links from here?* (Repeat per surface.)
3. *Show me the screen you're proudest of. Why?*
4. *Show me the screen you're embarrassed by. Why?*
5. *Walk me through what happens when a user does <core action>.*
6. *What's in here that a new hire wouldn't find without you?*

Raven's job during the Tour: name nodes, draw edges as wikilink proposals, flag mismatches with the scan, resist configuring anything. The Tour is pure topology extraction.

This beat addresses a major gap in the current ritual: topology lives in the director's head, not in the code, and inference from named nouns alone under-specifies it. The Tour makes the director narrate their product's spatial truth.

### Two-way interaction states

The pipeline includes moments where Raven actively asks the director something and the bar should not advance until they answer. Two key two-way states:

- **Read → awaiting input** — agents have produced their reading and asked "what am I missing?" Director response moves the topic to Discussed.
- **Discussed → awaiting approval** — synthesis is ready; the director approves before Banking.

These should be visible on the Knowledge Bank as a pulsing orange dot on the relevant bar segment, with the status reading *"Raven is waiting on you · click to resume."*

---

## Part VII — The Library Viewer

### Two views, one library

The Library surface presents the same 208-entry knowledge graph in two ways:

**Constellation view** — top-down star map. Each subfolder is a named cluster (Loops, Agents, Decisions, Principles, etc.) positioned in a region of the sky corresponding to its territory (experience, product, rationale, temporal). Each entry is a star. Wikilink connections render as faint lines. Cross-cluster lines visually dominate at rest because the library's link structure crosses subfolder boundaries 3.5× more often than it stays within.

Hover any star: the star and its connections light up; non-connected stars dim; sidebar shows title, type, location, neighbor count.

This view answers: *"what's the shape of my library? where are the dense neighborhoods? which entries are bridges between clusters?"*

**2.5D Folder view** — subfolders as parchment folder-stacks, tilted at ~14° × 6° rotation, with three back layers visible behind each front for depth. Click a stack → it transforms in place, spans 4 grid columns, reveals its cards as **flat document shapes** (visually distinct from the folder-stacks they came from). Other stacks reflow around it. Close (×) returns them to the folder.

This view answers: *"I want to find a specific card by category. Open the category, scan, click."*

Both views support live search by title, type, subfolder, or territory.

### The drawer pattern

Card detail does not consume a fixed gutter. It is a **drawer** that slides in from the right when a card is selected. Default state: drawer is hidden, library uses full width. When the director clicks a card, the drawer translates in from `100%` to `0` over 320ms with a soft scrim darkening the working area. Three ways to close: × button, click on scrim, Escape key.

The drawer pattern coexists with the rest of the canvas: the scrim covers the working area but not the agent bench, so the director can always see where they are.

### Cluster labeling — open question

Three approaches to naming the clusters in the constellation view:

1. **Folder-named** — Loops, Agents, Artifacts, Principles. Always available, structurally true.
2. **Theme-named** — *The Cycles, The Familiars, The Codified Laws, etc.* Pure renaming, no graph analysis.
3. **Link-community-named** — run community detection on the wikilink graph; surface emergent clusters that span folder boundaries. Most interesting, most work.

Today's recommendation: ship #1 as baseline, layer in #2 as a relabeling pass, treat #3 as a future "smart constellations" feature where Raven proposes named link-communities.

---

## Part VIII — Vocabulary Simplification

### The unification principle

The Alexandria library has accumulated internal vocabulary that leaks into director-facing surfaces. *"The Who," "Anti-Positioning," "JTBD Mirror," "Swept / Analyzed / Elicited / Atomized," "Bands," "Subjects."* These read as inside-baseball when surfaced in front of a director.

The principle: **unify all language to be outside-facing.** Director hears the same word from Raven, on the canvas, in the docs, in the agent prompts. No translation cost, no leakage risk. Internal jargon is reserved for genuinely technical contexts — code, file names, schema fields.

This is the same discipline Raven enforces on the director during onboarding ("watch for inside-language leakage"). The Alexandria team should practice it first.

### The rename table

| Internal (now) | Outside-facing (everywhere) |
|---|---|
| The Bet | Why this exists |
| The Who | Who it's for |
| The Job | What it does for them |
| Wrongness of Alternatives | Why the alternatives fail |
| The Win Condition | What success looks like |
| The Product | What we built |
| Surface Map | What it looks like |
| Load-Bearing Features | The features it can't ship without |
| Gnarly Bits | Trouble spots |
| Corners & Hidden States | Edge cases and hidden places |
| Seams (Frankenstein joints) | Where parts meet awkwardly |
| Most-Debated Word | The word the team can't agree on |
| Forces & Settled Thinking | What we believe |
| Anti-Positioning | What we refuse to be |
| Settled Trade-offs | Trade-offs we've already made |
| Surprising Principles | The rules outsiders get wrong |
| Forces Resisting Growth | What's holding us back |
| Loops & Journeys | How people use it |
| Core Loops | The main ways people use it |
| The Aha Journey | The path to first value |
| The Churn Journey | Why people leave |
| Experience Goals | How it should feel |
| Open Bets | What we're still figuring out |
| Riskiest Assumption | Our biggest gamble |
| Signals That Change Your Mind | Evidence that would change our minds |
| Wished-For Measures | What we wish we could measure |

### Pipeline stage renames

| Internal | Outside-facing |
|---|---|
| Swept | Shared |
| Analyzed | Read |
| Elicited | Discussed |
| Atomized | Banked |

"Banked" plays well with the "Knowledge Bank" metaphor.

### Interface noun decisions

| Concept | Chosen noun |
|---|---|
| 5 top-level categories | **Sections** |
| Items inside a section | **Topics** |
| The page itself | **Knowledge Bank** |
| The 4 progress stages | **Stages** |
| "Core 5" | **The Five Foundations** |
| Active capabilities | **Plays** |
| The play repository | **Playbook** |

### Plays — the biggest remaining work

The play names in the current starter playbook (JTBD Mirror, Audience Sharpener, Surface Tour, Load-Bearing Audit, Anti-Position Pressure, Adversarial Pre-Mortem, Vocabulary Triage, PRD Critique) contain the most alien language of all. Acronyms (JTBD, PRD), industry-specific terms (pre-mortem, anti-position), and metaphors (mirror, sharpener, triage). The renaming pass for plays is the highest-leverage remaining vocabulary work.

Direction: keep "Plays" as the umbrella noun; rename each play to a verb-noun shape that tells the director what Raven *does* in plain English. *"Argue against your own bet" / "Tighten who you're for" / "Walk through your product."*

---

## Part IX — Design Patterns and Conventions

### Coin system

Every agent has a two-sided coin. Heads is unique to that agent (Raven holds a raven; Sam holds a quill; etc.). Tails is universal — the Lighthouse of Alexandria, bioluminescent circuitry etched into the bronze. Each side has two states (unactivated, activated) producing four total visual states per coin. The bench is always a coherent row of coins regardless of activation state.

### Stone cut-out setting

Coins sit inside carved warm-stone sockets with raised outer rim (light catches upper-left, shadow lower-right) and a recessed inner cavity with inverted bevel so the coin reads as pushed *into* the stone, not pasted on top.

### Bioluminescent activation

The "lit" state across the canvas (Raven's coin, the Core glow on the Knowledge Bank, the cluster halo on a clicked play, search highlight) all use the same teal range: `#4fb8a8` (deep) and `#7ad4c4` (soft). Always additive (`mix-blend-mode: screen` for image overlays), never replacing the underlying color.

### Drawer pattern

Detail panels slide in from the right when content is requested. Three close paths: explicit ×, scrim click, Escape. The drawer doesn't push content; it overlays with a scrim. Default state: drawer hidden, content takes full width.

### Collapsible bands

Sections (in the Knowledge Bank), territories (in the Library), and other horizontally-grouped content all collapse via header click. Chevron rotates 90° to indicate state. Collapsed sections still surface their counts and a compact status row, so directors can scan progress without expanding.

### Search behavior

Live filter across all visible content. Matches glow teal; non-matches dim. Search result count appears below the input. Empty result state shows "no matches" gracefully. Search is metadata-only in v1 (title, type, location); full-text search is a v2.

### Mechanical animation timing

- Sub-button rise: 80ms stagger, sequential top-to-bottom
- Surface transition: 250–320ms ease
- Drawer slide: 320ms cubic-bezier(.2,.8,.3,1)
- Coin lighting crossfade: 550ms ease
- Hover state: 150–180ms

Avoid persistent animations (blinking, pulsing) except where they signal active state ("awaiting your input"). The director should be able to read the canvas without distracting motion.

### Visual palette

- **Warm parchment base** — `hsl(28, 14%, 22%)` with radial vignette
- **Brass accents** — `#d4a052` (accent), `#e8b86d` (glow), `#b8863a` (dim)
- **Teal Core / activation** — `#4fb8a8` (deep), `#7ad4c4` (soft)
- **Awaiting / attention** — `#e8a64f` (warm orange dot)
- **Parchment cards** — `#c9a878` → `#856838` gradient for folder-stacks; `#ecd9b0` → `#d8c290` for flat document cards
- **Midnight depths** — `#050912` to `#0a1226` (used in the constellation view's sky background)
- **Fonts** — Cormorant Garamond (display) + Inter (UI)

---

## Part X — Game-Inspired Influences

These are the references behind specific patterns. Useful for Conan to recognize *why* certain decisions look the way they do.

- **Skyrim** — skill constellations: each skill is a constellation in the night sky; perks are stars; locked perks are drawn dim so the future is always visible. Source for the **Library constellation view** and the **Five Foundations as glowing-when-untouched** pattern.
- **Stardew Valley** — five skill areas at parallel level bars with named choice rewards at L5 and L10. Source for the **equal-weight visual treatment of front-of-house and back-of-house plays**.
- **Hades** — the same boon scales through Common/Rare/Epic/Heroic with the *same card* visibly redrawing. Source for the **play tier ladder** (same play, scaling capability, color-coded border).
- **Persona 5** — Social Stats (back-of-house) gate Confidants (front-of-house). Source for **back-of-house plays gating front-of-house tier upgrades**.
- **Outer Wilds Ship's Log** — knowledge clusters with named threads that fill in as you discover; "more to explore here" tag on unfinished clusters. Source for the **Library viewer's zoom-and-discover feel** and the **proposed-stars (about-to-be-planted) state** in the constellation view.
- **Path of Exile passive tree** — zoom levels distinguish named Notables (large icons with their own names) from stat-only nodes (tiny, numerous). Source for the **named-play vs. stat-only distinction** in the eventual capability tree.
- **Return of the Obra Dinn** — provenance and partial-knowledge as first-class states. Source for the **provenance tier system** (library-grounded, inferred, general knowledge).
- **Disco Elysium Thought Cabinet** — plays as internalized stances that take work to internalize. Source for the **"plays as Raven's character build"** mental model.
- **Pentiment** — what you've read directly enables specific dialogue. Source for the **"knowledge IS the skill"** unification — plays unlock from library content, not separate XP.

---

## Part XI — Open Questions

Carried forward — these need decisions before further building.

1. **The plays renaming pass.** The starter playbook contains the most alien language. What are the right outside-facing names for the eight? The Sections and Topics have a proposed table; the Plays don't yet.
2. **Cluster labeling in the Library viewer.** Folder-named (#1), theme-named (#2), or link-community-named (#3)? Default ship is #1 — confirm.
3. **The "ping in coding tool" hook system.** What's the first concrete hook? Write to a known path the coding tool reads? Append to CLAUDE.md? Drop into a Conductor agent's transcript?
4. **The three future agents** — pick three from Sam, Conan, Bridget, Solomon. Likely Sam (writer), Conan (grader), Bridget (briefer) — but confirm.
5. **The 1.1 onboarding tracks** at the top of the canvas — when does this layer get added, and what does it look like alongside the agent bench?
6. **Topology depth as a unique stage gate.** Should the Knowledge Bank's Discussed stage require explicit topology coverage (via the Tour beat) before advancing to Banked? Or is it implicit?
7. **Live data wiring for the Knowledge Bank.** The mockup uses hardcoded state; the live version reads Alexandria's library. When do these merge in the canvas?
8. **The Library viewer's default view.** Constellation or 2.5D Folder on first load? Or remember the user's last choice?

---

## Notes for Conan

When you do gap analysis on this document:

- **Check for existing entries by canonical name.** Many concepts referenced here (loops, agents, principles, decisions, anti-patterns) likely have entries already — flag conflicts where the existing entry uses internal jargon that conflicts with the outside-facing renames in Part VIII.
- **Propose new entry types where needed.** Some content here looks like *new card types* the library doesn't have schemas for: Coin States, Surface Specs, Play Definitions, Pipeline Stages, Vocabulary Renames. Suggest the right type (or that a new type is needed).
- **Watch for stale entries.** This document supersedes some prior decisions (e.g., the artifact-first elicitation model partially replaces the question-driven model in the existing first-session ritual). Flag what should be retired.
- **Where things contradict, surface the conflict.** Don't quietly reconcile. The director should see the contradictions and decide.
- **Don't write atomic cards yet.** Source material first; atomization after the director signs off on what's in scope.

---

*End of source material draft. Open questions are real questions — they need answers before this becomes atomic.*
