import { describe, expect, test } from "bun:test";
import type { InfoHubCard } from "./info-hub-board.js";
import type { MapEntity, MapState } from "./map-state.js";
import { currentWindowStart, dueCardsForBoard } from "./system-generation.js";

function isoDate(iso: string): Date {
  return new Date(iso);
}

describe("currentWindowStart", () => {
  test("hours are epoch-anchored strides, aligned to the hour", () => {
    expect(currentWindowStart("6h", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-14T06:00:00.000Z",
    );
    expect(currentWindowStart("6h", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-14T00:00:00.000Z",
    );
    // The epoch itself is a boundary regardless of N.
    expect(currentWindowStart("1h", isoDate("1970-01-01T00:59:59.000Z")).toISOString()).toBe(
      "1970-01-01T00:00:00.000Z",
    );
  });

  test("days are epoch-anchored strides", () => {
    expect(currentWindowStart("1d", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-14T00:00:00.000Z",
    );
    expect(currentWindowStart("2d", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-14T00:00:00.000Z",
    );
  });

  test("weeks are 7-day epoch-anchored strides (no day-of-week alignment beyond the epoch)", () => {
    // 1970-01-01 was a Thursday; week boundaries land on Thursdays.
    expect(currentWindowStart("1w", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-09T00:00:00.000Z",
    );
  });

  test("months are calendar strides starting on the 1st, UTC", () => {
    expect(currentWindowStart("1mo", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    // Month-length edges: Feb (28/29 days) and Dec→Jan rollover both reduce
    // to "the 1st of the current month" — no day-count arithmetic involved.
    expect(currentWindowStart("1mo", isoDate("2024-02-29T12:00:00.000Z")).toISOString()).toBe(
      "2024-02-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1mo", isoDate("2025-12-31T23:59:59.000Z")).toISOString()).toBe(
      "2025-12-01T00:00:00.000Z",
    );
    // N>1 strides count months from 1970-01: month index 668 (2025-09) floors
    // to 666 (2025-07) for a 3-month stride.
    expect(currentWindowStart("3mo", isoDate("2025-09-15T00:00:00.000Z")).toISOString()).toBe(
      "2025-07-01T00:00:00.000Z",
    );
  });

  test("quarters are 3*N-month strides from 1970-01, so 1q windows start Jan/Apr/Jul/Oct", () => {
    expect(currentWindowStart("1q", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1q", isoDate("2026-08-30T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1q", isoDate("2026-01-01T00:00:00.000Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1q", isoDate("2026-12-31T23:59:59.000Z")).toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    // 2q stride (6-month strides from 1970-01): boundaries fall on
    // Jan/Jul each year, and 2026-07 is itself one.
    expect(currentWindowStart("2q", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(currentWindowStart("2q", isoDate("2026-04-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  test("years are calendar strides from 1970, starting Jan 1 UTC", () => {
    expect(currentWindowStart("1y", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    // 2y stride: 2025 is an odd offset from 1970 (55), so it floors back to
    // the 2024 boundary; 2026 (offset 56, even) is its own boundary.
    expect(currentWindowStart("2y", isoDate("2025-06-01T00:00:00.000Z")).toISOString()).toBe(
      "2024-01-01T00:00:00.000Z",
    );
    expect(currentWindowStart("2y", isoDate("2026-06-01T00:00:00.000Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });
});

function baseState(entities: MapEntity[]): MapState {
  return { domains: [], contexts: [], entities, positions: [] };
}

function plantedSystem(overrides: Partial<MapEntity> = {}): MapEntity {
  return {
    id: "sys-emails",
    kind: "system",
    name: "Email operating loop",
    domainId: "alexandria",
    lifecycle: "planted",
    ...overrides,
  };
}

describe("dueCardsForBoard", () => {
  const now = isoDate("2026-07-14T09:00:00.000Z");
  const today = "2026-07-14";

  test("generates one card per rule on a planted system with no prior cards", () => {
    const state = baseState([
      plantedSystem({
        assignee: "colleague:raven",
        pattern: [
          { id: "check-email", title: "Check and respond to customer emails", every: "1mo" },
          { id: "quarterly-review", title: "Quarterly review", every: "1q", detail: "Body text" },
        ],
      }),
    ]);

    const due = dueCardsForBoard({ mapState: state, cards: [], now, today });
    expect(due).toHaveLength(2);

    const monthly = due.find((card) => card.generatedBy?.ruleId === "check-email");
    expect(monthly).toMatchObject({
      id: "wo-gen-emails-check-email-2026-07-01",
      type: "task",
      status: "open",
      domainId: "alexandria",
      entityId: "sys-emails",
      assignee: "colleague:raven",
      priority: 15,
      source: "system:sys-emails",
      created: "2026-07-14",
      title: "Check and respond to customer emails",
      generatedBy: {
        systemId: "sys-emails",
        ruleId: "check-email",
        window: "2026-07-01T00:00:00.000Z",
      },
    });
    expect(monthly?.detail).toBeUndefined();

    const quarterly = due.find((card) => card.generatedBy?.ruleId === "quarterly-review");
    expect(quarterly?.detail).toBe("Body text");
    expect(quarterly?.id).toBe("wo-gen-emails-quarterly-review-2026-07-01");
  });

  test("skips a rule that already has a card for the current window, regardless of status", () => {
    const state = baseState([
      plantedSystem({
        pattern: [{ id: "check-email", title: "Check email", every: "1mo" }],
      }),
    ]);
    const existing: InfoHubCard[] = [
      {
        id: "wo-gen-emails-check-email-2026-07-01",
        type: "task",
        status: "done",
        domainId: "alexandria",
        priority: 15,
        source: "system:sys-emails",
        created: "2026-07-01",
        generatedBy: {
          systemId: "sys-emails",
          ruleId: "check-email",
          window: "2026-07-01T00:00:00.000Z",
        },
      },
    ];

    const due = dueCardsForBoard({ mapState: state, cards: existing, now, today });
    expect(due).toHaveLength(0);
  });

  test("skips a rule whose only matching-window card is archived", () => {
    const state = baseState([
      plantedSystem({
        pattern: [{ id: "check-email", title: "Check email", every: "1mo" }],
      }),
    ]);
    const existing: InfoHubCard[] = [
      {
        id: "wo-gen-emails-check-email-2026-07-01",
        type: "task",
        status: "wont-do",
        archived: true,
        domainId: "alexandria",
        priority: 15,
        source: "system:sys-emails",
        created: "2026-07-01",
        generatedBy: {
          systemId: "sys-emails",
          ruleId: "check-email",
          window: "2026-07-01T00:00:00.000Z",
        },
      },
    ];

    const due = dueCardsForBoard({ mapState: state, cards: existing, now, today });
    expect(due).toHaveLength(0);
  });

  test("generates a new card once the window has rolled over, even if the prior window's card is still open", () => {
    const state = baseState([
      plantedSystem({
        pattern: [{ id: "check-email", title: "Check email", every: "1mo" }],
      }),
    ]);
    const existing: InfoHubCard[] = [
      {
        id: "wo-gen-emails-check-email-2026-06-01",
        type: "task",
        status: "open",
        domainId: "alexandria",
        priority: 15,
        source: "system:sys-emails",
        created: "2026-06-01",
        generatedBy: {
          systemId: "sys-emails",
          ruleId: "check-email",
          window: "2026-06-01T00:00:00.000Z",
        },
      },
    ];

    const due = dueCardsForBoard({ mapState: state, cards: existing, now, today });
    expect(due).toHaveLength(1);
    expect(due[0]?.id).toBe("wo-gen-emails-check-email-2026-07-01");
  });

  test("skips non-planted lifecycles (hibernating, uprooted) and patternless systems", () => {
    const state = baseState([
      plantedSystem({
        id: "sys-hibernating",
        lifecycle: "hibernating",
        pattern: [{ id: "r", title: "Rule", every: "1d" }],
      }),
      plantedSystem({
        id: "sys-uprooted",
        lifecycle: "uprooted",
        pattern: [{ id: "r", title: "Rule", every: "1d" }],
      }),
      plantedSystem({ id: "sys-no-pattern", lifecycle: "planted" }),
    ]);

    const due = dueCardsForBoard({ mapState: state, cards: [], now, today });
    expect(due).toHaveLength(0);
  });

  test("no backfill: a now far past several windows still yields exactly one card per rule", () => {
    const state = baseState([
      plantedSystem({
        pattern: [{ id: "check-email", title: "Check email", every: "1mo" }],
      }),
    ]);
    // Only wo-...-2026-01-01 through 2026-05-01 exist; several months are
    // "missed" but materialize-on-read never backfills them.
    const existing: InfoHubCard[] = ["2026-01-01", "2026-02-01", "2026-03-01"].map((window) => ({
      id: `wo-gen-emails-check-email-${window}`,
      type: "task",
      status: "done",
      domainId: "alexandria",
      priority: 15,
      source: "system:sys-emails",
      created: window,
      generatedBy: {
        systemId: "sys-emails",
        ruleId: "check-email",
        window: `${window}T00:00:00.000Z`,
      },
    }));

    const due = dueCardsForBoard({ mapState: state, cards: existing, now, today });
    expect(due).toHaveLength(1);
    expect(due[0]?.id).toBe("wo-gen-emails-check-email-2026-07-01");
    expect(due[0]?.generatedBy?.window).toBe("2026-07-01T00:00:00.000Z");
  });

  test("rule-level assignee wins over the system's assignee; falls back when the rule has none", () => {
    const state = baseState([
      plantedSystem({
        assignee: "human:danvers",
        pattern: [
          { id: "delegated", title: "Delegated rule", every: "1d", assignee: "colleague:raven" },
          { id: "not-delegated", title: "Owner rule", every: "1d" },
        ],
      }),
    ]);

    const due = dueCardsForBoard({ mapState: state, cards: [], now, today });
    const delegated = due.find((card) => card.generatedBy?.ruleId === "delegated");
    const notDelegated = due.find((card) => card.generatedBy?.ruleId === "not-delegated");
    expect(delegated?.assignee).toBe("colleague:raven");
    expect(notDelegated?.assignee).toBe("human:danvers");
  });

  test("omits assignee entirely when neither the rule nor the system has one", () => {
    const state = baseState([
      plantedSystem({ pattern: [{ id: "check-email", title: "Check email", every: "1d" }] }),
    ]);
    const due = dueCardsForBoard({ mapState: state, cards: [], now, today });
    expect(due[0]?.assignee).toBeUndefined();
  });

  test("suffixes the generated id deterministically on collision with an unrelated existing card", () => {
    const state = baseState([
      plantedSystem({
        pattern: [{ id: "check-email", title: "Check email", every: "1mo" }],
      }),
    ]);
    const existing: InfoHubCard[] = [
      {
        id: "wo-gen-emails-check-email-2026-07-01",
        type: "task",
        status: "open",
        domainId: "alexandria",
        priority: 15,
        source: "board:director",
        created: "2026-07-01",
      },
    ];

    const due = dueCardsForBoard({ mapState: state, cards: existing, now, today });
    expect(due).toHaveLength(1);
    expect(due[0]?.id).toBe("wo-gen-emails-check-email-2026-07-01-2");
  });

  test("hourly rules key the id by date and hour", () => {
    const state = baseState([
      plantedSystem({ pattern: [{ id: "check-email", title: "Check email", every: "6h" }] }),
    ]);
    const due = dueCardsForBoard({ mapState: state, cards: [], now, today });
    expect(due[0]?.id).toBe("wo-gen-emails-check-email-2026-07-14T06");
  });
});
