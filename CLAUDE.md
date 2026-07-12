# CLAUDE.md

This is `alexandria-simple`, a personal, non-commercial Alexandria for a
two-person team (Danvers and Jess). It is a pared-down snapshot of the
former `alexandria-internal` monorepo, stripped of the multi-tenant factory
and hosting machinery that a shared commercial product needed, down to the
architecture a two-person team actually runs day to day.

## Architecture

alexandria-simple rests on four pieces:

- **Files are the substrate.** The product library
  (`docs/alexandria/library/`), the Info Hub board
  (`docs/alexandria/info-hub/board-state.json`), colleague journals
  (`docs/alexandria/journal/`), and skills are all plain files on disk.
  There is no database and no server-owned state; everything durable is
  something you could open in an editor.
- **Colleagues are agent files with a duty rhythm.** Raven, Damien, and any
  future colleague are Claude Code plugin agents defined in
  `packages/alexandria-plugin/agents/`. Instead of an always-on listener or
  event process, each colleague runs on a 30-minute cron "duty loop": wake
  up, check state, do a bounded bit of work if there's work to do, write one
  journal entry, go back to sleep. See `docs/alexandria/duty-loop.md` for
  the loop mechanics and `docs/alexandria/colleagues.md` for how to add a
  colleague.
- **Git is sync and history for the two humans and the agents.** There is
  no separate sync service; commits and merges are how state moves between
  machines and between people. Files under `docs/alexandria/` are shared
  history the same way source code is — they get committed with the work
  that produced them, not gitignored or treated as scratch space.
- **One viewer is the pure lens over those files.** `packages/viewer`
  (started via `ax start viewer`, `:4321`) reads and renders the library,
  the Info Hub board, and colleague journals. It does not own state of its
  own.

New viewer features should render more of what's already in the git-tracked
files, not add new server-owned state. If a feature needs state that
outlives a single viewer session, that state belongs in a file under
`docs/alexandria/` (or a new sibling directory following the same pattern),
not in memory or a database the viewer manages itself.

## Package Map

- `packages/alexandria-plugin` — the Alexandria plugin payload: colleague
  agent definitions, skills, and workflows.
- `packages/ax` — the Alexandria CLI.
- `packages/viewer` — the local Alexandria viewer, the one product surface.
  "Look at / run Alexandria" means this — `ax start viewer` (`:4321`).
- `packages/library-card-resolver` — shared library card resolution logic
  used by `ax` and the viewer.
- `packages/host-claude` — host integration for running the plugin inside
  Claude Code.
- `skills/` — maintainer-only local skills for this repository.
- `docs/alexandria/library/` — the working product library that the Library
  viewer section reads.
- `docs/alexandria/info-hub/` — the Info Hub work board the viewer renders.
- `docs/alexandria/ledger/` — retained only because the `ax`/viewer runtime
  reads it for state (event history behind library and card views); treat
  it as runtime data, not a place to hand-edit.

## Guidance Hierarchy

Root guidance is intentionally lightweight. Before changing a package, read
that package's local `CLAUDE.md` when it exists. Package-local guidance
owns package implementation workflow, tests, and validation.

If package-local guidance is missing, use the package README, nearby docs,
and existing code patterns, then keep the change narrowly scoped.

## Cross-Package Safety

- Keep work scoped to the package or surface requested.
- If a change spans packages, update the relevant package-local guidance or
  docs in the same slice.
- Do not freehand-edit `docs/alexandria/library/` during implementation
  work; it is the live product library. Write to it only through plays and
  `ax` commands, which own validation and idempotency.
- Avoid product-specific examples in reusable plugin behavior unless they
  are intentionally part of a fixture or test case.

## Development Setup

For local development:

```bash
bun install
./scripts/setup-dev
```

For fresh automation worktrees:

```bash
./scripts/setup-worktree
```

Notes:

- Prettier is limited to TypeScript, JSON, and YAML in this repo.
- Markdown is linted with `markdownlint-cli2` plus repo semantic checks.
- Shell scripts are checked with `shfmt` and `shellcheck`.
