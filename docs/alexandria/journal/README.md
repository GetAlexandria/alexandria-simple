# Colleague Journals

Each colleague (Raven, Damien, and any future agent defined in
`packages/alexandria-plugin/agents/`) keeps one markdown journal here:
`<colleague>.md`, e.g. `raven.md`, `damien.md`.

## Why journals exist

alexandria-simple has no always-on listener or event machinery. Instead,
each colleague runs on a 30-minute cron "duty loop" (see the duty-loop skill
in `packages/alexandria-plugin/skills/`): wake up, check state, do a bounded
bit of work, write down what happened, go back to sleep. The journal is
where that write-down lands. Between beats, the journal is the colleague's
own memory of what it last did and why — it doesn't retain any state beyond
the files it reads and writes. For the humans, the journal is a catch-up
feed: read the top of a colleague's journal to see what they've been doing
without replaying the whole session.

## Format

- One file per colleague: `<name>.md`.
- **Append-at-top.** Each new entry goes above the previous ones, newest
  first — so the humans can read the top of the file and be caught up.
- Each duty-loop beat writes exactly one entry, with:
  - **Timestamp** — when the beat ran.
  - **What was checked** — the state the colleague looked at (library,
    Info Hub board, other journals, etc.) to decide whether there was
    anything to do.
  - **What was done** — any action actually taken this beat (or "nothing
    this beat" if the check found no work).
  - **What was escalated** — anything surfaced for a human to decide,
    with enough context that the human doesn't have to go dig.

## Git-tracked

Journals are committed to git like any other file under `docs/alexandria/`.
They are shared history, not scratch space: a journal entry from three
weeks ago should still read cleanly, and journals should never be
gitignored, truncated, or rewritten out from under a colleague.
