# Raven Onboarding Experience

- Goal: create a Raven power-up experience in Alexandria Next where the user
  gives Raven source context, banks product knowledge, and unlocks useful plays.
- Prototype reference:
  `docs/alexandria/plans/canvas-library-spike/prototype/product-library/`
- Primary target: `packages/viewer-next`, backed by `packages/ax-next` runtime
  state and `packages/alexandria-next-plugin` play behavior.
- Current product decision: this is not a long wizard. The first useful Raven
  onboarding loop is a Home-driven `Power up Raven: Vision` flow that uses the
  shared Sources/Inbox substrate and then marks Vision as banked in Raven's
  Knowledge Bank.

## FEAT-002: Raven Quick Bar Opens From Coin

- Issue: GitHub #188, `[FEAT-002] Raven Quick Bar opens from the coin`
- Run ID: `01KSWX1ZNEVCN5D1DBVEE780J3`
- Product plan: `raven-onboarding-experience`
- Blocking context: FEAT-001 must have landed first, meaning Viewer Next has a
  real Home surface, a runtime-derived Raven connection state, and Raven remains
  on the bottom agent shelf rather than in top-level navigation.
- Goal: make Raven's coin open a Raven-specific Quick Bar that exposes
  `Knowledge Bank` and `Ping Raven`, closes as a transient surface, and never
  treats Raven or Knowledge Bank as a home/navigation overlay.

### Scope

This slice is a Viewer Next interaction slice. It does not introduce durable
Raven onboarding state.

In scope:

1. Open Raven's Quick Bar from the Raven coin on the bottom agent shelf.
2. Keep the Quick Bar visually attached to Raven's coin and agent shelf,
   following the existing coin, stone, and tray language.
3. Add a close affordance and click-outside behavior that close only the Quick
   Bar.
4. Include a `Knowledge Bank` action that routes to or opens a Knowledge Bank
   status placeholder.
5. Include `Ping Raven` as a disabled placeholder unless a current deterministic
   runtime/play contract already exists at implementation time.
6. Preserve Home and Library state when the Quick Bar opens or closes.
7. Keep Raven out of top-level navigation and avoid any logo-navigation or
   overlay-as-home model.
8. Add focused browser coverage for open, close, outside click, Knowledge Bank,
   disabled Ping Raven, and stable Home/Library behavior.

### Non-Goals

Out of scope:

1. Wiring real `Ping Raven` behavior or emitting ping ledger/runtime events.
2. Adding `agents.raven`, Knowledge Bank persistence, Vision slots, or Source
   of Truth state to `.alexandria-next/alexandria-config.json`.
3. Adding new AX2 commands, runtime mutation endpoints, or durable Raven state.
4. Implementing the full Knowledge Bank model beyond a status placeholder.
5. Implementing Vision onboarding, source intake, play unlocks, or Playbook
   routing.
6. Touching Alexandria 1 plugin, CLI, viewer, skills, or evals.
7. Expanding the unused `packages/viewer-next/src/app/agents/AgentBench.tsx`
   path unless the mounted route is intentionally migrated in the same change.

### Linked Product-Plan Summary

The broader Raven onboarding plan says Raven-specific actions live with the
agent shelf. Raven's coin is the agent affordance; Raven is not a top-level
navigation destination. Knowledge Bank is reachable from Raven's Quick Bar, but
it is not a parallel Library and it is not the way to navigate Home. `X` or any
close affordance should close transient panels only.

FEAT-002 implements that navigation rule before the heavier Raven onboarding
state lands. It should make the Quick Bar real and testable without pulling in
Vision slots, source intake, or Knowledge Bank persistence.

### Current Gap

Current mounted Viewer Next behavior lives under
`packages/viewer-next/src/components/library/`, with
`packages/viewer-next/src/pages/index.astro` mounting `LibraryBrowserApp`.

Current behavior after FEAT-001:

1. `LibraryBrowserApp` starts on Home and passes `ravenActionRequest` to
   `RavenBench`.
2. `RavenBench` can open `raven-sub-buttons` from the coin or Home CTA.
3. The tray currently contains prototype-style actions:
   `Raven's Knowledge Bank`, `Raven's Playbook`, and the connection-sensitive
   primary action.
4. Clicking a tray action only closes the tray; it does not route to Knowledge
   Bank or open a status surface.
5. There is no explicit Quick Bar close control and no click-outside close
   behavior.
6. There is no `Ping Raven` disabled placeholder.
7. Open/close state is local UI state today, which is correct for FEAT-002, but
   the plan must keep that boundary explicit so no ledger or config state is
   introduced for mere Quick Bar visibility.

### Architectural Boundaries

Viewer Next owns the Quick Bar presentation and transient open/close state.
Open/close should remain React UI state inside the mounted Viewer shell and
must not call AX2 mutation endpoints, append ledger events, or write config.

The Knowledge Bank action in this slice may update Viewer local navigation
state to show a status placeholder. That placeholder should communicate current
empty/locked status without claiming durable Raven knowledge has been banked.
It must not write `docs/alexandria/library/` or any Raven state.

AX2 remains the deterministic runtime and CLI boundary. Since FEAT-002 should
not change CLI behavior, black-box CLI verification is limited to proving
`ax2 inspect state --json` and the ledger summary are unchanged merely by
opening or closing the Quick Bar.

The Alexandria Next plugin owns guided Raven behavior. Because `Ping Raven` is
not wired in this slice, no plugin skill, play, or eval-backed behavior should
change. If implementation discovers and uses an existing ping play contract,
the plan must be revised to include the corresponding AX2/plugin tests and eval
impact before wiring it.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Viewer mounted app state | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `LibraryBrowserShell.tsx`, `types.ts` | Adds a Knowledge Bank status view or equivalent local surface while preserving Home/Library state |
| Raven agent shelf | `packages/viewer-next/src/components/library/RavenBench.tsx`, optionally a new `RavenQuickBar.tsx` beside it | Coin opens a named Quick Bar with close and outside-click behavior instead of prototype-only tray buttons |
| Knowledge Bank placeholder | New component near `packages/viewer-next/src/components/library/` | `Knowledge Bank` action opens a status/empty surface without durable Raven state |
| Viewer styles/assets | Existing Tailwind classes and `packages/viewer-next/src/styles/global.css` only if needed | Keeps the Quick Bar attached to the coin and shelf; no full-screen modal |
| Viewer e2e fixture/tests | `packages/viewer-next/tests/library-browser.spec.ts`, `tests/serve-viewer-fixture.ts` only if extra fixture endpoints are needed | Covers Quick Bar open/close, Knowledge Bank, disabled Ping, and stable Home/Library behavior |
| Viewer stories | `packages/viewer-next/src/components/library/RavenBench.stories.tsx` and optional Knowledge Bank story | Documents open, closed, and disabled Ping states for visual review |
| AX2 CLI/runtime | No implementation files expected | No durable event/config mutation for Quick Bar open/close |
| Alexandria Next plugin | No implementation files expected | No guided play or skill behavior change in this slice |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | None | No plugin eval rerun; run plugin validation only if implementation unexpectedly touches plugin files |
| Raven guided behavior | None; `Ping Raven` remains disabled unless a contract is already available | Document disabled Ping in the ticket result |
| AX2 CLI behavior | None; existing `ax2 inspect state --json` remains the CLI state projection | No new black-box CLI tests required unless AX2 changes; perform before/after CLI verification |
| Viewer user behavior | Raven coin opens/closes a Raven-specific Quick Bar and `Knowledge Bank` opens a status placeholder | Add Playwright coverage and update stories |

### Quick Bar Interaction Contract

The Quick Bar should be a transient, coin-attached surface.

Open behavior:

1. Clicking Raven's coin opens the Quick Bar.
2. Home's existing Raven CTA may also request the Quick Bar, but the coin path
   is the primary FEAT-002 acceptance path.
3. Opening the Quick Bar must not change `activeView` when the user is on Home
   or Library.
4. Opening the Quick Bar must not write config, append ledger events, or create
   runtime state.

Close behavior:

1. A visible close button with stable accessible text such as
   `Close Raven Quick Bar` closes the Quick Bar.
2. Clicking outside the Quick Bar and Raven coin closes the Quick Bar.
3. Pressing Escape should close the Quick Bar if focus is inside it.
4. Closing the Quick Bar must not navigate Home, close Library drawers, change
   Library/Home active state, or clear a Knowledge Bank surface that was opened
   separately.
5. Minimize/expand of the agent shelf may close the Quick Bar as part of shelf
   state, but must not navigate the app.

Actions:

1. `Knowledge Bank` closes the Quick Bar and opens the Knowledge Bank status
   placeholder.
2. `Ping Raven` is rendered disabled with clear disabled semantics and short
   status copy if no ping contract exists.
3. `Playbook` may remain omitted or disabled in FEAT-002 unless a locked
   Playbook affordance is already present; the issue requires `Knowledge Bank`
   and `Ping Raven`, not a Playbook route.

### Knowledge Bank Placeholder Contract

The placeholder should be a Viewer surface, not a modal and not a Library page.

Minimum content:

1. Heading or accessible region name `Knowledge Bank`.
2. Raven status/empty state that makes clear no subjects have been banked yet
   when Vision state is not implemented.
3. A `Vision` row or status item that can later connect to the durable Knowledge
   Bank subject model.
4. Future subjects shown as locked or unavailable if included.
5. No claims that library cards were generated or that source-of-truth state
   exists.

Navigation behavior:

1. Home and Library top-level navigation remain available.
2. The Alexandria wordmark may still return Home, but Knowledge Bank must not
   rely on the wordmark or an overlay `X` to behave like Home.
3. Closing the Quick Bar while Knowledge Bank is open leaves the Knowledge Bank
   surface open.

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves Raven coin opens the Quick Bar, close/outside click close only the Quick Bar, Knowledge Bank opens, Ping Raven is disabled, and Home/Library stay stable |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript drift in the mounted Viewer path |
| Viewer runtime unit tests | `cd packages/viewer-next && bun test src/app/runtime/client.test.ts` | Confirms existing runtime client behavior still decodes connection state used by the shelf |
| AX2 state guard | `cd packages/ax-next && bun test tests/state.test.ts` | Confirms the CLI state projection and ledger summary remain deterministic; no Raven state branch is required for FEAT-002 |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files are touched | The intended slice does not touch plugin payloads |

Manual CLI verification:

1. In an initialized Alexandria Next project, run `ax2 inspect state --json`
   before opening the Viewer and record `ledger.eventCount` plus whether
   `config.agents?.raven` exists.
2. Open and close Raven's Quick Bar through the coin and close affordance.
3. Run `ax2 inspect state --json` again.
4. Confirm `ledger.eventCount` did not change and no Raven config branch was
   created merely by opening or closing the Quick Bar.
5. If `Ping Raven` remains disabled, confirm no ping event is expected or
   emitted. If it is wired after plan revision, verify the documented
   ledger/runtime event from CLI inspection.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Viewer Next Quick Bar | Playwright browser coverage exists for Home, shelf, and Raven tray | Add deterministic e2e coverage for FEAT-002; no LLM eval needed | `cd packages/viewer-next && pnpm run test:e2e` |
| AX2 CLI/runtime | Bun tests cover state projection and ledger summaries | No implementation change expected; run state guard only | `cd packages/ax-next && bun test tests/state.test.ts` |
| Alexandria Next plugin skills/agents | Plugin validation and future play evals | No change in this slice | None unless plugin files are touched |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin behavior | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-002 because the slice changes a
deterministic Viewer interaction and does not change reusable agent, skill, or
eval-backed play behavior. If implementation wires a real `Ping Raven` play or
changes product-facing skill files, revise this section before merge and use
`EVALS.md` to choose the targeted rerun set.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The Quick Bar becomes another top-level navigation model | Keep all Raven actions inside the shelf Quick Bar and add tests that top nav contains no Raven tab |
| Close behavior accidentally navigates Home or clears Library state | Keep Quick Bar open state separate from `activeView`; add tests from Home and Library for close/outside click stability |
| Knowledge Bank placeholder implies durable Raven knowledge exists | Use status/empty copy and avoid writing config or source-of-truth state |
| Disabled Ping Raven is inaccessible or ambiguous | Render a real disabled button with stable label and disabled/status text; document disabled status in the ticket result |
| Implementation patches the unused app-shell bench instead of the mounted viewer | Patch `components/library/RavenBench.tsx` because `pages/index.astro` mounts `LibraryBrowserApp`; leave `src/app/agents/AgentBench.tsx` consolidation deferred |
| Quick Bar open/close emits ledger or config state by accident | Do not call runtime mutation APIs from open/close; perform before/after `ax2 inspect state --json` verification |
| Click-outside handling closes immediately when the coin is clicked | Use refs for the coin and Quick Bar region and test the coin toggle path |

### Implementation Steps

1. Confirm FEAT-001 behavior in the mounted Viewer path:
   `LibraryBrowserApp`, `LibraryBrowserShell`, `StoneTopBar`, and
   `RavenBench`.
2. Add a `knowledge-bank` view or equivalent local surface type in the mounted
   library shell state.
3. Add a Knowledge Bank status placeholder component with empty/locked states.
4. Refactor the Raven tray into a named Quick Bar component or tighten
   `RavenBench` in place with explicit action definitions.
5. Wire Raven coin click to open/toggle the Quick Bar while preserving
   `aria-expanded` and `aria-controls`.
6. Add `Knowledge Bank` and disabled `Ping Raven` actions with stable accessible
   labels.
7. Wire `Knowledge Bank` to close the Quick Bar and open the Knowledge Bank
   placeholder without writing runtime state.
8. Add close button, Escape handling, and outside-click handling scoped to the
   Quick Bar and coin.
9. Update Viewer e2e tests for coin open, close affordance, outside click,
   Knowledge Bank routing, disabled Ping Raven, no Raven top-level nav, and
   Home/Library stability.
10. Add or update Storybook stories for closed, open, connected/disconnected,
    and disabled Ping states if stories are maintained for the touched
    components.
11. Run deterministic verification commands and record that `Ping Raven` is
    disabled in the implementation result unless a revised plan wires it.

### Acceptance / Exit Criteria

1. Clicking Raven's coin opens Raven's Quick Bar.
2. The Quick Bar includes `Knowledge Bank`.
3. The Quick Bar includes `Ping Raven` as either wired behavior or a clearly
   disabled placeholder; this slice expects the disabled placeholder.
4. Clicking `Knowledge Bank` opens or routes to a Knowledge Bank status
   placeholder.
5. The close affordance closes the Quick Bar only.
6. Clicking outside closes the Quick Bar only.
7. Opening or closing the Quick Bar from Home leaves Home active.
8. Opening or closing the Quick Bar from Library leaves Library active and does
   not close unrelated Library UI.
9. Raven remains absent from top-level navigation.
10. Quick Bar behavior does not rely on logo navigation or an overlay-as-home
    model.
11. Opening and closing the Quick Bar emits no durable Raven state and no ledger
    events.
12. Viewer e2e coverage proves the required interaction paths.

### Deferred Follow-Ups

1. Wire real `Ping Raven` behavior through a documented play/runtime contract
   and add CLI ledger verification for the emitted event.
2. Replace the Knowledge Bank placeholder with durable Raven Knowledge Bank
   state after the Vision/source-of-truth slices land.
3. Add Vision onboarding entry points from Knowledge Bank once FEAT-003 and
   later source-intake work are ready.
4. Compute Playbook unlocks from banked Knowledge Bank subjects.
5. Consolidate the mounted `components/library` shell and the newer
   `src/app/*` shell paths when the product route architecture is ready.

## FEAT-003: Vision Onboarding Supports Manual Slot Review

- Issue: GitHub #189,
  `[FEAT-003] Vision onboarding supports manual slot review`
- Run ID: `01KSX1WJWS9JJQ5F14EJ802CYQ`
- Product plan: `raven-onboarding-experience`
- Outcome: O-2, must tier
- Blocked by: FEAT-001
- Blocks: FEAT-004, FEAT-005, FEAT-007
- Primary surfaces: `packages/ax-next` and `packages/viewer-next`

### Goal

Build the Alexandria Next Vision onboarding workflow up to reducer-computed
`ready_to_bank`.

The user must be able to open `Power up Raven: Vision`, see nine Vision slot
cards from a static manifest, manually type or edit any slot, approve or skip
slots, reopen skipped slots by typing, and see exactly when `Bank Vision`
becomes available. Manual slot editing is a permanent collaboration capability,
not a fallback for missing Raven drafting.

Banking Vision itself, Source of Truth generation, shared source intake,
Raven-authored drafts, and durable Knowledge Bank `vision: banked` state are
deferred to later tickets.

### Scope

This slice must include all of the following:

1. AX2 Raven Vision state schema under the existing
   `.alexandria-next/alexandria-config.json` project config.
2. A static Vision slot manifest with nine slot definitions. The manifest must
   not be copied into user config.
3. A reducer for Vision onboarding events:
   `raven.vision.started`, `raven.vision.slot.updated`,
   `raven.vision.slot.approved`, and `raven.vision.slot.skipped`.
4. Reducer-computed Vision status:
   `not_started`, `in_progress`, and `ready_to_bank`.
5. Runtime endpoints for Viewer Next to start or reopen Vision and mutate slot
   state through the reducer.
6. Config persistence support for reducer projections, serialized with the
   existing runtime mutation semaphore.
7. `ax2 inspect state --json` projection fields that expose Vision status and
   slot statuses after runtime actions.
