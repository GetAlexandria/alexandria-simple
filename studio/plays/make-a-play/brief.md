# Play Design Brief — Make a Play (the meta-play)

> **Recovered 2026-06-23** from an orphan Conductor checkpoint (drafted
> 2026-06-17) where it was never committed to any branch. This is the parked
> **F8 self-hosting** brief, reconciled at Gate 1 on 2026-06-23 and taken
> through Design → Build → Prove via issue #341. The original draft predated
> the Company·Division·Function org model; the approved filing is
> **PlaymakerStudio / Production**, fronted by William.

```
slug:     make-a-play
division: PlaymakerStudio
function: Production
tier:     Coordinator
status:   Gate 1 approved 2026-06-23; Build derived via #341
chain:    the self-hosting meta-play (Design → Build → Prove)
gate-1:   approved — see gates/gate-1.json
```

*Drafted 2026-06-17. **Gate 1 approved 2026-06-23.** This is the studio
self-hosting: the approved issue #341 plan rendered as a play, in the same
artifact shape as every other play — so the process that builds plays is itself
an orderly, reliable, repeatable, deployable workflow, not prose an agent
re-threads each time. Clones the `frame-the-problem` exemplar (the first
play→Fabro conversion). Tier: **PlaymakerStudio / Production** (a maintainer
tool that builds plays) — NOT a product PM play; it does not ride the product
golden path or Raven's playbook.*

## 1. Goal

Take a named-but-empty play slot to **Live** the same way every time: the
mechanical steps run as software ("press a button"), the judgment steps stay a
scaffolded conversation with recorded decisions, and the human is touched in
exactly two places — the design gate and the held-queue exceptions. The
job-to-be-done: *make play production orderly, reliable, well-organized, and
repeatable*, so a campaign can run overnight and hand back a **report**, not a
pile of un-advanced cards.

## 2. Trigger

A Board card exists at stage **Empty** (named, nothing started) and the operator
wants it carried up the ladder. Run by module — `ax run make-a-play:design`,
then `:build`, then `:prove` — or end-to-end with the gates as stops.

## 3. Required knowledge

The studio canon this play *operationalizes* (it does not restate it — it runs
it): `README.md` (the ladder + the two gates), `TEMPLATE-brief.md` (the design
instrument), `PROJECTION.md` (the Derive rulebook), `AUTHORING.md` (node-prompt
lint, Protocols A–E), `TESTING.md` (the fixture kit, measurement policy, and the
**auto-advance contract & night report** — §"Advancing a card"), and the
`frame-the-problem/` exemplar pair (brief §4 → `workflow.fabro` + `prompts/`).

## 4. Golden path — the move graph

**The story.** Three modules, one human glance between each — the Raven-onboarding
shape. **Design** grounds the play in source canon, drafts the brief one section
at a time, hardens it with fresh eyes, and stops at the Director's design gate
(nothing is derived before this). **Build** projects the approved §4 into a
workflow package, lints it mechanically, authors fixtures by failure class, and
registers it so it can run. **Prove** runs the campaign on the embedded factory
at policy *n*, grades blind, writes the rates back to the risk-map, and lets the
**auto-advance contract** decide: clears → the card promotes itself and reports
one line; misses → it lands in the held queue with the reason. The operator wakes
to "N advanced clean, M held — here's why each," and only ever touches the held
ones (where a *new* failure mode means authoring a fixture or a brief amendment —
the one job that is never automated).

**doer legend:** `judgment` = agentic reasoning · `command` = deterministic
software node (cashes a pipeline-plan peg) · `human-gate` = a recorded human
decision · `contract` = the TESTING.md auto-advance evaluation.

