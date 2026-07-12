# Vision — Alexandria (Drafting Agent baseline)

This is a baseline 1-pager produced by the Drafting Agent from publicly available
material (getalexandria.ai, the public README, and the bundled plugin README).
It is meant to be reacted to (Ratify / Sharpen / Rework), not banked.

---

## 1. The Shift

*Length: 1 paragraph · Pulling for: the external change in the world creating demand for this product · Quick test: would a stranger agree based on what they see in the world?*

What specifically has changed in the world in the last 1–5 years that creates the demand for this product? Name the external shift — capability, behavior, infrastructure, regulation, demographic, cost curve — that would have made this product premature or unnecessary five years ago. Be specific: not "AI got better" but "AI agents can now do load-bearing senior-human work at a cost-per-unit that isn't flattening."

> AI coding agents have, in the last 18–24 months, crossed from autocomplete into doing load-bearing implementation work — writing real features, reasoning across files, completing tickets. The shape of software work has flipped: one human can now direct many AI agents in parallel, and small teams are routinely shipping at a pace that two years ago required a full org. But the agents themselves are stateless and isolated — they live in a thousand open tabs, forget between sessions, and operate one-on-one when the work is many-to-many. The bottleneck has moved off of "can the agent write the code" and onto "does the agent know enough about *this product* to make the decision a senior teammate would have made." That gap didn't exist at this scale five years ago because the agents weren't trusted with the decisions in the first place.

*Deep: `deep-guidance.md § 1` · Examples: `examples.md § 1`*

---

## 2. The Person

*Length: 1 short paragraph · Pulling for: a specific named composite — not a segment · Quick test: could a stranger predict what they say yes/no to on a Thursday?*

Name a specific composite person. First name. Backstory in one phrase. Current situation in one phrase. Scene-level pain in their week in one phrase. Someone you could pick out at a conference — not a segment, not a demographic, not "small business owners." If the answer reads like a market category, you haven't gotten to a person yet.

> [Could not infer from source material with confidence] The public site names two audiences — "software factories scaling past coordination limits" and "business operators with domain expertise building AI teams" — but never names a person. Best guess from the README's framing of `/ax-library`, Raven, and Conan/Sam/Bridget: **Devon**, a technical founder or staff-engineer-turned-tech-lead at a 3–8 person AI-native company. Two years out of a senior IC role at a bigger shop, currently running three or four Claude Code agents in parallel against a product he holds the whole shape of in his head. Scene-level pain: by Thursday afternoon he's spent more time re-explaining the product to agents — naming, UX patterns, why-we-don't-do-X — than actually directing them, and the agents keep shipping code that compiles but doesn't *fit*. **Unblock:** the director should name the real composite; "technical founder running a Claude Code swarm" is plausible but not confirmed.

*Deep: `deep-guidance.md § 2` · Examples: `examples.md § 2`*

---

## 3. The Problem

### 3a. Named pain

*Length: 1 paragraph in the person's voice · Pulling for: the pain that sells — what they'd say if asked · Quick test: would they nod if you read this back to them?*

What would the person say is broken if you asked them right now? A scene from their week, not a complaint. Specific to their situation. **This is the pain that sells — the front door.** Buyers can name it; marketing can lead with it.

> *"The agents are fast but they don't know my product. Every time I kick off a task I'm pasting the same context — naming conventions, the way we do auth, why we don't use modals, the three things that look like duplicates but aren't. Half my Claude Code sessions are me re-onboarding the agent before any work happens. And when I forget to do that re-onboarding, the agent produces code that's technically fine and product-wrong, and I have to throw it out or rewrite it. I'm becoming a full-time context-pasting service for my own agents."*

*Deep: `deep-guidance.md § 3a` · Examples: `examples.md § 3a`*

### 3b. Discovered pain

*Length: 1 paragraph · Pulling for: the pain that retains — recognized only after the alternative exists · Quick test: would they say "I didn't know that was bothering me until I didn't have to do it anymore"?*

What pain would they NOT name today, but recognize as the bigger problem once they've experienced the alternative? **This is the pain that retains — the backend revelation.** Important: don't lead marketing with this. Many buyers can't recognize the discovered pain before they've experienced the fix; pitching it to them confirms their bias against your product instead of serving them on it.

