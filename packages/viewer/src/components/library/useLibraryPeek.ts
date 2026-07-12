import { useEffect, useMemo, useState } from "react";
import {
  buildCardPeek,
  buildContextPeek,
  buildPeekCardIndex,
  buildThreadPeek,
  type LibraryPeekModel,
} from "./library-peek-view-model";
import type { LibraryCatalog, LibraryCatalogCard, LibraryCatalogGap } from "./types";

type CardResolverIndex = ReturnType<typeof buildPeekCardIndex>;

// Shared in-place "peek" state lifecycle, extracted from the three viewer
// modes that each grew their own copy (IndexView, WorkflowView,
// BuilderNotepadView) plus the original in EmptyLibraryView. Mirrors the
// pattern usePlaneStats (PlaneSidebar.tsx) set for this initiative: one hook
// owning both the state and its derivation, with each call site keeping only
// the render wiring local.
//
// Supports the union of what the copies could open: a card, a context
// (area), or a thread. A caller that never opens a thread (IndexView,
// WorkflowView) simply never constructs a `{ kind: "thread" }` subject; the
// hook itself is agnostic to which subset a given view uses.
export type LibraryPeekSubject =
  | { cardId: string; kind: "card" }
  | { areaId: string; kind: "context" }
  | { kind: "thread"; threadId: string };

export interface LibraryPeekState {
  openCard(cardId: string): void;
  openContext(areaId: string): void;
  openThread(threadId: string): void;
  peekCardIndex: CardResolverIndex;
  peekModel: LibraryPeekModel | null;
  peekSubject: LibraryPeekSubject | null;
  setPeekSubject(subject: LibraryPeekSubject | null): void;
}

// `cardsById` is accepted rather than recomputed here because every call
// site already builds it (from `catalog.cards`, via the shared `byId`
// helper) for its own rendering — recomputing it again inside the hook would
// just be a second, redundant memo over the same array. `gapsById` is
// optional: IndexView and WorkflowView never open a context peek that needs
// it built ahead of time, so the hook falls back to scanning `catalog.gaps`
// directly (matching IndexView's own pre-extraction behavior). `peekCardIndex`
// is likewise the resolver index every call site needs regardless of the peek
// (story links, parts, and seams all resolve against it), so it is built
// here once and returned for reuse.
export function useLibraryPeek(
  catalog: LibraryCatalog,
  cardsById: ReadonlyMap<string, LibraryCatalogCard>,
  gapsById?: ReadonlyMap<string, LibraryCatalogGap>,
): LibraryPeekState {
  const peekCardIndex = useMemo(() => buildPeekCardIndex(catalog.cards), [catalog.cards]);
  const [peekSubject, setPeekSubject] = useState<LibraryPeekSubject | null>(null);

  // Reset the local peek when the catalog object identity changes (e.g. a
  // refresh replaces it), mirroring EmptyLibraryView's own `[catalog]` reset.
  useEffect(() => {
    setPeekSubject(null);
  }, [catalog]);

  const peekModel = useMemo<LibraryPeekModel | null>(() => {
    if (peekSubject == null) {
      return null;
    }
    const workflows = catalog.workflows ?? [];
    if (peekSubject.kind === "card") {
      const card = cardsById.get(peekSubject.cardId);
      if (card == null) {
        return null;
      }
      // Match on plane + context: a context name is not unique across planes.
      const area = catalog.areas.find(
        (candidate) => candidate.context === card.context && candidate.plane === card.plane,
      );
      return buildCardPeek(card, {
        index: peekCardIndex,
        workflows,
        ...(area == null ? {} : { contextLabel: area.label }),
      });
    }
    if (peekSubject.kind === "thread") {
      const thread = (catalog.threads ?? []).find(
        (candidate) => candidate.id === peekSubject.threadId,
      );
      return thread == null ? null : buildThreadPeek(thread, { cardsById });
    }
    const area = catalog.areas.find((candidate) => candidate.id === peekSubject.areaId);
    if (area == null) {
      return null;
    }
    const cards = area.cardIds.flatMap((cardId) => {
      const card = cardsById.get(cardId);
      return card == null ? [] : [card];
    });
    const gaps = area.gapIds.flatMap((gapId) => {
      const gap =
        gapsById == null
          ? catalog.gaps.find((candidate) => candidate.id === gapId)
          : gapsById.get(gapId);
      return gap == null ? [] : [gap];
    });
    return buildContextPeek(area, { cards, gaps, index: peekCardIndex, workflows });
  }, [
    peekSubject,
    cardsById,
    gapsById,
    catalog.areas,
    catalog.gaps,
    catalog.threads,
    catalog.workflows,
    peekCardIndex,
  ]);

  return {
    openCard: (cardId) => setPeekSubject({ cardId, kind: "card" }),
    openContext: (areaId) => setPeekSubject({ areaId, kind: "context" }),
    openThread: (threadId) => setPeekSubject({ kind: "thread", threadId }),
    peekCardIndex,
    peekModel,
    peekSubject,
    setPeekSubject,
  };
}
