# Repo Split 0.9.0 Release Checklist

This checklist is for the release owner coordinating the move to the new
`getalexandria` repo structure and the `0.9.0` release. It assumes the new repos
are brand new, not transferred from `sociotechnica-org`.

## Program Setup

- [ ] `getalexandria` org exists and ownership/admin access is confirmed
- [ ] public repo exists: `getalexandria/alexandria`
- [ ] private repo exists: `getalexandria/alexandria-internal`
- [ ] repo settings configured for the public repo:
  - [ ] issues enabled
  - [ ] pull requests disabled
  - [ ] issue templates created
- [ ] repo settings configured for the private repo:
  - [ ] branch protections
  - [ ] actions permissions
  - [ ] secrets for release/site automation

## Source Migration

- [ ] current engineering code is seeded into the new private repo
- [ ] private repo structure matches [`internal-repo-structure.md`](./internal-repo-structure.md)
- [ ] `docs/alexandria/` remains private in the new engineering repo
- [ ] migration is selective; the old repo is not being mirrored mechanically

## Public Payload Definition

- [ ] public payload manifest is defined
- [ ] public repo structure matches [`public-repo-structure.md`](./public-repo-structure.md)
- [ ] only ship-worthy runtime/plugin/docs surfaces are included
- [ ] internal plans, evals, and private product-library artifacts are excluded
- [ ] public install and upgrade docs point to the new org and domain

## CLI Strategy

- [ ] canonical CLI name is `ax`
- [ ] primary public CLI download surface is `getalexandria.ai`
- [ ] GitHub Releases is either a mirror or intentionally unused for public CLI download
- [ ] public download surface is anonymous and does not depend on a private repo
- [ ] CLI artifacts are built from the new repo structure, not the legacy repo

## Installer And Upgrade Path

- [ ] `install.sh` default base URL uses `https://getalexandria.ai`
- [ ] version discovery path is defined
- [ ] GitHub fallback for version/release lookup exists if desired
- [ ] manual plugin registration text points at the final Alexandria identifiers
- [ ] `install.sh` installs the public `ax` binary and plugin payload
- [ ] `ax setup` works as the direct product-owned setup path after bootstrap

## Website Release Automation

- [ ] `../alexandria-site/src/data/version.json` update is automated or scripted
- [ ] `../alexandria-site/src/content/changelog/*.md` update is automated or scripted
- [ ] `/updates` reflects release notes for the current version
- [ ] release workflow for the site is defined:
  - [ ] PR-based automation
  - [ ] direct commit automation
- [ ] production deploy path for `getalexandria.ai` is validated

## Release Automation

- [ ] GitHub Actions workflow exists for `0.9.0` release train
- [ ] workflow builds plugin/public payload from the private monorepo
- [ ] workflow publishes CLI artifacts
- [ ] workflow updates or syncs the public repo
- [ ] workflow updates site version/changelog surfaces
- [ ] workflow publishes release metadata and stable download links

## Eval Gate

- [ ] eval-backed surfaces changed in this release are identified
- [ ] required eval work for shipped features has already happened before release
- [ ] release owner has reviewed eval status
- [ ] any extra eval runs are explicitly human-triggered, not automatic

## QA Gate

- [ ] greenfield empty-project case passes
- [ ] brownfield upgrade case passes
- [ ] greenfield existing-codebase import case passes
- [ ] post-publish smoke check passes against actual public install paths

## Legacy Repo Deprecation

- [ ] `sociotechnica-org/alexandria` remains available during rollout
- [ ] legacy README or top-level docs point users to the new org/repos
- [ ] deprecation language is written
- [ ] old repo is not deprecated until new install and release flows are proven

## Ship Decision

- [ ] version metadata is correct for `0.9.0`
- [ ] release notes are published
- [ ] site shows the new version
- [ ] public repo reflects the intended public surface
- [ ] CLI artifacts are downloadable from the chosen host
- [ ] release owner signs off on QA and eval status
- [ ] deprecation messaging for the old repo is ready
