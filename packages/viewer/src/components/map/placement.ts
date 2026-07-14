// Placement and entity/card-join domain logic for the Map tab (S1 placement,
// S2 entity create/edit + card joins; plan §1.1), pulled out of MapTabView so
// it is three.js- and React-free and unit-tests under bun. Every map write
// goes through a `withX` function here that returns the next full document
// for useMapState's revision-guarded save; board-card joins return next-card
// values for the existing Info Hub board save path.

import type { InfoHubCard, MapEntity, MapEntityKind, MapState } from "../../app/runtime/schemas";
import { slugify, uniqueId } from "../id-slug";
import { isTerminalStatus } from "../library/infohub/boardModel";
import { createHex, hexToKey, type HexCoord } from "./hex";
import { assigneeKeyOf, COLLEAGUE_OWNER_PREFIX } from "./vocabulary";

// Viewer twins of the per-kind lifecycle vocabularies in
// packages/ax/src/effects/map-state.ts (MAP_PROJECT_LIFECYCLES /
// MAP_SYSTEM_LIFECYCLES) — ax owns validation server-side and cannot be
// imported from the browser bundle, so the entity form declares the same
// vocabulary here; the two must match.
export const PROJECT_LIFECYCLES = ["active", "completed"] as const;
export const SYSTEM_LIFECYCLES = ["planted", "hibernating", "uprooted"] as const;

export function lifecyclesForKind(kind: MapEntityKind): readonly string[] {
  return kind === "project" ? PROJECT_LIFECYCLES : SYSTEM_LIFECYCLES;
}

/** Display label for an entity kind — "Project" / "System" (the map's entity vocabulary). */
export function entityKindLabel(kind: MapEntityKind): string {
  return kind === "project" ? "Project" : "System";
}

/**
 * Every stored position occupies its hex — entity tiles and landmark hexes
 * alike (landmark hexes are the reserved ones, plan §1.3).
 */
export function occupiedHexKeys(state: MapState): Set<string> {
  return new Set(state.positions.map((position) => hexToKey(createHex(position.q, position.r))));
}

/** Entity ids with a stored position, excluding landmarks (which aren't entities). */
export function positionedEntityIds(state: MapState): Set<string> {
  return new Set(
    state.positions
      .filter((position) => position.entityType !== "landmark")
      .map((position) => position.entityId),
  );
}

/**
 * Entities with no stored position, excluding uprooted systems — an
 * uprooted system never re-enters placement (plan §1.3: it's retired, not
 * "unplaced").
 */
export function unplacedEntities(state: MapState, positioned: ReadonlySet<string>): MapEntity[] {
  return state.entities.filter(
    (entity) =>
      !positioned.has(entity.id) && !(entity.kind === "system" && entity.lifecycle === "uprooted"),
  );
}

/** Entities with a stored position (the tiles currently on the map). */
export function placedEntities(state: MapState, positioned: ReadonlySet<string>): MapEntity[] {
  return state.entities.filter((entity) => positioned.has(entity.id));
}

/** The free hexes of one context's patch — the placement highlight set. */
export function placeableHexKeys(
  patchByCellKey: ReadonlyMap<string, string>,
  contextId: string,
  occupied: ReadonlySet<string>,
): Set<string> {
  const keys = new Set<string>();
  for (const [key, patchContextId] of patchByCellKey) {
    if (patchContextId === contextId && !occupied.has(key)) {
      keys.add(key);
    }
  }
  return keys;
}

/** The next full document with `entity` newly placed at `coord`. */
export function withEntityPlaced(state: MapState, entity: MapEntity, coord: HexCoord): MapState {
  return {
    ...state,
    positions: [
      ...state.positions,
      { entityId: entity.id, entityType: entity.kind, q: coord.q, r: coord.r },
    ],
  };
}

/**
 * The next full document with `entityId`'s position removed. Landmark
 * positions are never entity positions, but the filter is written to
 * preserve them explicitly (not just "keep everything but this id") so a
 * future landmark whose id happens to collide with an entity id can't be
 * dropped by this call.
 */
export function withEntityRemoved(state: MapState, entityId: string): MapState {
  return {
    ...state,
    positions: state.positions.filter(
      (position) => position.entityType === "landmark" || position.entityId !== entityId,
    ),
  };
}

// --- Entity create/edit (S2) -----------------------------------------------

