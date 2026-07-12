# Studio Improvement Fix-List

Running list of **concrete to-do items for Studio itself** surfaced during the playtest. This is the side artifact: not playtest meta-observations (those live in `playtest-notes.md`), not honeydo rulings — actual fixes the architect wants to make after the playtest concludes.

## Operating principle (ruled 2026-06-21)

**`studio/plays/frame-the-problem/` is the canonical source of truth** when it conflicts with the governance docs or templates. It is the one play that has gotten substantial work and been put to use in real life. When `TEMPLATE-brief.md` says one thing and `frame-the-problem/brief.md` says another, **frame-the-problem wins**. The template needs to catch up to the exemplar, not the other way around.

This means: **template-vs-exemplar drift is a recurring Studio pattern**, and several fixes below are instances of it.

---

## Fix items

### F1 — Rename TEMPLATE-brief.md §6 + scrub voice language
**Source:** Block 2 ruling, this session
**The drift:** Template §6 is titled *"Draft prompt language"* and describes the job as *"intent, tone, and the calls only you can make."* The word **tone** is the trap. Frame-the-problem renamed its §6 to *"Derived language"* and explicitly states *"The prompts are backstage workers producing material — they are NOT written in Raven's voice; her voice is external."*
**Fix:**
- Rename TEMPLATE-brief.md §6 to **"Derived language"** (match frame-the-problem)
- Drop "tone" from the description
- Reframe job as: *seed the prompt language for the node prompts the Author will project — back-of-house workers, not front-of-house voice*
**Touches:** `studio/plays/TEMPLATE-brief.md` §6 only.

### F2 — Retire the legacy status ladder in registry.js
**Source:** IN1 ruling, Block 1
**The drift:** `registry.js` carries a `status:` field on the older ladder `slot → designed → hardened → derived → proven → registered`. The README says it's "deliberately distinct" from the Board's stage ladder, but per the architect's gut and confirmed in README ("`registry.js` still holds play identity and the criticality Tier — `prio` — **but no longer the production stage**"), the production-stage info now lives in `board-state.json`. The `status:` field is **archeological**.
**Fix:**
- Audit which fields in `registry.js` are still load-bearing (likely: identity, prio/tier, doc, glyph, name, slug)
- Remove `status:` from registry.js rows OR explicitly mark it as legacy/historical
- Update README's "deliberately distinct" framing — they're not, the old ladder is being retired
**Note:** Hardening **step** is alive and well; only the status **name** is legacy. Don't accidentally retire the step.
**Touches:** `studio/plays/registry.js`, README.md vocabulary section.

### F3 — Kill the `__AX2_` placeholder graveyard
**Source:** IN7 / H11 from the original scan; surfaced as recurring pattern
**The drift:** `__AX_` is the current placeholder spelling; `__AX2_` is dead (from the ax-next → ax rename). The runtime substitutor "never matches" the dead one. A play authored with the wrong spelling silently ships unrendered placeholders. Multiple governance docs (RUNTIME, PROJECTION §3, BIG-EDIT, AUTHORING) repeat the rule — the repetition is evidence the trap recently bit.
**Fix:**
- grep the entire studio tree for `__AX2_` and replace with `__AX_` (or remove if the line is otherwise dead)
- Add a lint rule (e.g., in `studio/tools/`) that fails on `__AX2_` in any prompt file
- One canonical doc on placeholder spelling; remove the repetition from RUNTIME / PROJECTION §3 / BIG-EDIT / AUTHORING (cite the one canonical place from all four)
**Touches:** any file containing `__AX2_`; lint tooling.

### F4 — Studio Board: make it actually interactive (or honestly mark current state)
**Source:** META observation, Block 1
**The drift:** Architect noted *"you can't even manipulate the cards or move them around yourself, so it's like, a gesture so we don't forget that we need it."* The Board renders state but the director can't actually drive it from the UI; advances are done by editing `board-state.json` or via agents.
**Fix (one of):**
- (a) **Build the interactivity:** drag cards, click Gate 1 / Gate 2 confirms, the Board becomes a real director surface.
- (b) **Be honest about current state:** mark it as a read-mostly visualization for now; document how stage advances actually happen today.
- Director's call which.
**Touches:** `studio/plays/board.html`, `board-state.json` interaction model.

### F5 — Template-vs-exemplar drift, as a category
**Source:** Recurring pattern surfaced repeatedly this session
**The drift:** `frame-the-problem` is the proven exemplar. Several governance artifacts have not caught up to it — F1, F2, and (likely) more. Without an explicit sync practice, the template will keep drifting from the exemplar as the exemplar evolves.
**Fix (operational):**
- After this fix-list lands, do a **sweep**: read `frame-the-problem/brief.md` section-by-section and audit `TEMPLATE-brief.md` for drift; same for `README.md`, `AUTHORING.md`, `RUNTIME.md`, `PROJECTION.md`, `TESTING.md` against frame-the-problem's worked artifacts.
- Consider adding a **template-conformance check** (would frame-the-problem still pass the current TEMPLATE? if not, template lags).
- Make explicit: **the canonical play is the source of truth**; the template documents the abstraction, but cannot contradict the proven exemplar.
**Touches:** all governance docs; possibly a new tool in `studio/tools/`.

---

