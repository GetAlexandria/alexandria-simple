---
id: FEAT-005
title: "Card page layout with five-dimension sections"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-004]
blocks: []
cards: [Artifact - Library Card, Standard - Five-Dimension Card Requirements, Experience Goal - Legible Graph]
---

## Motivation

Cards are the atomic unit of the library. Their five-dimension structure (WHAT,
WHERE, WHY, WHEN, HOW) is the fundamental visual pattern the viewer must render
faithfully.

## Description

Build an Astro page layout for individual library cards. Parse the card's H2
sections and render each dimension as a visually distinct section. Display the
card type and name in the page header. Render markdown content within each
section (lists, code blocks, inline formatting).

## Context

Every card follows the five-dimension pattern: WHAT (definition), WHERE (ecosystem
links), WHY (rationale), WHEN (timeline), HOW (implementation). Some cards may
have additional subsections (### Examples, ### Anti-Examples under HOW). The
Standard - Five-Dimension Card Requirements defines the structural contract.

The Legible Graph experience goal means the layout should make structure scannable:
clear section headers, consistent spacing, visual hierarchy that makes it obvious
which dimension you're reading.

## Acceptance Criteria

```gherkin
Feature: Card page layout

  Scenario: Render a complete card
    Given a card with all five dimensions populated
    When the card page loads in the browser
    Then the card type and name appear as the page title
    And each dimension (WHAT, WHERE, WHY, WHEN, HOW) renders as a labeled section
    And markdown formatting (lists, bold, code) renders correctly within sections

  Scenario: Render a card with missing dimensions
    Given a card that is missing the WHEN section
    When the card page loads
    Then the present dimensions render normally
    And there is no empty placeholder for WHEN (graceful absence)

  Scenario: Render HOW subsections
    Given a card with ### Examples and ### Anti-Examples under HOW
    When the card page loads
    Then examples and anti-examples render as subsections within HOW
```

## Implementation Notes

Create `packages/viewer/src/layouts/CardLayout.astro` with the five-dimension
rendering logic. Use the card's parsed sections (from the content collection entry
or graph parser) to conditionally render each dimension. Apply Tailwind classes for
visual hierarchy: prominent WHAT section, compact WHERE links, etc. Consider using
a React component for interactive elements (collapsible sections if cards are long).
