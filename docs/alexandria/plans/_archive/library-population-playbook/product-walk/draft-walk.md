# Alexandria — Product Walk synthesis

**Approval status:** ✅ **Approved by Danvers Fleury · 2026-05-30.** Director provided redline corrections on 2026-05-29 (history-also-on-ledger; library structure is tree+folders not 2.5D; splash analysis as atomic-linkage-payoff; "proactive" → "scheduled"; real product invocation not canvasdemo); revisions applied below; director called done on 2026-05-30. This synthesis is now the canonical Product Walk artifact for Alexandria and the load-bearing input for downstream Product-plane bar drafts.

This is the source-of-truth document produced by walking Danvers Fleury (director / pilot) through Alexandria on **2026-05-29**. The session ran in terminal-as-Raven mode against the canvas prototype at `127.0.0.1:4322/product-library-v0.1.html`, the existing context library on `main`, and the recent Vision statement. It is a *working model* — comprehensive enough that downstream sharpening exercises (Vocabulary, Skeleton, Surface, Experience, Forward Plan) come back to the director as *finer points*, not *"we don't do that at all."* Specific surface descriptions, schema details, and refined vocabulary belong in those downstream bars.

Where Raven inferred, that is marked *(inferred)*. Where the director's exact phrasing is load-bearing, it is in quotes.

---

## 1 · Vision (canonical)

The Vision statement is fresh and load-bearing. Light on product details, heavy on direction. Summarized:

The **Shift** — AI capability has crossed a threshold and is compounding. Agents now do load-bearing knowledge work at human quality and the cost curve isn't flattening. The operating layer of small companies — sprints, tickets, dashboards, inbox — was built for a world where humans were the bottleneck. That world is over.

The **Person** — operators with an edge. Pattern-spotters, out-operators, domain experts, distribution operators. Run companies of 1–8 humans, taste + conviction + ability to act on what they see.

The **Problem** — *Named:* "I don't have an AI team. I have AI tabs." *Discovered:* even inside one chat, the operator pushes every agent step-by-step because the agent defaults to generic-best-practice. They're the only one in the room who knows what good looks like, and that doesn't scale.

The **Inadequacy** — chat tools are stateless and siloed. Documentation tools were built for humans to read, not for AI to operate from. Sprint/ticket tools assume humans are the bottleneck. None were designed for the case where AI is on the org chart with load-bearing responsibilities.

The **Mechanism** — Alexandria turns a fleet of AI tabs into an AI team with **named seats, shared memory, and automated handoffs** that let a small operator direct instead of route.

The **Felt Experience** — the operator's day has shape: *Orient → Sync → Produce → Wind down → External → Scrub out.* Three structural claims underneath: factorified knowledge work with humans as foremen; collaboration AND autonomy in the same workday; **human capacity as the system's primary optimization target** — burnout isn't lifestyle, it's the scarce resource.

The **Proof** — at 12 months: AI is on the org chart by name + role; Alexandria is the source of truth for the business; human capacity is managed as the most valuable resource. Operators say *"I direct a team,"* not *"I use AI tools."*

The **Refusal** — Alexandria amplifies whatever substrate it's installed in. It is a **virus for organizations that can't or won't align**: politically contested orgs, vision-divorced-from-reality orgs, AI-fragmentation orgs. Works for organizations that can align.

---

## 2 · The thesis

Alexandria is **the operating system for AI-native organizations** — the system you use to *build and manage AI colleagues*. **Raven is the first colleague and the tip of the spear.** Everything in the product is in service of giving you an AI team that feels like a team — named, knowledgeable, accountable, able to act unsupervised when context is sufficient and to escalate when it isn't.

The underlying claim: **the important details and context that make a senior person valuable are usually locked in their head and never shared.** Alexandria's bet is that if you externalize that context atomically, keep it agentically tended, and bind agent behavior to it, your AI team can act at 1 a.m. the way an experienced human would.

