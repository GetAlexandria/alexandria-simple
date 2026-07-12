# Learning-plane card contract (2026-07-07)

> Revised to product-card.v2 conventions (2026-07-07); v1 original merged in #671.

The shape every learning-plane card follows, so the build passes the librarian+editor
sweep. Grounded in the ruled design log (D1–D10, evidence lifecycle, boundary rule), the
strategy-plane contract precedent, and the `product-card.v2` contract
(`docs/alexandria/plans/library-migration/plan.md` §2.2). All frontmatter fields below
parse today (free strings / lists); viewer surfacing follows in factory slices F2a/F2b.

Revised 2026-07-08 with the elicitation walk's ratified vocabulary: Evidence Strength's
final rung words, the `arc`/`role` field rename (was `milestone`/`gate`), and the
desk-research `distilled` grounding exception — see `design-log.md` § "Elicitation walk —
results" and `elicitation-results.md` for the session that produced them. Revised again
2026-07-08 per the arcs ruling: arcs join the plane as a fourth context (`arcs`, type
`Arc`), superseding this contract's original `_index` arc-page placement — see "Arc
page" below.

## Identity and folder convention

Shelf paths are written root-relative: `<shelf>/<Type>/<Type - Name>.md`. The library
root was `docs/alexandria/sweeps/alexandria-product` then and is now
`docs/alexandria/library` when the in-flight library migration's move lands.

**Identity derives from the path** (product-card.v2): the directory carries the shelf
(context) and the type; the filename stem `<Type - Name>` is the card's address — it is
what every `[[Type - Name]]` wikilink resolves against. There is no `type:`,
`prefLabel:`, or `context:` in frontmatter. Because wikilinks resolve by stem alone,
without the shelf segment, **`Type - Name` stems must be globally unique across
contexts**.

- **Shelves** (activity contexts, type-pure): `research` (type `Research`) ·
  `experiments` (type `Experiment`) · `measures` (type `Measure`) · `arcs`
  (type `Arc`) — the fourth shelf, added by director ruling 2026-07-08.
- The plane keystone lives in `_index`.
- Every card: `plane: learning`, now listed in the product-card.v2 plane vocabulary
  alongside `product` and `strategy`.

## The boundary rule (which card do I reach for?)

**Does it end by design?** Pre-committed stop → Experiment. Persists indefinitely,
reading → Measure. One bounded look with no metric → probe-kind Experiment with a
time/reps stop. (Worked example: the 10-pilot discovery ask = probe, reps-stop of ten.)

## Evidence Strength (the `grade` vital)

`grade` rates the **stage** the evidence was produced at — never what it found; it is
verdict-neutral. Four rungs, each buying a different kind of claim: **reported** (say-level
— desk research, signal, self-report) < **demonstrated** (do-level, but on us or a
constructed instrument — dogfooding, a spike) < **piloted** (do-level, on an independent,
representative-enough subject — real users who are not us, still small-N) < **at-scale**
(do-level, at market breadth). The demo→pilot line is the one authors misjudge most: it
turns on whether the subject is independent of the team AND representative of who the claim
is about, not on N alone (a hundred survey reads of our own team is still `demonstrated`,
never `piloted`). An `at-scale` test can still fail — the rung says how rigorously it was
run, not that it confirmed anything; what it found is `verdict` (Experiment only).

Two rules keep `grade` from being misused as a proxy for truth:

- **Rule A — grade is per-claim.** Attach evidence to the specific Bet-risk it addresses;
  the same study can be near-`at-scale` for one claim and only `demonstrated` for another.
- **Rule B — N is not a rung.** A larger sample sharpens confidence within a rung (an
  Experiment's within-rung note) or crosses a Measure's statistical-power threshold (which
  emits a Research card) — it never promotes the rung itself.

A Measure never carries `grade` — it reads continuously and has no stage to rate. When a
Measure's reading crosses statistical power and is notable, it emits a Research card (kind:
result, origin: run-result); that offspring is where a stage and a verdict attach.

