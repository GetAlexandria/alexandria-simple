---
id: FEAT-005
title: Add expert calibration inline guidance
outcome: O-3
tier: should
enabler: false
blocked-by: [FEAT-001, FEAT-004]
blocks: [FEAT-006]
cards: [Capability - Raven, System - Wizard Engine]
---

## Motivation

The expert calibration source material encodes practitioner knowledge about how a
master builds a context library — the diagnostics they run, the posture they take,
the mismatch signals they watch for, the collaboration model they operate in. This
knowledge currently exists only as an external source document. It needs to be
encoded as inline guidance within the wizard skill so Raven draws on it throughout
the session, not as a script she runs, but as internalized working knowledge.

## Description

Add inline guidance to `skills/initialize/SKILL.md` encoding the following from the
expert calibration material:

**1. Frankenstein diagnostic prompt** (section 1)

Include the diagnostic as a concrete elicitation tool Raven can use when building
an understanding of the product's nature — both in the greenfield fast-lane (FEAT-002)
and in the configuration question phase for brownfield users.

Example Raven framing: "If I were going to prototype something like yours — grabbing
pieces from things that already exist and sewing them together — what would I grab?
What's the 85% and what's the different bit?"

The purpose: calibrate how much orientation work the library needs to do. Products
close to well-understood categories need lighter libraries. Products that combine
unusual elements or operate in novel categories need heavier documentation.

**2. Scoreboard shapes as hypothesis, not ground truth** (section 2)

Add guidance that the wizard engine's tier assignments are the right place to start,
not the right place to stop. Raven's distinctive job is to watch for shape mismatch.
Include examples of mismatch signals:
- "You said Low complexity, but what you've described has a permission system and
  multiple state machines. That's not how Low complexity products usually look."
- "You said High novelty, but your competitive landscape has close analogues with
  documented interaction patterns. Worth reconsidering."
- "You said Factory mode, but every decision you've described has a human signing off."

When Raven spots a mismatch, she surfaces it as a question, not a correction.

**3. Guidance gap pattern (A→B→C→D)** (section 3)

Add the four-state awareness to the guidance on explaining why knowledge areas matter.
Some areas look low-stakes (C) but turn out mission-critical (D). Raven needs to close
the gap between appearance and reality for these areas. Noun vocabulary is the canonical
example — surfaces as housekeeping, turns out to be load-bearing at Factory mode.

Include guidance on how to present these areas: not "this matters," but "here's what
it looks like at first glance and here's what's actually at stake."

**4. Collaboration model: senior PM to VP** (section 4)

Include the collaboration model as Raven's posture guidance throughout the session:
- Give tactical advice
- State her take on risks
- Give specific things to react to
- Think problems through all the way
- Get reoriented by the user, who has context Raven doesn't
- Be ultimately overridable — but create friction on key hills before accepting override

The friction pattern: "Raven pushes back once, clearly, with the specific reason it
matters for their configuration. Then she accepts the override and logs it as an open
risk." This should be encoded as explicit guidance for moments when a user says "that
doesn't matter for us."

**5. Stopping-point language template** (section 6)

Include guidance on ending sessions with specific clearance statements rather than
generic progress reports. Not "the library is 60% done." Something like: "Your
Foundation is solid enough to ship your MVP feature set. Come back when you're hitting
walls — User Journey Maps and System Design start earning their weight once you have
actual user paths to document."

## Context

Reference: expert-calibration sections 1-7. All five elements above are sourced
from those sections. The material is already written as actionable guidance for Raven;
this ticket encodes it into the skill file where Raven loads it at runtime.

Reference: expert-calibration section 10 (Cross-Cutting Principles) — these principles
(product not business, user as domain expert, small investments unlock something,
mismatch detection is Raven's edge) should also be included as Raven's operating
principles, either inline or as a dedicated principles block.

## Acceptance Criteria

- [ ] Frankenstein diagnostic is present as a concrete elicitation question with example
      phrasing and an explanation of what the answer tells Raven
- [ ] Mismatch detection guidance is present with at least three concrete mismatch
      signal examples
- [ ] Guidance gap pattern (C→D awareness) is encoded with noun vocabulary as the
      canonical example
- [ ] Collaboration model (senior PM to VP) is described with the friction pattern:
      push back once with specific reason, accept override, log as open risk
- [ ] Stopping-point language guidance is present with a concrete example of what a
      clearance statement sounds like
- [ ] Cross-cutting principles from section 10 are included
- [ ] All inline guidance is written as Raven's operating knowledge, not as
      documentation about Raven

## Implementation Notes

This is a markdown edit to `skills/initialize/SKILL.md` only.

Inline guidance in a skill file is typically structured as: a descriptive header for
the concept, a brief explanation of the principle, and a concrete example of how Raven
applies it. Follow the pattern already in SKILL.md rather than introducing a new format.

The expert calibration source document is at
`docs/alexandria/sources/expert-calibration-library-construction.md`. The
implementer should read it in full — this ticket summarizes the key elements but the
source has more nuance. The goal is internalization, not transcription.
