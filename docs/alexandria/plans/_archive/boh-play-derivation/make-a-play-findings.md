# Make-a-Play Findings — from the Back-of-House Walk dogfood

The dogfood's second deliverable: every friction, wrong output, or manual
intervention hit while trying to use make-a-play as the derivation engine for
`back-of-house-walk`. Per the mission fence, findings go to issues, not silent
workarounds. Evidence is file:line from the checkout on
`danversfleury/boh-play-derivation`, 2026-07-02.

Findings F1–F5 below were surfaced **before** launching a run — by reading the
shipped make-a-play runtime end to end — because they are blocking: they decide
*whether* a Phase-B run is even possible. They are not speculative; each cites
shipped code.

---

## F1 (blocker) — make-a-play cannot be pointed at any play but itself

`make-a-play`'s runtime is the PMS command `pms run make-a-play:design|build|prove`
(`packages/pms/src/cli/router.ts` only accepts the three module IDs;
`packages/pms/src/commands/make-a-play.ts:34` hard-codes
`const TARGET_PLAY = "make-a-play"` and builds every path from
`studio/plays/make-a-play` via `modulePaths()`). There is **no target-play
argument** anywhere in the router or command. So the mission's literal ask —
"run make-a-play against the back-of-house-walk brief" — has no entry point:
`pms run make-a-play:build` will only ever operate on make-a-play's own files.

Impact: the meta-play is a self-hosting bootstrap, not yet a general engine.
The §4 brief's premise (`ground consumes: play slot (name + intent)`;
"take a named-but-empty play slot to Live") is **unimplemented** in the runtime.

## F2 (blocker) — the handoff's `ax run make-a-play --review-level` path does not exist

The handoff names the engine invocation as `ax run make-a-play --review-level …`.
make-a-play was **evicted from `ax`'s PLAY_MANIFEST** in the PMS/Alexandria
boundary migration, Slice 1 (`packages/ax/src/domain/plays.ts:17-29` — the
PlayId union does not contain `make-a-play`). `ax run make-a-play:design` fails
the `isKnownPlayId` check. The `--review-level` runner is the composed
interactive play (`packages/pms/src/domain/make-a-play-review.ts`,
`renderMakeAPlayReviewWorkflow()`), which per `packages/pms/CLAUDE.md` is
**"not wired to a runner yet; its PMS-owned fabro launch path is future work."**
So there is no review-gated make-a-play run to sit the director down in front of.

## F3 (blocker) — make-a-play `build` does not *derive*; it *lints a hand-authored package*

