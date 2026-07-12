---
id: FEAT-003
title: "Wire graph parser import from src/lib/ into viewer workspace"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-006, FEAT-008]
cards: [System - Knowledge Graph]
---

## Motivation

The graph parser (`src/lib/graph.ts`) already implements card parsing, wikilink
resolution, and graph metrics. The viewer must reuse this code rather than
reimplementing it (decision D2).

## Description

Configure the Astro workspace to import TypeScript modules from the repo's
`src/lib/` directory. Verify that `Library.fromDirectory()`, `Card`, `WikiLink`,
and all graph metrics are accessible from Astro components and content collection
scripts.

## Context

Astro supports TypeScript imports natively. The challenge is cross-workspace
imports: `packages/viewer/` needs to import from `src/lib/` at the repo root.
This may require a TypeScript path alias or a workspace-level export in the root
package.json. The graph parser depends on `gray-matter` for frontmatter parsing.

## Acceptance Criteria

```gherkin
Feature: Graph parser integration

  Scenario: Import graph parser in Astro component
    Given packages/viewer/ is configured with TypeScript path aliases
    When an Astro component imports Library from src/lib/graph.ts
    Then the import resolves without errors
    And Library.fromDirectory() returns a Library instance

  Scenario: Parse the actual library
    Given the viewer imports the graph parser
    When Library.fromDirectory is called with docs/alexandria/library/
    Then it returns a Library with ~190 cards
    And type distribution, broken links, and orphan counts are available

  Scenario: WikiLink data accessible
    Given a Library instance is loaded
    When accessing a card's allLinks property
    Then each WikiLink has target, targetType, targetName, context, and sourceSection
```

## Implementation Notes

Add a `tsconfig.json` path alias in `packages/viewer/` that maps `@lib/*` to
`../../src/lib/*`. Alternatively, use Astro's `vite.resolve.alias` config. Test
with a simple Astro page that imports `Library` and renders card count. Ensure
`gray-matter` is available (may need to be listed in viewer's package.json or
hoisted by workspace).