The system is a **hypothesis-proving engine** and an **alignment and synchronization machine.** Living, breathing. Evidence shifts → product implications → strategy reconsidered → new evidence sought. Constantly.

---

## 3 · Architecture

Alexandria stands on three coordinated systems plus a connective concept:

- **Library** — atomic cards organized by the same three planes as the Knowledge Bank (Strategy, Product, Learning). Agentically tended; living/breathing. The current best visualization is a tree + folders structure with cross-references between cards. (A constellation view exists but the cleaner tree+folders model is where this is heading.) **The library is where the present and the explained-past live.**
- **Playbook** — plays associated with AI colleagues. Three play modes: *scheduled-automatic* (Raven runs her morning brief), *on-demand* (director invokes), and *sequenced/chained* (multi-step rituals across humans + agents). Plays make a colleague *feel* like a colleague.
- **Ledger** — immutable record of who did what when, with link-outs to the library. **The ledger is where event history lives** — every action, decision, trigger-firing, approval. Used like a naval captain's log: when command transfers, the incoming captain reads the ledger and asks questions. Not yet mocked in the prototype.
- **Triggers** — *external monitoring system*, separate from both the ledger and the agents (separation matters for technical + architectural reasons). When something lands on the ledger, triggers can fire plays. *"When X happens on the ledger, do Y."* Hosted by the engineering side — not part of Raven's behavior.

Most agent work in steady-state Alexandria is **executing on a play that is either scheduled or reactive, unto itself or part of a broader orchestrated activity.** History accretes across two places: the **ledger** holds the event stream (who did what when); the **library** holds the explained-state (what the org currently believes, with link-outs to the ledger events that produced each belief).

### Raven's player sheet

The **player sheet** is Raven's home view in Alexandria — an RPG character sheet for an AI colleague.

- **Tier arc** — Coordinator (Level 1) → Manager (Level 2) → Senior PM (Level 3). Tiers map to KB planes: Strategy unlocks Coordinator, Product unlocks Manager, Learning unlocks Senior PM. Future tiers render as "preview" on the sheet.
- **Two main rooms** — *Knowledge* (the Knowledge Bank) and *Plays* (her playbook).
- **Header tagline at Coordinator** — *"Strategic thought partner. Can talk about what you're building and why — but not how it fits together or how it's used yet."* She is gated by what she knows.

The Knowledge Bank is a *game within a game*: how you build her up. Once she's running it's tertiary — you come back to tune and grow, but it's not the daily door.

### Knowledge Bank

Three planes, each holding bars:

- **I · Strategy** — Vision, Bets, Guardrails, Standards. *"The rationale — how we think we win."* Strategy won as a name for clarity even though "The Plan" is closer to what it means.
- **II · Product** — Vocabulary, Skeleton, Surface, Experience, Forward Plan.
- **III · Learning** — User Research, Competitive Intel, Decision Trail, Product Evidence. *(Name unsettled: "Learning" is clear but loaded; "Rationale" is preferred but blurs against Strategy. Open vocab question — see §7.)*

The MVP unlock set for getting Raven launched has been evolving. The current best read: **Vision + Bets + Vocabulary + Skeleton + Surface + Experience.** Vision is the conversation starter — the alignment anchor. It might even compress to just *Vision + Walk* in some sequences.

### Library structure

Atomic cards, organized by the same three planes. Primary view is a **tree + folders structure** — clearer than spatial alternatives at this stage. Territories sidebar shows card counts per area (Product 142, *Rationale* 46, more).

**Atomic linkage is load-bearing — and the main payoff of atomicity is cheap updates.** When a piece of evidence shifts, every card that pointed to it can be updated in one operation. Imagine 750 cards referencing one piece of evidence; one change cascades to all 750 cleanly. **Splash analysis is the layer above that** — it answers *which of those 750 actually need to change*, what gets impacted across the org's beliefs, and what decisions get triggered downstream. Without splash, atomic linkage just gives you propagation; with splash, atomic linkage becomes a real decision aid. Library-only scope today.

### Federation

