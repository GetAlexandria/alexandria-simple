# Alexandria Product Hosting

- Issue reference: none yet
- Goal: stand up a shared Alexandria Next product instance for
  `sociotechnica-org/freeq-raven`, with a path to create one Alexandria instance
  per project/channel.
- Linked product plan: none yet
- Operator runbook: `docs/alexandria/ops/product-hosting-runbook.md`

## Scope

- Define the first hosted Alexandria product deployment, separate from the
  existing Fabro software factory used to build Alexandria.
- Use Railway as the first hosting platform for the product host.
- Run the hosted service on a persistent filesystem-backed Git checkout of the
  target project repository.
- Join the Railway host to the team's Tailnet so hosted Alexandria can reach a
  trusted Claude Code worker and ACP machine through Tailscale.
- Host the Alexandria Next viewer/runtime so the group can inspect and operate
  the shared project state.
- Run `freeq-raven` against the same target project checkout, with one Raven
  process bound to one Freeq channel.
- Keep `freeq-raven` as the only Freeq-facing agent loop. Raven owns chat,
  voice, routing, tool timeouts, and posting results back to the room.
- Migrate Raven's heavy-work handoff from Codex to Claude Code without adding a
  second Freeq bot or `freeqcc` daemon.
- Keep the deployment reusable enough to duplicate for additional project repos
  and Freeq channels.

## Non-Goals

- Do not reuse or mutate the existing Railway Fabro software factory. That
  factory builds Alexandria; this plan hosts Alexandria as a product for a
  project.
- Do not run subscription-authenticated Claude Code directly inside a public
  cloud container for the first version.
- Do not add `freeqcc` to this deployment. It is useful for DM-controlled Claude
  Code, but this hosted product should have one Freeq-facing loop: Raven.
- Do not keep Codex as Raven's default heavy-work runner once this hosting slice
  is implemented.
- Do not migrate Alexandria's file-system and Git data model to a database.
- Do not make Cloudflare Workers, Durable Objects, or Containers the canonical
  runtime host in this slice.
- Do not build full multi-tenant hosting. The first model is one isolated
  instance per project.
- Do not expose unauthenticated Alexandria mutation APIs to the public internet.
- Do not write to `docs/alexandria/library/` as part of this hosting work.

## Current Gap

Alexandria Next currently has the local pieces needed for a project runtime:

- `ax2 init` creates `.alexandria-next/alexandria-config.json` and the default
  `docs/alexandria` workspace.
- `ax2 start all` starts the local orchestration server, viewer/runtime API, and
  optional local app-server substrate.
- `ax2 run <play-id>` renders plugin-owned Fabro workflows and runs them through
  the product-internal Fabro runtime.
- Alexandria Next release assets already include the `ax2` binary, bundled
  viewer assets, plugin payload, and Fabro sidecar.
- `freeq-raven` is a long-running Rust room agent that joins Freeq rooms and
  runs heavy tools in `RAVEN_TOOL_WORKDIR`.
- `freeq-raven` currently defaults its heavy-work runner to Codex. The hosted
  deployment should replace that default with a Claude Code runner while keeping
  the same JSON-in, stdout-result-out tool boundary.

What does not exist yet:

- A hosted Alexandria product instance that owns a single canonical Git checkout
  on `main`.
- A bootstrap script/container that installs Alexandria Next, clones the target
  repo onto persistent storage, initializes the project, starts the viewer, and
  starts Raven.
- A Git state contract for hosted mutations: lock, inspect, commit, push, and
  recover from dirty/conflicting state.
- A viewer surface for Git/runtime health.
- A Tailscale-backed Claude Code path from Railway to a trusted machine for both
  Raven heavy work and Alexandria/Fabro ACP.
- A repeatable deployment template for new project/channel pairs.

## Research Inputs

- Railway supports persistent volumes for services, Dockerfile-based services,
  public/private networking, and templates for reusable multi-service or
  single-service deployments.
- Railway WebSocket connections can be terminated after the platform request
  duration limit, so hosted viewer streams must tolerate reconnects.
- Render has persistent disks and long-lived WebSockets, but its disks are
  attached to one service instance, disable zero-downtime deploys, and are less
  convenient for template-driven per-project duplication.
- Cloudflare is useful for DNS, Access, R2 release downloads, and future control
  plane work. Cloudflare Containers currently have ephemeral disk, which makes
  them the wrong first canonical host for a Git/file-system data model.