8. Ledger event validation and append behavior for the Raven Vision events.
9. Viewer Next runtime client/schema support for Vision state and mutations.
10. A mounted Viewer Next `vision-onboarding` view, reachable from the connected
    Home CTA `Power up Raven: Vision`.
11. The Vision onboarding surface with nine slot cards, manual text editing,
    approve, skip, skipped-slot reopen, status chips, inline errors, and a
    reducer-driven `Bank Vision` enabled/disabled state.
12. Web UI verification coverage, AX2 reducer/runtime/CLI tests, and focused
    Viewer runtime client tests.
13. A hard implementation exit rule: the ticket is incomplete until the mounted
    `packages/viewer-next` flow passes browser coverage for Home CTA routing
    and manual slot review. AX2-only reducer/runtime work cannot satisfy this
    ticket.

### Non-Goals

Out of scope for FEAT-003:

1. `raven.vision.banked` and actual banking behavior.
2. Source of Truth document creation or updates.
3. Durable Knowledge Bank `vision: banked` state.
4. Shared source intake, `sourcesPath`, source processing, or source summaries.
5. Raven-authored drafts, source-to-slot attribution, or LLM play execution.
6. Alexandria Next plugin skills, agents, workflows, or eval-backed Raven
   behavior. If implementation discovers a truly required plugin contract,
   stop and revise this plan before touching plugin files.
7. Alexandria 1 CLI, viewer, plugin, skill, or eval behavior.
8. Writing anything under `docs/alexandria/library/`.
9. Per-feature JSON files for Raven state.
10. Playbook unlocks or full Knowledge Bank replacement.

The `Bank Vision` button may become enabled when the reducer projects
`ready_to_bank`, but clicking it must not mark Vision banked in this slice. If a
click handler is implemented, it should show a non-mutating "banking comes
next" state or no-op guard that emits no banking event.

### Current Gap

Current mounted Viewer Next behavior lives under
`packages/viewer-next/src/components/library/`, with
`packages/viewer-next/src/pages/index.astro` mounting `LibraryBrowserApp`.

Current Viewer state:

1. `LibraryBrowserView` supports `home`, `library`, and `knowledge-bank`.
2. `AlexandriaHome` renders `Power up Raven: Vision` when connected, but the CTA
   opens Raven's Quick Bar rather than starting or reopening Vision onboarding.
3. `RavenBench` and `RavenKnowledgeBankStatus` are FEAT-002 surfaces. They do
   not know about Vision onboarding state.
4. Viewer runtime code decodes health, project state, events, and connections,
   but has no Vision schema or mutation operations.
5. The e2e fixture server has `/api/connections` and library endpoints only; it
   does not expose Vision start/update/approve/skip behavior.

Current AX2 state:

1. `AlexandriaNextConfig` contains `schemaVersion`, `workspace`, and optional
   `codex`; there is no `agents.raven` branch.
2. `deriveProjectState` returns config, workspace, ledger, inbox sources,
   triggers, play intents, and canvas projection; there is no Raven projection.
3. `ALEXANDRIA_STATE_EVENT_TYPES` does not include `raven.vision.*`.
4. The runtime server has generic `/api/state`, `/api/events`,
   `/api/connections`, library, cursor, and legacy ledger routes. There are no
   Raven mutation endpoints.
5. `ax2 inspect state --json` cannot show Vision status except by exposing the
   raw config after this branch is added.
6. Existing runtime mutations append ledger events under a semaphore, but there
   is no config-backed reducer mutation helper or atomic config write helper for
   active workflow projections.

The missing work is both backend and screen-level. A reducer/runtime slice
without `packages/viewer-next` does not satisfy FEAT-003.

### Architectural Boundaries

AX2 owns deterministic state, validation, reducer transitions, ledger events,
runtime endpoints, and CLI projection. Expected operational failures should
return structured CLI results or runtime JSON errors with stable status codes.
Follow existing Effect patterns in `packages/ax-next` and `repos/effect`.

Viewer Next owns presentation and user interaction. It should call local AX2
runtime APIs and decode responses with narrow Effect schemas in
`src/app/runtime/*`. Pure visual components should receive ordinary props and
callbacks, not Effect programs.

Viewer Next must render the slot cards from the runtime-provided manifest
projection. It may define narrow browser schemas and types for decoding that
manifest, but it should not maintain a second product slot manifest with labels
or purposes that can drift from AX2.

State stays in `alexandria-config.json`; do not add per-feature JSON files. The
current config key is `workspace`, not `workspacePath`; do not rename it in this
slice. Config parsing and serialization must preserve `codex` and future
optional branches.

Ledger events are audit history. Config stores the current projection. Runtime
mutation endpoints should append a validated event, run the reducer, persist the
new config projection, and return the updated Vision projection.

Config persistence for this slice should use the existing `FileSystem`
abstraction and write the full `alexandria-config.json` through a temporary file
plus rename or an equivalent existing atomic-write helper. The mutation path
must run under the runtime server's existing semaphore so overlapping slot
updates cannot interleave event append, reduction, and config persistence.

### Vision Slot Manifest

Use nine manifest records in this order:

| ID | Label | Purpose |
|----|-------|---------|
| `shift` | The Shift | What changed in the world |
| `person` | The Person | Who is exposed to the shift |
| `named-pain` | Named Pain | The pain the user can already name |
| `discovered-pain` | Discovered Pain | The pain recognized after the alternative exists |
| `inadequacy` | The Inadequacy | Why existing tools fail structurally |
| `mechanism` | The Mechanism | What this product does that resolves the failure |
| `felt-experience` | The Felt Experience | What life looks like when it works |
| `proof` | The Proof | What would be observed if the Vision is true |
| `refusal` | The Refusal | What the product will not be and why |

Implementation may include concise prompts, helper copy, and display ordering in
the manifest. Slot definitions are static product contract, not user data.
Config stores only per-slot state records keyed by manifest IDs.

### State Contract

Add compact Raven state to `AlexandriaNextConfig`:

```ts
interface AlexandriaNextConfig {
  schemaVersion: 1;
  workspace: string;
  codex?: AlexandriaCodexConfig;
  agents?: {
    raven?: RavenAgentConfig;
  };
}

interface RavenAgentConfig {
  onboarding: {
    vision: RavenVisionOnboardingState;
  };
  updatedAt: string;
}

interface RavenVisionOnboardingState {
  schemaVersion: 1;
  status: "not_started" | "in_progress" | "ready_to_bank";
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  startedAt?: string;
  updatedAt?: string;
}

interface RavenVisionSlotState {
  id: RavenVisionSlotId;
  status: "empty" | "needs_review" | "approved" | "skipped";
  text: string;
  updatedAt?: string;
  reviewedAt?: string;
}
```

State rules:

1. Missing `agents.raven` means Vision is `not_started` in the projection.
2. `raven.vision.started` initializes all nine slot records from the manifest
   with `status: "empty"` and `text: ""`.
3. Starting Vision when state already exists returns existing state and should
   not append duplicate `raven.vision.started` events.
4. `raven.vision.slot.updated` writes the supplied text exactly as provided,
   sets that slot to `needs_review`, updates `updatedAt`, and clears
   `reviewedAt`.
5. Updating a skipped or approved slot reopens it as `needs_review`.
6. `raven.vision.slot.approved` sets the slot to `approved` and records
   `reviewedAt`. The reducer may approve an empty slot; the
   `ready_to_bank` predicate separately requires at least one approved slot
   whose text is non-empty after trimming.
7. `raven.vision.slot.skipped` clears the slot text, sets it to `skipped`, and
   records `reviewedAt`.
8. After every start or slot event, the reducer recomputes Vision status:
   `ready_to_bank` when every slot is `approved` or `skipped` and at least one
   approved slot has text with `trim().length > 0`; otherwise `in_progress`.
9. The UI must never set `ready_to_bank` directly.
10. Parsing and serialization must preserve `codex` and any unrelated
    `agents` branches while updating `agents.raven`. The implementation should
    not drop known optional config branches during a Vision mutation.

### Event Payload Contract

Add four validated state event payload schemas and expose them through
`ax2 inspect events schema --json` with `additionalProperties: false`:

| Event type | Required payload fields | Notes |
|------------|-------------------------|-------|
| `raven.vision.started` | none | Runtime start should use a stable idempotency key such as `raven.vision.started` so retries do not duplicate the start event |
| `raven.vision.slot.updated` | `slotId`, `text` | `slotId` must be one of the nine manifest IDs; `text` must be a string and is stored exactly as supplied |
| `raven.vision.slot.approved` | `slotId` | `slotId` must be one of the nine manifest IDs |
| `raven.vision.slot.skipped` | `slotId` | `slotId` must be one of the nine manifest IDs |

Runtime endpoints should create these events with actor
`{ "kind": "user", "host": "viewer" }` for Viewer-initiated changes unless an
existing runtime actor helper provides a more specific validated actor. Request
bodies must not accept `status`, `readyToBank`, manifest labels, or timestamps;
those values belong to the reducer and projection.

### Runtime API Contract

Add local runtime endpoints under the existing runtime server:

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/raven/onboarding/vision` | Return the Vision projection and slot manifest; return `not_started` projection when config has no Raven branch |
| `POST` | `/api/raven/onboarding/vision/start` | Initialize Vision if missing, append `raven.vision.started`, and return the projection; reopen existing Vision without duplicate start event |
| `PATCH` | `/api/raven/onboarding/vision/slots/:slotId` | Validate `{ "text": string }`, append `raven.vision.slot.updated`, run reducer, and return projection |
| `POST` | `/api/raven/onboarding/vision/slots/:slotId/approve` | Append `raven.vision.slot.approved`, run reducer, and return projection |
| `POST` | `/api/raven/onboarding/vision/slots/:slotId/skip` | Append `raven.vision.slot.skipped`, run reducer, and return projection |

Endpoint behavior:

1. Unknown slot IDs return `400` with valid slot IDs listed.
2. Malformed JSON bodies return `400` with a structured runtime JSON error.
3. Mutating before Vision is started should return a structured `409`; only the
   start endpoint should create the initial `raven.vision.started` event.
4. Starting Vision when config already has Vision state returns the existing
   projection and does not append another start event.
5. If a previous start append is observed through idempotency but config was not
   yet persisted, the start endpoint should reduce and persist the existing
   start event before returning.
6. All custom Vision mutation endpoints run under the runtime server mutation
   semaphore.
7. Mutation responses return canonical reducer output, including the manifest,
   computed Vision status, `readyToBank`, and all slot states.
8. Runtime event subscribers should be notified after successful mutations if
   the existing stream support can do so without broad refactoring.
9. No endpoint should emit `raven.vision.banked` in this slice.
10. Successful mutations should persist the updated config projection before the
    response is returned, so a following `GET /api/state` or
    `ax2 inspect state --json` observes the same Vision state.

### CLI And State Projection

`ax2 inspect state --json` should expose Vision in a stable projection, not only
inside raw `config`.

Minimum JSON shape:

```json
{
  "raven": {
    "vision": {
      "status": "in_progress",
      "readyToBank": false,
      "slots": [
        {
          "id": "shift",
          "status": "needs_review",
          "text": "..."
        }
      ]
    }
  }
}
```

The exact shape may include counts, manifest labels, timestamps, or a
`slotCount` summary, but tests must pin the important fields:

1. `raven.vision.status`.
2. Per-slot `id`, `status`, and `text`.
3. `readyToBank` or an equivalent stable field derived from status.
4. Existing `config`, `workspace`, `ledger`, `inboxSources`, `playIntents`, and
   `canvas` fields still present.
5. Exit code `0` for initialized projects and existing error behavior for
   uninitialized or malformed state.

Human `ax2 inspect state` output may remain a compact summary or add a Raven
Vision line. If it changes, keep stdout/stderr separation and update black-box
tests for the human output contract.

### Viewer UX Contract

Home behavior:

1. When Raven is connected, `Power up Raven: Vision` calls the Vision start
   endpoint and routes to `vision-onboarding`.
2. If Vision already exists, the CTA reopens the existing Vision onboarding
   surface without resetting slots.
3. The disconnected `Connect Raven` CTA can keep the current Quick Bar behavior
   and must not start Vision.
4. If the start request fails, keep the user on Home, show an inline failure
   near the CTA, and do not open the Raven Quick Bar as a connected fallback.

Vision onboarding surface:

1. Add `vision-onboarding` to the mounted `LibraryBrowserView` union.
2. Render the screen inside the existing Viewer shell with the Raven bench still
   visible.
3. Render all nine slots from the runtime manifest in manifest order.
4. Each slot card shows label, helper purpose or prompt, current status, a text
   editor, `Approve`, and `Skip`.
5. Typing into an empty, approved, or skipped slot commits an update through the
   Viewer runtime client and refreshes from the reducer projection; the
   resulting status is `needs_review`.
6. Skipping clears the text in the UI because the reducer response clears it.
7. Typing into a skipped slot reopens it as `needs_review`.
8. `Bank Vision` is disabled unless the reducer projection status is
   `ready_to_bank`.
9. When `Bank Vision` becomes enabled, clicking it must not bank Vision yet.
10. If network or validation errors occur, show an inline error on the Vision
    surface and leave the last known reducer projection visible.

Typing persistence:

1. The UI may keep local text while a save is in flight, but status and
   `ready_to_bank` must be refreshed from runtime responses.
2. Use a short debounce and flush-on-blur or another bounded commit strategy so
   the ledger does not receive one event for every physical keystroke during
   normal typing.
3. Approve and skip actions must first flush any pending local text update or
   disable until the latest text save has settled, so users cannot approve or
   skip stale reducer text.
4. Tests should wait for the reducer-backed status update rather than assert an
   optimistic-only state.
5. The enabled state of `Bank Vision` should be derived from the latest runtime
   projection, not from local React-only slot inspection.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 config | `packages/ax-next/src/domain/config.ts`, `packages/ax-next/src/effects/project-state-loader.ts`, and focused tests | Adds optional `agents.raven.onboarding.vision` parsing, serialization, defaults, config write support, and preservation of existing branches |
| AX2 Raven domain | New focused domain module such as `packages/ax-next/src/domain/raven-vision.ts` | Owns manifest, state types, reducer, ready-to-bank computation, and validation helpers |
| AX2 events | `packages/ax-next/src/domain/state-events.ts`, `tests/events.test.ts` | Adds validated `raven.vision.*` event types and payload schemas |
| AX2 projection | `packages/ax-next/src/domain/project-state.ts`, `src/commands/state.ts`, `tests/state.test.ts` | Projects Raven Vision status and slots through `ax2 inspect state --json` and runtime state |
| AX2 runtime | `packages/ax-next/src/effects/runtime-server.ts`, runtime tests | Adds Vision read/start/update/approve/skip endpoints with serialized append/reduce/persist mutations and structured errors |
| Viewer runtime client | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decodes Vision manifest/projection responses and exposes Effect-backed read/start/update/approve/skip operations for screen hooks |
| Viewer mounted app | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `AlexandriaHome.tsx`, `LibraryBrowserShell.tsx`, `types.ts` | Adds `vision-onboarding` view and routes connected Home CTA to start/reopen Vision instead of opening only Raven's Quick Bar |
| Viewer Vision UI | New components near `packages/viewer-next/src/components/library/` | Renders runtime-manifest slot cards, manual edit with bounded saves, approve, skip, reopen, inline errors, and Bank Vision availability |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds in-memory Vision API fixture matching the reducer contract and browser coverage for FEAT-003 acceptance paths |
| Viewer styles/stories | Existing Tailwind classes, `global.css` only if needed, optional stories | Keeps Vision surface consistent with current Home/Knowledge Bank visual language |
| Alexandria Next plugin | No files expected | No guided play behavior changes planned for this slice |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | None expected | No skill eval rerun; run `cd packages/alexandria-next-plugin && pnpm run validate` only if plugin files are touched |
| `ax-next-start` skill | No instruction change expected | It already tells agents to inspect state with `ax2 inspect state --json`; new fields appear in that output |
| Raven guided behavior | None in this slice | Raven drafting, source processing, and banking plays are deferred |
| AX2 CLI behavior | `inspect state --json` gains Raven Vision projection fields while preserving existing fields and exit-code behavior | Add black-box tests for exit code and output fields |
| Viewer user behavior | Connected Home opens Vision onboarding; users can review slots manually and see reducer-driven Bank Vision availability | Add Playwright coverage for required user paths |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 reducer and event schema | `cd packages/ax-next && bun test tests/raven-vision.test.ts tests/events.test.ts` | Proves slot transitions, `ready_to_bank`, and ledger event validation |
| AX2 config/state CLI | `cd packages/ax-next && bun test tests/init.test.ts tests/state.test.ts` | Proves config compatibility, config persistence, labels not stored in config, and `ax2 inspect state --json` output fields and exit codes |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts tests/viewer.test.ts` | Proves start/update/approve/skip endpoints and runtime projection |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches domain and projection type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves Viewer Effect schemas and client operations decode Vision responses |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves connected Home CTA routing, nine-slot rendering, edit/approve/skip/reopen behavior, and reducer-backed Bank Vision availability |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the static viewer bundle used by fixtures can build |
| Plugin validation | `cd packages/alexandria-next-plugin && pnpm run validate` only if plugin files are touched | Required only when the Next plugin payload changes |

Manual verification:

1. Start from an initialized Alexandria Next project with an active plugin
   connection.
