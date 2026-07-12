---
id: FEAT-011
title: "Alexandrian Tailwind theme with palette and typography"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: []
cards: [Experience Goal - Well-Run Franchise]
---

## Motivation

The viewer's visual identity should evoke the Library of Alexandria: old-timey,
refined, professional. A consistent Tailwind theme ensures every page shares
the same visual language without ad-hoc styling decisions.

## Description

Create a Tailwind CSS theme configuration with an Alexandrian aesthetic: warm
parchment/papyrus background tones, deep ink-like text colors, serif typography
for headings, clean sans-serif for body text, and subtle accent colors for
interactive elements. Define color scales, typography scale, spacing, and
component patterns (cards, badges, navigation).

## Context

The aesthetic direction comes from the five pairs in `sources/aesthetic-goals.md`:
crisp not chaotic, orderly not wild, collegial not emergent, swift not surprising,
professional not daffy. The north star is "a well-run franchise." The viewer
should feel like walking into a well-organized library: clean, quiet, purposeful.

The Well-Run Franchise experience goal means visual consistency is more important
than visual flair. Every page should look like it belongs.

## Acceptance Criteria

```gherkin
Feature: Alexandrian visual theme

  Scenario: Consistent color palette
    Given the Tailwind config defines the Alexandrian palette
    When any page renders in the viewer
    Then backgrounds use warm parchment tones (not stark white)
    And text uses deep ink colors (not pure black)
    And interactive elements use a consistent accent color

  Scenario: Typography hierarchy
    Given the theme defines heading and body fonts
    When a card page renders
    Then H1 (card name) uses a serif font
    And body text uses a clean sans-serif font
    And the type scale provides clear visual hierarchy

  Scenario: Component consistency
    Given the theme defines component patterns
    When the sidebar, dashboard, and card page render
    Then all use the same spacing, border, and shadow conventions
    And the overall impression is "organized library," not "creative showcase"
```

## Implementation Notes

Extend `packages/viewer/tailwind.config.mjs` with custom theme values. Define
color palette: `parchment` (warm beige scale for backgrounds), `ink` (deep brown
to near-black for text), `gold` (warm accent for links and highlights),
`terracotta` (alert/broken link color). Use Google Fonts or system fonts: a serif
like Merriweather, Lora, or Crimson Text for headings; Inter or system-ui for body.
Create a `packages/viewer/src/styles/global.css` with base Tailwind layers.
