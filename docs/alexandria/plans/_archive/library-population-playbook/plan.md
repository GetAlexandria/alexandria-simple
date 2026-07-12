# Library Population Playbook

**Status:** draft, plain-English PM plan
**Companion docs:**
- `docs/alexandria/plans/build-a-raven-onboarding/plan.md` — the surface this content lives on
- `docs/alexandria/plans/canvas-library-spike/plan.md` — the interaction loop that delivers it
- `docs/alexandria/plans/canvas-source-material/source.md` — earlier design narrative

## What this document is

A project-management plan, written in plain English, for the work of **populating a product context library**. It describes:

1. What we believe a good context library contains (the 3-plane / 13-area engine, simplified).
2. How a real team — a director with AI or human teammates — would actually do that work end-to-end: gather, draft, sharpen, bank, atomize, live with it.
3. **For each of the 13 areas**: what it is in plain English, what a great filled version looks like, what a barely-passing one looks like, what pre-existing documents to mine, the question set that draws the content out, the conflict patterns to watch for, and the industry disciplines we lean on.

The audience is twofold: **agents** that will help directors do this work (Raven first; future teammates next), and **humans** — directors and the consultants, coaches, or colleagues who help them. Both should be able to read this and run a population project from cold.

## What this is not

- It is not a UI spec. Form layouts, grade meters, and the canvas itself are designed in the build-a-Raven plan. This document is what the forms *ask* and what good answers *look like*.
- It is not the Raven skill. Raven's prompt is built *against* this playbook, but Raven is one of several agents we want to be able to do this work; the playbook stays agent-agnostic.
- It is not a final spec. It is meant to be argued with, marked up, and re-banked as we learn from real population projects.

---

## Why we build context libraries

The bet underneath all of this is simple: **when people understand *why* they're doing something, they make better-aligned micro-decisions.**

A product team makes hundreds of micro-decisions a week — naming a button, choosing a default, deciding which bug to fix first, deciding which customer to say no to. Each of those decisions either compounds toward the product the team is trying to build, or quietly works against it. The deciding factor is rarely talent; it's whether the person making the call has access to the *why* behind the work.

In a small team, the why lives in the founders' heads and travels by conversation. In a larger team, it lives in scattered docs that nobody re-reads. With AI teammates entering the room, the why has to live somewhere they can read — and re-read every time, without forgetting between sessions.

A **product context library** is that somewhere. Its job is to make the why durable, retrievable, and accurate enough that any teammate — human or AI — can ground their work in it. The library is not the product. The library is the *upstream condition* that lets the product get built well.

## Why this particular structure

The engine has been simplified to **three planes** that map to a single causal loop:

| Plane | What it answers | Causal role |
|---|---|---|
| **Strategy** | Why we think we win | proposes |
| **Product** | What we're actually making | embodies |
| **Learning** | What we actually know | tests |

Strategy proposes a way to win. Product embodies that proposal as a real thing in the world. Learning tests whether the bet is paying off, and feeds back into Strategy. The library is the substrate that holds all three layers and the links between them.

Inside each plane sit a small number of **areas** — the topics a real product team has to have an opinion about to operate well. **Thirteen total**:

| Plane | Areas |
|---|---|
| Strategy | Vision · Bets · Guardrails · Standards |
| Product | Vocabulary · Skeleton · Experience · Surface · Forward plan |
| Learning | User research · Competitive intel · Decision trail · Product evidence |

Five of these are **Foundations** — the areas where the work usually starts because everything else either presumes them or is harder to do without them: **Vision · Bets · Guardrails · Vocabulary · User research**.

The set is deliberately small. We have seen larger engines fail not because the categories were wrong but because the surface area was too big to maintain. Thirteen is the most a director can hold in their head; fewer would leave real gaps.

---

## How a population project actually runs

A population project is the work of going from "we have nothing written down" (or "we have docs scattered everywhere") to "we have a library good enough that a new teammate — human or AI — can ground themselves in it in an hour."

The project moves through six phases. They are listed in order of dependency, but in practice they spiral: you'll be banking Vision while still gathering raw material for Skeleton.

### Phase A · Gather (the microscope)

**Goal:** get every pre-existing artifact that contains the company's why, what, or evidence into one place where it can be read.

What this looks like in practice:

- The director drops in: pitch decks, the website copy, README files, design docs, Figma exports, any pinned Slack threads, the customer-call recording or transcript folder, sales-enablement collateral, the actual code repo, any "vision doc" or "OKR doc" that exists. Anything they would hand a new senior hire on day one.
- Each artifact is dated and attributed: *who* wrote it, *when*, for *what audience*.
- The director declares "I've shared everything I want to for now" — this is a felt moment, not a checklist. The point isn't completeness; it's transitioning from collection to elicitation.

Phase A succeeds when the director has nothing more they want to add without doing fresh writing.

**Common failure mode:** the director treats this as a curation exercise and only shares the polished docs. The library wants the messy ones too — the half-written Notion page, the angry customer email, the slide deck from the failed pitch. Texture matters.

### Phase B · Draft (the pre-fill)

**Goal:** for each area being worked, produce a first-pass draft that the director can react to rather than starting from a blank page.

Pre-fill is done by a teammate (Raven, a research assistant, a thoughtful consultant) who has read the gathered material. The pre-fill is honest:

- Slots that can be filled from the material are filled, with attribution to the source.
- Slots that can't are left blank with a note ("we found no material on this; need to ask").
- Where sources disagree, both are surfaced as a flagged conflict, not silently resolved.

