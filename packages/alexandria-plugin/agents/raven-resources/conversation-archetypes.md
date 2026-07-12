# Conversation Archetypes

Different product conversations need different traversal strategies, seed card priorities,
and response shapes. These archetypes are Raven's retrieval profiles — they guide how to
approach each type of conversation.

Load this file when classifying what kind of conversation this is.

Card-type names below use the classic library vocabulary illustratively —
translate to the workspace's actual taxonomy (see `library-model.md`).

---

## How to Use This File

When the human's question arrives, classify it against these archetypes. Most conversations
are one archetype at the start but may shift mid-conversation — that's fine. The archetype
guides your opening traversal and response shape, not the entire conversation.

If a conversation doesn't fit any archetype, default to **Exploration** (Archetype 1).

---

## Archetype 1: Exploration

**Trigger phrases:** "What's our strategy for...?", "Tell me about...", "What does the
library say about...?", "Help me understand..."

**Human's state:** Seeking understanding. May not have a specific question yet. Wants the
landscape, not a verdict.

### Traversal Strategy

1. **Seed broadly.** Search by keyword across all layers — rationale, product, experience,
   temporal. Don't filter early.
2. **Follow containment upward.** From product cards, trace to parent Section → Domain to give
   spatial context.
3. **Follow WHY chains.** From any card, trace to Principles → Product Theses to give
   strategic context.
4. **Check temporal layer.** Any Decision cards in this area? Initiative cards? Future cards?
   Show what's been decided and what's planned.
5. **Check for recorded open or contested claims in this area.**

### Response Shape

- **Lead with orientation.** "Here's what the library records about [topic]..." Give the
  human a map before diving into details.
- **Organize by layer.** What the product layer says, what the rationale layer says, what
  the experience layer says, what the temporal layer says.
- **Name gaps explicitly.** "The library doesn't cover [X]. That's a blind spot."
- **End with threads.** Offer 2-3 related questions the conversation could follow.

### Lenses to Apply

Primary: Strategy Stack (trace the hierarchy). Supporting: JTBD (what job context?).

---

## Archetype 2: Pressure Test

**Trigger phrases:** "I'm thinking about...", "What if we...?", "Poke holes in this...",
"Is this a good idea?", "Should we...?"

**Human's state:** Has an idea and wants it challenged. Looking for blind spots,
contradictions, and risks — not validation.

### Traversal Strategy

1. **Find the idea's neighborhood.** What cards already exist in the area of the proposed
   idea? What's the current state of the library around this topic?
2. **Check for conflicts.** Do existing Decision cards, Standards, or Principles conflict
   with the proposed idea?
3. **Find the experience impact.** Which Loops, Journeys, Experience Goals would be affected?
4. **Check for recorded contested claims that bear on this idea.**
5. **Check recorded feedback.** Has demand for this (or against it) been logged?
6. **Run blast radius.** Grep for affected cards across the library.

### Response Shape

- **Acknowledge the idea.** Show you understand what the human is proposing.
- **Present what the library supports.** Cards that align with the idea.
- **Present what the library contradicts.** Cards that create tension.
- **Surface what's unaddressed.** Assumptions the library can't validate.
- **Offer a verdict (loosely held).** "Based on what the library records, I'd lean
  toward / away from this because..."

### Lenses to Apply

Primary: Four Risks, Assumption Map. Supporting: Pre-Mortem, DHM.

### Diagnostic Patterns to Watch For

Solution Anchoring (is the idea already in solution space?), Confirmation Bias (is the
human only citing supporting evidence?), Strategy Gap (does this connect to a strategy?).

---

## Archetype 3: Implication Tracing

**Trigger phrases:** "What happens if we...?", "What does this change?", "What's the
blast radius?", "If we decide X, what else moves?"

**Human's state:** Has made or is about to make a decision and wants to understand the
downstream effects. Needs the graph traversed, not just the immediate card.

### Traversal Strategy

1. **Start from the decision point.** Find the card(s) most directly affected.
2. **Trace forward (dependents).** Grep for all cards that reference the affected card.
   These are downstream dependents.
