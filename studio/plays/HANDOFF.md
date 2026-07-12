# Session-start package — play writing

You are joining the Raven play-writing workstream as the orchestrating agent.
This page is the package: read it, then the four documents it points at, in
order. Everything else is discoverable from those. Do not re-derive what is
already decided; the decisions below carry their provenance.

**Your session ends with the close-out.** Read `CLOSEOUT.md` (this
directory) now, at the start — it defines what the end of your session owes:
recorded state matching actual state, this package refreshed, and a cold
launch test before you stop. Sessions that skip it leave the next agent
launching on stale ground.

## Standing ruling — startup fit (2026-06-12)

The full source canon was audited against the actual audience
(`AUDIT-2026-06-12-source-canon.md` — the provenance anchor). Four rulings
landed the same day and are scribed into the process docs: founder-facing
canon supplies play skeletons (method-body/vendor sources contribute single
mechanisms at most); every brief designs at the **startup floor** (the
minimum artifact a five-person team would tolerate — enterprise-maximal
versions go to §8); six plays were pulled from the golden path and Board
(parked in registry.js, recorded in `PARKING-LOT.md`); and the Mom Test is
the standing evidence bar wherever a play grades customer evidence. The
golden path is now: rungs 1→2→3→4, inputs 2b/2c/2f, stretch 0/3b.

## Read in order

1. **`README.md`** (this directory) — the play-writing loop: who does what,
   the two Director gates, the status ladder, and the rules with the failure
   that earned each one. This is the process; it is enshrined, not advisory.
2. **The viewer Studio catalog** — the golden-path chain and live filing
   (`ax start viewer`, then `/studio?tab=catalog`; the data lives in
   `registry.js`, the single source of truth it renders from). The demo
   spine is Feature Request → Build Plan, four core rungs, stretch rungs
   only after the core is proven.
3. **The exemplar: `frame-the-problem/`** — rung 1, end to end. Open its
   play page or read the files: `brief.md` (a complete,
   hardened, Gate-1-approved design, with dated amendment sections §9–§10),
   `hardening.md` (what fresh eyes caught), `prompt.md` (the monolith-era
   deployable — frozen history since the 2026-06-12 reshape, still the
   prompt-craft exemplar, carrying a good/bad example gallery),
   `research/grounding.md`
   (cited canon + how the rest routes to future plays), `dry-runs/` (the
   golden/refusal/empty-brief/re-run runs, failures preserved verbatim, with
   the graded read-out), and `fixtures/advanced/` (the hard case: a
   Needle/Knot/Storm factored test — answer key, ten graded runs, its own
   read-out with the fix matrix). **The failures are the curriculum** — read
   both read-outs before writing anything.
4. **`TEMPLATE-brief.md`** — the Director's instrument. Play #2 starts as a
   conversation that fills this, one section at a time, one question at a time.
5. **The rulebooks** (added to this list 2026-06-12, Director-ruled — a
   cold agent following only items 1–4 missed them): `PROJECTION.md`
   (move graph → Fabro, the Derive rulebook), `AUTHORING.md` (node
   prompts, the A–E lint spec), `TESTING.md` (fixtures, factory runs,
   grading), `RUNTIME.md` (the play↔runtime contract: launch, ledger
   events, the non-blocking human-feedback loop, banking — ported from the
   shipped Raven Vision power-up). Read before doing that kind of work; skim
   regardless.

## The missing exemplar (known gap)

The package this session lacked — and the most important thing a future
session can have — is **an approved play successfully converted into a Fabro
workflow**. None exists yet. When Frame the Problem is banked and converted,
link the pair here (play brief + prompt → `.fabro` graph) as THE canonical
example. Until then, the frame-the-problem workshop is the canonical example
of the *writing* process only; the conversion leg is unproven.

*(2026-06-12, the Fabro reshape: closing this gap is now Slice 3 of the
Studio → Fabro plan — the frame-the-problem-next carve runs the whole
new ladder end to end. Link the exemplar pair here when it registers.)*

