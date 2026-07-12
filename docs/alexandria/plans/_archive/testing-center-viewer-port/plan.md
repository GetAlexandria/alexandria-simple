# Play Testing — viewer port plan

Porting **Play Testing** — a play page's testing center (formerly "Fixtures &
Evals") — into the `viewer-next` play surface. Canon: PR #259,
`studio/plays/research/testing/` + `TESTING.md`. Design source of truth:
`play-testing-mockup.html` beside this plan (a throwaway HTML mockup, iterated
heavily this branch — open it in a browser; see §6 for the locked decisions it
carries).

The job is a **clean, faithful port**, and the bar for "clean" is precise: at
every point on screen it must be obvious **where the information came from, what
is source, and what is derived from it**. The whole plan hangs off that.

Branch: `danversfleury/testing-center-viewer-port`. Sibling in-flight: PR #260
(Play Walk redesign) — point at branches if this starts before merge.

## 1. The faithful-port mandate (non-negotiable)

**The recurring failure this prevents:** porting studio content into the viewer
and *changing key content* — paraphrasing, altering names, drifting data.

The fix is **faithfulness by construction**: the viewer **renders from source
files; it never owns or re-authors content.** The risk taxonomy, the
source-pattern library, the measurement policy, the per-play plans, and the
results all live as **files**; the UI is a **projection** over them. Nothing is
hardcoded or paraphrased into React. The mockup hardcodes its data *because it is
a mockup*; the port reads the files. Same rule the play page already states:
*"Records stay files; the viewer renders, it does not own them."* §7 adds a
no-drift test that fails the build if a literal canon string ever leaks into the
render code.

## 2. The data model — render from the play's own files

Alexandria's discipline: **the library *describes and reflects* what is real — it
does not hold the technical source of truth.** Prompts, code, fixtures, canonical
data live in the product/studio as real files; library cards *describe* them and
point at them via `source:`. We honour that here, both ways:

- **Play Testing renders from the play's own files** — its eval plan, results,
  and fixtures under `studio/plays/<slug>/` — the same "records stay files; the
  viewer renders them" pattern the play page already uses. It does **not** render
  from library cards, and we do **not** push the testing source of truth into the
  library.
- **The library's role is to *describe* Play Testing** (the system, the
  methodology), `source:` pointing at the studio files — a reflection of reality,
  complementary, and *not* the render source. It can lag the build.

### Bottom-up, not top-down
We have **no base of evals yet**, so there is no shared spine to front-load. The
order is: build **one play's testing really well** from its own files → build a
second → **abstract the shared "master center" (recurring risks, patterns) from
what actually proves out** → only then does the library describe it (§4, §9). We
ship real value per play instead of guessing an ontology up front.

### The two-field discipline (carried in the files)
A data file already separates its **stable key** (a risk id) from its **display
text** (the plain prose). So "plain web-viewer words" vs "the data model" was
never a real conflict — they're different columns of the same row:

| layer | lives in | example |
|---|---|---|
| **key** | the risk id in the file | `RE-2` |
| **display** | the plain text beside it | "People-pleasing — goes along with a nudge just to seem helpful" |

Web words win for display; ids stay stable so a shared spine can be abstracted
later without a rename.

## 3. Source → derived → display (the legibility contract)

The thing the port must make obvious. Every on-screen element traces to one row:

| on screen | layer | origin | how |
|---|---|---|---|
| risk name + plain description | **display** | the play's testing file (risk text) | rendered verbatim |
| family / tier / `source:` provenance | **source** | the play's testing file (metadata) | read verbatim |
| which risks apply to this play + planned tests | **source** | the play's `risk-map.md` | read verbatim |
| a test's `scope`, `type`, `pattern` ref | **source** | `risk-map.md` (pattern hardens to a shared ref later) | read verbatim |
| raw `n` / pass-count per test | **source** | `risk-map.md` (MVP) / eval run (later) | read verbatim |
| per-test label (passing/needs/provisional/det) | **derived** | n·rate·CI + the measurement policy (code) | pure fn `measurement.ts` |
| per-scope fill-circle (Node/Seam/Whole) | **derived** | the tests at that scope | pure fn (scope rollup) |
| row **Status** (covered/partial/gap) | **derived** | the row's **binding (weakest) test** | pure fn (never pooled) |
| tab tally, Preflight gate lock/unlock | **derived** | rows / the 5 checks | pure fn |

**Rule:** source is authored in files and read verbatim; derived is computed at
render by pure, unit-tested functions and **never stored**; display is the plain
prose in the files. If a value isn't clearly one of the three, the port is wrong.

## 4. The master center — abstracted bottom-up, not built first

The play-invariant core (recurring risks, shared patterns, the measurement
policy) is **not authored up front.** With no base of evals yet, there is nothing
proven to centralise — front-loading it would be guessing at an ontology. The
order:

