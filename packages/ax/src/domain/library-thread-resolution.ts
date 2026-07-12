import { resolve } from "path";
import type {
  LibraryCatalogThread,
  LibraryCatalogThreadResolution,
  LibraryCatalogThreadStatus,
} from "./library-catalog.js";
import {
  eventBundlePathMatchesLibraryRoot,
  parseAnswerRecorded,
  parseBundlePatchApplied,
  parseFrontOfHouseItemReopened,
  parseResidualGapRecorded,
  type AlexandriaStateEvent,
} from "./state-events.js";

/**
 * Reason-prefix wire contract shared with the producers of machine-made
 * settlements (the frame-ruling cascade and ruling-aware triage). Producers
 * must emit reasons with exactly these prefixes; this module is the single
 * source for the strings so producer and classifier cannot drift.
 * Classification normalizes to trimmed lowercase before matching.
 */
export const INVALIDATED_REASON_PREFIX = "invalidated by ruling ";
export const SETTLED_BY_TRIAGE_REASON_PREFIX = "settled by triage";
export const SETTLED_BY_FRAME_RULING_REASON_PREFIX = "settled by frame ruling ";
export const SETTLED_BY_REASON_PREFIX = "settled by ";

interface ThreadResolutionProjectionInput {
  events: readonly AlexandriaStateEvent[];
  libraryRoot: string;
  projectRoot: string;
  threads: readonly LibraryCatalogThread[];
}

interface BundleScope {
  projectRoot: string;
  resolvedLibraryRoot: string;
}

interface PatchProvenance {
  eventId: string;
  patchId: string;
}

function patchProvenanceByAnswerEventId(
  events: readonly AlexandriaStateEvent[],
  scope: BundleScope,
): Map<string, PatchProvenance[]> {
  const patchesByAnswerEventId = new Map<string, PatchProvenance[]>();

  for (const event of events) {
    const patch = parseBundlePatchApplied(event);
    if (
      patch == null ||
      !eventBundlePathMatchesLibraryRoot({ ...scope, bundlePath: patch.bundlePath })
    ) {
      continue;
    }

    const current = patchesByAnswerEventId.get(patch.answerEventId) ?? [];
    current.push({
      eventId: event.id,
      patchId: patch.patchId,
    });
    patchesByAnswerEventId.set(patch.answerEventId, current);
  }

  return patchesByAnswerEventId;
}

function answerRecordedResolution(
  event: AlexandriaStateEvent,
  patchesByAnswerEventId: Map<string, PatchProvenance[]>,
): { agendaItemId: string; resolution: LibraryCatalogThreadResolution } | null {
  if (event.actor.kind !== "user") {
    return null;
  }

  const payload = parseAnswerRecorded(event);
  if (payload == null) {
    return null;
  }

  const patches = patchesByAnswerEventId.get(event.id) ?? [];
  return {
    agendaItemId: payload.agendaItemId,
    resolution: {
      answerText: payload.answerText,
      ...(patches.length === 0 ? {} : { patches }),
      resolvingEventId: event.id,
      state: "director-ruled",
    },
  };
}

function residualGapRecordedResolution(
  event: AlexandriaStateEvent,
  scope: BundleScope,
): { agendaItemId: string; resolution: LibraryCatalogThreadResolution } | null {
  const payload = parseResidualGapRecorded(event);
  if (
    payload == null ||
    !eventBundlePathMatchesLibraryRoot({ ...scope, bundlePath: payload.bundlePath })
  ) {
    return null;
  }

  const normalizedReason = payload.reason.trim().toLowerCase();
  const state: LibraryCatalogThreadResolution["state"] = normalizedReason.startsWith(
    INVALIDATED_REASON_PREFIX,
  )
    ? "invalidated"
    : normalizedReason.startsWith(SETTLED_BY_TRIAGE_REASON_PREFIX)
      ? "settled-by-triage"
      : normalizedReason.startsWith(SETTLED_BY_FRAME_RULING_REASON_PREFIX)
        ? "settled-by-cascade"
        : event.actor.kind === "process" && normalizedReason.startsWith(SETTLED_BY_REASON_PREFIX)
          ? "settled-by-cascade"
          : "deferred-residual";

  return {
    agendaItemId: payload.agendaItemId,
    resolution: {
      reason: payload.reason,
      resolvingEventId: event.id,
      state,
    },
  };
}

function statusForResolution(
  resolution: LibraryCatalogThreadResolution,
): LibraryCatalogThreadStatus {
  return resolution.state === "deferred-residual" ? "residual" : "answered";
}

export function projectLibraryCatalogThreadResolutions(
  input: ThreadResolutionProjectionInput,
): LibraryCatalogThread[] {
  const threadIds = new Set(input.threads.map((thread) => thread.id));
  const scope: BundleScope = {
    projectRoot: input.projectRoot,
    resolvedLibraryRoot: resolve(input.libraryRoot),
  };
  const patchesByAnswerEventId = patchProvenanceByAnswerEventId(input.events, scope);
  const resolutionByThreadId = new Map<string, LibraryCatalogThreadResolution>();
  for (const thread of input.threads) {
    if (thread.resolution != null) {
      resolutionByThreadId.set(thread.id, thread.resolution);
    }
  }

  for (const event of input.events) {
    const projected =
      answerRecordedResolution(event, patchesByAnswerEventId) ??
      residualGapRecordedResolution(event, scope);
    if (projected != null && threadIds.has(projected.agendaItemId)) {
      resolutionByThreadId.set(projected.agendaItemId, projected.resolution);
      continue;
    }

    const reopened = parseFrontOfHouseItemReopened(event);
    if (
      reopened == null ||
      !threadIds.has(reopened.agendaItemId) ||
      !eventBundlePathMatchesLibraryRoot({ ...scope, bundlePath: reopened.bundlePath })
    ) {
      continue;
    }
    const current = resolutionByThreadId.get(reopened.agendaItemId);
    if (
      current?.state === "settled-by-triage" &&
      current.resolvingEventId === reopened.reopenedSettlementEventId
    ) {
      resolutionByThreadId.delete(reopened.agendaItemId);
    }
  }

  return input.threads.map((thread) => {
    const resolution = resolutionByThreadId.get(thread.id);
    if (resolution == null) {
      const { resolvingEventId: _authoredResolvingEventId, ...openThread } = thread;
      void _authoredResolvingEventId;
      return {
        ...openThread,
        status: "open",
      };
    }

    return {
      ...thread,
      resolution,
      resolvingEventId: resolution.resolvingEventId,
      status: statusForResolution(resolution),
    };
  });
}