**UPDATE — PROMOTED & RE-ARCHITECTED (2026-06-18):** the carve was twice
superseded and is now the canonical play. (1) It was **re-architected** from the
9-move pipeline into the 4-node interactive **Riff** play
(`pre_fill → review ⇄ revise → exit`, single `transcript` input, co-edited
problem-framing doc; no spoken paragraph / 75-word budget). (2) It was
**promoted** from `frame-the-problem-next/` to the canonical
`frame-the-problem/` and **registered** in `PLAY_MANIFEST`; `ax run
frame-the-problem` runs it live. The old `frame-the-problem` monolith moved to
`frame-the-problem-baseline/` (parked). **Grading is owed:** the entire
2026-06-12 smoke campaign below measured the *9-move carve*, not the Riff play
(those runs are archived at `frame-the-problem/dry-runs/archive-9move-carve/`);
`risk-map.md` is reset to `results: owed`, and `hardening.md`/`lint.md` are the
9-move audit pending a Riff re-audit. Next move: re-tune the fixtures' answer-keys
to the Riff outputs and run a fresh graded campaign on the Riff play. The dated
2026-06-12 note below is kept as the carve's historical record.

**THE EXEMPLAR EXISTS (2026-06-12, same day, later session) — HISTORICAL, 9-move carve:** the
canonical pair was `frame-the-problem-next/brief.md` (§4 move graph) →
`frame-the-problem-next/workflow.fabro` + `prompts/` (the derived
package, deployable placeholder form), registered in `PLAY_MANIFEST`
and smoke-proven END TO END on the embedded factory with claude-acp:
`ax2 run frame-the-problem` → run `01KTYPWDZ9WPMRJMYE7KREAN0T`,
succeeded, all 9 stages first-visit, zero retries (~8 min; record now at
`frame-the-problem/dry-runs/archive-9move-carve/run-3-embedded/`). Golden-path grades:
that archive's `read-out.md` (11/12 §7 checks; baseline verdict "9 nodes is
not too many"). [Superseded by the Riff re-architecture — see the 2026-06-18
update above.] Known seam for the campaign:
the embedded dump collects stage records but not the `runtime/`
artifacts — pull artifacts from the sandbox workdir or extend the
collection before grading embedded runs.

## Who you work for

The Director (Danvers): MBA, not a developer. He owns goals, designs, and
gates; he cannot catch agentic errors by reading code, and the process is
built so he never has to — every checkpoint emits an artifact he can judge
(briefs, interview reports, verdicts, dry-run transcripts, diagrams). Put him
at design decisions; bring him rulings, not options-surveys. One question at
a time, formatted as a decision brief — stakes named, one marked
recommendation, honest pros/cons (README, field-review rules). Scribe his
rulings into the artifacts with date and provenance.

## Model economics (Director directives, standing)

- Bulk fan-out (research, fetch, verify, dry-runs, grading): **Sonnet**, few
  agents, label scale before launching anything big.
- Orchestration of play #2..N: **Opus is sufficient** once this package and
  the loop exist — the machine (Hardener → Gate 1 → Author → Checker →
  dry-runs → Grader → Gate 2) catches what the orchestrator misses; that is
  the design. Reserve the largest model for novel process design, not
  production runs.
- Prototype rule of thumb: everything is an agent; honestly-mechanical checks
  are pegged *future software* in upgrade notes, not built.

## Where things go

- Per-play growth: that play's brief §8 ("Growth plan" in its workshop).
- Playbook-wide ideas: `PARKING-LOT.md`.
- New rules: `README.md`, with provenance.
- Prompt authoring: `AUTHORING.md` — hand it to every Author and Checker
  agent alongside the brief; it names `frame-the-problem/prompt.md` as the
  exemplar.