Drafting is the area where AI is most clearly helpful. Reading 40 documents and finding the three sentences that hint at a vision is exactly the kind of work humans tire of and machines don't.

**Common failure mode:** the pre-fill is too polished and the director rubber-stamps it without engagement. The draft should *visibly* contain holes, conflicts, and unsure attributions — that's what makes the director argue with it.

### Phase C · Sharpen (the conversation)

**Goal:** turn the messy draft into a sharp statement the director would defend.

This is conversational and iterative. The teammate's job is to:

- Read the draft back to the director and surface what's missing or muddy.
- Walk the conflicts: "the deck says X, the README says Y — which is current?"
- Ask the area's question set (each area has 5–10 sharp questions; see per-area sections below).
- Push back when an answer is generic. "Improve productivity" is not a Vision. "Cut the time a 200-person sales team spends on weekly pipeline review from four hours to twenty minutes" is.

Phase C is where the **why** comes out. The director has often never been asked the questions in this exact form. The first answer is usually a placeholder; the third answer is usually the real one.

**Common failure mode:** the teammate accepts the first answer because it sounded confident. Good question-asking includes the discipline of asking again, differently.

### Phase D · Bank (lock the source of truth)

**Goal:** produce a single document per area — the **source of truth** for that area — that represents the team's best current statement, with a grade attached.

The source-of-truth doc has frontmatter that records:

- Grade (the rubric is its own design question; working answer is a letter grade A–F with a one-line description of what each grade means for this specific area).
- Banked at (date).
- Sources (which raw materials fed it).
- Open questions (the things the director knows are still soft, banked deliberately at a lower grade rather than fudged).

Banking is *the director's gesture*, not the teammate's. The teammate proposes; the director commits. This is load-bearing — a library that gets banked without the director's hand on it will rot, because they won't reread it.

**Common failure mode:** banking too early at too high a grade. A B-graded Vision is more useful than an A-graded Vision the team doesn't actually believe. The grade is honest signaling, not a performance score.

### Phase E · Atomize (cards crystallize)

**Goal:** break the source-of-truth doc into **atomic cards** that other workers can retrieve, link, and reference one at a time.

A card is one claim, named, citable, and connected. *"We win by being the only product that runs on devices smaller than a Raspberry Pi"* is a card. The full Vision SoT contains it; the card lets that single claim be linked from anywhere.

Atomization is mostly mechanical. A capable teammate, given a sharp SoT, can produce good first-pass cards. The director reviews, adjusts naming, and approves.

**Common failure mode:** atomizing too aggressively. If the SoT is 12 paragraphs and you produce 40 cards, half of them are restatements. Aim for the claims a future worker would actually want to *cite*; everything else stays as narrative in the SoT.

### Phase F · Live with it

**Goal:** turn the library from a finished artifact into a working surface.

This is the longest phase and the one most projects skip. The library is a *living* document. As the company makes decisions, runs experiments, talks to customers, the library gets updated:

- Bets get re-graded as evidence accumulates.
- The Decision Trail gets new entries when calls are made.
- Vocabulary entries get sharpened as terms settle.
- Source-of-truth docs get re-banked at new grades — sometimes higher, sometimes lower, both honestly.

A library that hasn't been touched in three months is not a context library anymore; it's a museum. Designing for the *re-banking* moment is as important as designing for the initial bank.

### Roles in a population project

Whether the team is human-only, mixed, or director + AI teammate, three roles need to exist:

| Role | Job | Who plays it |
|---|---|---|
| **Director** | Owns the answers. Decides when a draft is right. Banks. | The product owner; cannot be delegated. |
| **Elicitor** | Reads source material, drafts pre-fills, asks the question set, walks conflicts, proposes grades. | Raven (default); a consultant or research assistant if working without AI. |
| **Atomizer** | Breaks banked SoTs into cards. Names well. Maintains the link graph. | Raven (with Sam as a future specialist agent); a careful editor if human. |

The director cannot be the elicitor for their own library. Self-elicitation rarely produces sharpness — the friction of someone else asking is the point. This is why the canvas is companion-shaped: the director uses the canvas; the elicitor (Raven, today) is on the other side of the conversation.

### Timing

A first-pass library population is **a project of weeks, not a session of hours**. Working estimates from the design conversations:

- Foundations (Vision, Bets, Guardrails, Vocabulary, User research) — 1–2 weeks of intermittent work for a founder-led company that already has scattered material. Longer if starting cold.
- Remaining nine areas — another 2–4 weeks, with most of that being Product-plane work as the team walks the product surface together.
- Steady-state (Phase F) — 2–4 hours per week, ongoing.

The Foundations come first because everything else either references them or makes less sense without them. The order *inside* the Foundations is **Vision → Bets → Vocabulary → User research → Guardrails** for MVP, because:

- Vision unblocks Bets (a bet is a claim about how to achieve the vision).
- Vocabulary can begin earlier because most of it pre-fills from scan material — it's the "easy" foundation.
- User research depends on the team having enough Vision and Vocabulary to know what to listen for.
- Guardrails come once the team has enough shape to know what they don't want to drift into.

The build-a-Raven MVP narrows this further to Vision → Bets → Vocabulary → Skeleton, swapping in Skeleton (a Product area) so we cover both planes in the first four. That's a design choice for the onboarding arc; this playbook leaves the wider sequence flexible.

---

## The cross-cutting craft

Five practices show up across every area. Building them into the elicitor's standard moves matters more than memorizing per-area questions.

### 1. Mine before you ask