Even for make-a-play itself, `runBuild` does not project a §4 move graph into a
workflow package. It calls `lintModulePackages`
(`packages/pms/src/commands/make-a-play.ts:755-799, 455-537`), which validates
that make-a-play's **already-hand-written** `modules/*/workflow.fabro`,
`legs.json`, and `prompts/` are well-formed, then moves the board card to
`built`. There is no `derive` node in the runtime that reads a brief and emits
`workflow.fabro` + `prompts/`. The §4 `derive` node ("PROJECTION.md,
mechanically; never hand-edited") is aspirational — no such automation exists.

## F4 — "Derive" is an agent act, not a tool; `derive-views.sh` only renders views

`studio/tools/derive-views.sh` **requires** `workflow.fabro` to already exist and
only renders `diagram.svg` + `story.md` **from** it. PROJECTION.md is a rulebook
a human/agent follows by hand to author `workflow.fabro` + `prompts/` from brief
§4. That is how `frame-the-problem` was derived (hand-authored, then views
rendered). So "dogfood make-a-play as the derivation engine" resolves, today, to
"an agent hand-authors the workflow package following make-a-play's *canon*,
using the deterministic tools as the command-node checks" — there is no push-
button derivation to dogfood.

## F5 — the make-a-play module packages are decorative relative to the runtime

The `modules/{design,build,prove}/workflow.fabro` graphs declare ACP agent nodes
(`ground`, `draft_brief`, `harden`, `author_fixtures`, `grade`) with
`@prompts/*.md`, but the PMS command never launches those graphs through
Fabro/ACP — `runDesign` writes canned grounding/hardening/gate-packet text
(`make-a-play.ts:690-730`), `runBuild` lints, `runProve` evaluates the
auto-advance contract over `frame-the-problem`'s risk-map. The prompts also
hard-code make-a-play's own files ("Read the make-a-play brief"; "Revise
`studio/plays/make-a-play/brief.md`"). So the graphs/prompts are not the thing
that runs, and they are not parameterized over a target.

---

## Consequence for Phase B

The literal instruction ("dogfood the make-a-play runtime to derive BoH") is not
executable as written — the runtime is a make-a-play-only bootstrap with no
derivation and no wired review runner. That IS the dogfood's collected lesson:
make-a-play is not yet a general, runnable derivation engine. Per the honesty
rule, I stopped at this fork rather than hand-author BoH's workflow package and
call it a make-a-play run. Whether to proceed by running make-a-play's *process*
by hand (the frame-the-problem path — agent as judgment nodes, director on the
gates, tools as command nodes) is the director's knowing call. See the sit-down
options presented in the session.

---

## Phase-B derivation findings (hand-running the process)

The director ruled (2026-07-02) to hand-run the make-a-play *process* — agent as
judgment nodes, director on gates, deterministic tools as the command checks.
Authored `studio/plays/back-of-house-walk/workflow.fabro` (projected from brief
§4 per PROJECTION.md) + seven node prompts (from brief §6 per AUTHORING.md).
`fabro validate` → OK (10 nodes, 19 edges). `check-placeholder-spelling.sh` → OK.
Then the derive-time lint hit a hard wall:

## F6 (blocker at the derive gate) — the ACP-edge checker can't express brief §4's approved failure design, and contradicts PROJECTION §5

> **RULED 2026-07-02 → fix the checker (option a). RESOLVED in this branch.**
> `check-workflow-edges.py` now permits an explicitly-labeled designed route (a
> refusal, a FREEZE) or a visit-count escalation from an ACP node to the shared
> exit-1 sink **when the node still carries its `outcome!=succeeded` fail-closed
> edge** — the fall-through guard (rule 1) is untouched, so the invariant holds.
> Locked in by five new cases in `packages/pms/tests/studio-workflow-edge-guard.test.ts`
> (designed refuse passes; three-strikes passes; a labeled sink route with **no**
> fail-closed edge still fails; a bare unlabeled sink edge still fails; the BoH
> workflow passes). Brief §4 stays exactly as Gate 1 approved. This finding
> should still be filed upstream as a make-a-play canon issue (the checker
> contradicted PROJECTION §5) so the fix is tracked, not just carried here.


`studio/tools/check-workflow-edges.py` fails BoH's workflow on three edges:

```
line 85: survey -> acp_failed        (label "refuse")        needs a non-success outcome condition
line 98: emit_bundle -> acp_failed   (three-strikes, node_visit_count>=3)  needs a non-success outcome condition
line 103: check_bundle -> acp_failed (label "FREEZE")        needs a non-success outcome condition
```

The checker's model (`is_failure_sink` + `is_failure_condition`,
`check-workflow-edges.py:109-124,147-160`): **any** edge from an ACP-agent node
into the exit-1 sink MUST carry `outcome!=succeeded`; a conditioned edge that is
not a failure-sink edge MUST carry `outcome=succeeded`. So an ACP node can reach
the loud-failure sink *only* on an ACP outcome failure.

But brief §4 (Gate-1 approved) designs a single `acp_failed` node that "fails the
run loudly when any ACP work node returns a failure outcome, **or when survey
refuses, or when check_bundle freezes**," plus the §5 three-strikes escalation on
`emit_bundle` (`node_visit_count >= 3`). All three are **designed** fail-the-run
decisions made *inside ACP judgment nodes* — not failure-blind fall-throughs. The
checker cannot tell them apart from an unguarded fall-through and rejects them.