- Play edits: run `studio/tools/play-resync.py <play-dir> --json` after any
  fully drafted play edit. It replaces the old `BIG-EDIT.md` manual path by
  computing the stale E1-E16 cone, running mechanical derive/check/bank edges,
  and flagging authoring work; a brief-only graph edit is blocked at E1 until
  the workflow/prompt projection is authored.
- Status: `registry.js` only for identity and catalog filing; the viewer
  catalog and Board render from it.
- Each play gets a workshop (`<slug>/index.html`) — copy frame-the-problem's
  as the template: logic drawing first, full doc sidebar, dry-run history
  preserved verbatim including failures.

## Booting the studio — session-start procedure (Director-directed, 2026-06-12)

The Studio surfaces live in the viewer, served by the AX runtime; plays run
on the **embedded** Fabro factory that `ax` boots (operator ruling,
2026-06-12: builder factories — Railway AND the local Docker/Codex one —
build Alexandria; plays run on the Fabro *inside* it). Boot order:

1. Once per checkout: `bun install`, then `ax init all` from the repo root.
2. Build the viewer when it changed:
   `pnpm --filter @alexandria/viewer run build`.
3. `ax start viewer` → **http://127.0.0.1:4321/studio** — Board,
   catalog, play records (incl. dry-run dumps), and the Factory-runs
   debug tab.
4. The embedded factory starts on demand with `ax run <slug>`
   (`--input key=value` per fixture; `--detach` for long runs). The
   studio's Factory-runs tab and `/api/studio/runs/<id>/events` read
   that factory — no other Fabro server is involved.

## State as of 2026-06-12, later session — THE FABRO RESHAPE (supersedes below where they conflict)

The Studio → Fabro plan
(`docs/alexandria/plans/_archive/playmaker-studio-fabro/plan.md`) was approved
and its first two slices executed this session:

- **The ladder is reshaped.** Ground → Brief (§4 authored as a **move
  graph**) → Harden (content + shape) → Gate 1 → **Derive** (project →
  `workflow.fabro` + `prompts/<move>.md`; generate diagram + **story
  view**) → Lint (Protocols A–D + **E: brief ↔ workflow parity**) →
  Dry-run (real `fabro run` on the local Docker/ACP factory,
  `.fabro/README.md`) → Gate 2 (Director rules decomposition
  granularity; banks) → **Register** (package lands in
  `packages/alexandria-next-plugin/workflows/<slug>/` + `PLAY_MANIFEST`;
  `ax2 run <slug>`). Statuses:
  `slot → designed → hardened → derived → proven → registered`. The
  monolithic prompt is retired as a step; its read-the-whole-story job
  lives in the generated story view. The sync rule: edits land in the
  brief and re-derive — a hot-fixed rendering is a Protocol E failure.
- **`PROJECTION.md` is the Derive rulebook** — move graph → Fabro
  mapping, every claim cited to the vendored Fabro docs (refreshed
  2026-06-12) or demoted. Director-ruled (Slice 1, three decisions, all
  ★): adopted as written; bounce routing is routing JSON last in the
  response text; unbuilt mechanical moves run as `tab` prompt nodes.
  The old `route.sh` decision-file routing is rejected — superseded by
  Fabro's documented routing extraction.
- **Process docs are rewritten** to the current ladder (README,
  TEMPLATE-brief §4, AUTHORING — now the node-prompt guide, TESTING —
  factory runs, registry.js vocabulary, Board stages: Backlog → Sourced →
  Designed → Built → Proven → Live). `board-state.json` owns those play
  stages plus `cards[]` work orders; Testing / Improvement / Bug status is a
  separate axis (`open` / `in-progress` / `done`).
  Slice 2 gate: **APPROVED — Director ruling 2026-06-12 (relayed by
  Jess)**, after the cold-launch proof test passed (fresh agent stated
  ladder, statuses, and parity rule correctly from this package alone).
