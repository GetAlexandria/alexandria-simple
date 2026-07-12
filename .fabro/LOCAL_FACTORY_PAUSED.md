# Local Factory Paused

The local Docker Fabro factory is intentionally disabled as of 2026-07-10.

The retired authentication path copied the maintainer's reusable Codex CLI
credentials into a local Docker image and invoked Codex through the ACP backend.
That path is no longer an approved way to run the factory. Its Dockerfile,
workflow/config, image build helpers, run helper, and checked-in default image
selection have been removed.

No replacement agent-authentication design has been selected. Do not start the
local server, restore the old ACP workflow, or copy host credential files into a
container as an interim workaround. The Railway API-backed factory remains the
supported factory environment.

The checked-in local server helper keeps only `status` and `stop` operational
while this marker exists. Local Fabro run history and generic server state are
preserved so a future design can make an explicit migration decision.

Before re-enabling the local factory:

1. Document the new agent authentication and credential-lifetime boundary.
2. Add a workflow and sandbox configuration that implements that boundary
   without restoring the retired credential-bearing image pattern.
3. Update the issue watcher to receive the new workflow path explicitly.
4. Add deterministic tests and a local smoke test for the new path.
5. Remove this marker in the same reviewed change.
6. Only then re-enable host startup or Tailnet exposure.
