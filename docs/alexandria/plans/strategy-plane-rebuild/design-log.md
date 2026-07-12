# Strategy-plane rebuild — design log (in progress)

Working scratchpad for inventing the **Strategy plane of Alexandria's *product* library**, designed to be federation-aware. Not a deliverable; a running log so the thread survives context summarization.

## The task

The library now has three planes (product / strategy / learning). The strategy plane is
**empty by construction** and is being **invented from scratch** (not ported). Design it so the
future **corporate/product split (federation)** is honored from day one.

## Grounded facts (from code + rulings, not plan prose)

- **Planes** = *epistemic role* of a card. `plane` frontmatter, `Literal("strategy","product","learning")`
  — `packages/viewer/src/app/runtime/schemas.ts:61`. Causal roles (rebuilding-the-library/plan.md,
  Brick 7): Strategy **proposes** → Product **embodies** → Learning **tests** → updates the bet.
- **Zones** = *federation topology / org ownership* = which *library*. Market / Corporate / Program.
  `docs/alexandria/plans/_archive/corporate-library-research/federation-architecture.md`. "Program"
  (not "Product") because a product library is one program among possible siblings. Zones use **"informs"
  not "inherits"** (Decision 5); positioning **refracts** across zones at different fidelity (Decision 2).
- **Planes ≠ zones** — orthogonal axes. The corporate/product line is a **zone (library) boundary**,
  NOT a divider inside the strategy plane.
- **Corporate = a future separate library** (user, confirmed). Ruling `e6c9e228`: company-level content
  belongs to the future **Company Library**, out of scope for this product library.
- **Planes-from-plays** ruling `2598b89e`: product-plane cards are the first build; strategy/learning
  planes come from *future plays*.
- **The salvage report** = the `## Coverage check vs the old 208-card library` section in the body of
  **merged PR #581** (never a file on disk). Verdict: *"almost everything the old library knew that this
  build doesn't is strategy-plane material, not product-plane misses"* — because the BoH scan can only card
  shipped code, and **strategy lives with the director**. ⇒ the strategy-plane build is a **director
  elicitation play, not a code scan.**
- Card schema already supports the model **without migration**: `links` is an open `Record<string,string[]>`
  (schemas.ts:126) so typed edges are just key conventions; `diagram.kind` already includes `"feeds"`
  (schemas.ts:121) = the corporate→product direction.

## The dividing principle (user's override, canonical now)

