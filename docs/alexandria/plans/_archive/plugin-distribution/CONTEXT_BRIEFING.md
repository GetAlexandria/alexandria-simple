# Context Briefing: Plugin Distribution and Installation

## What the library knows today

### Strong coverage

**ADR 001: Dual-Mode Distribution** (`docs/adrs/001-dual-mode-distribution.md`)
The foundational decision record. Alexandria supports two parallel distribution mechanisms: Claude Code plugin (`plugin.json`) for Claude Code hosts, and filesystem symlinks for non-Claude harnesses (Codex, Cursor, Windsurf). The setup script handles both. Agents are Claude Code-specific; other hosts get skill equivalents. This ADR is well-established (status: Implemented, 2026-03-23).

**Setup script** (`setup`)
The setup script is the primary install mechanism. It detects host (`--host claude|codex|cursor`), supports `--uninstall`, manages state at `~/.context-library/`, compiles CLI tools via Bun, and symlinks into `~/.claude/plugins/` and `~/.claude/skills/`. Supports env var overrides for state dir, compiled dir, and Bun binary path.

**Upgrade skill** (`skills/alexandria-upgrade/SKILL.md`)
Covers the full upgrade workflow: detects install type (git clone vs vendored), runs update-check, pulls updates for git installs, handles vendored installs by looking for a global git install, includes error recovery guidance. This is a well-specified skill.

**Plan already exists** (`docs/plans/plugin-distribution/plan.md`)
A detailed plan for "Plugin Distribution via GitHub Releases + curl Installer" is already written. It covers four phases: tarball packaging infrastructure, curl install script, README/docs updates, and polish. Key decisions are documented: no pre-compiled binaries (too large), no npm publishing, context-aware curl install (project-local vs global), Bun auto-installed if missing.

### Moderate coverage (mentioned but not dedicated cards)

**Implication Tracing capability card** references ADR 001 and the setup script as examples of distribution-related blast radius analysis (e.g., "what changes if we add Cursor support?").

**Raven agent card** includes an example of tracing distribution implications: "the plugin distribution model (ADR 001) only covers Claude Code. The setup script needs a Cursor path."

**Strategy Cascade loop** uses plugin-to-MCP distribution shift as its primary example of a strategic change cascading through the graph.

**Beadification roadmap card** discusses MCP compatibility as a future delivery mechanism (Phase 2: expose library operations as MCP tools), which has distribution implications.

**Exemplar Library Registry roadmap card** envisions CLI-installable card sets (`context-library install saas-template`), which is a distribution mechanism for library content (not the plugin itself).

### Gaps -- areas with minimal or no coverage

1. **No dedicated library card for the setup system.** The setup script exists and is tested (`tests/setup.test.ts`), but the knowledge graph has no System, Component, or Artifact card documenting it as a product concept.

2. **No dedicated card for the update-check system.** The update-check binary exists (`bin/alxndr update-check`), and the upgrade skill references it, but there is no library card explaining the mechanism, its design, or its role in the product.

3. **No card for the plugin manifest or plugin architecture.** `plugin.json` is mentioned in ADR 001 and CLAUDE.md, but the library has no card explaining what a "Claude Code plugin" is, how plugin discovery works, or what the manifest contains.

4. **No card for the build/compile system.** Bun compilation (`bun build --compile`) is central to the setup script and the distribution plan, but the library has no card documenting the build toolchain as a product concept.

5. **No card for version management.** The VERSION file, the version-sync requirement (VERSION/plugin.json/package.json must match), and semver conventions are documented in CLAUDE.md but have no library card.

6. **No card for the tarball/release packaging** envisioned in the plan. This is expected since the plan hasn't been implemented yet.

## Summary

The codebase has solid *infrastructure* for distribution (setup script, upgrade skill, update-check, ADR 001, and a detailed plan). But the *knowledge graph* has almost no cards about distribution, installation, setup, packaging, build systems, or version management. These concepts exist in code and operational docs (CLAUDE.md, ADRs) but have not been captured as library cards.

If you are building the plugin distribution feature, the plan at `docs/plans/plugin-distribution/plan.md` is the primary reference. The setup script, upgrade skill, and ADR 001 are the key implementation artifacts. The library cards are not blocking implementation -- they are a documentation gap that could be addressed in parallel or after the feature ships.