> [Lower confidence — extrapolated from the README's "implicit product knowledge made explicit" framing and the Raven-as-product-manager positioning on the site.] The pain Devon doesn't know to name today: the product itself only exists inside his head, and every hire and every agent has been re-deriving it from scratch in pieces. After a few weeks with Alexandria, what he realizes is that he wasn't slow at directing agents — he was the *single point of failure* for product coherence, and the company couldn't outgrow his attention because there was no shared substrate the agents and humans were both reading from. The "context-pasting" pain was a symptom; the deeper one was that the company had no externalized product mind. When he sees the library do that work, standups and re-explanation conversations he didn't realize he was running disappear from his week.

*Deep: `deep-guidance.md § 3b` · Examples: `examples.md § 3b`*

---

## 4. The Inadequacy

*Length: 3–5 bullet points · Pulling for: structural reasons existing tools fail — gap is durable · Quick test: could the competitor close the gap with a 2-week sprint?*

Name the existing tools or categories users currently reach for. For each, explain in one sentence why it STRUCTURALLY fails — not "it's bad" but "it was designed for a different shape of the world." The point isn't to insult the competition; it's to show the failures are *structural*, which means the gap is durable, not closeable by your competitor's next release.

> - **`CLAUDE.md` and project-level system prompts** were designed to give one agent a flat brief at the start of a session. They have no internal structure to query, no graph of relationships, no concept of "the relevant slice for *this* task" — they're a single document that gets longer and noisier until the agent stops reading it carefully.
> - **Notion, Confluence, and Google Docs wikis** were designed for humans to browse and skim. They assume a reader with judgment who can ignore stale pages and infer relationships. Agents have neither: they read literally, can't tell which page is canonical, and have no way to traverse from "feature I'm building" to "principles that govern it."
> - **Vector-DB / RAG context retrieval** treats the codebase or docs as an undifferentiated bag of chunks. It returns *similar* text, not *relevant* claims, and has no model of card types, rationale layers, or which dimension (what/where/why/when/how) the agent actually needs. Similarity isn't structure.
> - **In-context "just paste the spec"** is what Devon does today. It works until it doesn't — when the spec is too big, when two specs contradict, when the relevant constraint is on a different page, or when the agent and the human are looking at different snapshots. It scales linearly with attention, which is exactly the resource that's bottlenecked.
> - **Generic AI project-management tools (Linear copilots, ticket-summarizing assistants)** were built on top of human ticketing workflows. They assume the human still owns the decisions and the agent helps with the writing. They don't have a substrate for *the product itself* — only for tasks about it.

*Deep: `deep-guidance.md § 4` · Examples: `examples.md § 4`*

---

## 5. The Mechanism

*Length: 1 positioning sentence + 2–3 supporting sentences · Pulling for: the exclusive claim — what we are that no one else is · Quick test: can a stranger predict your next 5 features AND next 5 refusals from this sentence?*

Write a single positioning sentence in the form `[Company] is the only [X] that [Y]` or `[Company] turns [X] into [Y]`. The sentence should be specific enough that a stranger reading it could predict your next 5 features AND your next 5 refusals.

Then 2–3 sentences naming the primitives that produce the claim. *How* does the mechanism work? Usually 1–3 components that together produce the categorical shift the positioning sentence promises.

> **Alexandria is the only product-knowledge system designed for AI agents to read from and write to as a first-class user — a typed, graph-shaped library of the product that lives in the repo alongside the code.**
>
> The mechanism has three primitives. First, **typed markdown cards** — 21 card types across rationale, product, experience, and temporal layers, each making exactly one kind of claim, so agents (and humans) can reason about *what kind of thing* a piece of knowledge is. Second, a **wikilink graph encoded in the filesystem** — folders are types, filenames are identities, `[[wikilinks]]` are edges — so the structure is queryable by ordinary file tools and survives outside any one app. Third, a **team of role-separated agents** (Conan grades, Sam writes, Bridget assembles briefings, Raven thinks, Solomon triages) so the library is built and maintained *by* AI, not just consumed by it — the critic cannot build, the builder cannot grade, and the library becomes a living artifact rather than stale documentation.

*Deep: `deep-guidance.md § 5` · Examples: `examples.md § 5`*

---

## 6. The Felt Experience

*Length: a story, 250–400 words · Pulling for: a vivid scene that makes the Mechanism concrete, with GASP and absences · Quick test: could the same scene be told about a different product?*

Tell a *story* — not a list — about a moment in the user's life at the horizon when they're a power user. For AI-native products, that horizon is usually 12–18 months in, not 3 years.

> Tuesday, 10:14 AM. Devon has three Claude Code sessions running across three branches and a fourth window open with Raven, his product-thinking partner. A new request landed overnight from a design partner: they want the onboarding flow to handle a class of user — operators who already have an existing library — that nobody had thought through. A year ago, this would have been Devon's whole Tuesday: re-read the spec, write a mini-brief for himself, talk it through with a co-founder, write tickets, then start pasting context into agents one by one.
>
> Instead, he opens the library room and tells Raven what landed. Raven pulls in the relevant cards — the onboarding journey, the principle that says *first-visit and return-visit are the same room*, the standard that defines what counts as an existing library, the decision card explaining why they refused a different version of this six months ago. She names two tensions she sees with the existing thesis and proposes three resolutions; Devon picks one and edits one card's `WHY` himself. Bridget assembles a context briefing for the implementing agent in the second window. The agent writes the change, lints clean against the standards in the library, and Conan grades it. By 11:30 the change is in review on a branch, and the *library itself* is one card richer because Sam added a new Decision card recording why they took this shape and not the others.
>
> Conspicuously absent from Devon's Tuesday: the 40-minute "let me re-explain the product" call that used to start every new feature. The Notion page nobody updates. The Slack thread where three people relitigate naming. The doc Devon used to write himself at 11 PM because it was the only way the agents would get it right by Wednesday. The agent has not asked him "what should I name this?" The agent has not invented a modal. The agent has not duplicated an existing concept under a new name. Devon hasn't pasted anything.
>
> By Thursday the design partner is using it. Devon hasn't been the bottleneck once.

*Deep: `deep-guidance.md § 6` · Examples: `examples.md § 6`*

---

## 7. The Proof

*Length: 2–3 markers · Pulling for: observable, falsifiable, distinctive signals — story-truth not market-thesis · Quick test: could a competitor with a different Mechanism accidentally hit this marker?*

Observable signals in *customer companies* that would tell us the Vision held. **Story-truth markers** — not adoption metrics, not revenue, not NPS.

> - **Agents read from and write to the library as part of normal work.** In customer repos, the library is touched (read via Bridget briefings, written via Sam, graded via Conan) in the same week-over-week rhythm as the code itself. If the library exists but only humans touch it, the Mechanism has failed — it became wiki, not substrate.
> - **The "re-explain the product to the agent" step drops out of the workflow.** Observable in customer behavior: implementing agents are invoked without a hand-pasted product brief in the prompt because the briefing comes from the library. A competitor doing fancier RAG over docs could not hit this — they'd still be retrieving chunks, not assembling typed briefings from a graph.
> - **New hires and new agents onboard from the same artifact.** In customer companies that have grown past the founder's head, both a human joining the team and a new AI agent being instantiated bootstrap from the library. If only humans use it for onboarding, it's documentation; if only agents use it, it's a prompt-config file. Both, and it's the externalized product mind the Discovered Pain points at.

*Deep: `deep-guidance.md § 7` · Examples: `examples.md § 7`*

---

## 8. The Refusal

*Length: 2–3 anti-positions · Pulling for: trap-shaped refusals — what LOOKS aligned but would undermine the Vision · Quick test: would you sell to them with a $1M check in hand?*

Name customer types, product directions, or buying motions that LOOK aligned with this Vision but would undermine it if served. For each, name the structural reason — what would this product AMPLIFY in that case that would be harm, not help?

> - **Not for the enterprise knowledge-management buyer.** Companies that want "an AI-powered Confluence" or a documentation portal for human readers will ask for permissioning, audit trails, page-level approvals, and a rich human editor — all of which would push the library back toward a wiki for humans to browse. Reason (ties to Mechanism): the moment the primary reader is a human compliance officer, the typed-graph-for-agents primitive becomes overhead, and the product silently regresses into the category the Inadequacy slot already named as structurally broken.
> - **Not for teams that want a one-shot context dump.** A team that says "we already have a great spec — just point the AI at it" is looking for better RAG, not a living library. Reason: there's no way to make the Discovered Pain ("the company has no externalized product mind") materialize for a customer who never builds the substrate. They'd evaluate Alexandria against vector search, conclude it's "more work for similar results," and confirm the wrong frame.
> - **[Lower confidence — likely refusal] Not for shops where humans, not agents, are doing essentially all the load-bearing implementation work.** If AI agents in the org are still autocomplete-level and a senior human is in the loop for every meaningful decision, the cost of maintaining a typed library outweighs the benefit — the agent isn't trusted with the decisions the library exists to inform. Reason: the entire Mechanism is calibrated to a Shift (agents doing senior-human work) that hasn't landed in this org yet. Selling to them would distort the roadmap toward human-reader features and away from the agent-as-first-class-user commitment. **Unblock:** the director should confirm whether this is a real refusal or whether early-stage AI-adoption teams are an intended on-ramp.

*Deep: `deep-guidance.md § 8` · Examples: `examples.md § 8`*

---

## Notes from drafting

- **Sources read:**
  - `https://getalexandria.ai` (via WebFetch)
  - `/Users/danvers/conductor/workspaces/alexandria-internal/chennai/README.md`
  - `/Users/danvers/conductor/workspaces/alexandria-internal/chennai/README.public.md`
  - `/Users/danvers/conductor/workspaces/alexandria-internal/chennai/packages/alexandria-plugin/README.md`

- **Suspected framing biases in the public material:**
  - The website leads with a *humanist* / "AI should elevate humanity" / "small teams of centered, rested people" frame, while the READMEs lead with a *technical-substrate* / "typed knowledge graph for agents" frame. These are pointed at different audiences and pull the Vision in different directions — the website would draft a Vision about *how work feels for the human director*; the README would draft a Vision about *agents reading typed cards*. The draft above leans on the README framing because it's more concrete and falsifiable, but the director likely has a synthesis the public material doesn't show.
  - The website names two audiences ("software factories" and "business operators with domain expertise") that read as two distinct personas. The README only really speaks to one (the technical builder using Claude Code). The director should confirm which is The Person — drafting picked the technical builder because everything downstream from the Mechanism is calibrated to that user.
  - The phrase **"Shipping at the speed of imagination"** on the website is a hero-tagline, not a Vision claim — the draft does not treat it as the Mechanism. If the director wants it load-bearing, slot 5 needs to be reworked.
  - "Raven as your senior product manager" is foregrounded on the website but appears as one of five agents in the README. The draft treats the five-agent team as the primitive; if Raven is actually the singular product hook, slot 5 may be miscalibrated.
  - The website mentions a **"7 Turn Work Week"** as a complementary guide and frames an OS-level ambition ("library + playbook + ledger"). The draft did not absorb playbook/ledger because they are not present in the README payload — if those are load-bearing to the Vision, the Mechanism and Felt Experience are under-scoped.

- **Lowest-confidence slots:**
  - **Slot 2 (The Person)** — public material gives a segment, not a person. Draft proposed "Devon" as a plausible composite; the director should ratify, sharpen, or replace.
  - **Slot 3b (Discovered Pain)** — extrapolated from product framing rather than from customer voice. The reframe ("the company had no externalized product mind") is consistent with the material but is a drafter's guess at what customers realize on the back end, not something the public copy says.
  - **Slot 8 third refusal** — flagged inline. Possible that early-adoption AI teams are an intended on-ramp rather than a refusal; cannot tell from public material.
  - The Felt Experience scene leans heavily on the README's described workflow (Raven → Bridget → implementing agent → Conan → Sam). If the real horizon-state of the product is meaningfully different from today's workflow, the scene is a 0-month story rather than a 12–18-month story and needs sharpening.