Today: one library (product). Future: multiple libraries per organization — corporate, marketing, possibly engineering, possibly design. Each library may have a different agent owner (Conan, Bridget, Raven). Cross-library linkage and ownership choreography are open. **Eventually a federation across multiple organizations.**

---

## 4 · The day

The operator's day is shaped by *three sources of work* moving through the same living-organism flow — not three modes of doing, three origin points:

- **Scheduled** — an agent runs a play on a calendar cadence. Raven's daily product brief. Conan's nightly library sweep. A personal-briefer agent catching you up first thing in the morning.
- **Reactive** — a trigger fires from a ledger event. A signed contract triggers an onboarding play. Debunked evidence triggers a splash analysis.
- **Ad hoc** — the director invokes. Pair session with Raven. Manually fire a play. Ask a question.

Any of those can produce work of any size: a one-line approval, a half-day pair session, a full strategic pivot. The **queue** is just where work lands when something needs a human verb. Verbs are scoped: approve, answer, clarify, decide. Sample queue items:

- *"Review this release plan and approve it."*
- *"Answer this question about how a feature is performing — is this a bug or what you wanted?"*

### Texture

The mature day feels like a **strategy video game**. Coins pinging and buzzing. Your day reduces to *quality + velocity of decisions* because the team — your AI **hands team** — does the doing. As you grow your Alexandria, you get more coins; it accretes.

### Rhythms

- **Rituals** — morning briefer; team standup where agents show up alongside humans; nightly factory shipment cadences in the background; recurring play firings.
- **One-offs** — pair work; deciding-the-truth events when new evidence forces a call.
- **Maintenance** — library tending by Conan; library surgeries (with splash analysis); KB tuning to grow Raven.
- **Big moves** — strategic briefs from leadership; performance-data-forced product decisions; cascade analyses through the library when something load-bearing shifts.

### Decide-the-truth

Some events require the human to call truth — a debunked piece of evidence, a strategic shift, a product call. *Raven supports but does not own.* She brings context, suggests, surfaces splash implications, but the human verb is the human's. This **chain of command** is load-bearing across the product (see §6).

---

## 5 · Entry & navigation

The operator runs Alexandria as a Claude Code plugin pointed at their project. The current production entry is **`/ax-library`** — the main slash command for the shipped Alexandria plugin. It opens the persistent library context for the project, initializing if needed (Raven walks new users through setup) or returning the operator to an existing configuration. A parallel preview channel, **`/ax-next-start`**, exists for the Alexandria Next plugin line.

Additional user-facing slash commands sit alongside: `/ax-brief` (assemble context for an implementation task), `/ax-plan` (create or refine an implementation plan), `/ax-complete-plan`, `/ax-revise-plan`, `/ax-sync-tickets`, `/ax-upgrade`. A `ax` CLI binary provides deterministic tooling (lint, grade, dag, cards, scoreboard, retrieve, viewer, etc.) for scripting and CI.

Three eras of the front door:

- **Today (shipped product)** — `/ax-library` in Claude Code. Text-driven; Raven boots in the conversation; no visual canvas in the production flow yet. The operator works in their terminal, talking to Raven about their library and plans.
- **Near-future (canvas era)** — Day-1 visible surface becomes **Raven's player sheet**. On launch, Raven greets you and hands you a choose-your-own-adventure menu: *here's where we left off · here's the queue for your review · here's the big stuff that happened while you were gone · where do you want to dig in?* The Knowledge Bank, Playbook, and Library views all hang off the player sheet as rooms.
- **Far-future (multi-agent era)** — Alexandria's main page becomes a **SimCity / Civilization-style company organism map**. Visualization of the company as a living machine. Projects, status (live / down / needs attention), agents working on what. Coins for agents have spatial belonging on the map; pinging a coin makes it react *and* the map zooms.

As Alexandria matures, the canvas-with-Knowledge-Bank stops being central. It becomes one room inside the player sheet, which is itself one room reachable from the map.

