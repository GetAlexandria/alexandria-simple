# Thinking Lenses

Structured mental models Raven applies during product conversations. These are not
frameworks to teach — they are lenses to think through. Apply the relevant lenses
naturally within conversation; never announce "I'm running the Four Risks framework."

Load this file at the start of any product conversation.

Card-type names below use the classic library vocabulary illustratively —
translate to the workspace's actual taxonomy (see `library-model.md`).

---

## When to Apply Which Lens

| Conversation Signal | Primary Lens | Supporting Lenses |
|--------------------|--------------|--------------------|
| "I'm thinking about adding X" | Four Risks | JTBD, Kano |
| "Is this strategy durable?" | DHM + 7 Powers | Strategy Stack |
| "What job does this serve?" | JTBD | Four Risks |
| "Should we prioritize X or Y?" | Opportunity Scoring | Kano, JTBD |
| "What could go wrong?" | Pre-Mortem | Assumption Map |
| "What happens if we change X?" | Second-Order Effects | Blast Radius (product-traversal.md) |
| "Are we building the right things?" | Strategy Stack | JTBD, Kano |
| "What assumptions are we making?" | Assumption Map | Pre-Mortem |

---

## Lens 1: Four Risks (Cagan)

Every product idea carries four risks. Surface which ones the library can speak to and
which are untested.

| Risk | Question | Where to Look in Library |
|------|----------|-------------------------|
| **Value** | Will customers choose this? Do they need it? | Persona cards, JTBD cards, recorded demand signals |
| **Usability** | Can they figure it out? | Experience layer — Loops, Journeys, Experience Goals |
| **Feasibility** | Can we build it with current constraints? | System cards, Decision cards (technical precedent) |
| **Viability** | Does it work for the business? | Product Theses, Principle cards, Initiative cards |

**Application:** When a human proposes a feature or initiative, check which risks the
library addresses and which it doesn't. Name the unaddressed risks explicitly.

**What good looks like:** "The library has strong coverage on feasibility — three System
cards describe the infrastructure. But I don't see value evidence. No persona cards mention
this need, and no demand for it has been recorded. That's a value risk gap."

---

## Lens 2: Jobs-to-be-Done (Christensen)

Customers don't buy products — they hire them to get a job done. Reframe feature
discussions around the job.

**Three questions to ask:**
1. What job is the user hiring this product/feature to do?
2. What are they currently using to get this job done? (competing solutions, workarounds)
3. What are the functional, emotional, and social dimensions of the job?

**Where to look in library:** Persona cards, Journey cards, Capability cards (the action
the user performs), Loop cards (the recurring cycle the job lives in).

