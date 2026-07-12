# Fixtures — frame-the-problem

Runnable fixtures for the `frame-the-problem` Fabro workflow
(`../workflow.fabro`, prompts under `../prompts/`). Carried over from the proven
fixtures in the frozen baseline play `studio/plays/frame-the-problem-baseline/fixtures/`
and reshaped into a per-case layout the workflow can consume directly.

## The convention

One directory per behavior case: `<case>/`. The Riff play takes a **single
workflow input** — the handed-in material — plus the director's reactions,
which arrive live at the `review` gate (Fabro `human.gate.text`), never as a
fixture file. So each case dir holds exactly one input file, named by its input
key (`.md` extension):

| File | Input key | When present |
|---|---|---|
| `transcript.md` | `transcript` | always (required input) |

The filename minus extension **is** the input key. A runner binds it with:

```
--input transcript=/abs/.../fixtures/<case>/transcript.md
```

or, against this play's manifest, the shorthand:

```
ax run frame-the-problem --fixture <case>
```

> The input key is `transcript` for historical reasons (the original play
> consumed a meeting transcript). The content is **any** handed-in material — a
> solution pitch, a rough problem statement, a conversation, notes. The earlier
> 9-move pipeline also consumed `surface_map`/`users`/`prior_brief`; the Riff
> redesign drops them (brief §3) — product context and user detail are drawn
> out of the director live at the gate, not pre-supplied.

### Each input file holds only what the play reads

The `transcript.md` file contains **only** the content the play should read — no
fixture documentation, no answer key, no grading notes. The frozen source files
begin with a documentation preamble (`# Fixture: …`, `Planted properties: …`,
fixture-marker lines); that preamble is **stripped** here and relocated to each
case's `README.md`, where documentation belongs. The transcripts in particular
must never carry the preamble, since it states the answer (leakage).

### `reactions.json` — the director's scripted reactions at the gate

The handed-in material is the only workflow **input**, but the play also has a
human gate (`review`) where the director reacts to the draft. A case can carry
those reactions in `reactions.json` so a dry run traverses the
`review ⇄ revise` loop **deterministically**, with no live human and without
`--interactive` (which deadlocks a detached run):

```
ax run frame-the-problem --fixture <case> --reactions <case>/reactions.json --json
```

`ax run` launches the play detached, then feeds each reaction — in order — to
each pending gate via the same answer endpoint Raven uses (one reaction per gate
visit; conceptually Fabro's `QueueInterviewer`). The run is a clean success only
if it reaches `exit`; running out of reactions, a rejected answer, or a
non-terminal run are failures.

Shape — an ordered list (bare array, or `{ "reactions": [...] }`); each entry is
an answer of one `kind`:

| kind | extra field | gate it answers |
|---|---|---|
| `text` | `text` | freeform (a `freeform=true` edge — e.g. **Revise** with feedback) |
| `selected` | `optionKey` | multiple-choice (e.g. **Approve**) |
| `yes` / `no` | — | yes/no or confirmation |
| `multi_selected` | `optionKeys` | multi-select |

> **Confirm the keys against the live gate.** The `selected` `optionKey` must
> match the live gate's option key (Fabro derives it from the outgoing edge
> label, e.g. `[A] Approve`). A clean worktree cannot run the play (it needs
> Fabro + an ACP agent), so the live `--reactions` traversal is a **manual QA
> gate**: read `event.payload.choices` on the first `play.human_input_requested`
> and adjust the fixture's keys if they differ. The deterministic `packages/ax`
> tests cover the parser and the answerer logic; they do not depend on a live run.

### `expected/` — grading material, not inputs

A case may include an `expected/` subdir holding grading material (answer key,
graded read-out, gold-standard located thread). Files under `expected/` are
**not** inputs and are never passed to the play with `--input`.

### Per-case `README.md`

Each case dir has a `README.md` documenting: the behavior under test, the
planted properties (relocated from the frozen fixture's preamble), and the
expected correct outcome.

## Cases and coverage

The authoritative map of which behavior cases exist, which risk each covers, and
what is still open is `../risk-map.md` (the per-play source of truth the **Play
Testing** surface renders from). The cases below are the original golden set;
the calibration/positional/injection/distractor cases were added later for risk
coverage — see `../risk-map.md` for the full register.

| Case | Behavior under test |
|---|---|
| `golden/` | Happy path: recover the problem(s) behind a solution-shaped pitch, first draft to react to. |
| `refusal/` | Not a build conversation (scheduling chatter) — nothing framable, say so plainly, never invent a problem. |
| `empty/` | A real pitch with no past-specific pain — valid success with an explicitly empty map, no invented problem. |
| `rerun/` | A continued conversation as new material lands — carry the framing forward, upgrade it, resist priority bait. |
| `hard-case/` | Advanced integration test at the 5+ ceiling: ambiguous invocation, scattered evidence, an out-of-scope budget block, disguised solutions, a disputed root. |

## Source mapping (frozen baseline → here)

Source dir: `studio/plays/frame-the-problem-baseline/fixtures/` (frozen — do not
modify).

| Here | From | Notes |
|---|---|---|
| `golden/transcript.md` | `meeting-snippet-01.md` | content after the preamble `---` |
| `refusal/transcript.md` | `meeting-snippet-02.md` | content after the preamble `---` |
| `empty/transcript.md` | `meeting-snippet-03.md` | content after the preamble `---` |
| `rerun/transcript.md` | `meeting-snippet-01-continued.md` | content after the preamble `---` |
| `hard-case/transcript.md` | `advanced/transcript-full.md` | content after the preamble `---` |
| `hard-case/expected/answer-key.md` | `advanced/answer-key.md` | copied verbatim |
| `hard-case/expected/read-out.md` | `advanced/read-out.md` | copied verbatim |
| `hard-case/expected/transcript-located.md` | `advanced/transcript-located.md` | copied verbatim |
