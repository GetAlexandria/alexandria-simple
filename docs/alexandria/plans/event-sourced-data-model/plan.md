# Alexandria Next Event-Sourced Data Model

- Status: draft for product and engineering review
- Issue: none yet
- Goal: define the target Alexandria Next data model, the event catalog that
  constructs mutable state, and the implementation path for replacing the
  current partial config/projection-backed model.

## Summary

Alexandria Next should treat almost everything as one of four things:

1. Static product catalog or configuration.
2. Durable content files on disk.
3. Append-only ledger events.
4. Projections derived from the first three.

Mutable domain state should be constructed through the ledger. This does not
mean every markdown byte must live inside the ledger. Source files, Source of
Truth documents, and Atomic Cards can remain files on disk. It does mean every
current domain mutation that creates, freezes, changes, or links those files is
represented by an event with stable ids, artifact paths, hashes, and causation.

There is no backwards-compatibility requirement. No one is actively using
`ax2`, so the implementation can remove obsolete event types, delete
config-backed persisted Raven state, rename models, and rewrite projections
directly.

## Core Decisions

1. Rename `KnowledgeBaseArea` to `KnowledgeBankArea`.
2. Rename `knowledgeBaseAreas` to `knowledgeBankAreas`.
3. Rename `requiredKnowledgeBaseAreaIds` to `requiredKnowledgeBankAreaIds`.
4. Play eligibility requires every required `KnowledgeBankArea` to be `banked`.
   `available` is not sufficient.
5. A `KnowledgeBankArea` is `banked` when the Library contains one or more
   active Atomic Cards for that agent and area.
6. `KnowledgeBankArea` status is a projection. It is not directly mutated.
7. `Playbook`, `Play`, and `Move` remain static/derived catalog models.
8. `PlayRun` remains the event-derived replacement for the removed
   `PlayIntent` model.
9. Raven Vision onboarding becomes a specific `AidTemplate` and
   `SourceConversion` flow, not a special persisted state tree in config.
10. Mutable model changes happen through ledger events. Projection files are
    caches only and must be rebuildable or removable.
11. Atomic Card events carry metadata only. Card markdown content lives in the
    card file.
12. `KnowledgeBankArea.locked` can be resolved by prerequisite Atomic Cards.
    Unlocking does not require completing a new SourceConversion.
13. Completing a SourceConversion freezes a SourceOfTruth. It does not directly
    create Atomic Cards.
14. A future AtomicCardCreation Play converts a frozen SourceOfTruth into
    Atomic Cards.
15. SourceOfTruth artifacts are immutable once frozen. There is no current
    supersede/archive lifecycle; add one only when behavior needs it.
16. `banked` is reserved for KnowledgeBankArea/card-coverage state.

## Source Of Truth Boundaries

| Concept | Source of truth | Notes |
| --- | --- | --- |
| Project bootstrap config | `.alexandria-next/config.json` plus `project.initialized` event | Config should be minimal: workspace path, source path defaults, runtime preferences. Domain progress does not live here. |
| Inbox | Filesystem drop zone | Inbox files are unregistered inputs until accepted as SourceMaterial. |
| Library | Filesystem content tree plus static taxonomy | The Library is a projection over card files, taxonomy, and card mutation events. |
| Zone / Plane / Area catalog | Static config or plugin manifest | Example: the Product Zone has three Planes. These do not change per project. |
| Agent catalog | Static manifest | Raven exists as an agent definition. Agent runtime work is modeled through runs/conversions. |
| KnowledgeBank | Agent projection | A Knowledge Bank is an agent-scoped grouping of KnowledgeBankAreas. It is not independently mutated. |
| KnowledgeBankArea definition | Static manifest | Agent-scoped area definition, usually tied to a static Library Area. |
| KnowledgeBankArea status | Projection from Atomic Card files, SourceOfTruth files, prerequisite rules, and SourceConversion events | `banked` comes from active cards on disk. `ready_for_atomization` comes from frozen SourceOfTruth with no cards yet. `in_progress` comes from open conversions. `locked` can clear when prerequisite cards exist. |
| Playbook / Play / Move | Static play manifest plus Fabro workflow files | Moves are static derived views of workflow nodes, not runtime stage state. |
| PlayRun | Ledger events plus optional live Fabro overlay | Alexandria records product-level run history and Fabro pointers. Fabro owns detailed execution. |
| SourceMaterial | File on disk plus ledger event | The file stores content. The event records identity, path, hash, and metadata. |
| SourceConversion | Ledger events | In this slice, SourceConversion turns SourceMaterial into frozen SourceOfTruth. |
| AidTemplate | Static manifest | Template for how a SourceConversion proceeds. |
| Aid progress | Ledger events | Step/slot/stage progress is event-sourced. |
| SourceOfTruth | Immutable file on disk plus ledger event | The event records the artifact identity, path, hash, area, and originating conversion. Once frozen, the document is not edited in place. |
| AtomicCard | File on disk plus ledger event | Card files define banked knowledge. Events explain how cards were created or changed. |
| Ledger | Append-only JSONL event log | The only durable mutation log for product state. |
| Projection files | Rebuildable cache | `sources.jsonl` style files should not be authoritative. |
| Runtime metadata and cursors | Operational files | These can remain mutable operational state, but should not carry domain state. |

