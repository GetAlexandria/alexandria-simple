# Hardening — Frame the Problem (Riff play)

Hardener: fresh-eyes agent, 2026-06-18. Scope: the **Riff** graph shape and
state flow — `start → pre_fill → review (human gate) → exit` on Approve, with
the single `review ⇄ revise` switchback on feedback. This is a fresh pass on
the re-architected play; it supersedes the retired 9-move hardening (the SUPERSEDED
banner is gone). No 9-move-specific finding is carried forward — the locate/
extract/frame/relate/ground/render/word_check/self_check/cold_reader graph and
its six bounce loops no longer exist.

Method: state audit per move (consumes/emits chaining, including the
`review → revise → review` re-entry path); human-gate edge-label → route mapping;
fidelity-seam correctness (the one raised seam); termination (approval ends, loop
bounded by `max_node_visits` / `stall_timeout`); and a structural smoke
(`fabro validate`). Inputs read: `brief.md` (§§3–5, §8), `workflow.fabro`,
`prompts/pre_fill.md`, `prompts/revise.md`, `moves.md`, `story.md`, `diagram.svg`,
`known-fps.md`.

Verdict: **the Riff graph is clean on shape and state flow.** Termination and
bounded-loop machinery are present and correct. One low-severity robustness gap
(H1, the convergence-fallback ruling is still open per brief §8) and one note
(H2, `stall_timeout`/per-node `timeout` present in the workflow but unmentioned in
the brief). No blocking findings. *(The placeholder-spelling seam the lint owned —
the dead `__AX2_` in the studio copy — was resolved 2026-06-18; the workflow now
carries single-`AX_`, matching the runtime.)*

## The graph under audit

```
start -> pre_fill                                   (golden path)
pre_fill -> review                                  (golden path)
review -> exit   [label="[A] Approve", weight=10]   (terminate)
review -> revise [label="[R] Revise",
                  freeform=true, fidelity="compact"] (the one switchback)
revise -> review                                    (re-entry)
```

`pre_fill` and `revise` are agent nodes (default `box` shape, `backend="acp"`,
`acp.command=__AX_ACP_COMMAND_JSON__`) — correct per PROJECTION §2 for judgment
moves that read/write files (they edit `runtime/`, so they need tools). `review`
is the `hexagon` human gate. `start`/`exit` are the single `Mdiamond`/`Msquare`.
`fabro validate`: **OK (5 nodes, 5 edges)**.

## Check 1 — state that can't flow (consumes/emits chaining)

