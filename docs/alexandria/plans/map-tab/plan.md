# The Map Tab — Plan of Record

**Status:** Approved direction; issues drafted, filed after this PR merges
**Date:** 2026-07-12
**Owner:** Danvers (director) · Raven orchestrates the build
**Issue drafts:** `./issues/` (one file per issue, filed in flight order)

---

## 0. What we're building and why

A **Map tab** in the viewer: a parchment hex map where the durable things we oversee —
domains, contexts, projects, systems, and AI colleagues — live as regions, tiles, and
buildings, with ambient visual signals (glow, health dots, sepia, candle flicker) derived
entirely from files agents already write. The map is a **pure lens over git-tracked state**,
honoring this repo's pillar: no database, no server-owned state, the viewer renders what's
in the files.

The interaction grammar and most of the rendering code come from **Lifebuild**
(`github.com/…/lifebuild`, local at `~/conductor/repos/lifebuild`), whose map-first UI
shipped on `origin/main` (@ `bf183a3`) and whose projects-vs-systems release ("Planting
Season") was fully built but never merged (branch `ralph/r3-planting-season` @ `1a6df97`).
We port with discipline (§3), not wholesale.

This also activates the library's dormant `Bet - Map-First Work Surface` and gives the unrun
`Experiment - Spatial Surface Versus Plain List` a real A/B: the Info Hub kanban and the Map
render the same underlying work.

---

## 1. The data model (the governing ruling)

**The map is built on Domain → Context → Work-to-be-done-or-doing. Nothing else.** Where AI
dev goes most wrong is lack of data-model discipline, so the model is authored first, fresh,
in house style, and everything ported must conform to it. Ported code adapts to our schema;
our schema never bends to ported props.

### 1.1 The hierarchy

- **Domains are map regions.** The grid is partitioned into territories — for a business:
  Marketing / Software / Sales; for a personal map: a work half and a personal half with
  domains inside (Chores, Social). Rendered as tinted regions of the parchment with borders
  and labels.
- **Contexts are clusters within a domain** — contiguous patches of hexes. Contexts should
  ultimately correspond to library contexts (`libraryContext` optional field now; reconcile
  vocabulary once the draft library settles), so the map literally renders the library's
  index → context → card altitude structure as geography.
- **Within a context, work-to-be-done-or-doing takes three forms:**
  - **Project tiles** — bounded, progress, ends. "How close am I to finished?"
  - **System tiles** — loops, health, generate work, never end. "Is it running smoothly?"
    Each colleague's duty loop is a system; so are standing human rhythms.
  - **The stray task pile** — one pile sprite per context for board cards joined to the
    context but to no project/system. Loose work gets a home without forced structure.
- **Work orders** (existing `docs/alexandria/info-hub/board-state.json` cards) are the work
  layer. They gain optional `contextId` and `entityId` fields (additive; existing free-text
  `area` remains as a soft grouping). A system *generates* cards; a project *contains* them.
- **Colleagues are landmarks**, not tiles — fixed buildings (Lifebuild's Sanctuary/Workshop
  pattern). Click → overlay with journal top entries + quick bar. Locked plots for future
  bench seats. Colleagues may add entities to map state but **never place or move tiles** —
  placement is director-only (Lifebuild's hard rule: agents observe the map, never arrange
  it).

The project/system distinction is Lifebuild's, verbatim, and it resolves cleanly here:
*directors run projects, colleagues run systems.*

| Dimension | Project | System |
|---|---|---|
| Shape | Linear | Loop |
| Metric | Progress | Health |
| Work | Contains it | Generates it |
| Ends | Yes → greyed on map ("victories stay visible") | No (until uprooted) |

### 1.2 Two view modes over the same state

| | Domain view | Owner view |
|---|---|---|
| Organizer | Domain → Context → work | Domain → responsible agent/human |
| Question | "What's going on in Marketing?" | "What is Damien in charge of, and is it healthy?" |
| Library analog | the Index, rendered spatially | the Playbook / org chart (Domain : Employee) |
| Colleagues | landmark inside their home domain | the anchor: building at region center, territory around it |

Same state file, two layout functions. Owner view surfaces the gap case: an unowned domain
renders visibly unclaimed — demand signal, not an error. **Both get prototyped** (issues
V1/V2); the director rules on the look before real data wiring.

### 1.3 State file

`docs/alexandria/map/map-state.json` — git-tracked, agent-editable, human-mergeable
(positions change rarely, by hand):

```json
{
  "domains": [
    { "id": "software", "name": "Software", "half": "work",
      "owner": "colleague:raven", "region": { "center": [0, -3], "radius": 2 } }
  ],
  "contexts": [
    { "id": "viewer", "name": "Viewer", "domainId": "software",
      "libraryContext": "product/viewer" }
  ],
  "entities": [
    { "id": "sys-raven-duty-loop", "kind": "system", "name": "Raven duty loop",
      "contextId": "viewer", "colleague": "raven", "cadence": "30m",
      "lifecycle": "planted" },
    { "id": "prj-map-tab", "kind": "project", "name": "Map tab",
      "contextId": "viewer", "lifecycle": "active" }
  ],
  "positions": [
    { "q": 1, "r": -1, "entityType": "system", "entityId": "sys-raven-duty-loop" },
    { "q": 0, "r": 0, "entityType": "landmark", "entityId": "colleague:raven" }
  ]
}
```

Rules: one entity per hex (validated on write); reserved hexes for landmarks; completed
projects stay greyed; hibernating/uprooted systems dim/leave. The stray pile is derived
(cards with `contextId` but no `entityId`) and never has a stored position.

### 1.4 Signals are derived, never stored

Computed at read time — no new server state, no new writes by anyone:

| Signal | Source (existing files) | Visual (ported) |
|---|---|---|
| Needs a human | joined card in `needs-a-human` on the board | emissive glow |
| System health | duty-loop journal entries within cadence window (`docs/alexandria/journal/`) | 3 filled/unfilled health dots |
| Staleness | joined cards untouched ≥ 14 days | sepia overlay |
| Overdue | system past its cadence window | candle flicker |

Lifebuild's smoke-signal philosophy carries over verbatim: "ambient, not alarming — visual
states, not push alerts." No badges, sounds, or counts.

---

## 2. What we port from Lifebuild

Read via `git show origin/main:<path>` (the local working tree is stale) except R3-branch
files via `git show 1a6df97:<path>`.

**Take:** `packages/shared/src/hex/{types,math,grid}.ts` (pure cube-coordinate math, tested);
presentational components under `packages/web/src/components/hex-map/` — `HexMap`, `HexGrid`,
`HexTile`, `HexCell`, `CameraRig`, `FixedBuilding`, `LandmarkSprite`, `ProjectSprite`,
`BackgroundPlane`, `placementRules.ts`, `shaders/parchmentShader.ts` (316-line
watercolor/parchment material); **from the R3 branch:** `SystemHexTile.tsx` (health dots,
hibernating dim; commit `eeaf23c`) and the smoke-signal additions incl. `CandleFlicker`
(commit `e4918c9`); sprites from `packages/hex-grid-prototype/public/sprites/` (trees,
houses, statue, sanctuary, well, crop plots, 15-frame campfire).

**Rewrite fresh (tiny or coupled):** the `LifeMap.tsx` container (565 LOC of LiveStore
queries — ours reads our schema), `hexPositionCommands.ts`, `PlacementContext.tsx`.

**New code (didn't exist in Lifebuild):** domain regions, context patches, region
tinting/borders/labels, the two view-mode layout functions, stray piles.

**Leave behind:** all LiveStore machinery and sync workers, auth, the ~70-event schema,
`recurringTasks`/`taskExecutions` (legacy AI-cron, unrelated to the System primitive), The
Table and gold/silver/bronze streams, the 4-stage drafting taxonomy, Jarvis/Marvin/Mesa,
fog-of-war onboarding.

---

## 3. Quality strategy: quarantine → prove → improve → integrate

The ported code was written in an earlier AI era; treat it as **salvage and reference, not
gospel**. Four gates, per piece:

**Gate 1 — Quarantine.** Ported source lands verbatim in `quarantine/lifebuild-map/`:
excluded from build, lint, and tests; never imported by product code. `MANIFEST.md` records
provenance per file (source repo, path, commit SHA). Precedent: alexandria-internal's
`studio/inheritance/quarantine/` — not load-bearing until promoted.

**Gate 2 — Prove.** The model (schema, types, validators, endpoints) is written fresh and
merges before any UI. Each ported piece must then demonstrate itself against fixture data on
the dev route, with Lifebuild's existing tests ported alongside. No demo, no promotion.

**Gate 3 — Improve.** Promotion is a per-piece decision (port / port+simplify / rewrite —
see §2). Every promotion PR runs `/simplify` and `/code-review` on the promoted code before
director review. Era-modernization checklist at promotion: React 19 compatibility (this
viewer is React 19 → `@react-three/fiber` v9 line, not Lifebuild's v8 era); Astro
client-only island guards; hardcoded copy-paste hex colors consolidated to module tokens;
LiveStore-compat residue stripped; fonts resolved locally.

**Gate 4 — Integrate.** Only promoted, model-conformant, simplified pieces enter
`packages/viewer`. The fixtures dev route stays permanently as the map's regression harness.
Quarantine is deleted at the end (L3); the manifest SHAs keep the pointer back to source.

---

## 4. Flights

House rules: one issue = one PR; PRs independent and non-stacked off main; no auto-merge;
director hand-QAs each; every issue carries context, acceptance criteria, and a QA script.
Raven orchestrates — one agent per issue, review gates run before handoff.

| Flight | Issues | What lands |
|---|---|---|
| 0 — Model | M1 | `map-state.json` schema, types, validators, ax endpoints, card `contextId`/`entityId`. No UI. |
| 1 — Quarantine + first light | Q1, P1 | Vendored source w/ manifest; hex math promoted; parchment grid rendering fixtures on a dev route. |
| 2 — The two looks | V1, V2 | Domain view and Owner view over fixtures, toggleable. **Director rules on the look here.** |
| 3 — Real state | S1, S2 | Map stone tab on real state + placement; card↔entity join, stray piles, tile overlay. |
| 4 — Life | L1, L2, L3 | Signals; colleague landmarks + locked plots; quarantine deletion + regression pass. |

Merge order: M1 → Q1/P1 → V1/V2 → S1 → S2 → L1/L2 → L3. Every PR independently revertible.

Rough sizing: P1/V1/V2 carry the new-layout work (the tile renderer exists; the geography
doesn't); M1 and S2 are the modeling work; Q1, L1–L3 are small.

---

## 5. Rulings of record (director, 2026-07-12)

1. The map's containers are **Domain → Context → Work-to-be-done-or-doing** — the Alexandrian
   model; work/personal halves for a personal map; Projects, Systems, and a stray task pile
   inside each context.
2. Prototype **both Domain view and Owner view** before committing to one.
3. System health reads from **duty-loop journal cadence** (no new writes).
4. The map is a **fifth stone tab** now; map-as-home is a later question.
5. **Parchment in dark chrome** — the warm map field sits inside the cave brand as an
   artifact on the table.
6. The Work Board (and this whole build) lives in **alexandria-simple only**; nothing in
   alexandria-internal is touched, including PR #784, which stays as-is there.

**Still open:** `libraryContext` linkage strictness — optional field now (recommended),
reconcile with the library's context names once the draft library settles.
