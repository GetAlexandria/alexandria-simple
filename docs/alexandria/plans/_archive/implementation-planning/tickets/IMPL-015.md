---
id: IMPL-015
title: "Eval harness: LLM-as-user adaptive turn support"
outcome: Implementation planning skill has realistic eval coverage
tier: must
enabler: spike
blocked-by: []
blocks: [IMPL-006, IMPL-008, IMPL-010]
cards: []
---

## Motivation

The implementation planning skill is fundamentally interactive — it proposes outcomes,
surfaces decisions, applies gut-checks, and the user's responses shape the plan. Pre-
scripted eval turns (as used for wizard evals) are too brittle because the skill's
questions depend on what the context briefing reveals and what decisions arise.

We need an LLM-as-user mode where a second Claude instance plays the user role,
responding contextually to whatever the skill asks.

## Description

Extend `tests/run-eval.sh` to support an "adaptive" eval mode alongside the existing
"multi-turn" (pre-scripted) and "single-prompt" modes.

**New eval case file — `persona.md`:**

```markdown
# User Persona: TaskFlow Product Owner

## Goal
Add real-time collaboration features to TaskFlow.

## Context
TaskFlow is a task management app. I'm the product owner. We have
5 engineers and want to ship in Q2.

## Decision Preferences
- Prefer simplicity over extensibility
- Risk-averse: spike before committing to unfamiliar tech
- Multi-tenant is out of scope for now

## Scope Preferences
- O-1 (live cursors) is Must
- O-2 (collaborative editing) is Should
- Anything AI-related is Could at best

## Conversation Style
- Direct, concise answers
- Will push back if asked about out-of-scope features
- Will ask "why?" if a recommendation seems surprising
```

**How adaptive mode works:**

1. Turn 1: send `inputs.md` content (pre-scripted goal statement) to the skill
2. Skill responds (proposes outcomes, asks questions, etc.)
3. Send skill's response to a "user" Claude instance with the persona context:
   "You are playing this persona. The skill just said [X]. Respond naturally."
4. Send the user LLM's response back to the skill as the next turn
5. Repeat until the skill writes output files (detected by checking the work dir)
   or a max turn limit is hit

**Detection:** Auto-detect adaptive mode when `persona.md` exists in the eval case
directory. Can also be set explicitly in config.json: `"eval_mode": "adaptive"`.

**Turn limit:** Configurable in config.json (`"max_turns": 20`). Default 20.

**Transcript format:** Same as multi-turn, but user turns are labeled as
"User (adaptive)" and include a note that the response was LLM-generated.

**Reproducibility tradeoff:** Each run may produce different conversations.
Mitigation:
- Persona constrains behavior enough for structural checks to be consistent
- Judge evaluates conversation quality regardless of exact wording
- Historical runs capture each conversation for comparison
- `persona_hash` added to run-metadata.json for traceability

## Acceptance Criteria

- [ ] `persona.md` file format defined and documented
- [ ] Adaptive mode auto-detected when persona.md exists
- [ ] Turn 1 uses pre-scripted input from inputs.md
- [ ] Subsequent turns use LLM-as-user with persona context
- [ ] User LLM receives full conversation history + persona on each turn
- [ ] Max turn limit prevents infinite loops
- [ ] Skill completion detected (output files appear in work dir)
- [ ] Transcript labels adaptive turns distinctly from pre-scripted turns
- [ ] `persona_hash` added to run-metadata.json
- [ ] Structural checks still work on adaptive eval output
- [ ] Judge criteria still work on adaptive eval transcripts
- [ ] Existing single-prompt and multi-turn modes unaffected

## Implementation Notes

- The "user" LLM call uses `claude -p` with `--allowedTools ""` (no tools —
  it's just generating text, not executing code)
- The user LLM should see the persona + full conversation history on every turn
  (not just the latest skill message) to maintain coherent decision-making
- The skill and user LLM are separate sessions — the skill doesn't know it's
  talking to an LLM
- Completion detection: poll the work dir for new files after each skill turn.
  When the skill writes release.md/outcomes/tickets, the conversation is done.
- This is the same pattern as "constitutional AI" self-play, applied to eval
