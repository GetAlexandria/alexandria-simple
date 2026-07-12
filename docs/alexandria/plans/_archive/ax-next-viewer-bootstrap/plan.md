# Technical Plan: Alexandria Next Viewer Bootstrap

- Goal: create a new Alexandria Next viewer package that starts as a minimal
  Hello World Astro app, is built and bundled with the new CLI distribution,
  and is served by `ax2 viewer`.
- Primary packages: `packages/viewer-next`, `packages/ax-next`
- Related packages: `packages/alexandria-next-plugin`

## Scope

In scope:

- Add a new `packages/viewer-next` workspace package.
- Use the same viewer technology stack as the current viewer:
  Astro, React, Tailwind, and TypeScript.
- Keep the first viewer page intentionally minimal: a Hello World screen proving
  the Next viewer boots.
- Use Effect patterns where they clarify runtime boundaries and deterministic
  behavior, especially in the `ax-next` command implementation.
- Add `ax2 viewer` as an end-user CLI entry point that serves the bundled
  viewer.
- Package the built viewer output with the Next CLI distribution path.
- Add black-box tests for the CLI behavior and package-local checks for the
  viewer package.

Out of scope:

- Migrating or deleting `packages/viewer`.
- Reusing Alexandria 1 graph parsing, dashboard, card routes, plan routes, or
  visual theme implementation.
- Adding maintainer or release workflow commands to `ax2`.
- Adding a public `ax2 viewer build` command.
- Building content-specific static exports from user workspaces.
- Adding real Alexandria workspace visualization beyond Hello World.
- Changing `packages/alexandria-plugin` or Alexandria 1 release behavior.

## Clarified Decisions

### `ax2` Is End-User Product Surface Only

The `ax2` CLI is for Alexandria end users working inside their own projects.
It should not expose maintainer workflow, repo development, release packaging,
or viewer build commands.

Keep the distinction sharp:

- End-user commands belong in `ax2`.
- Maintainer checks belong in package scripts such as
  `pnpm --filter @alexandria/viewer-next run build`.
- Release packaging belongs in deploy/setup tooling, not in `ax2`.

This means `ax2 viewer` should answer the user question: "show me my
Alexandria Next workspace." It should not answer the maintainer question:
"build or package the viewer app."

### No Product-Facing Env Var Contract

The viewer should not introduce environment variables as a user-facing
configuration mechanism.

The source of truth for Alexandria Next project state remains:

```text
./.alexandria-next/alexandria-config.json
```

Earlier viewer code used env vars because the old CLI spawned Astro and needed
to pass paths into a separate process. For Alexandria Next, the preferred shape
is different:

- `ax2` reads the project config.
- `ax2 viewer` serves a prebuilt static frontend.
- When the frontend later needs project data, the CLI should expose runtime
  endpoints such as `/api/*` from the local viewer server.
- The prebuilt Astro app should call those local runtime endpoints instead of
  relying on build-time env injection.

Internal env vars can still be used in tests or release scripts if needed, but
they are not part of the viewer product contract.

### No Public Viewer Build Command Initially

`ax2 viewer build` is not needed for the first Next viewer.

The built viewer should be distributed with the CLI. End users should run:

```bash
ax2 viewer
```

The build step belongs to maintainer package and release workflows:

```bash
pnpm --filter @alexandria/viewer-next run build
```

That command produces the static assets that the CLI distribution includes.
If a later requirement needs user-specific static export, design that as a
separate command with its own output contract and tests.

### Effect Boundary

The Effect pattern is not "wrap every line in Effect." The useful boundary is
the CLI/runtime edge where failures and side effects need structure.

For this slice, `ax-next` should model viewer serving as Effect services:

- config loading through existing or extended `FileSystem` service
- viewer asset resolution through a small `ViewerAssets` service or pure helper
- static serving through a `ViewerServer` service backed by `Bun.serve`

This gives tests a way to exercise command behavior without hard-coding Bun
server details into argument parsing and config validation.

## Current State

- `packages/viewer` is an Astro 5, React, Tailwind package.
- The old `ax viewer` command shells into `packages/viewer` package scripts and
  asks Astro to serve or build directly.
- `packages/ax-next` currently supports only `ax2 init`.
- `packages/ax-next` command execution already follows the desired pattern:
  parse arguments, run an Effect program, and return a `CliResult`.
- The current repository release packaging is still Alexandria 1 oriented.
  The Next packaging path needs an explicit slice before it ships.

## Proposed Architecture

### Package Layout

Create:

```text
packages/viewer-next/
  package.json
  astro.config.mjs
  tailwind.config.mjs
  tsconfig.json
  src/
    pages/
      index.astro
    styles/
      global.css
```

Package name:

```json
"@alexandria/viewer-next"
```

