> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/migration-strategy.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Software-vs-skill: the control-experiment strategy (decision #4)

The question: given how much is changing at once (data model, medium, runtime, determinism),
do we cut Moves over to software now, or prototype everything agentically and swap software in?

**Answer: per-Move, not global. Pin every variable you're not currently testing.** Classify each
Move by where it sits on the determinism spectrum, and let that pick the strategy.

## The three classes

| Class | Examples | Strategy | Why |
|---|---|---|---|
| **Unambiguously deterministic** | grade arithmetic, set-diff reconcile, topo-sort build-order | **Software now** (`ax`) | Nothing to prototype. The agentic version is a *known-worse* stand-in that adds noise. Build it now as a **control rod** — it removes a variable from every later test. |
| **Blurry / hybrid** (`↳` splits) | type decision-tree, tense-scan, spot-check rubric | **Agentic first (box), swap later** | The agentic run is a **spec-discovery instrument**: watch what judgment the doer applies, *then* encode it. Swapping early = guessing the spec = guessing wrong. |
| **Irreducible judgment** (`[SK]`) | author, score, decompose, kickback | **Never software** | Genuine judgment; stays a box agent permanently. |

## The baseline/oracle nuance (important)

"Keep the all-agent run as the golden baseline" is only valid for **blurry** Moves — there the
doer's output is the spec you're preserving, so the tool must reproduce it.

For **pure-arithmetic** Moves it's the opposite: the doer is sometimes simply *wrong* (LLMs
miscount), so the tool is **correct-by-construction** and the truth is the *spec*, not the old
doer output. Don't differential-test `ax grade compute` against what the box prompt produced —
test it against hand-computed values.

## Sequencing (change one thing at a time)

1. **Topology** — locked (dry-run passes).
2. **Prompt quality** — get `[SK]` + blurry-box prompts to ≥ A- on ACP. Flag the
   deterministic-but-still-box nodes (e.g. `grade_compute`) as *known stand-ins* so their shaky
   arithmetic doesn't pollute the prompt-quality experiment.
3. **First control rod** — ship `ax grade compute` (pure functions, zero schema; the letter→points
   arithmetic is the table in `grading.md`); flip `grade_compute` box→`parallelogram`. Topology unchanged.
4. **More rods** — reconcile, build-order, then the blurry ones *once their transcripts show a
   stable procedure*.
5. Blurry Moves keep their box prompt until step 4 promotes them; `[SK]` Moves never move.

## The doer-fit bar (the original narrow #4)

An `[SW]`-box prompt must read as an **implementable algorithm** — a competent engineer could
write the `ax` subcommand from the prompt alone. If it can't be written that way, it isn't `[SW]`;
retag it `[SK]`. The `grading.md` Doer-fit dimension enforces this, so the rubric itself keeps us
honest about which class a Move is in.