2. Open Viewer Next from Home.
3. Click `Power up Raven: Vision`.
4. Confirm the Vision onboarding view opens and renders nine slots.
5. Type into one slot and confirm it becomes `needs_review`.
6. Approve that slot and skip the other eight; confirm `Bank Vision` becomes
   enabled.
7. Skip a slot with text and confirm the text is cleared.
8. Type into the skipped slot and confirm it reopens as `needs_review` and
   `Bank Vision` disables again until reviewed.
9. After each action, run `ax2 inspect state --json` and confirm
   `raven.vision.status` and slot statuses match the UI.
10. Inspect `docs/alexandria/ledger/events.jsonl` or `ax2 inspect events list
    --json` and confirm applicable `raven.vision.*` events were appended.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Raven reducer/runtime | Deterministic Bun tests only | Add focused tests; no LLM eval needed | `cd packages/ax-next && bun test tests/raven-vision.test.ts tests/runtime-server.test.ts tests/state.test.ts` |
| Viewer Next Vision onboarding | Playwright coverage exists for Home, Raven shelf, and Knowledge Bank | Extend deterministic browser coverage | `cd packages/viewer-next && pnpm run test:e2e` |
| Alexandria Next plugin skills/agents | Plugin validation exists; Next Raven play eval coverage is not mature | No plugin/eval change expected in FEAT-003 | None unless plugin files are touched |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin behavior | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-003 as planned because this slice
changes deterministic AX2 runtime behavior and Viewer UI behavior, not reusable
agent, skill, or eval-backed play behavior. If implementation adds or changes
product-facing Raven skills, agents, or workflows, revise this section before
merge and use `EVALS.md` to choose a targeted Raven eval or create a new Next
Raven eval case.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Implementation repeats the canceled backend-only path | Treat Viewer Next `vision-onboarding` screen, Home CTA routing, and Playwright coverage as required exit criteria |
| `ready_to_bank` is computed in React instead of the reducer | Return canonical status from every runtime mutation and add reducer/runtime tests that assert the transition |
| Slot definitions leak into user config | Keep labels/prompts in a static AX2 manifest and test config stores only slot state |
| Config parsing drops existing `codex` or future fields | Add parse/serialize/mutation tests that preserve existing branches |
| Starting Vision resets user work or duplicates start events | Make start idempotent after the first initialization and test reopen behavior |
| Event append and config persistence drift apart on retry | Use the runtime mutation semaphore, a stable start idempotency key, and tests that assert mutation responses, `GET /api/state`, and `ax2 inspect state --json` agree after each endpoint |
| Text updates flood the ledger | Use bounded commits such as debounce plus blur flush and keep reducer tests independent of UI keystroke timing |
| User clicks Approve before a debounced text update is persisted | Flush pending text or disable review buttons until save settles; cover this in the Viewer workflow test |
| A skipped slot can remain silently bank-ready after editing | Updating a skipped slot must set `needs_review`; Playwright and reducer tests cover reopen disabling `Bank Vision` |
| `Bank Vision` accidentally performs later-ticket work | Do not implement bank endpoint or `raven.vision.banked`; tests should assert no banking event appears in FEAT-003 flows |
| Runtime and Viewer schemas drift | Runtime responses should carry the manifest and canonical Vision projection; add Viewer client schema tests and AX2 runtime endpoint tests with the same required fields |
| Work lands in the unmounted Viewer app path | Patch the mounted `LibraryBrowserApp`/`LibraryBrowserShell` path used by `pages/index.astro`; leave shell consolidation deferred |

### Implementation Steps

1. Add the AX2 Vision manifest and Raven Vision reducer domain module with slot
   IDs, state types, validation, initialization, and `ready_to_bank`
   computation.
2. Extend config parsing/serialization to preserve optional `agents.raven`
   state and unrelated known branches while keeping the current `workspace`
   key.
3. Add `raven.vision.started`, `raven.vision.slot.updated`,
   `raven.vision.slot.approved`, and `raven.vision.slot.skipped` to state event
   validation and schema discovery, including the payload contract above.
4. Add config write support and a config-backed reducer mutation helper so
   runtime mutations append events, reduce state, and save the updated config
   projection under the runtime semaphore.
5. Extend project-state projection and `ax2 inspect state --json` with stable
   Raven Vision fields.
6. Add runtime endpoints for Vision read/start/update/approve/skip, including
   invalid slot, malformed body, idempotent start, and not-started behavior.
7. Add focused AX2 tests for reducer transitions, config compatibility, event
   validation, runtime endpoints, and CLI output fields.
8. Add Viewer runtime schemas and client operations for Vision manifest,
   projection, start, update, approve, and skip responses.
9. Update `LibraryBrowserView`, `LibraryBrowserApp`, and `AlexandriaHome` so the
   connected CTA starts or reopens Vision and routes to `vision-onboarding`.
10. Build the Vision onboarding components with nine runtime-manifest slot
    cards, reducer-backed status rendering, manual text edit, approve, skip,
    skipped reopen, inline error handling, and `Bank Vision` availability.
11. Extend the Viewer e2e fixture with Vision API responses that mirror the AX2
    reducer contract closely enough for browser tests.
12. Add Playwright tests for the required Web UI acceptance paths, including the
    reviewer-required Home CTA path.
13. Run deterministic verification. Run plugin validation only if plugin files
    changed.

### Acceptance / Exit Criteria

1. `Power up Raven: Vision` opens the Vision onboarding surface from Home when
   Raven is connected.
2. The surface renders exactly nine slots from the static manifest.
3. Starting Vision initializes all nine slot records in reducer-backed state.
4. Typing into an empty, approved, or skipped slot sets that slot to
   `needs_review`.
5. Approving a slot sets it to `approved`.
6. Skipping a slot clears its text and sets it to `skipped`.
7. Typing into a skipped slot reopens it as `needs_review`.
8. `Bank Vision` is disabled until every slot is approved or skipped and at
   least one approved slot has non-empty text.
9. `Bank Vision` becomes enabled when the reducer projects `ready_to_bank`.
10. `ready_to_bank` is computed by the reducer, not toggled directly by the UI.
11. `ax2 inspect state --json` or runtime state exposes Vision status and slot
    statuses after each action.
12. Ledger events include `raven.vision.started`,
    `raven.vision.slot.updated`, `raven.vision.slot.approved`, and
    `raven.vision.slot.skipped` as applicable.
13. Focused AX2 tests prove reducer transitions, including `ready_to_bank`.
14. AX2 tests prove `raven.vision.*` event schema discovery and validation,
    including invalid slot IDs and excess payload fields.
15. Runtime tests prove start idempotency, structured error responses, and
    agreement between mutation responses, `/api/state`, and persisted config.
16. Viewer Next e2e tests prove the Home CTA path, nine runtime-manifest slot
    cards, manual slot review workflow, and skipped-slot reopen behavior.
17. Viewer Next e2e tests prove pending text cannot be approved or skipped as
    stale reducer state.
18. No Alexandria 1 surfaces are changed.
19. No library files are written as part of this ticket.
20. No slot labels, purposes, or prompts are persisted under
    `.alexandria-next/alexandria-config.json`; config stores slot state only.

### Deferred Follow-Ups

1. FEAT-004 or later: implement actual `Bank Vision`, `raven.vision.banked`,
   Knowledge Bank `vision: banked`, and Source of Truth generation.
2. Add Raven drafting from source material and confidence/scratch notes.
3. Add shared source intake and source processing once that slice is approved.
4. Add source-to-slot attribution and richer review history.
5. Add Playbook unlocks from banked Knowledge Bank subjects.
6. Create Next-specific Raven play evals when guided Raven behavior or plugin
   workflows land.
7. Consolidate the mounted `components/library` shell with newer `src/app/*`
   viewer architecture when that route architecture is ready.

## FEAT-004: Vision Source Intake Adds Real Source Items

- Issue: GitHub #190,
  `[FEAT-004] Vision source intake adds real source items`
- Run ID: `01KSX5VHA1EB084YWMW0P5ACFD`
- Product plan: `raven-onboarding-experience`
- Technical scope artifact:
  `docs/alexandria/plans/feat-004-vision-source-intake/plan.md`
- Outcome: O-2, must tier
- Blocked by: FEAT-003
- Blocks: FEAT-005, FEAT-006
- Base: FEAT-003 merged at `cc20edfca0aa689dfbd70aba895f5c946b6b2240`
- Primary surfaces: `packages/ax-next` and `packages/viewer-next`

### Goal

Add the Vision source strip and source intake MVP after the FEAT-003 Vision
slot-review baseline.

Users can add one file, one URL, or one typed note at a time from the top of
the Vision onboarding surface. Each intake creates a shared Alexandria
`SourceItem`, rewrites the shared source projection at `sourcesPath`, and
attaches the new source ID to Raven Vision. Adding sources must not change
existing Vision slot text or review status.

This section is additive to FEAT-003. Do not replace, shrink, or reinterpret
the broader `raven-onboarding-experience` plan to make this slice fit.

### Scope

This slice must include all of the following:

1. `sourcesPath` support in Alexandria Next config, defaulting to
   `.alexandria-next/sources.jsonl`.
2. A shared Alexandria `SourceItem` model in AX2. Do not create a
   `RavenSourceItem` model.
3. A source reducer that can rebuild the current `SourceItem` inventory from
   ledger events and rewrite `sourcesPath` atomically.
4. Ledger event validation for `source.added` and
   `raven.vision.source_attached`.
5. Raven Vision state support for `sourceItemIds`, with the IDs attached to
   `agents.raven.onboarding.vision`.
6. Runtime/API support for adding one file, one URL, or one typed note.
7. Captured originals stored under `<workspace>/sources/originals/`, which is
   `docs/alexandria/sources/originals/` for the default workspace.
8. Browser file uploads copied into `sources/originals/` before they become
   source items, so `sourcePath` points at a durable workspace file.
9. URL fetches saved as Markdown under `sources/originals/` before they become
   file-backed source items.
10. Typed notes saved as Markdown under `sources/originals/` before they become
    file-backed source items.
11. A Vision `Add sources` area at the top of the existing FEAT-003 Vision
    onboarding screen.
12. A source strip that renders the Vision-attached shared source items.
13. Reload persistence: attached sources remain visible after the viewer reloads.
14. Web UI verification and CLI/runtime evidence for every accepted intake path.

### Non-Goals

Out of scope for FEAT-004:

1. Source-code processing. The schema may include `kind: "source_code"`, but
   runtime intake and processing should not implement it here.
2. Folder expansion, repository scanning, or source-code directory ingestion.
3. Source processing summaries under `docs/alexandria/sources/processed/`.
4. `source.processing_started`, `source.processing_completed`,
   `source.processing_failed`, and `source.changed_detected` endpoint behavior.
5. Source deletion, removal from Vision, title editing, or source card actions.
6. Voice note and conversation capture.
7. Raven drafting Vision slots from sources. FEAT-005 owns Raven
   slot-by-slot collaboration.
8. Adding more sources during mixed slot review as a separate workflow proof.
   FEAT-006 owns the richer in-progress review cases.
9. Banking Vision, `raven.vision.banked`, Source of Truth generation, or
   Knowledge Bank `vision: banked`.
10. Source sliders, source-depth ratings, or a giant textarea with "one source
    per line" behavior.
11. Writes to `docs/alexandria/library/`.
12. Alexandria 1 CLI, viewer, plugin, skill, or eval behavior.

### Source Ownership Boundary

Sources are shared Alexandria state. Raven Vision references shared source
items by ID; it does not own the source inventory.

The source inventory belongs to the general Library/source inbox model and
must be usable by later agents and plays. Raven Vision stores only
`sourceItemIds` under onboarding state. The canonical `SourceItem` records live
in the shared projection file referenced by config `sourcesPath`.

The core `SourceItem` shape should stay compact. Original URL, capture type,
typed-note metadata, fetched timestamp, and similar capture metadata belong in
the generated Markdown file under `sources/originals/`, not in the
`SourceItem` record.

### Source State Contract

Use the shared source item shape from the broader plan:

```ts
interface SourceItem {
  id: string;
  kind: "file" | "source_code";
  title: string;
  sourcePath: string;
  pathType: "file" | "directory";
  status: "unprocessed" | "processing" | "processed" | "failed";
  addedBy: "user" | "agent";
  addedAt: string;
  updatedAt: string;
  contentHash?: string;
  latestSummaryPath?: string;
  latestSummaryExcerpt?: string;
}
```

MVP behavior:

1. File, URL, and typed-note intake all create `kind: "file"` source items.
2. Runtime-created source items use `pathType: "file"` in this slice.
3. New items start with `status: "unprocessed"`.
4. `source.added` carries enough information for the reducer to rebuild the
   item: source ID, kind, title, source path, path type, added-by value, and
   optional content hash.
5. The reducer sets timestamps from the event timestamp.
6. `sourcesPath` is JSONL with one JSON object per current source item.
7. Retries should avoid duplicate records through a stable source ID or
   idempotency key.

### Raven Vision Attachment Contract

Extend the FEAT-003 Vision state additively:

```ts
interface RavenVisionOnboardingState {
  schemaVersion: 1;
  status: "not_started" | "in_progress" | "ready_to_bank";
  sourceItemIds: string[];
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  startedAt?: string;
  updatedAt?: string;
}
```

State rules:

1. Missing `sourceItemIds` in FEAT-003-era config parses as `[]`.
2. `raven.vision.source_attached` appends the source ID if it is not already
   present.
3. Attaching a source updates Vision timestamps but does not alter slot text,
   slot status, reviewed timestamps, or `ready_to_bank` computation.
4. Attaching a source before Vision has started should return a structured
   runtime error, unless the implementation chooses an explicit combined
   "start then add" UI path. The existing Home CTA remains the normal Vision
   start path.

### Event Payload Contract

Add these validated event types with `additionalProperties: false`:

| Event type | Required payload fields | Notes |
|------------|-------------------------|-------|
| `source.added` | `sourceId`, `kind`, `title`, `sourcePath`, `pathType`, `addedBy` | Optional `contentHash`; status and timestamps are reducer-owned |
| `raven.vision.source_attached` | `sourceId` | Appends the shared source ID to Vision `sourceItemIds` |

The existing FEAT-003 `raven.vision.started` and slot event contracts remain
unchanged.

### Runtime API Contract