- **Slice 3 — DONE (carve), then re-architected & promoted (2026-06-18).**
  The frozen monolith moved to `frame-the-problem-baseline/`; the carve was
  re-architected into the 4-node Riff play and promoted to the canonical
  `frame-the-problem/` (registered in `PLAY_MANIFEST`). Re-proving on the Riff
  design (a fresh graded campaign) is the open item — see the 2026-06-18 update
  above and `frame-the-problem/risk-map.md`. Slice 4
  (viewer-next upfit) starts only after Slice 3's Gate 2; Slice 5
  re-enters the fleet at their honest rungs.
- The 2026-06-19 demo order below still governs *what* gets proven
  first; the reshape governs *how* anything gets proven from now on.

## State as of 2026-06-12 (end of sessions 5–6) — READ THIS FIRST

One line per fact; detail lives in the dated session blocks below and the
artifacts they point at.

- **Proven:** rung 1 (Frame the Problem) only — banked 2026-06-11.
- **Drafted, awaiting Director review:** 11 plays (rungs 2, 3, 4; inputs
  2a–2f; stretch 0 and 3b), each with a full sketch — orchestrator-prefilled
  brief.md + elicitation.md + workshop page — under the elicitation-review
  experiment. 44 rulings queued across their decision queues (per-play
  counts in registry.js). Nothing has passed a gate; ladder statuses are
  unchanged (`slot`).
- **Grounded only:** the three back-lot compounds (Frame a Bet, Prioritize
  the Backlog, Riskiest-Assumption Test).
- **The Board** (`plays/board.html`, top nav everywhere): Play cards move
  through Backlog, Sourced, Designed, Built, Proven, and Live. Work-order
  cards track Testing, Improvement, and Bug work with their own
  `open / in-progress / done` status and optional play links. Interactive:
  edits persist to `plays/board-state.json`, which agents edit directly.
  Server must be `python3 site-server.py 8778` (see server note above).
- **NEXT SESSION'S FIRST MOVE (Director-stated, 2026-06-12):** deep review
  begins at **Elicit Business Context (2a)** — its card is top of the
  board's queue — then onward as he calls it. This supersedes the
  rung-2-first review queue at the bottom of this file until he says
  otherwise; THE ORDER below still governs *proving* order (the spine
  proves strictly in sequence regardless of review order).
- **Open debts:** rung-1's banked
  75-word spoken ceiling vs the new 100 standard is an open Director
  question; rungs 3/4/3b dry-runs blocked on upstream fixtures by design;
  demo 2026-06-19.

## State as of 2026-06-11 (session 3, after the bank)

Rung 1 (Frame the Problem): **PROVEN — banked at Gate 2, 2026-06-11**
(received and approved by Jess, relayed by the Director). The owed pre-bank
full re-lint ran first — one minor found and fixed (a golden-fixture speaker
name in a step 6 voice exemplar); verdict and scope in `frame-the-problem/
lint.md` (Lint 4, the lint of record at bank). Brief §10 carries the bank
note and the round-3 gallery addendum; registry updated. Remaining rung-1
debts moved to its §8 growth plan (prior-brief fixture regen; golden-snippet
preamble noise) — they no longer block anything.

