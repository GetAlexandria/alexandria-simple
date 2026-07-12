# Play Maker's Studio

The Studio is where Raven's plays are written and proven: a play library
with a Director-gated production process, a viewer surface to review it on,
and the state files that drive it. It moved here from
`conductor-playground-fabro-experiment` (raven-playbook, `62ddfad`,
2026-06-12) to be extended toward Fabro workflows — see
`STUDIO-MIGRATION.md` for the move and `inheritance/README.md` for what was
carried in and what is quarantined.

## Run the Studio

```
ax start viewer
```

Then open http://127.0.0.1:4321/studio. The viewer is the canonical Studio
surface; its local AX runtime endpoints persist Board edits to
`plays/board-state.json`.

## Entry points

- **New session?** `plays/HANDOFF.md` — the session-start package; it
  points at everything else and ends with the close-out duties.
- **The Board** — `/studio?tab=board`: play cards move through Backlog,
  Sourced, Designed, Built, Proven, and Live; work-order cards track Testing,
  Improvement, and Bug work with their own open / in-progress / done status.
  Agents make the same moves and edits in `plays/board-state.json`.
- **The catalog** — `/studio?tab=catalog`: the Division -> Function -> Play
  catalog. Play identity and filing live in `plays/registry.js`.
- **Play records** — `/studio?tab=play&slug=<slug>` plus the files under
  `plays/<slug>/`: logic drawing, brief, elicitation trace, decision queue,
  research.

## State

`plays/registry.js` (identity + catalog filing), `plays/board-state.json`
(play stage + priority order, ready flags, and `cards[]` work orders), and
`plays/board-model.js` (the data/model helper used by validators). One fact,
one place; the viewer renders from these.

— Migrated from `conductor-playground-fabro-experiment@62ddfad` (flat copy,
Director-ruled; dated provenance lives inside the artifacts themselves).
The Theater UI mockup deliberately stayed behind in that repo as a design
reference (speculative work doesn't ride, Director ruling 2026-06-12).
