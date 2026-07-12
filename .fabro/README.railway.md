# Railway Fabro Factory

The shared Fabro factory runs on Railway and uses Codex through Fabro's API
backend. Use this environment for API-backed Fabro runs and shared remote run
visibility.

## Server

- Railway project: `fabro-server`
- Web UI: `https://fabro-st.up.railway.app/`
- API URL: `https://fabro-st.up.railway.app/api/v1`
- Storage: Railway volume mounted at `/storage`
- Image: pinned to the last known-good `0.237.0-nightly.0` digest
- Sandbox provider: Daytona
- GitHub App: org-owned `fabro-of-alexandria`
- LLM provider: OpenAI
- Web search: Brave Search

Use the explicit server flag for server-backed commands when you want to avoid
changing your default Fabro CLI target:

```bash
fabro doctor --server https://fabro-st.up.railway.app
fabro run ax-feature \
  --server https://fabro-st.up.railway.app \
  --goal "Describe the feature"
```

`fabro workflow list` reads local project workflow definitions and does not
need a server flag.

Or point your local CLI target at Railway and authenticate:

```toml
[cli.target]
type = "http"
url = "https://fabro-st.up.railway.app"
```

```bash
fabro auth login --server https://fabro-st.up.railway.app
```

## Workflow Runs

The Railway factory uses the default `ax-feature` run config and Daytona
sandboxes. Use it for API-backed runs:

```bash
fabro preflight ax-feature \
  --server https://fabro-st.up.railway.app \
  --goal "Describe the feature"

fabro run ax-feature \
  --server https://fabro-st.up.railway.app \
  --goal "Describe the feature"
```

Successful non-dry-run `ax-feature` runs create a GitHub pull request after
workflow finalization because the workflow enables `[run.pull_request]`.
`fabro pr create <run-id>` is useful if automatic PR creation was skipped or
failed after a completed run.

## MCP

Fabro exposes an MCP server for run management. For local clients that support
stdio MCP servers, use:

```json
{
  "mcpServers": {
    "fabro": {
      "command": "fabro",
      "args": [
        "mcp",
        "start",
        "--server",
        "https://fabro-st.up.railway.app"
      ]
    }
  }
}
```

This gives the client tools for creating, searching, inspecting, steering,
waiting on, and reading events from Fabro workflow runs through the local CLI
auth and server target.

## Operational Notes

Fabro's Daytona `/repos` clone-path bug is fixed in current nightly, but
Daytona can still block sandbox creation if the organization is over its disk
quota. Archive/delete unused Daytona sandboxes before testing normal
PR-producing runs.

The detailed setup history, version-parity notes, and resolved incident notes
live in [`docs/plans/fabro-setup/plan.md`](../docs/plans/fabro-setup/plan.md).
