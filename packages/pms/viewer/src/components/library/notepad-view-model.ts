import type {
  LibraryCatalog,
  LibraryCatalogThread,
  LibraryCatalogThreadResolution,
  LibraryCatalogThreadResolutionState,
} from "./types";
import { threadEmittingMove, threadQuestion } from "./library-peek-view-model";

export type NotepadLens = "generated" | "resolved" | "open";

export const NOTEPAD_VISIBLE_RESOLUTION_STATES: readonly LibraryCatalogThreadResolutionState[] = [
  "director-ruled",
  "settled-by-cascade",
  "settled-by-triage",
  "deferred-residual",
];

export const NOTEPAD_RESOLUTION_STATE_LABELS: Record<LibraryCatalogThreadResolutionState, string> =
  {
    "deferred-residual": "Deferred to residuals",
    "director-ruled": "Ruled by the director",
    invalidated: "Miss",
    "settled-by-cascade": "Settled by the frame ruling",
    "settled-by-triage": "Settled by triage",
  };

export const NOTEPAD_RESOLUTION_STATE_MARKERS: Record<
  LibraryCatalogThreadResolutionState,
  "deferred" | "director" | "machine" | "miss"
> = {
  "deferred-residual": "deferred",
  "director-ruled": "director",
  invalidated: "miss",
  "settled-by-cascade": "machine",
  "settled-by-triage": "machine",
};

export interface NotepadThreadRow {
  emittingMove: string;
  id: string;
  kind: string;
  question: string;
  reason: string;
  resolution?: LibraryCatalogThreadResolution;
  sourceEvidence: string[];
}

export interface NotepadResolvedThread extends NotepadThreadRow {
  resolution: LibraryCatalogThreadResolution;
}

export interface NotepadThreadKindGroup<T extends NotepadThreadRow = NotepadThreadRow> {
  count: number;
  kind: string;
  threads: T[];
}

export interface NotepadThreadMoveGroup<T extends NotepadThreadRow = NotepadThreadRow> {
  count: number;
  emittingMove: string;
  kindGroups: NotepadThreadKindGroup<T>[];
}

export interface NotepadResolvedStateGroup {
  count: number;
  groups: NotepadThreadMoveGroup<NotepadResolvedThread>[];
  state: LibraryCatalogThreadResolutionState;
}

export interface NotepadModel {
  availableLenses: NotepadLens[];
  counts: {
    generated: number;
    misses: number;
    open: number;
    resolved: number;
  };
  generatedGroups: NotepadThreadMoveGroup[];
  misses: NotepadResolvedThread[];
  openGroups: NotepadThreadMoveGroup[];
  resolvedGroups: NotepadResolvedStateGroup[];
}

function rowForThread(thread: LibraryCatalogThread): NotepadThreadRow {
  const resolution = thread.resolution;
  return {
    emittingMove: threadEmittingMove(thread),
    id: thread.id,
    kind: thread.kind,
    question: threadQuestion(thread),
    reason: thread.reason,
    ...(resolution == null ? {} : { resolution }),
    sourceEvidence: [...(thread.sourceEvidence ?? [])],
  };
}

function hasResolution(row: NotepadThreadRow): row is NotepadResolvedThread {
  return row.resolution != null;
}

function compareRows(left: NotepadThreadRow, right: NotepadThreadRow): number {
  return (
    left.emittingMove.localeCompare(right.emittingMove) ||
    left.kind.localeCompare(right.kind) ||
    left.question.localeCompare(right.question) ||
    left.id.localeCompare(right.id)
  );
}

function sortedRows<T extends NotepadThreadRow>(rows: readonly T[]): T[] {
  return [...rows].sort(compareRows);
}

// Precondition: rows must already be sorted (buildNotepadModel sorts once at entry).
export function groupNotepadThreads<T extends NotepadThreadRow>(
  rows: readonly T[],
): NotepadThreadMoveGroup<T>[] {
  const groupsByMove = new Map<string, Map<string, T[]>>();

  for (const row of rows) {
    const moveGroups = groupsByMove.get(row.emittingMove) ?? new Map<string, T[]>();
    const kindRows = moveGroups.get(row.kind) ?? [];
    kindRows.push(row);
    moveGroups.set(row.kind, kindRows);
    groupsByMove.set(row.emittingMove, moveGroups);
  }

  return [...groupsByMove.entries()].map(([emittingMove, kindMap]) => {
    const kindGroups = [...kindMap.entries()].map(([kind, threads]) => ({
      count: threads.length,
      kind,
      threads,
    }));
    return {
      count: kindGroups.reduce((total, group) => total + group.count, 0),
      emittingMove,
      kindGroups,
    };
  });
}

export function buildNotepadModel(catalog: LibraryCatalog): NotepadModel {
  const generatedThreads = sortedRows(
    (catalog.threads ?? [])
      .filter((thread) => thread.source === "authored")
      .map((thread) => rowForThread(thread)),
  );
  const resolvedThreads = generatedThreads.filter(hasResolution);
  const openThreads = generatedThreads.filter((thread) => thread.resolution == null);
  const misses = resolvedThreads.filter((thread) => thread.resolution.state === "invalidated");
  const resolvedGroups = NOTEPAD_VISIBLE_RESOLUTION_STATES.flatMap((state) => {
    const threads = resolvedThreads.filter((thread) => thread.resolution.state === state);
    if (threads.length === 0) {
      return [];
    }
    return [
      {
        count: threads.length,
        groups: groupNotepadThreads(threads),
        state,
      },
    ];
  });

  return {
    availableLenses:
      resolvedThreads.length === 0 ? ["generated"] : ["generated", "resolved", "open"],
    counts: {
      generated: generatedThreads.length,
      misses: misses.length,
      open: openThreads.length,
      resolved: resolvedThreads.length,
    },
    generatedGroups: groupNotepadThreads(generatedThreads),
    misses,
    openGroups: groupNotepadThreads(openThreads),
    resolvedGroups,
  };
}

// Cheap single pass mirroring buildNotepadModel's "open" classification:
// authored threads that carry no resolution.
export function notepadBadgeCountForCatalog(catalog: LibraryCatalog): number {
  let open = 0;
  for (const thread of catalog.threads ?? []) {
    if (thread.source === "authored" && thread.resolution == null) {
      open += 1;
    }
  }
  return open;
}
