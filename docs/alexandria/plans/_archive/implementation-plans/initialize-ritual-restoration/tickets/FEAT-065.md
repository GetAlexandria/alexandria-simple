---
id: FEAT-065
title: "Cleanup: kill assessment.md, strike session_notes, remove dead refs"
outcome: O-6
tier: could
enabler: false
blocked-by: [FEAT-062, FEAT-064]
blocks: []
cards: [Agent - Raven the Maven]
---

## Motivation

Surface-area reduction. Each item is cheap individually but all touch the same files (`alexandria-config.json` schema, `job-first-session.md`, `output-formats.md`, `assessment-generation.md`). Bundling avoids re-opening the same files in a follow-up plan.

## Description

- Remove `assessment.md` as a persisted artifact: delete write logic from first-session, delete `skills/initialize/assessment-generation.md` (84 lines), prune the assessment template from `skills/initialize/output-formats.md` (339 lines — keep config and starter-card templates)
- Strike `session_notes` from `alexandria-config.json` schema, `docs/initialize/` configuration docs, and any remaining references in Raven's skills
- Ensure the noun-dialogue orphan is explicitly wired into first-session (FEAT-062 does this; this ticket verifies no dangling `noun-dialogue.md` references in old `job-initialize.md` survive)
- Grep for any remaining `/wizard` or `skills/wizard/` references in skills/docs/agents; update to `/library` and `skills/initialize/` respectively where still relevant

## Context

Scratchpad findings: lines 106-107 (assessment.md kill rationale), line 112 (session_notes never implemented), line 105 (skills/wizard confusing — partly addressed by FEAT-045 but verify).

## Acceptance Criteria

- [ ] `assessment.md` is not written as persisted output by first-session or returning-session
- [ ] `skills/initialize/assessment-generation.md` deleted
- [ ] Assessment template removed from `output-formats.md`; other templates preserved
- [ ] `session_notes` field removed from config schema and all references (`grep` clean)
- [ ] `grep` for `/wizard` and `skills/wizard/` across repo returns only historical references (changelogs, decision records, release docs) — no live skill/agent/doc references

## Implementation Notes

Coordinate with FEAT-062 which also touches first-session: this ticket's "remove assessment write logic" should be cleanly representable as "don't add it back in the first place."