- Tailscale supports userspace networking for serverless/container
  environments and Docker configuration through auth keys or OAuth clients. The
  first Railway host should run Tailscale in userspace mode with state persisted
  on the Railway volume.
- Claude Code supports subscription login on trusted machines. For the first
  deployment, Claude Code should run on a trusted Tailnet machine and be reached
  from Railway over Tailscale, instead of baking subscription auth into a cloud
  image.
- `freeq-raven` should stay the Freeq room interface. Claude Code should be a
  tool execution backend invoked by Raven, not a second chat participant.

## Hosting Recommendation

Use Railway for the first shared hosted Alexandria product instance.

The first instance should be a single Railway service with a persistent volume:

```text
Railway project: alexandria-product-freeq-raven

Service: alexandria-freeq-raven
Volume: /data

/data/projects/freeq-raven        target project checkout on main
/data/alexandria-next-home        ALEXANDRIA_NEXT_HOME
/data/tailscale                   Tailscale state
/data/freeq-raven-runtime         Raven process logs and runtime state
```

Run a small supervisor process inside the service:

```text
startup
  -> start tailscaled in userspace mode
  -> tailscale up with TS_AUTHKEY or OAuth client secret
  -> clone or fast-forward /data/projects/freeq-raven
  -> install or upgrade pinned Alexandria Next
  -> ax2 init all --acp-provider claude
  -> ax2 start all --host 0.0.0.0 --port $PORT --no-codex
  -> tailscale serve the viewer/runtime URL to the Tailnet
  -> start freeq-raven with RAVEN_TOOL_WORKDIR=/data/projects/freeq-raven
     and RAVEN_TOOL_COMMAND set to a Claude Code runner
```

Run only one replica per instance. The Git checkout, append-only Alexandria
ledger, product-internal Fabro state, and Raven process state all assume a
single writer.

## Architecture

```text
Freeq channel
  -> freeq-raven process on Railway
  -> Raven chat/voice/router loop
    -> direct chat or voice reply
    -> tool_now/background JSON payload
      -> RAVEN_TOOL_COMMAND=bin/raven-claude-runner
      -> Claude Code worker on trusted Tailnet machine
      -> project-local Alexandria Next workspace
      -> product-internal Fabro runtime through AX2
      -> Git commit/push back to origin/main
      -> stdout result returned to Raven
  -> Raven posts the result back to Freeq
```

The Railway service is the project host. The trusted Tailnet machine is the
Claude Code execution provider for Raven heavy work and the Claude Code ACP
provider for Alexandria/Fabro. The existing Railway Fabro factory and `freeqcc`
are not part of this runtime path.

## Raven / Claude Code Boundary

The first product version should preserve one room loop:

- Raven receives Freeq messages, voice events, and tool results.
- Raven decides whether a turn is `chat`, `tool_now`, or `background`.
- Raven invokes `RAVEN_TOOL_COMMAND` only for heavy work.
- Claude Code never joins Freeq, does not hold a Freeq identity, and does not
  post to the room directly.
- The Claude Code runner receives the same JSON payload shape Raven already
  sends to the Codex runner and returns final stdout for Raven to relay.
- The runner should prefer project-local Alexandria commands, including `ax2`
  and bundled Fabro, before using generic shell commands.
- The runner must operate under the same repo lock and Git commit/push policy as
  hosted Alexandria mutations.

The quickest external change is in `sociotechnica-org/freeq-raven`:

```text
RAVEN_TOOL_COMMAND=bin/raven-claude-runner
RAVEN_TOOL_WORKDIR=/data/projects/freeq-raven
RAVEN_CLAUDE_ENDPOINT=http://claude-code-1.tailnet-name.ts.net:8765
```

`bin/raven-claude-runner` can either execute `claude` locally when Raven runs on
the trusted machine, or forward the payload over the Tailnet to a trusted Claude
Code worker when Raven runs on Railway.

## Tailscale / Claude Code Boundary

First implementation:

- Run `tailscaled` inside the Railway service in userspace mode.
- Persist Tailscale state under `/data/tailscale` so restarts do not create a
  new node every time.
- Use a tagged auth key or OAuth client secret stored as Railway variables.
- Give the node a predictable hostname such as
  `alexandria-freeq-raven-railway`.
