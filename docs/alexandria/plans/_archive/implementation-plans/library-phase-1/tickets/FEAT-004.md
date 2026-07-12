---
id: FEAT-004
title: Rewrite configuration question presentation with config-calibrated WHY explanations
outcome: O-3
tier: should
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-005, FEAT-006]
cards: [Capability - Raven, System - Wizard Engine]
---

## Motivation

The current wizard presents configuration questions with brief labels and option sets
but no explanation of why each question matters or what the answer changes downstream.
Users pick options without understanding the stakes. The same knowledge area warrants
different guidance intensity depending on configuration — a single generic blurb per
question doesn't cover this.

A user who understands why AI mode matters chooses more carefully. A user who
understands why Domain Novelty matters gives Raven better signal. The WHY explanation
is not filler — it changes the quality of the answer.

## Description

Rewrite the presentation of each configuration question in `skills/initialize/SKILL.md`
to include a config-calibrated WHY explanation following the guidance posture spectrum.

**For AI mode (Short-Order Cook / Pair Programmer / Factory):**

- WHY: AI mode determines how much the library has to do on its own vs. with a human
  checking its work. At Factory mode, every micro-decision the AI makes runs without
  review — the library is the briefing before a long unsupervised shift. At Pair
  Programmer, a human is reviewing everything — the library needs to orient, not operate.
  The choice changes how much the library needs to do and how precisely it needs to do it.
- Posture: Prescriptive. This question has no wrong answer but the implications are
  large. Raven should explain what each option means in practice before the user answers.

**For Domain Novelty (Low / Medium / High):**

- WHY: Novelty determines how much orientation work the library needs to do. A product
  that sits close to a well-understood category can lean on the agent's priors — it
  already knows how things like that work. A product that breaks established conventions
  needs heavier documentation because the agent's priors are unreliable guides. Getting
  this wrong in either direction creates problems: over-documenting a standard thing
  wastes time; under-documenting a novel thing produces unreliable AI output.
- Posture: Advisory. The user knows their product and competitive landscape better than
  Raven does. Raven surfaces her inference (from FEAT-003) and asks for confirmation.
  If the user's read differs, engage rather than override.

**For Product Complexity (Low / Medium / High):**

- WHY: Complexity determines the surface area the library needs to cover. Low complexity
  means the library can be focused and thin. High complexity means there are more
  interaction patterns, edge cases, and knowledge areas the library needs to address.
  At Factory mode, complexity interacts with vocabulary — inconsistent nouns compound
  badly when AI is making hundreds of micro-decisions without human review.
- Posture: Advisory for most users; Prescriptive on the AI-mode × complexity interaction
  (the noun vocabulary warning) for Factory-mode users.

**The Noun Vocabulary warning** (Prescriptive, Factory mode only):

When the user is at Factory mode and High or Medium complexity, add an explicit flag
before the complexity question: "One thing that matters specifically at Factory mode:
vocabulary consistency is load-bearing when AI operates autonomously. At this scale,
inconsistent nouns compound — 'tabs' meaning three different things in different files,
in different contexts, creates real grind. We'll come back to this when we talk about
library areas, but I want to flag it now so it's on your radar."

## Context

Reference: expert-calibration section 3 (The Guidance Gap Pattern), section 4 (The
Hypothesis Problem), and section 5 (The Guidance Posture Spectrum). The three-posture
model (prescriptive / advisory / transparent) maps to how strongly Raven advocates for
different areas based on the specific configuration.

Reference: expert-calibration section 10 (Cross-Cutting Principles) — specifically:
"The why behind each knowledge area isn't static — it shifts with configuration.
Anti-Patterns at Factory mode carries completely different stakes than Anti-Patterns
at Short-Order Cook. A single blurb doesn't cover it."

## Acceptance Criteria

- [ ] Each configuration question (AI mode, novelty, complexity) has a WHY explanation
      that describes what the answer changes downstream
- [ ] The WHY explanations are written from Raven's perspective, in her voice — not as
      documentation text
- [ ] The guidance posture is applied per question: prescriptive for AI mode (large
      implications, explain before asking), advisory for novelty and complexity
- [ ] The Noun Vocabulary warning appears for Factory-mode users at medium/high
      complexity, not for others
- [ ] Each explanation is calibrated to the specific configuration context — not a
      generic blurb applicable to all users
- [ ] The configuration questions still arrive in conversational form, not as a numbered
      checklist or form fields

## Implementation Notes

This is a markdown edit to `skills/initialize/SKILL.md` only.

Keep WHY explanations concise — 3-5 sentences each. Raven is a colleague explaining
why a question matters, not documentation. The voice guidance ("Be concise ~300-500
words per response") applies here too.

The guidance posture section (section 5) provides exact language models for each
posture. Prescriptive sounds like: "This will break things if you skip it, and here's
exactly how." Advisory sounds like: "Our read is that this matters for your
configuration, here's why. But you know your product." Transparent sounds like: "This
is in your pool. Here's what it does and when it earns its weight. Your call."
