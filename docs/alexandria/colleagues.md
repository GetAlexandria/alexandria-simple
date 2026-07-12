# Adding a Colleague

alexandria-simple's colleagues (Raven, Damien, and any future addition) are
Claude Code plugin agents that share one rhythm: a 30-minute cron "duty
loop" instead of an always-on listener or event process. Adding a new
colleague is a small, three-part scaffold — no new infrastructure.

## 1. Agent definition file

Add `<name>.md` to `packages/alexandria-plugin/agents/`, following the shape
of `raven.md` or `damien.md`: YAML frontmatter (`name`, `description` with
example prompts) followed by the prompt body — who the colleague is, what
they know, how they work, and (if the remit is large enough to need it) an
optional `<name>-resources/` directory of deep-dive docs loaded on demand,
same pattern as `raven-resources/` and `damien-resources/`.

## 2. Journal file

Add `docs/alexandria/journal/<name>.md`, seeded the way
`docs/alexandria/journal/raven.md` is: a short header pointing at
`docs/alexandria/journal/README.md` for the format, then a single seed entry
dated the day the colleague was added (no fabricated history). This is the
colleague's memory between duty-loop beats and the humans' catch-up feed on
what the colleague has been doing — see the journal README for the
append-at-top entry shape (timestamp, what was checked, what was done, what
was escalated).

## 3. Optional home slice of the library

If the colleague owns a real area of the product or company (the way Raven
owns product context), it can have a home slice under
`docs/alexandria/library/` — a context the colleague reads from and, through
plays and `ax` commands, helps keep current. Not every colleague needs this;
Damien, for example, works mostly from source material and the library
Raven maintains rather than owning a library slice of his own. Never
freehand-edit the library outside of plays/`ax` commands — see the root
`CLAUDE.md` for that boundary.

## The shared rhythm

Every colleague runs the same duty loop: a cron job fires roughly every 30
minutes, the colleague wakes up, checks relevant state (its journal, the
Info Hub board, the library, other colleagues' journals), does a bounded bit
of work if there's work to do, writes one journal entry describing the beat,
and goes back to sleep. That loop itself lives in the duty-loop skill
(`packages/alexandria-plugin/skills/`) — new colleagues use that skill
rather than inventing their own polling or scheduling logic. A new
colleague's agent definition should point at the duty-loop skill the same
way it points at any other play or skill it fronts.
