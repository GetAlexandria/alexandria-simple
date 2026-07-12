# Alexandria

Alexandria gives your AI builder agents the product context they need to make
aligned decisions, not just technically correct ones.

It ships as:

- a Claude Code plugin payload
- the public `ax` CLI
- a local viewer for browsing the Alexandria library inside a project

## Install

From inside your project:

```bash
curl -fsSL https://getalexandria.ai/install.sh | bash
```

That installer:

- installs the public `ax` binary
- installs the Alexandria plugin payload into `.claude/plugins/alexandria/`
  when run inside a Git repo
- installs bundled Fabro orchestration support for local plays
- falls back to a user install outside a repo

## What Alexandria Does

Alexandria gives Raven a structured way to learn your product, record product
events, and coordinate local plays through a deterministic CLI. The project
workspace lives in your repository at `docs/alexandria` by default, with runtime
configuration in `.alexandria/alexandria-config.json`.

The current product surface includes Vision onboarding, source intake, an event
ledger, local wake subscriptions, Fabro-backed plays, and a viewer for reviewing
project state.

## Core Surface

Start with:

```bash
ax --help
```

The public CLI includes:

- `ax init`
- `ax start`
- `ax run`
- `ax raven`
- `ax inspect`
- `ax doctor`
- `ax version`
- `ax upgrade`

## In Claude Code

After installation, start Alexandria:

```text
Run the ax-start skill
```

Raven initializes the project when needed, registers the local event wake
subscription, and guides Vision one slot at a time.

## Project Links

- Website and downloads: `https://getalexandria.ai`
- Release notes: `https://getalexandria.ai/updates`
- Issues: use this repository's issue templates