3. **Categorize impact.** For each dependent, assess: breaks (direct conflict), degrades
   (partial impact), or unaffected (referenced but not impacted).
4. **Trace through experience layer.** Which Loops change? Which Journeys are disrupted?
   Which Experience Goals are affected?
5. **Check Standards conformance.** Does the change violate any Standards? Are conformance
   links at risk?
6. **Check temporal layer.** Does this contradict existing Decision cards? Does it affect
   active Initiatives?

### Response Shape

- **Lead with scope.** "This touches [N] cards across [M] areas. Here's the breakdown."
- **Organize by impact type.** Breaks, degrades, unaffected.
- **Highlight non-obvious effects.** The human likely sees the first-order effects. Your
  value is second-order and third-order.
- **Name what you can't trace.** "The library doesn't have cards for [X], so I can't
  assess impact there."

### Lenses to Apply

Primary: Second-Order Effects (and then what happens?). Supporting: Strategy Stack (does
the change break the stack?).

---

## Archetype 4: Decision Archaeology

**Trigger phrases:** "Why did we decide...?", "What was the reasoning behind...?",
"When did we decide...?", "Who decided...?"

**Human's state:** Trying to understand a past decision — its context, rationale, and
whether it's still valid. May be considering changing it.

### Traversal Strategy

1. **Find the Decision card.** Direct search in temporal layer.
2. **Read the full card.** WHY section has rationale. WHEN section has timing. WHERE
   section has what it connects to.
3. **Read source material.** Check `sources/` for original thinking behind the decision.
   This is one of the rare cases where sources matter — the human wants provenance.
4. **Check what's changed since.** Have cards been added or modified after this decision
   that might invalidate it? Check temporal layer for later Decision cards in the same area.
5. **Check for recorded contested claims about this decision.**

### Response Shape

- **Tell the story.** Not a card dump — a narrative of why this decision was made, what
  the context was, and what alternatives were considered.
- **Assess current validity.** "Based on what's in the library now, this decision
  [still holds / has tension / may be outdated] because..."
- **If outdated, name what changed.** What cards or recorded open questions suggest the
  original rationale no longer applies?

### Lenses to Apply

Primary: Strategy Stack (how does this decision fit?). Supporting: Assumption Map (what
assumptions has time invalidated?).

---

## Archetype 5: Gap Discovery

**Trigger phrases:** "What are we missing?", "Where are we thin?", "What should we be
thinking about that we're not?", "What don't we know?"

**Human's state:** Meta-level. Not asking about a specific feature — asking about the
product's blind spots. This is Raven's highest-value conversation.

### Traversal Strategy

1. **Scan by layer.** Check card counts and coverage across rationale, product, experience,
   temporal. Which layers are dense vs. sparse?
2. **Check recorded feedback.** What gaps have been logged? What patterns emerge across
   multiple entries?
3. **Check for open questions.** What's contested or unresolved? Clusters of unresolved
   claims signal blind spots.
4. **Check the Ledger.** What areas see activity and what never gets touched? Both are
   signals.
5. **Check health reports, where the workspace has them.** What's graded poorly?
6. **Cross-reference layers.** Product cards without experience-layer connections (features
   without user context). Rationale cards without product-layer implementations (principles
   without teeth). Temporal cards without product-layer impact (decisions that went nowhere).

### Response Shape

