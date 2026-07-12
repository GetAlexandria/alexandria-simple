# Moves — Back-of-House Walk

<!--
AUTHORED, reader-facing prose for the Play-page "Inside the play" section. It
overlays the *derived* move spine (ids, doers, routes come from story.md /
workflow.fabro when those exist — never re-authored here). Like synopsis.md,
this is a deliberate simplification that points back at canon, never competing
canon.

Paint-by-numbers, one block per move:

  ### <move id — matches the node id in workflow.fabro>
  <Lead: one plain sentence — what this move is.>
  - <The beats: 2–4 bullets, in order — the concrete things the move actually
    does on the golden path. Scannable, never a yolo paragraph.>

  **↳ <Route label> — <headline>.**
  <The branch story: what happens when a run validly leaves the golden path
  here. Write one per off-path route the move has (see story.md and
  workflow.fabro), plus any honest empty/no-op landing worth naming. The label
  before the em-dash binds to the derived route so the viewer can draw the
  arrow and colour it; the colour is automatic — refuse/exit = red,
  empty/honest = blue, fix/loop = amber.>

This is a fully back-of-house play — the director never sees it run. The
deliverable is a draft product-knowledge library bundle + four reports,
handed to the front-of-house walk (EL3) for the director conversation.

Sources:
  golden path  ← prompts/<move>.md (the method), story.md (the spine) — to be
                 derived after Gate 1 approval
  branches     ← prompts/<move>.md routing, workflow.fabro edges — same
Reverse-derived from four dogfood scans at
docs/alexandria/plans/rebuilding-the-library/test-scan-{01,02-reorganized,03-studio}/.
-->

### translate_search_prior

The play turns the optional Basic Product Description into a confidence-tagged search prior.

- If no description is present, it emits no prior and the run stays source-only.
- Reads the four prose sections: `The Person`, `The Mechanism`, `The Work`, and `What It's Not`.
- Translates them into `runtime/library-search-prior.json`: domain vocabulary, unit/path/state/place leads, inferred shape with basis, high/medium/low confidence, fence, and open questions.
- Treats the result as a suspect lineup. Positive leads widen the search; only high-confidence `What It's Not` fence entries can prune.

### survey

The play reads the manifest plus the explicit scope, then picks the ~25-35 files worth reading, in order.

- Walks the file tree of every source root the manifest names — paths only, never contents.
- Records the operator-written scope first: in-scope roots/topics, explicit out-of-scope roots/topics, and boundary notes.
- Treats the manifest as the read boundary and scope as the filing boundary. The scanner does not infer scope from source or from the Basic Product Description.
- When `runtime/library-search-prior.json` exists, adds its actors, vocabulary, places, unit, and path as candidate terms/files to inspect; medium/low confidence widens the search instead of narrowing it.
- Prunes only high-confidence fence entries that came from `What It's Not` and do not conflict with the declared scope. The prior can supplement scope, never replace or widen it.
- Picks the read ladder: tier-1 cheap-and-broad (READMEs, top-level schema/registry files, governance docs, route maps) — these alone deliver ~80% of the signal per the dogfood evidence; tier-2 confirmation (selected components, command files); tier-3 sample (one or two leaf files per likely context) to verify the spoken language matches.
- Caps at 25-35 reads total. Names what it deliberately skipped.
- Writes `runtime/source-ladder.md` — the ordered list with one-line rationale per pick.

**↳ Refuse — the manifest points at nothing scannable.**
If the manifest points at an empty repo, a binary-only tree, or a single trivial file, survey writes `runtime/refusal-report.md` saying what was looked at and why no bundle can be produced, then routes `refuse` — the play exits 1. This is a designed outcome, distinct from a degraded thin bundle: refusal tests the precondition; degradation tests honesty inside it. The play never produces a tepid bundle when refusal was the right call.

### pass1_events

The Event Storming pass — surfaces past-tense Domain Events the source talks about, time-first.

