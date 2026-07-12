---
id: FEAT-002
title: "Create CLI entry point for the viewer"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-012]
cards: [Artifact - Decision 3: Markdown Over Database]
---

## Motivation

Users need a single command to start the viewer. The CLI entry point makes the
viewer a first-class Alexandria tool alongside `alxndr lint`, `alxndr grade`,
etc.

## Description

Create `bin/alexandria-viewer` following the existing wrapper pattern. The script
delegates to a TypeScript entry point that starts the Astro dev server or runs a
static build, depending on the subcommand.

## Context

All Alexandria CLI tools follow the wrapper pattern in `bin/_alexandria-wrapper-lib.sh`:
bash script resolves the plugin root, then calls `alexandria_exec` which prefers
compiled binaries and falls back to `bun run`. The viewer CLI should accept
subcommands: `serve` (default, starts dev server), `build` (static export).

## Acceptance Criteria

```gherkin
Feature: Viewer CLI entry point

  Scenario: Start dev server with default command
    Given the viewer workspace is initialized
    When I run bin/alexandria-viewer
    Then the Astro dev server starts on the default port
    And the terminal shows the local URL

  Scenario: Start dev server with explicit serve command
    Given the viewer workspace is initialized
    When I run bin/alexandria-viewer serve
    Then the Astro dev server starts on the default port

  Scenario: Build static site
    Given the viewer workspace is initialized
    When I run bin/alexandria-viewer build
    Then Astro produces a static build in packages/viewer/dist/

  Scenario: Custom port
    Given the viewer workspace is initialized
    When I run bin/alexandria-viewer serve --port 4321
    Then the dev server starts on port 4321
```

## Implementation Notes

Create `bin/alexandria-viewer` bash wrapper. Create `src/tools/viewer.ts` as the
TypeScript entry point that parses args and invokes `astro dev` or `astro build`
programmatically or via subprocess. Pass the library path as a config value so
Astro knows where to find content.
