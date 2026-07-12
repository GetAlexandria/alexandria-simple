---
id: DISC-003
title: "Noun proposal dialogue: grouped conversational flow"
outcome: O-3
tier: must
enabler: false
blocked-by: [DISC-002]
blocks: [DISC-004]
cards: []
---

## Motivation

The scanner proposes; the human confirms. The dialogue is where product intent is added.
"Notifications" becomes "our core engagement system, not just alerts." Grouped
conversational flow (Decision D3) balances efficiency with the QA-by-Dumping anti-pattern.

## Description

Build the interactive noun proposal dialogue that presents scanner output to the user
for confirmation, correction, and annotation.

**Flow (grouped conversational, Decision D3):**
1. **Summary layer:** "I found N entities organized in M domains. Here's the overview:"
   - Show domain groups with entity counts
   - Highlight the top entities by confidence
2. **Domain-by-domain confirmation:** For each domain group:
   - "In your [domain] area, I found: [entity list]. Which are real product concepts?"
   - User confirms, renames, merges, splits, or rejects
3. **Annotation:** For confirmed entities, optionally ask:
   - "Anything I should know about [entity]? What role does it play in your product?"
   - User adds product intent (or skips)
4. **Summary:** Confirmed entities listed with any annotations

**Anti-pattern guard:** Never dump all proposals at once. Summary first, then groups,
then individual entities only when the user drills down.

**Files to modify:**
- `skills/wizard/SKILL.md` — add noun proposal step in the scanner flow path

## Acceptance Criteria

- [ ] Summary layer shown before any individual proposals
- [ ] Proposals grouped by domain
- [ ] User can confirm, rename, merge, split, or reject each proposal
- [ ] User can annotate confirmed entities with product intent
- [ ] Flow completes in under 10 minutes for a typical codebase
- [ ] No flat dump of all proposals (QA-by-Dumping anti-pattern respected)
