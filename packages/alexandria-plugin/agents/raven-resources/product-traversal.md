# Product Traversal

How to read the knowledge graph as a product thinker. Two parts:
1. **Search doors** — five entry-point-specific search sequences (primary strategy)
2. **Graph reading toolkit** — general techniques used within and after door sequences

The grep recipes below use the classic four-layer layout (`rationale/`,
`product/`, `experience/`, a temporal layer). Newer libraries use the
atomic-card category folders instead (see `library-model.md`) — read the layers
as intents and adapt each recipe to the layout you actually find: beliefs
(rationale), structure (what's built), felt experience, and history (decisions
and the Ledger). When unsure, grep the whole library root and note which
folders hit.

---

## Part 1: Search Doors

Five ways humans enter product conversations. Each door is a focused recipe: what to
search, in what order, what the human is probably missing. Pick the door that matches
the human's opening, run its sequence. If the question doesn't fit a door, skip to
Part 2 and use the general toolkit.

### How to Use

1. Read the human's opening message
2. Match it to a door (see signal phrases)
3. Run that door's search sequence — it replaces generic "find seed cards"
4. Answer the embedded questions at each search, don't just collect cards
5. The "What They're Probably Missing" section is your expansion mandate

If the conversation shifts doors mid-stream (common — a Feature Spot often becomes an
Implication Trace once the human decides to proceed), switch doors. No need to re-search
what you've already found.

---

### Door 1: Feature Spot

**Signal phrases:** "I want to add...", "What if we built...", "I'm thinking about...",
"Could we do...", "Users are asking for..."

**What the human has:** A specific feature idea or capability they want to add.

**What they're probably missing:** Whether it aligns with existing principles. What systems
it crosses. What experience it changes. What it might break.

**Search 1 — Neighborhood check.** Find what already exists near this idea.
```
Grep: "<feature topic>" path="docs/alexandria/product/"
```
Read the cards. Follow containment chains up (Component → Template → Section → Domain) to
understand where in the product this lives. Note what Systems and Capabilities are here.

**Search 2 — Principle alignment.** Check what the rationale layer believes about this area.
```
Grep: "<feature topic>" path="docs/alexandria/rationale/"
```
Also: read WHY sections of cards from Search 1. Follow `[[Principle -` and
`[[Product Thesis -` links. **Does this idea reinforce or contradict what we believe?**

**Search 3 — Experience impact.** Check what human experience this feature would touch.
```
Grep: "<feature topic>" path="docs/alexandria/experience/"
```
Look for Loops, Journeys, Experience Goals, Forces. **How does this change what the user feels?**

**Search 4 — Precedent check.** Has this been discussed or decided before?
```
Grep: "<feature topic>" path="docs/alexandria/temporal/"
Grep: "<feature topic>" path="docs/alexandria/ledger/events.jsonl"
```
Also check any recorded open questions. **New idea, revisited, or already in progress?**

**Search 5 — Blast radius.** For each System/Capability touched, check dependents.
```
Grep: "[[System - X]]" path="docs/alexandria/"
```
High reverse-link count = high blast radius. **What else changes if we build this?**

**Surface:** Principle tensions, experience layer gaps, blast radius findings, prior
decisions/contested claims, adjacent capabilities that already exist.

---

### Door 2: Pain Point

**Signal phrases:** "X isn't working", "Users are struggling with...", "We keep hearing
complaints about...", "This feels broken", "Why is X so hard?"

**What the human has:** A symptom — something that hurts but they may not know why.

**What they're probably missing:** Root cause. Whether this is local or structural. Whether
the library even has a theory about how this should work.

**Search 1 — Locate the symptom.** Find what the library says about the area that hurts.
```
Grep: "<pain area>" path="docs/alexandria/product/"
```
Read cards. Check HOW sections — specifically "What Breaks This" anti-patterns.
Does the symptom match a documented anti-pattern?

**Search 2 — Check demand signal.** Has this pain shown up before?
```
Grep: "<pain area>" path="docs/alexandria/ledger/events.jsonl"
```
Also check any recorded feedback or open questions the workspace keeps.
**Is this a known sore spot or a new discovery?**

**Search 3 — Trace upstream.** Follow WHY chains from the symptom cards.
```
Read WHY sections of cards from Search 1
Follow [[Principle - and [[Product Thesis - links
```
**Does this area have strategic grounding, or was it built ad-hoc?** Areas without
principle backing accumulate pain — no north star guiding fixes.

**Search 4 — Check the experience layer.** Is there a designed experience for this area?
```
Grep: "<pain area>" path="docs/alexandria/experience/"
```
Look for Loops, Journeys, Experience Goals. **Did we articulate how this should feel, or only
what it should do?** Pain often lives in the mechanics/feelings gap.

