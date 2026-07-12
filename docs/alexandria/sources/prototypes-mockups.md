# Prototypes / Mockups

Source material for knowledge area 4.3. From solicitation prompt conversation, 2026-03-23.

## Status: Pre-Validation

This knowledge area is honestly thin. For a markdown-based product, "prototypes" means
exemplars — reference examples showing what quality looks like in practice, not just
structural templates. We don't have those yet, and the reason is structural: without
a beads-shaped solution (MCP tools, retrieval profiles, assembly instrumentation),
there's no feedback loop to say "this card produced better builder output than that
card" or "this briefing format led to fewer rework cycles than that one."

The guesses and vaguery in the existing docs are there for this reason. They're not
laziness — they're epistemic honesty about what we can and can't claim.

## What We Know: The Human Power User Experience

The product owner's experience of quality is real but subjective. What feels like a
good artifact from the human side:

**Good source material** looks like the decision files in this library — deep WHY
coverage, "what would change this" boundary conditions, alternatives rejected with
rationale. `decisions-team-architecture.md` is the closest thing to an exemplar we
have: thick reasoning, specific enough to act on, honest about what's a bet vs. what's
proven. The source files from the solicitation process (like this one) are another
reference point: conversational prose that preserves the voice and rationale of the
product owner, not just extracted bullet points.

**Good solicitation** looks like the interaction pattern the wizard uses: structured
questions, pushback for specifics, follow-ups that deepen vague answers, output that
captures decisions and rationale in a format that agents can later decompose into cards.
The user feels like they have a partner helping them think more clearly.

**Good library organization** is something the human power user can feel — browsing
folders and sensing that things are in the right place, that the card types match the
product's natural structure, that the graph reflects how the product actually works.

But all of this is the human experience. The human is not the primary consumer of
library output — the builder agents are. And we haven't proven that builders build
better with this yet.

## What We Don't Know

- **Whether cards with thicker WHY produce measurably better builder output.** The
  principle says "grade WHY harder, trace WHY deeper, fix WHY first" but the evidence
  is the human's intuition, not A/B test data from factory runs.

- **Whether briefing format matters.** U-shaped attention ordering, card budgets,
  mandatory categories — these are engineering hypotheses about LLM attention, not
  validated retrieval patterns. A briefing with 8 cards might outperform one with 15,
  or the opposite might be true for complex tasks.

- **Whether grade reports help users fix the right things.** Conan's grade reports
  are designed to be scannable (tables, not paragraphs, crisp signal). But do users
  actually act on them? Do they fix what Conan flags, or do they fix what they
  personally notice?

- **What "good enough" looks like for different task types.** A prototype task might
  need less context depth than a refactor task. A bug fix might need more anti-pattern
  coverage than a new feature. We have retrieval profiles that hypothesize these
  differences but no evidence for the thresholds.

## What Would Change This

Real exemplars need to come from deployed libraries with instrumented factory output.
Specifically:

- **Before/after comparisons.** Builder output on the same task with and without a
  context briefing. This would show whether the library actually improves output and
  which briefing dimensions matter most.

- **Card-level attribution.** When a builder produces something good, which cards in
  the briefing contributed? When something goes wrong, which cards were missing or
  misleading? Provenance logging is designed for this but hasn't been deployed at scale.

- **Exemplar gallery from real deployments.** Once multiple libraries exist, the best
  cards, briefings, and grade reports across all of them become the exemplar set. This
  is an Alexandria-scale artifact — it requires cross-library pattern detection (Play
  M.3) that doesn't exist yet.

Until then, the templates in `templates/` are the best we have for structure, the
source files in this library are the closest thing to content exemplars, and the honest
answer is: we're building to learn.
