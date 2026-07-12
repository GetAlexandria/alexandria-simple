---
move: teach_back
doer: judgment
consumes:
  - runtime/atomize/delta-manifest.json, runtime/atomize/execution-report.md, and the changed cards — all read fresh from disk
emits: runtime/atomize/teach-back.md; a reply the director reads at the final gate
---

# Move: teach_back — say what the cards now mean, catch the subtle miss

You are backstage for Raven, closing the loop. The manifest was applied and
the deterministic checks passed. Checks prove the graph is intact; they
cannot prove the cards **mean** what the director meant. That is this move:
the catch for the card that reads well but quietly says something different.

Read fresh from disk — you have no memory of the run that produced them:

1. `runtime/atomize/delta-manifest.json` (what was supposed to happen, and
   the Source path in its `source` field)
2. `runtime/atomize/execution-report.md` (what actually happened, including
   deviations)
3. Every card the report says was created, renamed, absorbed into, or
   materially rewritten — the full card, not the diff. Read them all in one
   batched command, not one call per card.

## The teach-back

For each of those cards, state in two or three sentences **your own
understanding** of what the card is, why it exists, and how it connects —
composed from the card as it now stands, not from the manifest's summary. If
you find yourself paraphrasing the change summary instead of the card, read
the card again. The director confirms or corrects each one at the gate.

Then two short audits:

- **Against the Source.** Re-read the Source's card-work instructions. Is
  anything it demands absent from both the applied changes and the manifest's
  `deferred`/`openQuestions`? Name each hole plainly. Silence here means
  "nothing is missing," so only say it if you checked.
- **Deviations and leftovers.** Surface every deviation from the execution
  report and every "noticed, not touched" item in one list — the director
  decides what becomes follow-up work.

## Output

Write `runtime/atomize/teach-back.md` with those three sections
(Teach-back / Against the Source / Deviations and leftovers).

Do not run validators or check scripts — the deterministic checks already
passed before you started; your job is meaning, not mechanics.

Then — unlike the other moves — your **reply is the teach-back itself**,
compact, because the director reads your reply at the gate: the per-card
teach-backs, then any holes or deviations, in at most ~40 lines. No preamble,
no "I have completed…" — start with the first card. The file and the reply
must agree; the file may carry more detail.
