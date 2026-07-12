# Canvas + Library Spike

Run a minimum-viable test of canvas-first library setup: the user works on the
product-library canvas, Raven sits in Claude Code as consigliere, and two
real setup steps (Codebase Scan, Product Nouns) execute end-to-end across
both surfaces. Goal is to feel the interaction loop, not ship the model.

## Why this spike

Today the `library` skill (and the supporting `initialize/` files it
delegates to) runs as a director — one long agentic conversation inside
Claude Code with the user responding to prompts. We want to flip that:
the canvas becomes the workspace, the user paces the work, and Raven
becomes a consigliere who executes narrow plays when summoned. Before
committing to that shift across the whole flow, we need to validate the
**interaction loop** on two real steps with real data.

## What we're testing

The loop, end-to-end, for two steps:

1. User opens the canvas, picks a step from the phase rail.
2. Canvas shows a step-specific surface in Today's Frame.
3. User clicks an action button on the canvas (e.g. "Scan").
4. Canvas writes an intent to disk and signals the user to ping Raven in CC.
5. User says "go" (or similar) in CC.
6. Raven reads the intent, runs the corresponding play, writes outputs.
7. Canvas detects new outputs and renders them in Today's Frame.
8. User reviews, edits on canvas, clicks ✓ to mark the step's first pass done.
9. Deferred items become tracked entries in the PM/queue layer.

A hybrid queue (rules + Raven + user-authored) is in scope as a stub — enough
to demonstrate that deferred items have a home, not enough to be the full
maintenance experience.

## Surfaces in this spike

### Step A — Codebase Scan (anchor, build first)

- Clear action ("Scan"), structured output (detected nouns/concepts), real
  codebase to test against. The interaction model has the smallest surface
  area here, so it's the cleanest place to feel the loop.
- Canvas surface: directory picker + "Scan" button → progress indicator →
  results table (file paths, detected entities, confidence).
- Play: `play.codebase-scan` — derived from current `skills/initialize/scanner.md`.
- Deferred items: every detected noun the user didn't accept becomes a
  "consider later" entry in the queue.

### Step B — Product Nouns (second, builds on A)

- User is already prototyping this surface. It's where the canvas metaphor
  earns its keep over a CLI — a noun graph with relationships is genuinely
  visual.
- Canvas surface: noun graph (drag, connect, name relationships) seeded by
  Codebase Scan output.
- Play: `play.product-nouns` — derived from current
  `skills/initialize/noun-dialogue.md`. Takes scan output + user edits as input,
  produces card stubs in `docs/alexandria/cards/product/`.
- Deferred items: nouns flagged "maybe later," weak/ambiguous nouns Raven
  isn't sure about.

Other 7 rail steps stay dormant for this spike.

## Integration model

### State ownership