## Target Data Model

### AlexandriaProject

Purpose: project-level bootstrap and projection root.

Persistence:

- `.alexandria-next/config.json` for bootstrap only.
- `project.initialized` as the first domain event when a project is created.

Shape:

```ts
interface AlexandriaProject {
  schemaVersion: 1;
  workspacePath: string;
  ledgerPath: string;
  sourcesPath: string;
  libraryPath: string;
  initializedAt?: string;
}
```

Changes:

- Remove Raven onboarding, Knowledge Bank, and Source of Truth progress from
  project config.
- Keep config limited to paths and runtime defaults.

Events that construct it:

- `project.initialized`
- `project.config.updated`, only if later project-level settings become
  mutable product state.

### Inbox

Purpose: project-local intake area for files the user has dropped into
Alexandria but has not necessarily accepted into the domain model.

Persistence: filesystem only.

Shape:

```ts
interface InboxSource {
  path: string;
  inboxRelativePath: string;
  contentHash: string;
}
```

Changes:

- Keep Inbox as a file projection.
- Do not treat every file appearing in Inbox as a durable SourceMaterial.
- Accepting an Inbox file into the workflow appends `source_material.added`.

Events that construct it: none. Inbox files are discovered from disk.

### Atomic Card Categories

Purpose: define the stable Category vocabulary used by Atomic Cards.

Persistence: static config or plugin manifest.

Shape:

```ts
interface AtomicCardCategory {
  id: AtomicCardCategoryId;
  label: string;
  order: number;
  folderName: string;
}
```

Changes:

- Make AtomicCardCategory an explicit static catalog concept.
- Replace the AtomicCard `libraryAreaId` field with `categoryId`.
- Do not persist per-project copies.
- Do not add status fields here.

Events that construct it: none.

### Library

Purpose: the project knowledge store made of Atomic Cards organized by the
static Category vocabulary.

Persistence:

- Card markdown files on disk.
- Static Category manifest.
- Ledger events for card creation and updates.

Shape:

```ts
interface Library {
  categories: AtomicCardCategory[];
  atomicCards: AtomicCard[];
}
```

Changes:

- Make Library a first-class projection in `ax2 inspect state --json`.
- Keep card content as files, not config.
- Use ledger events to record card mutations and source lineage.
- Card presence can still satisfy `banked` status because the product rule is
  file-based.

Events that construct it:

- `atomic_card.created`
- `atomic_card.updated`

### Agent

Purpose: static Alexandria actor that can own a Knowledge Bank and run plays.

Persistence: static manifest.

Shape:

```ts
interface Agent {
  id: AgentId;
  name: string;
  jobTitle: string;
  status: "available" | "locked";
  knowledgeBankAreaIds: KnowledgeBankAreaId[];
}
```

Changes:

- Keep Raven static.
- Do not store agent progress in config.

Events that construct it: none.

### KnowledgeBank

Purpose: agent-scoped projection of banked and in-progress knowledge.

Persistence: none. It is derived from static Agent/KnowledgeBankArea manifests,
SourceConversion events, and Atomic Card files/events.

Shape:

```ts
interface KnowledgeBank {
  agentId: AgentId;
  areaIds: KnowledgeBankAreaId[];
  areas: KnowledgeBankArea[];
  updatedAt?: string;
}
```

Changes:

- Replace Raven-specific Knowledge Bank config state with this generic
  projection.
- Make Raven Knowledge Bank UI a filtered view of `knowledgeBanks` and
  `knowledgeBankAreas`.

Events that construct it:

- `source_conversion.started`
- `source_conversion.completed`
- `source_conversion.failed`
- `source_of_truth.frozen`
- `atomic_card.created`
- `atomic_card.updated`

### KnowledgeBankArea

Purpose: agent-scoped knowledge area used for play eligibility and work
planning.

Persistence:

- Definition from static manifest.
- Status from projection.

Shape:

```ts
type KnowledgeBankAreaStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "ready_for_atomization"
  | "banked";

interface KnowledgeBankArea {
  id: KnowledgeBankAreaId;
  agentId: AgentId;
  completionCategoryIds: AtomicCardCategoryId[];
  label: string;
  prerequisiteKnowledgeBankAreaIds: KnowledgeBankAreaId[];
  status: KnowledgeBankAreaStatus;
  activeCardCount: number;
  activeSourceConversionIds: SourceConversionId[];
  frozenSourceOfTruthIds: SourceOfTruthId[];
  cardPaths: string[];
}
```

