---
id: FEAT-005
title: "CI workflow to build tarball and deploy to sociotechnica.org/alexandria/"
outcome: O-4
tier: should
enabler: false
blocked-by: [FEAT-001, FEAT-003, FEAT-004]
blocks: [FEAT-007]
cards: []
---

## Motivation

Manual builds and uploads are error-prone and create a release bottleneck.
Automated CI ensures every tagged version is consistently built, stripped, and
published — both as a GitHub Release artifact and to the public download site.

## Description

Create `.github/workflows/release.yml` triggered on `v*` tags. The workflow:

1. Runs `bun run check` and `bun test` (gate on passing)
2. Calls `scripts/build-tarball.sh` to produce the stripped tarball
3. Creates a GitHub Release with the tarball attached
4. Deploys to `sociotechnica.org/alexandria/`:
   - `alexandria-v{VERSION}.tar.gz` — the tarball
   - `install.sh` — the install script
   - `latest-version.txt` — updated with the new version

Deployment to the site could work via:
- Committing files to the sociotechnica-site repo and triggering a Netlify deploy
- Or using Netlify's deploy API / CLI directly
- Or uploading to a CDN / object storage that Netlify proxies

## Context

The existing CI workflow (`.github/workflows/validate-plugin.yml`) validates plugin
structure and runs tests. The release workflow is additive — it runs the same checks
plus the build and deploy steps.

The context-library repo is private, so the CI workflow needs appropriate secrets
for deploying to the sociotechnica-site or Netlify.

## Acceptance Criteria

- [ ] Pushing `git tag v0.7.0 && git push --tags` triggers the release workflow
- [ ] Workflow fails if tests or checks fail (no broken releases)
- [ ] GitHub Release is created with tarball attached
- [ ] `sociotechnica.org/alexandria/latest-version.txt` returns the new version
- [ ] `sociotechnica.org/alexandria/alexandria-v{VERSION}.tar.gz` is downloadable
- [ ] `sociotechnica.org/alexandria/install.sh` is the latest install script

## Implementation Notes

For deploying to sociotechnica-site, the simplest approach is to use the Netlify CLI
(`netlify deploy --dir=...`) with a `NETLIFY_AUTH_TOKEN` secret. Alternatively, push
the files to the sociotechnica-site repo via a GitHub App or deploy key.

The `install.sh` in the tarball and the one hosted on the site should be identical.
Copy it from the build output.

Files touched: `.github/workflows/release.yml` (new).
