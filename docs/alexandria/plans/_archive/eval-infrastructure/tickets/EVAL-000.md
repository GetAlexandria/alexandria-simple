---
id: EVAL-000
title: "Update context library with eval infrastructure planning decisions"
outcome: Context library reflects current product knowledge
tier: must
enabler: false
blocked-by: []
blocks: []
cards: [System - Wizard Configuration Engine, Capability - Grading]
---

## Motivation

The Release 1 planning process produced new product knowledge that isn't yet captured
in the context library. Without the implementation planning skill (which auto-updates
cards after planning), we need to manually update the library so Conan's context
briefings reflect reality.

## Description

Create or update context library cards for concepts introduced during Release 1 planning:

**New cards:**
- System - Eval Infrastructure (the harness, runner, judge, structural checks)
- Capability - Eval Running (executing skills with scripted inputs, recording transcripts)
- Capability - LLM-as-Judge (evaluating transcript quality against criteria)
- Artifact - Eval Case (inputs + fixture + config)
- Artifact - Eval Baseline (checked-in transcript + judge results for regression detection)

**Update existing cards:**
- System - Wizard Configuration Engine — note that it now has eval coverage
- System - Quality Grading Engine — note relationship to eval infrastructure
  (grading is per-card quality, eval is per-skill conversation quality)

**New decisions to record:**
- Decision: Eval-first development (build eval harness before building skills)
- Decision: Transcript recording as primary eval artifact
- Decision: Structural checks + LLM-as-Judge as complementary evaluation layers

## Acceptance Criteria

- [ ] New cards created following library conventions (WHAT/WHERE/WHY/WHEN/HOW)
- [ ] Cards use wikilinks to reference related cards
- [ ] Updated cards reflect new knowledge without losing existing content
- [ ] Decisions recorded with options considered and rationale
