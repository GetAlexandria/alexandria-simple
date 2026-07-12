# Refactor the Demo Monolith

Split `prototype/product-library/product-library-v0.1.html` (16,066 lines) into
sibling CSS/JS files so subsequent design iterations on the canvas spike are
cheap to make and review. No behavior changes, no build step, no module
system — just file extraction.

## Why now

The spike has become the demo surface for the canvas + Raven interaction loop,
and we keep returning to it. Every tweak (a stone tab, a Raven coin, a phase
rail tooltip) requires scrolling through one 16k-line file. Diffs hide intent.
Multiple agents stomp each other when editing in parallel. The fix is
mechanical and one-time: extract the blocks that are already visually segmented
into their own files. After the split, a "tweak Raven CSS" change is a
~50-line diff in `raven.css` instead of a needle in `product-library-v0.1.html`.

This is iteration scaffolding for the reference prototype only. Jess builds
the real Library; the production architecture is out of scope here. We are
explicitly **not** introducing a bundler, TypeScript, ES modules, or a
component framework.

## Current block map

`product-library-v0.1.html` already has well-bounded `<style>` and `<script>`
blocks with comment banners between them:

| Lines         | Block                                | Approx. size |
|---------------|--------------------------------------|--------------|
| 10–5786       | Main CSS (top bar, lab floor, drawer, phase rail, cmd-K, etc.) | 5,777 |
| 5790–6433     | HTML — top bar, lab floor, drawer, alt views | 644 |
| 6436–6485     | `<script type="application/json" id="lab-data">` — embedded fixture | 50 |
| 6487–12018    | Main JS IIFE — lab data, status views, drawer logic | 5,532 |
| 12020–12113   | Phase rail JS (separate IIFE) | 94 |
| 12121–12460   | Secondary CSS (phase rail polish) | 340 |
| 12472–12681   | Practice Cave CSS | 210 |
| 12682–12959   | Practice Cave JS | 278 |
| 12969–14834   | `#raven-canvas-styles` — Raven bench / surfaces CSS | 1,866 |
| 14836–15007   | HTML — sub-button tray, agent bench, surface overlay | 172 |
| 15009–15934   | Raven canvas JS IIFE | 926 |
| 15954–16064   | Library embed JS | 111 |

The static file server (`scripts/canvas-server.ts:1158`) already serves any
path under `canvasRoot` with `cache-control: no-cache`, so plain
`<link rel="stylesheet" href="…">` and `<script src="…">` work with no
config change and edits still land on every reload.

## Target layout

```
prototype/product-library/
  product-library-v0.1.html        # shell: <head>, body markup, <script src>/<link> refs
  assets/
    css/
      product-library.css          # blocks 1 + 6 (main + phase-rail polish)
      practice-cave.css            # block 7
      raven.css                    # block 9 (#raven-canvas-styles)
    js/
      lab-data.json                # block 3 (extracted from inline JSON island)
      product-library.js           # block 4 (main IIFE)
      phase-rail.js                # block 5
      practice-cave.js             # block 8
      raven.js                     # block 11
      library-embed.js             # block 12
```

The HTML file shrinks from ~16k lines to roughly 1.5k (markup + a dozen
`<link>`/`<script>` tags). Existing `assets/` and `raven-assets/` image
folders stay where they are; only stylesheets and scripts move.

## Slicing order (one PR per slice)

Each slice extracts one block, reloads the demo, and verifies a named visual
target. Order is **lowest-risk-first**, leaving the giant main JS for last.

1. **Raven CSS** (block 9). Largest, cleanest boundary, scoped to `#raven-*`
   selectors — minimal interaction with the rest. Verify: bench seats render,
   coin glow animates, surface overlay opens.
2. **Raven JS** (block 11). Self-contained IIFE, exposes `window.raven*`
   helpers consumed by the library embed. Verify: click Raven coin →
   knowledge bank opens; click Library tile → library renders.
3. **Library embed JS** (block 12). Depends on Raven JS — load after. Verify:
   Atomic Library tile and Raven Library coin both embed library into
   `#tfs-body`; back button returns to phase content.
4. **Practice Cave CSS + JS** (blocks 7, 8). Co-located, isolated by
   `.practice-cave-*` selectors. Verify: practice cave stage opens, completes,
   transitions out.
