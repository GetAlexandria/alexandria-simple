# Local Fabro Factory

The local Docker factory is paused. Its former agent access path copied host
Codex CLI credentials into a reusable Docker image and invoked Codex through
ACP. That path was retired on 2026-07-10, and no replacement authentication
design has been selected.

See [`LOCAL_FACTORY_PAUSED.md`](LOCAL_FACTORY_PAUSED.md) for the binding status,
the removed surface, and the decisions required before re-enabling it.

## Current Operator State

The intended host state while the factory is paused is:

- `com.alexandria.fabro-local` disabled and unloaded;
- `com.alexandria.fabro-local-prune` disabled and unloaded;
- no Fabro server listening on `127.0.0.1:3000`;
- no Tailscale Serve route proxying to the local Fabro server;
- no `alexandria/fabro-codex-acp` images or Fabro run containers;
- local Fabro storage and completed run history preserved.

Safe inspection commands:

```bash
./scripts/fabro-local-server status
launchctl print-disabled gui/$(id -u) | rg 'com\.alexandria\.fabro-local'
tailscale serve status
docker ps -a --format '{{.ID}}\t{{.Image}}\t{{.Names}}' |
  rg 'fabro-run-|alexandria/fabro-codex-acp' || true
```

`./scripts/fabro-local-server start` and `restart` fail closed while the pause
marker exists. Do not bypass that guard or re-enable the LaunchAgents until a
reviewed replacement authentication design lands.

## Preserved State

The generic local server configuration, helper, prune helper, issue-watcher
code, notification hooks, and server storage remain available for a future
design. The issue watcher no longer chooses a workflow implicitly; any future
operator must provide `FABRO_WATCHER_WORKFLOW_CONFIG` explicitly.

The supported factory environment during this pause is the
[Railway API-backed factory](README.railway.md).
