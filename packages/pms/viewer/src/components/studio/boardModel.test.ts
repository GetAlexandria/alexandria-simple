import { describe, expect, test } from "bun:test";
import type { StudioBoardCard } from "../../app/runtime/studio";
import {
  activeWorkOrderLane,
  archiveDateForTerminalCard,
  hasPriority,
  inWorkOrderArchive,
  isAgeArchived,
  isTerminalStatus,
  passesPrioritySift,
  priorityLabel,
  priorityRank,
  sortCardsByPriority,
  withStatus,
  withoutArchiveOverride,
} from "./boardModel";

// Matches the e2e fixed clock and the L6a board-model.test.mjs table.
const NOW = new Date("2026-06-24T12:00:00Z");

function card(overrides: Partial<StudioBoardCard> = {}): StudioBoardCard {
  return {
    created: "2026-06-01",
    division: "Product",
    function: "Insight",
    id: "wo-card",
    priority: 10,
    source: "test:board-model",
    status: "done",
    type: "improvement",
    ...overrides,
  };
}

describe("Studio board model", () => {
  test("isTerminalStatus distinguishes terminal dispositions", () => {
    expect(isTerminalStatus("done")).toBe(true);
    expect(isTerminalStatus("wont-do")).toBe(true);
    expect(isTerminalStatus("open")).toBe(false);
    expect(isTerminalStatus("in-progress")).toBe(false);
  });

  test("activeWorkOrderLane folds wont-do into the Done lane", () => {
    expect(activeWorkOrderLane("open")).toBe("open");
    expect(activeWorkOrderLane("in-progress")).toBe("in-progress");
    expect(activeWorkOrderLane("done")).toBe("done");
    expect(activeWorkOrderLane("wont-do")).toBe("done");
  });

  test("inWorkOrderArchive matches the L6a derived-archive rule at a fixed now", () => {
    // Inside the 7-day window stays on the board; on/after it ages out.
    expect(inWorkOrderArchive(card({ status: "done", terminalAt: "2026-06-18" }), NOW)).toBe(false);
    expect(inWorkOrderArchive(card({ status: "done", terminalAt: "2026-06-17" }), NOW)).toBe(true);
    expect(inWorkOrderArchive(card({ status: "wont-do", terminalAt: "2026-06-23" }), NOW)).toBe(
      false,
    );
    // archived: true forces the archive regardless of status, age, or pinned.
    expect(inWorkOrderArchive(card({ status: "open", archived: true }), NOW)).toBe(true);
    expect(
      inWorkOrderArchive(
        card({ status: "wont-do", terminalAt: "2026-06-01", archived: true, pinned: true }),
        NOW,
      ),
    ).toBe(true);
    // pinned only exempts the age-based sweep.
    expect(
      inWorkOrderArchive(card({ status: "wont-do", terminalAt: "2026-06-01", pinned: true }), NOW),
    ).toBe(false);
    // A legacy terminal card with no terminalAt ages from date-only created.
    expect(inWorkOrderArchive(card({ status: "done" }), NOW)).toBe(true);
    expect(inWorkOrderArchive(card({ status: "done", created: "2026-06-18" }), NOW)).toBe(false);
  });

  test("isAgeArchived ignores the archived override and only ages terminal cards", () => {
    expect(isAgeArchived(card({ status: "open", archived: true }), NOW)).toBe(false);
    expect(isAgeArchived(card({ status: "done", terminalAt: "2026-06-10" }), NOW)).toBe(true);
    expect(isAgeArchived(card({ status: "done", terminalAt: "2026-06-20" }), NOW)).toBe(false);
    expect(isAgeArchived(card({ status: "done", created: "2026-06-10" }), NOW)).toBe(true);
  });

  test("archiveDateForTerminalCard prefers terminalAt and falls back to created", () => {
    expect(
      archiveDateForTerminalCard(
        card({ status: "done", created: "2026-06-01", terminalAt: "2026-06-10" }),
      ),
    ).toBe("2026-06-10");
    expect(archiveDateForTerminalCard(card({ status: "wont-do", created: "2026-06-01" }))).toBe(
      "2026-06-01",
    );
    expect(archiveDateForTerminalCard(card({ status: "open", created: "2026-06-01" }))).toBeNull();
  });

  test("withStatus preserves lifecycle fields into terminal and strips them on reopen", () => {
    const terminal = withStatus(
      card({ status: "done", terminalAt: "2026-06-10", archived: true, pinned: true }),
      "wont-do",
    );
    expect(terminal.status).toBe("wont-do");
    expect(terminal.terminalAt).toBe("2026-06-10");
    expect(terminal.archived).toBe(true);
    expect(terminal.pinned).toBe(true);

    const reopened = withStatus(
      card({ status: "done", terminalAt: "2026-06-10", archived: true, pinned: true }),
      "in-progress",
    );
    expect(reopened.status).toBe("in-progress");
    expect("terminalAt" in reopened).toBe(false);
    expect("archived" in reopened).toBe(false);
    expect("pinned" in reopened).toBe(false);
  });

  test("withoutArchiveOverride drops archive overrides but keeps disposition", () => {
    const restored = withoutArchiveOverride(
      card({ status: "done", terminalAt: "2026-06-10", archived: true, pinned: true }),
    );
    expect("archived" in restored).toBe(false);
    expect("pinned" in restored).toBe(false);
    expect(restored.status).toBe("done");
    expect(restored.terminalAt).toBe("2026-06-10");
  });
});

