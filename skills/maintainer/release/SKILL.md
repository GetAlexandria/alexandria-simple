---
name: alexandria-dev-release
description: >
  Cut a versioned Alexandria release as a maintainer workflow. Validates the
  source checkout and release artifacts, tags from `VERSION`, monitors the
  checked-in release automation, publishes the public GitHub Release, and
  verifies public repo, R2, site, and installer surfaces.
---

# Release

STALE: `packages/deploy` (build-release-assets/update-site-release/
publish-release-downloads) was removed in the alexandria-simple pare-back and
`.github/workflows/release.yml` no longer runs the steps this skill documents
below. This skill needs a rewrite once alexandria-simple's release mechanism
is decided; until then, do not follow Step 2 literally.

Run the versioned release path for the canonical `alexandria` plugin, `ax` CLI,
Fabro sidecar, installer, public repo payload, R2 downloads, Alexandria site, and
GitHub Releases.

This skill is maintainer workflow guidance for this repository. It is not part
of the Alexandria product surface for downstream users.

Use this skill for canonical `GetAlexandria/alexandria` releases only. Do not
use it for hosted product instance deploys.

Read `README.md`, `RELEASING.md`, `.github/workflows/release.yml`, and the
relevant package `CLAUDE.md` files first.

## Release Topology

1. `alexandria-internal` is the source of truth for version files, tags, release
   automation, and internal GitHub Release artifacts.
2. The release workflow syncs the public repo payload, builds release assets,
   publishes site metadata, publishes R2 downloads, and creates the internal
   GitHub Release.
3. The maintainer workflow must also publish the public
   `GetAlexandria/alexandria` GitHub Release from the same release assets. Do
   not assume the internal workflow does this.

## Boundaries

1. Alexandria releases are versioned and tag-shaped.
2. A normal release creates and pushes a `v*` internal tag that matches
   `VERSION`.
3. The release workflow publishes the `alexandria` plugin, `ax` CLI, Fabro
   sidecar, installer, public repo payload, R2 downloads, and site metadata.
4. `workflow_dispatch` is only for maintainer reruns or repairs after the
   release state is understood. Do not use it to bypass version or validation
   gates.
5. Do not deploy hosted Alexandria product instances from this skill.
6. Do not repeatedly overwrite an existing release version.

## Workflow

### Step 1: Confirm the release is actually ready

Before tagging:

1. Fetch current refs:

   ```bash
   git fetch origin main --tags --prune
   ```

2. Ensure release prep is already merged to `origin/main`.
3. Ensure this checkout is clean except for ignored local-only directories.
4. Ensure the commit to tag is exactly `origin/main`.
   - In a normal checkout, `main` may be checked out and fast-forwarded.
   - In Codex or automation worktrees, `HEAD` may be detached at `origin/main`;
     that is acceptable.
   - Do not run `git switch main` blindly. A local `main` branch can be stale or
     checked out in another worktree.
5. Confirm all version sources match:
   - `VERSION`
   - root `package.json`
   - `packages/alexandria-plugin/package.json`
   - `packages/alexandria-plugin/.claude-plugin/plugin.json`
   - `packages/alexandria-plugin/.codex-plugin/plugin.json`
   - `packages/ax/package.json`
   - `packages/viewer/package.json`
6. Confirm `CHANGELOG.md` includes the release version.
7. Confirm `install.sh` exists.
8. Confirm the required GitHub Actions secrets are configured:
   - `GETALEXANDRIA_PUBLIC_REPO_PUSH_TOKEN`
   - `ALEXANDRIA_SITE_PUSH_TOKEN`
   - `ALEXANDRIA_R2_ACCOUNT_ID`
   - `ALEXANDRIA_R2_BUCKET`
   - `CLOUDFLARE_API_TOKEN`

Do not tag if any prerequisite is missing. If the repo is still at the previous
version, stop and prepare the release version/changelog first.

### Step 2: Run local validation

Run the same checks the release path depends on:

```bash
git fetch origin main --tags --prune
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
pnpm install --frozen-lockfile
pnpm run check
bun test $(git ls-files 'packages/**/*.test.ts')
public_repo_dir=$(mktemp -d)
tmpdir=$(mktemp -d)
git clone https://github.com/GetAlexandria/alexandria "$public_repo_dir"
ALEXANDRIA_PUBLIC_REPO_DIR="$public_repo_dir" \
  bun packages/plugin-runtime/src/sync-public-repo.ts
ALEXANDRIA_PUBLIC_REPO_DIR="$public_repo_dir" \
ALEXANDRIA_RELEASE_OUTPUT_DIR="$tmpdir" \
  ALEXANDRIA_RELEASE_TARGET=alexandria \
  bun packages/deploy/src/build-release-assets.ts
find "$tmpdir" -maxdepth 3 -type f | sort
rm -rf "$tmpdir" "$public_repo_dir"
```

This mirrors the workflow order: sync the public repo payload first, then build
release assets from that synced checkout. Do not rely on the default
`../alexandria` checkout for release validation unless you have explicitly
synced it with the same command.

The generated files must include:

1. `downloads/alexandria-plugin-v$version.tar.gz`
2. `downloads/ax-v$version-<platform>.tar.gz`
3. `downloads/fabro-v$version-<platform>.tar.gz`
4. `downloads/latest-version.txt`
5. `install.sh`

If any command fails, fix that before tagging.

### Step 3: Show the pre-tag summary

Before creating the tag, show the user:

1. the version from `VERSION`
2. whether `CHANGELOG.md` includes an entry for that version
3. the most recent internal release tag
4. the current `origin/main` commit
5. whether any open PRs are still targeting `main`
6. whether the public repo already has tag or release `v$version`

