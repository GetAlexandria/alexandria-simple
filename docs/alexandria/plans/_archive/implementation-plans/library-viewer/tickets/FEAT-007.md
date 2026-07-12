---
id: FEAT-007
title: "Sidebar directory tree component"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-001, FEAT-004]
blocks: []
cards: [Artifact - Library Folder Structure, Artifact - Type Taxonomy]
---

## Motivation

Without navigation, users can only reach cards via direct URL or wikilinks from
other cards. The sidebar tree provides the primary discovery and wayfinding
mechanism, mirroring the filesystem hierarchy that encodes the type taxonomy.

## Description

Build a React sidebar component that renders the library folder structure as an
expandable/collapsible tree. Top-level nodes are layers (rationale, product,
experience). Second-level nodes are type folders (systems, capabilities, etc.).
Leaf nodes are individual cards. The current page's card is highlighted. The tree
persists its expanded/collapsed state during navigation.

## Context

The folder structure follows `library/{layer}/{type-plural}/Type - Name.md` (see
Artifact - Library Folder Structure). Layers are: rationale, product, experience.
Type folders use plural names (systems, capabilities, standards, etc.). The
sidebar should NOT reorganize by temporal status (anti-pattern: Temporal Folder
Structure).

## Acceptance Criteria

```gherkin
Feature: Sidebar directory tree

  Scenario: Tree renders library hierarchy
    Given the viewer is loaded with a library containing cards
    When the sidebar renders
    Then top-level nodes show layer names (rationale, product, experience)
    And expanding a layer shows its type folders
    And expanding a type folder shows individual card names

  Scenario: Navigate via sidebar
    Given the sidebar is showing the tree
    When I click on "System - Knowledge Graph" in the sidebar
    Then the browser navigates to the Knowledge Graph card page
    And the sidebar highlights that card

  Scenario: Expand/collapse persistence
    Given I have expanded the product > systems folder
    When I navigate to a different card page
    Then the product > systems folder remains expanded

  Scenario: Current card highlighting
    Given I am viewing the Knowledge Graph card page
    When I look at the sidebar
    Then "System - Knowledge Graph" is visually highlighted as the current page
```

## Implementation Notes

Create `packages/viewer/src/components/Sidebar.tsx` as a React component with
`client:load` directive for interactivity. Build the tree data from the content
collection entries at build time, grouping by layer and type folder. Use
`localStorage` or React state for expand/collapse persistence. Apply Tailwind
classes for indentation, icons (folder/file), and active state highlighting.
