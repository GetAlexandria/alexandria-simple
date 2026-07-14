import { describe, expect, it } from "bun:test";
import type { InfoHubCard, MapState } from "../../app/runtime/schemas";
import { createHex } from "./hex";
import {
  cardsJoinedToEntity,
  entityIdForDraft,
  entityKindLabel,
  isStrayCard,
  looseCardsForAssignee,
  looseCardsForDomain,
  occupiedHexKeys,
  placeableHexKeys,
  placedEntities,
  positionedEntityIds,
  promotionDraftFromCard,
  strayCardCountsByAssignee,
  strayCardCountsByDomain,
  strayCountsEqual,
  unplacedEntities,
  withCardJoin,
  withEntityCreated,
  withEntityEdited,
  withEntityPlaced,
  withEntityRemoved,
} from "./placement";
import { UNASSIGNED_ASSIGNEE_KEY } from "./vocabulary";

const BASE_STATE: MapState = {
  contexts: [{ domainId: "software", id: "ctx-a", name: "Context A" }],
  domains: [
    { half: "work", id: "software", name: "Software", region: { center: [0, 0], radius: 2 } },
  ],
  entities: [
    {
      contextId: "ctx-a",
      domainId: "software",
      id: "proj-1",
      kind: "project",
      lifecycle: "active",
      name: "Project One",
    },
    {
      contextId: "ctx-a",
      domainId: "software",
      id: "sys-1",
      kind: "system",
      lifecycle: "planted",
      name: "System One",
    },
    {
      contextId: "ctx-a",
      domainId: "software",
      id: "sys-uprooted",
      kind: "system",
      lifecycle: "uprooted",
      name: "Uprooted System",
    },
  ],
  positions: [
    { entityId: "proj-1", entityType: "project", q: 0, r: -1 },
    // A hand-edited/unconditional write left the uprooted system with a
    // stored position — it still occupies its hex (plan §1.3).
    { entityId: "sys-uprooted", entityType: "system", q: 1, r: -1 },
    { entityId: "seat:reserved", entityType: "landmark", q: 0, r: -2 },
  ],
};

describe("occupiedHexKeys", () => {
  it("includes entity positions and landmark positions alike", () => {
    const keys = occupiedHexKeys(BASE_STATE);
    // hexToKey encodes the cube coordinate as "q,r,s".
    expect(keys.has("0,-1,1")).toBe(true);
    expect(keys.has("1,-1,0")).toBe(true);
    expect(keys.has("0,-2,2")).toBe(true);
    expect(keys.size).toBe(3);
  });
});

describe("positionedEntityIds", () => {
  it("excludes landmark positions (they are not entities)", () => {
    const ids = positionedEntityIds(BASE_STATE);
    expect(ids.has("proj-1")).toBe(true);
    expect(ids.has("sys-uprooted")).toBe(true);
    expect(ids.has("seat:reserved")).toBe(false);
  });
});

describe("unplacedEntities / placedEntities", () => {
  const positioned = positionedEntityIds(BASE_STATE);

  it("never lists an uprooted system as unplaced, even without a stored position", () => {
    const stateWithoutUprootedPosition: MapState = {
      ...BASE_STATE,
      positions: BASE_STATE.positions.filter((position) => position.entityId !== "sys-uprooted"),
    };
    const freshPositioned = positionedEntityIds(stateWithoutUprootedPosition);
    const unplaced = unplacedEntities(stateWithoutUprootedPosition, freshPositioned);
    expect(unplaced.map((entity) => entity.id)).not.toContain("sys-uprooted");
  });

  it("lists sys-1 (no stored position, not uprooted) as unplaced", () => {
    const unplaced = unplacedEntities(BASE_STATE, positioned);
    expect(unplaced.map((entity) => entity.id)).toEqual(["sys-1"]);
  });

  it("lists proj-1 and the uprooted system as placed (both hold positions)", () => {
    const placed = placedEntities(BASE_STATE, positioned);
    expect(placed.map((entity) => entity.id).sort()).toEqual(["proj-1", "sys-uprooted"]);
  });
});

