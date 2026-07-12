# Playtest Notes — Playmaker's Studio Retcon

**Session start:** 2026-06-21 (Raven prototype opened the honeydo this turn)
**Architect:** Danvers (the director)
**Mediator:** Raven prototype (the tab's agent)
**Honeydo:** 33 items, four-way split, see `honeydo.md`

---

## META — observations about the mediation skill itself (surfaced first)

### META — Vocabulary tool needs its own design pass (parked for later)
**Observed (architect, session close):** *"The vocabulary [tool] was created as a highly interactive tool, with lots of examples, independent from a product walk, its own thing. But the way the words are organized doesn't make any sense to me. My guess is that nesting the nouns (and the noun FIGHTS) into the sections of our drawing is the right answer, and walking through and talking about it is the right answer, and having all of those examples from other companies could actually be really helpful to our best practices and to help identify and fill out likely missing nouns... and maybe in all of that some of the old solomon skills come in handy... but in the same way that we've just completely reimagined product walk, we're probably some design and architecture work away from saying anything too definitive on next steps for the vocabulary work."*

**Direction (parked, not solved):**
- **Nest nouns into the Sections of the product walk drawing** (rather than the current standalone tree-browser). Vocabulary follows the visualization's organization, not its own.
- **"Noun FIGHTS"** — polysemy splits + UL-test failures + competing-name resolutions — also live nested in Sections. The fights are first-class data, not edge-case markers.
- **The walking + dialogue pattern** (the same Section-by-Section approval pattern we just played in the playtest) generalizes from drawings to noun resolution.
- **Other companies' examples as best-practice + missing-noun reference.** The existing 10-product worked corpus (airbnb / figma / linear / etc.) becomes the comparison library for *"here's how others named this kind of thing; want any of it?"* — particularly useful when a director's product is thin on a category and a peer-product's example fills the gap.
- **Solomon's method may apply to nouns** the same way the Hardener applies it to moves — Outcome / Reasoning / Breakdown × every noun + the polysemy check + the UL test. (This is exactly what we just discussed as "noun hardening within the visual.")
- **Status: design and architecture work owed.** The vocabulary workstream needs its own reimagining pass — parallel to what the playtest just did for product walk. Not now.

**Routes to:** Vocabulary tooling redesign (future); the noun-hardening step in the Atomic-library pipeline (already framed in conversation, needs spec).

### META — Inheritance/Quarantine IS the Planes ethos in microcosm
**Observed (architect, Block 7 close) [verbatim]:** *"This is part of the past / present / future and learning -> strategy ethos of alexandria. This studio was built on the ashes of a highly dysfunctional factory. There's lots to learn from that… and dangers of contagion. So you have to be disciplined."*

**The mapping:** Studio's inheritance/quarantine mechanism is the Planes architecture played out at a single product's scale:
- **Past** — `inheritance/autopsy/` (factory-era postmortems: what worked, what failed) + `inheritance/quarantine/conventions/` (factory-era rules; source material).
- **Present discipline** — the **not-load-bearing rule** ("the quarantine subset is NOT load-bearing until promoted" — CLAUDE.md). This IS the "discipline" the architect named: refusing to absorb past patterns into present practice without verification.
- **Future** — what gets **promoted** through PROJECTION.md §10 enters the load-bearing rulebook and shapes how plays are made going forward.
- **Learning → Strategy** — autopsies inform what gets promoted vs rejected; the rulings on each quarantined item are explicit Learning-informing-Strategy moments.

**The phrase "dangers of contagion"** is the load-bearing one. Contagion = importing yesterday's patterns without verifying they still hold. Quarantine's whole point is preventing it. This is **the Library ethos's anti-pattern** named concretely.

**Implication for Alexandria's library + the design plan:** the same discipline scales. When a library inherits material from a prior product era, the same Planes-ethos pattern applies — autopsy the past, quarantine the unverified, promote only what's verified, **and never let unverified inheritance be load-bearing**. The Plane Switcher in VB3 could surface this directly: Learning's evidence about *which past patterns held* feeds Strategy's choices about *which still earn promotion to live Product*.

**Routes to:** the design plan's "honesty is the policy" principle (locked = locked, unverified = unverified across every view); VB3 cross-plane edge design (Learning → Strategy edges should show *verified vs unverified* state on the line itself); and the library-rebuild pipeline (when EL2 scan ingests an old product's existing docs, the quarantine pattern is the right intake discipline — don't promote scan outputs to "true" until verified through the FoH walk).

### META — Every Fabro node is its own thing (model correction)
**Observed (architect, Block 5):** *"We think of every node in the fabro setup as its own thing. Some nodes are just software. Or a tool-using agent."*
**Correction to Raven's model:** Block 5 drew "the Doer agent" as a unitary actor working through the run. Wrong. Each node is its own kind (software / tool-using agent / human gate / pure agent), and the runtime visits each node and executes per its kind. The "doer" column in §4 of the brief makes this explicit per move (judgment / mechanical / human). No single Doer.
**Routes to:** EL3 brief design (Raven must describe runs as "the runtime visits nodes, each node runs its own way" rather than "an agent works through the play").

### META — The Vision-pattern runtime contract is unevenly applied across plays
**Observed (architect, Block 5):** *"Up until very late in the morning on Friday what was happening in Vision, architecturally and via design, was not happening in plays. We were demo'ing frame-the-problem and so attempted to upgrade it with this, architecturally and executionally. I think it worked, and at least an attempt was made to capture this in process, and it at least partially worked because you're so aware of it, but gaps were almost certainly left in the wake of the push."*

**The state of the runtime contract (per architect):**
- **Vision (shipped)** — has had this architecture forever; the reference implementation.
- **frame-the-problem (upgraded ~2026-06-18, late Friday morning)** — got the upgrade during demo prep; *probably* works; possible residual gaps from the push.
- **Every other play** — still carries the old blocking-gate `workflow.fabro` shape; deadlocks under detached / Raven-mediated runs.
- **RUNTIME.md itself (dated 2026-06-18)** — was the documentation push that captured the architecture *into* a doc. Was a partial capture under demo pressure.

**This is the explanation for IN3 from the honeydo:** two human-gate models coexist not because both are intentional, but because the upgrade reached the canonical play (frame-the-problem) but hasn't reached others. PROJECTION.md §7 documents the *deprecated* blocking shape because it still describes what most plays *currently look like*.

**Connection to F8 (make playmaking a play):** the make-a-play meta-play would be exactly the vehicle to bring every play up to the new contract — by being itself one. Slice 1 / #305 (frame-the-problem-coin) is the *play-side* generic plumbing being added so the contract becomes mechanically enforced rather than per-play-upgraded.

**Implication for the playtest's value:** the Hot Spots I found about runtime contradictions are NOT abstract — they're the architecture-in-flight. Not bugs to be permanently lived with; pre-completion state of an upgrade still in progress.

**Routes to:** F8 (cap fix — the make-a-play work is THE answer); EL3 brief design (Raven describing a play's runtime must distinguish *"this play has been upgraded to the new contract"* vs *"this play still uses the blocking shape"* per-play).

### META — STRUCTURAL: Playmaking must itself become a play (the cap finding)
**Observed (architect, Block 4 close) [verbatim]:** *"Playmaking itself needs to become a play! Right now it's still doughy and getting formed — we'll do a lot of fixing and hardening, but what fixes document and implementation drift is running this all through fabro."*

**Why this is the most important finding of the playtest.** Every prior META observation and every fix-list item — F1 (template §6 voice), F2 (legacy status ladder), F3 (placeholder graveyard), F4 (Board interactivity gesture), F5 (template-vs-exemplar drift), F6 (Director-authors framing), F7 (gate density not surfaced) — has the **same root cause**: playmaking is governance-doc-shaped and human-orchestrated, so docs and practice drift independently. The moment playmaking is itself a play, this drift becomes a Protocol E lint failure: §4 (move graph) is the canonical loop, `workflow.fabro` orchestrates it, every other artifact (the template, README, AUTHORING) becomes either a rendering of §4 (auto-synced) or deliberate non-load-bearing prose. **There is no more "template says X but frame-the-problem says Y"** because frame-the-problem ran through the playmaking play, and the playmaking play's §4 IS the spec.

**Cross-reference to existing work:** Per memory `[[make-a-play-meta-play]]`, a 3-module **playmaker pipeline as a self-hosting play** was prototyped at `studio/plays/make-a-play/` on branch **`danversfleury/playmaker-testing-streamline`**, reverse-derived from `frame-the-problem-next`. Auto-advance contract designed in `TESTING.md`. The plan lives at `docs/alexandria/plans/_archive/playmaker-testing-streamline/plan.md` in this branch even though the play prototype is elsewhere.

**So this isn't a new idea — it's an existing thread.** The playtest validates the strategic importance of finishing it. The fix-list items F1–F7 would become *self-healing* once make-a-play lands and produces frame-the-problem as a re-derivation through the playmaking workflow.

**Recursive dogfood thesis:** Studio dogfoods Studio. Same shape as Alexandria dogfooding its own library through the EL pipeline. **Studio writes the play that makes plays; running it hardens it; the hardening fixes the drift it currently can't see.**

**Routes to:** Studio fix-list F8 (THE cap fix); the playmaker-testing-streamline branch resumption; the design plan's altitude principle (this is what "altitude" looks like when applied to Studio's own self-hosting).

### META — Division of labor: agents do, humans pick + clarify + approve
**Observed (architect, Block 3 close) [verbatim]:** *"Every step of this is agent authored! The review gates are chances for the human to review, but generally the human is picking a play, clarifying its purpose, what it's supposed to do, agents do all the research all the sketching all the hardening, human reviews and approves, then similar cycle, agents build everything in fabro, author tests, and then run one of each of them — kind of like a sanity check — then the human pops in and does their own sanity check. There could be a ton of check-in points here. Check-in to look at the drawing prior to running a single test. Running basic tests but human reviews and approves the tests tuned to this prompt. I'm currently running at a setting of pretty high trust in the agent — and that will be more earned than aspirational as we harden the processes and examples in each of these production cycle phases."*

**The actual division of labor:**
- **Human (Director):** picks the play (the topic) · clarifies what it should do (purpose, intent, constraints) · reviews and approves at gates · rules decomposition granularity.
- **Agents:** do all the research (grounding) · sketch and draft the brief (yes, the brief too) · harden via the Hardener interview · derive the workflow + prompts + diagram + story · author the tests and moves overlay · run dry-runs and grade them.

**Implication for the model:** Brief, hardening, workflow projection, prompt authoring, fixture authoring, dry-run grading — **every artifact is agent-authored.** The Director's contribution is *intent + approval*, not authorship. README's table says *"Step 1 | Brief | Director | authors `plays/<slug>/brief.md`"* — **this is doc-vs-practice drift.** Reality: agents draft from director's clarification; director approves.

**New design dial surfaced: trust setting = number of gates.** The 2-gate model (design confirm + proven confirm) is **the high-trust setting**. The system can support **many more gates** if trust is lower — review-the-drawing-before-tests, approve-the-test-tuning, approve-per-prompt, etc. Currently: high trust. The trust setting is **earned by hardening of processes + examples**, not aspirational. This is a **first-class product property** worth modeling explicitly — every play could carry a `trust:` field indicating its gate density.

**Implication for EL3 + the whole library-elicitation pipeline:** The Front-of-House Walk (EL3) is **architecturally the same pattern as Studio's gate model** — human picks the source material + clarifies intent, agents do the back-of-house work (the EL2 scan + the pipeline passes), human reviews at gates. So **Studio's gate-density tunability** is also Alexandria's library-pipeline gate-density tunability. The director could choose to insert more gates between EL2 and EL3 (e.g., "let me see the events timeline before you ask me the honeydo questions"). The shape generalizes.

**Routes to:** Studio fix-list F6 (README "Director authors" framing); EL3 brief design (gate-density as a director-configurable parameter); the design plan's trust-as-earned principle (already implied; surface explicitly).

### META — Raven conflated forward-design and reverse-derivation as one process
**Observed (architect, Block 2 close) [verbatim]:** *"I think you may have two separate processes confused. There is one process where we take a fabro workflow that already exists and play-ify it — the workflow is turned into a diagram and the story is guessed at from the diagram. Generally its the other way around. We find best practices, pick the ones we think are best, design a way to implement them as a play, harden the reasoning, finish our design… and then I can't remember dividing lines but there is a chicken and egg of drawing the play in the playmaker page and coding it up in fabro."*

**The actual two processes (confirmed in source):**
- **Forward-design (canonical, Frame the Problem-style):** research/grounding → Brief (§1–8) → Hardener interview → Gate 1 → Author derives `workflow.fabro` + prompts + diagram + story view. Brief is upstream of code. Fully gated through the Studio ladder.
- **Reverse-derivation (atomic-card family):** existing Fabro workflow → `studio/tools/derive-views.sh` reads the workflow + extracts prompts → diagram + story view get generated; brief and story are *reverse-authored* from the build. **Explicitly NOT a Raven play, NOT gated through the studio ladder.** See `studio/plays/ATOMIC-CARDS.md` header: "REVERSE-DERIVED family overview… reverse-derived from the build, not authored."

**Implication for EL3:** Raven must surface this distinction in any Studio walk — describing the forward path as universal hides the parallel-class. For other directors' products, this maps to: *"what process did each play come from? authored-from-scratch vs reverse-derived from an existing workflow?"* — non-trivial provenance data.

**Implication for honeydo:** UN9 ("reverse-derived plays — own context or footnote?") and IG9 (spin-out target) both rest on this distinction being explicit. The model needs to carry it.

**Sub-finding (architect):** Numbered cross-references (§4, §6) lose meaning without context. **Always enumerate by name first, then number.** Raven's standard discipline should be: *"§4 (Golden path — the move graph) and §6 (Draft prompt language)"* rather than *"§4 and §6."* This is a usability constraint on the mediation skill.

**Routes to:** EL3 brief design (two-process distinction + enumerate-not-reference); honeydo format spec (UN9 context promotion).

### META — Studio's heart is play authoring, not the Board
**Observed (architect, Block 1 close) [verbatim]:** *"Playmaker's studio, fundamentally, is about being able to write a play for an agent to execute. The kanban board is an easy to forget piece of it for keeping track of all of the plays you're working on. I don't even think its a real board yet — you can't even manipulate the cards or move them around yourself, so its like, a gesture so we don't forget that we need it. But I think your opening framed it as the heart of the experience, which, more like a drum beat."*

**The framing error:** Raven (me) opened with *"The Studio is, first and foremost, a kanban board..."* — projecting importance onto supporting infrastructure. The Board is a **drum beat** (rhythm, housekeeping), not the **heart** (play authoring).

**Implication for EL3 (and for the design plan):** The "story" Raven tells must lead with the *product's heart*, not the most visible artifact. Visibility ≠ centrality. For Studio: heart = play authoring (brief + move graph + hardener interview + Gate 1); the Board is the visible-but-secondary tracking layer. For other products the same trap could fire — surface that ships with screenshots may not be the center.

**Implication for the storytelling thesis (`product-plane-design.md`):** The "basic-nouns story" opening must distinguish *what the product IS for* from *what you happen to see first*. The Engine View's order-of-narration matters.

**Sub-finding (architect):** The Studio Board is **currently read-mostly** for the director ("you can't even manipulate the cards or move them around yourself") — a real product-state observation, not a bug. The Board's interactivity gap is honest current state, worth recording.

**Routes to:** EL3 brief design (lead with heart not surface); honeydo format spec (item priority should reflect centrality, not visibility); VB2 brief (Engine View narration order).

### META — Hardening is part of "being designed" at Board altitude
**Observed (architect, Block 1 close) [verbatim]:** *"Hardening should be a part of the design process. Part of being designed is being hardened. I think as a kanban board this is about a phase the work is in, it doesn't articulate every detail of the phase."*

**Implication:** The Board's grain is **phases**, not sub-steps. Don't surface hardening as its own column or sub-block at Board altitude; it lives inside "Designed" as part of what that phase means. Sub-steps surface at lower altitudes (the play-authoring zoom, Block 2+).

**Routes to:** the altitude-discipline principle in the design plan (C4-style "don't mix levels" — Board altitude shows phases, Brief altitude shows sub-steps). Same rule applies to other phases — "Built" shouldn't sub-divide on the Board either.

### META — Opening move is wrong: honeydo before shared understanding
**Observed (architect, turn 1):** *"raven is coming at me with 33 issues. But she hasn't built a shared understanding with me of what is true — for all I know one of these issues is based off of her making a mistake rather than me. I'd think step 1 is building shared understanding with what is known and then step 2 is curiously seeking to flesh that out. Director reactions to raven 'drawing', talking or writing about their product will likely lead to conversations that naturally clarify the list before questions are even asked."*

**Implication for EL3:** The mediation pattern is **two-phase, not one**:
- **Phase 1 — Build shared understanding.** Raven presents the *model* she derived from the back-of-house scan — the parts (cards in basic-nouns story), the spine (events timeline as narrative), the shape (contexts and altitudes). Director reacts. *Half the honeydo dissolves in the reaction itself* — the director catches misreadings, miscarvings, misnamings without any formal question being asked.
- **Phase 2 — Walk the residual.** Only after the model is mutually held does Raven open the honeydo to address what *remains* genuinely open after director reactions.

The current skill skipped Phase 1 entirely. It went straight to "I've got 33 items — pick a theme." This is the EL2→EL3 handoff anti-pattern: presenting findings *before* presenting the model the findings are about.

**Implication for honeydo format:** The honeydo is a *derivative surface*, not the primary one. It exists, it's valuable, but it's not the opener. The four-way split is still useful as a *taxonomy of residuals*; it shouldn't drive the conversation's opening shape.

**Implication for the visualization (Plan B):** This validates the visualization-as-conversational-opener thesis. **VB2 (Engine View) is *literally* what Raven would show first** in a Phase-1 walk. Until VB2 exists, Raven narrates the model verbally; once it does, she shows it. Either way, the visual *is* the opener.

**Implication for HANDOFF.md / raven-retcon-skill.md:** The opening-move scripts both encoded the wrong shape. Need a Phase-1 opener — *"Here's what I understand about Studio from the scan. Let me walk you through it; correct or extend as I go. Once we agree on the picture, I'll show you what's still open."* — then transition to the honeydo for whatever survives.

**Routes to:** EL3 brief design (the two-phase mediation pattern); the honeydo format spec (derivative-not-primary framing); VB2 brief (visual-as-conversational-opener).

---

## Rulings (items resolved this session)

### IN1 — Two parallel ladders [RULED 2026-06-21, tentative]
**Ruling:** *"the designed → hardened → derived process existed before two things: the kanban board and our exacting testing system. I suspect hardened was the original thing we did instead of creating a risk map to inform the testing process. I've seen agents make plays, mention the hardening process, and haven't really known what just happened. My gut says this is like an archeological dig and designed/hardened/derived is from a very early era of the prototype."*
**Implication:** The old `slot → designed → hardened → derived → proven → registered` Status ladder is **legacy**, predating both the Kanban Board and the current risk-map/fixture testing system. **"Hardened"** was the predecessor of what is now the risk-map + fixture-grading process. The two ladders are not "deliberately distinct" — the older one is incompletely retired. Mark as **legacy / for retirement** in the model; surface the open question of whether the *hardening step itself* is still active or also archeological.
**Linked items:** Tentatively resolves part of UN10 (three-context overlap on workflow package — was complicated by legacy artifacts).
**Follow-up:** Is the hardening *step* still performed, or only the *status name* surviving? (Surfaced in Block 2's uncertainty.)

**Refinement after investigation (2026-06-21):** The hardening **step** is active and well-defined (README Step 2; `frame-the-problem/hardening.md` is the worked example). A Hardener agent uses "Solomon's method" (interview discipline: one question at a time, claims classified before accepted) asking three questions per move (Outcome / Reasoning / Breakdown) + a state audit. Lives between Brief authoring and Gate 1, *within* the `designed` stage. It is **design hardening** — attacking the brief for soft spots — NOT a pre-risk-map testing proxy. Risk-map / fixture work is separate (Built stage, Steps 4–6). So the legacy artifact is precisely the **status name "hardened"** in `registry.js`, not the step. Architect's intuition was right about the legacy *name*; the *why* (originally instead of testing) was off — hardening was always design-interview, never testing-proxy.



_Append per ruling. Format:_

```
### [ID] — [short label] [RULED YYYY-MM-DD]
**Ruling:** "[verbatim from director, in quotes]"
**Implication:** [if architect named one, otherwise omit]
**Linked items:** [other IDs this also resolves, if any]
**Notes:** [any nuance worth preserving]
```

_Examples below removed after first real ruling._

---

### GATE OPERATIONAL DEFINITIONS — captured Block 1 [2026-06-21]
**Gate 1 (Confirm the design):** Director reviews the post-hardening brief §1–8, *explicitly including §4 move graph shape*. Mechanical weight: nothing is derived before this — no `workflow.fabro`, no `prompts/`, no diagram, no story view. Pure writeup + graph shape review.

**Gate 2 (Confirm it's proven):** Director reviews `dry-runs/` against the proof spec — (a) golden-path passes every eyeball check, (b) at least one failure path behaves as designed (refuses/flags/asks, never invents), then (c) rules decomposition granularity and banks.

**Director framing on Gate 2 [verbatim]:** *"Gate 2 is more theoretical because we haven't run too much, but I think it makes sense — there is a certain 'setting' for how 'proven' a play needs to be before its graduated to live. We know what statistically valid test markers are/would be but also will likely need to go live ahead of them for time and token sake. So gate 2 is human judgment right now as opposed to programmatic."*

**Implication:** The statistical bar (k=30/100/300, McNemar, etc., per TESTING.md) is **explicitly accepted as not-yet-wired and not-blocking-live** — pragmatic "live before fully validated" is the current standard, by design, not by oversight. This is a real product principle (linked to IN6 — bar documented, not wired).

---

### Brief §6 — voice vs. prompt-language drift [RULED 2026-06-21]
**Architect's correction [verbatim]:** *"My original mental model was aligning plays to match an agent's voice. That's not how it works. Plays are much more like back of the house — voice doesn't really matter. So we need to be specific about step 6. If it's really just voice/tone/character it's unnecessary. If it's where we're drafting the prompts or software that go into nodes based on the story up to this point, then its real but we remove references and guidance to voice."*

**Ruling:** §6 is **real and load-bearing** — it's the source of the prompt language the Author projects into node prompts at Derive. AUTHORING.md: *"each prompt's task language traces to §6 — paraphrase is legal, new method is not."* Without §6, language drift fails Protocol E. So: **KEEP §6, REMOVE voice references from its guidance.**

**The artifact-in-conflict (in-repo):**
- `studio/plays/TEMPLATE-brief.md` §6: titled *"Draft prompt language"*; describes the job as *"intent, tone, and the calls only you can make."* The word **tone** is the trap.
- `studio/plays/frame-the-problem/brief.md` §6: renamed to *"Derived language"*, explicitly states *"The prompts are backstage workers producing material — they are NOT written in Raven's voice; her voice is external."*

**The exemplar already corrected the framing; the template hasn't caught up.** This is the same docs-out-of-sync pattern as IN1 (legacy ladder), H5 (overlays can drift), H11 (placeholder graveyard) — Studio's governance docs lag its proven plays.

**To-do:** TEMPLATE-brief.md §6 needs renaming + guidance scrub. Rename to "Derived language" (per frame-the-problem) or similar; drop "tone"; clarify the job is **seeding the prompt language that the Author projects**, not authoring voice. Touches `studio/plays/TEMPLATE-brief.md`; possibly propagates to new plays drafted off the template.

**Routes to:** Studio improvement honeydo (template ↔ exemplar sync); EL3 brief (Raven must distinguish front-of-house voice from back-of-house prompt language when describing plays).

---

### IG1 / IG2 — "job" → **Function**; the Role · Tier · Function · Play stack [RULED 2026-06-22]

**Ruling (director, verbatim across the thread):** "Function is the golden word. we can lock that." … "let's keep it as it is [the sports/playbook brand], with those fixes locked in."

**What was confused:** Studio's `job:` field (the 8: Insight · Strategy · Definition · Delivery · Launch · Analytics · Communication · Operations) wore a *position* word for a *category* level, colliding with Alexandria's **Job Title** (e.g. Operations Manager). Diagnosis: in a job listing the *job* is the title at the top, not the categorical headlines underneath — "job" was one level off.

**Healed lexicon (a conscious "corporate playbook" — org frame over a sports brand):**

- **Role** — the position: Raven, the Technical Product person. = Alexandria **Job Title** / Brick-0 F1 **Role** type. (Role/Function are metaphor-neutral, so locking them does NOT drop the sports brand.)
- **Tier** — seniority altitude: Technical Coordinator · Technical PM · Technical Sr. Manager (kept as-is). The same Functions run through all three; the tier sets which Plays you own. `tier:'PM'` everywhere = the golden path lives at the PM tier.
- **Function** — one of the 8 (renamed from `job:`). Its details are *Plays*, never "functions" — which is why "responsibility" (ambiguous across levels) and "seat" (the Tier×Function cell) were both dropped; a Play just declares its Function + Tier.
- **Play / Playbook** — kept (the brand). A Play is a task or chain of tasks (a work order) run by the agentic team; **Play = template, Run = instance**.

**IG1 answer:** the 8 Functions are the list above; `registry.js` shows only 4 (Insight/Definition/Delivery/Strategy) because Launch/Analytics/Communication/Operations are named-but-empty slot cards (`raven-grounding.md` L31–34).
**IG2 answer:** Tier = the three seniority altitudes above; not a separate enum to invent.

**Routes to (rename task — Studio, separate PR):** `job:` → `function:` across `registry.js`, `TEMPLATE-brief.md`, `raven-grounding.md`, `board.html` (`r.job`); reword "the eight job categories" → "the eight Functions". Log the job↔Job-Title noun-fight in the library lexicon work (Brick-0 F1 Role + the playtest's "vocabulary needs its own design pass" META).

### IG3 — `surface:` / `status:` / board stages → one ladder, anchored on the process [RULED 2026-06-22]

**Ruling (director, verbatim):** "We have our not-yet-really functional kanban board (empty, sourced, designed, built, proven, live). And then we have the process by which AI agents are driven to build out plays. They are saying slightly different things from each other, but I think the winning play here is to pick one and organize around that. Because the board is fake and the process is real, updating the board to match the process is probably the easier thing to do."

**Resolved:** Multiple stage vocabularies exist for "how far along is a play" — the **process** (`status:` proving ladder: slot → designed → hardened → derived → proven → registered), the **board** columns (empty/sourced/designed/built/proven/live), and the registry `surface:` descriptor (grounding only / full sketch / banked / registered). **Collapse to ONE, anchored on the real process; update the (fake) board to match** — not the reverse.

**Wrinkle to carry:** `surface:` is not a pure duplicate of `status:` — it varies *independently* (several plays are all `status:'slot'` yet range `grounding only` → `full sketch`), because `status:` lumps everything pre-design as "slot" while the board/`surface:` distinguish empty vs sourced vs designed. So executing "one ladder" means the unified process ladder must carry that finer early-stage granularity (empty/sourced/designed); `surface:` then folds in and retires.

**Routes to (Studio cleanup, separate PR):** reconcile `status:` ladder + `board-state.json` columns + `surface:` into a single stage enum anchored on the process (with early rungs for empty/sourced/designed); update `board.html`/`board-state.json` to the unified names; retire `surface:` once absorbed.

### IG4 — `ws:` (workshop page) vs `doc:` (records view) → unify the play surface; retire records [RULED 2026-06-22]

**Ruling (director, verbatim):** "yeah, records view feels like a weird holdover from a different time -- everything should be the same."

**What it is (settled by investigation):**

- A click routes by flag (`registry.html:147`, `board.html:213`): `ws:1` → opens `<slug>/index.html` (a bespoke **workshop page**, labeled WORKSHOP ↗); `doc:` → opens `doc.html?f=<brief>` (the brief rendered by the generic markdown reader `doc.html`, labeled RECORDS ↗).
- Disk: **frame-the-problem** and **build-atomic-card** have NO `index.html` — they carry the full carved artifact set (brief · workflow · story · diagram) and open to the records view. Only the retired **frame-the-problem-baseline** still has a bespoke `index.html`.
- So `ws:`/`doc:` was quietly encoding an inconsistency: in-progress/old plays get a built page; carved plays just render their brief through the generic reader.

**Resolved:** the **records view is a legacy holdover; unify — every play opens to the same surface.** The per-play `ws:`/`doc:` "which surface" split retires; `doc.html`-rendering-a-brief is no longer a play's primary surface. frame-the-problem & build-atomic-card get the consistent page they currently lack. (Same "retire the holdover, pick one" shape as IG3.)

**Not a graveyard:** no untagged duplicate of either play — the frame-the-problem pair is properly tagged (active + frozen baseline); build-atomic-card is singular.

**Orphan resolved — KEEP (live work):** `back-of-house-walk/` is the **EL2 "Back-of-House Walk" play**, authored 2026-06-21 in #320 (41 KB brief + moves + risk-map; early-stage — no workflow/page yet). It is absent from `registry.js` because that catalog is Raven's *PM golden-path* playbook and this is a *library-elicitation*-family play. Not cruft. Follow-up (not cleanup): EL-family plays have no registry home yet — decide whether they join `registry.js` (with a family tag) or get their own catalog (defer to the EL workstream).

**Routes to (Studio cleanup, separate PR):** one consistent play-open surface for all plays (driven by artifacts, consistently styled); retire `ws:`/`doc:` as a per-play surface selector and the `doc.html`-as-play-page path; ensure frame-the-problem + build-atomic-card render the unified surface.

### IG5 — Provenance Tag → it's the Ledger (work with it, don't hand-roll) [RULED 2026-06-22]

**Ruling (director, verbatim):** "I think the primitive is there, we just haven't wired in." → "Write up the plan and decisions to highlight the need to work with the ledger rather than have the library and studio pretend like it doesn't exist."

**Resolved:** A check of the actual code (`packages/ax`, not the plan docs) confirmed the **ledger primitive ships** — append-only `ax inspect events` over a JSONL `ledgerPath`, typed `AlexandriaStateEvent` + an `AlexandriaActor` (kind = user / agent / process) "who", the runtime already folding observations in (#305). So Studio's Provenance Tag (Grounded / Orchestrator-call / Director-ruling) and the library's `proposed_by` / `source_evidence` are **hand-rolling what the ledger already records.** Decision: **provenance is ledger-sourced; Studio + library project from / append to the ledger, never a parallel record.** "Least-built pillar" (C7) was about the *Learning semantics*, not the substrate.

**Full plan + decisions D1–D5:** `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md`.

**Routes to:** Brick 0 F3 (reclassify `proposed_by` / `source_evidence` as ledger-**derived**, not hand-set); Brick 7 (feedback arc de-risked — substrate exists, only the reading remains); EL5 (`atomic_card.created` = the provenance write).

### SG1 — `studio/plays/examples/` shape [RESOLVED 2026-06-22]
One file: `capture-technical-constraints.brief.md`. `examples/` is a single canonical **worked brief** (the exemplar a new brief is modeled on), not a folder of many.

### SG2 — `PLAY_MANIFEST` generation [RESOLVED 2026-06-22]
**Hand-maintained** — a TypeScript constant in `packages/ax/src/domain/plays.ts` (the runtime's source of truth for *registered* plays; no generator script found). A play joins it at the **"registered"** rung. Runtime counterpart to Studio's design-time `registry.js` — the "two registries" (IN5): `registry.js` = design-time catalog, `PLAY_MANIFEST` = runtime manifest.

### SG3 — Board UI live behavior [RESOLVED 2026-06-22]
The Board **is interactive** in code (`board.html`): cards `draggable`, full drag/drop between columns, a `▸` advance button, ready-dots, and moves **persist via `POST /api/board-state`** → `board-state.json` (written atomically by `site-server.py`). BUT that endpoint exists only on the custom `site-server.py` (per CLAUDE.md) — under plain `http.server` the POST 404s, so moves don't stick. Likely explains the playtest "can't move the cards" read: built, just needs the right server. **Reframes F4.**

### SG4 — Conformance gates location [RESOLVED 2026-06-22]
Two homes: `packages/viewer/src/components/studio/*Conformance.test.ts` (**placeholder · bank · risk-map**, Vitest) + `studio/tools/` check scripts (`check-moves.ts`, `check-placeholder-spelling.sh`, `check-workflow-edges.py`).

### IG6 — "big edit" → **Play Re-sync** (mechanical, compounded consistency play) [RULED 2026-06-22]
**Ruling (director):** "The name is misleading, and this should 100% be mechanical, something that will likely be a standalone play that is invoked as a compound part of plays all the time… certain types of changes to certain parts of the system impact the others… we need clear relationships here when X changes, change Y… a play that is at least fully drafted." Name: **Play Re-sync**.
**Resolved:** "big edit" retired (not about size). Every change asks "what else just changed / needs to change?" A **standalone, mechanical, compounded** consistency play that, after any edit to a fully-drafted play, computes the stale-artifact cone (via explicit artifact-dependency links — Brick 0 F2 turned inward) and re-derives (auto) or flags (needs-authoring). Replaces `BIG-EDIT.md`. Catches → Bug cards on the Board.
**Spec:** `docs/alexandria/plans/studio-fixes/play-re-sync.md` (PR #331).

### IG8 — Improvements.md vs Brief §8 → both fold into the **Board** [RULED 2026-06-22]
**Ruling (director):** "improvements & brief 8 are both procedural attempts to not lose good ideas but they were both written prior to the board existing." → both retire into the Board.
**Resolved + the Board model (director, finalized):** the Board is **studio-wide work-to-be-done** (one Board). Rename first column **"Empty" → "Backlog."** Two card kinds: **Play cards** (move through stages) + **to-do cards linked per-play** in three types — **Testing** (one checklist-card/play, raise N past the N=1 smoke) · **Improvement** (was improvements.md + §8) · **Bug** (catches; distinct from Improvement; higher priority). Every card links to its play → big view (play work board) / small view (filtered). improvements.md + Brief §8 retire into Improvement cards.
**Spec:** `docs/alexandria/plans/studio-fixes/board-data-model.md` (PR #331). Constraint flagged: `site-server.py` hard-validates the six stages, so to-do cards require a server-contract change.

### IG9 — Spin-out target → incubate-then-slice [RULED 2026-06-22]
**Ruling (director, verbatim):** "I prototyped playmaker studio outside of alexandria. the real key was aligning it with fabro to pull a play all the way through rather than just 'throwing it over the wall' to Jess to build using fabro… a studio to write 'prompts' or 'skills' and manage them is probably a more digestible and commercially viable product than alexandria itself. Alexandria has a 'live' playbook -- throwing completed plays over to slot into that from an outside entity is actually pretty clean. But we spent a lot of calories integrating and have a lot of work to do so the thinking is to basically incubate it inside of alexandria, then spin it out when the time is right."
**Resolved:** **Incubate inside Alexandria, spin out when ready** — not fork, not slice-yet. Studio (write/manage prompts/skills/plays) is plausibly *more commercial than Alexandria itself*. Clean seam (Studio produces completed plays → slot into Alexandria's live playbook; the `bank.sh` studio→plugin seam exists) → eventual **slice**, not fork. User ≈ the prompt/skill/play author (broader market). **This is why the Brick-0 scope ruling matters** — building Studio as its own library/profile (separable) IS the incubation-toward-spin-out discipline.

---

## Follow-up close — 2026-06-22 (the rapid-fire + Brick 0 session)

**The 12 quick cold-items are 12/12 resolved** (IG1–IG9 + SG1–SG4); the Brick 0 foundations were ruled the same session. PRs:

- **#328** — Brick 0 foundations ruled (F1 types / F2 links / F3 frontmatter + scope).
- **#329** — cold-items IG1–IG4 (job→Function lexicon; stage/surface unification).
- **#330** — work-with-the-ledger decision + IG5.
- **#331** — five Studio design-spec drafts for review: F4 (board interactivity), F7 (trust-setting), F9 (the Curator), Play Re-sync, Board data-model.
- **(this PR)** — cold-items close: SG1–4 + IG6 / IG8 / IG9.

**Architect's strategic read (IG9):** Studio is the candidate spin-out — likely *more* commercially viable than Alexandria; incubate inside, spin out as a slice when ready; the separation discipline this session built is the incubation work.

**Open follow-ups (queued):** the `job→function` rename + the stage/surface/board unification + the Play-Re-sync / Board / Curator builds; reconcile EL2 (back-of-house-walk) to Brick 0 → its Gate 1; the five F-spec drafts await director approval in #331.

---

## Parked (items left open with a reason)

_Append per parking. Format:_

```
### [ID] — [short label] [PARKED YYYY-MM-DD]
**Reason:** "[director's reason, in their words]"
**To unblock:** [what's needed before resuming — e.g. "Brick 0 F1 ruled", "look at code first"]
**Linked items:** [if parking this also stalls related items]
```

---

## Cold (22 items — not touched this session)

**Tallied at session close 2026-06-21.** The conversation prioritized the big META findings (which the playtest design explicitly framed as "first-class" findings); individual honeydo items were addressed when they came up naturally, but most were not walked one-by-one. Honest count: **8 resolved (per Rulings section above), 3 touched, 22 cold.**

The 22 cold items fall into two natural batches:

### Quick rapid-fire (12 items, ~15 min in one batch — answerable off-top-of-head)
- **IG1** — the 8 Job categories (only 5 seen in `registry.js`)
- **IG2** — Tier (coordinator/manager/senior) semantics
- **IG3** — `surface:` field semantics in `registry.js`
- **IG4** — `ws: 1` field meaning
- **IG5** — Provenance Tag formal enum (3 classes seen)
- **IG6** — "big edit" mechanical trigger or always-judgment?
- **IG8** — Improvements.md vs Brief §8 boundary
- **IG9** — Spin-out target (external user, fork vs slice)
- **SG1** — open `studio/plays/examples/` and confirm canonical example shape
- **SG2** — PLAY_MANIFEST generation mechanism (hand-edited or auto)
- **SG3** — Studio Board UI live behavior (drag/confirm/ready-dots)
- **SG4** — Conformance gates location (placeholderConformance.test.ts etc.)

### Auto-resolving once Brick 0 + F8 land (10 items — defer until then)
Will be answered structurally by the type-enum + link-type rulings (Brick 0 F1/F2) and by F8 (make-a-play) producing a canonical re-derivation:
- **UN5** Director: Aggregate or Value? → dissolves with Brick 0 F1
- **UN6** "Capability" the right name for verbs? → dissolves with Brick 0 F1
- **UN7** Brief + Workflow: one context or two? → dissolves with F8's re-derivation
- **UN10** Workflow package three-context overlap (brief writes, workflow IS, runtime executes) → dissolves with F8
- **UN11** Plan aggregate? → dissolves with Brick 0 F1
- **UN12** User aggregate? (connects to the design-plan User-modeling thread) → dissolves with Brick 0 F1
- **UN1** Three passes vs one mega-move → minor, dissolves with F8
- **UN2** Production-line context too big? → dissolves with F8
- **UN3** Agent cards: runtime or off-line? → dissolves with F8
- **UN4** Tools as own context? → dissolves with F8
- **UN8** Studio Board polysemy split shape → dissolves with Brick 0 F1
- **IN5** Two "registries" — operationally clear, mechanical rename per F2

**Suggested resume order:** Rule Brick 0 foundations (auto-resolves 10 cold items) → decide on F8 resumption → 15-min rapid-fire on the 12 quick items.

### META about the cold count itself

**Director's framing [verbatim, session close]:** *"It was great having this be a conversation and for you to not be too abrasive about the gaps... but on the other side of the coin, do we still have a big list to work on?"*

**Implication for EL3:** The mediation pattern (block-by-block walk, META first, honeydo as derivative) prioritizes structural findings over checklist completion. This is a **feature, not a bug** — 8 META findings are worth more than 33 individual rulings — BUT the cold count must be surfaced at session close, with categorization (quick vs structural) so the director knows what remains and can plan the next move. **Cold-count + categorized-remainder belongs in every close.**

---

## META — observations about the mediation skill itself

_The most valuable findings of the playtest. Capture every meta-observation the architect makes about:_

- The four-way honeydo split — does the grouping fit how they think?
- The triage / sequencing — does the opening move work?
- The `[BIG]` flag — are the right items flagged?
- The pacing — too slow / too fast / right?
- The parking-lot — used naturally?
- The recovery move — caught tangents well?
- Anything about *how Raven feels* in the conversation.

_Format:_

```
### META — [short label]
**Observed:** "[the architect's observation, in their words where possible]"
**Implication for EL3:** [how this changes EL3's design — even speculatively]
**Implication for honeydo format:** [if this is about the split / clustering / [BIG] flags]
```

---

## Session close

When the session ends:

- **Items ruled:** [count]
- **Items parked:** [count, with breakdown by reason if useful]
- **Items cold:** [count + IDs]
- **META findings:** [count + headline of each]
- **Time:** [start → end]
- **Architect's overall read on the playtest:** "[verbatim if they share one]"

The next session — either a continued retcon or the EL3 brief authoring — reads this file first.
