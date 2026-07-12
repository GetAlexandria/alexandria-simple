---
name: duty-loop
description: >
  Run one beat of a colleague's 30-minute duty loop: check the watched
  surfaces (Info Hub board, git history, connected inboxes), act on what is
  clearly in remit, journal the beat, and escalate judgment calls to the
  "Needs a Human" board lane. Never block waiting for a human.
---

# Duty Loop

One beat of the no-babysitting rhythm. A headless colleague session runs
this skill on a 30-minute cron (see `docs/alexandria/duty-loop.md` for the
cron entry and the operator contract). The beat is bounded: check, act,
journal, sleep. If nothing needs doing, the beat still happens — it just
journals a one-line no-op.

You are running as a named colleague (Raven, Damien, …). Everything you do
this beat is done as that colleague: their remit bounds what "clearly in
remit" means, and their journal is where the beat is recorded.

## The beat

### 1. Orient

Read your journal at `docs/alexandria/journal/<colleague>.md` — the top
entry is your previous beat. It tells you what you last saw, what you were
mid-way through, and what you already escalated (do not re-escalate).

### 2. Check the watched surfaces

- **Info Hub board** — read `docs/alexandria/info-hub/board-state.json`.
  Compare against the board as your last journal entry described it: new
  cards, moved cards, checklist changes. A card in your area with status
  `open` is a standing invitation to work it.
- **Git history** — `git log` since your last beat (the journal entry
  records the last SHA you saw). Commits from the humans or other
  colleagues may change what your open work means.
- **Inboxes, when connected** — if Gmail / Google Calendar MCP tools are
  available in this session, check for new client email and imminent
  calendar items relevant to your remit. If the connectors are not
  authenticated, note "inboxes unavailable" in the journal and move on —
  degrade gracefully, never treat a missing connector as an error.

### 3. Act — or escalate

For each event you found, decide with the library
(`docs/alexandria/library/`) as your grounding:

- **Clearly in remit, reversible, and you'd bet a colleague would just do
  it** → do it this beat. Keep it bounded: one beat's work, not a project.
  Board edits go directly into `board-state.json` (update `status`,
  checklists, `updated`); library changes go only through plays and `ax`
  commands, never freehand.
- **A judgment call, irreversible, or outside your remit** → escalate: set
  the relevant board card's status to `needs-a-human` (create the card if
  none exists — the "Needs a Human" lane is the escalation channel), and
  say in the card detail what you'd do and why you stopped. Do not ping the
  humans directly; they sweep the lane on their own rhythm.
- **Neither** → leave it, note it in the journal if it may matter later.

### 4. Journal the beat

Append one entry at the top of your journal (format in
`docs/alexandria/journal/README.md`): timestamp, what was checked (including
the latest git SHA seen), what was done, what was escalated. No-op beats get
one line. The journal is both your memory for the next beat and the humans'
catch-up feed — write it for both readers.

### 5. Commit

Commit whatever the beat changed (journal entry, board edits, play output)
as one commit: `Duty loop (<colleague>): <one-line summary>`. Git is how
this beat's work reaches the humans and the other machines.

## Boundaries

- Never block waiting for a human ruling — escalate and end the beat.
- Never start work that cannot be finished or cleanly parked within a beat;
  park by journaling state and, if in-flight, marking the board card
  `in-progress`.
- Urgent work does not come through this loop at all: a human opens a
  session and kicks a colleague directly. The loop only has to be as
  responsive as its cron interval.
