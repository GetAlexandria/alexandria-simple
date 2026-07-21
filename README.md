# Alexandria Simple

A personal, non-commercial Alexandria for a two-person team (Danvers and
Jess). It is a stripped-down snapshot of `alexandria-internal`, the private
Alexandria monorepo — kept for personal use rather than as a shared
commercial product, so it drops the multi-tenant factory, hosting, and
Studio machinery that product needed and keeps just what two people running
Alexandria for themselves actually use: the `ax` CLI, the viewer, the
plugin, and the library and journals those tools read and write.

Bundled plugin content — colleague agents, skills, and workflows — lives
under `packages/alexandria-plugin`.

## Quickstart

```bash
pnpm install
./scripts/dev-viewer
```

`./scripts/dev-viewer` (also `pnpm run dev:viewer`) starts the viewer
straight from this checkout's source via `bun`, killing anything already on
the port first. Always use this — or the equivalent
`bun packages/ax/src/cli/main.ts start viewer` — rather than a globally
installed `ax` binary. A machine-global `ax` (from `install.sh`, or a manual
`bun build --compile`) is shared across every worktree on the box and will
silently go stale relative to whichever branch you're actually on; running
from source means there is no compiled artifact that can drift out of date.

The viewer runs at `http://localhost:4321` and renders the library
(`docs/alexandria/library/`) and the Info Hub board
(`docs/alexandria/info-hub/board-state.json`) directly from the git-tracked
files in this repo. Colleague journals (`docs/alexandria/journal/`) are
plain markdown read in the editor for now — rendering them in the viewer is
the natural next file-lens to add.

To have a colleague (Raven, Damien, or a future addition) run on its
30-minute cron duty loop instead of only responding when you talk to it
directly, set up the cron job described in `docs/alexandria/duty-loop.md`.
See `docs/alexandria/colleagues.md` for how the colleagues themselves are
defined and how to add a new one.

## Talking to a Colleague

Since this checkout is the only Alexandria a two-person team runs, the
plugin is always used from the local checkout — edits to
`packages/alexandria-plugin` apply immediately, no release step:

```bash
claude --plugin-dir ./packages/alexandria-plugin --agent alexandria:raven
```

## The Ledger

`docs/alexandria/ledger/events.jsonl` is retained because the `ax`/viewer
runtime reads it for state behind the library and card views. It is
**tracked in git** like any other file here — event history, not scratch
state — but it exists to serve the runtime, not as a feature of its own; do
not hand-edit it.

Developer guidance for `ax` CLI feature design lives in
[`packages/ax/docs/cli-design-principles.md`](packages/ax/docs/cli-design-principles.md).

Package boundary:

- bundled colleague agents, skills, and workflows live in
  `packages/alexandria-plugin`
- the CLI lives in `packages/ax`
- viewer source lives in `packages/viewer`
- maintainer-only skills stay at top-level `skills/`
