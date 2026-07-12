## Goal

Prepare and ship Alexandria `0.9.2` as a focused patch release that:

- moves public release tarball delivery onto Cloudflare R2
- keeps the Alexandria website on Cloudflare Pages for small release surfaces
- validates the updated release workflow end to end from `alexandria-internal`

## Why This Release Exists

The `0.9.1` release proved that the split-repo automation could update the
public repo and site repo, but it also exposed a deployment failure in the site
stack: Cloudflare Pages rejected the Alexandria tarballs because the Linux
archive exceeded the 25 MiB per-file limit.

The follow-up implementation in `main` now uploads release artifacts to R2 and
serves them from `downloads.getalexandria.ai`, with the site repo only
publishing `install.sh`, `latest-version.txt`, and changelog/version metadata.

This patch release exists to exercise that corrected distribution path in
production.

## Scope

In scope:

- bump `VERSION`, `package.json`, and plugin manifest to `0.9.2`
- add a `0.9.2` changelog entry covering the R2 release path
- update the pinned install example in the plugin README
- validate the release locally with the standard release gates
- tag `v0.9.2` after merge and observe the release workflow plus downstream
  live surfaces

Out of scope:

- changing the release workflow topology again
- altering the public installer semantics beyond the behavior already merged to
  `main`
- redesigning the Alexandria site or public repo content outside the normal
  release automation outputs

## Execution Plan

1. Branch from `main` for a dedicated `0.9.2` release-prep change.
2. Bump release metadata and document `0.9.2` in `CHANGELOG.md`.
3. Run the release validation gates:
   - `bun run check`
   - `bun test`
   - `tmpdir=$(mktemp -d); bash ./packages/deploy/build-tarball.sh "$tmpdir"; rm -rf "$tmpdir"`
4. Open a release-prep PR against `main`.
5. After CI and Devin complete, merge the PR.
6. Tag `v0.9.2` and verify:
   - GitHub Release assets are created
   - `GetAlexandria/alexandria` updates via sync
   - `https://getalexandria.ai/downloads/latest-version.txt` returns `0.9.2`
   - `https://downloads.getalexandria.ai/latest-version.txt` returns `0.9.2`

## Acceptance Criteria

- All release metadata files read `0.9.2`.
- Local release validation passes.
- The tagged release uploads Alexandria tarballs to R2 instead of Pages.
- The site repo publishes only small release surfaces.
- The live download endpoints reflect `0.9.2`.
