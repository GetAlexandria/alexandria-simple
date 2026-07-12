# Version Tracking + Upgrade Path — Project Plan

**Issue:** #12
**Goal:** Let users know when a new version is available and provide a smooth upgrade path.

---

## Context

Alexandria has no version tracking or update mechanism. If someone installs the
plugin and we ship new features, they have no way to know. After studying gstack's
`gstack-update-check` and `/gstack-upgrade` pattern, we're adding similar infrastructure.

---

## Implementation

### Step 1: VERSION file

Create a `VERSION` file at the repo root containing the current semver version.
Keep it in sync with `plugin.json` version. Start at `0.2.0` since the wizard
engine work represents a significant milestone past the initial `0.1.0`.

### Step 2: Update check script

`bin/alxndr update-check` — a shell script that:

1. Reads local version from `VERSION` (relative to script location)
2. Fetches remote version from GitHub raw URL
3. Compares using semver logic
4. Caches results to avoid hammering GitHub:
   - "up to date" cached for 60 minutes
   - "upgrade available" cached for 12 hours (with reminder)
5. Outputs machine-readable status:
   - `up_to_date` — no action needed
   - `upgrade_available|<remote_version>` — new version exists
   - `check_failed` — network error or parse failure (silent, non-blocking)

Cache stored in `~/.context-library/update-cache` (JSON with timestamp + result).

The script must be:
- Non-blocking (network failure = silent pass)
- Fast (cache hit = instant)
- No dependencies beyond bash, curl, and basic POSIX tools

### Step 3: Upgrade skill

`skills/alexandria-upgrade/SKILL.md` — a skill that handles the upgrade:

1. Detect install type:
   - Git clone: `.git` directory exists in the plugin root
   - Vendored: no `.git`, files were copied into a project
2. For git installs:
   - `git fetch origin main`
   - Show changelog diff (what's new)
   - `git pull origin main`
   - Re-run setup script if it exists
3. For vendored installs:
   - Check if a global install exists at `~/.claude/plugins/alexandria`
   - If yes, copy updated files from global to vendored location
   - If no, tell user to update manually
4. Verify upgrade succeeded (compare VERSION before/after)

### Step 4: Bump version

- Set `VERSION` to `0.2.0`
- Update `plugin.json` version to match
- Add a `bin/alxndr version` convenience script

---

## Testing

### Unit tests for update check
`tests/test-update-check.sh` — test the update check script:

- **Cache miss, up to date** — mock remote VERSION = local VERSION
- **Cache miss, upgrade available** — mock remote VERSION > local VERSION
- **Cache hit** — verify cached result returned without network call
- **Cache expired** — verify fresh fetch after TTL
- **Network failure** — verify graceful fallback to `check_failed`
- **Malformed remote version** — verify graceful handling
- **Missing VERSION file** — verify graceful handling
- **Semver comparison** — verify 0.2.0 < 0.3.0 < 0.10.0 < 1.0.0

### Integration test
- Run update check against real GitHub (optional, for manual testing)
- Verify cache file created in expected location
- Verify cache file format is valid JSON

---

## Files to Create/Modify

- `VERSION` — new, version string
- `bin/alxndr update-check` — new, update check script
- `bin/alxndr version` — new, print current version
- `skills/alexandria-upgrade/SKILL.md` — new, upgrade skill
- `.claude-plugin/plugin.json` — update version to match
- `tests/test-update-check.sh` — new, test suite

---

## Status

- [x] Plan reviewed
- [x] Step 1: VERSION file (0.2.0)
- [x] Step 2: Update check script (bin/alxndr update-check)
- [x] Step 3: Upgrade skill (skills/alexandria-upgrade/SKILL.md)
- [x] Step 4: Bump version (VERSION + plugin.json → 0.2.0)
- [x] Tests: 17/17 passing (semver, caching, error handling, version script)