Status rules:

- `banked`: one or more active Atomic Cards exist on disk for at least one of
  this area's `completionCategoryIds`.
- `ready_for_atomization`: no active cards exist, but at least one frozen
  SourceOfTruth exists for this area.
- `in_progress`: no active cards and no frozen SourceOfTruth exist, but at
  least one active `SourceConversion` targets this area.
- `available`: no active cards and no active conversion, but the area can be
  worked on. For an area with prerequisites, this requires those prerequisite
  areas to be `banked`.
- `locked`: static prerequisites are unmet or the area is not available for the
  current agent. If the only lock condition is missing prerequisite knowledge,
  the area unlocks automatically when the prerequisite Atomic Cards exist.

Changes:

- Rename from `KnowledgeBaseArea`.
- Replace all `knowledgeBaseArea*` property names with `knowledgeBankArea*`.
- Remove any direct persisted status from config.
- Replace current play eligibility of `available || banked` with `banked`.

Events that construct it:

- `source_conversion.started`
- `source_conversion.completed`
- `source_conversion.failed`
- `source_of_truth.frozen`
- `atomic_card.created`
- `atomic_card.updated`

The projection must also scan the Library card tree instead of treating a
projection cache as authoritative.

Unlock rule:

```text
KnowledgeBankArea.status can move from "locked" to "available"
when every prerequisiteKnowledgeBankAreaId is "banked".
```

Status precedence:

```text
banked > ready_for_atomization > in_progress > available > locked
```

### Playbook

Purpose: static catalog of plays available in this Alexandria Next install.

Persistence: none.

Shape:

```ts
interface Playbook {
  plays: Play[];
}
```

Events that construct it: none.

### Play

Purpose: product metadata for a runnable workflow.

Persistence: static manifest plus derived workflow graph.

Shape:

```ts
interface Play {
  id: PlayId;
  name: string;
  description?: string;
  defaultAgentId: AgentId;
  requiredKnowledgeBankAreaIds: KnowledgeBankAreaId[];
  workflow: {
    engine: "fabro";
    targetPath: string;
    graphPath?: string;
  };
  moves: Move[];
  transitions: MoveTransition[];
}
```

Changes:

- Rename `requiredKnowledgeBaseAreaIds` to
  `requiredKnowledgeBankAreaIds`.
- Enforce banked-only eligibility in CLI/runtime and viewer.
- Add a minimal placeholder Play that requires Vision. This is a product
  placeholder for eligibility wiring only.
- Do not convert Raven Vision SourceConversion into a Play in this slice.
- Do not add the SourceOfTruth atomization Play in this slice. That is a later
  slice.

Events that construct it: none.

### Move

Purpose: static Alexandria view of a Fabro workflow node.

Persistence: none. Derived from the Fabro graph file referenced by a Play.

Shape stays compatible with PR 222 except naming around knowledge bank areas is
updated on the parent Play.

Events that construct it: none.

### PlayRun

Purpose: product-level wrapper around one execution of a Play.

Persistence: ledger events.

Shape:

```ts
type PlayRunStatus =
  | "submitted"
  | "running"
  | "needs_human_feedback"
  | "succeeded"
  | "failed"
  | "dead"
  | "unknown";

interface PlayRun {
  id: PlayRunId;
  playId: PlayId;
  agentId: AgentId;
  status: PlayRunStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  fabroRunId?: string;
  fabroStatus?: string;
  workflowTargetPath?: string;
  workflowGraphPath?: string;
  error?: string;
}
```

Changes:

- Keep `PlayRun`.
- Keep `PlayIntent` deleted.
- Add an event for observed/intermediate status if Alexandria needs durable
  non-terminal status history.
- Do not link `PlayRun` to `SourceConversion` in this slice.

Events that construct it:

- `play.started`
- `play.status_observed`
- `play.completed`
- `play.failed`

### SourceMaterial

Purpose: a durable source supplied by a user or agent.

Persistence:

- Original/captured file on disk.
- Ledger event records identity and metadata.

Shape:

```ts
type SourceMaterialStatus =
  | "available"
  | "in_conversion"
  | "converted"
  | "failed";

interface SourceMaterial {
  id: SourceMaterialId;
  kind: "file" | "url" | "note" | "source_code";
  title: string;
  path: string;
  contentHash: string;
  addedBy: "user" | "agent";
  addedAt: string;
  updatedAt: string;
  status: SourceMaterialStatus;
}
```

Changes:

- Rename current `SourceItem`/`source.added` language to
  `SourceMaterial`/`source_material.added` unless there is a concrete reason
  to keep the shorter name.
