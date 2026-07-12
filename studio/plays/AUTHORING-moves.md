# Authoring `moves.md` — the "Inside the play" overlay

*(Companion to `AUTHORING.md`. That guide authors a play's deployable node
prompts during Derive; this one authors the reader-facing prose the viewer's
Play page renders over them. Same loop — an Author drafts, the work is checked,
a human edits — different artifact: `AUTHORING.md` writes for a cold doer
agent; this writes for a director skimming the play. The standing exemplar is
`frame-the-problem/moves.md`; read it before you write.)*

## What you are writing

One file: `<play-dir>/moves.md` — the per-move prose for the Play page's
"Inside the play" section. It is an **authored overlay**: a simplification that
points back at canon, never competing canon (studio/plays/README.md, "Authored
explainer overlays"). It is optional and not Protocol-E gated — but when it
exists it must stay in step with the logic, which is what `check-moves.ts`
enforces.

You write prose for a structure you do **not** own. The move order, the move
ids, the doers, and the off-path routes are all derived (`story.md`,
`workflow.fabro`). You never add, drop, rename, or re-route a move. If the
prose seems to need a move or exit the play doesn't have, that is a
Director-challenge — kick it back, never invent it (same rule as `AUTHORING.md`).

## Your inputs

- **`story.md`** — the spine. Its "golden path, move by move" gives you the
  move order, each id, each doer, and each move's "Routes besides the golden
  path" (the exits you owe a branch story).
- **`prompts/<move>.md`** — the method, one per move. This is the *source of
  the beats and the branch stories*: read the prompt, then say in plain words
  what she actually does. Translate it — never transcribe it.
- **`synopsis.md`** — the voice and the cast (the dramatised scene, character
  names, the product). Match its register and "she".
- **`frame-the-problem/moves.md`** — the exemplar. Imitate its shape and
  altitude; never its content.

## The skeleton — one block per move

```markdown
### <move id — exactly as it appears in story.md>
<Lead: one plain sentence — what this move is, in her voice.>
- <2–4 beats: the concrete things she does on the golden path, in order.
  Scannable bullets, never one undifferentiated paragraph.>

**↳ <Route label> — <headline>.**
<The branch story: what happens when a run validly leaves the golden path
here, and what she does about it. One block per off-path route the move has.>
```

The prose before the first `**↳ …**` is the golden path. Each `↳` block is one
branch. The label before the em-dash binds to the derived route (so the viewer
draws the arrow and colours it: refuse/exit → red, empty/honest → blue,
fix/bounce → amber); the headline after it is the human title.

## Rules

1. **Cover the structure exactly.** Every move in `story.md` gets a block.
   Every off-path route gets a `↳` branch whose label matches it. Also name the
   honest **soft landings** — an empty/no-op result that is a valid success
   (e.g. "nothing to highlight") — even when it isn't a routed exit; write it as
   a branch with no arrow.
2. **Voice from the prompt, not the prompt.** No frontmatter, no file paths, no
   JSON, no `preferred_next_label`, no move ids in the prose. The reader is a
   director skimming, not a doer executing — say the work, not the wiring.
3. **Beats, not a wall.** A lead sentence plus a few ordered beats. If a beat
   needs a second clause to breathe, it can have one; it does not get a
   paragraph.
4. **Say the delta, not the label.** Don't restate the move title or narrate the
   id — the title already renders above your prose. Tell what she does that the
   title doesn't already say.
5. **Point back at canon.** The brief and the prompt remain the source of truth;
   your prose simplifies, it never adds a rule. Anything load-bearing a reader
   needs is in canon already — you make it legible, not authoritative.
6. **Tight enough to read in one sitting.** All of a play's moves are read
   together. Earn every line.

## After you draft

Run the coverage check and clear it:

```sh
studio/tools/check-moves.ts <play-dir>
```

Fix every **error** (a move with no story, an orphan block). Review every
**warning** (an exit with no branch, a block with no golden path) — each is a
gap a reader will hit. A clean run means the overlay renders right; it does not
mean the prose is *good*. That last mile — voice, rhythm, the choose-your-own-
adventure feel — is the human edit the draft exists to make cheap.

You are not the only thing that runs this check. `derive-views.sh` runs it
advisory every time the spine is re-derived — so when the logic changes under
you, the staleness shows up at that moment — and the **Lint** rung gates on it
(README, "The loop"). The check is the floor (coverage and shape), never a
verdict on the writing.
