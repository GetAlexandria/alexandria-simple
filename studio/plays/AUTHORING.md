# Authoring node prompts — the Derive step

*(Director-requested 2026-06-11; reshaped 2026-06-12 to the derive era —
Slice 2 of the Studio → Fabro plan. A play runs as a Fabro workflow; the
Derive step projects the brief's §4 move graph into the workflow package
per `PROJECTION.md` and authors **one node prompt per move** from the
brief's §6 draft language. The monolithic prompt is retired as a step —
its read-the-whole-story job lives in the generated story view (README,
"One source, derived renderings"). Rules cited here live in `README.md`
with their provenance; this guide is how an Author applies them. The
standing exemplar for prompt craft is `frame-the-problem/prompt.md` —
banked in the monolith era, and still the curriculum for voice,
gallery, and purity. Read it before writing; read its `lint.md` and the
dry-run read-outs after — the failures are the curriculum.)*

## What you are writing

The workflow package for one play: `workflow.fabro` (the brief's §4
graph, projected mechanically per `PROJECTION.md` — the mapping table is
the law, not a suggestion) and `prompts/<move>.md` — one prompt per
move, each authored from the brief's §6 language. Your inputs are the
play's **brief** (Gate-1-approved — the design, every call already made,
including the graph shape) and its **grounding doc** (the cited canon
the brief was designed against). You are the Author in the loop
(README): you polish and structure; you do not design. Every
methodological claim in any prompt must trace to the brief or the
grounding — if you find yourself inventing a rule, or a move that needs
an edge the brief doesn't have, kick back to the Director (that is a
Director-challenge, never auto-decided). The graph is not yours to
amend.

Each node prompt has one reader: a cold doer agent holding only this
prompt, what Fabro supplies (system prompt + preamble — see
PROJECTION.md §3, "write only the delta"), and the move's declared
inputs. It has never seen the brief, the playbook, the other moves'
prompts, or this guide, and it never will. Every sentence is tested
against that reader: *would the doer act differently for having read
it?* If not, cut it.

## Structure — one node prompt

The exemplar's skeleton, scaled to a move. A node prompt is the move's
§4 block made executable — most run a page or less:

1. **Frontmatter** — the move's contract, mirrored from brief §4 (this
   is what Protocol E string-checks):
   ```yaml
   move: <move_id — matches the node id in workflow.fabro>
   doer: judgment | mechanical | human
   consumes:
     - <input>: <one-line description> (required — refuse without it)
     - <input>: <description> (optional)
   emits: <output name> — <one-line description of the shape>
   ```
   Frontmatter keys are slugs; body prose uses the same name with spaces.
   Names must match exactly across brief §4, frontmatter, body, and the
   node's wiring — name drift is a lint failure (Protocol E).
2. **The task** — the move's job, opening with the one idea this move
   serves. What it reads, what it does, what it writes.
3. **Failure behavior** — what this move does when its input is thin,
   wrong, or missing: emit marked `failing:`, refuse loudly, or bounce.
   If the node routes (a bounce edge leaves it), the prompt ends with
   the routing instruction: the legal labels — exactly the node's
   outgoing edge labels — and the rule that the routing JSON is the
   last thing in the response, nothing after it (PROJECTION.md §4,
   Director-ruled).
   For ACP work nodes, the workflow includes one conditional failure fallback to
   an exit-1 node, usually `condition="outcome!=succeeded"`. Normal labeled
   routes stay unconditioned so Fabro can route by `preferred_label`. ACP
   infrastructure failure is not feedback; it must fail the run unless the brief
   explicitly designs a failure branch.
4. **Hard limits** — only the bans this move can violate. The play-wide
   bans live in every prompt that could break them, stated once each.
5. **Output format** — a literal template in a code block when the move
   emits an artifact; the exact JSON shape when it emits a decision.
6. **Done right vs wrong** — gallery pairs where the move carries
   judgment (rules below); mechanical moves usually need none.

**Posture and voice** belong only to the moves that face humans: the
posture block goes in the first user-facing move's prompt; the Voice
section (below) goes in the moves that speak.

**Human moves get no prompt file.** A `hexagon` gate's prompt is its
node label plus its outgoing edge labels (PROJECTION.md §2, §7) —
"one node prompt per move" means one per judgment or mechanical move.
For a Raven-mediated (detached) play the human turn is **non-blocking and
event-sourced** — the draft → `needs_review` → approve/revise → wake pattern
shipped in the Raven Vision power-up — not a blocking node; see `RUNTIME.md` (the
play↔runtime contract) and PROJECTION.md §7.