- Derive source status from conversion events, not a projection file.
- Treat `sources.jsonl` as removable/rebuildable.

Events that construct it:

- `source_material.added`
- `source_conversion.started`
- `source_conversion.completed`
- `source_conversion.failed`

### AidTemplate

Purpose: static template for a conversion procedure. Raven Vision is one
AidTemplate.

Persistence: static manifest.

Shape:

```ts
type AidInputKind = "source_material" | "source_of_truth";
type AidOutputKind = "aid_text" | "source_of_truth" | "atomic_card";

interface AidTemplate {
  id: AidTemplateId;
  label: string;
  agentId: AgentId;
  targetKnowledgeBankAreaId: KnowledgeBankAreaId;
  inputKinds: AidInputKind[];
  stages: AidTemplateStage[];
  outputKinds: AidOutputKind[];
}

interface AidTemplateStage {
  id: AidStageId;
  label: string;
  kind:
    | "source_assessment"
    | "draft"
    | "human_review"
    | "source_of_truth_freeze"
    | "atomic_card_creation";
  order: number;
}
```

Changes:

- Move Raven Vision slot definitions out of persisted config and into an
  AidTemplate manifest.
- Keep the nine Vision slots as template stage or output definitions, not
  special config state.
- Defer the AidTemplate/Play for converting frozen SourceOfTruth documents into
  Atomic Cards. It is named in this plan only to keep the input/output model
  clear.

Events that construct it: none.

### SourceConversion

Purpose: mutable process that converts SourceMaterial into a frozen
SourceOfTruth for one KnowledgeBankArea through one AidTemplate.

Examples:

- Raven Vision converts SourceMaterial into a frozen SourceOfTruth.
- A future AtomicCardCreation process converts SourceOfTruth into Atomic Cards.

Persistence: ledger events.

Shape:

```ts
type SourceConversionStatus =
  | "started"
  | "ready_to_freeze"
  | "completed"
  | "failed";

interface SourceConversion {
  id: SourceConversionId;
  sourceMaterialIds: SourceMaterialId[];
  agentId: AgentId;
  knowledgeBankAreaId: KnowledgeBankAreaId;
  aidTemplateId: AidTemplateId;
  status: SourceConversionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  sourceOfTruthIds: SourceOfTruthId[];
  error?: string;
}
```

Events that construct it:

- `source_conversion.started`
- `source_conversion.source_attached`
- `source_conversion.ready_to_freeze`
- `source_conversion.completed`
- `source_conversion.failed`
- `source_of_truth.frozen`

`source_conversion.completed` should reference `sourceOfTruthIds`. The Atomic
Cards come from a later AtomicCardCreation Play.

### AidOutput

Deferred. The current slice does not need a first-class AidOutput projection or
stage/output events. Raven Vision slot progress remains in existing Raven
Vision events until the source-conversion-as-play work needs a generic aid
output model.

### SourceOfTruth

Purpose: durable synthesized document used as an intermediate source for
Atomic Cards.

Persistence:

- Markdown file on disk.
- Ledger event with path/hash/source conversion metadata.

Shape:

```ts
interface SourceOfTruth {
  id: SourceOfTruthId;
  agentId: AgentId;
  knowledgeBankAreaId: KnowledgeBankAreaId;
  sourceConversionId: SourceConversionId;
  path: string;
  contentHash: string;
  frozenAt: string;
}
```

Path convention:

```text
docs/alexandria/source-of-truth/<agent-id>/<knowledge-bank-area-id>/<source-of-truth-id>.md
```

Changes:

- Add generic `source_of_truth.frozen` metadata alongside the current Raven
  Source of Truth compatibility events.
- Source Of Truth metadata is no longer persisted under Raven config.
- Treat the SourceOfTruth file as frozen. Do not edit it in place.
- Allow Atomic Cards to reference specific quotes or spans from a frozen
  SourceOfTruth.
- Keep SourceOfTruth outside `docs/alexandria/library/` because it is an
  intermediate frozen artifact, not an Atomic Card.

Events that construct it:

- `source_of_truth.frozen`

### AtomicCard

Purpose: durable knowledge unit in the Library. Active Atomic Cards are what
make a KnowledgeBankArea `banked`.

Persistence:

- Markdown file on disk.
- Ledger event with path/hash/area/source metadata.

Shape:

```ts
interface AtomicCard {
  id: AtomicCardId;
  categoryId: AtomicCardCategoryId;
  title: string;
  path: string;
  contentHash: string;
  sourceOfTruthId?: SourceOfTruthId;
  sourceReferences: AtomicCardSourceReference[];
  sourceMaterialIds: SourceMaterialId[];
}

interface AtomicCardSourceReference {
  sourceOfTruthId: SourceOfTruthId;
  quote?: string;
  startOffset?: number;
  endOffset?: number;
}
```