If the user has already explicitly asked to cut or run this release, this
summary is enough and you may proceed to tagging after all prerequisites and
local validation pass. Ask for explicit confirmation only when release intent is
ambiguous, a prerequisite is questionable, or the summary reveals a new risk the
user has not already accepted.

### Step 4: Tag the internal release

Create and push a `v*` tag that matches `VERSION` exactly from the current
`origin/main` commit:

```bash
git fetch origin main --tags --prune
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
version="$(tr -d '[:space:]' < VERSION)"
git tag "v$version"
git push origin "v$version"
```

Do not invent a tag version that disagrees with the repo files.

### Step 5: Watch the internal release workflow

Monitor `.github/workflows/release.yml` until it reaches a terminal state.

Verify that all expected jobs complete:

1. `sync-public-repo`
2. `build-release-assets` for Linux and macOS
3. `publish-site`
4. `publish-release-downloads`
5. `create-github-release`

Then verify the internal GitHub Release exists and contains:

1. `alexandria-plugin-v$version.tar.gz`
2. `ax-v$version-linux-x64.tar.gz`
3. `ax-v$version-darwin-arm64.tar.gz`
4. `fabro-v$version-linux-x64.tar.gz`
5. `fabro-v$version-darwin-arm64.tar.gz`
6. `install.sh`

If the run fails, stop and diagnose the failing job before doing any follow-up
release actions.

### Step 6: Publish the public GitHub Release

After the internal workflow succeeds and the public repo sync is visible, create
or verify the public release in `GetAlexandria/alexandria`.

1. Resolve the public repo `main` commit after sync:

   ```bash
   public_sha="$(gh api repos/GetAlexandria/alexandria/git/ref/heads/main --jq .object.sha)"
   ```

2. If public tag or release `v$version` already exists, inspect it before any
   mutation. Do not clobber existing release assets without explicit maintainer
   confirmation.
3. Download the internal release assets into a temporary directory:

   ```bash
   assets_dir=$(mktemp -d)
   gh release download "v$version" \
     --repo GetAlexandria/alexandria-internal \
     --dir "$assets_dir"
   ```

4. Write release notes from the matching `CHANGELOG.md` entry, with a short
   install link if useful.
5. Create the public release and public tag from the synced public repo commit:

   ```bash
   gh release create "v$version" "$assets_dir"/* \
     --repo GetAlexandria/alexandria \
     --target "$public_sha" \
     --title "v$version" \
     --notes-file "$notes_file" \
     --latest
   ```

6. If the release exists but only lacks assets, upload the missing assets with
   `gh release upload`. Do not use `--clobber` unless the maintainer explicitly
   approves replacing already-published files.
7. Remove temporary asset and notes directories.

### Step 7: Verify published surfaces

Verify the release externally before declaring it done:

1. Internal GitHub Release exists for `v$version`.
2. Public GitHub Release exists at
   `https://github.com/GetAlexandria/alexandria/releases/tag/v$version`.
3. `https://github.com/GetAlexandria/alexandria` contains the shared marketplace
   and updated `/alexandria` plugin payload.
4. `https://downloads.getalexandria.ai/latest-version.txt` matches `$version`.
5. R2 returns 200 for:
   - `https://downloads.getalexandria.ai/alexandria-plugin-v$version.tar.gz`
   - `https://downloads.getalexandria.ai/ax-v$version-linux-x64.tar.gz`
   - `https://downloads.getalexandria.ai/ax-v$version-darwin-arm64.tar.gz`
   - `https://downloads.getalexandria.ai/fabro-v$version-linux-x64.tar.gz`
   - `https://downloads.getalexandria.ai/fabro-v$version-darwin-arm64.tar.gz`
6. Versioned R2 tarballs use immutable cache headers.
7. `https://getalexandria.ai/install.sh` serves the current installer.
8. `https://getalexandria.ai/downloads/latest-version.txt` matches `$version`.
9. `alexandria-site` has `src/data/version.json` set to `$version`.

### Step 8: Smoke-test the installer

Run a real installer smoke test in a temp git repo with isolated install paths.
Do not mutate real Claude or Codex state.

At minimum, confirm:

1. `install.sh` downloads the deployed plugin payload.
2. `install.sh` downloads the deployed `ax` binary.
3. `install.sh` downloads the deployed Fabro sidecar.
4. the installed `ax` binary can print help or version output.
5. plugin registration failure degrades to manual-registration instructions when
   a fake or missing `claude` CLI is used.

### Step 9: Close the loop

Record:

1. the internal release tag
2. the GitHub Actions run URL
3. the internal GitHub Release URL
4. the public GitHub Release URL
5. the public repo tag commit
6. the public repo commit, if it changed
7. the site repo commit, if it changed
8. installer smoke-test result
9. any deployment follow-up needed

## Failure Diagnosis

If the run fails, categorize the failure before retrying:

1. repo validation failure
2. missing release prerequisite
3. public repo sync failure
4. build artifact failure
5. R2 publication failure
6. site publication failure
7. internal GitHub Release creation failure
8. public GitHub Release creation failure

Do not delete and recreate tags casually. If a tag has already escaped, state
exactly what was published before deciding whether to retry, supersede, or
manually repair.

## Anti-Patterns

1. Tagging from a dirty checkout
2. Tagging a version that does not match checked-in release files
3. Switching to a stale local `main` branch in an automation worktree
4. Treating internal GitHub Release creation as sufficient without creating the
   public GitHub Release
5. Treating GitHub Release creation as sufficient without verifying R2 and site
   surfaces
6. Running the release workflow to deploy hosted product instances
7. Bypassing local artifact validation because CI will catch it
