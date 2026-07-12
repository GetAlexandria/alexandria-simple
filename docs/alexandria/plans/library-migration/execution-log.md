# Library Migration — Execution Log

Orchestration state for resuming cold (any session, any operator). The plan is
`plan.md`; inventories in `plan-appendix-inventories.md`. GitHub labels + PRs
are the authoritative run state; this log is the narrative index.

## Standing orders (director, 2026-07-07)

- Orchestrator: Raven session creates issues, labels `fabro:ready`, polls
  ~30 min, merges, chains next issue.
- ONLY code goes to the factory. Backfills, card edits, archives = operator
  work (more context, not code).
- Merge policy: autonomous merge on green + factory verification, EXCEPT
  user-facing surfaces (Slice 3 config/viewer, and the Slice 1+2 PR) —
  director QAs those before merge.
- `fabro:needs-human`: operator resolves what it can; consult director only
  for true judgment calls.
- Slice 1+2 = one issue, one PR (ruled "almost certainly the right play").
- Stranded card destination CONFIRMED: `ledger/Capability/`.

## Work breakdown (factory F / operator O)

| # | Work | Kind | Status |
|---|---|---|---|
| 0-code | `ax internal` backfill command (receipts → flat `library.*` events; read-side alias for `library.front_of_house.*`) | F | DONE — #667 → PR #668 merged 4a46e932 |
| 0-ops | Run backfill; re-home Inspect State → `ledger/Capability/`; archive runtime/ + 5 reports + search-prior; fix self-paths | O | DONE — PR #669 merged e22f2495; ledger 33 events (25/3/1 backfilled, idempotent) |
| 1+2 | Delete legacy corpus + Legacy-reference feature + move library + repoint literals + CI filter + CLAUDE.md | F | DONE — #670 via takeover PR #680, merged 512a9f907, director QA'd 2026-07-07 |
| 3 | Config `library.root`, server-resolved viewer default, `--library-root`, registry demoted to Builder | F | DONE — #683 → PR #685 merged c669b5f51, director QA'd 2026-07-08 |
| 4a-code | Loader parses `flow:` on aggregates → Workflow tab; workflows.json demoted to fallback | F | DONE — #686 → PR #688 merged 698f6e453 |
| 4a-content | Author Play Run `flow:`; delete workflows.json | O (director-gated) | DONE — approved 2026-07-08, PR #690 merged 8c9bfcc0a |
| 4b | Threads → ledger projection (thread_opened/resolved); retire threads.json | F | REVERTED — #689→PR #694 merged then reverted (#695); corrected re-dispatch pending |
| 4c | Apply Concept→Entity renames citing taxonomy_ruled event; retire gaps.json | F+O | DONE — #704 → PR #724 merged (21/22; Concept - Learning deferred to Learning wave) |
| 4d | Retire library.json + patches.json concept; Drafts from events | F | DONE — #725 → PR #731 merged; ZERO sidecar JSONs remain |
| 4e | Frontmatter v2: path lint + loaders path-first (#732→#734); operator strip PR #735 (127 stripped, 6 v2 untouched, −868 lines) | F+O | DONE — SLICE 4 COMPLETE |
| 5 | Play/skill/prompt updates + plugin release | O (Studio process) | pending |
| 6 | Prose sweep | O, opportunistic | pending |

Sequencing: 0-code → 0-ops → 1+2 → 3 → 4a-4e (serial) → 5 → 6. One
`fabro:ready` at a time.

## Operating lessons (accumulated)

1. Stale-server class (2×): the local runtime validates appends and serves
   the viewer from the code it STARTED with — after merging ax changes,
   restart `ax start viewer` before operator commands or QA.
2. `fabro:done` ≠ delivered: verify the pushed branch diff matches the run's
   claimed work. #670's push was rejected (App lacks `workflows` permission,
   diff touched validate-plugin.yml) leaving only the plan doc on origin;
   implementation recovered from the exited Docker container via git bundle
   → operator takeover PR. Issues touching .github/workflows need a planned
   takeover until the App gains that permission.
3. Factory PRs arrive as DRAFTS — `gh pr ready` before merge.
5. Factory ACP runs can skip the format pass — run prettier over factory branches before CI, or expect a format-only fix commit.
6. Stage explicit paths (never a bare `git add <dir>`) — the working tree carries the director's untracked files.
5. Escape regex literals in acceptance-criteria greps — a literal-command
   gate (unescaped dot) looped implement 6× on #689.
6. Verify the MERGE RESULT locally, not the branch tip — 4b's branch passed
   while main had deleted the file its test read (semantic conflict between
   serial slices touching one seam).
