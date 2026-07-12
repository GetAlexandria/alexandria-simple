# Build-a-Raven Onboarding — Build Plan

**Status:** project plan, MVP scope
**Companion:** `plan.md` (the design write-up this builds against)

This plan gets a working build-a-Raven MVP onto the spike at `docs/alexandria/plans/canvas-library-spike/prototype/`. The spike remains reference-only — Jess builds the production version off this — but the spike should *demonstrate* the full MVP arc end-to-end so the design is testable, not just speculated.

## Phases

The phases are ordered by dependency. Phases 1–4 are design and content work; 5–9 are build; 10 is cleanup and validation. Phases 1–4 can largely run in parallel; the rest are mostly sequential.

### Phase 1 — Madlib specifications

**Outcome:** Four madlib spec documents, one per MVP area, deep enough to build the form UIs from.

For each of Vision, Bets, Vocabulary, Skeleton:

- Final slot list (name, type — scalar/repeatable/structured, required/optional)
- Pre-fill rules: what sources produce candidates for which slots, with confidence
- Conflict detection rules: what counts as a conflict, what UI treatment it gets
- Sample filled examples (one real, one bare-bones) showing what a director sees
- The Raven post-submit flow specific to this area: what's in the understanding check, what conflicts she looks for, what targeted asks she's most likely to need

**Where:** `docs/alexandria/plans/build-a-raven-onboarding/madlibs/<area>.md`, one file per area.

**Decision needed:** form granularity per area. Working answer in `plan.md`: single form per area, with repeatable internal structures for Bets / Vocabulary / Skeleton.

### Phase 2 — Source-of-truth and provenance schemas

**Outcome:** Spec for the per-area pre-atomic document, plus the provenance metadata that links all three information layers (raw materials → SoT → atomic cards).

- **SoT file format:** `docs/alexandria/sources/<area>.md` with frontmatter — grade, banked-at, version
- **SoT body shape per area** (uses madlib slot structure in narrative form)
- **Provenance frontmatter convention** for all three layers:
  - Raw materials: index file entries with `id`, `dropped-at`, `type`, `derived_sots: [...]`, `derived_cards: [...]`
  - SoTs: `raw_materials: [...]`, `atomized_to: [...]`
  - Cards: `source_of_truth: <area>.md` (extension to existing card template)
- **Raw materials storage convention:** `docs/alexandria/raw/<date-or-source>/<filename>` with index file
- **Re-banking semantics** when the director updates and re-submits

**Where:** `docs/alexandria/plans/build-a-raven-onboarding/information-architecture-spec.md`.

### Phase 3 — Grade rubric

**Outcome:** A defensible, director-facing grade rubric.

- What a grade is (letter? letter + named tier? % + qualitative summary?)
- Inputs: slots filled, confidence per slot, conflicts resolved vs. open, Raven-judged coverage of gap questions
- How grade hints work during form-filling (ambient meter)
- How the final grade gets communicated post-flow
- The save-at-C-and-come-back-later semantics

**Where:** `docs/alexandria/plans/build-a-raven-onboarding/grade-rubric.md`.

### Phase 4 — Agent Bench specification

**Outcome:** A spec for the five-seat bench, the coin's state vocabulary, and the sub-button trio. This is the most load-bearing UI primitive — design it carefully before building.

- **Five-seat layout** on continuous stone plinth: Engineering · Design · Product (Raven, slightly larger socket) · Market · Research
- **Coin state vocabulary** (six states): Dormant · Working · Surfacing · Needs You · Banking · Returning from night work. Each with light + motion + sound signatures.
- **Status text line** under the row — copy per state with state-machine wiring
- **Sub-button trio per coin:** [Agent]'s Knowledge Bank · [Agent]'s Playbook · Wake [Agent]. Wake's label changes by coin state (Wake / Continue / See what I did overnight).
- **Sub-button tray zone** — slim band above bench where sub-buttons rise; does not displace center pane content
- **Face-down coin treatment** — visual design, role plate, lock explainer text per future agent

**Where:** `docs/alexandria/plans/build-a-raven-onboarding/agent-bench-spec.md`.

### Phase 5 — Information Station specification

**Outcome:** A spec for the renamed kanban surface — what it shows, how items move through it, mode-toggle behavior, ambient indicator.

