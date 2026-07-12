# AX Local Playground

This harness creates a repo-local fake customer project for manual Alexandria
Next iteration. The generated project lives under `.tmp/ax-playground`,
which is gitignored.

## Quick Start

```bash
pnpm --filter @alexandria/ax run playground -- reset
source .tmp/ax-playground/env.sh
cd .tmp/ax-playground/project
ax inspect state
```

## Useful Commands

```bash
pnpm --filter @alexandria/ax run playground -- status
pnpm --filter @alexandria/ax run playground -- start-viewer
pnpm --filter @alexandria/ax run playground -- append-play-start
pnpm --filter @alexandria/ax run playground -- append-save
pnpm --filter @alexandria/ax run playground -- append-review
pnpm --filter @alexandria/ax run playground -- register-monitor
pnpm --filter @alexandria/ax run playground -- monitor-once
pnpm --filter @alexandria/ax run playground -- smoke-monitor
pnpm --filter @alexandria/ax run playground -- stop-viewer
```

`reset` writes a local `ax` shim into `.tmp/ax-playground/bin/ax`.
Sourcing `env.sh` puts that shim on `PATH`, points runtime state at the
playground, sets `CLAUDE_PROJECT_DIR` to the fake project, and gives Claude
Code a stable `ALEXANDRIA_CLAUDE_CONNECTION_ID`.

The generated `ax` shim executes `packages/ax/src/cli/main.ts` from this
worktree, so AX CLI edits take effect immediately. Rerun `reset` when you want
a clean fake project or when the playground shim/env behavior changes.

`register-monitor` writes a local wake subscription attached to the playground
connection for `play.started` and `canvas.review.requested` under
`docs/alexandria/.runtime/subscriptions/`. `monitor-once` consumes subscriptions
for that connection and writes a short-lived connection lease under
`docs/alexandria/.runtime/connections/`, which the viewer exposes as agent
connection status.

Viewer changes are served from `packages/viewer/dist`. Rebuild Viewer
and restart the playground viewer after editing viewer code.

## Generated Layout

```text
.tmp/ax-playground/
  artifacts/
  bin/ax
  env.sh
  home/
  project/
  runtime/
```

The fake project is initialized with `ax init project` and includes one inbox
source at `docs/alexandria/inbox/product-brief.md`.
