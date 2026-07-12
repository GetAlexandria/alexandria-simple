# Plan: 0.9.0 Repo Split + Public/Private Distribution Reorganization

- Release target: `0.9.0`
- Current baseline: `0.8.4`
- Goal: stand up brand new Alexandria repositories in a new GitHub organization, split public and private concerns cleanly, and ship `0.9.0` through that new structure before deprecating `sociotechnica-org/alexandria`

## Summary

`0.9.0` should be the release where Alexandria stops behaving like a single mixed-purpose repo. Today the repo carries product code, plugin runtime, viewer workspace, evals, maintainer docs, plans, and release machinery in one place. That is workable for iteration, but it is the wrong shape for the next stage:

- the public install surface should be small, legible, and stable
- the private engineering surface should keep the real source, plans, evals, QA harnesses, and release automation together
- plugin delivery and CLI delivery need to become parallel release products, not accidental byproducts of the same checkout
- release publishing needs to update the public website as part of the same train
- host support needs to expand past Claude without forcing the public repo to expose the full private working tree

This plan makes the private monorepo the build source and the public repo the distribution/intake surface.

This is also a rare opportunity: Alexandria does not yet have a large external
user base depending on the current repo, wrapper, and install contracts. `0.9.0`
should use that opportunity fully and make a clean break instead of carrying the
old world forward.

## Migration Stance

This is a fresh-repo migration, not a repository transfer.

- create brand new repos under `getalexandria`
- move or copy only the surfaces that belong in the new long-term structure
- keep `sociotechnica-org/alexandria` intact while the new release train is being proven out
- once the new org, repos, install paths, and website flow are working, point the old repo at the new world rather than carrying its old contracts forward

That lowers operational risk. A transfer would drag legacy repo assumptions, visibility settings, and existing release contracts directly into the new org. This work wants a deliberate reset instead.

## Recommended Repository Model

### Organization

- Create GitHub org `getalexandria` to match `getalexandria.ai`

### Public repo

- Repo name: `getalexandria/alexandria`
- Purpose: public-facing distribution and issue intake
- Creation mode: new repo, not a transferred continuation of `sociotechnica-org/alexandria`
- Recommendation: disable pull requests entirely on this repo and use issues as
  the public interaction surface

### Private repo

- Repo name: `getalexandria/alexandria-internal`
- Creation mode: new private monorepo seeded from the current engineering codebase
- Rationale: `alexandria-internal` is explicit about purpose and avoids implying
  that the repo name should describe package-manager topology rather than
  visibility and ownership boundary

## Repo Boundaries

### Public repo contents

The public repo should contain only the surfaces that users and hosts need to discover, install, and report against:

- plugin-facing manifests and runtime payloads
- public `agents/` and `skills/` surfaces that are meant to ship
- a public-facing `README.md` synced from a dedicated source file in the private repo
- install and upgrade instructions
- release metadata such as `VERSION` and `CHANGELOG.md`
- issue templates for install bugs, release regressions, host support requests, and product requests
- documentation explaining how Alexandria is installed and what hosts are supported

The concrete public payload contract lives in
[`public-repo-structure.md`](./public-repo-structure.md).

The public repo should not be the place where core implementation happens. It is a release target, not the main development workspace.

### Private repo contents

The private monorepo should hold the full engineering system. The concrete
structure contract lives in
[`internal-repo-structure.md`](./internal-repo-structure.md).

At a high level, `alexandria-internal` is:

- a real `pnpm` workspace
- centered on `packages/ax`, `packages/viewer`, runtime/host packages, and a
  `packages/deploy` release package
- organized so tests and QA live with the package they exercise
- organized so maintainer-only tooling stays private as workspace/package
  commands rather than a second shipped CLI
- organized so maintainer-only skills are auto-discoverable in the private repo
- organized with `README.md` for maintainers, `README.public.md` for the public
  sync target, and `AGENTS.md` symlinked to `CLAUDE.md`