```
=== MODULE 1 — DESIGN  (Empty → Designed) ===

ground:
  doer:     judgment
  consumes: play slot (name + intent), source canon
  emits:    research/grounding.md (cited canon + routing)
  routes:   → draft_brief

draft_brief:
  doer:     judgment
  consumes: grounding, TEMPLATE-brief.md
  emits:    brief.md (§§1–8; §4 the move graph)
  does:     fills the instrument one section / one question at a time
  routes:   → harden

harden:
  doer:     judgment
  consumes: brief.md
  emits:    hardening.md (what fresh eyes caught)
  bounces:  gaps → draft_brief
  routes:   → gate_design

gate_design:                                    [HUMAN — Gate 1]
  doer:     human-gate
  consumes: brief.md, hardening.md
  does:     Director confirms the design AND the graph shape; rules
            decomposition granularity. Nothing is derived before this.
  routes:   Approve → MODULE 2 · Revise → draft_brief · Park → exit

=== MODULE 2 — BUILD  (Designed → Built) ===

derive:
  doer:     command
  consumes: approved brief §4 + §6
  emits:    workflow.fabro + prompts/<move>.md + run config + derived
            diagram/story (derive-views.sh)
  does:     PROJECTION.md, mechanically; never hand-edited
  routes:   → lint

lint:
  doer:     command
  consumes: workflow package, moves.md
  emits:    lint report
  does:     Protocols A–E + check-moves.ts + fabro validate
  bounces:  closed-rule fail → derive · structural fail → gate_design
  routes:   → author_fixtures

author_fixtures:
  doer:     judgment
  consumes: brief §7 proof spec, TESTING.md fixture kit
  emits:    fixtures/ (one per failure class) + seeded risk-map.md
  routes:   → register_for_run

register_for_run:
  doer:     command
  consumes: workflow package
  emits:    PLAY_MANIFEST entry (run-enabled; not yet "banked")
  routes:   → MODULE 3

=== MODULE 3 — PROVE  (Built → Proven → Live) ===

run_campaign:
  doer:     command
  consumes: fixtures, run config, policy n (smoke/estimate/ship-gate)
  emits:    dry-runs/<case>-run-*/ (records + handles), embedded factory
  routes:   → grade

grade:
  doer:     judgment   (INDEPENDENT of the author — separate run / cross-model)
  consumes: run records, known-fps.md, proof spec
  emits:    grades (per case)
  routes:   → writeback

writeback:
  doer:     command
  consumes: grades
  emits:    risk-map.md runs/result columns (n · pass · CI), coverage
  does:     the run→risk-map pipeline (no hand-transcribe)
  routes:   → advance_contract

advance_contract:                               [the night report is emitted here]
  doer:     contract
  consumes: risk-map.md, baseline, grader identity
  does:     evaluates the 5 conditions (TESTING.md "Advancing a card"):
            tier-bar · proof-spec · no-unclassified-failure · no-regression ·
            independent-grade
  routes:   all pass → register_live (tag: auto, probationary)
            any miss → held_queue (tagged with the failing condition)

held_queue:                                     [HUMAN — exceptions only]
  doer:     human-gate
  consumes: held cards + failing conditions
  does:     operator reviews ONLY the held. A new/unclassified failure mode
            is always a stop — adjudicating it = author a fixture or a brief
            amendment (authoring, never grading).
  routes:   amend → MODULE 1/2 · override-confirm → register_live (tag: human)

register_live:
  doer:     command
  consumes: proven package
  emits:    banked workflow in packages + PLAY_MANIFEST live; ax run <slug>
            smoke-proven
  routes:   → exit (stage: Live)
```

**Phases & the Board — one vocabulary, three surfaces (D-b RULED 2026-06-17:
three modular runs).** The three modules are three workflows, each its own
`ax run`, each ending at a gate-bounded resting stage. The same names appear in
three places — the run command, the on-screen phases while it runs, and the Board
section that tracks every play — so "where is this card" and "which run is
active" read in the same words.

| Module (its own run) | On-screen phases (nodes) | Resting stage |
|---|---|---|
| **Design** `:design` | Ground · Draft · Harden · **Gate 1** | `designed` |
| **Build** `:build` | Derive · Lint · Fixtures · Register-to-run | `built` |
| **Prove** `:prove` | Run · Grade · Write-back · **Advance/Hold** · Register-live | `proven` → `live` |