describe("placeableHexKeys", () => {
  it("returns only the requested context's patch cells minus occupied hexes", () => {
    const patchByCellKey = new Map([
      ["0,-1", "ctx-a"],
      ["1,-1", "ctx-a"],
      ["2,-1", "ctx-a"],
      ["0,0", "ctx-b"],
    ]);
    const occupied = new Set(["0,-1"]);
    const keys = placeableHexKeys(patchByCellKey, "ctx-a", occupied);
    expect(keys).toEqual(new Set(["1,-1", "2,-1"]));
  });

  it("returns an empty set when the context has no free patch cells", () => {
    const patchByCellKey = new Map([["0,-1", "ctx-a"]]);
    const occupied = new Set(["0,-1"]);
    expect(placeableHexKeys(patchByCellKey, "ctx-a", occupied)).toEqual(new Set());
  });
});

describe("withEntityPlaced", () => {
  it("appends a position for the entity at the given hex, preserving the rest of the document", () => {
    const entity = BASE_STATE.entities.find((candidate) => candidate.id === "sys-1")!;
    const next = withEntityPlaced(BASE_STATE, entity, createHex(5, -3));
    expect(next.positions).toHaveLength(BASE_STATE.positions.length + 1);
    expect(next.positions.at(-1)).toEqual({ entityId: "sys-1", entityType: "system", q: 5, r: -3 });
    expect(next.contexts).toBe(BASE_STATE.contexts);
    expect(next.domains).toBe(BASE_STATE.domains);
    expect(next.entities).toBe(BASE_STATE.entities);
  });
});

describe("withEntityRemoved", () => {
  it("drops the entity's position but preserves landmark positions", () => {
    const next = withEntityRemoved(BASE_STATE, "proj-1");
    expect(next.positions.map((position) => position.entityId)).toEqual([
      "sys-uprooted",
      "seat:reserved",
    ]);
  });

  it("preserves landmark positions even when a landmark id collides with the removed entity id", () => {
    const withCollision: MapState = {
      ...BASE_STATE,
      positions: [
        ...BASE_STATE.positions,
        { entityId: "proj-1", entityType: "landmark", q: 9, r: -9 },
      ],
    };
    const next = withEntityRemoved(withCollision, "proj-1");
    // The entity position for proj-1 is dropped; the landmark position that
    // happens to share the same id string survives because it's a landmark.
    expect(
      next.positions.filter(
        (position) => position.entityId === "proj-1" && position.entityType === "landmark",
      ),
    ).toHaveLength(1);
    expect(
      next.positions.filter(
        (position) => position.entityId === "proj-1" && position.entityType === "project",
      ),
    ).toHaveLength(0);
  });

  it("is a no-op when the entity has no stored position", () => {
    const next = withEntityRemoved(BASE_STATE, "sys-1");
    expect(next.positions).toEqual(BASE_STATE.positions);
  });
});

describe("entityIdForDraft", () => {
  it("uses the seed scheme: kind prefix + slugified name", () => {
    expect(entityIdForDraft("project", "Map tab", new Set())).toBe("prj-map-tab");
    expect(entityIdForDraft("system", "Raven duty loop!", new Set())).toBe("sys-raven-duty-loop");
  });

  it("falls back to the kind word when the name slugs away entirely", () => {
    expect(entityIdForDraft("project", "!!!", new Set())).toBe("prj-project");
  });

  it("suffixes -2, -3, … when the base id is taken", () => {
    const taken = new Set(["prj-map-tab", "prj-map-tab-2"]);
    expect(entityIdForDraft("project", "Map tab", taken)).toBe("prj-map-tab-3");
  });
});

describe("withEntityCreated", () => {
  it("appends an unplaced entity, trimming the name and omitting blank system fields", () => {
    const { next, entity } = withEntityCreated(BASE_STATE, {
      cadence: "  ",
      colleague: "",
      contextId: "ctx-a",
      kind: "system",
      lifecycle: "planted",
      name: "  Night watch  ",
    });
    expect(entity).toEqual({
      id: "sys-night-watch",
      kind: "system",
      name: "Night watch",
      contextId: "ctx-a",
      domainId: "software",
      lifecycle: "planted",
    });
    expect(next.entities.at(-1)).toEqual(entity);
    // Unplaced: no position appears, and the rest of the document is shared.
    expect(next.positions).toBe(BASE_STATE.positions);
    expect(next.contexts).toBe(BASE_STATE.contexts);
  });

  it("keeps cadence and folds colleague into assignee on a system when provided", () => {
    const { entity } = withEntityCreated(BASE_STATE, {
      cadence: "30m",
      colleague: "raven",
      contextId: "ctx-a",
      kind: "system",
      lifecycle: "planted",
      name: "Duty loop",
    });
    expect(entity.cadence).toBe("30m");
    // The form's bare colleague folds into the work-item assignee.
    expect(entity.assignee).toBe("colleague:raven");
  });

  it("never writes cadence/assignee on a project draft", () => {
    const { entity } = withEntityCreated(BASE_STATE, {
      cadence: "30m",
      colleague: "raven",
      contextId: "ctx-a",
      kind: "project",
      lifecycle: "active",
      name: "Spring clean",
    });
    expect(entity).toEqual({
      id: "prj-spring-clean",
      kind: "project",
      name: "Spring clean",
      contextId: "ctx-a",
      domainId: "software",
      lifecycle: "active",
    });
  });
});

