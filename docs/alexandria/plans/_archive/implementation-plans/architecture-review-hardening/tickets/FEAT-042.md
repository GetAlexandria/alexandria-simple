---
id: FEAT-042
title: "Add downstream sync deviation detection to alxndr lint"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [Capability - Linting]
---

## Motivation

After structural library changes (type additions, folder reorganization, terminology renames), 13 meta-files must stay in sync with `reference.md`. Currently Conan's Downstream Sync job (Job 9) reads each file manually. The deviation detection step is deterministic — compare meta-file references against the canonical reference.

## Description

Add a `sync` check to `alxndr lint` that for each of the 13 manifest files:

1. Reads `reference.md` for canonical type lists, folder paths, terminology
2. Reads the meta-file (agent definition, skill file, retrieval profile)
3. Checks for 7 deviation types: missing type, stale type, wrong examples, stale terminology, missing folder paths, missing retrieval profile, stale section headers
4. Reports deviations as findings

## Context

The 13 manifest files are listed in `skills/conan/job-downstream-sync.md`. The canonical reference is `docs/alexandria/reference.md`. Conan's Job 9 does detection AND fixing — this ticket only covers detection. Fixing remains agentic (Conan edits meta-files with judgment about what to change).

## Acceptance Criteria

- [ ] `alxndr lint sync <repo-path>` checks all 13 manifest files against reference.md
- [ ] Covers all 7 deviation types
- [ ] Reports deviations with file, line, rule, message, fix suggestion
- [ ] Test suite covers each deviation type
- [ ] Integrates with existing lint output format

## Implementation Notes

Parse `reference.md` to build canonical lists (types, folders, terminology). For each manifest file, extract the relevant references (type lists, folder paths, terminology) and diff against canonical. The hardest part is extracting structured data from prose-heavy files — consider using consistent patterns (markdown tables, code blocks) as extraction anchors.