Banked knowledge rule:

```text
KnowledgeBankArea.status = "banked"
when count(AtomicCard where card.categoryId in area.completionCategoryIds) > 0.
```

Changes:

- Add a first-class AtomicCard projection to `ax2 inspect state --json`.
- Add card frontmatter or parser support for `categoryId`.
- Make Vision banked status derive from cards on disk, not
  `raven.vision.banked` config state.
- Keep Atomic Card event payloads metadata-only. Markdown content lives in the
  card file.
- Let Atomic Cards refer back to frozen SourceOfTruth quotes through metadata
  and/or card frontmatter.

Events that construct it:

- `atomic_card.created`
- `atomic_card.updated`

### Event Ledger

Purpose: append-only product mutation history.

Persistence: JSONL ledger.

Envelope shape can stay close to the current schema:

```ts
interface AlexandriaStateEvent {
  schemaVersion: 1;
  id: string;
  type: AlexandriaStateEventType;
  at: string;
  actor: AlexandriaActor;
  idempotencyKey?: string;
  causationId?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}
```

Changes:

- Keep `ax2 inspect events append` as the only public append path.
- Keep `directLedgerWritesSupported: false`.
- Add schema descriptors for every event below.
- Add validation that domain mutations never update config/projection files
  without appending events.

## Event Catalog

### Project Events

| Event | Required payload | Constructs |
| --- | --- | --- |
| `project.initialized` | `workspacePath`, `ledgerPath`, `sourcesPath`, `libraryPath` | Project initialization metadata |
| `project.config.updated` | `changes`, `previousContentHash`, `nextContentHash` | Future mutable project settings, if needed |

### Source Material Events

| Event | Required payload | Optional payload | Constructs |
| --- | --- | --- | --- |
| `source_material.added` | `sourceMaterialId`, `kind`, `title`, `path`, `contentHash`, `addedBy` | `sourceUrl`, `pathType` | SourceMaterial |

### Source Conversion And Aid Events

| Event | Required payload | Optional payload | Constructs |
| --- | --- | --- | --- |
| `source_conversion.started` | `sourceConversionId`, `agentId`, `knowledgeBankAreaId`, `aidTemplateId`, `sourceMaterialIds` | none | SourceConversion, KnowledgeBankArea `in_progress` |
| `source_conversion.source_attached` | `sourceConversionId`, `sourceMaterialId` | `reason` | SourceConversion source list |
| `source_conversion.ready_to_freeze` | `sourceConversionId` | `sourceOfTruthId`, `outputIds` | Conversion ready state |
| `source_conversion.completed` | `sourceConversionId`, `sourceOfTruthIds` | none | Conversion complete state |
| `source_conversion.failed` | `sourceConversionId`, `error` | `stageId` | Conversion failed state |

### Source Of Truth Events

| Event | Required payload | Optional payload | Constructs |
| --- | --- | --- | --- |
| `source_of_truth.frozen` | `sourceOfTruthId`, `sourceConversionId`, `agentId`, `knowledgeBankAreaId`, `path`, `contentHash` | `sourceMaterialIds`, `outputIds` | SourceOfTruth frozen artifact |

SourceOfTruth content is immutable. There is no
`source_of_truth.updated` event. Correction/supersession behavior is deferred
until a current workflow needs it.

### Atomic Card Events

| Event | Required payload | Optional payload | Constructs |
| --- | --- | --- | --- |
| `atomic_card.created` | `atomicCardId`, `categoryId`, `title`, `path`, `contentHash` | `sourceOfTruthId`, `sourceMaterialIds`, `sourceReferences` | AtomicCard active artifact, KnowledgeBankArea `banked` |
| `atomic_card.updated` | `atomicCardId`, `path`, `contentHash` | `previousContentHash`, `reason` | AtomicCard updated artifact |

Atomic Card event payloads are metadata-only. They do not include full markdown
content.

### Play Run Events

| Event | Required payload | Optional payload | Constructs |
| --- | --- | --- | --- |
| `play.started` | `playRunId`, `playId`, `agentId` | `fabroRunId`, `workflowTargetPath`, `workflowGraphPath`, `acpProvider`, `status` | PlayRun |
| `play.status_observed` | `playRunId`, `playId`, `agentId`, `status` | `fabroStatus`, `fabroRunId`, `message` | Durable intermediate PlayRun status |
| `play.completed` | `playRunId`, `playId`, `agentId` | `fabroRunId`, `exitCode` | PlayRun terminal success |
| `play.failed` | `playRunId`, `playId`, `agentId`, `error` | `fabroRunId`, `exitCode` | PlayRun terminal failure |

### Canvas And Session Events

Keep the existing canvas and session wake events if they remain product
surface events:

- `canvas.step.saved`
- `canvas.review.requested`
- `session.wake.requested`
- `session.wake.delivered`
- `session.wake.failed`

They already fit the ledger model. Review only their payload names and whether
they need `playRunId` or `aidTemplateId` links for the new model.

### Events To Remove Or Replace

| Current event/model | Target |
| --- | --- |
| `KnowledgeBaseArea` | `KnowledgeBankArea` |
| `knowledgeBaseAreas` | `knowledgeBankAreas` |
| `requiredKnowledgeBaseAreaIds` | `requiredKnowledgeBankAreaIds` |
| `source.added` | `source_material.added` |
| `assessment.recorded` | Keep until the source-conversion-as-play slice defines generic progress events |
| `raven.vision.started` | `source_conversion.started` with `aidTemplateId: "raven-vision"` |
| `raven.vision.source_attached` | `source_conversion.source_attached` |
| `raven.vision.drafting_requested` | Keep until the source-conversion-as-play slice exists |
| `raven.vision.slot.updated` | Keep until the source-conversion-as-play slice exists |
| `raven.vision.slot.approved` | Keep until the source-conversion-as-play slice exists |
| `raven.vision.slot.skipped` | Keep until the source-conversion-as-play slice exists |
| `raven.source_of_truth.updated` | Keep as Raven compatibility event alongside `source_of_truth.frozen` |
| `raven.vision.banked` | Keep as Raven compatibility event alongside `source_of_truth.frozen` plus `source_conversion.completed` |
| `PlayIntent` and `play.intent.*` | Already removed by PR 222. Do not reintroduce. |

## Construction Matrix

| Projection field | Static sources | File sources | Event sources | Rule |
| --- | --- | --- | --- | --- |
| `agents` | Agent manifest | none | none | Static list. |
| `inboxSources` | none | Inbox directory | none | Discovered file projection only. |
| `library` | AtomicCardCategory manifest | Card markdown files | AtomicCard events | Library content projection. |
| `atomicCardCategories` | AtomicCardCategory manifest | none | none | Static list. |
| `knowledgeBanks` | Agent and KnowledgeBankArea manifests | Atomic Card files | SourceConversion and AtomicCard events | One KnowledgeBank per agent. |
| `knowledgeBankAreas` | Agent and KnowledgeBankArea manifests | Atomic Card and SourceOfTruth files | SourceConversion, SourceOfTruth, and AtomicCard events | Status from matching card categories first, then frozen SourceOfTruth, then active conversion, then availability/lock rules. |
| `playbook` | Play manifest | Fabro workflow files | none | Static/derived catalog. |
| `playRuns` | Play and Agent manifests | none | Play events | Reduce by `playRunId`. |
| `sourceMaterials` | none | Original source files | SourceMaterial and SourceConversion events | Event records identity; file/hash validates content. |
| `sourceConversions` | AidTemplate manifest | artifacts referenced by events | SourceConversion and SourceOfTruth events | Reduce by `sourceConversionId`. |
| `aidTemplates` | AidTemplate manifest | none | none | Static list. |
| `sourceOfTruths` | none | Source of Truth markdown files | SourceOfTruth events | Frozen SourceOfTruth metadata from events. |
| `atomicCards` | Library taxonomy | Card markdown files | AtomicCard events | Cards from disk plus event lineage. |
| `ledger` | none | ledger JSONL | ledger JSONL | Event count and last event metadata. |
| `canvas` | none | none | Canvas events | Existing event projection. |
| `raven` | Agent/AidTemplate manifests | cards/artifacts | generic events | Raven becomes a filtered view over Agent, KnowledgeBankArea, and SourceConversion state. |

## Artifact Mutation Contract

Mutable content files are allowed, but mutation commands must treat the ledger
as the domain mutation record.

Recommended write flow:

1. Validate the requested mutation.
2. Compute deterministic ids, target paths, and content hashes.
3. Write artifact content to a temporary path.
4. Append the ledger event with artifact path and content hash.
5. Commit the artifact by renaming the temporary path into place.
6. Rebuild or refresh projections from ledger plus files.

Retry behavior:

- Use stable idempotency keys.
- If the event already exists and the artifact exists with the expected hash,
  return success.
- If the event exists but the artifact is missing, re-materialize when the
  command has the content available, or return a validation error.
- If an artifact exists without a corresponding event, `ax2 inspect state`
  may still count Atomic Cards for
  KnowledgeBankArea `banked` status because the product rule is file presence,
  but the unlogged mutation must be visible.

## Implementation Plan

### 1. Start From The PR 222 Model

Update the implementation branch to include PR 222 before coding this change.
The target assumes:

- `PlayIntent` is gone.
- `Playbook`, `Play`, `Move`, and `PlayRun` exist.
- `play.started`, `play.completed`, and `play.failed` are already modeled.

