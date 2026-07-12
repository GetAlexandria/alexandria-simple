# Project plan — moving Play Maker's Studio to alexandria-internal

Drafted 2026-06-12 by the orchestrator, at the Director's direction. This is
the plan, not the move: phases 1–6 run only after the Phase-0 rulings.

**Scope rule (Director-ruled, 2026-06-12):** anything the Studio refers to
that isn't already in alexandria-internal comes along for the ride;
speculative work stays behind. He named the examples: the dev-helper-agent
design and the Cognitive-Lab-derived mockup are speculative; the citations
the rules stand on are not.

**What moves:** the `raven-playbook/` tree minus exclusions — the Studio.
That is: the plays system (`plays/`: 15 play dirs + examples/, the Board +
`board-state.json`, `registry.js`, registry, process docs HANDOFF/CLOSEOUT/
README/AUTHORING/TESTING/TEMPLATE/PARKING-LOT, examples), the showcase
(`index.html`, `research/` — incl. plays.html, the inventory page rung-2 §8
cites), and `site-server.py`. Plus, under the scope rule, the referenced
external records into `studio/inheritance/` (reference sweep, 2026-06-12):
- `alexandria-port/conventions/` — **all seven files** (README's Runtime
  section inherits the conventions "wholesale", so the whole dir is
  referred-to);
- `alexandria-port/PROMPT-REVIEW-FINDINGS.md` and
  `alexandria-port/model/doer-honesty-audit.md` — the autopsy pair the
  README's rules cite.

**What stays (speculative, per the rule):**
- `theater/` — the Play Maker's Theater mockup (the Cognitive-Lab UI
  study). Its ratified ideas already moved into the Studio proper as the
  Board; the mockup remains in fabro-experiment as a design reference.
  This also retires the "theater inline snapshot" debt for the new home.
- Everything else in `alexandria-port/` (factory plans, `team/`, `tools/`,
  the other `model/` docs, SETUP-ACP) — a separate workstream the Studio
  does not cite.
- The dev-helper-agent design — not in the Studio tree at all (verified by
  sweep); named here only because the Director cited it as the class of
  thing that stays.

State = `registry.js` + `board-state.json` + the dated provenance inside
the artifacts themselves. ~125 files after exclusions, ~2.5 MB.

**Source of truth during the move:** the fabro-experiment repo remains the
Studio's home until Phase 5 cutover completes. No rulings or board moves
land in the new home before then; none land in the old home after.

---

## Phase 0 — Pre-flight (Director rulings, then a freeze)

Merge PR #13 first — the copy is taken from a merged `main`, never from a
working tree. Then two rulings (a third, on scope, was ruled 2026-06-12
and is now the standing scope rule above):

**Ruling A — destination directory.**
Stakes: where the Studio lives shapes how agents and tooling find it forever.
- ★ **`studio/` at repo top level** — recommended. The Studio is a live
  site + state + process kit, not docs and not a package. Top-level keeps
  its internal `../../` link structure working untouched, gives it its own
  README, and matches the repo's existing pattern of self-contained
  top-level concerns (`skills/`, `setup/`, `repos/`).
  Cons: one more top-level dir in a tidy monorepo.
- `docs/alexandria/studio/` — pro: groups with internal product docs;
  cons: buries a served site two levels under docs, invites doc-tooling
  assumptions, longer paths in every future conversation.
- `packages/playmaker-studio/` — pro: uniform with the workspace; cons:
  implies pnpm build tooling the Studio doesn't have or need.

**Ruling B — history.**
Stakes: whether `git log` in the new home reaches back through sessions 1–6.
- ★ **Flat copy + provenance pointer** — recommended. The playbook's own
  discipline puts provenance *in the artifacts*, dated inline, precisely so
  records don't depend on any repo's log. A `MIGRATED-FROM` note (source
  repo, final commit SHA, date) preserves the trail for archaeology.
  Cons: `git blame` in the new home starts at the migration commit.
- `git subtree split` of `raven-playbook/` merged into alexandria-internal —
  pro: full per-file history; cons: imports a foreign commit graph into a
  release-tooled monorepo, and the history it preserves is mostly
  bulk-generation commits — the real provenance is already in the files.

Close Phase 0 by declaring the **freeze**: no board drags, no rulings, no
play edits in the old home from copy (Phase 1) to cutover (Phase 5). The
freeze window should be one session.

## Phase 1 — Transport (mechanical, one agent)

1. In an alexandria-internal workspace, branch per that repo's WORKFLOW.md
   (read it first — release tooling may gate top-level additions).
2. Copy `raven-playbook/` → `<destination>/` verbatim from the merged SHA,
   **excluding `theater/`** (stays behind per the scope rule).
