# In-repo plugin loading

Make Alexandria run correctly and predictably **inside this repo** — for both
alexandria prime and the eventual Alexandria library in the Studio (PMS) — off
the **latest prod-deployed release**, **scoped to this repo**, and identically
for every collaborator and fresh worktree. Not a globally-installed copy, and
not the in-repo development source, which can shift underfoot while you use it.

Status: **all phases done 2026-07-02** — Claude wiring, Codex wiring, and
verification that ACP play workers see the plugin skills.

## Problem

The repo *contains* the plugin source (`packages/alexandria-plugin/`), but a
Claude session opened here was loading a **frozen v0.9.4 snapshot** — an agent
roster from before the current plugin (whose only agent is **Damien**) existed.
Current Alexandria was loaded nowhere.

What we found, and how our understanding evolved:

1. The active wiring was a directory marketplace at
   `<repo>/.claude/plugins/alexandria` (v0.9.4, project scope), plus a
   name-colliding user-scope variant (v0.9.3), plus an inactive live-source
   symlink path in `./setup`.
2. **First (wrong) interpretation:** the directory-marketplace was hand-rolled
   stale wiring; replace it with a Claude-native GitHub marketplace install.
3. **Correct interpretation:** that layout is the **product installer's
   canonical output**. `install.sh` / `ax setup` install the plugin payload to
   `<repo>/.claude/plugins/alexandria` (project-local, inside a git repo — by
   design), register it via `claude plugin marketplace add <dir> --scope
   project`, and install a **version-matched `ax` + `fabro`** alongside. The
   April install wasn't wrong — it was *correct product wiring that was never
   updated* (sat at 0.9.4 for ~10 weeks).

The interim GitHub-marketplace approach (installing `alexandria@alexandria`
from the public `GetAlexandria/alexandria` repo) did load current Damien, but
it was **structurally wrong**: it moves the plugin independently of `ax`. The
plugin's shipped tooling (e.g. `scripts/claude-monitor.sh`) calls current `ax`
subcommands, so plugin 0.17.0 against the machine's stale `ax` 0.9.3 failed
immediately (`Unknown subcommand: internal`, monitor exit 1). It also
name-collides: the shipped payload's marketplace is also named `alexandria`,
so the real installer could not register beside it.

## Key facts (verified 2026-07-02)

- **The product installer is the coupling mechanism.**
  `curl -fsSL https://getalexandria.ai/install.sh | bash` resolves the latest
  release from the prod CDN (`downloads.getalexandria.ai/latest-version.txt`)
  and installs a **version-matched trio**: plugin payload + `ax` + `fabro`.
  Inside a git repo it is **project-local by design** (payload →
  `<repo>/.claude/plugins/alexandria`, Claude registration `--scope project`);
  outside, user-level.
- **`ax upgrade` is the in-place updater** for the same trio (payload + ax +
  fabro), re-registering the Claude plugin at the detected scope. Idempotent.
  (Renamed from `ax update` somewhere after 0.9.x; older binaries answer to
  `update`.)
- **The `ax`/`fabro` binaries are machine-level by product design**
  (`~/.local/bin`). Repo-scoping applies to the plugin registration and the
  library/state (worktrees isolate state via `ALEXANDRIA_STATE_DIR`; see
  `scripts/setup-worktree`).
- **Claude plugin loading model:** a marketplace install (including from a
  directory source) is cached at install time and does not drift mid-session.
  True live-editing only happens with `claude --plugin-dir` + `/reload-plugins`.
  Declaring a marketplace in `.claude/settings.json` is *not* sufficient to
  install it — the `claude plugin` CLI (which `install.sh`/`ax upgrade` drive)
  or a restart must perform the install.
- **Scope precedence:** local > project > user. Project-scope enablement in
  `<repo>/.claude/settings.json` (gitignored, per-machine) makes the plugin
  load in this repo only; `alexandria@alexandria: false` at user scope keeps it
  out of other repos.

## Design

**One mechanism: the product installer, driven by contributor setup.** The
same path an end user runs is the path this repo uses on itself.