The confidence a Bet-risk carries in its own `confidence` vital is a **rollup** across all
the evidence attached to it, each piece weighted by its stage — it is Bet `confidence`, not
a new field on evidence cards, and not the same thing as any one card's `grade`.

## Research card

Path: `research/Research/Research - <Name>.md`.

Frontmatter: `plane: learning` · `status` (stub|confirmed|deprecated; ruled 2026-07-09,
see design-log) · `confidence` (strength of the evidence itself) · `kind`
(**founding-lesson** — generated a bet | **result** — measured one | **observation**
— open, not yet settled; may point at nothing | **distilled** — cross-cutting principle,
MUST wikilink ≥1 value-altitude case card, **except** when `origin: desk-research` and no
case card yet exists anywhere in the library — then the `evidence` citations satisfy the
grounding the rule is really after; add the case wikilink forward, once one exists, rather
than leave a dangling link or invent a case) · `origin` (desk-research | run-result |
signal | emerged-from-build) · `grade` (**Evidence Strength** — see above; reported |
demonstrated | piloted | at-scale) · `evidence` · `altitude` (**value** for
lessons/cases/observations/distilled principles; **aggregate** for corpus lead cards — a
research program opens, runs, closes, reopens) · `arc` / `role` (optional — see "Arc
tagging" below).

Body: `## WHAT` the lesson (or open observation), plainly · `## WHY` optional — what
holding this evidence buys · `## WHERE` provenance (corpus / [[Experiment]] / signal) and
what it informs ([[Bet]]s, product cards) · `## WHEN` biography (see below) · `## HOW`
the evidence and its limits — what was observed, how strong (name the evidence type:
say/do, lab/field), what it does NOT establish. A **denying result** must state the
falsified condition and the re-test trigger ("don't retry until Z changes") in one
sentence — the "we already tried that" record.

## Experiment card

Path: `experiments/Experiment/Experiment - <Name>.md`.

Frontmatter: `plane: learning` · `status` · `kind` (**probe** — disposable,
parallel-safe, no metric required, timebox via stop | **experiment** — instrumented) ·
`grade` (**Evidence Strength** — see above; reported | demonstrated | piloted |
at-scale) · `state` (planned | running | called) · `horizon` (`future` until started;
absent once running) · `expected` (the prediction, written BEFORE running — surprise is
the signal) · `stop:` list of `{tag: time|reps|spend|signal, note}` · `guardrails:` list
of `{tag, note}` — what must not get worse regardless of outcome (optional at probe
weight) · `arc` (which arc this card belongs to) · `role` (**headline** — this card is in
the arc's heart, the arc exists for it | **supporting** — present for this arc but not
load-bearing to its story; see "Arc tagging" below) · `verdict` (confirms | denies | mixed
| inconclusive; only on called) · `altitude: aggregate` · `evidence` ·
`links: { derived_from: [Bet - …] }` (the bet whose question it operationalizes; also a
predecessor experiment when this is a replication or a follow-up to an inconclusive run) ·
`links: { produces: [Research - …] }` once called.

Body: `## WHAT` the question — the Bet restated as the hypothesis it secretly is ·
`## WHY` what answering it buys the bet · `## WHERE` tests [[Bet - …]]; runs in
[[product cards]] · `## WHEN` biography · `## HOW` instrument and metric (cite
[[Measure]]s in OEC/guardrail roles rather than embedding), the stopping rule in prose
and when it was committed relative to state, what confirm/deny would look like; verdict
narrated here on call, naming the evidence type.

**Hard rules:** `expected` and `stop` are populated at the planned→running transition and
FROZEN thereafter (the transition's Ledger event is the pre-registration timestamp); the
one sanctioned early stop is a guardrail breach. An invalid instrument never reaches
`called` — the card cycles back and re-runs. Inconclusive does NOT touch the bet's
confidence.

## Measure card

Path: `measures/Measure/Measure - <Name>.md`.

Frontmatter: `plane: learning` · `status` · `target` (free string) · `trend` (free
string, updated by living-updates) · `altitude` (**aggregate**; the golden metric =
**pillar**, apex of its input family, NO corporate markers — it is the product's metric) ·
`evidence` · `arc` / `role` (optional — see "Arc tagging" below) ·
`links: { contains: [input Measures] }` on a composite;
`links: { derived_from: [Bet - …] }` for the bet it watches. A Measure never carries
`grade` (see "Evidence Strength" above) — it reads continuously and has no stage to rate.

Body: `## WHAT` the defined quantity and its meaning · `## WHY` why this needs continuous
watching — what the bet(s) it feeds are staking on the reading, not merely which bets they
are · `## WHERE` what product surfaces it reads from (wikilinks); what cites it (experiments,
keystones) · `## WHEN` biography (instrumented when; reading since; planned extensions) ·
`## HOW` how it is measured, its limits. Readings are Ledger/telemetry, never card
content; a **significant** reading becomes a Research card (kind: result, origin:
run-result).

## Arc page (arc card)

One card per arc: `arcs/Arc/Arc - <arc name>.md` — arcs live in the `arcs` context as
type `Arc`, a fourth shelf at the same level as `research`/`experiments`/`measures`
(director ruling 2026-07-08; supersedes both the original `_index` placement above and
the interim `_index/Entity - <arc name>.md` note from the type rename pass). An arc does
not nest inside the other shelves; it tells a release story ABOUT a cross-shelf slice of
their members, the way a keystone narrates contexts, at the little-picture scale.
Frontmatter: `plane: learning` · `arc: <its own key>` · `altitude: aggregate` (an arc
opens, runs, and closes — the corpus-lead rationale; the shelf's own lead card carries
`pillar`, like the other three shelf leads). Body (see the WHAT/WHY/HOW rule under
"Universal body rules" for how these three divide the work generally): `## WHAT` the
plan — concretely what the arc does, with a D10 proof clause where a metric exists ·
`## WHY` the thesis — what the arc is trying to prove or achieve, stated as a claim a
reader should not have to chase wikilinks to reconstruct (not merely which [[Bet]]s it
advances — that attribution is already carried structurally, by the mad-lib below and by
`role` on the Bet's own card) · `## WHEN` biography (planned / in-flight /
shipped-into-canon) · `## HOW` the mechanism that makes WHAT happen in service of WHY —
the **arc mad-lib**, written as wikilinks: [[Bet - …]] (strategy) →
[[product instantiation]] (product) → [[evidence en route]] (learning), plus whatever
composition detail matters — and a narration that names and wikilinks every member card
the arc spans (experiments, measures, research), told as story, never kept as a list or
a task tracker. Membership still self-declares via the tagging below — the `arc:` tag on
the member is the record; the arc card's prose is the telling — and the lead-coverage
expectation on learning contexts applies to the arcs shelf like any other: the shelf
lead's HOW narrates and wikilinks every arc card on the shelf.

## Arc tagging (any card, any plane)

`arc` and `role` are not learning-plane-exclusive fields. An arc's heart is cross-plane by
definition — a Bet, a product instantiation, and a piece of evidence can all be that arc's
headliners at once — so any card in any plane can wear them. This contract defines the
vocabulary via the learning-plane cards that use it first; wiring `arc`/`role` into the
strategy-plane and product-plane card contracts is a follow-on factory issue
(`design-log.md` § Loose ends), not scoped here.

- **`role: headline`** is the per-arc override on altitude, both directions: it promotes a
  low-altitude card into the arc's heart when the arc is specifically about it, and demotes
  a high-altitude card to `supporting` when it is merely present for that arc. A card can
  headline one arc and support another — role is never global to the card.
- Membership is never listed on the arc page; a card declares its own `arc` + `role`.

## Provenance (product-card.v2: grounding on the card, decisions in the ledger)

- `evidence:` (renamed from `source_evidence:`) stays on the card — grounding is part of
  the claim; an agent reading the raw folder must see what a card stands on without a
  ledger join.
- No `proposed_by:` — creation provenance lives on the card's creation ledger event.
- No `rulings:` frontmatter — a ruling is a decision that happened; decisions live in
  the ledger, and the card is the result of rulings, not their record.

## Universal body rules

1. **Biography-WHEN on every learning card**: one narration, three tenses — what happened
   (the layers), what stands, what's intended. **Explicit-N/A rule**: an empty tense is
   written ("N/A — planned, no past yet"), never silent. Mechanism-when (triggers) stays
   in HOW. Same question evolving → layer in place; evolved question → new card +
   `derived_from`.
2. **WHAT/WHY/HOW divide the work generally, not only on arc pages**: **WHAT states the
   plan** — what is being done. **WHY states the thesis** — what it is trying to prove or
   achieve, in prose a reader should not have to chase wikilinks to reconstruct. **HOW
   states the mechanism** that makes WHAT happen in service of WHY ("we're going to do
   this, to achieve this, and to make that happen, we're doing it this way"). WHY is
   never a bare attribution link (e.g. "which Bet this advances") when that attribution
   is already carried structurally elsewhere (a `derived_from` link, a mad-lib slot, a
   `role` tag) — if a section's content is fully reconstructable from a link elsewhere,
   the content is misplaced, not redundant-and-removable; move it to whichever section
   actually owns that job.
3. **Keystone proof clause (D10)**: a keystone-level WHAT states what the thing is AND
   its proof — concise, falsifiable, preferably a golden-metric wikilink.
4. Prose-only bodies, de-machined (check-machine-language.mjs); structured data in
   frontmatter; wikilinks per-line, never wrapped; no dangling links — name a card in
   prose until its target exists.
5. `status` is curation state, never experiment state. Invalidation-by-drift is
   `status: deprecated` + WHEN narrating the stratigraphy (ruled 2026-07-09);
   deprecating evidence triggers a re-read of the Bets it fed (retraction propagates).
6. Gates before any PR: check-machine-language.mjs · story lint · 2,400-char folded-story
   cap on leads · markdown lint.

## Open contract items

1. Whether `measures`' shelf lead card and the golden metric card are distinct (ruled
   yes — the lead narrates the shelf; the metric is a member) — revisit only if the shelf
   stays tiny.
2. Measure in-flight maturity: does "instrumented? reading at power?" need its own vital
   (e.g. `instrumented` / `powered`), or does it live in `trend` prose? Parked until a
   Measure card is actually authored (`design-log.md` § Evidence Strength).
Resolved 2026-07-08 (design-log.md § "Arc #1 ruled + WHAT/WHY/HOW clarified") and dropped
from this list: the arc-page shape question — no collapse, WHAT and WHY had swapped jobs
rather than one going missing. Also resolved 2026-07-08 and dropped: the arc-page type
question — arcs are their own type `Arc` in their own `arcs` context (see "Arc page"
above; supersedes the interim `Entity`-in-`_index` ruling this list previously carried).
Also resolved 2026-07-09 (design-log.md § "Status vocabulary ruled") and dropped: the
invalidation-status-vs-v2 ruling — `deprecated` survives into the v2 status vocabulary,
`draft` is struck from the paper line, and D3's invalidation-by-drift lever stands as
specified.

## Vitals fields (kept; additive to v2)

The learning-plane vitals — `kind` / `grade` / `state` / `expected` / `stop` /
`guardrails` / `arc` / `role` / `verdict` on Experiments; `kind` / `origin` / `grade` on
Research; `target` / `trend` on Measures — are not in the v2 core contract but are
additive to it and are kept in full. Viewer surfacing of these fields is tracked in issue
#675.
