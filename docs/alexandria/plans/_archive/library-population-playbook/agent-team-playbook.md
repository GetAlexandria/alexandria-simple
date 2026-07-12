# Agent Team Playbook — building the next twelve Knowledge Bank modules

A two-page handoff. Read top-to-bottom; pick up directly at Nouns.

## What we proved this slice

Vision (1 of 12 KB subjects) shipped end-to-end. The director opens
`/canvasdemo`, walks 1.1–1.3 with Raven, lands at 1.4, hands sources
to Raven through a panel on the form, Raven wakes via the
existing Stop-hook architecture and drafts all 9 slots, director
walks the form, advances sliders to Approved, hits Bank — server
atomizes into the library, kanban card moves, next subject unlocks.

The shape we used works. Now we run it eleven more times.

## The five stages, per module

Every module follows the same flow. Don't start at stage 3 — the
first two stages are where the leverage lives.

1. **Research.** Read the source-of-truth design doc for this subject:
   the 1-page template, the deep-guidance, the worked examples, and
   the dogfooded draft (Alexandria's own filled-in version). If any
   of these don't exist yet, write them BEFORE touching the canvas.
   The form renders FROM the template — not vice versa.
2. **Elicit.** From the design doc, extract: prompts, schema lines,
   what good looks like per slot, where Raven asks clarifying
   questions vs proposes a draft. This is what Raven's sub-skill
   teaches her. If the design doc is fuzzy, the elicitation will
   be fuzzy, and the form will paper over the fuzziness.
3. **Artifact.** Build the standalone form first (Phase 1.B + 1.C
   in the Vision plan). HTML + CSS + JS in three modular files,
   `--<module>-` CSS variable prefix to keep tokens scoped, schema
   line above the prompt, slider/notch/scratch per slot, persists
   to localStorage. URL works in isolation before any canvas wiring.
4. **Wire.** Canvas-server endpoints for the new module's state shape
   (`/api/canvas/<module>/...` + dedicated SSE pool). New `<module>-embed.js`
   that mounts the form in `#tfs-body` and unmounts cleanly. New
   sub-skill (`skills/raven/<module>-drafting.md`) and a new Beat in
   `skills/canvasdemo/SKILL.md`. New wake events in
   `step-events.jsonl` so the existing watcher classifier picks them
   up. Module registry (`modules.js`) gets the new subject; library
   sync handles the new atomized card shape.
5. **Dogfood.** Run `/canvasdemo` end-to-end against a real product
   (Hearthfire, lifebuild-site, anything you're actually building).
   The bugs surface in 90 seconds of real use that wouldn't appear
   in any review. Fix the surfaces; don't rationalize the friction.

The chicken-and-egg you flagged dissolves if you do these in order.
The artifact can't precede the elicitation; the elicitation can't
precede the research. Dogfooding is the loop closer — using the
module to build the NEXT module's source material is how each one
earns its keep.

## The team — separation of concerns

Five roles. Some are subagents you dispatch; one is you; one is
Raven herself; one is the director.

- **The Surveyor (Sonnet, Explore agent).** Reads existing
  source-of-truth docs, existing prototype code, existing skill
  files. Returns a short brief: what patterns to copy, what idioms
  to honor, what's already solved, what's missing. Always dispatch
  in parallel with your own design work — the Surveyor charts the
  terrain while you draft the building. Used four times in Vision;
  worth using even more in modules where the design doc is denser.
- **The Architect (you, in the Opus seat).** Makes the load-bearing
  calls. Ratifies decisions WITH THE DIRECTOR up front — slider
  semantics, slot count, persistence shape, bank gate, default
  states. Writes the integration code (vision-embed.js style: ~200
  lines of glue between form and canvas). Owns the slice's coherence
  end-to-end. Does NOT write skill prose (delegate to Scribe).
- **The Scribe (Sonnet, general-purpose).** Writes Raven sub-skill
  prose. The brief must include: voice (read canvasdemo + the
  vendored Raven skills to absorb register), exact endpoint shapes
  Raven calls, failure modes to cover, the per-slot rule set, and
  what NOT to do. Scribe output is ~200–350 lines of skill markdown.
  Used once for `vision-drafting.md`; use again for each new
  module's drafting + elicitation sub-skills.
- **The Mechanic (Sonnet, general-purpose).** Does the mechanical
  refactors that aren't worth Opus time: file extractions (split a
  monolith into HTML + CSS + JS), variable renames across two files,
  search-and-replace patterns. Used once mid-Vision to split
  `vision-builder.html`. The Mechanic CAN corrupt curly quotes; have
  it validate with `node --check` before declaring done.
- **The Pilot (the director).** Dogfoods the module by running it
  against a real product. Surfaces the bugs that no review can find.
  The Pilot is also the source-of-truth for "what would actually be
  useful here" — when ratifying open questions, the Architect asks
  the Pilot.

Raven herself is not on this list — she's what we're BUILDING the
modules for. She uses them; she doesn't design them. (When you're
on a slice where she needs to read or write something the existing
skills don't cover, the Scribe writes the new skill.)

## The dogfooding loop

Vision banked = a Vision card lands in
`docs/alexandria/library/strategy/`. That card is now a source the
NEXT module (Vocabulary) can read when drafting product nouns —
because the nouns Hearthfire uses are partially implied by the
Vision Hearthfire just banked. Each module produces source material
for the next. By module 12 (whatever ends up last), the library has
the whole product mind externalized, and every subsequent module
draws on every prior one.

This is also why you dogfood with REAL products, not test fixtures.
Test fixtures stay test fixtures; real products feed the loop.

---

## The universal Review & Approve ritual (every bar)

Every bar in the Knowledge Bank produces a single readable
**source-of-truth document** that the director reviews, shapes via
redlines, and approves. This is the closing beat of every bar — not
just Product Walk. The ritual is load-bearing because it operationalizes
Alexandria's **chain of command** principle: Raven coaches, drafts, and
notes concerns; the director always calls done.

The shape, across every bar:

1. **Raven drafts a synthesis** — single readable doc, in the director's
   register where possible, with inferences explicitly marked.
2. **Director reads cold and redlines** — specific corrections,
   directional shifts, vocabulary swaps, scope cuts.
3. **Raven absorbs each redline in three moves** — confirms the
   correction in one line; applies it; asks about downstream
   implications across the doc.
4. **Director re-reviews** — at least one more pass is normal.
5. **Director says approved** — explicit verbal signal required. Status
   flips from *Draft* to **Approved**, timestamp + director name logged,
   downstream prefill routes to dependent bars.

If Raven thinks the synthesis is dangerously incomplete and the
director approves anyway, she logs concerns in the doc's *"Open
questions Raven has"* block. The doc still approves. Concerns become
inputs to downstream bars' first review.

What this means for module design:

- Every bar's 1-page-template includes a **Review & Approve phase**
  as its closing section.
- Every bar's deep-guidance includes Raven's **review-mode posture**
  (defend structure, absorb substance, ask about downstream impact).
- Every bar's examples include at least one **worked redline example**.
- Every bar's surface renders a **review state** distinct from the
  elicitation state, with the artifact rendered for inline director
  reaction.
- Every banked artifact carries an **approval block** at the top:
  status (Draft / In review / Approved), timestamp, director name,
  brief redline trail.

Product Walk's design package (`product-walk/`) is the working
exemplar for this pattern. Subsequent bars copy the shape.

---

## Pickup at Nouns (next slug)

The natural next module after Vision is **Vocabulary** — the product's
real nouns and their relationships. In the canvas, it's the second
KB subject in the Strategy plane.

### Start here

Read in this order:

1. `docs/alexandria/plans/library-population-playbook/plan.md` —
   product-level plan. Should name Vocabulary and what it covers.
2. `docs/alexandria/plans/library-population-playbook/vocabulary/`
   — currently doesn't exist. **First task: create it, with the same
   shape as `vision/`: `1-page-template.md`, `deep-guidance.md`,
   `examples.md`, `draft-vocabulary.md`** (Alexandria's own nouns,
   dogfooded). Without these four files, do not start the artifact.
3. `docs/alexandria/plans/canvas-library-spike/prototype/scripts/canvas-server.ts`
   — there's an existing `runDemoCodebaseScan` + `/api/demo/codebase-scan`
   endpoint from an earlier prototype. It scans a path and emits
   noun candidates into a stream. Decide whether to reuse, replace,
   or extend.
4. `prototype/skills/raven/canvas-shaping.md` — the old noun-shaping
   sub-skill from the build-a-Raven era. Read for pattern memory;
   don't ship it as-is.
5. `prototype/skills/raven/vision-drafting.md` — your scaffold for
   the new `vocabulary-drafting.md`. The new "When a source is a
   repo or directory" section is especially relevant — Nouns leans
   on code reading more than Vision did.

### Open questions to ratify before code

Don't start the artifact until the Architect has the director's
nod on these:

- **What IS a noun?** A user-facing concept (Vision, Bets)? An
  internal product object (`module`, `subject`)? Both, separated?
  This drives the form shape.
- **What's the interaction?** The director mentioned "word Tetris"
  — what's that concretely? Drag-and-drop name proposals into
  categorized slots? A two-column accept/reject of Raven-suggested
  nouns? Define before building.
- **Storage shape.** Vision stored 9 fixed slots. Vocabulary is
  unbounded — N nouns. Schema: `{ nouns: [{ id, name, type,
  definition, references[], notch, scratch }] }`?
- **Bank atomization.** Vision banked as one Vision Statement card.
  Vocabulary banks as N cards (one per noun)? Or one Vocabulary
  card with N entries? The Vision-style "one card per module" was
  a Phase 1 simplification — Vocabulary may legitimately want N.
- **Source-of-truth for proposals.** Raven proposes nouns from
  reading code. Director accepts/rejects/edits. Where do proposals
  live? Reuse `proposals/<step>.jsonl`?
- **Kanban card label.** "Vocabulary.md" feels off. Name TBD.

### Where the Sonnet agents pay off most for Nouns

Three dispatch templates worth pre-writing:

- **Surveyor — codebase-scan pattern audit.** Read the existing
  `runDemoCodebaseScan` + `canvas-shaping.md` + the codebase-scan
  HTML surface. Return a brief on what's reusable, what's
  obsolete, and what shape of noun extraction it produces. ~300 words.
- **Surveyor — lifebuild-site agent team study.** Read
  `/Users/danvers/conductor/repos/lifebuild-site/.claude/agents/{zelda,ghostwriter,grepzilla2,larry-moleman,quenton-quince}.md`.
  Return a short brief on the separation-of-concerns pattern they
  use — what makes each agent's brain narrow, what file structure
  supports them, what makes the team scale. Apply the lessons here.
- **Scribe — vocabulary-drafting sub-skill.** AFTER the
  `vocabulary/1-page-template.md` exists. Brief includes: read
  vision-drafting.md as scaffold, target Glob/Grep-heavy code
  exploration (Vocabulary needs it more than Vision did), output
  the new endpoints Raven POSTs to.

### Do-not list (lessons from Vision)

- **Don't start with the form.** The four design docs ARE the work.
  If you skip them, you'll rebuild the form three times.
- **Don't duplicate state client-side.** Server is source of truth.
  `modules.js` tracks kanban status only — content lives in the
  module's server state file.
- **Don't gold-plate the elicitation.** Raven's sub-skill should
  cover the common case + a list of failure modes. ~300 lines max.
- **Don't bypass the wake architecture.** Extend `canvas-watcher.sh`
  with new event types; don't invent a parallel signal.
- **Don't forget `mkdirSync` on every state-dir write.** `/canvasdemo`'s
  startup wipes them. Self-heal or be stuck.

### Definition of done for Nouns

- Director runs `/canvasdemo`, walks to 1.4, banks Vision, sees Bets
  unlock — wait, Bets was a placeholder name for "next subject." If
  Vocabulary is what comes next, update modules.js's `SUBJECT_ORDER`.
- Clicks Vocabulary in the KB → noun-extraction module unrolls in
  the canvas.
- Hands the repo path + product URL via Sources → Raven wakes,
  reads code (Glob/Read/Grep), proposes a set of nouns with
  definitions + cross-references.
- Director walks the proposals, accepts/edits/rejects, advances
  each noun's slider to Approved.
- Banks the module → server atomizes the approved nouns into
  individual library cards under the right territory/subfolder.
- Demo flow runs against Hearthfire end-to-end.

When that's all true: ship the slice, log decisions in the
methodology log, open the next slice for whichever subject comes
after Vocabulary.