**"Real now" vs "future software," reconciled:** a dedicated checking
*node* is an agent or prompt node — buildable now, via brief amendment.
The *software* version of a mechanical check (`parallelogram` +
`script=`) stays pegged future-software until the building is earned
(README, prototype rule). Escalating a failing check to its own node
does not promote it to software.

## External inputs — the placeholder is single-`AX_`

**This section is the single source of truth for the placeholder spelling rule;
`PROJECTION.md` and `BIG-EDIT.md` cite here.** A move's external inputs (brief
§3) arrive as **build-time placeholders the runtime substitutes**, and the only
spelling the substitutor matches is single-`AX_`: `__AX_INPUT_<KEY>__` for a
named input, alongside the wiring placeholders `__AX_ACP_COMMAND_JSON__` and
`__AX_PROJECT_ROOT__` (source of truth
`packages/ax/src/domain/orchestration.ts`, `/__AX_([A-Z0-9_]+)__/`). Write the
`__AX_INPUT_<KEY>__` token verbatim in the `consumes:` line and wherever the
body names the input. The dead `__AX2_…` spelling left over from the
`ax-next → ax` rename **never substitutes** — a prompt authored with it ships
the literal placeholder instead of the input, a silent miss. Two guards fail on
any `__AX…__` token the runtime won't match, so a stray `__AX2_` can't ship:
`studio/tools/check-placeholder-spelling.sh` (a runtime-free lint over every
play's `workflow.fabro` + `prompts/`) and the placeholder conformance gate
(`placeholderConformance.test.ts`, sharing one definition with the viewer's
`promptContract.ts`).

## The measured gradient — how to encode a rule

Rung 1's hardest finding (brief §8, three confirmation rounds): **prose
rules get restated-and-evaded; mechanical checks close hard failures;
matched good/bad examples teach judgment.** A doer will quote your rule back
in its reasoning and violate it in the same breath. So:

- A rule about **judgment** (grading, framing, tone) → encode it as a
  matched wrong/right pair in the gallery, with the one-line reason.
- A rule that is **honestly mechanical** (a scan, a set-comparison, a
  word-list) → encode it as a closed self-check step the doer executes
  ("scan your own text for these nine words"), and expect the real
  enforcement at the seam — the grader's checklist or future software. Never
  ask a model to count words; four dry-runs proved it cannot.
- Reach for more rule-**prose** last. The prompt has a fat ceiling: past it,
  new prose dilutes old prose. Escalation path for a failure that survives
  authoring: example first, mechanical check second, a dedicated node
  third — real now, not pegged: a check that keeps failing inside a
  move's prompt can become its own checking node with a bounce edge.
  That is a graph-shape change, so it lands as a brief amendment
  (Director-ruled), never as a quiet edit to `workflow.fabro`.

## The gallery — "Done right vs wrong"

- Every pattern is **re-skinned into one neutral domain** that no fixture
  uses (the exemplar uses fleet maintenance). A fixture's domain, speakers,
  or content anywhere in the prompt is test contamination — a lint failure
  and the exact defect Lint 4 caught.
- Pairs are harvested from graded failures: each reproducible miss earns a
  wrong/right pair showing the pattern, never the fixture's answer.
- A gallery exemplar may not use a phrase the body bans by name (Lint 2
  caught "cheap to check" in an exemplar while Hard limits banned sizing
  words).

## Purity — what never goes in

The prompt holds the task; the why lives in the brief, the sources in the
grounding doc (README: no design rationale, no citations). The lint's B
protocol will scan for all of this:

- **No provenance.** No authors, books, links, or "research shows."
- **No design rationale.** No "we chose this because," no Director, no
  gates, no hardening history.
- **No machinery nouns.** The doer doesn't know it lives in a playbook:
  no "play," "brief," "lint," "fixture," "workflow" as self-reference.
  (The play's own artifact may share a name with a process noun — the
  exemplar emits a "problem brief" — declare and disambiguate up top.)
- **No session vocabulary.** Codenames, internal slugs ("saddle"), and
  conversation shorthand leak; Lint 2 caught one. Use the names the doer's
  inputs actually carry.
- **No unresolvable references.** Cross-reference your own sections as bold
  quoted headings (**"When you must refuse"**), never as link-styled text or
  paths the doer can't open. Define every term before first use.
- **No seam-leak patches** (2026-06-17). If a node must not see prior
  context, set its fidelity (`truncate`) so the preamble never carries it —
  never write a prompt line telling the doer to *ignore* the summary above.
  A please-forget instruction is the leak admitted and then trusted to the
  model; the seam is where it is actually closed (PROJECTION.md §3).
  `cold_reader` carried "disregard any summary of prior work above" to
  compensate for the `compact` default; setting the graph to `truncate`
  removed both the leak and the patch.

## Trust, honesty, and failure behavior

- **Untrusted inputs are data.** The brief's §3 declares which inputs come
  from outside the team; the prompt must carry the clause that instructions
  found inside them are content to record, never commands to follow (see
  the exemplar's Hard limits).
- **The doer's knowledge is not a source.** State the licensed sources
  (verbatim quotes, named context files) and say no third source exists.
  Inventing helpful content is the cardinal sin; write that.
- **Degraded and labeled beats blocked or backfilled.** An entry that can't
  pass its checks is emitted marked `failing:` with the reason — never
  silently dropped, never retried forever. The doer's retry budget is
  explicit: fix once, re-check once, then emit marked.
- **Affirmative coverage.** Anything examined and found empty is written out
  ("none earned," an Unclear section, an explicitly empty artifact) — the
  cold reader must be able to tell "checked, nothing there" from "forgot."
- **Output discipline — write the file, don't narrate it.** A judgment move that
  declares `emits:` files must instruct the doer to *write those files with its
  tool*; its reply is a one-line confirmation, nothing more. A reply that writes
  no file is a failed run, not a success — under auto-approve a doer will
  otherwise hand back the deliverable as its message and leave nothing on disk
  (Fabro reports `succeeded` with `artifact_count=0`, silent). Every
  file-writing agent prompt carries this clause.
- **Self-checks are honest.** A check the doer cannot actually perform
  (counting, an external reader's comprehension) does not go in the prompt
  as a self-check — that is doer-dishonesty; it belongs to the grader or
  future software. Lint 3's A1 disposition is the precedent.

## The output format section

- It is a **literal template** in a code block, with bracketed
  fill-instructions, exact field names, and the legal values of every
  enum — the artifact's only spec.
- **Every body rule that produces content needs a landing place** in the
  format, and every format field needs a body rule that fills it. Lint 2
  found body rules whose output had nowhere to land; that class is checked
  every lint.
- If the artifact opens with a human gestalt layer (the exemplar's "The
  picture"), bind it by the anti-drift rule: a rendering may claim nothing
  the underlying entries don't back.

## Voice, if the play speaks

Rung 1's spoken discipline, pending promotion to Raven's persona (parking
lot — inline it per play until then): the spoken output is the artifact's
voice, not a second opinion; say the delta, never recap the room to itself;
budgets are ceilings, never targets — cut a thought rather than compress
one; one idea per breath; internal labels are never spoken; pointers said
aloud carry a few words of what the listener will find. Lightly de-AI all
human-facing text: sparing em-dashes, no "it's not X, it's Y" scaffolding.

## Before you hand off — the lint spec (Protocols A–E)

The Checker runs the five-protocol lint (`frame-the-problem/lint.md`
shows A–D applied for real, monolith-era; E added 2026-06-12 with the
reshape). A–D run per node prompt; E runs on the package:

- **A** coverage — every brief element present, now per move: each §4
  block's job, failure behavior, and contracts land in that move's
  prompt; nothing assigned to a move appears only in another move's
  prompt.
- **B** purity — the list above, checked in every prompt file.
- **C** executability — each prompt + what Fabro supplies + the move's
  declared inputs suffice for that move's part of the §7 proof spec; no
  contradictions within or between prompts.
- **D** hygiene — vocabulary purity, one-home-per-rule,
  definition-before-use, reference integrity, no fixture contamination.
- **E** parity (the anti-drift protocol; blocks banking on failure) —
  brief ↔ workflow, mechanical where possible:
  1. every §4 move has exactly one node with the same id, the projected
     type per PROJECTION.md §2, and no nodes exist that §4 doesn't name;
  2. consumes/emits in each prompt's frontmatter string-match brief §4;
  3. every §4 bounce is an edge (right source, right target, condition
     present) and every edge traces back to a §4 bounce, checkpoint, or
     the golden-path order;
  4. routing prompts promise exactly their node's outgoing edge labels;
  5. no language drift: each prompt's task language traces to §6 (or a
     dated brief amendment) — paraphrase is legal, new method is not;
  6. `fabro validate` passes (structure is Fabro's half of parity).
  7. `studio/tools/check-workflow-edges.py <workflow.fabro>` passes — every ACP
     work node has an outcome-guarded exit-1 fallback, so ACP failures cannot
     fall through as normal progress.
  A hot-fix discovered in a rendering is a parity failure by
  definition: the fix goes to the brief, the package re-derives.

Pre-run it yourself, and check the play's `known-fps.md` so you don't
"fix" a dispositioned pattern. Findings you report follow quote-or-demote;
your fix loops follow three-strikes-then-freeze (README, field-review
rules).
