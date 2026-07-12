import { relative, resolve, sep } from "path";
import type {
  LibraryCatalog,
  LibraryCatalogDraftOverlay,
  LibraryCatalogDraftRulingEntry,
  LibraryCatalogDraftSetField,
  LibraryCatalogDraftTrailEntry,
  LibraryCatalogDraftUnresolvedUpdate,
} from "./library-catalog.js";
import type { LibraryMarkdownFile } from "./library-graph.js";
import {
  applyFrontOfHouseCardUpdateToContent,
  parseFrontOfHousePatchLog,
  type FrontOfHouseCardUpdate,
  type FrontOfHousePatch,
} from "./library-front-of-house.js";
import { isPathInsideRoot } from "./paths.js";
import { LibraryGateError } from "./library-confirmation.js";
import {
  eventBundlePathMatchesLibraryRoot,
  parseAnswerRecorded,
  parseBundlePatchApplied,
  payloadString,
  type AlexandriaStateEvent,
  type FrontOfHouseAnswerRecordedPayload,
} from "./state-events.js";

const DRAFT_SET_FIELD_ORDER: LibraryCatalogDraftSetField[] = [
  "prefLabel",
  "context",
  "plane",
  "status",
];

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function relativeCardPath(libraryRoot: string, absolutePath: string): string {
  return toPosixPath(relative(resolve(libraryRoot), resolve(absolutePath)));
}

function resolveCardPath(
  libraryRoot: string,
  cardPath: string,
): { absolutePath: string; relativePath: string } | Error {
  if (cardPath.length === 0 || cardPath.startsWith("/")) {
    return new LibraryGateError("Card path must be relative to the Back library root.");
  }

  const absoluteLibraryRoot = resolve(libraryRoot);
  const absolutePath = resolve(absoluteLibraryRoot, cardPath);
  if (
    absolutePath === absoluteLibraryRoot ||
    !isPathInsideRoot(absoluteLibraryRoot, absolutePath)
  ) {
    return new LibraryGateError("Card path escapes the Back library root.");
  }

  return {
    absolutePath,
    relativePath: toPosixPath(relative(absoluteLibraryRoot, absolutePath)),
  };
}

function changedSetFields(update: FrontOfHouseCardUpdate): LibraryCatalogDraftSetField[] {
  const fields = update.set ?? {};
  return DRAFT_SET_FIELD_ORDER.filter((field) =>
    Object.prototype.hasOwnProperty.call(fields, field),
  );
}

function changedRelationshipKeys(update: FrontOfHouseCardUpdate): string[] {
  return Object.keys(update.relationships ?? {}).sort((left, right) => left.localeCompare(right));
}

function trailEntry(
  patch: FrontOfHousePatch,
  update: FrontOfHouseCardUpdate,
  relativePath: string,
): LibraryCatalogDraftTrailEntry {
  return {
    agendaItemId: patch.agendaItemId,
    answerEventId: patch.answerEventId,
    cardPath: relativePath,
    fields: changedSetFields(update),
    patchId: patch.patchId,
    relationships: changedRelationshipKeys(update),
  };
}

function unresolvedUpdate(
  patch: FrontOfHousePatch,
  update: FrontOfHouseCardUpdate,
  reason: string,
): LibraryCatalogDraftUnresolvedUpdate {
  return {
    agendaItemId: patch.agendaItemId,
    answerEventId: patch.answerEventId,
    cardPath: update.cardPath,
    patchId: patch.patchId,
    reason,
  };
}

function rulingEntry(patch: FrontOfHousePatch): LibraryCatalogDraftRulingEntry {
  return {
    agendaItemId: patch.agendaItemId,
    answerEventId: patch.answerEventId,
    cardUpdateCount: patch.cardUpdates.length,
    containerMapping: patch.containerMapping ?? [],
    ...(patch.keystoneDraft == null ? {} : { keystoneDraft: patch.keystoneDraft }),
    patchId: patch.patchId,
  };
}

