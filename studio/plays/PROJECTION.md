# PROJECTION.md — move graph → Fabro workflow

**Status: ADOPTED — Director ruling, 2026-06-12 (relayed by Jess),
closing Slice 1 of the Studio → Fabro plan.** All three queue decisions
ruled the recommended way: adopt as written (D1); ACP bounce routing is
routing JSON last in the response text (D2); mechanical moves without
software run as `tab` prompt nodes (D3). The decision briefs are
preserved in §12 with RULED stamps. This document is now load-bearing
for the Derive step; the quarantine promotions in §10 are effective.

Provenance: written 2026-06-12 under
`docs/alexandria/plans/_archive/playmaker-studio-fabro/plan.md` (Slice 1).
Grounded against the vendored Fabro docs at `repos/fabro/docs/public/`,
refreshed the same day via `pnpm run subtrees:update` (upstream fabro
commit `62486c81033`). The quarantined graph-era conventions
(`../inheritance/quarantine/conventions/`) were audited claim-by-claim
against those docs; dispositions in §10. Citation discipline: every
Fabro claim in this document carries a doc path under
`repos/fabro/docs/public/`, or is marked **[unverified]**. The working
wire-up referenced throughout is
`packages/alexandria-next-plugin/workflows/source-assessment/workflow.fabro`
(registered in `PLAY_MANIFEST`, runs via `ax2 run source-assessment`
through the embedded factory ax2 boots).

## 1. What this is

When a play's brief §4 is authored as a move graph (doers, contracts,
bounces, gates), the Derive step projects that graph into the workflow
package: `workflow.fabro` + `prompts/<move>.md` + run config. This
document is the projection rulebook — which studio construct becomes
which Fabro construct, and why we trust each mapping. It governs the
Derive step the way `AUTHORING.md` governs prompt writing.

