---
id: FEAT-003
title: "Create install.sh curl installer with context-aware path detection"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-001, FEAT-002]
blocks: [FEAT-005, FEAT-006]
cards: []
---

## Motivation

The install script is the primary entry point for new users. It needs to handle
environment detection, dependency installation, and path selection so the user
gets a working plugin from a single command.

## Description

Create `install.sh` at the repo root — a bash script that:

1. **Detects Bun** — if not found, installs it via Bun's official installer
2. **Fetches latest version** — reads `latest-version.txt` from `sociotechnica.org/alexandria/`
3. **Detects install location:**
   - Inside a git repo: `<REPO_ROOT>/.claude/plugins/alexandria/`
   - Not in a git repo: `~/.claude/plugins/alexandria/`
4. **Prompts for confirmation** — shows the target path, asks y/n
5. **Downloads and extracts tarball** — from `sociotechnica.org/alexandria/alexandria-v{VERSION}.tar.gz`
6. **Runs `./setup`** inside the extracted directory
7. **Prints success** with next steps

Supports `CONTEXT_LIBRARY_VERSION` env var to pin a specific version.

## Context

The install script will be hosted at `sociotechnica.org/alexandria/install.sh`
alongside the tarballs. It must work on macOS and Linux. The setup script it
invokes handles compilation and plugin registration.

The script must handle the case where a previous install exists at the target
path — either update in place or warn the user.

## Acceptance Criteria

- [ ] `curl -fsSL https://sociotechnica.org/alexandria/install.sh | bash` works end-to-end
- [ ] Inside a git repo, installs to `<REPO_ROOT>/.claude/plugins/alexandria/`
- [ ] Outside a git repo, installs to `~/.claude/plugins/alexandria/`
- [ ] Prompts for confirmation before installing (shows target path)
- [ ] Auto-installs Bun if not found
- [ ] Supports `CONTEXT_LIBRARY_VERSION=0.6.0` to pin a version
- [ ] Handles existing installs (update in place)
- [ ] Works on macOS and Linux
- [ ] Plugin loads in Claude Code after installation without `--plugin-dir`

## Implementation Notes

Use `git rev-parse --show-toplevel 2>/dev/null` to detect git repo root.
Use `curl -fsSL https://bun.sh/install | bash` for Bun installation.
Use `mktemp -d` for staging the download, then move to target path.

The script itself is committed to the context-library repo but also deployed
to the website. Keep it self-contained (no dependencies beyond curl and bash).

Files touched: `install.sh` (new).
