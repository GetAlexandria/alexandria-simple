# Session-close package — play writing

You are ending a session on the Raven play-writing workstream. Closing out
means one thing: **make the recorded state match the actual state, so the
next session launches clean.** The session-start package (`HANDOFF.md`) is
what the next agent reads first and trusts completely — if it is stale, the
next session starts on false ground and burns budget re-deriving or, worse,
doesn't notice.

**The test for being done:** a fresh agent reading `HANDOFF.md` alone — and
nothing from this session — would correctly understand what exists, what is
proven, what is in flight, and what to do first. Run that test literally
(step 6).

## The checklist, in order

**1. Records before memory.** Everything decided or learned this session
must live in an artifact, not in the session transcript:
- Every dry run has a run record in the play's `dry-runs/` (or the fixture's
  `runs/`) — including failures, verbatim, with a header comment stating
  what was being tested and the grade.
- Every design change is a **dated amendment section in the play's brief**
  (the §9/§10 pattern), with who ratified it and what triggered it.
- Every prompt change made after a lint is in that play's `lint.md` patch
  log, with whether it was re-validated and what lint is still owed.

**2. Growth plans are living.** For each play touched: update its brief §8 —
mark items *executed* (with date) rather than deleting them, and add any new
growth edge this session surfaced. Playbook-wide ideas go to
`PARKING-LOT.md`; new process rules go to `README.md` with the failure that
earned them.

**3. The viewer tells the truth.** Sonnet agents, surgical edits:
- The Studio catalog — status and notes per play, in the status ladder's
  vocabulary; claim the strongest thing that is *true*, never more.
- Each touched play's records — the DOCS manifest lists every new file; inline
  copy reflects any renamed concepts; nothing links to a file that doesn't
  exist. The link check is mechanical: verify every `load()` and DOCS path
  against the filesystem.
- **Board model/state/catalog changed?** Run `sh tools/check.sh` (from
  `studio/`) — it validates `board-state.json` against the work-order card
  contract, compiles the Play Re-sync tool, syntax-checks the Board model, and
  runs the data/model unit tests. The repo's `bun test` and markdownlint gates
  exclude `studio/`, so this runner is the only thing that catches Board drift.

**4. Refresh the session-start package.** Rewrite `HANDOFF.md`'s "State as
of" section — date it, state each play's status, what changed this session
(one line per change, pointing at the artifact that holds the detail), known
residuals and debts, and **the next session's first move**. Then sweep the
rest of HANDOFF for sections this session invalidated (renamed concepts,
changed counts, new rules, filled gaps). HANDOFF stays an index — detail
lives in the artifacts it points at.

**5. Debts are declared, never silent.** Anything unfinished, known-broken,
or deliberately deferred is named — in HANDOFF's state section if the next
session must care, in the play's growth plan if it can wait. A debt nobody
wrote down is a trap, not a debt.

**6. The cold launch test.** Spawn one fresh-eyes Sonnet agent. It reads
`HANDOFF.md` and the documents it points at — nothing else — and reports
back: the state of each play, what it would do first, and anything it
couldn't ground. If its picture is wrong or it stumbles, fix the package and
re-test. This is the comprehension gate for the handoff itself; it is the
step that catches what you, with a full session in your head, can no longer
see.

## Economics

The whole close-out is Sonnet work except your judgment about what changed.
Steps 3 and 6 are agents; steps 1–2 and 4–5 are mostly writing you should do
yourself, since you hold the session. Budget: minutes, not hours. If the
close-out feels large, the session waited too long to write things down —
records are cheapest at the moment they happen (step 1 is really a
during-session discipline that close-out only verifies).

## Provenance

Date every state claim and every amendment. The next agent trusts dated,
attributed records ("Director-ratified, 2026-06-11") and re-verifies undated
ones — make everything the cheap kind.
