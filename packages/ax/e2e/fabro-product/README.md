# AX Fabro Product E2E

This harness validates the Alexandria Product Fabro integration with a real
installed `ax`, a real Fabro sidecar, a real Fabro server, and a protocol-level
ACP process. It is meant to catch integration failures that unit tests cannot:
installer packaging, Fabro dev-token auth, workflow rendering, Fabro execution,
ledger writes, viewer APIs, and browser rendering.

## Quick Start

Install dependencies and make sure Fabro is available:

```bash
pnpm install
fabro --version
pnpm --filter @alexandria/ax exec playwright install chromium
```

Run the deterministic smoke:

```bash
pnpm --filter @alexandria/ax e2e:fabro-product -- --keep
```

The command prints a generated project path and artifact directory. The project
is a normal Alexandria project with output under `docs/alexandria`.

## Reviewer Playground

Leave the viewer and Fabro server running:

```bash
pnpm --filter @alexandria/ax e2e:fabro-product -- --viewer
```

The output includes:

```text
Project: /tmp/ax-fabro-product-e2e-.../project
Artifacts: /tmp/ax-fabro-product-e2e-.../e2e-output
Viewer: http://127.0.0.1:...
```

Useful reviewer commands:

```bash
cd /tmp/ax-fabro-product-e2e-.../project
export HOME=/tmp/ax-fabro-product-e2e-.../home
export ALEXANDRIA_HOME=/tmp/ax-fabro-product-e2e-.../home/.alexandria
export PATH=/tmp/ax-fabro-product-e2e-.../install:$PATH

ax doctor
ax run source-assessment
ax start viewer --host 127.0.0.1 --port 56421
curl -s http://127.0.0.1:56421/api/alexandria/orchestration | jq .
```

## What Is Real

- Local release tarballs are built for the plugin payload, `ax`, viewer assets,
  and the Fabro sidecar.
- `install.sh` runs against those tarballs using a local `file://`
  downloads directory.
- Installed `ax` starts a real Fabro server with local sandbox execution.
- Installed `ax run source-assessment` runs the checked-in Fabro workflow.
- The viewer is opened with Playwright and checked as a browser-rendered page.

## What Is Mocked

- `claude` is mocked during installer registration so the test does not mutate
  a reviewer's real Claude plugin state.
- `codex debug models` is mocked by default so `ax doctor` can verify Codex
  auth liveness deterministically.
- The Codex ACP adapter is a small stdio ACP process by default. It handles
  `initialize`, `session/new`, and `session/prompt`, then writes the smoke file
  into the Alexandria workspace.

Use real Codex ACP only when you explicitly want to spend a real local Codex
turn:

```bash
pnpm --filter @alexandria/ax e2e:fabro-product -- --real-codex-acp --keep
```

That mode uses the pinned Codex ACP adapter download path and your actual
`codex` CLI auth. Keep it manual or nightly; it depends on machine auth state.

Use real Claude ACP when you want to prove the installed Playbook UI can launch
a real Fabro ACP-backed agent node:

```bash
pnpm --filter @alexandria/ax e2e:fabro-product -- --real-claude-acp --run-via-ui --keep
```

That mode installs the CLI with `--acp-provider claude`, initializes the project
config with `orchestration.acp.provider = "claude"`, clicks Run in the Playbook
tab, and uses your actual `claude` CLI auth. It does not require a raw ACP
command in `.alexandria/alexandria-config.json`.

## Artifacts

Each kept run writes `e2e-output/`:

- `summary.md` - pass/fail table, paths, reviewer commands
- `viewer.png` - Playwright screenshot
- `viewer-playbook-ui-run.png` - Playbook UI after a UI-launched run
- `viewer-state-after-ui-run.json` - `/api/state` after the UI-launched run
- `viewer-body.txt` - rendered viewer text
- `viewer-health.json`
- `viewer-orchestration.json`
- `viewer-ledger.json`
- `viewer-graph.svg`
- `fabro-smoke.md`
- `ledger-events.jsonl`
- `rendered-workflow.fabro`
- `fabro-run.log`
- command stdout/stderr logs

In GitHub Actions, pass `--output-dir e2e-output` and upload that directory as
an artifact. The harness also appends `summary.md` to `$GITHUB_STEP_SUMMARY`
when that variable is present.

## Options

```text
--keep              Keep the generated test root after the run.
--viewer            Keep the viewer and Fabro server running.
--skip-browser      Skip Playwright viewer assertions.
--real-codex-acp    Use the real Codex ACP adapter and real codex auth.
--real-claude-acp   Use the real Claude ACP adapter and real claude auth.
--run-via-ui        Click Run in the Playbook UI instead of using ax run.
--fabro-bin <path>  Use a specific Fabro binary.
--output-dir <dir>  Write artifacts to a stable directory.
--port <port>       Use a specific viewer port.
```
