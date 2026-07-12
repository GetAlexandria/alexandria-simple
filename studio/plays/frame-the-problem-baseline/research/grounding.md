# Grounding — the problem-framing canon

The cited source of truth for Frame the Problem's core instruction. Provenance:
web research + source-verification by Sonnet agents, 2026-06-10. Claims checked
against primary sources where fetchable; caveats flagged inline. Raw verification
detail: `extracted-claims.md`.

## 1. The method's one rule, across every school

Independent methods — Toyota manufacturing, Amazon product, design thinking,
startup discovery — converge on the same sequencing law: **understand and
validate the problem before any solution is permitted in the room.**

- Toyota A3: the left side of the sheet (current condition → target condition →
  measured gap → root cause) must be complete before the right side
  (countermeasures) may begin. The gap statement *is* the problem statement.
  [lean.org A3 lexicon; leantechpro.com]
- Amazon Working Backwards / PR-FAQ: "Writing a press release is a forcing
  function to ensure that the creator of the new product idea is focused on the
  customer." You cannot write it without the specific customer, their problem in
  their language, and why alternatives fail. [workingbackwards.com — Colin Bryar]
- Double Diamond: diamond 1 (Discover→Define) is problem space, diamond 2
  (Develop→Deliver) is solution space. "The first diamond helps people
  understand, rather than simply assume, what the problem is." [Design Council,
  designcouncil.org.uk/resources/the-double-diamond/] (The popular gloss "design
  the right thing before designing the thing right" is secondary commentary, not
  verbatim Design Council.)
- Uri Levine: "Fall in love with the problem… the problem becomes the north star
  of your journey, keeping you focused." [urilevine.com; Next Big Idea Club]
- Theodore Levitt (popularized by Christensen): "People don't want to buy a
  quarter-inch drill. They want a quarter-inch hole." (Widely attributed to
  Levitt's teaching; not confirmed as verbatim print text.)

**Why framing quality matters:** "The way you frame a problem determines which
solutions you come up with." — Thomas Wedell-Wedellsborg, "Are You Solving the
Right Problems?", HBR Jan–Feb 2017. His survey: 85% of 106 C-suite execs said
their organizations are bad at problem diagnosis. Canonical example: tenants
complain "the elevator is too slow" (frame → costly motor upgrade); reframe as
"the wait is annoying" → install mirrors. [hbr.org/2017/01/are-you-solving-the-right-problems]

## 2. What a complete problem frame contains

Consensus fields across JTBD and design thinking:

| Field | Canon | Source |
|---|---|---|
| **The job / desired progress** | "A job is the progress that a person is trying to make in a particular circumstance" — with functional, emotional, and social dimensions | Christensen, *Competing Against Luck* (2016); HBR "Know Your Customers' Jobs to Be Done" (paywalled — structure confirmed via secondaries) |
| **Who has it** | A specific, descriptive user — never a demographic or "everyone" | d.school POV; Levine: "Ask yourself, who has this problem?" |
| **The circumstance / struggling moment** | "The circumstance is fundamental to defining the job" — when and where the pain strikes, what triggers it | Christensen (milkshake: long boring commute, one free hand, hunger until noon — the *circumstance*, not the product, defined the job) [HBS Working Knowledge] |
| **The insight (the "because")** | A non-obvious synthesis explaining why the need is compelling — not a restatement, not a truism | d.school POV template: [User] needs [need] because [insight]; weak: "because vitamins are vital"; strong: "because in her hood a social risk is more dangerous than a health risk" |
| **Evidence** | See §3 — graded, not flat | Fitzpatrick; Torres |

Job-statement syntax where precision helps (Ulwick): verb + object + contextual
clarifier ("repair a torn rotator cuff"); need statements "stable over time and
devoid of solutions." [strategyn.com]

## 3. Evidence rules (The Mom Test — Rob Fitzpatrick; all verbatim, full-text PDF)

- Premise: feedback on ideas is systematically unreliable — the book's subtitle:
  "…when everybody is lying to you." The fix is structural: "Mom was unable to
  lie to us because we never talked about our idea."
- The three rules: talk about their life, not your idea; "ask about specifics in
  the past instead of generics or opinions about the future"; talk less, listen more.
- **Evidence grading:** "Opinions are worthless." "Anything involving the future
  is an over-optimistic lie." Three types of bad data: **compliments, fluff
  (generics/hypotheticals/futures), ideas.** "The world's most deadly fluff is:
  'I would definitely buy that.'"
- Remedy: anchor fluff to a specific past instance — "When's the last time that
  happened?"
- Gold standard: **commitment** — "giving up something they value such as time,
  reputation, or money." "Commitment is important. It tells us whether people
  are actually telling the truth."
- Solution-reversal: "Why do you bother?" — "great for getting from the
  perceived problem to the real one" (finance staff asked for messaging tools;
  the real job was version certainty — the answer looked like Dropbox).
- Significance tests: "Some problems don't actually matter." "If they haven't
  looked for ways of solving it already, they're not going to look for (or buy)
  yours." And: "People know what their problems are, but they don't know how to
  solve those problems."