1. **Build one play's Play Testing really well** — its risks, tests, and results
   live in that play's `studio/plays/<slug>/` files; the surface renders from them.
2. **Build a second play the same way.**
3. **Abstract the master center from the overlap** — the risks and patterns that
   recur across plays become a shared spine (a studio reference file, ids stable
   from day one so nothing renames). Only now is there something real to share.
4. **Then the library *describes* it** — a card explaining Play Testing and its
   taxonomy, `source:` pointing at the studio files. Description, not render
   source; it can lag the build.

**Mission control** — a cross-play overview — is the *last* thing, abstracted
from several real per-play instances, never a prerequisite. The measurement
policy is the one piece that is shared from the start, because it's *code*
(`measurement.ts`), with `TESTING.md` as its written description.

`RISKS.md` / `TESTING.md` stay as today: the studio canon the exemplar play draws
on and the eventual seed for the abstracted spine — not recast as cards now.

## 5. The per-play record (instance tuning)

**Decision (closes the DESIGN-NOTES open question): one dedicated
`studio/plays/<slug>/risk-map.md` per play.** Frontmatter alone can't express
*open* rows (a planned-but-unbuilt test has no fixture), so a dedicated file is
required. It references each risk **by id** (per-play now; a shared spine later).

```markdown
---
slug: frame-the-problem-next
spine: research/testing/   # the studio canon these risk ids come from
---

## Coverage — which risks apply   (state ∈ covered | partial | gap | n/a)
| risk | state | where it's tested / why |
|---|---|---|
| RE-2 | covered | golden · bait |
| ADV-1 | gap | no injection plant yet |
| ADV-3 | n/a | plain-text output, never run as code |
| RE-4 | covered | the disguise test |   <!-- bespoke risk, filed in-family under a canonical prefix -->

## Eval plan — tests per risk
| risk | test | scope | type | verdict | n | pass | pattern |
|---|---|---|---|---|---|---|---|
| RE-2 | golden · bait | whole | red-team | passing | 30 | 30 | baited-golden |
| RE-2 | sycophancy minimal-pair | whole | red-team | missing | – | – | xstest-contrast |
```

- **`state` = `covered / partial / gap / n/a`** (canon, §6 vocabulary).
- **`scope` ∈ `node | seam | whole`** — *not universal*: behavioral risks span
  all three; **Systemic risks are seam-by-definition** (node/whole render as
  `n/a` dashes, not empty/untested). The record only carries the scopes that
  apply.
- **`type` ∈ `example | metamorphic | statistical | red-team`**.
- **`pattern`** names a reusable pattern — free text for now; it hardens into a
  shared reference once the master center is abstracted (§4).
- **`n` / `pass`** are the only *measured* inputs; everything labelled/rolled-up
  is derived (§3). MVP: hand-authored. Later: written by an eval run; the render
  layer is unchanged.

## 6. The surface — three tabs as a projection (locked design)

The mockup (`play-testing-mockup.html`, beside this plan) is **layout-only — its
words are real, but every datum is empty/zero (`0/N · not yet measured`); it is
NOT a data source.** A prior version hardcoded fabricated stats and stale fixture
names (a retired "Knot", an invented "perf-deck"); that cruft is removed and a
banner now says so. The **real** starting position is two committed files: the
play's `studio/plays/frame-the-problem-next/risk-map.md` (real risks → real
fixtures, results empty) and `AUTHORING-EVALS.md` beside this plan (how to fill
the gaps with measured data). The port renders from the risk-map, never the
mockup. These design decisions are recorded here so they bind the port regardless.

### The tabs are a cost / dependency ladder
Left→right is **free-static → free-reference-free → needs-test-cases**; the
**fixtures boundary** falls between Diagnostics and Coverage and is the real
seam. The arrows mean *gates / informs*, not a uniform flow.

1. **Preflight** — *does it run?* Static, deterministic, free. **Blocks** the
   other two until green. **Five distinct rows**, not one — Builds cleanly ·
   Every step reachable · Pointers are valid · Inputs are supplied · No dead ends
   — each a deterministic check (n=1, pass/fail), at the failure-mode altitude.
   No measurement column; the band rolls them up to the gate.
2. **Diagnostics** — *where is it fragile?* Reference-free system health, run on
   any play with no test cases; **informs** where to spend. (The old
   "Needs-fixtures" half moved out — see Coverage.)
3. **Coverage** — *what's covered?* The gold/test-case tier, two colour-coded
   families: **Behavioral** (Reasoning/Input/Output/Adversarial — gold/orange)
   and **Systemic** (seam-level wiring correctness: handoffs, routing, loop
   regression — violet; was "Needs this play's fixtures"). Systemic is **last**.

