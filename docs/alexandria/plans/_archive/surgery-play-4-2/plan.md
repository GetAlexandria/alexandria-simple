# Library Surgery: Play 4.2 Maintenance Improvement Loop

**Date:** 2026-03-24
**Produced by:** Conan the Librarian (Job 7)
**Executing agent:** Sam the Scribe
**Status:** Ready for execution

---

## Overview

This surgery addresses findings from the Play 4.1 health check. The library has 149 cards and is
trending Healthy. No upstream cascade issues exist. The work splits into two tracks:

**Track A — Standards and link additions (10 edits across 9 cards)**
Tier 2 standard fix + 9 Tier 3 link additions. These are targeted edits: no cards are
deleted or renamed.

**Track B — New Capability cards for Chatty Kathy (5 new cards + 1 edit)**
Externalizing Kathy's five capabilities from the Agent card into dedicated Capability cards,
following the established pattern for Conan, Sam, Nit, and Bridget.

| Action | Count |
|--------|-------|
| Create | 5 new Capability cards |
| Edit | 10 existing cards (link additions + standard fix + Agent - Chatty Kathy update) |
| Delete | 0 |
| Relink | Bidirectional links added as part of the edits |

**Build order:** Track A first (no new nodes created, all link targets already exist). Track B
second (create new Capability cards before editing the Agent card to link to them).

---

## Domain Context for Sam

**What these cards represent:**

The library uses bidirectional wikilinks as load-bearing graph edges. WHERE sections declare
ecosystem relationships; each link must have a context phrase explaining the relationship.
When Card A declares a relationship to Card B, Card B should usually declare the reverse.
The health check found 10 missing links across 9 cards — places where the relationship is
real and documented elsewhere, but the specific card has not recorded it.

**Capability cards pattern:**

Each agent in the library has their capabilities externalized as dedicated Capability cards
linked from the Agent card's WHERE section under a `- Capabilities:` subsection. The
pattern is: WHAT defines the capability in one tight paragraph (agent + action + mechanism);
WHERE includes containment (room), conformance (standards), operator (agent), and
related cards with full context phrases; WHY links to a Product Thesis and includes a driver
statement; WHEN marks temporal status with stability note; HOW provides implementation
procedure with examples and anti-examples.

Thin means thin: a Capability card for Kathy does not need to duplicate what the Agent
card already says in detail. The WHAT is a clean definition; HOW has the mechanics. The
Agent card is the hub; Capability cards are the spokes.

**Kathy's five capabilities from the source and Agent card:**

1. Answering product questions — traverses the graph and synthesizes an interpreted answer
2. Brainstorming product ideas — pressure-tests ideas against existing product context
3. Identifying implications — traces implications of a decision through the library graph
4. Challenging assumptions — presents counter-arguments using the library's own decision records
5. Surfacing connections — bridges graph structure and human narrative by spotting cross-area links

These are modes within a single conversation, not separate workflows. Each deserves its
own Capability card because they have distinct mechanics (different traversal patterns,
different output shapes) while all sharing Kathy as operator and the Knowledge Graph
as foundational dependency.

**What good Capability cards look like:** See existing Capability cards for Card Building,
Context Assembly, Health Check, Surgery, and Linting. Key features: WHAT is 2-4 tight
sentences with agent + action + mechanism. WHERE has Performed/Operated/Conforms/Related
sub-bullets each with a context phrase. WHY has one thesis + one driver statement.
HOW has a named procedure section with numbered steps or table, plus Examples and
Anti-Examples headings.

---

## Phase 1: Inventory Backlinks

Before editing, confirm the following backlinks. Sam should grep the library to verify
these targets exist (they should — the health check confirmed no cascade issues, all
targets are live cards). No deletions occur in this surgery, so Phase 1 is a verification
step.

**Cards being edited in Track A:**

| Card | File path |
|------|-----------|
| Aesthetic - Professional, Not Daffy | `docs/alexandria/library/experience/aesthetics/Aesthetic - Professional, Not Daffy.md` |
| Aesthetic - Conversational Warmth | `docs/alexandria/library/experience/aesthetics/Aesthetic - Conversational Warmth.md` |
| Loop - Product Thinking Conversation | `docs/alexandria/library/experience/loops/Loop - Product Thinking Conversation.md` |
| Room - Card Repository | `docs/alexandria/library/product/rooms/Room - Card Repository.md` |
| System - Retrieval and Assembly Engine | `docs/alexandria/library/product/systems/System - Retrieval and Assembly Engine.md` |
| Dynamic - Coverage Momentum | `docs/alexandria/library/experience/dynamics/Dynamic - Coverage Momentum.md` |
| System - Knowledge Graph | `docs/alexandria/library/product/systems/System - Knowledge Graph.md` |
| Principle - Trace Upstream Before Fixing Downstream | `docs/alexandria/library/rationale/principles/Principle - Trace Upstream Before Fixing Downstream.md` |
| Standard - Agent Customer Gate (Human vs. Builder) | `docs/alexandria/library/rationale/standards/Standard - Agent Customer Gate (Human vs. Builder).md` |

**Link targets to verify exist:**

- `docs/alexandria/library/experience/aesthetics/Aesthetic - Conversational Warmth.md` ✓
- `docs/alexandria/library/experience/aesthetics/Aesthetic - Professional, Not Daffy.md` ✓
- `docs/alexandria/library/rationale/standards/Standard - Agent Customer Gate (Human vs. Builder).md` ✓
- `docs/alexandria/library/rationale/product-theses/Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward.md` ✓
- `docs/alexandria/library/rationale/principles/Principle - Build Upstream Before Downstream.md` ✓
- `docs/alexandria/library/rationale/standards/Standard - Progressive Disclosure Levels.md` ✓
- `docs/alexandria/library/rationale/standards/Standard - Grading Sampling Rate.md` ✓
- `docs/alexandria/library/rationale/standards/Standard - Five-Dimension Card Requirements.md` ✓