A **less-tech-heavy entry** for non-terminal-comfortable operators is a known future need but explicitly deferred — terminal-driven is fine for the near future.

---

## 6 · The agent roster

**Front-of-house (today):** Raven, the only character users meet at launch.

**Back-of-house (today):** *cognitive crutches from the pre-orchestration era* — Conan the Librarian, Sam the Scribe, Solomon (epistemic work). They were named characters because orchestration didn't exist yet; now most of their work is rolling up into the playbook.

**Trajectory:**
- **Sam → playbook.** Not enough value as a character; directors don't need a "scribe" persona.
- **Solomon → mostly absorbed** into Raven or Conan; the epistemic work (splash analysis, "deciding the truth" support) finds a home with a smarter Raven.
- **Library face is open** — Conan, Bridget, or Raven for product library; **federation may need one character per library.**
- **Raven's bench has 4 placeholder nameplates** (Engineering / Design / Market / Research). These are TBD — could become real agents over time, or different domains (a COO agent, librarians of other libraries, etc.).

**Principle:** colleagues earn their character by *being approached directly*. If you never talk to them, they should be playbook entries, not coins on a bench.

### Chain of command

A load-bearing product principle: **the director always calls done. Raven coaches up, surfaces concerns, notes risks — but cannot gate.** If Raven thinks something is dangerously incomplete and the director ships, the director wins. Concerns are logged for follow-up. This DNA shows up everywhere: scoreboards guide, never gate; bar gates record director-approval, never raven-judgement.

The "Discussed" terminology on the current playbook gate (*"Needs Skeleton at Discussed"*) is flagged as a dangerous framing — implies fuzzy negotiation. Should be renamed to something like *Director-approved* or *Called*. Settle in Vocabulary.

---

## 7 · Vocabulary (open questions to settle in the Vocabulary bar)

- **Strategy / Product / Rationale-or-Learning** — naming the third plane is unresolved. *Rationale* preferred but blurs against *Strategy*. *Learning* clear but loaded. Evidence is the most important part of this plane. Whether *research = evidence* is itself open.
- **"Discussed" → ?** — rename the bar gate to land cleanly against chain-of-command. Director-approved, Called, Sealed — TBD.
- **`/alexandria` vs `/alxr`** — daily entry command. TBD.
- **InfoHub** — deprecate (already decided; just removing from canvas).
- **Bench nameplate domains** — Engineering / Design / Market / Research are placeholders. Concrete roles TBD.
- **Federation surface name** — when multiple libraries exist, the federation view needs a name.
- **Daily surface name** — Raven's player sheet vs Raven's home vs Raven's office. Naming open.

---

## 8 · Forward Plan (near · next · later)

### Now (in-flight or imminent)

