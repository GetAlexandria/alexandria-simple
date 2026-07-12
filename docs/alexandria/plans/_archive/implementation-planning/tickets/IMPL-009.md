---
id: IMPL-009
title: "Skill: Steps 7-9 (write output + apply card updates + present summary)"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-008]
blocks: [IMPL-010, IMPL-011]
cards: []
---

## Motivation

Steps 7-9 are the output layer — writing the release doc, outcome files, ticket files,
applying card updates, and presenting the summary. This is where everything comes together
into the deliverable the user actually reviews and uses.

## Description

Implement Steps 7-9 of the implementation planning skill:

### Step 7: Write Output

Write to `docs/implementation-plans/<plan-name>/`:

**Directory structure:**
```
docs/implementation-plans/<plan-name>/
  release.md
  outcomes/
    O-1.md
    O-2.md
    ...
  tickets/
    SPIKE-001.md
    FEAT-002.md
    ...
```

**Release doc** (`release.md`) — assembled from outcomes + tickets:
- Goal + scope
- Success outcomes table (ID, title, tier, linked tickets)
- Context summary (from Conan briefing)
- Decisions made during planning (table)
- Risks and assumptions (linked to tickets)
- Execution phases (from `alxndr dag --format text`)
- Mermaid dependency graph (from `alxndr dag --format mermaid`)
- Re-planning triggers
- Ticket index (full table)
- Context library updates pending approval
- Deferred section (placeholder — populated by `/complete-plan`)

**Outcome files** — YAML frontmatter + validation criteria + motivation

**Ticket files** — in the user's chosen format (Minimal/Standard/BDD/Custom).
Risks from the Risks and Assumptions table propagated into affected ticket context sections.

### Step 8: Document Library Updates

**Planning and the library are discrete.** The planner does NOT write to the
library directly. Instead:
- Write `library-updates.md` listing all implied card changes
- Tell user to ask Conan to review → Conan produces surgery plan → Sam writes cards
- Decision cards → Artifact type. New entities → Product Entities. Anti-patterns → Artifacts.

### Step 9: Present Summary

```
Implementation plan: [goal]
[O] outcomes | [N] tickets ([E] enablers, [F] features)
Written to docs/implementation-plans/[plan-name]/

Must: [outcomes]
Should: [outcomes]
Could: [outcomes]

Critical path: [ticket] → [ticket] → [ticket]
[C] context library cards updated

See release.md for full details.
```

## Acceptance Criteria

- [ ] Directory structure created with outcomes/ and tickets/ subdirs
- [ ] Release doc contains all required sections
- [ ] Mermaid graph embedded in release doc and renders correctly
- [ ] Execution phases match DAG tool output
- [ ] Outcome files have correct frontmatter and validation criteria
- [ ] Ticket files follow the selected format
- [ ] Risks appear in affected ticket context sections
- [ ] library-updates.md written with implied card changes for Conan/Sam
- [ ] Summary accurately reflects the plan
- [ ] Ticket format read from config (wizard-config.json)

## Implementation Notes

- The release doc is assembled from multiple sources — DAG tool output (phases, mermaid),
  outcomes, tickets, risks/assumptions, decisions. The skill orchestrates this assembly.
- Library updates are documented in library-updates.md for Conan/Sam to process.
  The planner does not write to the library directly.
- The output directory name should be URL-friendly (lowercase, hyphens, no spaces).