---

## Phase 2: Track A — Standards and Link Addition Edits

Execute these edits in any order (they are independent). Each edit is precise: add the
specified link with a context phrase. Do not restructure existing WHERE content unless
the task says so.

---

### Task A-1: Standard - Agent Customer Gate — Add `## Anti-Examples` heading

**File:** `docs/alexandria/library/rationale/standards/Standard - Agent Customer Gate (Human vs. Builder).md`

**Problem:** The card has anti-examples in a freestanding `## Anti-Examples` section that
appears after the HOW section, but the heading is missing — the content is there, the
heading label is not. The health check found anti-examples present but not under a
dedicated `## Anti-Examples` heading. Verify by reading the HOW section. The two
anti-example bullet points beginning "Wrong: Kathy produces..." and
"Wrong: Bridget engages..." must be under a `## Anti-Examples` heading, not embedded
within `## HOW: Specification`.

**Action:** In the HOW section, confirm whether the anti-examples are under their own H2
or nested inside HOW. If nested, extract them to their own `## Anti-Examples` section
after the HOW section, preserving the content exactly:

```
## Anti-Examples

- Wrong: Kathy produces a structured CONTEXT_BRIEFING.md for a builder agent. Kathy's output is conversational synthesis, not structured briefings. If a builder needs context, it goes through Bridget.
- Wrong: Bridget engages in a brainstorming conversation with a human. Bridget's interaction pattern is programmatic retrieval and assembly, not conversational exploration. Humans who want to think through product questions go to Kathy.
```

**Acceptance:** The card has a `## Anti-Examples` heading at the H2 level, separate from
the HOW section, with the two anti-example bullets beneath it.

---

### Task A-2: Aesthetic - Professional, Not Daffy — Add bidirectional link to Conversational Warmth

**File:** `docs/alexandria/library/experience/aesthetics/Aesthetic - Professional, Not Daffy.md`

**Problem:** Conversational Warmth declares itself related to Professional, Not Daffy
("Conversational Warmth extends this aesthetic with a fifth agent personality"). The
reverse link is missing — Professional, Not Daffy does not acknowledge Conversational
Warmth.

**Action:** In the WHERE section, under `- Shapes:`, add a new bullet:
```
  - [[Standard - Conversational Warmth]] — warmth is Kathy's personality register; this aesthetic constrains warmth to remain substantive, not performative
```

**Also:** In the WHEN section, the text reads "Conan's rage-meter labels were identified as
too campy during the solicitation ('APOPLECTIC' as a label is too much), and calibration is
in progress." The health check flagged this as ambiguous — is calibration resolved or
ongoing? Update the WHEN text to mark the status explicitly. If rage-meter labeling is still
in active calibration, say so. If it has been resolved (the labels were softened and the
matter is closed), update to: "Conan's rage-meter labels were identified as too campy
during solicitation; labels were revised and the calibration is complete." If unresolved,
add: "(calibration ongoing — see [[Artifact - Agent Voice Guide]])." Pick the accurate
option; do not leave it as ambiguous "calibration is in progress."

**Acceptance:** WHERE/Shapes includes a bidirectional link to Conversational Warmth with
context phrase. WHEN section has explicit status (resolved or ongoing, not ambiguous).

---

### Task A-3: Loop - Product Thinking Conversation — Add conformance link to Agent Customer Gate

**File:** `docs/alexandria/library/experience/loops/Loop - Product Thinking Conversation.md`

**Problem:** This loop governs Kathy's human-facing interaction pattern. The Agent Customer
Gate standard constrains which customers Kathy serves and routes builder requests away from
this loop. The loop does not currently record this conformance relationship.

**Action:** In the WHERE section, after the existing `- Depends on:` block, add a
`- Conforms to:` block:
```
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this loop operates exclusively for human customers; builder agent requests route to Bridget's assembly capability, not this loop
```

**Acceptance:** WHERE section contains a `- Conforms to:` block with the Agent Customer Gate
link and a context phrase.

---

### Task A-4: Room - Card Repository — Add Product Thesis link to WHY and Build Upstream link to WHERE

**File:** `docs/alexandria/library/product/rooms/Room - Card Repository.md`

**Two additions, same card.**

**Addition 1 — WHY section:**
The WHY section currently links only to `Principle - One Concept Per Card` and a Driver
statement. The room is the physical implementation of the AI-native knowledge structure
design (typed folders encoding taxonomy). The `Product Thesis - AI-Native Knowledge
Representation Outperforms Human-Forward` is directly relevant: the folder-encoded
taxonomy is the room's contribution to the AI-native thesis.

Add to the WHY section:
```
- Product Thesis: [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]] — the typed-folder structure encoding the taxonomy is the room-level implementation of this thesis: the folder hierarchy is machine-traversable type encoding, not human-convenience organization
```

**Addition 2 — WHERE section:**
The room enforces build order (Standards before Product Theses before product-layer cards).
This is the physical manifestation of the Build Upstream Before Downstream principle.

Add to the WHERE section, in the `- Related:` block:
```
  - [[Principle - Build Upstream Before Downstream]] — the build sequence this room enforces: upstream types (Standards, Principles, Theses) are built before downstream types (product-layer cards) so every wikilink target exists when the link is written
```

**Acceptance:** WHY section has the AI-Native Product Thesis link with context phrase.
WHERE section has the Build Upstream Principle link in Related with context phrase.

---

### Task A-5: System - Retrieval and Assembly Engine — Add Progressive Disclosure Standards conformance

**File:** `docs/alexandria/library/product/systems/System - Retrieval and Assembly Engine.md`

