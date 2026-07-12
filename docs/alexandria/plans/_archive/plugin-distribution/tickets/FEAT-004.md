---
id: FEAT-004
title: "Add alexandria download page and static hosting to sociotechnica-site"
outcome: O-4
tier: should
enabler: false
blocked-by: []
blocks: [FEAT-005]
cards: []
---

## Motivation

The tarball, install script, and version file need a stable public URL. The
sociotechnica.org site already deploys to Netlify automatically, so adding a
`public/alexandria/` directory gives us static file hosting with no new
infrastructure.

## Description

In the `sociotechnica-site` repo:

1. Create `public/alexandria/` directory
2. Add a placeholder `latest-version.txt` with the current version
3. Optionally create `src/pages/alexandria/index.astro` as a simple download
   page with install instructions and links

The actual tarball and install.sh will be deployed here by CI (FEAT-005) or
manually for the initial release.

## Context

The sociotechnica-site is an Astro site deployed to Netlify. Files in `public/`
are served as-is at the site root. `public/alexandria/latest-version.txt` becomes
`https://sociotechnica.org/alexandria/latest-version.txt`.

## Acceptance Criteria

- [ ] `public/alexandria/` directory exists in sociotechnica-site
- [ ] `latest-version.txt` is served at `sociotechnica.org/alexandria/latest-version.txt`
- [ ] The page or directory is accessible and returns correct content after deploy

## Implementation Notes

This is a change to the `sociotechnica-site` repo at `../sociotechnica-site`, not
the context-library repo. Keep the page minimal — install instructions and a
download link.

Files touched (in sociotechnica-site): `public/alexandria/latest-version.txt` (new),
optionally `src/pages/alexandria/index.astro` (new).
