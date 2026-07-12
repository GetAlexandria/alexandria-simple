> **Agent-drafted 2026-06-22** for director review. The macro-frame the other studio-fixes specs slot into. Draft — not ruled.
>
> **Editor's note (one correction):** this was drafted in an isolated worktree that did **not** include #331's draft specs, so where the text says a spec "does not exist" (Play Re-sync, F7 Review Levels, the Curator, the Board model), read **"exists as a draft in #331, not yet *built*."** The substantive point — these are *designs, not built plays*; production is built, maintenance is specced-not-built — holds exactly.

# Playmaker's Studio — Operations & Maintenance Quality Plan

*Director-facing. 2026-06-22. Scope: the Studio under `studio/plays/`.*

**What this is.** Not a library-view organization exercise — a **quality plan**. It inventories the plays, rubrics, and processes around quality; locks down the settled pieces; names the gaps; and tells the macro-story of **how Playmaker Studio is operated and maintained.** The pieces we have been speccing one at a time — Play Re-sync (the BIG-EDIT successor), the Curator (F9), F7 Review Levels, the Board (F4) — are fragments of one missing whole: a **Studio Operations & Maintenance system**. This is the frame they slot into.

**What it builds on.** The "very related" prior artifact is the **testing/quality canon** — `TESTING.md` and `research/testing/` (RISKS.md, the proving ladder, fixtures, conformance gates, the N=1→campaign model). That canon is real and largely settled. This plan does not re-invent it; it **wraps it** in the operations frame it has been missing, and connects it to the editing/maintenance fragments (F1–F9) from the 2026-06-21 playtest.

---

## 1. Frame

**Playmaker Studio is, fundamentally, the place you write a play for an agent to execute** (playtest META — "the Board is a drum beat, not the heart"). Operating and maintaining the Studio is therefore the discipline of **producing plays, proving them, editing them without breaking them, and grooming the rulebook that governs all of that** — as one operation, not a pile of one-off tools.

**Storage: Division → Function.** Plays are filed by **Division → Category (Function)**, not by who owns them:
- **`Alexandria : Operations`** — the Conan/Sam atomic-card family (`build-atomic-card`), reverse-derived from a shipped Fabro build, **not** a Raven play and **not** gated through the Studio ladder.
- **`Playmaker Studio : Operations`** — the production / editing / review / maintenance plays that build and tend the Studio itself.

The **Functions** are the canonical eight (IG1): Insight · Strategy · Definition · Delivery · Launch · Analytics · Communication · Operations.

**Named-agent ownership is a VIEW, not the storage.** Agents (Raven, Conan, Sam, the Hardener, Checker, Grader) are **lenses** on plays assigned to them — projections, not containers. A play lives in its Division→Function cell; "Raven's playbook" is one filter over that catalog.

**The production/maintenance axis.** Within each Division, every play or process is one of two kinds:
- **Production** — building a play (the forward-design pipeline; the proving ladder; testing it).
- **Editing / review / maintenance** — keeping built plays correct, current, and in sync.

**Most of our settled work is on the production side; almost all of the gaps are on the maintenance side** — which is exactly why "we keep stabbing at edges of its emptiness."

---

## 2. Inventory — production vs editing/review/maintenance

