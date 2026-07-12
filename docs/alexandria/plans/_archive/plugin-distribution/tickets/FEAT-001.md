---
id: FEAT-001
title: "Create dist-include manifest and build-tarball script"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-002, FEAT-003, FEAT-005]
cards: []
---

## Motivation

The tarball is the core distribution artifact. Everything else (install script, CI,
hosting) depends on having a reliable, repeatable way to produce a stripped archive
that contains only runtime files.

## Description

Create two files:
1. `dist-include.txt` — a manifest listing every file and directory needed at runtime
2. `scripts/build-tarball.sh` — a shell script that reads the manifest, copies files
   to a staging directory, excludes dev-only files (`*.test.ts`, eval infrastructure),
   and produces `alexandria-v{VERSION}.tar.gz`

## Context

The full repo is ~7.3 MB. Runtime-essential files total ~1.2 MB. The key runtime
dependency outside the obvious directories is `docs/wizard/wizard-engine.yaml`,
which is loaded by `src/tools/wizard.ts` at runtime. Everything else in `docs/`
is dev-only.

The `src/` directory contains `*.test.ts` files co-located with source — these must
be excluded from the tarball even though `src/` itself is included.

## Acceptance Criteria

- [ ] `dist-include.txt` exists and lists all runtime files/directories
- [ ] `scripts/build-tarball.sh` produces a tarball named `alexandria-v{VERSION}.tar.gz`
- [ ] Tarball excludes: `tests/`, `docs/design/`, `docs/adrs/`, `docs/plans/`, `docs/alexandria/`, `*.test.ts`, `EVALS.md`, `.github/`, `CLAUDE.md`
- [ ] Tarball includes: `docs/wizard/wizard-engine.yaml`, all agents, skills, bin wrappers, src, templates, config
- [ ] Extracting the tarball and running `./setup` produces a functional plugin
- [ ] Script is idempotent — running it twice produces identical tarballs

## Implementation Notes

Use `rsync --files-from=dist-include.txt` with `--exclude` patterns for test files.
Read VERSION from the `VERSION` file. Test locally by extracting to a temp dir and
running `./setup` + verifying plugin loads.

Files touched: `dist-include.txt` (new), `scripts/build-tarball.sh` (new).
