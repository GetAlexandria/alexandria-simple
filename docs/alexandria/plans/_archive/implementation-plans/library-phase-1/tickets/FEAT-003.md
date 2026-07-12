---
id: FEAT-003
title: Add inference-before-asking to complexity and novelty questions
outcome: O-3
tier: should
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-006]
cards: [Capability - Raven, System - Wizard Engine]
---

## Motivation

The current wizard asks users to declare complexity and novelty as form questions,
even when scanner output or shared documentation already suggests the answer. The
complexity checklist is the clearest offender — a codebase scan can answer most of
those signals without asking. The orientation-first routing recently added is a good
start, but inference needs to shape the downstream question flow, not just the routing
decision.

The wizard already has access to whatever the user has shared — docs, codebase,
the product description from Step 0. It should derive answers from this material
before asking. Where material is ambiguous or absent, it asks. Where material clearly
suggests an answer, it surfaces the inference and asks for confirmation rather than
asking cold.

## Description

Add inference-before-asking logic to the configuration questions section of
`skills/initialize/SKILL.md` (Steps 1-3 covering AI mode, novelty, complexity).

**For each question:**
1. Before presenting the question, check what scanner output or shared material
   already suggests about this dimension.
2. If evidence is strong enough to support an inference, surface it as a hypothesis:
   "Based on your README, I'm reading this as High novelty — you're in a category
   without clear analogues. Does that feel right?"
3. If evidence is weak or absent, ask the question directly but with context on
   why it matters (see FEAT-004 for WHY explanations).
4. If the user corrects an inference, accept the correction and note the tension
   if one exists (mismatch detection from expert calibration section 2).

**Inference signals to use from available material:**

- **Complexity signals:** codebase scanner output (multiple state machines,
  permission systems, integration count), PRD/spec scope, number of user-facing
  features described.
- **Novelty signals:** product description's use of analogies ("it's like X but Y"),
  presence or absence of known category language, competitive landscape mentions,
  Frankenstein diagnostic output from Step 0/greenfield path.
- **AI mode signals:** job-to-be-done framing in product description, any explicit
  mention of how AI is used, autonomy language in docs.

## Context

Reference: wizard-improvement-opportunities section 1 (Orient/Infer Before Elicit).
The key principle: "Wherever docs or code exist, the wizard should derive answers
rather than solicit them."

Reference: expert-calibration section 2 (Scoreboard Shapes — First Best Guess). The
shape the wizard engine produces is the right place to start, not stop. Raven's job
is to watch for mismatch signals. Mismatch detection works in both directions —
catching when the user's stated answer doesn't fit their evidence, not just when
Raven's inference is wrong.

The open question from improvement-opportunities: "How much of inference-first can
be done with current scan tier output? Need to map complexity checklist signals to
what the scanner actually detects." The implementation notes below address this.

## Acceptance Criteria

- [ ] For each of the three configuration questions (AI mode, novelty, complexity),
      the skill describes how to check for inferrable signals before asking
- [ ] When evidence supports an inference, Raven surfaces it as a confirmation request
      rather than a direct question ("I'm reading this as X — does that feel right?")
- [ ] When evidence is absent, the question is asked directly
- [ ] If the user corrects an inference, Raven accepts the correction and, if a
      tension exists (e.g., "you said Low complexity but codebase shows three state
      machines"), surfaces it as a question rather than a silent override
- [ ] The inference logic is scoped to what current scanner output can actually
      determine — no signals are claimed that the scanner doesn't produce

## Implementation Notes

Map the complexity checklist (which currently asks users to self-declare) against
what `bin/context-library-scanner` actually outputs. Use only signals that the
scanner actually surfaces. For now, this may mean inference is available for
complexity and partial novelty (if a README or description is present), with AI mode
still requiring a direct question in most cases.

This is a markdown edit to `skills/initialize/SKILL.md` only. The scanner itself is
not modified.

The goal is directional, not exhaustive. Even a single good inference — "I'm reading
this as High complexity given the scope you've described" — changes the experience
meaningfully. Don't hold the ticket for complete inference coverage; ship what current
scanner output supports and note what would need scanner changes to unlock more.
