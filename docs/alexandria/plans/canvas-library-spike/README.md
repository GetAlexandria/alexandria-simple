# Canvas Library Spike — Working Reference

This is a **working reference port** of the canvas-first library-shaping
prototype from `sociotechnica-org/alexandria#468` (branch
`danversfleury/canvas-library-spike`).

## What this is

A snapshot of Danvers's prototype for **canvas-first library setup** — Raven (in
Claude Code chat) and the director (in a browser-served HTML canvas) work the
same library together over a shared, live, SSE-backed surface. Director acts on
canvas; Raven reacts in chat. Save → Raven auto-wakes via a `Stop`-event
`asyncRewake` hook.

The architectural framing is in [`plan.md`](./plan.md) (lifted from the spike
repo). The code captures the felt experience.

## What this is NOT

- **Not for shipping.** Nothing here is wired into `packages/alexandria-plugin`
  or `packages/alexandria-next-plugin`. Treat it as inert reference material.
- **Not production-quality.** Jess will build the real implementation. This is
  the imagined-thing Jess will work from.
- **Not integrated with this repo's plugin manifests, build, or tests.** Paths
  like `${CLAUDE_PLUGIN_ROOT}/...` in the skill files refer to the spike repo's
  layout, not this monorepo. Don't try to load `/canvasdemo` from here.

## Why it's here

So that when we talk about the canvas direction — onboarding flow, Raven's
shaping behavior, the scoreboard rework, the asyncRewake mechanic — we're
working with the *latest* prototype source instead of guessing or paraphrasing.
When the time comes to upgrade this repo's Alexandria toward the canvas
direction, the reference lives next door.

## Layout

```
canvas-library-spike/
├── README.md                  ← this file
├── plan.md                    ← architectural framing (lifted from the spike repo)
└── prototype/                 ← the runnable spike, mirroring the source repo
    ├── docs/design/           ← brand, voice, canvas patterns
    ├── hooks/hooks.json       ← asyncRewake hook config (checked in, not gitignored here)
    ├── product-library/       ← the canvas HTMLs, assets
    │   ├── product-library-v0.1.html   ← the main canvas
    │   ├── scan.html, spike-test.html  ← earlier surfaces
    │   ├── assets/                     ← stone slabs, microscope, chess-board art
    │   ├── raven-assets/               ← Raven portraits, coin states, library-graph data
    │   └── canvas-state/               ← seeded state files (gitignored runtime state)
    ├── scripts/               ← Bun SSE server + watcher + helper CLIs
    │   ├── canvas-server.ts            ← the main SSE server
    │   ├── canvas-watcher.sh           ← asyncRewake hook entry
    │   ├── _canvas-paths.ts            ← path resolution
    │   ├── canvas-decode-logo.ts       ← image decoding helper
    │   ├── canvas-format-events.ts     ← event formatting
    │   ├── canvas-synthesis-lifebuild.ts ← synthesis surface
    │   └── canvas-url.ts               ← URL helper
    ├── skills/                ← Raven + Claude Code skill payload
    │   ├── canvasdemo/SKILL.md         ← `/canvasdemo` entry, 4-beat flow
    │   ├── canvas-bridge/SKILL.md      ← tool plays (echo, scan, propose, describe-logo)
    │   └── raven/canvas-shaping.md     ← Raven's conversational stance
    └── tests/                 ← Bun tests for server, watcher, events, plugin hooks
```

## Provenance

- Source repo: `sociotechnica-org/alexandria`
- Branch: `danversfleury/canvas-library-spike`
- PR: [#468](https://github.com/sociotechnica-org/alexandria/pull/468)
- Snapshot taken: 2026-05-19 from PR HEAD `3c544bc`
  ("Band 1 optics: relabel + reorder tiles, move logo drop to Source Materials")

## How to refresh from the source repo

When the spike branch advances and we want a newer snapshot:

```bash
# Clone fresh
rm -rf /tmp/canvas-spike-clone
gh repo clone sociotechnica-org/alexandria /tmp/canvas-spike-clone -- \
  --branch danversfleury/canvas-library-spike --depth 1

# Re-copy (preserve internal directory shape under prototype/)
DEST=docs/alexandria/plans/canvas-library-spike
SRC=/tmp/canvas-spike-clone
cp "$SRC/docs/alexandria/plans/canvas-library-spike/plan.md" "$DEST/plan.md"
rm -rf "$DEST/prototype"
mkdir -p "$DEST/prototype/docs/design" "$DEST/prototype/hooks" \
         "$DEST/prototype/scripts" "$DEST/prototype/skills/canvas-bridge" \
         "$DEST/prototype/skills/canvasdemo" "$DEST/prototype/skills/raven" \
         "$DEST/prototype/tests"
cp "$SRC/docs/design/"{brand,canvas-patterns,voice}.md "$DEST/prototype/docs/design/"
cp "$SRC/hooks/hooks.json" "$DEST/prototype/hooks/"
cp -R "$SRC/product-library" "$DEST/prototype/"
cp "$SRC/scripts/"canvas-*.ts "$SRC/scripts/_canvas-paths.ts" \
   "$SRC/scripts/canvas-watcher.sh" "$DEST/prototype/scripts/"
cp "$SRC/skills/canvas-bridge/SKILL.md" "$DEST/prototype/skills/canvas-bridge/"
cp "$SRC/skills/canvasdemo/SKILL.md" "$DEST/prototype/skills/canvasdemo/"
cp "$SRC/skills/raven/canvas-shaping.md" "$DEST/prototype/skills/raven/"
cp "$SRC/tests/"canvas-*.{ts,test.ts} "$DEST/prototype/tests/" 2>/dev/null
```

Then update the snapshot date and HEAD SHA in this README.

## Status

- **2026-05-19** — Initial port from PR #468 HEAD.

## Where this is heading

The current `/ax-library` ritual in `packages/alexandria-plugin/skills/ax-library/`
runs a 9-beat conversational first-session flow. The canvas direction reimagines
that as a **shared canvas + chat** experience: the same engine logic, same
artifacts, but the felt surface changes from chat-only to canvas-led with
chat as the live thinking partner.

When Jess builds the production version, the home is likely
`packages/alexandria-next-plugin` — Alexandria Next is the rewrite line and
already has freedom to change library-shaping semantics. This reference snapshot
should make that translation easier when the time comes.