**Session 4 (2026-06-11): the gstack field review.** A comparison of Garry
Tan's public gstack skill stack against this playbook adopted seven
mechanics, Director-ruled, recorded with provenance in `README.md` ("rules
adopted from the field"): untrusted-inputs-are-data clause · decision
classification (mechanical / taste / Director-challenge) · attested
coverage ("examined X, nothing flagged") · per-play `known-fps.md` ledgers
· decision-brief format for gate questions · quote-or-demote for checkers
and graders · three-strikes-then-freeze for every agent loop. gstack's
architecture itself was rejected (no contracts, shared global state, no
provenance). Rung 1 touched: untrusted-input hard limit added to prompt.md
(brief §11); `known-fps.md` created and seeded from the lint dispositions;
re-lint folded into the next scheduled pass (lint.md patch log). Template
§3 (input trust) and §5 (escalation defaults) updated. Same session,
Director-requested: **`AUTHORING.md`** written — the plays-era
prompt-authoring guide (structure, the encode-a-rule gradient, gallery
rules, purity list, trust/failure behavior, output-format discipline,
pre-lint checklist), with frame-the-problem as exemplar; README "Standards"
now points there, and the graph-era conventions apply only at conversion.

Rung 2 (Write the One-Pager / PRD): **brief conversation well advanced**
(2026-06-11). Step 0 complete (`write-the-one-pager/research/`: the
two-mandate research-brief pattern, extracted-claims with verification
verdicts, grounding incl. the §8 pre-answered elicitation manifest).
Director-ratified so far, all scribed in the brief: single-page form
(depth-scaled versions → §8); two renderings (artifact + spoken intro —
the universal play shape, parked); **rung 2 is a compound play** — trigger
fires on the whole problem brief, coverage map + named non-goals,
disputed-edge guardrail; input set (problem brief + saddle +
conversation, declare-don't-block); sizing law (no generated
sizing/sequencing; quoted human appetite legal); §5 risk table drafted;
§7 fixture strategy ratified (rung 1's real emitted briefs as fixtures;
refusal + sizing-bait failure demos). Remaining: §6 draft prompt language
(Director-owned), then Harden → Gate 1.

The six **input plays** (registry rungs 2a–2f: Elicit Business Context —
new slot; Feasibility Check; Survey the Existing System; Market &
Competitor Scan; Size the Opportunity; Capture Technical Constraints) are
all **step-0 grounded** (2026-06-11, 18-agent Sonnet workflow): each play
dir has research-brief.md (with its open Director questions appended),
extracted-claims.md, grounding.md. None block the spine; their questions
are Gate-1-era rulings per play. Inventory also gained **Keep the
Calibration Ledger** (analytics — the predicted-vs-actual knowledge pool;
see PARKING-LOT "Knowledge pools unlock speculation licenses").

**Server note:** resolved 2026-06-12 — the stale wellington server is gone;
this tree is served at **http://127.0.0.1:8778**. Since the Board became
interactive (same day), the server is **`python3 site-server.py 8778`**
from `studio/` (this directory's parent; updated at the 2026-06-12
migration into alexandria-internal — NOT `http.server`; the plain server serves the
site but Board drags won't persist; the page says so loudly if you get
this wrong). The only endpoint is POST /api/board-state →
`plays/board-state.json`.

**Session 5 (2026-06-12): the elicitation-review experiment.** Director
ruling: for the six grounded input plays of rung 2 (2a–2f), the brief
conversation is replaced by review of a built play page — the grounding
docs are themselves organized as pre-answered elicitation sessions, so the
orchestrator pre-fills the entire brief from them and the Director reacts
to the artifact, reviewing the elicitation and what came out of it at the
same time. Each of the six play dirs now carries: `brief.md` (status
*drafted — orchestrator-prefilled*; NOT "designed" until the Director has
reviewed and ruled; every section ends with a provenance tag — Grounded /
Orchestrator call / DIRECTOR DECISION), `elicitation.md` (the review
surface: per template section, the question → the research's answer with
verbatim cites → what the draft adopted → what's open; closes with the
decision queue, every open question as a decision brief with one ★
recommendation), and `index.html` (workshop on the play-1 template —
logic drawing with mermaid flowchart first, illustrative Lantern scene
labeled as such, honest placeholders where prompt/fixtures/dry-runs don't
exist yet, decision queue as a pseudo-doc). Registry statuses unchanged:
"drafted" is not a ladder status; these remain pre-Gate-1. 22 rulings are
queued across the six decision queues (2a:4 · 2b:3 · 2c:4 · 2d:3 · 2e:5 ·
2f:3). The Director's review of each page stands in for that play's brief
conversation; rulings get scribed into the briefs with date and
provenance. The experiment itself is unjudged — whether page-review beats
the question-by-question conversation is the Director's call after using
it; if adopted, it becomes a README rule with this provenance.

First ruling under the experiment, same day: **every rung-2 input play
carries a spoken read-back** alongside its filed artifact — the
two-renderings shape from rung 1, formerly parked as "the universal play
shape." The word ceiling starts at **100** (the Director judged rung 1's
75 overly constraining), with per-play scaling delegated to orchestrator
judgment: 2a/2d/2e at 100; 2b/2f scaled down to 75 (verdict- and
log-shaped outputs travel light); 2c scaled up to 120 (a system map
resists compression). Scaling deviations are tagged as orchestrator calls
in each brief. All six briefs gained render + pause moves (rung 1's
pattern), a spoken-overclaim failure row shaped to each play's content,
spoken proof-spec checks, and proposed §6 render/pause language; the
pages' barrels, flowcharts, and move rails match. The spoken
decision-queue items are stamped RULED (history preserved); 2e's
sizing-law seam explicitly stays open — the spoken addresses the room,
not the one-pager. Note for rung 1's growth plan: whether its banked
75-word ceiling moves to 100 is an open Director question, not assumed.

