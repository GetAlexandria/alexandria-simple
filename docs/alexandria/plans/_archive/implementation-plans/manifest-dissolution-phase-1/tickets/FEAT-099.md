---
id: FEAT-099
title: "Implement ax config show"
outcome: O-1
tier: should
enabler: false
blocked-by: []
blocks: [FEAT-102]
cards: [Capability - Inventory, System - Knowledge Graph]
---

## Motivation

The manifest.md Header section (lines 1-14) records library configuration —
mode, novelty, complexity, covered/deferred areas. That information is
already in `alexandria-config.json`. Surfacing it via `ax config show`
removes the need for the manifest header entirely.

`ax cards --help` self-documentation shipped with FEAT-096 because the command
is not useful without discoverable flags. This ticket keeps the remaining config
surface separate.

## Description

Add **`ax config show`** — read `docs/alexandria/alexandria-config.json` and
print its contents. Default rendering is a human-readable summary (mode, area
count by tier, gap count). `--json` emits the raw JSON.

## Context

Reference cards:

- `[[Capability - Inventory]]` — WHEN section records the config and help additions

`alexandria-config.json` already contains everything the manifest header
records. The display logic should be lossless when `--json` is passed and
human-friendly otherwise.

Anti-pattern: do not duplicate config schema definitions. Read the file as
typed JSON; do not hand-roll a parallel schema.

## Acceptance Criteria

- [ ] `ax config show` exits 0 and prints a human-readable summary of `alexandria-config.json`
- [ ] `ax config show --json` emits the raw config file contents
- [ ] If `alexandria-config.json` is missing, `ax config show` exits non-zero with a clear error message
- [ ] Black-box integration tests cover the config surface
- [ ] `bun run check` passes

## Implementation Notes

Config path resolution: same convention as other `ax` tools. Walk up from
cwd looking for `docs/alexandria/alexandria-config.json` (or accept an
explicit `--config` flag).

Help text source: define help strings inline at the command level. Don't
build a separate help-generation framework — the existing CLI router
likely has a help mechanism already (verify in `packages/ax/src/cli/`).

This ticket is independent of FEAT-096/097/098 and can land in parallel —
it has no dependencies on the new parser or the list command. It only
blocks FEAT-102 (Conan prompt update), which references `ax config show`
in its updated instructions.
