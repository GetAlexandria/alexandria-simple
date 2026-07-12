// Fresh V2 module (not a promotion): the Owner-view layout function
// (plan §1.2 — the Playbook / org-chart look). Pure state → geometry over
// the M1 map-state shape; no three.js, no React, so it stays bun-testable.
//
// Owner view re-anchors each domain on its responsible agent or human: the
// owner's landmark renders at the domain's region center with the territory
// around it. Stored `colleague:` landmark positions are Domain-view
// furniture and are intentionally ignored here; `seat:` landmark positions
// (the locked future bench seats) are view-independent and pass through.
//
// Sibling file note: V1's Domain-view layout lives beside this module as
// layout/domain-view.ts on its own branch; keep the two independent.

import type { MapDomain, MapEntity, MapState } from "../../../app/runtime/schemas";
import { createHex, generateHexGrid, hexAdd, type HexCoord } from "../hex";

/** Landmark-position id prefix for the locked future-seat plots. */
export const LOCKED_SEAT_PREFIX = "seat:";

const COLLEAGUE_OWNER_PREFIX = "colleague:";
const HUMAN_OWNER_PREFIX = "human:";

export type DomainOwnerKind = "colleague" | "human";

export type DomainOwner = {
  kind: DomainOwnerKind;
  /** Bare owner id without the kind prefix, e.g. "raven". */
  id: string;
  /** Display name derived from the id. */
  name: string;
};

/** A positioned project/system rendered inside its owner's territory. */
export type OwnerWorkMarker = {
  entity: MapEntity;
  coord: HexCoord;
};

export type OwnerTerritory = {
  domain: MapDomain;
  /** Undefined = unclaimed: dimmed territory + vacant-plot marker (a demand signal, not an error). */
  owner: DomainOwner | undefined;
  /** Region center; the owner landmark (or vacant-plot marker) renders here. */
  anchor: HexCoord;
  /** Every hex inside the domain's region. */
  cells: HexCoord[];
  work: OwnerWorkMarker[];
};

/** A locked future-seat plot: a vacant landmark awaiting a colleague. */
export type LockedSeat = {
  id: string;
  coord: HexCoord;
};

export type OwnerViewLayout = {
  territories: OwnerTerritory[];
  seats: LockedSeat[];
};

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Parse a domain's `owner` field ("colleague:raven" | "human:danvers").
 * Absent owner → undefined (the unclaimed case). A value outside the known
 * vocabulary is treated as a human owner rather than silently rendering the
 * domain unclaimed.
 */
export function parseDomainOwner(owner: string | undefined): DomainOwner | undefined {
  if (owner === undefined || owner.length === 0) {
    return undefined;
  }

  if (owner.startsWith(COLLEAGUE_OWNER_PREFIX) && owner.length > COLLEAGUE_OWNER_PREFIX.length) {
    const id = owner.slice(COLLEAGUE_OWNER_PREFIX.length);
    return { kind: "colleague", id, name: capitalize(id) };
  }

  if (owner.startsWith(HUMAN_OWNER_PREFIX) && owner.length > HUMAN_OWNER_PREFIX.length) {
    const id = owner.slice(HUMAN_OWNER_PREFIX.length);
    return { kind: "human", id, name: capitalize(id) };
  }

  return { kind: "human", id: owner, name: capitalize(owner) };
}

/** Every hex within `radius` of `center` (the domain's territory patch). */
const hexesWithin = (center: HexCoord, radius: number): HexCoord[] =>
  generateHexGrid(radius).map((cell) => hexAdd(center, cell.coord));

/**
 * Build the Owner-view layout from M1-shaped map state: one territory per
 * domain anchored at its region center, positioned work joined to its
 * domain through the context chain, and the locked seats passed through.
 */
export function buildOwnerViewLayout(state: MapState): OwnerViewLayout {
  const domainIdByContextId = new Map(
    state.contexts.map((context) => [context.id, context.domainId]),
  );
  const entityById = new Map(state.entities.map((entity) => [entity.id, entity]));

  const workByDomainId = new Map<string, OwnerWorkMarker[]>();
  const seats: LockedSeat[] = [];

  for (const position of state.positions) {
    if (position.entityType === "landmark") {
      if (position.entityId.startsWith(LOCKED_SEAT_PREFIX)) {
        seats.push({ id: position.entityId, coord: createHex(position.q, position.r) });
      }
      continue;
    }

    const entity = entityById.get(position.entityId);
    if (entity === undefined) {
      continue;
    }

    const domainId = domainIdByContextId.get(entity.contextId);
    if (domainId === undefined) {
      continue;
    }

    const markers = workByDomainId.get(domainId) ?? [];
    markers.push({ entity, coord: createHex(position.q, position.r) });
    workByDomainId.set(domainId, markers);
  }

  const territories = state.domains.map((domain): OwnerTerritory => {
    const [q, r] = domain.region.center;
    const anchor = createHex(q, r);

    return {
      domain,
      owner: parseDomainOwner(domain.owner),
      anchor,
      cells: hexesWithin(anchor, domain.region.radius),
      work: workByDomainId.get(domain.id) ?? [],
    };
  });

  return { territories, seats };
}