Torres's corroborating standard: opportunities on the tree must come from what
customers actually said — "When we generate opportunities off the top of our
heads, we bring our own biases and half-truths into the picture."
[producttalk.org/opportunity-solution-trees/]

## 4. Handling multiple tangled problems (Teresa Torres — verified verbatim)

- Structure, not a flat list: "It can be hard to prioritize a flat list of
  opportunities, because opportunities come in different shapes and sizes, some
  are interrelated, others are subsets of others." [producttalk.org/opportunity-mapping/]
- Relations: **parent/child** (child is a *subset* of its parent) and
  **sibling** (distinct — "you can address one without addressing another").
- An opportunity is "an unmet customer need, pain point, or desire" — broader
  than a problem.
- Frame entries in the customer's voice: "a customer might say, 'I couldn't
  find anything to watch,' but they aren't likely to say, 'I wish I
  binge-watched Netflix more.'" [producttalk.org/prioritize-opportunities/]
- Purpose: structure the problem space first — decompose the ill-structured big
  problem into individually addressable ones.
- Correction from verification: the tree's four layers are outcome →
  opportunities → solutions → **assumption tests** (not "experiments"); the
  "experience map" mechanism was not found on the verified pages.

## 5. Tests and anti-patterns

- **Solution-in-disguise test (Torres, verbatim):** "The best way to test if an
  opportunity is really a solution in disguise is to ask, 'Is there more than
  one way to address this opportunity?'" One way → it's a solution; reframe.
- **Goldilocks sizing (NN/g, How-Might-We):** too narrow implies a single
  solution; too broad loses the problem ("improve the entire product
  experience"). Checklist: based on an existing insight? tracks a desired
  outcome? broad enough for many ideas? *does it suggest a solution?* (→ rewrite).
  [nngroup.com/articles/how-might-we-questions/]
- **Problem-statement anti-patterns (IxDF):** embedding the solution
  ("technical requirements… unnecessarily restrict the team"); too broad
  ("Improve the human condition"); too narrow (specifying the feature — usually
  a disguised solution); missing the user; missing the insight (a "because"
  that restates the need). [ixdf.org — Stage 2: Define]
- **5 Whys, used with care:** Ohno: "By repeating why five times, the nature of
  the problem as well as its solution becomes clear." Documented limits:
  analysts stop at symptoms, can't see past their own knowledge, different
  people reach different root causes, single-cause bias. [en.wikipedia.org/wiki/Five_whys]
  → useful probe, not an oracle; surface disagreement rather than forcing one chain.

## 6. Reframing a stakeholder's frame (Wedell-Wedellsborg, HBR 2017)

"What they struggle with, it turns out, is not solving problems but figuring
out what the problems are." Five reframing strategies: look outside the frame ·
rethink the goal (positions vs interests) · examine bright spots (when does the
problem *not* occur?) · look in the mirror (your own contribution) · take their
perspective. Process: state "The problem is that…" → reframe → **test the
problem itself before testing solutions.**

## Where the rest of the canon routes

Captured-not-dropped: canon this play deliberately does NOT use, pre-assigned
to the briefs that will (the Director's size-small triage, 2026-06-10):

- **Amazon PR-FAQ / Working Backwards** → rung 2, *Write the One-Pager / PRD* —
  the press-release-first discipline is that play's natural grounding seed.
- **Toyota A3 gap statement** (current condition vs target condition, measured
  gap) → rung 2 — the problem→goal statement structure.
- **Mom Test worth-solving tests** (commitment standard; "some problems don't
  actually matter"; past solution-seeking) → *Feasibility Check* and *Size the
  Opportunity* — validation, not framing.
- **Wedell-Wedellsborg's five reframing strategies** (outside the frame,
  rethink the goal, bright spots, mirror, their perspective) → rung 0, *Run
  Internal Feature Discovery* — they're interactive interview moves — and the
  future "Map the Problem Space" sub-play.
- **5 Whys (with its documented limits) + Torres tree-building practice** →
  the "Map the Problem Space" sub-play's method library (see brief §8).
- **NN/g How-Might-We right-sizing** → the map→ideation seam, when a play
  converts problem frames into HMW questions.

## Source register

| Source | Quality | Caveats |
|---|---|---|
| producttalk.org (4 pages) | primary | verified by fetch, quotes verbatim |
| The Mom Test full text (inkubator.si PDF) + momtestbook.com | primary | verified by fetch, page-numbered quotes |
| HBS Working Knowledge (milkshake) | primary-adjacent | verbatim quotes |
| strategyn.com / jobs-to-be-done.com (Ulwick) | primary | Medium auth-wall on one page; format corroborated |
| Christensen HBR 2016 / *Competing Against Luck* | primary | paywalled — structure confirmed via secondaries, quotes not pulled from print |
| d.school POV pages, NN/g HMW, IxDF Define, Design Council, Wikipedia 5 Whys, workingbackwards.com, urilevine.com | primary/strong secondary | "design the right thing" gloss and Levitt drill quote flagged as attributed, not verbatim print |