// A card whose stored priority is missing/non-finite — the schema requires a
// number, but readers must still sort and render it without error.
function cardWithoutPriority(overrides: Partial<StudioBoardCard> = {}): StudioBoardCard {
  const { priority, ...rest } = card(overrides);
  void priority;
  return rest as StudioBoardCard;
}

describe("Studio board priority", () => {
  test("priorityRank returns the stored number, or +Infinity when missing", () => {
    expect(priorityRank(card({ priority: 10 }))).toBe(10);
    expect(priorityRank(card({ priority: 0 }))).toBe(0);
    expect(priorityRank(card({ priority: Number.NaN }))).toBe(Number.POSITIVE_INFINITY);
    expect(priorityRank(cardWithoutPriority())).toBe(Number.POSITIVE_INFINITY);
  });

  test("hasPriority distinguishes a finite priority from a missing one", () => {
    expect(hasPriority(card({ priority: 10 }))).toBe(true);
    expect(hasPriority(card({ priority: Number.NaN }))).toBe(false);
    expect(hasPriority(cardWithoutPriority())).toBe(false);
  });

  test("priorityLabel reads as priority, or No priority when missing", () => {
    expect(priorityLabel(card({ priority: 10 }))).toBe("Priority 10");
    expect(priorityLabel(cardWithoutPriority())).toBe("No priority");
  });

  test("sortCardsByPriority orders most-urgent-first by default", () => {
    const sorted = sortCardsByPriority([
      card({ id: "b", priority: 20 }),
      card({ id: "a", priority: 10 }),
      card({ id: "c", priority: 15 }),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "c", "b"]);
  });

  test("sortCardsByPriority reverses to least-urgent-first", () => {
    const sorted = sortCardsByPriority(
      [
        card({ id: "b", priority: 20 }),
        card({ id: "a", priority: 10 }),
        card({ id: "c", priority: 15 }),
      ],
      "urgent-last",
    );
    expect(sorted.map((entry) => entry.id)).toEqual(["b", "c", "a"]);
  });

  test("a card without a priority sorts last in both directions", () => {
    const cards = [
      cardWithoutPriority({ id: "none" }),
      card({ id: "low", priority: 10 }),
      card({ id: "high", priority: 30 }),
    ];
    expect(sortCardsByPriority(cards).map((entry) => entry.id)).toEqual(["low", "high", "none"]);
    expect(sortCardsByPriority(cards, "urgent-last").map((entry) => entry.id)).toEqual([
      "high",
      "low",
      "none",
    ]);
  });

  test("ties break by created date then id, deterministically", () => {
    const sorted = sortCardsByPriority([
      card({ id: "z", priority: 10, created: "2026-06-02" }),
      card({ id: "a", priority: 10, created: "2026-06-01" }),
      card({ id: "m", priority: 10, created: "2026-06-01" }),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "m", "z"]);
  });

  test("sorting does not mutate the input array", () => {
    const cards = [card({ id: "b", priority: 20 }), card({ id: "a", priority: 10 })];
    const before = cards.map((entry) => entry.id);
    sortCardsByPriority(cards);
    expect(cards.map((entry) => entry.id)).toEqual(before);
  });

  test("passesPrioritySift keeps cards at or above the ceiling", () => {
    expect(passesPrioritySift(card({ priority: 10 }), 10)).toBe(true);
    expect(passesPrioritySift(card({ priority: 5 }), 10)).toBe(true);
    expect(passesPrioritySift(card({ priority: 15 }), 10)).toBe(false);
  });

  test("passesPrioritySift never drops an unprioritized card — it is parked, not lost", () => {
    expect(passesPrioritySift(cardWithoutPriority(), 10)).toBe(true);
    expect(passesPrioritySift(cardWithoutPriority(), 0)).toBe(true);
  });

  test("passesPrioritySift with a null ceiling keeps every card", () => {
    expect(passesPrioritySift(card({ priority: 999 }), null)).toBe(true);
    expect(passesPrioritySift(cardWithoutPriority(), null)).toBe(true);
  });
});
