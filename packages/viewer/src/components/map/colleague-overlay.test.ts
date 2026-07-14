import { describe, expect, it } from "bun:test";
import type { InfoHubCard, MapState, RuntimeAgent } from "../../app/runtime/schemas";
import {
  colleagueNeedsHumanCount,
  resolveColleagueIdentity,
  topJournalEntries,
} from "./colleague-overlay";

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
      colleague: "raven",
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
