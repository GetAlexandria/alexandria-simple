---
id: FEAT-004
title: Vision source intake adds real source items
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-005, FEAT-006]
cards: [System - Alexandria Next Runtime, System - Viewer Next]
---

## Motivation

Sources are how information enters Alexandria, not a Raven-only form field. The Vision screen needs one-at-a-time source intake that creates durable shared source items and attaches them to the Vision flow.

## Description

Add the Vision source strip and source intake MVP. The user can add a file, add a URL that is fetched into a Markdown file under `docs/alexandria/sources/originals/`, or add a typed note saved as Markdown under the same originals directory. Each intake appends ledger events, rewrites the `sourcesPath` projection, and attaches the source ID to Vision onboarding.

## Context

`sourcesPath` defaults to `.alexandria-next/sources.jsonl`. The projection is reducer-produced and atomically rewritten. Source-code kind may exist in the schema but source-code processing is out of scope.

## Acceptance Criteria

- [ ] Vision onboarding shows an `Add sources` area at the top.
- [ ] Adding a file creates a `SourceItem` in the `sourcesPath` projection.
- [ ] Adding a URL fetches the URL and saves a Markdown file under `docs/alexandria/sources/originals/`.
- [ ] Adding a typed note saves Markdown under `docs/alexandria/sources/originals/`.
- [ ] New source items are attached to `onboarding.vision.sourceItemIds`.
- [ ] Existing slot text/status is unchanged when sources are added.
- [ ] No source sliders or "one per line" textarea is introduced.

## Verification

### Web UI

- [ ] Add a file source and verify it appears in the Vision source strip.
- [ ] Add a URL source and verify it appears as a file-backed source item.
- [ ] Add a typed note and verify it appears as a file-backed source item.
- [ ] Reload the viewer and verify sources remain visible.

### CLI

- [ ] Inspect `.alexandria-next/sources.jsonl` and verify one JSONL record per source item.
- [ ] Inspect `docs/alexandria/sources/originals/` and verify URL/note captures are saved as Markdown files.
- [ ] Verify ledger events include `source.added` and `raven.vision.source_attached`.
- [ ] Runtime/API tests prove source projection rewrite is atomic or safe-overwrite.

## Implementation Notes

Keep original URL and capture metadata in the generated Markdown file, not in the core `SourceItem` shape. Deletion/removal is deferred.
