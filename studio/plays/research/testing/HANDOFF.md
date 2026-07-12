# Testing Center — handoff for the next agent

> **Superseded origin record (2026-06-15).** The surface later shipped (PR #268)
> and the live build is specified under
> `docs/alexandria/plans/_archive/testing-center-viewer-port/` (plan + `AUTHORING-EVALS.md`
> + the play's `risk-map.md`). Read this for the *origin* of the model and
> vocabulary; read those for the current build. Naming is updated to the settled
> terms (**Play Testing** surface, **Coverage** tab); a few status notes below
> (e.g. "tabs not built yet") describe the 2026-06-15 snapshot, not today.

You're picking up the **Play Testing** center. Read this, then
`DESIGN-NOTES.md` (the model + open questions), then `RISKS.md` and the
`../TESTING.md` section **"Measurement, sampling & significance."**

## Where it stands (2026-06-15)

- **Canon — written, cited, in PR #259** (this folder + `TESTING.md`):
  `grounding.md` (Tier-A single-call + Tier-B chain, adversarially verified),
  `extracted-claims.md` (the claim ledger + raw-run task IDs `w26cfqnr4`/`wwi0m62c6`),
  `RISKS.md` (the risk-column spine), `tier-b-research-plan.md`, `DESIGN-NOTES.md`,
  and the measurement/significance canon in `TESTING.md`.
  - **Raw research transcripts are *referenced* (task IDs), not committed.** If a
    verbatim copy is wanted, get the formal package from the research run and add
    it under `raw-runs/`.
- **UI design — a throwaway mockup, NOT shipped:**
  `.context/mockups/fixtures-evals-heatmap.html` in the `bamako` workspace
  (gitignored). Serve with `python3 -m http.server 8900` from that dir. **This is
  the current design source of truth for the UI** — copy it to your workspace.
- **Viewer play-page work — separate, in-flight:** PR #260 (Play Walk redesign +
  a parallel "moves" rebuild). The **Play Testing tabs are NOT built into the
  viewer yet.** *(2026-06-15 snapshot — they shipped in PR #268.)*

## The model (recap — full detail in `DESIGN-NOTES.md`)

Three tabs, in flow: **Preflight** (the build-validity gate; blocks the rest) →
**Diagnostics** (systems health from `workflow.fabro`; *Generic* = runs on any
play, reference-free, finds hotspots / *Needs-fixtures* = correctness) →
**Coverage** (Reasoning · Input · Output · Adversarial, each test scoped
Node/Seam/Whole, vs a per-play eval plan). Per-test measurement **n · rate · CI**,
**never pooled** (a risk's headline = its weakest test). Sequence = BLOCKS (gate →
all runs; fixtures → correctness) + INFORMS (hotspots → where to spend).

## Your two jobs

### 1. Trim & shape the prototype
Functionally complete; needs polish before porting. Check:
- **Colors** (current scheme): gold = per-call categories, **orange** = Adversarial,
  **violet** = Integration/Diagnostics, **teal** = the gate. Confirm consistency +
  contrast/accessibility.
- **Word choices**: tab names (Preflight / Diagnostics / Coverage), the status
  vocabulary (covered/partial/gap; per-test passing/needs-work/missing/provisional;
  deterministic), the diagnostic titles ("Seams · Handoff Integrity", etc.), and
  the "shaped from" provenance line.
- **Organization**: the 3-tab flow, the Generic vs Needs-fixtures split, and the
  binding-constraint (no-pool) rollup.

### 2. Porting plan — and DO NOT do an unfaithful port
**The recurring failure this must prevent:** porting studio content into the
viewer and *changing key content* — paraphrasing canon, altering names/data.

- **Faithfulness by construction (the mandate):** the viewer **renders from the
  source files; it does not own or re-author content.** The risk taxonomy, the
  source-pattern library, per-play eval plans, and results live as **files under
  `studio/plays/…`** and reach the UI through the `/api/studio/*` endpoints — they
  are **never** hardcoded/paraphrased into React. (Same rule the play page already
  follows: *"Records stay files; the viewer renders, it does not own them."*) The
  mockup hardcodes its data *because it's a mockup* — the real port must read the
  files. This is the structural guarantee against drift.
- **Data model to specify (the three layers, from `DESIGN-NOTES.md`):**
  global canon (`research/testing/` + `TESTING.md`) → per-play **eval plan**
  (a `risk-map.md` per play — note frontmatter can't express *open* rows, so a
  dedicated file is likely) → per-test **results** (n·rate·CI). Define the schema +
  the `/api/studio/*` shape for each, and how the UI renders *canon × plan ×
  results*.
- **A verification step in the plan:** after porting, **diff the rendered surface
  against the source files**; any wording change to canon content is a bug, not a
  style choice.

## Pointers
`studio/plays/research/testing/` (canon) · `studio/plays/TESTING.md` (process +
measurement) · `.context/mockups/fixtures-evals-heatmap.html` (UI design) ·
PR #259 (canon) · PR #260 (viewer play-page) · `packages/viewer-next/src/components/studio/PlayPage.tsx`
(the play-page render pattern to extend) · `packages/ax-next/src/effects/studio-api.ts`
(the `/api/studio/*` host).