This keeps the "peanut butter and jelly" separate: public install surface on one side, internal product knowledge and engineering machinery on the other.

## Public Distribution Model

The public repo and the CLI host should be produced from the private monorepo by release automation.

### Public repo role

- carries the public plugin/runtime tree
- acts as the canonical GitHub home for users
- accepts issues
- does not accept general implementation PRs

### CLI host role

- ships installable CLI artifacts independently of the public repo checkout
- is published in parallel with the plugin release
- can be backed by GitHub Releases, `getalexandria.ai`, or both

Recommendation:

- `getalexandria.ai` should be the stable public discovery and download surface
  for `ax`
- GitHub Releases is acceptable only if the release assets are published from a
  public repo or mirrored onto a public download surface
- do not force the CLI installer to depend on a checked-out public repo
- do not make anonymous public CLI download depend on a private repo
- if GitHub Releases is used, publish from a public repo or mirror the assets to
  `getalexandria.ai` or a public download subdomain
- do not use the legacy `sociotechnica-org/alexandria` repo as the long-term
  public CLI host

- use the private monorepo as the only build source
- publish plugin payloads into the public repo
- publish CLI artifacts to a public download surface, with `getalexandria.ai`
  as the stable first-party path
- build the viewer as compiled assets that are bundled with the product CLI and served by the CLI
- sync `README.public.md` from the private repo into `README.md` in the public repo
- keep both outputs tied to the same release tag and version number

## 0.9.0 Product Changes Bundled Into This Reorganization

### 1. CLI rename

- rename the primary CLI from `alxndr` to `ax`
- update docs, setup, release scripts, tests, and QA scripts to treat `ax` as canonical for product use

### CLI boundary rule

The public CLI surface should only contain commands that help users and their
agents maintain Alexandria inside their own products.

Public CLI execution must use installed binaries only. `0.9.0` should not ship
TypeScript source as the fallback execution path, and it should not require Bun
on the consumer machine after installation.

`0.9.0` is a hard cut-over. The old CLI names, wrapper world, and source-fallback
execution model are not part of the new contract. That is the right move now,
before there is a larger user population depending on them.

The canonical per-command split lives in
[`mapping.md`](./mapping.md). Keep command-level destination decisions there
rather than duplicating them in this plan.

Maintainer-only tooling does not need its own shipped CLI. Keep that work as
private workspace/package commands inside the monorepo rather than inventing a
second installed command surface.

### 2. Multi-host distribution

`0.9.0` should establish a deliberate host matrix instead of treating non-Claude support as future magic:

- Claude: first-class plugin distribution
- Codex: installable filesystem/plugin-compatible surface where feasible
- OpenCode and similar hosts: explicit packaging target if the mechanics are simple enough, otherwise a documented deferred adapter

The public repo should describe supported hosts explicitly. The private monorepo should hold the adapter logic.

### 3. Deployment-request issue surface

The public repo needs issue templates that make it easy to ask Alexandria for help in a structured way. At minimum:

- install/upgrade problem
- release regression
- host support request
- feature/request-for-capability
- deployment/use-case request with a prompt-friendly template

Those templates should be designed around how a user would actually ask Alexandria to do something, not around generic GitHub bug boilerplate.

## Release Pipeline

`0.9.0` should be cut from the private monorepo through a single release workflow:

1. Build and test the monorepo.
2. Assess whether the release includes surfaces with eval coverage and confirm their eval status.
3. Allow the human release owner to decide whether any additional eval runs are needed; do not auto-run evals in release automation.
4. Run release QA smoke cases.
5. Build the public plugin/runtime payload.
6. Publish or sync that payload into `getalexandria/alexandria`.
7. Build public CLI artifacts for `ax`.
8. Publish public CLI artifacts to the CLI host.
9. Update `getalexandria.ai` release metadata and changelog content.
10. Publish/update install metadata and version discovery endpoints.
11. Run post-publish smoke checks against the actual public install paths.

This pipeline should produce plugin and CLI outputs in the same release train, not as separate manual rituals.

