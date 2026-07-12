---
id: IMPL-002
title: "DAG tool: orphan detection (outcomes ↔ tickets)"
outcome: Deterministic dependency graph computation exists
tier: must
enabler: false
blocked-by: [IMPL-001]
blocks: [IMPL-004]
cards: []
---

## Motivation

Tickets without outcomes are untethered work — they don't trace to any goal. Outcomes
without tickets are aspirations with no plan to achieve them. Both are planning smells
that the DAG tool should catch automatically.

## Description

Add orphan detection to `bin/alxndr dag`:

1. **Orphan tickets** — tickets whose `outcome` field is empty or references a
   non-existent outcome. Warning: "FEAT-006 does not trace to any outcome."
2. **Orphan outcomes** — outcomes with no tickets referencing them. Warning:
   "O-3 has no tickets assigned."

**Behavior:**
- Orphans are warnings, not errors (the DAG is still structurally valid)
- `--validate` reports orphans but still exits 0 (they're planning quality issues,
  not structural failures). Add a `--strict` flag that exits 1 on orphans.
- JSON output includes an `orphans` section:
  ```json
  {
    "orphans": {
      "tickets_without_outcomes": ["FEAT-006"],
      "outcomes_without_tickets": ["O-3"]
    }
  }
  ```

## Acceptance Criteria

- [ ] Detects tickets with missing or invalid `outcome` field
- [ ] Detects outcomes with no tickets referencing them
- [ ] Warnings displayed in text output
- [ ] Orphans included in JSON output
- [ ] `--validate` still passes with orphans (warning only)
- [ ] `--strict` flag makes orphans a validation failure
- [ ] No orphans in a well-formed plan produces clean output

## Implementation Notes

- Reads the `outcome` field from ticket frontmatter and cross-references against
  outcome file IDs
- Should handle the case where `outcomes/` directory doesn't exist (legacy plans
  without outcomes — just skip orphan detection)
