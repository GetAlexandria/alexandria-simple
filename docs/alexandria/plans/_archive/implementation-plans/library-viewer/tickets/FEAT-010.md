---
id: FEAT-010
title: "Plan detail view with linked outcomes and tickets"
outcome: O-5
tier: should
enabler: false
blocked-by: [FEAT-009]
blocks: []
cards: [Agent - Bridget the Briefer]
---

## Motivation

A plan is more than its release.md. Users need to see the full picture: what was
the goal, what outcomes were targeted, what tickets were created, and how they
relate. This view assembles the plan hierarchy into a coherent page.

## Description

Build a plan detail page layout that renders the release.md as the main content
and includes linked sections for outcomes (with tier badges) and tickets (with
status, tier, and dependency info). Show the outcome-to-ticket mapping so users
can trace from goal to deliverables.

## Context

Release.md includes a Success Outcomes table and a Ticket Index table with
columns for ID, title, tier, enabler, outcome, blocked-by, and blocks. Outcomes
have tiers (must/should/could). Tickets have dependency relationships. The plan
view should make these relationships navigable, not just listed.

## Acceptance Criteria

```gherkin
Feature: Plan detail view

  Scenario: Render plan overview
    Given a plan with release.md containing Goal, Scope, and Outcomes sections
    When I navigate to /plans/library-viewer/
    Then the release.md content renders as the main page content
    And plan status from frontmatter is displayed prominently

  Scenario: Outcomes section with tier badges
    Given a plan with 3 must outcomes and 2 should outcomes
    When the plan page renders the outcomes section
    Then each outcome shows its title and tier as a colored badge
    And clicking an outcome navigates to its detail page

  Scenario: Tickets section with dependency info
    Given a plan with tickets that have blocked-by relationships
    When the plan page renders the tickets section
    Then each ticket shows its ID, title, tier, and outcome
    And dependency relationships are visible (blocked-by, blocks)

  Scenario: Outcome-to-ticket traceability
    Given outcome O-1 has 3 tickets traced to it
    When I view the outcomes section
    Then O-1 shows the 3 linked ticket IDs
    And each ticket ID links to its detail page
```

## Implementation Notes

Create `packages/viewer/src/layouts/PlanLayout.astro` for the plan detail page.
Render release.md markdown as the main content area. Below it, add an outcomes
panel (React component with tier badges using Tailwind colors: must=red,
should=amber, could=green) and a tickets panel (sortable table or card grid).
Build the outcome-to-ticket mapping from ticket frontmatter `outcome` field.
