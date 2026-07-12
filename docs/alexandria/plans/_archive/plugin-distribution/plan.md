# Plan: Plugin Distribution via GitHub Releases + curl Installer

## Context

Alexandria plugin is currently distributed by having users `git clone` the full repo (~7.3 MB). This ships 6.1 MB of dev-only files (tests, design docs, ADRs, sample library, plans) that users don't need. We want a clean, lightweight install experience that delivers only the ~1.2 MB runtime payload.

**Goal:** `curl -fsSL .../install.sh | bash` downloads a stripped tarball, auto-installs Bun if needed, compiles the CLI tools, and lands the plugin in the appropriate `.claude/plugins/` directory.

## Implementation

### Phase 1: Tarball packaging infrastructure

**1. Create `dist-include.txt`** — manifest of runtime files to include in the tarball:
```
.claude-plugin/
VERSION
setup
package.json
bun.lock
tsconfig.json
agents/
bin/
config/
src/
templates/
skills/
docs/wizard/
LICENSE
README.md
CHANGELOG.md
```

**2. Create `scripts/build-tarball.sh`** — local script to build the stripped tarball:
- Reads `dist-include.txt`, copies files to a staging dir
- Excludes `*.test.ts`, `tests/`, eval infrastructure
- Produces `alexandria-v{VERSION}.tar.gz`
- Can be run locally for testing or by CI

**3. Create `.github/workflows/release.yml`** — CI workflow triggered on `v*` tags:
- Runs `bun run check` and `bun test` (gate on passing)
- Calls `scripts/build-tarball.sh` to produce the tarball
- Creates a GitHub Release with the tarball attached via `gh release create`

### Phase 2: curl install script

**4. Create `install.sh`** at repo root — the user-facing entry point:
- Auto-installs Bun if not found (using Bun's official installer)
- Fetches the latest release tag from the GitHub API
- Detects install location:
  - **Inside a git repo:** installs to `<REPO_ROOT>/.claude/plugins/alexandria/` (project-local, discovered automatically by Claude Code)
  - **Not in a git repo:** installs to `~/.claude/plugins/alexandria/` (global fallback)
- **Prompts for confirmation** before installing, showing the target path
- Downloads and extracts the tarball, runs `./setup`
- Supports `CONTEXT_LIBRARY_VERSION` env var to pin a specific version

### Phase 3: Update README and docs

**5. Update `README.md`** install instructions:
- Primary: `curl -fsSL .../install.sh | bash` (auto-detects project vs global install, prompts for confirmation)
- Alternative: git clone (for contributors who need tests/docs/evals)
- Remove the current in-between state

**6. Create `RELEASING.md`** — document the release workflow:
- Bump VERSION/package.json/plugin.json
- Update CHANGELOG.md
- Tag and push: `git tag v0.6.0 && git push --tags`
- CI handles the rest

### Phase 4: Polish

**7. Add `.gitattributes`** with `export-ignore` for dev-only dirs — makes `git archive` also produce clean tarballs.

**8. Update `update-check.ts`** — when an upgrade is available, include the release download URL in output so the upgrade skill can point users to it.

## Key decisions

- **No pre-compiled binaries in releases.** Each `bun build --compile` binary embeds the full Bun runtime (~50-90 MB). With 11 tools, that's 500 MB+ per platform. Source tarball + compile-on-install keeps it at ~1.2 MB.
- **No npm publishing.** Plugin directory layout doesn't map to `node_modules`.
- **curl install is context-aware:** inside a git repo it installs to `<REPO_ROOT>/.claude/plugins/alexandria/` (project-local); outside a repo it falls back to `~/.claude/plugins/alexandria/` (global). Both are auto-discovered by Claude Code. Prompts for confirmation before proceeding.
- **Bun auto-installed** if missing — no prompting, just do it.

## Files to create/modify

| File | Action |
|------|--------|
| `dist-include.txt` | Create — runtime file manifest |
| `scripts/build-tarball.sh` | Create — tarball build script |
| `.github/workflows/release.yml` | Create — release CI workflow |
| `install.sh` | Create — curl installer |
| `README.md` | Modify — new install instructions |
| `RELEASING.md` | Create — release process docs |
| `.gitattributes` | Create — export-ignore rules |
| `src/tools/update-check.ts` | Modify — include release URL |

## Verification

1. Run `scripts/build-tarball.sh` locally, inspect the tarball contents — confirm no tests/docs/plans
2. Extract the tarball to a temp dir, run `./setup`, confirm it compiles and the plugin loads with `claude --plugin-dir`
3. Run `install.sh` in a clean project dir — confirm end-to-end flow works
4. Push a `v0.6.0` tag, confirm CI produces the release with tarball attached
5. Run `bin/alxndr update-check` against the new release — confirm it reports the download URL