Same day, the experiment extended to the spine: **rungs 2, 3, and 4 are
drafted with workshop pages.** Rung 2 (Write the One-Pager) was handled
additively — its 2026-06-11 Director-ratified rulings are untouched
word-for-word; the orchestrator filled only what was owed (§6 proposed
prompt language, tier proposal, a proposed 100-word spoken ceiling, §7
fixture links to rung 1's real artifacts, and a dated §8 addendum noting
the compound-input map materialized). Its page takes the Director-ruled
**atomic approach**: a "What this play compounds" strip links rung 1 and
all six input-play workshops instead of restating them; the v1
declared-TBD/refuse-and-route law is unchanged — links are the map, not a
dependency change. The stale "§6 remaining" line in the session-3 state
above is superseded by this. Rungs 3 and 4 were prefilled from their
step-0 research like the input plays (frames still owed ratification —
each is Decision 1 in its queue); spoken ceilings: rung 2 proposed 100,
rung 3 at 100, rung 4 at 120 (delegated-judgment tags). Decision queues:
rung 2: 4 (incl. react-to-§6 and the artifact name) · rung 3: 4 (the two
queued decision briefs carried verbatim) · rung 4: 3. Fixture honesty
preserved: rung 3's fixture is rung 2's emitted one-pager and rung 4's is
rung 3's scope cut — neither exists yet, so dry-runs wait on the chain
proving in order; only rung 2's fixture (rung 1's banked artifacts) is
real today. Registry statuses unchanged throughout. Nine of the chain's
plays now sit at drafted-awaiting-Director-review; his queue is the nine
decision queues, rung 2 first.

