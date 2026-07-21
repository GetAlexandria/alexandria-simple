// Both rooms' "Related board work" section shares one join (XCOM
// consistent-HUD ruling: identical component, identical derivation) — pure
// and three.js-/React-free like room-strategy-model.ts / room-learning-model.ts.
//
// Info Hub cards carry no direct plane link. The join seam is two hops:
// `card.contextId` -> a map context's `id` -> that context's optional
// `libraryContext` (a "plane/context" path string, e.g. "product/viewer") ->
// plane = the segment before the first "/". A room shows non-terminal board
// cards whose context's `libraryContext` plane equals the room's own plane.
// Today NO map context carries a strategy/learning `libraryContext`, so both
// rooms derive an empty list — RoomOverlay renders that as an informative
// empty state, not a blank section.

import type { InfoHubCard, MapContext } from "../../app/runtime/schemas";
import { isTerminalStatus } from "../library/infohub/boardModel";

/** The plane segment before the first "/" in a context's `libraryContext` path. */
function contextPlane(context: MapContext): string | null {
  const path = context.libraryContext;
  if (path == null || path.length === 0) {
    return null;
  }
  const separatorIndex = path.indexOf("/");
  return separatorIndex === -1 ? path : path.slice(0, separatorIndex);
}

/**
 * Non-terminal board cards whose `contextId` resolves to a context whose
 * `libraryContext` plane equals `plane`. A card with no `contextId`, or one
 * that resolves to a context with no `libraryContext` (or a different
 * plane), joins nothing. Catalog/board order is preserved.
 */
export function boardCardsForPlane(
  cards: readonly InfoHubCard[],
  contexts: readonly MapContext[],
  plane: string,
): readonly InfoHubCard[] {
  const planeByContextId = new Map(
    contexts.map((context) => [context.id, contextPlane(context)] as const),
  );
  return cards.filter((card) => {
    if (card.contextId == null || isTerminalStatus(card.status)) {
      return false;
    }
    return planeByContextId.get(card.contextId) === plane;
  });
}
