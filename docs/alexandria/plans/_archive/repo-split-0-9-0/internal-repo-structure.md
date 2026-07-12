# Internal Repo Structure

This document is the concrete structure contract for
`getalexandria/alexandria-internal`.

Use this as the canonical reference for how the private engineering repo should
be laid out during the `0.9.0` cut-over.

## Core Decisions

- `alexandria-internal` is a real `pnpm` workspace monorepo
- each package owns its own `package.json`
- tests and QA move down into the package they actually exercise
- there is no shipped maintainer CLI
- maintainer-only tooling lives as private workspace/package commands
- release/build/deploy logic belongs in testable packages, not an open-ended
  top-level `scripts/` shelf
- maintainer-only skills should live in an auto-discoverable private `skills/`
  surface
- `AGENTS.md` should be a symlink to `CLAUDE.md`
- `README.md` stays private and maintainer-focused
- `README.public.md` is the source of truth for the public repo's `README.md`

## Repository Shape

```text
alexandria-internal/
  package.json
  pnpm-workspace.yaml
  CLAUDE.md
  AGENTS.md -> CLAUDE.md
  README.md
  README.public.md
  VERSION
  CHANGELOG.md
  LICENSE
  .claude-plugin/
  agents/
  skills/
    product/
    maintainer/
  templates/
  docs/
    alexandria/
    design/
    adrs/
  packages/
    ax/
      package.json
      src/
      tests/
      qa/
    viewer/
      package.json
      src/
      tests/
    plugin-runtime/
      package.json
      src/
      tests/
    host-claude/
      package.json
      src/
      tests/
    host-codex/
      package.json
      src/
      tests/
    host-opencode/
      package.json
      src/
      tests/
    deploy/
      package.json
      src/
      tests/
```

## Package Responsibilities

### `packages/ax`

- owns the shipped `ax` binary
- bundles compiled viewer assets
- serves the bundled viewer assets
- owns product-facing CLI behavior only
- owns its own tests and release QA for CLI behavior

### `packages/viewer`

- owns viewer source code only
- builds compiled assets consumed by `packages/ax`
- does not ship to the public repo as a source package

### `packages/plugin-runtime`

- owns the runtime/plugin payload that gets published into the public repo
- owns packaging logic for shipped plugin/runtime surfaces

### `packages/host-*`

- own host-specific packaging and adapter logic
- may start thin, but still get real package boundaries
- should not sprawl back into top-level ad hoc directories

### `packages/deploy`

- owns release/build/publish logic
- is where packaging manifests like `dist-include.txt` should move if they still
  exist
- should absorb durable shell scripts that are actually part of build/release
  behavior
- should be testable like the other packages

## Tests And QA

- do not keep growing top-level `tests/` and `qa/`
- move deterministic tests into the package that owns the code under test
- move package-specific QA into that package as well
- keep only truly cross-package or repo-level test assets at the root, and only
  if they cannot reasonably live with one owner
- evals may remain a private repo-level concern if they span multiple shipped
  surfaces, but ordinary deterministic tests should not

## Skills Layout

- product-facing shipped skills remain in the normal product skill surface
- maintainer-only skills should move out of `contributor-skills/`
- private maintainer skills should live under the private repo's auto-discoverable
  `skills/maintainer/` surface
- do not preserve a separate contributor-skill discovery model if normal skill
  discovery can handle the maintainer workflows

## Top-Level Cleanup Rules

- shrink top-level `scripts/` aggressively
- move enduring deploy/build logic into `packages/deploy`
- move CLI-specific packaging helpers into `packages/ax`
- move viewer-specific build logic into `packages/viewer`
- move host-specific logic into the owning host package
- remove top-level files that only exist to support the old single-repo release
  shape

## File-Level Decisions

- `dist-include.txt` should move into `packages/deploy` or disappear if replaced
- `config/model-routing.yaml` stays private and should move closer to its owning
  private tooling package
- `docs/releases/` should be deleted
- `docs/initialize/initialize-engine.yaml` should move closer to the initialize
  runtime/skill surface
- the rest of `docs/initialize/` should move to `docs/design/` for later sorting

## Non-Goals

- do not create a second shipped maintainer CLI
- do not keep source fallback or Bun-backed public execution
- do not preserve top-level directory sprawl just because it exists today
- do not treat the internal repo as a lightly renamed copy of the current repo