- Reads tier-1 first (broadest signal), then tier-2 to confirm, then enough tier-3 to verify language.
- Uses the prior, when present, as leads to verify: an inferred pipeline means look for the central record, state field, and ordered stage loop; path entries become declared stages/advances to confirm or correct.
- Surfaces past-tense facts — "Vision Slot Drafted," "Play Banked," "Run Suspended for Review" — never present tense ("user clicks save"), never nouns ("a Play"). The Brandolini rule: events say "something meaningful happened in the domain."
- Writes `runtime/EVENTS.md` — a single time-ordered table of 20-30 events: # · the past-tense fact · what triggered it · where it lands (the file or the runtime location) · the state it lands the unit in; and names the central record (the unit of work) so the timeline reads as that unit's lifecycle.
- Surfaces deltas: a declared prior stage with no source event becomes a gap candidate; a source event with no declared prior stage is kept as an event; unresolved low-confidence prior questions become front-of-house gap threads tagged `emittingMove: translate_search_prior` (confidence low, the prior `basis` in `reason`, `sourceEvidence: []`), not asserted cards or workflow steps.
- Keeps events from substantive out-of-scope or borderline piles as suspect evidence only. They do not become the in-scope product timeline, central record, or work-thread facts for this bundle.
- Marks Hot Spots inline at the event where the docs disagreed or it had to punt to judgment, tagged by canonical thread kind (`docs_disagree` · `judgment_punt` · `polysemy` · `runtime_vs_design`). Hot Spots are not failures — they are the play's primary diagnostic value; the docs themselves are often what diverged.

