# Source Ladder — Alexandria (the product)

Move: `survey` · Back-of-House Walk (EL2) · 2026-07-01
Manifest: `docs/alexandria/sweeps/alexandria-product/runtime/manifest.md`
Prior: `docs/alexandria/sweeps/alexandria-product/runtime/library-search-prior.json` (present — leads applied)

Read budget: **30 files** (cap 25–35). Tree walked paths-only across the four
source roots; excludes honored (`docs/alexandria/library/**`, ledger /
source-of-truth / .ax-runtime, `studio/**`, `repos/**`, deploy, `.fabro`,
host-* / plugin-runtime).

Prior leads applied as candidate terms: actors {director, AI colleague/agent},
vocabulary {play, playbook, ledger, trigger, context library, coin, living
business plan}, places {library, playbook, ledger, visual interface, coin},
unit lead {Play Run, low}, stateField lead {status, low}, shape lead
{event-driven loop around an immutable ledger, medium}. No fence prune removed
a file: the high-confidence fence entries (chaotic/midsized orgs, pile of
skills, prompt engineering) name product-positioning look-alikes, not source
paths.

## Tier 1 — cheap and broad (14)

| # | File | Why |
|---|---|---|
| 1 | `CLAUDE.md` (repo root) | Governance doc; the package map names the shipped product line and its boundaries (incl. the shipped-Fabro vs factory-Fabro trap). |
| 2 | `packages/alexandria-plugin/README.md` | The shipped payload's own description — skills, agents, workflows, monitors; playbook surface. |
| 3 | `packages/alexandria-plugin/CLAUDE.md` | Package governance: what the plugin owns (the play contract). |
| 4 | `packages/alexandria-plugin/.claude-plugin/plugin.json` | The plugin manifest — the registry of what actually ships. |
| 5 | `packages/alexandria-plugin/monitors/monitors.json` | Trigger/monitor registry — direct prior lead (`trigger`). |
| 6 | `packages/ax/README.md` | CLI product description — deterministic play support, ledger, runtime server. |
| 7 | `packages/ax/CLAUDE.md` | CLI governance: boundaries (plugin owns the play contract; CLI is deterministic support). |
| 8 | `packages/ax/src/cli/router.ts` | The command table — the product's verb map in one file. |
| 9 | `packages/ax/src/domain/state-events.ts` | The ledger event schema — prior leads `ledger`, shape, stateField live or die here. |
| 10 | `packages/ax/src/domain/plays.ts` | The play/playbook domain model — prior leads `play`, `playbook`, unit candidate. |
| 11 | `packages/ax/src/domain/triggers.ts` | Trigger domain — the prior's "triggers fire from the ledger" claim. |
| 12 | `packages/viewer/README.md` | The shipped product surface's own description. |
| 13 | `packages/viewer/src/components/library/viewer-routes.ts` | Route map of the visual interface — the product's places in one file. |
| 14 | `docs/alexandria/ops/product-hosting-runbook.md` | The one ops doc: how a hosted product instance is composed (Raven, freeq, volumes). |

## Tier 2 — confirmation (12)

| # | File | Why |
|---|---|---|
| 15 | `packages/ax/src/domain/state-store.ts` | How ledger events persist; immutability claim check. |
| 16 | `packages/ax/src/domain/raven-vision.ts` | Vision slot lifecycle — a known unit-with-states; onboarding chain. |
| 17 | `packages/ax/src/domain/library-catalog.ts` | The library card schema — what a card *is* in shipped code (code over plan-docs). |
| 18 | `packages/ax/src/domain/orchestration.ts` | Fabro-as-shipped-orchestrator — the in-scope half of the Fabro trap. |
| 19 | `packages/ax/src/domain/wake-subscriptions.ts` | Wake/subscription mechanics — how triggers reach agents. |
| 20 | `packages/ax/src/domain/agents.ts` | Agent/coin domain — prior actors lead. |
| 21 | `packages/ax/src/commands/play.ts` | Play run lifecycle from the CLI side — unit + stateField verification. |
| 22 | `packages/alexandria-plugin/workflows/frame-the-problem/legs.json` | A shipped workflow package — what a play looks like as machine contract. |
| 23 | `packages/alexandria-plugin/skills/ax-start/SKILL.md` | The entry skill — how a project becomes an Alexandria project. |
| 24 | `packages/alexandria-plugin/skills/frame-the-problem/SKILL.md` | Raven-mediated play procedure — the human-feedback loop language. |
| 25 | `packages/viewer/src/app/runtime/schemas.ts` | The viewer↔runtime API contract — what the surface reads. |
| 26 | `packages/ax/src/domain/library-draft-overlay.ts` | Draft patch log — the library's own draft→base lifecycle. |

## Tier 3 — leaf samples (4)

| # | File | Why |
|---|---|---|
| 27 | `packages/ax/src/domain/atomic-card-categories.ts` | The product's self-taxonomy — spoken card-type language. |
| 28 | `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` | One leaf prompt — verify the spoken language inside a play move. |
| 29 | `packages/viewer/src/components/library/vision/vision-slot-guidance.ts` | One leaf surface file — verify slot/vision vocabulary at the UI edge. |
| 30 | `packages/alexandria-plugin/agents/damien.md` | One shipped agent persona — verify the "AI colleague" language. |

(Also read pre-ladder, method-required, not counted against source signal:
`packages/ax/src/domain/library-search-prior.ts` — needed to validate the Move-1
prior; it doubles as evidence for the BoH/FoH handoff contract.)

## Deliberately skipped

- `docs/alexandria/plans/**` (~200 plan dirs) — director-flagged partly
  stale/AI-generated; code is canon. Zero plan docs on the ladder; any
  disagreement found elsewhere is a `docs_disagree` Hot Spot, and plans were
  not used as event sources.
- `docs/alexandria/library/**` — excluded by ruling; held as post-run coverage
  oracle.
- `studio/**` — federated PMS library; recorded as federation structure, never
  scanned.
- `docs/alexandria/` runtime-ish workspace content (`inbox/`, `lab/`,
  `updates/`, `sources/`, `signal-queue.jsonl`, `manifest*.md`,
  `source-assessment*`) — this repo's own live Alexandria instance state, not
  product source (the excluded ledger/source-of-truth siblings confirm the
  class).
- All viewer `*.test.ts*`, `*.stories.tsx`, fixtures, `dist/`, `public/`,
  Playwright config — rendering/test scaffolding, not domain signal.
- `packages/alexandria-plugin/agents/damien-resources/**`,
  `skills/demo-*/references/**` — persona reference bodies; one persona sample
  (#30) stands in.
- `packages/ax/e2e/**`, `tests/**`, `src/effects/**` beyond what tier-2 names —
  transport plumbing; domain files carry the language.
- `repos/**`, `packages/deploy/**`, `.fabro/**`, `packages/host-*/`,
  `packages/plugin-runtime/` — excluded by the manifest.