7. VERIFY-THEN-MERGE for projection-touching PRs: never chain auto-merge on
   CI green alone; check the live route against the AC first. #694 passed
   factory verification + CI + review and still emptied the Notepad on main
   (event scoping by literal historical path + a scope-fence violation in
   missingFillSections that no AC regression-tested).
8. Ledger events must not be scoped by literal filesystem paths — a git mv
   invalidates them. Scope to the config-resolved product library.
4. When labels stall, `fabro inspect <run-id>` directly; the label hook can
   fail silently (e.g. server started outside the blessed helper → no
   GitHub App creds → no clone AND no label transitions).

## Parked (director, 2026-07-08)

- Factory-efficiency review deliverables (bank ops doc? file the format-node
  and repair-cap issues?) — deferred until the library migration is fully
  queued. Full analysis lives in the 2026-07-08 orchestration conversation;
  raw data /tmp/fabro-audit (volatile).
- Evals dir: RESOLVED — deleted (director ruling 2026-07-08).

## Log

- 2026-07-07: Plan banked (PR #666, merged 69c15ca2). Rulings 1-7 settled
  (see plan §4). Factory health-checked: server :3000 up, single watcher
  running, Docker up, fabro 0.278.0-nightly. Director issued standing orders
  (above).
- 2026-07-07: 0-code issue filed as #667 (backfill command + flat-name read
  alias; contract frozen in issue). Labeled `fabro:ready` 17:5x; watcher
  moved it to `fabro:submitted` within 90s. Orchestrator polling ~30 min.
  Next after #667 merges: run backfill against the real bundle (0-ops),
  then file the Slice 1+2 issue.
- 2026-07-07 ~18:10 INCIDENT (resolved): #667 run 1 (01KWYTQM…) failed at
  sandbox init — clone "repository not found" = missing GitHub App creds.
  Cause: fabro server had been hand-started 07:54 from a Codex Desktop shell,
  bypassing the launchd/helper path that carries GITHUB_APP_PRIVATE_KEY.
  Symptom to remember: label hook ALSO silent (issue stuck at
  fabro:submitted) — when labels stall, `fabro inspect <run-id>` directly.
  Fix: `pnpm fabro:local:server:restart` (blessed helper), re-labeled
  `fabro:ready`. Run 2 (01KWYW9D…) cloning fine, issue at `fabro:running`.
  Housekeeping flag: zombie run container from ~Jul 2 still up
  (01KWGAC4…); prune-old-runs helper available, not yet run.
- 2026-07-07 ~19:5x: #667 done → PR #668 reviewed (all 5 aliases verified,
  dedupe pre-scan, runtime-client appends, real-receipt fixture), CI green,
  merged 4a46e932 (factory PRs arrive as DRAFTS — `gh pr ready` first).
  FIELD BUG + fix: first real backfill run failed — appends validate in the
  RUNNING runtime server, which predated the merge (stale-server class, 2nd
  occurrence today). Bounced `ax start viewer`, re-ran: 29 emitted (25/3/1
  as predicted), patch.json honestly refused (no playRunId/contentHash),
  re-run idempotent (0 emitted / 29 skippedExisting). Ledger now 33 events.
  LESSON: after merging ax changes, restart the local runtime before
  operator commands that append.
- 2026-07-07 ~21:0x INCIDENT (resolved): #670 run succeeded through all
  verification nodes but the PR-creation push was REJECTED — the factory's
  GitHub App lacks `workflows` permission and the diff touches
  validate-plugin.yml. Only the run's plan doc reached origin; the
  implementation was stranded in the killed sandbox. Recovery: revived the
  exited container, `git bundle` out, squashed to one clean commit, pushed
  under operator credentials → PR #680 (factory co-authored). LESSONS:
  (1) `fabro:done` ≠ branch content matches the work — verify the diff;
  (2) issues touching .github/workflows need a planned operator takeover at
  the push step, until/unless the App gets `workflows` permission (director
  may grant later).
- 2026-07-07 ~20:0x: 0-ops executed on branch library-migration-slice0 →
  PR #669: re-homed Inspect State → ledger/Capability/ (story lint required
  linking it from the Ledger lead card's HOW — done; card visible for the
  first time, catalog 127 cards / 0 issues), archived walk record →
  plans/_archive/alexandria-product-walk/, fixed 3 self-paths. All studio
  gates pass locally. Slice 1+2 issue filed as #670 (UNLABELED — dispatch
  `fabro:ready` only after #669 merges). Director QA required on the #670
  PR before merge.
