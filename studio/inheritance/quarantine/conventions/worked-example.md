> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/worked-example.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Worked example — the Standard run against two prompts

To prove the gate has teeth before we trust it in a loop, we grade two prompts from
`atomic-conversion/prompts/`: a thin **stub** of `decompose` that lands **below** the A- gate, and
the authored `plan_kickback`, which clears it. Same Move family, same backend (`acp`) — the only
variable is how close each prompt is to the Standard.

Lint (`lint.md`) and the rubric (`grading.md`) are independent gates: lint is the deterministic
structural floor, the rubric is the semantic quality bar. A prompt can pass one and fail the other.
We run both on each.

## The stub: a thin `decompose`

```yaml
---
move: decompose
doer: SK
node:
  backend: acp
  shape: box
consumes: [.fabro/workflows/atomic-conversion/runtime/run/sot.md]
emits:
  output_schema: none
fidelity: compact
---
# Move: decompose — list the atomic units in the source

Read the frozen SOT and list the atomic units of intent it contains. Don't edit the SOT.
Output a numbered list, one unit per line. Flag anything ambiguous.
```

### Lint
| Check | Result |
|---|---|
| Frontmatter present + required keys | ✅ `move, doer, node, consumes, emits, fidelity` all present |
| Frontmatter ↔ `.fabro` agreement | ✅ `move` == node id; `doer`/`backend`/`shape` match the node |
| ACP attribute rules | ✅ no api-only attrs on an `acp` node |
| `@`-include resolves | ✅ (`fabro validate` OK) |
| Doer/shape consistency | ✅ `[SK]` ⇒ `box` (+`backend=acp`) |
| Label line present | ✅ first body line is `# Move: decompose — …` |
| No design-commentary / foreign refs | ✅ no lineage, roadmap, or spec/prompt paths |
| Data-flow self-consistency | ✅ body doesn't void its own `consumes:`/`emits:` |
| label↔edge cross-check | n/a (`output_schema: none`, not routing) |

**Lint verdict: PASS.** The stub is structurally clean — it is *not* a frontmatter problem. This is
the point: lint can be green while the prompt is still not bankable.

### Rubric
| # | Dimension | Letter | Pts | Why |
|---|---|---|---|---|
| 1 | Doer & node fit | A- | 3.7 | genuine judgment (atomicity, "what becomes a card") — correctly `[SK]`/`box` |
| 2 | Input contract | C+ | 2.3 | names `sot.md`, but on `acp` it states no read path and says nothing about the file it must write back |
| 3 | Single responsibility | B+ | 3.3 | one Move, mostly standalone, but "atomic units" is undefined here |
| 4 | Output contract | C+ | 2.3 | "a numbered list, one unit per line" — no per-unit fields, no SOT-section attribution; the next Move can't parse it reliably |
| 5 | Guardrails | C | 2.0 | "don't edit the SOT" only; no source-as-data rule, no kickback/escalation, no anti-example |
| 6 | Runtime fit & voice | A | 4.0 | executable cold; product vocabulary; zero design-history or lineage |

Mean = (3.7 + 2.3 + 3.3 + 2.3 + 2.0 + 4.0) / 6 = 17.6 / 6 = **2.93 → B**.
**❌ below A- (3.50).** The debt is **thin contracts** (Input, Output, Guardrails) — not provenance,
not voice. The body is already clean; padding the frontmatter would not move the grade.

**Cheapest fixes (prefer tightening over adding):**
1. Output contract C+→A-: state the per-unit shape — `numbered unit · one-line description · SOT
   section it came from`.
2. Input/Output on `acp`: name the read path and the file written back (`manifest.md`), keeping the
   body consistent with `consumes:`/`emits:`.
3. Guardrails C→B+: add the source-as-data rule and one anti-example (e.g. ❌ splitting one concept
   with multiple aspects into separate units instead of hub/spoke).

That is the gap between an orientation stub and an authored-to-Standard prompt, made into a number.

## The clean prompt: `plan_kickback`