Reading the source material first is non-negotiable. A teammate who arrives at a Vision conversation having read the deck, the website, and three customer-call transcripts is unrecognizably more useful than one who arrives cold. The pre-fill phase isn't optional politeness — it's what makes the elicitation conversation worth having.

### 2. Ask for the why behind the what

Every area has a surface-level version of itself ("we want to grow") and a load-bearing version ("we want to grow in this specific shape because…"). The job is to keep asking until you reach the load-bearing version. Useful prompts:

- "Why does that matter?"
- "What would be different in a year if that's true?"
- "Who has the opposite view, and what's their best argument?"
- "If you had to bet $10,000 on it, would you?"

### 3. Surface conflicts; don't resolve them silently

When the deck says one thing and the README says another, both go in the draft, marked as a conflict. Resolving a conflict silently — picking one, suppressing the other — robs the director of the chance to notice that the docs disagree, which is often the most interesting signal in the room.

### 4. Make grades honest

A B is a B. A C+ is a C+. The grade exists to communicate confidence and completeness, not to perform. A library full of A grades is either a miracle or a lie, and after six months everyone knows which. The discipline is to bank at the grade that is true *today* and re-bank as the work improves.

### 5. Bank, don't perfect

A banked B+ source of truth is better than an unbanked draft. The library is useful from the moment something is in it; perfection is the enemy of usefulness. Phase F (live with it) exists because re-banking is how libraries get strong, not initial banking.

---

## Industry best practices we draw on

We're not inventing context elicitation from scratch. Each of the disciplines below contributes a piece. Naming them explicitly lets the elicitor reach for known-good moves when stuck.

