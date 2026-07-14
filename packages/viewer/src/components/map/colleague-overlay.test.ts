import { describe, expect, it } from "bun:test";
import type {
  ColleagueJournal,
  InfoHubCard,
  MapEntity,
  MapState,
  RuntimeAgent,
} from "../../app/runtime/schemas";
import {
  colleagueEscalated,
  colleagueNeedsHumanCount,
  escalationByColleagueId,
  resolveColleagueIdentity,
  topJournalEntries,
} from "./colleague-overlay";
import type { TileSignals } from "./signals";

function agent(id: string, name: string, jobTitle: string): RuntimeAgent {
  return { id, name, jobTitle, knowledgeBankAreaIds: [], status: "available" };
}

const AGENTS: RuntimeAgent[] = [
  agent("raven", "Raven", "Product Owner"),
  agent("damien", "Damien", "Executive Producer of New Media"),
];

function card(overrides: Partial<InfoHubCard>): InfoHubCard {
  return {
    id: "wo-x",
    type: "task",
    status: "open",
    domainId: "alexandria",
    priority: 10,
    source: "seed:test",
    created: "2026-07-01",
    ...overrides,
  };
}

function systemEntity(overrides: Partial<MapEntity> & { id: string }): MapEntity {
  return {
    kind: "system",
    contextId: "colleagues",
    domainId: "alexandria",
    lifecycle: "planted",
    name: overrides.name ?? overrides.id,
    ...overrides,
  };
}

function tileSignals(overrides: Partial<TileSignals>): TileSignals {
  return {
    needsHuman: false,
    stale: false,
    filledDots: 3,
    overdue: false,
    healthKnown: false,
    ...overrides,
  };
}

const STATE: MapState = {
  domains: [],
  contexts: [],
  entities: [
    {
      id: "sys-raven-duty-loop",
      kind: "system",
      name: "Raven duty loop",
      contextId: "colleagues",
      domainId: "alexandria",
      assignee: "colleague:raven",
      lifecycle: "planted",
    },
    {
      id: "prj-map-tab",
      kind: "project",
      name: "Map tab",
      contextId: "viewer",
      domainId: "alexandria",
      lifecycle: "active",
    },
  ],
  positions: [],
};

describe("resolveColleagueIdentity", () => {
  it("takes name and role from the agent roster", () => {
    expect(resolveColleagueIdentity("damien", AGENTS)).toEqual({
      id: "damien",
      name: "Damien",
      role: "Executive Producer of New Media",
    });
  });

  it("falls back to the capitalized id with no role when off-roster", () => {
    expect(resolveColleagueIdentity("nova", AGENTS)).toEqual({
      id: "nova",
      name: "Nova",
      role: null,
    });
  });
});

describe("colleagueNeedsHumanCount", () => {
  it("counts needs-a-human cards joined to the colleague's systems", () => {
    const cards = [
      card({ id: "a", status: "needs-a-human", entityId: "sys-raven-duty-loop" }),
      card({ id: "b", status: "needs-a-human", entityId: "sys-raven-duty-loop" }),
      // Wrong status — not counted.
      card({ id: "c", status: "open", entityId: "sys-raven-duty-loop" }),
      // Joined to a project the colleague does not run — not counted.
      card({ id: "d", status: "needs-a-human", entityId: "prj-map-tab" }),
      // No entity join — not counted.
      card({ id: "e", status: "needs-a-human", contextId: "colleagues" }),
    ];
    expect(colleagueNeedsHumanCount(STATE, cards, "raven")).toBe(2);
  });

  it("is zero for a colleague that runs no systems", () => {
    const cards = [card({ id: "a", status: "needs-a-human", entityId: "sys-raven-duty-loop" })];
    expect(colleagueNeedsHumanCount(STATE, cards, "damien")).toBe(0);
  });
});

