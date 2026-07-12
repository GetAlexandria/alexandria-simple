# ADR 001: Dual-Mode Distribution — Plugin + Filesystem Symlinks

**Status:** Implemented
**Date:** 2026-03-23
**Context:** Comparing distribution approaches after studying garrytan/gstack

---

## Decision

Alexandria supports two parallel distribution mechanisms:

1. **Claude Code plugin** (`plugin.json`) — primary mechanism for Claude Code hosts
2. **Filesystem symlinks** — for non-Claude agent harnesses (Codex, Cursor, Windsurf, etc.)

Both mechanisms coexist. The setup script handles both.

## Context

Alexandria is currently distributed as a Claude Code plugin (`.claude-plugin/plugin.json`
with `agents/` and `skills/` auto-registered). This works well for Claude Code but makes the
library invisible to other AI coding assistants.

After studying garrytan/gstack — which distributes 28 skills purely through filesystem
conventions (directories with `SKILL.md` files symlinked into a skills directory) and supports
multiple hosts via a `--host` flag — we identified that our delivery mechanism is vendor-locked
while our actual value (the product knowledge graph) is host-agnostic.

## Why dual-mode, not one or the other

**Why keep the plugin system for Claude Code:**
- Plugins are the official Claude Code mechanism. They may gain capabilities (versioning,
  marketplace, permissions) that filesystem skills won't have.
- Agent auto-registration (`agents/` directory) is a plugin feature. We have a hunch that
  named agents (Conan, Sam) provide value over plain skills — anthropomorphization, explicit
  coordination, sub-agent invocation with tool limitations, context-window isolation. We want
  to preserve this for harnesses that support it.
- The plugin system may become the standard for other harnesses too.

**Why add filesystem symlinks for other hosts:**
- The knowledge graph the library produces (`docs/alexandria/`) is useful to any AI
  coding assistant, not just Claude Code.
- Skills are Markdown files — they work as-is in any tool that scans for `SKILL.md`.
- The agent harness landscape is moving fast (Codex just added sub-agent support). We
  shouldn't bet on a single host.
- gstack proves that sophisticated workflows can run purely through filesystem conventions.

**Why not drop the plugin entirely:**
- We'd lose agent auto-registration, which we believe matters for Conan/Sam's coordination model.
- Plugin features may expand. Abandoning now would mean re-adopting later.
- The plugin is low-maintenance — it's one JSON file.

## Implementation

- A `setup` script at the repo root that:
  - Detects the host (claude, codex, cursor, auto)
  - For Claude Code: registers as a plugin (current behavior)
  - For other hosts: symlinks skills into the appropriate skills directory
  - Both paths share the same skill content
- Agents (Conan, Sam) are Claude Code-specific for now. On other hosts, their functionality
  is exposed through skills instead.
- The `plugin.json` is maintained for Claude Code and any future harnesses that adopt the
  plugin standard.

## Consequences

- Two install paths to maintain and test
- Skill files must work both as plugin-registered skills and as standalone filesystem skills
- Agent functionality may need skill equivalents for non-Claude hosts
- Setup script becomes the primary install mechanism (replacing manual `--plugin-dir`)