**Search 5 — Find the system boundary.** What Systems own this area?
```
Grep: "<pain area>" path="docs/alexandria/product/systems/"
```
Check their Forces references. **Is there an emergent behavior (alert fatigue, complexity
spiral) that matches the symptom?**

**Surface:** Anti-pattern matches, strategic grounding (present/absent), experience layer
coverage, known Forces, whether pain is local or structural, demand signal.

---

### Door 3: Decision Fork

**Signal phrases:** "Should we X or Y?", "We're debating whether to...", "I need to
decide between...", "What's the right approach for...?"

**What the human has:** Options. They see the choices but not the full implications.

**What they're probably missing:** What the library's principles favor. What each path
implies downstream. Whether this has been decided (or contested) before.

**Search 1 — Prior art.** Has this decision been made (or attempted) before?
```
Grep: "<decision topic>" path="docs/alexandria/temporal/"
Grep: "<decision topic>" path="docs/alexandria/ledger/events.jsonl"
```
**Are we re-litigating something, or is this genuinely new?**

**Search 2 — Principle filter.** What do our stated beliefs say about these options?
```
Grep: "<option A topic>" path="docs/alexandria/rationale/"
Grep: "<option B topic>" path="docs/alexandria/rationale/"
```
**Do our principles clearly favor one option, or is this a genuine tension?**

**Search 3 — Implication trace per option.** For each option, what does it touch?
```
Grep: "<option A topic>" path="docs/alexandria/product/"
Grep: "<option B topic>" path="docs/alexandria/product/"
```
Map affected cards. Count. Compare blast radius. **Which option has a bigger footprint?**

**Search 4 — Experience divergence.** How does each option change the user experience?
```
Grep: "<decision topic>" path="docs/alexandria/experience/"
```
**Does one option preserve a designed experience that the other disrupts?**

**Surface:** Prior decisions/contested claims, which principles each option aligns with
(and tensions), relative blast radius, experience implications, reversibility.

---

### Door 4: Area Audit

**Signal phrases:** "What do we know about...?", "How well have we thought through...?",
"Tell me about our...", "Walk me through...", "Audit our coverage of..."

**What the human has:** A domain to understand or assess.

**What they're probably missing:** Which layers are thin. How this area connects to the
rest of the product. Where confidence is high vs. low.

**Search 1 — Density scan.** How much does the library have?
```
Grep: "<area>" path="docs/alexandria/" output_mode="count"
```
Sets depth calibration (see Density-Aware Depth below). Note which subdirectories
have hits — previews layer coverage before reading.

**Search 2 — Layer-by-layer.** Run a quick four-layer sweep.
```
Grep: "<area>" path="docs/alexandria/rationale/"
Grep: "<area>" path="docs/alexandria/product/"
Grep: "<area>" path="docs/alexandria/experience/"
Grep: "<area>" path="docs/alexandria/temporal/"
```
Count per layer. **Which layers have coverage and which are empty?** Name the cross-layer
signal (see Cross-Layer Signals below).

**Search 3 — Read the cards.** For each layer with hits, focus on:
- Grades (WHEN sections or health reports) — strong vs. weak?
- Wikilinks — connected to the graph or island cards?
- HOW anti-patterns — what do we know about how this breaks?

**Search 4 — Demand signal.** What does recorded history say?
```
Grep: "<area>" path="docs/alexandria/ledger/events.jsonl"
```
**Frequently worked and referenced, or rarely touched? Outstanding gaps?**

**Search 5 — Comparative framing.** Pick 1-2 adjacent areas and repeat Search 1.
```
Grep: "<adjacent area>" path="docs/alexandria/" output_mode="count"
```
**Thin relative to importance, or thin because genuinely peripheral?**

**Surface:** Layer coverage map, cross-layer signal name, card quality assessment, demand
signal, relative depth vs. adjacent areas, recommendations for what to build next.

---

### Door 5: Signal Read

**Signal phrases:** "Our X metric is down", "Users aren't doing X", "We're losing
people at...", "Activation is low", "Retention is dropping"

**What the human has:** A data point or behavioral observation that worries them.

**What they're probably missing:** What product structures and experiences map to this
metric. Whether the area has strategic grounding. Whether the symptom is local or systemic.

**Search 1 — Map the journey.** Find the Journey or Loop for this metric.
```
Grep: "<metric area>" path="docs/alexandria/experience/"
```
Metrics map to journey moments. Activation → onboarding Journeys. Retention → engagement
Loops. **Do we have a designed experience for the moment this metric measures?**

**Search 2 — Find the mechanics.** What product structures serve this journey moment?
```
Grep: "<metric area>" path="docs/alexandria/product/"
```
Read Sections, Capabilities, Systems. **What have we built for this moment, and is it
connected to the experience-layer intent?**

