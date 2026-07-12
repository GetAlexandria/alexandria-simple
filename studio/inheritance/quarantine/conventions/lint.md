> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/lint.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Lint — the structural floor (the `[SW]` gate)

Deterministic, no judgment — the structural floor under the `[SK]` rubric. These are the checks
that should become an `ax`-style tool (today: run them by eye / by script). A prompt can lint
clean and still fail the rubric, and vice-versa — two independent gates: the structural floor here,
the semantic quality bar in `grading.md`.

## Node-level checks (per node)

1. **Frontmatter present** on every Move prompt, with required keys (`move, doer, node, consumes, emits, fidelity`). Provenance/roadmap are author-side (they live in the Move spec), so they are **not** prompt frontmatter keys.
2. **Frontmatter ↔ `.fabro` agreement**: `move` == node id; `doer`/`node.backend`/`node.shape` match the actual node.
3. **ACP attribute rules** (parser-enforced too): `backend="acp"` ⇒ exactly one of `acp.command`/`acp.config`, and **no** api-only attrs (`model`, `provider`, `reasoning_effort`, `max_tokens`, `speed`).
4. **`@`-includes resolve**: every `prompt="@…"` points to a file under the workflow dir (`fabro validate` already errors on a miss — confirmed).
5. **Doer/shape consistency**: `[SK]`⇒`box`(+optional `backend=acp`); `[SW]`⇒`box` (v1) or `parallelogram script=` (v2); `[HR]`⇒`hexagon` (no prompt).

## Labeling (human-facing — per node and per Play)

The one element authored for humans, not the executing doer. Checked deterministically:

- **Every node has a readable `label`**, and the prompt file's first body line (immediately after the
  frontmatter) is `# Move: <move_id> — <one-line job>`. Both present; both name the same Move.
- **Every Play is named** (`digraph <Name>`), and in a compound Play **every sub-workflow leg is
  labeled**. No unnamed graph, no anonymous leg — every Move and every Play is identifiable in the
  system and in itself.

## Prompt-body checks (the runtime-instruction floor)

The prompt is a thing a doer *executes*; these are deterministic, closed-list scans over the body
(no judgment, no scoring — a clean `ax lint prompts` candidate). They catch the contamination class
the rubric used to *reward*: design/lineage/roadmap commentary leaking into a runtime instruction.

6. **No design-commentary / foreign references.** FAIL on any whole-phrase hit (case-insensitive)
   from the closed lexicon, anywhere in the body **or** in frontmatter free-text/inline comments:
   - lineage / history: `earlier draft` · `prior draft` · `previous version` · `discredited` ·
     `now removed` · `the hardening` · `build-req` · a hardening cite like `#5`/`#7` ·
     `judgment in disguise`;
   - roadmap / migration: `v2 flips` · `flips to parallelogram` · `box → parallelogram` ·
     `THE FIRST TOOL` · `the ax tool this becomes`;
   - meta-lessons / cross-refs: `the curl | claude lesson` · any path reference to a spec
     (`specs/*.md`), a `*-hardened.md` / `model/*.md` design doc, another `prompts/*.md`, or the
     conventions (`grading.md` / `authoring.md` / `lint.md`).

   *Not flagged:* the one-line doer tag (`doer [SK]`), and a move naming the **adjacent move it hands
   off to** as part of its declared output contract (that's the routing contract, not design-talk).

7. **Data-flow self-consistency.** The body must not contradict its own frontmatter contract. FAIL
   if the body voids the declared `consumes:`/`emits:` — e.g. `OVERRIDES "consumes: response.X"
   above`, or `you receive NO Fabro context — ignore the above and read from disk`. A prompt states
   **one** data-flow for its backend, consistent with its frontmatter; if the real backend reads from
   disk, the frontmatter and body say so together, with no "ignore the above" seam.

## The label↔edge cross-check (the high-value one)

This catches the #1 silent failure: a routing prompt and its edges drifting apart. **Fail = the
routing is broken even though `fabro validate` passes** (validate doesn't know the prompt's intended
routing). The check depends on the backend:

- **api router** (`emits.output_schema: routing`): the prompt's declared `emits.labels` **must equal**
  the set of routing targets the node's own outgoing edges select on, plus the unconditioned default.
- **acp router** (`emits.forward_label` + `emits.decision_file`): a `<move>_route` node must exist
  whose `route.sh <move> <ARG>` forward arg **equals** `forward_label`, with a conditioned forward
  edge (`condition="outcome=succeeded"`) and a branch edge. The doer writes one word to
  `decision_file`; `forward_label` forwards, any other word branches.

Both are mechanized in **`tools/audit-bindings.py`** (which also does check #2, frontmatter↔`.fabro`
agreement: node exists, `backend`/`shape` match). `tools/lint-prompts.sh` is the in-isolation prose
floor (#1/#6/#7) and cannot see the `.fabro`; the binding audit is the cross-graph gate. Run both.

## Workflow-level checks (per `.fabro`)

Mostly delegated to the engine + a few structural rules — **not** an agentic grader:

1. `fabro validate <file>` → `OK` (parses, resolves includes, structure valid).
2. `fabro run <file> --dry-run --auto-approve` → reaches `exit` / `run.completed` (the graph actually executes).
3. Exactly one `start` (`Mdiamond`) and one `exit` (`Msquare`).
4. **No orphan nodes** (every non-start node reachable; every non-exit node has an out-edge).
5. **Every `goal_gate` node has a `retry_target`** (validator warns otherwise).
6. **Every kickback/needs-input edge routes somewhere real** (an `exit`, or a sub-workflow node — never a dangling label).

## Software-node gate (the boundary)

A `[SW]` node that has shipped its tool (`shape=parallelogram, script="ax …"`) is **not** graded
by the prose rubric. Its gate is:
- the `ax` subcommand has unit tests (pure-function Moves: assert against known inputs/outputs);
- the node passes node-level lint (1–5 above);
- its output still satisfies the downstream node's input contract (differential check vs the
  prompt-era output **only for blurry Moves** — for pure-arithmetic Moves the tool is the truth,
  not the old prompt's output).

## Running it today

No `ax lint` for prompts yet, so: `fabro validate` + `fabro run --dry-run --auto-approve` give
checks (1)(2)(3); the frontmatter and label↔edge checks are done by reading the files (a small
script is the obvious first automation — a clean `ax lint prompts` candidate).