State crosses moves as two workspace files plus one context-only value:
`runtime/problem-framing.md` (the deliverable the loop edits),
`runtime/for-the-director.md` (Raven's marching orders), and the director's
reaction (`human.gate.text`).

- **`pre_fill` inputs.** Consumes only `material` (`__AX_INPUT_TRANSCRIPT__`),
  which exists at run start — the trigger guarantees handed-in material (brief §2).
  Emits both runtime files. No upstream dependency unmet. **Clean.**
- **`review` inputs.** Consumes "the draft" — the file `pre_fill` (or `revise`)
  just wrote. Always present when the gate is reached (its only inbound edges are
  `pre_fill -> review` and `revise -> review`, both of which write
  `problem-framing.md` first). **Clean.**
- **`revise` inputs — the load-bearing check.** Brief §4 declares three
  consumes: the current draft file, the director's reaction (in context), and
  `material`. All three are reachable at the node:
  1. `runtime/problem-framing.md` — written by `pre_fill` on the first cycle and
     by `revise` itself on later cycles; it persists in the workspace across the
     `truncate` default because it is a *file*, not preamble context. Present.
  2. The director's reaction — carried in context by the `review → revise` edge's
     `fidelity="compact"` seam (the only path into `revise`). `revise.md` reads
     it as "the most recent human input." Present **only via that seam** — see
     Check 3.
  3. `material` (`__AX_INPUT_TRANSCRIPT__`) — a run input, available at every
     node. Present.
  `revise.md`'s frontmatter declares exactly these three. **Clean — `revise` has
  what it needs to fold the reaction in: the live draft, the feedback, and the
  original to check new claims against.**

No move reads a value that no upstream move emits; no emitted value is orphaned
(`for-the-director.md` is the cross-cycle objective handoff Raven performs, and
`problem-framing.md` is the deliverable banked at exit). **No broken chain.**

## Check 2 — bounces and routes (human-gate edge labels drive the routes)

The play has exactly one branch point, the `review` gate, and one switchback.

- `review -> exit [label="[A] Approve", weight=10]` and
  `review -> revise [label="[R] Revise", freeform=true, fidelity="compact"]`.
  Per PROJECTION §7, a hexagon's options *are* its outgoing edge labels, and the
  selection routes via `preferred_label`. The two labels match brief §4's
  `routes:` line for `review` (`Approve → exit · feedback (freeform) → revise`)
  and `moves.md`'s two `↳` branch stories. **Mapping correct.**
- **`weight=10` on the Approve edge** orders it first, so `--auto-approve` (smoke/
  dry-run) selects the safe terminating choice — exactly PROJECTION §7's rule
  ("order the edges so the first option is the safe one"). **Correct.**
- **`freeform=true`** on the Revise edge lands the director's text at
  `human.gate.text` (PROJECTION §7) — the value the seam then carries to `revise`.
  Consistent with brief §3 ("gathered live by Raven and fed back at the review
  gate"). **Correct.**
- **Gate fails closed.** No implicit-approval edge exists; the gate advances only
  on an explicit Approve/Revise (PROJECTION §7, "Fabro does not treat missing
  input as approval"). **Correct.**
- **No missing bounce.** Brief §5's failure rows are *content* dispositions
  handled inside the prompts (nothing framable → written into `pre_fill`'s draft;
  "looks fine" with no substance, contradictory reaction, rationalized-without-
  evidence → handled in `for-the-director.md` + Raven's external craft). None of
  them demands a new edge — brief §8 explicitly folds refusal into `pre_fill`'s
  draft rather than a separate `refuse → exit` edge, an accepted Director ruling.
  **No bounce is missing or misdirected.**

The non-routing nodes (`pre_fill`, `revise`) each have exactly one unconditional
outgoing edge, so they need no routing JSON (PROJECTION §4, unconditional
fallback). Correctly, neither prompt carries a routing-instruction block — adding
one would be the over-specification PROJECTION §4 warns against. **Clean.**

## Check 3 — fidelity correctness (the compact seam)

`default_fidelity="truncate"` run-wide (graph attribute) is correct for an
artifact-passing play: every file-passed input is read from the workspace, so the
preamble summary is noise on `pre_fill` and would be a partial-context leak on
`revise` if it rode the default (PROJECTION §3, lever-down baseline).

The single raised seam is `fidelity="compact"` on the `review -> revise` edge.
This is the textbook PROJECTION §3 case: the director's reaction lives **only** in
run context (`human.gate.text`) and cannot be read as a file, so the one inbound
path that needs it raises *the edge, not the node*. `revise`'s other entry
conditions (none — it has a single inbound edge) stay at baseline by construction.
Verified against brief §4's "State discipline & fidelity" paragraph and the
live-roleplay proof (brief §7: "the compact seam delivered the director's
feedback"). **Correct, and minimal — `compact` rather than `full`+`thread_id`,
because only the latest human message is needed, not the whole upstream thread.**

One subtlety worth recording: `compact` carries a *summary* of prior stages, not
just `human.gate.text`. For `revise` this is benign (it is not a blind/adversarial
node — it is openly editing a draft it also reads from file), so there is no
seam-leak to patch and, correctly, no please-forget instruction in `revise.md`
(AUTHORING.md's no-seam-leak-patches rule). **No leak.**

## Check 4 — termination and bounded loop

- **Approval terminates.** `review -> exit` on Approve is the designed end; the
  banked deliverable is `runtime/problem-framing.md` (brief §1, one deliverable).
  There is no path that exits without passing the human gate, so nothing banks
  unapproved. **Correct.**
- **The loop is bounded.** `max_node_visits=30` (graph attribute) caps the
  `review ⇄ revise` cycle at the engine level; `stall_timeout="2h"` and per-node
  `timeout="20m"` on `pre_fill`/`revise` bound wall-clock. The visit cap matches
  brief §5/§8 (`max_node_visits=30` backstop). **Bounded.**

### H1 — convergence backstop fails the run rather than banking marked (low; open ruling)

Severity: low. Disposition: **acknowledged, deferred to the open Director ruling
(brief §8).** When the loop hits `max_node_visits=30`, Fabro fails the run with
"run is stuck in a cycle" (PROJECTION §5) — it does **not** exit cleanly with the
current draft marked unsettled. Brief §8 names this exactly: "the only backstop is
`max_node_visits=30`, which *fails* the run rather than exiting cleanly with the
current draft marked unsettled. A clean 'ship-marked after N rounds' exit is
deferred pending a ruling." This is a known, documented design hole, not new
drift. It is low-severity because 30 review rounds is far beyond any realistic
co-editing session (the live proof converged in two). If the Director wants a
graceful degraded exit, the fix is a brief amendment adding a visit-count
escalation edge (`context.internal.node_visit_count >= N → exit`, artifact marked
unsettled) one visit below the backstop — PROJECTION §5's designed-handoff
pattern. **No action this pass; flagged so the gate sees it.**

### H2 — `stall_timeout` / per-node `timeout` present in workflow, absent from the brief (note)

Severity: note. Disposition: **below the parity bar; recorded for completeness.**
`stall_timeout="2h"` and `timeout="20m"` appear in `workflow.fabro` but are not
mentioned in brief §4/§5/§8. These are run-robustness attributes (weather, not
play logic — PROJECTION §5's retries-are-weather distinction), so they do not
constitute a Protocol-E node/edge/route/fidelity drift. They strengthen, rather
than contradict, the brief's termination story. No fix required; if the studio
wants the brief to be the single source for *all* run config, add a one-line note
to §4's fidelity paragraph at the next brief touch.

## Coverage attestation

All three work moves state-audited including the `review → revise → review`
re-entry path; the single switchback walked for fix-capacity (revise has draft +
feedback + material) and for counter semantics (`max_node_visits` backstop);
both human-gate edges checked label-to-route against brief §4, `moves.md`, and
`diagram.svg`; the one raised fidelity seam checked against PROJECTION §3 (raise
the edge, context-only input, no blind node, no seam-leak patch); termination
checked (approval-only exit, no unapproved bank, bounded loop). `fabro validate`
clean. Two findings recorded (H1 low/open-ruling, H2 note); no blocking finding;
the graph shape and state flow are sound.
