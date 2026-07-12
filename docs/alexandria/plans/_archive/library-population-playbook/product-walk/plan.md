# Product Walk — module plan (v2)

> **⚠ Superseded surface model (preserved for build-phase notes only).**
>
> This plan describes an early three-surface scoreboard architecture (per-stop YAML schema, six anchors per stop, weighted coverage criteria, `template.md`). After live elicitation against Alexandria on 2026-05-29, the surface model was radically simplified to **four phases** — *Tour · Day-in-the-life · Loose ends · Review-and-Approve* — and the canonical design now lives in:
>
> - `1-page-template.md` — the four-phase scaffold
> - `deep-guidance.md` — per-phase posture (incl. Raven's review-mode behavior)
> - `examples.md` — good/bad worked examples + a worked redline example
> - `draft-walk.md` — Alexandria's dogfooded synthesis
>
> The sections below on **build phases**, **team orchestration**, and **open calls** remain useful as background for the build work. The sections on **per-stop schema**, **coverage rules**, **scoreboard**, and **three-surface choreography** are obsolete — do not implement against them.

---

The Product Walk is the second module in the Knowledge Bank flow, after Vision and before everything else in the Product plane. A director walks Raven through their product the way they'd walk a new hire through it. Raven asks; the director answers; Raven takes notes against a per-stop schema and a pair of parking-lot bins.

**One Walk → every Product-plane bar in the KB opens prefilled.** Every downstream module becomes a *sharpening* exercise, not a fill-from-scratch. That is the whole product story for this module.

This plan supersedes the v1 scoping plan still on PR #186. Differences are summarized at the bottom.

---

## The three surfaces

Product Walk is choreographed across three windows. No surface tries to do another's job.

- **Canvas (left)** — the **scoreboard**. Stop list, coverage pips per stop, parking-lot tallies, a rolling "Raven's working understanding" synopsis, the bank button. Director glances; doesn't fill fields.
- **Terminal (right)** — **Raven**, in the existing Claude Code channel. The actual conversation: she asks the six anchors, she manages up when something doesn't add up, she parks past/future without chasing. No new chat UI to build.
- **Product (third window)** — wherever the product lives. Browser tab the director navigates (live-view mode) and/or screenshots/clips the director drops into the conversation (drop mode). Steam, native, mobile, auth-walled — all reachable via drop mode.

Bridges between surfaces use the existing wake/step-event pattern from Vision. Raven's terminal speech writes step-events that update the canvas scoreboard live. Director's pastes/URLs/screenshots flow into Raven's context via terminal paste or a canvas drop-zone that pings her wake.

---

## Raven during the Walk — the persona

New hire. Smart. Curious. Engaged. Specifically:

- Opens with *"Walk me through your product. Pretend I'm starting tomorrow. Where do I land first?"*
- Runs the **six anchors** at each stop as conversational beats, not a form: (1) what do you call this place, (2) what's here, (3) what can I do, (4) how did I get here / where do I go next, (5) built or planned, (6) how does it feel.
- **Manages up.** *"You said modules are subjects but earlier they sounded like cards — which is load-bearing?"* On-brand, not rude. This is what makes her feel like a sharp new hire instead of a survey.
- **Recaps** to confirm. *"Let me make sure I've got this — the kanban bar unrolls the canvas form. Right?"* Catches misunderstandings before they bank.
- **Parks past/future** without chasing. When the director leaks into history or roadmap, she captures into the parking lot and steers back to the Walk.
- **Coverage-aware probing.** Watches her own thin spots and asks the natural follow-up — not "you have 2 of 6 anchors for the dashboard," but *"What does the dashboard actually let you do once you're there?"*
- **Names her two capture modes.** *"I can either open the URL myself if it's reachable, or you can drop a screenshot — your call per stop."*

---

## What the director produces — output schema

One banked **Walk artifact** at a known path under the customer library, containing:

```yaml
---
type: ProductWalk
banked_at: <ISO date>
director: <Role - Director>
product: <product name>
status: built
---

# Product Walk — <product name>

## Synopsis (Raven's rolling understanding)

<2-4 paragraphs Raven maintained throughout the Walk; final state at bank time>

## Stops (main path)

### 1. <Stop name>
- entities_seen: [<list>]
- capabilities_here: [<list>]
- came_from: <prior stop or "entry">
- goes_to: [<next stops>]
- built: true | false | partial
- forward_plan_note: <if not built or partial>
- experience_note: <felt-shape>
- captures: [<screenshots / URLs Raven saw>]
- coverage: { name: y, entities: y, capabilities: y, connection: y, built_status: y, experience: n }

### 2. ...

## Side trips

### <Stop name> (off <main-path-stop>)
...

## Behind the scenes

### <Process name>
- capabilities_used: [<list>]
- entities_touched: [<list>]
- cadence: <on-demand | nightly | on-event | ...>
- built: true | false | partial

## Parking lot — past

- <note>: <one-line context> — routes_to: decision-trail | product-evidence

## Parking lot — future

- <note>: <one-line context> — routes_to: forward-plan

## Skipped

- <Stop name>: <one-line reason>
```

Coverage flags are honest, not gated. The director can bank with thin coverage. The scoreboard surfaces thin spots so Raven can probe them naturally before bank — never as a wall.

---

## The atomization fan-out (the real bank step)

Banking the Walk does **not** write only the artifact above. It also seeds every Product-plane bar in the KB with prefill so each opens populated.

The exact list of Product-plane bars and their prefill shapes is the **biggest open question** going into Phase 1 — a Surveyor will return the inventory, then we lock the fan-out schema before code. The current expectation:

| Product-plane bar | Prefill from Walk |
| --- | --- |
| Vocabulary | stop names + entities + capabilities → draft noun cards in provisional folders |
| Skeleton | came_from / goes_to per stop → draft connection graph (hubs, leaves, side trips) |
| Surface | per-stop name + experience_note + built status → draft surface cards |
| Experience | per-stop experience_note + behind-the-scenes cadence → draft felt-shape entries |
| Forward Plan | built:false/partial items + future parking lot → Now / Next / Later draft |
| *(+ any other Product-plane bar Surveyor surfaces)* | *(prefill shape TBD)* |

Past parking lot routes to Learning-plane bars (Decision Trail, Product Evidence) — not Product-plane prefill targets, but still bankable seeds.

Each prefill writer is a small atomization routine the canvas-server runs at bank time. They are the most consequential single piece of wiring in this module.

---

## Dual capture modes

The director can mix these per stop within a single Walk:

- **Live-view mode.** Director shares a URL in the terminal; Raven fetches it with her browser tool, takes a screenshot, attaches to the current stop's captures. Works for web; requires the URL to be reachable from Raven's runtime.
- **Drop mode.** Director drops a screenshot or short clip into the terminal (or canvas drop-zone). Raven attaches it to the current stop's captures and asks about what she sees. Works for Steam, native, mobile, auth-walled, anything off-web.

No modality menu in the UI. Raven picks the right mode per stop based on what the director gives her.

---

## What this module does NOT do

- Does not produce final names. Names are provisional; Vocabulary refines.
- Does not gate the bank on coverage. Scoreboard guides; never blocks.
- Does not chase past or future. Parks; routes at bank time.
- Does not lint for MDA inversion, polysemy, or rigor. Discovery first; discipline downstream.
- Does not write outside the Walk artifact path + the Product-plane bar prefill targets.
- Does not require completeness. A partial Walk is a banked Walk; gaps go in the skipped list.

---

## The canvas surface — what we build

`product-walk-builder.html / .css / .js` with `--pw-` CSS variable prefix. Components:

- **Header strip** — title, product name slot, bank button (always enabled; disabled only if zero stops captured).
- **Stop list (left column).** Chronological. Each stop a one-line card with name + coverage pips (six dots: name / entities / capabilities / connection / built / experience). Current stop highlighted.
- **Stop detail (center).** Captures (screenshots, URLs), captured anchor answers in a read-mostly view, "thin spots" callout if any.
- **Side trips + behind-the-scenes panels.** Collapsible. Same coverage pip pattern.
- **Parking lot bins (right column).** Two stacked lists: past, future. Tallies + most-recent items.
- **Synopsis panel (top right or under header).** Raven's rolling understanding. 2–4 paragraphs, updated as the Walk progresses. Click to expand history.
- **Bank flow.** Single button. Confirms with a summary: *"N stops, M side trips, K behind-the-scenes, J planned, P past parked, F future parked. Atomize across [list of bars]?"* Director confirms; server fans out.

The director does almost no typing in the canvas. The canvas reflects what's happening in the terminal.

---

## Build phases + team orchestration

**Pilot** is Danvers. **Architect** is me (Opus seat). **Sonnet team** dispatched per phase.

### Phase 1 — Survey + design package

**Architect tasks:** Hold the schema; integrate Surveyor briefs; write the three-file design package; bring final schema to Pilot for one nod before Phase 2.

**Sonnet dispatches (parallel):**

1. **Surveyor A — Product-library structure audit.** Read `docs/alexandria/plans/canvas-library-spike/prototype/product-library/` (index, modules.js, vision-builder.* as exemplar, canvas-server.ts endpoints). Return: insertion point for Product Walk in `SUBJECT_ORDER`; embed pattern; existing `/api/canvas/vision/*` shape; SSE pool pattern; wake-event mechanism; state-dir self-heal pattern. ~400 words.
2. **Surveyor B — Product-plane bar inventory.** Same prototype dir. Return: complete list of Product-plane bars defined in modules.js (or wherever the KB taxonomy lives); each bar's current input shape (what fields/cards/state file it writes); whether any are stubs vs. built. This is the input to the atomization fan-out map. ~300 words.
3. **Surveyor C — Vision wake/event mechanism.** Read `canvas-watcher.sh`, the Vision step-events, `vision-drafting.md`, the canvas-server side of `vision-sources-handed`. Return: exact event-emission pattern, classifier rules, how Raven's terminal speech becomes a canvas-state write. ~300 words.

**Architect deliverables (Phase 1 end):**

- `product-walk/template.md` — the canonical per-stop schema + parking lot + synopsis + coverage rules + atomization map.
- `product-walk/examples.md` — 2–3 worked Walks (Alexandria's product-library prototype, one web app, one off-web — e.g., Hollow Knight via drop mode).
- `product-walk/draft-walk.md` — Alexandria's own Walk, dogfooded by me against the prototype.

Pilot nods on the schema + atomization map. Then Phase 2.

### Phase 2 — Standalone canvas form

**Architect tasks:** Build `product-walk-builder.html` + `.css` + `.js` as a standalone URL. Wire to localStorage. Mirror Vision Builder's chrome (reset, progress, saved-flash). Three modular files from the start (no monolith → Mechanic).

**Sonnet dispatches:**

- **Mechanic — late-phase file hygiene pass.** Only if anything sprawls. Validate with `node --check`. Watch for curly-quote corruption.

Pilot opens the standalone URL, drops a fake walk, sees scoreboard fill. Nod.

### Phase 3 — Canvas-server wiring + module registry (in parallel with Phase 4)

**Architect tasks:**

- Endpoints: `GET /api/canvas/product-walk`, `POST .../stop/:id`, `POST .../synopsis`, `POST .../parking-lot`, `POST .../capture/:stopId`, `POST .../bank`.
- Dedicated SSE pool.
- `product-walk-embed.js` mounts the form in `#tfs-body`; unmounts cleanly.
- `modules.js` `SUBJECT_ORDER` inserts `product-walk` at slot 2.
- `mkdirSync` on every state-dir write.
- **The atomization fan-out** — per-bar prefill writers. One routine per Product-plane bar identified in Phase 1. The routine reads the Walk artifact and writes the appropriate prefill into that bar's state file.

**Sonnet dispatches:**

- **Mechanic — per-bar prefill writer scaffolding.** Once the atomization map is locked, the writers are mechanical. Mechanic generates them; Architect reviews the trickier ones (Vocabulary, Skeleton).

### Phase 4 — Raven sub-skill (in parallel with Phase 3)

**Sonnet dispatches:**

- **Scribe — `product-walk-drafting.md`.** Brief: new-hire-managing-up voice (read Vision's drafting + elicitation sub-skills as register); six anchors per stop as conversational beats not form fields; parking-lot reflex (recognize past/future, capture, steer back); coverage-aware probing (use scoreboard state to pick next question); dual capture modes (live-view fetch vs. drop attach); endpoint shapes to POST to; failure modes (director skips ahead, monologues, won't name things, gets lost in past, gives terse one-word answers, drops 50 screenshots at once). ~300–400 lines.
- **Scribe — extend `canvas-watcher.sh`.** Add wake-event classifiers: `product-walk-stop-captured`, `product-walk-synopsis-updated`, `product-walk-parking-added`, `product-walk-thin-spot-flagged`, `product-walk-sources-handed`, `product-walk-stop-help`.
- **Scribe — Beat in `canvasdemo/SKILL.md`.** Insert Product Walk as the second module beat.

### Phase 5 — Dogfood

**Pilot tasks:** Run `/canvasdemo` end-to-end with Alexandria's own product-library prototype as the target product. Walk Raven through it. Drop-mode primarily; live-view if `127.0.0.1` is reachable from Raven's runtime. Bank. Verify every Product-plane bar opens prefilled with the right slice.

**Architect tasks:** Watch the run; surface the bugs; fix the surfaces (not rationalize the friction). Log methodology entries.

**Sonnet dispatches:** Mechanic as needed for the inevitable small-fix passes.

### Phase 6 — Second dogfood, then ship

Partner product (Hearthfire or another in-flight). Confirm the modality survives a product that isn't ours. Land the methodology log entry. Open the next slice (whichever Product-plane bar comes up for the *sharpening* build first).

---

## Open calls to land in Phase 1 (before code)

These are the ratifications needed alongside the design package:

1. **Final Product-plane bar list** (from Surveyor B) → atomization fan-out targets.
2. **Per-bar prefill shapes** — Vocabulary's, Skeleton's, etc. Each needs a tiny schema sketch before its writer can be built.
3. **Parking-lot routing rules** — auto-route past → Decision Trail vs. Product Evidence at bank time, or hold for review? Same question for future → Forward Plan (probably yes-route, since Forward Plan is the obvious home).
4. **Re-Walk behavior** — second Walk on the same product: merge into existing artifact, append as a new walk, or overwrite? Probably merge with `walked_at` timestamps per stop.
5. **Walk artifact path** — `docs/alexandria/library/product/walks/<product-slug>.md`? Confirm location.
6. **Director's bank gate** — always allowed (my read), or minimum: at least 1 stop with name + 1 anchor?

---

## What's different from v1 (PR #186's plan.md)

- v1 baseline was a five-modality menu (text/voice → photo tour → video → live screen share → hybrid) with photo-tour as Wave 1 MVP. v2 collapses this to dual capture (live-view + drop), shipped together.
- v1 framed the canvas as a per-stop form the director fills. v2 makes the canvas a scoreboard the director glances at while talking to Raven in the terminal.
- v1's output was the Walk artifact, with downstream modules reading slices. v2 keeps that **and** adds the atomization fan-out: every Product-plane bar opens prefilled.
- v1 had past/future leaking implicitly. v2 makes parking-lot bins first-class on the canvas + in the artifact + in the bank flow.
- v1's Raven persona was conversational. v2 names her sharper: **new hire who manages up.**
- v1's design package was four files (template, deep-guidance, examples, draft). v2 trims to three (template, examples, draft) — Product Walk's prompts are simple enough that deep-guidance is overkill.
