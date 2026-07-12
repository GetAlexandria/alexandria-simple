# Studio + Library — Issue Plan (projects · sequence · phases)

> **Updated 2026-06-23.** The dispatch plan for the Studio/Library build via the Fabro factory.
> Issues follow `skills/maintainer/factory-issue-authoring/`; each is created **without**
> `fabro:ready` — **the director applies `fabro:ready` to dispatch.** **Phase 1 is merged — but
> its catalog (#353) + Board (#358) UI shipped to the retired `:8778` site; it is being
> re-rendered in the viewer (see _Surface correction_ below).** Phase 2 (#341–#351, minus #345)
> is the active launch set. **The factory is healthy.**

## Surface correction (director ruling, 2026-06-23) — viewer canonical, `:8778` retired

The canonical Playmaker Studio is the **viewer's `/studio` tab**
(`packages/viewer/src/components/studio/`). The standalone `studio/*.html` +
`site-server.py` (`:8778`) site is **RETIRED**. Phase-1's headline UI — the catalog by
Division→Function (#353) and the work-order Board (#358) — was rendered into the retired
`:8778` HTML, **not** the viewer, so the director never saw it. The data/logic are sound
and surface-agnostic (`registry.js`, `board-state.json`, `check-catalog.mjs`); only the
**rendering** was mis-placed. See [`board-surface-decision.md`](board-surface-decision.md)
(RESOLVED = Option B) and memory `studio-surface-is-the-viewer`.

**Surface-correction track** — factory-authored issues that port the rendering to the
viewer off the shared data:

| Issue | Was | Port target |
|---|---|---|
| **#366** Catalog → viewer | #335 → #353 (built in `registry.html`) | render Division→Function→Play in `/studio`; endpoint exposes `DIVISIONS`; rung schema carries `division`/`function`/`tier` |
| **#367** Board → viewer | #338 → #358 (built in `board.html`) | render work-order cards in the `/studio` board tab; `/api/studio/board` gains card authoring (`merge_cards` + validation); fix `empty`→`backlog` |
| **#368** Retire `:8778` | needs #366 + #367 merged | delete `index.html`/`registry.html`/`board.html`/`board-ui.js`/`site-server.py` + the python server test; keep the data + `studio/tools/` validators |

(#357/#359 stripped copy from the now-retired HTML — moot once it's deleted.)

### Phase-2 in-flight triage (2026-06-23) — nothing in flight needs killing

The factory had been **dual-maintaining** (#344 wrote provenance into *both* the viewer
`/studio` **and** the `:8778` board), so the viewer is already being fed — which is why
this is recoverable. The ruling: stop dual-maintaining → **viewer only.** The `:8778`
tails in already-open PRs are wasted but harmless (the retire issue sweeps them up).

| Issue | State | Action |
|---|---|---|
| **#346** Re-sync runtime (PR #362) | done | ✅ Surface-agnostic (tool + test + plan). Merge normally. |
| **#344** Provenance (PR #364) | done | ⚠️ Substance correct (D5 event + projections + viewer `/studio` wiring). The `:8778` tail (`board.html`/`board-model.js`/`site-server.py`) is wasted — merge as-is (retire sweeps it) or strip first for a clean QA diff. |
| **#341** F8 | running | 🕒 Let finish; check its board-banding bit for an `:8778` touch. |
| **#351** VB2 | needs-human | 🕒 Viewer library feature — correct surface; resolve the gate. |
| **#347** Board-advanced | parked | 🚫 **Retargeted ✓** to the viewer board tab (now ← #367). Hold `fabro:ready` until #367 merges. |
| **#342 #343 #348 #349 #350** | parked | ✅ Surface-agnostic (plays / ledger / EL) — unaffected. |

## The phase gate / operating discipline

- **No Phase N+1 issue is closed until every Phase N issue is closed.**
- **Don't `fabro:ready` a Phase 2 issue until its blockers have *merged*.** A stale base is why
  #336 first "died on scope" — and it turned out #353 had already done it.
- **Pace dispatches.** The local server runs `--max-concurrent-runs 1`, so dispatching many just
  queues them; fire 1–2 at a time and watch ACP health.
- **Per PR: review → merge → close the issue.** Factory PRs **don't auto-close** their issues.
  On review, run two checks: **subsumption** (did it quietly do Phase-2 work?) and **spec-as-copy**
  (data-model/acceptance language leaked onto the screen?).

## Phases

- **Phase 1 — the org model becomes real.** ✅ **DONE.** Company→Division→Function with face agents;
  Library Operations homes the library-building plays; Play Re-sync; the Board; the first two
  library steps.
- **Phase 2 — self-hosting + deeper library + advanced surfaces.** make-a-play (F8) + the
  maintenance plays that ride it (F7, F9); provenance on the ledger; the elicitation chain
  (EL3–EL5); the library viewer surfaces (VB2+); the runtime halves of Re-sync and the Board.

## Phase 1 — DONE

| Issue | Shipped as | Note |
|---|---|---|
| **#335** catalog Division→Function | PR #353 | over-delivered → subsumed **#336** + **#345** (both closed); also functions-as-data + `check-catalog.mjs` |
| **#337** Play Re-sync | PR #355 | stale-cone automation |
| **#338** Studio Board | PR #358 | work-order cards + `empty→backlog`; explicitly fenced out #347/#344 |
| **#339** BoH Walk → Gate 1 | PR #356 | reconciled + registered + conformance check; **Gate 1 still owed (director)** |
| **#340** Empty Library View (VB1) | PR #354 | risk-map blocker fixed via #352 |

Review cleanups: **#357** (catalog page) + **#359** (landing page) stripped the "spec-as-copy" leak
(now a skill rule). QA-walk findings to file as Board cards: VB1 renders raw error JSON on a backend
failure; the viewer isn't browsable without the full `ax start` runtime.

## Phase 2 — LAUNCH PLAN

### Pre-flights
- **#341 (F8)** — the recovered make-a-play brief is now committed at
  `studio/plays/make-a-play/brief.md` (was gitignored in `.context/`). ✅ Reconcile its
  pre-org-model framing at Gate 1.
- **EL chain (#348+)** — **pass Gate 1 on the BoH Walk** (reconciled + ready). It then derives →
  runs → emits the bundle EL3 walks. Director action.

### Waves (a wave's blockers must *merge* before the next opens)

- **Wave 1 — launchable now** (all hard deps merged): **#344** Provenance (gates #343/#347) ·
  **#341** F8 (gates #342/#343) · **#346** Re-sync runtime · **#351** VB2. *Lead with #344 and
  #341 — they unblock the most.*
- **Wave 2:** **#342** F7 (← #341) · **#343** F9 (← #341 + #344) · **#347** Board-advanced
  (← #344) · **#348** EL3 (← BoH Gate-1).
- **Wave 3:** **#349** EL4 (← #348 + #344) → **#350** EL5 (← #349).

## Projects → issue table

### A — Studio Catalog
> **#353 over-delivered** — filed *every* play by Division→Function + shipped functions-as-data +
> hand-set built-by fields, subsuming **#336**/**#345** and reframing **#344**. *Broad "reorganize
> all X" issues absorb the narrow ones; re-audit downstream after they land.*

| Phase | Issue | Status / blocked by |
|---|---|---|
| 1 | **#335** file by Division → Function | ✅ PR #353, closed |
| 1 | ~~**#336**~~ · ~~**#345**~~ | ✅ closed — subsumed by #353 |
| 2 | **#344** Provenance on the Ledger | *migrate* #353's hand-set built-by onto the ledger + D5 event · ← #335 ✓ |

### B — Play Re-sync
| Phase | Issue | Status / blocked by |
|---|---|---|
| 1 | **#337** stale-cone automation | ✅ PR #355, closed |
| 2 | **#346** runtime half: re-run campaign + read-out | ← #337 ✓ |

### C — The Studio Board
| Phase | Issue | Status / blocked by |
|---|---|---|
| 1 | **#338** work-order cards per play | ✅ PR #358, closed |
| 2 | **#347** advanced: swimlanes/tiers, connections, ledger-backed cards — **retargeted to the viewer `/studio` board tab** (2026-06-23) | ← **#367** (Board → viewer) · #344 |
| — | **#366** Catalog → viewer · **#367** Board → viewer · **#368** retire `:8778` | the surface-correction track (above) |

### D — Library Rebuild
| Phase | Issue | Status / blocked by |
|---|---|---|
| 1 | **#339** BoH Walk reconciled | ✅ PR #356, closed — **Gate 1 owed** |
| 1 | **#340** Empty Library View (VB1) | ✅ PR #354, closed |
| 2 | **#348** EL3 Front-of-House Walk *(largest — will decompose)* | ← BoH Gate-1 |
| 2 | **#349** EL4 Confirm Gate | ← #348 · #340 ✓ · #344 |
| 2 | **#350** EL5 atomizer re-point | ← #349 |
| 2 | **#351** VB2 Engine View | ← #340 ✓ |
| — | VB3 Plane Switcher · VB4 Library Studio · VB5 Atomization Run View | *not yet issued — author after VB2/EL land* |

### E — Studio Self-Hosting
| Phase | Issue | Status / blocked by |
|---|---|---|
| 2 | **#341** F8 make-a-play (Gate 1 → derive → prove) | ← Phase 1 closed ✓ · brief pre-flight ✓ |
| 2 | **#342** F7 Review Levels | ← #341 |
| 2 | **#343** F9 the Curator (built *through* F8) | ← #341 · #344 |