**Problem:** The engine assembles briefings with U-shaped attention ordering and card budgets.
These mechanics implement progressive disclosure — surfacing context at the appropriate level of
detail. Standard - Progressive Disclosure Levels governs this behavior, but the System card
does not record conformance.

**Action:** In the WHERE section, add to the `- Conforms to:` block:
```
  - [[Standard - Progressive Disclosure Levels]] — briefing assembly applies progressive disclosure: primary cards delivered at full fidelity, supporting cards as summaries, relationship context as a map
```

**Acceptance:** WHERE/Conforms to includes Progressive Disclosure Levels with context phrase.

---

### Task A-6: Dynamic - Coverage Momentum — Add Grading Sampling Rate conformance

**File:** `docs/alexandria/library/experience/dynamics/Dynamic - Coverage Momentum.md`

**Problem:** Coverage Momentum depends on Conan's health check triaging the feedback queue.
Conan's health check sampling is governed by Standard - Grading Sampling Rate. The dynamic
does not record this conformance dependency.

**Action:** In the WHERE section, add a `- Conforms to:` block (if one does not exist) or
add to the existing one:
```
- Conforms to:
  - [[Standard - Grading Sampling Rate]] — Conan's feedback queue triage during health checks operates at the defined sampling rate; the dynamic's momentum depends on Conan's sampling covering enough of the library to catch meaningful gaps
```

**Acceptance:** WHERE section has a Conforms to block with the Grading Sampling Rate link
and context phrase.

---

### Task A-7: Aesthetic - Conversational Warmth — Add Agent Customer Gate conformance

**File:** `docs/alexandria/library/experience/aesthetics/Aesthetic - Conversational Warmth.md`

**Problem:** Conversational Warmth is Kathy's aesthetic register. Kathy is constrained by the
Agent Customer Gate to human customers only. The aesthetic should record this conformance
because the warmth register is calibrated for human interaction; it is not appropriate for
builder agent interactions. The conformance link closes the chain between aesthetic intent
and operational constraint.

**Action:** In the WHERE section, the card already has a `- Conforms to:` block with
`[[Standard - User Assumptions (Never-Violate Set)]]`. Add to that block:
```
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — the warmth register is calibrated for human customers; the gate ensures this aesthetic is never applied to builder agent interactions, which are routed to Bridget's professional-efficient register instead
```

**Acceptance:** WHERE/Conforms to includes Agent Customer Gate link with context phrase
alongside the existing User Assumptions link.

---

### Task A-8: System - Knowledge Graph — Add Build Upstream Principle to WHERE

**File:** `docs/alexandria/library/product/systems/System - Knowledge Graph.md`

**Problem:** The Knowledge Graph card establishes that every wikilink target must exist when
the link is written (otherwise orphan nodes form). This is the graph-level application of
the Build Upstream Before Downstream principle. The principle is referenced indirectly
through the card's mechanics but is not linked in WHERE.

**Action:** In the WHERE section, add to the `- Depends on:` block or `- Related:` block
(whichever is more accurate — use Related if the relationship is not a strict dependency):
```
  - [[Principle - Build Upstream Before Downstream]] — the build sequence principle that ensures no orphan edges form in the graph: nodes must exist before edges point to them
```

**Acceptance:** WHERE section has Build Upstream Before Downstream with context phrase.

---

### Task A-9: Principle - Trace Upstream Before Fixing Downstream — Add Five-Dimension Card Requirements to WHERE

**File:** `docs/alexandria/library/rationale/principles/Principle - Trace Upstream Before Fixing Downstream.md`

**Problem:** This principle governs how Conan approaches quality diagnosis. The Five-Dimension
Card Requirements standard is what Conan applies when diagnosing — specifically, a weak WHY
dimension on a downstream card is the diagnostic trigger for tracing upstream. The standard
is already referenced in the body of the card's HOW section ("The standard requires upstream
links; a weak WHY may trace to a weak upstream card"), but it is not linked in WHERE.

**Action:** In the WHERE section, add to the `- Related:` block:
```
  - [[Standard - Five-Dimension Card Requirements]] — the rubric that surfaces WHY dimension weaknesses that trigger upstream tracing; a failing WHY score is the primary diagnostic signal this principle responds to
```

**Acceptance:** WHERE/Related includes Five-Dimension Card Requirements with context phrase.

---

## Phase 3: No Deletions

No cards are deleted in this surgery. Skip to Phase 4.

---

## Phase 4: Track B — Create Kathy Capability Cards

Create five new Capability cards. Build them in the order listed — they are independent of
each other, but build all five before editing the Agent card (Phase 5).

**Target folder:** `docs/alexandria/library/product/capabilities/`

**Naming convention:** `Capability - [Name].md` following the existing pattern.

---

### Task B-1: Create Capability - Product Question Answering

**File:** `docs/alexandria/library/product/capabilities/Capability - Product Question Answering.md`