- Knowledge Bank module build sequence — Vision banked; Vocabulary in design (PR #186); Product Walk being designed (this artifact's session).
- Player sheet exists as standalone prototype (PR #169 merged 2026-05-22).
- Canvas prototype (`product-library-v0.1.html`) directionally accurate but carries cruft (see §10).

### Next (named shape, not started)

- Daily entry `/alexandria` (or `/alxr`) — replaces `/canvasdemo` prototype scaffold; greets-and-routes choreography.
- The queue surface — proper shape: title, ask, context, verb. Not yet built.
- Standup integration — agents alongside humans in standup. Surface and choreography open.
- Pair-mode workspace — director + Raven working a single problem. Surface TBD.
- Decide-the-truth ceremony surface — the moment where the human calls a load-bearing truth, splash-radius visible.
- Federation of libraries — corporate library is the expected second; subsequent libraries by org need.
- Playbook expansion — *"hundreds of locked plays with various ways to unlock them"* — OOTB defaults, KB-completion unlocks, work-experience unlocks.
- Back-of-house roll-ups — Sam absorbed into plays; Solomon mostly absorbed into Raven/Conan.

### Later (aspirational, sequence-unclear)

- SimCity / Civilization-style company organism map as Alexandria's home view. Agent coins with spatial belonging; ping → react + zoom.
- Less-tech-heavy entry for non-terminal operators.
- Federation across multiple organizations (not just multiple libraries inside one org).
- Marketing libraries, engineering libraries (maybe), design libraries (maybe), corporate library, digital COO.
- Cross-library splash analysis — today scoped to one library; eventually across federation.
- Bench plates — Engineering / Design / Market / Research become real teammates with their own player sheets.

### Deferred / refused (for near future)

- Non-terminal entry: acknowledged as eventually needed but explicitly held — terminal-driven Alexandria stays the near-future shape.

---

## 9 · Open mechanics (to be resolved in downstream bars)

These didn't get resolved in this Walk and are appropriately deferred to specific bars' build slices, not the Walk's responsibility:

- **Queue mechanics** — exact item schema, verbs, history, how Raven decides queue vs. autonomous.
- **Standup choreography** — surface, sequencing, agent voice.
- **Pair-mode surface** — canvas? terminal? both?
- **Hot Tray pinning** — who pins the 3 plays on Raven's coin (director? Raven? usage?). Pinning verbs.
- **Bar unlocking semantics** — concrete gate (Director-approved), notification chain.
- **Triggers UI** — whether they have a director-visible surface or remain engineering-side configuration.
- **Splash radius UI** — built today for library; needs a viewing surface.
- **Federation seam** — cross-library card linking, ownership, cross-search.
- **Multi-agent collaboration** — concrete worked example: a play that hands off across two agents via ledger + trigger.

---

## 10 · Cruft and shadows

What's *visible-but-misleading* on the prototype today:

- **Onboarding-on-rails** — being ripped out.
- **InfoHub** — deprecated; pending removal from canvas.
- **Phase Rail** — deprecate; not load-bearing.
- **Today's Frame Strip** — *not Alexandria.* From the director's separate cognitive-laboratory project. Lives in the HTML but should not.
- **Back-of-house agents shown as named characters** (Sam, Solomon panels) — most will roll up into plays.
- **`/canvasdemo` invocation** — internal prototype command only; not user-facing and not worth surfacing externally. The real entry is `/ax-library`.
- **2.5D library view** — provisional; tree+folders is the cleaner direction.
- **Bench plates Eng/Design/Market/Research** — placeholders; not the real future roster.

What's *important-but-invisible* (no canvas surface today):

- Triggers — core connective tissue, no UI yet.
- Ledger — not mocked.
- Splash analysis — built for library, no canvas surface yet.
- Most of the playbook — the mock shows ~6 plays; real model is hundreds.
- Federation — no map yet.
- Agent-to-agent collaboration — no choreography surface.
- The SimCity company organism map — far-future home view.
- The "decide the truth" ceremony — no surface, but central event type.
- The daily queue — known event type, no surface yet.
- Recurring rituals (standup, briefer) — no integration surface yet.

The Walk's biggest job, for Alexandria specifically, was catching this asymmetry: **a lot of the prototype's visible surfaces are about to change or get deprecated, and a lot of Alexandria's load-bearing concepts aren't visible yet.** Any downstream sharpening exercise that just reads the prototype without this map will sharpen the wrong things.

---

## 11 · Process notes (for the design retro on the Walk experience itself)

Held separately for the retrospective on this Walk session, not part of the synthesis above. Key signals:

- Drafting back specifically — even with errors — produced higher info-gain than asking small surgical questions. Errors forced specific corrections (Phase Rail, Today's Frame Strip).
- Big questions ("walk me through a real Tuesday morning") produced more product signal than detail questions ("which line invokes the CLI?").
- The director taking a 20-minute voice memo unblocked an architecture-vs-journey gap that question-asking couldn't crack in 5x the time.
- The prototype HTML carries cruft from adjacent projects; a Walk that just spelunks markup inhales it.
- The Walk earned its keep when this document — drafted from elicitation — produces *finer-points* downstream sharpening, not *"we don't do that"* corrections.
