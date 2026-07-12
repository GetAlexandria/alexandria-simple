---
id: FEAT-001
title: "Initialize Astro workspace package with Bun, React, and Tailwind"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-002, FEAT-003, FEAT-004, FEAT-007, FEAT-008, FEAT-009, FEAT-011]
cards: []
---

## Motivation

Every other ticket depends on the Astro project existing. This is the foundation
that all viewer features build on.

## Description

Create `packages/viewer/` as a Bun workspace package with Astro, React, and
Tailwind CSS configured. Set up the monorepo workspace link in the root
`package.json`. Include a minimal Astro config with React and Tailwind
integrations enabled.

## Context

The repo uses Bun as its runtime (see CLAUDE.md). The viewer lives in
`packages/viewer/` as decided during planning (D1). Astro supports Bun natively.
The existing `package.json` at repo root will need a `workspaces` field added.

## Acceptance Criteria

```gherkin
Feature: Astro workspace initialization

  Scenario: Fresh workspace setup
    Given the repository has no packages/viewer/ directory
    When I run bun install from the repo root
    Then packages/viewer/ is linked as a workspace package
    And packages/viewer/node_modules includes astro, @astrojs/react, and @astrojs/tailwind

  Scenario: Astro dev server starts
    Given packages/viewer/ is initialized with Astro config
    When I run bun --cwd packages/viewer astro dev
    Then a local dev server starts on the default port
    And the browser shows the Astro welcome page

  Scenario: Astro build produces static output
    Given packages/viewer/ is initialized with Astro config
    When I run bun --cwd packages/viewer astro build
    Then a dist/ directory is created with HTML files
```

## Implementation Notes

Create `packages/viewer/package.json` with dependencies: `astro`, `@astrojs/react`,
`@astrojs/tailwind`, `react`, `react-dom`, `tailwindcss`. Create
`packages/viewer/astro.config.mjs` with React and Tailwind integrations. Create a
minimal `packages/viewer/src/pages/index.astro` placeholder. Add `"workspaces"`
field to root `package.json`.