Add local runtime endpoints under the existing AX2 runtime server:

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/sources` | Return the shared source projection from `sourcesPath` |
| `POST` | `/api/sources` | Create one source item from one file, URL, or typed note |
| `POST` | `/api/raven/onboarding/vision/source-items` | Attach an existing shared source ID to Vision |
| `GET` | `/api/raven/onboarding/vision` | Return FEAT-003 Vision projection plus `sourceItemIds` and attached source rows |

Runtime behavior:

1. Each mutating endpoint validates input before side effects.
2. File upload accepts one file and copies it under `sources/originals/`.
3. URL intake accepts only `http:` and `https:`, fetches the URL with bounded
   timeout and response-size limits, and writes a Markdown capture under
   `sources/originals/`.
4. Typed note intake requires non-empty text and writes a Markdown capture
   under `sources/originals/`.
5. URL and note Markdown captures include capture metadata in the file itself.
6. A Vision add-source action may call create and attach separately or through
   a combined serialized helper, but successful Vision intake must append both
   `source.added` and `raven.vision.source_attached`.
7. After `source.added`, the source reducer rewrites `sourcesPath` atomically
   or through the existing safe-overwrite helper.
8. After `raven.vision.source_attached`, the Raven reducer persists updated
   Vision state without changing slot state.
9. Runtime mutation paths should reuse the existing mutation semaphore so event
   append, reducer updates, projection rewrite, and config persistence do not
   interleave with other local mutations.
10. Successful mutations notify runtime event subscribers if the existing SSE
    path supports it without broad refactoring.

### Viewer UX Contract

The mounted FEAT-003 Vision onboarding view gains a top source area.

Required behavior:

1. Show an `Add sources` area above the slot grid.
2. Provide explicit controls for file, URL, and typed note intake.
3. Intake is one-at-a-time. The user should not paste multiple sources into a
   single "one per line" textarea.
4. Do not introduce sliders, source-depth ratings, or similar subjective
   source controls.
5. After a successful add, show the created source in the Vision source strip.
6. After viewer reload, read runtime state and show the same attached sources.
7. Show source title, kind, path, and processing status at minimum.
8. Preserve the existing FEAT-003 slot cards, status chips, text editors,
   approve/skip behavior, and `Bank Vision` availability behavior.
9. If source add fails, show an inline error in the source area and keep the
   last known Vision projection visible.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 config and paths | `packages/ax-next/src/domain/config.ts`, `paths.ts`, `commands/init.ts`, `tests/init.test.ts` | Adds `sourcesPath`, source originals helpers, and init/default handling without dropping existing config branches |
| AX2 source domain | `packages/ax-next/src/domain/sources.ts` and focused tests | Adds shared `SourceItem` schema, source reducer, projection parse/serialize, content hashing, and atomic rewrite helpers |
| AX2 events | `packages/ax-next/src/domain/state-events.ts`, `tests/events.test.ts` | Adds `source.added` and `raven.vision.source_attached` validation and schema discovery |
| AX2 Raven Vision | `packages/ax-next/src/domain/raven-vision.ts`, `tests/raven-vision.test.ts` | Adds `sourceItemIds` and attach reducer behavior without changing slot state |
| AX2 projection and CLI | `packages/ax-next/src/domain/project-state.ts`, `effects/project-state-loader.ts`, `commands/state.ts`, `tests/state.test.ts`, `tests/cli.test.ts` | Exposes shared source items and Vision attached source IDs through runtime state and `ax2 inspect state --json` |
| AX2 runtime | `packages/ax-next/src/effects/runtime-server.ts`, `tests/runtime-server.test.ts` | Adds source read/create endpoints, Vision attach endpoint, source capture, projection rewrite, and structured errors |
| Viewer runtime | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decodes source item projections and exposes source create/attach operations |
| Viewer Vision UI | `packages/viewer-next/src/components/library/VisionOnboardingView.tsx` and small nearby components if needed | Adds source strip and one-at-a-time file/URL/note controls above existing slots |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds fixture source APIs and browser coverage for file, URL, note, reload, and slot preservation |
| Alexandria Next plugin | No files expected | No guided play behavior changes planned for this slice |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| Alexandria Next plugin skills | None expected | No plugin eval rerun; run `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files are touched |
| `ax-next-start` skill | No instruction change expected | It already tells agents to inspect state with `ax2 inspect state --json`; source fields appear there |
| Raven guided behavior | None in this slice | FEAT-005 and FEAT-006 build on attached source IDs |
| AX2 CLI behavior | `inspect state --json` gains source projection and Vision source ID fields while preserving existing fields and exit-code behavior | Add black-box tests for exit code and output fields |
| Viewer user behavior | Vision now creates and displays real shared sources | Add Playwright coverage for file, URL, note, reload, no-slider, and no-one-per-line paths |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 source/config/state | `cd packages/ax-next && bun test tests/init.test.ts tests/state.test.ts` | Proves `sourcesPath`, source originals paths, source projection, config compatibility, and runtime state output |
| AX2 event schema | `cd packages/ax-next && bun test tests/events.test.ts` | Proves new source and Vision attach events are valid and discoverable |
| AX2 Vision reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves attaching sources preserves slot text/status and appends IDs |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves file, URL, note, projection rewrite, originals writes, ledger events, Vision attachment, and structured errors |
| AX2 CLI black-box behavior | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves changed CLI output fields and exit-code behavior remain stable |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches domain, config, and projection type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves source and Vision projection schemas and request builders |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves file, URL, note, source strip, reload persistence, no sliders, no one-per-line textarea, and slot preservation |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` only if plugin files are touched | Required only when the Next plugin payload changes |

Manual verification:

1. Open Viewer Next with Raven connected and start or reopen Vision.
2. Add a file source and verify it appears in the Vision source strip.
3. Add a URL source and verify it appears as a file-backed source item.
4. Add a typed note and verify it appears as a file-backed source item.
5. Reload the viewer and verify all attached sources remain visible.
6. Confirm existing Vision slot text and status are unchanged after each source
   add.
7. Inspect `.alexandria-next/sources.jsonl` and verify one JSONL record per
   source item.
8. Inspect `docs/alexandria/sources/originals/` and verify file, URL, and note
   captures are stored there.
9. Inspect the ledger and verify `source.added` and
   `raven.vision.source_attached` events for each source added from Vision.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 source runtime and projection | Deterministic Bun tests cover config, events, runtime, and state projection | Add focused tests; no LLM eval needed | `cd packages/ax-next && bun test tests/init.test.ts tests/state.test.ts tests/events.test.ts tests/raven-vision.test.ts tests/runtime-server.test.ts` |
| Viewer Next Vision source strip | Playwright and runtime-client tests cover Home and FEAT-003 Vision paths | Extend deterministic browser/runtime coverage; no LLM eval needed | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin skills/agents | Plugin validation exists; no guided behavior changes planned | No action expected | None unless plugin files are touched |
| Alexandria 1 skills/evals | Existing eval suite covers old plugin behavior | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-004 as planned because this slice
changes deterministic AX2 runtime behavior and Viewer UI behavior, not reusable
agent, skill, or eval-backed play behavior. If implementation adds or changes
product-facing Raven skills, agents, or workflows, revise this section before
merge and use `EVALS.md` to choose a targeted rerun or create a new Next Raven
eval case.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Source state becomes Raven-specific | Name and implement shared `SourceItem` state under `sourcesPath`; store only IDs in Vision |
| Source metadata bloats core source records | Put URL/note/capture metadata in generated Markdown files under `sources/originals/` |
| Adding sources changes existing Vision slot state | Make attach reducer append IDs only; add reducer/runtime/e2e tests that assert slot text/status before and after |
| FEAT-003 configs fail to parse | Treat missing `sourcesPath` as default and missing `sourceItemIds` as `[]` |
| Projection writes race with slot updates | Reuse runtime mutation semaphore and atomic/safe-overwrite helpers for projection writes |
| File upload path is not durable | Copy uploaded bytes to `sources/originals/` and use that workspace path as `sourcePath` |
| URL fetch hangs or stores too much content | Restrict protocols, add timeout and response-size bounds, and fail before appending events when capture fails |
| Retried source create duplicates source records | Use stable source IDs or idempotency keys and test retry behavior |
| UI regresses into prototype sliders or bulk source input | Build explicit one-at-a-time controls and add e2e assertions that sliders and one-per-line text are absent |
| Source projection becomes stale after a failed rewrite | Keep ledger as source of truth and implement reducer replay for projection rewrite on subsequent mutations or repair paths |

### Implementation Steps

1. Add `sourcesPath`, source originals, and processed-source path helpers to
   AX2 path/config handling while preserving FEAT-003 config compatibility.
2. Update `ax2 init` to create `sources/originals/` and initialize or report
   `.alexandria-next/sources.jsonl`.
3. Add shared `SourceItem` schema, source reducer, source projection
   parse/serialize, hashing, and atomic rewrite helpers.
4. Add `source.added` and `raven.vision.source_attached` event validation and
   event schema discovery.
5. Extend Raven Vision state with `sourceItemIds`, parse FEAT-003 state as an
   empty list, and add attach reducer behavior.
6. Extend project-state and CLI projection with shared source items and Vision
   attached source IDs.
7. Add runtime source capture helpers for file upload, URL fetch-to-Markdown,
   and typed note Markdown creation under `sources/originals/`.
8. Add `GET /api/sources`, `POST /api/sources`, and
   `POST /api/raven/onboarding/vision/source-items`.
9. Update `GET /api/raven/onboarding/vision` projection to include
   `sourceItemIds` and attached source rows.
10. Add AX2 reducer, config, event, runtime, and CLI black-box tests.
11. Extend Viewer runtime schemas/client operations for sources and Vision
    attachment.
12. Add the Vision `Add sources` area and attached source strip above the
    existing slot grid.
13. Extend the Viewer fixture and Playwright tests for file, URL, note, reload,
    no-slider/no-one-per-line behavior, and slot preservation.
14. Run deterministic verification. Run plugin validation only if plugin files
    changed.

### Acceptance / Exit Criteria

1. Vision onboarding shows an `Add sources` area at the top.
2. The source UI supports one file, one URL, or one typed note at a time.
3. Adding a file creates a shared `SourceItem` in `.alexandria-next/sources.jsonl`.
4. Adding a URL fetches the URL, writes Markdown under
   `docs/alexandria/sources/originals/`, and creates a file-backed source item.
5. Adding a typed note writes Markdown under
   `docs/alexandria/sources/originals/` and creates a file-backed source item.
6. New source items are attached to
   `agents.raven.onboarding.vision.sourceItemIds`.
7. The Vision source strip shows attached sources immediately and after reload.
8. Existing Vision slot text and statuses are unchanged when sources are added.
9. No source sliders or "one per line" textarea are introduced.
10. `.alexandria-next/sources.jsonl` contains one JSONL record per current
    source item.
11. URL and note captures are Markdown files under
    `docs/alexandria/sources/originals/`.
12. Ledger events include `source.added` and
    `raven.vision.source_attached`.
13. Runtime/API tests prove source projection rewrite is atomic or
    safe-overwrite.
14. Web UI and CLI/runtime verification both pass.
15. No Alexandria 1 surfaces are changed.
16. No library files are written as part of this ticket.

### Deferred Follow-Ups

1. FEAT-005 Raven slot-by-slot collaboration from attached source items.
2. FEAT-006 adding more sources during mixed slot review states.
3. Source processing and summaries under
   `docs/alexandria/sources/processed/<sourceId>/<runId>.md`.
4. Source deletion/removal, source title editing, and source card actions.
5. Top-level Sources or Inbox destination outside Vision.
6. Source-code intake and processing.
7. Voice note and conversation capture.
8. Rich URL extraction, authenticated fetches, and readability-style Markdown
   conversion.
9. Vision banking and Raven Source of Truth generation.
10. Next-specific LLM eval coverage if future slices change Raven guided play
    behavior.

## FEAT-005: Raven Collaborates Slot-By-Slot From The CLI

- Issue: GitHub #191,
  `[FEAT-005] Raven collaborates slot-by-slot from the CLI`
- Run ID: `01KSXAB18FXXDVN9TDFMCDQHVB`
- Product plan: `raven-onboarding-experience`
- Outcome: O-3, must tier
- Blocked by: FEAT-003 and FEAT-004
- Blocks: FEAT-006
- Primary surfaces: `packages/ax-next`, `packages/viewer-next`, and
  `packages/alexandria-next-plugin`

### Goal

Add the narrow CLI/runtime path that lets Raven draft or revise exactly one
Vision slot at a time.

A Raven-authored slot update must reuse the same reducer-backed Vision state
contract as manual editing: append `raven.vision.slot.updated`, persist the
slot text, set only that slot to `needs_review`, preserve all other
slot/source state, and make the update visible in an already-open Viewer Next
Vision screen. Raven must then be able to read the latest projected state or
recent review events before deciding whether to write the next slot.

This slice is about the two-surface collaboration loop, not about a full
Raven LLM drafting play. If the final `raven-fill-vision-slots` play is not
ready, the implementation should add the smallest deterministic AX2 command
that exercises the same runtime mutation and reducer behavior.

### Scope

This slice must include all of the following:

1. A deterministic AX2 command for one Raven Vision slot update, tentatively:
   `ax2 raven vision slot update --slot <slot-id> (--text <text>|--text-file <path>) [--idempotency-key <key>] [--json]`.
2. The command must run non-interactively, validate slot IDs before side
   effects, reject missing or conflicting text inputs, and use stable exit
   codes.
3. The command must use the local runtime path rather than writing
   `events.jsonl` or `alexandria-config.json` directly.
4. Runtime support for identifying the update actor as Raven, for example
   `{ "kind": "agent", "host": "claude-code", "name": "Raven" }`, while
   keeping existing Viewer updates as `{ "kind": "user", "host": "viewer" }`.
5. Runtime slot update behavior that appends `raven.vision.slot.updated`,
   reduces the event into config-backed Vision state, persists config, and
   returns the canonical Vision projection.
6. Preservation tests proving Raven updates do not reset approved, skipped,
   or already-needs-review slots and do not alter FEAT-004 `sourceItemIds` or
   attached source rows.
7. `ax2 inspect state --json` remains the primary projected-state read path
   Raven uses before each slot write and after user review.
8. `ax2 inspect events list --json --limit <n>` remains the raw feedback/audit
   path Raven can use to see user `raven.vision.slot.approved`,
   `raven.vision.slot.skipped`, and user edit `raven.vision.slot.updated`
   events.
9. Viewer Next must refresh an open Vision screen when a runtime project-state
   event arrives from a Raven slot update, so the written text appears without
   requiring a page reload or manual UI action.
10. Viewer Next must visibly render the externally updated slot as
    `needs_review` using the existing prototype-derived status treatment, and
    may add a subtle remote-write flash derived from the prototype's
    `vb-remote-write-flash` pattern.
11. The Alexandria Next plugin guidance must explain the slot-by-slot loop:
    inspect state, choose one slot, write one slot, stop for user review, then
    inspect state/events before continuing.
12. CLI/runtime, Viewer runtime/client, Viewer e2e, plugin validation, and
    deterministic preservation tests for the collaboration loop.

### Non-Goals

Out of scope for FEAT-005:

1. Bulk-filling all nine Vision slots.
2. Building the final `raven-fill-vision-slots` LLM play if a deterministic
   command can satisfy the ticket.
3. Source processing, source summaries, or source-to-slot attribution.
4. Banking Vision, `raven.vision.banked`, durable Knowledge Bank
   `vision: banked`, or Source of Truth generation.
5. New Vision slot statuses beyond `empty`, `needs_review`, `approved`, and
   `skipped`.
6. Storing per-slot author metadata in config unless implementation discovers
   it is required for the event contract. The ledger actor is enough for this
   slice.
7. A generic state-event replay framework for every future reducer-backed
   event. Keep this slice focused on the Raven Vision mutation path.
8. Changing Alexandria 1 CLI, viewer, plugin, skills, or evals.
9. Writing anything under `docs/alexandria/library/`.
10. Reintroducing prototype-only phase rails, source sliders, logo upload, or
    overlay-as-home behavior.

### Current Gap

Current AX2 and Viewer state after FEAT-003/FEAT-004:

1. `packages/ax-next/src/domain/raven-vision.ts` already defines the nine slot
   manifest, slot state, `sourceItemIds`, reducer transitions, and projection.
2. `packages/ax-next/src/domain/state-events.ts` already validates
   `raven.vision.slot.updated`, `raven.vision.slot.approved`, and
   `raven.vision.slot.skipped`.
3. `packages/ax-next/src/effects/runtime-server.ts` already exposes
   `PATCH /api/raven/onboarding/vision/slots/:slotId` plus approve/skip
   routes, but those mutation routes use a Viewer actor and are only surfaced
   through the browser runtime client.
4. Generic `ax2 inspect events append` can append validated events through the
   runtime, but it does not reduce `raven.vision.*` events into config-backed
   Vision state. Using it directly would leave projected state stale.
5. `ax2 inspect state --json` already exposes `raven.vision` and attached
   source rows, so Raven has a read path once mutations persist state.
6. Viewer Next currently updates `VisionOnboardingView` after its own runtime
   requests, but `LibraryBrowserApp` does not subscribe to
   `/api/events-stream`. A CLI-originated Raven update can be broadcast by the
   runtime and still not repaint the mounted Vision screen.
7. `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` tells
   agents to inspect state and run plays, but it does not describe the
   slot-by-slot Raven Vision collaboration loop or the one-slot update
   command.
8. `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`
   covers generic event-log wake handling, but not Vision review feedback.

The missing work is the Raven-facing mutation path plus live UI propagation.
The reducer itself should not need a semantic rewrite.

### Architectural Boundaries

AX2 owns deterministic command parsing, runtime calls, event validation,
state reduction, config persistence, and CLI output contracts. The command
should be modeled as an Effect program returning `CliResult`, following the
existing `commands/*`, `effects/runtime-client.ts`, and runtime-server
patterns.

The CLI must not define Raven's product strategy or decide every slot to fill.
It only provides a deterministic primitive: write this text to this slot.
Guided slot choice and drafting behavior belongs to the Alexandria Next plugin.

Runtime mutation code should factor the current Viewer slot update path so the
Viewer and CLI/Raven path share validation, append, reduction, persistence, SSE
broadcast, and projection return behavior. The actor and optional idempotency
key may differ by caller; the reducer result must not.

Viewer Next owns presentation and subscription-driven refresh. It should treat
runtime `project-state` SSE messages as canonical external state and update
the current Vision projection when `state.raven.vision` is present. Local
unsaved editor text should not be silently overwritten while the user is
typing; if a pending local edit exists for the same slot, keep the local edit
and surface a small inline conflict/error instead of discarding either side.

Alexandria Next plugin changes should be instructional and narrow. The plugin
can tell Raven how to use AX2 state and one-slot update commands, but this
ticket should not add a prompt-only bulk-fill workflow that bypasses runtime
state.

State remains in `.alexandria-next/alexandria-config.json`; source projection
remains at `sourcesPath`; ledger history remains append-only under the
workspace. Do not create per-feature JSON files.

### CLI Contract

Add a Raven-facing AX2 command with a stable non-interactive contract:

```bash
ax2 raven vision slot update \
  --slot shift \
  --text "The category changed shape." \
  --json
```

Text may also come from a file:

```bash
ax2 raven vision slot update \
  --slot shift \
  --text-file /tmp/raven-shift.txt \
  --idempotency-key raven:vision:shift:run-123 \
  --json
```

Required behavior:

1. `--slot` must be one of the nine manifest IDs and invalid input must list
   the valid IDs.
2. Exactly one of `--text` or `--text-file` is required. Empty text is allowed
   because the existing reducer stores text exactly as supplied and sets
   `needs_review`; the user can skip if it should clear.
3. The command must not prompt in TTY or headless use.
4. `--json` output must include at least: `slot.id`, `slot.status`,
   `slot.text`, `vision.status`, `vision.readyToBank`, runtime lifecycle, and
   enough ledger correlation to verify a `raven.vision.slot.updated` event.
   If the shared runtime endpoint cannot return an event ID without breaking
   Viewer clients, the command should report the mutation result and tests
   should verify the ledger separately.
5. Human output should be short and summary-first, for example slot ID,
   resulting status, Vision status, and runtime lifecycle.
6. Exit codes should match AX2 conventions:
   - `0` update accepted and projection returned.
   - `1` operational/runtime/project-state failure.
   - `2` invalid CLI input.
7. The command must call the local runtime via `withAlexandriaRuntime` or the
   same runtime-client path used by other AX2 commands, so an existing runtime
   is reused and a temporary runtime can be started for headless tests.

### Runtime Contract

Reuse the existing slot mutation route semantics:

| Method | Path | Behavior |
|--------|------|----------|
| `PATCH` | `/api/raven/onboarding/vision/slots/:slotId` | Validate text, actor, and optional idempotency key; append `raven.vision.slot.updated`; reduce/persist Vision; broadcast; return projection |

Runtime behavior:

1. Keep Viewer request compatibility: existing Viewer requests with
   `{ "text": string }` continue to use actor
   `{ "kind": "user", "host": "viewer" }`.
2. Allow the CLI/Raven path to provide a validated Raven actor and optional
   idempotency key without allowing arbitrary status, timestamp, manifest, or
   reducer-owned fields in the request body.
3. Validate Vision has started before appending. A Raven update before start
   returns structured `409` and does not append a slot event.
4. Unknown slot IDs return structured `400` with all valid slot IDs.
5. Successful Raven updates append exactly one
   `raven.vision.slot.updated` event.
6. The reducer updates only the targeted slot text/status/timestamps, clears
   that slot's `reviewedAt`, recomputes Vision status, and preserves all other
   slots plus `sourceItemIds`.
7. If an idempotency key is provided and the event already exists, the runtime
   must return the current projection without duplicating the event. It must
   still ensure config projection has been reduced for the event before
   returning.
8. After a successful append or idempotent replay, `/api/state`,
   `GET /api/raven/onboarding/vision`, and `ax2 inspect state --json` must
   agree on the Vision projection.
9. Runtime SSE subscribers receive both `state-event` and `project-state`
   messages for appended Raven slot updates, matching existing Vision mutation
   broadcast behavior.

Do not change approve/skip payloads for this ticket unless needed for actor
metadata. User review feedback is already visible through the existing
approve/skip events and projected slot statuses.

### Raven Feedback Loop

Raven's expected loop after this ticket:

1. Read current state:

   ```bash
   ax2 inspect state --json
   ```

2. Choose one slot whose current status and source context justify a draft.
3. Write exactly one slot:

   ```bash
   ax2 raven vision slot update --slot <slot-id> --text-file <draft> --json
   ```

4. Stop. Do not write another Vision slot until the user has had a chance to
   approve, skip, or edit.
5. Before continuing, read projected state again and, when needed, inspect
   recent events:

   ```bash
   ax2 inspect state --json
   ax2 inspect events list --json --limit 20
   ```

6. Treat `approved`, `skipped`, and user-authored `needs_review` slots as
   current user feedback. Do not reset them while drafting another slot.

This loop can be documented in the Next plugin now, even if the final Raven
play remains deferred.

### Viewer UX Contract

The FEAT-003/FEAT-004 Vision UI remains the same surface. FEAT-005 adds live
external update behavior:

1. With Vision open, a Raven CLI slot update should appear in the matching slot
   without a full page reload.
2. The slot status chip must show `Needs review`, and the card should keep the
   current dark/warm-walnut slate card treatment.
3. A subtle remote-write flash may be added to the changed slot, derived from
   the prototype `vb-remote-write-flash` pattern. The flash should use amber
   glow on slate, not a generic notification color.
4. Existing approved, skipped, and needs-review cards must retain their text
   and status unless the runtime projection changed that specific slot.
5. If the user clicks Approve after a Raven update, the updated text is
   approved and the status changes to `approved`.
6. If the user skips a Raven-written slot, the text clears and the status
   changes to `skipped`.
7. If the user manually edits a Raven-written slot, the same
   `raven.vision.slot.updated` reducer behavior applies and the latest text is
   visible to Raven through projected state/events.
8. If an external update arrives for a slot with an unsaved local edit, do not
   silently replace the textarea. Keep the user's local text, show a concise
   inline warning, and refresh cleanly after the local save/reload path
   resolves.
9. Do not add phase rails, source sliders, logo upload dependencies, or a
   generic admin/form layout. New visual elements should stay aligned with the
   prototype's slate plates/cards, amber/gold controls, Raven coin/bench, and
   compact slot/source review affordances.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 CLI router | `packages/ax-next/src/cli/router.ts`, `packages/ax-next/src/commands/raven.ts` or nearby focused modules, `packages/ax-next/README.md` | Adds a public deterministic `ax2 raven vision slot update` command without affecting Alexandria 1 |
| AX2 runtime client | `packages/ax-next/src/effects/runtime-client.ts` | Adds a typed client method for Raven slot updates through the local runtime, including runtime lifecycle metadata |
| AX2 runtime server | `packages/ax-next/src/effects/runtime-server.ts` | Factors Vision slot mutation so Viewer and Raven CLI updates share validation/reduce/persist/broadcast behavior with different actors |
| AX2 Raven domain | `packages/ax-next/src/domain/raven-vision.ts`, `tests/raven-vision.test.ts` | Adds preservation tests if existing reducer coverage does not already prove source IDs and unrelated slots survive Raven updates |
| AX2 event/state tests | `packages/ax-next/tests/events.test.ts`, `state.test.ts`, `runtime-server.test.ts`, `cli.test.ts` | Proves event actor/idempotency, projection agreement, CLI exit codes/output fields, and unrelated state preservation |
| Viewer runtime schemas | `packages/viewer-next/src/app/runtime/schemas.ts`, `client.ts`, `event-stream.ts`, `client.test.ts` | Decodes project-state messages carrying Raven Vision and supports app-level refresh from SSE |
| Viewer mounted app | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `VisionOnboardingView.tsx` | Subscribes to runtime project-state updates, refreshes open Vision projections, handles external updates and local-edit conflicts |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds fixture external Raven update and event-stream behavior plus browser coverage for open-screen Raven updates |
| Alexandria Next plugin skills | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`, `packages/alexandria-next-plugin/skills/alexandria-event-log/SKILL.md`, or a new narrow Raven Vision skill | Documents one-slot-at-a-time Raven behavior and how to read approve/skip/edit feedback |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `ax-next-start` skill | After startup, Raven can inspect `raven.vision`, attached sources, and use the one-slot update command when asked to collaborate on Vision | Update command examples and run plugin validation |
| `alexandria-event-log` skill | Treat Vision review events as feedback: inspect current state, do not bulk fill, and continue only from current projected state | Update common event handling notes and run plugin validation |
| Possible new Next Raven Vision skill | If added, it should be a narrow guided loop for one slot, not a bulk-fill play | Validate plugin and keep eval impact section updated before merge |
| AX2 CLI behavior | New mutation command with stable output and exit codes | Add black-box CLI tests for help, invalid input, success JSON, operational failure, and stdout/stderr separation |
| Viewer user behavior | Open Vision screen reacts to external Raven updates and lets the user approve/skip/edit those updates | Add Playwright coverage for the collaboration loop |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 Raven reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves Raven slot update sets only the target slot to `needs_review` and preserves approved/skipped/needs-review/source state |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves Raven actor/idempotency, ledger event append, projection persistence, SSE broadcast, and structured 400/409 errors |
| AX2 state and events | `cd packages/ax-next && bun test tests/state.test.ts tests/events.test.ts` | Proves projected state and event schemas expose the feedback Raven reads |
| AX2 CLI black-box behavior | `cd packages/ax-next && bun test tests/cli.test.ts` | Proves command help, exit codes, JSON output fields, invalid slot/missing text behavior, and stdout/stderr separation |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches command/runtime/domain type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves runtime schemas/client code decode project-state and Vision projections used by SSE refresh |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves an external Raven update appears in an open Vision screen, marks `needs_review`, and approve/skip feedback behaves correctly |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the mounted viewer bundle still builds for the fixture server |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required because this slice updates Next plugin guidance |

Manual verification:

1. Start from an initialized Alexandria Next project with FEAT-004 Vision source
   state available and Raven connected.
2. Open Viewer Next, start or reopen `Power up Raven: Vision`, and leave the
   Vision screen open.
3. From another shell or agent session, run
   `ax2 raven vision slot update --slot shift --text "A Raven draft." --json`.
4. Verify the open Viewer slot text updates and the slot is visibly
   `needs_review`.
5. Approve the slot in the UI and run `ax2 inspect state --json`; verify Raven
   can see `shift.status === "approved"`.
6. Run a Raven update for a later slot, skip it in the UI, and verify the text
   clears in Viewer and projected state.
7. Inspect `ax2 inspect events list --json --limit 20` and verify
   `raven.vision.slot.updated`, `raven.vision.slot.approved`, and
   `raven.vision.slot.skipped` events with appropriate actors.
8. Confirm attached sources and unrelated slot states remain unchanged after
   each Raven update.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 Raven CLI/runtime | Deterministic Bun tests cover CLI, runtime, events, and state projection | Add focused deterministic tests; no LLM eval needed | `cd packages/ax-next && bun test tests/cli.test.ts tests/runtime-server.test.ts tests/state.test.ts tests/events.test.ts tests/raven-vision.test.ts` |
| Viewer Next Vision collaboration | Existing Playwright coverage covers Home, manual slots, and source intake | Extend browser coverage for external Raven update and user feedback loop | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin guidance | Plugin validation exists; current repo eval harness is oriented around the shipped Alexandria 1 plugin, not the Next plugin payload | Update guidance and run plugin validation. Do not claim eval-harness coverage for this slice unless a Next plugin eval case is explicitly added | `cd packages/alexandria-next-plugin && claude plugin validate .` |
| Alexandria 1 skills/evals | Existing eval suite covers the old plugin line | No rerun because Alexandria 1 is untouched | None |

No current eval-harness rerun is required for FEAT-005 as scoped because the
accepted implementation can be deterministic AX2 runtime/CLI behavior plus
Viewer UI refresh and narrow Next-plugin instructions. If implementation adds
or materially changes a product-facing Raven skill/play that drafts text
autonomously, revise this section before merge and either create a Next-plugin
eval case or document the blocker if the harness cannot yet load
`packages/alexandria-next-plugin`.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Raven bulk-fills the whole Vision form | CLI command updates exactly one slot per invocation; plugin guidance says inspect/write one/stop; tests should avoid all-slot auto-fill helpers |
| Generic event append leaves projected state stale | Do not use raw `ax2 inspect events append` as the Raven write path; the new command must use reducer-backed runtime mutation |
| Viewer update route records Raven writes as Viewer user writes | Allow validated Raven actor metadata on the runtime mutation path and test ledger actors |
| Raven updates reset user-reviewed slots or attached sources | Add reducer/runtime tests with approved, skipped, needs-review, and attached-source state before a Raven update |
| Open Viewer does not repaint after CLI mutation | Subscribe to runtime `project-state` SSE and add e2e coverage where the page is already open before the external update |
| External update overwrites unsaved local typing | Track pending local slot edits and surface a conflict instead of silently replacing active local text |
| Idempotent retries duplicate ledger events | Support optional idempotency keys and test duplicate command invocations |
| CLI command grows into play orchestration | Keep command to deterministic one-slot mutation; defer slot choice, drafting strategy, and source synthesis to plugin/play work |
| Runtime response shape breaks existing Viewer client | Preserve existing projection response for Viewer or update Viewer schemas and tests in the same slice |
| Plugin guidance changes lack eval coverage | Run plugin validation and document the lack of current Next-plugin eval harness coverage; add eval coverage only if autonomous Raven play behavior lands |

### Implementation Steps

1. Add `packages/ax-next/src/commands/raven.ts` or equivalent focused command
   module with help, argument parsing, exit codes, text/text-file validation,
   and JSON/human output formatting.
2. Wire the `raven` command into `packages/ax-next/src/cli/router.ts` and
   update `packages/ax-next/README.md` public command examples.
3. Extend `packages/ax-next/src/effects/runtime-client.ts` with a Raven Vision
   slot update method that reuses existing runtime discovery/startup.
4. Factor `ravenVisionSlotMutationResponse` in
   `packages/ax-next/src/effects/runtime-server.ts` so Viewer and Raven CLI
   callers share one append/reduce/persist/broadcast path.
5. Add request parsing for a validated Raven actor and optional idempotency
   key while keeping unsupported reducer-owned fields rejected.
6. Ensure idempotent Raven updates return current projection and do not
   duplicate `raven.vision.slot.updated`.
7. Add AX2 reducer/runtime/state/event/CLI tests for success, invalid input,
   before-start `409`, idempotency, actor metadata, ledger event presence,
   projection agreement, and unrelated state preservation.
8. Extend Viewer runtime schemas or app code so `project-state` SSE payloads
   can refresh `vision` when `raven.vision` appears.
9. Update `LibraryBrowserApp` and `VisionOnboardingView` to apply external
   Raven projections, render `needs_review`, optionally flash changed slots,
   and protect unsaved local edits from silent overwrite.
10. Extend the Viewer fixture with enough event-stream/external-update support
    to test a Raven update arriving while Vision is open.
11. Add Playwright coverage for Raven update visibility, approval feedback,
    skip clearing text, and unrelated slot/source preservation.
12. Update Alexandria Next plugin guidance for the inspect/write-one/wait loop
    and Vision review event feedback.
13. Run deterministic verification and plugin validation.

### Acceptance / Exit Criteria

1. `ax2 raven vision slot update --slot <id> --text <text> --json` updates one
   Vision slot through the runtime.
2. The command is non-interactive and has stable help, JSON output, stdout,
   stderr, and exit-code behavior.
3. Invalid slot IDs list all valid Vision slot IDs and exit `2`.
4. Updating before Vision starts fails with a structured operational error and
   does not append `raven.vision.slot.updated`.
5. A successful Raven update appends exactly one
   `raven.vision.slot.updated` event.
6. The ledger actor for Raven CLI updates identifies Raven/agent, while Viewer
   manual edits remain Viewer/user actor events.
7. The updated slot text appears in `GET /api/raven/onboarding/vision`,
   `/api/state`, and `ax2 inspect state --json`.
8. The updated slot status is `needs_review`.
9. Existing approved, skipped, needs-review, and empty slots are not reset by a
   Raven update to another slot.
10. Existing Vision `sourceItemIds` and attached source rows are not changed by
    a Raven slot update.
11. An already-open Viewer Vision screen updates when Raven writes a slot.
12. The Viewer status chip visibly shows `Needs review` for Raven-written text.
13. Approving a Raven-written slot in the UI changes projected state to
    `approved` and is visible to Raven through `ax2 inspect state --json`.
14. Skipping a Raven-written slot in the UI clears text, changes projected
    state to `skipped`, and is visible to Raven through state/events.
15. Editing a Raven-written slot in the UI produces the same reducer-backed
    `needs_review` state and is visible to Raven.
16. Raven plugin guidance instructs agents to inspect current state/events
    before each slot write and to stop after one slot.
17. Deterministic AX2, Viewer, and plugin validation commands in this section
    pass.
18. No Alexandria 1 surfaces are changed.
19. No library files are written as part of this ticket.

### Deferred Follow-Ups

1. FEAT-007 Vision banking and Source of Truth generation.
2. The final `raven-fill-vision-slots` guided play with source synthesis.
3. Source processing summaries under
   `docs/alexandria/sources/processed/<sourceId>/<runId>.md`.
4. Source-to-slot attribution and per-slot rationale/scratch notes.
5. Knowledge Bank `vision: banked` UI polish and builder handoff after
   FEAT-007.
6. Next-plugin eval harness coverage for autonomous Raven play behavior.
7. Multi-agent/multi-session conflict resolution beyond same-slot local edit
   protection.

## FEAT-006: User Adds More Sources During Slot Review

- Issue: GitHub #192,
  `[FEAT-006] User adds more sources during slot review`
- Run ID: `01KSXK0M421SBAPNCVG4NB869A`
- Product plan: `raven-onboarding-experience`
- Outcome: O-3, must tier
- Blocked by: FEAT-004 and FEAT-005
- Blocks: FEAT-007
- Primary surfaces: `packages/ax-next`, `packages/viewer-next`, and
  `packages/alexandria-next-plugin`

### Goal

Prove and harden the non-linear Raven Vision flow: while Vision onboarding is
already in progress and slots have mixed review states, the user can add more
shared sources without losing any slot text or status. The newly added source
must appear in the open Viewer source strip, be attached to Vision through
`sourceItemIds`, emit the expected ledger events, and be visible to Raven before
Raven continues with a later one-slot update.

This is a continuity slice on top of FEAT-004 source intake and FEAT-005
slot-by-slot Raven collaboration. It should reuse those paths instead of adding
a parallel source wizard or a new Raven-specific source model.

### Scope

This slice must include all of the following:

1. A mixed-state Vision fixture in deterministic tests with at least one
   `needs_review` slot, one `approved` slot, and one `skipped` slot before a
   new source is added.
2. Runtime coverage proving `POST /api/sources` with Vision attachment appends
   `source.added` and `raven.vision.source_attached` while preserving every
   existing slot's `text`, `status`, `updatedAt`, and `reviewedAt`.
3. Runtime/state coverage proving the new source is present in the shared
   source projection, `sourceItems`, and
   `raven.vision.sourceItemIds` after the later addition.
4. Viewer coverage proving a user can add a file, URL, or typed note while
   Vision is open in the mixed state, without navigating away and without
   clearing or reopening approved/skipped slots.
5. Viewer coverage proving the source strip updates in place after the source
   is added and remains visually aligned with the prototype-derived
   slate/amber source-strip treatment.
6. CLI-oriented verification that `ax2 inspect state --json` and
   `ax2 inspect events list --json --limit 20` expose the later source
   addition and unchanged slot states.
7. Raven continuation coverage using the FEAT-005 one-slot command after the
   new source is attached, proving a later Raven slot update preserves the
   expanded `sourceItemIds`.
8. Alexandria Next plugin guidance that tells Raven to inspect projected state
   again after a user adds sources during review and to use the expanded
   `sourceItemIds` before deciding the next one-slot write.
9. Deterministic AX2, Viewer, and plugin validation for the mixed-review source
   addition loop.

### Non-Goals

Out of scope for FEAT-006:

1. New source intake modes beyond the FEAT-004 file, URL, and typed-note paths.
2. A user-facing AX2 `source add` command. The CLI verification can inspect the
   runtime/ledger state created by the existing Viewer/runtime source path.
3. Source deletion, removal from Vision, title editing, source card actions, or
   source reordering.
4. Source processing, summarization, source-to-slot attribution, or per-slot
   citations.
5. Automatic slot rewriting when a new source is added. Raven may continue
   later, but source attachment itself must not edit slots.
6. Wiring the disabled Quick Bar `Ping Raven` placeholder unless a separate
   runtime/play contract has landed first. This slice satisfies "ping or
   continue" through Raven continuing with the existing one-slot update command.
7. Banking Vision, `raven.vision.banked`, Knowledge Bank `vision: banked`, or
   Source of Truth generation.
8. Reintroducing phase rails, source sliders, logo upload dependencies,
   overlay-as-home behavior, or a generic admin/form layout.
9. Alexandria 1 CLI, viewer, plugin, skill, or eval behavior.
10. Writing anything under `docs/alexandria/library/`.

### Linked Product-Plan Summary

The broader Raven onboarding plan treats sources as shared Alexandria context,
not a one-time setup phase. FEAT-004 made source intake real and attached
source IDs to Vision. FEAT-005 made Raven's slot work incremental and
state-driven. FEAT-006 proves those two decisions compose: a user can discover
missing context during review, add that context immediately, and let Raven
continue from the latest state without resetting prior review decisions.

The production simplifications remain in force: no phase rail, no source
sliders, no logo-upload dependency, no overlay-as-home model, and no generic
form/admin presentation. Any changed Viewer affordance should keep the current
dark warm-walnut canvas, slate plates/cards, amber/gold controls, Raven coin,
and compact source/slot review vocabulary.

### Current Gap

Current implementation after FEAT-004/FEAT-005:

1. `packages/ax-next/src/domain/raven-vision.ts` already preserves slot state
   when `raven.vision.source_attached` appends a source ID.
2. `packages/ax-next/src/effects/runtime-server.ts` already creates source
   items through `POST /api/sources`, rewrites `sourcesPath`, optionally
   appends `raven.vision.source_attached`, persists Vision config, and
   broadcasts `project-state`.
3. `packages/viewer-next/src/components/library/VisionOnboardingView.tsx`
   already exposes FEAT-004 file/URL/note intake and updates the open Vision
   projection from the source-create response.
4. `LibraryBrowserApp` already listens for runtime `project-state` SSE and can
   refresh the current Vision projection.
5. Existing reducer coverage proves source attachment preserves an all-reviewed
   ready state and slot updates preserve source IDs.
6. Existing runtime/browser coverage proves source addition preserves an
   approved slot or a single `needs_review` slot, but it does not explicitly
   prove the FEAT-006 mixed state of `needs_review`, `approved`, and `skipped`
   at the same time.
7. Existing Viewer browser coverage adds sources before and around manual slot
   review, but it does not isolate "add a source after one approved slot, one
   skipped slot, and one still-needs-review slot" as the acceptance path.
8. Existing Raven continuation coverage proves a Raven slot update can preserve
   pre-existing source IDs, but not that Raven can continue after a later source
   addition expands `sourceItemIds` during review.
9. `ax-next-start` guidance tells Raven to preserve approved, skipped, and
   needs-review slots, but it does not explicitly mention user-added sources
   during review as a reason to re-inspect state before continuing.

The likely implementation is mostly focused hardening and targeted tests. If
the tests expose a real preservation or refresh bug, fix that specific runtime,
Viewer, or guidance path in the same slice.

### Architectural Boundaries

Sources remain shared Alexandria state. `source.added` rebuilds the source
projection at `sourcesPath`; Raven Vision stores only shared source IDs in
`agents.raven.onboarding.vision.sourceItemIds`. Do not introduce a
Raven-specific source item or copy source records into Vision config.

AX2 owns event validation, source projection writes, Vision reducer behavior,
config persistence, runtime mutation serialization, CLI state/event inspection,
and the deterministic Raven one-slot update command. Source addition must run
under the existing runtime mutation semaphore so `source.added`, projection
rewrite, `raven.vision.source_attached`, config persistence, and SSE broadcast
cannot interleave with slot review mutations.

Viewer Next owns the in-progress user workflow. An open Vision screen should
apply the canonical Vision projection returned by source create or by
`project-state` SSE. Slot editors with pending local text should keep the
FEAT-005 same-slot conflict protection; a source-only projection update must
not clear local draft text, approved text, skipped state, or review buttons.

The Alexandria Next plugin owns Raven's guided behavior. This slice should
tighten instructions so Raven treats late source additions as new context to
read through `ax2 inspect state --json` before the next one-slot write. It
should not add an autonomous bulk-fill play or a prompt-only path that bypasses
AX2 state.

The CLI should stay deterministic. No new source-add command is expected. If
implementation changes any CLI command output to expose additional source
fields, add black-box tests for output fields, stdout/stderr, and exit codes in
the same change.

### Mixed-State Source Attachment Contract

Required precondition for the core acceptance test:

1. Vision has started.
2. One slot is `needs_review` with non-empty text.
3. One slot is `approved` with non-empty text and `reviewedAt` set.
4. One slot is `skipped` with empty text and `reviewedAt` set.
5. At least one other slot may be empty or unchanged.

When a new source is added and attached to Vision:

1. The runtime accepts exactly one source through the FEAT-004 file, URL, or
   typed-note path.
2. The runtime appends `source.added` for the shared source record.
3. The runtime rewrites `sourcesPath` with the new current source projection.
4. The runtime appends `raven.vision.source_attached` for the new source ID.
5. Vision `sourceItemIds` appends the new ID once and preserves existing IDs in
   order.
6. The projected `raven.vision.sourceItems` rows match the attached IDs.
7. The reducer updates Vision `updatedAt` for the attachment but does not
   change any slot `text`, `status`, `updatedAt`, or `reviewedAt`.
8. Approved slots stay `approved` unless the user explicitly edits that slot.
9. Skipped slots stay `skipped` unless reopened by a later text update.
10. Needs-review slots stay `needs_review` with their existing text.
11. `readyToBank` and Vision `status` remain a consequence of slot state only;
    adding a source must not make an in-progress mixed state ready or clear a
    ready state.
12. Runtime broadcasts a `project-state` message after the successful
    attachment so an open Viewer can refresh without navigation.

### Raven Continuation Contract

After a user adds a source during review, Raven's next step must be based on
fresh projected state:

```bash
ax2 inspect state --json
ax2 inspect events list --json --limit 20
```

Raven should then either stop for user review if no new write is warranted, or
write exactly one later slot with the FEAT-005 command:

```bash
ax2 raven vision slot update --slot <slot-id> --text-file <draft-file> --json
```

Continuation requirements:

1. `ax2 inspect state --json` shows the expanded
   `raven.vision.sourceItemIds` and attached `sourceItems`.
2. The later Raven slot update preserves the expanded `sourceItemIds` and the
   prior approved/skipped/needs-review slot states except for the one targeted
   slot.
3. The ledger contains the later `source.added`,
   `raven.vision.source_attached`, and subsequent
   `raven.vision.slot.updated` events in inspectable order.
4. Plugin guidance tells Raven not to assume the source set from the previous
   turn is still current.

### Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 Raven reducer | `packages/ax-next/src/domain/raven-vision.ts`, `packages/ax-next/tests/raven-vision.test.ts` | Add or strengthen mixed-state source attachment coverage; implementation change only if tests expose slot mutation |
| AX2 runtime source path | `packages/ax-next/src/effects/runtime-server.ts`, `packages/ax-next/tests/runtime-server.test.ts` | Proves source create/attach during mixed review emits both events, rewrites source projection, persists Vision, broadcasts state, and preserves slots |
| AX2 state/events/CLI inspection | `packages/ax-next/src/commands/state.ts`, `commands/events.ts`, `commands/raven.ts`, `tests/state.test.ts`, `tests/events.test.ts`, `tests/cli.test.ts`, `tests/runtime-server.test.ts` | Uses existing `inspect state`, `inspect events list`, and Raven slot update commands to prove expanded source IDs are visible and retained |
| Viewer runtime client | `packages/viewer-next/src/app/runtime/client.ts`, `schemas.ts`, `client.test.ts` | Confirms source-create responses with mixed Vision state decode and hand the updated Vision projection to the UI |
| Viewer Vision UI | `packages/viewer-next/src/components/library/LibraryBrowserApp.tsx`, `VisionOnboardingView.tsx` | Keeps source intake available during review, updates the source strip in place, and preserves slot editors/status chips |
| Viewer fixture/e2e | `packages/viewer-next/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Adds a mixed-state setup path and browser test for adding a source while review decisions already exist, then simulates Raven continuing |
| Viewer visual styling | Existing Vision classes in `packages/viewer-next/src/styles/global.css` only if needed | Maintains prototype-derived slate/amber source strip and compact slot/source review affordances; no generic admin UI |
| Alexandria Next plugin guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`, optionally `skills/alexandria-event-log/SKILL.md` | Explains late source additions during Vision review and Raven's inspect-current-state-before-continuing obligation |
| Alexandria 1 surfaces | No files expected | No behavior change |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `ax-next-start` skill | Raven Vision collaboration guidance should explicitly say that users may add sources during slot review; Raven must inspect current state and use expanded `sourceItemIds` before any next slot update | Update examples or notes and run plugin validation |
| `alexandria-event-log` skill | If touched, treat `source.added` and `raven.vision.source_attached` as context changes that should trigger state inspection before a Raven Vision continuation | Run plugin validation and keep wording generic |
| AX2 CLI behavior | No new command expected; existing `inspect state`, `inspect events list`, and `raven vision slot update` are the deterministic Raven continuation path | Add/extend black-box tests only for changed or newly asserted output fields and exit codes |
| Viewer user behavior | Source intake remains available during mixed review, source strip updates immediately, and slot review decisions persist | Add Playwright coverage for the non-linear flow |
| Raven guided behavior | Raven can continue after a late source add by inspecting state/events and writing one later slot | No autonomous LLM eval unless a new Raven play is added |

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 Raven reducer | `cd packages/ax-next && bun test tests/raven-vision.test.ts` | Proves source attachment preserves simultaneous `needs_review`, `approved`, and `skipped` slot states |
| AX2 runtime APIs | `cd packages/ax-next && bun test tests/runtime-server.test.ts` | Proves source create during mixed review emits `source.added` and `raven.vision.source_attached`, rewrites `sourcesPath`, persists Vision, broadcasts state, and supports later Raven continuation |
| AX2 state/events/CLI behavior | `cd packages/ax-next && bun test tests/state.test.ts tests/events.test.ts tests/cli.test.ts` | Proves projected state, event schemas/listing, command help/exit-code behavior, and important output fields remain deterministic |
| AX2 typecheck | `cd packages/ax-next && pnpm run typecheck` | Catches runtime/domain/command type drift |
| Viewer runtime client | `cd packages/viewer-next && pnpm run test` | Proves source-create and Vision projection schemas decode the fields used by the open Vision screen |
| Viewer browser behavior | `cd packages/viewer-next && pnpm run test:e2e` | Proves the user can add a source in a mixed review state, the source strip updates without navigation, slots are preserved, and a later Raven update can arrive |
| Viewer static/type check | `cd packages/viewer-next && pnpm run check` | Catches Astro, React, and TypeScript issues |
| Viewer build | `cd packages/viewer-next && pnpm run build` | Confirms the mounted viewer bundle still builds for the fixture server |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required because this slice updates Next plugin guidance |
| Markdown lint | Repo markdown lint for the changed plan and skill prose | Keeps planning/guidance docs valid |

Manual verification:

1. Start from an initialized Alexandria Next project with Vision started and
   Raven connected.
2. Put Vision into mixed slot state: one `needs_review`, one `approved`, one
   `skipped`.
3. Add a new file, URL, or typed-note source from the open Vision screen.
4. Verify the new source appears in the Vision source strip without navigating
   away.
5. Verify all existing slot text and statuses remain unchanged in the Viewer.
6. Run `ax2 inspect state --json` and verify the new source appears in
   `raven.vision.sourceItemIds` and `raven.vision.sourceItems`.
7. Run `ax2 inspect events list --json --limit 20` and verify the later
   `source.added` and `raven.vision.source_attached` events.
8. Run or simulate Raven continuing with
   `ax2 raven vision slot update --slot <later-slot> --text-file <draft> --json`.
9. Inspect state again and verify the expanded `sourceItemIds` are still
   present and prior approved/skipped/needs-review slots are unchanged except
   for the one Raven explicitly updated.

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 source and Raven Vision runtime | Deterministic Bun tests cover reducer, runtime, events, state projection, and Raven command behavior | Extend deterministic tests for the mixed-state late source addition and Raven continuation path | `cd packages/ax-next && bun test tests/raven-vision.test.ts tests/runtime-server.test.ts tests/state.test.ts tests/events.test.ts tests/cli.test.ts` |
| Viewer Next Vision workflow | Playwright coverage already covers source intake, manual review, and external Raven updates separately | Add a browser test combining mixed review state, late source addition, in-place source strip update, and later Raven continuation | `cd packages/viewer-next && pnpm run test && pnpm run test:e2e` |
| Alexandria Next plugin guidance | Plugin validation exists; current eval harness is oriented around the shipped Alexandria 1 plugin, not the Next plugin payload | Update guidance and run plugin validation; no LLM eval required unless autonomous Raven play behavior changes | `cd packages/alexandria-next-plugin && claude plugin validate .` |
| Alexandria 1 skills/evals | Existing eval suite covers the old plugin line | No rerun because Alexandria 1 is untouched | None |

No eval-harness rerun is required for FEAT-006 as scoped because it changes
deterministic AX2 runtime/CLI verification, Viewer workflow continuity, and
narrow Next-plugin guidance. If implementation adds or materially changes a
product-facing autonomous Raven skill/play that decides how to use sources,
revise this section before merge and either add a Next Raven eval case or
document the harness blocker if `packages/alexandria-next-plugin` cannot yet be
loaded by the eval harness.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Source attachment accidentally recomputes or resets slot review state | Add reducer/runtime tests with simultaneous `needs_review`, `approved`, and `skipped` slots and assert exact slot snapshots before/after |
| Viewer source-create response overwrites local slot editor text | Keep FEAT-005 pending-text conflict behavior and add browser coverage around source add while slots already have review decisions |
| Runtime emits `source.added` but misses `raven.vision.source_attached` | Assert both ledger events and `sourceItemIds` in runtime and CLI/state tests |
| New source appears in global source projection but not Vision strip | Assert `raven.vision.sourceItems` and browser source-card rendering after the add |
| Raven continues from stale source context | Update plugin guidance and deterministic continuation test to inspect state/events after the source add before the later Raven slot update |
| A retry duplicates attached source IDs | Keep idempotency keys and reducer de-duplication in the source attach path; add an assertion if duplicate behavior is touched |
| Ping Raven scope expands without a runtime contract | Treat continuation via `ax2 raven vision slot update` as the acceptance path; revise the plan if a real ping contract is introduced |
| UI drifts into generic source-management chrome | Reuse existing Vision source panel/source card classes and prototype slate/amber tokens; add visual assertions/screenshots where coverage already does this |
| CLI output fields are changed without coverage | If any command output changes, add black-box tests for JSON fields, human output, stdout/stderr separation, and exit codes |

### Implementation Steps

1. Add a helper in AX2 tests to build a mixed Vision state:
   `shift` or equivalent `approved`, `person` or equivalent `skipped`, and a
   third slot `needs_review`.
2. Extend `tests/raven-vision.test.ts` so
   `raven.vision.source_attached` preserves that mixed slot snapshot exactly
   while appending a new source ID once.
3. Extend `tests/runtime-server.test.ts` with a source-create flow that starts
   Vision, creates the mixed state through runtime endpoints, adds a new
   source, and asserts source projection, ledger events, Vision `sourceItemIds`,
   `sourceItems`, and unchanged slot snapshots.
4. In the same runtime test, run or reuse the Raven slot update path after the
   source is attached and assert the expanded source IDs and prior review
   states survive the continuation.
5. Extend state/events/CLI black-box coverage as needed so
   `ax2 inspect state --json` exposes the expanded IDs and
   `ax2 inspect events list --json --limit 20` exposes the late source events
   with stable success exit behavior.
6. Extend Viewer runtime client tests if the mixed-state source-create response
   exposes fields not already decoded by `RuntimeSourceCreateResultSchema`.
7. Extend the Viewer fixture with a mixed-review setup helper if doing so keeps
   browser tests focused and deterministic.
8. Add a Playwright test that opens Vision, reaches mixed state, adds a source
   without leaving the page, verifies source strip update, verifies
   approved/skipped/needs-review slots remain unchanged, and then simulates a
   later Raven slot update.
9. Keep any visual tweaks scoped to existing Vision source/slot classes and the
   prototype-derived dark walnut, slate, amber/gold, compact review language.
10. Update `ax-next-start` guidance, and `alexandria-event-log` only if useful,
    so Raven re-inspects state after user-added sources during review before
    writing another slot.
11. Run deterministic verification and plugin validation.

### Acceptance / Exit Criteria

1. The user can add another source while at least one Vision slot is
   `needs_review`.
2. The user can add another source after at least one Vision slot is
   `approved`.
3. The user can add another source after at least one Vision slot is
   `skipped`.
4. The core automated fixture covers all three states at the same time before
   source addition.
5. Adding a source does not clear or rewrite existing slot text.
6. Adding a source does not change existing slot statuses.
7. Approved slots stay approved unless explicitly edited.
8. Skipped slots stay skipped unless reopened by a later text update.
9. Existing needs-review slots stay needs-review with their text intact.
10. The new source appears in the Vision source strip without page navigation
    or reload.
11. The new source appears in the shared `sourceItems` projection.
12. The new source ID appears in `raven.vision.sourceItemIds`.
13. The ledger contains `source.added` and
    `raven.vision.source_attached` for the later source addition.
14. `ax2 inspect state --json` shows the expanded source IDs and unchanged
    slot statuses.
15. `ax2 inspect events list --json --limit 20` shows the later source events.
16. Raven can continue after the source is added by inspecting state/events and
    writing one later slot through `ax2 raven vision slot update`.
17. The later Raven slot update preserves the expanded `sourceItemIds`.
18. Alexandria Next plugin guidance documents the late-source review loop.
19. Deterministic AX2, Viewer, and plugin validation commands in this section
    pass.
20. No Alexandria 1 surfaces are changed.
21. No library files are written as part of this ticket.

### Deferred Follow-Ups

1. A real `Ping Raven` runtime/play contract from the Quick Bar.
2. Autonomous `raven-fill-vision-slots` source synthesis that uses attached
   source content rather than only projected IDs.
3. Source processing summaries and source-to-slot attribution.
4. Source removal/reordering from Vision.
5. Vision banking, Source of Truth generation, and Knowledge Bank
   `vision: banked`.
6. Next-plugin eval harness coverage for autonomous Raven play behavior.
7. Multi-session conflict resolution for a source add racing with slot review
   mutations beyond the existing runtime mutation semaphore.

## Prototype Findings

Keep these pieces from the spike:

- The agent bench with Raven as the active product agent and future agents as
  locked seats.
- The visual language: dark workspace, gold stone controls, Raven coin, and
  game-like progression.
- The Knowledge Bank concept: subjects have staged progress, locked subjects
  reveal requirements, and play unlocks are tied to banked knowledge.
- The step-scoped Knowledge Bank trick: show the whole bank, but strongly guide
  the first available subject instead of hiding the future.
- The Vision builder pattern: a focused, slot-based knowledge builder with
  sources, Raven scratch, and banked output.

Discard or decouple these pieces:

- Do not keep the `1.1` to `1.9` phase rail as the onboarding spine.
- Do not require logo upload as part of Raven onboarding. Logo belongs to later
  product identity or personalization.
- Do not use source-depth sliders. Sources must be concrete readable inputs, not
  a subjective `5/10` rating.
- Do not make the user walk through "Opening", "Product Orientation",
  "Gap Analysis", "Initialize Artifacts", and similar steps before Raven becomes
  useful.

## Product Shape

The first-run experience starts on the Alexandria Home surface.

1. The agent shelf is visible at the bottom.
2. Raven's coin starts inert when Alexandria has not seen a plugin connection.
3. Home shows a welcome message and a `Connect Raven` call to action.
4. Once the runtime sees any Alexandria Next plugin connection, Raven is treated
   as connected for this first slice.
5. Raven's coin glows, the `Connect Raven` message clears, and Home shows
   `Power up Raven: Vision`.
6. Clicking `Power up Raven: Vision` opens the Vision onboarding sequence.
7. Completing or skipping each Vision slot enables `Bank Vision`.
8. Banking Vision opens Raven's Knowledge Bank with Vision marked as banked and
   the rest of the subjects grayed out.

The Raven coin remains the agent affordance. Clicking it opens Raven's Quick
Bar, which can include `Knowledge Bank`, `Playbook`, and `Ping Raven`. Raven
does not become a top-level navigation destination.

Sources are not a Raven-owned surface. Source items are Alexandria-wide intake:
files and source code that any agent or play can use and process. Links, typed
notes, conversations, and voice notes should be saved as files before becoming
source items. For this slice, sources may appear as a top-level `Sources` or
`Inbox` destination parallel to the Library, but the plan should not introduce a
two-level app map yet.

The top-level promise is:

> Connect Raven. Hand Alexandria source material. Let Raven fill the Vision
> slots. Accept or skip each slot. Bank Vision to unlock Raven's first useful
> product-management context.

## Scope

In scope:

- Add durable shared source intake state and Raven onboarding state to
  `.alexandria-next/alexandria-config.json`.
- Add AX2 config parsing, serialization, mutation helpers, and runtime endpoints
  for shared `SourceItem` state and Raven onboarding state.
- Build a Viewer Next Home, Raven Quick Bar, Vision onboarding surface, and
  Knowledge Bank status surface that largely match the spike's visual language.
- Replace the old phase rail with an explicit Home and agent-shelf flow.
- Replace source sliders with one-at-a-time source add actions, source cards,
  and source processing status.
- Model Vision slots, Knowledge Bank subjects, source-of-truth output, and play
  unlock prerequisites.
- Keep the Playbook top navigation locked until Raven has enough banked context
  for at least the first play group.
- Append ledger events for meaningful onboarding mutations so config is the
  current snapshot and ledger remains audit history.
- Add deterministic tests for config state, runtime APIs, viewer rendering, and
  navigation behavior.

## Non-Goals

- Do not port the full static spike HTML into production.
- Do not keep the old multi-step phase rail as a required path.
- Do not implement logo upload in this onboarding slice.
- Do not write directly to `docs/alexandria/library/` from Raven.
- Do not make Raven author library cards. The banked source-of-truth document is
  an input to a later builder step.
- Do not build the full Playbook UI in this slice. Show locked/unlocked play
  summaries and requirements only.
- Do not migrate Alexandria 1 `/ax-library` behavior into Alexandria Next.
- Do not add per-feature JSON state files for Raven onboarding.

## Current Gap

Viewer Next already has a strong start for the visual shell:

- `packages/viewer-next/src/components/library/RavenBench.tsx`
- `packages/viewer-next/src/components/library/StoneTopBar.tsx`
- Raven coin assets under `packages/viewer-next/public/raven-assets/`
- stone navigation assets under `packages/viewer-next/public/library-assets/`

AX2 already has the correct high-level state boundary:

- durable config at `.alexandria-next/alexandria-config.json`
- workspace content at `docs/alexandria`
- append-only ledger at `docs/alexandria/ledger/events.jsonl`
- runtime APIs served by `ax2 start viewer`
- projected state available at `/api/state`

The missing pieces are:

- no Raven onboarding config branch
- no runtime API for updating config-backed product state
- no shared source inventory state or runtime API
- no Home state for Raven connection/power-up readiness
- no production Knowledge Bank model or UI
- no source-of-truth output pointer in project state
- no play unlock projection tied to banked knowledge
- current prototype nav suggests a long wizard and makes the flow feel heavier
  than the product shape should be

## State Model

Store current product state pointers and compact agent state in
`alexandria-config.json`. For this slice there are two important config-owned
entries:

- `sourcesPath`: path to the projected shared source inventory
- `agents.raven`: Raven's Vision onboarding progress, Knowledge Bank status,
  and Source of Truth pointer

Update `AlexandriaNextConfig`:

```ts
interface AlexandriaNextConfig {
  schemaVersion: 1;
  workspacePath: string;
  sourcesPath: string;
  codex?: AlexandriaCodexConfig;
  agents?: {
    raven?: RavenAgentConfig;
  };
}
```

`workspacePath` is the path to the Alexandria workspace on disk.
`sourcesPath` points at the source inventory projection, defaulting to
`.alexandria-next/sources.jsonl`.

Initial projects can omit `agents.raven`. Missing Raven state means Raven has
not started onboarding yet. The source inventory can start as an empty JSONL
projection file at `sourcesPath`.

Connection status should be projected from existing runtime/plugin connection
logic, not stored in `agents.raven`. In this slice, any Alexandria Next plugin
connection means Raven is connected. Multi-agent connection modeling is
deferred.

```ts
interface RavenAgentConfig {
  onboarding: RavenOnboardingState;
  knowledgeBank: RavenKnowledgeBankState;
  sourceOfTruth?: RavenSourceOfTruthState;
  updatedAt: string;
}
```

### Shared Source Projection

Source items are Alexandria-wide. Raven may process them first, but future
agents and plays should be able to depend on and process the same source items.
The ledger remains the event source; `sourcesPath` is a materialized current
inventory projection. The source reducer rewrites this JSONL file atomically.

```ts
interface SourceItem {
  id: string;
  kind: "file" | "source_code";
  title: string;
  sourcePath: string;
  pathType: "file" | "directory";
  status: "unprocessed" | "processing" | "processed" | "failed";
  addedBy: "user" | "agent";
  addedAt: string;
  updatedAt: string;
  contentHash?: string;
  latestSummaryPath?: string;
  latestSummaryExcerpt?: string;
}
```

`sourcePath` should point at a real file or source-code path on disk. Dropped
ordinary folders are expanded into individual file source items. Source code is
modeled now because it will matter soon, but source-code processing is out of
scope for the first implementation; when supported, `source_code` can point at
a single file or a directory.

Links, typed notes, conversations, and voice notes should be captured into
workspace files first, then added as ordinary `file` source items. Put captured
source files under:

`docs/alexandria/sources/originals/`

Do not split originals into many intake-type folders yet. Original URLs,
transcript metadata, or capture metadata can live inside the generated source
file, for example as Markdown frontmatter.

Agent-produced summaries and processed outputs should be Markdown files on
disk. Store them under:

`docs/alexandria/sources/processed/<sourceId>/<runId>.md`

`latestSummaryPath` points at the latest successful processed Markdown file.
`latestSummaryExcerpt` is a small UI convenience; the full summary lives on
disk. If a later processing run fails, keep the last successful summary path and
set `status` to `failed`.

High-level ledger events for the source reducer:

- `source.added`
- `source.processing_started`
- `source.processing_completed`
- `source.processing_failed`
- `source.changed_detected`

Deletion/removal semantics are deferred. The first implementation should avoid
hard-delete behavior unless a clearer product rule is added.

### Raven Onboarding State

Raven onboarding tracks the first power-up path. It is not the source inventory
and it is not the Library.

```ts
interface RavenOnboardingState {
  schemaVersion: 1;
  vision: RavenVisionOnboardingState;
  updatedAt: string;
}

interface RavenVisionOnboardingState {
  status: "not_started" | "in_progress" | "ready_to_bank" | "banked";
  sourceItemIds: string[];
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  startedAt?: string;
  bankedAt?: string;
}

type RavenVisionSlotReviewState =
  | "empty"
  | "needs_review"
  | "approved"
  | "skipped";

interface RavenVisionSlotState {
  id: RavenVisionSlotId;
  status: RavenVisionSlotReviewState;
  text?: string;
  updatedAt?: string;
  reviewedAt?: string;
}
```

The Vision slot definitions themselves should live in a static manifest, not in
user config. Config stores the user's current state for each slot.

Vision state rules:

- Empty is only the starting position.
- Raven or the user marks a slot `needs_review` when text is drafted or changed.
- The user must approve or skip every slot before Vision can be banked.
- At least one slot must be approved with non-empty content.
- Skipping a slot clears its text. A skipped slot can be reopened later; writing
  text moves it back to `needs_review`.
- `ready_to_bank` is a reducer-computed projection state. The UI should never
  set it directly.
- Clicking `Bank Vision` requires a current Raven Source of Truth document and
  marks Vision banked in the onboarding state and Knowledge Bank.

### Raven Knowledge Bank State

Raven's Knowledge Bank is a checklist/status map for Raven capability areas. It
is not a parallel Library and is not the place where atomized cards live.

```ts
interface RavenKnowledgeBankState {
  subjects: Partial<
    Record<RavenKnowledgeSubjectId, RavenKnowledgeSubjectState>
  >;
  updatedAt?: string;
}

type RavenKnowledgeSubjectState =
  | {
      id: RavenKnowledgeSubjectId;
      status: "in_progress";
    }
  | {
      id: RavenKnowledgeSubjectId;
      status: "banked";
      bankedAt: string;
    };
```

The first implementation should actively support only `vision`. Future subjects
can be shown as locked/grayed out by merging this state with a static subject
manifest:

- `vocabulary`
- `bets`
- `guardrails`
- `user-research`

Missing subject state means the subject has not started. `locked` and
`available` are derived from the subject manifest and product rules, not stored
in project state. Play unlocks are computed from Knowledge Bank state and the
play manifest, not stored in `RavenKnowledgeBankState`.

Deleting or editing a generated library card should not automatically deplete
Raven's Knowledge Bank. Banked status means Raven has an accepted Source of
Truth backing that capability. Later we can show downstream drift, such as
generated cards that were edited or deleted, without making it part of the first
unlock model.

### Source-Of-Truth State

The Source of Truth document is Raven's internal product context document. It
is the bridge between onboarding and later library card creation, but it is not
designed as a user-facing document and should not be modeled as UI sections
keyed to Knowledge Bank subjects.

```ts
interface RavenSourceOfTruthState {
  path: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}
```

The initial output path should be stable and user-visible, for example:

`docs/alexandria/source-of-truth/raven-product-context.md`

Config stores the path and whole-document content hash. The document itself
lives in the workspace and can be structured however Raven needs.

### Reducer Contract

The ledger is the source of truth for state changes. Config and JSONL files are
current-state projections that reducers rewrite after events are appended.

Source reducer:

- `source.added` creates a `SourceItem` with `status: "unprocessed"`.
- `source.processing_started` sets `status: "processing"`.
- `source.processing_completed` sets `status: "processed"`, updates
  `contentHash`, `latestSummaryPath`, and `latestSummaryExcerpt`.
- `source.processing_failed` sets `status: "failed"` while preserving the last
  successful summary path if one exists.
- `source.changed_detected` resets the item to `status: "unprocessed"` and
  updates `contentHash`.

Raven reducer:

- `raven.vision.started` initializes the nine Vision slots, sets Vision to
  `in_progress`, and marks Knowledge Bank subject `vision` as `in_progress`.
- `raven.vision.source_attached` appends a source ID to Vision onboarding.
- `raven.vision.slot.updated` writes slot text, sets the slot to
  `needs_review`, and clears `reviewedAt`.
- `raven.vision.slot.approved` sets the slot to `approved` and records
  `reviewedAt`.
- `raven.vision.slot.skipped` clears slot text, sets the slot to `skipped`, and
  records `reviewedAt`.
- After slot events, the reducer sets Vision to `ready_to_bank` when every slot
  is approved or skipped and at least one approved slot has non-empty text.
- `raven.source_of_truth.updated` updates Raven's Source of Truth path, content
  hash, and timestamps.
- `raven.vision.banked` requires Vision to be `ready_to_bank` and Raven's
  Source of Truth to exist, then marks Vision and Knowledge Bank subject
  `vision` as `banked`.

Play unlocks are runtime/project-state projections computed from Raven's
Knowledge Bank state and the play manifest. They are not stored in
`agents.raven`.

## Sources UX

Do not use sliders.

Sources are shared Alexandria intake. They can have a top-level `Sources` or
`Inbox` destination later, but Vision onboarding should also expose a local
`Add sources` area at the top because that is where the user is actively
powering up Raven.

The source inventory projection should show source cards grouped by kind and
status:

- unprocessed
- processing
- processed
- failed

Primary actions:

- Drop a file or folder
- Add a URL
- Add a typed note
- Add a voice note
- Add from conversation
- Say `that's all` / `Done adding sources`

Each source card should show:

- title
- kind
- source path
- path type
- processing status
- latest summary excerpt once a summary exists
- actions: edit title, open source, open latest summary, ask Raven or another
  agent to process

Empty state:

- "Alexandria does not have product context yet."
- Offer `Add source` and `Start from conversation`.
- Do not block the user if no files exist.

Important behavior:

- Source "depth" is derived from actual items and read status, not from user
  ratings.
- A source can be available before any agent has processed it.
- Raven can process a source and create a summary without banking a Knowledge
  Bank subject yet.
- User notes count as valid sources because many early products have no docs,
  but the note is first saved as a file under `sources/originals`.
- Source adding should be one-at-a-time until the user chooses `Done adding
  sources`, not one giant textarea with "one per line" instructions.

## Vision Onboarding UX

The first power-up target is Vision. Home should send the user directly to the
Vision onboarding sequence through `Power up Raven: Vision`.

Layout:

- Header: `Power up Raven: Vision`, Raven connection state, and slot completion.
- Top source strip: one-at-a-time source adding and processing status.
- Main column: the nine Vision slots, top to bottom.
- Bottom/bench: Raven remains visible and glowing while connected.

Slot states:

- `empty`: starting position; nothing meaningful has happened yet.
- `needs_review`: Raven drafted or changed this slot; user should inspect it.
- `approved`: user accepted the slot content.
- `skipped`: user intentionally left the slot empty for now.

Do not keep the prototype's `slash`, `build`, `tune`, and `approved` states.
That system is too abstract for the first implementation.

Source flow:

1. User adds one file, link, note, voice note, or conversation reference.
2. Link/note/conversation/voice intake is saved as a file under
   `sources/originals`.
3. A `source.added` event is appended to the ledger.
4. The source reducer atomically rewrites the `sourcesPath` JSONL projection.
5. Raven processes the source and writes a Markdown summary under
   `sources/processed/<sourceId>/<runId>.md`.
6. A processing completion event updates the projection's latest summary fields.
7. Raven starts filling Vision slots from the top.
8. Slots with Raven changes move to `needs_review`.
9. User approves or skips each slot.
10. When every slot is approved or skipped, and at least one slot has approved
   content, `Bank Vision` becomes available.

Banking Vision:

- Writes or updates Raven's Source of Truth document.
- Records the document metadata in `agents.raven.sourceOfTruth` via a
  `raven.source_of_truth.updated` event.
- Marks `knowledgeBank.subjects.vision.status` as `banked` via a
  `raven.vision.banked` event.
- Opens Raven's Knowledge Bank with Vision marked as banked and future subjects
  grayed out.

## Knowledge Bank UX

The Knowledge Bank should look close to the prototype, but the interaction
model should be simpler. It is a status/checklist screen, not the primary slot
editor and not a parallel library.

Layout:

- Header: Raven status, level, banked subjects, unlocked plays.
- Main column: subject bands and progress.
- Side panel: what the selected subject unlocks and whether Raven's Source of
  Truth currently backs it.
- Bottom/bench: Raven remains visible and lit while connected.

Subject statuses:

- `locked`: future scope or requires earlier subjects.
- `available`: can be started from Home or the Knowledge Bank.
- `in_progress`: its onboarding/power-up sequence has started.
- `banked`: Raven's Source of Truth backs this subject.

First implementation:

- Show `Vision` as banked after the Vision onboarding flow completes.
- Show `Vocabulary`, `Bets`, `Guardrails`, and `User Research` as locked or
  grayed out.
- Do not imply that a banked subject is the same as a library card.
- Do not require generated library cards for the Knowledge Bank to show Vision
  as banked.

## Play Unlock Model

Play availability should be computed from Knowledge Bank subjects.

Example Level 1 play requirements:

| Play | Requires |
|------|----------|
| Vision Recap | `vision` at `banked` |
| Product Brief Draft | `vision` at `banked` |
| Surface Tour | `vocabulary` at `banked` |
| What We Refuse To Be | `guardrails` at `banked` |
| Audience Sharpener | `user-research` at `banked` |
| Adversarial Pre-Mortem | `user-research`, `guardrails`, `bets` at `banked` |
| Product Spec Critique | all Core 5 at `banked` |

The actual play IDs should live in the Alexandria Next play manifest, not in
viewer-only constants. Viewer can render a computed projection. Do not store
unlocked play IDs in Raven's Knowledge Bank state.

## Navigation Fix

Remove the bottom `1.1` to `1.9` onboarding rail from the onboarding path.
Keep the bottom agent shelf as the way to reach agent-specific affordances.

Production navigation should be:

- Top-level app nav: Home/Library, optional Sources/Inbox, Playbook, Ledger.
- Agent shelf: Raven coin plus locked future agents.
- Raven Quick Bar: Knowledge Bank, Playbook, Ping Raven.
- Home call to action: Connect Raven, then Power up Raven: Vision.

Rules:

- Raven is not top-level navigation.
- Sources are not nested under Raven.
- `X` closes transient panels, drawers, or overlays only. It should not be the
  primary way to navigate "home."
- The logo can still link home, but Home/Library must also be reachable through
  explicit navigation.
- Playbook remains locked until at least one play is unlocked.
- Logo upload is not in this flow.
- Knowledge Bank can link to focused subject builders, like the Vision builder,
  but those builders should feel like task surfaces, not wizard steps.

## Runtime/API Plan

AX2 should own all config mutations.

Add config helpers in `packages/ax-next`:

- parse `sourcesPath`
- parse optional Raven agent state
- create default source projection and Raven onboarding projection when missing
- update source projection and Raven onboarding state through typed reducer and
  mutation functions
- serialize the full config without dropping existing `codex` or future config
  branches
- write config and `sourcesPath` projections atomically or through safe
  overwrite helpers

Runtime API additions:

- `GET /api/sources`
- `POST /api/sources`
- `PATCH /api/sources/:id`
- `POST /api/sources/:id/process`
- `GET /api/raven/onboarding`
- `POST /api/raven/onboarding/vision/start`
- `POST /api/raven/onboarding/vision/source-items`
- `PATCH /api/raven/onboarding/vision/slots/:slotId`
- `POST /api/raven/onboarding/vision/slots/:slotId/approve`
- `POST /api/raven/onboarding/vision/slots/:slotId/skip`
- `POST /api/raven/source-of-truth`
- `POST /api/raven/onboarding/vision/bank`

Each mutating endpoint should:

1. validate input with Effect Schema or the existing AX2 validation style
2. append a ledger event for explicit user-visible changes
3. run the relevant reducer
4. update `alexandria-config.json` and/or `sourcesPath` projections
5. return the updated projection
6. notify runtime event subscribers if the existing stream supports it

Ledger event candidates:

- `source.added`
- `source.processing_started`
- `source.processing_completed`
- `source.processing_failed`
- `source.changed_detected`
- `raven.vision.started`
- `raven.vision.source_attached`
- `raven.vision.slot.updated`
- `raven.vision.slot.approved`
- `raven.vision.slot.skipped`
- `raven.source_of_truth.updated`
- `raven.vision.banked`

Keep event count low. Do not emit an event for every keystroke.

## Viewer Plan

Add production React components under `packages/viewer-next/src/app` or
`packages/viewer-next/src/components` following the current package split.

Likely components:

- `AlexandriaHome`
- `AgentShelf`
- `RavenQuickBar`
- `RavenConnectionPanel`
- `RavenVisionOnboarding`
- `VisionSourceAdder`
- `VisionSlotList`
- `VisionSlotCard`
- `SourceCard`
- `RavenKnowledgeBank`
- `RavenKnowledgeSubjectRow`
- `RavenPlayUnlockPanel`

Runtime client additions:

- narrow schemas in `src/app/runtime/schemas.ts`
- Effect operations in `src/app/runtime/client.ts`
- hook adapter for React state
- test replacement client for Storybook and component tests

Do not use Effect inside pure visual components.

## Plugin/Play Plan

The plugin owns guided Raven behavior. AX2 and Viewer expose state and mutation
surfaces.

Likely new plays:

- `source-process`: an agent reads selected source items and writes a processed
  Markdown summary.
- `raven-fill-vision-slots`: Raven drafts or revises Vision slots from source
  summaries and conversation context.
- `raven-bank-vision`: Raven assembles approved Vision slots into the accepted
  Source of Truth document.
- `raven-bank-subject`: later generalized version for future Knowledge Bank
  subjects.
- `raven-source-of-truth`: Raven assembles the accepted banked subjects into the
  source-of-truth document.
- `build-library-from-source-of-truth`: later builder step that turns the
  source-of-truth document into library cards.

Raven may write the source-of-truth document only if the play contract allows
it. Raven should not write final library cards.

The builder step can use the Conan/Sam split later, but this plan should not
depend on names being final in UI copy.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| AX2 config | `packages/ax-next/src/domain/config.ts` | Config accepts and preserves `sourcesPath` and Raven onboarding state |
| AX2 runtime | `packages/ax-next/src/effects/runtime-server.ts` | Viewer can read and mutate source and Raven onboarding state through local APIs |
| AX2 projection | `packages/ax-next/src/domain/project-state.ts` and runtime schemas | Project state exposes source inventory, Raven connection/power-up status, and play unlocks |
| AX2 tests | `packages/ax-next/tests/*.test.ts` | Deterministic coverage for config parsing, mutation, runtime endpoints, and state projection |
| Viewer Next | `packages/viewer-next/src/app`, `src/components`, `src/styles/global.css` | New Home, agent shelf Quick Bar, Vision onboarding, and Knowledge Bank status UI |
| Viewer runtime client | `packages/viewer-next/src/app/runtime/*` | Typed Effect-backed local API calls for source and Raven state |
| Viewer e2e | `packages/viewer-next/tests/*.spec.ts` | Browser coverage for Home, agent shelf, source adding, Vision slot approval/skipping, Knowledge Bank, and locked Playbook |
| Next plugin | `packages/alexandria-next-plugin/skills`, `agents`, `workflows` | Guided plays for processing sources, filling Vision slots, banking Vision, and producing source-of-truth |

## Changed Behavior Surfaces

| Surface | Change | Follow-up |
|---------|--------|-----------|
| Raven onboarding | Moves from long library wizard to Home-driven Vision power-up | Update viewer and plugin docs |
| Sources | Moves from abstract depth sliders to shared concrete source inventory | Add AX2 config and runtime mutation tests |
| Knowledge Bank | Becomes durable checklist/status state, not prototype-only HTML or a parallel Library | Add viewer e2e and state projection tests |
| Playbook | Unlocks from context availability, not static nav enablement | Keep top nav locked until computed unlocks exist |
| Logo upload | Removed from Raven onboarding path | Reintroduce later as product identity/personalization if needed |

## First Implementation Slice

Build the narrowest real Raven onboarding loop: durable state, navigable
surfaces, manual Vision slot review, source intake, and Vision banking. This
slice should make the product flow true without requiring full Raven
intelligence or library atomization yet.

In scope:

1. AX2 state and reducers
   - Add `workspacePath`, `sourcesPath`, and optional `agents.raven`.
   - Add source event reducers and atomic rewrite for `sourcesPath`.
   - Add Raven Vision, Knowledge Bank, and Source of Truth reducers.
   - Persist Raven state in `alexandria-config.json`.
   - Project source inventory and Raven onboarding through runtime state.
2. Source intake MVP
   - Add a file source.
   - Add a URL source by fetching it into `docs/alexandria/sources/originals/`.
   - Add a typed note by saving Markdown into
     `docs/alexandria/sources/originals/`.
   - Keep `source_code` in the schema, but do not implement source-code
     processing yet.
   - Do not implement remove/delete semantics yet.
3. Home and agent shelf
   - Show Raven's inert coin when the plugin is not connected.
   - Show Raven's glowing coin and `Power up Raven: Vision` when connected.
   - Open Raven's Quick Bar from the coin.
   - Include `Knowledge Bank` and `Ping Raven` in the Quick Bar.
4. Vision onboarding UI
   - Open directly from `Power up Raven: Vision`.
   - Show source adding at the top.
   - Render nine Vision slot cards from a static manifest.
   - Always allow the user to manually type or edit slot text. This is a
     permanent product capability, not a fallback for missing Raven behavior.
   - Support approve and skip actions. Skip clears text.
   - Disable `Bank Vision` until the reducer projects `ready_to_bank`.
5. Source of Truth and banking
   - Generate a simple Raven Source of Truth Markdown document from approved
     slot text.
   - Append `raven.source_of_truth.updated`.
   - Append `raven.vision.banked`.
   - Show Vision as banked in Raven's Knowledge Bank.
6. Knowledge Bank status screen
   - Open from Raven's Quick Bar and after banking Vision.
   - Show Vision as banked.
   - Show future subjects as grayed out from the static subject manifest.
   - Do not generate library cards.

Out of scope:

- Real Raven source processing and summary generation.
- Source-code processing.
- Source deletion/removal behavior.
- Multi-agent connection modeling.
- Library card atomization.
- Full Playbook UI.
- Logo upload.
- Dynamic slot-to-source attribution.
- Multiple Knowledge Bank subjects beyond Vision.
- Sophisticated Source of Truth authoring.

## Implementation Phases

### Phase 1: State Contract

1. Extend `AlexandriaNextConfig` with `sourcesPath` and optional
   `agents.raven`.
2. Add parse/serialize coverage for missing, partial, and populated Raven state
   plus source projection path handling.
3. Add config mutation helpers that preserve existing fields.
4. Add projected source inventory, Raven connection status, and Raven onboarding
   state to `ax2 inspect state --json`.
5. Add focused AX2 tests.

### Phase 2: Runtime API

1. Add local runtime endpoints for reading and mutating Raven onboarding state.
2. Append ledger events for explicit source/knowledge changes.
3. Add runtime server tests for the endpoints.
4. Update Viewer Next runtime schemas and client operations.

### Phase 3: Viewer UX

1. Replace the old onboarding rail with Home plus the bottom agent shelf.
2. Build Raven's inert/glowing coin states and Quick Bar.
3. Build the Vision onboarding screen with source adding and nine slot cards.
4. Build the Knowledge Bank status screen using the prototype visual language.
5. Wire play unlock status into the Playbook nav lock.
6. Add Storybook stories and Playwright e2e coverage.

### Phase 4: Raven Plays

1. Add `source-process`, `raven-fill-vision-slots`, and `raven-bank-vision`
   play contracts.
2. Add source-of-truth generation as an explicit play output.
3. Wire play intents from viewer actions where appropriate.
4. Validate plugin structure.

### Phase 5: Builder Handoff

1. Define the builder input contract for the source-of-truth document.
2. Add the later play that converts source-of-truth into library card work.
3. Keep actual card writing out of Raven's responsibility.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX2 config/state | `cd packages/ax-next && bun test tests/init.test.ts tests/state.test.ts` | Proves config remains compatible and projected state includes Raven onboarding |
| AX2 runtime | `cd packages/ax-next && bun test tests/runtime-server.test.ts tests/viewer.test.ts` | Proves local runtime endpoints work for viewer |
| AX2 typecheck | `cd packages/ax-next && pnpm exec tsc --noEmit -p tsconfig.json` | Catches config and projection type drift |
| Viewer runtime tests | `cd packages/viewer-next && bun test src/app/runtime/client.test.ts` | Proves runtime schemas decode Raven state |
| Viewer e2e | `cd packages/viewer-next && pnpm run test:e2e` | Proves browser nav, source cards, Knowledge Bank, and Playbook lock states |
| Viewer check | `cd packages/viewer-next && pnpm run check` | Runs Astro/TypeScript checks |
| Plugin validation | `cd packages/alexandria-next-plugin && claude plugin validate .` | Required if new play skills/workflows are added |
| Markdown lint | repo markdown lint for changed plan/docs/skills | Keeps plan and skill docs valid |

## Eval Impact

| Surface | Existing coverage | Action |
|---------|-------------------|--------|
| AX2 config/runtime | Deterministic Bun tests | Add focused tests; no LLM eval needed |
| Viewer Next | Playwright and Storybook paths | Add e2e coverage; no LLM eval needed |
| Alexandria Next Raven plays | No mature Next-specific eval harness yet | Add deterministic plugin validation now; create a Next Raven eval case when the Next eval harness exists |
| Alexandria 1 `/ax-library` | Existing initialize evals cover old behavior | No rerun unless Alexandria 1 skills are touched |

If this work modifies Alexandria 1 Raven or initialize skills, run the relevant
existing evals. The intended path is to avoid touching those files.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| `alexandria-config.json` becomes a dumping ground | Keep only current product state and pointers in config; store large prose in workspace documents |
| Config writes lose existing fields | Add parse/serialize/mutation tests that preserve `workspacePath`, `sourcesPath`, `codex`, and future optional branches |
| Source cards duplicate inbox discovery | Treat inbox files as discoverable sources; `sourcesPath` stores the projected current source inventory |
| Viewer constants drift from play definitions | Keep play IDs and names in AX2/plugin manifests; viewer renders projected unlocks |
| The UI still feels like a wizard | Remove numeric rail and make Home, agent shelf, and Vision power-up the primary flow |
| Raven appears useful before she has context | Keep clear locked/limited states and show why plays are unavailable |
| Knowledge Bank looks like a second Library | Make it a checklist/status page with source-of-truth references, not atomized cards |
| Source-of-truth ownership blurs into library card writing | Make source-of-truth the boundary output; builder play owns card creation |
| Sliders re-enter as "source depth" | Derive readiness from real source count/read status instead of user-rated depth |

## Acceptance Criteria

1. Fresh Alexandria Next projects open Home without a long phase wizard.
2. Raven's coin starts inert until the runtime sees an Alexandria Next plugin
   connection.
3. After connection, Raven's coin glows and Home offers `Power up Raven:
   Vision`.
4. Clicking `Power up Raven: Vision` opens the Vision onboarding sequence with
   source adding at the top and nine Vision slots.
5. Source adding has no sliders and writes generic `SourceItem`s to the
   `sourcesPath` projection.
6. Each Vision slot can be manually edited, approved, or skipped.
7. Vision can be banked only when every slot is approved or skipped and at least
   one slot has approved content.
8. Banking Vision records source-of-truth metadata, marks Vision banked in
   Raven's Knowledge Bank, and appends a ledger
   event.
9. Raven's Knowledge Bank shows Vision banked and future subjects grayed out.
10. Playbook remains locked until computed Raven play unlocks exist.
11. Logo upload is absent from Raven onboarding.
12. Deterministic AX2 and Viewer Next tests cover the state and UI paths.

## Deferred Follow-Ups

- Product identity/logo personalization outside Raven onboarding.
- Full Playbook browser with callable plays and run history.
- Builder play implementation for converting source-of-truth into library
  cards.
- Future agent unlocks beyond Raven.
- Rich source ingestion for remote URLs and authenticated services.
- Next-specific LLM eval harness for Raven play quality.
