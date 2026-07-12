# Local Factory Authentication Retirement

## Status

Implemented on 2026-07-10. The replacement authentication design is explicitly
undecided.

## Objective

Retire the local Docker Fabro factory's credential-bearing Codex ACP access
pattern and leave the local factory fail-closed until a reviewed replacement is
chosen.

## Decisions

1. The local factory must not copy `~/.codex/auth.json` or other reusable host
   Codex credentials into a Docker image.
2. The ACP-specific workflow, Docker image definition, build helpers, run
   helper, and default image selection are removed rather than retained as a
   deprecated runnable path.
3. The local server stays stopped. Its LaunchAgents remain disabled, its
   Tailnet proxy remains removed, and checked-in start/restart commands fail
   while the pause marker exists.
4. Completed local run history and generic Fabro server state are preserved.
5. The issue watcher remains reusable but must receive a workflow config path
   explicitly. It cannot silently choose the retired ACP workflow.
6. The Railway API-backed factory remains supported and unchanged.
7. No replacement provider, transport, account type, or credential mechanism
   is selected in this change.

## Changed Surfaces

- Remove `.fabro/docker/codex-acp.Dockerfile`.
- Remove `.fabro/environments/default.toml`.
- Remove the ACP-specific `ax-feature` graph and run config.
- Remove the ACP image-build, run, and in-workflow PR helper scripts.
- Remove the associated root package commands and CI shell path pins.
- Add `.fabro/LOCAL_FACTORY_PAUSED.md` and a fail-closed server-helper guard.
- Rewrite the local runbook and maintainer skill around the paused state.
- Make the issue watcher require `FABRO_WATCHER_WORKFLOW_CONFIG`.
- Narrow workflow contract tests to the supported API workflow and assert the
  retirement boundary.

## Host Shutdown

The operator shutdown removes runtime access without deleting historical Fabro
state:

1. Confirm `fabro ps` has no active runs.
2. Disable and unload `com.alexandria.fabro-local` and
   `com.alexandria.fabro-local-prune`.
3. Stop Fabro's detached local server process.
4. Remove the Tailscale Serve route.
5. Remove completed Fabro run containers.
6. Remove current and untagged `alexandria/fabro-codex-acp` image layers.
7. Preserve `~/.fabro/alexandria-local/storage` and its run records.

## Verification Matrix

| Contract | Verification |
| --- | --- |
| Local server cannot be started accidentally | Run the start helper and assert the pause-marker failure. |
| Local server is stopped | Check helper status and confirm the health endpoint cannot connect. |
| Host startup stays off | Confirm both LaunchAgent labels are disabled and not loaded. |
| Tailnet exposure is gone | Confirm `tailscale serve status` reports no Serve config. |
| Credential-bearing runtime is gone | Confirm no ACP images or Fabro run containers remain. |
| Retired checked-in entry points are gone | Run factory contract tests and repository reference search. |
| Supported remote workflow remains valid | Run `fabro validate` for the API-backed `ax-feature` workflow. |
| Factory code remains sound | Run factory tests, typecheck, lint, shell checks, Markdown lint, and `git diff --check`. |

## Replacement Exit Criteria

The local factory may be re-enabled only in a later reviewed change that:

1. defines the agent authentication and credential-lifetime contract;
2. adds a non-retired workflow and sandbox implementation;
3. updates the watcher and operational docs;
4. provides deterministic tests and a successful local smoke run;
5. removes the pause marker;
6. deliberately re-enables startup and network exposure after verification.