3. Add `studio/README.md`: what the Studio is, one paragraph; the server
   command (`python3 site-server.py 8778` from the studio root — plain
   `http.server` breaks Board saves); entry points (Board, registry,
   HANDOFF); and the MIGRATED-FROM provenance block (Ruling B).
4. Copy the nine inherited documents (conventions/ ×7 + the autopsy pair)
   into `studio/inheritance/` with a one-line provenance header each
   (where copied from, SHA, date).

## Phase 2 — Rewire (surgical, one agent)

Small, enumerable edits — nothing else changes:
- `plays/README.md` + `plays/AUTHORING.md`: citations → `inheritance/`
  paths (scope rule).
- `plays/HANDOFF.md`: server note gets the new working directory for
  `site-server.py`; the theater references get a dated annotation (mockup
  stayed in fabro-experiment as a design reference; its inline-snapshot
  debt is retired for this home); the "⬚ Board" top-nav claim drops the
  theater from its list. Everything else is path-relative and stands.
- Strip the theater link from any page top-nav that carries it (the
  theater page itself stays behind; nothing in the new home may link to a
  file that doesn't exist).
- alexandria-internal `CLAUDE.md` (and `AGENTS.md` if conventions differ):
  add a two-line pointer — the Studio exists, where it lives, the server
  command, and that `plays/HANDOFF.md` is the session entry point.
- Port check: 8778 assumed free on the machines that run this repo; if it
  collides, change once in `site-server.py` + HANDOFF's server note (the
  pages use relative URLs and don't care).

## Phase 3 — Mechanical verification (one agent)

All checks attested, not implied ("examined N, found M"):
- Link check: every `load()` path, DOCS manifest entry, and `href` across
  all pages — 12 workshops, registry, the Board, the showcase — resolves
  on disk (the session-6 check scripts are the pattern); explicitly
  includes confirming nothing still points at the excluded `theater/`.
- Browser sweep: every page loads with zero console errors under
  `site-server.py` from the new path.
- Board round-trip both directions: drag → `board-state.json` changes;
  direct file edit → page reflects it. Bad-payload POST still 400s and
  leaves the file untouched.
- Counts: registry.js (16 entries), board-state slugs (15 placed + ordering
  intact, 2a on top), rulings totals match the per-play queues (44).

## Phase 4 — Cold launch in the new home (one agent)

The CLOSEOUT cold-launch test, run against the new location: a fresh Sonnet
agent reads `<destination>/plays/HANDOFF.md` and only what it points at,
then reports state + first move + anything ungroundable. Fix and re-test
until clean. The move is not done because files copied; it is done when a
cold agent launches clean from the new ground.

## Phase 5 — Cutover

1. Merge the alexandria-internal PR.
2. In fabro-experiment: replace `raven-playbook/` contents with a tombstone
   README — "moved to alexandria-internal/<destination> at <SHA>, <date>;
   do not edit here" — via a small PR. (Recommended over deleting nothing:
   two live copies is split-brain waiting for a board drag. Recommended
   over deleting immediately: the tombstone is the redirect agents and
   bookmarks will hit.)
3. Stop the old :8778 server; start it from the new path.
4. Lift the freeze. The Board's top card (Elicit Business Context) and all
   44 queued rulings are exactly where they were.

## Phase 6 — First session in the new home

The Director's 2a deep review runs as the new home's shakedown cruise —
first real rulings scribed there, first real board moves persisted there.
Deferred items carried (already in HANDOFF's debts): rung-1's 75-word
ceiling question; the tombstoned old tree can be deleted in a later
cleanup PR once nothing has hit the tombstone for a while. The Theater
mockup's debts stay with the mockup in the old repo; if its design ever
graduates, that's a fresh build in the new home against registry.js, not
a port of the mockup.

## Sequencing, economics, risks

**Sequencing:** the move lands before the 2a review, so rulings are scribed
once, in the permanent home. If the Director prefers to review 2a first,
Phases 1–5 simply wait — the plan doesn't care, but the freeze must never
overlap a review session.

**Economics:** Phases 1–4 are each one Sonnet agent, sequential (each
phase's output is the next one's input); Phase 5 is orchestrator + two
small PRs. Total: ~4 agents, one session including the Director's three
Phase-0 rulings.

**Risks, named:**
- *Split-brain state* (both copies alive) — mitigated by the freeze + the
  tombstone; the cutover is the only step that may not be done halfway.
- *Silent link rot* — mitigated by Phase 3 being mechanical and attested,
  and Phase 4 being fresh-eyes.
- *Citation rot* (Ruling C) — mitigated by copying the cited records in.
- *Monorepo conventions unknown* — mitigated by reading WORKFLOW.md before
  branching; if release tooling objects to a top-level dir, that's a
  Phase-1 stop-and-ask, not a workaround.
- *In-flight PR divergence* — mitigated by copying only from merged main
  (Phase 0).