### F6 — README's "Director authors" framing is doc-vs-practice drift
**Source:** Block 3 ruling, this session
**The drift:** README's loop table says *"Step 1 | Brief | Director | authors `plays/<slug>/brief.md`"* — implying the human writes the brief. **Reality:** the human picks the play + clarifies purpose; the agent drafts the brief from that clarification; the human reviews and approves at Gate 1. Same pattern across the loop: agents do the work, humans pick intent + approve at gates.
**Fix:**
- Update README's loop table: replace "Director | authors" with something like "Director (intent) + Brief-drafter agent" or "agent (drafts from director's purpose clarification)"
- Same audit for the other steps that list "Director" as the doer — confirm each is truly director-authored or actually director-approved
- Specifically: Step 1 (Brief), Step 2 (Harden — already shows Hardener + Director; OK), Step 3 (Confirm — director, correct), Step 4 (Derive — Author agent, correct), etc. Step 1 is the main drift.
- Add language to the loop intro making the division of labor explicit: *"Across the loop, agents do the work; the Director picks the play, clarifies intent, and approves at gates."*
**Touches:** `studio/plays/README.md` loop table + intro.

### F7 — Surface the trust setting / gate density as a first-class property
**Source:** Block 3 finding, this session
**The drift:** Studio currently operates at a high-trust 2-gate setting (design confirm + proven confirm). The architect noted *"There could be a ton of check-in points here"* — review-the-drawing, approve-test-tuning, approve-per-prompt, etc. This is a real **design dial** but it's not in any artifact today. Every play implicitly inherits the 2-gate default; there's no way to ask for more gates on a play whose hardening is still thin.
**Fix:**
- Make trust setting / gate density an explicit property of a play (or of the Studio's current operating mode)
- Possible carriers: a `trust:` field in `registry.js` per play; or a Studio-wide config; or per-stage gate additions
- Document the principle: *"trust is earned by hardening of processes + examples, not aspirational. As hardening matures, gates can recede."*
- Potential additional gates to expose: pre-build (review §4 graph before any Fabro touches), pre-test (approve test-tuning before dry-runs run), per-prompt (approve individual prompt drafts)
**Touches:** Possibly README (the principle); registry.js schema (a `trust:` or `gates:` field); studio governance docs more broadly.

---

### F8 — THE STRUCTURAL FIX — Make playmaking itself a play (the cap)
**Source:** Architect's Block 4 META observation. THE meta-finding of the playtest.
**The thesis:** Every prior fix in this list (F1–F7) has the same root cause: playmaking is governance-doc-shaped and human-orchestrated, so docs and practice drift independently. The moment playmaking is itself a play, this drift becomes a Protocol E lint failure. §4 becomes the canonical loop, `workflow.fabro` orchestrates it, every other artifact is either a rendering or honestly non-load-bearing.
**Existing thread:** Per memory `[[make-a-play-meta-play]]`, this work was started on branch `danversfleury/playmaker-testing-streamline`. A 3-module self-hosting play prototype lives at `studio/plays/make-a-play/` on that branch (NOT this branch). Auto-advance contract under TESTING.md. The higher-level plan exists in this branch at `docs/alexandria/plans/_archive/playmaker-testing-streamline/plan.md`.
**Fix:**
- Resume work on the `playmaker-testing-streamline` branch
- Get `studio/plays/make-a-play/` to Proven status (it would be the first play to prove playmaking by playing itself)
- After it lands, **re-derive `frame-the-problem`** through the playmaking play — that re-derivation is the validation that the loop is canonical
- Once re-derived, **F1, F2, F3, F5, F6 self-heal** (template gets re-derived; drifts close automatically) — F4 (Board interactivity) and F7 (gate density) remain separate fixes
**Touches:** branch `danversfleury/playmaker-testing-streamline`; `studio/plays/make-a-play/`; eventually re-derives `studio/plays/frame-the-problem/` and `studio/plays/TEMPLATE-brief.md`.

**This is the cap.** When F8 lands, F1/F2/F3/F5/F6 become self-healing rather than perpetual fixes.

---

### F9 — The Curator: a missing play for managing Capture / Deprecate / Quarantine
**Source:** Architect's Block 7 close, this session
**The gap:** Studio has the *mechanism* for inheritance (autopsy + quarantine + PROJECTION §10 dispositions), but no *play* that orchestrates it. Today the discipline is ad-hoc — a director or agent has to remember to autopsy a finding, deprecate an outdated rule, or quarantine inherited material. Without explicit triggers and an orchestrated process, the discipline atrophies and contagion (importing yesterday's patterns without verification) sneaks in.
**The fix:** A new play — the Curator — with three triggers and a unified move graph:
- **Capture trigger:** a session surfaces a learning worth preserving (e.g., this very playtest's 9 META findings).
  - Process: classify the learning → write to `inheritance/autopsy/` with provenance + verdict
- **Deprecate trigger:** a verified inconsistency between governance docs / template ↔ exemplar drift (F1, F5, F6 all instances).
  - Process: mark dead in PROJECTION §10 → remove from load-bearing docs → record reason
- **Quarantine trigger:** incoming inheritance from elsewhere or a prior era (merging conventions from another branch; importing from another product).
  - Process: sequester to `inheritance/quarantine/` → DO NOT touch load-bearing rules until explicitly dispositioned
**Peer relationship with F8:** F8 (make playmaking a play) produces new plays following the current rulebook; F9 (the Curator) updates the rulebook from learnings. Together they cover Studio's full self-hosting. Without F9, even F8 can't keep up with what its own runs surface.
**Touches:** New play at `studio/plays/curator/` (or similar slug); likely needs `ax curate <trigger>` CLI handles to fire from runtime; subscriptions on relevant ledger events.

---

*Future fixes will be appended here as the walk surfaces them.*