**↳ Empty — no events surfaced.**
If the read passes surface no past-tense facts (the source is purely static reference material, a calculator, a pure library with no temporal narrative — Brandolini's "barrier products") pass1_events says so honestly in EVENTS.md (an explicitly empty timeline with the rationale) and continues. The downstream passes will produce a smaller bundle, and READ-COHERENCE.md will name "no temporal narrative recoverable" as the gap. The play does not invent events to please.

### pass2_carve

The carving pass — carves bounded contexts where the language changes, classifies each noun into a canonical category (keeping the architect's word as the label), proposes demotions for nouns that fail the architect's spoken vocabulary.

- Before carding, classifies each candidate pile against the declared scope. A pile must be confidently inside scope to become a context/card set.
- Suspends substantive outside-scope or borderline piles as `suspectPiles` with evidence refs and proposed disposition. Borderline is out-of-scope.
- Walks the timeline from pass1 and asks where the vocabulary shifts — that is where a context boundary lands.
- Lands the smallest part-first context set the events demand (the dogfood evidence is 6-8 contexts for a non-trivial product; never imposes a prescribed list).
- Per context: lists every noun the events name; classifies each into a canonical category by analogy to the Vocabulary asset (`Role · Surface · Entity · Component · Capability · Mechanism · Pattern · Economy · Reference`) — the category is the `type`, the architect's own word stays as `prefLabel`/`altLabels`, never as the `type`. A noun whose category is ambiguous becomes a `polysemy`/`judgment_punt` thread, not a silent pick. Derived views use the typed link `derived_from`; they are not a card type.
- Writes `runtime/contexts.md` — the bounded contexts list with one-sentence carving rationale per context, the noun catalog per context, the type assignment per noun, and explicit Hot Spots for any noun that fails the Vernon UL test.

**↳ Demotion-proposed — a noun that fails the UL test.**
A noun that isn't in the architect's spoken vocabulary — runtime-instance nouns, line-label nouns, machinery exposed as a noun — gets a Hot Spot proposing demotion to a source-evidence note or lower-level context. Crucially: never silently deleted. The director may keep it; the play's job is to flag, not rule.

**↳ Split-proposed — a noun that means two different things in two contexts.**
A noun that appears in two contexts with two meanings (DDD's textbook "meter" polysemy case — Alexandria's "Studio Board" surface-vs-state was the live one) gets a Hot Spot proposing a split with both cards drafted and a typed `related_to` link between them. Same rule: propose, never silently pick.

### pass3_altitude

The C4 pass — tags each card's altitude so the bundle obeys "don't mix levels."

- Reads the events + contexts and tags each carded noun with its altitude — `pillar` (top-of-product) · `context` (a bounded part inside a pillar) · `aggregate` (lifecycle-bearing thing with state transitions) · `component` (piece inside an aggregate, no independent lifecycle) · `value` (no identity, meaning-by-content — status enums, tag classes) · `capability` (verb, operation, gate).
- Writes `runtime/altitudes.md` — per-card altitude assignment with rationale only when the call is non-obvious.

**↳ Ambiguous — two altitudes are both honest.**
If a card sits genuinely between two altitudes (the line between "context" and "aggregate" is often soft), the play marks the card as a Hot Spot with both candidate altitudes named — never picks silently. The director rules at EL3.

### emit_bundle

The mechanical scaffold — writes the bundle to disk: cards, the operational reports, and the JSON sidecars. Honestly mostly mechanical, with judgment-residual in the body sentences.

- Folder layout is fixed: `<output_path>/<context>/<Type>/<Type> - <Name>.md`, and **the path IS the card's identity** (frontmatter-v2, library-migration ruling 2026-07-08): the context is the directory, the type and name are the filename — no `type:`, `prefLabel:`, or `context:` frontmatter. Each card opens with v2 frontmatter (`plane`, `status`, `altitude` — plus `confidence` when the walk can honestly grade it), then `altLabels`, `evidence:` (the grounding refs — part of the claim, formerly `source_evidence`), a `links:` block keyed by `contains`/`conforms_to`/`operates_on`/`produces`/`related_to`/`derived_from`, and (for a `Pattern` or staged-loop `Mechanism`) a `flow:` of ordered stages — then a required `## WHAT` / `## WHERE` / `## HOW` body naming each linked card inline as `[[Type - Name]]` in `## HOW`. No `proposed_by:` and no `rulings:` — creation provenance and decisions are Ledger events, never frontmatter. A card with no `## WHAT` loads as a missing-material gap, not a card. Path-lint rules are load-bearing: no context directory may use a reserved name (`runtime`; `_index` is the one blessed special context), and every `Type - Name` stem must be globally unique across contexts (wikilinks resolve by stem alone).
- Writes bodies in **product English** (#595): the body names the product in plain language and the frontmatter holds the machine — zero file paths, code identifiers, route names, or raw event indices in `## WHAT`/`## WHERE`/`## HOW` (they live in `evidence:`/frontmatter, the meaning stays in product words). The `product-english-card-bodies` skill is the standard; `check-machine-language.mjs` is the deterministic floor.
- Writes the `_index` keystone story — one card at `_index/<Type> - <Name>.md` (`context: _index`, `altitude: keystone`, `plane: product`) whose body `[[wikilinks]]` name all and only the card-bearing containers, so the #546 keystone gate `check_bundle` runs has something coherent to pass.
- Writes `library-draft.json` — the draft manifest: `{"schemaVersion": "product-card.v1", "draftOf": "<product>", "playRunId": "<run id>"}`. A draft bundle is a manifest-carrying QA artifact (the Builder reads it via `bundlePath`); only the live library is config-identified and carries no manifest. The bundle root carries no stray markdown: `EVENTS.md` and scratch stay under `runtime/`, and there is no top-level `README.md` (navigation folds into `READ-COHERENCE.md`) — the loader reads every other top-level `.md` as a card.
- Assembles `STAGE-2-BRIEF.md` by tier (naming · process · runtime · values · implementation · architect-only — the Studio scan's six-tier shape) from every Hot Spot tagged `director-only` plus every default-when-no-answer-key question.
- Writes `HOT-SPOTS.md` as the roll-up of every inline Hot Spot for easy scan.
- Writes `READ-COHERENCE.md` as the play's honest self-assessment: what a stranger would understand, what they wouldn't, three named reservations, "Hot Spots that are likely real product flaws" callout.
- Writes the central record's lifecycle as a `flow:` block on its aggregate card — ordered stages, each with `activity`, `doer`, `stateAfter`, and `refs:` naming real cards — reconstructed from `EVENTS.md` + the per-event state, instead of discarding the timeline into the report. The lifecycle lives on the card whose lifecycle it is; there is no `workflows.json` sidecar (retired 2026-07-08, the Workflow tab projects from aggregate cards).
- Opens each Hot Spot and gap as a **`library.thread_opened` Ledger event, appended through `ax`** (never by writing event-log bytes) — each carrying a `family` (`gap`/`hot_spot`), a canonical `kind`, `concerns` naming real cards, and its **notepad provenance** — a director-register `question` (distinct from the builder-register `reason`), the `emittingMove` that raised it, and `sourceEvidence` (`file:line`). The Ledger is git-backed shared history: the walk runs on a branch, its events belong to that branch, and they merge with the work (union driver). A draft's threads are real history even if the draft never lands — agents, especially Raven, read in-progress drafts from the record. There is no `threads.json` sidecar (retired 2026-07-08; the Notepad projects from events, and the front-of-house walk resolves threads with events too).
- For every `suspectPiles` entry, opens exactly one `out_of_scope_suspect` thread event using `family: "hot_spot"`, a stable id from the normalized pile name, context concern, evidence refs, and proposed disposition. It writes no card files and no container directory for that pile.
- Opens unresolved low-confidence prior questions as thread events (tagged `emittingMove: translate_search_prior`, `confidence: low`, `sourceEvidence: []`) plus one `missing_context` search-frame thread event from the prior's domain + fence — the "ask when we can't log it from source" half the front-of-house triage reads as inferences-to-confirm; declared-but-absent stages and present-but-undeclared events also surface as threads rather than facts.
- **Writes every file with its file tools** — a reply that names files but writes none is a failed run, per the play-wide output-discipline clause.

**↳ Three strikes — the repair loop gives up.**
`emit_bundle` is the node the `check_bundle → REPAIR` bounce lands on. If it has been entered three times on the same defect (`node_visit_count >= 3`), the escalation edge fires and the run exits 1 via `acp_failed` rather than looping forever. Distinct from an ACP failure: this is the designed loop cap, made loud.

### check_bundle

The cold-reader self-consistency gate — a blind re-read of the bundle that decides PASS, REPAIR, or FREEZE.

- Opens the bundle fresh, at `fidelity=truncate` — no prior-stage summary contaminates the read.
- Runs two deterministic gates from the repo root before PASS: `bun studio/tools/check-keystone.ts <output_path>` (the keystone story must name every card-bearing container, and every story `[[link]]` must resolve to one) and `node studio/tools/check-machine-language.mjs <output_path>` (#595 — no card body may carry a file path, code identifier, route name, or raw event index; a machine-token body routes REPAIR).
- Walks the bundle as a stranger and checks, in order: every typed-link target resolves to a card that exists; every card path parses as `<context>/<Type>/<Type> - <Name>.md` with `plane` and `status` frontmatter, no context directory uses a reserved name (`runtime`), and no `Type - Name` stem repeats across contexts (the path lint, run mechanically — the same rules the shipped loader enforces); every event in EVENTS.md names a noun that has a card or is honestly marked "not yet carded"; every Hot Spot points at a real card or section; every Stage-2 question references a real artifact; every `out_of_scope_suspect` names a substantive pile that has no card file and no container directory; every `library.thread_opened` event the walk appended carries its notepad provenance (a `question` distinct from `reason`, an `emittingMove`, and `sourceEvidence`) and `concerns` that resolve; altitudes are internally consistent within a context; the central record's `flow:` covers the work — every stage names a carved context with resolvable `refs:`, and no event that advances the unit maps to no stage; and any `runtime/library-search-prior.json` lead is confirmed, corrected, rejected, or threaded (the prior stays under `runtime/`, never copied to the bundle root).
- Writes `runtime/check-verdict.md` with the routing JSON last in the response: `PASS` (the bundle is coherent), `REPAIR` (small fixes needed, listed), or `FREEZE` (structurally unsalvageable).

**↳ PASS — the bundle ships.**
When everything checks, the play exits cleanly. The bundle at `<output_path>/` is the deliverable; EL3 (the front-of-house walk) picks it up.

**↳ REPAIR — bounce back to emit_bundle with the fix list.**
When small defects appear (broken typed-link targets, missing cross-refs, an unreferenced Stage-2 question), check_bundle writes the list and bounces back to emit_bundle. Three-strikes applies: after three visits to emit_bundle on the same defect, the escalation edge fires and the run exits 1 via `acp_failed`. The play does not loop forever trying to fix the same thing.

**↳ FREEZE — the bundle is structurally unsalvageable.**
If the upstream passes produced nothing usable (sources read produced no events; carve produced no contexts; the bundle has no cards), check_bundle freezes and the play exits 1. Distinct from refusal: refusal is "the input was unscannable;" freeze is "the output is incoherent." Both are honest failure outcomes; neither produces a thin bundle.

<!--
acp_failed is the failure sink, not a golden-path move — it has no `###` block
of its own (the derived spine narrates the golden path; check-moves treats it as
exempt infrastructure). Its job is narrated where the run reaches it: the plain
`ACP failed` fallback on every work node (exempt, undrawn), survey's **↳ Refuse**,
emit_bundle's **↳ Three strikes**, and check_bundle's **↳ FREEZE**. It runs as a
command node with no prompt and exits 1 so a failed run is never mistaken for a
degraded success.
-->

