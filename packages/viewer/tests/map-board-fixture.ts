// Shared Map-tab e2e fixture data (S2): the map document and board cards
// served by serve-viewer-fixture.ts AND imported by map-tab.spec.ts, which
// recomputes the Domain-view layout from the same state to find tile/pile
// world coordinates for canvas clicks.

import type { InfoHubCard, MapState } from "../src/app/runtime/schemas";

export function initialFixtureMapState(): MapState {
  return {
    domains: [
      {
        id: "software",
        name: "Software",
        half: "work",
        owner: "human:danvers",
        region: { center: [0, -3], radius: 2 },
      },
      {
        id: "new-media",
        name: "New Media",
        half: "work",
        owner: "colleague:damien",
        region: { center: [-4, -1], radius: 1 },
      },
    ],
    contexts: [
      { id: "viewer", name: "Viewer", domainId: "software" },
      { id: "colleagues", name: "Colleagues", domainId: "software" },
      { id: "demos", name: "Demos", domainId: "new-media" },
    ],
    entities: [
      {
        id: "sys-raven-duty-loop",
        kind: "system",
        name: "Raven duty loop",
        contextId: "colleagues",
        domainId: "software",
        assignee: "colleague:raven",
        cadence: "30m",
        lifecycle: "planted",
      },
      {
        id: "prj-map-tab",
        kind: "project",
        name: "Map tab",
        contextId: "viewer",
        domainId: "software",
        lifecycle: "active",
      },
      {
        id: "prj-trophy",
        kind: "project",
        name: "Trophy shelf",
        contextId: "viewer",
        domainId: "software",
        lifecycle: "completed",
      },
    ],
    positions: [
      { q: 0, r: -2, entityType: "system", entityId: "sys-raven-duty-loop" },
      { q: 1, r: -3, entityType: "project", entityId: "prj-map-tab" },
      { q: 0, r: -4, entityType: "project", entityId: "prj-trophy" },
      { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
    ],
  };
}

export function initialFixtureInfoHubCards(): InfoHubCard[] {
  return [
    {
      id: "wo-joined-one",
      type: "task",
      status: "open",
      domainId: "software",
      contextId: "viewer",
      entityId: "prj-map-tab",
      priority: 10,
      source: "seed:fixture",
      created: "2026-07-01",
      title: "Wire the overlay",
    },
    {
      id: "wo-joined-two",
      type: "bug",
      status: "in-progress",
      domainId: "software",
      contextId: "viewer",
      entityId: "prj-map-tab",
      priority: 12,
      source: "seed:fixture",
      created: "2026-07-02",
      title: "Fix the pile size step",
      checklist: [{ done: false, text: "Reproduce with six cards" }],
    },
    {
      id: "wo-stray-one",
      type: "task",
      status: "open",
      domainId: "software",
      contextId: "viewer",
      priority: 15,
      source: "seed:fixture",
      created: "2026-07-03",
      title: "Loose viewer chore",
    },
    {
      id: "wo-stray-two",
      type: "improvement",
      status: "needs-a-human",
      domainId: "software",
      contextId: "viewer",
      priority: 20,
      source: "seed:fixture",
      created: "2026-07-04",
      title: "Another loose viewer chore",
    },
    {
      id: "wo-stray-done",
      type: "task",
      status: "done",
      domainId: "software",
      contextId: "viewer",
      terminalAt: "2026-07-05",
      priority: 15,
      source: "seed:fixture",
      created: "2026-07-05",
      title: "Finished loose chore (not in the pile)",
    },
    {
      id: "wo-unmapped",
      type: "task",
      status: "open",
      domainId: "software",
      priority: 30,
      source: "seed:fixture",
      created: "2026-07-06",
      title: "Card with no map join",
    },
  ];
}
