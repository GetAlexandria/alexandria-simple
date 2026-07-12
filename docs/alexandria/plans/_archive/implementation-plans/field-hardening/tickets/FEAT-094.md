---
id: FEAT-094
title: "Planning skill improvements: global numbering, table preview, bounded-choice decisions, parallel sub-agent writes"
outcome: n/a
tier: should
enabler: false
blocked-by: []
blocks: []
cards: []
---

## Motivation

Four friction points surfaced while using `context-library-dev-implementation-planning`
to produce the field-hardening plan itself. Each is a concrete, fixable gap in the
skill. This ticket is meta: it updates the planner, not the product.

## Description

Land four changes to the implementation-planning skill:

1. **Global FEAT/SPIKE numbering.** IDs must be monotonic across the whole repo,
   not reset per plan. The planner greps existing tickets and assigns
   `1 + max(existing)`.
2. **Table-first ticket preview.** Before writing any ticket files in Step 7, the
   planner presents a table (ID, Title, Outcome, Tier, short description) and
   asks the user to confirm.
3. **Bounded-choice Decisions iteration.** Step 4 uses `AskUserQuestion` to walk
   decisions one at a time with concrete options. Free-form text is the fallback
   only when the host does not support the UI.
4. **Parallel sub-agent ticket writing.** Step 7b dispatches sub-agents in
   parallel to write ticket files (roughly one agent per ~5 tickets) rather than
   writing them sequentially from the main planning context.

## Context

All four changes were observed during the creation of this plan. Global
numbering in particular was flagged when FEAT-001 was proposed even though
FEAT-076 already existed. Table preview would have caught scope errors earlier.
Decisions iteration was painfully free-form. Parallel writes matter once a plan
exceeds ~15 tickets — sequential writes chew through the planning conversation's
context budget.

## Acceptance Criteria

- [ ] `~/.claude/skills/context-library-dev-implementation-planning/SKILL.md`
      updated with the global numbering rule, including the exact grep command
      planners should run against
      `docs/alexandria/implementation-plans/*/tickets/`.
- [ ] Step 7 reordered so the ticket table (ID, Title, Outcome, Tier, short
      description) is rendered and confirmed by the user before any ticket files
      are written.
- [ ] Step 4 specifies `AskUserQuestion` with per-decision bounded options;
      free-form prompting is called out only as a fallback for hosts without the
      tool.
- [ ] Step 7b dispatches parallel sub-agents for ticket file writes (one agent
      per ~5 tickets or equivalent partitioning), with an explicit note on why
      (main-context budget protection).
- [ ] If the planning skill has eval coverage, evals still pass; new baseline
      checked in if scores improved.

## Implementation Notes

- Primary file: `~/.claude/skills/context-library-dev-implementation-planning/SKILL.md`.
- If Step 7 references sub-skill files (e.g. a ticket-writer sub-skill), update
  those too so parallel dispatch is a first-class pattern, not improvised at
  runtime.
- Suggested grep for global numbering:
  `grep -rhoE '^id: (FEAT|SPIKE)-[0-9]+' docs/alexandria/implementation-plans/*/tickets/ | sort -u`.
- Keep the table-preview step cheap: a markdown table in the conversation, not
  a file artifact. The confirmed table can be discarded once tickets land.
- Parallel dispatch should pass each sub-agent: plan path, ticket IDs it owns,
  frontmatter fields, and the shared ticket template. Sub-agents write files
  and return a one-line confirmation; the main agent aggregates.
- Do not conflate this ticket with broader planner rewrites. Four changes, scoped.
