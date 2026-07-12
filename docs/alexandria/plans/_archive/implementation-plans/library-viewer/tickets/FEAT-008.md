---
id: FEAT-008
title: "Dashboard overview page with library metrics"
outcome: O-4
tier: should
enabler: false
blocked-by: [FEAT-001, FEAT-003]
blocks: []
cards: [System - Knowledge Graph, Principle - Structural Quality Before Functional Quality]
---

## Motivation

Library maintainers need an at-a-glance view of library health without running
CLI tools. The dashboard surfaces the metrics the graph parser already computes,
making structural quality visible.

## Description

Build the viewer's landing page as a dashboard that displays library-wide metrics:
total card count, type distribution (table or chart), layer distribution, broken
link count, orphan card count, and link density. Each metric should link to a
detail view (e.g., clicking broken links shows the list of broken links).

## Context

`Library.toDict()` from the graph parser returns: `cardCount`, `edgeCount`,
`brokenLinkCount`, `orphanCount`, `typeDistribution` (map of type to count),
`layerDistribution` (map of layer to count), `linkDensity`. The dashboard
consumes this data at build time. The Structural Quality principle means
structural health metrics should be prominent, not buried.

Anti-pattern: QA by Dumping. The dashboard should surface actionable metrics,
not raw data dumps. Show counts with visual indicators (green/yellow/red) rather
than listing every card.

## Acceptance Criteria

```gherkin
Feature: Dashboard overview

  Scenario: Dashboard displays key metrics
    Given the library has been parsed by the graph parser
    When the dashboard page loads
    Then it shows total card count
    And it shows type distribution as a table or chart
    And it shows broken link count with visual severity indicator
    And it shows orphan card count

  Scenario: Navigate from metric to detail
    Given the dashboard shows 3 broken links
    When I click on the broken links metric
    Then I see a list of the 3 broken wikilinks with source card and target name

  Scenario: Dashboard with healthy library
    Given a library with zero broken links and zero orphans
    When the dashboard loads
    Then health indicators show green/positive status

  Scenario: Type distribution visualization
    Given the library has cards across multiple types
    When the dashboard loads
    Then each type shows its count
    And types are sorted by count descending
```

## Implementation Notes

Create `packages/viewer/src/pages/index.astro` as the dashboard. Call
`Library.fromDirectory()` at build time (in the Astro frontmatter script) to
get the `LibraryDict`. Render metrics using React components for any interactive
elements (expandable detail sections, chart). Use Tailwind for the card/grid
layout. Consider a simple bar chart for type distribution using CSS or a
lightweight chart library.