5. **Phase rail JS** (block 5). Small, isolated by `initPhaseRail()` entry
   point. Verify: phase rail renders, step click changes active step.
6. **Secondary CSS** (block 6). Merge into `product-library.css` or keep as a
   second `<link>`. Recommend merge — no reason to keep two files.
7. **Lab data JSON** (block 3). Extract to `lab-data.json`, fetched once at
   startup by the main IIFE. Verify: status views populate, items hydrate.
8. **Main CSS** (block 1). Verify: top bar, lab floor, drawer, alt views all
   render identically.
9. **Main JS** (block 4). Last because it's the largest and touches the most
   surface area. Verify: full smoke pass (every nav tab, every drawer mode,
   cmd-K, status cycling, persistence to localStorage).

Each slice is independently revertable. The HTML keeps the `<style>` /
`<script>` block until the slice lands, then swaps to a `<link>` /
`<script src>` reference and deletes the inline copy in the same commit.

## Risks & how we handle them

- **Script execution order.** The IIFEs run top-to-bottom and the library
  embed reads globals set by the Raven IIFE (`window.ravenShowSurface`,
  `window.ravenCloseSurface`). Keep the `<script src>` tags in the same
  order as the original `<script>` blocks. No `defer` / `async` — preserve
  exact semantics.
- **Inline JSON island.** `<script type="application/json" id="lab-data">` is
  read via `document.getElementById('lab-data').textContent`. Moving it to a
  `fetch('assets/js/lab-data.json')` requires the main IIFE to become async
  at startup. Acceptable, but it's the one slice that changes the loading
  shape. If we want zero behavior change, alternative is to keep the inline
  JSON block in the HTML shell and only extract `.js`/`.css`. Recommend
  **keep inline** for the JSON island — small (50 lines), and a fetch
  introduces an FOUC risk for the first paint.
- **Asset path drift.** The Raven block resolves images relative to the HTML
  file (`raven-assets/...`). Stylesheet `url(...)` references must stay
  relative to the **CSS** file's location after extraction. Audit each
  `url(` in the extracted CSS and rewrite to `../raven-assets/...` /
  `../assets/...` as needed.
- **CSS specificity / order.** The two `<style>` blocks (main + phase-rail
  polish) rely on cascade order. Concatenate them in the same order via
  two `<link>` tags, or merge into one file (slice 6 collapses this).
- **No-cache reload.** Already set by `canvas-server.ts:1168`. Don't change.
- **Parallel-agent edits.** Once split, file-level locks are natural —
  agents editing Raven CSS won't conflict with agents editing the drawer.
  This is the main payoff.

## Verification per slice

- Server still on `http://127.0.0.1:4322` (or wherever `canvas-server.ts`
  picked).
- Hard-reload (`Cmd-Shift-R`) the page.
- Walk the named smoke checklist for the slice (see "Slicing order").
- Spot-check `localStorage['product-library-v0.1']` still hydrates.
- Diff against `origin/main` should show only file moves + the corresponding
  `<link>` / `<script src>` swap. No logic edits.

## Out of scope

- Bundlers (esbuild, Vite, etc.). Plain static files.
- TypeScript. JS stays JS.
- ES modules. The existing IIFEs already isolate scope; converting to
  `import`/`export` is gratuitous here.
- HTML partials / templating. The markup body is ~800 lines after extraction —
  small enough to live in the shell. Revisit only if it grows.
- Tests. The spike has no automated UI tests; visual smoke is the contract.
- Renaming `product-library-v0.1.html` or `raven-assets/`. The server
  defaults to that filename (`canvas-server.ts:1158`).
- Anything in `packages/`. This is spike-only refactor.

## Done when

- `product-library-v0.1.html` is under ~1,500 lines and contains no inline
  `<style>` or `<script>` blocks (except the lab-data JSON island, if kept).
- All assets live under `prototype/product-library/assets/{css,js}/`.
- Visual smoke pass: top bar, lab floor, drawer (all modes), phase rail,
  cmd-K, Practice Cave, Raven bench, Knowledge Bank, Library embed, Playbook
  overlay — all behave identically to pre-refactor.
- A follow-up "tweak X" change is a one-file diff.
