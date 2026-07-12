# Public Repo Structure

This document is the concrete structure contract for
`getalexandria/alexandria`.

Use this as the canonical reference for what belongs in the public repo during
the `0.9.0` cut-over.

## Core Decisions

- `getalexandria/alexandria` is a public distribution and issue-intake repo
- it is not the primary development workspace
- it should stay intentionally small
- it should contain only shipped runtime/plugin surfaces, install/discovery
  material, and public issue/reporting surfaces
- it should not contain implementation source, private planning artifacts, evals,
  or internal product-library material
- `README.md` in the public repo should be synced from `README.public.md` in
  `alexandria-internal`
- PRs are disabled; issues are the public interaction surface
- public CLI downloads should resolve through `getalexandria.ai` or another
  public download surface, not a private repo

## Repository Shape

```text
alexandria/
  README.md
  LICENSE
  VERSION
  CHANGELOG.md
  install.sh
  .claude-plugin/
  agents/
  skills/
  templates/
  .github/
    ISSUE_TEMPLATE/
    config.yml
```

## What Ships Here

### Public-facing metadata

- `README.md`
- `LICENSE`
- `VERSION`
- `CHANGELOG.md`
- install and upgrade instructions

### Public plugin/runtime payload

- `.claude-plugin/`
- shipped `agents/`
- shipped `skills/`
- shipped `templates/`

### Public issue/reporting surface

- issue templates for install bugs
- issue templates for release regressions
- issue templates for host support requests
- issue templates for feature/capability requests
- public repo config appropriate for issue-only intake

## What Does Not Ship Here

- source trees such as `src/`
- package source trees such as `packages/`
- repo-level deterministic tests
- repo-level QA harnesses
- evals and eval baselines
- private maintainer skills
- `docs/alexandria/`
- private planning docs
- internal design docs by default
- ad hoc build/release scripts
- private routing/eval tooling

## Public Runtime Contract

- public installs run shipped binaries only
- the public repo does not provide TypeScript source fallback execution
- the public repo does not require Bun after installation
- compiled viewer assets are bundled with `ax` and served by `ax`, not shipped
  here as a source package
- the public repo is a published payload target, not the source of truth for how
  the runtime is built

## Automation Contract

- public repo contents are produced from `alexandria-internal`
- `README.public.md` syncs to public `README.md`
- version and changelog metadata stay aligned with the release train
- plugin/runtime payload sync is automated as part of release
- public CLI artifacts are published to a public download surface
- the public repo should not become a second hand-maintained engineering repo

## Issue Surface Contract

- issues are enabled
- pull requests are disabled
- issue templates should be tailored to real Alexandria usage and install
  problems, not generic boilerplate
- users should be able to discover where to report:
  - install failures
  - upgrade regressions
  - host compatibility gaps
  - feature requests
  - deployment/use-case requests

## Non-Goals

- do not mirror the old repo wholesale
- do not ship private engineering machinery
- do not expose internal roadmap or planning material
- do not turn the public repo into the main development surface
- do not keep dead compatibility structure just because it existed in the old
  repo
