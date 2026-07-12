---
id: FEAT-002
title: Add greenfield detection and fast-lane branch
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-006]
cards: [Capability - Raven, System - Wizard Engine]
---

## Motivation

The current wizard routes all users through the same gap analysis framing regardless
of whether they have existing material to analyze gaps in. A user with ideas but no
docs doesn't have gaps — they have a product that hasn't been described yet. Asking
them to assess gaps in documentation they've never written is the wrong experience
entirely.

Greenfield is not just zero-docs, zero-code. It includes thin prototypes, a handful
of pages of notes, early-stage products with minimal documentation. The threshold is:
"not enough material for gap analysis to be a meaningful frame." The right path for
these users is elicitation-as-generation, not elicitation-as-interrogation.

## Description

Add greenfield detection to the Step 0 routing logic in `skills/initialize/SKILL.md`, and
add a greenfield fast-lane branch that replaces gap analysis with conversational
elicitation.

**Greenfield detection** — during routing (after "Tell me what you're building"), assess
material state:

- Does the user have product documentation? If yes, are there more than a few pages?
- Does the user have an existing codebase? If yes, is it more than a thin prototype?
- Does the available material provide enough structure to meaningfully identify gaps?

If the answers are "thin to none," route to the greenfield fast-lane.

**Greenfield fast-lane** — replace gap analysis with:

1. An explicit acknowledgment that the greenfield path is different ("You're at the
   beginning — that's fine. We'll build the first version of your library from our
   conversation rather than from existing docs.")
2. Open-ended product elicitation: "Tell me what you're building." Followed by
   follow-ups: what problem does it solve, who uses it, what does it feel like to use.
3. Frankenstein diagnostic (from expert calibration): "If I were going to prototype
   something like yours — grabbing pieces from things that already exist — what would
   I grab? What's the 85% and what's the different bit?" This calibrates complexity
   and novelty through conversation rather than form questions.
4. From the conversation, synthesize the configuration answers (AI mode, novelty,
   complexity) as inferences to confirm rather than direct questions.
5. Output a brief capture of source material concepts (not written cards — those are
   Sam's job) and the configuration, with explicit "next steps" for what Sam will build.

The configuration questions (AI mode, novelty, complexity) still get answered — they
get answered through conversation rather than as direct questions.

## Context

Reference: wizard-improvement-opportunities section 2 (Greenfield Fast-Lane). The
principle from that document: "This is elicitation-as-generation, not
elicitation-as-interrogation."

Reference: expert-calibration section 1 (Frankenstein diagnostic). The diagnostic is
specifically designed for the greenfield state: "How weird is this thing? How complex?
If you were going to prototype it by Frankensteining known systems together, what would
you grab and from where?" This question surfaces novelty and complexity without asking
directly.

Reference: expert-calibration section 9 — the "Tell me what you're building" question
is the natural bridge from the opener to the greenfield path.

## Acceptance Criteria

- [ ] Greenfield detection logic is present in Step 0 routing, with clear criteria for
      what constitutes thin-material state
- [ ] Greenfield fast-lane does not contain "gap analysis" framing or language
- [ ] Frankenstein diagnostic is present in the greenfield path as a concrete example
      of what Raven asks
- [ ] Configuration answers (AI mode, novelty, complexity) are still derived — through
      conversation rather than direct form questions
- [ ] Greenfield path produces alexandria-config.json and assessment.md as output (the path
      is different; the output artifacts are the same)
- [ ] Brownfield users (existing docs/code) are unaffected — they continue through the
      normal path
- [ ] The threshold between greenfield and brownfield is specified explicitly enough
      that it's not ambiguous at runtime

## Implementation Notes

The greenfield fast-lane is an addition to `skills/initialize/SKILL.md` only. The wizard
engine YAML and output schemas are untouched.

The output of the greenfield path should be an alexandria-config.json and assessment.md
that downstream agents (Conan, Sam, Bridget) can consume. The assessment.md for a
greenfield user will look different — more "here's what we're building toward" and
less "here's what's missing" — but the file must exist.

Do not over-specify the conversation flow. The greenfield path should describe Raven's
goal (understand the product, derive configuration, generate source material concepts)
and give examples of questions, not a rigid script. Raven adapts to what the user shares.
