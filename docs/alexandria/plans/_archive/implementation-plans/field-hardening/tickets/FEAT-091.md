---
id: FEAT-091
title: "Release note and breaking-change communication"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-090]
blocks: []
cards: [Artifact - Decision - Skill Naming Convention]
---

## Motivation

A plugin rename + uniform command prefix is the biggest breaking change Alexandria has shipped. Users upgrading need one document that says: what changed, why, what to run, when the old commands stop working. This is the communication layer of the rename.

## Description

Write the release note for this release covering:
- The plugin manifest rename (alexandria → ax)
- The slash-command prefix rename (all → /ax:)
- The migration path (what `ax update` does, what the deprecation message looks like)
- The deprecation timeline (when old commands stop redirecting)
- Any other user-visible changes from this plan (taxonomy alignment, draft-first flow, Raven voice)

Publish to `CHANGELOG.md` plus `getalexandria.ai/updates` (or whatever the canonical release-note surface is at ship time).

## Context

Closes the O-5 loop. The release note is what users actually see when they learn about the change.

## Acceptance Criteria

- [ ] `CHANGELOG.md` entry exists and covers every user-visible change from this plan.
- [ ] Migration path is explicit and tested.
- [ ] Deprecation timeline is named with a specific target.
- [ ] Release note links to the Artifact - Decision: Skill Naming Convention card for deeper rationale.

## Implementation Notes

Use the release note as a dogfooding opportunity for Raven's new voice — no agent-name leak, no F-codes, no "promotion" jargon. If the release note needs rewriting for voice, that's the first signal the jargon audit (O-6) is needed.