### Eval policy for release

- evals belong to feature delivery, not to the default release button
- if a feature changed an eval-backed skill or agent, the eval work should already have happened before the release candidate exists
- release automation should record eval status, not kick off slow or expensive eval jobs by default
- the release owner may still choose to run extra evals when risk or uncertainty justifies it

## Site Update Automation

The website at `../alexandria-site` already has two release-facing surfaces:

- `src/data/version.json`
- `src/content/changelog/*.md`, rendered at `https://getalexandria.ai/updates`

`0.9.0` release automation should update both.

### Required site updates per release

- bump the version in `src/data/version.json`
- add a new changelog entry in `src/content/changelog/`
- publish the updated site so the landing page and `/updates` reflect the new release

Recommendation:

- drive the site update from GitHub Actions as part of the release workflow
- either open an automated PR against `alexandria-site` or commit directly to a dedicated release branch used by the site repo's deployment workflow
- prefer PR-based automation if you want human inspection of the website copy before publish; prefer direct automation if release latency matters more

## Installer Changes

`install.sh` is currently plugin-first and assumes a single base URL for version discovery and tarball download. The repo split changes that.

### Recommended `install.sh` changes

- move the default public base URL from `https://sociotechnica.org/alexandria` to `https://getalexandria.ai`
- update help text and examples to use `getalexandria.ai`
- update any manual plugin-registration instructions to the final Alexandria marketplace/vendor identifiers
- stop assuming plugin and CLI artifacts necessarily live at the same base URL
- make `install.sh` the thin public bootstrap path for Alexandria installation
- let the installed `ax` binary own the long-term setup and upgrade surface
- add fallback resolution so version discovery can survive if the website metadata is stale:
  - preferred: `getalexandria.ai/latest-version.txt` or equivalent published metadata
  - fallback: GitHub release/tag lookup from the canonical public repo

### Recommendation on CLI install

- `install.sh` should install `ax` and the public plugin payload
- `ax setup` should be the explicit product-owned setup surface after bootstrap
- `ax upgrade` or equivalent should eventually own upgrade behavior as well
- do not expose private maintainer workspace commands through the public installer
- this keeps the setup logic in one product-owned place instead of duplicating it
  across shell scripts
- public installation must land runnable binaries, not source-plus-wrapper fallbacks

## QA Release Harness

The release process needs a lightweight but real QA script for every release candidate.

### Canonical QA cases

1. Greenfield empty project
   - fresh machine or clean container
   - fresh Alexandria install
   - blank repo with no useful project information
   - run the initialization flow and verify expected outputs

2. Brownfield upgrade
   - existing project already using Alexandria
   - upgrade to the new release
   - run health check, at least one update flow, and viewer verification

3. Greenfield codebase import
   - existing codebase with no Alexandria installed yet
   - install Alexandria
   - initialize from the codebase and verify the first-pass library setup works

### Where QA assets should live

Recommendation:

- keep the QA harness, prompt scripts, and assertions inside the private monorepo
- use dedicated private fixture repos only where persistent Git history matters, especially for upgrade testing
- use disposable temp dirs or containers for the blank-project and import cases

That gives realistic release testing without forcing every fixture to become a long-lived repo.

## Migration Phases

### Phase 1: Org and repo setup

- create `getalexandria`
- create new public `alexandria`
- create new private `alexandria-internal`
- configure repo settings, permissions, branch protections, and issue templates
- disable PRs on the public repo

### Phase 2: Move source of truth into the private monorepo

- seed `alexandria-internal` from the current engineering codebase
- establish a real `pnpm` workspace with explicit packages for CLI, viewer, runtime, host adapters, and deploy/release tooling
- move tests and QA down into the packages they actually exercise
- move maintainer skills into an auto-discoverable private `skills/` surface
- keep `docs/alexandria/`, evals, and planning artifacts in the private repo
- treat this as selective migration, not a mechanical mirror of the old repo

### Phase 3: Define the public payload

