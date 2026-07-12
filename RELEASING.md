# Releasing

This document covers Alexandria release path for Alexandria plugin.

## What the release workflow does

Tagged releases publish four public surfaces:

1. a GitHub Release containing `install.sh` plus Alexandria release tarballs
2. `https://getalexandria.ai/install.sh` plus the site changelog/version surfaces
3. `https://getalexandria.ai/downloads/latest-version.txt`
4. `https://downloads.getalexandria.ai/latest-version.txt` plus Alexandria release tarballs

The automation lives in [`.github/workflows/release.yml`](./.github/workflows/release.yml).

## Preconditions

Before tagging a release:

1. `VERSION`, `package.json`, and `.claude-plugin/plugin.json` must all match
2. `install.sh` must exist on `main`
3. `bash ./packages/deploy/build-tarball.sh` must succeed locally
4. the repository should already be clean on `main`
5. the GitHub secret `GETALEXANDRIA_PUBLIC_REPO_PUSH_TOKEN` must be configured so Actions can push into the public repo
6. the GitHub secret `ALEXANDRIA_SITE_PUSH_TOKEN` must be configured so Actions can push into the Alexandria website repo
7. the GitHub secrets `ALEXANDRIA_R2_ACCOUNT_ID`, `ALEXANDRIA_R2_BUCKET`, and `CLOUDFLARE_API_TOKEN` must be configured so Actions can publish release downloads to R2

If `install.sh` is missing, the workflow is expected to fail rather than publish a partial Alexandria payload.

## Local validation before tagging

Run:

```bash
pnpm install --frozen-lockfile
bun run check
bun test
tmpdir=$(mktemp -d)
bash ./packages/deploy/build-tarball.sh "$tmpdir"
ls -la "$tmpdir"
rm -rf "$tmpdir"
```

That validates the repo checks plus the actual tarball build path that release automation uses.

## Tagging a release

From a clean `main` checkout:

```bash
git pull --ff-only origin main
git tag "v$(cat VERSION)"
git push origin "v$(cat VERSION)"
```

That tag starts the release workflow.

## After tagging

Watch the Actions run and verify:

1. the GitHub Release was created with the expected tarballs attached
2. the Alexandria website repo received updated site surfaces without release tarballs
3. `https://getalexandria.ai/downloads/latest-version.txt` returns the tagged version
4. `https://downloads.getalexandria.ai/latest-version.txt` returns the tagged version
5. `https://getalexandria.ai/install.sh` is current

## Contributor workflow

For an in-repo guided release pass, use:

`/alexandria-dev-release`

That contributor skill is intended for maintainers operating this release flow by hand.
