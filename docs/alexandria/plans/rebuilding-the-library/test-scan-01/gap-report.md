# Gap report — what code alone could not tell me (test-scan-01)

Code is excellent at *what exists* and *how it connects*. It is poor at *why*,
*for whom in market terms*, and *what's next*. Below is what a human must fill.

## 1. The WHY / intent behind almost everything
- **Why a knowledge graph at all** — the thesis ("keep your codebase aligned with
  product intent") is asserted once in `plugin.json` but never argued. The pain it
  solves, the buyer, the wedge: not in code. (The Vision-slot *prompts* describe a
  positioning *method* but not Alexandria's own answers.)
- **Why these five knowledge subjects** (vision/vocabulary/bets/guardrails/user-research)
  and **why these ten atomic-card categories** (rationale…economy). The taxonomies
  are load-bearing product decisions; code gives labels, not rationale.
- **Why Director-gating** — the Studio enforces human-confirmed stage advances and
  cites "a Director ruling," but the quality philosophy behind it is absent.
- **Why Raven-first / Vision-first onboarding** — clearly intentional sequencing; no
  reasoning in code.

## 2. The FUTURE / roadmap — I have none
- The [[System - Agent Bench]] shows five discipline seats (Engineering, Design,
  Product, Market, Research) with **only Product (Raven) unlocked** and a Damien
  coin alongside. Which agents ship next, and when, is unknowable from code — the
  locks are just `locked: true`.
- The **Ledger** stone is `enabled: false`. Is it deprecated, unbuilt, or coming?
  Code can't say.
- `vision-prerequisite-placeholder` as a PlayId and `SurfacePlaceholders` for some
  surfaces signal **work-in-progress**, but not direction.

## 3. Areas I suspect but could not confirm within budget
- **Info Hub** — I inferred an "intake/inspection" hub from the microscope icon +
  route + source-item model, but did not open its component body; its actual content
  may be partly placeholder. (medium confidence)
- **Constellation vs Folder** library modes — I confirmed both exist and their data,
  but did not read the Constellation layout in depth (topology vs. styling). (low risk)
- **Triggers** — mechanism is clearly present (domain + command + wake-subscriptions),
  but whether any triggers ship configured, and their product role, is unconfirmed.
- **Damien / demo branch depth** — confirmed the agent + skills exist; did not scan
  the demo-station internals. The Studio "Damien tab" content is unread.
- **Vocabulary / Bets / Guardrails / User-research** knowledge areas — present in the
  model as siblings of Vision, but only Vision has a built-out UI flow (slots,
  guidance). The others may be stubs. (medium confidence)

## 4. Naming/altitude calls I made that a human should sanity-check
- I named the app surface **"Alexandria Web App"** (code: `viewer`/`ViewerShell`).
- I named the `info-hub` stone **"Info Hub"** (its product label in fixtures) but its
  *purpose* is my inference.
- I treated **"factory run"** and **[[Entity - Play Run]]** as the same thing viewed
  at runtime vs. engine altitude; code links them via `fabroRunId` but a human may
  want them split or merged differently.
- I split **Agents** into their own category and put **Agent Bench** there as a
  `type: System` card — a deliberate altitude choice that could go either way.

## 5. Blindness compliance
- I read only `packages/**`, package READMEs, root `package.json`, and git. I did
  **not** open anything under `docs/`, root `CLAUDE.md`, or any
  vocabulary/data-model/plan file. No slips. (Three package-local `CLAUDE.md` files
  under `packages/**` were surfaced to me automatically as system context — I did not
  open them as files, and treated them as ships-with-code package guidance only.)
