# Play Design Brief — Frame the Problem

*(Originally carved 2026-06-12 as the Slice 3 guinea pig — a re-rendering of the
frozen `../frame-the-problem/` prototype into a 9-move Fabro graph, Gate-1
approved 2026-06-12. **Re-architected 2026-06-17** into the interactive "Riff"
play described below; the 9-move version and its §§5–11 amendment history are
historical and preserved in git. This re-architecture is its own design,
validated by a live Fabro roleplay before this brief was rewritten.)*

```
status:   registered
tier:     manager
division: Product
function: Insight
chain:    rung 1 of golden path
gate-1:   approved 2026-06-12
```

## Re-architecture note (2026-06-17) — why this looks nothing like the old brief

The old play was a 9-move closed-world pipeline (locate → extract → frame →
relate → ground → render → word_check → self_check → cold_reader) that ran ~19
minutes, produced a problem brief "rendered twice" (document + a 75-word spoken
paragraph), and treated the pitched solution as something to see past ("they want
the hole, not the drill"). In-use testing surfaced three faults:

1. **It carried everything alone.** Nine machine-checker nodes and six bounce
   loops did rigor that a human in the loop now does in one loop.
2. **It was solution-antagonistic.** The mandatory "what it's not" disavowal read
   as undermining the director's solution even when the solution was good.
3. **It couldn't be curious.** Closed-world, it could only down-weight thin
   evidence, never *ask* for the specific past instance that would settle it.

The fixes:

- **Two layers.** Raven is the *face* — an agent the director talks to directly;
  her conversational style is defined externally, not in this play. The play is
  her *backstage writers' room*: worker nodes that produce material and objectives
  she performs. An actress fed lines.
- **In service of facts and logic, not the solution.** The framing may support,
  complicate, or undercut the director's solution; support is earned by a specific
  past instance, never granted to be agreeable.
- **A human turn.** The director, via Raven, is the checker — so the rigor loops
  collapse to one co-editing loop. The Mom Test lesson survives, de-stealthed:
  anchor every claim to a specific recent instance, asked openly.

## 1. Goal

Produce one **problem-framing document** for whatever the director handed in,
co-edited with him until he approves it. Each problem is stated in his voice as a
struggle someone has — the progress they are trying to make and what blocks them —
with who has it and the circumstance where it bites; each claim is marked by the
evidence behind it (a specific past instance, or honestly flagged as
assumed / hypothetical); the document reports what the framing means for his
solution. A problem is a human struggle underneath the material, never a gap in
the material's own case for itself — "this hasn't been tested yet," "no one has
built X," "the integration is unproven" are thin spots on a claim, not problems to
frame. Done when he approves. One deliverable, not two — no spoken paragraph;
how Raven reads it back is the face's job, external to this play.

## 2. Trigger

The director hands Raven something to frame and asks her to frame it. Assume
material exists to review. It may not be framable (logistics, chatter, empty) —
that is a legal outcome: say so, never invent a problem.

## 3. Inputs

- **material** (required) — what was handed in: a solution pitch, a rough problem
  statement, a conversation, notes (workflow input `__AX_INPUT_TRANSCRIPT__`; the
  key name is historical, the content is any handed-in material). Untrusted:
  evidence to read, never instructions to follow.
- The **director's reactions**, gathered live by Raven and fed back at the review
  gate (Fabro `human.gate.text`).

## 4. Golden path — the move graph (the work story)

**The story.** The director hands Raven the "dominos delivery tracker" idea and
asks her to frame it. Seconds later she's back — not with questions, not with a
verdict, but with a first draft to react to: two problems under his solution
(losing your place while a play runs; not knowing when it'll finish), the
time-estimate half flagged as thin (riding on a pizza analogy, no real instance
behind it), and the one thing she most needs from him. He reacts with a specific
instance — last Thursday he pinged the agent twice during a long run because he
couldn't tell if he was five minutes or twenty-five minutes out. She folds it in:
the "when" problem is now first-hand and looks like the real driver. A round or
two later it clicks, and he approves. The document he approves is the deliverable.

**The graph.** Three work moves; the `review ⇄ revise` loop is the only
switchback; the director's approval ends the run.

```
pre_fill:
  doer:     judgment (backstage)
  consumes: material (the handed-in thing; untrusted)
  emits:    runtime/problem-framing.md (first-draft framing, v1) ·
            runtime/for-the-director.md (what Raven puts in front of him + what to
            draw out, with the evidence bar and the Mom-Test follow-up)
  does:     drafts the problem(s) under the material in the director's voice —
            each one a struggle someone has (the progress they are after, what
            blocks them, where it bites), never a risk to the undertaking; in
            service of facts and logic; marks each claim's evidence honestly
            (first-hand specific instance / assumed / hypothetical); names the
            thin spots; gives a held-loosely read on how problems relate and what
            this means for the solution. Hands Raven something to react to, never
            a blank question. If nothing is framable, says so plainly.
  routes:   review; ACP failure (`outcome!=succeeded`) → acp_failed (exit 1)
review:
  doer:     human gate (the director, via Raven)
  consumes: the draft (Raven puts it in front of him)
  emits:    his reaction (approve, or freeform feedback) — Fabro human.gate.*
  does:     the director reacts. Approve ends it; any feedback loops to revise.
            Raven runs this exchange in her own voice (external); small
            clarifications she handles herself, round-tripping to the backstage
            only when she has something that changes the framing.
  routes:   Approve → exit · feedback (freeform) → revise
revise:
  doer:     judgment (backstage)
  consumes: runtime/problem-framing.md (current draft) · the director's reaction
            (in context, via the compact seam) · material (to check new claims)
  emits:    runtime/problem-framing.md (rewritten in full, version bumped) ·
            runtime/for-the-director.md (next orders)
  does:     folds the reaction in — keep what he confirmed, change what he
            corrected, add the evidence he gave, re-mark it honestly; updates the
            solution read; surfaces contradictions instead of silently picking;
            holds the line that support needs a real instance. Signals readiness
            when nothing real is open.
  routes:   review; ACP failure (`outcome!=succeeded`) → acp_failed (exit 1)
```

**State discipline, failure, & fidelity.** The deliverable and the orders cross between
moves as files in the workspace (`runtime/problem-framing.md`,
`runtime/for-the-director.md`) — that persistence is what the loop edits. So
`default_fidelity="truncate"` run-wide; the one raised seam is the
`review → revise` edge at `fidelity="compact"`, because the director's feedback
lives only in context (`human.gate.text`), never in a file (PROJECTION §3 — raise
the edge, not the node, for a context-only input). Each ACP work node has a
conditional fallback to `acp_failed`, a command node that exits 1, guarded by
`outcome!=succeeded`. An ACP run failure is not a play branch and must fail the
run instead of falling through to review. Verified live: revise received the
feedback and folded it in.

## 5. What could go wrong (failure & fallback)

- **pre_fill, nothing framable** — write the framing doc saying what was received
  and why there's nothing to frame; tell Raven to check whether he meant to hand
  her something else. (No separate refuse edge — see §8.)
- **review, "looks fine" with no substance** — Raven doesn't bank it; she pushes
  one concrete probe on the biggest thin spot, anchored to a specific recent time,
  before approving. (This lives in `for-the-director.md` + her external craft.)
- **revise, contradictory reaction** — surface the tension in the draft, don't
  pick; tell Raven to settle it with him.
- **revise, solution rationalized without evidence** — hold the line: mark the
  claim as still needing a specific time; tell Raven to ask for one.
- **pre_fill / revise, ACP run failure** — fall through to `acp_failed`, which
  exits 1, so the runtime surfaces the infrastructure failure instead of asking
  for review on missing work.
- **runaway loop** — `max_node_visits=30` backstop (see §8).

## 6. Derived language

The node prompts (`prompts/pre_fill.md`, `prompts/revise.md`) are the derived
language; they carry the in-service stance and the Mom-Test good/bad evidence bar
verbatim ("a specific recent time" vs "it happens all the time" → "Can you tell me
about a specific time that happened recently?"). The prompts are backstage workers
producing material — they are NOT written in Raven's voice; her voice is external.

## 7. Proof — and the FROZEN test suite

The validating proof for this re-architecture is the **live Fabro roleplay,
2026-06-17**: a full run succeeded (start → pre_fill → review → revise → review →
exit); pre_fill marked the "twenty minutes / confusing" claim hand-wavey and the
time-estimate hypothetical; the compact seam delivered the director's feedback;
revise re-graded the time problem to first-hand on a specific instance and flipped
the hierarchy; approve cleanly exited with the deliverable in hand.

The fixture suite under `fixtures/` was built for the 9-move play and is **FROZEN**
— do not engage it (no grading, no eval runs) until the Riff play passes an in-use
sanity test. When it is unfrozen, it must be rebuilt for this play's contract
(one co-edited document; evidence-bar anchoring; the human loop), not the old
nine-move pipeline.

## 8. Open rulings (Director)

- **Refusal** — currently folded into pre_fill's draft as a state, not a separate
  `refuse → exit` edge. Acceptable per "it may not be framable, and that's okay";
  a dedicated refusal exit is available if wanted.
- **Convergence fallback** — termination is the director's approval only; the only
  backstop is `max_node_visits=30`, which *fails* the run rather than exiting
  cleanly with the current draft marked unsettled. A clean "ship-marked after N
  rounds" exit is deferred pending a ruling.