A card is always either *resting at a stage* (a Board column) or *being advanced
by the named module-run whose phases are on screen*. The Board
(`board-state.json` → viewer Board) gets **Design / Build / Prove** as section
headers over the stage columns. Machine-only bounces (e.g. `lint → derive`) stay
*inside* a module's run — the split is at human gates and expensive checkpoints
only. *(Gate-1 sub-decision D-b-i: band the existing 6 stages under the 3 headers
— recommended, preserves `sourced` as a within-Design rest — or simplify the
Board to the 3 module-aligned resting stages.)*

**Validated against the worked trace.** The move graph is not invented — it is
reverse-derived from the one play that has already run the whole pipeline by
hand: `frame-the-problem`. Nearly every node's `emits` is a real file it
produced (`ground`→`research/`, `derive`→`workflow.fabro`+`prompts/`+`diagram.svg`
+`story.md`+`moves.md`, `lint`→`lint.md`, `author_fixtures`→`fixtures/{golden,
empty,refusal,hard-case,rerun}`+`risk-map.md`, `run_campaign`→`dry-runs/`,
`grade`→`read-out.md`/`grade.md`, `writeback`→`risk-map.md` runs cols via #279).
The *only* node with no worked artifact is `advance_contract` — because that is
the one step this work newly adds, and FTP only ever got **N=1 smoke**. Running
today's contract against FTP correctly routes it to **held, not proven** (tier =
smoke + the open OUT-2 crack): the meta-play refuses to auto-advance its own
exemplar, which is the right answer and the contract's first self-consistency
proof.

## 5. What could go wrong

- **Bootstrap recursion.** The meta-play cannot fully run *itself* until it
  exists — but it does not start cold: `frame-the-problem` is the completed
  worked trace, so the first build is *reverse-derived from* that exemplar, then
  the play self-hosts. (The exemplar already exists — HANDOFF, "THE EXEMPLAR
  EXISTS" — so this is grounding on a real trace, not closing a gap.)
- **A command node that should be judgment** (or vice-versa) — the doer tags in
  §4 are the load-bearing claim; mis-tagging automates a judgment or makes
  software of a conversation. Gate-1 rules each tag.
- **Grader not actually independent** — if `grade` shares the author's run/model,
  the contract's condition 5 is satisfied on paper but not in fact.
- **Held queue becomes a dumping ground** — if too many cards land held, the
  contract is mis-tuned (or n too small); the report should trend toward "N clean."

## 6. Draft prompt language

Per-module node prompts are derived from §4 at Build (one `prompts/<move>.md` per
node). Drafting deferred to Derive — not hand-written here (PROJECTION rule).

## 7. Proof spec — seed the risk map

The meta-play's own fixtures are *plays-in-progress*, anchored on the real
exemplar: **`frame-the-problem` is the golden regression fixture** — replay
its on-disk trace through the modules and every node's output must match what it
already produced (the table above is the answer key). Plus: a slot whose brief
fails Gate 1 (design-refusal path), a built play that fails lint (bounce path), a
campaign with an unclassified failure — **FTP's own OUT-2 crack is the live
case** (must route to held, never auto-advance), and a regression case (pass rate
drops → held). Each proves a module boundary holds. Full risk-map seeded at Build.

## 8. Carve decision queue (for Gate 1)

- **D-a — Slug/name.** `make-a-play` proposed (verb-noun house style). Alt:
  `the-playmaker`, `author-a-play`.
- **D-b — One workflow or three? RULED (2026-06-17): three modular workflows**,
  each its own `ax run`, gates as the handoffs between them, one shared
  vocabulary across the run command + on-screen phases + Board sections (see
  §4 "Phases & the Board"). Sub-decision **D-b-i** (board granularity: band the 6
  stages vs. simplify to 3) owed at Gate 1.
- **D-c — Bootstrap.** Proposed: **reverse-derive** the move graph from
  `frame-the-problem`'s completed trace (the §4 table is the answer key),
  replay FTP through the modules as the golden regression fixture, then flip the
  play to self-hosted once green. The exemplar already exists — we are grounding
  on it, not building it.
- **D-d — Placement. RULED (2026-06-23):** PlaymakerStudio / Production,
  fronted by William, off the Product golden path. `built-by` is Ledger
  provenance only, not a filing key.