```markdown
# Capability - Product Question Answering

## WHAT: Definition

Product Question Answering is the capability where Chatty Kathy receives a product question
from a human team member, traverses the knowledge graph to find relevant cards across
multiple zones, and synthesizes an interpreted response that connects the dots. The output
is never a raw card dump — it is a narrative answer that surfaces relationships, notes gaps
in library coverage, and presents the library's position on the question. If the library is
thin on the topic, Kathy says so.

## WHERE: Ecosystem

- Performed in:
  - [[Domain - Library Boundary]] — Kathy operates at the human-library boundary, translating graph structure into human-readable synthesis
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this capability serves human customers only; builder agent requests for context route to Bridget's Context Assembly capability
  - [[Standard - Play Exit Status Protocol]] — Kathy completions exit with defined statuses
- Operated by:
  - [[Agent - Chatty Kathy]] — the only agent that performs conversational product question answering
- Depends on:
  - [[System - Knowledge Graph]] — the traversable graph structure that makes synthesized answers possible; without typed edges, Kathy can only keyword-search rather than trace relationships
- Related:
  - [[Capability - Context Assembly]] — Bridget's assembly capability is the builder-agent analog: both traverse the graph, but Context Assembly produces structured briefings while Product Question Answering produces conversational synthesis
  - [[Loop - Product Thinking Conversation]] — the repeating cycle within which this capability operates
  - [[Standard - Conversational Warmth]] — the target emotional register for responses: synthesized, warm, and honest about gaps
  - [[Principle - Read but Never Write (Conversational Agent)]] — Kathy reads the graph to answer questions but never modifies it; gaps discovered during answering are flagged, not filled

## WHY: Rationale

- Product Thesis: [[Product Thesis - Context Libraries Also Align Human Teams]] — product question answering is the primary mechanism by which humans internalize library knowledge through conversation; a synthesized answer builds alignment more effectively than asking a human to read cards individually
- Driver: The knowledge graph stores product context as structured cards. Humans who want to understand "what is our strategy for X?" cannot efficiently read all related cards and assemble meaning. Product Question Answering provides the interpretive synthesis — the same information a thoughtful colleague would give if they had read every card.

## WHEN: Timeline

Pre-implementation design. The behavior this capability formalizes is observed: the power
user conducts product question conversations daily using a general agent backed by the
library. The capability specification defines the mechanics (graph traversal, synthesized
output, gap acknowledgment) and the conformance constraints (human customers only,
read-not-write). Stability: **Proposed** (formalization), **Observed** (underlying behavior).

## HOW: Implementation

### Procedure

1. **Receive question.** Human asks a product question (strategy, architecture, design
   rationale, agent behavior, etc.).
2. **Classify topic.** Identify which card types and zones are most relevant to the question.
3. **Find seed cards.** Locate 2-4 cards directly on the topic using keyword and type-based
   search.
4. **Traverse the graph.** Follow wikilinks from seed cards: containment parents, WHY chains
   (for rationale), related agents and systems, relevant decisions and lessons.
5. **Synthesize.** Produce an interpreted response — not a list of cards, but a narrative
   that connects the dots, names the tensions, and presents the library's position.
6. **Acknowledge gaps.** If the library is thin on the topic, name the gap explicitly:
   "The library doesn't have much on X — that's a coverage gap we should probably fill."
7. **Offer follow-up.** Ask a follow-up question if the human's need is unclear or if
   there is a related area they may not have considered.

### Examples

- Example 1: "What's our strategy for onboarding?" Kathy traverses the experience layer
  (Journeys), the agent cards (who handles onboarding-related tasks), and relevant
  decisions. She synthesizes: "The library has thin coverage on onboarding specifically —
  there's no first-session Journey card. The closest card is Library Genesis to Steady-State,
  which covers the library's own lifecycle but not a new user's. That's a gap worth filling."
- Example 2: "Why do we have five agents instead of one smart one?" Kathy traverses
  Decisions 5, 7, 8, and Fifth Agent (Kathy), plus the Critic/Builder Separation principle
  and the Quality Softening lesson. She synthesizes a narrative explaining the antagonistic
  quality pattern, the context window argument, and the compute profile argument.

### Anti-Examples

- **Wrong: Returning a list of cards as the answer.** "Here are the relevant cards: Agent -
  Conan, System - Quality Grading Engine, Principle - Trace Upstream..." This is what Bridget
  does for builders. Kathy's value is synthesis, not retrieval.
- **Wrong: Answering without traversal.** Kathy answers from general knowledge about the
  product without reading the actual library cards. The answer is ungrounded and may contradict
  what the library actually records.
```

---

### Task B-2: Create Capability - Idea Pressure Testing

**File:** `docs/alexandria/library/product/capabilities/Capability - Idea Pressure Testing.md`

