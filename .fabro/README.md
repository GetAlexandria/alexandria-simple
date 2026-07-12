# Fabro Software Factory

We use Fabro as a software factory for building Alexandria.

There is one supported factory environment and one paused local environment:

- [Railway factory](README.railway.md) - shared remote server using Codex via
  the API, Daytona sandboxes, OpenAI, Brave Search, and the
  `fabro-of-alexandria` GitHub App.
- [Local Docker factory](README.local.md) - paused while a replacement agent
  authentication design is selected. The former credential-bearing ACP path
  has been removed.

These factory environments are separate from the Fabro product code that ships
inside Alexandria. They are also separate from the vendored Fabro source copy at
`repos/fabro`, which is used as upstream reference material and as release
sidecar source. Updating `repos/fabro` does not update either running factory
runtime. The local runtime is intentionally stopped and must not be restarted
while [the pause marker](LOCAL_FACTORY_PAUSED.md) exists.

The vendored `repos/fabro` codebase is still useful when administering either
factory. Use it to sleuth current Fabro behavior, config handling, server
operations, sandbox behavior, hooks, and CLI/server implementation details
without guessing from symptoms alone. Treat it as read-only unless the task is
explicitly to update the vendored subtree.

## Shared Workflow

Useful commands:

```bash
fabro doctor
fabro workflow list
fabro preflight ax-feature --goal "Describe the feature"
fabro run ax-feature --goal "Describe the feature"
fabro pr create <run-id>
```

The `ax-feature` workflow is for approved Alexandria feature work across the
canonical packages and surfaces named by the issue and plan, including
`packages/ax`, `packages/alexandria-plugin`, and `packages/viewer`.

**Boundary (director ruling 2026-07-09): ax-feature is ONLY for code that
extends Alexandria itself.** The factory that builds the code — `.fabro/`
workflow definitions, `packages/factory` hooks/watcher, factory scripts — is
OUTSIDE Alexandria and never goes through ax-feature: its verification
apparatus is tuned for product surfaces and cannot meaningfully exercise
factory-machinery changes. Factory-machinery changes are operator work
(hand-authored PRs, director-reviewed, tested against the factory directly).

The `ax-feature` run config uses the API backend and Daytona for Railway/server
runs. Successful non-dry-run runs create a GitHub pull request after workflow
finalization because the workflow enables `[run.pull_request]`.

## Source Map

- `.fabro/project.toml` defines the Fabro project metadata.
- `.fabro/workflows/ax-feature/` contains the Railway API-backed workflow.
- `.fabro/LOCAL_FACTORY_PAUSED.md` is the fail-closed local-factory status and
  re-enablement boundary.
- `.fabro/local-server.toml` is preserved generic local server configuration;
  it does not define a supported agent-authentication path.
- `packages/factory/` contains local watcher and hook tooling.
- `scripts/fabro-*` contains factory validation and preserved local operations
  helpers.
- `repos/fabro` is vendored upstream Fabro source. Treat it as read-only
  reference material for administration/debugging unless explicitly asked to
  update that subtree.

## More Detail

- [Railway factory runbook](README.railway.md)
- [Local Docker factory runbook](README.local.md)
- Historical setup notes and resolved incidents:
  [`docs/plans/fabro-setup/plan.md`](../docs/plans/fabro-setup/plan.md)