This is not fixable by edge-condition cleverness. A visit-count or preferred-label
edge to the exit-1 sink is flagged; routing three-strikes to `exit` instead is
flagged by the non-failure-sink rule (needs `outcome=succeeded`); adding
`outcome=succeeded` to a sink edge trips the failure-sink rule. The pattern is
structurally unavailable.

Two corroborations that this is a canon gap, not an authoring error:
- **No shipped play exercises it.** Across every plugin workflow, an ACP node
  reaches a `*_failed` sink *only* via `outcome!=succeeded`; every designed
  labeled decision that can fail the run is made by a **command** node
  (`route_grade`, `stage_next`, `apply_bundle_patch`). The established idiom is
  *agent decides → command node routes the decision (incl. to failure)*. BoH's
  brief §4 puts those decisions in agent nodes.
- **It contradicts PROJECTION.md §5.** §5's documented three-strikes pattern is
  "the bounce-receiving checker carries an escalation edge guarded by visit count
  … pointing at a hexagon Director gate (or at exit with the artifact marked
  failing)." check-workflow-edges.py rejects exactly that when the source is an
  ACP node and the target is the exit-1 sink. The canon tells you to build a
  thing its own gate forbids.

**Resolution is a director ruling** (it is graph-shape-adjacent, and the mission
fences "do not redesign the approved move graph" + "findings go to issues, not
silent workarounds"):
- **(a) Fix the checker** (canon tooling) to accept a designed labeled- or
  visit-count edge from an ACP node to the exit-1 sink when that node also has
  its `outcome!=succeeded` fail-closed edge. Keeps brief §4 exactly as approved;
  best honors "don't redesign the graph." Ship as an issue-fixed change to
  `check-workflow-edges.py`. **(recommended)**
- **(b) Amend brief §4** to the shipped idiom: survey/check_bundle emit
  decisions, deterministic command router nodes route them (incl. refuse/FREEZE
  to the sink), and three-strikes escalates from a command node. More faithful to
  the established Fabro pattern, but it re-opens the graph shape Gate 1 approved
  and adds ~2 nodes.

## F8 (self-review) — the brief's classification examples are fixture-domain, which AUTHORING forbids in a prompt

> **RULED 2026-07-03 → fix. RESOLVED.** Re-skinned **every** fixture-domain
> example across the prompts (not just `pass2_carve`) to a neutral freight-terminal
> domain no fixture uses: the `pass2_carve` category table + demotion/split
> examples, `translate_search_prior`'s `library-search-prior.v1` example,
> `pass1_events`'s event examples, and `emit_bundle`'s card / `workflows.json` /
> `threads.json` examples (the `hot-spot-two-ladders` example was the literal
> golden-studio H1 answer; now `hot-spot-two-gate-rules`). The nine categories and
> their definitions are unchanged (they trace to the brief). Legitimate play
> vocabulary stayed: the **director** is the play's real audience regardless of
> product, and `STAGE-2-BRIEF.md` / `HOT-SPOTS.md` / `READ-COHERENCE.md` are fixed
> deliverable names, not fixture answers. All lints green after re-derive. The
> underlying canon tension (brief §3 grounds anchors in product vocabulary;
> AUTHORING bans fixture content in prompts) is worth an upstream note so future
> derivations re-skin by default.


AUTHORING.md's gallery rule (Lint 4) is emphatic: *"A fixture's domain, speakers,
or content anywhere in the prompt is test contamination — a lint failure."* But
brief §3's canonical category table teaches classification "by analogy to worked
nouns" that ARE the Playmaker-Studio / Alexandria vocabulary — `Director, Author,
Play, Board, Move, Brief, Gate, Production Ladder, Tier, Pass Rate` — the exact
domain of the `golden-studio` and `golden-alexandria` fixtures. The `pass2_carve`
demotion example is worse: it names `"Play Run"` and `"Raven Connection"`, which
are the literal RE-5 fixture answers (brief §5 says these two must be *proposed
for demotion*; the prompt now hands the play that answer). A doer pattern-matches
the example to the fixture and copies rather than reasons, inflating the measured
pass rate above the true generalization rate.

This is a real tension **in the make-a-play canon**, surfaced by the dogfood: the
brief (a design instrument) deliberately grounds its category anchors in the
product's own vocabulary, but AUTHORING requires the *derived prompt* to re-skin
examples into a neutral domain no fixture uses (the exemplar uses fleet
maintenance). The two can't both hold for the classification table verbatim.

**Recommendation (director's call — it touches brief §3):** re-skin
`pass2_carve`'s classification "by analogy to" column and its demotion/split
examples into a neutral domain (e.g. a shipping port: Dispatcher, Container,
Manifest, Berth, a Gate, a Loading Cycle), keeping the nine categories and their
definitions (which trace to the brief). That removes the eval contamination while
staying faithful to the method. Held for your ruling — not applied — because it
reinterprets the §3 table's illustrations.

## F9 (the live rep's payoff) — every derive-time gate passed a workflow whose golden path never runs

Running the graded rep (the "one real rep" the mission owes) caught a routing
defect that **fabro validate, check-workflow-edges.py, AND fabro --dry-run all
missed** — the dry-run even reported `SUCCEEDED`.

The defect: `survey` has an unlabeled golden forward edge (`survey -> pass1_events`)
and a labeled, **un-conditioned** decision edge to the sink
(`survey -> acp_failed [label="refuse"]`). Both are un-conditioned, so both are
"unconditional fallback" candidates; Fabro's tie-break selects `acp_failed`
(`reason="unconditional"` in the run log). So on the **normal** path — survey
does its job, writes a valid `source-ladder.md`, emits no routing JSON — the run
routes to `refuse → acp_failed → exit 1` every time. The play's golden path never
executed. (The earlier dry-run "SUCCEEDED" *via this wrong path*, which is exactly
how the deterministic proof hid the bug.)

Only the live rep exposed it: a real agent produced a clean source-ladder that
obviously did *not* intend to refuse, yet the run failed as a refusal. A
simulated backend can't reveal an "agent did the right thing but was misrouted"
bug, because it has no right thing to do.

**Fix (verified):** weight the golden forward edge (`survey -> pass1_events
[weight=10]`) so it wins the unconditional-fallback tie-break, leaving `refuse`
selectable only by an explicit preferred-label — the frame-the-problem
`weight=10` idiom. Post-fix, the dry-run traverses the full path
(translate → survey → pass1 → pass2 → pass3 → emit → check → Exit). Re-derived and
re-banked.

**The make-a-play lesson (worth filing upstream):** a play can pass the entire
derive-time gate suite with a non-executing golden path. PROJECTION §4 should
name the rule (*a golden forward edge that competes with a labeled decision-to-sink
edge must carry a weight, or the decision edge must be conditioned*), and a
deterministic gate should flag a node with two un-conditioned outgoing edges to
different targets. The graded live run is not optional polish — it is the only
thing in the pipeline that catches a mis-wired golden path.

## F7 (minor) — brief §4 emit_bundle consumes-line drift

Brief §4 `emit_bundle` lists `consumes: … · manifest (for the output_path)`, but
the output directory is its own declared input `output_path`
(`__AX_INPUT_OUTPUT_PATH__`, brief §3) — the manifest does not carry it. The
derived `emit_bundle` prompt consumes `output_path`. This is a Protocol-E parity
wording drift to reconcile in brief §4 (a one-line brief fix, not a graph
change). Surfaced during derivation; folded into the gate review.

