# Lint — Frame the Problem (Riff play)

Checker: fresh-eyes agent, 2026-06-18. Spec: AUTHORING.md Protocols A–E. This is
a fresh lint of the re-architected **Riff** package; it supersedes the retired
9-move lint (the SUPERSEDED banner is gone, and no 9-move-specific finding is
carried). `known-fps.md` (re-tuned to the Riff play 2026-06-18) consumed before
reporting.

Unit under lint: `brief.md` (source of truth) ↔ `workflow.fabro` + `prompts/`
(the derived package). A–D run per node prompt; E runs on the package.

Verdict: **PASS.** Protocols A, B, C, D clean; E clean after resolving E2-a (the
dead `__AX2_` placeholder in the studio workflow/prompts — see below; fixed
2026-06-18, runtime uses single-`AX_`). `fabro validate`: OK (5 nodes, 5 edges).

## Protocol A — coverage (every brief element present, per move)

Two judgment moves carry prompts (`pre_fill`, `revise`); `review` is a hexagon
gate and correctly has no prompt file (AUTHORING.md: "Human moves get no prompt
file"). Walked each §4 block's job, failure behavior, and contracts into its
prompt:

- **`pre_fill`** — brief §4 job (draft the problem(s) in service of facts and
  logic; mark each claim's evidence honestly; name thin spots; held-loosely
  relate + solution read; hand Raven something to react to; if nothing framable,
  say so) all land in `pre_fill.md` (the in-service stance, the three evidence
  marks, the thin-spot line, the "How they relate (a guess)" and "What this means
  for the solution (so far)" sections, the Mom-Test follow-up, the nothing-framable
  paragraph). Brief §5's "nothing framable" row lands as the closing paragraph.
  **Covered.**
- **`revise`** — brief §4 job (keep confirmed / change corrected / add the
  evidence / re-mark; update the solution read; surface contradictions rather than
  pick; hold the line that support needs a real instance; signal readiness) all
  land in `revise.md`. Brief §5's contradictory-reaction and rationalized-without-
  evidence rows land as the two explicit bullets. **Covered.**
- **No spillover.** Nothing assigned to one move appears only in the other's
  prompt. The evidence bar appears in both prompts, which is correct — both moves
  must apply it (pre_fill sets it, revise re-applies it on new claims). **Pass.**

## Protocol B — purity (checked in every prompt file)

- **No provenance** — no authors, books, links, "research shows." The Mom-Test
  lesson is carried as method ("a specific recent time" vs "it happens all the
  time"), not cited. **Pass.**
- **No design rationale** — no "we chose," no Director-as-process, no gates, no
  hardening history in either prompt. **Pass.**
- **No machinery nouns** — neither prompt says "play," "brief," "lint," "fixture,"
  or "workflow" as self-reference. "Backstage," "Raven," "the director" are the
  play's *fiction*, declared up top in each prompt (the two-layer face/backstage
  frame), not process nouns. The emitted artifact is named "problem-framing
  document" — distinct from this audit, no clash. **Pass.**
- **No session vocabulary** — no codenames or internal slugs leak. "Riff" appears
  nowhere in the prompts (only in audit/record files). The input is referred to as
  "the material," matching the name its consumes carries. **Pass.**
- **No unresolvable references** — `pre_fill.md` references "the path above" for
  the material (resolvable: the consumes frontmatter), and the output templates are
  inline code blocks. No link-styled cross-refs or unopenable paths. **Pass.**
- **No seam-leak patches** — neither prompt contains a please-forget/"ignore the
  summary above" instruction. `revise` openly works from context + file by design,
  so none is needed. **Pass.**

## Protocol C — executability

Each prompt + what Fabro supplies (system prompt + truncate/compact preamble) +
the move's declared inputs suffice for that move's job:

- **`pre_fill`** — reads `material` from the workspace path, writes both runtime
  files with literal output templates. The "create `runtime/` if it does not
  exist" instruction makes the first-cycle write self-sufficient. No external
  knowledge required; sources are the handed-in material only. **Executable.**
- **`revise`** — reads the live draft file + the latest human input (carried by
  the compact seam) + `material`; rewrites both files whole. The "rewrite complete,
  not a diff" and "bump the status: version" instructions are unambiguous.
  **Executable.**
- **No contradictions** within or between the two prompts (both hold the same
  in-service stance and evidence bar; revise explicitly inherits "the same
  discipline as the first draft"). **Pass.**

## Protocol D — hygiene

- **Vocabulary purity / one-home-per-rule** — the evidence bar has one canonical
  home (`pre_fill.md`'s blockquote) and is referenced, not re-authored, in
  `revise.md` ("same good/bad evidence bar"). **Pass.**
- **Definition-before-use** — "backstage," "the face," "the director," "thin spot,"
  and the three evidence marks are each defined before first leaning on them.
  **Pass.**
- **Reference integrity** — no dangling cross-references. **Pass.**
- **No fixture contamination** — the prompts use the neutral pizza/agent-run
  illustrative example ("last Tuesday I sat fifteen minutes poking the agent") as
  the evidence-bar exemplar; this is illustrative method language, not a fixture's
  domain/speakers/answer. (`known-fps.md` entry 5 disposes of the fleet-maintenance
  gallery convention; note the current prompts do not yet carry a "Done right vs
  wrong" gallery — see C/observation below.) **Pass, no contamination.**

Observation (not a finding): the Riff prompts are short and carry no explicit
"Done right vs wrong" gallery yet (AUTHORING.md §"The gallery"). The play is
pre-bank-grade and its fixture suite is FROZEN (brief §7); galleries are harvested
from *graded* failures, and no graded campaign has run on the Riff contract. So
the absence is correct-for-now, not a coverage gap — galleries get authored when
the frozen suite is unfrozen and rebuilt (brief §7, known-fps.md preamble).

## Protocol E — parity (brief ↔ workflow; the anti-drift protocol)

1. **One node per §4 move, projected type, no extra nodes.** §4 names three work
   moves: `pre_fill`, `review`, `revise`. `workflow.fabro` has exactly those three
   plus the mandatory `start`/`exit`. Types: `pre_fill`/`revise` are agent nodes
   (default `box`, judgment moves that write files → PROJECTION §2), `review` is a
   `hexagon` human gate (§2). No node exists that §4 does not name. **Pass.**
2. **consumes/emits string-match brief §4.** Walked both prompts' frontmatter
   against §4:
   - `pre_fill` emits `runtime/problem-framing.md` + `runtime/for-the-director.md`
     — string-matches §4. **Match.**
   - `revise` consumes `runtime/problem-framing.md` (current draft), the director
     feedback in context, and `material`; emits the two runtime files —
     string-matches §4. **Match.**
   - **E2-a (placeholder convention — RESOLVED 2026-06-18).** The studio
     `workflow.fabro` and prompts had been authored with the `__AX2_…` placeholder
     (`__AX2_INPUT_TRANSCRIPT__`, `__AX2_ACP_COMMAND_JSON__`) while the brief used
     `__AX_INPUT_TRANSCRIPT__`. Checking the **runtime substitutor** settles it:
     `ax` (`packages/ax/src/domain/orchestration.ts`) matches **single-`AX_`** only
     — `/__AX_INPUT_([A-Z0-9_]+)__/`, `__AX_ACP_COMMAND_JSON__`,
     `__AX_PROJECT_ROOT__`. The `__AX2_` spelling is dead from the ax2→ax rename and
     never substitutes; a node shipped with it would receive the literal
     placeholder, not the input. The plugin copy (what actually runs) already used
     single-`AX_` — which is why the smoke campaign worked at all. So the brief was
     right and the **studio workflow/prompts carried the dead placeholder**. Fixed:
     studio `workflow.fabro` + both prompts migrated `__AX2_` → `__AX_`, re-synced to
     the plugin, `story.md` re-derived; PROJECTION §3 corrected (the `__AX2_`
     authoring note was stale). Parity now holds. *(Follow-up: 12 other, unpromoted
     studio plays still carry `__AX2_` — latent until they bank.)*
3. **Every §4 bounce/edge is realized, every edge traces back.** §4 edges:
   `start→pre_fill`, `pre_fill→review`, `review→exit [Approve]`,
   `review→revise [feedback/freeform]`, `revise→review`. All five present in
   `workflow.fabro` with the right source/target; the two `review` edges carry
   their conditions (the human-gate labels). No edge exists without a §4 origin —
   the only switchback (`review ⇄ revise`) is exactly brief §4's "only switchback."
   **Pass.**
4. **Routing prompts promise exactly their node's outgoing edge labels.** The only
   routing node is `review`, a hexagon whose routes are its edge labels (`[A]
   Approve`, `[R] Revise`) — no prompt, so nothing to mis-promise. `pre_fill` and
   `revise` have single unconditional outgoing edges, so PROJECTION §4 requires no
   routing JSON and neither prompt claims any label. **Pass — no over-promise, no
   under-promise.**
5. **No language drift (task language traces to §6 / brief).** `pre_fill.md`'s
   in-service stance, the three evidence marks, the thin-spot rule, the
   relate/solution sections, and the Mom-Test follow-up all trace to brief §1, §4,
   and §6. `revise.md`'s fold-in rules, contradiction-surfacing, and hold-the-line
   all trace to brief §4's `revise` block and §5. No prompt introduces a method the
   brief does not declare (paraphrase only). **Pass.**
6. **`fabro validate` passes.** OK — 5 nodes, 5 edges, `@file` prompt references
   resolve, exactly one start/exit, conditions parse. **Pass.**

Also checked (PROJECTION §9 fidelity-declared rule): the graph sets
`default_fidelity="truncate"`; the one raised seam (`review→revise` `compact`) is
declared on the edge; no node rides Fabro's `compact` default. **Pass.**

## Result

| Protocol | Result |
|---|---|
| A coverage | PASS |
| B purity | PASS |
| C executability | PASS |
| D hygiene | PASS |
| E parity | PASS with E2-a (minor, brief-side placeholder typo) |

`fabro validate`: OK (5 nodes, 5 edges). One finding (E2-a) — a true brief↔derived
parity drift on the input placeholder spelling; fix is a one-character edit to
brief.md line 57 (the brief is the source per PROJECTION), then the package is
already consistent. No blocking finding; no fixture contamination; no language or
method drift.
