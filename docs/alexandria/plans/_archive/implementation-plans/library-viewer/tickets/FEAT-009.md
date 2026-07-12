---
id: FEAT-009
title: "Plans content collection and routing"
outcome: O-5
tier: should
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-010]
cards: [Agent - Bridget the Briefer]
---

## Motivation

Implementation plans have a different structure from library cards (release.md +
outcomes/ + tickets/) and need their own content collection and URL routing to
render properly in the viewer.

## Description

Define an Astro content collection for implementation plans that reads from
`docs/alexandria/implementation-plans/`. Each plan directory becomes a plan entry.
Within each plan, discover and parse: `release.md`, `outcomes/O-*.md`, and
`tickets/FEAT-*.md` (plus SPIKE-*, PROTO-*). Route each plan to `/plans/<name>/`
with sub-routes for outcomes and tickets.

## Context

Plans live at `docs/alexandria/implementation-plans/<name>/` and contain:
- `release.md` with YAML frontmatter (plan, status, version, dates)
- `outcomes/O-*.md` with frontmatter (id, title, tier, cards)
- `tickets/FEAT-*.md` with frontmatter (id, title, outcome, tier, enabler, etc.)
- Optional: `CONTEXT_BRIEFING.md`, `library-updates.md`

Anti-pattern: Planning Without Library Separation. Plans must remain a distinct
section from the library card browser.

## Acceptance Criteria

```gherkin
Feature: Plans content collection

  Scenario: Discover all plans
    Given docs/alexandria/implementation-plans/ has 4 plan directories
    When the plans collection builds
    Then 4 plan entries exist in the collection
    And each has its release.md content and frontmatter

  Scenario: Discover outcomes within a plan
    Given a plan has outcomes/O-1.md and outcomes/O-2.md
    When the plan is loaded
    Then both outcomes are accessible with their frontmatter and content

  Scenario: Discover tickets within a plan
    Given a plan has tickets/FEAT-001.md through FEAT-005.md
    When the plan is loaded
    Then all 5 tickets are accessible with their frontmatter and content

  Scenario: Plan URL routing
    Given a plan named "library-viewer"
    When I navigate to /plans/library-viewer/
    Then the plan's release.md renders as the page content
```

## Implementation Notes

Create a custom Astro content loader that scans `implementation-plans/` directories.
For each subdirectory, read `release.md` as the primary document and collect
`outcomes/*.md` and `tickets/*.md` as related entries. Use `gray-matter` for
frontmatter parsing (consistent with the graph parser). Generate routes:
`/plans/[name]/`, `/plans/[name]/outcomes/[id]`, `/plans/[name]/tickets/[id]`.