/**
 * Everything the entity form captures. `kind` is create-only: an entity's
 * id carries its kind prefix and its stored position carries its
 * entityType, so edits keep the kind fixed rather than rewriting identity.
 *
 * `colleague` is the form's bare-id colleague input (systems only); it folds
 * into the entity's `assignee` as `colleague:<id>` in entityFromDraft. The
 * full assignee picker (humans + colleagues, projects too) is a later PR.
 */
export type MapEntityDraft = {
  cadence?: string;
  colleague?: string;
  contextId: string;
  kind: MapEntityKind;
  lifecycle: string;
  name: string;
};

/** Entity-id prefix per kind — the seed file's scheme (`prj-map-tab`, `sys-raven-duty-loop`). */
export const ENTITY_ID_PREFIX_BY_KIND: Readonly<Record<MapEntityKind, string>> = {
  project: "prj-",
  system: "sys-",
};

/**
 * Id generation scheme for new entities: `prj-`/`sys-` (kind prefix, the
 * seed's convention) + the slugified name, with a `-2`, `-3`, … suffix when
 * the base id is already taken. Ids are permanent — renaming an entity does
 * not rewrite its id (board cards join by `entityId`).
 */
export function entityIdForDraft(
  kind: MapEntityKind,
  name: string,
  existingIds: ReadonlySet<string>,
): string {
  return uniqueId(`${ENTITY_ID_PREFIX_BY_KIND[kind]}${slugify(name) || kind}`, existingIds);
}

/**
 * The domain an entity inherits from its context. Entities carry a flat
 * `domainId` tag alongside `contextId`; it is derived here at create/edit
 * time from the selected context's domain (the map validator requires a
 * known domain id, so a draft whose context is unknown yields "" and fails
 * loudly server-side rather than inventing a domain).
 */
function domainIdForContextId(state: MapState, contextId: string): string {
  return state.contexts.find((context) => context.id === contextId)?.domainId ?? "";
}

/** A canonical entity from a form draft: trimmed, optional fields omitted (never ""). */
function entityFromDraft(id: string, draft: MapEntityDraft, domainId: string): MapEntity {
  const cadence = draft.cadence?.trim() ?? "";
  const colleague = draft.colleague?.trim() ?? "";
  return {
    id,
    kind: draft.kind,
    name: draft.name.trim(),
    contextId: draft.contextId,
    domainId,
    // The form's bare colleague folds into the work-item `assignee` as
    // `colleague:<id>`; cadence stays system-only. Both apply to systems only
    // here (the ax validator rejects cadence on a project, and the form only
    // offers colleague for systems) and are omitted entirely when blank — the
    // validators reject empty strings. A project's assignee is set elsewhere;
    // the full assignee picker (humans too) is a later PR.
    ...(draft.kind === "system" && colleague.length > 0
      ? { assignee: `${COLLEAGUE_OWNER_PREFIX}${colleague}` }
      : {}),
    ...(draft.kind === "system" && cadence.length > 0 ? { cadence } : {}),
    lifecycle: draft.lifecycle,
  };
}

/**
 * The next full document with a new entity appended (id generated from the
 * draft, see `entityIdForDraft`). The entity starts unplaced — it appears in
 * the placement panel's Unplaced list until the director places it.
 */
export function withEntityCreated(
  state: MapState,
  draft: MapEntityDraft,
): { next: MapState; entity: MapEntity } {
  const entity = entityFromDraft(
    entityIdForDraft(draft.kind, draft.name, new Set(state.entities.map((e) => e.id))),
    draft,
    domainIdForContextId(state, draft.contextId),
  );
  return { next: { ...state, entities: [...state.entities, entity] }, entity };
}

/**
 * The next full document with `entityId` rewritten from the draft (kind kept
 * from the existing entity — see MapEntityDraft). When a system's lifecycle
 * becomes `uprooted` its stored position is removed through the same filter
 * as the placement panel's Remove (plan §1.3: uprooted systems leave the
 * map); a completed project keeps its position ("victories stay visible").
 */
export function withEntityEdited(
  state: MapState,
  entityId: string,
  draft: MapEntityDraft,
): MapState {
  const existing = state.entities.find((entity) => entity.id === entityId);
  if (existing == null) {
    return state;
  }
  const edited = entityFromDraft(
    entityId,
    { ...draft, kind: existing.kind },
    domainIdForContextId(state, draft.contextId),
  );
  const next = {
    ...state,
    entities: state.entities.map((entity) => (entity.id === entityId ? edited : entity)),
  };
  return existing.kind === "system" && edited.lifecycle === "uprooted"
    ? withEntityRemoved(next, entityId)
    : next;
}

