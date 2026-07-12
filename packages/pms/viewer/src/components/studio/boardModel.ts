import type { StudioBoardCard } from "../../app/runtime/studio";

/**
 * Pure Work Board projection logic for the viewer Studio surface.
 *
 * This is the browser-safe home for the terminal-status, age-archive, and
 * status-transition rules the Board UI applies at read time. It mirrors the
 * L6a data contract owned by `studio/plays/board-model.js` (`inArchive`,
 * terminal-status normalization) and documented in
 * `docs/alexandria/plans/_archive/400-work-board-data-model/plan.md`. That module is a
 * browser-global IIFE that the viewer (and AX) cannot import directly, so the
 * rule is re-expressed here against the same fixed-`now`, UTC date-only math.
 *
 * Keep this aligned with the L6a helper if the rule ever changes;
 * `boardModel.test.ts` pins the documented archive table. A future follow-up
 * (per the L6a/L6b plans) may extract one shared cross-package Board model and
 * retire both copies.
 */

export type WorkOrderType = StudioBoardCard["type"];
export type WorkOrderStatus = StudioBoardCard["status"];
export type ActiveWorkOrderStatus = Extract<WorkOrderStatus, "open" | "in-progress" | "done">;
export type TerminalWorkOrderStatus = Extract<WorkOrderStatus, "done" | "wont-do">;
export type ArchiveDisposition = TerminalWorkOrderStatus | "graduated";
export type ArchiveKindFilter = WorkOrderType | "play";

/**
 * Derived archive window, in days. A terminal work order ages into the archive
 * on or after this many days past `terminalAt`, or date-only `created` for
 * legacy cards that lack `terminalAt`, unless it is pinned. Must match the L6a
 * `DEFAULT_ARCHIVE_WINDOW_DAYS` in `studio/plays/board-model.js`.
 */
export const ARCHIVE_WINDOW_DAYS = 7;

export function isTerminalStatus(status: WorkOrderStatus): status is TerminalWorkOrderStatus {
  return status === "done" || status === "wont-do";
}

export function activeWorkOrderLane(status: WorkOrderStatus): ActiveWorkOrderStatus {
  return status === "wont-do" ? "done" : status;
}

export function dateOnlyUtcMs(value: string | Date): number | null {
  if (value instanceof Date) {
    const time = Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    return Number.isFinite(time) ? time : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) ? time : null;
}

export function archiveDateForTerminalCard(card: StudioBoardCard): string | null {
  if (!isTerminalStatus(card.status)) {
    return null;
  }
  if (card.terminalAt != null && dateOnlyUtcMs(card.terminalAt) != null) {
    return card.terminalAt;
  }
  if (dateOnlyUtcMs(card.created) != null) {
    return card.created;
  }
  return null;
}

export function isAgeArchived(card: StudioBoardCard, now: Date): boolean {
  if (!isTerminalStatus(card.status) || card.pinned === true) {
    return false;
  }
  const terminalDate = archiveDateForTerminalCard(card);
  if (terminalDate == null) {
    return false;
  }
  const terminalDay = dateOnlyUtcMs(terminalDate);
  const nowDay = dateOnlyUtcMs(now);
  if (terminalDay == null || nowDay == null) {
    return false;
  }
  return Math.floor((nowDay - terminalDay) / 86_400_000) >= ARCHIVE_WINDOW_DAYS;
}

export function inWorkOrderArchive(card: StudioBoardCard, now: Date): boolean {
  return card.archived === true || isAgeArchived(card, now);
}

export function withoutArchiveOverride(card: StudioBoardCard): StudioBoardCard {
  const { archived, pinned, ...rest } = card;
  void archived;
  void pinned;
  return rest;
}

export function withStatus(card: StudioBoardCard, status: WorkOrderStatus): StudioBoardCard {
  if (!isTerminalStatus(status)) {
    const { archived, pinned, terminalAt, ...rest } = card;
    void archived;
    void pinned;
    void terminalAt;
    return { ...rest, status };
  }
  return { ...card, status };
}

export function studioPlayHref(slug: string): string {
  return `/?tab=play&slug=${encodeURIComponent(slug)}`;
}

/**
 * Priority is a stored number where **lower = more urgent** (top of a lane is the
 * most-urgent card — the existing list-position semantics). The schema requires a
 * number, but readers treat a missing/non-finite value as the least-urgent rank so
 * a malformed card still sorts to a consistent position (last) and renders without
 * error.
 */
export type PrioritySortDirection = "urgent-first" | "urgent-last";

export function priorityRank(card: StudioBoardCard): number {
  return typeof card.priority === "number" && Number.isFinite(card.priority)
    ? card.priority
    : Number.POSITIVE_INFINITY;
}

export function hasPriority(card: StudioBoardCard): boolean {
  return Number.isFinite(priorityRank(card));
}

export function priorityLabel(card: StudioBoardCard): string {
  return hasPriority(card) ? `Priority ${card.priority}` : "No priority";
}

/**
 * Priority sift predicate for a `Priority ≤ ceiling` view (higher number = less
 * urgent, so the ceiling keeps the most-urgent band). A card **without** a priority
 * is never dropped — it stays in the view and sorts to the bottom, so a malformed
 * card is parked, not lost. A null ceiling means no sift.
 */
export function passesPrioritySift(card: StudioBoardCard, ceiling: number | null): boolean {
  if (ceiling == null || !hasPriority(card)) {
    return true;
  }
  return card.priority <= ceiling;
}

/**
 * Stable priority sort used both for the canonical stored order (urgent-first) and
 * the derived board view. Cards without a priority always sort last regardless of
 * direction; `created` then `id` break ties so the order is deterministic. Copies
 * its input — sorting never mutates the stored card list.
 */
export function sortCardsByPriority(
  cards: readonly StudioBoardCard[],
  direction: PrioritySortDirection = "urgent-first",
): StudioBoardCard[] {
  const factor = direction === "urgent-last" ? -1 : 1;
  return [...cards].sort((left, right) => {
    const leftHas = hasPriority(left);
    const rightHas = hasPriority(right);
    if (leftHas !== rightHas) {
      // Unprioritized cards always sort last, in either direction.
      return leftHas ? -1 : 1;
    }
    if (leftHas && rightHas) {
      const byPriority = (left.priority - right.priority) * factor;
      if (byPriority !== 0) {
        return byPriority;
      }
    }
    const byCreated = left.created.localeCompare(right.created);
    if (byCreated !== 0) {
      return byCreated;
    }
    return left.id.localeCompare(right.id);
  });
}