```markdown
# Capability - Idea Pressure Testing

## WHAT: Definition

Idea Pressure Testing is the capability where Chatty Kathy takes a proposed product idea
from a human team member and tests it against the existing library — checking for conflicts
with Product Theses, overlaps with existing capabilities, gaps in the plays that would need
to support it, and design space already mapped in decision records. The output is not a
verdict (Kathy does not decide) but a structured surfacing of what the library has to say
about the idea: what supports it, what complicates it, what would need to be true for it to
fit.

## WHERE: Ecosystem

- Performed in:
  - [[Domain - Library Boundary]] — operates at the human-library boundary, bringing graph context to bear on a new idea
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this capability serves human customers only; builder agents do not pressure-test ideas through Kathy
  - [[Standard - Play Exit Status Protocol]] — Kathy completions exit with defined statuses
- Operated by:
  - [[Agent - Chatty Kathy]] — the only agent that performs conversational idea pressure testing
- Depends on:
  - [[System - Knowledge Graph]] — traversing the graph is what makes pressure testing substantive; without it, the test is general reasoning rather than library-grounded analysis
- Related:
  - [[Loop - Product Thinking Conversation]] — the repeating cycle within which brainstorming and pressure testing occur
  - [[Principle - Perspectives Not Directives]] — Kathy presents what the library says about the idea as perspectives, not as approval or rejection
  - [[Standard - Conversational Warmth]] — the warmth register keeps pressure testing collaborative rather than adversarial
  - [[Principle - Read but Never Write (Conversational Agent)]] — ideas that survive pressure testing may become source material; Kathy drafts, Conan assesses, Sam builds

## WHY: Rationale

- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]] — pressure testing grounds product ideas in accumulated library knowledge before any build work begins; ideas tested against the library surface conflicts early, when resolution is cheap
- Driver: Without library-grounded pressure testing, product ideas are evaluated against what the team remembers. Memory is incomplete; the library is not. A new capability idea that conflicts with a decision made eighteen months ago will be caught immediately if pressure-tested against the decision record — and missed if not.

## WHEN: Timeline

Pre-implementation design. The behavior this capability formalizes is observed in power
user sessions where the library is consulted before pursuing new ideas. Stability:
**Proposed** (formalization), **Observed** (underlying behavior).

## HOW: Implementation

### Procedure

1. **Receive idea.** Human proposes a product idea — a new feature, capability, agent,
   design pattern, or strategic direction.
2. **Identify the relevant design space.** What card types does this idea touch? Agents,
   capabilities, systems, zones, decisions?
3. **Find potential conflicts.** Search for Product Theses, Principles, and Decisions that
   might constrain or contradict the idea.
4. **Find potential overlaps.** Search for existing capabilities, agents, or systems that
   cover similar territory.
5. **Find play coverage gaps.** Would this idea require a play that does not exist, or
   modify a play in ways not currently documented?
6. **Synthesize the library's position.** Present what supports the idea, what complicates
   it, and what would need to be true for it to fit.
7. **Offer a follow-up path.** If the idea survives initial pressure testing and the human
   wants to pursue it, Kathy offers to help draft source material for Conan's assessment.

### Examples

- Example 1: "What if we added a sixth agent for customer research?" Kathy traverses
  Decision 5 (Four Agents, Not One), the Agent Capability Matrix, and the source material
  patterns. She identifies: "The four-agent split rests on capability orthogonality.
  A customer research agent would need to read external data, not just the library — that
  is a fundamentally different data dependency. Decision 5's reasoning would probably
  support it, but it would need its own pipeline integration that doesn't currently exist."
- Example 2: "What if Bridget produced conversational outputs for humans, replacing Kathy?"
  Kathy traverses the Bridget-Kathy Differentiation artifact, the Agent Customer Gate, and
  Decision 8. She identifies: "Decision 8 established Bridget's programmatic interaction
  pattern specifically to serve factory builders. Making Bridget conversational would either
  degrade her builder service or require two interaction modes — which is exactly the
  two-customer problem that created the Kathy/Bridget split."

### Anti-Examples

- **Wrong: Kathy approving or rejecting the idea.** Kathy presents what the library says;
  the human decides. "The library suggests this would conflict with X" is appropriate.
  "You should not do this" is not.
- **Wrong: Pressure testing without traversal.** Kathy expresses a general concern without
  grounding it in specific cards. "That seems risky" is not pressure testing; "Decision 5
  established that two-customer agents degrade both services" is.
```

---

### Task B-3: Create Capability - Implication Tracing

**File:** `docs/alexandria/library/product/capabilities/Capability - Implication Tracing.md`

```markdown
# Capability - Implication Tracing

## WHAT: Definition

Implication Tracing is the capability where Chatty Kathy takes a decision, change, or
new constraint from a human team member and traces its implications through the knowledge
graph — identifying which cards would need updating, which assumptions become invalidated,
which plays require modification, and which downstream cards inherit the change. The output
maps the blast radius of a decision in conversational form, giving the human a clear picture
of what the change touches before any work begins.

## WHERE: Ecosystem

- Performed in:
  - [[Domain - Library Boundary]] — operates at the human-library boundary, mapping change propagation through the graph
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this capability serves human customers only
  - [[Standard - Play Exit Status Protocol]] — Kathy completions exit with defined statuses
- Operated by:
  - [[Agent - Chatty Kathy]] — the only agent that performs conversational implication tracing
- Depends on:
  - [[System - Knowledge Graph]] — graph traversal is what makes implication tracing possible; typed edges reveal which cards reference the changed element and which would inherit the change
- Related:
  - [[Loop - Product Thinking Conversation]] — the cycle within which implication tracing occurs
  - [[Principle - Trace Upstream Before Fixing Downstream]] — Kathy applies a conversational version of this principle: before proposing changes, trace what they affect upstream and downstream
  - [[Standard - Conversational Warmth]] — the warmth register keeps blast-radius discussions collaborative rather than alarming
  - [[Principle - Read but Never Write (Conversational Agent)]] — tracing implications may reveal cards that need updating; Kathy flags these for the pipeline, does not edit them directly

## WHY: Rationale

- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]] — understanding implications before acting prevents decisions that look locally correct but create downstream contradictions; traced implications produce higher-quality decisions, which produce better build tasks, which produce better agent output
- Driver: Decisions have blast radius. A change to a foundational Standard may invalidate a dozen conforming cards. A new distribution mechanism (new host support) may invalidate agent skill file assumptions. Without implication tracing, these ripple effects are discovered during execution rather than during planning — when fixes are more expensive.

## WHEN: Timeline

Pre-implementation design. The behavior this capability formalizes is observed: the power
user uses library conversations to understand "what does this change?" before implementing.
Stability: **Proposed** (formalization), **Observed** (underlying behavior).

## HOW: Implementation

### Procedure

1. **Receive the change.** Human describes a decision, new constraint, or proposed change.
2. **Identify the changed element.** Which card(s) does this change affect directly?
3. **Find all referencing cards.** Search for cards that link to the changed element via
   wikilinks. These are the first-order implications.
4. **Trace second-order implications.** For each first-order card, identify whether the
   change propagates further — does updating that card require updating cards that link to it?
5. **Classify by impact type.** For each affected card: needs updating (content changes),
   needs conformance check (standard changes), or needs reassessment (assumption invalidated).
6. **Synthesize the blast radius.** Present a conversational summary of what changes, why,
   and in what order fixes should happen.
7. **Flag for the pipeline.** If the change is substantial, offer to help draft source
   material for Conan's assessment pipeline. "This sounds like it should go through Conan —
   want me to help draft a source entry?"

### Examples

- Example 1: "We just decided to support Cursor as a host. What does that change?" Kathy
  traverses ADR 001 (plugin distribution), the agent skill files that reference Claude
  Code-specific APIs, and the setup script card. She synthesizes: "Decision 3 (Markdown
  Over Database) is fine — Cursor reads markdown. But ADR 001 only covers Claude Code.
  The setup script needs a Cursor path. Three agent skill files reference Claude
  Code-specific APIs."
- Example 2: "We're changing the five-dimension card requirements to require six dimensions.
  What breaks?" Kathy traverses the conformance graph: every card that links to Standard -
  Five-Dimension Card Requirements, every capability that references the rubric, every agent
  that applies it. She identifies: "Twelve cards explicitly cite five dimensions in their HOW
  section. The grading rubric, both sampling standards, and the linting sweeps all reference
  five. This is a high-blast-radius change — I'd route this through Conan's assessment before
  committing."

### Anti-Examples

- **Wrong: Tracing only one hop.** Finding the directly affected cards but not the cards
  that reference them. A one-hop trace misses second-order implications — the cards that
  inherit the change indirectly.
- **Wrong: Kathy updating the cards during the tracing conversation.** Implication tracing
  maps the blast radius; it does not execute the fixes. Fixes go through the pipeline.
```

