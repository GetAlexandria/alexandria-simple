import type { InfoHubCard } from "../../../app/runtime/schemas";

/**
 * Pure Info Hub work-order board projection logic. Originally ported from
 * the PlayMaker Studio Work Board's browser-safe model (packages/pms, since
 * retired from this repo) with the play coupling removed: no
 * `play`/`division`/`function`, an optional `area` string instead, and a
 * `task` card type. This file is now the sole owner of the terminal-status,
 * age-archive, and priority rules; `boardModel.test.ts` pins the archive
 * table.
 */

export type WorkOrderType = InfoHubCard["type"];
export type WorkOrderStatus = InfoHubCard["status"];
export type TerminalWorkOrderStatus = Extract<WorkOrderStatus, "done" | "wont-do">;
// Every status gets a lane except wont-do, which folds into the done lane
// (see activeWorkOrderLane). Adding a status to INFO_HUB_CARD_STATUSES in
// schemas.ts is enough to give it a lane — nothing to update here.
export type ActiveWorkOrderStatus = Exclude<WorkOrderStatus, "wont-do">;
export type ArchiveDisposition = TerminalWorkOrderStatus;

/**
 * Derived archive window, in days. A terminal work order ages into the
 * archive on or after this many days past `terminalAt`, or date-only
 * `created` for legacy cards that lack `terminalAt`, unless it is pinned.
 */
export const ARCHIVE_WINDOW_DAYS = 7;

// Lower priority number is more urgent. Kept here (rather than in the view)
// so the add/edit form and any future caller share one source instead of
// re-declaring the table.
export const WORK_ORDER_DEFAULT_PRIORITY: Readonly<Record<WorkOrderType, number>> = {
  bug: 10,
  improvement: 20,
  task: 15,
  testing: 15,
};

export function defaultPriorityForType(type: WorkOrderType): number {
  return WORK_ORDER_DEFAULT_PRIORITY[type] ?? 50;
}

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

export function archiveDateForTerminalCard(card: InfoHubCard): string | null {
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

export function isAgeArchived(card: InfoHubCard, now: Date): boolean {
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

export function inWorkOrderArchive(card: InfoHubCard, now: Date): boolean {
  return card.archived === true || isAgeArchived(card, now);
}

export function withoutArchiveOverride(card: InfoHubCard): InfoHubCard {
  const { archived, pinned, ...rest } = card;
  void archived;
  void pinned;
  return rest;
}

export function withStatus(card: InfoHubCard, status: WorkOrderStatus): InfoHubCard {
  if (!isTerminalStatus(status)) {
    const { archived, pinned, terminalAt, ...rest } = card;
    void archived;
    void pinned;
    void terminalAt;
    return { ...rest, status };
  }
  return { ...card, status };
}

/**
 * The next card value with checklist item `index` toggled done/undone. A card
 * with no checklist is returned unchanged (callers skip the save in that
 * case). Shared so the Info Hub board and the Map tab overlay write the
 * checklist identically.
 */
export function withChecklistItemToggled(card: InfoHubCard, index: number): InfoHubCard {
  if (card.checklist == null) {
    return card;
  }
  return {
    ...card,
    checklist: card.checklist.map((item, itemIndex) =>
      itemIndex === index ? { ...item, done: !item.done } : item,
    ),
  };
}

/**
 * Priority is a stored number where **lower = more urgent** (top of a lane is the
 * most-urgent card — the existing list-position semantics). The schema requires a
 * number, but readers treat a missing/non-finite value as the least-urgent rank so
 * a malformed card still sorts to a consistent position (last) and renders without
 * error.
 */
export type PrioritySortDirection = "urgent-first" | "urgent-last";

export function priorityRank(card: InfoHubCard): number {
  return typeof card.priority === "number" && Number.isFinite(card.priority)
    ? card.priority
    : Number.POSITIVE_INFINITY;
}

export function hasPriority(card: InfoHubCard): boolean {
  return Number.isFinite(priorityRank(card));
}

export function priorityLabel(card: InfoHubCard): string {
  return hasPriority(card) ? `Priority ${card.priority}` : "No priority";
}

/**
 * Priority sift predicate for a `Priority ≤ ceiling` view (higher number = less
 * urgent, so the ceiling keeps the most-urgent band). A card **without** a priority
 * is never dropped — it stays in the view and sorts to the bottom, so a malformed
 * card is parked, not lost. A null ceiling means no sift.
 */
export function passesPrioritySift(card: InfoHubCard, ceiling: number | null): boolean {
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
  cards: readonly InfoHubCard[],
  direction: PrioritySortDirection = "urgent-first",
): InfoHubCard[] {
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
