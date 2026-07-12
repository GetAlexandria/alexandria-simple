# Factory Efficiency Review — July 2026

Operator review of the Fabro software factory, commissioned by the director
2026-07-08 and updated 2026-07-09 with live evidence from the library-migration
orchestration (the heaviest factory usage to date: ~12 runs in 48 hours).

Sources: (1) run-level forensics over all 107 local-factory runs
(2026-06-24 → 2026-07-08), via `fabro inspect`/`fabro events`; (2) GitHub-side
analysis of 146 fabro-labeled issues and 135 `fabro/run/*` PRs
(2026-05-19 → 2026-07-08); (3) first-hand orchestration incidents recorded in
`docs/alexandria/plans/library-migration/execution-log.md`.

## Headline

The factory's bottleneck is not run speed — it is **finish quality and
state-machine reliability**. A median successful run is ~36 minutes, but 68%
of merged factory PRs required a human commit before merge (56% substantive
rework). Runs are fast; deliveries are not done. Meanwhile the label state
machine lies under load, and the delivery tail (create_pr) fails invisibly.

## Key numbers

### Run level (107 local runs, 14 days)

- Succeeded 85 (79%) · failed 21 · cancelled 4.
- Total wall-clock 70.1h; failed runs consumed 15.4h (21.9% of compute).
- Failure taxonomy: 8 repair-loop cap deaths (12.5h wasted), 7 sandbox-clone
  failures ("repository not found" — credential/race, recurring), 4 human
  cancels, 2 misc.
- 39% of runs bounce `implement` at least once; runs reaching ≥3 implement
  visits rarely recover unaided (8 of 17 rode to the cap and died).
- `implement` owns 35–46% of wall-clock (via revisits); `verify` is the
  costliest single visit (~8 min median); `create_pr` is seconds.
- Reliability improved sharply ~07-01 (zero cap-deaths across the next 60
  runs) with **no config/model/image change** — attributed to issue-authoring
  discipline (the curated issue format).

### GitHub level (146 issues, 135 PRs, 50 days)

- Queue latency (ready→submitted): median 34.5s — the watcher is fine.
- 21% of issues needed >1 dispatch cycle.
- PRs: 117 merged, 17 closed unmerged (11 real abandonments; two open 17 and
  42 days). Median creation→merge 64 minutes; mean 4.5h.
- **68% of merged PRs carried a post-bot human commit; 56% substantive.**
- Label flap storms (up to 39 toggles at 3–4s intervals) on 18 issues, worst
  under concurrent load; one 9-day silent `fabro:submitted` outage.
- Two multi-PR streaks merged with identical persistently-red checks.

### Live evidence from the migration week (the update)

- **Delivery tail failed three different ways in three days**: a push
  silently rejected by GitHub (App lacks `workflows` permission — only the
  run's plan doc reached origin; implementation recovered from the killed
  sandbox via `git bundle`); a PR silently never created despite
  `fabro:done`; and a merged PR that had passed factory verification + CI +
  review and still emptied a live surface (Notepad) on main.
- **Spec fictions become implementations**: an acceptance criterion asserting
  a miscounted "22 derived threads" was *manufactured into existence* (a
  hardcoded horizon override) to satisfy the golden. Verifiers enforce what
  the issue says, not what is true.
- **The verification judge was the strongest node**: its independent
  black-box route check (ax init → append → serve → assert) was the only
  gate that caught the real regression — twice — while review and CI passed.
- **Test scaffolding that grows product surface invites review churn**
  (a `--fixture` flag added to product code cost two repair cycles).
- **`fabro steer` works** for repeat review objections (positional args:
  `fabro steer <run> "<text>"`).
- **ACP runs skip the format pass** — three operator prettier commits in one
  week.
- **macOS/Linux divergence**: three /var-vs-/private/var symlink bugs in
  path comparisons were invisible to Linux CI, visible only in local
  verification.

## Recommendations and dispositions (director rulings 2026-07-09)

| # | Recommendation | Disposition |
|---|---|---|
| 1 | **Verified delivery tail** | **SHIPPED** — PR #752: script-level delivery verification (named failures incl. workflows-permission takeover case, non-draft PRs, ls-remote head assertion, PR re-read) + label hook refuses fabro:done when the final node outcome persisted as failed (fabro graphs cannot fail a run from an edge — probed empirically) |
| 2 | **Deterministic format node** | **SHIPPED** — PR #754: format node between handoff and create_pr, run-touched packages only, tracked-files-only commit, clean no-op |
| 3 | Apply-own-review-findings (review emits findings → the run applies them). Biggest lever on the 68%. | Parked — revisit after 1+2 move the baseline |
| 4 | **Repair cap 8→4 + escalation** | **SHIPPED** — PR #755: max_node_visits 4; cycle-cap failures escalate to fabro:needs-human with the reviewer's last verdict posted as an issue comment |
| 5 | Label reconciler (cron: run-state ↔ labels, fix drift, alert). | Parked |
| 6 | Verification hardening: judge-style black-box route checks standard for projection-touching issues; verifier checks AC numbers against reality. | Parked (orchestrator practices adopted meanwhile: verify-then-merge live gates; derive AC counts from data) |
| 7 | Clone retry-with-backoff in sandbox init; token-freshness instrumentation. | Parked |
| 8 | Don't dispatch coupled issue chains concurrently. | Adopted as orchestrator policy |
| 9 | Metrics hygiene: exclude smoke tests; compute durations from run events, never label timestamps. | Noted for any future dashboard |

North-star metric proposed: **share of factory PRs merged without a human
commit** (baseline ~32%).

## Orchestrator-side practices already adopted (execution-log lessons 1–8+)

Restart the local runtime after merging ax changes (stale-server validation);
verify branch diffs against claimed work before trusting `fabro:done`; test
the merge result, not the branch tip; verify-then-merge with a live route
gate for projection changes; escape regex literals in acceptance criteria;
derive AC counts from data, never memory; stage explicit files (never a
directory add); mine `fabro events` when labels stall; plan operator takeover
for issues touching `.github/workflows` (App lacks `workflows` permission —
director may grant later); factory PRs arrive as drafts (`gh pr ready`).

## Operational appendix

- Local factory upgraded 0.278.0 → 0.289.0-nightly (2026-07-09); server
  restarted via the blessed helper (credential lesson: never hand-start —
  the 06-XX "repository not found" incident class traces to a server started
  outside `pnpm fabro:local:server:restart`).
- Zombie run containers should be pruned periodically
  (`~/.fabro/alexandria-local/prune-old-runs`).
- Full analyst reports (run forensics; GitHub timeline) are preserved in the
  2026-07-08 orchestration session record; raw per-run JSON was scratch
  (`/tmp/fabro-audit`) and has expired — re-derivable via `fabro inspect`
  over the run ids in `~/.fabro/alexandria-local/storage/scratch/`.

## Completion note (2026-07-09)

Recs 1/2/4 shipped operator-side (per the factory/product boundary ruling:
ax-feature never builds the factory) in PRs #752/#754/#755, each with
package tests, and proven by a full-chain factory smoke (#120 →
run 01KX3NC79V5K1G294AXA08DXKD → non-draft PR #756: format node ran
in-graph, delivery verified, fabro:done earned after verification, on the
cap-4 graph; smoke PR closed unmerged as designed). New permanent technique:
probe workflows — minimal .fabro graphs run against the real factory to
answer engine-semantics questions empirically in minutes.