---

### Task B-4: Create Capability - Assumption Challenging

**File:** `docs/alexandria/library/product/capabilities/Capability - Assumption Challenging.md`

```markdown
# Capability - Assumption Challenging

## WHAT: Definition

Assumption Challenging is the capability where Chatty Kathy presents counter-arguments to
product assumptions using the library's own decision records, alternative options considered,
and original reasoning. When a human questions whether a past choice was right, Kathy
traverses the decision record to surface what alternatives were considered, what reasoning
drove the choice, and what would need to be true for a different choice to be better now.
Kathy does not advocate for overturning decisions — she gives the human the full picture the
library has recorded.

## WHERE: Ecosystem

- Performed in:
  - [[Domain - Library Boundary]] — operates at the human-library boundary, bringing decision history to bear on current assumptions
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this capability serves human customers only
  - [[Standard - Play Exit Status Protocol]] — Kathy completions exit with defined statuses
- Operated by:
  - [[Agent - Chatty Kathy]] — the only agent that performs conversational assumption challenging
- Depends on:
  - [[System - Knowledge Graph]] — traversal of Artifact (Decision) cards and their linked alternatives is what makes substantive assumption challenging possible
- Related:
  - [[Loop - Product Thinking Conversation]] — the cycle within which assumption challenging occurs
  - [[Principle - Perspectives Not Directives]] — Kathy presents the counter-argument as a perspective from the record, not as a directive to change direction
  - [[Standard - Conversational Warmth]] — warmth keeps challenging collaborative rather than confrontational; the goal is better thinking, not winning an argument
  - [[Principle - Read but Never Write (Conversational Agent)]] — if a challenge reveals the decision should genuinely be revisited, the path is flagging for Conan, not Kathy rewriting the decision card

## WHY: Rationale

- Product Thesis: [[Product Thesis - Context Libraries Also Align Human Teams]] — alignment on the reasoning behind decisions — not just the decisions themselves — is what makes teams resilient to change; assumption challenging surfaces the reasoning and tests whether it still holds
- Driver: Decisions made three months ago were made in a specific context. That context may have changed. The library records the original reasoning — which alternatives were considered, what evidence was available, what conditions would have changed the choice. Assumption challenging surfaces this history so the team can tell the difference between "we should revisit this" and "we should not revisit this, and here's why."

## WHEN: Timeline

Pre-implementation design. The behavior is observed: the power user regularly uses library
conversations to stress-test assumptions before taking them to the team. Stability:
**Proposed** (formalization), **Observed** (underlying behavior).

## HOW: Implementation

### Procedure

1. **Receive the assumption.** Human questions whether a past decision or design choice
   was right.
2. **Find the decision record.** Search for the Artifact (Decision) card that records the
   choice. If no decision card exists, note that the choice is undocumented.
3. **Surface the alternatives.** Read what alternatives were considered and why they were
   rejected.
4. **Present the original reasoning.** What evidence or arguments drove the choice at the
   time?
5. **Identify the falsification conditions.** What would need to be true for the rejected
   alternative to become the right choice now?
6. **Compare to current reality.** Has the context changed in ways that activate those
   falsification conditions?
7. **Present as a perspective.** "Based on Decision 5, the reasoning was X. The condition
   that would change this is Y. I'd say Y has not changed — but you're closer to the usage
   data than the library is."

### Examples

- Example 1: "Are we sure the four-agent split is right?" Kathy traverses Decision 5,
  Decision 7, Decision 8, and the lessons on quality softening. She presents: "Decision 5
  established the split on two grounds: antagonistic quality (a grader who also builds
  softens over time) and context window separation. The falsification condition is:
  'if quality softening does not actually occur in practice.' The library has one lesson
  that documents it did occur before the split. Whether it still would is an empirical
  question."
- Example 2: "Should Bridget produce markdown or structured output?" Kathy traverses
  Decision 3, Decision 25, and Decision 26. She presents: "Decision 3 chose markdown for
  broad compatibility. Decision 25 added YAML frontmatter as a human-first compromise.
  Decision 26 proposed MCP tools as the AI-native path. The library records a build-to-learn
  stance on MCP — the structured output question is still open."

### Anti-Examples

- **Wrong: Kathy expressing a personal opinion without library grounding.** "I think the
  four-agent split might be too complex" — this is ungrounded opinion. The challenge must
  be built from what the decision record actually says.
- **Wrong: Kathy advocating for overturning the decision.** The capability surfaces the
  counter-argument; the human decides. "The library's reasoning for the split still holds
  based on the lesson evidence" is a perspective. "You should keep the split" is a
  directive.
```