describe("topJournalEntries", () => {
  it("returns the head slice (entries are already newest-first)", () => {
    expect(topJournalEntries([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
  });

  it("returns everything when there are fewer than the limit", () => {
    expect(topJournalEntries([1, 2], 3)).toEqual([1, 2]);
  });

  it("clamps a negative limit to empty", () => {
    expect(topJournalEntries([1, 2, 3], -1)).toEqual([]);
  });
});

describe("colleagueEscalated", () => {
  const NO_SIGNALS: ReadonlyMap<string, TileSignals> = new Map();

  it("escalates when a needs-a-human card is joined to the colleague's system", () => {
    const cards = [card({ id: "a", status: "needs-a-human", entityId: "sys-raven-duty-loop" })];
    expect(
      colleagueEscalated({
        state: STATE,
        cards,
        signalsByEntityId: NO_SIGNALS,
        colleagueId: "raven",
      }),
    ).toBe(true);
  });

  it("escalates when one of the colleague's systems is overdue", () => {
    const signalsByEntityId = new Map<string, TileSignals>([
      ["sys-raven-duty-loop", tileSignals({ overdue: true, filledDots: 0, healthKnown: true })],
    ]);
    expect(
      colleagueEscalated({ state: STATE, cards: [], signalsByEntityId, colleagueId: "raven" }),
    ).toBe(true);
  });

  it("escalates when a system's health is known and fully drained (0 dots)", () => {
    const signalsByEntityId = new Map<string, TileSignals>([
      ["sys-raven-duty-loop", tileSignals({ overdue: false, filledDots: 0, healthKnown: true })],
    ]);
    expect(
      colleagueEscalated({ state: STATE, cards: [], signalsByEntityId, colleagueId: "raven" }),
    ).toBe(true);
  });

  it("does NOT escalate on drained dots whose health is UNKNOWN (never-beaten)", () => {
    const signalsByEntityId = new Map<string, TileSignals>([
      ["sys-raven-duty-loop", tileSignals({ overdue: false, filledDots: 0, healthKnown: false })],
    ]);
    expect(
      colleagueEscalated({ state: STATE, cards: [], signalsByEntityId, colleagueId: "raven" }),
    ).toBe(false);
  });

  it("does NOT escalate a healthy system with no needs-a-human cards", () => {
    const signalsByEntityId = new Map<string, TileSignals>([
      ["sys-raven-duty-loop", tileSignals({ filledDots: 3, overdue: false, healthKnown: true })],
    ]);
    expect(
      colleagueEscalated({ state: STATE, cards: [], signalsByEntityId, colleagueId: "raven" }),
    ).toBe(false);
  });

  it("does not let one colleague's overdue system escalate another colleague", () => {
    const signalsByEntityId = new Map<string, TileSignals>([
      ["sys-raven-duty-loop", tileSignals({ overdue: true, filledDots: 0, healthKnown: true })],
    ]);
    // damien runs no system in STATE, so raven's overdue system must not leak.
    expect(
      colleagueEscalated({ state: STATE, cards: [], signalsByEntityId, colleagueId: "damien" }),
    ).toBe(false);
  });
});

describe("escalationByColleagueId", () => {
  const NOW = Date.parse("2026-07-13T14:00:00Z");
  const escalationState: MapState = {
    domains: [],
    contexts: [],
    entities: [
      systemEntity({ id: "sys-raven", assignee: "colleague:raven", cadence: "30m" }),
      systemEntity({ id: "sys-damien", assignee: "colleague:damien", cadence: "30m" }),
    ],
    positions: [],
  };
  // raven beat minutes ago (healthy); damien last beat on July 1 (overdue).
  const journals: ColleagueJournal[] = [
    {
      colleague: "raven",
      entries: [{ timestamp: "2026-07-13T13:45:00Z", title: "beat", body: "" }],
    },
    {
      colleague: "damien",
      entries: [{ timestamp: "2026-07-01T00:00:00Z", title: "beat", body: "" }],
    },
  ];

  it("keys one entry per colleague with a map entity; true only for the escalated one", () => {
    // A needs-a-human card joined to raven's system → raven escalated; damien calm
    // (journals omitted so no health signal fires for either).
    const cards = [card({ id: "n", status: "needs-a-human", entityId: "sys-raven" })];
    const result = escalationByColleagueId({
      state: escalationState,
      cards,
      journals: [],
      nowMs: NOW,
    });
    expect(result.get("raven")).toBe(true);
    expect(result.get("damien")).toBe(false);
  });

  it("escalates a colleague whose system has gone overdue (journal lapsed)", () => {
    const result = escalationByColleagueId({
      state: escalationState,
      cards: [],
      journals,
      nowMs: NOW,
    });
    expect(result.get("damien")).toBe(true);
    expect(result.get("raven")).toBe(false);
  });

  it("leaves the health/overdue half inert when journals are unavailable (info surface)", () => {
    // journals == null → no system reads overdue, so nobody escalates on health…
    const calm = escalationByColleagueId({
      state: escalationState,
      cards: [],
      journals: null,
      nowMs: NOW,
    });
    expect(calm.get("raven")).toBe(false);
    expect(calm.get("damien")).toBe(false);
    // …but a needs-a-human card still escalates without any journal data.
    const withCard = escalationByColleagueId({
      state: escalationState,
      cards: [card({ id: "n", status: "needs-a-human", entityId: "sys-damien" })],
      journals: null,
      nowMs: NOW,
    });
    expect(withCard.get("damien")).toBe(true);
  });

  it("omits colleagues with no map entity (absent from the map = no glow)", () => {
    const result = escalationByColleagueId({
      state: escalationState,
      cards: [],
      journals: [],
      nowMs: NOW,
    });
    expect(result.has("nova")).toBe(false);
    expect([...result.keys()].sort()).toEqual(["damien", "raven"]);
  });

  it("the fold: a human-assigned or unassigned entity keys no colleague and feeds no glow", () => {
    // Only colleague-kind assignees derive an agent id; a human-assigned system
    // and an unassigned one contribute nothing to the coin-tray rollup, even
    // when they carry a needs-a-human card.
    const humanState: MapState = {
      domains: [],
      contexts: [],
      entities: [
        systemEntity({ id: "sys-human", assignee: "human:danvers", cadence: "30m" }),
        systemEntity({ id: "sys-none", cadence: "30m" }),
      ],
      positions: [],
    };
    const cards = [
      card({ id: "n1", status: "needs-a-human", entityId: "sys-human" }),
      card({ id: "n2", status: "needs-a-human", entityId: "sys-none" }),
    ];
    const result = escalationByColleagueId({ state: humanState, cards, journals: [], nowMs: NOW });
    expect([...result.keys()]).toEqual([]);
    // And a human id never resolves through the colleague count.
    expect(colleagueNeedsHumanCount(humanState, cards, "danvers")).toBe(0);
  });
});