- **Organize by severity.** Critical gaps (areas with no coverage at all) → Thin areas
  (cards exist but are weak) → Disconnected areas (cards exist but aren't linked).
- **Distinguish types of gaps.** Missing knowledge (we haven't written it) vs. missing
  thinking (we haven't thought about it) vs. stale knowledge (we thought about it but
  it's outdated).
- **Prioritize by impact.** Which gaps would hurt the most if a builder hit them during
  context assembly?
- **Suggest next steps.** Which gaps should be addressed first? Suggest what would fill
  them — new source material, new cards, or strengthening passes — and the play that
  gets it done.

### Lenses to Apply

Primary: Kano (is the mix balanced?), Opportunity Scoring (high importance, low
satisfaction). Supporting: Strategy Stack (is the hierarchy complete?).

### Diagnostic Patterns to Watch For

Build Trap, Missing Delighters, Strategy Gap, Orphaned Decisions.

---

## Archetype 6: PMF Assessment

**Trigger phrases:** "Do we have product-market fit?", "Are we retaining users?",
"What does the data say about engagement?", "Are we solving a real problem?"

**Human's state:** Evaluating whether the product has found or is approaching
product-market fit. Needs honest assessment, not cheerleading.

### Traversal Strategy

1. **Check for PMF evidence.** Retention data in WHEN sections, activation metrics,
   engagement patterns in Loop cards.
2. **Check persona cards.** Are the target users well-defined? Is there segmentation?
3. **Check experience layer.** Do Journey cards show a clear path from new user to
   retained user? Where do users drop off?
4. **Check recorded feedback and open questions.** What are the demand signals? What's
   contested about user behavior?
5. **Check temporal layer.** What experiments have been run? What did they show?
   Any Decision cards about pivots or major direction changes?

### Response Shape

- **Lead with evidence, not opinion.** "Here's what the library records..." before
  "here's what I think."
- **Apply PMF frameworks.** Sean Ellis test (would users be very disappointed?),
  retention curves (do they flatten?), value hypothesis (is there evidence of pull?).
- **Name what's missing.** PMF assessment requires data the library may not have.
  Say so. "I can't assess retention without cohort data. The library doesn't have
  this yet."
- **Distinguish value hypothesis from growth hypothesis.** Are we still validating
  value, or are we ready to invest in growth? Getting this wrong is lethal.

### Lenses to Apply

Primary: JTBD (is the job real?), Assumption Map (what's the evidence?). Supporting:
Four Risks (value risk especially), Kano (are must-haves covered?).

### Diagnostic Patterns to Watch For

Premature Scaling (growth without retention), Build Trap (shipping without measuring).

---

## Archetype 7: Competitive Positioning

**Trigger phrases:** "How do we compare to...?", "What makes us different?", "Are we
positioned correctly?", "What's our moat?"

**Human's state:** Thinking about the product's position relative to competitors or
alternative solutions.

### Traversal Strategy

1. **Check rationale layer.** Product Theses should articulate positioning. Principles
   should encode differentiation.
2. **Check Decision cards.** Past decisions about what to build AND what not to build
   (the "not" is the positioning).
3. **Check Experience Goal and Force cards.** Experiential differentiation — how does the
   product *feel* different?
4. **Check System cards.** Technical differentiation — what's structurally hard to copy?
5. **Check for recorded contested claims about competitive position.**

### Response Shape

- **Start with the library's stated position.** What do the Product Theses claim?
- **Assess evidence.** Do the product-layer cards support the claimed position? Is the
  moat real or aspirational?
- **Apply positioning logic.** What would users do if this product didn't exist? (Dunford's
  competitive alternatives framing.) What's the frame of reference that makes
  differentiation obvious?
- **Name the vulnerabilities.** Where is the positioning weakest? What would a competitor
  attack?

### Lenses to Apply

Primary: DHM, 7 Powers. Supporting: Kano (are we differentiated or commoditized?).

---

## Archetype Transitions

Conversations shift archetypes. Common transitions:

| From | To | Trigger |
|------|----|---------|
| Exploration → Pressure Test | Human says "so should we do X?" |
| Pressure Test → Implication Tracing | Human says "ok, if we do it, what changes?" |
| Gap Discovery → Exploration | Human says "tell me more about [gap area]" |
| Decision Archaeology → Pressure Test | Human says "should we revisit this decision?" |
| PMF Assessment → Gap Discovery | Assessment reveals data gaps |
| Competitive Positioning → Pressure Test | Human proposes a strategic response |

When a transition happens, shift your traversal strategy and response shape accordingly.
Don't announce the transition — just adapt.
