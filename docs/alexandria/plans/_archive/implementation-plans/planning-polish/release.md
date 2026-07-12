---
plan: planning-polish
status: complete
version: null
started: 2026-04-02
completed: 2026-04-02
tickets: 5
outcomes: 3
---

# Planning Polish

## Goal

Polish Alexandria's skill surface for preview release. Rename skill `name:`
fields to short names that leverage Claude Code's plugin auto-namespacing, create
a `sync-tickets` skill wrapping the existing CLI tool, wire sync into the
implementation planning skill as a follow-on prompt, remove the
`context-library-upgrade` compatibility alias, and move `release` to
`contributor-skills/`.

## Completion Status

**All 5 tickets closed. All 3 outcomes met.**

| Outcome | Status | Evidence |
|---------|--------|----------|
| O-1: Clean short names under plugin namespace | ✅ Met | Skills renamed: `plan`, `brief`, `upgrade`, `wizard`, `sync-tickets`. `context-library-upgrade` removed. `release` moved to `contributor-skills/`. |
| O-2: Sync invocable as `/alexandria:sync-tickets` | ✅ Met | `skills/sync-tickets/SKILL.md` exists and is registered |
| O-3: Planning references sync as follow-on | ✅ Met | Step 9 in `skills/implementation-planning/SKILL.md` includes sync prompt |

### Deviations from plan

- `context-briefing` was renamed to `brief` (plan said `briefing`) — shorter, consistent with the tightening direction

### Decisions made during execution

- None beyond what was planned

### Bugs discovered during execution

- **#203**: `sync-issues` uses globally-scoped ticket ID matching — clobbers across plans when IDs collide (e.g., two plans both using `FEAT-001`)
- **#211**: `sync-issues` fails to resolve newly-created issues for dependency wiring in same batch — `extractIssueNumber` parsing is fragile and no cache warming from creation

## Scope

**In scope:**
- Skill `name:` field renames (4 skills)
- Removal of `context-library-upgrade` compatibility alias
- Move `release` skill to `contributor-skills/`
- New `sync-tickets` skill wrapping `bin/alexandria-sync-issues`
- Implementation planning Step 9 sync prompt

**Out of scope:**
- Renaming `wizard` to `library` (Danvers's scope, ships with Raven-flavored wizard)
- Agent file changes (no agent renames in this plan)
- CLI tool changes (sync-issues CLI is unchanged; only adding a skill wrapper)
- Library card content changes (tracked in library-updates.md but executed separately)

## Success Outcomes

| ID | Outcome | Tier | Tickets |
|----|---------|------|---------|
| O-1 | All Alexandria skills use clean short names under plugin namespace | must | POLISH-001, POLISH-002, POLISH-003 |
| O-2 | GitHub issue sync is agent-invocable as /alexandria:sync-tickets | must | POLISH-004 |
| O-3 | Implementation planning skill references sync as natural follow-on | should | POLISH-005 |

## Context Summary

See [CONTEXT_BRIEFING.md](CONTEXT_BRIEFING.md) for the full briefing.

Key findings:
- Claude Code auto-prefixes plugin skills as `/alexandria:<name>` -- short names are sufficient
- `context-library-upgrade` is a dead alias with no external users
- `release` is an internal workflow, not a product skill
- `bin/alexandria-sync-issues` already handles the mechanical sync; only needs a skill wrapper

## Decisions

| # | Decision | Options Considered | Chosen | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | Plugin auto-namespace | Manual prefix in name, short names with auto-prefix | Short names | Claude Code handles namespacing; manual prefix is redundant |
| 2 | Remove context-library-upgrade | Keep alias, deprecation warning, remove | Remove | No external users yet; clean slate for preview |
| 3 | Keep wizard name | Rename now, rename later | Keep for now | Danvers will rename to `library` when Raven-flavored wizard ships |
| 4 | Move release skill | Keep in skills/, move to contributor-skills/ | Move | Repo-maintainer workflow, not product surface |
| 5 | sync-tickets default target | Require explicit target, default to GitHub | Default to GitHub | GitHub is the only current target; future targets via arguments |

## Risks and Assumptions

| Type | Description | Mitigation | Tickets |
|------|-------------|------------|---------|
| Assumption | No external users reference old skill names | Pre-preview, no external installs | POLISH-001, POLISH-002 |
| Assumption | scripts/setup-dev handles contributor-skills/ discovery | Verify during POLISH-003 | POLISH-003 |
| Risk | Agent files may reference old invocation names | grep all agents/ and skills/ for stale references | POLISH-001 |

## Ticket Index

| ID | Title | Enabler | Tier | Outcome | Blocked By | Blocks |
|----|-------|---------|------|---------|------------|--------|
| POLISH-001 | Rename skill name: fields to short names | false | must | O-1 | -- | POLISH-002, POLISH-003, POLISH-004 |
| POLISH-002 | Remove context-library-upgrade compatibility alias | false | must | O-1 | POLISH-001 | -- |
| POLISH-003 | Move release skill to contributor-skills/ | false | must | O-1 | POLISH-001 | -- |
| POLISH-004 | Create sync-tickets skill wrapper | false | must | O-2 | POLISH-001 | POLISH-005 |
| POLISH-005 | Add sync prompt to implementation planning Step 9 | false | should | O-3 | POLISH-004 | -- |

## Re-planning Triggers

- If `scripts/setup-dev` does not support contributor-skills discovery, POLISH-003 scope grows to include script updates
- If markdown lint rules reject the sync-tickets skill format, adjust frontmatter to match existing conventions

## Library Updates

See [library-updates.md](library-updates.md).

## Deferred

- **Raven planning nudge** — Raven proactively suggesting `/alexandria:plan` when no plans exist. Deferred until Danvers ships the Raven-flavored wizard (`/library` room). Wire the two together then.
- **Wizard rename to `library`** — Danvers will rename when the experience ships.
- ~~**Sync-issues bug fixes**~~ — #203 (global ID matching) and #211 (batch dependency resolution) both fixed and closed.
- **Library card updates** — `library-updates.md` tracks a Decision card for Skill Naming Convention and an Agent card update for Raven. Not yet executed by Conan/Sam.
