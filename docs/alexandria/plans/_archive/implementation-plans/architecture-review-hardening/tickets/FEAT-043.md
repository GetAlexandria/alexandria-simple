---
id: FEAT-043
title: "Update all play/agent references from Nit dispatch to alxndr lint CLI calls"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-037, FEAT-038, FEAT-039, FEAT-040, FEAT-041, FEAT-042]
blocks: [FEAT-046]
cards: [Capability - Linting, Artifact - Play Definition]
---

## Motivation

Once all mechanical checks are software in the lint CLI (FEAT-037 through FEAT-042), every play step that currently says "dispatch Nit" or "hand off to Nit" should instead say "run `alxndr lint [target]`." This completes the shift from agentic to deterministic for structural checks.

## Description

Search all agent files (`agents/*.md`), skill files (`skills/**/*.md`), and the playbook (`docs/design/playbook.md`) for references to Nit as a dispatched agent. Replace each with the appropriate `alxndr lint` CLI command, preserving the same check scope.

Common patterns to replace:
- "Hand off to Nit for sweeps 1-4" → "Run `alxndr lint lines cards graph layers <library-path>`"
- "Nit regression check" → "Run `alxndr lint all <library-path>`"
- "Nit antagonistic check (sweep 6 grades)" → "Run `alxndr lint grades <library-path>`"
- "After Bridget assembles, Nit checks briefing" → "Run `alxndr lint briefings <briefing-path>`"

## Context

Nit appears in approximately 20 play steps across the playbook and in agent files for Conan, Sam, Raven, Bridget, and Solomon (division of labor sections). The replacement is mechanical but must preserve the check scope at each step — don't change WHAT is checked, only HOW.

## Acceptance Criteria

- [ ] Zero references to Nit as a dispatched sub-agent in any agent or skill file
- [ ] Every former Nit dispatch replaced with specific `alxndr lint` command
- [ ] Playbook plays updated with CLI calls at correct steps
- [ ] Division of labor sections in all agent files updated (remove Nit line, note CLI usage)
- [ ] No functional change — same checks happen at same play steps

## Implementation Notes

Use grep/ripgrep to find all Nit references first. Build a mapping of each reference to the appropriate lint command before making changes. Some references are in prose descriptions (keep informational mentions but remove dispatch instructions).
