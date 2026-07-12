# Viewer elicitation worklog

Running record of the viewer-elicitation session (`viewer-elicitation-brief.md`),
room by room. Mirrors `library-update-worklog.md`'s convention: these are
**captured director statements and candidate cards, not yet applied to the
bundle** — a source to cite (`source_evidence`), not a source of truth itself.
Not everything captured here graduates into a card; some of this is "doughy" —
real but unbaked — and stays parked until it firms up. Grows as the walk
continues.

## Housekeeping during this session

- PR #627 (two-axis taxonomy dogfood) and PR #629 (Strategy plane, 33 Bet/
  Principle cards) both merged to `main` mid-session; this workspace rebased
  onto both.
- Issue filed: **[#633](https://github.com/GetAlexandria/alexandria-internal/issues/633)**
  — bring WHEN back into the product-card schema (`horizon: now|future` +
  a conditional `## WHEN` section, citing `source_evidence`). Not yet built;
  `fabro:ready` withheld (factory is down). Once shipped, most of the
  "doughy" threads below become real cards instead of worklog prose.

## Chunk 1 — Library

**Now:** `Entity - Alexandria Product Library` — confirmed, pillar. Stale detail
found: its WHERE text says "five library viewer modes," predating the viewer/
builder split (#609-619) — actually 11 modes across two sections now.
**Disposition:** keep.

**Ruled:** "Alexandria Prime" stays the name of the hosted product instance
(README) — the library **informs** Alexandria Prime; it does not rename the
library entity. Related, not identical.

**Future, captured:**
- Federation — the Company Library as eventual federation of division
  libraries (already in the card).
- Library Plays — Capabilities to build/maintain the library already exist by
  name (Source Scan, Atomize, Library Confirmation, FoH Walk, Source
  Conversion, Vision Drafting) plus `Pattern - Updating the Library`, but
  proven for Product plane only — Strategy/Learning-plane building is still
  ahead.
- Plane wiring — cross-plane relationship links (Product<->Strategy<->Learning)
  aren't modeled yet; the Strategy keystone gestures at the loop ("evidence
  returns through Learning, sharpening bets") but nothing enforces or links it.
- Open thread (unresolved, not forced): does Product-plane "why" simply mean
  link out to a Strategy bet, and does Learning need its own equivalent?
- External productization ("others building their own libraries") is
  **distinct** from internal SocioTechnica division-federation — don't
  conflate the two in the roadmap.

**Candidate missing cards (naming/typing TBD, not drafted):**
1. A concept for "library organization standards that ship with the product
   and apply to *any* library" — reconcile against the Knowledge-Organization
   area's already-modeled "The Approach," or keep separate.
2. A card for the Product<->Strategy<->Learning feedback loop itself (plane
   wiring) — currently only prose, no card or link type.
3. A Learning-plane keystone stub, mirroring `Concept - Strategy`.

## Chunk 2 — Playbook

**Now:** `Entity - Playbook` — confirmed, pillar. "The registry, not the page"
(ruling on file). `/playbook` route (`PlaybookView.tsx`) stable, no active
churn since the PMS split (#568). `Pattern - Running Plays` already exists,
sibling to `Pattern - Updating the Library`.
**Disposition:** keep.

**Future, six threads captured (none forced to resolution):**

1. **Play maturation** — golden-path upgrades, testing-streamline waves, the
   frame-ruling cascade. Open whether this is the whole registry-level future
   or one piece of it.
2. **Human-Role / Authority** — Director stops being a singleton. Director's
   model: authorization = scoped grants over the domain/plane/context
   hierarchy (rule-on / build / submit the source of truth) on the Library
   side, and manage-a-colleague / request-a-play on the Playbook side. Today
   the Director implicitly holds every grant. Retroactively grounded in the
   archived data-model doc's Authority section (two-layer ceiling+grant;
   Andon-pull escalation; open question #6, "authority granularity... when to
   add domains/multi-axis" — the director was re-deriving an already-parked
   question, not starting cold). Today's model is a hardcoded singleton all
   the way down: `Role - Director`'s own card says "this actor" (singular);
   `Mechanism - Human Gate` hardcodes `related_to: Role - Director`;
   `Entity - Human Input Request` has no "addressed to" field.
3. **Playmaker Studio's role** — correctly pulled out of Alexandria (#568),
   but still where plays get built and where Raven's playbook footprint
   lives. Not yet resolved how this cross-boundary relationship gets modeled
   (a federation pointer like `Reference - Playmaker's Studio Library`, or
   something else).
4. **Play-unlock / gamification** — plays as rewards: knowledge-bank
   building, run-count, hardening, director experience as unlock currencies.
   AI Colleague leveling as the core emotional payoff / gamification
   element. Explicitly flagged by the director as "doughy" / a "chicken and
   egg" / "potentially huge" — not to be forced into cards prematurely. Real
   prior art exists in the archived doc: a resolved composite-unlock rule
   (a composite play unlocks only when its own cards exist *and* every child
   play is unlocked) and an open question on how play telemetry (runs/scores)
   folds into the unlock formula. **Same vision as the not-yet-walked
   Knowledge Bank chunk (#4) — write as one thread when we get there, not
   two.**
5. **"AI Colleague hours of independent ownership"** — the director's
   near-term definition of product success. Untyped/uncarded. Candidate for
   a Strategy-plane goal, or the first real content on the still-empty
   Learning plane.
6. **Reliable triggering** — time-trigger and ledger-trigger, not just
   click-to-run. Connects to `Mechanism - Trigger` / `Economy - Pending
   Trigger Kind`, not yet verified for depth.

**Director's explicit framing (2026-07-06):** not everything captured in this
elicitation becomes a card. Some of it is real but unbaked ("doughy") and
needs to stay parked, cited from this worklog, until it firms up — mirrors
the Source Conversion pipeline's own raw-material -> SOT -> card staging, just
one level up (conversation -> worklog -> card).

## Chunk 3 — Ledger and Triggers (split into two; they are not one thing)

**Ledger now:** `Entity - Ledger` — stub, pillar, correctly typed (Entity, not
Mechanism — that retype is done). One of the archived data-model doc's "three
enabling systems" (Viewer, Triggers, Ledger) — a peer to Triggers, not a
container of it.
**Disposition:** keep. **Explicitly deferred** — the director is digging into
this area with Jess directly; expected to be the least fruitful topic here,
by design, not a gap in this walk.

**Triggers now (director initially unsure this was even carded — it is):** 8
cards, **all `stub`**: `Wake Subscription`, `Match Rule`, `Cursor`, `Session`,
`Connection Lease`, `Capability - Wake`, `Mechanism - Monitor`,
`Mechanism - Trigger`. Two live pathways today: (1) subscription-driven wake —
`Monitor` continuously watches the Ledger (for as long as the coding-tool
session is open) against registered `Wake Subscription`s and delivers a
`Wake` to a live `Session` on a match; (2) a separate, purely on-read
derivation (`Mechanism - Trigger`) with exactly one real kind today
(`inbox.source.pending`). Neither reaches "a play fires with no one in the
loop" — Monitor gets you to an agent's attention, nothing further is
autonomous yet. **Defect found:** `Mechanism - Trigger`'s card claims two
shipped kinds; the second (`ruling.capture.pending`) was actually removed
during the PMS boundary migration (Studio Operations eviction) — the card is
stale, independent of the bigger roadmap question.
Three existing rulings already hold pieces of this area for a cofounder
review (Wake's type Capability-vs-Entity; Cursor's card-worthiness; Trigger's
own "underspecified, bigger surface not cut") — all converge on the same
not-yet-had conversation.
**Director's future framing:** reading the Ledger as the source of truth to
actually set off plays (not just wake attention) is a big part of the
future — captured, not resolved; awaits the same Jess conversation as Ledger
proper.

## Chunk 4 — Knowledge Bank

**Now:** genuinely live, not a dead prototype — `KNOWLEDGE_BANK_AREAS`
(`packages/ax/src/domain/plays.ts`) is real: 5 areas (vision, vocabulary,
bets, guardrails, user-research), Raven-scoped, prerequisite-gated (the
other four all require `vision` first), 5-state lifecycle (available ->
in_progress -> ready_for_atomization -> banked -> locked). Rendered for real
at `/raven/knowledge-bank` (`RavenKnowledgeBankStatus.tsx`, a fleshed-out
component, not a stub). One real play already gates on `["vision"]` today (of
~8) — thin, but genuinely exercised, not just a schema capability.

**Defect found (already ruled, just not applied):** `Entity - Knowledge Bank
Area`'s card is marked `status: deprecated`, describing this as parked
prototyping machinery. Wrong against current reality — but not a new
discovery, the worklog already has *"Knowledge Bank Area -> KEEP... NOT a
de-card."* Card file never got updated to match. Clean fix for the NOW-cards
pass.

**Major reframe from the director (2026-07-06), supersedes the "just fix the
status" read above:** the *area set itself* is in limbo, not just its status
label.
- Vision (internal id, unchanged) shipped as **Basic Product Description**
  (#475/#476, 4 slots) — already the new "prime play" / seed step. Confirmed,
  not new information.
- The **whole five-area shape** (vision/vocabulary/bets/guardrails/
  user-research) reflects an **abandoned theory of how directors would build
  libraries** (the pre-pivot elicit-for-library engine, `[[build-a-raven-onboarding-pivot]]`) — "proved too indirect." The director is now
  dogfooding an alternate approach: this very session (BoH/FoH walks, the
  taxonomy dogfood #627, the Strategy-plane build #629) *is* that alternate
  approach, and the knowledge-bank-area mechanism hasn't been rebuilt to
  reflect it yet.
- **Proposed new area shape** (not built, direction only): ground the Product
  plane (seed via Basic Product Description) -> fill out the Product plane ->
  add Strategy -> setup/backfill Learning. Each level unlocks more of Raven's
  plays — same prerequisite-gating mechanic, different area definitions.
- **This is a gamification bet, explicitly hedged** — "may prove motivating,
  may prove demotivating." Not a freestanding idea: it's already carded as
  **`Bet - Visualized Colleague Growth`** (Strategy plane, #629,
  `derived_from: Bet - A Visual, Traversible Work Environment`), whose own
  `risks` field already names this exact uncertainty ("Directors may not care
  to watch a colleague 'level up' — config and numbers may suffice"). The
  Bet already exists; the concrete HOW (the redesigned area structure) does
  not yet.
- **Status correction:** given the area set itself is acknowledged as
  pending redesign, `stub` (real, wired, not yet a settled final shape) is
  probably more honest than promoting straight to `confirmed` — walking back
  last chunk's lean toward confirming it outright.

**Disposition:** keep (mechanism + the Bet it serves); the specific 5-area
content is explicitly transitional, not to be treated as final when cards
get written.

## Chunk 5 — Info Hub

**Now:** the `/info` route is real and tested. Found what look like **two
separate, inconsistent nav implementations** claiming an Info Hub tab:
`StoneTopBar` (`components/library/`, 4 equal-weight tabs: Library/Playbook/
Info Hub/Ledger) renders a deliberate placeholder (`InfoHubPlaceholder`:
*"Info Hub route ready. The product surface will fill in here once its state
contract is defined."*) but doesn't appear wired into the actually-mounted
app shell; the real shell (`ViewerShell.tsx`) uses a different
`TopNavigation` component with its own separately-defined `"info-hub"` tab,
and its `<main>` is empty in source with no dispatch logic traced statically.
Not resolved live (would need the dev server running) — flagged as a
possible small cleanup item, independent of the bigger roadmap question, and
orthogonal to the disposition below either way.
**Disposition:** unchanged from the existing ruling — remove from the live
viewer until built; capture the plan only.

**Future, grounded precisely:**
- **The job:** real work to build and maintain Alexandria — plays and atomic
  cards — plus an unmet, concrete gap: if a director "owes" N decisions or
  approvals (spread across Human Gates, Confirmation Gates, Review Gates, FoH
  walk turns, the taxonomy-lock capstone, etc.), there is nowhere they all
  live at once.
- **Original Info Hub concept (superseded):** decisions would mostly be
  library decisions, so one library-decision-centric view would cover the
  bulk of it. Reality: the team lives in Alexandria directly and decides
  as they go — same "the original theory of how directors would interact
  didn't hold" pattern as the Knowledge Bank reframe (Chunk 4).
- **The named ideal, already carded:** `Bet - Map-First Work Surface`
  (Strategy plane, #629) is this exact tension, word for word — *"work and
  the key decisions inside it live on a single visualized map... rather than
  a set of separate lists and boards."* Its own `risks`/HOW section already
  names **"reverting to plain lists and boards"** as its fallback if the
  wager doesn't hold. **Info Hub-as-kanban is that named fallback**, not a
  freestanding idea — not landing soon, hence the interim.
- **Concrete precedent to mirror:** Playmaker Studio's own Work Board
  (`studio/plays/board-state.json`) — a proven, working shape: staged
  pipeline (backlog -> sourced -> designed -> built -> proven -> live) +
  priority order, plus a separate ad-hoc `cards` list (testing/improvement/
  bug work orders, open/in-progress/done/wont-do) independent of the staged
  pipeline. Director cited it directly: "it was awesome."
- **Ruled (2026-07-06):** Info Hub is a backlog, "pure and simple" — same
  pattern as the director's own PMS backlog. Confirms the unifying
  possibility above: it becomes the tracking surface for every "doughy"
  future thread captured this session (Library federation, Strategy/Learning
  build-out, the Triggers redesign, the Knowledge-Bank-Area redesign), not
  just a generic kanban.
- **Superseded by Chunk 6, below:** the backlog isn't a separate thing to
  build — **Builder already is the intermediary solution replacing Info
  Hub.** Open question carried into Chunk 6: does Builder's existing
  Notepad/Threads view (elicitation-specific open-questions) already cover
  this job, or does the backlog vision need something broader added to
  Builder (general work items, not just elicitation threads)?

## Chunk 6 — Builder view

**Now, verified live (not just read from code — dev server + Playwright,
full report above in-chat):** works. All 5 modes load and render real
content, zero console errors across the pass. `alexandria-back` shows a live
Empty Library workbench (73/73 fillable, 4 gaps, 21 hot spots, correct
per-context card counts). `alexandria-drafts` shows a clean, honest empty
state. `notepad` is the standout — a fully-realized Presence + 25-item
filterable Threads tool, several threads independently corroborating this
session's own findings (Trigger's thinness, Wake's type ambiguity, Cursor's
demotion candidacy, Playbook registry-vs-page, Library's federation
question). `empty` (the Confirm entry) renders cleanly. `legacy` shows
"0 cards / 0 gaps / 0 areas" — the old 208-card library isn't loading there;
flagged, not chased (secondary reference lens).

**Bugs found, likely candidates for their own small fix issue (separate from
content/roadmap work, mirroring how #633 got carved out):**
- Empty Library workbench shows Strategy as "0 contexts" despite 34 real
  cards existing there — the director's context below suggests this is a
  re-verification gap (fixed "in theory," never re-exercised) rather than
  necessarily a deep bug.
- Legacy reference "0 cards."
- The stale `Mechanism - Trigger` second-kind claim (Chunk 3).
- The stale `Component - Viewer Route` text (mode count, phantom "Studio
  view" — flagged back in initial grounding, not yet its own chunk item).
- Some Notepad threads show `open` despite their card already carrying a
  resolved `rulings:` entry for that exact question — a thread/ruling sync
  gap, not yet explained.

**Director's correction (2026-07-06) — supersedes some of the above framing:**
the Builder section worked, "kind of," once; a round of fixes landned "in
theory" since, but the director hasn't personally re-driven it since —
consistent with what verification found (real, working, but likely untested
against the post-#627/#629 bundle, which explains the Strategy-0-contexts
gap without necessarily indicting the code).

- **Library vs. Builder, precisely:** the **viewer** section (Index/Catalog/
  Workflow/Engine/Folders/Constellation) *is* "Library" in the director's
  vocabulary — the up-to-date, read/browse experience. **Builder** is the
  build space — where library-building actually happens.
- **Today's dogfooding happened OUTSIDE Builder.** The Strategy-plane build
  (#629) and the taxonomy dogfood (#627) were NOT run through the Builder
  UI/pipeline — they were hand/agent-authored directly. The method+schema for
  building out planes is still "up in the air." Builder's live/verified
  functionality and the *actual current practice* are two different things
  right now.
- **The intended future (especially for other/future directors):** Builder
  *is* where the library gets built, method settled or not for the team's
  own dogfood. **"Projects stack in here"** — a new detail: Builder's bundle
  selector (today showing exactly one option, "Alexandria Product") is meant
  to grow into a real multi-project stack. Candidate connection, not yet
  confirmed with the director: is this the same mechanism that eventually
  realizes Library's federation vision from Chunk 1?
- **Builder is confirmed as Info Hub's actual replacement** — not a
  hypothetical future kanban to build separately.
- **Resolved: Threads and "the backlog" are two different things, not
  competing candidates for the same job.** Threads are process-internal:
  they surface *during* a Front-of-House Walk specifically, as the agent's
  own working notes on things that need addressing — Raven reads off them
  live to steer that walk's conversation. Transient, walk-scoped, agent-
  facing. The **Bundle/build selector** is the actual closer analog to "all
  the things you need to do or are working on" — today thin (exactly one
  entry, "Alexandria Product"), but the intended shape: each stacked project/
  build *is* a backlog entry. So Builder likely absorbs Info Hub's job via
  the growing project stack, not via Notepad/Threads, which stays a
  narrower, different-purpose tool tied to a single walk in progress.

**Disposition:** keep; real and working, ahead of its actual current usage.
Status promotion not yet decided — director hasn't personally re-verified
since the "fixed in theory" round.

## Chunk 7 — Knowledge-Organization / Taxonomy walk view

**Now:** exactly one experimental view, not "several" as the brief guessed —
`taxonomy-walk.html` (82KB, standalone, added in #627). Zero presence in the
actual shipped viewer app (`packages/viewer/src` has no reference to it at
all) — a one-off planning artifact, not a product surface.
**Disposition:** no ongoing viewer-primitive card needed for the artifact
itself; it already did its job.

**Director's context (2026-07-06), reframes this as more than a one-off tool:**
- The June DDD-only reorg attempt (`test-scan-02-reorganized`) was "kind of a
  disaster" — nouns never got straightened out. Confirms the taxonomy-
  state-of-the-state finding precisely (DDD alone gives grain, not a naming
  vocabulary).
- The prior Vocabulary/exemplar-comparison module ("a few weeks ago") was
  "cold start, dry, a lot to ask of a director" — direct confirmation, in the
  director's own words, of why the "warm capstone, not cold-open" ruling
  (2026-07-05) was right.
- Running the walk *warm*, layered on the already-FoH-built library, "made
  our library a lot better" — validates the ruling in practice, not just in
  theory.
- **Named remaining work, which turns out to already be fully scoped:**
  (1) capture and enshrine this work as real library cards, (2) a standing
  *view* where the library renders sorted by this taxonomy, usable anytime
  for QA/sanity-checking — not just during a walk, (3) fold the taxonomy-lock
  into the standard library-build *process* itself, since skipping it is
  exactly what made the library chaotic.
  **This is, word for word, `capstone-brief-cards-view-process.md`'s three
  already-written workstreams** (its own self-description: "the biggest plan
  of all"): **A** — materialize the rulings into real cards; **B** — build
  the families-sorted view (that doc's own framing: "one library, multiple
  sorts — by type/families, by context, by altitude, by status," explicitly
  for this exact QA use case); **C** — enshrine the taxonomy-lock as a
  chained play in the build process (forces the overdue Front-of-House/
  Back-of-House rename too). Sequence per that doc: A is the foundation, B
  and C build on it in parallel. Not a new gap — a ready-to-execute plan,
  not yet run.

**Ruled (2026-07-06):** not a plan to execute from this conversation — a
**separate agent is already building and integrating it.** This session's
job is narrower: capture it as **future** cards now (a clean, real-world
case for the `horizon: future` field from #633 — write it as intent, not yet
built), then flip those cards to present once that build actually lands.
**Carry-forward for the output phase (Task 11):** check the other agent's
branch/PR before drafting this content, to avoid duplicating or conflicting
with what it produces.

## Chunk 8 — the 12+ viewer routes

**Applied directly (not just captured — the director approved executing
this one live), two files:**
- `viewer/Entity/Entity - Viewer Route.md` — status stub -> confirmed,
  confidence medium -> high. WHERE now names all 18 screens: home, agent's
  own page, Playbook view, Ledger view, Info Hub (placeholder), Raven's
  onboarding view, Raven's Knowledge Bank view, and 11 library modes across
  viewer (Index/Catalog/Workflow/Engine/Folders/Constellation) and builder
  (Back/Drafts/Notepad/Confirm-Empty/Legacy) sections. Dropped the phantom
  "Studio view" (dead since the PMS split). Added `derived_from` links to
  `Entity - Basic Product Description` and `Entity - Knowledge Bank Area`
  (both verified to exist under those exact names/paths).
- `Surface - Viewer.md` — same fix: WHAT text and the `cc8b3b7e` ruling
  updated to reflect the settled 18-screen count instead of "awaits a
  conversation with the cofounder."
- Both cards carry a new, dated ruling entry rather than deleting the old
  one — provenance preserved per this session's own convention.

No other route needed its own card: `agent` was already named; the 6
viewer-section modes get a one-line-each mention inside this same card,
consistent with the "routes are derived views, not new nouns" principle
already on the card. Ledger, Playbook, Info Hub, Knowledge Bank, and the 5
builder modes were already covered by their own chunks above.

## Chunk 9 — future-pass: Tray, Canvas, AX CLI, Viewer shell

- **Tray:** the current roster (Raven, Damien, + 4 locked "Future teammate"
  seats — Engineering, Design, Research, Operations, seen live in Builder's
  agent bench) is an explicit **holdover**. Future: Tray represents whatever
  the real, evolving core-colleague lineup becomes over time — not fixed at
  today's specific names. Loose connection to the Domain organizer list
  (Product/New Media/Software Development + wanted Operations/Marketing) —
  overlapping but not a clean 1:1, not asserted as the same thing.
- **Canvas — director asked for a precise now-check ("this is a tricky
  one"), verified fresh rather than recalled:** cards and code **match
  exactly, no discrepancy** — one of the cleanest-modeled areas found all
  session. Code: exactly 2 event types (`canvas.step.saved`,
  `canvas.review.requested`), a real `deriveCanvasProjection` wired into
  project-state (read-side works), but confirmed **zero real writers** —
  nothing in the shipped product emits either event; the only path is a
  human manually running `ax inspect events append --type canvas.*`.
  Fully dormant on the write side, exactly as `Mechanism - Canvas` claims.
  `Capability - Canvas Review` is correctly `status: deprecated` with a
  clear "folded into Mechanism - Canvas" pointer — already properly handled,
  not a defect (corrects an earlier assumption this session that the fold
  was still outstanding). The real "trickiness" is that the word "canvas"
  carries three senses in casual use — the real dormant mechanism, the old
  dropped "main pane" prototype meaning, and the viewer's unrelated CSS
  naming — and the cards already correctly pick the first and explicitly
  disclaim the other two. No card changes needed here; existing future draft
  on `Mechanism - Canvas` stands as-is.
- **AX CLI:** today, Raven-only — "fill in your product with Raven and go
  from there." Explicitly **open, not resolved**: does supporting future
  agents (per the Tray reframe above) mean one CLI surface serving all of
  them, or one CLI per agent? Director flagged this needs real planning,
  not a quick answer — parked as a named future question, not decided here.
- **Viewer shell:** future = the home for anything visual, "especially the
  map" — confirms the Map-First Work Surface bet (Chunk 5) as the headline
  visual direction. Nothing further beyond what that Bet card already
  covers.

## Output 1 — NOW cards (executed 2026-07-06)

Correction to the earlier plan: `horizon`/`## WHEN` (#633) are filed but not
implemented anywhere in the schema — confirmed by grep, zero hits. Writing
that frontmatter today would be staging content against a mechanism that
doesn't exist. **Output 2 (roadmap content) therefore stays living in this
worklog**, not materialized into cards, until #633 actually ships — this
document is already the right citable source (`source_evidence`) for that
future work. Output 1 (NOW cards) proceeds on today's real schema only:

- Fixed `Entity - Alexandria Product Library`'s stale WHERE text (mode
  count -> 11 modes / 2 sections, linking the new Builder card).
- Fixed `Mechanism - Trigger`'s stale "two kinds" claim -> one real kind,
  with the removed second kind explained (PMS boundary migration).
- `Entity - Knowledge Bank Area`: status `deprecated` -> `stub`, retired the
  "parked prototyping" framing, added the `Bet - Visualized Colleague
  Growth` connection.
- Authored a new card: `Surface - Builder` (`viewer/Surface/`) — the actual
  coverage gap the brief cared about. Confirmed, high confidence, grounded
  in this session's live Playwright verification, not just code-reading.
  `Surface - Viewer` updated to contain + narrate it.
- **Verified against the real gate, not just reasoning about it:**
  ran `bun packages/ax/src/tools/library-catalog-story-lint.ts
  --library-root docs/alexandria/sweeps/alexandria-product` directly. Caught
  and fixed two self-introduced diagram-parity violations (a links-frontmatter
  mention needs a matching wikilink specifically inside the `## HOW` section,
  not `## WHAT` or `## WHERE` — R7 from `card-story-template.md`, enforced by
  code, not just convention). Final run: clean on everything touched.
- **Found, not fixed (pre-existing, confirmed via `git diff` to predate this
  session's edits) — candidates for the same small fix-issue bucket as the
  other bugs below:** `library / Alexandria Product Library`: orphan card
  `Pattern - Updating the Library` + a matching missing diagram connector;
  `ledger / Idempotency Key`: missing `Entity - Ledger` diagram connector;
  `viewer / AI Colleague`: missing `AI Colleague` diagram connector (the
  `Concept - AI Colleague` / `Role - AI Colleague` split, likely the same
  pending migration flagged earlier this session).

## Blind review of Output 1 (2026-07-06)

Applied this repo's own quality-sweep precedent (commit `0b2b6c11`,
"librarian/editor-style review": mechanical integrity + faithfulness to the
ruled worklog + content coherence, verified against real gates rather than
read-through) to this session's own diff, via a fresh agent with no context
from this conversation.

**One real, newly-introduced defect found and fixed:** `Surface -
Builder.md`'s WHERE section used a literal path string
(`` `/library/builder/<mode>` ``) inside backticks — the de-machining gate
(`check-machine-language.mjs`) flags any backticked span containing `/` as
code, and every sibling card uses prose instead. Reworded to plain product
English; re-ran the gate clean (113 cards pass) and story-lint (only the
same 4 pre-existing violations, no new ones).

**Everything else verified clean across all three dimensions:** every
wikilink resolves; every new `links:` entry is properly narrated in its
card's `## HOW` (not just WHAT/WHERE); the 18-screen count and the
Trigger-kind-removal claim were independently checked against the actual
source code, not just trusted; the Knowledge-Bank-Area card correctly
reflects the worklog's *final* reframe, not the earlier superseded read;
ruling-ids are reused, not fabricated; scope stayed correctly limited to
Output 1, leaving Chunk 7 and Output 2 untouched as this document itself
says they should be. One judgment call noted, not a defect: Knowledge Bank
Area's `confidence: medium` is a reasonable editorial inference, not a
value this worklog explicitly states.

**Verdict: ready with minor fixes — now applied.**

## Shipped (2026-07-06)

- **PR [#645](https://github.com/GetAlexandria/alexandria-internal/pull/645)**
  — Output 1 (NOW cards), committed and pushed.
- Bug issues filed, one per distinct problem, `fabro:ready` withheld
  (factory down):
  - **[#646](https://github.com/GetAlexandria/alexandria-internal/issues/646)**
    — Strategy plane shows 0 contexts in Builder's Empty Library workbench.
  - **[#647](https://github.com/GetAlexandria/alexandria-internal/issues/647)**
    — Legacy-reference lens shows 0 cards/gaps/areas.
  - **[#648](https://github.com/GetAlexandria/alexandria-internal/issues/648)**
    — two parallel viewer nav implementations (`StoneTopBar`/
    `LibraryBrowserApp`, confirmed live, vs. `ViewerShell`/`TopNavigation`,
    unreachable in source) — confirm which, remove or finish the other.
  - **[#649](https://github.com/GetAlexandria/alexandria-internal/issues/649)**
    — the 4 pre-existing story-lint violations found during the blind
    review, confirmed to predate this branch.
- Checked `main` before opening the PR: one new commit (`#643`/`#644`,
  Constellation containment lines) landed since the last rebase — confirmed
  zero file overlap with this session's changes; rebased onto it anyway
  before pushing.

## Next

This branch's work is done. Remaining, tracked elsewhere: (1) the separate
agent's progress on `capstone-brief-cards-view-process.md` — check before
any future session drafts overlapping content; (2) the four issues above,
whenever the factory's back up.
