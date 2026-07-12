---
id: DISC-008
title: "QA tests for routing logic"
outcome: O-1
tier: must
enabler: false
blocked-by: [DISC-001]
blocks: []
cards: []
---

## Motivation

The routing logic has four paths (code-only, docs-only, both, neither). Each path
must correctly determine the wizard flow. Deterministic tests verify the routing
without running the full wizard.

## Description

Add test cases verifying the routing question logic.

**Test cases:**
- Docs=yes, Code=no → existing wizard flow
- Docs=no, Code=yes → scanner flow
- Docs=yes, Code=yes → scanner flow with code walk available
- Docs=no, Code=no → existing wizard flow
- Edge: user changes answer during flow → correct re-routing

**Files to modify:**
- `tests/qa-wizard.sh` — add routing test section

## Acceptance Criteria

- [ ] All four routing paths tested
- [ ] Edge case (answer change) tested
- [ ] Existing QA wizard tests still pass
