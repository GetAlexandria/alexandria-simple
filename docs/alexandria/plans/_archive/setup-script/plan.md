# Setup Script + Install Story — Project Plan

**Issue:** #10
**Goal:** Create a setup script and documented install path for Alexandria.

**References:** ADR 001 (`docs/adrs/001-dual-mode-distribution.md`)

---

## Context

No user-facing install exists. The setup script is the foundation for the dual-mode
distribution strategy (ADR 001) — it handles Claude Code plugin registration and
will support filesystem symlinks for other hosts.

---

## Implementation

### Step 1: Setup script

`setup` at the repo root. A bash script that:

1. Detects the host via `--host` flag: `claude` (default), `codex`, `cursor`, `auto`
2. For Claude Code:
   - Creates `~/.claude/plugins/` if needed
   - Symlinks the repo into `~/.claude/plugins/alexandria`
   - Verifies the plugin is discoverable
3. For other hosts (future, stubbed):
   - Symlinks individual skills into the host's skills directory
4. Creates `~/.context-library/` state directory
5. Validates prerequisites (git available)
6. Prints success message with next steps

The script should be idempotent — running it again updates the symlink if needed.

### Step 2: Update README install instructions

Replace the current placeholder install section with the real one-liner:

```
git clone https://github.com/sociotechnica-org/alexandria.git ~/.claude/plugins/alexandria
cd ~/.claude/plugins/alexandria && ./setup
```

### Step 3: Update ADR 001 status

Change status from `Accepted` to `Implemented`.

---

## Testing

`tests/test-setup.sh` — test the setup script:

- **Fresh install** — no prior state, verify symlink created and state dir created
- **Idempotent** — run twice, verify no errors and symlink still correct
- **Already exists** — symlink already points to right place, verify no-op
- **Stale symlink** — symlink points to wrong place, verify updated
- **State directory** — verify ~/.context-library/ created
- **Cleanup** — all tests clean up after themselves

Tests use a temp HOME directory to avoid touching the real filesystem.

---

## Files to Create/Modify

- `setup` — new, setup script at repo root
- `tests/test-setup.sh` — new, test suite
- `README.md` — update install instructions
- `docs/adrs/001-dual-mode-distribution.md` — status → Implemented

---

## Status

- [x] Plan reviewed
- [x] Step 1: Setup script (setup at repo root)
- [x] Step 2: Update README (real install one-liner)
- [x] Step 3: Update ADR 001 (Accepted → Implemented)
- [x] Tests: 22/22 passing
