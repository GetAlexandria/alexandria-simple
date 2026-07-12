# The Duty Loop

The duty loop is how alexandria-simple's colleagues stay in the flow of work
without anyone babysitting them — and without any always-on listener, event
process, or hosted service. A colleague is a headless Claude Code session
that wakes on a cron, runs one bounded beat of the `duty-loop` skill (check
the board, check git, check inboxes, act or escalate, journal, commit), and
goes back to sleep. At personal scale, polling collapses "reacts to events"
and "acts on schedule" into one mechanism: a colleague who checks their
surfaces twice an hour is indistinguishable from a responsive teammate, and
there is no process that can fall over silently.

## The cron entry

One line per colleague, on whichever machine hosts the loop (a laptop that
stays awake, or a small always-on box both humans can reach):

```cron
*/30 * * * * cd /path/to/alexandria-simple && git pull --rebase --quiet && claude -p "You are Raven. Run one beat of the duty-loop skill." && git push --quiet
```

The pull/push bracket is what makes the loop multiplayer: the beat starts
from the latest shared state and its journal entry, board edits, and any
play output land back in git for the humans and any other machine.

Notes:

- The session must run from the repo root so the skill's relative paths
  (`docs/alexandria/...`) resolve.
- Inbox checking (Gmail / Google Calendar) requires the MCP connectors to be
  authenticated for the account the cron runs as; the skill degrades
  gracefully when they are not.
- 30 minutes is a default, not a law. Shorten it if a week of journals shows
  events going stale; lengthen it if most beats are no-ops.

## The escalation contract

The "Needs a Human" lane on the Info Hub board
(`docs/alexandria/info-hub/board-state.json`, status `needs-a-human`) is the
single check-in channel between colleagues and humans:

- A colleague who hits a judgment call, an irreversible step, or anything
  outside its remit moves (or creates) the board card into that lane, with
  what it would do and why it stopped — then ends the beat. Colleagues
  never block waiting, and never ping a human directly.
- The humans sweep the lane on their own rhythm — in the viewer or in the
  file. Ruling on a card and moving it back to `open`/`in-progress` is what
  hands it back to the loop; the next beat picks it up.

## Urgency bypasses the loop

The loop is deliberately allowed to be ~30 minutes behind. When something is
urgent, a human opens an interactive session and kicks a colleague directly
("Raven, the client just emailed — handle it"), exactly like tapping a
teammate on the shoulder. Nothing about the loop needs to be fast, because
the human escape hatch already is.

## Catching up

Each colleague's journal (`docs/alexandria/journal/<name>.md`, newest entry
first) is the catch-up feed: what was checked, done, and escalated, beat by
beat. Between the journals, the board's lanes, and `git log`, the whole
history of unattended work is readable in the viewer or the editor — no
dashboard service, no logs to ship.
