---
id: FEAT-025
title: "alxndr lint paths — file path resolution checks"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker]
---

## Motivation

Skill files and agent definitions reference other files by path. When those targets are moved or deleted, the references break silently. This lint target catches broken file references mechanically.

## Description

Implement `alxndr lint paths <path>` that scans skill files (`skills/**/*.md`) and agent definitions (`agents/*.md`) for file path references and verifies each target exists on disk. Missing targets produce a warning-severity finding.

## Context

This is the first of six new lint targets from sweep 6 (cross-system checks). The rule family "path resolution" from `skills/nit/sweeps.md`: "Skill files and agent definitions that reference other files by path — does the target exist? Missing = warning."

## Acceptance Criteria

- [ ] Scans all `.md` files in `skills/` and `agents/` directories
- [ ] Detects file path references (absolute paths, relative paths from file location)
- [ ] Missing targets produce warning-severity findings
- [ ] Existing (valid) paths produce no findings
- [ ] Deterministic tests with fixture files (valid paths, broken paths)

## Implementation Notes

Path references in markdown typically appear as: code blocks with file paths, `Read` tool references, explicit path strings. Start with a regex for common patterns (`src/...`, `bin/...`, `docs/...`, `skills/...`) and verify with `existsSync`. The `<path>` argument is the repo root, not the library directory.