All paths resolve relative to a `--project-root` passed in at server start
(the user's actual project, not the plugin install dir).

| Kind | Lives in | Owner |
| --- | --- | --- |
| Process state (active step, what's done) | `docs/alexandria/.canvas-state/` | Canvas |
| Library content (cards, sources, config) | `docs/alexandria/` | Raven writes, canvas reads |
| Pending intents (user actions awaiting Raven) | `docs/alexandria/.canvas-state/intents.jsonl` | Canvas appends, Raven consumes |
| Play outputs (results awaiting user review) | `docs/alexandria/.canvas-state/outputs/<play>/<ts>.json` | Raven writes, canvas reads |
| Queue items (deferred work, gaps, signals) | `docs/alexandria/.canvas-state/queue.jsonl` | Both — origin field marks source |

The `.canvas-state/` dot prefix marks this as tool memory, distinct from
the user-visible library content alongside it. Same tree, different
visibility — gitignored by default in the user's project.

"Step done" is a canvas event — the user clicks ✓. Raven *proposes* done
(writes outputs); the user *commits* done.

### Transport (crude on purpose)

For this spike we do **not** build a real transport. The loop is:

1. Canvas POSTs intent to `lab-server.py` → appended to `intents.jsonl`.
2. Canvas shows a toast: "→ Raven ready: say `go` in Claude Code."
3. User types `go` (or pastes the intent line) in CC.
4. Raven reads `intents.jsonl`, processes the latest unprocessed intent,
   writes outputs, marks the intent processed.
5. Canvas polls `outputs/` every 2s while a step is active; renders on change.

This is enough to test whether the loop *feels* right. If it does, we can
upgrade the transport (filesystem watch, MCP server, direct CLI dispatch)
without changing the model. If it doesn't, no transport work was wasted.

### Queue (stub, not full PM)

Three voices, one queue, each item tagged with origin:

- `rule` — derived from health checks (computed, deterministic).
- `raven` — Raven's judgment ("this area feels thin").
- `user` — human-authored.

Spike scope: queue items render in a sidebar or strip; origin badge is
visible; clicking opens the item; mark-done works. No full Kanban/Priority/
Timeline lenses yet — the existing canvas already has those view shells,
we wire one to read queue items at most.

## Workstreams

### A. Canvas (product-library/)

A1. Today's Frame body: per-step renderer. Two surfaces this spike:
    `codebase-scan` and `product-nouns`.
A2. Action buttons → POST to lab-server intent endpoint.
A3. Output polling: watch `canvas-state/outputs/<active-step>/`, re-render.
A4. ✓ Step Complete button → writes step-complete event, advances rail.
A5. Queue strip (read-only render of `queue.jsonl`, origin badges).
A6. Toast/handoff UI ("→ Raven ready").

### B. Server (Bun, replacing lab-server.py)

The existing `lab-server.py` was right for a single-machine prototype but
doesn't survive shipping with the plugin: it assumes Python is installed,
hardcodes paths and port, and makes Alexandria a "plugin that needs Python
present" — a runtime story the plugin doesn't currently carry. The fix is
to replace it with a small Bun script, since Alexandria already requires
Bun for its dev toolchain (see CLAUDE.md). Promoting Bun from build-time
to runtime keeps the runtime story coherent — one dependency, already in
the project, ships everywhere Bun ships.

The Bun rewrite happens **during** the spike (workstream B step 1), not
after. Building the spike on a server we know we'd throw away wastes
effort and risks baking in assumptions that won't survive packaging.

#### Deliverables

B1. `scripts/canvas-server.ts` — Bun HTTP server. Replaces lab-server.py.
    Uses `Bun.serve`. Same endpoints, same JSON wire format, ~100 lines.
B2. POST `/api/intent` → append to `intents.jsonl`.
B3. GET `/api/outputs/<step>` → list/read output files for active step.
B4. GET `/api/queue` → read `queue.jsonl`.
B5. POST `/api/queue` → append user-authored items.
B6. POST `/api/step-complete` → record completion event, advance rail.
B7. Static file serving for canvas HTML + assets under `/`.

#### Design decisions worth being explicit about

**No hardcoded port.** Today the server binds 4323. For shipping that
breaks the moment a user runs `/library` twice (two projects, one
collision). Server takes `--port 0` by default → OS picks free port →
server writes the chosen port to `docs/alexandria/.canvas-state/.server`
(JSON: `{pid, port, startedAt, projectRoot}`). Raven reads that file to
know which URL to open. Subsequent `/library` invocations check the file:
if PID is alive, reuse; if dead, spawn fresh.

**Project root is a startup argument, not an assumption.** Server runs
with `--project-root <path>`. All state paths resolve relative to that
root. The canvas HTML/assets are resolved relative to the script's own
location (the plugin install dir) via `import.meta.url`. This split is
load-bearing — it means one Bun process can be repurposed per project
without confusion, and multiple projects can run their own servers
concurrently.

**Canvas state lives in the user's project, not in the plugin tree.**
Today `product-library/canvas-state/` mixes prototype source code with
prototype state. Once shipped, source ships with the plugin (read-only
from the user's perspective) and state lives in the user's project at
`docs/alexandria/.canvas-state/`. Bun version enforces this split from
day one — even during the spike, state writes go under the scanned
project's root, not under the plugin's working dir.

**Lifecycle: spike answer is reuse-or-spawn, no auto-stop.** Process
stays alive after `/library` exits. Subsequent `/library` calls detect
via the PID file and reuse. Manual stop via `bun scripts/canvas-stop.ts`
(or just `kill <pid>`). Idle timeout, session-end hooks, and orphan
cleanup are deferred — solving them now distracts from testing the
model.

**Build step: none.** Canvas is one HTML file with inline JS. No bundler,
no transpile, no esbuild. Bun serves it as a static file. If the canvas
later grows enough to warrant a build step, fine — but not before we
know the model works.

**Cross-platform browser open.** Bun script shells out: `open` (macOS) /
`xdg-open` (Linux) / `start` (Windows via `cmd /c start`). One helper,
maybe 10 lines. Falls back to printing the URL if all three fail.

**No new dependencies.** Bun's stdlib (`Bun.serve`, `Bun.file`, `Bun.spawn`)
covers everything. The server should be installable by running the
plugin's existing install path — no extra `bun install` needed for users.

#### What workstream B explicitly punts

- **Auto-shutdown logic.** Servers may leak across sessions during the
  spike. Acceptable for now.
- **Concurrent writes / locking on `intents.jsonl` and `queue.jsonl`.**
  Single user, single Raven, append-only files. Skip locking, document
  the assumption.
- **Authentication.** Bind to `127.0.0.1` only, like lab-server.py does.
  No auth needed because no remote access.
- **Real-time push.** Canvas polls every 2s. SSE/WebSocket comes later
  if polling proves wrong.
- **Windows testing.** Develop on macOS, sanity-check on Linux. Windows
  is in scope conceptually (Bun supports it) but we don't validate during
  the spike.

### C. Raven plays (skills/)

C1. New skill `skills/canvas-bridge/SKILL.md` — Raven's "consigliere mode"
    entry point. On invocation: read `intents.jsonl`, find oldest
    unprocessed intent, dispatch to the named play, write outputs.
C2. `play.codebase-scan` — extracted from `skills/initialize/scanner.md`.
    Trimmed to: take scan scope from intent, walk files, produce structured
    noun list, write to outputs.
C3. `play.product-nouns` — extracted from `skills/initialize/noun-dialogue.md`.
    Trimmed to: take scan results + user-edited graph, produce card stubs.
C4. Queue authoring helpers — when a play finishes with deferred items,
    append them to `queue.jsonl` with `origin: raven` and a reason.

Plays must be **narrow** — no "where are we in the flow" reasoning, no
"what should we do next" prompts. The canvas owns flow control. Each play
is a function: intent in, files out.

## Sequence

1. **Plumbing first.** B1 (Bun rewrite + project-root + port selection),
   B2, A6, C1. End state: canvas can POST intent, Raven reads it (with a
   stub play that just echoes), canvas sees an output appear. No real
   work happens but the loop is closed on the runtime we'd actually ship.

2. **Codebase Scan vertical.** A1 (scan surface only), B5, C2, A4.
   End state: pick a directory on canvas, click Scan, type `go` in CC,
   see real scan results render on canvas, click ✓, step marks complete.

3. **Queue stub.** A5, B3, B4, C4. End state: scan's deferred items
   appear in queue strip with origin badges; user can author items.

4. **Product Nouns vertical.** A1 (nouns surface), C3, polish. End state:
   from a completed scan, open Nouns step, see seeded graph, edit, run
   `play.product-nouns`, see card stubs land in `docs/alexandria/cards/product/`.

5. **Felt-sense review.** Sit with it for a session on a real project.
   Does the loop feel good? Is the handoff awkward? Is the queue useful
   or noisy? Document findings, decide whether to expand to remaining 7
   steps or change the model.

## Success criteria

This spike succeeds if **all three** are true after step 5:

1. The loop completes end-to-end on a real codebase without manual file
   surgery.
2. The user (you) reports the canvas-first experience feels at least as
   good as today's library flow for these two steps — preferably better.
3. The decomposition into narrow plays produced *shorter, sharper* skill
   prompts than what's in `skills/initialize/` today, not longer ones.

If 1 fails: transport assumptions are wrong, rethink. If 2 fails: model is
wrong, the canvas isn't the right primary surface — rethink before
generalizing. If 3 fails: plays aren't actually narrow, we just relocated
the library setup's complexity. Rethink decomposition.

## Out of scope (deliberately)

- The other 7 setup steps (Opening, Config, Engine Run, Gap Analysis,
  Initialize Artifacts, Initialize Tracker, Source Assessment).
- Real transport (MCP server, file watcher, direct CLI dispatch).
- Full PM layer (Kanban, Priority, Timeline wired to queue).
- Maintenance mode (this spike is setup-only; the continuity story comes
  after we know setup works).
- Multiplayer / commenting on items.
- Visual gestalt updates on Band 1 tiles (stacks filling, dust, etc.).
- Replacing today's `/library` skill. The current library flow keeps
  working in parallel; this spike is a fork, not a migration.

## Follow-on tickets (surfaced during the spike)

These are deferred items we surfaced while building. Each is its own
piece of work, not in scope of the spike itself.

- **`alxndr scan-docs`** — Markdown-tree equivalent of the Tier 1 code
  scan. Walks docs trees (`docs/`, `docs/context-library/`, etc.),
  extracts heading-level entity names, recognizes taxonomy directories
  (zones/systems/features-style hierarchies, like lifebuild's), reads
  explicit "X is a Y" definitions. Output JSON in the same shape as
  `alxndr scan` so synthesis can fold both signals. **Why it matters**:
  the code scan walks past curated product context libraries entirely
  — `alxndr scan` against lifebuild missed the entire
  `docs/context-library/product/zones/` tree even though it's a
  beautifully clean product vocabulary that's *exactly* what we're
  trying to discover. Code is the right signal for products without
  docs; for products with docs, docs are usually the *better* signal.
- **Wells-driven gathering instead of "scan"** — reframe step 1.2 from
  "scan the codebase" to "inventory the wells of information available
  (website / product docs / plan docs / github / brain), score each
  0–10, drain in priority order." The current scan becomes one well
  of several, not the primary input.
- **Magical first interaction as part of 1.1** — onboarding to
  Alexandria should include one small canvas moment where the director
  changes something and Raven shows she saw it. Plants the
  proprioception that the room is shared and alive before any heavy
  lifting.
- **Port the canvas patterns into product-library-v0.1.html** —
  scan.html was a focused proving ground for SSE / overrides /
  proposals / recap-push. The real flow lives in the v0.1 canvas,
  which has the right chrome already (phase rail, Today's Frame plate,
  Band-1 tiles, dormant drawer). Today's Frame becomes the per-step
  renderer driven by the same state machinery.

## Open questions to resolve during the spike

1. **Handoff signal.** Is `say "go" in CC` good enough, or does the
   friction kill the loop? If it kills it, what's the cheapest upgrade —
   browser notification? CC reads a hot file? A keyboard shortcut?
2. **Intent granularity.** One intent per action (Scan), or per
   sub-action? Probably per action for the spike; revisit if plays grow.
3. **Queue origin legibility.** Are three badges (rule/raven/user) enough,
   or does the user need to know *why* each rule fired, *what* Raven was
   thinking? Spike with just badges; add reasons if it feels opaque.
4. **Where does `play.codebase-scan` actually run?** Inside Raven's turn
   (Raven calls tools to walk the FS) or as a script Raven invokes? For
   the spike, Raven calls tools directly — keeps the surface area small.
5. **What happens if the user does work directly in CC instead of canvas?**
   For the spike: assume they don't. If they do, the canvas re-syncs on
   next refresh. Real answer comes later.
6. **Is Bun-as-runtime-dep acceptable for shipped Alexandria?** Today Bun
   is required for the dev toolchain but not strictly for using the plugin.
   Canvas-first makes Bun a true runtime dep. Worth confirming with the
   install/distribution story before generalizing the model — but for the
   spike we proceed assuming yes.

## Branch and worktree

The canvas, library skill, and Bun server all live on `main` now
(canvas was merged in #467 as a sandbox at `product-library/`; the
library skill lives at `skills/library/` and its supporting files at
`skills/initialize/`). So this spike happens on a **single branch** off
main — `danversfleury/canvas-library-spike` — in one worktree. No
cross-branch coordination needed.

The Python `product-library/lab-server.py` stays in place during the
spike until the Bun server (`scripts/canvas-server.ts`) reaches parity.
Once parity is hit, the Python server gets removed in the same commit
that flips `/library` to use the Bun server. Don't run them in parallel
in production — but during development, the Python server can keep
serving the canvas while Bun work proceeds alongside.

Nothing in this spike touches the shipped `/library` entry point until
the felt-sense review (sequence step 5) signals the model is right.

## What this spike does *not* decide

Even on full success, this spike does not commit to:

- Replacing the existing `/library` skill. It validates a model, not a
  migration.
- Building a real PM/maintenance experience. The queue is a stub.
- The visual treatment of Band 1 gestalt (stacks, dust, etc.). That's a
  separate design conversation that only makes sense once the loop works.
- Whether the canvas is mandatory for library setup, or whether a
  CC-only fallback survives. Decide after we feel the canvas-first loop.
