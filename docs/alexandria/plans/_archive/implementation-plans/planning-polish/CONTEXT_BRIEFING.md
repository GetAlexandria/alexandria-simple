# Context Briefing: Planning Polish

## Primary Cards

- **[[Artifact - Decision 33: Planning and Library Are Discrete Systems]]** -- Planning produces implementation plans; the library stores product knowledge. They share infrastructure (graph, DAG engine) but are separate concerns. This plan touches the planning skill surface, not the library itself.
- **[[Principle - Front-Load Value Not Completeness]]** -- Surface the next useful step (sync-tickets) when the user is most likely to want it, rather than building an elaborate automated pipeline.

## Key Systems

- **sync-issues CLI tool** (`bin/alexandria-sync-issues`, `src/tools/sync-issues.ts`) -- Parses plan ticket files, creates/updates GitHub issues via `gh`. Supports `--dry-run` and `--update` flags. Already tested in `src/tools/sync-issues.test.ts`.
- **Plugin auto-namespacing** -- Claude Code prefixes plugin skills as `/alexandria:<name>`. Skills only need a short `name:` field; the namespace is applied automatically by the host.

## Current Skill Surface

Six skills in `skills/`:
- `wizard` -- Configure a new Alexandria
- `implementation-planning` -- Create implementation plans
- `context-briefing` -- Assemble context for tasks
- `alexandria-upgrade` -- Upgrade Alexandria
- `context-library-upgrade` -- Compatibility alias (to be removed)
- `release` -- Cut releases (to be moved to contributor-skills/)

Six agents in `agents/`:
- Conan, Sam, Nit, Bridget, Raven, Solomon

## Gap Manifest

- **No decision card for skill naming convention.** The choice to use short names under plugin auto-namespace was made during this planning session. Needs a new Decision card.
- **No skill file for issue sync.** The CLI tool exists but has no skill wrapper. Users must invoke `bin/alexandria-sync-issues` manually with the correct arguments.