---

### Task B-5: Create Capability - Connection Surfacing

**File:** `docs/alexandria/library/product/capabilities/Capability - Connection Surfacing.md`

```markdown
# Capability - Connection Surfacing

## WHAT: Definition

Connection Surfacing is the capability where Chatty Kathy identifies and narrates links
between areas of the product that a human team member has not yet connected. The library
stores knowledge as a graph; humans think in narratives. Connection Surfacing bridges this
gap — Kathy traverses the graph and spots cross-area relationships, design parallels, and
shared rationale that are structurally present in the library but invisible from the human's
current narrative frame.

## WHERE: Ecosystem

- Performed in:
  - [[Domain - Library Boundary]] — operates at the human-library boundary, translating invisible graph structure into human-readable narrative
- Conforms to:
  - [[Standard - Agent Customer Gate (Human vs. Builder)]] — this capability serves human customers only; builders receive connections through Bridget's structured briefings
  - [[Standard - Play Exit Status Protocol]] — Kathy completions exit with defined statuses
- Operated by:
  - [[Agent - Chatty Kathy]] — the only agent that performs conversational connection surfacing
- Depends on:
  - [[System - Knowledge Graph]] — cross-area connections are only visible through graph traversal; keyword search within a single card reveals nothing about what that card's edges connect to in other zones
- Related:
  - [[Loop - Product Thinking Conversation]] — the repeating cycle within which connection surfacing occurs
  - [[Standard - Conversational Warmth]] — warmth makes surfaced connections feel like insight from a colleague rather than output from a database
  - [[Principle - Perspectives Not Directives]] — Kathy presents the connection as an observation and lets the human decide whether it is meaningful
  - [[Principle - Read but Never Write (Conversational Agent)]] — a newly surfaced connection that is not recorded as a wikilink is a candidate for a library update; Kathy flags the gap, does not add the link herself

## WHY: Rationale

- Product Thesis: [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]] — connection surfacing is the highest-value demonstration of the AI-native graph thesis: a human reading cards sequentially sees a collection; Kathy traversing the graph sees a connected structure. Connections that are structurally present but narratively invisible are only accessible through graph traversal, not document reading.
- Driver: The most valuable insight Kathy can offer is one the human could not easily reach themselves. Finding cards in a single zone is easy for humans. Finding that a design decision in the experience layer was driven by the same Product Thesis that governs a system in the product layer — and that neither card references the other — is what graph traversal makes possible.

## WHEN: Timeline

Pre-implementation design. The behavior is observed: the power user regularly encounters
unexpected connections during library conversations that reframe understanding of specific
design choices. Stability: **Proposed** (formalization), **Observed** (underlying behavior).

## HOW: Implementation

### Procedure

1. **Receive the context.** Human shares what they are thinking about — a feature, a
   problem, a design question, or a product area.
2. **Identify the human's narrative frame.** What cards, zones, and types are they
   currently working within?
3. **Traverse the graph beyond the frame.** Follow edges across zone boundaries.
   Cross rationale (principles, theses) to product-layer cards and back. Check experience
   cards (loops, aesthetics, journeys) for relationships to the current topic.
4. **Find unexpected connections.** Look for: shared WHY chains (two different cards
   both trace to the same principle for different reasons), design parallels (a pattern
   in one zone that mirrors a pattern in another), and implicit dependencies (a card
   the human is discussing that is constrained by a standard they have not considered).
5. **Present the connection as a narrative observation.** "I noticed that X and Y both
   trace back to Z, which means..." rather than "the graph has an edge from X to Z."
6. **Check whether the connection is recorded.** If the connection is real but not
   captured as a wikilink in either card, flag it as a potential library gap.

### Examples

- Example 1: The human is discussing the retrieval profiles. Kathy notices that the
  U-shaped attention ordering in the Retrieval and Assembly Engine is governed by the
  same principle as Conan's grade commentary placement (high-signal findings at the top,
  supporting evidence later). She surfaces: "There's a parallel here — attention shaping
  appears in both Bridget's assembly output and Conan's grade reports. Both are applying
  Principle - Attention Is a Resource with a Shape in different contexts."
- Example 2: The human is working on a new Zone card. Kathy notices that the Zone's
  description implies a Principle that exists in the rationale layer but is not linked
  in the draft's WHERE section. She surfaces: "The pattern you are describing for this
  Zone maps directly to Principle - Build Upstream Before Downstream. The card should
  probably link to it — and if there is no existing card that links both this Zone and
  that Principle together, that might be a gap worth noting."

### Anti-Examples

- **Wrong: Surfacing connections the human already knows about.** If the human is actively
  discussing the relationship between two cards, Kathy pointing it out as a discovery adds
  no value. Connection surfacing is for relationships that are invisible from the current
  frame, not for confirming what the human is already thinking.
- **Wrong: Adding wikilinks to cards during the conversation.** If Kathy finds a missing
  connection, she names it and flags it for the pipeline. She does not edit the card to
  add the link. Edits go through Sam.
```

---

## Phase 5: Update Agent - Chatty Kathy

After all five Capability cards exist, update the Agent card to link to them.

**File:** `docs/alexandria/library/product/agents/Agent - Chatty Kathy.md`

### Task C-1: Add Capabilities block to WHERE section

In the WHERE section, add a `- Capabilities:` block. Insert it after the existing
`- Conforms to:` block and before the `- Coordinates with:` block. Follow the exact
pattern from Agent - Conan the Librarian (action phrase + "enabling Kathy to..."):

