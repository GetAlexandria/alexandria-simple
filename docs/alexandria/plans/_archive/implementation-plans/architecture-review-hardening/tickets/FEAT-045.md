---
id: FEAT-045
title: "Collapse /wizard into /library and rename wizard → initialize"
outcome: O-3
tier: should
enabler: false
blocked-by: []
blocks: []
cards: [Agent - Raven the Maven]
---

## Motivation

Having both `/wizard` and `/library` as user-facing slash commands creates confusion about which to run. The setup experience is really just what happens when you visit the library for the first time — it should be automatic, not a separate command. Additionally, "wizard" is a legacy term that should be scrubbed in favor of "initialize."

## Description

Two changes in one ticket:

**1. Collapse entry points:**
- Remove `/wizard` as a user-invocable skill
- `/library` detects first-time setup (no config file) and triggers initialization automatically
- Return visits get the concierge greeting

**2. Rename wizard → initialize everywhere:**
- `skills/wizard/` → `skills/initialize/`
- `wizard-config.json` → `alexandria-config.json`
- `wizard-output.md` → `initialize-output.md` or similar
- `job-wizard-mode.md` → `job-initialize.md`
- All references in agent files, skill files, docs, README, CLAUDE.md
- Scrub the term "wizard" from all user-facing text

## Context

`/library` already handles first-time vs returning-session routing via Raven's `job-initialize.md` Step 2. The detection (presence of config file) is already implemented. The main work is removing the separate slash command, renaming files/references, and updating docs.

## Acceptance Criteria

- [ ] `/wizard` is not listed as a user-invocable skill
- [ ] `/library` on first visit triggers full setup flow
- [ ] `/library` on return visit shows concierge greeting
- [ ] Zero instances of the word "wizard" in user-facing text (agent descriptions, skill descriptions, slash command names)
- [ ] Internal file/directory names updated from wizard → initialize
- [ ] All setup functionality preserved
- [ ] README, CLAUDE.md, and plugin description reference only `/library`

## Implementation Notes

Grep for "wizard" across the entire repo to find all references. Categorize each as: user-facing (must rename), internal reference (rename), or historical/source material (leave as-is in transcripts/sources). The `wizard-config.json` → `alexandria-config.json` rename is checked by multiple files. Grep for `wizard-config` to find all references.
