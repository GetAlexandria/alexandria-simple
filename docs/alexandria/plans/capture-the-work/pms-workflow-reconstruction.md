# (b) PMS workflow, reconstructed from evidence — proof of the suspect method

**Claim being tested:** you can reliably recover a system's core workflow by
finding its **evidence trails** (the suspects) and reading the **five coordinates
of work** off them — *Case · State · Activity · Place · Event* — rather than
harvesting nouns. **Result: it works, and from pure evidence it independently
reproduces the hand-made Event-Storming diagram** (revisits the board at both
gates, steps out to the factory — not a clean left→right pipeline).

Nothing here is new information. Every coordinate was in source the sweep already
read; it just had nowhere to put it and no instruction to look.

Rendered diagonal: [`pms-workflow.html`](./pms-workflow.html) (open in a browser).

## The suspects → the evidence (where each coordinate lives)

| Coordinate | Suspect interrogated | Evidence (file) |
|---|---|---|
| **Case** (the unit of work — what moves) | the central record + its folder | `studio/plays/registry.js` (identity/filing); `studio/plays/board-state.json` (instances + current state); `studio/plays/<slug>/` (the case file) |
| **State** (the rows — stages it passes through) | the **status field** | `board-state.json` `stages{}`; `README.md:6-21`; `StudioApp.tsx` `STAGE_ORDER`. *(Second, legacy status on `registry.js:status` — the "two-ladders" hot-spot we already flagged.)* |
| **Activity** (the steps that advance it) | the **loop / commands** | `README.md:69-81` — the 8-step loop, with doer + output + stage-after per step |
| **Place** (the columns — where each step happens) | the **output location** of each step | derived from each step's output path: `research/` → `brief.md` → board confirm → `workflow.fabro`+`prompts/` → `dry-runs/` (factory) → plugin |
| **Event** (the trail it leaves) | per-case artifacts + run logs | `studio/plays/<slug>/{research,brief.md,hardening.md,workflow.fabro,lint.md,dry-runs/}`; `dry-runs/*/events.jsonl` (actual run traces) |

**Corroboration that needs no status field at all:** which artifacts *exist* in a
play folder reveals its stage. `frame-the-problem/` carries the full set
(research → brief → hardening → workflow.fabro → lint → dry-runs) = **live**;
`back-of-house-walk/` carries only `brief.md`+`moves.md`+`risk-map.md` = **designed**.
Cross-confirmed by `board-state.json` (live: 1, designed: 1, built: 3, backlog: 9).
Two independent suspects agree → high confidence.

## The reconstructed work-thread (one play, birth → live)

| # | Activity | Doer | Place (column) | State before → after | Evidence |
|---|---|---|---|---|---|
| 0 | Ground | Director + researchers | research | backlog → **sourced** | `README:71`; `<slug>/research/` |
| 1 | Brief (author §4 move graph) | Brief-drafter + Director | brief | sourced → **designed** | `README:72`; `<slug>/brief.md` |
| 2 | Harden | Hardener + Director | brief | designed (in place) | `README:73`; `<slug>/hardening.md` |
| 3 | **Confirm design — GATE 1** | Director | **board** | designed (gate) | `README:74`; `board-state.json` |
| 4 | Derive (→ workflow + diagram + story) | Author | workflow | designed → **built** | `README:75`; `<slug>/workflow.fabro`, `prompts/` |
| 5 | Lint (Protocols A–E) | Checker | workflow | built (in place) | `README:76`; `<slug>/lint.md` |
| 6 | Dry-run (k-run on the factory) | Grader | **factory** | built (in place) | `README:77`; `<slug>/dry-runs/*/events.jsonl` |
| 7 | **Confirm it's proven — GATE 2** | Director | **board** | built → **proven** | `README:78`; `board-state.json` |
| 8 | Register | orchestrator | plugin | proven → **live** | `README:79`; `packages/.../workflows/<slug>/` |

Read it as the diagram: **Case** = the thread; **State/Time** = down the rows;
**Place** = across the columns. The thread is *not* a clean left→right line — it
**jumps back to `board` at steps 3 and 7** (the two Director gates) and **steps
out to `factory` at step 6** (the dry-run). That is exactly the shape of the
Event-Storming picture made independently in the other workspace — recovered here
from `README.md` + `board-state.json` alone.

## Why this is the proof we wanted

- **The method is mechanical enough to trust:** name the suspect (the play), read
  its status field for the rows, read the loop for the activities, place each
  activity by its output, confirm against the per-case artifacts. No
  interpretation of prose vibes — coordinates off records.
- **It degrades gracefully:** the project-level event ledger wasn't found in this
  checkout, but the status field + the loop + the per-case artifacts still fully
  reconstruct the thread. Missing one suspect ≠ blind (the lineup is redundant by
  design).
- **It would have improved the static map too:** following the work surfaces the
  load-bearing nouns (play, stage, gate, the five agent roles, workflow package,
  fixture) and naturally down-weights the incidental ones.

## What the sweep should do (folding the method in — the how-to for Move S)

Given a **shape** of *assembly-line/pipeline* (from the Vision), the sweep's
work-pass runs the suspect lineup in order and writes the five coordinates as a
first-class, context-tagged **work-thread** artifact (this table, as data):

1. **Case** — find the central record (the thing that accumulates + carries a
   status). Suspects: the "pile" table/dir, the aggregate, the case folder.
2. **State** — read its status field/enum → the stages (the rows). Flag *second*
   status fields as hot-spots (we already do — "two ladders").
3. **Activity** — read the loop/commands/handlers/jobs → the steps that advance it.
4. **Place** — locate each activity by where its output lands → the columns.
5. **Event** — confirm the thread against the trail (audit log, run records,
   per-case artifacts). Artifact-presence corroborates state.

Self-check gate: every declared throughline step maps to a captured step; every
boundary-crossing is a hand-off; any context never touched by a thread is dead
structure → a gap thread.
