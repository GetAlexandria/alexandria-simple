---
id: DISC-002
title: "Scanner skill: Tier 1 file tree investigation"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [DISC-003, DISC-005]
cards: []
---

## Motivation

The scanner is the core engine of codebase discovery. Tier 1 uses only file tree
structure — the cheapest possible investigation — to produce initial noun proposals.
This is the foundation that Tier 2 deepens and the noun proposal dialogue presents.

## Description

Create a new scanner skill that reads a codebase's file tree and extracts product-level
noun proposals using framework-agnostic heuristics.

**Tier 1 investigation:**
1. Read the file tree structure (Glob for directory patterns)
2. Identify structural patterns: models/, schemas/, routes/, api/, components/, pages/, etc.
3. Extract candidate nouns from directory and file names
4. Group candidates by apparent domain (e.g., billing/, auth/, notifications/)
5. Filter out implementation-level names (utils, helpers, base classes, config)
6. Produce structured proposals: name, evidence (file paths), domain group, confidence

**Framework-agnostic heuristics (Decision D1):**
- Common directory patterns across stacks (models, schemas, routes, controllers, views, components)
- File naming conventions (singular nouns for models, plural for collections)
- Domain grouping from directory structure (features/, modules/, domains/, apps/)

**Output format:**
Structured data (proposals array) with human-readable rendering for the dialogue.

**Files to create:**
- `skills/wizard/scanner.md` — the scanner skill (or a separate skill directory)

## Acceptance Criteria

- [ ] Scanner reads a codebase's file tree without reading file contents
- [ ] Produces product-level noun proposals (not implementation details)
- [ ] Groups proposals by domain
- [ ] Works across Python, JS/TS, Ruby, Go directory structures
- [ ] Filters out utility/infrastructure names
- [ ] Output is structured (proposals with name, evidence, domain, confidence)