- 2026-07-07 ~22:15: Director QA'd #680 on the live viewer (PR branch served
  on :4321) — APPROVED. Merged 512a9f907. Runtime+viewer rebuilt from main;
  catalog at docs/alexandria/library: 127 cards / 0 issues. THE LIBRARY IS
  IN PLACE — legacy corpus deleted, migration slices 0-2 complete.
- 2026-07-07 ~22:2x: Slice 3 filed as #683 (config owns library.root;
  precedence param > flag > config > derived; registry demoted to
  Builder-only; explicitly forbids .github/workflows changes). Dispatched
  fabro:ready. DIRECTOR QA required on its PR.
- 2026-07-08 ~06:2x: Slice 3 director-QA'd and APPROVED → PR #685 merged
  c669b5f51. En route: prettier failure (factory ACP runs skip format —
  lesson 5) fixed on the PR branch; one check-ax network flake cleared by
  re-run; near-miss committing the director's untracked evals dir with a
  broad `git add` — amended out (lesson 6: stage explicit paths only).
  Runtime+viewer on main, config-owned root verified (127/0). Slice 4a-code
  filed #686 with a sequencing refinement: flow: parsing lands ADDITIVELY
  (workflows.json as fallback) so the Workflow tab has no empty window;
  the sidecar dies in the 4a-content operator PR.
- 2026-07-08 ~09:5x: Slice 4a complete end-to-end. #688 merged (flow:
  parsing, fixtures for all negative cases; prettier pre-applied — evals
  near-miss #2 caught and amended, adopted `git add -u`/explicit-files rule).
  Director approved the 26-step flow draft (one ref fix:
  Reference→Concept - Atomic Card Category); operator PR #690 merged —
  flow: lives on Entity - Play Run, workflows.json DELETED. First sidecar
  fully dissolved; Workflow tab renders card-sourced entity-play-run,
  26 steps, 0 issues, no empty window (fallback design). 4b (#689) in
  factory repair loop (review→implement bounce), watching with 3-visit cap.
- 2026-07-08 (day 2, the long arc): 4b landed via operator takeover after a
  three-layer unwind. (1) The plan's "3 open threads" was a MISCOUNT of
  threads.json (25 authored: 21 answered + 4 residual); the backfill filter
  was built to match the wrong digit (#709 fixed discovery; ledger holds all
  25 thread_opened). (2) The 697 run manufactured my fictional "22 derived"
  golden as a hardcoded horizon override — stripped. (3) Three macOS
  /var-vs-/private/var realpath mismatches in containment/scope comparisons
  fixed at the comparison layer (precedent: library-confirmation.ts already
  realpaths). Also: Learning plane landed early → #716 pulled v2 READ
  tolerance forward (identity-from-path, evidence alias, optional
  proposed_by/confidence), re-pinned goldens (133 cards), multi-keystone
  gate, Learning keystone names its shelves, and the card-only→check-ax CI
  gap closed. Lessons 9-11: derive AC counts from data, never memory; test
  scaffolding that grows product surface invites review churn; minimal-diff
  discipline on takeovers — don't fight the branch's tested semantics.
- 2026-07-08 evening: SLICE 4 COMPLETE. 4d (#731): library.json retired,
  Drafts from events, zero sidecar JSONs. 4e-code (#734): path-first
  identity, reserved-name/unique-stem/mismatch lints. 4e-content (#735,
  operator): 127 cards stripped to v2 (identity from path, rulings→ledger,
  evidence: rename), 6 Learning cards already conformant; two studio tools
  taught the post-manifest world (machine-language by path shape; keystone
  asserts product mode for the config root). End-state achieved: config says
  where, paths say what, cards say why, the ledger says what happened.
  Remaining: Slice 5 (Studio-gated plays/prompt/release), Slice 6 (prose).
- 2026-07-09: MIGRATION COMPLETE — shipped as v0.19.0 (internal+public
  releases, R2, site, installer smoke-tested). Slice 5: prompts/skills merged
  (#737); BoH emit-contract PR #739 open for Danvers (Studio-gated, not in
  the release payload); loader draft-manifest support merged (#741). Ledger
  ruled git-backed (bug fix #738: un-ignored, union merge driver, doctrine in
  CLAUDE.md/README). Slice 6 targeted sweep: learning-plane live instructions
  repointed (historical narrative preserved), implementation-plans/ + lab/ +
  library-population-playbook/ archived, ops runbook verified clean. Parked
  for post-migration: efficiency-report deliverables, kanban/queue enabling
  issues (thread-open writer, claim event, board surface), registry→config
  fold-in (optional), Concept - Learning rename (Learning wave's).