**Search 3 — Check strategic grounding.** Does the rationale layer speak to this?
```
Grep: "<metric area>" path="docs/alexandria/rationale/"
```
Follow WHY chains. **Do we have beliefs about why this metric matters, or are we reacting
to a number without a theory?**

**Search 4 — Look for Forces.** Are there documented emergent behaviors?
```
Grep: "<metric area>" path="docs/alexandria/experience/forces/"
```
**Is there a known Force that could explain this signal?**

**Search 5 — Historical context.** Has this metric been discussed before?
```
Grep: "<metric area>" path="docs/alexandria/temporal/"
Grep: "<metric area>" path="docs/alexandria/ledger/events.jsonl"
```
**Have we tried to fix this before? Is it recurring?**

**Surface:** Journey/Loop mapping, product coverage, strategic grounding, Force matches,
gap between designed experience and actual mechanics, whether novel or recurring.

---

### Door-to-Archetype Mapping

Doors tell you WHERE TO SEARCH. Archetypes (in conversation-archetypes.md) tell you
HOW TO RESPOND. They complement each other:

| Door | Primary Archetype | Likely Transitions |
|------|-------------------|-------------------|
| Feature Spot | Pressure Test | → Implication Tracing (if proceeding) |
| Pain Point | Exploration | → Decision Fork (once cause is found) |
| Decision Fork | Pressure Test | → Implication Tracing (per option) |
| Area Audit | Gap Discovery | → Exploration (to go deep on findings) |
| Signal Read | PMF Assessment | → Pain Point (to trace root cause) |

---

## Part 2: Graph Reading Toolkit

General techniques used within door sequences and for expansion after the initial search.
Also the fallback strategy when a question doesn't match any door.

---

### Cross-Layer Signals

The most valuable product insights come from comparing layers. Watch for these patterns:

| Pattern | Layers | What It Means |
|---------|--------|---------------|
| **Strategy without structure** | Rationale dense, Product sparse | We have beliefs but haven't designed anything to act on them |
| **Structure without strategy** | Product dense, Rationale sparse | Solutions without articulated rationale — fragile to challenge |
| **Architecture without experience** | Product dense, Experience sparse | We know what to build but not how it should feel |
| **Experience without architecture** | Experience dense, Product sparse | We know how it should feel but haven't designed the mechanics |
| **Decided but unbuilt** | Temporal dense, Product sparse | Decisions made but never propagated into product vision |
| **Built but undecided** | Product dense, Temporal sparse | Designed without formal decisions — consensus may be phantom |
| **Full stack** | All layers populated, cross-linked | Healthy. Beliefs, designs, experience thinking, temporal grounding |
| **Total void** | All layers empty | The library has nothing here. Name it clearly |

When you spot a signal, name it in conversation: "We have detailed architecture for
notifications but no experience-layer cards — no Loops, no Experience Goals. We know *what*
to build but haven't thought about *how it should feel*."

---

### Density-Aware Depth

Pre-scan before diving. Quick check:
```
Grep: "<topic>" path="docs/alexandria/" output_mode="count"
```

| Density | Cards | Approach |
|---------|-------|----------|
| **Rich** | 8+ | Go deep. Follow wikilinks 2-3 hops. Cross-reference layers. Value is in connections and tensions. |
| **Moderate** | 3-7 | Standard depth. 1-2 hops. Note which layers represented vs. absent. |
| **Thin** | 1-2 | Go wide. What's *around* this topic? Thin coverage is itself a finding. |
| **Empty** | 0 | Stop traversing. Report the void. Shift to Tier 3 reasoning, flag it explicitly. |

---

### Reverse-Link Gravity

A card's importance correlates with how many other cards reference it.

```
Grep: "Card Name" path="docs/alexandria/" output_mode="count"
```

- **Pressure testing:** High-gravity cards are riskier to change
- **Implication tracing:** Start from high-gravity cards when mapping blast radius
- **Gap discovery:** Low-gravity cards in important areas = islands not integrated into graph

---

### Source Provenance Fast Path

When tracing the *origin* of a belief (not just what the library says but where it came
from):

1. Read the card's WHY section
2. Check `docs/alexandria/sources/` for original material (GDDs, research notes,
   memos)
3. Check Decision cards in temporal layer

Raven reads sources because humans asking "why do we believe this?" need
provenance — most retrieval skips them.

---

### Meta-Source Pre-Read

Before diving into graph traversal for any topic, check meta-sources — the record
around the cards, not the cards themselves.

**The Ledger** (`docs/alexandria/ledger/events.jsonl`):
What has happened — card work, rulings, play runs. Activity patterns are demand
signal; silence is too.

**Recorded open questions and contested claims** (wherever the workspace keeps
them — threads, agenda bundles, decision records):
Epistemic uncertainty around the topic.

Read these *before* traversing. A card looks different when you know its area has
been churning or that its core claim is contested.