**Session 6 (2026-06-12, Director-directed): the stretch rungs ran the
full pipeline** — they had no play dirs at all, so step 0 ran first
(orchestrator-stated frames, ratification owed; research → verification
pass with quote-or-demote attestations → grounding.md), then the
experiment prefill. Rung 0 (Run Internal Feature Discovery): canon
converged on Mom Test / Torres / JTBD switch-interview; the precise
rung-1 seam is grounding §7 (this play records and signals readiness, it
NEVER frames); the structural question — separate play vs rung 1's
interactive mode — leads its 5-item decision queue; spoken ceiling 100.
Rung 3b (Write Acceptance Criteria): canon converged on
testable/outcome-focused/binary, GWT and rule-based as per-slice tools;
the cardinal sin (criteria may never smuggle scope rung 3 already cut)
is honestly labeled a chain-position constraint, unsourced in canon; 6
queue items incl. frame ratification; spoken ceiling 75 (delegated
call); fixture waits on rung 3's proving. Verification demoted 4 claims
per play (struck, never silently dropped). Registry rows for both gained
WORKSHOP + GROUNDING links; statuses stay slot. The whole inventory now
has workshops: 11 plays drafted-awaiting-review (12 workshop pages
counting rung 1's), 44 rulings queued across their decision pages. Also this session: the Theater mockup at
theater/index.html (stayed behind in fabro-experiment at the 2026-06-12
migration — speculative work doesn't ride; a UI study after the Director's Cognitive Lab —
floor / Up Next / By Status lenses, walkthrough tour, day rail kept per
his guidance with the production line inside Produce; inline snapshot
only, registry.html stays the source of truth), and registry.html rows
for all drafted plays became clickable WORKSHOP links with dated
drafted-status prose (ladder statuses untouched).

**The Board (Director-directed, 2026-06-12, adopted from his Cognitive
Lab):** `plays/board.html` — a kanban of every play by the confirm it
awaits, columns = the Director's flow: Source Material → Play Logic →
Prompt Draft → Hardening (the prompt ⇄ fixture loop) → Ship. Standing
ruling recorded on the page and in `registry.js`: cards move right ONLY
on a Director confirm; agent work (including a full sketch) enriches the
current column's review surface, never advances the card — so all 14
non-banked plays sit in Source Material today, sketches and all, and
Frame the Problem sits in Ship. Structural change with it: play state
moved from inline registry.html into **`plays/registry.js`** — the
single source of truth both registry.html and board.html render from
(status = the proving ladder; stage = the board column; the two axes
are deliberately distinct and documented in the file header). A "⬚
Board" link is in the top nav of registry.html and all 12 workshop pages.
(The theater mockup also carried one until it stayed behind at the
2026-06-12 migration; its inline-snapshot debt stayed with it — if that
design ever graduates, it is a fresh build against registry.js here, not
a port.)

**The Board is interactive (Director-directed, same day; current schema
updated 2026-06-23):** drag to
reorder within a column (top card = NEXT UP, badged) and drag — or the
hover ▸ button — into the next column on a confirm. Moves persist via
POST /api/board-state (see the server note) to
**`plays/board-state.json`**, the single mutable workflow-state file:
the Director drags in the browser, agents edit the file directly — same
cards, same ground. Schema: ordered slug arrays per play stage
(`backlog` / `sourced` / `designed` / `built` / `proven` / `live`),
`ready`, and `cards[]` work orders. A work-order card's status is
independent of play stage. `stage` was therefore removed from registry.js
(identity + legacy ladder status live there; column + order live in
board-state.json — one fact, one place). Round-tripped and verified
2026-06-12: browser drag → file, and agent file-edit → page.

New process rule, Director-ruled at rung-2 kickoff (2026-06-11) and
recorded in `README.md` with its provenance: **ground before design** — the
loop gained a step 0 (Director + orchestrator agree the frame in plain
terms, then Sonnet agents research prior art into `research/grounding.md`)
so briefs are designed against expertise, not the Director's unaided
judgment. Earned on rung 1, where the canon research arrived only after the
design was drafted. The template and layout were updated to match.

What changed in session 2 (all dated in the artifacts):

- Artifact renamed **problem map → problem brief**; it now opens with "The
  picture" (a plain-language gestalt for a cold reader). Brief §9.
- An agent-run **cold-reader comprehension gate** joined the proof spec and
  passes — readability is a graded surface now. Brief §9.
- The **advanced fixture** (`fixtures/advanced/`) was verified and run: six
  planted problems tangled under noise (its answer key designates one pair
  legitimately mergeable — a 5-entry run can pass), Needle/Knot/Storm
  factored design. Locate,
  disguise test, verbatim discipline, and distinctness all hold. The cracks
  it found (evidence grading, hunch-vs-disputed-edge) were fixed across
  three confirmation rounds. Brief §10; full matrix in its read-out.
- The prompt carries a **"Done right vs wrong" example gallery**, re-skinned
  into a neutral domain so the prompt never contains a fixture's answer.
  Measured lesson, now in §8: prose rules get evaded, mechanical checks
  close hard failures, matched examples teach judgment — escalate in that
  order, more rule-prose last.
- Known residual (grader-checklist, not prompt growth): occasional
  commitment-inflation on vivid-pain quotes.
- Website refreshed: registry note, workshop manifest (advanced fixture +
  run-5 records), growth-plan renderer bounded to §8.
- Declared debts: regenerate `fixtures/prior-map-01.md` as a prior *brief*;
  add preamble noise to the golden snippet so `locate` is tested there;
  ~~full re-lint owed at bank~~ → done 2026-06-11 (Lint 4).

Rungs 3–4 (Scope an MVP; Architecture-Aware Build Plan): **step-0
grounded, 2026-06-11** — Director-directed advance work ("keep laying
down ground") while he reviews. Each play dir has the three research
artifacts; both frames are orchestrator-stated and **owed Director
ratification at review** (stated in each research-brief.md). Verification
caught and excluded reconstructed quotes (incl. a fake Shape Up line and
a misread PMI stat — details in each extracted-claims.md). Compound
findings: rung 3 surfaced two decision briefs (queued in
`scope-an-mvp/research/research-brief.md`: a Riskiest-Assumption-Test
slot; where the scope-increase review lives); **rung 4 exposed no new
inventory gaps** — its compounds all map to 2b/2c/2f, existing delivery
slots, or its own moves (grounding §8). Step-0 also ran for the
discovered compounds **Frame a Bet, Prioritize the Backlog, and (ahead of
its slot ruling) Riskiest-Assumption Test** — artifacts in their play
dirs, open Director questions appended to each research brief.

Also new this session: `TESTING.md` (v1, single-exemplar provenance —
fixture kit by failure class, not difficulty; the no-medium-fixture call
is orchestrator-answered, ratification owed) joins `AUTHORING.md` in the
playbook kit.

## THE ORDER — what gets solidified, in sequence

Demo: 2026-06-19. Solidify = through the loop to **proven**. The spine
is strictly ordered (each rung's fixtures are the previous rung's emitted
artifacts — proving out of order means proving on synthetics):

1. **Rung 2 — Write the One-Pager.** Brief is §§1–5,7 done; §6 was
   orchestrator-prefilled 2026-06-12 (elicitation-review experiment) and
   awaits the Director's reaction (Decision 1 in its queue) → Harden →
   Gate 1 → Author → Lint → dry-runs on rung 1's real briefs → Gate 2.
2. **Rung 3 — Scope an MVP.** Frame ratification → brief conversation
   (grounded; §8-manifest ready) → the loop. Fixtures: rung 2's emitted
   one-pager.
3. **Rung 4 — Architecture-Aware Build Plan.** Same; fixtures: rung 3's
   scope cut + the saddle surface map.
4. **The compound rehearsal** — hand-off seams dry-run, then Feature
   Request → Build Plan end to end (the demo finale).

**Parallel track, Director-triggered any time after a bank:** the
rung-1 → Fabro-workflow conversion — still the missing exemplar; if the
demo runs on Fabro rather than single-agent prompts in Freeq, this stops
being parallel and becomes step 5 with a hard date. Director call.

**After the core is proven** (only then — registry rule): input plays in
demo-value order 2a (Elicit Business Context) → 2d (Market & Competitor
Scan) → 2e (Size the Opportunity) → 2b (Feasibility) → 2c (Survey) → 2f
(Capture Technical Constraints, worked example exists); then the
discovered compounds Frame a Bet → Prioritize the Backlog → RAT (pending
its slot ruling); stretch rungs 0 and 3b last. All are step-0 grounded
already, so each starts at its brief conversation.

**The Director's review queue (first moves, in order):** (1) rung-2 §6,
then harden → Gate 1; (2) ratify the rung-3/4 frames + TESTING.md's
no-medium call; (3) the two decision briefs
(`scope-an-mvp/research/research-brief.md`) and each grounded play's
open questions (appended to its research-brief.md).