function answerEventAliases(event: AlexandriaStateEvent): string[] {
  const aliases = [event.id];
  const payloadAnswerEventId = payloadString(event, "answerEventId");
  if (payloadAnswerEventId != null && payloadAnswerEventId !== event.id) {
    aliases.push(payloadAnswerEventId);
  }
  return aliases;
}

function answerEventsById(
  events: readonly AlexandriaStateEvent[],
): ReadonlyMap<string, FrontOfHouseAnswerRecordedPayload> {
  const answers = new Map<string, FrontOfHouseAnswerRecordedPayload>();
  for (const event of events) {
    const answer = parseAnswerRecorded(event);
    if (answer == null) {
      continue;
    }
    for (const alias of answerEventAliases(event)) {
      answers.set(alias, answer);
    }
  }
  return answers;
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function patchEntryFromEvent(input: {
  answerByEventId: ReadonlyMap<string, FrontOfHouseAnswerRecordedPayload>;
  event: AlexandriaStateEvent;
  libraryRoot: string;
  projectRoot: string;
}): Record<string, unknown> | null {
  const applied = parseBundlePatchApplied(input.event);
  if (applied == null) {
    return null;
  }
  if (
    !eventBundlePathMatchesLibraryRoot({
      bundlePath: applied.bundlePath,
      projectRoot: input.projectRoot,
      resolvedLibraryRoot: resolve(input.libraryRoot),
    })
  ) {
    return null;
  }

  const agendaItemId =
    payloadString(input.event, "agendaItemId") ??
    input.answerByEventId.get(applied.answerEventId)?.agendaItemId ??
    null;
  if (agendaItemId == null) {
    return null;
  }

  const payload = input.event.payload;
  return {
    schemaVersion: 1,
    patchId: applied.patchId,
    agendaItemId,
    answerEventId: applied.answerEventId,
    resolution: payloadString(input.event, "resolution") ?? "resolved",
    cardUpdates: hasOwn(payload, "cardUpdates") ? payload.cardUpdates : [],
    ...(hasOwn(payload, "containerMapping") ? { containerMapping: payload.containerMapping } : {}),
    ...(hasOwn(payload, "keystoneDraft") ? { keystoneDraft: payload.keystoneDraft } : {}),
  };
}

export interface LibraryDraftOverlayProjection {
  appliedPatches: Array<{ answerEventId: string; patchId: string }>;
  draftOverlay: LibraryCatalogDraftOverlay;
  files: LibraryMarkdownFile[];
  trailByCardPath: ReadonlyMap<string, LibraryCatalogDraftTrailEntry[]>;
}

export function applyLibraryDraftOverlay(input: {
  files: readonly LibraryMarkdownFile[];
  libraryRoot: string;
  patchLogContent: string;
  patchLogPath: string;
}): LibraryDraftOverlayProjection | null | Error {
  const patchLog = parseFrontOfHousePatchLog(input.patchLogContent);
  if (patchLog instanceof Error) {
    return new LibraryGateError(
      `Invalid draft patch log ${input.patchLogPath}: ${patchLog.message}`,
    );
  }
  if (patchLog.patches.length === 0 && patchLog.invalidPatches.length === 0) {
    return null;
  }

  const files = input.files.map((file) => ({ ...file }));
  const fileByRelativePath = new Map<string, LibraryMarkdownFile>();
  for (const file of files) {
    fileByRelativePath.set(relativeCardPath(input.libraryRoot, file.path), file);
  }

  const trailByCardPath = new Map<string, LibraryCatalogDraftTrailEntry[]>();
  const unresolvedUpdates: LibraryCatalogDraftUnresolvedUpdate[] = [];
  const rulings = patchLog.patches.map(rulingEntry);
  const appliedPatchIds = new Set<string>();
  const appliedPatches: Array<{ answerEventId: string; patchId: string }> = [];
  let appliedUpdateCount = 0;

  for (const patch of patchLog.patches) {
    for (const update of patch.cardUpdates) {
      const resolved = resolveCardPath(input.libraryRoot, update.cardPath);
      if (resolved instanceof Error) {
        unresolvedUpdates.push(unresolvedUpdate(patch, update, resolved.message));
        continue;
      }

      const file = fileByRelativePath.get(resolved.relativePath);
      if (file == null) {
        unresolvedUpdates.push(
          unresolvedUpdate(patch, update, "Card path does not resolve against the Back library."),
        );
        continue;
      }

      const nextContent = applyFrontOfHouseCardUpdateToContent(file.content, update);
      if (nextContent instanceof Error) {
        unresolvedUpdates.push(unresolvedUpdate(patch, update, nextContent.message));
        continue;
      }

      file.content = nextContent;
      const entries = trailByCardPath.get(resolved.relativePath) ?? [];
      trailByCardPath.set(resolved.relativePath, [
        ...entries,
        trailEntry(patch, update, resolved.relativePath),
      ]);
      if (!appliedPatchIds.has(patch.patchId)) {
        appliedPatchIds.add(patch.patchId);
        appliedPatches.push({ answerEventId: patch.answerEventId, patchId: patch.patchId });
      }
      appliedUpdateCount += 1;
    }
  }

  return {
    appliedPatches,
    draftOverlay: {
      appliedPatchCount: appliedPatchIds.size,
      appliedUpdateCount,
      invalidPatches: patchLog.invalidPatches,
      patchLogPath: input.patchLogPath,
      rulings,
      sectionConfirmations: [],
      unresolvedUpdates,
    },
    files,
    trailByCardPath,
  };
}

export function projectLibraryDraftOverlayFromEvents(input: {
  events: readonly AlexandriaStateEvent[];
  files: readonly LibraryMarkdownFile[];
  libraryRoot: string;
  projectRoot: string;
}): LibraryDraftOverlayProjection | null | Error {
  const answerByEventId = answerEventsById(input.events);
  const patches = input.events.flatMap((event) => {
    const entry = patchEntryFromEvent({
      answerByEventId,
      event,
      libraryRoot: input.libraryRoot,
      projectRoot: input.projectRoot,
    });
    return entry == null ? [] : [entry];
  });
  if (patches.length === 0) {
    return null;
  }

  const projection = applyLibraryDraftOverlay({
    files: input.files,
    libraryRoot: input.libraryRoot,
    patchLogContent: `${JSON.stringify(patches, null, 2)}\n`,
    patchLogPath: "ledger:library.card_patch_applied",
  });
  if (projection instanceof Error || projection == null) {
    return projection;
  }

  const appliedPatchIds = new Set(
    projection.appliedPatches.map((patch) => `${patch.answerEventId}\0${patch.patchId}`),
  );
  const eventAppliedPatches = [...projection.appliedPatches];
  for (const ruling of projection.draftOverlay.rulings) {
    const patch = { answerEventId: ruling.answerEventId, patchId: ruling.patchId };
    const key = `${patch.answerEventId}\0${patch.patchId}`;
    if (appliedPatchIds.has(key)) {
      continue;
    }
    appliedPatchIds.add(key);
    eventAppliedPatches.push(patch);
  }

  return {
    ...projection,
    appliedPatches: eventAppliedPatches,
  };
}

export function attachLibraryDraftOverlay(
  catalog: LibraryCatalog,
  projection: LibraryDraftOverlayProjection,
): LibraryCatalog {
  return {
    ...catalog,
    cards: catalog.cards.map((card) => {
      const trail = card.path == null ? undefined : projection.trailByCardPath.get(card.path);
      return trail == null || trail.length === 0 ? card : { ...card, draftTrail: trail };
    }),
    draftOverlay: projection.draftOverlay,
  };
}