Filed by Division → Function, then by kind. Status: **settled** · **partial** · **specced** (designed — for the studio-fixes set, a draft in #331; not built) · **gap**.

### Division: `Playmaker Studio : Operations`

| Function | Kind | Piece | What it is | Status |
|---|---|---|---|---|
| Operations | **Production** | The forward-design pipeline | Ground → Brief → Harden → Gate 1 → Derive → Lint → Dry-run → Gate 2 → Register | **settled** |
| Operations | **Production** | The proving ladder | `empty → sourced → designed → built → proven → live` | **settled** |
| Operations | **Production** | The testing system | Fixture kit, risk-maps, grading, N=1→campaign | **settled (v1, single data point)** |
| Operations | **Production** | F7 Review Levels (Low/Med/High) | Gate density per play; review-cycle preference | **specced** (#331) |
| Operations | **Maintenance** | Play Re-sync | The load-bearing order for an edit; computes the stale cone, re-derives/flags | **specced** (#331; `BIG-EDIT.md` is the on-disk precursor it replaces) |
| Operations | **Maintenance** | The Curator (F9) | A play that orchestrates Capture / Deprecate / Quarantine of rulebook knowledge | **specced** (#331) |
| Operations | **Maintenance** | The Board | Work-tracking; stage + Testing/Improvement/Bug cards | **specced** (#331; live board is read-mostly) |
| Operations | **Maintenance** | F8 — make playmaking a play | The self-hosting cap; §4 becomes the canonical loop; F1–F6 self-heal | **specced, off-branch** (`playmaker-testing-streamline`) |
| Delivery | **Production** | Runtime contract (RUNTIME.md) | Six obligations a runtime-aware play owes, ported from Vision | **partial** (Vision + frame-the-problem only) |

### Division: `Alexandria : Operations`

| Function | Kind | Piece | What it is | Status |
|---|---|---|---|---|
| Operations | **Production (reverse-derived)** | `build-atomic-card` (Conan/Sam) | draft → validate → grade → publish; story reverse-derived | **derived**; eval suite is its testing phase |

### The quality enforcement layer (cross-cutting)

| Kind | Piece | Enforces | Status |
|---|---|---|---|
| Maintenance | `bank.sh` + bank conformance gate | studio ≡ plugin | **settled** |
| Maintenance | placeholder spelling + gate | single-`AX_` only | **settled** |
| Maintenance | risk-map drift gate | risk taxonomy agrees across its homes | **settled** |
| Production | `derive-views.sh` + `check-moves.ts` | renderings re-derived, never hand-edited | **settled** |
| Production | `check-workflow-edges.py` | every ACP work node has a failure fallback | **settled** |

---

## 3. The quality system — the rubrics, gates, processes

1. **The two Director gates.** Gate 1 (Confirm the design — brief §1–8 incl. the §4 move graph; nothing derived before it). Gate 2 (Confirm it's proven — dry-run read-out; human-judgment, deliberately not yet wired to the statistical bar — "live before fully validated" by design).
2. **The proving ladder** `empty → … → live`. The legacy `registry.js` status ladder + `surface:` are archeological (IG3, retiring).
3. **The Hardener interview** (Solomon's method): Outcome / Reasoning / Breakdown × every move + state audit. Design hardening, inside `designed`, before Gate 1.
4. **Risk-map / fixture testing** (`TESTING.md`, `RISKS.md`): fixtures bought **by failure class, not difficulty**; minimum kit = baited golden · refusal · degradation · state · factored ceiling.
5. **The measurement model**: pass-rate not bare label; √k precision; rule of three; Smoke k≈5 / Estimate k≈30 / Ship-gate k≥100; deterministic checks n=1-sufficient; never pool across tests.
6. **Protocol E — the anti-drift protocol** (`AUTHORING.md`): gates banking on **brief ↔ workflow ↔ prompts parity** (`fabro validate` E.6, `check-workflow-edges.py` E.7). "A hot-fix found in a rendering is a parity failure: the fix goes to the brief, the package re-derives." **The sync rule made mechanical.**
7. **The conformance gates** (CI): bank · placeholder · risk-map drift — catch a skipped step loudly, but don't do the re-tune for you.
8. **The runtime contract** (`RUNTIME.md`): six obligations ported from Vision — the reference for any human-in-the-loop play.

The inherited safety rules (one-source-of-truth, doer honesty, grounding, quote-or-demote, three-strikes-then-freeze, untrusted-inputs-are-data) are the **constitutional layer** under all of it.

---

## 4. Locked down (settled)

- The forward-design pipeline + its two gates (proven once: frame-the-problem).
- The testing system as v1 (fixture-by-failure-class, the kit, the measurement model — a single data point; "defaults, expect revision").
- Protocol E + the conformance gates (the anti-drift spine, in CI).
- The proving-ladder vocabulary after IG3 (one ladder, anchored on the real process).
- The runtime contract's reference (Vision).
- The lexicon (Brick 0 + IG1/IG2: Role · Tier · Function · Play; Studio's own Division/profile).
- Provenance is the Ledger (IG5).

---

## 5. Gaps — the emptiness (where we keep stabbing at edges)

**The through-line: production is built; operations & maintenance is a scatter of fragments with no owning frame.**

- **G1 — No Operations & Maintenance frame, only fragments.** F4 / F7 / F9 / Play Re-sync are each specced *in isolation*; none names the others. **This document is the missing frame** — the gap was that it hadn't been written.
- **G2 — Play Re-sync is designed but not built, and its runtime half is owed.** `BIG-EDIT.md` is the on-disk precursor (good); the successor `play-re-sync.md` is a #331 draft, not built; its runtime half (steps 7–8: re-run the campaign + honest read-out) was pegged to #305.
- **G3 — The Curator (F9) is designed but not built.** Studio has the *mechanism* (autopsy + quarantine + PROJECTION §10) but no *play* firing Capture/Deprecate/Quarantine; the discipline is ad-hoc; "contagion" sneaks in without triggers.
- **G4 — F7 Review Levels has no carrier yet.** The review-cycle dial is real but there's no field/composition on a play; every play silently inherits the 2-gate default.
- **G5 — The Board is not a director surface.** Read-mostly; the Testing/Improvement/Bug card model isn't in `board-state.json`'s schema (it hard-validates the six stages); F4 unbuilt.
- **G6 — The runtime contract is unevenly applied.** Only Vision + frame-the-problem are upgraded; most plays still carry the blocking-gate shape and deadlock under detached runs. Architecture-in-flight — but a live correctness gap.
- **G7 — Testing is a v1 on a single data point; nothing is campaign-proven.** frame-the-problem is `live` on an N=1 smoke; the review⇄revise loop is untested; the statistical bar is documented, not wired to Gate 2.
- **G8 — Template-vs-exemplar drift is structural** (F1/F2/F3/F5/F6). Playmaking is governance-doc-shaped + human-orchestrated, so docs and practice drift independently. Until F8 lands, every fix is a perpetual re-fix, not self-healing.
- **G9 — The two Divisions have no shared catalog home.** EL-family + Alexandria-Operations plays have no registry home; the Division→Function storage this plan asserts isn't reflected in any catalog file yet.

---

## 6. The macro-story — the missing whole

**Playmaker Studio is one operation with two halves and a groundskeeper.**

**The production half** takes intent and makes a proven play. The Director picks a play and clarifies its purpose; **agents do everything else**. The play climbs the ladder `empty→…→live`, through **Gate 1** (design) and **Gate 2** (proof). The **Review level (F7)** sets how many gates stand between intent and live. Quality is enforced the whole way down by the Hardener, Protocol E parity, the fixture kit, and the measurement model.

**The editing/maintenance half** keeps built plays correct as the world moves. When a play changes, **Play Re-sync** runs the load-bearing order — edit source, re-derive renderings, re-tune tests, re-audit, sideline old runs, bank, re-run — so a redesign never silently invalidates its renderings, tests, audit, and recorded results (the failure that seeded BIG-EDIT.md). The **conformance gates** stand at the seams and fail CI when a step is skipped. The **Board** tracks every play's stage and the work against it (Testing/Improvement/Bug cards) — and should become a real director surface.

**The groundskeeper is the Curator (F9).** It tends the *rulebook itself*: **Capture** a learning to `inheritance/autopsy/` with provenance; **Deprecate** a rule the proven exemplar has outgrown; **Quarantine** inherited material until verified — never letting unverified inheritance be load-bearing. This is the **Planes ethos in microcosm**: past → present discipline → future promotion → Learning informing Strategy.

**The cap that closes the loop is F8: make playmaking itself a play.** Today the operation is governance-doc-shaped + human-orchestrated, so docs and practice drift — and we patch one fragment at a time. The moment playmaking is a play, **§4 becomes the canonical loop**, `workflow.fabro` orchestrates it, and every other artifact is either a *rendering* of §4 (auto-synced) or honestly non-load-bearing prose. **Then F1/F2/F3/F5/F6 self-heal**, F9 keeps the rulebook current, and Re-sync becomes the edit-path of that same self-hosting play.

**The one-line operating thesis** (Director, the testing-streamline plan): *"the right information at the right time, pointing to the right thing."* Every gap in §5 is a connective-tissue break — a copy out of sync, a placeholder pointing nowhere, a rendering pointing at the old graph, a result pointing at the retired play. **F8 (production self-hosts) + F9 (the rulebook is curated) + Re-sync (edits stay coherent) + the conformance gates (drift fails loudly) = the missing whole.** We've built the production half and the enforcement gates; the maintenance half and the self-hosting cap are what remain.

---

## Recommended next moves (so this stops being prose)

1. **Adopt this as the Operations & Maintenance frame** + give the two Divisions a real catalog home (closes G1, G9) — Division→Function storage, agent-ownership as a view.
2. **Write the actual `play-re-sync.md` build** as BIG-EDIT.md's successor; unpeg its runtime half now #305 has landed (closes G2).
3. **Resume F8** on `playmaker-testing-streamline` — the cap that makes G8 self-healing; the natural home for Re-sync + the Review-level dial.
4. **Design + build the Curator (F9)** with its three triggers + ledger subscriptions (closes G3).
5. **Carry the Review-level dial (F7) as a play field/composition**; wire Gate 2 toward the statistical bar as campaigns make it affordable (closes G4, G7).