| Discipline | What it contributes | Relevant to |
|---|---|---|
| **Product discovery** (Teresa Torres, *Continuous Discovery Habits*) | Opportunity Solution Trees; the practice of regular customer conversations as the engine of learning. | User research; Bets; Forward plan |
| **Working backwards** (Amazon's PRFAQ practice) | The press-release-first discipline that forces the team to articulate the customer-visible win before designing the product. | Vision; Experience |
| **Playing to Win** (A.G. Lafley & Roger Martin) | The five strategy questions: winning aspiration, where to play, how to win, capabilities, management systems. | Vision; Bets; Guardrails |
| **Jobs-to-be-Done** (Christensen, Ulwick, Klement) | Framing user motivation as a job hired to be done, not a demographic. | User research; Skeleton; Experience |
| **Domain-Driven Design** (Eric Evans) | The Ubiquitous Language practice — agreeing on the terms the team and code both use. | Vocabulary |
| **Lean Canvas / Strategyzer** | Assumption mapping; identifying the riskiest assumption first. | Bets |
| **Wardley mapping** (Simon Wardley) | Mapping value-chain components against their evolution stage; spotting commodity vs. proprietary advantage. | Competitive intel; Forward plan |
| **Architecture Decision Records** (Michael Nygard) | Lightweight, dated, durable decision documents. | Decision trail; Guardrails |
| **Thinking in Bets** (Annie Duke) | Treating decisions as bets; separating decision quality from outcome quality. | Bets; Decision trail |
| **Service design blueprinting** | Mapping front-stage / back-stage interactions across a service. | Experience; Skeleton |
| **Just Enough Research** (Erika Hall) | Pragmatic, lightweight research practices for teams without research departments. | User research |
| **Roadmapping (Now / Next / Later)** (Janna Bastow, ProdPad) | Roadmaps as commitments-of-intent at different time-horizons, not Gantt charts. | Forward plan |
| **The Mom Test** (Rob Fitzpatrick) | Customer-conversation patterns that get past politeness. | User research |
| **Design systems literature** (Brad Frost, *Atomic Design*; Nathan Curtis) | Catalog discipline for UI primitives; tokenization. | Surface; Standards |

We use these as a vocabulary of known moves, not as orthodoxy. Each is partial — none handles all 13 areas — but each gives the elicitor a name for what they're doing in a given moment.

---

## The 13 areas, in plain English

This section is the heart of the playbook. **Vision is worked out fully** as the template — full purpose, exemplars, mining guide, question set, conflict patterns, references, and a "how to know it's done" check. The remaining 12 areas have stub sections following the same shape — purpose plus a question-set seed — that we'll fill in iteratively.

The intent is that anyone — director, consultant, or AI — can read the Vision section and recognize the pattern, then either fill in the other 12 or use the stubs as starting points.

---

## Strategy plane

The Strategy plane answers the question: **why do we think we win?** It is the smallest plane (four areas) but the densest. A team with a sharp Strategy plane can recover from product mistakes; a team with a muddy one usually can't, because they can't tell which mistakes were strategic and which were tactical.

### 1 · Vision

**Plane:** Strategy · **Foundation:** yes · **Worked exemplar:** yes (this is the template)

#### What it is, in plain English

A Vision is the **promise this product makes to the world if it succeeds, and the failure mode it's avoiding.** It is not a mission statement, not a tagline, and not an aspiration in the OKR sense. A Vision is a one-paragraph picture of what will be different about the world — for a specific person, in a specific situation — when the product is what it is trying to be.

Vision is the area everything else either references or quietly contradicts. A team without a Vision they share is a team that disagrees with itself in slow motion across hundreds of micro-decisions.

#### Why we treat it as load-bearing

- Every Bet is a claim about how to achieve the Vision. Without Vision, Bets are just opinions about tactics.
- Every Guardrail derives from "what would compromise the Vision." Without it, guardrails feel arbitrary.
- The Skeleton (the product's structural shape) earns its keep by serving the Vision; surfaces or features that don't are debt-in-waiting.
- New teammates orient on Vision first. If yours is fuzzy, every onboarding is a slow leak.

#### What "great" looks like — a worked example

The example below is for a fictional product called **Quill** — a meeting-notes tool for small consultancies. We use a fictional product so the example reads concretely without invoking real-company knowledge.

> **Vision — Quill**
>
> *Banked at B+ · 2026-05-26 · sources: founder-deck-v3.pdf, website-hero.txt, customer-call-2026-03-12.transcript*
>
> **The problem we're solving.** A two-to-eight-person consulting team runs five to fifteen client meetings a week. The team's leverage depends on what gets learned from those meetings and how cleanly that learning lands in the next deliverable. Today that lift falls on whoever is most senior — usually the partner — who either takes the notes themselves (expensive) or rereads someone else's notes that miss what mattered (also expensive, more risky).
>
> **The win — how we win.** Quill is the meeting-notes tool that *only senior consultants* would use: it captures what a partner would have noticed, not what a transcriber would have typed. We win by being the one tool where the notes you get back read like notes a smart colleague took, including the things that were *implied but not said*.
>
> **The three-year picture.** A small consultancy hires Quill for their team of five and never has the "who's taking notes?" conversation again. The notes show up in their working folder before the meeting ends, structured by the kind of work they do (discovery / shaping / delivery / review), with the open threads called out. They use Quill's threads as the spine of the next client deliverable. Three years in, a Quill team is a recognizable shape in the consulting world — leaner, faster on the second meeting, with deliverables that consistently reference what the client actually said.
>
> **The win condition.** Two markers: (a) at least one Quill-using team in five reports that they no longer assign a notetaker, and (b) at our top 20 customers, the median time from "meeting ends" to "first draft of follow-up deliverable" has dropped by more than 60%.
>
> **The anti-position.** Quill is *not* a meeting recorder for the enterprise market. We deliberately don't compete with Gong or Fireflies. We will turn down customers whose primary need is sales-call analytics, even when they have money, because serving them well would require a different product, and serving them badly would dilute what we're for.

What makes the example above good — the things to copy in your own:

1. **A specific person in a specific situation.** Not "knowledge workers"; "a two-to-eight-person consulting team." The reader can see them.
2. **A "how we win" claim that is *exclusive*.** "Quill is the meeting-notes tool that *only senior consultants* would use." The claim is sharp enough to be wrong. A claim that can't be wrong isn't a Vision.
3. **A three-year picture that is *visible*.** You can see what the team does on a Tuesday. Vision is not an outcome metric; it's a scene.
4. **A win condition with falsifiable markers.** Two specific, measurable signals — not "we're successful." The Vision is the thing the win condition would prove.
5. **An anti-position.** What we deliberately won't be, *with the reason*. Without an anti-position the Vision tries to cover everyone and ends up describing no one.
6. **A grade that's honest.** B+, not A. The team has named the soft spots (in the source-of-truth's open-questions section, not shown here).

#### What "barely passing" looks like

> **Vision — Quill (thin version)**
>
> *Banked at C · 2026-05-26 · sources: founder-deck-v1.pdf*
>
> Quill helps teams run better meetings. Our notes are AI-powered, accurate, and save users time. We want to be the leading meeting-notes platform. Our customers include consultancies, agencies, and other professional-services firms. In three years we want to be the default choice in our space.

What's wrong with this — symptomatic of thin Vision work:

- **No specific person.** "Teams" is everyone, which is no one.
- **No exclusive claim.** "Accurate and save time" is true of every product in the category.
- **No anti-position.** Says they will serve "consultancies, agencies, and other professional-services firms" — three different sales motions, no commitment.
- **The win condition is "default choice in our space,"** which has no observable test.
- **Banked at C, but the grade isn't honest about *why* — the open questions aren't surfaced.** A C with named open questions is usable; a C with vague claims is not.

A C-grade Vision is still useful — *if* the C is honest. The trap is the C that pretends to be a B.

#### What to mine for Vision

In priority order (start with the highest-signal sources):

1. **Founder pitch decks** — usually contains a slide that *tries* to be the vision. Often phrased aspirationally. Use as input but never as the final answer; pitch decks are written to be sold, not to be true.
2. **The product website's hero copy and "about" page.** What does the company tell the world it is?
3. **Customer call transcripts** — specifically the customer's own words about what they wished existed before the product. These often contain the load-bearing phrase the team's vision should rest on, in the customer's voice.
4. **The README of the main code repository.** Engineers often write a more honest one-liner here than marketing does on the site.
5. **Any "vision doc," "company doc," or strategy memo** the team has written. Date it; vision docs go stale fast.
6. **Recent fundraising material** (one-pagers, lead-investor memos). The team has had to defend a position recently; the defended position is often clearer than the stated one.
7. **Negative material:** the deck from the *previous* version of the company, if there was one. The pivots are where the real vision usually lives.

What to *not* take from sources at face value:

- Mission statements that begin "Our mission is to…" These usually collapse the Vision into a slogan; the slogan is *downstream* of the Vision, not it.
- Slogans and taglines. Useful as copy hooks, near-useless as substantive Vision.
- "We want to be the X for Y" framings without an explanation of why being the X for Y is durable.

#### Question set for Vision

These are the questions that pull a thin draft into a sharp one. They are not asked in order; they are asked when the draft is missing the corresponding piece.

1. **"Who, specifically, gets the most out of this product?"** Push past "small businesses" or "developers." Land on a person you could name.
2. **"What is the day-in-the-life of that person *now*, and what's the day-in-the-life when this product has won?"** Two scenes, side by side.
3. **"What's the one sentence about this product that, if it's true, the rest follows — and if it's false, the whole thing falls apart?"** This is the load-bearing claim.
4. **"What would a thoughtful, well-resourced competitor have to do to put you out of business?"** The negative-space probe for durability.
5. **"Who is this product deliberately *not* for?"** Forces the anti-position.
6. **"What's the win you'd take in three years that would be slightly embarrassing to admit — too small? too narrow?"** Often the most honest version of the three-year picture.
7. **"What's the failure mode you're most worried about — not 'going out of business,' but 'becoming the thing you didn't want to be'?"** Surfaces values; often what guardrails will derive from.
8. **"If a smart new hire read your existing pitch deck, then sat in on a planning meeting, would the meeting confirm or contradict the deck?"** The drift test.
9. **"What did you used to believe about this product that you don't believe anymore?"** Recent pivots usually contain the real Vision.
10. **"If you had to bet $10,000 of your own money on this Vision being roughly right in three years, what odds would you take?"** Forces the team to grade their own confidence.

The first four questions reach about 80% of teams in 30 minutes. Questions 5–7 are where genuinely sharp Visions emerge. Questions 8–10 are tools for the third or fourth conversation.

#### Conflict patterns to watch for

- **Website-vs-README divergence.** Marketing and engineering have drifted; the Vision needs to absorb both into one statement or pick a side.
- **Old-deck-vs-recent-direction.** The deck claims one thing; the last six months of work imply another. The product is more honest than the deck; trust the work.
- **Two-founder split.** One founder describes Quill as a notes tool; the other describes it as a knowledge-management platform. These imply different Visions. Surface the split directly; it will not resolve itself.
- **Customer-language-vs-team-language.** Customers describe the value in one set of words; the team describes it in another. The team's words usually win on internal docs, but the customer's words usually win on Vision-the-promise.
- **Tagline-as-Vision.** "We help teams work better together" is a tagline, not a Vision. If the doc collapses to taglines, the team hasn't done the work yet; that's not a conflict to resolve, it's a depth to push for.

#### Industry references that informed the question set

- **A.G. Lafley & Roger Martin — *Playing to Win*.** Five questions for strategy: winning aspiration, where to play, how to win, capabilities, management systems. Our Vision area lives at the intersection of *winning aspiration* and *how to win*.
- **Geoffrey Moore — positioning statement template** ("For [target] who [need], our [product] is [category] that [benefit], unlike [alternative]"). A useful forcing function when the Vision is muddy; the *unlike* clause maps to our anti-position.
- **Amazon — Working Backwards / PRFAQ.** The discipline of writing the press release before the product. The "three-year picture" question is a lightweight PRFAQ.
- **Jim Collins — *Built to Last* (BHAGs).** Useful as a stretch frame, dangerous as a substitute for specificity. We borrow the *durability* lens, not the size-of-goal framing.
- **April Dunford — *Obviously Awesome*.** Positioning as the upstream of marketing. Helpful for the anti-position section.
- **Annie Duke — *Thinking in Bets*.** The $10,000-bet question is a Duke move; treats confidence as a number you can name.

#### How to know the Vision is done (enough)

The Vision is bankable when **all four** are true:

1. A new senior hire could read it and predict, with reasonable accuracy, which features the team is likely to *say no to* in the next quarter.
2. The director can defend each clause against a skeptical question without retreating to generalities.
3. The anti-position is specific enough to point at real-world companies or product shapes the team won't be.
4. The win condition has at least one measurable marker that could observably fail in the next two years.

If any of these fail, bank at the honest grade and name the gap. Do not perfect; re-bank later.

#### What "done" is *not*

- Not "the team agrees." Teams can agree on muddy Visions. The test is sharpness, not consensus.
- Not "it sounds good." Vision is internal; it doesn't need to sound good.
- Not "the doc is long." A sharp Vision is usually 200–400 words. Longer Visions are usually unfinished thinking.

---

### 2 · Bets

**Plane:** Strategy · **Foundation:** yes

#### Stub — purpose

A Bet is a **testable claim about how the team plans to achieve the Vision, and what evidence would disqualify it.** Bets convert "we believe we'll win this way" into something the team can grade their confidence on and update as evidence accumulates. A library with sharp Bets stays honest; a library without them slides into "we always knew that," which is the failure mode of teams that stopped learning.

Most teams have 3–7 active Bets at any time. Fewer than 3 and the strategy is probably a single conviction (which is its own risk); more than 7 and the team is conflating Bets with hypotheses (the smaller, faster things that get tested in experiments).

#### Stub — question-set seed

1. *"What are you betting is true about the world — that, if it's wrong, the Vision can't hold?"*
2. *"What would have to be observably true in 12 months for this Bet to look correct?"*
3. *"What's the cheapest test you could run *this quarter* that would meaningfully update your confidence?"*
4. *"On a scale of high / medium / low / shaky, where's your confidence today — and what would have to happen for you to move it one step?"*
5. *"Which Bet would, if disqualified, hurt the most? (That's where to spend evidence first.)"*

Industry leans: Strategyzer assumption mapping; Annie Duke (*Thinking in Bets*); Marty Cagan's four risk types (value, usability, feasibility, viability).

*Full section TBD — to be written after we work out Vision in practice.*

---

### 3 · Guardrails

**Plane:** Strategy · **Foundation:** yes

#### Stub — purpose

A Guardrail is **a rule the team commits to *not* crossing, with the reasoning written down.** Guardrails are what protect the Vision from being eroded by short-term incentives — the customer the team won't take, the feature they won't ship, the partnership they won't sign, the kind of person they won't hire. A library with clear Guardrails lets junior-and-AI teammates say "no" in alignment with the team; without them, every "no" has to be re-litigated by a senior.

Guardrails are not values. Values are aspirations; Guardrails are commitments with named consequences.

#### Stub — question-set seed

1. *"What's a deal you turned down in the last year that you don't regret? Why?"*
2. *"What does the team's most aggressive growth path look like, and what's wrong with it?"*
3. *"If the Vision were violated to chase a short-term win, what would the violation look like? What's the early warning?"*
4. *"What are you and your team done arguing about? (Settled positions are guardrails-in-waiting.)"*
5. *"What's a competitor's choice you specifically don't want to copy, and why?"*

Industry leans: Amazon's Leadership Principles; Netflix culture deck; the "non-goals" section of well-written design docs; ADR practice for capturing reasoning.

*Full section TBD.*

---

### 4 · Standards

**Plane:** Strategy

#### Stub — purpose

A Standard is **a quality bar the team commits to clearing, by category.** Standards apply to anything the team produces: code, design, customer responses, marketing copy, hiring bar. They are the operationalization of "what good looks like" in this company specifically.

Where Guardrails answer "what we won't do," Standards answer "what we won't accept." A library with named Standards lets work be evaluated consistently across people and time; without them, "good enough" is in each reviewer's head.

#### Stub — question-set seed

1. *"Pick the last piece of work you were proudest of shipping. What made it meet the bar?"*
2. *"What's a piece of work you shipped that you'd reject if it came to you today? What changed?"*
3. *"What does a 'B' look like in each of code, design, copy, and customer-response? What does an 'A' look like?"*
4. *"Where do you currently lower the bar, and is that deliberate?"*
5. *"Whose standard, outside this company, would you most want to be measured by?"*

Industry leans: design systems literature; engineering-org quality-bar practices; editorial style guides; "definition of done" from XP.

*Full section TBD.*

---

## Product plane

The Product plane answers the question: **what are we actually making?** It is the largest plane (five areas) because the product is the most concrete thing in the room. The Product plane is where the team and the AI teammates share the most vocabulary — code, design, surfaces, plans.

### 5 · Vocabulary

**Plane:** Product · **Foundation:** yes

#### Stub — purpose

Vocabulary is **the list of terms that mean something specific in this product, and what each one means.** Every product has 20–80 such terms. Some come from the domain ("invoice," "ledger"); some are the team's own ("a Stage," "a Cohort"). When the team uses the same word two different ways — or two words for the same thing — every conversation costs a little more energy and every doc reads a little fuzzier. Vocabulary makes that cost visible and fixable.

This is the easiest Foundation to pre-fill. A codebase scan plus a README sweep produces 60% of the vocabulary on first pass. The hard work is the relationships (which terms relate to which, in what way) and the disambiguation (where two terms collide).

#### Stub — question-set seed

1. *"What term, in your product, do you and a teammate sometimes use differently? When does that confusion bite?"*
2. *"What term do you use internally that you wouldn't say to a customer, and what do you say to a customer instead?"*
3. *"Which two of these terms — pick from the scan — feel like they're the same thing under two names?"*
4. *"What's a term you wish you could rename but haven't, because it's in the code?"*
5. *"Which terms should new hires know on day one? Which ones can they learn in week three?"*

Industry leans: Domain-Driven Design (Eric Evans) — Ubiquitous Language; information-architecture controlled-vocabulary practice; technical-writing glossary discipline; ontology-engineering basics for the relationship layer.

*Full section TBD.*

---

### 6 · Skeleton

**Plane:** Product

#### Stub — purpose

The Skeleton is **the structural shape of the product — the surfaces, the connections between them, and the core path a user walks through them.** Not a wireframe. Not a flowchart. A map of where things live and how they relate, at the right zoom for someone to hold the whole product in their head in one minute.

A team that can't draw their Skeleton on a whiteboard usually has a product whose shape has drifted away from anyone's intent. A team that *can* tends to make faster, cleaner micro-decisions because they know what shape they're protecting.

#### Stub — question-set seed

1. *"If you had to introduce the product to a smart stranger in five minutes, what's the order of surfaces you'd walk them through?"*
2. *"Which surface are you proudest of? Which one are you most embarrassed by?"*
3. *"Trace the most-important user action through the surfaces it touches. What's load-bearing? What's incidental?"*
4. *"What surfaces exist in code but no one talks about? What surfaces does the team talk about that don't really exist?"*
5. *"What would change about the Skeleton if the Vision were sharper?"*

Industry leans: information architecture (Rosenfeld & Morville); service design blueprinting; JTBD service-mapping; ATM/airport-wayfinding studies for "zoom levels."

*Full section TBD.*

---

### 7 · Experience

**Plane:** Product

#### Stub — purpose

Experience is **the felt shape of using the product — what it's like, beat by beat, on the paths that matter.** Experience is distinct from Skeleton: Skeleton is *what's there*; Experience is *what it's like when you walk it*. The same Skeleton can host wildly different Experiences depending on pacing, tone, friction, surprise, recovery.

A library that captures Experience well lets new teammates make design and copy decisions that feel coherent with what's already there. Without it, the product develops accents — sections that feel different not because they're different jobs but because different people built them at different times.

#### Stub — question-set seed

1. *"Walk me through the moment a new user first 'gets it.' What happens, in order? Where's the click?"*
2. *"Where in the product does the user wait? What are they doing or thinking during that wait?"*
3. *"What is the product's tone — playful, careful, terse, warm — and where does it slip out of that tone?"*
4. *"What's a moment in the product that, if you broke it, you'd hear from users within a day?"*
5. *"Pick three competitor products that feel meaningfully different to use. What's the difference, and where do you sit relative to them?"*

Industry leans: service-design experience mapping; Don Norman's emotional design; Tognazzini's first principles of interaction; Charles Eames on connection details.

*Full section TBD.*

---

### 8 · Surface

**Plane:** Product

#### Stub — purpose

Surface is **the catalog of the actual UI primitives, components, and patterns the product uses — and the rules for how they go together.** Where Skeleton is the floorplan, Surface is the materials list and the design language. A team that knows its Surface ships consistent UI without thinking about it; a team that doesn't relitigates "should this be a modal or a side panel?" every sprint.

For products with no GUI (CLI tools, agent-shaped products), Surface still exists — it's the prompts, the command-shape, the output style. The vocabulary changes but the discipline doesn't.

#### Stub — question-set seed

1. *"What's the most common UI pattern in your product, and what's the second-most-common? When do you reach for each?"*
2. *"What's a pattern from another product you've borrowed, and where did you adapt it?"*
3. *"Where does the product currently feel inconsistent? Which surfaces feel like they belong to a different design system?"*
4. *"What's the smallest unit of the design system — color, type, spacing — and is it codified?"*
5. *"If a contractor designed a new feature next week, what doc would you hand them on day one?"*

Industry leans: Brad Frost's *Atomic Design*; Nathan Curtis on design tokens; design-system case studies (Polaris, Lightning, Material); pattern-library literature back to Christopher Alexander.

*Full section TBD.*

---

### 9 · Forward plan

**Plane:** Product

#### Stub — purpose

The Forward plan is **what the team is working toward across the next several time-horizons, expressed at the right level for outsiders to understand and insiders to commit to.** It is not a Gantt chart, not a sprint board, and not an OKR. It's a *now / next / later* shape: what's in flight, what's next once the in-flight thing lands, what's on the horizon. The Forward plan is the area teams most often skip in libraries because they think "it'll be out of date by next month." That's true; the discipline is re-banking, not skipping.

#### Stub — question-set seed

1. *"Name the three things actually in flight right now. For each, what 'done' looks like."*
2. *"Name the next three things after those. Why those, in that order?"*
3. *"What's on the 'someday' list that you'd start tomorrow if a Bet changed?"*
4. *"What have you been working on for longer than you meant to? What's the honest reason?"*
5. *"What would have to be true in six months for this Forward plan to look right in retrospect?"*

Industry leans: Janna Bastow's now/next/later roadmap; *Shape Up* cycles (Basecamp); OKRs (with the caveat that OKRs are a goal-setting practice, not a roadmap); rolling-wave planning from project management.

*Full section TBD.*

---

## Learning plane

The Learning plane answers the question: **what do we actually know?** It is the smallest plane in volume but the hardest to keep healthy, because it requires the team to treat learning as work that has to be written down, not as a thing that lives in people's heads and gets recreated at every meeting.

### 10 · User research

**Plane:** Learning · **Foundation:** yes

#### Stub — purpose

User research is **the durable record of what the team has heard from real users, attributed and dated, and what the team is therefore choosing to believe about user behavior and need.** A team without User research keeps re-discovering the same insights and forgetting them between meetings. A team with it builds a compounding asset: every new conversation lands against the texture of the previous ones.

The discipline is light: a research conversation is worth 10x more if it gets a 200-word writeup within 24 hours than if it gets a perfect writeup never. Coverage and freshness beat polish.

#### Stub — question-set seed

1. *"Who have you talked to in the last 30 days? What was the most surprising thing you heard?"*
2. *"Which user belief has updated for you in the last quarter? What conversation moved it?"*
3. *"What's a question you're tired of asking customers because you already know the answer? (Watch this one — sometimes the 'known' answer is actually a calcified belief.)"*
4. *"What do users do that surprised you when you first saw it, and that you now take for granted?"*
5. *"Whose feedback do you currently weight too heavily? Too lightly?"*

Industry leans: Teresa Torres (*Continuous Discovery Habits*); Erika Hall (*Just Enough Research*); Rob Fitzpatrick (*The Mom Test*); JTBD interview technique (Chris Spiek & Bob Moesta); customer-development practice (Steve Blank).

*Full section TBD.*

---

### 11 · Competitive intel

**Plane:** Learning

#### Stub — purpose

Competitive intel is **the team's working model of who else is in the space, what they're doing well, what they're doing badly, and where the team's position is actually defensible.** Done well, this is a tool for sharpening Vision and Bets — most strong positioning comes from genuinely understanding the alternatives. Done badly (as in most companies' "competitor pages"), it's a tour of mediocre web research that no one updates.

The discipline is to *use* competitive intel: every quarter, someone asks "what changed?" and the doc gets re-banked.

#### Stub — question-set seed

1. *"Name three companies you'd put in front of yourself if you had to position your product against them. Why those three?"*
2. *"Pick one. What are they better at than you? What are you better at than them? What would happen if they copied your best move?"*
3. *"What category does the market think you're in? Is that the category you're actually in?"*
4. *"What's a company that *isn't* a competitor today but could be if they shipped one feature? What would that feature be?"*
5. *"Where is your space heading, and who's the team most likely to get there first if not you?"*

Industry leans: Wardley mapping (Simon Wardley); Porter's Five Forces (with caveat — it's a heavyweight frame); April Dunford on competitive positioning; the discipline of "kill the company" exercises.

*Full section TBD.*

---

### 12 · Decision trail

**Plane:** Learning

#### Stub — purpose

The Decision trail is **a dated, durable record of the meaningful calls the team has made and the reasoning at the time.** Not every decision belongs — only the ones a future teammate would want to reread, either to honor the call or to know what to revisit. The trail's superpower is *unsticking* future work: most team paralysis is "we already decided this — didn't we?" combined with not remembering why.

The discipline is light, dated, and durable. Architecture Decision Records (ADRs) are the model: 1 page, dated, status, context, decision, consequences.

#### Stub — question-set seed

1. *"What's a call you made in the last six months that, if you forgot you'd made it, the team would relitigate?"*
2. *"What's a decision you regret? Was it the wrong call given what you knew, or the right call given what you knew but bad luck on the outcome?"*
3. *"What did the team disagree about that you eventually decided one way? What's the reasoning that won?"*
4. *"What decision is currently *de facto* in the product but never formally made?"*
5. *"What's the oldest decision in the trail that you should re-open?"*

Industry leans: Michael Nygard on Architecture Decision Records; Annie Duke on decision journals; RAID logs (risks/assumptions/issues/decisions) from project management; *In Sheep's Clothing* — separating the decision-quality from outcome-quality.

*Full section TBD.*

---

### 13 · Product evidence

**Plane:** Learning

#### Stub — purpose

Product evidence is **the team's record of how the product is actually performing, in the wild, against the Bets it claimed to be making.** Less granular than analytics dashboards; more durable than the latest A/B test. The point is to keep a running, dated record of "what we observed" alongside "what we were hoping to observe," so the Bet grades can be updated honestly.

This is where the Learning plane closes the loop back to Strategy: evidence updates Bets; updated Bets feed back into the Vision (sometimes confirming, sometimes pressuring).

#### Stub — question-set seed

1. *"What's the latest piece of evidence that *moved* a Bet's confidence? Up or down?"*
2. *"What's a metric you've been watching that has stopped telling you what you thought it was telling you?"*
3. *"What's an outcome you didn't expect — positive or negative — that the product produced?"*
4. *"Which Bet has been *un*tested for longest? Why? What's the cheapest test you could run?"*
5. *"What's a customer story — named, dated — that you would want a new teammate to read on day one to understand who you're really serving?"*

Industry leans: case-study writing from sales-enablement practice; experiment-log discipline from growth teams; the *evidence ladder* concept (anecdote → pattern → measurable → causal); honest analytics writing (DJ Patil; *Data Sketches*; recent work on dashboards-as-narratives).

*Full section TBD.*

---

## Open questions for this playbook itself

These are the things we don't yet know about *how to do this work*, listed so we can come back to them as real population projects produce evidence.

1. **The right grade rubric.** Letter grades are working text. We don't yet know whether they communicate well to directors who aren't used to thinking in academic terms. Alternatives: tiers (Foundation / Working / Solid / Strong), confidence intervals, or a two-axis (completeness × confidence) shape.
2. **The right pre-fill confidence threshold.** When should a teammate offer a pre-filled slot at all? Too eager, and the director rubber-stamps junk; too cautious, and the form feels like a blank page. Probably area-dependent.
3. **The right order of questions per area.** The question sets above are tried-and-true *bundles*; we haven't yet worked out whether they should be asked in a fixed order, or branched based on the director's first answer.
4. **The right cadence for Phase F (live with it).** Weekly? Monthly? Triggered by events (new customer, new hire, new Bet)? Likely all three, but we need real data on which trigger produces the highest-value re-banking.
5. **Whether the 13 areas hold across different company shapes.** The set has been worked through against B2B SaaS and consumer-software shapes. Less clear for hardware, deep tech, marketplace, or services-led companies. Re-test as those shapes show up.
6. **The right number of cards per source-of-truth doc.** Working answer: "however many citable claims the SoT actually contains." We don't yet have a felt sense for whether that's 5, 15, or 50 per area.
7. **The economics of doing this with AI vs. without.** We have a strong intuition that AI-assisted population is dramatically faster than human-only — but we haven't measured. Worth instrumenting once Raven is doing real population work.

## What this playbook is *for*

Two uses, equally weighted:

1. **A reference for agents.** Raven (and future teammates) builds skill prompts against this playbook. Each area's section is structured so the agent can read it once and know what to mine, what to ask, what conflicts to surface, and what done looks like.
2. **A reference for humans.** A founder doing this without AI, or a consultant helping a team set up a library, can use this end-to-end. It is intentionally written in language a thoughtful product person can follow without Alexandria-internal context.

When the two uses diverge — when the agent needs detail the human reader doesn't — we'll split into companion documents. For now they share a doc, and the shared writing keeps both honest.

## Next moves

In rough order:

1. **Vision in the wild.** Use this Vision section, end-to-end, on a real product (Alexandria itself is a candidate; so is one of the fictional or partner products we've discussed). Produce a banked Vision SoT. Capture what worked, what was missing in this playbook, what we'd change.
2. **Bets — full section.** Apply the same shape as Vision: full exemplar, mining guide, question set with industry refs, conflict patterns, done-criteria.
3. **One Product-plane area — full section.** Vocabulary is the easy one (pre-fill rich); Skeleton is the load-bearing one. Pick based on which area we want to test the pattern on next.
4. **Re-bank this playbook itself.** This doc is currently a draft. Once it's been used on one or two real areas, re-bank it at an honest grade. It will not stay at "draft" forever; that itself is part of the discipline.