### Status is the headline; everything else is detail that adds up to it
- **One shared fill-circle language:** `● covered · ◐ partial · ○ gap · – n/a`.
  Node/Seam/Whole each show a small fill-circle (that scope's rollup); **Status**
  is the *same icon, larger* — the row's binding constraint. The scopes visibly
  "add up to" the Status.
- **No number on the row line.** `n · rate · CI` lives **only per-test in the
  drawer**. The binding constraint is shown *qualitatively* by Status — never an
  aggregate number that could be mistaken for a pooled one (strongest form of the
  no-pool rule).
- **No per-row status words** (a key carries `covered/partial/gap`); **no
  column-header label** on the first column; **category headline > row title** in
  weight.

### Colour & language
gold = behavioral categories · orange = Adversarial · violet =
Diagnostics/Systemic · teal = the Preflight gate. `needs` dots are donuts
(shape, not hue alone — colour-blind safe). Violet marks *band headers* only,
not row text. **All on-screen prose is plain, non-technical English** (from the
play's files); fixture nicknames and `source:` citations stay technical in the
drawer detail.

## 7. Viewer modules & endpoints

Reuse the play-page machinery; add a projection.

| module | role |
|---|---|
| `studio/evalPlan.ts` | parse a play's `risk-map.md` → its risks, planned tests, results. |
| `studio/measurement.ts` | the measurement policy as code: per-test label + the binding-constraint rollup. Pure, unit-tested. |
| `studio/PlayTesting.tsx` | the projection: render the play's eval plan + results as the three tabs. Holds **zero** canon strings. Mounts via `PlayPage.tsx`'s `SectionView`. |

**No new endpoints for the MVP** — a play's files are already served by
`/api/studio/file` + `/records`. Keeping interpretation viewer-side keeps the
parsers plain and testable with the files as fixtures. (The shared-spine parser
arrives only when §4's master center is abstracted.)

## 8. Verification — the no-drift guarantee

After porting, **diff the rendered surface against the source files; any wording
change is a bug, not a style choice.**

1. **No-drift test:** parse a play's `risk-map.md` → render-to-text → assert every
   rendered name, description, and `source:` provenance **byte-matches** the file.
   A grep-guard asserts no canon string is literal in the `.tsx`/`.ts`.
2. **Round-trip test:** re-serialize the parsed file back to its tables and diff
   against the original — a mismatch is a parser bug.
3. **Measurement tests:** the `TESTING.md` worked numbers (√k bars, rule-of-three,
   deterministic exemption, binding-constraint-not-pooled) as golden cases.
4. **Source/derived audit:** a test asserting nothing in the *derived* column of
   §3 is ever read from a file, and nothing in the *source* column is ever
   computed — the legibility contract, enforced.

## 9. Scope & slices (separate PRs, off `main`, not stacked)

Per the maintainer QA convention (independent, hand-QA'd PRs), and bottom-up per
§4:

1. **One play's data + parsers** — author `<slug>/risk-map.md` for the exemplar
   (`frame-the-problem-next`, whose coverage register already exists) from its own
   files; ship `evalPlan.ts` + `measurement.ts` + the §8 tests. No UI.
2. **One play's surface** — `PlayTesting.tsx` + the `PlayPage.tsx` mount; the
   three tabs and the locked design (§6), rendering that play's file.
3. **A second play** — author its `risk-map.md`; confirm the surface generalises
   with zero per-play code.
4. **Abstract the shared spine** — pull the risks/patterns that recurred into a
   studio reference file (ids stable); add the cross-play comparable view.
5. **Deferrable** — the library's description of Play Testing; mission control
   (cross-play overview); live compute (Preflight from `fabro validate`, Generic
   Diagnostics from `workflow.fabro`, results from eval runs). Each adds or swaps
   a *source*; the render layer is unchanged.

## 10. Open decisions & risks

**Open**
- **When to abstract the shared spine** — after how many well-built plays does a
  "recurring risk" earn a centralised reference? (Lean: 2–3.)
- **What the library should describe about Play Testing, and when** — a
  description card with `source:` pointing at the studio files, authored once the
  spine stabilises, not before.
- **DESIGN-NOTES.md** — treat as superseded scaffolding (cross-link as origin),
  not core reference; this plan is the reference.

**Risks**
- **Markdown parsing brittleness** — mitigated by fixed schemas + the round-trip
  test; a malformed table fails loudly, never renders a guess.
- **Two-source divergence** if results ever live outside the file — keep `n`/
  `pass` *in* the `risk-map.md` until an eval-run generator owns them.
- **Hand-authored MVP data going stale** vs the live play — the deferrable
  compute slices are the fix; until then the surface shows authored intent, which
  is the canon's current honesty bar.
```
