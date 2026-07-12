---
id: FEAT-012
title: "File watching configuration and static build mode"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-002]
blocks: []
cards: [Artifact - Decision 3: Markdown Over Database]
---

## Motivation

The dev server must regenerate pages when library markdown files change on disk.
Without explicit file watching configuration, Astro only watches files inside
`src/` by default. Since the library lives outside the viewer package, we need
to configure Astro to watch the external `docs/alexandria/` directory.

## Description

Configure Astro's dev server to watch `docs/alexandria/library/` and
`docs/alexandria/implementation-plans/` for file changes. When a markdown file
is created, modified, or deleted, the content collections should refresh and
affected pages should hot-reload. Verify that static build mode
(`alexandria-viewer build`) produces a complete, self-contained HTML output.

## Context

Astro's dev server uses Vite under the hood. Vite can be configured to watch
additional directories via `server.watch.paths` or `vite.server.watch`. The
content collection custom loaders from FEAT-004 and FEAT-009 read from external
directories; the watcher needs to trigger collection invalidation when those
files change. Decision D3 (Markdown Over Database) means the filesystem is the
source of truth and changes happen as file edits.

## Acceptance Criteria

```gherkin
Feature: File watching and static build

  Scenario: Detect new card file
    Given the dev server is running
    When I create a new markdown file in docs/alexandria/library/product/systems/
    Then the viewer detects the change within 2 seconds
    And the new card appears in the sidebar and is browsable

  Scenario: Detect card edit
    Given the dev server is running and a card page is open
    When I edit the card's markdown file on disk
    Then the browser refreshes and shows the updated content

  Scenario: Detect card deletion
    Given the dev server is running
    When I delete a card's markdown file
    Then the viewer removes the card from the sidebar
    And navigating to the old URL shows a 404 or redirect

  Scenario: Static build completeness
    Given the library has 190 cards and 4 plans
    When I run bin/alexandria-viewer build
    Then dist/ contains HTML pages for all cards, all plans, and the dashboard
    And all internal links resolve to existing HTML files
    And no external requests are needed to view the site
```

## Implementation Notes

In `packages/viewer/astro.config.mjs`, configure `vite.server.watch` to include
the `docs/alexandria/` path. For content collection invalidation, Astro's custom
loaders may need a file watcher hook or the `watchFiles` Vite plugin option.
For static builds, verify with a link checker that all internal URLs resolve.
Consider adding a `--open` flag to the CLI that auto-opens the browser.
