# Alexandria Internal

Private engineering monorepo for Alexandria.

This repo is the source of truth for:

- the `ax` CLI
- viewer source and compiled asset generation
- plugin/runtime packaging
- host adapters
- release and deploy tooling
- private planning, evals, QA, and internal product docs

Public-facing repo copy, install/discovery copy, and public release metadata are
derived from here.

Bundled plugin content lives under `packages/alexandria-plugin`.

## Using the Alexandria Plugin in This Repo

The plugin — and Raven — is a tool we use in this repo to get work done.
Default to the **production release**; opt into the **local checkout** only
when actively testing prompt or skill changes.

### Production (default)

Install the released plugin the same way any user does, from the repo root:

```bash
curl -fsSL https://getalexandria.ai/install.sh | bash
```

Re-run the installer to pick up a new release. Then talk to Raven:

```bash
claude --agent alexandria:raven
```

### Local checkout (opt-in, for testing changes)

For a **single session**, no config changes — the lightest way to try an
unreleased prompt edit:

```bash
claude --plugin-dir ./packages/alexandria-plugin --agent alexandria:raven
```

To stay on the local checkout **across sessions** (edits to
`packages/alexandria-plugin` apply immediately, no release needed):

```bash
claude plugin marketplace add /path/to/alexandria-internal/packages/alexandria-plugin
claude plugin install alexandria@alexandria-local
```

(The local marketplace registers itself as `alexandria-local`.)

To return to production:

```bash
claude plugin uninstall alexandria@alexandria-local
claude plugin marketplace remove alexandria-local
curl -fsSL https://getalexandria.ai/install.sh | bash
```

## The Ledger

`docs/alexandria/ledger/events.jsonl` is the project's append-only event
history and is **tracked in git** — shared truth, not scratch state. Branch
work appends events on the branch; merges union them (see `.gitattributes`).
If a tool or agent suggests ignoring, resetting, or hand-editing the ledger,
that is a bug. Details for agents: see CLAUDE.md "The Ledger Is Shared
History".

## Fabro Software Factory

We use a Fabro software factory to build Alexandria.

We also ship Fabro as the orchestrator inside Alexandria as a product, but
that's different from using Fabro to build Alexandria. We also keep a local copy
of the Fabro codebase vendored in `repos/fabro`.

We have a remote Railway-based Fabro server using Codex via API, and a local
Docker-based Fabro server using Codex via ACP. The runbook for using and
maintaining those two factories is at [`.fabro/README.md`](.fabro/README.md).

## Hosted Product Instances

Alexandria can also run as a hosted product instance for a project. This is
separate from the Fabro software factory used to build Alexandria.

Alexandria's own hosted Alexandria instance is called Alexandria Prime and is
deployed at [prime.getalexandria.ai](https://prime.getalexandria.ai).

Use
[`docs/alexandria/ops/product-hosting-runbook.md`](docs/alexandria/ops/product-hosting-runbook.md)
to add or operate an instance: one Railway service, one persistent project
checkout, one Alexandria viewer/runtime, and one `freeq-raven` process per
project/channel pair. The current model keeps `freeq-raven` as the only
Freeq-facing loop and uses Claude Code as a trusted Tailnet heavy-work backend.

Developer guidance for `ax` CLI feature design lives in
[`packages/ax/docs/cli-design-principles.md`](packages/ax/docs/cli-design-principles.md).

Package boundary:

- bundled product skills live in `packages/alexandria-plugin/skills`
- Fabro play workflows live in `packages/alexandria-plugin/workflows`
- the public CLI lives in `packages/ax`
- viewer source lives in `packages/viewer`
- maintainer-only skills stay at top-level `skills/`