- **Four lanes:** Incoming · In Discussion · Awaiting Your Nod · Banked. Stone-slab headings with carved inset.
- **Item visual vocabulary** by type and state: parchment for raw, scroll for SoT, sealed envelope for approval, atomic crystal/star for banked. Color/gilding for quality grade.
- **Animation rules:** items animate across lanes on event (movement is felt but not constant). Specific moments: arrival, lane transition, banking.
- **Mode-toggle semantics:** canvas mode vs. Station mode. Full takeover, not split-pane.
- **Ambient indicator** spec: top-right of top bar; cool-gray ambient count vs. warm-⚠ attention-needed; threshold rules for which state shows when.
- **What belongs:** information flow only. Explicit list of things that don't (engineering tickets, marketing campaigns, etc.).
- **Item drill-down:** clicking an item opens its provenance drawer (per Phase 2 metadata).

**Where:** `docs/alexandria/plans/build-a-raven-onboarding/information-station-spec.md`.

### Phase 6 — Canvas configuration & cleanup

**Outcome:** A clean MVP canvas layout, with the disheveled pieces from the source-feed era removed or repurposed, and the new three-register architecture wired.

- **Top bar:** logo (home anchor) · tabs (Home / Library / Playbook / Station) · ambient station indicator
- **Center pane:** mode-switching by stage / tab / drill-down
- **Bench:** rendered per Phase 4 spec, five-seat plinth
- **Final MVP layout spec** (markdown wireframe + annotated screenshot of current spike with intended changes)
- **Removals:**
  - Floor / Priority / Timeline view toggles (vestigial source-feed era)
  - Engine Run / Product Config beats in the rail
  - The 1.x onboarding tracks in their current form
  - Old 22-area KB references
- **Renames in UI:**
  - "Atomic Library" → "The Library"
  - "Kanban" → "The Information Station"
  - "Knowledge Bank" → "Raven's Knowledge Bank" (scoped per agent)
  - "Playbook" → "Raven's Playbook" (scoped per agent)
  - Pipeline labels: swept/analyzed/elicited/atomized → Shared/Read/Discussed/Banked
- **Locked-state UI** for progressive unlocks — explainer text on every lock (microscope, Library tab, Playbook tab, face-down agents)

**Touches:** `docs/alexandria/plans/canvas-library-spike/prototype/product-library/product-library-v0.1.html` — significant deletions + reorganizations. Likely large diff, mostly removals.

### Phase 7 — Form UI primitive

**Outcome:** A reusable form component on the canvas that powers all four MVP forms.

- Pre-fill rendering (with source attribution per slot)
- In-place redline / fill behaviors
- Conflict marker UI (proposed three states: contested, stale, gap)
- Add-source-mid-form gesture (drop a file → scan runs → candidates update)
- Submit affordance with routing options (run now; run overnight deferred to post-MVP)
- Ambient grade meter on the form
- Form-internal rail (form-progress before submit; Raven-flow progress after submit)
- Provenance drawer (per Phase 2 schema) — every slot's source attribution drillable

Component is data-driven from the madlib specs (Phase 1) — adding a fifth area later means writing a fifth madlib spec, not rebuilding UI.