// --- Board-card joins and stray piles (S2, plan §1.1/§1.3) ------------------

/**
 * A card is stray when it is joined to no project/system and still live: no
 * `entityId`, status not terminal (done/wont-do). Strays v1 (board card
 * wo-map-stray-tasks-and-placement-v1) piles them by their required
 * `domainId`, not by context — so a card with no `contextId` still counts,
 * surfacing in its domain. Piles derive from this at read time — never stored.
 */
export function isStrayCard(card: InfoHubCard): boolean {
  return card.entityId == null && !isTerminalStatus(card.status);
}

/** Stray-card counts per domain id — the Domain-view layout's pile input. */
export function strayCardCountsByDomain(
  cards: readonly InfoHubCard[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    if (isStrayCard(card)) {
      // domainId is required on every board card (M1 schema), so every stray
      // buckets under a real key — no `??`-guarded fallback needed here.
      counts[card.domainId] = (counts[card.domainId] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * Value-equality of two stray-count maps — same domain ids, same counts.
 * The Map tab keys its domain-layout memo on this (not on board object
 * identity) so a board write that leaves every pile count unchanged — e.g.
 * toggling a checklist item on a card already joined to an entity — doesn't
 * re-run the whole territory/pile assignment.
 */
export function strayCountsEqual(
  a: Readonly<Record<string, number>>,
  b: Readonly<Record<string, number>>,
): boolean {
  const aKeys = Object.keys(a);
  return aKeys.length === Object.keys(b).length && aKeys.every((key) => a[key] === b[key]);
}

/** The cards joined to one entity (any status — the overlay shows the full run of work). */
export function cardsJoinedToEntity(
  cards: readonly InfoHubCard[],
  entityId: string,
): InfoHubCard[] {
  return cards.filter((card) => card.entityId === entityId);
}

/** One domain's loose cards — exactly the cards its stray pile counts. */
export function looseCardsForDomain(
  cards: readonly InfoHubCard[],
  domainId: string,
): InfoHubCard[] {
  return cards.filter((card) => isStrayCard(card) && card.domainId === domainId);
}

/**
 * Stray-card counts per ASSIGNEE — the Owner-by-assignee view's pile input, the
 * assignee twin of strayCardCountsByDomain. Each live, entity-less card counts
 * under its `assignee` ref (`human:`/`colleague:`), and cards with no assignee
 * count under UNASSIGNED_ASSIGNEE_KEY — so, unlike the always-present domainId,
 * the unassigned pile is a real bucket here (assigneeKeyOf owns that fold).
 */
export function strayCardCountsByAssignee(
  cards: readonly InfoHubCard[],
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    if (isStrayCard(card)) {
      const key = assigneeKeyOf(card.assignee);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * One assignee's loose cards — exactly the cards its Owner-view pile counts.
 * Pass UNASSIGNED_ASSIGNEE_KEY for the cards with no assignee (the same fold as
 * strayCardCountsByAssignee, via assigneeKeyOf).
 */
export function looseCardsForAssignee(
  cards: readonly InfoHubCard[],
  assignee: string,
): InfoHubCard[] {
  return cards.filter((card) => isStrayCard(card) && assigneeKeyOf(card.assignee) === assignee);
}

/**
 * The next card value with its map join rewritten. Blank/undefined ids
 * remove the field entirely — the M1 validators (viewer schema twin and the
 * ax board contract) reject empty strings, so "" is never written.
 */
export function withCardJoin(
  card: InfoHubCard,
  join: { contextId?: string; entityId?: string },
): InfoHubCard {
  const { contextId, entityId, ...rest } = card;
  void contextId;
  void entityId;
  return {
    ...rest,
    ...(join.contextId != null && join.contextId.length > 0 ? { contextId: join.contextId } : {}),
    ...(join.entityId != null && join.entityId.length > 0 ? { entityId: join.entityId } : {}),
  };
}

/**
 * "Promote card to project" (plan §1.1): the draft for a new project built
 * from a card's title. The caller creates the entity via `withEntityCreated`
 * (map save), then joins the card via `withCardJoin` (board save); the
 * entity starts unplaced and active. The card's detail stays on the card —
 * entities carry no prose.
 */
export function promotionDraftFromCard(card: InfoHubCard, contextId: string): MapEntityDraft {
  const title = card.title?.trim() ?? "";
  return {
    contextId,
    kind: "project",
    lifecycle: "active",
    name: title.length > 0 ? title : card.id,
  };
}
