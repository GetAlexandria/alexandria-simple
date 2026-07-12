# Testing Center — design notes (open questions, not yet built)

> **Superseded — origin record, not the current reference.** This captured the
> design session that produced the model. The build is now specified in
> `docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md` (the card-graph data
> model, the source→derived→display contract, the three-tab ladder, and the
> master/instance split), and the prototype evolved past several notes below
> (e.g. Diagnostics is now reference-free only; the gold-fixture half moved into a
> **Coverage** tab beside the behavioral risks). Read this for *why*; read the
> plan for *what we're building*.

Captured 2026-06-15 from a long design session. **Nothing here is integrated** —
the canon lives in this folder + `../TESTING.md`; the UI exists only as a
throwaway mockup (`.context/mockups/`, gitignored). This is the handoff for the
eventual build.

## The model we converged on

The play page gains a **Play Testing** surface — **three tabs**, in flow:

1. **Preflight** — *does it run?* The build-validity **gate** (parses, reachable,
   targets resolve, inputs bind, no dead-ends). Static; **blocks** the other two
   tabs until green.
2. **Diagnostics** — *where is it fragile?* A systems health-check **derived from
   `workflow.fabro`**, split into **Generic** (runs on ANY play, reference-free,
   no fixtures → finds hotspots) and **Needs-fixtures** (correctness: did the
   *right* thing pass the seam/branch). Internal axis = which connection (seams /
   loops / branches / trajectory).
3. **Coverage** — *what behaviors are covered?* The per-node failure classes
   **Reasoning · Input · Output · Adversarial**, each test scoped **Node / Seam /
   Whole** (Whole first; finer only to localize), measured against a per-play
   **eval plan**.

Two more dimensions on a *test* (orthogonal to category):

- **Scope** — how much chain it grabs (node / seam / whole).
- **Type** — the shape of evidence: *example* (fixture + rubric oracle) ·
  *metamorphic* (invariance / contrast, no oracle) · *statistical* (pass^k) ·
  *red-team* (adversarial). Type drives *how you author it*.

## Sequence / priority / relationships (the operating logic)

- **BLOCKS (hard):** Build validity → everything that runs. Gold fixtures →
  correctness (the play-specific diagnostics + correctness evals).
- **INFORMS (soft):** Generic diagnostics → where to spend fixture budget;
  a Whole-run failure → add finer scope to localize; a node failure → explains a
  seam failure (fix the node first); likelihood × cost → ordering.
- **Loop:** Diagnostics ⇄ Coverage (hotspots pull evals; evals unlock the
  play-specific diagnostics). Full detail in `../TESTING.md`.

## Measurement (locked)

`passing / needs work / provisional` are **derived from a number**: per test,
**n · pass rate · CI** (or mean ± CI for scored rubrics). **Never pool across
tests** — a risk-area's headline is the *binding (weakest) test*, never a sum.
Deterministic checks are exempt (n=1). Run-count policy + the √k / rule-of-three
math are canon in `../TESTING.md`.

## Open architectural questions (the Director's dichotomy)

The session surfaced a clean split that the build will need to honor — **two
modes of work, probably two surfaces and two hats for the Director:**

1. **Template / philosophy mode (global).** Editing the *testing canon itself*:
   the risk taxonomy (`RISKS.md`), the source-pattern library (the "shaped-from"
   examples — Torres disguise test, Mom Test grading, the kit patterns, the
   research-grounded ones), the measurement policy, the diagnostic set. This is a
   **master testing area**, not per-play. Changing it changes how *every* play is
   tested.
2. **Instance / tuning mode (per-play).** Authoring a specific play's **eval
   plan** — which canonical risks apply, the planned tests per risk (shaped from
   the central patterns), scope, type — and its fixtures + results.

**Implication: the canonical example/source patterns are controlled centrally**
(in the master area) and *pulled per risk-area* into a play's eval plan — not
re-authored per play. A fix to a source pattern should flag every play that
borrowed it (provenance/fix-propagation).

### Proposed data model (three layers)

- **Global canon** (master testing area, `studio/plays/research/testing/` +
  `TESTING.md`): risk taxonomy, source-pattern library, measurement + run-count
  policy, the generic diagnostic suite. Play-invariant.
- **Per-play eval plan** (under `studio/plays/<slug>/`, e.g. a `risk-map.md`):
  which risks apply, planned tests per risk (each referencing a central pattern),
  scope, type, target n. The denominator for coverage. *Findings* are per-play;
  *rules* come from the global canon.
- **Per-test results**: n · pass rate · CI (or mean ± CI), per (fixture + eval).
  The measured layer.

### Where source material lives (decided + open)

- **Decided:** the testing-center *research + canon* lives here
  (`studio/plays/research/testing/`) — it's testing-wide, not owned by any play.
- **Open:** the exact home + schema of the **per-play eval plan** (a `risk-map.md`
  vs case-README frontmatter — note frontmatter can't express *open* rows, which
  have no fixture, so a dedicated per-play plan file is likely needed); and how
  the central source-pattern library is structured so plays can *reference* a
  pattern (for fix-propagation), not copy it.

## Status

All of the above is **design + canon only**. The live viewer (`viewer-next`
Play Testing nav section, task #7) is **not built**. The build plan —
eval-plan schema/home (a per-play `risk-map.md`), the `/api/studio/*` shape
(reuse `file` + `records`, no new endpoints), and how the three tabs render
*canon × per-play plan × results* — is now specified in
`docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md`. The rollup
vocabulary is decided: **covered / partial / gap** (clearer than the former
`retired / residual / open`), and this canon (`RISKS.md`, `grounding.md`) has
been updated to match.