Initial scripts:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "format": "bun ../ax/src/tools/repo-prettier.ts --write",
  "format:check": "bun ../ax/src/tools/repo-prettier.ts --check"
}
```

Dependencies should mirror the current viewer stack where practical:

- `astro`
- `@astrojs/react`
- `@astrojs/tailwind`
- `react`
- `react-dom`
- `tailwindcss`
- `effect`

### Initial UI

The first page should only prove the application boots:

- title: `Alexandria Next`
- visible body text: `Hello Alexandria Next`
- small secondary status line such as `Viewer shell ready`

Keep styling restrained and minimal. Do not port the Alexandria 1 visual system
yet.

### CLI Surface

Initial command:

```bash
ax2 viewer [options]
```

Options:

```text
--host <host>      Host to bind. Default: 127.0.0.1
--port <port>      Port to bind. Default: 4321
--open             Open the viewer in a browser, if supported
--json             Emit startup details as JSON
--help, -h         Show help
```

No subcommands are required initially.

This command surface is intentionally end-user oriented. Do not add flags that
exist only to help maintainers build, package, debug release artifacts, or
exercise repo-local Astro workflows.

Human output example:

```text
Alexandria Next viewer running at http://127.0.0.1:4321/
Workspace: /path/to/project/docs/alexandria
```

JSON output example:

```json
{
  "status": "running",
  "url": "http://127.0.0.1:4321/",
  "workspacePath": "/path/to/project/docs/alexandria"
}
```

Expected failures should have stable exit codes:

- `0`: viewer started or help printed
- `2`: invalid args or Alexandria Next is not initialized
- `1`: operational failure, such as missing bundled viewer assets or port bind
  failure

### CLI Runtime Behavior

`ax2 viewer` should:

1. Parse args without side effects.
2. Read `.alexandria-next/alexandria-config.json`.
3. Resolve the configured workspace path relative to the project root.
4. Resolve bundled viewer assets.
5. Start a local static server over the bundled viewer `dist`.
6. Expose future runtime data endpoints from the same server.
7. Print startup details to stdout.
8. Keep the process alive until interrupted.

The existing `CliResult` type may need a small extension for long-running
commands, for example:

```ts
export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  keepsProcessAlive?: boolean;
}
```

The `main.ts` runner should only call `process.exit` when
`keepsProcessAlive !== true`.

### Static Server

Use `Bun.serve` from the CLI package to serve the prebuilt assets.

Behavior:

- `/` serves `index.html`.
- existing asset paths serve files from the bundled `dist`.
- unknown non-API paths can fall back to `index.html` once the viewer becomes a
  routed app.
- `/api/health` can return a small JSON payload in the first slice to prove the
  runtime endpoint pattern.

This avoids requiring Astro, Vite, or Tailwind to run in the user's project.

### Viewer Asset Resolution

Resolution should support at least two layouts:

- internal repo layout:
  `packages/viewer-next/dist`
- packaged CLI layout:
  bundled viewer assets beside the `ax-next` package or inside a known
  distribution directory

The implementation should not import Alexandria 1 plugin path helpers directly.
Add a small `ax-next` resolver that matches the Next package layout.

### Packaging

The maintainer release/package workflow should:

1. Build `packages/viewer-next`.
2. Include `packages/viewer-next/dist` in the Next CLI payload.
3. Include enough package metadata for asset resolution tests.
4. Avoid changing the Alexandria 1 tarball unless the release boundary is
   explicitly broadened.

Until the Next release path is formalized, keep this documented as a required
follow-up and make source-layout tests pass first.

## Implementation Steps

1. Add this plan under
   `docs/alexandria/plans/ax-next-viewer-bootstrap/plan.md`.
2. Create `packages/viewer-next` with Astro, React, Tailwind, TypeScript, and a
   Hello World page.
3. Add package-local `check`, `build`, and format scripts.
4. Update root workspace scripts so `viewer-next` participates in relevant
   lint/type/check flows without replacing `packages/viewer`.
5. Add `ax2 viewer --help` to the root command help and router.
6. Add an `ax-next` viewer command module that parses options and validates
   initialization through the existing config file.
7. Add Effect services or helpers for viewer asset resolution and static
   serving.
8. Extend `CliResult` and `main.ts` if needed for long-running serve commands.
9. Implement static file serving over the prebuilt viewer assets.
10. Add a minimal runtime endpoint such as `/api/health`.
11. Add black-box tests for help, missing config, invalid args, and starting the
    server after `ax2 init`.
12. Add a source-layout asset resolution test.
13. Add or update packaging documentation/tests once the Next distribution path
    is selected.

## Verification

Run:

```bash
pnpm --filter @alexandria/viewer-next run check
pnpm --filter @alexandria/viewer-next run build
pnpm --filter @alexandria/ax-next run typecheck
pnpm --filter @alexandria/ax-next run test
```

Then run the broader repo checks appropriate for the final diff:

```bash
pnpm run lint:workspace
pnpm run format:check:prettier
```

If setup or release packaging files are changed, also run the relevant setup or
tarball tests.

## Acceptance Criteria

1. `packages/viewer-next` exists as an independent workspace package.
2. The package uses Astro, React, Tailwind, TypeScript, and Effect.
3. `packages/viewer-next` builds to static output.
4. `ax2 viewer --help` documents the initial viewer command.
5. `ax2 viewer` rejects uninitialized projects with exit code `2` and a clear
   instruction to run `ax2 init`.
6. After `ax2 init`, `ax2 viewer` serves the bundled Hello World viewer.
7. The CLI serves prebuilt assets; it does not run Astro in the user's project.
8. No public `ax2 viewer build` command is added in this slice.
9. Tests cover the command contract and asset resolution.
10. Alexandria 1 viewer and plugin behavior remain unchanged.

## Deferred Follow-Ups

1. Formalize the Alexandria Next distribution package and include
   `viewer-next/dist`.
2. Add real runtime APIs for reading Alexandria Next workspace state and ledger
   history.
3. Add viewer routes for play state, docs, ledger events, and generated outputs.
4. Decide whether the viewer needs a separate static export command for user
   workspaces.
5. Add browser-level visual verification once the viewer has more than the
   Hello World screen.
