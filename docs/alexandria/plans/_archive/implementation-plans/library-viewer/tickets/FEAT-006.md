---
id: FEAT-006
title: "Wikilink remark plugin for clickable navigation"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003, FEAT-004]
blocks: []
cards: [System - Knowledge Graph, Experience Goal - Legible Graph, Artifact - Naming Convention]
---

## Motivation

Wikilinks are the connective tissue of the library graph. Without a rendering
plugin, `[[Type - Name]]` appears as raw text instead of clickable navigation.

## Description

Build a remark/rehype plugin that transforms `[[Type - Name]]` wikilink syntax
into HTML links pointing to the correct card page URL. The plugin should use the
graph parser's `WIKILINK_RE` regex for consistency. Display the context phrase
inline alongside the link (decision D5). Visually distinguish broken links
(target does not exist) from resolved ones.

## Context

Wikilinks follow the pattern `[[Type - Name]] -- context phrase` (see Artifact -
Naming Convention). The graph parser's `WIKILINK_RE` (`/\[\[([^\]]+)\]\]/g`)
extracts them. The content collection (FEAT-004) provides the card inventory for
resolution. The Legible Graph experience goal requires context phrases to be
visible, not hidden behind tooltips.

## Acceptance Criteria

```gherkin
Feature: Wikilink rendering

  Scenario: Resolve a valid wikilink
    Given a card contains [[System - Knowledge Graph]] in its WHERE section
    When the card page renders
    Then "System - Knowledge Graph" appears as a clickable link
    And clicking it navigates to the Knowledge Graph card page

  Scenario: Display context phrase inline
    Given a card contains [[System - Knowledge Graph]] -- parses card relationships
    When the card page renders
    Then the link text is "System - Knowledge Graph"
    And the context phrase "parses card relationships" appears as styled text after the link

  Scenario: Broken wikilink styling
    Given a card contains [[System - Nonexistent]]
    When the card page renders
    Then "System - Nonexistent" appears with broken-link styling (e.g., red, strikethrough)
    And it is not clickable

  Scenario: Multiple wikilinks in one line
    Given a card line contains [[Principle - A]] and [[Principle - B]]
    When the card page renders
    Then both render as separate clickable links
```

## Implementation Notes

Create a remark plugin at `packages/viewer/src/plugins/remark-wikilinks.ts`. The
plugin walks the markdown AST, finds text nodes matching `WIKILINK_RE`, and
replaces them with link nodes. Build a card name-to-URL lookup map from the content
collection at build time. Register the plugin in `astro.config.mjs` under
`markdown.remarkPlugins`. Use a CSS class for broken links vs resolved links.
