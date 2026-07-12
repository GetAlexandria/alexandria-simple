---
id: FEAT-007
title: "Update-check fetches version from sociotechnica.org and reports download URL"
outcome: O-5
tier: could
enabler: false
blocked-by: [FEAT-005]
blocks: []
cards: []
---

## Motivation

The update-check currently fetches VERSION from `raw.githubusercontent.com`, which
requires the repo to be public. Switching to `sociotechnica.org/alexandria/latest-version.txt`
aligns with the private-repo distribution model and gives users a direct download
link when an upgrade is available.

## Description

Update `src/tools/update-check.ts`:
1. Change the default remote version URL to `https://sociotechnica.org/alexandria/latest-version.txt`
2. When an upgrade is available, include the tarball download URL in the output:
   `upgrade_available|0.7.0|https://sociotechnica.org/alexandria/alexandria-v0.7.0.tar.gz`
3. Update the upgrade skill to display the download URL to the user

## Context

The `CONTEXT_LIBRARY_REMOTE_VERSION_URL` env var allows overriding the URL, so
this change just updates the default. Tests mock the URL, so they'll need the
new default but should otherwise pass.

## Acceptance Criteria

- [ ] Default remote version URL points to `sociotechnica.org/alexandria/latest-version.txt`
- [ ] Output includes tarball download URL when upgrade is available
- [ ] `CONTEXT_LIBRARY_REMOTE_VERSION_URL` override still works
- [ ] Tests pass with updated default
- [ ] Upgrade skill displays the download URL

## Implementation Notes

Files touched: `src/tools/update-check.ts`, `skills/alexandria-upgrade/SKILL.md`,
`tests/update-check.test.ts`.
