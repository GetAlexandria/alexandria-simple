---
id: FEAT-004
title: "Astro content collection for library cards"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-005, FEAT-006, FEAT-007]
cards: [Artifact - Library Card, Artifact - Library Folder Structure]
---

## Motivation

Astro's content collections provide typed, validated access to markdown content
with automatic page generation. This is the data layer that maps library cards
to browsable pages.

## Description

Define an Astro content collection that reads markdown files from
`docs/alexandria/library/`. Configure routing so each card gets a URL derived
from its type and name (e.g., `/library/product/systems/system-knowledge-graph`).
Preserve the folder hierarchy in URL paths so the URL structure mirrors the
filesystem.

## Context

Library cards are organized as `docs/alexandria/library/{layer}/{type-plural}/Type - Name.md`.
Cards may or may not have YAML frontmatter. The card's type and name are encoded
in the H1 heading (`# Type - Name`) and the filename. Astro content collections
can reference files outside `src/content/` using symlinks or custom loaders.

Anti-pattern: do not reorganize cards by temporal status (Anti-Pattern: Temporal
Folder Structure). The URL hierarchy must match the filesystem hierarchy.

## Acceptance Criteria

```gherkin
Feature: Library card content collection

  Scenario: All library cards are discovered
    Given the content collection points to docs/alexandria/library/
    When Astro builds the collection
    Then every .md file in library/ (excluding SKIP_FILES) has a collection entry
    And each entry includes the card's layer, type folder, and filename

  Scenario: Card URLs mirror folder structure
    Given a card at library/product/systems/System - Knowledge Graph.md
    When the viewer generates its page
    Then the page URL is /library/product/systems/system-knowledge-graph

  Scenario: Card content is accessible
    Given a card collection entry exists
    When an Astro page renders it
    Then the raw markdown content is available for rendering
    And any YAML frontmatter is parsed and accessible as data
```

## Implementation Notes

Astro content collections in v4+ support custom loaders. Define a custom loader
in `packages/viewer/src/content/config.ts` that scans `docs/alexandria/library/`
recursively, reads each markdown file, parses frontmatter with `gray-matter`, and
returns structured entries. Generate URL slugs by lowercasing and hyphenating the
card name. The loader should respect `SKIP_FILES` from the graph parser constants.