- Expose the viewer/runtime through Tailscale Serve or a Tailnet-only reverse
  proxy.
- Run Claude Code on a trusted machine already authenticated with the
  subscription account.
- Expose a Tailnet-only Claude Code worker endpoint for Raven's heavy-work
  runner.
- Configure hosted Alexandria's ACP command as a Tailnet-reachable wrapper
  endpoint or relay process, rather than `npx -y @zed-industries/claude-code-acp`
  in the Railway container.

Open design point:

- Decide the exact ACP transport between Railway and the trusted machine. The
  product today expects an `acp.command` string. A remote ACP bridge may need a
  small wrapper that presents a local stdio ACP command in Railway and forwards
  messages over the Tailnet to the trusted machine.
- Decide whether Raven's Claude Code runner and Alexandria's ACP bridge share a
  single worker service or remain two small services with separate protocols.
  They should share repo-locking policy but keep their message protocols
  explicit.
- If the trusted Claude Code worker uses its own checkout instead of the Railway
  volume, treat `origin/main` as the synchronization boundary and enforce a
  single writer lock before any mutation.

## Git State Contract

The hosted project checkout is authoritative for this Alexandria instance.

Startup contract:

1. Clone the configured repository if missing.
2. Fetch origin.
3. Switch to the configured branch, default `main`.
4. If clean, fast-forward from `origin/main`.
5. If dirty or divergent, refuse normal startup and expose a clear health error.

Mutation contract:

1. Acquire a host-level repo lock before any play/tool mutation.
2. Run the requested Alexandria/Raven/Fabro operation.
3. Run `ax2 inspect state --json`.
4. Run `git status --porcelain=v1 --branch`.
5. If relevant files changed, create an intentional commit.
6. Push to `origin/main`.
7. If push fails because remote moved, stop the mutation path and require human
   recovery before new writes.

The first version can implement the lock and Git commit/push path in the
supervisor or a small host script. A later version should expose it through
AX2/runtime APIs.

## Viewer Runtime Requirements

The hosted viewer should show a compact operations strip:

- project repo
- branch
- HEAD SHA
- clean/dirty state
- ahead/behind count
- last commit
- last push
- active repo lock holder
- product-internal Fabro readiness
- Claude Code worker and ACP provider reachability
- Raven process status

This is operational status, not a replacement for Git. The server remains the
writer; the viewer reports enough state for the group to know whether the shared
Alexandria is safe to use.

## Deployment Structure

First instance:

| Component | Repo / package | Runtime location | Notes |
|-----------|----------------|------------------|-------|
| Target product repo | `sociotechnica-org/freeq-raven` | `/data/projects/freeq-raven` | Canonical shared checkout on `main` |
| Alexandria Next CLI/viewer/plugin | release artifacts from `alexandria-internal` | `/usr/local/bin`, project-local plugin cache, `/data/alexandria-next-home` | Installed by pinned version |
| Product-internal Fabro | bundled Fabro sidecar from Alexandria Next release | `ALEXANDRIA_NEXT_HOME` | Used by `ax2 run`; not the builder factory |
| Raven room agent | `sociotechnica-org/freeq-raven` | same checkout or built artifact | The only Freeq-facing agent loop |
| Raven Claude runner | `sociotechnica-org/freeq-raven` | `RAVEN_TOOL_COMMAND` | Replaces Codex heavy-work handoff |
| Claude Code worker and ACP | trusted Tailnet machine | outside Railway | Reached over Tailscale |
| Tailscale | service image package or installed binary | Railway service | Joins Tailnet and exposes viewer |

Future per-project instance:

| Variable | Meaning |
|----------|---------|
| `ALEXANDRIA_INSTANCE_ID` | Stable instance id, e.g. `freeq-raven` |
| `ALEXANDRIA_PROJECT_REPO` | Git URL for the target project |
| `ALEXANDRIA_PROJECT_BRANCH` | Default `main` |
| `ALEXANDRIA_NEXT_VERSION` | Pinned product version |
| `FREEQ_CHANNEL` | Freeq room/channel for this Raven |
| `RAVEN_FREEQ_NICK` | Raven nick for that channel |
| `RAVEN_TOOL_WORKDIR` | Derived project checkout path |
| `RAVEN_TOOL_COMMAND` | Claude Code runner command |
| `RAVEN_CLAUDE_ENDPOINT` | Tailnet endpoint for Raven heavy work |
| `TAILSCALE_HOSTNAME` | Tailnet hostname for this instance |
| `ALEXANDRIA_ACP_ENDPOINT` | Tailnet endpoint for trusted Claude Code ACP bridge |

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Hosting plan | `docs/alexandria/plans/alexandria-product-hosting/plan.md` | Defines product hosting architecture and rollout |
| Deployment scripts | future `packages/deploy` or `scripts/alexandria-product-*` | Bootstrap Railway-hosted product instances |
| AX2 runtime | future `packages/ax-next/src/effects/runtime-server.ts` and related domain modules | Add Git/runtime health APIs for hosted viewer |
| Viewer Next | future `packages/viewer-next` | Show Git, Fabro, Raven, and ACP readiness |
| Release workflow | existing `packages/deploy` and `ax2 upgrade` surfaces | Use pinned versions for hosted instance upgrades |
| freeq-raven deployment | external `sociotechnica-org/freeq-raven` | Configure always-on Raven process per channel and migrate heavy-work runner from Codex to Claude Code |
| Tailscale/Claude bridge | new host-side script or service | Forward Raven heavy work and AX2 ACP from Railway to trusted Tailnet machine |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria product plays | No play behavior change in the plan-only slice | None |
| `ax-next-start` | No immediate wording change | Revisit once hosted startup commands exist |
| Raven in Freeq | Raven gains a hosted project-local Alexandria context through `RAVEN_TOOL_WORKDIR` and switches heavy work from Codex to Claude Code | Update freeq-raven runner, tests, and deployment docs after implementation |
| Maintainer skills | No contributor skill behavior change | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Markdown plan lint | `pnpm run lint:markdown` | Ensures the new plan follows repo Markdown checks |
| Link/path sanity | `test -f docs/alexandria/plans/alexandria-product-hosting/plan.md` | Confirms durable plan location |
| Future host smoke | `curl -fsS "$ALEXANDRIA_VIEWER_URL/api/health"` | Proves viewer/runtime is reachable |
| Future AX2 smoke | `ax2 doctor --json` in hosted checkout | Proves installed runtime and orchestration are ready |
| Future Git smoke | hosted mutation dry run plus `git status --porcelain=v1 --branch` | Proves the repo lock/commit/push path is safe |
| Future Raven smoke | Freeq room prompt to Raven plus `make logs` or service logs | Proves Raven joins the configured channel and can hand off heavy work to Claude Code |
| Future ACP smoke | run a minimal `ax2 run source-assessment --json` through the Tailnet ACP bridge | Proves product-internal Fabro can reach trusted Claude Code ACP |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Plan-only repo docs | Markdown lint | Run Markdown lint for the PR | `pnpm run lint:markdown` |
| AX2 runtime hosting | AX2 tests cover local runtime behavior, not hosted Git state | Add tests when Git status APIs or host scripts are implemented | Future `pnpm --filter @alexandria/ax-next run test` |
| Viewer operations strip | Viewer tests cover current UI slices | Add viewer tests when the operations strip is implemented | Future `pnpm --filter @alexandria/viewer-next run test` and e2e |
| Raven/freeq behavior | Covered in external `freeq-raven` tests | Add runner tests and deployment smoke docs in that repo | Future `make check` in `freeq-raven` plus Claude runner command construction/error cases |
| Agent/play quality | No agent behavior changes in this plan | No eval rerun required for plan-only PR | Not applicable |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Product host is confused with the existing builder factory | Name the Railway project and docs around "product host"; do not reuse `.fabro/README.railway.md` or factory config |
| Railway service restarts while the repo is dirty | Persist the checkout on a volume, refuse startup on dirty/divergent state, and expose a health error |
| Two writers mutate the same checkout | Run one replica, use a repo lock for all hosted mutations, and treat failed pushes as stop-the-line events |
| Two Freeq-facing agent loops compete or confuse users | Do not deploy `freeqcc`; Raven is the only process that receives room events and posts results |
| Tailscale userspace mode does not behave like a normal network interface | Use userspace mode deliberately, test Tailscale Serve and ACP bridge traffic, and avoid assuming raw `ping` or kernel TUN behavior |
| Claude Code subscription auth leaks into a cloud image | Keep Claude Code authenticated only on a trusted Tailnet machine; Railway gets only a Tailnet route/bridge secret |
| ACP bridge is harder than expected because AX2 expects stdio `acp.command` | Implement a small local stdio forwarder in Railway or temporarily run product plays from the trusted machine until the bridge lands |
| Raven's remote Claude runner mutates a checkout that is not the Railway checkout | Use a repo lock and `origin/main` as the synchronization boundary, or run the first instance directly on the trusted machine until the bridge can operate on the canonical checkout |
| Claude Code bypasses Raven and posts directly to Freeq | Keep Claude Code as a tool backend only; the runner returns stdout to Raven and has no Freeq credentials |
| Railway WebSocket/SSE stream disconnects interrupt viewer state | Keep the runtime event log cursor-based and make viewer streams reconnect |
| A hosted Raven commits too much to `main` | Scope `RAVEN_TOOL_WORKDIR`, review Git status before commits, and make commit/push policy explicit in the host script |
| Secrets sprawl across Railway, Tailscale, Claude, Freeq, and model providers | Define a secrets inventory and keep auth state on the volume or trusted machine, never in the image |