describe("withEntityEdited", () => {
  it("rewrites the entity fields but keeps id and kind fixed", () => {
    const next = withEntityEdited(BASE_STATE, "proj-1", {
      contextId: "ctx-a",
      kind: "system", // ignored — kind is identity
      lifecycle: "completed",
      name: "Project One (done)",
    });
    const edited = next.entities.find((entity) => entity.id === "proj-1")!;
    expect(edited.kind).toBe("project");
    expect(edited.name).toBe("Project One (done)");
    expect(edited.lifecycle).toBe("completed");
    // Completing a project keeps its position (victories stay visible).
    expect(next.positions).toEqual(BASE_STATE.positions);
  });

  it("removes a system's position when its lifecycle becomes uprooted", () => {
    const next = withEntityEdited(BASE_STATE, "sys-uprooted", {
      contextId: "ctx-a",
      kind: "system",
      lifecycle: "uprooted",
      name: "Uprooted System",
    });
    expect(next.positions.some((position) => position.entityId === "sys-uprooted")).toBe(false);
    // Landmarks and other entities keep their positions.
    expect(next.positions.map((position) => position.entityId)).toEqual([
      "proj-1",
      "seat:reserved",
    ]);
  });

  it("is a no-op for an unknown entity id", () => {
    const next = withEntityEdited(BASE_STATE, "missing", {
      contextId: "ctx-a",
      kind: "project",
      lifecycle: "active",
      name: "Ghost",
    });
    expect(next).toBe(BASE_STATE);
  });
});

const cardFixture = (overrides: Partial<InfoHubCard> & { id: string }): InfoHubCard => ({
  created: "2026-07-01",
  domainId: "alexandria",
  priority: 10,
  source: "test",
  status: "open",
  type: "task",
  ...overrides,
});

describe("stray-card derivation", () => {
  const cards: InfoHubCard[] = [
    cardFixture({ id: "stray-a", domainId: "software", contextId: "ctx-a" }),
    cardFixture({
      id: "stray-a-2",
      domainId: "software",
      contextId: "ctx-a",
      status: "in-progress",
    }),
    // No context, non-terminal → still a stray, surfacing in its DOMAIN.
    // Strays v1 drops the old contextId-required rule.
    cardFixture({ id: "no-context", domainId: "software" }),
    cardFixture({ id: "stray-b", domainId: "writing", status: "needs-a-human" }),
    // Joined to an entity → not stray (regardless of domain/context).
    cardFixture({ id: "joined", domainId: "software", contextId: "ctx-a", entityId: "proj-1" }),
    // Terminal → not stray (done work leaves the pile).
    cardFixture({ id: "done", domainId: "software", contextId: "ctx-a", status: "done" }),
    cardFixture({ id: "wont", domainId: "software", status: "wont-do" }),
  ];

  it("counts entity-less, non-terminal cards per DOMAIN — a no-context card still counts", () => {
    expect(strayCardCountsByDomain(cards)).toEqual({ software: 3, writing: 1 });
  });

  it("isStrayCard matches any entity-less, non-terminal card (context not required)", () => {
    expect(cards.filter(isStrayCard).map((card) => card.id)).toEqual([
      "stray-a",
      "stray-a-2",
      "no-context",
      "stray-b",
    ]);
  });

  it("looseCardsForDomain lists one domain's pile cards, including no-context strays", () => {
    expect(looseCardsForDomain(cards, "software").map((card) => card.id)).toEqual([
      "stray-a",
      "stray-a-2",
      "no-context",
    ]);
  });

  it("cardsJoinedToEntity keeps every status (the overlay shows finished work too)", () => {
    const withDoneJoin = [
      ...cards,
      cardFixture({ id: "joined-done", entityId: "proj-1", status: "done" }),
    ];
    expect(cardsJoinedToEntity(withDoneJoin, "proj-1").map((card) => card.id)).toEqual([
      "joined",
      "joined-done",
    ]);
  });
});

