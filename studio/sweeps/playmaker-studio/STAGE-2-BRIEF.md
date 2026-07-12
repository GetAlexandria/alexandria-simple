# Stage-2 Brief — Playmaker Studio (PMS)

The director-only questions this back-of-house walk surfaced — the agenda for the
front-of-house walk (EL3). No answer key and no Vision were supplied, so the
"why" questions (Tier D) are expected and load-bearing. Each question points at a
real card or thread.

## Tier A — Naming (would the architect say this word?)

1. **"Tier" is one word for two things.** A Play's criticality band (`prio`:
   core/input/stretch/parked) and a role tier (Coordinator/PM/Senior). Carded as
   `Economy - Criticality Tier` and `Economy - Role Tier` with a cross-reference
   (thread `hot-spot-tier-polysemy`). Keep both names, or rename one?
2. **"Bank" is one word for two operations.** The output bank (deliverable →
   library) and the package bank (`bank.sh`, studio → plugin deploy). Carded as
   `Capability - Output Bank` / `Capability - Package Bank`
   (thread `hot-spot-bank-polysemy`). Confirm the split, or unify the word?
3. **"Board" is surface and state.** Carded as `Surface - Board` (rendered) and
   `Entity - Board State` (`board-state.json`), the live DDD polysemy case. Is the
   split right, or is one the architect's only "Board"?
4. **Is "Play Run" a thing the architect names, or just a runtime instance?**
   Proposed for demotion (thread `hot-spot-play-run-over-promotion`). The play
   flags; you rule.
5. **The default card-type vocabulary was used** (the canonical nine). PMS does
   not ship its own card taxonomy in source, so these categories may not match
   your words — ratify or replace at EL3.

## Tier B — Process (which mechanism is canonical?)

6. **Two advancement mechanisms.** The Director's manual ▸ confirm on the Board
   vs the auto-advance contract that promotes on five passing conditions
   (thread `hot-spot-two-advancement-mechanisms`). Which governs a given Play —
   and does the contract ever advance without your touch, or only *hold*?
7. **Two human-gate models.** PROJECTION.md §7's blocking Fabro hexagon vs
   RUNTIME.md's non-blocking event-sourced pair (Raven Vision)
   (thread `hot-spot-two-human-gate-models`). Is the blocking model fully retired,
   or still valid under `--interactive`?
8. **When does "Register" happen?** README Step 8 says end-of-line; TESTING.md /
   PROJECTION.md say the Derive seam (thread `hot-spot-register-timing`). Confirm
   the canonical timing so the ladder card reads true.

## Tier C — Runtime (the execution model)

9. **Failure exits collapse to `play.failed`.** A designed refusal, an ACP exit-1
   failure, and a FREEZE are distinct upstream but merge on the ledger; the Tracker
   re-splits (thread `hot-spot-collapsed-failure-exits`). Is that the intended model?
10. **Review Levels are carded at low confidence** (PS2 is a specced design
    artifact; the Tracker renders review gates). Are low/medium/high review
    compositions shipping, or still design?

## Tier D — Values / "why" (unrecoverable from code — your input is the source)

11. **What is PMS *for*, as a product?** The walk recovered the backbone and texture
    but not the value proposition, market positioning, or strategic intent — those
    do not live in code or governance docs (thread `gap-why-unrecoverable`).
12. **Who is the user of the Studio surface?** The README frames it as Director +
    agents; is there an external audience (the README hints at "publishing bundles
    to non-Alexandria customers"), or is it maintainer-only?

## Tier E — Source detail (read-budget gaps)

13. **The authoring kit (AUTHORING.md, Protocols A–E in full) was sampled, not read
    in full** per the read budget (thread `gap-authoring-kit-thin`). The
    `Capability - Lint` and `Component - Node Prompt` cards are thinner than the
    proving cards; a follow-up read would deepen them.
14. **The validators are carded as one Mechanism** (`Mechanism - Data Validator`),
    not one card per `check-*` script. Is that the right grain, or do individual
    guards deserve their own cards?

## Tier F — Architect-only (scope)

15. **Is `Reference - Legacy Status` safe to demote?** registry.js `status:` is
    archeological, superseded by board-state.json
    (thread `hot-spot-legacy-status-demotion`). Confirm it can become a deprecation
    note (the hardening *step* it half-names stays alive).
