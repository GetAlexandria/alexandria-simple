import { realpathSync } from "fs";
import { resolve } from "path";
import type { LibraryCatalogThread } from "./library-catalog.js";
import {
  parseLibraryThreadOpened,
  parseLibraryThreadResolved,
  type AlexandriaStateEvent,
  type LibraryThreadOpenedPayload,
} from "./state-events.js";

export type LibraryCatalogAuthoredThreadScope =
  | { kind: "bundle"; libraryRoot: string; projectRoot: string }
  | { kind: "none" }
  | { kind: "product" };

interface AuthoredThreadProjectionInput {
  events: readonly AlexandriaStateEvent[];
  scope: LibraryCatalogAuthoredThreadScope;
}

function eventBackfillBundleMatchesLibraryRoot(input: {
  libraryRoot: string;
  payload: LibraryThreadOpenedPayload;
  projectRoot: string;
}): boolean {
  // Compare realpaths so symlinked segments (macOS tmpdir /var -> /private/var)
  // cannot split an event's recorded bundle from the queried root when only
  // one side has been normalized by the OS.
  return (
    realpathIfPresent(resolve(input.projectRoot, input.payload.backfill.bundle)) ===
    realpathIfPresent(resolve(input.libraryRoot))
  );
}

function realpathIfPresent(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

function openedThreadMatchesScope(
  payload: LibraryThreadOpenedPayload,
  scope: LibraryCatalogAuthoredThreadScope,
): boolean {
  if (scope.kind === "none") {
    return false;
  }
  if (scope.kind === "product") {
    return true;
  }
  return eventBackfillBundleMatchesLibraryRoot({
    libraryRoot: scope.libraryRoot,
    payload,
    projectRoot: scope.projectRoot,
  });
}

function openedThreadFromPayload(payload: LibraryThreadOpenedPayload): LibraryCatalogThread {
  return {
    confidence: payload.confidence,
    concerns: payload.concerns.map((concern) => ({ ...concern })),
    family: payload.family,
    id: payload.threadId,
    kind: payload.kind.trim().toLowerCase(),
    question: payload.question,
    reason: payload.reason,
    emittingMove: payload.emittingMove,
    severity: payload.severity,
    sourceEvidence: [...payload.sourceEvidence],
    source: "authored",
    status: "open",
  };
}

export function projectLibraryCatalogAuthoredThreads(
  input: AuthoredThreadProjectionInput,
): LibraryCatalogThread[] {
  const threadsById = new Map<string, LibraryCatalogThread>();
  const resolvedThreadIds = new Set<string>();

  for (const event of input.events) {
    const opened = parseLibraryThreadOpened(event);
    if (opened != null) {
      if (openedThreadMatchesScope(opened, input.scope) && !threadsById.has(opened.threadId)) {
        threadsById.set(opened.threadId, openedThreadFromPayload(opened));
      }
      continue;
    }

    const resolved = parseLibraryThreadResolved(event);
    if (resolved != null) {
      resolvedThreadIds.add(resolved.threadId);
    }
  }

  return [...threadsById.values()].filter((thread) => !resolvedThreadIds.has(thread.id));
}