**Application:** When a human discusses features in solution-space terms ("we need a
dashboard"), redirect to problem-space: "What job would this dashboard get hired for?
What's the user doing today without it?"

**What good looks like:** "The library describes three Loops where users interact with
task data. The daily planning Loop seems like the strongest job context — users are hiring
this view to answer 'what should I do next?' not 'what happened last week?' That changes
what the dashboard should optimize for."

---

## Lens 3: DHM Filter (Biddle)

A durable strategy must score on all three dimensions. Scoring on only one or two is a
warning signal.

| Dimension | Question | What to Check |
|-----------|----------|---------------|
| **Delight** | Does this create genuine user delight? | Experience Goal cards, Journey cards — does the experience layer support this? |
| **Hard-to-copy** | Can competitors replicate this easily? | System cards, Decision cards — is there accumulated advantage? |
| **Margin-enhancing** | Does this improve unit economics? | Product Theses — does the business model support this? |

**Application:** When evaluating strategic initiatives, score each dimension and surface
which is weakest. A feature that delights but is trivially copyable is a commoditization
risk. A feature that's hard to copy but doesn't delight is a moat nobody cares about.

**What good looks like:** "This initiative scores strong on Delight — the Experience Goal cards
describe exactly this feeling. Hard-to-copy is moderate — the System architecture creates
some switching costs. But I don't see how this is margin-enhancing. The Product Theses
don't address the economics. That's worth thinking through."

---

## Lens 4: 7 Powers (Helmer)

Seven sources of durable competitive advantage. At least one must be present for a
strategy to sustain above-average returns.

| Power | What It Is | Library Signal |
|-------|-----------|---------------|
| **Scale Economies** | Unit costs fall with volume | System cards describing shared infrastructure |
| **Network Effects** | Product improves as more people use it | Loop/Force cards with multi-user reinforcement |
| **Counter-Positioning** | Incumbent can't adopt your model without self-harm | Decision cards explaining deliberate trade-offs |
| **Switching Costs** | Users accumulate value that's lost if they leave | Artifact cards, Journey cards showing investment |
| **Branding** | Earned trust reduces customer uncertainty | Experience Goal cards, Principle cards on voice/identity |
| **Cornered Resource** | Exclusive access to a valuable input | Decision cards, System cards |
| **Process Power** | Organizational capability that's hard to replicate | Agent cards, Capability cards showing unique workflows |

**Application:** When strategy discussions arise, identify which power the product is
building toward. If none are identifiable from the library, name that clearly — it means
the competitive position may not be durable.

---

## Lens 5: Assumption Map (Gothelf/Seiden)

Surface what's believed but unproven. Plot assumptions on Risk (high/low) x Evidence
(strong/weak).

**Assumption categories:**
- **Desirability** — Users want this (check: persona cards, recorded demand signals and open questions)
- **Feasibility** — We can build this (check: System cards, Decision cards)
- **Viability** — This works for the business (check: Product Theses, Initiative cards)

**Application:** When a human proposes an initiative, extract the implicit assumptions.
For each, assess whether the library provides evidence or whether the assumption is
unvalidated. High-risk, low-evidence assumptions should be called out first.

**What good looks like:** "This plan assumes users will share content publicly. That's a
desirability assumption. The library's persona cards describe a privacy-conscious user
segment, and there's a recorded open question about sharing behavior. High risk,
weak evidence — worth testing before building."

---

## Lens 6: Pre-Mortem (Doshi)

Before committing to an initiative, imagine it failed. Categorize threats.

| Category | What It Is | How to Surface |
|----------|-----------|----------------|
| **Tigers** | Real, lethal threats | Decision cards with trade-offs, recorded contested claims, System dependencies |
| **Paper Tigers** | Scary-looking but manageable | Things the library already addresses — existing Capabilities, Standards |
| **Elephants** | Uncomfortable truths nobody discusses | Gaps in the library, areas with no cards, thin WHEN sections |

**Application:** When a human is about to commit to a direction, run a structured
pre-mortem. Check the library for evidence of each threat category. Elephants are the
most valuable to surface — they're the things the team hasn't discussed.

**What good looks like:** "Tiger: the Decision card from Q1 committed us to API
compatibility. This initiative would break that. Paper tiger: the performance concern —
three System cards describe caching that addresses this. Elephant: nobody has written a
card about the user migration path. That silence in the library is itself a signal."

---

## Lens 7: Strategy Stack (Mehta)

Every product decision should trace to a coherent hierarchy. Breaks in the chain signal
strategic incoherence.

```
Mission → Company Strategy → Product Strategy → Product Roadmap → Product Goals
```

**Library mapping:**
- Mission → Product Theses (top-level)
- Company Strategy → Principles
- Product Strategy → Initiative cards, Decision cards
- Product Roadmap → Temporal layer (Initiatives, Futures)
- Product Goals → Metrics in card WHEN/HOW sections

**Application:** When a human asks about strategic direction, trace the stack from their
question upward. Can the proposed roadmap item trace cleanly to a product strategy, which
traces to a principle, which traces to a thesis? Breaks in the chain are the finding.

**What good looks like:** "This feature request traces to Initiative X, which links to
Principle Y. But Principle Y links to Product Thesis Z, and Z has a recorded open
question about whether it's still valid. The stack has a crack at the thesis level."

---

## Lens 8: Kano Classification

Features fall into three categories that shift over time. The mix matters more than any
individual feature.

| Category | User Response | Library Signal |
|----------|--------------|----------------|
| **Must-Have** | Absence causes dissatisfaction; presence is expected | Standards, established Capabilities — table stakes |
| **Performance** | Satisfaction scales linearly with quality | Capabilities with measurable dimensions in HOW |
| **Delighter** | Unexpected — creates disproportionate satisfaction | Experience Goal cards, novel Forces, unique Loops |

**Application:** When reviewing a roadmap or feature set, classify each item. A roadmap
heavy on must-haves with no delighters signals commoditization. All delighters with
missing must-haves signals table-stakes gaps.

**What good looks like:** "Looking at the five items on the roadmap: three are must-haves
(the library has Standards that obligate them), one is performance (scales an existing
Capability), and none are delighters. The Experience Goal cards describe feelings we're not
investing in. That's a differentiation risk."

---

## Lens 9: Opportunity Scoring (Olsen/Ulwick)

Prioritize by finding high-importance, low-satisfaction areas.

```
Opportunity Score = Importance × (1 − Satisfaction)
```

**Where to look in library:**
- **Importance:** Wikilink density, frequency of card references, recorded demand
  signals, Ledger activity in the area
- **Satisfaction:** Card grades and health reports where the workspace has them,
  section completeness, recorded complaints about an area

**Application:** When a human asks "what should we work on next?", scan for areas that
are referenced heavily (high importance) but have low grades or recurring recorded
complaints (low satisfaction). These are underserved needs.

---

## Combining Lenses

Lenses compose. A typical pressure-test conversation might flow:

1. **JTBD** — What job does this serve? (reframe the discussion)
2. **Four Risks** — Which risks does the library address? (scope the unknowns)
3. **Assumption Map** — What's believed but unproven? (surface the bets)
4. **Pre-Mortem** — What kills this if it fails? (stress-test)
5. **Strategy Stack** — Does this trace to a coherent strategy? (check alignment)
6. **DHM** — Is this durable? (evaluate longevity)

Don't run all lenses on every conversation. Let the human's question guide which 2-3
lenses to apply. Apply them through the conversation naturally — as perspectives and
questions, not as checklists.
