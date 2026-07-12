---
id: FEAT-006
title: "Update README with curl install instructions and release docs"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: []
cards: []
---

## Motivation

The README is how users discover how to install the plugin. It needs to reflect
the new curl-based install as the primary path, with git clone as the contributor
alternative.

## Description

1. Update `README.md` install section:
   - Primary: `curl -fsSL https://sociotechnica.org/alexandria/install.sh | bash`
   - Explain what happens (detects project vs global, prompts, installs Bun if needed)
   - Alternative (collapsible): git clone for contributors
   - Remove the current intermediate state

2. Create `RELEASING.md` documenting the release process:
   - Bump VERSION, package.json, plugin.json
   - Update CHANGELOG.md
   - Tag and push
   - CI handles the rest

3. Add `.gitattributes` with `export-ignore` for dev-only directories

## Context

The README currently recommends cloning into the project repo and using
`--plugin-dir`. The curl installer replaces this as the primary path. The
git clone path remains for contributors who need tests, docs, and evals.

## Acceptance Criteria

- [ ] README primary install is the curl one-liner
- [ ] README explains project-local vs global detection
- [ ] README has collapsible contributor/dev install section
- [ ] `RELEASING.md` documents the tag-and-push release workflow
- [ ] `.gitattributes` marks dev-only dirs as `export-ignore`

## Implementation Notes

Files touched: `README.md`, `RELEASING.md` (new), `.gitattributes` (new).
