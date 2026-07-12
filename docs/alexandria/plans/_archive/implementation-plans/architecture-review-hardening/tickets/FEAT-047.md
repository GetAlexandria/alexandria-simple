---
id: FEAT-047
title: "Standardize agent file format across all 5 agents"
outcome: O-5
tier: could
enabler: false
blocked-by: [FEAT-046]
blocks: []
cards: [Governance - Agent Capability Matrix]
---

## Motivation

The 5 remaining agent files have inconsistent section ordering and naming. Conan has "Job Dispatch" and "Mental Model." Raven has "What You Read That Others Don't." Sam has "Workflow." Bridget has "Assembly Procedure." Standardizing makes agents easier to understand, compare, and maintain.

## Description

1. Audit all 5 agent files to identify common and unique sections
2. Derive the canonical section order from the majority pattern
3. Propose the template (don't apply yet)
4. Apply the template to all 5 agents, preserving content while standardizing structure
5. Document the template for future agent creation

Likely canonical sections (based on current patterns):
- YAML frontmatter (name, description, tools, model)
- Identity paragraph (who you are, what you do, what you DON'T do)
- Job Dispatch (table or list of jobs with file references)
- Reference Skills (table of on-demand skill files)
- What You Know (library orientation)
- Division of Labor (who does what)
- Rules (constraints and non-negotiables)
- Output Rules (formatting requirements)
- Voice (communication style)

## Context

Agent files are registered by Claude Code and loaded into the model context. Consistency in structure makes them more predictable for the model to follow and easier for humans to review.

## Acceptance Criteria

- [ ] Canonical agent file template documented
- [ ] All 5 agent files conform to the template
- [ ] Section ordering is consistent across all agents
- [ ] No content lost — only structure standardized
- [ ] `alxndr lint` passes after changes

## Implementation Notes

Start by diffing the section headers across all 5 files (grep for `^## `). Build the canonical order, then restructure each file. Some agents have unique sections that should be preserved (e.g., Conan's "Mental Model," Raven's handoff block format) — these go in an "Agent-Specific" section at the end.
