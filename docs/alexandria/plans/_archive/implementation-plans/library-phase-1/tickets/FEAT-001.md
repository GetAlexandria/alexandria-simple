---
id: FEAT-001
title: Rewrite wizard opener with Raven's first-five-minutes sequence
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-002, FEAT-003, FEAT-004, FEAT-005]
cards: [Capability - Raven, System - Wizard Engine]
---

## Motivation

The wizard's current opening arrives at a routing question ("Do you have existing docs?
A codebase?") before any relationship exists between Raven and the user. Users experience
this as an intake form. The expert calibration material is explicit: the first five
minutes set the expectations the entire working relationship runs on. Skipping to
configuration before the user understands what they're building together produces worse
libraries because the user hasn't committed to the collaboration.

This ticket rewrites Step 0 of `skills/initialize/SKILL.md` to implement the colleague-
meeting sequence. It is the foundation for every subsequent ticket — the voice and
relationship are established here, and the rest of Phase 1 builds on top.

## Description

Rewrite the Step 0 section of `skills/initialize/SKILL.md` to implement the full
first-five-minutes sequence in order:

1. **Introduction.** Raven introduces herself — who she is, what she does. This is a
   job description: concrete, not a product pitch. What her role is, what she's good at,
   what she needs from the user to do her job well.

2. **Value exchange.** Make the deal explicit. The user is giving time, tokens, and
   mental energy. They're getting a product knowledge layer that makes AI builders more
   effective. It gets more useful the more they invest. Not free — the real cost is in
   the thinking.

3. **Agreement.** A handshake moment. "Does this sound like a fair deal?" Wait for a
   response. Unstated expectations are where relationships break down; this makes them
   stated.

4. **Questions welcome.** Before Raven asks about the product, the user gets to ask
   about Raven. How the library works. What agents do what. What the commitment looks
   like over time. Raven answers as a colleague explaining her job.

5. **Then the product.** "Tell me what you're building." Open-ended. Product-first,
   not system-first. This transitions to the routing step.

The routing logic (does the user have docs? a codebase?) follows after the product
question is asked and answered — it is not the opener.

## Context

Reference: expert-calibration sections 8 (PULL as background lens) and 9 (the first
five minutes). The sequence in section 9 is the exact model: introduction, exchange,
agreement, questions welcome, then the product.

The key principle from section 9: "By the time Raven asks her first product question,
the user should already understand what they're building together and have chosen to
build it." Onboarding, not sales.

The voice guidance in the current SKILL.md preamble ("Use Raven's voice throughout:
conversational, warm, engaged. Use 'we' and 'our.' Have opinions but hold them loosely.
Be concise.") should be preserved and may be strengthened.

## Acceptance Criteria

- [ ] Step 0 of `skills/initialize/SKILL.md` implements all five sequence steps in order
- [ ] Each step has a concrete example of what Raven says (the current SKILL.md uses
      blockquotes for this; maintain that pattern)
- [ ] The agreement step explicitly waits for user response before proceeding
- [ ] The questions-welcome step handles the case where a user asks detailed questions
      about how the library works, what Sam does, etc.
- [ ] The first product question is open-ended ("Tell me what you're building"), not
      a routing question
- [ ] The routing logic (docs? codebase?) follows the product question, not precedes it
- [ ] No step numbers or form-field labels are visible to the user in any example text

## Implementation Notes

This is a markdown edit to `skills/initialize/SKILL.md` only. No other files change.

The existing Step 0 already has some of this structure but the ordering is off —
the routing question arrives before the agreement and questions-welcome steps. The
rewrite should fix the order without discarding the good language that exists.

Preserve the "Be concise (~300-500 words per response)" voice guidance. The opener
should feel like a real conversation, not a documentation dump. Each step is a few
sentences, not paragraphs.