### 2. Rename KnowledgeBaseArea To KnowledgeBankArea

Touch areas:

- `packages/ax-next/src/domain/plays.ts`
- `packages/ax-next/src/domain/project-state.ts`
- `packages/ax-next/src/domain/state-events.ts`
- `packages/viewer-next/src/app/runtime/schemas.ts`
- `packages/viewer-next/src/components/library/PlaybookView.tsx`
- Current tests and fixtures that mention `KnowledgeBaseArea`.

Required changes:

- Rename types, constants, state fields, schema fields, UI labels, and tests.
- Rename `requiredKnowledgeBaseAreaIds` to
  `requiredKnowledgeBankAreaIds`.
- Update viewer and runtime eligibility to require `status === "banked"`.

### 3. Add Static Library Taxonomy And Card Projection

Add domain modules for:

- AtomicCardCategory catalog.
- Atomic Card metadata parser.
- Library card scanner.
- Active card projection grouped by `categoryId`.

Acceptance:

- `ax2 inspect state --json` includes `atomicCards`.
- `knowledgeBankAreas[].status` becomes `banked` when at least one active card
  exists in one of the area's completion categories.
- `knowledgeBankAreas[].status` becomes `ready_for_atomization` when at least
  one frozen SourceOfTruth exists for that agent/area and no active cards exist.
- A missing or malformed card reports validation detail without crashing the
  whole state load unless the corruption makes the projection unsafe.

### 4. Replace Config-Backed Raven State With Event Projections

Remove persisted Raven state from `.alexandria-next/config.json`:

- Raven Vision onboarding state.
- Raven Source of Truth metadata.
- Raven Knowledge Bank state.

Replace it with:

- AidTemplate manifest for Raven Vision.
- SourceConversion projection.
- SourceOfTruth projection.
- AtomicCard projection.
- Raven-specific viewer projection derived from the generic models.

Acceptance:

- Runtime state can be rebuilt from an empty config, ledger events, and files.
- No domain progress is written back to config after appending events.

### 5. Replace Event Schema With The Target Catalog

Update:

- `ALEXANDRIA_STATE_EVENT_TYPES`
- payload schemas
- schema descriptor output
- append validation
- tests for event parsing and append
- plugin skills that instruct agents how to append events

Because there is no compatibility requirement, remove obsolete Raven-specific
events instead of supporting both names.

Acceptance:

- `ax2 inspect events schema --json` lists the new catalog.
- `ax2 inspect events append` accepts each new event with valid payloads and
  rejects malformed payloads.
- Direct ledger writes remain unsupported.

### 6. Rework Source Intake

Replace current `SourceItem` projection with `SourceMaterial`.

Required behavior:

- Source create writes/captures the source file and appends
  `source_material.added`.
- Source status derives from SourceConversion events.
- Any `sources.jsonl` cache is either removed or regenerated only as a cache.
- Endpoints read from ledger/file projections, not projection files.

Acceptance:

- Source list endpoints and viewer state agree with `ax2 inspect state --json`.
- Deleting `sources.jsonl` does not lose state.

### 7. Add SourceConversion And Aid Runtime Paths

Implement reducers and runtime commands for:

- starting a conversion
- attaching sources
- marking ready to freeze
- completing/failing conversions

Map Vision banking onto this generic model. Leave Raven Vision drafting and
slot-review events in their current Raven-specific form until the
source-conversion-as-play slice.

Acceptance:

- Raven Vision UI no longer depends on Raven-specific config state.
- The active conversion for `raven:vision` makes the KnowledgeBankArea
  `in_progress`.

### 8. Add SourceOfTruth Freezing

Implement artifact writers and events for:

- `source_of_truth.frozen`

For Vision SourceConversion, the final action should concatenate approved
Vision slots, write a frozen SourceOfTruth file, append
`source_of_truth.frozen`, and complete the SourceConversion. It should not
create Atomic Cards.

Acceptance:

- Completing Vision SourceConversion creates a frozen SourceOfTruth file.
- The SourceOfTruth event records path/hash metadata only.
- The SourceOfTruth file is never edited in place.
- `source_conversion.completed` references the created SourceOfTruth.

### 9. Add Placeholder Vision-Prerequisite Play

Add one minimal placeholder Play that requires Vision Atomic Cards. Use:

```ts
const PLACEHOLDER_PLAY_ID = "vision-prerequisite-placeholder";
```

Required behavior:

- The Play has `requiredKnowledgeBankAreaIds: ["vision"]`.
- The Play is not the Raven Vision SourceConversion flow.
- The Play is not the future SourceOfTruth atomization flow.

Acceptance:

- The placeholder Play is waiting while Vision is `available`,
  `in_progress`, or `ready_for_atomization`.
