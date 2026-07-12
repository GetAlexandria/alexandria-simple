# ax Guidance

This package contains the Alexandria CLI. It is Bun, TypeScript, and Effect-based.

## Design Inputs

- Follow `docs/cli-design-principles.md` in this package.
- Use Effect from this package's declared dependencies in `package.json`.
- When writing Effect code, inspect @repos/effect/ for examples of idiomatic usage, tests, module structure, and API design. Treat it as the source of truth for Effect patterns.

## Boundaries

- This CLI implements deterministic support for Alexandria plugin plays.
- The plugin owns the play contract. The CLI should not define product workflow independently from the plugin.
- The first supported command is `ax init`.

## Runtime State

- Config path: `./.alexandria/alexandria-config.json`.
- Default workspace path: `./docs/alexandria`.
- The config file points to the workspace.
- Do not create per-feature config JSON files.

## Implementation Rules

- Command execution should be modeled as `Effect` programs returning `CliResult`.
- Expected operational failures should become structured CLI results with stable exit codes.
- Put command data on stdout and diagnostics on stderr.
- Add black-box tests for command behavior, exit codes, and important output fields.
