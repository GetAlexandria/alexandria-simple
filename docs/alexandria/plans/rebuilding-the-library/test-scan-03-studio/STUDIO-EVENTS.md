# Playmaker's Studio — Pass-1 Event Storming

*(Blind back-of-house scan, 2026-06-20. Sources: studio/plays/ governance docs +
sample plays. The Studio IS a process — a six-stage Board with two Director
gates and a sequenced authoring loop. This walks the line **time-first**,
listing the past-tense Domain Events that fire as a play moves from "named
slot" to "live in Alexandria." Brandolini-style Hot Spots — places the docs
disagree, leave a thing ambiguous, or punt to author judgment — are tagged
inline and summarized at the end.)*

---

## The timeline — ~22 Domain Events

Each event is past-tense and corresponds to a fact written down somewhere on
the production line (the brief, the Board, the lint, the run record). Stage
transitions in **bold**.

| # | Event | Triggered by | Lands in |
|---|---|---|---|
| 1 | **Play Slot Named** | Director adds an identity row | `registry.js` |
| 2 | Source Material Gathered (step 0 part A) | Director + orchestrator agree the frame in conversation | `<slug>/research/research-brief.md` |
| 3 | Prior Art Researched | Sonnet researchers fan out; quote-or-demote verification | `<slug>/research/grounding.md` + `extracted-claims.md` |
| 4 | **Source Confirmed** | Director confirm on the Board | `board-state.json` (Sourced) |
| 5 | Startup-Floor Question Answered | "what's the minimum a 5-person team would tolerate?" | `brief.md` §1 + §8 |
| 6 | Brief Authored | Director (owns the design) | `<slug>/brief.md` (§§1-7) |
| 7 | Move Graph Drawn | Director authors §4 as nodes + edges + bounces + gates | `brief.md` §4 |
| 8 | Hardening Run | Hardener agent interviews brief with three questions + state audit | `<slug>/hardening.md` |
| 9 | Brief Amended (dated) | Findings folded back in place | `brief.md` §§9-10 |
| 10 | **Design Confirmed (Gate 1)** | Director approves graph shape at top of brief | `brief.md` header + Board (Designed) |
| 11 | Workflow Derived | Author projects §4 → `workflow.fabro` + `prompts/<move>.md` per PROJECTION.md | `<slug>/workflow.fabro` + `prompts/` |
| 12 | Renderings Generated | `studio/tools/derive-views.sh` emits diagram + story view | `diagram.svg` + `story.md` |
| 13 | Moves Overlay Authored | Reader-facing prose drafted for the viewer's Play page | `moves.md` (optional) |
| 14 | Fixtures Authored | Kit chosen by failure class (golden / refusal / empty / rerun / hard-case) | `fixtures/<case>/` |
| 15 | Risk Map Authored | Coverage shape across canonical risk spine (RE/IN/OUT/ADV/CHN) | `risk-map.md` |
| 16 | Lint Verdict Emitted | Checker runs Protocols A-E (per-prompt and brief↔workflow parity) | `<slug>/lint.md` |
| 17 | Play Banked into Plugin (`bank.sh`) | Workflow + prompts copied studio → `packages/alexandria-next-plugin/workflows/<slug>/` | plugin tree |
| 18 | Play Registered | `PLAY_MANIFEST` entry added | `packages/ax-next/src/domain/plays.ts` |
| 19 | Run Launched | `ax run <slug>` on embedded factory | `play.started` event |
| 20 | Run Suspended for Review (Raven-mediated only) | Agent writes unit, marks `needs_review`, ends turn | `play.human_input_requested` |
| 21 | Director Reaction Posted | Reactions JSON or live `human.gate.text` | `play.human_input_resolved` / `human.gate.text` |
| 22 | Run Graded | Fresh-eyes graders score against answer key + brief §7 | `dry-runs/read-out.md` |
| 23 | **Proven Confirmed (Gate 2)** | Director rules decomposition granularity; banks the play | Board (Proven) |
| 24 | **Live (Registered to Users)** | `ax run <slug>` smoke-passes | Board (Live) |
| 25 | Play Edit Initiated | A change large enough to invalidate renderings/tests/audit | `brief.md` amendment |
| 26 | Old Runs Sidelined | Pre-edit runs archived under dated subdir; `risk-map.md` `results:` reset | `dry-runs/archive-<old-shape>/` |
| 27 | Improvement Carded | Growth-edge recorded for after-ship | `<slug>/improvements.md` or `brief.md` §8 |
| 28 | Known-FP Logged | Pattern dispositioned by design | `<slug>/known-fps.md` |