## Implementation Steps

1. Create a minimal host Docker image or Railway service entrypoint with Bun,
   Git, Tailscale, `ax2`, Fabro sidecar, Rust/freeq-raven runtime support, and a
   process supervisor.
2. Add host bootstrap variables for target repo, branch, Alexandria Next
   version, Freeq channel, Raven Claude runner endpoint, Tailnet hostname, and
   ACP endpoint.
3. Implement startup Git checkout reconciliation with dirty/divergent state
   detection.
4. Install or upgrade Alexandria Next from the pinned release artifacts.
5. Initialize the target project with `ax2 init all --acp-provider claude`.
6. Start Tailscale in userspace mode and persist state under `/data/tailscale`.
7. Expose the viewer/runtime through Tailscale Serve or a Tailnet-only reverse
   proxy.
8. Start `ax2 start all --host 0.0.0.0 --port $PORT --no-codex`.
9. Add a Claude Code runner to `freeq-raven` and set `RAVEN_TOOL_COMMAND` to it.
10. Start `freeq-raven` with `RAVEN_TOOL_WORKDIR` pointing at the target
    checkout.
11. Build or choose the Raven Claude worker bridge and AX2 ACP bridge from
    Railway to the trusted Claude Code machine.
12. Add Git status and runtime status endpoints to AX2.
13. Add the viewer operations strip.
14. Add a repo-locking commit/push wrapper for hosted mutations.
15. Convert the working Railway service into a reusable template for new
    project/channel instances.
16. Document the operator runbook: deploy, upgrade, rollback, dirty-state
    recovery, Tailscale rotation, and Raven restart.

## Acceptance / Exit Criteria

1. The first Railway-hosted Alexandria product instance is reachable over the
   Tailnet.
2. The instance owns a persistent checkout of `sociotechnica-org/freeq-raven` on
   `main`.
3. `ax2 inspect state --json` works inside the hosted checkout.
4. The viewer loads from the hosted runtime and reports project state.
5. `freeq-raven` joins the configured Freeq channel and uses the hosted checkout
   as `RAVEN_TOOL_WORKDIR`.
6. Raven heavy work reaches Claude Code through the trusted Tailnet machine and
   returns final stdout for Raven to post.
7. No `freeqcc` daemon or second Freeq-facing Claude Code loop is required.
8. A minimal product-internal Fabro play can reach Claude Code ACP through the
   trusted Tailnet machine.
9. A hosted mutation can create an intentional commit and push it to `main`.
10. Dirty or divergent Git state prevents new writes and is visible to operators.
11. The deployment can be duplicated for a second project/channel by changing
   variables and attaching a new volume.
12. The existing Alexandria builder factory continues unchanged.

## Deferred Follow-Ups

1. Move from one-service-per-instance to a control-plane/provisioner model.
2. Add per-project authentication and role-based write controls in the viewer.
3. Add Cloudflare Access in front of any public Railway URL if a public URL is
   kept for convenience.
4. Add backup/restore automation for the Railway volume.
5. Add automated Git conflict recovery workflows.
6. Add a first-class AX2 remote ACP provider instead of an external stdio bridge.
7. Unify the Raven Claude runner bridge and AX2 ACP bridge if the protocols stay
   simple enough to share a worker service safely.
8. Add hosted-instance telemetry and alerting.
9. Evaluate Cloudflare Containers again after native persistent snapshots mature.