- The placeholder Play becomes eligible only when Vision is `banked`.
- This slice does not implement AtomicCardCreation.

### 10. Tighten PlayRun Eligibility

Keep PR 222 PlayRun behavior and add:

- `play.status_observed`
- stricter launch eligibility based on banked knowledge
- no SourceConversion linkage in this slice

Acceptance:

- Starting a play that requires Vision fails while Vision is `available` or
  `in_progress`.
- Starting a play that requires Vision succeeds when Vision is `banked`.

### 11. Update Viewer Next

Update runtime schemas and UI components:

- `RuntimeKnowledgeBankAreaSchema`
- `PlaybookView`
- Raven Knowledge Bank status view
- source/conversion progress surfaces
- any labels that still say Knowledge Base Area

Acceptance:

- The Playbook tab shows required Knowledge Bank Areas.
- Eligibility says waiting until required areas are `banked`.
- Raven Knowledge Bank status is tied to cards/conversions, not config.

### 12. Remove Obsolete Surfaces

Delete or rewrite:

- Raven config reducers.
- Raven-specific event schemas.
- `sources.jsonl` as authoritative state.
- projection file reads used as state source.
- tests that assert `available` counts as play eligibility.
- docs and skills that mention `KnowledgeBaseArea`.

## Test Plan

Deterministic tests:

- Event schema validation for every new event.
- Event reducer tests for SourceMaterial.
- Event reducer tests for SourceConversion and AidOutput.
- Artifact projection tests for SourceOfTruth and AtomicCard files.
- KnowledgeBankArea status projection tests:
  - no cards, no conversion -> `available`
  - open conversion, no cards -> `in_progress`
  - frozen SourceOfTruth, no cards -> `ready_for_atomization`
  - one active card -> `banked`
  - locked prerequisite -> `locked`
- Playbook eligibility tests:
  - `available` does not satisfy requirement
  - `in_progress` does not satisfy requirement
  - `ready_for_atomization` does not satisfy requirement
  - `banked` satisfies requirement
- Runtime source create tests prove state survives deleting projection caches.
- Runtime Vision SourceConversion tests prove completion writes a frozen
  SourceOfTruth and the corresponding events.
- Viewer schema tests for renamed fields.

Manual/browser checks:

- Initialize a clean project.
- Add a Vision source.
- Start Raven Vision conversion.
- Approve outputs.
- Complete Vision SourceConversion.
- Confirm a frozen SourceOfTruth exists on disk with the expected hash.
- Confirm `ax2 inspect state --json` shows `raven:vision` as
  `ready_for_atomization`.
- Add or fixture one active Vision Atomic Card.
- Confirm `ax2 inspect state --json` shows `raven:vision` as `banked`.
- Confirm the placeholder Play requiring Vision is eligible only after the
  Atomic Card exists.

## Eval Impact

This changes Alexandria Next product behavior, runtime state, plugin skills, and
agent-facing event append guidance.

Before merging implementation:

- Run affected Alexandria Next skill evals for event append guidance.
- Run Raven Vision drafting/elicitation evals if those skills are rewritten to
  emit generic SourceConversion events.
- Run targeted viewer/runtime tests for Playbook, Raven Knowledge Bank, and
  source intake.

## Resolved Review Decisions

1. Atomic Card events include metadata only. Full markdown content remains in
   the card file.
2. `KnowledgeBankArea.locked` can be unlocked by prerequisite cards. It does
   not require completing a SourceConversion.
3. SourceConversion completion freezes a SourceOfTruth, not Atomic Cards.
4. Atomic Cards are created by a future SourceOfTruth atomization Play.
5. SourceOfTruth remains a visible model and file-backed artifact. It is frozen
   after creation and should not be edited in place.
6. KnowledgeBankArea prerequisites are area-level: at least one active Atomic
   Card in the prerequisite area is enough.
7. SourceOfTruth atomization is not part of this slice, so this plan does not
   choose whether it is a SourceConversion or a separate run model.
8. Raven Vision SourceConversion is not currently structured as a Play. Do not
   fix that in this slice.
9. Add a minimal placeholder Play that requires Vision; new real Plays will be
   added in later slices.
10. Frozen SourceOfTruth files live under
    `docs/alexandria/source-of-truth/<agent-id>/<knowledge-bank-area-id>/`.
11. Use `vision-prerequisite-placeholder` as the minimal placeholder Play id.

## Deferred Future Questions

1. Whether the future AtomicCardCreation flow should be a SourceConversion or a
   separate run model. This is intentionally deferred.
2. Implementing artifact/event divergence warnings in `ax2 inspect state`.
   This slice derives Atomic Card coverage from files and validates malformed
   frontmatter, but it does not yet warn when an otherwise valid artifact exists
   without a corresponding ledger event.
