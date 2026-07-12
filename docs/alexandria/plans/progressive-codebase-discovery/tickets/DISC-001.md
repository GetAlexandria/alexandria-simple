---
id: DISC-001
title: "Wizard routing: two yes/no questions before Step 1"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [DISC-008]
cards: [System - Wizard Configuration Engine]
---

## Motivation

The wizard currently assumes users have documentation. Code-first users need a different
entry point. Two routing questions before the three configuration questions determine
which path the user takes.

## Description

Add two yes/no routing questions to the wizard skill, inserted before Step 1:

1. "Do you have existing product documentation (strategy docs, PRDs, design docs)?"
2. "Do you have a codebase to scan?"

**Routing logic:**
- Docs only → existing wizard flow (Steps 1-6 unchanged)
- Code only → scanner flow (DISC-002 → DISC-003 → DISC-004 → then Steps 1-6)
- Both → scanner flow with code walk available later (DISC-006)
- Neither → existing wizard flow (user provides knowledge directly)

**Files to modify:**
- `skills/wizard/SKILL.md` — insert routing before Step 1
- `docs/wizard/wizard-engine.yaml` — add routing questions to questions section

## Acceptance Criteria

- [ ] Two yes/no questions appear before Q1 (AI Mode)
- [ ] Code-only users are routed to scanner flow
- [ ] Docs-only users proceed through existing wizard unchanged
- [ ] Both-docs-and-code users get scanner flow
- [ ] Neither-docs-nor-code users get existing wizard flow
- [ ] Existing QA wizard tests pass unchanged (engine untouched)
