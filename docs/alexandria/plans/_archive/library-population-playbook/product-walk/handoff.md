# Product Walk — handoff for the next agent

You're picking up the **Product Walk** module — the second module in the Knowledge Bank flow (after Vision, before everything in the Product plane). This document is the onramp: read it cold and you should be able to pick up the work without back-context.

## Where we are in the bigger picture

Alexandria's Knowledge Bank flow ships modules one at a time, each producing a piece of the customer's atomic-card library. Modules so far:

- **Vision** (banked, shipped) — Strategy plane. PR #182 + #183. Vision Builder canvas + `vision-drafting.md` + `vision-elicitation.md` Raven sub-skills.
- **Vocabulary** (in design, PR #186) — Product plane. Eight-folder taxonomy + 10 worked example vocabularies + standalone Explorer prototype + grading rubric. Canvas form + Raven sub-skill + wiring NOT yet built.
- **Product Walk** (this module — not yet built) — Product plane, between Vision and Vocabulary in the flow.
- **Skeleton, Surface, Experience, Forward Plan** (the other four Product-plane areas) — design pending.
- **Bets, Guardrails** (Strategy plane) — design pending.
- **User Research, Competitive Intel, Decision Trail, Product Evidence** (Learning plane) — design pending.

The architectural insight that produced Product Walk: each downstream Product-plane module (Skeleton, Surface, Experience, Forward Plan, Vocabulary) shouldn't ask the director to discover their product from scratch. They should refine what an upstream **Product Walk** already surfaced. *One discovery pass; five refined projections.* That insight is recent (this session). The Product Walk module didn't exist a week ago.

## What you're producing

Read `product-walk/plan.md` first — it's the canonical module plan, ~210 lines. The short version:

A single guided conversation where the director walks Raven through their product the way they'd walk a new hire through it. Raven asks 6 anchor prompts per stop:
1. What do you call this place?
2. What's here / what do I see?
3. What can I do here?
4. How did I get here / where do I go next?
5. Built or planned?
6. How does it feel?

Plus side trips, behind-the-scenes processes, and a "skipped" list for what didn't get covered.

**Output**: one banked `ProductWalk` artifact at a known path under `docs/alexandria/library/` (or the customer-side equivalent), in a structured YAML+markdown shape. Five downstream modules each read a slice.

## The state of the work right now

What exists in the repo:

- **`product-walk/plan.md`** — full module plan. Read this first.
- **`product-walk/handoff.md`** — this file.

What does NOT yet exist (your work):

- The canvas form (HTML/CSS/JS) for the Product Walk surface
- The Raven sub-skill (`product-walk-drafting.md` or similar) — Raven's behavior during the Walk
- The canvas-server endpoints to bank the Walk artifact
- A registry entry in `modules.js` (the Knowledge Bank kanban) — Product Walk inserted as #2 after Vision
- Dogfood validation against Alexandria itself or a partner product

## Modality — the unresolved decision

A key open call. The plan.md describes a text/voice conversation as the baseline, but five modalities were sketched in conversation as options:

1. **Text/voice conversation** — lowest tech bar; Raven can't *see* anything she's not told about. Baseline.
2. **Narrated photo tour** — director takes a screenshot + records a 10–30s voice memo at each stop. Structured per-stop; clean artifact; no streaming infra. Probably the right MVP.
3. **Async video walkthrough** — director records 5–15 min screen recording, Raven processes async, follow-up session with prepared questions. Richer signal but two sessions.
4. **Live screen share with Raven watching** — full vision API + real-time STT + voice synthesis. This is where the "new hire" feeling lives — Raven asks specific questions about what she's seeing in real time. Heaviest build.
5. **Hybrid: async video upfront + live follow-up** — combines pacing with interactivity.

**Recommendation from the prior session**: ship a modality menu in waves. **Wave 1 = #2 (narrated photo tour)** as the canvas-form MVP. Wave 2 = #3 (async video). Wave 3 = #4 (live screen share). Don't try to ship #4 first.

**Your first move**: ratify or amend this wave plan with the Pilot before any building.

## Conventions to follow

This is a maintainer-side build inside the `library-population-playbook` plan. Key conventions:

- **The Vision module is the working exemplar.** Read `library-population-playbook/vision/` for the four-file design package shape (1-page-template, deep-guidance, examples, draft-vision). Vision shipped the same kind of canvas form + Raven sub-skill + bank flow that Product Walk needs to ship.
- **The Vision Builder canvas surface lives at** `canvas-library-spike/prototype/product-library/vision-builder.html` + `vision-builder.css` + `vision-builder.js`. Mirror this shape for Product Walk Builder.
- **The Raven Vision sub-skills live at** `canvas-library-spike/prototype/skills/raven/vision-drafting.md` and `vision-elicitation.md`. Mirror this shape for `product-walk-drafting.md` (and possibly `product-walk-elicitation.md`).
- **The canvas-server is at** `canvas-library-spike/prototype/scripts/canvas-server.ts`. New endpoints land here. Look at the existing `/api/canvas/vision/...` endpoints for the pattern.
- **The Knowledge Bank registry is** `canvas-library-spike/prototype/product-library/assets/js/modules.js`. Insert Product Walk into `SUBJECT_ORDER` — second position, after Vision.
- **Wake events** for Raven are written to `step-events.jsonl`. The Vision module emits `vision-sources-handed` and `vision-section-help` events; Product Walk would emit analogous wake events.
- **Methodology log entries** go in `docs/alexandria/.canvas-state/methodology-log.jsonl` at each slice boundary.

The `library-population-playbook/agent-team-playbook.md` describes the methodology — the five stages (Research → Elicit → Artifact → Wire → Dogfood), the team (Surveyor / Architect / Scribe / Mechanic / Pilot), and the do-not list from the Vision slice.

## Reference material in the playbook

A lot of related work landed recently. Worth knowing it exists:

- **`vocabulary/plan.md`** — the module Product Walk feeds. Vocabulary's primary deliverable is the customer's folder/subfolder taxonomy. Vocabulary's elicitation assumes a Product Walk already surfaced the noun seeds; without one, Vocabulary falls back to source-mining.
- **`vocabulary/families.md`** — catalog of suggested folder structures per software type. Useful background for understanding what Vocabulary downstream is doing with the Walk's output.
- **`vocabulary/grading-rubric.md`** — quality rubric for Vocabularies. Useful as a reference template if you want to write a parallel `product-walk/grading-rubric.md` later.
- **`vocabulary/explorer/`** — standalone HTML/JS workbench with 10 worked vocabularies. Worth opening (`bun build-vocabularies-json.ts && python3 -m http.server 8765`) to see what "good output" looks like for the module Product Walk feeds into.
- **`vocabulary/vocabularies/`** — the 10 worked vocabulary examples (alexandria, airbnb, claude-code, cursor, duolingo, figma, hollow-knight, linear, notion, shopify). The structural shape of these is what Vocabulary outputs *after* Product Walk surfaced the seeds.

You don't need to deeply understand Vocabulary to build Product Walk. But knowing what's downstream helps you decide what the Walk artifact's output schema should actually contain.

## What I'd recommend as the build plan

(Pilot — Danvers — should ratify before code lands.)

**Phase 1 — Research / design** (~half a session)

- Read `product-walk/plan.md` end-to-end.
- Read Vision's `vision-drafting.md` + `vision-elicitation.md` to absorb the Raven sub-skill voice and structure.
- Read the existing Vision Builder HTML/CSS/JS to understand the canvas-form shape.
- Read `canvas-server.ts` around the existing `/api/canvas/vision/...` endpoints.
- Sketch:
  - The canvas form's per-stop interaction (the six prompts as editable fields; current stop expanded; previous stops collapsed)
  - The Raven sub-skill's behavioral shape (new-hire posture; what she does on wake; what she asks; what she captures into the Walk artifact)
  - The output schema (already sketched in plan.md; verify it actually serves the five downstream modules)

**Phase 2 — Modality decision**

- Settle the Wave 1 modality with the Pilot.
- If Wave 1 is the narrated photo tour: scope the upload + audio capture surface. If Wave 1 is text/voice: scope the simpler chat-style surface.

**Phase 3 — Build the canvas form**

- `product-walk-builder.html` + `product-walk-builder.css` + `product-walk-builder.js` (mirror Vision Builder's structure; use `--product-walk-` CSS variable prefix).
- `product-walk-embed.js` to mount the form in `#tfs-body`.
- Wire to localStorage for persistence.
- Standalone URL works before any canvas-server integration.

**Phase 4 — Wire the canvas-server**

- New endpoints: `GET /api/canvas/product-walk` (state), `POST /api/canvas/product-walk/stop/:id` (mutations per stop), `POST /api/canvas/product-walk/sources` (handed sources for photo/video modality), `POST /api/canvas/product-walk/bank` (atomize).
- New SSE pool for live updates.
- Bank atomization writes a single `ProductWalk` artifact at a known path (decide the exact location with the Pilot).
- Update `modules.js` SUBJECT_ORDER to insert `product-walk` as #2.
- Self-heal mkdirSync on every state-dir write (the `/canvasdemo` startup wipes state dirs; learned the hard way during Vision).

**Phase 5 — Raven sub-skill**

- `product-walk-drafting.md` — Raven's behavior on wake. Anchor in the new-hire posture.
- Failure modes: thin sources; director skips ahead; director goes too deep on one stop; behind-the-scenes processes the director treats as visible.
- Wake events: `product-walk-sources-handed`, `product-walk-stop-help`.
- Extend `canvas-watcher.sh` with the new event types.

**Phase 6 — Dogfood**

- Run `/canvasdemo` end-to-end against Alexandria itself first (recursion case; tests whether the Walk surfaces the right seeds for Alexandria's existing library shape).
- Then a partner product (Hearthfire is the standing reference). Watch for the surfaces that break first.
- Log methodology entries.

## The Pilot

Danvers Fleury. He's the director and the Pilot per the agent-team-playbook. He prefers:

- Tight responses (~1/4 typical length). Lead with the answer; 2–3 moves max.
- No ceremony. He'd rather see a tight build plan than a long preamble.
- Real dogfood over demo theater. If a flow doesn't work in 90 seconds of real use, the flow is wrong.
- Explicit ratification at decision points. Don't write code until he's nodded on the load-bearing calls.

## First moves for you

1. Read this file (you're doing that now).
2. Read `product-walk/plan.md`.
3. Skim `library-population-playbook/agent-team-playbook.md` (the methodology).
4. Skim Vision's design package (`library-population-playbook/vision/`) and the Vision Builder canvas (`canvas-library-spike/prototype/product-library/vision-builder.*`) — your structural exemplars.
5. Come back with a build plan that ratifies the modality wave, confirms the output schema against the five downstream modules' needs, and proposes a sequencing of Phases 3–6. Wait for the Pilot's nod before writing code.

Good luck. The slice has good prior art and a Pilot who'll redirect early if the shape is wrong.
