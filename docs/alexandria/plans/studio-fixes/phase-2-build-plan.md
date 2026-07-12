# Phase-2 Build Plan — Studio/Viewer Fixes & Upgrades

Status: 2026-06-24. Consolidates the A/B fix list + the Director's board-walk
feedback into dispatchable **lanes** with explicit **blocking**. Hand parallel
lanes to different agents simultaneously; keep the Work Board to ONE owner.

## Where we are
- **Merged:** #380 (board interactions), #381 (bridge → viewer-mode only),
  #382 (Engine empty-state banner), #383 (playbook live-only + source-assessment).
- **Under review:** #385 (F7 auto-vs-director gates).
- **Building (factory):** #384 (make-a-play modular play-page render).
- This plan covers everything else.

## Blocking map (the key)
- **Parallel-safe** — independent files; dispatch simultaneously: **L1** Viewer
  graceful-error, **L2** Catalog Company tier, **L3** F7 StepRail legs, **L4**
  Run-bridge scoping, **L5** Ledger viewer.
- **Single-owner, DO NOT SPLIT** — every item touches `StudioApp.tsx` BoardView;
  splitting across agents = merge hell: **L6** Work Board (design + rebuild).
- **Held / later:** invocation-gating (pending Playbook rework), Playbook UI
  (radical rework coming — don't invest), Catalog play-overview content (lands
  with make-a-play maturity), Gate-1 owed-work (separate proving track).

The one rule: **L1–L5 run in parallel; L6 is one agent.** Don't let two agents
edit `packages/viewer/src/components/studio/StudioApp.tsx` at once.

---

## L1 — Viewer: graceful error state  [parallel · small]
On a runtime/API failure the viewer surfaces a raw `{"_tag":"ViewerHttpError",...}`
body instead of a graceful state. Render an error panel (retry + plain message).
Orientation: `packages/viewer/src/app/runtime/client.ts` (ViewerHttpError), the
library views. Verify: force a backend error → panel, not raw JSON.

## L2 — Catalog: surface the Company tier  [parallel · small]
The spine is Company·Division·Function·Play, but the Catalog renders Division
headers directly and `/api/studio/registry` omits `company`. Surface
`Alexandria_Prime` (registry.js `COMPANY`) in the payload + render. Orientation:
`studio-api.ts` (registryResponse), `studio/plays/registry.js`, `CatalogTab.tsx`.

## L3 — F7 StepRail legs  [parallel · ax loader · full proof needs a run]
make-a-play's composed-runtime legs never load: `workflowTemplatePathCandidates()`
(`orchestration.ts:900-927`) doesn't search `workspacePath/.ax-runtime`, so the
loader falls back to the base template. Plumb `workspacePath` into the loader +
add a `.ax-runtime` candidate. Verify: unit-test the candidates; visual proof
needs a make-a-play run that writes `.ax-runtime/workflows/make-a-play/legs.json`.

## L4 — Run-bridge: scope to the project  [parallel · ax · NEEDS DESIGN NOD]
`observeAlexandriaRuns` runs `fabro ps --all` (machine-global) and narrates OTHER
projects' runs into THIS ledger (deeper half of #381). Runs aren't project-tagged
— clean fix = a project label on `ax run` + a bridge filter. Confirm the label
approach before building. Verify: multi-project Fabro host → only this project's
runs narrated (reproducible on this machine).

## L5 — Ledger viewer  [parallel · new viewer surface]
The top-nav **Ledger** tab is disabled/stubbed — no way to view the ledger, so the
Director can't confirm #381 or see provenance. Build a Ledger view listing the
event stream (type · actor · at · payload summary) from `/api/events`; enable the
tab. Verify: tab opens + shows events; confirms #381.

---

## L6 — WORK BOARD: redesign + rebuild  [SINGLE OWNER — do not split]
Director's walk: both halves are built differently, the buttons are buggy, and the
naming/model need rework. One design-led effort, all in `StudioApp.tsx` BoardView.
**Design the unified model first, then rebuild.**

**Naming / IA**
- Area → **"Work Board"**. Top half → **"Play Making"** (retire "Director's
  confirm-flow"). Bottom → **"Work Orders"**. Remove the unhelpful explainer line.

**Play Making (play-stage cards)**
- Cards must be **clickable** → open that play's page (interstitial / navigate /
  new tab). Today clicking does nothing.
- **Remove the redundant stage badge** on the card face (the column already states
  the stage — keep it in the data model only).
- **Clarify or remove** the per-card "○ ready" + "Work" controls (unclear).
- **Graduate-out-of-board:** LIVE = a play temporarily exits the confirm-flow.
  Hundreds will go live; don't accumulate them. Add a confirm step to **graduate**
  a LIVE card OUT of the board.

**Work Orders (current bugs + model)**
- BUG: status change (Start/Close) **clones** the card into the target lane — the
  original stays. Must **move**, not duplicate.
- BUG: in-card **Edit** does nothing.
- Add a **"won't do" / dismiss** status, distinct from "done".
- **Archive model:** a data plan for archived work + the ability to **archive**
  rather than only mark done.
- The click-to-detail **overlay works** — keep it.

**Unify:** both halves share one interaction model — Director: "just make this
work like Trello on both levels." Spec model + statuses + archive + naming first.

---

## Held / later (do not dispatch)
- **Invocation gating to live plays** — HOLD until the Playbook rework.
- **Playbook UI** — DEFER. Undesigned, radical rework coming. Don't invest.
- **Catalog play-overview content** — LATER; fills in as make-a-play matures.
- **Gate-1 owed-work** (back-of-house-walk proving) — separate proving track.

## Dispatch
- Author L1–L5 as parallel factory issues / agent tasks now.
- L6 → one owner: a design pass, then the rebuild.
- Gates before building: L4's label approach, L6's unified-model spec.
