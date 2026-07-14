# Work System Upgrade — Plan

Derived from
`docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md`
(read that first — it holds the rulings and the model). This plan
supersedes the narrow scope of board card `wo-system-generation-v1`
("one cadence, one card") with the full systems model: plural patterns,
real controls, multi-level ownership, and the upgrade loop.

Prior art: `docs/alexandria/plans/map-tab/plan.md` (the port this builds
on). Everything here honors the standing contract: the Work Board is the
system of record, the map visualizes it, all durable state is files.

## 1. Data model

### System entities (`map-state.json`)

- `purpose?: string` — one sentence: what does this system maintain?
  (anatomy: PURPOSE).
- `pattern?: PatternRule[]` — the generation rules (anatomy: PATTERN).
  v1 rule shape:

  ```json
  {
    "id": "check-email",
    "title": "Check and respond to customer emails",
    "every": "6h",
    "assignee": "colleague:raven",
    "detail": "optional card body text"
  }
  ```

  - `every`: a duration (`"6h"`, `"1d"`, `"1w"`). Time rules only in v1;
    meter- and condition-based rules are declared future work (a `kind`
    discriminator is reserved; absent means `time`).
  - `assignee` (optional): rule-level delegation — who works the spawned
    cards. Falls back to the system's own `assignee`.
- `cadence` (existing, e.g. the duty loops' `"30m"`) is **kept and
  reinterpreted**: it is the wake/health *rhythm* (journal-based health
  for colleague-run systems), not a generation rule. `pattern` alone
  drives card generation. *(Open ruling #3.)*
- `assignee` (existing) reads as the system's **owner** — accountable for
  health. Field name unchanged; UI labels say "Owner" at entity level.
  *(Open ruling #4.)*

### Project entities (`map-state.json`)

- `upgrades?: string` — a system id. An upgrade project is an ordinary
  project (bounded, ends, its own owner) linked to the system it
  improves. Renders in the system room's upgrade queue. This is the
  presentation's Upgrade action: improving a system is project work.

### Generated cards (`board-state.json`)

- `generatedBy?: { "systemId": "...", "ruleId": "...", "window": "..." }`
  — provenance + the idempotency key (one card per rule per window,
  ever). `window` is the ISO start of the cadence window.
- Generated cards also carry `source: "system:<systemId>"`, join the
  system via `entityId`, and get `assignee` = rule assignee ?? system
  owner.

### Ownership levels (recap)

| Level | Field | Example |
|---|---|---|
| System owner | system `assignee` | `human:danvers` |
| Upgrade-project owner | project `assignee` | `human:jess` |
| Spawned-task assignee | rule `assignee` → card `assignee` | `colleague:raven` |

## 2. Generation mechanism *(open ruling #1 — recommendation baked in)*

**Materialize-on-read** in the ax runtime: when the board (or map) state
is read, for each `planted` system rule whose current window has no card,
the runtime appends the due card to `board-state.json` before serving.

- Idempotent by `(systemId, ruleId, window)` — re-reads never duplicate.
- **No backfill**: only the current window's card is materialized. Missed
  windows become history (below), not a pile of stale cards to stomp.
- `hibernating` systems generate nothing; `uprooted` never again.
- Rationale: nothing in this setup runs continuously (no duty-loop cron,
  server only up when used). Materialize-on-read needs no always-on
  process, leaves a durable file trace, and cards appear exactly when
  someone looks — which is when they matter. Rejected: duty-loop spawning
  (cron not wired), server tick (assumes always-on).

### Misses and history (open ruling: defaulted)

A window with no **done** generated card is a miss. Misses are *derived*
at read time from `pattern` + the card history — no synthetic miss-cards
are written. Misses mark the system overdue (existing candle flicker +
coin escalation) and count against on-time %.

## 3. System room v2 — CONTROLS

The system room diverges from the project room, per the contract:

- **Health**: on-time % over the trailing 8 windows per rule → the
  existing health-dot vocabulary.
- **Streak** and **next due** (computed from `pattern` + now).
- **PATTERN** section: the rules, each with its delegation.
- **THIS WEEK**: open generated cards.
- **HISTORY**: ✓/✗ row per recent window, with miss count.
- **UPGRADE QUEUE**: projects with `upgrades: <thisSystem>` plus
  improvement-type cards joined to the system.
- Lifecycle actions surfaced in the room (hibernate / uproot — the
  entity-form edit already exists; the room links it).

## 4. Map signals

- System tiles with a `pattern` read health from generated-card controls
  (§3). Pattern-less colleague systems keep the journal-cadence
  heuristic. Overdue systems keep the existing flicker + coin glow.

## 5. Pilot *(open ruling #2)*

Seed one **real** system with a real pattern as the first generator.
Recommendation: an operating loop from the director's actual week (the
"check and respond to customer emails" example), over synthetic
duty-loop tasks — a real system tests the model honestly.

## 6. Issues (to mint on the Work Board)

`wo-system-generation-v1` is rescoped to point here; these become its
children (all joined to `prj-work-system-v1`):

- **WS1 — data model**: `purpose` / `pattern` / `upgrades` /
  `generatedBy` through the ax validator, viewer schemas, entity forms.
- **WS2 — materialize-on-read generation** in the runtime, idempotency,
  no-backfill, lifecycle gating, tests.
- **WS3 — system room v2**: controls, history, upgrade queue.
- **WS4 — map health wiring**: pattern-driven dots, overdue escalation.
- **WS5 — pilot system**: seed it, director places it, first real cards.
- **WS6 — library mission** (after capability ships): atomize the source
  document (§7 of the source).

Build order: WS1 → WS2 → WS3 → WS4/WS5. WS1 starts on the recommended
defaults; WS2 holds until ruling #1 is confirmed.

## 7. Open rulings for the director

1. **Generation mechanism** — materialize-on-read as above? *(rec: yes)*
2. **Pilot system** — name one real system + its pattern, or fall back to
   a daily duty-loop digest per colleague. *(rec: a real one)*
3. **Keep `cadence`** as the wake/health rhythm alongside `pattern`?
   *(rec: yes — they measure different things)*
4. **Vocabulary** — keep the `assignee` field, label it "Owner" at
   entity level in the UI? *(rec: yes — no data migration for a word)*

## 8. Out of scope

Meter/condition pattern rules (shape reserved, not built), multiple
assignees per item, calendar-event/alert outputs, the playbook plane,
subsume (map absorbing the board), and the library mission's card
authoring itself (WS6 schedules it; the play governs it).