- decide the exact files that are published into the public repo
- generate the public payload from the private monorepo
- add install, upgrade, cut-over, and host support docs
- keep the public repo intentionally small rather than copying the old repo tree forward

### Phase 4: Rename the CLI and cut over cleanly

- ship `ax` as canonical
- remove the old wrapper/world assumptions from the public contract
- update tests, installers, packaging, and release docs to match the new binary-first world

### Phase 5: Parallel plugin + CLI release automation

- build plugin payloads and `ax` artifacts from one release workflow
- publish both outputs from the same version tag
- update `getalexandria.ai` version and changelog surfaces from the same release workflow
- verify the public repo and CLI host stay in sync

### Phase 6: Release QA gate

- codify the three release smoke cases
- make the QA script part of the release checklist for every release candidate
- assess eval status and let the release owner decide whether extra eval runs are warranted
- require a clean QA pass before `0.9.0` is declared shippable

### Phase 7: Legacy repo deprecation

- update `sociotechnica-org/alexandria` to point users at the new org and repos
- deprecate only after install, release, and site flows are proven in the new structure

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| A repo transfer drags legacy assumptions directly into the new org | Do not transfer; create fresh repos and migrate selectively |
| The public repo becomes a second development repo and drifts from the private source of truth | Treat the public repo as generated/released output; all engineering changes originate in the private monorepo |
| `ax` cut-over breaks old scripts or habits in the current repo | Treat `0.9.0` as a clean break and update the current maintainers/users directly rather than carrying old contracts forward |
| Multi-host ambitions stall the release | Ship explicit host tiers for `0.9.0`: first-class, preview, deferred |
| Release process becomes too manual across plugin, CLI, and site outputs | Build one release train with one tag, one checklist, and one QA gate |
| Release automation becomes slow or expensive because evals are bundled into every release | Keep eval execution in feature work; release automation checks status and leaves override authority to the human release owner |
| QA fixtures become either too fake or too expensive to maintain | Keep harnesses in the monorepo and reserve dedicated fixture repos for scenarios that need real history |
| The public repo fills up with internal plans, evals, or private product context | Draw a hard boundary: no internal library, no evals, no planning docs in the public release repo |

## Open Decisions To Resolve Early

1. Whether the public repo is a generated mirror, a release branch target, or a small manually curated repo updated by automation
2. Exact CLI host implementation: GitHub Releases only, first-party domain only, or both
3. Minimum `0.9.0` host matrix: Claude only plus documented stubs, or real Codex/OpenCode packaging in the same release
4. Whether site updates land via automated PRs to `alexandria-site` or direct release commits
5. Exact deprecation messaging for the legacy `sociotechnica-org/alexandria` repo once the new world is proven

## Exit Criteria

1. `getalexandria` exists and is the canonical Alexandria GitHub org.
2. Public `getalexandria/alexandria` exists with issues enabled and PRs disabled.
3. Private `getalexandria/alexandria-internal` exists as the engineering source of truth.
4. `0.9.0` can be built from the private monorepo and published into the public repo and CLI host from one release workflow.
5. `ax` is the only shipped CLI surface.
6. Alexandria's internal library, evals, plans, and QA harnesses remain private.
7. The three release QA cases are scripted and pass for the `0.9.0` candidate.
8. `getalexandria.ai` shows the current release version and `/updates` changelog entry for `0.9.0`.
9. `sociotechnica-org/alexandria` clearly points to the new org and does not preserve the old public contract as the preferred path.
10. Public users can discover install instructions, supported hosts, release notes, and issue templates without seeing the private engineering machinery.

## Recommended Immediate Next Steps

1. Decide the public repo publishing model.
2. Create this work as an execution epic with child issues for org setup, repo split, CLI rename, release automation, and QA harness.
3. Stand up `getalexandria` and create both repos before moving code.
4. Define the public payload manifest before doing the migration so the split has a hard boundary.
5. Treat `0.9.0` as a hard-cut release program, not just a version bump.
