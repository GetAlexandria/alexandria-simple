---
id: IMPL-005
title: "Skill: Steps 1-3 (goal conversation + context gathering + propose outcomes)"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: []
blocks: [IMPL-006]
cards: []
---

## Motivation

The planning conversation is where all the value is created. Steps 1-3 establish the
goal, gather context from the knowledge graph, and propose success outcomes with scope
tiers. If these steps are wrong, everything downstream (tickets, DAG, release doc) is
wrong. Building and evaluating these first ensures the foundation is solid.

## Description

Implement the first three steps of `skills/implementation-planning/SKILL.md`:

### Step 1: Understand the Goal

The skill has a conversation with the user to understand:
- What they want to exist that doesn't exist yet
- Why (strategic context, user need)
- Scope boundaries (what's explicitly out)
- Constraints (tech stack, timeline, dependencies)

Check for prior plans with unresolved deferred items (scan
`docs/implementation-plans/*/release.md` for Deferred sections). Surface them:
"Your previous plan deferred X and Y. Should this plan pick them up?"

### Step 2: Context Gathering (via Conan)

Ask Conan to assemble a context briefing for the goal area:
- Relevant product entities, systems, current state
- Related decisions (settled and open)
- Anti-patterns and constraints
- Journey maps and interaction patterns
- Roadmap context
- Available persona/user cards

Present findings to the user: "Here's what I understand about the current state.
Is this accurate? Anything missing?"

If no context library exists or it's empty, note the gap and proceed with what
the user provides directly.

### Step 3: Propose Success Outcomes

Based on goal + context, propose 3-5 success outcomes:
- Each is observable and validatable
- Each gets a tier (Must/Should/Could)
- Skill proposes, user confirms/edits/re-tiers

Outcomes are locked before proceeding to gap analysis.

## Acceptance Criteria

- [ ] Skill asks clarifying questions about the goal (doesn't assume)
- [ ] Skill scans for prior deferred items and surfaces them
- [ ] Skill requests a context briefing from Conan
- [ ] Skill presents context findings and asks for confirmation
- [ ] Skill handles missing/empty context library gracefully
- [ ] Skill proposes 3-5 success outcomes with tiers
- [ ] Outcomes are observable (not vague like "improve performance")
- [ ] Outcomes have validation criteria
- [ ] User can add, remove, and re-tier outcomes
- [ ] Skill confirms outcomes are locked before proceeding

## Implementation Notes

- This is the conversational core — the skill should feel like a planning partner,
  not a form to fill out
- The Conan integration depends on how agents are structured after Danvers's rework.
  For now, the skill can describe what context it needs and ask the user to provide
  it (or invoke Conan manually). The integration point should be clean so it's easy
  to wire up later.
- Personas from the context library should be referenced when available to help
  the user think about who benefits from each outcome
