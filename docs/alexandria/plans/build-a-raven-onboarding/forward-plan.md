# Build-a-Raven — Forward Plan

**Status:** the next slice of work, written from a clean-slate position after PR #163 landed and subsequent architectural decisions emerged through prototyping.
**Companion docs (the history):** `plan.md` (design), `build-plan.md` (10-phase project plan), PR #163 description (what got built).

This doc does not restate what's been done. It captures the architectural updates that emerged *after* the original plan, points at the standalone explorations that hold the next-direction design, and names what needs to be done next.

## Architectural updates since the original plan

These are decisions and patterns that emerged through prototyping and discussion, not present in `plan.md` or `build-plan.md`. Future implementation should defer to these where they conflict with the older docs.

### 1. Library and Playbook as lenses on one underlying graph

There is one company graph (THE Library) and one play repository (THE Playbook). Each agent's "Knowledge Bank" and "Playbook" is a *filtered view* — not a separate data structure. Same data, different lens.

The unification is at the **data layer only**. UI presentation may vary per lens — each agent surface can have its own shape (the band-grid view of Raven's KB clarifies the build process; the constellation view of the company Library is unproven). Don't sacrifice the winning UI to force visual unification.

See `[[library-and-playbook-as-views]]` memory entry.

### 2. Agent pages: player sheet + playbook (per agent)

Each agent has two surfaces accessed via their coin's sub-buttons:

- **Player sheet** — single-screen hub: name + level + descriptor; tier navigation (clickable career arc); knowledge synopsis; plays synopsis. Drills to full knowledge map or full playbook.
- **Playbook** — full binder-style surface: side tabs by tier/section; per-play detail pages with diagrams, descriptions, prerequisites, tier ladder, outputs; Edit/Activate mode toggle; "Build a new play" CTA.

Both currently exist as **standalone prototypes** referenced below. They're the design targets for the in-canvas integration.

### 3. Tier-as-view navigation (replaces "next promotion" card)

The career arc (Coordinator → Manager → Senior PM) is *navigation*, not just a label. Clicking a tier node re-renders the same player sheet at that tier's projected state — locked plays, partial knowledge, dimmed/desaturated to signal "future you, not built yet."

This dissolves the need for a dedicated next-promotion section. The arc IS the promotion preview.

### 4. Playcalling: Hot Tray on the coin + Edit/Activate in the playbook

Three composable mechanisms:

- **Hot Tray** — 3 pinned plays live on Raven's coin's sub-button area (alongside the existing KB / Playbook / Wake nav trio). Tap any → coin animates to working, status text updates, play fires. Daily-use fast lane.
- **Edit / Activate mode** in the Playbook surface — segmented toggle. In Edit mode, clicking a play opens its definition / refinement; in Activate mode, clicking fires it.
- **`requires_confirm` flag** per play definition — high-cost plays (overnight, multi-step, expensive) show a confirmation modal before firing.

Hot Tray is for the 3-5 most-called plays. Playbook is for depth + rare invocations. Confirm flag is the safety net across both.

See `[[playcalling-via-hot-tray-and-tiers]]` memory entry.

## Standalone explorations (reference designs)

These live in the prototype's product-library folder and demonstrate the next-direction agent-in-Alexandria pages. Open in the canvas-server at `http://127.0.0.1:4322/<name>.html`.

- **`docs/alexandria/plans/canvas-library-spike/prototype/product-library/raven-player-sheet.html`** — Raven's player sheet with tier-as-view navigation. Mocked data; ~960 lines self-contained. Demonstrates the hub pattern proposed for the agent KB sub-button surface.
- **`docs/alexandria/plans/canvas-library-spike/prototype/product-library/raven-playbook.html`** — binder-style playbook with side tabs, parchment pages, 16 hand-drawn ink-on-parchment play diagrams, Edit/Activate mode, per-play detail pages with tier ladder + outputs. ~83 KB self-contained.

These are *reference designs*, not production-ready. They should be tuned standalone first, then ported into the main canvas's module structure (post-monolith-refactor).

## Next slice — priority order

### Phase A: Reconcile with the monolith refactor (immediate)

PR #163 was authored against the monolithic `product-library-v0.1.html`. Main has since been refactored to split that file into modules. Before any further work:

1. Rebase or merge `danversfleury/demo-spike-overhaul` against current `main`.
2. Re-port the work that lived in the monolith into the new module structure:
   - Top bar (logo + stone tabs + station indicator removal)
   - Five-seat bench + coin state vocabulary + sub-button tray
   - Information Station four-lane view
   - Hot Tray on the coin (commit `9d10a9d`)
   - Practice cave rewire + microscope lock + progress rail
   - All the renames and cleanup
3. Confirm everything still loads and demos end-to-end before integrating any new surfaces.

This is mechanical but real work — likely a Sonnet agent's job.

### Phase B: Standalone-to-canvas migration

After Phase A, port the standalone reference designs into the main canvas:

1. **Replace the in-canvas Raven KB view** with the player-sheet hub from `raven-player-sheet.html`. The existing band-grid view stays as the "View knowledge map →" drill-down. The right-column playbook embedded in the KB gets cut.
2. **Replace the in-canvas Raven Playbook view** with the binder layout from `raven-playbook.html`. The placeholder grid the prototype shipped gets retired.
3. **Wire Hot Tray play-fire to a real lifecycle**, not just a 2.5s coin animation stub. At minimum, an event the coding tool can listen for.

These are not trivial integrations — the binder is 83 KB on its own, and the player sheet has tier-switching state. Plan for each as a focused agent task.

### Phase C: Real spec work (was Phases 1-3 of the original build plan, still unstarted)

Independent of the UI integration:

1. **Four MVP madlibs** — Vision / Bets / Vocabulary / Skeleton. Slot lists, pre-fill rules, conflict detection, sample fills, post-submit flow per area. (Phase 1 of `build-plan.md`.)
2. **Source-of-truth doc format spec** — frontmatter schema, disk location convention, provenance metadata linking up and down to raw materials and atomic cards. (Phase 2.)
3. **Grade rubric** — letter or tiered, inputs, ambient meter behavior, save-at-grade semantics. (Phase 3.)
4. **Hook protocol schema** — events for form submit, raven status, conflict updates, banking, wake, play-call. (Phase 8.)

These are content/design docs, parallel-friendly.

### Phase D: New design questions raised by recent work

1. **Edit mode behavior** in the Playbook — what does Edit mode actually let you do? Rename a play? Edit its description? Adjust prerequisites? Configure its tier-ladder thresholds? Right now it's cosmetic-only.
2. **"Build a new play" flow** — the binder has a CTA tab but no actual builder. What does the director provide? Name, plane, category, prerequisites, expected outputs, diagram?
3. **Confirmation flag UX** — which plays require confirm, what does the modal look like, can the director suppress it for known-safe plays.
4. **Hot Tray slot count** — 3 (working answer) vs 5. Worth director testing once the integration lands.
5. **Play diagrams** — the 16 ink sketches in the binder are placeholder. Curating pass needed; ideally collaborate with designer.
6. **Tier-as-view for future agents** — when Engineering / Design / Market / Research come online, do their player sheets follow the same Coordinator/Manager/Senior PM ladder, or do they have role-specific tier names? Probably role-specific — "Junior / Senior / Lead Engineer" not "Coordinator / Manager / Senior PM" applied to Engineering.

### Phase E: Deferred bigger questions

- **Library views (constellation, 2.5D folder)** — keep, redesign, or retire? They're unproven per recent feedback. Probably worth a focused user-test pass before deciding.
- **Information Station scale** — currently mocked. Becomes populated for real once the hook protocol + form-submit lifecycle wires through (depends on Phase C-4).
- **Night tokens** — overnight processing routing for atomization. Designed in `plan.md` but not built or wired.
- **Industry dimension** — explicitly deferred in the original plan.

## Recommended kickoff for the next session

If the next session is starting from a clean context:

1. Read `MEMORY.md` (auto-loaded) and the linked memory entries.
2. Skim this file (`forward-plan.md`) and the original `plan.md` for context.
3. Open the two standalones in the canvas-server to see the tier-view and binder patterns working.
4. Decide Phase A scope (rebase/merge first), then pick a Phase B or C task with the user.

PR #163 stays as the artifact of what landed; this doc and the standalones are the substrate for what comes next.