The authored `plan-kickback.md` is an **acp routing Move**. Over ACP, Fabro's `output_schema` is
unavailable, so it routes with a decision file: the body writes one word to `…/plan_kickback.decision`,
and the `plan_kickback_route` node (`route.sh plan_kickback Proceed`) turns it into an edge.

```yaml
emits:
  output_schema: none            # acp: routed by plan_kickback_route, not Fabro output_schema
  decision_file: .fabro/workflows/atomic-conversion/runtime/plan_kickback.decision
  forward_label: Proceed         # this word forwards; any other word (here "Kickback") branches
fidelity: full
```

### Lint
| Check | Result |
|---|---|
| Frontmatter present + required keys | ✅ all present; `decision_file` + `forward_label` declared because it's an acp router |
| Frontmatter ↔ `.fabro` agreement | ✅ matches the node |
| Label line present | ✅ `# Move: plan_kickback — judge … and route Proceed or Kickback` |
| No design-commentary / foreign refs | ✅ clean runtime instruction — no leaked rationale or cross-references |
| Data-flow self-consistency | ✅ frontmatter and body agree: `acp` reads files from the run dir and writes the decision file; no "ignore the above" seam |
| **label↔edge cross-check** | ✅ **PASS** (`tools/audit-bindings.py`) — `forward_label: Proceed` equals the `plan_kickback_route` forward arg (`route.sh plan_kickback Proceed`); the route node forwards `Proceed`→`author` and branches `Kickback -> drafting`→`exit`. |

**Lint verdict: PASS**, including the high-value binding audit — the prompt's `forward_label` matches
the route node's forward arg, so routing won't silently drift.

### Rubric
| # | Dimension | Letter | Pts | Why |
|---|---|---|---|---|
| 1 | Doer & node fit | A | 4.0 | a real judgment Move (four blocking criteria, "could the SOT have answered this?") — correctly `[SK]`, not a Director gate |
| 2 | Input contract | A- | 3.7 | names `manifest.md` + `sot.md`, the read paths, and `fidelity: full`; states what is *not* in scope |
| 3 | Single responsibility | A- | 3.7 | one decision Move — judge blocking-vs-not and route; nothing else |
| 4 | Output contract | A | 4.0 | exact decision word to a named file; `forward_label` matches the route node; warns that any other word branches |
| 5 | Guardrails | A | 4.0 | frozen-SOT rule, source-as-data, default-when-uncertain, re-entrancy, and four explicit anti-examples |
| 6 | Runtime fit & voice | A | 4.0 | executable cold; product vocabulary only; no design history or cross-refs |

Mean = (4.0 + 3.7 + 3.7 + 4.0 + 4.0 + 4.0) / 6 = 23.4 / 6 = **3.90 → A**.
**✅ clears A- (3.50).** Every dimension is A-range; the contracts that sink the stub are exactly
what carry this prompt — explicit inputs, an exact output shape, and guardrails with anti-examples.

## Takeaways

1. **The gate has teeth — and lint is not the gate.** The `decompose` stub lints clean yet scores
   B (2.93), below A-. A lenient rubric would rubber-stamp it; this one says "not bankable," which is
   correct: it's an orientation stub, not an authored prompt.
2. **The cheap, universal win is tighter contracts.** The stub is dragged down by Input, Output, and
   Guardrails — not by voice and not by frontmatter. `plan_kickback` clears the bar on exactly those
   three: explicit paths, exact routing JSON, anti-examples. Note what is *not* the lever: padding the
   frontmatter or narrating provenance. There is no provenance dimension; Dimension 6 (**Runtime fit &
   voice**) already scores A on the clean stub, and adding lineage would *lower* it.
3. **Structural ≠ semantic.** `plan_kickback` lints clean on routing (`forward_label` matches the route node) *and* scores A;
   the stub lints clean *but* fails the rubric. Keeping the gates independent is what lets us see that
   precisely — and the design-commentary lint check is what would catch the opposite failure: a
   high-scoring prompt bloated with design-talk.
4. This is the authoring gap made measurable: the stub needs **tighter contracts**, and now we have
   the number that says when it's done.