The corporate/product line = **daily decision-ownership**, i.e. *whose desk revises this call on a
Tuesday* — **CEO's desk (Corporate zone)** vs **CPO's desk (this product's strategy plane)**. NOT
positional power (the CEO can overrule anyone — irrelevant). This **overrides** the earlier proxy
"would this still be true if the company built a different product?".

## Shape so far (proposal, evidence-backed)

- **Unit = two first-class card types** (salvage seed is commitment-dominant, ~6 commitment clusters : 1 bet):
  - **Bet** — falsifiable, stateful (**holding / contested / untested**). Few, top-of-plane, carry the ↑ uplink.
  - **Commitment** — normative, conformance-checked (**honored / violated**). The bulk. A violation is a
    *defect*, not a thesis update.
- **Sockets on `links`**: `embodied-by` ↓ (product cards) · `tested-by` → (learning evidence) ·
  `under-corporate-bet` ↑ (federation uplink, unresolved until the Company Library exists).
- **Spine (contexts), a floor not a cage**: **Thesis** (bets; incl. positioning) · **Guardrails**
  (commitments toward the human) · **Experience Goals** (quality commitments).
- **Direction reconciliation**: inheritance flows **down** the ↑ uplink; feedback flows **up** via
  `Loop - Strategy Cascade` (already in the library). "Corporate feeds product" + "informs not inherits"
  are both true, different channels.

## Salvage seed (candidates — re-elicit from director, do NOT copy-paste)

context-bottleneck thesis (keystone **bet**) · Never-Violate User Assumptions · 6 Experience Goals
(Quiet Until Needed, Transparent Machinery, Legible Graph, Cumulative Not Sisyphean, First Servable Loop,
Well-Run Franchise) · voice contract (Conversational Warmth, Professional-Not-Daffy) · Progressive
Disclosure / Day-1 Complexity Ceiling · Raven-as-product-thinking-partner (intent) · Incident Response
loop (→ learning/playbook, not strategy).

## Open questions (posed to director; awaiting answers)

1. **Entity/seam — RESOLVED (Danvers, 2026-07-05)**: **SocioTechnica = the company** → future Company Library;
   **Alexandria = a product**, SocioTechnica's biggest portfolio bet "by a mile" → THIS product library. NOT
   single-business-collapsed — a *portfolio* co where one bet dominates; the real risk is **gravitational blur**
   (Alexandria so big it "feels like the company"), not structural collapse. The charter line is the guardrail.
   **Operating rule:** *equally true of SocioTechnica's next bet → corporate (stash up); specific to winning
   with Alexandria → stays.* (Corrects Revision 3, which mis-called it "single-business collapse".)
2. **Keystone reclassifies UP**: under daily-ownership, "the bottleneck is context" reads as a *company*
   bet (CEO's). The product plane's top bet is the *downlink* refraction ("...therefore a repo-native typed
   library, for AI-native software teams, via the coding-agent wedge"). ⇒ start at corporate, come down.
3. **Roadmap**: card the durable *bet* ("nail one factory first"); treat the roadmap itself as a
   living-plan *view*, not a card. (Salvage seed dropped it.)
4. **Personas**: federation files "customer segments" under the **Market zone** → a future federated
   library. Keep the *bet about who we serve*; lift the persona/segment *intelligence* out.
5. **Corporate cascade draft** (from prior art, for correction): Aspiration = calm small teams building
   at scale ("7 Turn Work Week", "print a company") · Where-to-play = how AI-native companies get built/run
   (OS: library+playbook+ledger) · How-to-win = institutional-memory moat as models commoditize ·
   Not = enterprise-KM / a calmer treadmill.

## Research findings (fan-out complete; fuller cited report may still land from the parent agent)

Sources: Roger Martin (rogerlmartin.com, Medium, Substack), Marty Cagan/SVPG, Gibson Biddle. Many SVPG
quotes are search-snippet-derived (svpg.com 403s WebFetch) — well-corroborated, not page-verified.

**Roger Martin — "Playing to Win" (the load-bearing find):**
- Strategy nests like matryoshka dolls: outer doll = highest-level corporate choice; each inner doll
  (BU/product) "must fit with and reinforce" the one outside it. ("Fixing Strategy", Substack.)
- "There is no execution. There are only strategy choices made at various levels." ⇒ product strategy is a
  *nested set of choices constrained by corporate*, not "executing" corporate.
- **whether/how charter**: leadership keeps the *whether/where-to-play* choices; once resolved it **charters
  the *how* down** to the next level, which becomes that level's brief. "Make only the choices you are most
  capable of making, and charter the rest." ("The Whether/How Distinction", Medium.)
- ⇒ **the charter handoff IS our uplink. A corporate How-to-Win becomes the product's Where-to-Play** = the
  matryoshka nesting = our "refraction". Rename the socket → **charter / where-to-play**.

**Cagan/SVPG — daily ownership:**
- Head of product/CPO **creates** the product vision + strategy; owns "which problems are most important to
  solve"; PM owns **value + viability** risk (designer=usability, lead eng=feasibility — the Four Risks).
- Product strategy = "the **bridge between the business strategy and the product roadmap**." Company
  **mission** is the CEO's; the CEO must **feel ownership** of the product vision but does not author it.
- Critical case: **founder-CEO strong at product ⇒ the CEO *is* head of product**; others complement. ("The
  CEO as Head of Product".) ← Alexandria today (CEO=CPO, one person). So our split is a *structural boundary
  for the future org*, exactly like federation.

**Gibson Biddle:** product strategy = "how will your product delight customers in **hard-to-copy,
margin-enhancing** ways?"; company & product strategy **inform** each other, top-down/bottoms-up "meet in the
middle." No decision-rights language (RACI/decision-rights sub-agent didn't report — a gap).

**Sorting tests (the payoff — CEO desk vs CPO desk):**
1. **Whether/where vs how** (Martin): *whether/where to play* (which market/arena, is this worth a company) →
   CEO. *How to win where we've already chosen* → CPO. The charter line between them = the uplink.
2. **Portfolio vs product**: made while allocating across *multiple* bets (capital, company narrative) → CEO.
   About *this* product beating *its* alternatives → CPO.
3. **Tuesday test** (user's, in a CEO≠CPO world): mission/fundraise/market-selection/business-model → CEO;
   product vision/roadmap/positioning/which-problems/the-four-risks → CPO.

**Override of the naive test (§D):** Martin's "only choices at levels" ⇒ the real cut is *which level owns
the choice*, NOT the counterfactual "would it survive a different product". The counterfactual misfires:
"we win by being repo-native, AI-first" would survive a different product (reads corporate) yet is a *product*
how-to-win chartered to the CPO. **Altitude/ownership beats the counterfactual.**

**What it changes in the shape:**
- Confirms the keystone reclassifies **up**: "context is the bottleneck" = a corporate whether/where choice;
  the product plane's top = the chartered how-to-win under it.
- Rename uplink socket → **charter / where-to-play** (keep semantics).
- The strategy plane = the CPO's **how-to-win cascade**, sitting under a chartered corporate where-to-play.

## Research — deep sweep enrichment (the ~20-agent fan-out; revises the above)

**The uplink is a CHARTER with reserved rights, not a bare link.** Every decision-rights source models the
corporate→product seam as an explicit enumerated hand-off:
- **Bain RAPID** (Rogers/Blenko, HBR 2006, "Who Has the D?"): one **Decider** per call; "decision roles trump
  the org chart"; names the **center-vs-business-unit bottleneck** directly. ⇒ corporate holds the D (or the
  "Agree"/veto) on *where-to-play*; product holds the D on *how-to-win*. Wyeth/Grange Castle: the one-time big
  strategic capital call escalated to center w/ center veto; ongoing calls delegated down to the BU EVP.
- **Amazon single-threaded charter** (Bryar/Carr): the charter enumerates what the team owns **AND what it
  does NOT** (reserved to S-team/CEO); goal/resource changes escalate.
- **Bezos one-way/two-way doors**: irreversible → escalate to corporate; reversible → product decides fast.
- **Ken Norton time-horizon cut**: CPO owns <6mo product calls; CEO+CPO joint 6–12mo; CEO owns 12mo+.
- **Elad Gil**: "delegation ≠ abdication" — product drafts the roadmap/strategy, CEO **blesses/modifies**.

**Revision 1 — Positioning/category is CORPORATE, not product (reverses my earlier "folds into Thesis").**
April Dunford: "for smaller companies the CEO needs to drive [positioning]." Play Bigger: category design "is
the CEO's job… not the CMO's or the head of product design's." Alexandria is *creating a category* ("context
library") ⇒ that card belongs in the **corporate stash, uplinked** — not the product Thesis context.
(Genuinely contested — Applied Frameworks gives PM definitional ownership — but for a category-creating
startup the lean is UP.)

**Revision 2 — the CEO keeps product VISION + the QUALITY BAR even with a CPO.** Horowitz "Product CEO
Paradox" reserved list: drive the vision, maintain the quality bar, be the integrator, force the data the team
doesn't have; "disengaging is worse than over-engaging." Jolly (CPO): "co-create the vision with the founder."
⇒ our **Experience-Goals / quality commitments carry a CEO thumbprint** — the standard the founder reserves,
not purely product-owned.

**Revision 3 — Alexandria is single-business-COLLAPSED today.** Porter / Fred David: a one-product company
has "only the corporate and functional levels" — corporate & product strategy are **fused right now**. So our
split is inherently *forward-looking*: pre-cutting a seam federation will later make real. Validates "capture
corporate even just to stash." Abell: "customer segments served" is a corporate define-the-business choice ⇒
reinforces personas leaning **up/out** (Market/corporate), not product.

**Net design update:**
- Uplink socket = a **charter (reserved-rights list)** naming the specific calls corporate keeps — give it teeth.
- **Positioning/category → corporate stash**, not product Thesis.
- Quality-bar commitments (Experience Goals) carry a **CEO co-owner**.
- The split is forward-looking because the company is single-business-collapsed today.

Frameworks (cite): Martin *Playing to Win* (matryoshka nesting, whether/how charter); Cagan/SVPG (product
strategy = bridge business↔roadmap; CEO-as-head-of-product); Horowitz Product-CEO-Paradox; Bain RAPID;
Amazon STL charter; Bezos doors; Ken Norton time-horizon; Porter/Andrews/David corporate-vs-business levels;
Dunford + Play Bigger (positioning/category ownership). Caveat: many SVPG quotes are search-snippet-derived
(svpg.com 403s WebFetch) — well-corroborated, not page-verified.

## Director answers + strategic update (2026-07-05)

**Portfolio / other bets (Q1):** SocioTechnica's other (latent) bets = selling books · non-Alexandria
consulting · **lifebuild.me**. Genuine portfolio; Alexandria is the dominant bet; corporate where-to-play
spans the set. Corporate layer is non-hypothetical.

**Founding bet = CORPORATE — CONFIRMED (Q2).** Director's test: "Alexandria is that bet in action. If the bet's
wrong we change our worldview; if only the tactics are wrong we launch a different product." ⇒ the product is
*disposable relative to the bet*; the bet owns the product. Lifts to SocioTechnica's stash; Alexandria's plane
carries the *how* underneath.

**STRATEGIC UPDATE — the product has moved (Q3 → PAUSE).** "The library" has **shrunk to foundational/enabling**
infrastructure; **what SocioTechnica is really about = making AI colleagues.** Website + the library-centric
vision draft are STALE. ⇒ do NOT derive category/positioning from prior art — re-derive from the **live product
plane** (AI colleagues foreground, library as substrate). Corporate-stash draft PAUSED pending that look. May
also re-phrase the founding bet (the *answer* to "context is the bottleneck" evolved from "a library" → "AI
colleagues that use the library").

## Live product plane — findings + consequences (2026-07-05)

Live sweep = `docs/alexandria/sweeps/alexandria-product/` (via `docs/alexandria/library-bundles.json`), working
tree clean, updated Jul 3-4. **7 contexts / 73 cards**: canvas · ledger · library · playbook · triggers ·
viewer (+ `_index` keystone). Earlier "23 cards" was just `library/`.

**The pivot is SHIPPED, not aspirational.** Keystone `_index/Concept - Alexandria.md` (altitude:keystone, the
rendered lead) leads with **AI colleagues**: "Alexandria lets the leader of a small team build and run a team of
AI colleagues… members of your team you rely on, not a prompt window." Library + playbook = "**two
innovations**" (mechanism); viewer/ledger/triggers = "**three enabling systems**"; the colleague-coin = "**the
payoff the rest of the system exists for.**" `viewer/Concept - AI Colleague.md` (altitude:pillar,
director-proposed): "everything else — library, playbook, ledger, triggers — exists so a Director can hand work
to an AI colleague." Library IS substrate now — confirmed in shipped cards. Stale surface = website + vision
draft, NOT the live plane.

**Live wager (WHY):** "independence with accountability — AI colleagues act on their own because triggers fire
from recorded truth, and the director can trust what happened because the ledger is immutable — **a full
system, not a pile of skills or better prompt engineering.**"

**Consequences for the stash / plane:**
1. **Re-phrase the founding bet** → the colleague + full-system wager (above); "context is the bottleneck"
   demotes to a *supporting* bet (why knowledge matters), under the colleague bet.
2. **AI colleague refracts:** worldview "AI-as-colleague, not a tool" = **corporate** (spans bets); "the system
   that builds/runs colleagues for a small team's product work" = **Alexandria** (product). Product plane
   already holds the product-zoom AI Colleague pillar.
3. **Positioning = JTBD + Refusal, not a category label.** Director ruling in-plane rejects "operating plane /
   mission control" as "positioning prose, not a product noun — no card." JTBD = "a colleague executes as
   independently as a human peer"; Refusal = "a full system, not a pile of skills/prompts" (Refusal is
   corporate = the worldview bet). Fits the two-type Bet/Commitment model.

**Open (gates the stash draft):** is "AI-as-colleague" the SocioTechnica *worldview* (⇒ lifebuild.me = "AI
colleagues for life-building"?), or Alexandria's frame sitting under a broader company worldview (e.g. "small
calm teams, human-directed AI")? Decides the top corporate card.

## The three bets — new canon (director, 2026-07-05)

Director's theory of how a solution wins the AI arms race + becomes the de-facto OS for many companies. **Bets
are INDEPENDENT** — one can be false while others hold; each has a *rollback if false*; "at least one is
probably wrong." This is the living-business-plan spine (Strategy *proposes* → Product *embodies* → Learning
*tests*) with real content.

| Bet | Claim | Embodied by | Rollback if false |
|---|---|---|---|
| **#1** | Work environments need to be visual, immersive, traversible (the work, agents, context) | viewer + canvas | viewer → thin CLI; work back to text |
| **#2** | AI Colleagues as the primary interaction layer business adopts (> hidden/unnamed AI) | AI Colleague / coin / Tray / named agents | colleagues go invisible (automation, not employees) |
| **#3** | Great AI colleagues grown from AI-native **company design**, not assembled from disparate agents (**centralization thesis**) | library + playbook + ledger + triggers (shared substrate) | substrate loosens into disparate composable agents |

**Read (confirm via elicitation):** all three lean **SocioTechnica how-to-win** (how *a solution* wins; not
Alexandria-specific). Alexandria = current embodiment of all three; they charter DOWN into the product plane,
which then holds their **product refractions** (e.g. "the coin/Tray is how a director adopts colleagues," under
#2) **+ the commitments** — not the headline bets themselves. #1 is the most contestable (about the *form* of
the solution → edges toward product). Per-bet test: would lifebuild.me live/die by this bet? yes → corporate.

**Bet-card capture template (research + model):** (1) Claim [falsifiable] · (2) Altitude/owner [corp vs
product] · (3) State [holding/contested/untested] · (4) Embodied-by ↓ · (5) **Rollback if false** [director's
field — makes bets independent + legible] · (6) Tested-by → [Cagan: bets = hypotheses] · (7) Charter-uplink ↑
[product bets only].

**Process:** sequential, one bet at a time — fill the 7, settle corp/product, name embodiments + rollback.
Proposed order: #3 (deepest/corporate keystone) → #2 → #1. Commitments (standards/experience-goals) after bets.
Raven (alexandria:raven) is available to write the actual cards once the structure's set.

**Template extended (director):** + **Intent** [the product-future aim a bet creates] · + **Plan** [sequenced
work to realize the intent]. These are the *forward arc / product-future* — the missing half of the product
plane (which today holds only the present = embodiment). Full chain: **Bet → Intent → Plan → [build] →
Embodiment → Evidence → tests Bet.** Intent/Plan are **bet-state-dependent**: holding → accelerate, contested →
pivot, false → rollback (field 5). Director chose to start with **#1** (not #3).

### Bet #1 — elicited slice (2026-07-05)
- **Claim:** a team's work environment (work · agents · context) must be **visual, immersive, traversible** — not CLI/text/chat.
- **Altitude: CORPORATE.** "Map-first living" is a *lifebuild* concept being ported to Alexandria ⇒ the paradigm spans bets (lifebuild = life-map, Alexandria = work-map). First card in the SocioTechnica stash; refracts to a **work-map** in Alexandria's product plane.
- **State:** untested.
- **Embodied-by ↓ (maturity gradient):** agents = *strongly* visualized (coin/Tray, ≫ CLI) · work **processes** = *emerging* (plays/playbooks, just starting) · work itself + decisions + "leveling up / building colleagues" = **missing** (the dark part the intent targets).
- **Intent:** a **map-first work surface** — all work + key decisions on a visualized map (from lifebuild). Plus: visualize playbooks (barely built yet), visualize "leveling up" / "building" agent colleagues. "If it clicks → OS status."
- **Plan (rough):** dig up lifebuild's map → get it running in Alexandria → use it as a live work surface. + a backlog of visual/traversible to-dos (candidate **workboard** item).
- **Rollback if false:** viewer → thin CLI; coin/constellation/canvas out; work back to text.
- **Tested-by → (two instruments):** (a) **adoption/substitution** — "living in Alexandria, dropping tool X for business-part X" (usage; varies by user); (b) **attribution** — was visual/traversible the *reason*? (needs targeted metrics / sought opinions). Confirms only when **both** fire — adoption alone could be #2 (colleagues) carrying it.

## Process decisions (2026-07-05)
- **Output = a source-of-truth document** (director): the accumulated decisions, either atomic/library-prepped
  or just *clear decisions with clear lines* → convertible to library cards. THIS log is that SoT-in-progress;
  each bet slice's fields map 1:1 to card fields.
- **Visual/traversible backlog = a real thing, OWED its own plan + a workboard item** (director). Captured under
  Bet #1 Plan; promote to a plan doc + `board-state.json` item as a separate step (don't derail bet elicitation).

### Bet #2 — elicited slice (2026-07-05)
- **Claim:** business adopts **named, persistent AI colleagues** as the *primary* interaction layer with AI — over hidden/embedded/unnamed AI.
- **Altitude: CORPORATE KEYSTONE.** The worldview AND its golden metric both sit at company level; #2 anchors #1 and #3 (they hang under it).
- **State:** **contested** — the market grain runs toward hidden/embedded AI; high internal conviction; "really close" to first proof. (contested = live but a credible force pushes the other way; ≠ untested.)
- **Embodied-by ↓:** coin / Tray / named agents (the *interface*) **+ plays/playbooks** (the *capability* to own real work). NB plays/playbooks = the **convergence crux** — also embody #3, and #1 wants them visualized.
- **Intent:** colleagues that take **full ownership** of hours of work across functions — **product, new media, marketing/sales, software dev, administration**.
- **Plan:** build out + implement **plays/playbooks** — SocioTechnica first (the PULL / dogfood), then directors. Discovery: ~10 pilots asked "which AI-employee ownership do you want first (even task-level)?" → dictates play prioritization.
- **Rollback if false:** colleagues go invisible → automation/features, not employees.
- **Tested-by → (GOLDEN METRIC — also the company north-star):** human-colleague-hours **transferred to full AI ownership** + **needed-but-undone work** (estimated hours). Scale: tens of thousands → millions of human hours shifted to AI. Measured on SocioTechnica first, then customers.

### Freeq integration — intersection embodiment (#1 ∩ #2) (2026-07-05)
Freeq lets AI colleagues **"enter the chat"** (Discord-equivalent) and **show up to audio/video meetings**.
First component that serves **two bets at once** — bets stay independent as *claims*; embodiments **braid**
(embodied-by is many-to-many).
- **For #2:** the *purest* form of "colleagues as the primary interaction layer" — colleagues meet you in your
  **existing comms** (chat + meetings), not a separate Alexandria UI you go visit. → add to #2 embodied-by;
  #2 intent terminates in Discord-equivalent + meetings, not only the viewer.
- **For #1:** splits the bet into **two facets** with different embodiments — **traversible/spatial** (the map:
  lifebuild map, constellation, canvas) vs **immersive/present** (freeq: colleagues in chat/meetings). Freeq =
  the *present* half (would've been missed mapping #1 only to viewer/map). Track both facets separately in #1's
  intent + test — a director could buy one, not the other.

### Bet #3 — elicited slice (2026-07-05)
- **Claim:** great AI colleagues are **grown from a centralized, deliberately-designed company substrate** (library/playbook/ledger/triggers), NOT assembled from disparate agents. Subsumes old "context is the bottleneck."
- **Altitude: CORPORATE — the MOAT** (the why-you-win / hard-to-copy capability, under #2's *what*).
- **State: CONTESTED (most).** The whole agent ecosystem (marketplaces, multi-agent frameworks, MCP) bets on disparate/composable agents; #3 bets against it.
- **Embodied-by ↓:** library + playbook + ledger + triggers. Library most-built but **being re-architected THIS WEEK** — old architecture couldn't handle Alexandria's growth (this is the rebuild that kicked off this whole effort).
- **Intent:** the library becomes the company's **single living source of truth** — a living/breathing plan across every domain (business / product / marketing / …), **killing the previous KM system**, because a living SoT is *the only way colleagues get real, current information.* [= the MECHANISM of the moat: one always-current shared brain → coherent colleagues; disparate/stale context → incoherent.]
- **Plan:** the library rebuild (in flight) + finish playbook & ledger (library mature; those are the gaps).
- **Rollback if false:** substrate loosens → per-agent/optional; Alexandria → orchestration/marketplace over independent agents.
- **Tested-by →:** (a) **head-to-head quality** — colleague grown-from-substrate vs bolted-together; (b) **switching/consolidation** — hours migrating *retail-AI / pure-CLI → Alexandria.* "Switching is necessary to win; not switching = lose."

**Insights from #3 (durable):**
- **#2 vs #3 metrics are orthogonal (= bet-independence made concrete):** #2 = **human → AI** (does AI take the work?); #3 = **other-AI/CLI → Alexandria** (do they consolidate into the centralized system?). Winning one while losing the other is possible.
- **"Win by replacement, not addition"** — a strategic **Refusal**: if Alexandria is another tab alongside retail AI, it's lost; it wins only as the place work *moves to.* Corporate commitment candidate.
- **Meta-loop:** the strategy plane we're eliciting **is** the business/strategy domain of the living SoT (#3's intent) — dogfooding #3 in real time.

**STATUS: all three bets elicited — ALL CORPORATE.** ⇒ Alexandria's product strategy plane holds their **product refractions** + the **commitments** (experience goals, standards, the "replacement not addition" refusal), not the headline bets. Next: (a) pin the 3-bet corporate stash as a unit, or (b) descend into Alexandria's product plane.

**(a) DONE** → corporate stash pinned in `corporate-stash.md` (SocioTechnica Company-Library seed).
**(b) IN PROGRESS** → Alexandria's product plane = **product refractions** (sub-bets under each corporate bet)
+ **commitments** (experience goals, standards, refusals). Drafting from the live plane + this convo, director
refines. Lighter refraction template: claim · embodied-by ↓ · uplink ↑ (+ state/test where it bites).

### (b) Bet #2 — product refractions (2026-07-05, director-enriched) — PENDING confirmation
Organizing spine: **"how many layers of abstraction away do people want their agents?"** (near = an abstract
token on a panel → far = a voice in your meeting). Director's pattern: several refractions split into
**separate, correlated bets** — form vs function / modality / unit vs volume. Seven sub-bets:
1. **Tray = control panel** (FUNCTION) — air-traffic-control board; token flashes/vibrates/rotates → legible at a glance w/o reading; click a coin → directive/hotkey. Fails if directors want to *read* status, not glance.
2. **Coin = the agent as ART, not a person** (FORM) — abstract token, not a face/avatar/persona. Splits from #1 (the panel could keep a different token). Fails if people bond with faces/personas.
3. **Individuation** — a name + visible identity (Raven/coin/role). *Cheap but real* bet; a **number + color** could outperform.
4. **Agent in the chat** (freeq / Discord-replacement) — text presence in async comms.
5. **Agent in the meeting** (freeq / audio-video) — live voice presence; furthest end; highest risk & payoff. 4↔5 separable (love in chat, hate on the call).
6. **Play = the unit of ownership/consistency** (FORM/primitive) — manage/measure/add-consistency to the colleague relationship. Fails on form: hate it called a "skill", or hate 100%-agentic plays.
7. **Playbook = VOLUME of plays** (SCALE) — breadth is the win. Splits from #6: people may want only ~10 hot-key plays and no more.
Axes: 1–5 = the abstraction-distance spine; 6–7 = the ownership-mechanism axis (orthogonal).

## Bet-card VITALS + register (2026-07-05, director)
**Two registers:** the **working SoT** (this log; conversational is fine) vs the **card** (library voice —
crisp, product-descriptive, de-conversationalized, no inside-baseball). Structured vitals *are* part of
de-conversationalizing ("very risky / cheap / high-conviction" → typed fields).

**Bet vitals (research-grounded frontmatter / tabs):**
- **confidence** — conviction (high/med/low). *Already a field in the library schema.*
- **state** — holding / contested / untested (tested-ness). **⟂ confidence** — a bet can be contested AND
  high-conviction (e.g. #2). Conflating the two is a classic error.
- **risk** — typed by **Cagan's Four Big Risks** (value / usability / feasibility / business-viability) + the
  market / against-the-grain risk.
- **cost** — build-cost (cheap ↔ expensive) + **reversibility** (Bezos **one-way vs two-way door**: cheap or
  catastrophic to unwind).
- **payoff** — upside magnitude if right (the pair to risk; e.g. freeq = biggest payoff).

⇒ vitals make the strategy plane **scannable** (color by confidence, filter by risk type, spot the one-way
doors) = the living business plan as an actual instrument — on-theme with Bet #1.

### (b) Bet #1 + #3 — product refractions (2026-07-05, drafted; vitals VALUES blank pending director)
**Vitals FIELDS locked** as the standard defining traits on every bet card: **confidence · state · risk**
(Cagan-kind + market) **· cost** (build + reversibility / one-way–two-way) **· payoff.** VALUES left blank for
the director (incl. the #2 refraction values I drafted — parked as suggestions to overwrite).

**#1 refractions (facet: traversible/spatial — the "map" side):**
1. **Map-First Work Surface** — work + decisions on one visualized map (lifebuild map-first). ↓ map surface (to build) / canvas.
2. **Traversible Context** — context navigated as a graph/constellation, not read as docs. ↓ constellation/graph.
3. **Visualized Work Processes** — plays/playbooks seen + traversed, not just executed. ↓ playbook view (nascent).
4. **Visualized Colleague Growth** — building / "leveling up" a colleague is a visible progression. ↓ progression views (to build).
(#1's *immersive/present* facet + agents-as-visual are shared embodiments with #2: the Freeq cards + the Coin.)

**#3 refractions (the substrate — library / playbook / ledger / triggers):**
1. **Library as Living SoT** — single always-current SoT (living plan), replaces scattered/stale KM. ↓ library.
2. **Atomic, Agent-Readable Knowledge** — typed atomic cards + wikilink graph beat prose/RAG for colleagues. ↓ atomic cards/graph.
3. **Kept Live by the Ledger Loop** — the causal/ledger feedback keeps the library current (= real info). ↓ ledger/loop.
4. **Shared, Agent-Executable Playbook** — one centralized playbook (vs per-agent scripts) = consistency. ↓ playbook/plays [∩#2].
5. **Ledger as Shared Record + Accountability** — one immutable record → coordination + trust. ↓ ledger.
6. **Event-Sourced Activation** — colleagues fire from recorded truth (triggers), not ad-hoc prompts. ↓ triggers.

STATUS: all three bet areas have product refractions drafted; card register + vitals fields settled.
NEXT: commitments pass (experience goals, standards, refusals), then director fills vitals.

### (b) Commitments (2026-07-05, drafted from salvage seed; bodies to verify vs source cards)
**Commitment ≠ bet** → adapted traits: **kind** (experience-goal / standard / refusal) · **altitude**
(corp/product) · **strength** (hard/soft) · **conformance** (honored / at-risk / violated). No payoff/risk/
rollback; "if false" → "**violation looks like**." strength + conformance blank pending director.
- **Refusals (corporate):** Replacement Not Addition · A Full System, Not a Pile of Skills.
- **Experience Goals (product):** Quiet Until Needed · Transparent Machinery · Legible Graph · Cumulative Not Sisyphean · First Servable Loop · Well-Run Franchise.
- **Standards (product):** Never-Violate User Assumptions (hard) · Conversational Warmth · Professional Not Daffy · Progressive Disclosure / Day-1 Complexity Ceiling.
Bodies drafted from the salvage-report NAMES — **verify against `docs/alexandria/library/{experience/experience-goals, rationale/standards}/`** before banking as real cards.

STATUS: **first full strategy-plane draft complete** — 3 corporate bets + 17 product refractions + 12
commitments; all carry blank vitals/traits for director fill. Card register + trait fields settled.
Artifacts: `.context/strategy-plane-rebuild/design-log.md` (SoT) + `corporate-stash.md` (Company-Library seed).

## Taxonomy walk tool + decisions (2026-07-05)
Built `strategy-plane-walk.html` (copied the bozeman "Taxonomy Lock" design: Cormorant serif, cream/gold,
chunk-cards, dot-nav) → served at **http://localhost:8913/strategy-plane-walk.html** (python http.server, bg;
restart if the box reboots). 8-chunk walk: Overview+decisions · Corporate 3 bets · #2/#1/#3 refraction clusters
· Refusals · Experience-Goals · Standards. Each card shows relationships (↑ charter · ↓ embodies · ∩ intersects)
+ the blank vitals; each chunk flags its taxonomy decision. Source design cached in `taxonomy-walk-source.html`
(original: bozeman-v1/docs/alexandria/plans/library-word-legibility/).

**4 taxonomy decisions + my recommendations (director to rule — to stay compatible with the product plane's
two-axis type×altitude taxonomy, 2026-07-05 ruling):**
1. **Card types →** `type: Rationale` (the existing families category for the WHY), with `kind: Bet |
   Commitment` (Bet = *falsifiable* rationale/wager; Commitment = *normative* rationale/rule). No new top-level
   category needed. [Alt: promote Bet/Commitment to first-class types if they feel too central to nest.]
2. **Altitude (2nd axis) →** corporate bets = **keystone**; product refractions = one rung below; commitments
   likely altitude-less (or `value`). Strategy may warrant its own altitude words.
3. **Context (container) →** the 3 bet-clusters become contexts (Colleague Interface / Centralization / Visual
   Environment — scoped to the product refractions, named to mirror their corporate parent) + a Commitments
   context. ~4 strategy contexts, mirroring product's ~7.
4. **Charter / uplink →** one-way inherit (corporate → product) is primary; feedback rides the Strategy Cascade
   loop. "Corporate feeds product."

## Decisions locked (2026-07-06, director)
- **Normative type = `Principle`** (not "Commitment"). Revives the old-library word; **NOT present in the
  current library/data model** → zero collision. Kinds: experience-goal · standard · refusal. ("Never-Violate
  User Assumptions" = a Principle, kind: standard.) ⇒ the strategy plane's two card types = **Bet · Principle.**
- **Plane model clarified (the website is STALE — it wrongly showed a "learnings" area in *product*; not real):**
  **Strategy plane = strategies** (Bets + Principles). **Learning plane = evidence/learnings.** Together they
  form the **WHY of product choices**, linked **atomically** to product cards. ⇒ NO learnings in the product
  plane; a Bet's `tested-by →` doesn't hold evidence, it *points into the Learning plane*. A product card's why
  chains **up** to a Bet (why we built it) and **across** to a Learning (evidence it works).

## Taxonomy decisions RULED (2026-07-06, director)
All four ruled — as recommended, with D4 refined by the director:
1. **Card types →** plane-appropriate: **Bet** and **Principle** are the strategy plane's own `type` values
   (first-class; the old Rationale bucket refines into these two). NOT nested under Rationale.
2. **Altitude →** reuse the axis: corporate bets = **keystone**; product refractions a rung below (**pillar**);
   principles **altitude-less**.
3. **Context (grouping) →** shelve by **bet-cluster** — 4 contexts: **Colleague Interface · Centralization ·
   Visual Environment · Principles**.
4. **Charter / uplink (director's refined loop) →** **Corporate strategy drives Product strategy** (charter,
   one-way ↓). **Product strategy → generates Learning → Learning informs BOTH Corporate and Product strategy**
   (↑). Edge cases deferred. ⇒ the charter link is strictly one-way; **Learning is the sole upward channel** (no
   direct product→corporate edge needed).
Tool first page rewritten: open-questions → ruled.

## Vitals finalized + filled (2026-07-06, director)
Skinnier set ruled: **dropped State** (redundant with evidence-based Confidence), **dropped Payoff** (unclear),
**dropped Contrarian**. **Three bet vitals:**
- **Confidence** — evidence-earned; **uniformly LOW pre-market** (no market evidence yet).
- **Risk** — Cagan's four (value/usability/feasibility/viability) **+ ease of reversibility** (two-way vs one-way door).
- **Cost** — **forward / remaining** (cost-to-realize, not sunk; per the $990k-of-$1mm example).
Principle traits slimmed to **kind · altitude · strength** (dropped conformance — the state-analog).
All 20 bets + 12 principles filled with best-guess values (confidence = low across the board by design) for
director review. Tool rewritten (`strategy-plane-walk.html`, served :8913).

## Risk rework — named + readable (2026-07-06, director)
Risk is no longer a cryptic pill. Now **each bet lists its named risks as (Tag) + a plain sentence** — tags =
value / usability / feasibility (where the risk lives) or **reversibility** (readable prose; "one-way/two-way"
jargon retired). Risk = a **program: name → test → mitigate** (de-risking) — the mirror of confidence-building
(evidence) but a *different job* (director's framing: "de-risking is sometimes the same but often different from
confidence building"). Vitals pills slimmed to **confidence + cost**; risks moved to their own block.
**Correction (director):** the talking agent (Colleague in the Meeting) is **already prototyped + demo'd** →
**Feasibility risk RETIRED** (rendered greened / `done:true`); cost **high → med** (productionize, not build from
zero); confidence stays **low** (demo ≠ market) — a live example that de-risking ≠ confidence-building. Remaining
risks = value (alienation) + reversibility (reputational).

## Build decisions (2026-07-06, director)
- **Company (corporate) bets live IN this strategy plane for now** — no Company Library exists yet; mark them
  **transfer-pending → Company Library** rather than hide them. Most functional; clean lift later.
- Risk-block label "name → test → mitigate" removed from the tool (avoid bleed into real cards).
- **Two steps:** (1) build the strategy plane now (cards + intra-plane charter links); (2) wire **embodied-by ↓**
  to the product plane LATER (product plane under construction). Build now; strategy plane is additive
  (new `plane`, new context folders) so it won't collide with the product build.
- **Build method (proposed, pending OK):** hand-author from the frozen SoT (walk + corporate-stash + this log)
  into a pinned **card contract** → gate with the **librarian+editor quality sweep** (mechanical: hygiene /
  `buildLibraryCatalog` / link-integrity / invariants / scope · faithfulness: card↔SoT · content: prose /
  wordification / coherence / two-axis · loose ends), adversarial, most-severe-first. NOT the atomizer/Fabro
  (content already atomic + taxonomy decided → transcription + editorial, not scanning). Build rules: prose-only
  bodies, structured data (vitals/ids) in frontmatter, no dangling links. Exemplar-first (1 Bet + 1 Principle).
