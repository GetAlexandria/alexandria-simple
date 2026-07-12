---
id: FEAT-102
title: "Update Agent - Conan prompt to use CLI for inventory queries; fix stale scoreboard-derivation.md reference"
outcome: O-3
tier: should
enabler: false
blocked-by: [FEAT-096, FEAT-098, FEAT-099]
blocks: []
cards: [Agent - Conan, Capability - Inventory]
---

## Motivation

`Agent - Conan` is the primary agent reader of manifest.md inventory. His
prompt instructs him to read manifest.md tables to understand "what cards
exist by type and area" before grading, surgery planning, or health checks.

After FEAT-096 and FEAT-098 land, the CLI is the better surface for those
queries. This ticket updates Conan's prompt to point at the CLI for the
inventory half. Manifest.md continues to be referenced for the
expected-cards and judgment-notes halves until Phase 2.

The stale reference in `scoreboard-derivation.md` lines 181-182 — which
mentions "the latest Conan inventory or manifest" as a source readiness
signal — is also corrected here to reflect the CLI shift.

## Description

Two coordinated edits:

1. **`packages/alexandria-plugin/agents/conan.md`** (Conan's prompt) — locate
   sections that instruct him to read manifest.md inventory tables.
   Replace those instructions with calls to:
   - `ax cards list [--type <T>] [--layer <L>]`
   - `ax cards list --summary` for type counts
   - `ax cards list --json` for machine-readable output
   - `ax config show` for library-level configuration
   Keep instructions to read manifest.md for expected-cards (gap analysis)
   and judgment-notes sections — those still live there in Phase 1.

2. **`packages/alexandria-plugin/docs/initialize/scoreboard-derivation.md`**
   lines 181-182 — update the source-readiness rule to acknowledge that
   inventory is now reached via CLI, not manifest. Reword the bullet so it
   describes the post-Phase-1 reality.

## Context

Reference cards:

- `[[Agent - Conan]]` — WHEN section records the prompt update
- `[[Capability - Inventory]]` — Conan's primary tool surface for inventory

Conan's prompt is eval-covered. After editing, run the Conan eval suite
per the build standard (`pnpm eval -- run conan/<case>`). If scores
regress, diagnose before merging.

Anti-pattern: do not delete manifest.md instructions wholesale. Conan
still reads expected-cards and judgment-notes from manifest.md. Be
surgical — replace inventory-table reads with CLI calls; leave the rest.

## Acceptance Criteria

- [ ] `conan.md` prompt updated: every reference to reading manifest.md inventory tables is replaced with the appropriate `ax cards` or `ax config` invocation
- [ ] Manifest.md instructions for expected-cards and judgment-notes sections remain intact
- [ ] The new instructions reference `[[Standard - Card Frontmatter Schema]]` so Conan knows where the canonical schema lives
- [ ] `scoreboard-derivation.md` lines 181-182 updated to describe the CLI-first inventory path
- [ ] Conan eval suite runs with no regression (`pnpm eval -- compare conan/<case>` shows scores hold or improve)
- [ ] If scores improve, the new baseline is checked in
- [ ] `bun run check` passes

## Implementation Notes

This is the most consequential agent-facing change in Phase 1. Conan is
the critical reader. A subtle prompt regression could cascade into
worse grading or surgery planning across the library.

Mitigation: keep a fallback note in the prompt during transition — "if
`ax cards list` is unavailable, fall back to reading manifest.md
inventory tables" — so a stale plugin install doesn't break Conan
entirely. Remove the fallback in Phase 2.

Run the Conan eval before and after. Capture the comparison in the PR
description. If a case regresses, diagnose the prompt diff and adjust
before merging.