Derive also emits two **derived renderings** alongside the package, both
generated from the same sources so neither can drift (README, "One
source, derived renderings"):

- `diagram.svg` — the play drawn, by `fabro graph workflow.fabro -o
  diagram.svg` (§9, and `reference/cli.mdx`).
- `story.md` — the play read as one story (golden path in order, each
  move's prompt inlined), by `studio/tools/generate-story.py <play-dir>`,
  which assembles from brief.md §4, `workflow.fabro`, and `prompts/`.

Both run together via `studio/tools/derive-views.sh <play-dir>`. They are
review surfaces, never inputs to a run and never hand-edited. Re-deriving is
step 2 of the large-edit sequence — see `BIG-EDIT.md` for the full ordered
playbook (edit → derive → re-tune → re-audit → sideline → bank).

It does not cover: how to grade node prompts (Slice 2 territory), play
content, or the remote Railway factory (out of scope by plan §8).

## 2. The projection at a glance

| Studio construct (brief §4) | Fabro construct | Citation |
| --- | --- | --- |
| Play | a named `digraph` in `workflow.fabro` | `reference/dot-language.mdx`: "Every workflow is a `digraph` (directed graph) with a name and a body of statements" |
| Play entry / end | exactly one `start [shape=Mdiamond]`, one `exit [shape=Msquare]` | `workflows/stages-and-nodes.mdx`: "Every workflow must have exactly one start node." / "…exactly one exit node." |
| Judgment move, needs tools (reads files, runs things) | agent node — `box` (the default shape) | `workflows/stages-and-nodes.mdx`: "Runs an LLM with access to tools — bash, file editing, sub-agents — in an agentic loop." |
| Judgment move, pure reading/judging (no tools) | prompt node — `tab` | `workflows/stages-and-nodes.mdx`: "Makes a single LLM call with no tool use. Useful for analysis, summarization, generation, and lightweight reasoning." |
| Mechanical move with shipped software | command node — `parallelogram`, `script=` | `workflows/stages-and-nodes.mdx`: "Runs a shell script inside the configured sandbox and captures its output." |
| Mechanical move, software not yet built | prompt node (`tab`), pegged **future software** in the play's upgrade notes | studio rule (prototype rule of thumb, `README.md`), node semantics cited above |
| In-play human decision (the play's own checkpoint) | human gate — `hexagon`; the choices are the outgoing edge labels | `workflows/human-in-the-loop.mdx`: "A human gate is a node with shape `hexagon` that pauses the workflow and presents the user with a choice. The options are derived from the outgoing edge labels" |
| Bounce (checker kicks work back to the move that owns it) | condition-labeled edge back to the owning node | `workflows/transitions.mdx` (edge conditions); routing mechanics in §4 below |
| Three-strikes-then-freeze | visit-count edge to a Director gate + `max_visits` backstop | `execution/context.mdx` (`internal.node_visit_count`), `execution/failures.mdx` (`max_visits`); detail in §5 |
| Enforceable §7 proof check | checking node with `goal_gate=true` + a `retry_target` | `execution/failures.mdx`: "A node marked with `goal_gate=true` must have completed with `succeeded` or `partially_succeeded` — otherwise the run cannot finish."; detail in §6 |
| Move prompt | `prompts/<move>.md`, attached via `prompt="@prompts/<move>.md"` | `agents/prompts.mdx` (example `prompt="@prompts/implement/plan.md"`); `reference/dot-language.mdx`: "The `@` prefix tells Fabro to load the referenced file relative to the workflow file" |
| The play's goal (brief §1, one line) | graph attribute `goal` | `reference/dot-language.mdx` graph-attribute table: "`goal` … Workflow objective — guides agent behavior" |

The ladder's two Director gates (Gate 1, Gate 2) are **not** projected —
they live outside the run, on the Board. Only checkpoints that are part
of the play's own logic become hexagons (plan §5, gate-load row).

## 3. Node conventions

**Write only the delta.** Fabro already supplies the doer a system
prompt (identity, environment, tool guidance, project docs) and — at
every fidelity except `full` — a preamble carrying "The workflow goal /
A summary of completed stages … / Non-internal context values"
(`agents/prompts.mdx`, `execution/context.mdx`). A move prompt is only
the task that remains. (This was the quarantined standard's core rule;
it survives because the docs now verify the mechanism it depends on —
see §10.)

- **One node, one move, same name.** The node id is the move name from
  brief §4 (`locate`, `extract`, …). Node ids must start with a letter
  or underscore (`reference/dot-language.mdx`).
- **Every node gets a readable `label`.** If no `prompt` is set, Fabro
  falls back to the label as the prompt — "convenient for simple nodes
  but not recommended for production workflows"
  (`agents/prompts.mdx`) — so every agent/prompt node also gets an
  explicit `prompt="@prompts/<move>.md"`. Validation enforces this:
  "LLM nodes (agent, prompt) have a `prompt` attribute"
  (`reference/dot-language.mdx`).
- **Prompt files are authored from the brief's §6 draft language**, one
  per move, under `prompts/` next to `workflow.fabro` (resolution is
  relative to the workflow file, `agents/prompts.mdx`). `@file`
  references are checked at parse time: "if the referenced file does
  not exist, validation fails with a clear error"
  (`reference/dot-language.mdx`).
- **Backend.** On the embedded factory (the Fabro ax2 boots — the only
  factory plays run on, operator ruling 2026-06-12), agent nodes run
  over ACP:
  `backend="acp"` with exactly one of `acp.command` / `acp.config`
  ("Mutually exclusive", `reference/dot-language.mdx`). ACP is
  agent-only and rejects API-only model/provider attributes (`model`,
  `provider`, `reasoning_effort`, `max_tokens`, `speed`):
  "ACP is restricted to `agent` nodes and rejects API-only
  model/provider attributes" (`changelog/2026-05-18.mdx`). "Prompt
  nodes are API-only" (`reference/dot-language.mdx`) — so a `tab` move
  needs an API provider configured even on the embedded factory. The
  deployable form never hardcodes the agent command: the graph carries
  `acp.command=__AX_ACP_COMMAND_JSON__` and ax injects the configured
  provider at materialization (claude-acp, standing ruling 2026-06-12;
  prompts carry `__AX_INPUT_<KEY>__` placeholders the same way —
  `{{ inputs.* }}` belongs to run-config TOML execution, which the
  embedded path does not use). **Placeholders are single-`AX_`**
  (`__AX_INPUT_<KEY>__`, `__AX_ACP_COMMAND_JSON__`, `__AX_PROJECT_ROOT__`),
  matching the runtime substitutor (`ax` `orchestration.ts`); the spelling
  rule and the dead-`__AX2_` trap are owned by `AUTHORING.md` ("External
  inputs — the placeholder is single-`AX_`").
- **Fidelity — default down, raise only at a context-only seam**
  (2026-06-17, frame-the-problem). Fabro's own default is `compact` — a
  summary of prior stages prepended to the prompt ("If none of these are
  set, fidelity defaults to `compact`", `execution/context.mdx`). For an
  **artifact-passing play** — every move reads its inputs as named
  workspace files (the state-discipline contract) — that summary is never
  the channel; it is noise, and on a blind or adversarial node (a checker,
  a cold reader, a grader) it is a *leak* into a node whose job depends on
  not seeing it. So the baseline is inverted from Fabro's: set
  `default_fidelity="truncate"` run-wide (preamble = goal + run-id only,
  `execution/context.mdx`) and justify every byte above it.
  - **Only a context-only input justifies raising a seam.** A value that
    lives solely in the run context — `command.output`, `human.gate.*`,
    agent `context_updates` (`execution/context.mdx`) — and cannot be read
    as a file is the one reason to raise. A file-passed input never is;
    write the context-only value to a file instead and the seam stays
    `truncate` (frame-the-problem moved `word_check`'s verdict to
    `runtime/wordcount-verdict.md` for exactly this).
  - **Raise the edge, not the node.** When only one inbound path needs the
    context, set `fidelity` on that edge — "the first match wins" is edge,
    then node, then graph default (`execution/context.mdx`) — leaving every
    other entry to the node at the baseline.
  - **`full` + `thread_id` is the deliberate exception**, for a move that
    genuinely needs the full upstream conversation; validation requires the
    pair ("`thread_id` requires `fidelity="full"`",
    `reference/dot-language.mdx`). It reintroduces cross-node bleed, so it
    never touches a blind node.
  - **Derive step:** every node declares its fidelity — no node ships on
    the inherited `compact` default, and every blind/adversarial node is
    `truncate`. Protocol E checks this (§9).

## 4. Bounces and routing

A bounce in brief §4 ("ground fails → back to frame") becomes edges out
of the checking node: a forward edge and one condition-labeled edge per
bounce target.

**How a node tells Fabro which edge to take.** Agent and prompt nodes
"can influence which edge is taken after they complete by including a
JSON object with routing fields in their response. Fabro scans the LLM
output for the **last** JSON object containing any recognized routing
field" — `preferred_next_label`, `suggested_next_ids`,
`context_updates` (`agents/outputs.mdx`). Two disciplines follow,
verbatim from the docs:

1. "Fabro does not automatically instruct agents to emit routing JSON.
   You must include instructions in your prompt" (`agents/outputs.mdx`)
   — so every routing node's prompt ends with the routing instruction,
   and the labels it may emit are exactly its outgoing edge labels.
2. On API nodes, set `output_schema="routing"` so malformed routing
   "fails validation instead of being silently ignored"
   (`agents/outputs.mdx`). On ACP nodes this is unavailable —
   "`backend="acp"` does not support `output_schema` in this release"
   (`agents/outputs.mdx`) — but plain routing extraction still works,
   with a documented fallback chain for agent nodes: "1 | The final
   response text | 2 | `status.json` in the sandbox working directory |
   3 | The last file touched by the agent" (`agents/outputs.mdx`).

**Edge selection is deterministic.** Priority: condition match →
preferred label → suggested next → unconditional fallback; ties break
on `weight` then lexically; "If no edge matches at all, the workflow
halts with an error" (`workflows/transitions.mdx`). Non-ACP routing nodes may
keep one unconditional forward edge as the default — "An unconditional edge
acts as the default fallback" (`workflows/transitions.mdx`) — so a bounce never
strands the run.

**ACP work nodes fail closed.** A failed ACP outcome must not fall through to a
normal golden-path edge. Every ACP work node therefore has a conditional fallback
edge to a command node that exits nonzero, usually
`condition="outcome!=succeeded"`. Normal success routes stay unconditioned so
Fabro can still use `preferred_label` for routed nodes; condition matching wins
before preferred-label matching, so putting `outcome=succeeded` on every normal
labeled route breaks routing and dry-run smokes. If ACP failure is part of the
play's own logic, make that branch explicit; otherwise the fallback's only job is
to fail the run loudly instead of advancing. `studio/tools/check-workflow-edges.py`
enforces this at derive and bank time.

**Condition vocabulary.** Conditions evaluate `outcome`,
`preferred_label`, and `context.KEY` lookups with `=`, `!=`, `>`, `<`,
`>=`, `<=`, `contains`, `matches`, combined with `&&`/`||`/`!`
(`workflows/transitions.mdx`). Data between moves flows through the run
context: `response.{node_id}` (full LLM response), `command.output`,
and agent-emitted `context_updates` (`execution/context.mdx`);
structured output from a custom schema lands at `output.{node_id}`
(`agents/outputs.mdx`, API-only).

## 5. Three-strikes, projected

The studio rule: any loop that fails the same defect three times stops,
preserves state, and kicks to the Director. Two Fabro mechanisms,
layered:

1. **The kick, made routable.** The bounce-receiving checker carries an
   escalation edge guarded by visit count —
   `condition="context.internal.node_visit_count >= 3"` — pointing at a
   `hexagon` Director gate (or at `exit` with the artifact marked
   failing, per the play's design). "`internal.node_visit_count` in
   edge conditions enables fixed-count loops"
   (`tutorials/branch-loop.mdx`; worked example in
   `execution/context.mdx`).
2. **The backstop.** `max_visits` on the looping nodes caps runaway
   cycles at the engine level: exceeding it fails the run with
   "run is stuck in a cycle" (`execution/failures.mdx`). Per-node
   `max_visits` takes precedence over the graph's `max_node_visits`;
   note dry runs default the cap to 10 (`execution/failures.mdx`).

Set the escalation edge one visit *before* the backstop would trip, so
the freeze is a designed hand-off, not an engine failure.

Distinct from both: node **retries** (`retry_policy` / `max_retries`)
re-execute a node on transient errors — infrastructure, not play logic
("Deterministic errors … fail immediately without consuming retry
attempts", `execution/failures.mdx`). Bounces are play logic and ride
edges; retries are weather and ride retry policy.

## 6. Proof-spec checks → goal gates

A brief §7 check that a machine can enforce at run time becomes a
checking node marked `goal_gate=true`: "Goal gates are quality
checkpoints that are enforced when the workflow reaches an exit node. A
node marked with `goal_gate=true` must have completed with `succeeded`
or `partially_succeeded` — otherwise the run cannot finish"
(`execution/failures.mdx`).

- Every goal gate gets a `retry_target` (where to send the run to fix
  the failure). Validation requires it: "Goal gates have retry
  configuration" (`reference/dot-language.mdx`). Resolution order on an
  unsatisfied gate: node `retry_target` → node `fallback_retry_target`
  → graph-level equivalents; with none, "the run fails"
  (`execution/failures.mdx`).
- A gate passes on `succeeded` **or** `partially_succeeded`; beware
  `allow_partial=true` on a gate node — it "lets the gate pass even if
  the node exhausted its retries" (`execution/outcomes.mdx`). Don't put
  it on gates unless the play's design says degraded-and-labeled may
  bank.
- §7 checks that need human judgment stay in the read-out for Gate 2 —
  they are not projected.

## 7. Human gates (in-play)

> **This blocking-gate model assumes a human at Fabro's own terminal**
> (`ax run --interactive`, Fabro's `ConsoleInterviewer`). When a play is launched
> **detached** — the default for a Raven-mediated run — a blocking human node
> *deadlocks*: Raven owns the terminal and the director is one layer away
> (frame-the-problem-coin plan §2). The production pattern for that case is
> **non-blocking and event-sourced**, already shipped in the Raven Vision
> power-up: the agent drafts one unit, marks it `needs_review`, and **ends its
> turn**; the director reviews asynchronously and approves/revises, which
> **wakes** the agent to draft the next (`raven.vision.slot.*` events; the
> `raven-vision-drafting` skill; `packages/ax/src/domain/raven-vision.ts`). The
> generalized play-side plumbing — Fabro `pending_interviews` →
> `play.human_input_requested` / `_resolved` via the `ax server` bridge — is
> frame-the-problem-coin Slice 1 (#305). **Design a new human-in-the-loop play to
> the play↔runtime contract (`RUNTIME.md`) — the Vision pattern — not the
> blocking node**; the bullets below are the Fabro gate mechanics that still
> apply under `--interactive`.

- Options are the outgoing edge labels; the selection routes via
  `preferred_label` ("The selected label becomes the `preferred_label`
  in the outcome", `workflows/transitions.mdx`).
- **Gates fail closed.** "Fabro does not treat missing input as
  approval" — a gate advances only on an explicit answer, a timeout
  with `human.default_choice` set, or `--auto-approve`
  (`workflows/human-in-the-loop.mdx`). No implicit-approval edges.
- Free-text input where the play wants it: `freeform=true` on an edge;
  the text lands at `human.gate.text` in context
  (`workflows/human-in-the-loop.mdx`).
- Smoke and dry runs may pass gates with `--auto-approve`, which
  "selects `Yes` for yes/no gates and the first option for
  multiple-choice gates" (`workflows/human-in-the-loop.mdx`) — order
  the edges so the first option is the safe one.

## 8. The workflow package

```
packages/alexandria-next-plugin/workflows/<slug>/
  workflow.fabro          ← the projected graph (this document's output)
  prompts/<move>.md       ← one prompt per move, from brief §6 language
  workflow.toml           ← run config, when the play needs more than defaults
```

- Run config is "a TOML file that bundles a workflow graph with all the
  settings needed to execute it"; `[workflow].graph` "Defaults to
  `workflow.fabro`" (`execution/run-configuration.mdx`). The
  source-assessment exemplar ships only `workflow.fabro` today; add
  `workflow.toml` when a play needs prepare steps, inputs, or model
  config.
- Goal precedence: "CLI `--goal` > `[run].goal` > Graphviz graph
  attribute" (`execution/run-configuration.mdx`).
- Inputs parameterize prompts via `{{ inputs.name }}` — templates
  render "in exactly two workflow attributes: the graph `goal` and node
  `prompt`s. Every other attribute is literal text"
  (`workflows/variables.mdx`).
- Per-node model assignment, when a play earns it, goes through the
  `model_stylesheet` graph attribute ("Stylesheets are set in the
  `model_stylesheet` graph attribute", `workflows/stylesheets.mdx`) —
  adopted per play at Derive, not mandated (plan §8).
- Registration is a `PLAY_MANIFEST` entry in
  `packages/ax-next/src/domain/plays.ts` pointing at the graph, the
  way source-assessment is wired today.

## 9. Validation and dry-run

| Check | Command | Citation |
| --- | --- | --- |
| Graph parses, structure valid, `@file`s resolve, conditions parse, goal gates have retry config, exactly one start/exit | `fabro validate <workflow.fabro>` | `reference/dot-language.mdx` (full rule list), `reference/cli.mdx` |
| Run config valid without executing | `fabro preflight` | `execution/run-configuration.mdx` |
| Graph executes end to end on a simulated LLM | `fabro run --dry-run` (visit cap defaults to 10 in dry runs) | `reference/cli.mdx`, `execution/failures.mdx` |
| Diagram generation | `fabro graph` renders the workflow to SVG | `reference/cli.mdx` |

`fabro validate` proves structure, not semantics — it cannot know that
a prompt's promised routing labels match the node's edges. That gap is
exactly Protocol E's job (lint: brief ↔ workflow parity), which stays
an agent check. (The quarantined lint spec saw this correctly; §10.)

Protocol E also checks **fidelity is declared, not inherited**
(2026-06-17): the graph sets `default_fidelity` (or every node carries an
explicit `fidelity`), no node rides Fabro's `compact` default, and every
blind/adversarial node resolves to `truncate`. This is §3's lever-down
rule made checkable — the analog, for the lever-*down* direction, of the
validator's `thread_id`-requires-`full` rule for levering up.

Protocol E also checks **ACP edges fail closed** (2026-06-19): every ACP node has
an outcome-aware failure fallback to an exit-1 command node. This is not a Fabro
structural validation rule; it is the Studio's safety rule over Fabro's
transition semantics, enforced by `studio/tools/check-workflow-edges.py`.

The graded dry-run of the ladder runs the real workflow through the
embedded factory — `ax2 run <slug> --input key=value` (TESTING.md,
"Where runs happen"; re-ruled 2026-06-12). `fabro run --dry-run` above
is a structural smoke, not the graded run.

## 10. Quarantine dispositions

Audit of `../inheritance/quarantine/conventions/` (claims extracted
2026-06-12, each checked against the current docs). Per the promotion
path in `../inheritance/README.md`, items marked **promote** become
load-bearing only on the Director's Slice 1 ruling; everything else
stays quarantined.

| File | Disposition |
| --- | --- |
| `README.md` | Fabro mechanics it presumes (`.fabro` graphs, `@prompts/*.md`, `fabro validate` + dry-run, shape/attr bindings) — **verified, promoted** here (§2, §3, §9). Its policy frame (one-check-per-level, ≥ A− rubric gate, bootstrap rule) — **stays quarantined**; that's Slice 2 / Derive-era process design, not projection fact. |
| `authoring.md` | The vocabulary table (Play→workflow, Move→node) and doer→shape table — **verified, promoted with corrections** into §2. "Write only the delta" + what Fabro supplies — **verified, promoted** (§3; `agents/prompts.mdx` and `execution/context.mdx` exist and say what it claimed). Context keys `response.{node}` / `output.{node}` — **verified** (`execution/context.mdx`, `agents/outputs.mdx`). The ACP decision-file/`route.sh` routing scheme — **rejected, superseded**: it was built on "`output_schema` is unavailable over ACP" (still true) but the docs now document native routing extraction with a file fallback chain for agent nodes (`agents/outputs.mdx`; §4 above) — no shell shim needed. Frontmatter schema for prompt files — **stays quarantined** (studio-invented format; Slice 2 decides the prompt-file standard). |
| `grading.md` | Six-dimension rubric and gate — **stays quarantined** (policy; revisit when Slice 2 defines node-prompt quality checks). Its embedded shape semantics are covered by §2. |
| `lint.md` | Structural checks — **verified, promoted**: `@`-include resolution errors in validate, one `Mdiamond`/one `Msquare`, goal-gate-needs-retry-config (docs make it a validation rule, stronger than the claimed "warns"), validate-passes-but-routing-broken gap (real; becomes Protocol E's charter, §9). ACP attribute rules — **verified** via `reference/dot-language.mdx` (mutual exclusivity) and `changelog/2026-05-18.mdx` (API-only attrs rejected). `route.sh`-based router checks — **rejected** with the scheme (see authoring.md row). Prose-floor / forbidden-lexicon checks — **stays quarantined** (Slice 2, lint spec). |
| `migration-strategy.md` | Policy (when a move becomes software) — **stays quarantined**; the box→`parallelogram` flip it depends on is verified shape semantics (§2). Revisit per play at Derive. |
| `skills.md` | Its Fabro claims check out against `agents/skills.mdx` (discovery paths, `use_skill` tool, `{{user_input}}`), but skills are not part of the move-graph projection — **stays quarantined, marked verified**, until a play's design actually calls for a skill. |
| `worked-example.md` | Historical record of the factory-era rubric in action — **stays quarantined** as reference. Its `route.sh` wiring is superseded (above). |

## 11. Conflicts inside the Fabro docs (flagged, with our hedge)

Found while grounding; recorded so a future doc refresh can re-check.
Where docs disagree, the convention below is chosen to be correct under
either reading.

1. **Default retry count**: `reference/dot-language.mdx` says
   `default_max_retries` defaults to 0; `execution/failures.mdx` says
   3. **Convention: never rely on the default** — any node that needs
   retries declares `retry_policy` or `max_retries` explicitly.
2. **`standard` retry backoff**: 200ms initial
   (`execution/failures.mdx`) vs 5s initial
   (`workflows/stages-and-nodes.mdx`). Same hedge as above; if backoff
   timing matters, name the policy and test it on the embedded factory.
3. **`class` attribute delimiter**: comma-separated
   (`reference/dot-language.mdx`) vs space-separated
   (`workflows/stages-and-nodes.mdx`, and all `workflows/stylesheets.mdx`
   examples). **Convention: space-separated**, matching every worked
   example.
4. **Model precedence**: `core-concepts/models.mdx` and
   `execution/run-configuration.mdx` order CLI flags vs run-config TOML
   differently. Doesn't bite until a play sets models in both places —
   **convention: set models in one place per play** (stylesheet or run
   config, not both).

Gaps (not conflicts) found in use, same discipline:

5. **Never-visited goal gates** (found at the carve's Gate 1, Decision
   2, 2026-06-12): the docs define gate satisfaction by the node's
   "last outcome" (`execution/outcomes.mdx`) and say nothing about a
   gate node the run never visited — which any designed early-exit path
   (a refusal) produces. **Convention until verified empirically: when
   a graph has a designed path to exit that skips a checker, rely on
   topology (no route around the checker on its own path) and omit
   `goal_gate` attributes.** Test on the factory when convenient;
   amend here with the result.
6. **`acp.command` templating** (found at the carve's Derive,
   2026-06-12): `workflows/variables.mdx` is right that `{{ … }}`
   renders only in `goal`/`prompt` — `fabro validate` emits
   `detemplated_attribute` for templated `acp.command`. **Convention:
   the ACP command is a literal in the graph.** (The pre-existing
   `.fabro/workflows/ax-next-feature/workflow-acp.fabro` carries the
   templated form — a latent issue for its owners, flagged 2026-06-12,
   not this line's to fix.)

## 12. Decision queue — Slice 1 gate

All three RULED 2026-06-12 (Director, relayed by Jess); each took the
★ recommendation. Briefs preserved as presented.

**Decision 1 — adopt this projection standard?** RULED: adopt as
written. Stakes: this rulebook
governs every Derive step from Slice 3 (the Frame the Problem guinea
pig) onward; ruling it in closes Slice 1. Options: (a) ★ **adopt as
written** — every mapping is cited or hedged, and the guinea pig will
stress-test it with a real play before the fleet re-enters the line;
(b) adopt with amendments — name them and they're scribed with
provenance; (c) reject — Slice 3 has no rulebook and the plan stalls at
its first gate. Pro of (a): the doc is falsifiable (citations) and
Slice 3 is designed to catch what paper review can't. Con of (a): some
conventions (notably §4 routing discipline) are doc-verified but not
yet factory-proven; Slice 3 is where they could still break.

**Decision 2 — ACP bounce routing: response-text JSON or `status.json`
file?** RULED: routing JSON as the last thing in the response text;
the §4 prompt discipline (routing JSON goes last, nothing after it) is
the standing guard. Both are documented (`agents/outputs.mdx` fallback chain); the
old `route.sh` shim is rejected either way. Stakes: every bouncing
checker node on the local factory uses this mechanism; switching later
means re-touching every routing prompt. Options: (a) ★ **routing JSON
as the last thing in the response text** — first in Fabro's fallback
chain, visible verbatim in transcripts and read-outs (the Director can
see the bounce decision in the text he reads), one convention for API
and ACP nodes alike; (b) `status.json` in the sandbox — more robust if
a doer's prose accidentally contains JSON, but invisible in the
transcript and ACP-specific. Con of (a): a doer that mentions a JSON
example mid-answer could mis-route (Fabro takes the *last* JSON
object); the prompt discipline in §4 (routing JSON goes last, nothing
after it) is the guard.

**Decision 3 — mechanical moves without software: `tab` or `box`?**
RULED: `tab`, with the (b) escape (a `box`, chosen per move at Derive)
only where the check must itself read sandbox files. Stakes: doer-honesty at run time — what the everything-is-an-agent
prototype rule projects to. Options: (a) ★ **`tab` (prompt node, no
tools)** — a closed rule needs no bash or file edits; no tools means
the check can't wander, and the future-software peg (`parallelogram` +
`script=`) stays a clean flip later; (b) `box` (agent node) — needed
only when the mechanical check must read files itself on the sandbox
(then it isn't toolless); choose per move at Derive with the brief's
consumes contract as the tiebreaker. Con of (a): `tab` runs API-only
(`reference/dot-language.mdx`) — on the local ACP factory a `tab` move
still calls out via API; if a play must run fully ACP-local, its
mechanical moves need (b).
