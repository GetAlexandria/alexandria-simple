# Work Systems and the Map-First Inversion

Source material, 2026-07-14. Authored by Raven from director rulings
(Danvers, in conversation, 2026-07-13 → 2026-07-14), with the Lifebuild
"Projects vs Systems" presentation as primary input
(`life-build-book` repo, `quartz/static/apps/projects-vs-systems.html`).

This document is frozen provenance for future library card work. The build
plan derived from it lives at `docs/alexandria/plans/work-system/plan.md`.
Where a statement is a director ruling it is marked **Ruling**; where it is
Raven's synthesis it is marked **Synthesis**.

## 1. The map-first inversion

**Ruling (director, 2026-07-14).** With Alexandria no longer shipping as a
commercial product (the Skillmaker.Studio pivot, Friday 2026-07-10),
Alexandria is now built **map-first**. When Alexandria was heading public,
the leaning was plays-and-playbooks as "the game" of Alexandria. Without
that requirement, the game is **building your company on the map**.
Plays and playbooks become a third-class citizen — an idea to be
implemented later, not the priority — exactly the position the map used to
occupy. This is an inversion of what this fork forked from.

Consequences for the library and the product:

- `Bet - Map-First Work Surface` stops being a tentative, low-confidence
  wager and becomes the operating charter of this fork. The bet's own
  reversibility note ("the surface can revert to lists and boards") is no
  longer the posture; the board persists as the system of record, not as
  the fallback.
- The playbook plane (plays, gates, orchestration) is demoted as product
  surface. The Fabro orchestrator retirement (ruled 2026-07-13) was the
  first cut of this. Plays survive as internal tooling for library
  operations until something simpler replaces them.
- Onboarding and first-run thinking anchor on the map, not the playbook.

## 2. The work system contract

**Ruling (director, 2026-07-14; recorded on the Work Board as
`wo-work-system-contract`).**

- The Work Board is the work system of record and the QA surface — a
  known, simple, non-innovative primitive to generate the map from. The
  map is a reflection of the work system. Federate now; deeper
  unification (or the map absorbing the board) stays a horizon option.
- **Systems generate work; projects contain it.** A system spawns cards on
  its rhythm. A project is stuffed with cards, still exists when half are
  done, and its membership changes over time — tasks removed, tasks added.
- Every map entity gets a **room**: its cards, their state, their history.
  Project rooms measure **progress** (contains work, ends, victories stay
  visible). System rooms measure **health and performance** (on time? to
  spec? reliable? maintained? what is queued for testing or improving it?).

## 3. The systems model, at full depth

**Provenance note (director, 2026-07-14).** The research behind the
Lifebuild presentation was geared toward industrial and corporate
settings; work was done to make it applicable to personal life. We are now
re-adapting it to a work setting — and it is the right level of thinking
to undertake.

What the presentation holds (Lifebuild, "Projects vs Systems"):

- **Project:** bounded work with a finish line. Progress %. The question
  is "how close am I to finished?" Ends: yes → archives.
- **System:** persistent infrastructure that generates work. Health, not
  progress. The question is "is it running smoothly?" There is no
  Complete button — systems don't complete.
- **System anatomy, six parts:** PURPOSE (what does this maintain?),
  INPUTS (what feeds it), PATTERN (when work happens), CONTROLS (health
  metrics), OUTPUTS (tasks, events, alerts), DELEGATION (who does what).
- **PATTERN is plural and heterogeneous.** The car-maintenance example
  runs four rules at once: every 5k miles (meter), every 10k miles
  (meter), annual (time), when low → reorder (condition). A single
  `cadence` field under-models a system.
- **CONTROLS:** on-time %, streak, next due date.
- **Lifecycle actions:** Hibernate (pause temporarily, config saved),
  Upgrade (improve it — spawns a project; the system continues, better),
  Uproot (end deliberately, history archived). This fork's system
  lifecycle vocabulary (`planted` / `hibernating` / `uprooted`) already
  carries this, ported from Lifebuild's Planting Season branch.
- **The creation loop:** projects create systems (notice the need → build
  the system as a project → plant it when the project completes → the
  system runs and generates tasks). Projects and systems feed each other:
  projects plant and upgrade systems; systems generate tasks.

## 4. Multi-level ownership

**Ruling (director, 2026-07-14).** Ownership must be assignable at many
levels, and the levels genuinely differ:

> "I may own a system, delegate an improvement project to Jess, and Raven
> is in charge of the tasks that spawn from it."

So three distinct slots, each fillable by a human or a colleague:

1. **System owner** — accountable for the system's health.
2. **Upgrade-project owner** — accountable for a bounded improvement to
   the system; the project ends, the system continues.
3. **Spawned-task assignee** — who works the generated cards, settable
   per pattern rule (rule-level delegation).

This is the presentation's DELEGATION component taken seriously for a
mixed human-and-agent company.

## 5. What work systems add over life systems

**Synthesis (Raven, 2026-07-14).**

- **Someone on the other end.** A work system (e.g. "check and respond to
  customer emails") serves external parties, so CONTROLS grow beyond
  on-time: response time and to-spec quality join the health picture.
- **Delegation across humans and agent colleagues.** In a life system the
  owner does their own oil changes. Here a system is often run by a
  colleague, so health partly means "is my colleague doing its job" —
  supervision is a control.
- **The upgrade queue is first-class.** "What is the queue for testing or
  improving it" (director) drains into upgrade projects linked back to
  the system.

## 6. The build state the library has not caught up to

Everything below is merged and live as of 2026-07-14, and almost all of it
is days old. The library still describes the world before it.

- **The map tab port (from Lifebuild).** Taken: the hex map and rendering
  stack, tile/overlay interaction grammar ("clicking a tile opens the work
  behind it"), the project/system primitive (Planting Season), system
  health dots. Left behind: LiveStore machinery, auth, the recurring-task
  subsystem, The Table, fog-of-war onboarding. Lifebuild's grid was flat;
  the domain geography is new here.
- **The taxonomy unification (ruled 2026-07-13).** Org `sociotechnica`;
  four post-pivot domains (`alexandria`, `skillmaker-studio`, `new-media`,
  `business-development`) as the single organizing level and shared join
  key; the board's `area` field retired; Context demoted to a latent,
  optional tag ("model it, don't render it"); projects and systems as flat
  domain tags; strays pile by domain.
- **The assignee model and Owner view.** Every work item carries an
  `assignee` (`human:` / `colleague:` prefixed); Owner view regroups the
  same work by assignee; colleagues live in the coin tray, not on the map.
- **Entity rooms and board-side creation (2026-07-14).** The board is the
  system of record: cards join any project/system directly (context picker
  gone, `contextId` optional end-to-end); every entity has a room (open
  and done cards — history visible; completed projects read-only); New
  project / New system are created from the board, born unplaced;
  placement is director-only (agents add entities, never arrange the map).

## 7. Atomization backlog

What library card work should mint or update from this source, when that
mission runs:

- Graduate `Bet - Map-First Work Surface` per §1; record the playbook
  demotion on the playbook plane's lead.
- New cards: the Work System (six-part anatomy, §3–§5), the Work Project,
  the Work Board, the Map surface, the systems-generate-projects-contain
  pattern, the multi-level ownership pattern (§4).
- Update `Entity - Domain` to the post-pivot set; resolve the
  Project noun collision (workspace-Project vs map-Project vs work
  model); rename `Domain - Playmaker's Studio Library` → Skillmaker;
  create colleague cards for William and Rob.
