# Wizard Improvement Opportunities

Source material for wizard design. Synthesized from product conversation (Raven session),
2026-04-02. Builds on the orientation-first routing recently added to the wizard and
identifies five improvements across two layers.

## Summary

The wizard works, but it feels like an interrogation. Five improvements would change that:

- **Infer before asking.** The wizard has access to docs and code but still asks users to declare what they have. Flip the default: derive answers from materials, only ask what can't be inferred. This is the deepest fix — it reshapes the entire downstream experience.
- **Fast-lane for greenfield users.** Users with little or no existing material (no docs, no code, or just a thin prototype / a few pages of notes) shouldn't be routed through gap analysis. They don't have gaps — they have ideas. The wizard should meet them there: "Tell me what you're building" → generate starter source material, not a gap list.
- **Frame the value up front.** Before the first question, spend 30 seconds explaining what the wizard builds and why it matters. Turns the experience from "fill in this form" to "let's build your product knowledge layer."
- **Be transparent about cost.** Users need to know this works best on Pro/Team, and they should see a running sense of progress during long operations. The failure mode to prevent: burning half a context window with nothing to show.
- **Scaffold noun vocabulary.** Users are asked to name their product entities cold. Known noun families exist — surface them, explain the homebrew-vs-adopt tradeoff, and flag that vocabulary consistency is load-bearing when AI operates autonomously.

These relate as two layers: the **architectural fixes** (inference-first, greenfield fast-lane) change what the wizard does at each step; the **experience fixes** (value frame, cost transparency, noun scaffolding) change how it communicates. The architectural work is prerequisite — the experience improvements land better once the wizard is smarter about what it already knows.

## 1. Orient/Infer Before Elicit (Architectural)

The wizard currently asks users to declare what they have (gap analysis) before it has used what it can passively gather. The complexity checklist is the clearest offender — a codebase scan could answer most of those questions without asking. The orientation-first routing is a good start, but inference from gathered materials needs to shape the entire downstream experience, not just the routing decision.

**Implication:** Wherever docs or code exist, the wizard should derive answers rather than solicit them. The gap analysis should surface only what can't be inferred.

## 2. Greenfield Fast-Lane (Architectural)

When a user has little or no existing material, the current wizard still routes them through the same three configuration questions and gap analysis framing — which asks them to assess gaps in documentation they've never written. This is the wrong experience entirely.

"Greenfield" isn't just zero-docs, zero-code. It includes users who have a thin prototype but no docs, a handful of pages of notes but no code, or an early-stage product with ~8 pages of documentation and nothing built yet. The line isn't at "nothing" — it's at "not enough material for gap analysis to be a meaningful frame." The exact threshold needs design work, but the principle is: if the user's material is too thin for the wizard to infer structure from, they're greenfield.

**Proposed design:** Greenfield path skips gap analysis framing. Open with a Raven-style question: "Tell me what you're building." Generate a starter Vision card live. The output is source material, not a gap list. This is elicitation-as-generation, not elicitation-as-interrogation.

## 3. Foreground / Background for Long Operations (UX)

During long passive operations (codebase scans, doc reads), users are currently blocked waiting. The proposal: run scans and lightweight elicitation in parallel. "While I'm scanning your codebase, a quick question..." This keeps the user engaged and advances the work simultaneously.

This pairs with **expectation-setting on token usage** — users should know upfront that this works best with Pro/Team subscriptions, and should see a running token counter during long sessions. The nightmare scenario: user gets halfway through, burns their context budget, and has nothing to show for it.

## 4. Noun Vocabulary Scaffolding (Medium-Term)

The wizard asks users to name their own product entities from scratch with no examples, no patterns, and no explanation of why it matters. There are known "noun families" — established vocabulary packages that products can adopt vs. invent. The AI-autonomy stakes are high: a homebrew or inconsistent noun system works fine when humans are in the loop, but when AI is making hundreds of micro-decisions, vocabulary ambiguity compounds badly.

**Proposed additions:**
- Surface the existence of known noun families as options
- Explain the homebrew vs. adopt tradeoff
- Make the AI-autonomy stakes explicit: "At Factory mode, your noun vocabulary is load-bearing in ways it isn't when a human is reviewing every decision"

## 5. Opening Value Frame (Quick Win)

The wizard should open with a brief (30-second) value statement before asking anything. What you're building, why it matters. This addresses the interrogation-first feel and sets up the experience as "building your product knowledge layer" rather than "filling in a form."

**Note on framing:** The experience should feel like building a product thinking partner / product expert, but the framing should be library-centric, not agent-centric. "Your product thinking, made durable and AI-queryable." The conversational interface is the delivery mechanism, not the product.

## Priority Tiers

### Architectural (high effort, high impact)
1. **Inference-first downstream** — orientation-first routing exists; now make it change what gets asked vs. inferred
2. **Greenfield fast-lane** — greenfield path should go straight to elicitation-as-generation

### Easy Wins (low effort, high impact)
3. **Opening value frame** — 30-second orientation before first question
4. **Token/usage transparency** — upfront subscription guidance + running usage counter during long ops
5. **Noun vocabulary guidance** — add noun families, explain tradeoffs, flag AI-autonomy stakes

### Medium-Term
6. **Foreground/background** — parallel scan + lightweight elicitation; requires show/tell for what's running

## Open Questions

- How much of inference-first can be done with current scan tier output? Need to map complexity checklist signals to what the scanner actually detects.
- For the greenfield fast-lane: what's the minimum viable Vision card the wizard should generate? How much does the conversational agent lead vs. the user?
- Noun families research: prior work exists on this. Worth surfacing before designing the vocabulary scaffolding.
- Token estimation: we may be better at estimating token cost per wizard path than we think. Worth investigating before shipping.