describe("stray-card derivation by assignee", () => {
  const cards: InfoHubCard[] = [
    cardFixture({ id: "raven-a", assignee: "colleague:raven" }),
    cardFixture({ id: "raven-b", assignee: "colleague:raven", status: "in-progress" }),
    cardFixture({ id: "danvers-a", assignee: "human:danvers" }),
    // No assignee → the unassigned bucket (a real key here, unlike domainId).
    cardFixture({ id: "loose-a" }),
    cardFixture({ id: "loose-b", status: "needs-a-human" }),
    // Joined to an entity → not stray, regardless of assignee.
    cardFixture({ id: "joined", assignee: "colleague:raven", entityId: "prj-x" }),
    // Terminal → not stray.
    cardFixture({ id: "done", assignee: "human:danvers", status: "done" }),
  ];

  it("counts entity-less, non-terminal cards per assignee, unassigned under the sentinel key", () => {
    expect(strayCardCountsByAssignee(cards)).toEqual({
      "colleague:raven": 2,
      "human:danvers": 1,
      [UNASSIGNED_ASSIGNEE_KEY]: 2,
    });
  });

  it("looseCardsForAssignee lists one assignee's pile cards", () => {
    expect(looseCardsForAssignee(cards, "colleague:raven").map((card) => card.id)).toEqual([
      "raven-a",
      "raven-b",
    ]);
  });

  it("looseCardsForAssignee returns the unassigned strays for the sentinel key", () => {
    expect(looseCardsForAssignee(cards, UNASSIGNED_ASSIGNEE_KEY).map((card) => card.id)).toEqual([
      "loose-a",
      "loose-b",
    ]);
  });
});

describe("withCardJoin", () => {
  it("sets both join fields", () => {
    const joined = withCardJoin(cardFixture({ id: "c" }), {
      contextId: "ctx-a",
      entityId: "proj-1",
    });
    expect(joined.contextId).toBe("ctx-a");
    expect(joined.entityId).toBe("proj-1");
  });

  it("omits blank ids entirely — an empty string is never written (M1 validators reject it)", () => {
    const cleared = withCardJoin(cardFixture({ id: "c", contextId: "ctx-a", entityId: "proj-1" }), {
      contextId: "",
      entityId: undefined,
    });
    expect("contextId" in cleared).toBe(false);
    expect("entityId" in cleared).toBe(false);
  });
});

describe("promotionDraftFromCard", () => {
  it("builds an active, unplaced project draft from the card title", () => {
    const draft = promotionDraftFromCard(
      cardFixture({ id: "wo-x", title: "Ship the overlay" }),
      "ctx-a",
    );
    expect(draft).toEqual({
      contextId: "ctx-a",
      kind: "project",
      lifecycle: "active",
      name: "Ship the overlay",
    });
  });

  it("falls back to the card id when the title is missing/blank", () => {
    expect(promotionDraftFromCard(cardFixture({ id: "wo-x", title: "  " }), "ctx-a").name).toBe(
      "wo-x",
    );
  });
});

describe("entityKindLabel", () => {
  it("labels each kind", () => {
    expect(entityKindLabel("project")).toBe("Project");
    expect(entityKindLabel("system")).toBe("System");
  });
});

describe("strayCountsEqual", () => {
  it("is true only when the same ids carry the same counts", () => {
    expect(strayCountsEqual({}, {})).toBe(true);
    expect(strayCountsEqual({ software: 2, writing: 1 }, { writing: 1, software: 2 })).toBe(true);
    expect(strayCountsEqual({ software: 2 }, { software: 3 })).toBe(false);
    expect(strayCountsEqual({ software: 1 }, { software: 1, writing: 1 })).toBe(false);
    expect(strayCountsEqual({ software: 1 }, { writing: 1 })).toBe(false);
  });
});