The line is **strictly ordered between gates** (each step invalidates the
next if skipped — `BIG-EDIT.md` is the explicit playbook for that order
when an edit re-enters mid-line).

---

## The two Director gates (the only human stops)

Both gates are **outside the run**, on the Board — not projected as
hexagon nodes inside `workflow.fabro` (PROJECTION.md §2). Hexagon nodes
are *in-play* checkpoints that belong to the play's own logic; the
ladder's two gates belong to the production *process*.

- **Gate 1 — Design Confirmed.** Approves the move graph shape; nothing
  is derived before this.
- **Gate 2 — Proven Confirmed.** Rules decomposition granularity with
  the read-out in hand; banks the play.

---

## Hot Spots (Brandolini red stickies — the doc ambiguities + judgment punts)

These are not bugs — they are the places where the governance docs *do not
agree*, leave a decision to taste, or carry an open Director question.

### H1 — Stage vocabulary drift
The Board has **two parallel ladders running side by side**:
- The README ladder (current): `empty → sourced → designed → built → proven → live`
- The `registry.js` `status` ladder (older, narrower): `slot → designed → hardened → derived → proven → registered`

`board-state.json` carries the README ladder. `registry.js` rows still
have a `status:` field on the older ladder. Per the file headers, "stage"
(column) lives in `board-state.json`, "status" (proving rung) lives in
`registry.js`, and they are "deliberately distinct" — but the rungs of
the older ladder (`hardened`, `derived`) don't map cleanly onto the
README's six. **Punt or design choice — unclear.**

### H2 — Three "bank" verbs, three different things
`BIG-EDIT.md` step 6 calls `bank.sh` the "studio → plugin" copy. README
step 7 says the Director "banks" the play at Gate 2 (a confirm). And
`RUNTIME.md` §6 calls "the play's deliverable banks" something else
entirely — the play's *output* landing in the library at run time (Vision's
`raven.vision.banked`). **Same word, three operations.** RUNTIME §6 calls
this out explicitly: "This is **not** the *package bank* (`bank.sh`, studio
→ plugin)." Still confusing.

### H3 — `--interactive` deadlock vs Raven-mediated runs
PROJECTION.md §7 spends a whole boxed warning saying the documented
human-gate model (`hexagon` node with edge labels) **deadlocks** under
detached / Raven-mediated runs. The "correct" pattern is the Raven Vision
unit/review/wake pattern (RUNTIME.md §3). But §7's bullets still describe
the deadlocking shape, and TESTING.md says `--interactive` "deadlocks a
detached / agent-launched run, so a campaign never uses it." **Two human-
gate models coexist; the docs say "design to RUNTIME.md, but here's how
the broken one works mechanically."**

### H4 — "Mechanical" doer is honestly an agent
Doer honesty (`brief.md` §4) classifies every move as judgment / mechanical
/ human. But the README's "prototype rule of thumb" says **everything is
an agent** — even checks identified as mechanical run as `tab` prompt nodes
("pegged future software in upgrade notes") until the software is earned.
PROJECTION.md Decision 3 ruled `tab` for this, with `box` as an escape.
**The doer column means something subtly different from "what kind of node
will Fabro run" — it captures *what we wish was here* + a peg.**

