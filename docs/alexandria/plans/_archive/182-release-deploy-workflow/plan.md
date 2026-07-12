# Plan: FEAT-005 Release Workflow

## Scope

Implement the plugin-distribution release automation in `context-library`:

- add `.github/workflows/release.yml` for tag-driven release publishing
- build and attach the stripped tarball to a GitHub Release
- publish `alexandria-v{VERSION}.tar.gz`, `install.sh`, and `latest-version.txt` into `sociotechnica-site/public/alexandria/`

This plan review is waived for this manual slice because the user explicitly asked to carry the issue manually in-session rather than sending it back through the factory.

## Layer Mapping

- Policy: release only from version-matching `v*` tags; do not publish partial artifacts
- Coordination: split build/release and site publication into separate workflow jobs with artifact handoff
- Execution: run the existing repo QA and tarball build script, then push the static payload to the website repo
- Integration: use GitHub Releases plus a tokenized checkout of `sociotechnica-org/sociotechnica-site`
- Observability: fail loudly when `install.sh` or the website token is missing so release operators do not get a false-positive tag build

## Non-Goals

- implement `install.sh` itself
- redesign Netlify hosting or add direct Netlify API deployment
- change the existing plugin CI workflow beyond reusing its validation steps

## Current Gaps

- `FEAT-001` is merged, so `dist-include.txt` and `scripts/build-tarball.sh` are available
- `FEAT-004` is merged, so `public/alexandria/` now exists in `sociotechnica-site`
- `FEAT-003` is still open, so `install.sh` is not present on `main` yet

That means the release workflow should be implemented now, but it must refuse to publish if `install.sh` is absent. This keeps the workflow correct while the remaining dependency lands.

## Architecture Boundaries

- Keep release orchestration in `.github/workflows/release.yml`
- Reuse existing checked-in repo commands (`bun run check`, `bun test`, `scripts/build-tarball.sh`)
- Do not embed large packaging logic inline when simple shell staging is enough
- Push website artifacts by updating `sociotechnica-site/public/alexandria/`, not by inventing a second hosting path

## Implementation Steps

1. Add a tag-triggered `release.yml` workflow.
2. Reuse the current CI setup steps: shell tooling, Bun, dependency install, version consistency.
3. Enforce tag/version consistency (`vX.Y.Z` must match `VERSION`, `package.json`, and plugin metadata).
4. Build the tarball into a release artifacts directory.
5. Stage the website payload:
   - tarball
   - `install.sh`
   - `latest-version.txt`
6. Fail the workflow clearly if `install.sh` or `SOCIOTECHNICA_SITE_PUSH_TOKEN` is missing.
7. Create the GitHub Release with the tarball attached.
8. Checkout `sociotechnica-site`, copy the staged files into `public/alexandria/`, commit, and push `main`.

## Tests

- `bun install --frozen-lockfile`
- `bun run check`
- `bun test`
- `scripts/build-tarball.sh <tmpdir>`
- manual review of `.github/workflows/release.yml`

## Acceptance Scenarios

1. A pushed `v*` tag starts the release workflow.
2. If repo QA fails, the release job stops before creating a release or touching the site repo.
3. If `install.sh` is missing, the workflow fails with a clear message instead of publishing an incomplete Alexandria payload.
4. On a valid tagged release with all required files present, GitHub receives the tarball release asset and `sociotechnica-site/public/alexandria/` receives the tarball, installer, and version file.

## Exit Criteria

- `.github/workflows/release.yml` exists and encodes the above flow
- local repo QA still passes
- tarball build still passes locally
- the workflow makes the cross-repo secret dependency explicit

## Deferred

- direct Netlify API deployment
- release notes generation beyond GitHub’s default tag release body
- any change to `install.sh` itself
