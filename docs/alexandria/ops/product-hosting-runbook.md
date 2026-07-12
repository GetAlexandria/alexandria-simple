# Alexandria Product Hosting Runbook

This runbook is the operator guide for adding or maintaining a hosted
Alexandria product instance.

Use it when you need one Alexandria Next runtime, one viewer, and one
`freeq-raven` process for a project/channel pair. The design background lives in
`docs/alexandria/plans/alexandria-product-hosting/plan.md`.

## Operating Model

- One Alexandria instance maps to one project repository and one Freeq channel.
- One Railway service and one Railway volume host that instance.
- The project checkout on the volume is the canonical filesystem/Git state for
  that hosted instance.
- `freeq-raven` is the only Freeq-facing agent loop. Do not add `freeqcc` to
  these deployments.
- Raven sends heavy work to Claude Code through `RAVEN_TOOL_COMMAND`; Claude
  Code returns stdout for Raven to relay.
- Claude Code subscription auth stays on a trusted Tailnet machine. Railway
  reaches it over Tailscale.
- The existing Railway Fabro software factory is not part of this product host.
  It builds Alexandria; this runbook hosts Alexandria for a project.
- Run one service replica per instance. The checkout, Alexandria ledger, Fabro
  state, and Raven process assume one writer.

## Instance Worksheet

Fill this out before creating the Railway service.

| Field | Example | Notes |
|-------|---------|-------|
| Instance id | `freeq-raven` | Stable slug used in paths and hostnames |
| Target repo | `https://github.com/sociotechnica-org/freeq-raven.git` | The repo Raven/Alexandria inspect and mutate |
| Target branch | `main` | The hosted writer pushes here |
| Railway project | `alexandria-product-freeq-raven` | One project per instance is simplest |
| Railway service | `alexandria-freeq-raven` | One service per instance |
| Railway volume mount | `/data` | Must persist across deploys |
| Project checkout | `/data/projects/freeq-raven` | Derived from the instance id |
| Alexandria home | `/data/home` | Used as `HOME` by the host wrapper |
| Alexandria workspace | `/data/workspaces/freeq-raven` | Optional external workspace path |
| Tailnet hostname | `alexandria-freeq-raven-railway` | Railway service node |
| Viewer URL | Tailnet Serve URL or protected Railway URL | Prefer Tailnet-only first |
| Freeq server | `wss://irc.freeq.at/irc` | Usually the default |
| Freeq channel | `#alexandria` | One Raven per channel/instance |
| Raven nick | `Raven` | Use a unique nick for each instance |
| Raven identity | `raven` | Backed by the instance's agent key |
| Claude worker endpoint | `http://claude-code-1:8765` | Tailnet-only endpoint |
| Alexandria ACP endpoint | `http://claude-code-1:8766` | Tailnet-only ACP bridge |
| Git credential | GitHub token, deploy key, or app token | Needs read/write for target repo |
| Operator owner | Person/team | Responsible for dirty-state recovery |

## Required Secrets

Store secrets as Railway variables, Tailscale secrets, or trusted-machine local
state. Do not bake them into Docker images.

| Secret | Location | Purpose |
|--------|----------|---------|
| `GITHUB_TOKEN` or deploy key | Railway | Clone/fetch/push target repo |
| `TS_AUTHKEY` or Tailscale OAuth secret | Railway | Join the Tailnet |
| `INCEPTION_API_KEY` | Railway | Raven live chat model |
| `DEEPGRAM_API_KEY` | Railway | Speech-to-text |
| `ELEVENLABS_API_KEY` | Railway | Text-to-speech |
| `RAVEN_CLAUDE_ENDPOINT_TOKEN` | Railway and trusted worker | Optional worker auth |
| Claude Code subscription auth | Trusted machine only | Heavy work and ACP provider |

## Railway Variables

Set these for each instance:

```bash
ALEXANDRIA_INSTANCE_ID=freeq-raven
ALEXANDRIA_PROJECT_REPO=https://github.com/sociotechnica-org/freeq-raven.git
ALEXANDRIA_PROJECT_BRANCH=main
ALEXANDRIA_DATA_DIR=/data
ALEXANDRIA_NEXT_ACP_PROVIDER=claude
ALEXANDRIA_NEXT_WORKSPACE=/data/workspaces/freeq-raven

FREEQ_SERVER=wss://irc.freeq.at/irc
FREEQ_CHANNEL=#alexandria
RAVEN_FREEQ_NICK=Raven
RAVEN_IDENTITY_NAME=raven
RAVEN_TOOL_COMMAND=/app/bin/raven-claude-runner
RAVEN_CLAUDE_ENDPOINT=http://claude-code-1:8765

TAILSCALE_HOSTNAME=alexandria-freeq-raven-railway
ALEXANDRIA_ACP_ENDPOINT=http://claude-code-1:8766
```

Also set provider keys, Git credentials, and Tailscale auth variables from the
secrets table.

## Provision A New Instance

1. Choose the target project repo and Freeq channel.
2. Fill out the instance worksheet.
3. Confirm the target repo has a protected or reviewable `main` branch and a
   Git credential that can push intentional hosted changes.
4. Create a new Railway project or service from the `freeq-raven` Railway
   deployment.
5. Attach one persistent Railway volume at `/data`.
6. Set the Railway variables and secrets for this instance.
7. Create a Tailscale auth key or OAuth client for the Railway service. Use a
   tag such as `tag:alexandria-host` when the Tailnet ACLs support it.
