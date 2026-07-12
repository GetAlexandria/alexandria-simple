# Diagnostic Patterns

Anti-patterns and health signals Raven recognizes during product conversations. These are
the failure modes a great product thinker spots instinctively. Each pattern maps to
observable signals in the knowledge graph.

Load this file at the start of any product conversation.

Card-type names below use the classic library vocabulary illustratively —
translate to the workspace's actual taxonomy (see `library-model.md`).

---

## How to Use This File

These patterns are not a checklist to run through. They are a recognition vocabulary.
When a conversation touches an area and the library's structure exhibits one of these
patterns, name it. The human may not have noticed — that's the value.

---

## Pattern 1: Build Trap (Perri)

**Signal:** The library is heavy on solution cards (Capabilities, Components, Templates)
but light on outcome evidence. Roadmap items describe what to build, not what behavior to
change. Initiative cards lack success criteria. WHEN sections track ship dates, not impact
metrics.

**What to say:** "We have detailed cards for what to build but I don't see outcome
definitions. What customer behavior are we trying to change? The library tracks output,
not outcomes."

**Detection heuristic:**
- Initiative/Future cards without stated success metrics
- Capability cards without linked user Jobs or Loops
- Dense product layer, sparse experience layer

---

## Pattern 2: Premature Scaling (Rachleff)

**Signal:** Growth-oriented Initiative cards or investment in acquisition/distribution
without evidence of validated value hypothesis. No retention data in WHEN sections. No
cohort analysis in temporal cards. Recorded feedback shows churn-related gaps.

**What to say:** "The library has growth initiatives but I can't find retention evidence.
Are we confident in the value hypothesis before investing in growth? There are three
recorded complaints about user drop-off that haven't been addressed."

**Detection heuristic:**
- Growth/distribution Initiative cards without linked retention evidence
- Missing or thin persona cards (who retains?)
- Recorded churn or engagement questions without resolution

---

## Pattern 3: Solution Anchoring

**Signal:** A conversation jumps directly to implementation details without articulating
the problem. Solution cards exist without linked problem/opportunity framing. The human
describes what to build, not why users need it.

**What to say:** "We're deep in solution space. Can we back up? What job is the user
hiring this for? The library has the Capability card but no linked Journey or Loop
explaining the user context."

**Detection heuristic:**
- Capability/Component/Template cards without wikilinks to experience layer
- Conversations where the human leads with technical architecture
- Missing JTBD framing in WHY sections

---

## Pattern 4: Leaky Loop (Reforge)

**Signal:** Growth loop described in library cards but retention foundation is weak or
missing. Acquisition mechanism exists without evidence that acquired users stick. Loop
cards describe the cycle but WHEN sections show declining cohorts or missing data.

**What to say:** "The growth loop looks clean on paper — the Loop card describes the
cycle well. But retention is the foundation, and I'm not seeing evidence that the loop
actually closes. What's the retention curve look like for users entering through this
path?"

**Detection heuristic:**
- Loop cards with acquisition mechanics but no retention linkage
- Force cards describing growth without linked retention metrics
- Recorded complaints about engagement drop-off

---

## Pattern 5: Missing Delighters (Kano)

**Signal:** Roadmap and Initiative cards are entirely must-have and performance features.
No investment in surprise, delight, or differentiation. Experience Goal cards exist but nothing
on the roadmap connects to them. The experience layer is disconnected from the temporal
layer.

**What to say:** "Everything on the roadmap is table stakes — Standards obligations and
parity features. The Experience Goal cards describe feelings like [X] but nothing planned
invests in them. Where's the differentiation?"

**Detection heuristic:**
- Initiative/Future cards all linked to Standards (must-haves)
- Experience Goal cards with no wikilinks from temporal layer
- No Loop or Journey cards linked to upcoming Initiatives

---

## Pattern 6: Confirmation Bias

**Signal:** A conversation cites only supporting evidence while the library contains
counter-evidence. There are recorded contested claims in the area. Decision cards
acknowledge alternatives that the current discussion ignores.

**What to say:** "The library supports that view in [card A], but there's tension.
[Card B] records an alternative perspective, and there's a recorded contested claim
about [topic]. Have we weighed the counter-evidence?"

**Detection heuristic:**
- Decision cards with documented alternatives not mentioned in discussion
- Recorded contested claims in the topic area
- Recorded feedback that contradicts the stated position

---

## Pattern 7: Strategy Gap (Mehta)

**Signal:** Roadmap items don't trace to a stated strategy. Initiative cards lack
wikilinks to Principles or Product Theses. Features are being planned without strategic
rationale. The Strategy Stack (Lens 7 in thinking-lenses.md) has breaks.

**What to say:** "These three features don't connect to a stated strategy. I can't trace
them to a Product Thesis or Principle. What's the strategic intent? Without it, we're
building opportunistically."

**Detection heuristic:**
- Initiative/Future cards without WHY section links to rationale layer
- Capability cards without upstream Principle/Thesis linkage
- Clusters of product-layer cards with no rationale-layer connections

---

## Pattern 8: Phantom Consensus

**Signal:** A decision appears settled but the library reveals it was never actually
resolved. Decision cards lack "Alternatives Considered" or show unresolved tensions.
There are recorded open (not contested, just open) questions in the area. Multiple cards
assume different answers to the same question.

**What to say:** "This looks decided, but the Decision card doesn't record alternatives
considered, and two product cards seem to assume different answers to the same question.
Is this actually settled or are we operating on phantom consensus?"

**Detection heuristic:**
- Decision cards with thin or missing "Alternatives Considered"
- Multiple cards with contradictory assumptions in their WHY sections
- Recorded open questions without resolution

---

## Pattern 9: Over-Serving (Christensen)

**Signal:** Heavy investment in refining features for existing power users while
non-consumers or underserved segments go unaddressed. Capability cards have deep HOW
sections for advanced use cases. Persona cards describe only the current core user.
No cards address adjacent or underserved segments.

**What to say:** "The library's Capability cards are deep for the power-user segment.
But there are no persona cards for [adjacent segment]. If disruption theory applies here,
that gap is where a competitor enters."

**Detection heuristic:**
- Deep HOW sections with advanced behavior specifications
- Persona cards only for core/power users
- No Future cards addressing new segments or simpler use cases

---

## Pattern 10: Orphaned Decisions

**Signal:** Decision cards exist but downstream cards don't reflect them. A strategic
decision was made but never propagated into the product or experience layers. The decision
exists in the temporal layer but has no wikilinks from product cards.

**What to say:** "We decided [X] three months ago — the Decision card is clear. But
I can't find any product-layer cards that reflect this decision. Has it been implemented
in the product vision, or is it an orphaned decision?"

**Detection heuristic:**
- Decision cards with zero or few reverse wikilinks from product layer
- Recent Decision cards (WHEN section) with no connected Initiative cards
- Decision cards the Ledger shows no follow-on work for

---

## Severity Calibration

Not every pattern occurrence is urgent. Use this guide:

| Severity | When | Response |
|----------|------|----------|
| **Mention** | Pattern is present but impact is low or unclear | Name it, move on |
| **Explore** | Pattern is present and touches the current conversation topic | Dig in, ask the human about it |
| **Flag** | Pattern reveals a substantive risk the human should address | Surface clearly, suggest action (a play to run, card work to queue, a gap to record) |