**Touches:** the prototype HTML (extracting the form component into its own JS/CSS module is likely worth it given the current monolith's size).

### Phase 8 — Hook protocol & canvas ↔ Raven bridge

**Outcome:** A working contract between the canvas and the Raven agent in Claude Code, implemented via `canvas-server.ts` + hooks.

- Event schema definitions (form-submit-payload, raven-status-update, conflict-update, banking-event, wake-signal)
- Submit pivot wired: canvas form submission triggers the right state in `canvas-server.ts`, which Raven's skill picks up
- Status indicator wiring: Raven's flow in the coding tool emits status updates that the Raven coin reflects (per Phase 4 state vocabulary)
- Banking event wiring: when Raven writes a source-of-truth doc, the canvas detects it, animates the bank, updates the area's status to Banked, moves the item to the *Banked* lane in the Station, and runs the unlock logic if this was the bank that crosses a threshold
- Conflict-marker updates: Raven resolves a conflict in conversation, the canvas updates the form's marker in real time
- Wake-signal: Wake button in sub-buttons sends a context-aware signal to coding tool; Raven responds with a tailored opener

**Touches:** `canvas-server.ts`, `hooks/hooks.json`, the Raven skill at `packages/alexandria-plugin/skills/raven/`, the prototype HTML.

### Phase 9 — Raven-side post-submit flow

**Outcome:** Raven's numbered flow in the coding tool that the canvas's post-submit rail mirrors.

- Update or replace `packages/alexandria-plugin/skills/raven/job-first-session.md` with build-a-Raven framing (or write a parallel `job-build-raven.md` if the old job stays for backward compat)
- Handle form-submit payloads as input
- Execute the four-step flow per submit: understanding check → conflict cleanup → targeted asks → source-of-truth landed
- Emit status updates via the hook protocol so the canvas reflects flow progress
- Write the source-of-truth doc to disk per the Phase 2 spec (including provenance frontmatter)
- Handle the no-microscope case (director skipped Stage 1, form is empty, all conversation)
- Handle the Wake signal — read canvas state, produce a context-aware opener

### Phase 10 — Unlock progression, practice cave, end-to-end validation

**Outcome:** The full MVP arc wired together and validated as a runnable demo.

- Progressive unlock chain wired: practice cave → microscope → Library tab activates on first bank → Playbook tab activates on Skeleton bank → bench's other coins remain face-down with their lock explainers
- Unlock animations (coin lighting changes, tab activations, button rises, the **hire moment** as the most theatrical beat)
- Practice cave: trim existing onboarding content to a 2–3 minute canvas-literacy intro; explicitly introduce the bench ("this is your senior squad")
- Empty-microscope path: skip to conversation cold if director gives nothing
- End-to-end demo path validation: cold start → practice cave → microscope (real material from this repo) → four forms in order → Raven flows complete → hire moment → playbook unlocked
- Capture the run as a recording or guided demo doc
- Final copy pass using outside-facing vocabulary throughout

## Parallel-Friendly Decomposition

Phases 1, 2, 3, 4, 5 are all design/content. Up to five people could write them concurrently. Phase 4 and Phase 5 are the most coordinated (they touch how the canvas's two persistent registers feel) but they're separable.

Phase 6 (canvas configuration) can start once Phase 4 + Phase 5 specs land — it implements them on the prototype HTML.

Phase 7 (form UI) needs Phase 1 madlib specs and Phase 3 grade rubric.

Phase 8 (hooks) and Phase 9 (Raven flow) develop in parallel against the agreed event schema; their integration test is the same end-to-end demo.

Phase 10 needs Phases 6–9 wired.

## Critical Decision Points

These are the moments where the plan needs a human decision before the next phase can proceed:

1. **Form granularity** (gates Phase 1) — one form per area with repeatable sub-structures, or some areas decompose into multiple sub-forms?
2. **Provenance schema** (gates Phase 2 → Phases 7, 8, 9) — exact frontmatter shape; raw-materials storage location and index format.
3. **Grade rubric shape** (gates Phase 3 → Phase 7) — letter grades, named tiers, both?
4. **Bench seat naming confirmation** (gates Phase 4 → Phase 6) — five-seat lineup as Engineering · Design · Product (Raven) · Market · Research. Confirm before visual rendering locks in.
5. **Information Station lane labels** (gates Phase 5 → Phase 6) — working set: *Incoming · In Discussion · Awaiting Your Nod · Banked*. Other shapes worth a pass.
6. **Ambient station indicator placement** (gates Phase 5 → Phase 6) — top-right of top bar (working answer); alternatives include bench-side status line. Pick one.
7. **Hook protocol schema** (gates Phase 8) — SSE-shaped (path of least resistance from spike), or something else?
8. **Old job preservation** (gates Phase 9) — rewrite `job-first-session.md` in place, or add `job-build-raven.md` alongside?
9. **Raven's Playbook contents at hire moment** (gates Phase 10) — exactly which plays unlock? Working set: JTBD Mirror, Audience Sharpener, Anti-Position Pressure, Adversarial Pre-Mortem (renames pending).
10. **What "home" actually is at MVP** (gates Phase 6) — Raven's Knowledge Bank (working answer); alternative: a synthesized dashboard.

## Risks

- **The form abstraction may not generalize.** Vision and Bets are sparse-pre-fill; Vocabulary and Skeleton are rich-pre-fill. If the same form component reads badly for both, we may need a second component class for sparse areas. Mitigation: design Vision and Vocabulary as the flanks during Phase 1; the abstraction either survives or doesn't, and we learn early.
- **The hook protocol may need more iteration than budgeted.** The bridge has to feel snappy and reliable; brittleness here kills the demo. Mitigation: keep the protocol surface narrow — start with form-submit + banking + wake events only, add status-update detail when those work end-to-end.
- **The Raven post-submit flow may be slower than the canvas expects.** Real conversation-driven flows take minutes. The canvas's rail-progress animation has to handle long-running steps gracefully — show "Raven is on Step 2" for as long as needed without feeling stuck.
- **Director attention switching between canvas and coding tool may feel awkward without clear cues.** The Raven coin's state vocabulary + status text is the only handle the canvas has to redirect attention. If it's too quiet, directors miss that Raven needs them; too loud, it's annoying. Mitigation: design the two states distinctly during Phase 4; pilot-test with a real director.
- **The bench is the most load-bearing primitive and the hardest to get right.** Get it wrong and the whole canvas feels off; get it right and everything else works. Mitigation: Phase 4 gets full design treatment before any rendering work; bench-as-home framing is preserved throughout.
- **The microscope step is doing a lot of inferred work.** Pre-fill quality is gated on how well the scan-from-microscope-material works. The current scan infrastructure in `canvas-server.ts` is reasonable for code; less proven for arbitrary pasted text, decks, or Figma links. Mitigation: scope Phase 1 pre-fill rules to what the current scan can plausibly do; explicitly mark slots as "not pre-fillable today" rather than over-promising.
- **The Information Station's mode-toggle may feel disconnected without the ambient indicator working well.** If the indicator is wrong (false alarms, missed escalations), directors will either ignore it or be irritated. Mitigation: design the threshold rules carefully in Phase 5; bias toward under-pinging early, escalate only on real action-needed states.

## Out of Scope for This Build

(Mirrors `plan.md` *Out of MVP scope* — listed here for the work-plan reader.)

- Industry dimension
- Night tokens UI and routing (though the architecture allows for it)
- Areas 5–13 (Strategy: Guardrails, Standards; Product: Experience, Surface, Forward plan; all of Learning except User research — also out of MVP)
- Living diagram on the KB (cross-plane edges with state, animations)
- Other agent unlocks (Engineering, Design, Market, Research stay face-down)
- Sam, Conan, Bridget as named UI agents (they're subsumed into Raven's plays back-of-house)
- Tiered plays beyond starter set
- Information Station scale features (filtering, swim lanes, bulk operations, search)
- Bidirectional cross-area conflict surfacing from Raven side
- Sound design (visual + motion ship; sound deferred or optional)
- Re-running a banked area with significant new material (basic support exists; polished UX deferred)

## What Stays From the Existing Spike

Most of it, actually. The reshape is fewer-things-better-placed-and-renamed, not new-build.

| Existing piece | Status in MVP |
|---|---|
| Knowledge Bank (three-plane, 13 areas) | Stays. Renamed Raven's Knowledge Bank. Pipeline labels rename. Lock logic replaced. |
| Library viewer (constellation + 2.5D folder) | Stays. Renamed The Library. Top-bar tab. Unlocks at first bank. |
| Agent bench + Raven coin | Stays. Expanded to five-seat plinth with role-named face-down coins. Coin gets the full state vocabulary. |
| Sub-button surfaces | Stay. Trio corrected: Raven's KB · Raven's Playbook · Wake Raven. |
| Document drop UI | Stays, repurposed as the microscope (Stage 1 of arc only). Universal drag-drop replaces afterward. |
| `canvas-server.ts` + hooks substrate | Stays as the bridge layer. Extended for the full event schema. |
| Practice cave (logo drop, sentence redline) | Stays, trimmed to 2–3 minutes; explicitly introduces the bench. |
| Phase rail component | Stays as a primitive; demoted from top-level navigator to form-internal progress indicator. |
| Kanban view | Stays as the surface but renamed and rebuilt: The Information Station with stone-slab lanes. |
| Engine Run / Product Config beats in the rail | Removed. |
| Floor / Priority / Timeline view toggles | Removed. |
| Old 22-area Knowledge Bank model | Removed (the three-plane reorg already shipped). |
| 1.x onboarding tracks in their current form | Removed. |

The spike has more bones in place than it looks — most of MVP is *renaming, repositioning, designing the bench properly, rebranding the kanban, building the form primitive, and wiring the bridge.*
