# Changelog

All notable changes to Alexandria are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.20.0] — 2026-07-09

### Added

- The learning plane (#747): the library's third plane lands end to end.
  - Experiment, Measure, and Arc are first-class card types; learning-card
    vitals parse from frontmatter (Experiment kind/grade/state/expected/arc/
    role/verdict with stop and guardrail tag-notes; Research kind/origin/
    grade; Measure target/trend) and render in the card drawer.
  - WHY joins the required fill sections for every card; WHEN is required
    for `plane: learning` cards. WHY and WHEN are first-class story buckets
    end to end (bucket cap 2,400 → 6,000 characters).
  - The Engine view gains a plane switcher; type filters derive from the
    selected plane. Altitude ranking is complete and unknown altitude words
    warn.
  - Story links render the author's pipe alias; bare links keep the card
    title.
  - The hand-rolled frontmatter parser handles YAML block scalars (`>-`,
    `|`, and chomping variants).
- Workflow `flow:` steps carry per-step `context`, `gate`, and `evidence`
  (#757). The Play Run workflow renders its six surface lanes again
  (viewer, triggers, playbook, library, ledger, canvas) instead of
  collapsing into the owning card's single lane.
- The Workflow view's plane sidebar now filters workflows by the owning
  card's plane (#757); plane-less legacy workflows stay visible on every
  plane.

### Changed

- Cards using the new `flow:` step keys require ax ≥ 0.20.0 to project
  their workflow; older binaries drop the steps as unknown keys.

## [0.19.0] — 2026-07-08

### Changed

- The library model completed its migration (library-migration plan):
  - The product library lives at `docs/alexandria/library` and its location
    is config-owned (`library.root` in `alexandria-config.json`, default
    `<workspace>/library`; `ax start --library-root` and `?libraryRoot=`
    remain as explicit overrides). The viewer resolves the root from the
    runtime server; `library-bundles.json` is Builder-only.
  - Cards use frontmatter v2: identity is the path
    (`<context>/<Type>/<Type> - <Name>.md`), grounding lives in `evidence:`,
    and decision/creation provenance lives in Ledger events — `type:`,
    `prefLabel:`, `context:`, `proposed_by:`, `rulings:`, and
    `source_evidence:` are retired (v1 cards still read via fallbacks, with
    identity-mismatch lints).
  - Path lints: reserved context names (`runtime`) and globally-unique
    `Type - Name` stems are enforced at load.
  - All sidecar JSONs dissolved: `workflows.json` → `flow:` on the aggregate
    card; `threads.json` → `library.thread_opened`/`library.thread_resolved`
    Ledger events (Notepad projects from events); `gaps.json` applied to the
    files and deleted; `library.json` retired (product-card mode via config
    identity; draft bundles carry `library-draft.json` manifests).
  - Ledger event types flattened: `library.front_of_house.*` →
    `library.*` (read-side aliases keep old spellings parseable), plus new
    `library.thread_opened`, `library.thread_resolved`,
    `library.taxonomy_ruled`, and `ax internal library backfill`.
  - The Ledger is git-backed shared history (union merge; never local-only).
- Raven's prompt and skills resolve the library via config and describe the
  v2 identity model.

### Removed

- The retired legacy library corpus and the viewer's "Legacy reference"
  Builder tab.

## [0.18.0] — 2026-07-03

### Added
- Raven ships as a named agent in the plugin payload (`alexandria:raven`):
  the director's product-thinking colleague and resident expert on the
  product's context library, grounded in a new `agents/raven-resources/`
  reference set (library model, product traversal, conversation archetypes,
  diagnostic patterns, thinking lenses, and a confidence protocol).
- Raven's built-in agent entry now carries `claudeAgentPromptPath` and
  `codexAgentPromptPath` runtime metadata pointing at `agents/raven.md`,
  matching Damien, and release packaging guards that the Raven agent files
  ship in the public repo payload and plugin archive.

## [0.17.1] — 2026-07-02

### Fixed
- The Claude event monitor now detects plugin/`ax` version skew before
  running: when the installed payload's `VERSION` and `ax version` disagree,
  it names both versions and recommends `ax upgrade` instead of failing on a
  cryptic `Unknown subcommand` error. Source checkouts (`claude --plugin-dir`)
  carry no `VERSION` file and skip the check.
- That version-skew check now locates the plugin root with POSIX parameter
  expansion instead of the external `dirname` command, so the monitor keeps
  working in minimal-`PATH` environments.

## [0.17.0] — 2026-07-02

### Added
- Added the PlayMaker Studio CLI (`pms`): `pms run
  make-a-play:design|build|prove` production modules, `pms
  capture|deprecate|quarantine` Studio Operations, and `pms start` — a
  dedicated PMS server on port 4322 serving the new PMS viewer (Studio,
  PMS-Back, and PMS-Drafts) that reaches Alexandria data only through an
  identity-checked read-only proxy of the public runtime API.
- Added the Alexandria Drafts library tab: a live draft window over
  Alexandria's own product bundle and draft patch log.
- Made PMS-Drafts a live Front-of-House draft window: it starts blank,
  auto-refreshes during a walk, renders only overlay-touched draft cards
  grouped by section, and shows director-confirmed section labels and
  summaries.
- Guaranteed a banked Front-of-House frame gate: when a bundle has no
  scan-authored frame thread, agenda preparation synthesizes a headline
  frame item so every walk opens with a real, banked frame exchange.

### Changed
- Completed the PMS/Alexandria boundary migration: PMS production machinery
  moved out of the `ax` CLI and Alexandria viewer into the new `pms`
  package, PMS operations record to per-operation files under
  `studio/records/` instead of Alexandria's Ledger, the Alexandria product
  sweep moved to `docs/alexandria/sweeps/`, and the Alexandria viewer and
  runtime no longer carry studio surfaces.

### Fixed
- `ax start all` now survives Codex substrate failures: a missing Codex CLI
  or marketplace metadata degrades to a `codex: unavailable` status instead
  of failing Alexandria startup.
- Tightened draft section-confirmation matching so stale repeated patch ids
  can no longer attach an old section header to a new draft.

## [0.16.0] — 2026-07-02

### Added
- Added the Front-of-House library walk: a guided walk with a headline
  opener, thread-backed agendas, a section comprehension pass, and section
  confirmations recorded in the Ledger.
- Modeled Front-of-House placement state explicitly, derived walk thread
  lifecycle from the Ledger, and hardened card-edit provenance so walks
  survive rejected bundle patches and record durable draft logs.
- Added the Back-of-House search-prior contract, thread lifecycle
  provenance, and a scope fence that flags suspect threads, plus the first
  Alexandria product library bundle from the Back-of-House sweep.
- Added the Alexandria Back viewer tab for product sweep QA, alongside
  library viewer upgrades: a product-thesis Library Index, in-place peek,
  a PMS-Drafts overlay tab, and the Workflow lens.
- Banked Front-of-House scripted reaction answers so review gates replay
  deterministically in scripted runs.
- Added the Studio keystone conformance gate to CI.
- `ax doctor` now verifies live ACP provider authentication.

### Changed
- Reshaped Raven Vision onboarding into the Basic Product Description with
  Shape, Work, and Refusal Fence slots.
- Tightened the Raven Front-of-House opener contract and consolidated
  Front-of-House catalog, read-path, command dispatch, and projection
  internals.

### Fixed
- Hardened confirm-section provenance and idempotency; malformed
  Front-of-House card edit patches and broken agenda inputs now fail
  loudly instead of corrupting walk state.
- Fixed Front-of-House record-turn re-presentation linkage.
- Pending human-input wakes are now delivered when the Claude monitor
  connects instead of being dropped.

## [0.15.2] — 2026-06-19

### Fixed
- Resolved Railway Claude ACP credentials through Fabro's server vault so
  managed Frame the Problem runs receive the API key at ACP launch time instead
  of the unresolved `{{ env.ANTHROPIC_API_KEY }}` template.
- Upgraded existing managed Fabro settings from the 0.15.1 env placeholder to
  the vault-backed secret placeholder while preserving local Claude
  subscription authentication outside Railway.

### Changed
- Release assets now build the bundled Fabro sidecar from this vendored source
  tree so Alexandria releases include the ACP credential fix.

## [0.15.1] — 2026-06-19

### Fixed
- Forward `ANTHROPIC_API_KEY` into Claude ACP subprocesses only in Railway
  product deployments, leaving local Claude subscription authentication
  unchanged.

## [0.15.0] — 2026-06-19

### Fixed
- Guarded ACP-backed play moves so `frame-the-problem`, `source-assessment`,
  and one-pager workflows fail closed instead of advancing to review after an
  ACP agent failure.
- Added workflow edge validation and projection test coverage so future shipped
  ACP workflows keep explicit failure routes.

## [0.14.1] — 2026-06-19

### Changed
- Release asset builds now package the pinned upstream Fabro
  `0.267.0-nightly.0` GitHub release binary instead of compiling Fabro from the
  vendored source tree during release.

## [0.14.0] — 2026-06-19

### Added
- Added the AX server run bridge so detached Fabro play runs are observed and
  projected into the Alexandria ledger.
- Added the Frame-a-Problem coin flow: Raven can elicit source material, launch
  the frame-the-problem play, manage human feedback through Fabro gates, and
  surface progress in the viewer.
- Added `ax raven answer` for out-of-band human gate answers and `ax run
  --reactions` for scripted dry-run traversal of review and revise gates.

### Changed
- Frame the Problem now frames the human struggle directly instead of centering
  generic undertaking risk.
- Detached `ax run` now returns the Fabro run handle and refuses fire-and-forget
  launches when no runtime bridge is available to emit play lifecycle events.
- The Play Tracker and Studio viewer surfaces now expose active play progress,
  human-feedback status, and the Frame-a-Problem entry point.

### Fixed
- Fixed apostrophe handling in workflow input substitution and added
  `--input-text` temp-file routing for literal play material.
- Removed a too-strict answer-kind validator so Fabro remains the arbiter for
  mixed freeform and multiple-choice human gates.
- Tightened the scripted-answer and Fabro answer Effect boundaries so async IO
  failures surface as stable operational failures.

## [0.13.0] — 2026-06-18

### Added
- Studio now includes a live Play Tracker for following play delivery status,
  estimates, board state, and play-specific progress from the viewer.
- Studio Play Testing now ships preflight validation, diagnostics, measurement,
  prompt-contract, risk-map, and eval-authoring support for play hardening.
- The Alexandria plugin now includes Damien/demo station skills for demo thesis,
  story spine, demo path, and demo video preparation.
- Added the Damien agent registry and viewer support for browsing agent context
  alongside the Alexandria library.
- Added the stable Big Edit playbook and runtime methodology notes for
  from-scratch Studio play authoring.

### Changed
- Frame the Problem now uses the interactive Riff workflow in place of the
  earlier 9-move pipeline, with deliberate node fidelity and revised prompts.
- Play testing now treats build validity as a real Fabro validation gate and
  adds studio-to-plugin conformance checks for shipped play assets.
- AX and viewer runtime support now expose richer Studio APIs, agent metadata,
  play state, and project-state surfaces needed by the new Studio views.
- Public release guidance now requires creating the public
  `GetAlexandria/alexandria` GitHub Release in addition to the internal release.

### Fixed
- Tightened the remaining `ax2` to `ax` naming cleanup in Studio placeholders,
  parser paths, and conformance checks.
- Hardened local Fabro restart and notification behavior to avoid active-run
  interruptions and noisy notification loops.
- Corrected stale Studio imports and play-testing risk-map semantics so
  preflight and diagnostics reflect the current viewer/runtime package names.

## [0.12.0] — 2026-06-16

### Added
- **Alexandria Next is now Alexandria.** The rewrite replaces the old public
  Alexandria line as the sole shipped CLI, plugin, viewer, installer, and
  release payload.
- The canonical `ax` CLI now carries the Alexandria Next runtime: project
  initialization, local state/event inspection, managed Fabro startup, play
  execution, Raven Vision onboarding, source intake, host monitor integration,
  doctor checks, upgrade support, and viewer launch commands.
- The canonical plugin now ships the event-log monitor, `ax-start`, Raven Vision
  drafting/elicitation skills, source-assessment workflow, and the plugin-side
  monitor wrapper needed by the local runtime.
- The canonical viewer now ships the Alexandria Next application shell,
  library browser, Studio views, Raven Vision surfaces, runtime client, and
  bundled visual assets.

### Changed
- Renamed the former Next workspaces into the release workspaces:
  `packages/ax-next` became `packages/ax`,
  `packages/alexandria-next-plugin` became `packages/alexandria-plugin`, and
  `packages/viewer-next` became `packages/viewer`.
- The public CLI binary is `ax`; the former `ax2`/`ax-next` naming is removed
  from the shipped artifact names, package names, build metadata, and user
  documentation.
- The public plugin identity is `alexandria`; the marketplace now exposes one
  local plugin source at `./alexandria` instead of parallel legacy and Next
  plugin entries.
- The installer is back to `install.sh` and installs a single plugin, `ax`
  binary, and Fabro sidecar from root release downloads.
- Release publishing now produces one set of public artifacts:
  `alexandria-plugin-v*.tar.gz`, `ax-v*-<platform>.tar.gz`,
  `fabro-v*-<platform>.tar.gz`, `latest-version.txt`, and `install.sh`.
- Site release publishing now updates only the canonical public install,
  download version, changelog, and version metadata surfaces.
- The public README and package docs now describe the Alexandria Next behavior
  as the current Alexandria product rather than as a parallel preview.

### Removed
- Removed the legacy Alexandria CLI, plugin payload, viewer implementation,
  plugin commands, eval harness, release QA harness, and old package docs.
- Removed `install-next.sh`, the Alexandria Next deployment workflow, and the
  separate Next release runbook.
- Removed the two-channel release topology and all public-repo sync behavior
  that copied both legacy Alexandria and Alexandria Next payloads.
- Removed stale verification artifacts for the pre-release Next line.

## [0.11.0] — 2026-05-04

### Added
- `ax cards list` now inventories Alexandria library cards with table and JSON
  output.
- `ax cards list --summary` now reports card counts by type and layer.
- `ax cards list --type`, `--layer`, and `--area` now filter card inventory
  output. Type and layer filters are case-insensitive.
- `ax config show` now prints the active Alexandria configuration, with JSON and
  summary output modes.

### Changed
- Card inventory output now includes parsed frontmatter metadata needed for area
  filtering.
- Manifest dissolution planning docs now keep `area` as the transitional
  coverage field and defer Sam-authored area population to a later slice.

### Removed
- The retired `ax initialize` CLI subcommand has been removed from the public
  command surface.

## [0.10.0] — 2026-04-24

### Changed
- **Breaking:** All user-invocable slash commands now use the `ax-` prefix. `/alexandria:library` → `/ax-library`, `/alexandria:plan` → `/ax-plan`, `/alexandria:brief` → `/ax-brief`, `/alexandria:sync-tickets` → `/ax-sync-tickets`, `/alexandria:upgrade` → `/ax-upgrade`.
- Four previously top-level skills (`revise-plan`, `complete-plan`, `implementation-planning`, `context-briefing`) now ship as part of the bundled plugin payload, so external users get the full planning surface. `/ax-revise-plan` and `/ax-complete-plan` are now first-class user commands.
- `implementation-planning` renamed to `ax-plan`; `context-briefing` renamed to `ax-brief`.
- Agent resource packs (conan, raven, sam, solomon, initialize) keep their bare names — they are not user-invocable slash commands.

### Migration
- Update muscle memory or scripts referencing `/alexandria:*` to the `/ax-*` equivalents.
- Run `/ax-upgrade` (or `ax update`) to pull the new plugin payload.

## [0.9.4] — 2026-04-23

### Added
- New public `ax update` command for in-place Alexandria upgrades that refresh both the plugin payload and the installed `ax` binary

### Fixed
- `ax update-check` no longer caches stale `up_to_date` results, so freshly shipped releases show up immediately
- Upgrade docs and the bundled upgrade skill now describe the real supported in-place update path instead of sending users through setup-only or manual flows
- Shared release-install logic now hardens plugin/binary replacement during setup and update flows

## [0.9.3] — 2026-04-22

### Fixed
- `ax setup` now defaults to the R2-backed Alexandria downloads host, so standalone setup no longer downloads HTML and fails archive extraction
- Autonomous build pipeline initialize flows now keep the corrected AI mode labeling split between product decisions and implementation autonomy
- Scoreboard derivation now attributes cards to the correct knowledge area
- Conan now type-audits sections before grading and marks obvious type mismatches as `UNGRADED — RETYPE REQUIRED`

### Changed
- The initialize engine now runs from the checked-in TypeScript implementation used by `ax initialize`, reducing drift between runtime logic and maintainer docs
- Release QA coverage now includes fresh-install and reinstall scenarios exercised through the real installer path

## [0.9.2] — 2026-04-20

### Fixed
- Release downloads no longer go through Cloudflare Pages, avoiding the 25 MiB
  asset limit that blocked `0.9.1` site deployment
- The release workflow now installs Bun before publishing download artifacts to
  R2

### Changed
- Alexandria release tarballs now publish to `downloads.getalexandria.ai`
  through Cloudflare R2
- The Alexandria site release step now publishes only `install.sh`,
  `latest-version.txt`, and changelog/version metadata to the site repo

## [0.9.1] — 2026-04-20

### Fixed
- Public release sync source now preserves the correct `getalexandria.ai` install/discovery surface
- Installer compatibility aliases for `CONTEXT_LIBRARY_VERSION` and `CONTEXT_LIBRARY_ALEXANDRIA_URL`
- Release docs now describe the current Alexandria public download surfaces and local tarball validation path

### Changed
- Added deterministic installer coverage for the legacy compatibility env vars before future public syncs
- Prepared the repo-split release machinery for a patch release validation pass

## [0.9.0] — 2026-04-17

### Added
- Hard cut-over to the new Alexandria release topology: `GetAlexandria/alexandria-internal`,
  `GetAlexandria/alexandria`, and `getalexandria.ai`
- Public payload sync from the internal repo into the public repo
- Public issue templates and issue-only public repo surface
- Release build scripts for public plugin payloads, `ax` binaries, and site download publishing
- Release QA harness for staged plugin/binary artifact verification

### Changed
- `ax` is now the canonical public CLI surface
- Public install no longer depends on shipped source or Bun after installation
- Product agents and skills now call `ax` instead of the old `alxndr` / standalone product command mix
- Installer and marketplace metadata now point at the GetAlexandria org/domain structure

### Notes
- Release evals are not auto-run in the release workflow; they remain a human release gate based on prior feature coverage
- The legacy `sociotechnica-org/alexandria` repo now carries a cut-over notice to the new surfaces

## [0.8.4] — 2026-04-08

### Fixed
- Eval CLI and harness root resolution for source-mode runs in maintainer checkouts
- Raven handoff/tier signaling and card-write guidance that caused structural eval failures
- Sam and Conan eval prompt/config regressions that left `create-cards` and `surgery` failing

### Changed
- Refreshed Raven, Sam, and Conan eval baselines after the post-`0.8.3` reruns
- Tightened Raven structural checks for handoff detection, evidence-tier signaling, and card-write rejection

## [0.8.3] — 2026-04-07

### Added
- **Viewer dashboard and navigation** — dashboard overview, sidebar directory
  tree, linked plan detail viewer, and implementation plan routes
- **Viewer file watching** — live reload on library changes with static build
  checks
- **Alexandrian viewer theme** — styled viewer matching Alexandria visual
  identity
- **Library structural pipeline** — Raven composes card handoffs with library
  structure awareness, Sam validates card paths against structural reference,
  Nit structural validation gate before Conan grading, structural pre-check
  gate in Conan grading skill and grade CLI (`--library` flag)

### Fixed
- Session-start reading plugin files instead of project files (token waste)
- Tarball install broken by workspace lockfile mismatch
- Viewer plan path and heading regressions
- Queued viewer watcher reloads
- Expert calibration fallback and scoreboard exception handling

### Changed
- Setup no longer symlinks product skills (Claude plugin discovery handles it)
- Tarball build preflight now checks for `sed` dependency

## [0.8.2] — 2026-04-03

### Added
- **Viewer wikilink rendering** — card content now renders `[[wikilinks]]` as
  navigable links in the viewer
- **Five-dimension viewer card layout** — cards display all five knowledge
  dimensions in the viewer UI
- **Viewer library card content collection** — Astro content collection wired
  to library cards for the viewer workspace
- **Viewer shared graph parser** — viewer workspace connected to the shared
  graph parser for consistent graph traversal

### Fixed
- Setup script fix for clean installs

## [0.8.1] — 2026-04-03

### Added
- **Alexandria Viewer** — Astro workspace scaffold and `alexandria-viewer` CLI
  for browsing the knowledge graph locally
- Portable core + platform adapters spike artifacts (#161)

### Changed
- Decomposed wizard SKILL.md from 1193-line monolith into focused reference
  files (expert calibration, greenfield, inference, configuration questions)
- Wizard refactor review pass — tightened language, fixed cross-references

### Fixed
- Bun type resolution for clean installs
- LIB2-009 smoke test blocker record and findings

## [0.8.0] — 2026-04-03

### Added
- **Phase 1: Raven-Voiced Wizard** — rewrote the wizard skill with Raven's
  conversational voice, greenfield fast-lane for early-stage products,
  inference-before-asking on configuration questions, and expert calibration
  inline guidance
- **Phase 2: Raven Orchestrates the Wizard** — Raven gets a wizard-mode job
  with `/library` entry point, scoreboard derivation and ASCII renderer,
  session-start procedure, expert calibration reference skill, Raven-to-Sam
  artifact delegation, and greenfield-to-brownfield transition handling
- `/complete-plan` skill for closing out executed implementation plans with
  completion status, execution decisions, and retrospective
- `/revise-plan` skill for revising existing plans when re-planning triggers fire
- `/sync-tickets` skill for syncing plan tickets to GitHub issues from within
  a conversation
- Raven gains Agent dispatch and Write capabilities for wizard-mode orchestration
- Scoreboard ASCII renderer with Foundation/Core/Amplifier buckets and five
  fill states (0/25/50/75/100%)
- Skill Naming Convention decision card formalizing short `name:` fields with
  plugin auto-namespace

### Changed
- Skill names renamed to short forms (`wizard`, `plan`, `brief`, etc.) — Claude
  Code auto-prefixes as `/alexandria:<name>`
- Planning skill uses AskUserQuestion for interactive choices instead of
  inferring from context
- Eval artifacts migrated from `context-library/` to `alexandria/` paths
- Release skill moved to contributor workflows (not part of plugin surface)
- Surgery plans are now transient (not checked into the repo)

### Fixed
- Sync-issues same-batch dependency resolution for tickets created in one run
- Sync-issues cross-plan matching when multiple plans share ticket ID prefixes
- Stale revise-plan archive reference
- Skill rename eval routing after short-name migration

## [0.7.0] — 2026-04-02

### Changed
- Renamed Context Library to Alexandria across the product, docs, contributor
  workflows, plugin metadata, install surfaces, and release artifacts
- `alexandria` is now the primary runtime/install identity, including the main
  CLI wrappers, plugin paths, state directory, and hosted documentation path
- Kept compatibility aliases for legacy `context-library` command names and
  related contributor setup surfaces during the transition

### Added
- New primary `bin/alexandria-*` command entrypoints and Alexandria-named
  distribution artifacts
- `docs/alexandria/` as the canonical documentation root for plans, assessments,
  and upgrade guidance

### Notes
- Post-merge eval follow-up remains tracked in issue `#201`
- Two accepted operational follow-ups from the rename rollout remain deferred to
  deployment/release handling: legacy plugin-directory replacement during
  upgrade and legacy tarball URL handling in update-check output

## [0.6.1] — 2026-04-02

### Fixed
- Build-tarball script failed in CI when given a relative output directory
- Setup installs only production dependencies (`--production --ignore-scripts`),
  no longer pulls devDependencies or runs husky in consumer installs
- Prettier and markdownlint no longer scan gitignored runtime directories

### Added
- `/release` skill for cutting releases
- `marketplace.json` in `.claude-plugin/` — installer auto-registers the plugin
  with Claude Code so it loads without `--plugin-dir`

## [0.6.0] — 2026-04-01

### Changed
- Completed the FEAT-018 cleanup on the Bun/TypeScript toolchain
  - removed the legacy Python graph library and shell test/helper suites
  - made `src/tools/eval-harness.ts` the canonical eval runner and
    `structural-checks.ts` the only active structural-check format
  - switched CI and contributor guidance to the Bun-native `bun run check` +
    `bun test` contract
- Clarified that the `bin/alexandria-*` bash files remain as intentional
  launcher infrastructure for compiled distribution, not legacy implementation code

## [0.5.0] — 2026-03-26

### Added
- **Progressive codebase discovery** — extends the wizard to scan codebases and discover
  product entities
  - Wizard routing: two yes/no questions before Step 1 determine input path (docs-only,
    code-only, both, neither) (DISC-001)
  - Scanner skill: Tier 1 file tree investigation with framework-agnostic heuristics
    (DISC-002), Tier 2 schema + route scanning for richer evidence (DISC-005)
  - Noun proposal dialogue: grouped conversational flow (summary → domain groups →
    confirm/rename/merge/split/reject → annotate) (DISC-003)
  - Gap analysis integration: confirmed entities pre-populate wizard-config.json as
    "present" for Step 5 (DISC-004)
  - Code walk: doc-vs-code divergence validation with three classification types
    (missing-from-code, missing-from-docs, evolved-past-docs) (DISC-006)
  - Eval structure for scanner metrics: token cost, escalation rate,
    self-consistency (DISC-007)
  - 10 QA tests for routing logic (DISC-008)

## [0.4.1] — 2026-03-26

### Changed
- **Wizard Q3 replaced with observable complexity checklist** (WIZ-001)
  - 6 binary signals replace abstract "how many features does a decision affect?"
  - Count maps to Low (0-1) / Moderate (2-3) / High (4+) before engine sees it
  - Engine algorithm, tier assignments, and all 36 configurations untouched
- **Q2 disambiguation bumps** (WIZ-002) — gentle nudge toward Moderate using
  observable signals (onboarding time for Low, competitor existence for High)
- **Risk narrative shown before Q2/Q3** (WIZ-003) — mode-specific failure scenario
  primes users after Q1, before calibration questions
- **when_missing text surfaced during gap analysis** (WIZ-004) — failure symptoms
  shown alongside each area during self-assessment; "Present" renamed to "Robust"
  as user-facing label (internal value unchanged)
- **Configuration confirmation signal** (WIZ-005) — "does this ring true?" check
  after Step 4 summary with reconfigure option

### Added
- **15 QA tests for checklist mapping** (WIZ-006) — count-to-level mapping,
  boundary cases, 5 calibration profiles (blog, fitness, SaaS PM, CRM, marketplace)

## [0.4.0] — 2026-03-27

### Added
- **Implementation planning skill** (`skills/implementation-planning/SKILL.md`)
  - 9-step conversational planning: goal → context briefing → outcomes → gap analysis →
    ticket decomposition → DAG → output → library updates → summary
  - Success Outcomes as first-class objects with scope tiers (Must/Should/Could)
  - Decisions resolved inline during planning conversation
  - Roller-skate staging, end-to-end first sequencing, vertical slicing principles
  - Library updates documented (not applied directly) — Conan/Sam process via surgery
  - Ticket format options: Minimal / Standard / BDD / Custom (configurable)
- **DAG tool** (`bin/alexandria-dag`) — deterministic dependency graph computation
  - Parse, validate, cycle detection, phase computation, critical path
  - Output: text, JSON, mermaid, validate mode
  - 24 unit tests
- **LLM-as-user adaptive eval mode** — persona-based Claude instance plays user for
  testing interactive skills
- **Judge reference + categorical rubric criteria** — calibrated quality evaluation
  for implementation plans (excellent/good/adequate/weak/poor per criterion)
- **Calibration plans** — good-plan (4.8/5) and mediocre-plan (1.5/5) for judge tuning
- **11 new context library cards** — eval harness system, DAG engine system, implementation
  planning capability, implementation plan structure, success outcome component,
  3 decisions, 2 lessons, 1 anti-pattern
- **14 existing card updates** — WHEN sections and WHERE relationships reflecting
  Releases 1+2

### Changed
- Step 8 rewritten: planner documents library updates in library-updates.md for
  Conan/Sam to process (planning and library are discrete systems)
- Eval harness supports three modes: single-prompt, multi-turn, adaptive

## [0.3.0] — 2026-03-26

### Added
- **Eval infrastructure** — reusable harness for testing conversational skills
  - `tests/run-eval.sh`: runner with multi-turn support via `claude -p --resume`
  - `tests/lib/judge.sh`: LLM-as-Judge framework with per-skill criteria
  - `tests/lib/structural-checks.sh`: pluggable deterministic check framework
  - `--compare` mode for regression detection against checked-in baselines
  - Auto-detects single-prompt vs multi-turn from `## Turn N` headers in inputs.md
  - Version hashing in run-metadata.json (git SHA, skill hash, eval case hash)
  - Historical run storage (`.gitignored`, baselines checked in)
- **Wizard eval cases** — three configurations with full multi-turn transcripts
  - Factory × High × High (22-area pool, mixed declarations)
  - No/Low AI × Low × Low (10-area pool, all absent)
  - Pair Programmer × High × Moderate (18-area pool, free-text notes)
  - All cases: 13/13 structural checks, 10-12/12 judge criteria
- **Test fixtures for Release 2** — seeded context libraries
  - TaskFlow: 5 sample cards (vision, entities, systems, decision)
  - Blank Slate: wizard config only (tests graceful degradation)
  - MediConnect: 5 sample cards (vision, persona, entities, anti-pattern, decision)
- **Implementation planning design** — complete plan for Release 2
  - Success Outcomes as first-class objects with scope tiers (Must/Should/Could)
  - DAG tool design (deterministic phase computation, mermaid output)
  - Research recommendations from 26 Fowler articles (24 recommendations triaged)
  - 15 implementation tickets
  - Companion skill designs: `/reassess-plan`, `/complete-plan`

### Changed
- Eval runner unit tests added to CI (15 tests)
- CLAUDE.md updated with merge policy (wait for all CI + Devin Review)

## [0.2.0] — 2026-03-23

### Added
- **Version tracking + upgrade path**
  - `VERSION` file (semver, synced with plugin.json)
  - `bin/alexandria-update-check`: checks GitHub for newer versions with smart
    caching (60min/12h TTLs), graceful network failure, semver comparison
  - `bin/alexandria-version`: prints current version
  - `skills/alexandria-upgrade/SKILL.md`: upgrade skill (git + vendored installs)
  - 18 unit tests for update check
- **Setup script** (`./setup`)
  - One-command install for Claude Code (plugin symlink + skill symlinks)
  - `--host` flag (claude default, codex/cursor stubbed for future)
  - `--uninstall` to clean up
  - Idempotent (safe to re-run), detects clone-into-plugins-dir path
  - 22 unit tests
- **ADR 001: dual-mode distribution** — plugin.json for Claude, symlinks for others
- **Wizard gap analysis engine** (issue #5)
  - Step 5: knowledge declaration, gap scoring, sequencing
  - Scoring: `tier_weight × gap_severity` / `tier_weight × freshness_penalty`
  - Edge cases: empty declaration, all-present, Foundation gaps with present Core
  - 18 unit tests (qa-gap-analysis.sh)
- **Wizard solicitation & output layer** (issue #7)
  - Step 6: impact statements, solicitation prompt selection with mode variants
  - Assessment document output following intake-output-template.md
  - 4 test suites in qa-solicitation.sh

### Changed
- Plugin version bumped from 0.1.0 to 0.2.0
- README updated with real install one-liner and Updating section
- CLAUDE.md expanded with structure map, dev workflow, testing section
- CI: fast tests (update-check, setup) run on every PR alongside plugin validation

## [0.1.0] — 2026-03-19

### Added
- **Initial plugin structure**
  - `.claude-plugin/plugin.json` manifest
  - Agents: Conan (librarian), Sam (scribe)
  - Skills: wizard (Steps 1-4), context-briefing, conan skills, sam skills
  - Templates: reference.md, library-readme.md
- **Wizard configuration engine** (issue #3)
  - 3-question configuration (AI mode, domain novelty, product complexity)
  - 22-category knowledge catalog with sensitivity profiles
  - Tier assignment engine (Foundation/Core/Amplifier/Deprioritized)
  - 36 configuration verification targets
- **Wizard engine data** — wizard-engine.yaml with pools, profiles, overrides
- **CI: plugin validation** — `claude plugin validate .` on every PR