8. Configure the trusted Claude Code machine:
   - join the Tailnet;
   - authenticate Claude Code interactively with the subscription account;
   - create a per-instance worker directory;
   - expose a Tailnet-only Claude worker endpoint for Raven;
   - expose a Tailnet-only ACP endpoint for Alexandria/Fabro.
9. Deploy the Railway service with one replica.
10. Watch logs until the host wrapper has:
    - joined Tailscale;
    - cloned or fast-forwarded the target repo;
    - installed Alexandria Next;
    - run `ax2 inspect state --json`;
    - started the viewer/runtime;
    - started `freeq-raven`.
11. Open the viewer over the Tailnet or protected URL.
12. Run the verification checklist.

## Trusted Claude Machine

The trusted machine can serve more than one hosted instance, but each instance
must have separate work directories, locks, ports, and logs.

Recommended layout:

```text
/srv/alexandria-instances/
  freeq-raven/
    checkout/
    logs/
    locks/
  other-project/
    checkout/
    logs/
    locks/
```

For each instance:

- keep Claude Code authenticated only on this machine;
- run the Raven Claude worker on a Tailnet-only port;
- run the Alexandria ACP bridge on a separate Tailnet-only port unless the
  protocols are deliberately unified;
- ensure the worker starts each mutation from a clean checkout;
- fetch, fast-forward, commit, and push through the same repo-lock policy as the
  Railway host;
- return final stdout to Raven instead of posting to Freeq directly.

If the worker uses its own checkout instead of the Railway volume, `origin/main`
is the synchronization boundary. A failed push, dirty checkout, or divergent
branch is a stop-the-line condition.

## Git State Contract

Startup:

1. Clone the target repo if missing.
2. Fetch origin.
3. Check out the configured branch.
4. If clean, fast-forward from origin.
5. If dirty or divergent, keep the service up only far enough to expose a clear
   health/log error. Do not start new mutations.

Mutation:

1. Acquire the instance repo lock.
2. Run the Raven, Alexandria, or Fabro operation.
3. Run `ax2 inspect state --json`.
4. Run `git status --porcelain=v1 --branch`.
5. If relevant files changed, create an intentional commit.
6. Push to the configured branch.
7. If the push fails because the remote moved, stop new writes and recover
   manually.

## Verification Checklist

Run these after provisioning, deploying, upgrading, or recovering an instance.

```bash
git -C /data/projects/$ALEXANDRIA_INSTANCE_ID status --short --branch
ax2 inspect state --json
curl -fsS "$ALEXANDRIA_VIEWER_URL/api/health"
```

In Freeq:

```text
Raven, reply with exactly: alexandria host smoke ok
```

Then trigger heavy work:

```text
Raven, use your tool to report the current repo branch and whether git is clean.
```

Accept only this result shape:

- Raven replies in the room;
- the tool runner reaches Claude Code;
- the reported branch matches the configured branch;
- dirty state is either absent or clearly explained;
- Claude Code does not join Freeq or post independently.

## Add A Second Project

Do not reuse the first instance's volume, Raven identity, Tailnet hostname, or
Freeq nick.

1. Pick a new `ALEXANDRIA_INSTANCE_ID`.
2. Create a new Railway service and volume.
3. Set `ALEXANDRIA_PROJECT_REPO` to the new project.
4. Set a new `FREEQ_CHANNEL`, `RAVEN_FREEQ_NICK`, and `RAVEN_IDENTITY_NAME`.
5. Create a new Tailnet hostname.
6. Create a new trusted-machine worker directory, lock, and endpoint.
7. Reuse the same Claude Code subscription login only on the trusted machine.
8. Deploy one replica.
9. Run the full verification checklist.

## Upgrade

1. Check the target repo is clean and not ahead/behind.
2. Set the new Alexandria Next version or update the install channel.
3. Redeploy the Railway service.
4. Confirm startup fast-forwarded cleanly.
5. Run `ax2 inspect state --json`.
6. Open the viewer and confirm Git/runtime status.
7. Run the Freeq chat and heavy-work smoke tests.
8. Commit/push any intentional project-local upgrade output.

## Recovery

Dirty checkout:

1. Stop new Raven heavy-work requests.
2. Inspect `git status --short --branch`.
3. Decide whether the changes are intentional.
4. Commit/push intentional changes; otherwise restore only generated or
   operator-approved files.
5. Restart and run verification.

Diverged branch:

1. Stop new writes.
2. Fetch origin.
3. Inspect local and remote commits.
4. Rebase, merge, or reset only with an explicit operator decision.
5. Restart and run verification.

Claude worker unreachable:

1. Check Tailscale status on Railway and the trusted machine.
2. Check the worker service logs.
3. Confirm the Railway node can reach the Tailnet endpoint.
4. Rotate the worker token if auth failures appear in logs.
5. Run the heavy-work smoke test.

Raven absent from Freeq:

1. Check Railway logs for provider key errors.
2. Check the Raven identity key and `FREEQ_CHANNEL`.
3. Restart the service.
4. Run the chat smoke test.

## Security Rules

- Keep the viewer Tailnet-only until there is an explicit access-control layer.
- Do not expose mutation APIs publicly.
- Keep Claude Code auth off Railway.
- Keep Claude Code as a backend; it must not have Freeq credentials.
- Rotate Tailscale auth keys and worker tokens when an instance is retired.
- Retire unused Railway volumes only after confirming no unpushed Git state
  remains.