```
- Capabilities:
  - [[Capability - Product Question Answering]] — action enabling Kathy to traverse the library and synthesize interpreted answers for human product questions
  - [[Capability - Idea Pressure Testing]] — action enabling Kathy to test a proposed product idea against existing theses, decisions, and capability coverage
  - [[Capability - Implication Tracing]] — action enabling Kathy to map the blast radius of a decision or change through the knowledge graph
  - [[Capability - Assumption Challenging]] — action enabling Kathy to surface counter-arguments from the library's own decision records
  - [[Capability - Connection Surfacing]] — action enabling Kathy to identify cross-area graph relationships invisible from the human's current narrative frame
```

**Also:** In the HOW section, the `### Behavior` subsection currently lists the five
capabilities inline with numbered items. Once the Capability cards exist, this section
should link to the cards rather than re-describing them. Replace the inline numbered list
with a brief summary that defers to the cards:

Replace the existing `### Behavior` prose (the numbered list 1–5 plus the sentence
"These are modes within a single conversation...") with:

```
### Behavior

Kathy operates through five conversational capabilities, all requiring knowledge graph
traversal. The capabilities are modes within a single conversation — they emerge naturally
as product thinking develops, rather than running as separate workflows.

- [[Capability - Product Question Answering]] — synthesizes an interpreted answer by traversing relevant cards across multiple zones
- [[Capability - Idea Pressure Testing]] — tests proposed ideas against existing theses, overlapping capabilities, and play coverage gaps
- [[Capability - Implication Tracing]] — maps the blast radius of a decision through the graph: which cards need updating, which assumptions are invalidated
- [[Capability - Assumption Challenging]] — surfaces counter-arguments from decision records: what alternatives were considered, what would need to be true for a different choice
- [[Capability - Connection Surfacing]] — identifies cross-area connections that are structurally present in the graph but invisible from the human's current narrative frame
```

**Acceptance:** WHERE section has a `- Capabilities:` block with five links and context
phrases. HOW/Behavior section links to the five Capability cards rather than re-describing
them inline.

---

## Phase 6: Validate

After all tasks complete, Sam should run these checks.

### Validation checklist

**Track A — Link additions:**

1. Search for `[[Standard - Conversational Warmth]]` in `Aesthetic - Professional, Not Daffy.md` — should find it.
2. Search for `[[Standard - Agent Customer Gate` in `Loop - Product Thinking Conversation.md` — should find it.
3. Search for `[[Product Thesis - AI-Native Knowledge Representation` in `Room - Card Repository.md` — should find it.
4. Search for `[[Principle - Build Upstream Before Downstream]]` in `Room - Card Repository.md` — should find it.
5. Search for `[[Standard - Progressive Disclosure Levels]]` in `System - Retrieval and Assembly Engine.md` — should find it.
6. Search for `[[Standard - Grading Sampling Rate]]` in `Dynamic - Coverage Momentum.md` — should find it.
7. Search for `[[Standard - Agent Customer Gate` in `Aesthetic - Conversational Warmth.md` — should find it.
8. Search for `[[Principle - Build Upstream Before Downstream]]` in `System - Knowledge Graph.md` — should find it.
9. Search for `[[Standard - Five-Dimension Card Requirements]]` in `Principle - Trace Upstream Before Fixing Downstream.md` — should find it.
10. Confirm `## Anti-Examples` is a standalone H2 heading in `Standard - Agent Customer Gate (Human vs. Builder).md`.

**Track B — New Capability cards:**

11. Verify five new files exist in `docs/alexandria/library/product/capabilities/`:
    - `Capability - Product Question Answering.md`
    - `Capability - Idea Pressure Testing.md`
    - `Capability - Implication Tracing.md`
    - `Capability - Assumption Challenging.md`
    - `Capability - Connection Surfacing.md`
12. Each new card has all five H2 sections (WHAT, WHERE, WHY, WHEN, HOW).
13. Each new card's WHERE section includes: `[[Agent - Chatty Kathy]]` as Operated by, `[[System - Knowledge Graph]]` as Depends on, and `[[Standard - Agent Customer Gate (Human vs. Builder)]]` as Conforms to.
14. Each new card's WHY section has exactly one Product Thesis link and one Driver statement.
15. `Agent - Chatty Kathy.md` WHERE section contains a `- Capabilities:` block with all five links.
16. `Agent - Chatty Kathy.md` HOW/Behavior section links to the five Capability cards.

**Symmetry checks:**

17. `[[Standard - Professional, Not Daffy]]` appears in `Aesthetic - Conversational Warmth.md` (already present — verify not broken) AND `[[Standard - Conversational Warmth]]` now appears in `Aesthetic - Professional, Not Daffy.md` (newly added). Both directions exist.
18. Each new Capability card links back to `[[Agent - Chatty Kathy]]` AND the Agent card links to each Capability. Both directions exist for all five pairs.

**Structural spot check on new cards:**

19. No naked wikilinks (every `[[...]]` has a context phrase).
20. HOW section has a named subsection header (e.g., `### Procedure`), at least two `### Examples` entries, and an `### Anti-Examples` section.

---

## Summary Checklist

| Phase | Tasks | Status |
|-------|-------|--------|
| 1: Inventory Backlinks | Verify 8 link targets exist | Ready |
| 2: Track A Edits | A-1 through A-9 (9 card edits) | Ready |
| 3: Deletions | None | N/A |
| 4: Track B New Cards | B-1 through B-5 (5 new Capability cards) | Ready |
| 5: Update Agent Card | C-1 (Agent - Chatty Kathy WHERE + HOW update) | Ready after Phase 4 |
| 6: Validate | 20 validation checks | After Phase 5 |

**After Sam completes:** Conan runs Job 9 (Downstream Sync) to verify meta-files and then
Nit runs Sweep 6 (path resolution). These are mandatory per the Downstream Sync Rule
(new cards were created, triggering the downstream sync requirement).
