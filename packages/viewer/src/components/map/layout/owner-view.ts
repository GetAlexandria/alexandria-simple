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
// layout/domain-view.ts; the two stay independent but share conventions —
// in particular, territory washes render through MapScene's cellTintByKey
// (the parchment shader tint), not overlay meshes, so the ground grid stays
// one draw pass and the hover highlight keeps working over tinted cells.

import type { MapDomain, MapEntity, MapState } from "../../../app/runtime/schemas";
import { OWNER_VIEW_TERRITORY_TINTS, type HexTint } from "../colors";
import { createHex, generateHexGrid, hexAdd, hexToKey, type HexCoord } from "../hex";
import { parseDomainOwner, parseLandmarkId, type DomainOwnership } from "../vocabulary";

/** A positioned project/system rendered inside its owner's territory. */
export type OwnerWorkMarker = {
  entity: MapEntity;
  coord: HexCoord;
};

export type OwnerTerritory = {
  domain: MapDomain;
  /**
   * Owned, unclaimed (dimmed territory + vacant plot — a demand signal, not
   * an error), or malformed (the unclaimed treatment plus a warning chip).
   */
  ownership: DomainOwnership;
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
  /**
   * Parchment wash per grid-cell key for MapScene's cellTintByKey: claimed
   * territories take the warm wash, unclaimed/malformed the muted dim.
   * Overlapping region discs resolve toward the lexicographically smaller
   * domain id (the Domain-view tie-break convention), so reordering domains
   * in the git-tracked state file never repaints the overlap.
   */
  tintByCellKey: ReadonlyMap<string, HexTint>;
};

/** Every hex within `radius` of `center` (the domain's territory patch). */
const hexesWithin = (center: HexCoord, radius: number): HexCoord[] =>
  generateHexGrid(radius).map((cell) => hexAdd(center, cell.coord));

/**
 * Build the Owner-view layout from M1-shaped map state: one territory per
 * domain anchored at its region center, positioned work joined to its
 * domain via its `domainId`, and the locked seats passed through.
 */
export function buildOwnerViewLayout(state: MapState): OwnerViewLayout {
  const entityById = new Map(state.entities.map((entity) => [entity.id, entity]));

  const workByDomainId = new Map<string, OwnerWorkMarker[]>();
  const seats: LockedSeat[] = [];

  for (const position of state.positions) {
    if (position.entityType === "landmark") {
      if (parseLandmarkId(position.entityId).kind === "seat") {
        seats.push({ id: position.entityId, coord: createHex(position.q, position.r) });
      }
      continue;
    }

    const entity = entityById.get(position.entityId);
    if (entity === undefined) {
      continue;
    }

    const domainId = entity.domainId;
    const markers = workByDomainId.get(domainId) ?? [];
    markers.push({ entity, coord: createHex(position.q, position.r) });
    workByDomainId.set(domainId, markers);
  }

  const territories = state.domains.map((domain): OwnerTerritory => {
    const [q, r] = domain.region.center;
    const anchor = createHex(q, r);

    return {
      domain,
      ownership: parseDomainOwner(domain.owner),
      anchor,
      cells: hexesWithin(anchor, domain.region.radius),
      work: workByDomainId.get(domain.id) ?? [],
    };
  });

  // First-write-wins per cell, iterated in domain-id order (not file order)
  // so an overlap resolves identically however the file is arranged.
  const tintByCellKey = new Map<string, HexTint>();
  const territoriesById = [...territories].sort((left, right) =>
    left.domain.id < right.domain.id ? -1 : left.domain.id > right.domain.id ? 1 : 0,
  );
  for (const territory of territoriesById) {
    const tint =
      territory.ownership.status === "owned"
        ? OWNER_VIEW_TERRITORY_TINTS.claimed
        : OWNER_VIEW_TERRITORY_TINTS.unclaimed;
    for (const cell of territory.cells) {
      const key = hexToKey(cell);
      if (!tintByCellKey.has(key)) {
        tintByCellKey.set(key, tint);
      }
    }
  }

  return { territories, seats, tintByCellKey };
}
