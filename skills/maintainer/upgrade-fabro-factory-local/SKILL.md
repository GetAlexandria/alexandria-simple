---
name: alexandria-dev-upgrade-fabro-factory-local
description: >
  Inspect or maintain the intentionally paused local Alexandria Fabro factory.
  Use when asked about its stopped state, retired Docker/ACP authentication
  path, local factory cleanup, or a future replacement authentication design.
  Do not start or upgrade the local factory while its pause marker exists.
---

# Maintain the Paused Local Fabro Factory

The local Docker factory is intentionally disabled. Its former access pattern
copied host Codex CLI credentials into a reusable Docker image and invoked Codex
through ACP. That pattern is retired, and no replacement has been selected.

This skill is maintainer workflow guidance for this repository. It is not part
of Alexandria's shipped product surface.

## Binding State

Read these files first:

```text
.fabro/LOCAL_FACTORY_PAUSED.md
.fabro/README.local.md
.fabro/README.md
```

While `.fabro/LOCAL_FACTORY_PAUSED.md` exists:

1. Do not start or restart the local Fabro server.
2. Do not re-enable its LaunchAgents or Tailscale Serve route.
3. Do not recreate a Docker image containing host Codex credentials.
4. Do not restore the ACP workflow as an interim workaround.
5. Preserve local Fabro storage and run history unless the user explicitly asks
   to delete them.
6. Treat LaunchAgent wrappers, server env files, and process environments as
   secret-bearing local state. Never print their values.

## Inspection Workflow

Check the stopped state without exposing secrets:

```bash
./scripts/fabro-local-server status
launchctl print-disabled gui/$(id -u) | rg 'com\.alexandria\.fabro-local'
tailscale serve status
docker ps -a --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}' |
  rg 'fabro-run-|alexandria/fabro-codex-acp' || true
docker images --format 'table {{.Repository}}:{{.Tag}}\t{{.ID}}' |
  rg 'alexandria/fabro-codex-acp' || true
curl -fsS --max-time 2 http://127.0.0.1:3000/health
```

The expected state is:

- the server reports not running;
- both local Fabro LaunchAgents report disabled;
- Tailscale reports no Serve config for the factory;
- no Fabro ACP images or run containers remain;
- the health request cannot connect.

## Future Replacement Work

A replacement design is a new factory-machinery change, not a routine restart.
Before removing the pause marker, require:

1. an explicit agent authentication and credential-lifetime boundary;
2. a new workflow and sandbox configuration implementing that boundary;
3. an explicit issue-watcher workflow path;
4. deterministic tests plus a local smoke run;
5. director review of the factory change;
6. a deliberate operator decision to re-enable host startup and network access.

Do not update `repos/fabro` as part of this work unless the user separately asks
for a vendored subtree update.

## Final Report

Report the server, LaunchAgent, Tailnet, container, and image states; any files
changed; verification performed; and which replacement-auth decisions remain
open. Never include secret values.