| Mode | When | Mechanism |
| --- | --- | --- |
| **prod** (default) | Using Alexandria to do work in this repo | `scripts/setup-host-plugins --mode prod`: `ax upgrade` when out of date (gated by an `ax upgrade --dry-run` version check — `ax upgrade` itself never short-circuits, and this runs on every worktree/Codex-environment setup), else `install.sh --yes` when `ax` is absent — version-matched trio from the prod CDN, payload project-local, registered with Claude at project scope and with Codex |
| **local** (opt-in) | Working on the plugin source itself | `claude --plugin-dir ./packages/alexandria-plugin` + `/reload-plugins` (script clears the repo-scoped prod install first so the two can't collide) |

- `scripts/setup-dev` invokes it (`--plugin=prod|local`, default prod) and
  tears it down on `--uninstall` — so **collaborators (e.g. Danvers) and fresh
  worktrees get latest-prod, repo-scoped Alexandria from the standard setup
  command**, with no bespoke knowledge.
- The script first removes legacy wiring variants (the old `getalexandria`
  directory marketplace; the interim GitHub-sourced `alexandria` marketplace)
  so the installer's own `alexandria` directory marketplace can't collide.
- **PMS/Studio** is served by the same repo-scoped install: PMS reads
  Alexandria only through the runtime's public API, so one canonical prod
  instance at the repo root covers alexandria prime and the Studio library.
- **Version policy: track latest prod, no pin** (decided 2026-07-02). Installs
  are cached, so a session is stable; you move forward when setup or `ax
  upgrade` runs. Validated in practice: 0.15.2 → 0.17.0 was absorbed by a
  single upgrade during this work.

### Keeping it in sync over time (the drift problem)

Two observed drift modes are the same missing piece from opposite sides:

- **Both stale together:** the April install sat at v0.9.4 for ~10 weeks —
  nothing prompted an upgrade. Bounded now by `setup-dev`/`setup-worktree`
  re-running the upgrade on every setup.
- **Plugin ahead of `ax`:** the Claude marketplace can auto-update the plugin
  payload independently, and nothing moves `ax` with it — recreating exactly
  the monitor failure we hit.

**The systemic fix is a version-alignment check in the shipped plugin
itself:** the plugin knows its own version and can read `ax version`; on
mismatch it recommends `ax upgrade`. **Implemented 2026-07-02** in the
`claude-monitor.sh` preamble (it already probed for `ax`): on payload↔`ax`
version mismatch the monitor prints both versions and the remedy, then exits 1
instead of failing on an unknown subcommand. Frozen decisions and the
verification matrix: `factory-issue-version-alignment.md` in this plan
directory.

## Plan of work

### Phase 1 — Claude ✅ done (2026-07-02)

1. Removed the stale v0.9.4 snapshot and its `getalexandria` marketplace
   wiring; the pre-Damien agents stopped loading.
2. *(Interim, later reverted:)* wired a GitHub-marketplace install; it loaded
   Damien but decoupled plugin from `ax` and broke the plugin's event monitor.
   Replaced by the product path below.
3. Ran the prod installer from the repo root: payload **0.17.0**
   project-local, `ax` + `fabro` **0.17.0**, ACP support repaired, Claude
   registration at project scope. Verified: versions aligned, Damien loads,
   monitor runs healthy, user scope stays disabled.
4. Made it durable: `scripts/setup-host-plugins` drives `ax upgrade` /
   `install.sh` (with legacy-wiring cleanup); `scripts/setup-dev` calls it via
   `--plugin=prod|local` and on `--uninstall`.
5. Captured the sync-over-time product change as a factory issue draft.

### Phase 2 — Codex (interactive) ✅ done (2026-07-02)

Codex needed far less translation than first researched: **Codex CLI (0.142.4)
has a native plugin system** (`codex plugin add/list/marketplace/remove`), the
payload ships the Codex marketplace manifest (`.agents/plugins/marketplace.json`,
name `alexandria`) and `.codex-plugin/plugin.json`, and **`ax` already
self-registers the plugin on launch** (`ensureAlexandriaCodexPluginInstalled`
in `packages/ax/src/domain/codex-plugin.ts`, invoked when the Codex app server
starts — `ax codex`, `ax start`, host paths) preferring the repo-local payload.

Done:

1. Cleaned a **broken machine-global registration**: a `alexandria-next-local`
   marketplace pointed at a deleted Codex worktree and made every
   `codex plugin` command fail (which would also have blocked ax's
   ensure-step).
2. Registered this repo's prod payload with Codex via the product flow
   (`codex plugin marketplace add <payload>` + `codex plugin add
   alexandria@alexandria`) → `installed, enabled, 0.17.0`.
3. Made it durable: `scripts/setup-host-plugins` (renamed from
   `setup-claude-plugin`) mirrors ax's ensure-step after the Claude wiring,
   fail-soft since ax retries on every Codex launch anyway. `--uninstall`
   removes the Codex registration only when it points at this repo's payload.

Codex caveats (accepted, they match the shipped product's model):

- Codex's plugin registry is **machine-global config** (`~/.codex`), not
  project-scoped like Claude's. Repo-scoping is approximated: the marketplace
  *source* is this repo's payload, but registration is visible machine-wide.
- A registration pointing at a moved/deleted checkout **breaks `codex plugin`
  machine-wide** (observed with `alexandria-next-local`). Mitigation: the
  payload lives at a stable path in the primary checkout, and `--uninstall`
  cleans up.

### Phase 3 — remaining verification

Scope correction (owner, 2026-07-02): the headless Fabro **factory** builds
(Railway API, Docker ACP — the ones that *build* Alexandria) do **not** need
the plugin. What does need it: **Playbook plays running inside Alexandria on
Fabro** (`ax run` → `startFabroServer` → workers over the configured ACP
provider), which sometimes invoke plugin skills.

1. **Verify ACP worker sessions see plugin skills** ✅ verified 2026-07-02.
   Method: drove the real adapter
   (`~/.alexandria/tools/acp/codex/0.14.0/bin/codex-acp`) directly over ACP
   (ndjson JSON-RPC: `initialize` → `session/new` with `cwd` = repo root →
   `session/prompt`), asking the session — tools forbidden — to list its
   available skills. Result: all 11 `alexandria:*` payload skills present
   (`frame-the-problem`, `story-spine`, `demo-*`, `raven-vision-*`, …) —
   `ALEXANDRIA_SKILLS_PRESENT=yes`. The chain holds end-to-end:
   `ax upgrade` → repo payload → machine-global `codex plugin` registry →
   codex-acp worker (the same runtime Fabro plays use). Note the shipped play
   workflows do not yet *instruct* workers to invoke skills; when one does,
   resolution is confirmed available.

   Side-finding: an **`alexandria-next:*` plugin registration also loads** in
   worker sessions (4 skills, some name-shadowing the real ones, e.g.
   `raven-vision-drafting`). Its `alexandria-next-local` marketplace was
   removed as broken, but the installed plugin snapshot persists. Left in
   place — the next line may be active — but worth cleaning
   (`codex plugin remove alexandria-next@alexandria-next-local`) if it is
   retired.

## Out of scope / non-goals

- Changing the product `./setup` installer's end-user behavior (it is the
  public clone-and-use path). The contributor concern is layered in
  `setup-dev`.
- Republishing or re-versioning the plugin; this is about *loading*, not
  releasing.
- Touching `docs/alexandria/library/` (per repo guidance).

## Open questions

- Should `setup-worktree` (automation worktrees) also run the prod plugin
  wiring by default, or is plugin loading only relevant to interactive
  checkouts? (It currently inherits it via `setup-dev`.)
- Codex-side staleness: the Codex plugin snapshot is cached per version; ax's
  ensure-on-launch re-adds after payload upgrades, but confirm the snapshot
  refreshes on version bumps (`codex plugin add` re-run) rather than pinning
  silently.
- `wire_codex_prod` in `setup-host-plugins` is a shell mirror of
  `ensureAlexandriaCodexPluginInstalled` (an Effect function in
  `packages/ax/src/domain/codex-plugin.ts`) — a drift surface. The deeper fix
  is exposing that ensure-step as a standalone `ax` subcommand (it currently
  runs only on codex app-server launch) and having the script call it; that is
  a product change, a natural companion to the version-alignment factory
  issue.
