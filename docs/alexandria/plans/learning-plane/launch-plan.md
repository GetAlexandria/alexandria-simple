# Learning-plane launch plan — parallel workstreams (2026-07-07)

All rulings are final (design-log.md, D1–D10 + evidence lifecycle + boundary rule). The
elicitation session (director's past/future out of his head) is the critical path we
CANNOT parallelize — everything below prepares for it or fixes the library around it.

House rules for every workstream: separate branch off `main`, one independent PR each,
non-stacked, no auto-merge — the director QAs each by hand. App-code goes through the
Fabro factory (issue → factory → PR), never hand-authored. Library content and docs are
agent work in-repo. Refer to PRs/issues by their real GitHub numbers.

## Dependency map

```
W0 contract freeze (Claude, in-session)
 ├─→ A4 template/docs fix (sonnet)
 └─→ A5 scaffolding cards (opus)
F1 WHY gate issue (opus author → factory) ──→ A3 WHY fill pass (sonnet, AFTER F1 merges)
F2a type registration issue (opus author → factory)   [independent]
F2b vitals + learning-WHEN issue (opus author → factory, after F2a files] [independent of F1]
F3 altitude code hygiene issue (opus author → factory) [independent]
A1 altitude map (opus)      [independent — content, no card edits]
A2 walk tool (sonnet)       [independent]
```

Launch today in parallel: W0 (me) · F1/F2a/F2b/F3 issue-authoring · A1 · A2.
Then: A4 + A5 after W0; A3 after F1 merges.

---

## W0 — Freeze the card contract (owner: Claude, this session)

`docs/alexandria/plans/learning-plane/card-contract.md`, mirroring
strategy-plane-rebuild/card-contract.md: folder convention (research/experiments/
measurement shelves, Type subfolders), frontmatter per type (Research: confidence, origin,
kind incl. distilled, grade; Experiment: kind probe|experiment, grade, state, expected,
stop, guardrails, milestone, gate, verdict; Measure: definition/target/trend vitals, input
links), body contracts (WHAT/WHY/WHERE/HOW + universal biography-WHEN + explicit-N/A
rule + D10 proof clause for keystones + arc-page shape), the boundary rule, stop-freeze
rule, linking conventions (prose wikilinks; produces/derived_from frontmatter). Design
freeze stays in-here — not delegated.

---

## F1 — Factory issue: WHY joins the required-sections gate

**Agent: opus. Prompt:**

> In /docs-repo alexandria-internal, use the `alexandria-dev-factory-issue-authoring`
> skill to author a GitHub issue (do NOT implement) for making `## WHY` a required card
> section. Ground truth: `docs/alexandria/plans/learning-plane/design-log.md` section
> "Library modernization wave" + `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md`
> (mechanism decisions + skip rules) + the shipped WHEN-slice precedent
> `docs/alexandria/plans/633-when-horizon/plan.md`.
> Frozen decisions to encode: (1) WHY becomes a required fill section for product-plane
> cards (add "WHY" to `LibraryCatalogRequiredSection`/`REQUIRED_FILL_SECTIONS`, thread the
> viewer missingSections allowlists + pms-viewer, mirroring how #663 added WHEN).
> (2) Exemptions: cards with `status: deprecated`, cards in context `_index`, and
> altitude-keystone cards (keystones carry a proof clause in WHAT per design-log D10, not
> a WHY) are NOT flagged. (3) Heading canon = standalone `## WHY` placed between WHAT and
> WHERE. (4) Gate-first: the issue must NOT include editing the ~57 gap cards — gaps
> surface through the existing fill-readiness/Notepad burndown; content fill is a separate
> later pass. Write observable "what will be true" acceptance + a verification matrix
> (card lacking WHY flagged; deprecated/_index/keystone not flagged; the ~70 existing
> WHY cards still pass; pms-viewer parity). Output the issue body to
> `.context/issues/f1-why-gate.md` for director review — do not file it.

## F2a — Factory issue: register Experiment + Measure as card types

**Agent: opus. Prompt:**

> In alexandria-internal, use the `alexandria-dev-factory-issue-authoring` skill to author
> (not implement) a GitHub issue registering two new atomic-card categories, mirroring how
> PR #662 made Bet/Principle first-class. Ground truth:
> `docs/alexandria/plans/learning-plane/design-log.md` (consolidated D1: the type roster
> is Research · Experiment · Measure; 11→13 buckets) and
> `packages/ax/src/domain/atomic-card-categories.ts` +
> `packages/viewer/src/components/library/engine-view-model.ts` +
> `packages/viewer/src/components/library/EmptyLibraryView.tsx` (the #662 change shape).
> Frozen decisions: add `experiment` (cardType `Experiment`) and `measure` (cardType
> `Measure`) to `ATOMIC_CARD_CATEGORY_IDS`/`ATOMIC_CARD_CATEGORIES`, ordered adjacent to
> `research` (renumber subsequent orders; folderNames `experiments`, `measures`); add
> `ENGINE_TYPE_ICON_SET` palette entries + `EmptyLibraryView` glyphs for both (distinct
> icons, like Bet "B" / Principle "§"); update the engine Research descriptor comment
> ("Learning plane unbuilt") since the plane is now being built. No vitals parsing in this
> slice (that is a sibling issue). Verification: cards with `type: Experiment|Measure`
> load, render with their palette entries, and group correctly in the engine view; the
> viewer test-script whitelist gets any new test file appended (known trap). Output to
> `.context/issues/f2a-learning-types.md` for director review — do not file.

## F2b — Factory issue: learning vitals parsing + WHEN-required-for-learning

**Agent: opus. Prompt:**

> In alexandria-internal, use the `alexandria-dev-factory-issue-authoring` skill to author
> (not implement) a GitHub issue for parsing the learning-plane card vitals into the
> library catalog, mirroring the Bet-vitals slice (#628 shape; see `risks` parsing in
> `packages/ax/src/domain/library-catalog.ts` as the list-of-{tag,note} precedent).
> Ground truth: `docs/alexandria/plans/learning-plane/design-log.md` (amended D3 vitals +
> card-contract.md once frozen). Frozen decisions: (1) Experiment fields — `kind`,
> `grade`, `state`, `expected`, `milestone`, `gate`, `verdict` as tolerant free strings
> (never closed literals — same reasoning as cost/strength); `stop:` and `guardrails:` as
> {tag, note} lists mirroring the `risks` parser. (2) Research fields — `origin`, `kind`,
> `grade` free strings. (3) Measure fields — `target`, `trend` free strings. (4) WHEN
> becomes a required fill section for ALL `plane: learning` cards regardless of horizon
> (design-log D3: biography-WHEN; product-plane behavior unchanged in this slice).
> (5) Malformed vitals go to the soft metadataIssues channel, never hard rejects.
> Verification matrix: each field round-trips scan→catalog; malformed stop entries warn;
> learning card missing WHEN flagged, product card without horizon:future not flagged.
> Output to `.context/issues/f2b-learning-vitals.md` — do not file.

## F3 — Factory issue: altitude code hygiene

**Agent: opus (small). Prompt:**

> In alexandria-internal, use the `alexandria-dev-factory-issue-authoring` skill to author
> (not implement) a small GitHub issue for altitude-axis code hygiene. Ground truth:
> `docs/alexandria/plans/learning-plane/design-log.md` section "Altitude-tuning pass —
> concrete findings". Frozen decisions: (1) `LEAD_ALTITUDE_RANK` in
> `packages/ax/src/domain/library-catalog-story.ts` learns the two missing values
> (`keystone` above `pillar`; `context` between `capability` and `component`) so lead
> selection ranks all seven live altitude words. (2) A soft vocabulary check: an altitude
> value outside the seven ruled words surfaces as a metadataIssue (warn, never reject —
> altitude stays a free string by design). No card content changes in this slice.
> Verification: keystone card outranks pillar for lead selection; unknown altitude warns;
> existing cards unaffected. Output to `.context/issues/f3-altitude-hygiene.md` — do not file.

## A1 — Altitude content map (the tuning pass, decision document)

**Agent: opus (judgment-heavy). Prompt:**

> In alexandria-internal, produce `docs/alexandria/plans/learning-plane/altitude-map.md` —
> a decision document in the style of
> `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md` (single source for a
> later apply pass; you make NO edits to any card). Ground truth for the rules:
> `docs/alexandria/plans/learning-plane/design-log.md` — the D4 RULED entry (operational
> tests per altitude) and the "Altitude-tuning pass — concrete findings" section; pillar's
> ruled grammar is "headline of its shelf" (relative). Audit every card under
> `docs/alexandria/library/` carrying an `altitude:` value: apply the
> operational test for its current value; propose keep/change with a one-sentence reason.
> Known cases to adjudicate explicitly: deprecated `Concept - AI Colleague` at pillar;
> `Surface - AX CLI` at pillar; the three corporate Bets at pillar vs the taxonomy
> ruling's keystone (shipped practice = keystone is `_index`-only — recommend, don't
> decide); canvas + knowledge-organization "feel one level down" per the director.
> Output format: one table per context (card | current | proposed | test applied |
> reason), then a "Decisions for the director" section with genuine judgment calls
> phrased as full-sentence questions with recommendation + alternatives, then a mechanical
> bucket (obvious fixes needing no ruling). Do not touch any file except the new map.

## A2 — Elicitation walk tool

**Agent: sonnet. Prompt:**

> In alexandria-internal, build the learning-plane elicitation walk tool: a single
> self-contained `docs/alexandria/plans/learning-plane/learning-plane-walk.html`.
> Design precedent: the strategy build's taxonomy-walk (Cormorant serif, cream/gold,
> chunk-cards, dot-nav) — find the cached source under
> `docs/alexandria/plans/library-word-legibility/` (taxonomy-walk-source.html) or its
> `_archive` sibling; copy that visual language exactly. Content source:
> `docs/alexandria/plans/learning-plane/design-log.md` — build the chunks from the
> "Elicitation session plan (the walk)" section, UPDATED by the rulings that postdate it:
> chunk order = (1) the ruled model recap (three types, three shelves, biography-WHEN,
> evidence lifecycle — display only, already ruled), (2) the arc ladder FIRST (name the
> releases/arcs and each arc's featured intent — the Marvel reframe moved this to the
> front), (3) Past: the four corpora walks (system-builders / cognition / high-tempo
> operations / NASA-navy coordination — 3-6 load-bearing lessons each, which bets each
> informed), (4) Present: in-flight inventory with called stopping points (time/reps/
> spend/signal), (5) Future per bet: standing Measures first (golden metric + input
> family from `docs/alexandria/plans/strategy-plane-rebuild/design-log.md` Tested-by
> slices, lines ~271/288/310), then bounded Experiments only where a designed test exists
> (boundary rule: does it end by design?), plus per-Bet-risk de-risking probes,
> (6) harvest ("what did we learn building all this that we didn't set out to learn?").
> Every chunk shows the fields the answers will fill (card-contract vitals) as blank
> slots. Serve instructions in a comment at the top (python http.server, port 8914).
> Touch nothing but the new HTML file.

## A3 — WHY content fill (HOLD until F1 merges)

**Agent: sonnet. Prompt (pre-staged):**

> In alexandria-internal, run the WHY fill pass on the product library at
> `docs/alexandria/library/`. The WHY required-section gate has merged
> (issue F1 / its PR#) — the fill-readiness burndown lists the gap cards. Rules, all
> frozen: content is sourced ONLY from
> `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md` ("Product cards → WHY
> sources" — writers pick from the card's listed row only; drop a tie you can't ground in
> the card's own body; never invent ties); standalone `## WHY` heading between WHAT and
> WHERE; 2-4 sentences, keystone voice, vary phrasing (never copy a sentence between
> cards); wikilinks are per-line, never wrapped across lines; skip deprecated/_index/
> keystone cards (exempt by the gate). Order: the 6 confirmed cards first (one PR),
> then the ~44 stubs (a second PR). Gates before each PR: `studio/tools/
> check-machine-language.mjs`, the story lint, and the 2,400-char folded-story cap on any
> context lead you touch. Separate branch off main per PR, no auto-merge.

## A4 — Template + docs alignment (after W0)

**Agent: sonnet. Prompt:**

> In alexandria-internal, align the authoring docs with today's rulings (ground truth:
> `docs/alexandria/plans/learning-plane/design-log.md` D3/D10/Marvel sections +
> `docs/alexandria/plans/learning-plane/card-contract.md`). Changes:
> (1) `docs/alexandria/plans/rebuilding-the-library/card-story-template.md` — document the
> standalone `## WHY` heading as canon (the "so that {why}" mad-lib fold is stale; ~70
> cards + the parser already use the heading); rewrite "The WHEN slot" to the
> biography-WHEN contract (three tenses; explicit-N/A rule: "N/A — no past yet" is
> complete, silence is not; planning-when subsumed; mechanism-when stays in HOW).
> (2) Add the D10 keystone proof-clause rule where keystone WHAT guidance lives.
> One PR, branch off main, markdown lint clean. Change nothing else.

## A5 — Learning-plane scaffolding cards (after W0)

**Agent: opus (exemplar-quality bar). Prompt:**

> In alexandria-internal, scaffold the learning plane's pre-elicitation cards under
> `docs/alexandria/library/`, per the frozen contract
> `docs/alexandria/plans/learning-plane/card-contract.md` and design-log rulings. Build
> ONLY what does not require the director's memories: (1) `_index/Concept - Learning.md`
> keystone (the loop story; D10 proof clause citing the golden metric card); (2) the three
> shelf lead cards (research / experiments / measurement — what each activity is and how
> its members hang together); (3) the golden metric Measure card + its input-measure
> family (definitions from `docs/alexandria/plans/strategy-plane-rebuild/design-log.md`
> Tested-by slices: hours-transferred + needed-but-undone; switching/consolidation;
> adoption/substitution + attribution) — golden metric at pillar, inputs at aggregate, no
> corporate markers (product-homed, ruled); (4) two seed Research cards already fully
> documented: the talking-agent demo (kind: result — it retired the
> Colleague-in-the-Meeting feasibility risk; grade: demo) and The Approach's
> self-nomination (kind: observation, from `knowledge-organization/Pattern - The
> Approach.md`). All cards `status: stub`, `proposed_by: director`, `source_evidence` =
> the design log; every card carries biography-WHEN (explicit-N/A where a tense is empty);
> bodies prose-only, de-machined. EXEMPLAR-FIRST: write ONE card per type, run
> `studio/tools/check-machine-language.mjs` + the story lint, then STOP and open a draft
> PR for director review before writing the rest. Everything the elicitation will supply
> (corpus lessons, experiments, arcs, stop rules) is out of scope — do not invent it.

---

## Explicitly NOT launched (waits on the director)

- The elicitation session itself (the walk) — the plane's content.
- Applying altitude-map.md (waits on his rulings over A1's decision section).
- The strategy keystone WHAT proof-clause edit (waits on the golden metric card existing
  — folded into the evidence-map linking pass post-elicitation).
- Structured sockets (`tests`/`informs`/`embodied_by`) — deferred factory issue, after
  cards exist and the socket need is proven.
- The play capture (learning-plane-walk → make-a-play) — after the walk has run once.
