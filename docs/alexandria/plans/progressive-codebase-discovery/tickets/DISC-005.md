---
id: DISC-005
title: "Scanner skill: Tier 2 schema + route scanning"
outcome: O-2
tier: must
enabler: false
blocked-by: [DISC-002]
blocks: [DISC-006, DISC-007]
cards: []
---

## Motivation

Tier 1 (file tree) gives structure but not detail. Tier 2 reads actual file contents
to deepen proposals with evidence: model fields, route paths, component props. This
makes proposals more accurate and gives the user richer context during confirmation.

## Description

Extend the scanner skill to read file contents for entities identified in Tier 1.

**Tier 2 investigation:**
1. For each Tier 1 candidate, read the associated files
2. Extract structural details:
   - Models/schemas: field names, relationships (foreign keys, references)
   - Routes/endpoints: path patterns, HTTP methods, grouped by resource
   - Components/pages: names, props, composition patterns
3. Enrich proposals with evidence (specific fields, routes, relationships)
4. Detect potential dead code: models with no routes, routes with no UI, etc.
5. Upgrade confidence scores based on evidence depth

**Escalation logic:** Tier 2 only runs for candidates that Tier 1 identified. It does
not scan the entire codebase — only files associated with proposed entities.

**Files to modify:**
- `skills/wizard/scanner.md` — add Tier 2 logic

## Acceptance Criteria

- [ ] Reads file contents for Tier 1 candidates only (not full codebase)
- [ ] Extracts model fields, route paths, component structure
- [ ] Detects relationships between entities (foreign keys, references)
- [ ] Flags potential dead code (entities with partial evidence)
- [ ] Enriches proposals with specific evidence
- [ ] Token cost measurably lower than scanning all files