### H5 — Authored overlays can drift; protocol E doesn't gate them
`moves.md` and `synopsis.md` are *authored*, not derived (README "Authored
explainer overlays"). They're a deliberate human polish on the derived
spine. `check-moves.ts` is an "advisory" guard run by `derive-views.sh`;
Lint (rung 5) gates on it. But `synopsis.md` has no equivalent. **The
docs admit this can drift.**

### H6 — Statistical bar is documented, not yet wired
TESTING.md §"Measurement, sampling & significance" (2026-06-15) lays out
a serious sampling discipline (k=30/100/300, rule of three, McNemar, etc.).
But `frame-the-problem`'s actual `risk-map.md` is at "N=1 smoke" — and that
is the play that defines the standard. The bar is real; the runs to clear
it are **owed**. The frame-the-problem `risk-map.md` reset its `results:`
axis after the Riff promotion and that reset is honest.

### H7 — Fixtures by failure class, not difficulty — but a "hard-case" exists
TESTING.md §"The fixture principle" rejects easy/medium/hard ("a medium-
difficulty fixture buys grader noise, not information"). But the kit's
class 5 is literally **`hard-case`** — "the factored ceiling" — and frame-
the-problem's hard-case dir name is exactly `hard-case`. **Not a contradiction
once you read carefully (hard-case = factored ceiling, not difficulty step),
but the naming invites the misreading.**

### H8 — Reverse-derived plays don't run the ladder
The three atomic-card plays are **reverse-derived from a shipped Fabro
build** that "predates the 0.12.0 rename." They have status `derived` but
no Gate-1 approval, no Hardening, no Gate 2. They are explicitly "NOT a
Raven play," "not gated through the studio ladder." **The Studio carries
plays it didn't make. The ladder is for new plays only; reverse-derived
ones are a parallel class.**

### H9 — `examples/` directory mentioned but unread
README "Layout" lists `examples/` ("worked example briefs to imitate")
and `2f` description references "plays/examples/" — but I didn't open the
directory and the docs don't say what canonical shape an example is. Punt
to "look at frame-the-problem instead."

### H10 — Inheritance has a "promotion" notion with no current promotee
`inheritance/quarantine/` holds graph-era conventions; PROJECTION.md §10
records which survived the verification pass into the load-bearing
projection rulebook. The remaining quarantined items are "stays quarantined
until Slice 2." There's a real lifecycle (quarantined → promoted) but
nothing currently sits mid-flight. **A real workflow with no current work.**

### H11 — Placeholder spelling has a graveyard
`__AX_…__` is current; `__AX2_…__` is dead (from the ax-next → ax rename).
The runtime substitutor "never matches" the dead one — a play authored
with the wrong spelling silently ships unrendered placeholders. Multiple
docs (RUNTIME, PROJECTION §3, BIG-EDIT, AUTHORING) repeat this rule.
**The repetition itself is evidence the trap is real and recently bit.**

### H12 — Two registries called "registry"
`registry.js` is the play identity table. `registry.html` is the rendered
golden-path chain. PLAY_MANIFEST in `packages/ax-next/src/domain/plays.ts`
is **another** registry — the runtime's, what makes `ax run <slug>` actually
work. **The studio's source-of-truth and the runtime's source-of-truth
both exist; banking is the act of syncing them.**

### H13 — The director is also a character
The director is the human user, but in the frame-the-problem story.md /
synopsis.md, "the director" is also the name of an in-fiction persona
(the person handing Raven material). **Same word, two altitudes.** This
isn't a doc bug; it's a deliberate echo (the play is also about its user).

---

## What the docs explicitly punt to author judgment

- Decomposition granularity at Gate 2 ("a coarse graph is a legitimate
  projection") — Director's call, with the read-out in hand.
- Spoken word ceilings (75 / 100 / 120) — "delegated to orchestrator
  judgment" per play.
- Whether `goal_gate=true` should land on a checker the run might skip
  (PROJECTION.md §11 gap 5: "Test on the factory when convenient").
- Whether a reverse-derived play needs the studio ladder retroactively.

These are healthy punts (someone has to decide); flagged for completeness
because Pass-2 (DDD) needs to know where the language is **author
discretion** vs **bounded-context-defining**.
