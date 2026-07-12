---
id: FEAT-015
title: "Rewrite route tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

The route tool (258 lines bash) resolves capability-based model routing.
142 lines of existing tests are the safety net.

## Description

Rewrite `bin/alexandria-route` in TypeScript at `src/tools/route.ts`.
Reads `config/model-routing.yaml`, parses skill `requires:` frontmatter,
resolves to model name.

## Acceptance Criteria

- [ ] route.test.ts passes against TypeScript implementation
- [ ] Reads model-routing.yaml correctly
- [ ] Handles `requires:` frontmatter

## Implementation Notes

Swap executable path in test. Uses shared frontmatter parser for
`requires:` capability fields.
